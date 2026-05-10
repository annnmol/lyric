#!/usr/bin/env python3
"""WhisperX forced alignment — single-shot CLI invoked by the Node backend.

Usage:
    python align.py <audio_path> <language>
    # lyrics are read from stdin, JSON result written to stdout

WhisperX ships built-in alignment models for a fixed set of languages
(English, Hindi, Urdu, Telugu, Malayalam, etc.). For other Indian
languages we fall back to community wav2vec2 models on Hugging Face.
"""
from __future__ import annotations

import json
import sys

import torch
import whisperx

# Fallback wav2vec2 model names for languages WhisperX has no default for.
# All are public on Hugging Face — first use downloads ~1 GB and caches it
# in ~/.cache/huggingface/.
FALLBACK_ALIGN_MODELS = {
    "pa": "kingabzpro/wav2vec2-large-xls-r-300m-punjabi",
    "mr": "Harveenchadha/vakyansh-wav2vec2-marathi-mrm-100",
    "ta": "Harveenchadha/vakyansh-wav2vec2-tamil-tam-250",
    "kn": "Harveenchadha/vakyansh-wav2vec2-kannada-knm-560",
    "bn": "arijitx/wav2vec2-large-xlsr-bengali",
}


def pick_device() -> str:
    if torch.cuda.is_available():
        return "cuda"
    return "cpu"


def load_align(language: str, device: str):
    try:
        return whisperx.load_align_model(language_code=language, device=device)
    except ValueError:
        fallback = FALLBACK_ALIGN_MODELS.get(language)
        if not fallback:
            raise
        sys.stderr.write(
            f"no built-in align model for '{language}', "
            f"using community model {fallback}…\n"
        )
        return whisperx.load_align_model(
            language_code=language, device=device, model_name=fallback
        )


def main() -> None:
    if len(sys.argv) != 3:
        sys.stderr.write("usage: align.py <audio_path> <language>\n")
        sys.exit(2)

    audio_path, language = sys.argv[1], sys.argv[2]
    lyrics = sys.stdin.read().strip()
    if not lyrics:
        sys.stderr.write("error: empty lyrics on stdin\n")
        sys.exit(2)

    device = pick_device()
    sys.stderr.write(f"loading audio ({audio_path})…\n")
    audio = whisperx.load_audio(audio_path)
    duration = len(audio) / 16000.0

    sys.stderr.write(f"loading wav2vec2 align model for '{language}' on {device}…\n")
    model, metadata = load_align(language, device)

    sys.stderr.write("aligning…\n")
    result = whisperx.align(
        [{"text": lyrics, "start": 0.0, "end": duration}],
        model,
        metadata,
        audio,
        device,
        return_char_alignments=False,
    )

    words = []
    for w in result.get("word_segments", []):
        if "start" not in w or "end" not in w:
            continue
        words.append(
            {
                "word": w["word"],
                "start": float(w["start"]),
                "end": float(w["end"]),
                "score": float(w.get("score", 0.0)),
            }
        )

    if not words:
        sys.stderr.write("error: alignment produced no words\n")
        sys.exit(1)

    json.dump({"language": language, "duration": duration, "words": words}, sys.stdout)


if __name__ == "__main__":
    main()
