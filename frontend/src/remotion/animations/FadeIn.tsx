import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { Preset } from "../../lib/types";
import type { Line } from "../lines";

interface Props {
  line: Line;
  preset: Preset;
}

export function FadeIn({ line, preset }: Props) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = frame / fps;

  return (
    <>
      {line.words.map((w, i) => {
        const t = (time - w.start) * fps;
        const opacity = interpolate(t, [0, fps * 0.35], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const blur = interpolate(t, [0, fps * 0.35], [12, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              marginRight: "0.35em",
              color: preset.color,
              opacity,
              filter: `blur(${blur}px)`,
            }}
          >
            {w.word}
          </span>
        );
      })}
    </>
  );
}
