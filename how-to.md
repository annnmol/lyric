Open http://localhost:5173 in your browser. You'll see the 5-step workflow on the left and an empty 9:16 preview on
  the right. Walk through it top to bottom:

  ---
  Step 1 — Import audio
  
  - Click browse under "Import audio", pick an MP3/WAV/M4A.
  - The browser reads the file's duration metadata, then POSTs the file to http://localhost:8765/upload.
  - Backend ([backend] logs) writes it to backend/uploads/<timestamp>-<name> and returns a URL like
  http://localhost:8765/uploads/....
  - The card flips to ready ✓ and you'll see the duration.

  Step 2 — Paste lyrics + Generate Alignment

  - Paste the lyrics in the textarea (one line per phrase works best).
  - Pick the language from the dropdown (Hindi, Punjabi, etc).
  - Click Generate Alignment. This is the slow step.

  What happens behind the scenes:
  - Browser POSTs audio + lyrics + language to /align (multipart).
  - Backend spawns python .venv/bin/python scripts/align.py <audio> <lang> and pipes lyrics in via stdin.
  - You'll see [align.py] loading wav2vec2 align model for 'hi' on cpu… in the [backend] terminal.
  - First run for a language: ~1–2 GB model download (5–10 min). Subsequent runs are instant.
  - Alignment itself takes ~real-time on CPU (a 30s clip ≈ 30s).
  - When done, card shows aligned <N> words · X.XXs · hi.

  If it fails, the error from Python shows up in the red text below the button — most common is wrong language for the
   audio, or the Python venv isn't built (you'll see failed to spawn).

  Step 3 — Background

  - Browse for an image (PNG/JPG/WEBP) or video (MP4/MOV).
  - Same /upload endpoint, same flow as audio. A thumbnail appears in the card.
  - Image → Ken Burns–style subtle zoom over full audio duration. Video → plays as-is, looped/trimmed to audio.

  Step 4 — Animation preset

  - Pick one of the four cards: Minimal White / Typewriter Cinema / Bollywood Neon / Karaoke Pop.
  - Selection updates the preview live — no backend call.

  At this point the right-hand preview should be playing. Press the play control on the Player. You'll see lyrics
  animating word-by-word over your background, in sync with the audio.

  If the preview is wrong (timing off, words missing): scrub it, then go back to step 2 and re-align — usually means
  the wrong language was picked, or the lyrics text doesn't quite match what's sung.

  Step 5 — Export

  - Choose resolution (start with 1080×1920 — much faster), fps (30 is fine), crf (18 = high quality, lower =
  bigger/better).
  - Click Export MP4. Browser POSTs the full reel state to /render.
  - Backend:
    a. First export only: bundles your Remotion compositions (~15s, you'll see [render] bundling Remotion 
  compositions…).
    b. Spins up headless Chromium, renders every frame ([render] 10%   20%   …).
    c. Pipes frames into ffmpeg → H.264 MP4.
  - Result: backend/out/reel-<timestamp>.mp4. The card shows render time and a clickable link that opens the file in a
   new tab.

  ---
  Where files end up

  backend/uploads/    your audio + background uploads
  backend/out/        rendered MP4s
  ~/.cache/torch/     wav2vec2 alignment models (downloaded once per language)

  If something goes wrong

  - [backend] not in the logs at all → the backend didn't start. Check the terminal for a port-in-use error.
  - alignment service offline in the UI → backend running but /languages failed. Hit http://localhost:8765/health
  directly to confirm.
  - failed to spawn .venv/bin/python → Python venv didn't get installed. Re-run the venv setup in backend/README.md.
  - align.py exited 1 → check the [align.py] lines in the backend terminal for the real Python error.
  - Preview blank → no audio/background uploaded yet, or the file URLs aren't reachable. Open one in a new tab to
  verify.

  Once you have a render you like, the file in backend/out/ is a normal MP4 — drag it straight into Instagram / TikTok
   / YouTube Shorts.