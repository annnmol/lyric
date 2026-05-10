# Backend

Node + TypeScript API. Handles uploads, alignment (via a tiny Python script), and MP4 rendering.

## Layout

```
backend/
├── src/
│   ├── server.ts       Express on :8765
│   ├── align.ts        spawns scripts/align.py
│   ├── render.ts       @remotion/bundler + renderer
│   └── languages.ts
├── scripts/
│   └── align.py        ← only Python file in the project
├── package.json
└── requirements.txt    deps for align.py only
```

## Endpoints

```
GET  /health                    → { status }
GET  /languages                 → { hi: "Hindi", ... }
POST /upload    multipart       → { url, path, filename }
POST /align     multipart       → { language, duration, words[] }
POST /render    json            → { outputUrl, outputPath, durationMs }
GET  /uploads/<file>            static
GET  /out/<file>                static
```

## Setup

You need both Node deps (the server) and the Python script's deps (WhisperX).

### 1. Node

```bash
cd backend
npm install
```

### 2. Python virtualenv (one-time, only for the alignment script)

Requires Python 3.10/3.11 and ffmpeg ≤ 7 (PyAV doesn't compile against ffmpeg 8 yet).

```bash
# install ffmpeg 7 alongside ffmpeg 8 if needed
brew install ffmpeg@7
brew unlink ffmpeg && brew link --force --overwrite ffmpeg@7

# create venv with python 3.11 and install whisperx
/opt/homebrew/bin/python3.11 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
deactivate

# (optional) restore ffmpeg 8 — PyAV is already compiled
brew unlink ffmpeg@7 && brew link ffmpeg
```

The Node server invokes `.venv/bin/python` directly — no need to keep the venv activated. Set `LYRIC_PYTHON=/path/to/python` to override.

## Run

```bash
npm run dev   # tsx watch — restarts on .ts changes
```

First `/render` triggers a one-time Remotion bundle (~10–20 s); subsequent renders reuse it.
First `/align` for a given language downloads the wav2vec2 model (~1–2 GB), cached after that.
