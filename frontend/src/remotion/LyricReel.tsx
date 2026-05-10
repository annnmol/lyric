import {
  AbsoluteFill,
  Audio,
  Img,
  OffthreadVideo,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { Preset, ReelProps } from "../lib/types";
import { FadeIn } from "./animations/FadeIn";
import { Karaoke } from "./animations/Karaoke";
import { Typewriter } from "./animations/Typewriter";
import { WordReveal } from "./animations/WordReveal";
import { chunkIntoLines, findActiveLine, type Line } from "./lines";

export function LyricReel({
  words,
  background,
  audioUrl,
  preset,
  durationInSeconds,
}: ReelProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = frame / fps;

  const lines = chunkIntoLines(words);
  const activeLine = findActiveLine(lines, time);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {background ? (
        <Background background={background} durationInSeconds={durationInSeconds} />
      ) : null}

      <AbsoluteFill
        style={{
          background: `rgba(0,0,0,${preset.backgroundDim})`,
        }}
      />

      <LyricsLayer line={activeLine} preset={preset} />

      {audioUrl ? <Audio src={audioUrl} /> : null}
    </AbsoluteFill>
  );
}

function Background({
  background,
  durationInSeconds,
}: {
  background: NonNullable<ReelProps["background"]>;
  durationInSeconds: number;
}) {
  if (background.kind === "video") {
    return (
      <OffthreadVideo
        src={background.url}
        muted
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    );
  }
  return (
    <Img
      src={background.url}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        // Subtle Ken Burns over the full reel duration to keep static images alive.
        transform: `scale(${1 + 0.04 * Math.min(1, durationInSeconds / 30)})`,
      }}
    />
  );
}

function LyricsLayer({ line, preset }: { line: Line | null; preset: Preset }) {
  const align = positionToAlignment(preset.position);
  const padding = preset.position === "center" ? "0 8%" : "12% 8%";

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: align.justify,
        alignItems: "center",
        padding,
        textAlign: "center",
        fontFamily: preset.fontFamily,
        fontSize: preset.fontSize,
        fontWeight: preset.fontWeight,
        letterSpacing: preset.letterSpacing,
        lineHeight: preset.lineHeight,
        textTransform: preset.textTransform,
        textShadow: preset.shadow,
      }}
    >
      {line ? <AnimationFor line={line} preset={preset} /> : null}
    </AbsoluteFill>
  );
}

function AnimationFor({ line, preset }: { line: Line; preset: Preset }) {
  switch (preset.animation) {
    case "typewriter":
      return <Typewriter line={line} preset={preset} />;
    case "fade-in":
      return <FadeIn line={line} preset={preset} />;
    case "karaoke":
      return <Karaoke line={line} preset={preset} />;
    case "word-reveal":
    default:
      return <WordReveal line={line} preset={preset} />;
  }
}

function positionToAlignment(p: Preset["position"]): { justify: "flex-start" | "center" | "flex-end" } {
  if (p === "top") return { justify: "flex-start" };
  if (p === "bottom") return { justify: "flex-end" };
  return { justify: "center" };
}
