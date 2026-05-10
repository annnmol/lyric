/**
 * Bundle the frontend's Remotion compositions and render an MP4.
 *
 * The bundle is built once on first /render and reused. Render parameters
 * (resolution, fps, crf) override the composition's defaults so a single
 * composition serves all output sizes.
 */

import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REMOTION_ENTRY = path.resolve(
  __dirname,
  "../../frontend/src/remotion/index.ts",
);
const COMPOSITION_ID = "LyricReel";

const RESOLUTIONS = {
  "1080x1920": { w: 1080, h: 1920 },
  "1440x2560": { w: 1440, h: 2560 },
  "2160x3840": { w: 2160, h: 3840 },
} as const;

export type Resolution = keyof typeof RESOLUTIONS;

export interface RenderRequest {
  reel: { durationInSeconds: number; [k: string]: unknown };
  fps: 30 | 60;
  resolution: Resolution;
  crf: number;
}

export interface RenderResponse {
  outputUrl: string;
  outputPath: string;
  durationMs: number;
}

let bundlePromise: Promise<string> | null = null;

function getBundle(): Promise<string> {
  if (!bundlePromise) {
    console.log("[render] bundling Remotion compositions…");
    bundlePromise = bundle({
      entryPoint: REMOTION_ENTRY,
      onProgress: (p) => {
        if (p % 25 === 0) console.log(`[render] bundle ${p}%`);
      },
    }).then((url) => {
      console.log("[render] bundle ready");
      return url;
    });
  }
  return bundlePromise;
}

export async function renderReel(
  req: RenderRequest,
  outDir: string,
  origin: string,
): Promise<RenderResponse> {
  const started = Date.now();
  const r = RESOLUTIONS[req.resolution];
  if (!r) throw new Error(`unknown resolution ${req.resolution}`);

  const serveUrl = await getBundle();

  const composition = await selectComposition({
    serveUrl,
    id: COMPOSITION_ID,
    inputProps: req.reel,
  });

  composition.fps = req.fps;
  composition.width = r.w;
  composition.height = r.h;
  composition.durationInFrames = Math.max(
    req.fps,
    Math.ceil(req.reel.durationInSeconds * req.fps),
  );

  const outName = `reel-${Date.now()}.mp4`;
  const outPath = path.join(outDir, outName);

  await renderMedia({
    composition,
    serveUrl,
    codec: "h264",
    outputLocation: outPath,
    inputProps: req.reel,
    crf: req.crf,
    imageFormat: "jpeg",
    onProgress: ({ progress }) => {
      const pct = Math.round(progress * 100);
      if (pct % 10 === 0) {
        process.stdout.write(`\r[render] ${pct}%   `);
      }
    },
  });
  process.stdout.write("\n");

  return {
    outputUrl: `${origin}/out/${outName}`,
    outputPath: outPath,
    durationMs: Date.now() - started,
  };
}
