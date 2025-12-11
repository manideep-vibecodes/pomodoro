# pomodoro

FlowPomodoro is a minimalist Pomodoro timer web app designed for focused work sessions with smooth automatic phase transitions, custom durations, and phase‑specific notification sounds. It runs entirely in the browser using HTML, CSS, and vanilla JavaScript.​

Features
Standard Pomodoro cycle with configurable Focus, Short Break, and Long Break durations.

Automatic transition between phases, including long break after a configurable number of pomodoros.

Start, Pause, and Reset controls plus a keyboard shortcut (Space) to toggle start/pause.

Live display of the current phase and remaining time.

Session stats showing completed pomodoros.

Per‑phase audio notifications (different sound for focus vs. breaks).

Optional confirmation dialog before saving settings.

Optional “Pop‑out window” (Document Picture‑in‑Picture) to keep the timer in a tiny floating window on supported browsers.

Settings and session counts persisted via localStorage so they survive refreshes.​

Tech stack
Layer	Details
Frontend	HTML5, CSS3, Vanilla JavaScript
Timing	setInterval + performance.now()
State	In‑memory JS object (simple state machine)
Storage	Browser localStorage for settings
Audio	HTML <audio> elements per phase
Getting started
1. Clone and install
bash
git clone https://github.com/<your-username>/flow-pomodoro.git
cd flow-pomodoro
There are no runtime dependencies; any static HTTP server will work.

2. Run locally
Option A – Open directly:

Open index.html in your browser (double‑click or “Open with”).

The app should load and work immediately.​

Option B – Serve via a simple HTTP server (recommended):

bash
# Python 3
python -m http.server 8000
# then visit:
# http://localhost:8000/index.html
Or use any static server / VS Code Live Server extension.​

Usage
Adjust Session settings (Focus, Short Break, Long Break, “Pomodoros before long break”).

Click Save settings → confirm the prompt.

Click Start to begin a focus session.

The timer automatically switches to Short Break / Focus / Long Break according to your configuration.

Use Spacebar (when the page has focus) to quickly start/pause.

Use Pop‑out window to open a compact floating timer window on supported Chromium browsers (Document Picture‑in‑Picture).​​

Project structure
text
.
├─ index.html      # Markup, layout, and audio elements
├─ styles.css      # Visual design, responsive layout, hero illustration
├─ app.js          # Timer state machine, UI updates, persistence, PiP logic
├─ focus.mp3       # (example) sound to play when entering Focus
├─ short-break.mp3 # (example) sound to play when entering Short Break
└─ long-break.mp3  # (example) sound to play when entering Long Break
app.js maintains current phase, remaining time, and pomodoro counts.

phaseEnded() controls phase transitions and chooses which audio to play for each phase.​

Configuration
You can adjust defaults in app.js:

js
settings: {
  focusMin: 25,
  shortMin: 5,
  longMin: 15,
  pomosBeforeLong: 4,
}
You can also change the audio files by updating the <audio> tags in index.html:

xml
<audio id="focusSound" src="focus.mp3" preload="auto"></audio>
<audio id="shortBreakSound" src="short-break.mp3" preload="auto"></audio>
<audio id="longBreakSound" src="long-break.mp3" preload="auto"></audio>
Make sure the files exist and are in a supported format (e.g., MP3).​​

If you want, the next step can be adding a short “Roadmap” section (e.g., stats history, themes, export/import settings) to the README.
