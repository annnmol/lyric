/**
 * Spawn the Python WhisperX script and return word-level alignment as JSON.
 *
 * The Python side reads lyrics from stdin to avoid argv length limits and
 * writes a single JSON object to stdout. Errors arrive on stderr.
 */

import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { env } from "./env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCRIPT = path.resolve(__dirname, "../scripts/align.py");

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

export function alignAudio(
  audioPath: string,
  lyrics: string,
  language: string,
): Promise<AlignmentResult> {
  return new Promise((resolve, reject) => {
    const proc = spawn(env.python, [SCRIPT, audioPath, language], {
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    proc.stdout.on("data", (b) => (stdout += b.toString()));
    proc.stderr.on("data", (b) => {
      const s = b.toString();
      stderr += s;
      // Surface progress lines from Python in real time.
      process.stderr.write(`[align.py] ${s}`);
    });

    proc.on("error", (err) =>
      reject(new Error(`failed to spawn ${env.python}: ${err.message}`)),
    );

    proc.on("close", (code) => {
      if (code !== 0) {
        return reject(
          new Error(
            `align.py exited ${code}\n${stderr.trim() || "(no stderr)"}`,
          ),
        );
      }
      try {
        const out = JSON.parse(stdout) as AlignmentResult & { error?: string };
        if (out.error) return reject(new Error(out.error));
        resolve(out);
      } catch {
        reject(
          new Error(
            `align.py produced invalid JSON:\n${stdout.slice(0, 500)}`,
          ),
        );
      }
    });

    proc.stdin.write(lyrics);
    proc.stdin.end();
  });
}
