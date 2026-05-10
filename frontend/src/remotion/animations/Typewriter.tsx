import { useCurrentFrame, useVideoConfig } from "remotion";
import type { Preset } from "../../lib/types";
import type { Line } from "../lines";

interface Props {
  line: Line;
  preset: Preset;
}

export function Typewriter({ line, preset }: Props) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = frame / fps;

  return (
    <>
      {line.words.map((w, i) => {
        if (time < w.start) return null;
        const dur = Math.max(w.end - w.start, 0.08);
        const t = Math.min(1, (time - w.start) / dur);
        const chars = Math.max(1, Math.ceil(w.word.length * t));
        const visibleText = w.word.slice(0, chars);
        const isCurrent = time <= w.end + 0.05;

        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              marginRight: "0.35em",
              color: preset.color,
            }}
          >
            {visibleText}
            {isCurrent && (
              <span
                style={{
                  display: "inline-block",
                  width: "0.06em",
                  height: "0.9em",
                  marginLeft: "0.04em",
                  background: preset.highlightColor,
                  verticalAlign: "middle",
                  opacity: Math.floor(frame / 8) % 2 === 0 ? 1 : 0,
                }}
              />
            )}
          </span>
        );
      })}
    </>
  );
}
