import type { AlignedWord } from "../lib/types";

export interface Line {
  words: AlignedWord[];
  start: number;
  end: number;
}

const MAX_WORDS_PER_LINE = 7;
const NEW_LINE_GAP_SECONDS = 0.55;

export function chunkIntoLines(words: AlignedWord[]): Line[] {
  if (words.length === 0) return [];
  const lines: Line[] = [];
  let current: AlignedWord[] = [];

  for (const w of words) {
    const prev = current[current.length - 1];
    const gap = prev ? w.start - prev.end : 0;
    const shouldBreak =
      current.length >= MAX_WORDS_PER_LINE || gap > NEW_LINE_GAP_SECONDS;

    if (shouldBreak && current.length) {
      lines.push(toLine(current));
      current = [];
    }
    current.push(w);
  }
  if (current.length) lines.push(toLine(current));

  for (let i = 0; i < lines.length - 1; i++) {
    lines[i].end = Math.min(lines[i + 1].start, lines[i].end + 0.25);
  }
  if (lines.length) lines[lines.length - 1].end += 0.25;

  return lines;
}

function toLine(words: AlignedWord[]): Line {
  return { words, start: words[0].start, end: words[words.length - 1].end };
}

export function findActiveLine(lines: Line[], time: number): Line | null {
  for (const line of lines) {
    if (time >= line.start && time <= line.end) return line;
  }
  return null;
}
