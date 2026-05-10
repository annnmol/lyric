You are a senior full-stack engineer and creative tooling engineer.

Build a local-first lyric reel generation application for macOS.

The application should automate cinematic Instagram reel creation with synced word-by-word typography.

# Tech Stack

Frontend:

* React
* TypeScript
* TailwindCSS
* Remotion

Local processing:

* Python
* WhisperX
* ffmpeg

Optional:

* Electron for desktop packaging

# Core Features

1. Upload audio file
2. Paste lyrics manually
3. Use WhisperX forced alignment to generate word-level timestamps
4. Upload image or video background
5. Render animated synced lyrics over media
6. Export vertical MP4 videos

# Requirements

* fully local
* no paid APIs
* multilingual support
* supports Hindi, Punjabi, Marathi, Tamil, Kannada, Urdu, Bengali, English
* Apple Silicon compatible
* export 1080p and 4K vertical videos

# Important UX

The app should feel minimal and creator-focused.

Workflow:

1. Upload audio
2. Paste lyrics
3. Click “Generate Alignment”
4. Upload background image/video
5. Select animation preset
6. Preview reel
7. Export MP4

# Alignment Output Format

Generate JSON like:

```json
[
  {
    "word": "tere",
    "start": 0.52,
    "end": 0.91
  }
]
```

# Animation Requirements

Implement:

* typewriter effect
* word reveal effect
* fade-in effect
* karaoke highlight

Use Remotion frame calculations.

# Rendering Requirements

* vertical 1080x1920 output
* optional 4K output
* ffmpeg rendering
* high bitrate export

# Architecture

Frontend:

* React app
* timeline preview
* upload panels
* export controls

Processing:

* Python service for WhisperX alignment
* local JSON generation

Rendering:

* Remotion compositions
* dynamic typography rendering

# MVP First

Focus ONLY on:

* alignment
* basic typography
* export pipeline

Do NOT overengineer initially.

# Deliverables

1. folder structure
2. setup instructions
3. package installation commands
4. React frontend
5. Python alignment service
6. sample Remotion composition
7. export pipeline
8. local run instructions
9. example JSON outputs
10. sample typography presets

Build production-quality code with clean architecture.