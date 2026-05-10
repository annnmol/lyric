import { Player } from "@remotion/player";
import { useMemo } from "react";
import { LyricReel } from "../remotion/LyricReel";
import { COMPOSITION_ID, DEFAULT_FPS } from "../remotion/Root";
import type { ReelProps } from "../lib/types";

interface Props {
  reel: ReelProps;
}

export function ReelPreview({ reel }: Props) {
  const durationInFrames = useMemo(
    () => Math.max(DEFAULT_FPS, Math.ceil(reel.durationInSeconds * DEFAULT_FPS)),
    [reel.durationInSeconds],
  );

  const ready = reel.words.length > 0 || reel.background != null;

  return (
    <div className="flex flex-col gap-3">
      <div className="aspect-[9/16] w-full overflow-hidden rounded-2xl border border-ink-700 bg-ink-950 shadow-2xl">
        {ready ? (
          <Player
            key={COMPOSITION_ID}
            component={LyricReel}
            inputProps={reel}
            durationInFrames={durationInFrames}
            fps={DEFAULT_FPS}
            compositionWidth={1080}
            compositionHeight={1920}
            controls
            loop
            style={{ width: "100%", height: "100%" }}
          />
        ) : (
          <EmptyState />
        )}
      </div>
      <p className="text-center text-[11px] text-ink-400">
        Preview is rendered at 1080×1920 · 30 fps · the export will match unless overridden.
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
      <div className="h-10 w-10 rounded-full border border-ink-600" />
      <p className="text-sm text-ink-300">
        Drop in audio + lyrics + a background to see your reel.
      </p>
    </div>
  );
}
