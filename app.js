// app.js

const PHASES = {
  FOCUS: 'focus',
  SHORT_BREAK: 'short',
  LONG_BREAK: 'long',
};

let state = {
  phase: PHASES.FOCUS,
  isRunning: false,
  remainingMs: 25 * 60 * 1000,
  completedPomodoros: 0,
  pomosSinceLong: 0,
  settings: {
    focusMin: 25,
    shortMin: 5,
    longMin: 15,
    pomosBeforeLong: 4,
  },
};

let intervalId = null;
let lastTick = null;

const endSound = document.getElementById('endSound');
const focusSound = document.getElementById("focusSound");
const shortBreakSound = document.getElementById("shortBreakSound");
const longBreakSound = document.getElementById("longBreakSound");

const phaseLabelEl = document.getElementById('phaseLabel');
const timeDisplayEl = document.getElementById('timeDisplay');
const pomoCountEl = document.getElementById('pomoCount');

const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');

const focusInput = document.getElementById('focusInput');
const shortInput = document.getElementById('shortInput');
const longInput = document.getElementById('longInput');
const pomosBeforeLongInput = document.getElementById('pomosBeforeLong');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');


// --- Persistence (optional T-4) ---

function loadFromStorage() {
  const raw = localStorage.getItem('pomoSettings');
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    state.settings = { ...state.settings, ...data.settings };
    state.completedPomodoros = data.completedPomodoros ?? 0;
    state.pomosSinceLong = data.pomosSinceLong ?? 0;
  } catch {}
}

function saveToStorage() {
  const data = {
    settings: state.settings,
    completedPomodoros: state.completedPomodoros,
    pomosSinceLong: state.pomosSinceLong,
  };
  localStorage.setItem('pomoSettings', JSON.stringify(data));
}

// --- Helpers ---

function msForPhase(phase) {
  const s = state.settings;
  if (phase === PHASES.FOCUS) return s.focusMin * 60 * 1000;
  if (phase === PHASES.SHORT_BREAK) return s.shortMin * 60 * 1000;
  return s.longMin * 60 * 1000;
}

function formatTime(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function updateUI() {
  const phaseText =
    state.phase === PHASES.FOCUS
      ? "Focus"
      : state.phase === PHASES.SHORT_BREAK
      ? "Short Break"
      : "Long Break";

  phaseLabelEl.textContent = phaseText;
  timeDisplayEl.textContent = formatTime(state.remainingMs);
  pomoCountEl.textContent = state.completedPomodoros;

  const pill = document.getElementById("phasePill");
  if (pill) {
    if (state.phase === PHASES.FOCUS) {
      pill.style.borderColor = "rgba(74, 222, 128, 0.8)";
      pill.style.boxShadow = "0 0 16px rgba(34, 197, 94, 0.35)";
      pill.style.setProperty("--phase-color", "#22c55e");
    } else if (state.phase === PHASES.SHORT_BREAK) {
      pill.style.borderColor = "rgba(56, 189, 248, 0.8)";
      pill.style.boxShadow = "0 0 16px rgba(56, 189, 248, 0.35)";
      pill.style.setProperty("--phase-color", "#0ea5e9");
    } else {
      pill.style.borderColor = "rgba(192, 132, 252, 0.8)";
      pill.style.boxShadow = "0 0 16px rgba(192, 132, 252, 0.35)";
      pill.style.setProperty("--phase-color", "#a855f7");
    }
  }
}

function setPhase(phase) {
  state.phase = phase;
  state.remainingMs = msForPhase(phase);
  updateUI();
}

// --- Timer control ---

function startTimer() {
  if (state.isRunning) return;
  state.isRunning = true;
  lastTick = performance.now();
  intervalId = setInterval(tick, 1000);
}

function pauseTimer() {
  if (!state.isRunning) return;
  state.isRunning = false;
  clearInterval(intervalId);
  intervalId = null;
}

function resetTimer() {
  pauseTimer();
  state.remainingMs = msForPhase(state.phase);
  updateUI();
}

function tick() {
  const now = performance.now();
  const delta = now - lastTick;
  lastTick = now;
  state.remainingMs -= delta;

  if (state.remainingMs <= 0) {
    state.remainingMs = 0;
    updateUI();
    phaseEnded();
  } else {
    updateUI();
  }
}

function phaseEnded() {
  pauseTimer();

  // Decide which sound to play
  let soundToPlay = null;

  if (state.phase === PHASES.FOCUS) {
    // Focus just finished → going into short or long break
    const willBeLong =
      state.pomosSinceLong + 1 >= state.settings.pomosBeforeLong;
    soundToPlay = willBeLong ? longBreakSound : shortBreakSound;
  } else {
    // Any break finished → going back to focus
    soundToPlay = focusSound;
  }

  if (soundToPlay) {
    soundToPlay.currentTime = 0;
    soundToPlay.play().catch(() => {});
  }

  if (state.phase === PHASES.FOCUS) {
    state.completedPomodoros += 1;
    state.pomosSinceLong += 1;

    const needLong =
      state.pomosSinceLong >= state.settings.pomosBeforeLong;

    if (needLong) {
      state.pomosSinceLong = 0;
      setPhase(PHASES.LONG_BREAK);
    } else {
      setPhase(PHASES.SHORT_BREAK);
    }
  } else {
    setPhase(PHASES.FOCUS);
  }

  saveToStorage();
  startTimer(); // automatic transition
}
// --- Settings ---

function applySettingsFromInputs() {
  state.settings.focusMin = Number(focusInput.value) || 25;
  state.settings.shortMin = Number(shortInput.value) || 5;
  state.settings.longMin = Number(longInput.value) || 15;
  state.settings.pomosBeforeLong =
    Number(pomosBeforeLongInput.value) || 4;
  saveToStorage();
  // Reset current phase duration but keep phase
  state.remainingMs = msForPhase(state.phase);
  updateUI();
}

// --- Event wiring ---

startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);

