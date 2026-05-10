# Lyric Reel Automation Engine — PRD

## Overview

Build a local-first desktop/web application for generating cinematic lyric reels and carousel-style music edits automatically.

The tool should:

* accept an audio file
* accept manually pasted lyrics
* align lyrics word-by-word with timestamps
* generate animated typography synced with audio
* render/export high-quality vertical videos
* support multilingual Indian languages
* work completely locally without paid APIs

Primary use case:
Instagram Reels / TikTok / YouTube Shorts aesthetic lyric edits.

Audience:

* Gen Z creators
* Bollywood edit creators
* aesthetic music edit creators
* cinematic typography creators

---

# Problem Statement

Current workflow:

* Create visuals in Figma
* Export assets
* Import into Filmora
* Manually sync every lyric word
* Add typewriter animations manually
* Export reel

Current time required:
2–3 hours per 30–40 second reel.

Goal:
Reduce creation time to 10–20 minutes while preserving visual quality and creative control.

---

# Product Goals

## Primary Goals

1. Automate lyric timing alignment
2. Automate word-by-word typography rendering
3. Reuse animation templates
4. Export high-quality vertical videos
5. Support Indian regional languages
6. Run locally without cloud dependency

---

# Core Workflow

## Step 1 — Import Audio

User uploads:

* MP3
* WAV
* M4A

The system extracts:

* duration
* waveform metadata
* fps timing reference

---

## Step 2 — Paste Lyrics

User manually pastes full lyrics.

Example:

```txt
tere bina mera jee lagda nahi
```

Lyrics may be:

* Hindi
* Punjabi
* Marathi
* Tamil
* Kannada
* Haryanvi
* Bengali
* Urdu
* English
* mixed languages

---

## Step 3 — Generate Word-Level Timestamps

Use WhisperX forced alignment.

Input:

* audio
* pasted lyrics

Output:

```json
[
  {
    "word": "tere",
    "start": 0.52,
    "end": 0.91
  },
  {
    "word": "bina",
    "start": 0.92,
    "end": 1.28
  }
]
```

Requirements:

* multilingual support
* word-level timestamps
* local processing only
* no external API

---

# Step 4 — Upload Background

Allow:

* image upload
* video upload

Supported formats:

* PNG
* JPG
* WEBP
* MP4
* MOV

Behavior:

* if image → auto loop to full audio duration
* if video → preserve original timing

---

# Step 5 — Typography Engine

Render synced lyrics over media.

---

# Typography Features

## V1

* word-by-word reveal
* typewriter effect
* fade-in effect
* karaoke highlight
* custom fonts
* position controls
* size controls
* color controls

---

## V2

* glow effects
* blur effects
* cinematic motion
* beat scaling
* subtitle styles
* handwriting effect
* stagger animations

---

# Animation Logic

The system should:

* read current frame
* compare against timestamp config
* reveal words dynamically

Example logic:

```ts
if (currentTime >= word.start) {
  showWord();
}
```

---

# Rendering Engine

Use Remotion.

Requirements:

* 30fps and 60fps support
* vertical video rendering
* frame-perfect sync
* hardware acceleration if available
* ffmpeg export

Supported resolutions:

* 1080x1920
* 1440x2560
* 2160x3840 (4K vertical)

---

# Template System

Users should be able to:

* save templates
* duplicate templates
* switch themes
* reuse typography presets

Example templates:

* A24 cinematic
* Bollywood neon
* minimal white typography
* notebook handwriting
* grainy vintage

---

# Editing Features

## Timeline Editor

Allow manual correction:

* drag word timestamps
* shift timing
* nudge frames

---

# Export Features

Export:

* MP4
* H264

Settings:

* bitrate controls
* fps selection
* quality presets

---

# Technical Requirements

## Frontend

* React
* TypeScript
* TailwindCSS
* Remotion

---

## Local Processing

* WhisperX
* Python backend process
* ffmpeg

---

## Optional Desktop Packaging

* Electron

---

# Architecture

```txt
React UI
   ↓
Upload Audio + Lyrics + Media
   ↓
WhisperX Alignment Engine
   ↓
Generate Timestamp JSON
   ↓
Remotion Renderer
   ↓
Export MP4
```

---

# Important Constraints

## Must Be Free

Avoid:

* paid APIs
* cloud rendering
* subscription services

Everything should run locally.

---

# Performance Goals

Target:

* 30–40 second reel export under 3 minutes
* smooth UI on Apple Silicon Macs

---

# MVP Scope

The first version should ONLY include:

* audio upload
* lyrics paste
* WhisperX alignment
* image/video upload
* basic typewriter effect
* export MP4

No advanced editor required initially.

---

# Future Features

## AI Features

* automatic lyric extraction
* beat detection
* AI-generated typography styles
* AI motion suggestions
* automatic reel generation

---

# Success Metrics

* Reduce reel creation time from 3 hours to under 20 minutes
* Reusable template workflow
* Frame-perfect lyric sync
* High-quality export comparable to Filmora
