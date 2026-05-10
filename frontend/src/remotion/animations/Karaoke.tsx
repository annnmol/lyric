import { useCurrentFrame, useVideoConfig } from "remotion";
import type { Preset } from "../../lib/types";
import type { Line } from "../lines";

interface Props {
  line: Line;
  preset: Preset;
}

export function Karaoke({ line, preset }: Props) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = frame / fps;

  return (
    <>
      {line.words.map((w, i) => {
        const passed = time > w.end;
        const isCurrent = time >= w.start && time <= w.end;
        const color = passed || isCurrent ? preset.highlightColor : preset.color;
        const scale = isCurrent ? 1.06 : 1;
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              marginRight: "0.35em",
              color,
              transform: `scale(${scale})`,
              transition: "color 80ms linear, transform 100ms ease-out",
              transformOrigin: "50% 80%",
            }}
          >
            {w.word}
          </span>
        );
      })}
    </>
  );
}
