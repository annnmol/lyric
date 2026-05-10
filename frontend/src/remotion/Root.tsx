import { Composition } from "remotion";
import { PRESETS } from "../lib/presets";
import type { ReelProps } from "../lib/types";
import { LyricReel } from "./LyricReel";

export const COMPOSITION_ID = "LyricReel";
export const DEFAULT_FPS = 30;

const DEFAULT_PROPS: ReelProps = {
  words: [],
  background: null,
  audioUrl: null,
  preset: PRESETS[0],
  durationInSeconds: 30,
};

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id={COMPOSITION_ID}
        component={LyricReel}
        defaultProps={DEFAULT_PROPS}
        durationInFrames={DEFAULT_FPS * 30}
        fps={DEFAULT_FPS}
        width={1080}
        height={1920}
        calculateMetadata={({ props }) => {
          const fps = DEFAULT_FPS;
          const seconds = Math.max(1, Math.ceil(props.durationInSeconds));
          return {
            durationInFrames: seconds * fps,
            fps,
            width: 1080,
            height: 1920,
          };
        }}
      />
    </>
  );
};
