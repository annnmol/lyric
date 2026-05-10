# Lyric Reel Automation Engine

Local-first desktop app for generating cinematic lyric reels with synced word-by-word typography.

Stack:
- **Frontend** — React + TypeScript + Vite + TailwindCSS + Remotion Player
- **Backend** — Node + TypeScript + Express (`@remotion/bundler` + `@remotion/renderer` for MP4 export)
- **Alignment** — one Python script (`backend/scripts/align.py`) wrapping WhisperX, spawned by the backend on demand

You only ever read/edit TypeScript. The Python script is a black-box subprocess — set up once, then forget.

Everything runs locally. No paid APIs.

---

## Project layout

```
lyric/
├── backend/
│   ├── src/                  TS server (server.ts, align.ts, render.ts, languages.ts)
│   ├── scripts/align.py      WhisperX wrapper — only Python file
│   ├── package.json
│   └── requirements.txt      deps for align.py only
├── frontend/
│   ├── src/
│   │   ├── components/       Workflow panels
│   │   ├── remotion/         Compositions (used by Player AND backend renderer)
│   │   ├── lib/              types, api client, presets
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
├── samples/                  Example alignment JSON + animation presets
└── prd.md
```

---

## Requirements

- macOS (Apple Silicon recommended)
- Node 20+
- Python **3.10 or 3.11** (not 3.12+) — install with `brew install python@3.11`
- ffmpeg **≤ 7** — install with `brew install ffmpeg@7` (PyAV's wheel doesn't build against ffmpeg 8 yet)

---

## Setup

### 1. Backend (Node + Python script)

```bash
cd backend
npm install

# one-time Python virtualenv for align.py
brew install ffmpeg@7
brew unlink ffmpeg && brew link --force --overwrite ffmpeg@7
/opt/homebrew/bin/python3.11 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
deactivate

# (optional) put ffmpeg 8 back as default — align.py will keep using ffmpeg@7
brew unlink ffmpeg@7 && brew link ffmpeg
```

### 2. Frontend

```bash
cd frontend
npm install
```

### 3. Environment variables

Both packages ship a `.env` (with sane defaults) and a `.env.example` (documented). Edit them only if you need to change ports / hosts:

```
backend/.env       PORT, FRONTEND_ORIGIN, LYRIC_PYTHON, UPLOADS_DIR, OUT_DIR, MAX_UPLOAD_MB
frontend/.env      VITE_API_URL
```

There are **no API keys** — every dependency runs locally (WhisperX, ffmpeg, Remotion).

### 4. (Optional) Root deps for the `dev` runner

From the project root:

```bash
npm install              # installs `concurrently` only
# or, install everything in one shot:
npm run install:all      # root + backend + frontend
```

---

## Run

From the project root, one command starts both services with color-coded logs:

```bash
npm run dev
```

You'll see:
- `[backend]` (cyan) → http://localhost:8765
- `[frontend]` (magenta) → http://localhost:5173

`Ctrl+C` stops both. If either crashes, the other is killed too (`--kill-others-on-fail`).

If you'd rather run them separately:

```bash
cd backend && npm run dev    # http://localhost:8765
cd frontend && npm run dev   # http://localhost:5173
```

---

## Workflow

1. Upload audio (MP3 / WAV / M4A)
2. Paste lyrics + pick language
3. **Generate Alignment** → backend spawns `align.py`, returns word timestamps
4. Upload background image or video
5. Pick an animation preset (typewriter / word-reveal / fade-in / karaoke)
6. Preview in Remotion Player
7. **Export MP4** → backend renders with Remotion → `backend/out/reel-<timestamp>.mp4`

---

## Languages

Hindi, Punjabi, Marathi, Tamil, Kannada, Urdu, Bengali, English — pick the dominant language for mixed-language lyrics.

---

## Notes

- First `/align` for a given language downloads the wav2vec2 model (~1–2 GB), cached at `~/.cache/torch/hub/`.
- First `/render` bundles the Remotion compositions (~10–20 s); subsequent renders reuse the bundle.
- 4K vertical exports are slow — iterate at 1080p, export 4K once.
- All generated artifacts live under `backend/uploads/` and `backend/out/` and are gitignored.
