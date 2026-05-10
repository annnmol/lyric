export interface AlignedWord {
  word: string;
  start: number;
  end: number;
  score: number;
}

export interface AlignmentResult {
  language: string;
  duration: number;
  words: AlignedWord[];
}

export type AnimationKind = "typewriter" | "word-reveal" | "fade-in" | "karaoke";

export interface BackgroundAsset {
  url: string;
  kind: "image" | "video";
  filename: string;
}

export interface Preset {
  id: string;
  name: string;
  animation: AnimationKind;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  color: string;
  highlightColor: string;
  shadow: string;
  textTransform: "none" | "uppercase" | "lowercase";
  letterSpacing: number;
  lineHeight: number;
  backgroundDim: number;
  position: "top" | "center" | "bottom";
}

export interface ReelProps {
  words: AlignedWord[];
  background: BackgroundAsset | null;
  audioUrl: string | null;
  preset: Preset;
  durationInSeconds: number;
}

export type Resolution = "1080x1920" | "1440x2560" | "2160x3840";

export interface RenderRequest {
  reel: ReelProps;
  fps: 30 | 60;
  resolution: Resolution;
  crf: number;
}

export interface RenderResponse {
  outputUrl: string;
  outputPath: string;
  durationMs: number;
}
