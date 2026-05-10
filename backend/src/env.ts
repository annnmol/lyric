/**
 * Loads .env from the backend/ root and exposes typed config.
 * Defaults are baked in so the app works with no .env at all.
 */

import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

function num(v: string | undefined, fallback: number): number {
  const n = v != null && v !== "" ? Number(v) : NaN;
  return Number.isFinite(n) ? n : fallback;
}

function str(v: string | undefined, fallback: string): string {
  return v && v.trim() !== "" ? v : fallback;
}

function resolvePath(v: string | undefined, fallback: string): string {
  const p = str(v, fallback);
  return path.isAbsolute(p) ? p : path.resolve(ROOT, p);
}

export const env = {
  port: num(process.env.PORT, 8765),
  frontendOrigin: str(process.env.FRONTEND_ORIGIN, "http://localhost:5173"),
  python: resolvePath(process.env.LYRIC_PYTHON, ".venv/bin/python"),
  uploadsDir: resolvePath(process.env.UPLOADS_DIR, "uploads"),
  outDir: resolvePath(process.env.OUT_DIR, "out"),
  maxUploadMB: num(process.env.MAX_UPLOAD_MB, 200),
};

export const ORIGIN = `http://localhost:${env.port}`;
