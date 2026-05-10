/**
 * Lyric Reel backend.
 *
 *   GET  /health      → liveness
 *   GET  /languages   → supported alignment languages
 *   POST /upload      → multipart "file" + "kind" → { url, path, filename }
 *   POST /align       → multipart "audio" + "lyrics" + "language" → { language, duration, words[] }
 *   POST /render      → JSON RenderRequest                      → { outputUrl, outputPath, durationMs }
 *   POST /clear       → empty uploads/ + out/                   → { uploadsDeleted, outDeleted }
 *   GET  /uploads/*   → static-serves uploaded media
 *   GET  /out/*       → static-serves rendered MP4s
 */

import cors from "cors";
import express, { type Request, type Response } from "express";
import multer from "multer";
import fs from "node:fs";
import path from "node:path";
import { alignAudio } from "./align.js";
import { env, ORIGIN } from "./env.js";
import { SUPPORTED_LANGUAGES } from "./languages.js";
import { renderReel, type RenderRequest } from "./render.js";

fs.mkdirSync(env.uploadsDir, { recursive: true });
fs.mkdirSync(env.outDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: env.uploadsDir,
    filename: (_req, file, cb) => {
      const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
      cb(null, `${Date.now()}-${safe}`);
    },
  }),
  limits: { fileSize: env.maxUploadMB * 1024 * 1024 },
});

const app = express();
app.use(cors({ origin: [env.frontendOrigin] }));
app.use(express.json({ limit: "5mb" }));
app.use("/uploads", express.static(env.uploadsDir));
app.use(
  "/out",
  express.static(env.outDir, {
    setHeaders: (res, filePath) => {
      // Force browser download instead of inline playback for finished MP4s.
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${path.basename(filePath)}"`,
      );
    },
  }),
);

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.get("/languages", (_req, res) => res.json(SUPPORTED_LANGUAGES));

app.post("/upload", upload.single("file"), (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: "no file" });
    return;
  }
  res.json({
    url: `${ORIGIN}/uploads/${req.file.filename}`,
    path: req.file.path,
    filename: req.file.originalname,
  });
});

app.post("/align", upload.single("audio"), async (req: Request, res: Response) => {
  try {
    const audio = req.file;
    const lyrics = String(req.body.lyrics ?? "");
    const language = String(req.body.language ?? "");
    if (!audio) {
      res.status(400).json({ error: "audio file missing" });
      return;
    }
    if (!lyrics.trim()) {
      res.status(400).json({ error: "lyrics empty" });
      return;
    }
    if (!SUPPORTED_LANGUAGES[language]) {
      res.status(400).json({
        error: `unsupported language '${language}'. supported: ${Object.keys(SUPPORTED_LANGUAGES).join(", ")}`,
      });
      return;
    }
    console.log(`[align] ${audio.originalname} (${language})`);
    const result = await alignAudio(audio.path, lyrics, language);
    console.log(`[align] → ${result.words.length} words, ${result.duration.toFixed(2)}s`);
    res.json(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[align] failed:", msg);
    res.status(500).json({ error: msg });
  }
});

app.post("/clear", (_req: Request, res: Response) => {
  try {
    const uploadsDeleted = clearDir(env.uploadsDir);
    const outDeleted = clearDir(env.outDir);
    console.log(
      `[clear] removed ${uploadsDeleted} upload(s), ${outDeleted} render(s)`,
    );
    res.json({ uploadsDeleted, outDeleted });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[clear] failed:", msg);
    res.status(500).json({ error: msg });
  }
});

function clearDir(dir: string): number {
  if (!fs.existsSync(dir)) return 0;
  let count = 0;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    try {
      const stat = fs.statSync(full);
      if (stat.isFile()) {
        fs.unlinkSync(full);
        count++;
      }
    } catch (e) {
      console.warn(`[clear] could not remove ${full}:`, e);
    }
  }
  return count;
}

app.post("/render", async (req: Request, res: Response) => {
  try {
    const out = await renderReel(req.body as RenderRequest, env.outDir, ORIGIN);
    res.json(out);
  } catch (e) {
    const msg = e instanceof Error ? (e.stack ?? e.message) : String(e);
    console.error("[render] failed:", msg);
    res.status(500).json({ error: msg });
  }
});

app.listen(env.port, () => {
  console.log(`[backend] listening on ${ORIGIN}`);
  console.log(`[backend] frontend → ${env.frontendOrigin}`);
  console.log(`[backend] python   → ${env.python}`);
  console.log(`[backend] uploads  → ${env.uploadsDir}`);
  console.log(`[backend] out      → ${env.outDir}`);
});