saveSettingsBtn.addEventListener('click', applySettingsFromInputs);

// Keyboard accessibility: Space toggles start/pause when focus is on body
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && document.activeElement === document.body) {
    e.preventDefault();
    if (state.isRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  }
});
saveSettingsBtn.addEventListener('click', applySettingsFromInputs);
saveSettingsBtn.addEventListener('click', () => {
  const ok = confirm(
    "Are you sure you want to update your Pomodoro settings?"
  );
  if (!ok) {
    return; // user cancelled
  }
  applySettingsFromInputs();
});
const pipBtn = document.getElementById("pipBtn");
let pipWindow = null;
async function openPipWindow() {
  if (!("documentPictureInPicture" in window)) {
    alert("Your browser does not support floating PiP windows yet.");
    return;
  }

  // If already open, focus it
  if (pipWindow && !pipWindow.closed) {
    pipWindow.focus();
    return;
  }

  pipWindow = await documentPictureInPicture.requestWindow({
    width: 320,
    height: 260,
  });

  // Clone the timer UI into the PiP window
  pipWindow.document.title = "Pomodoro";

  // Simple approach: show only the timer + controls
  const container = pipWindow.document.createElement("div");
  container.style.cssText =
    "font-family: system-ui, sans-serif; background:#020617; color:#e5e7eb; " +
    "height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center;";

  const phaseLabelClone = phaseLabelEl.cloneNode(true);
  const timeDisplayClone = timeDisplayEl.cloneNode(true);
  const controlsClone = document.querySelector(".controls").cloneNode(true);

  container.appendChild(phaseLabelClone);
  container.appendChild(timeDisplayClone);
  container.appendChild(controlsClone);

  pipWindow.document.body.style.margin = "0";
  pipWindow.document.body.appendChild(container);

  // Wire the buttons in the PiP window to your existing logic
  const [startClone, pauseClone, resetClone] =
    controlsClone.querySelectorAll("button");

  startClone.addEventListener("click", startTimer);
  pauseClone.addEventListener("click", pauseTimer);
  resetClone.addEventListener("click", resetTimer);

  // Keep PiP display in sync with main state
  const sync = () => {
    phaseLabelClone.textContent = phaseLabelEl.textContent;
    timeDisplayClone.textContent = timeDisplayEl.textContent;
  };

  const syncInterval = setInterval(sync, 500);

  pipWindow.addEventListener("pagehide", () => {
    clearInterval(syncInterval);
    pipWindow = null;
  });
}

if (pipBtn) {
  pipBtn.addEventListener("click", () => {
    openPipWindow().catch(console.error);
  });
}
// --- Init ---

loadFromStorage();
focusInput.value = state.settings.focusMin;
shortInput.value = state.settings.shortMin;
longInput.value = state.settings.longMin;
pomosBeforeLongInput.value = state.settings.pomosBeforeLong;
setPhase(PHASES.FOCUS);