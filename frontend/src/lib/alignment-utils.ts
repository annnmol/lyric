import type { AlignmentResult } from "./types";

export function applyOffsetStretch(
  base: AlignmentResult,
  offset: number,
  stretch: number,
): AlignmentResult {
  const words = base.words.map((w) => ({
    ...w,
    start: Math.max(0, w.start * stretch + offset),
    end: Math.max(0, w.end * stretch + offset),
  }));
  return {
    ...base,
    duration: words[words.length - 1]?.end ?? 0,
    words,
  };
}

export function lastWordEnd(a: AlignmentResult): number {
  return a.words[a.words.length - 1]?.end ?? 0;
}

export function activeWordIndex(a: AlignmentResult, time: number): number {
  for (let i = 0; i < a.words.length; i++) {
    const w = a.words[i];
    if (time >= w.start && time <= w.end) return i;
  }
  return -1;
}
