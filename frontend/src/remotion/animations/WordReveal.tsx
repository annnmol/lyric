import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { Preset } from "../../lib/types";
import type { Line } from "../lines";

interface Props {
  line: Line;
  preset: Preset;
}

export function WordReveal({ line, preset }: Props) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = frame / fps;

  return (
    <>
      {line.words.map((w, i) => {
        const wordFrame = (time - w.start) * fps;
        const visible = time >= w.start;
        const progress = visible
          ? spring({ frame: wordFrame, fps, config: { damping: 18, mass: 0.6 } })
          : 0;

        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              marginRight: "0.35em",
              opacity: progress,
              transform: `translateY(${(1 - progress) * 28}px) scale(${
                0.92 + progress * 0.08
              })`,
              color: preset.color,
              willChange: "transform,opacity",
            }}
          >
            {w.word}
          </span>
        );
      })}
    </>
  );
}
