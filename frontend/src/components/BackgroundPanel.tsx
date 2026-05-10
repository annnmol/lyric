import { useState } from "react";
import { uploadBackground } from "../lib/api";
import type { BackgroundAsset } from "../lib/types";

interface Props {
  background: BackgroundAsset | null;
  onBackground: (b: BackgroundAsset) => void;
}

export function BackgroundPanel({ background, onBackground }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handle(file: File) {
    setError(null);
    setBusy(true);
    try {
      const bg = await uploadBackground(file);
      onBackground(bg);
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
          {background?.filename ?? "Choose image or video"}
        </span>
        <input
          type="file"
          accept="image/*,video/*"
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

      {background ? (
        <div className="overflow-hidden rounded-xl border border-ink-700 bg-ink-800">
          {background.kind === "video" ? (
            <video
              src={background.url}
              className="h-40 w-full object-cover"
              muted
              loop
              autoPlay
            />
          ) : (
            <img
              src={background.url}
              alt=""
              className="h-40 w-full object-cover"
            />
          )}
        </div>
      ) : null}

      {error ? <p className="text-xs text-accent">{error}</p> : null}
    </div>
  );
}
