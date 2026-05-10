import { useState } from "react";
import { uploadAsset } from "../lib/api";

interface Props {
  onAudio: (file: File, url: string, durationSeconds: number) => void;
  fileName: string | null;
  durationSeconds: number | null;
}

export function AudioPanel({ onAudio, fileName, durationSeconds }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handle(file: File) {
    setError(null);
    setBusy(true);
    try {
      const dur = await readDuration(file);
      const { url } = await uploadAsset(file, "audio");
      onAudio(file, url, dur);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <label className="flex cursor-pointer items-center justify-between rounded-xl border border-dashed border-ink-600 bg-ink-800/40 px-4 py-3 hover:border-accent">
        <span className="text-sm text-ink-200">
          {fileName ?? "Choose MP3 / WAV / M4A"}
        </span>
        <input
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handle(f);
          }}
        />
        <span className="rounded-md bg-ink-700 px-3 py-1 text-xs text-ink-100">
          {busy ? "uploading…" : "browse"}
        </span>
      </label>

      {durationSeconds != null ? (
        <div className="flex items-center justify-between text-xs text-ink-300">
          <span>duration</span>
          <span className="font-mono text-ink-100">
            {formatTime(durationSeconds)}
          </span>
        </div>
      ) : null}

      {error ? <p className="text-xs text-accent">{error}</p> : null}
    </div>
  );
}

function readDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio();
    audio.preload = "metadata";
    audio.src = url;
    audio.onloadedmetadata = () => {
      resolve(audio.duration);
      URL.revokeObjectURL(url);
    };
    audio.onerror = () => reject(new Error("could not read audio metadata"));
  });
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}
