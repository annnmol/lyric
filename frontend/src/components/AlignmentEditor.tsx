import { useEffect, useMemo, useRef, useState } from "react";
import {
  activeWordIndex,
  applyOffsetStretch,
  lastWordEnd,
} from "../lib/alignment-utils";
import type {
  AlignedWord,
  AlignmentResult,
  BackgroundAsset,
  Preset,
  ReelProps,
} from "../lib/types";
import { ReelPreview } from "./ReelPreview";

interface Props {
  aligned: AlignmentResult;
  originalAligned: AlignmentResult;
  audioUrl: string | null;
  audioDuration: number | null;
  background: BackgroundAsset | null;
  preset: Preset;
  onSave: (next: AlignmentResult) => void;
  onCancel: () => void;
}

export function AlignmentEditor({
  aligned,
  originalAligned,
  audioUrl,
  audioDuration,
  background,
  preset,
  onSave,
  onCancel,
}: Props) {
  const [editorBase, setEditorBase] = useState<AlignmentResult>(aligned);
  const [offset, setOffset] = useState(0);
  const [stretch, setStretch] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = playbackRate;
  }, [playbackRate, audioUrl]);

  const draft = useMemo(
    () => applyOffsetStretch(editorBase, offset, stretch),
    [editorBase, offset, stretch],
  );

  const previewReel: ReelProps = useMemo(
    () => ({
      words: draft.words,
      background,
      audioUrl,
      preset,
      durationInSeconds: audioDuration ?? draft.duration ?? 30,
    }),
    [draft, background, audioUrl, preset, audioDuration],
  );

  const lastEnd = lastWordEnd(draft);
  const audioLen = audioDuration ?? lastEnd;
  const activeIdx = activeWordIndex(draft, currentTime);

  function commitWordEdit(index: number, patch: Partial<AlignedWord>) {
    // Bake current global layer into a new base, then patch the one word.
    const baked = applyOffsetStretch(editorBase, offset, stretch);
    const words = baked.words.map((w, i) =>
      i === index ? { ...w, ...patch } : w,
    );
    setEditorBase({
      ...baked,
      words,
      duration: words[words.length - 1]?.end ?? 0,
    });
    setOffset(0);
    setStretch(1);
  }

  function handleAutoFit() {
    if (lastEnd <= 0 || audioLen <= 0) return;
    const baseEnd = lastWordEnd(editorBase);
    if (baseEnd <= 0) return;
    const next = (audioLen - offset) / baseEnd;
    setStretch(clamp(next, 0.1, 5));
  }

  function handleResetAll() {
    setEditorBase(originalAligned);
    setOffset(0);
    setStretch(1);
  }

  function handlePlayFrom(start: number) {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, start);
    audio.play().catch(() => {});
  }

  return (
    <div className="mx-auto max-w-7xl px-8 py-6">
      <header className="mb-6 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 rounded-md border border-ink-700 bg-ink-800 px-3 py-1.5 text-sm text-ink-200 hover:border-ink-500"
        >
          <BackArrow className="h-4 w-4" />
          Back to workflow
        </button>
        <div>
          <h2 className="font-display text-xl font-semibold">Tune timing</h2>
          <p className="text-xs text-ink-400">
            Adjustments are non-destructive — Reset returns to the original
            alignment.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetAll}
            className="rounded-md border border-ink-700 bg-ink-800 px-3 py-1.5 text-sm text-ink-200 hover:border-accent hover:text-accent"
          >
            Reset all
          </button>
          <button
            type="button"
            onClick={() => onSave(draft)}
            className="rounded-md bg-accent px-4 py-1.5 text-sm font-semibold text-ink-950 hover:brightness-110"
          >
            Save
          </button>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)]">
        <div className="space-y-4">
          <Card title="Global controls">
            <div className="grid grid-cols-2 gap-3">
              <NumberField
                label="offset (s)"
                value={offset}
                step={0.1}
                onChange={setOffset}
              />
              <NumberField
                label="stretch (×)"
                value={stretch}
                step={0.01}
                min={0.1}
                max={5}
                onChange={setStretch}
              />
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleAutoFit}
                className="rounded-md border border-ink-600 bg-ink-800 px-3 py-1.5 text-xs font-medium text-ink-100 hover:border-accent hover:text-accent"
                disabled={!audioDuration}
                title={
                  !audioDuration
                    ? "audio duration unknown"
                    : "scale all words so the last word ends at the audio length"
                }
              >
                Auto-fit to audio
              </button>
              <p className="text-[11px] text-ink-400">
                ends at <span className="font-mono">{lastEnd.toFixed(2)}s</span>
                {audioDuration ? (
                  <>
                    {" "}
                    · audio is{" "}
                    <span className="font-mono">{audioDuration.toFixed(2)}s</span>
                  </>
                ) : null}
              </p>
            </div>
          </Card>

          <Card title="Audio">
            {audioUrl ? (
              <div className="space-y-2">
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  controls
                  preload="metadata"
                  onTimeUpdate={(e) =>
                    setCurrentTime((e.target as HTMLAudioElement).currentTime)
                  }
                  className="w-full"
                />
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="mr-1 text-[10px] uppercase tracking-[0.16em] text-ink-400">
                    speed
                  </span>
                  {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 2].map((r) => {
                    const active = Math.abs(playbackRate - r) < 0.001;
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setPlaybackRate(r)}
                        className={`rounded border px-2 py-0.5 font-mono text-[11px] transition ${
                          active
                            ? "border-accent bg-accent/15 text-accent"
                            : "border-ink-700 bg-ink-800 text-ink-200 hover:border-ink-500"
                        }`}
                      >
                        {r}x
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-sm text-ink-400">no audio loaded</p>
            )}
          </Card>

          <Card title={`Words (${draft.words.length})`}>
            <div className="max-h-[60vh] overflow-y-auto rounded-md border border-ink-800">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 bg-ink-900 text-[10px] uppercase tracking-[0.14em] text-ink-400">
                  <tr>
                    <th className="px-2 py-2 text-left">#</th>
                    <th className="px-2 py-2 text-left">word</th>
                    <th className="px-2 py-2 text-left">start (s)</th>
                    <th className="px-2 py-2 text-left">end (s)</th>
                    <th className="px-2 py-2 text-right" />
                  </tr>
                </thead>
                <tbody>
                  {draft.words.map((w, i) => (
                    <WordRow
                      key={i}
                      index={i}
                      word={w}
                      isActive={i === activeIdx}
                      onCommit={(patch) => commitWordEdit(i, patch)}
                      onPlay={() => handlePlayFrom(w.start)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <Card title="Live preview">
            <ReelPreview reel={previewReel} />
          </Card>
        </aside>
      </div>
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-ink-700 bg-ink-900/60 p-4 backdrop-blur">
      <h3 className="mb-3 text-[10px] uppercase tracking-[0.18em] text-ink-400">
        {title}
      </h3>
      {children}
    </section>
  );
}

function NumberField({
  label,
  value,
  step,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  step?: number;
  min?: number;
  max?: number;
  onChange: (n: number) => void;
}) {
  const [text, setText] = useState(value.toString());
  useEffect(() => {
    setText(value.toString());
  }, [value]);
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-[0.16em] text-ink-400">
        {label}
      </span>
      <input
        type="number"
        value={text}
        step={step}
        min={min}
        max={max}
        onChange={(e) => setText(e.target.value)}
        onBlur={() => {
          const n = Number(text);
          if (Number.isFinite(n)) onChange(n);
          else setText(value.toString());
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        }}
        className="w-full rounded-md border border-ink-700 bg-ink-800 px-2 py-1.5 text-sm font-mono text-ink-100 focus:border-accent focus:outline-none"
      />
    </label>
  );
}

function WordRow({
  index,
  word,
  isActive,
  onCommit,
  onPlay,
}: {
  index: number;
  word: AlignedWord;
  isActive: boolean;
  onCommit: (patch: Partial<AlignedWord>) => void;
  onPlay: () => void;
}) {
  const [startStr, setStartStr] = useState(word.start.toFixed(3));
  const [endStr, setEndStr] = useState(word.end.toFixed(3));

  useEffect(() => {
    setStartStr(word.start.toFixed(3));
  }, [word.start]);
  useEffect(() => {
    setEndStr(word.end.toFixed(3));
  }, [word.end]);

  function commit(field: "start" | "end", str: string) {
    const v = Number(str);
    if (!Number.isFinite(v)) {
      // revert
      if (field === "start") setStartStr(word.start.toFixed(3));
      else setEndStr(word.end.toFixed(3));
      return;
    }
    if (v === word[field]) return;
    onCommit({ [field]: v });
  }

  return (
    <tr
      className={`border-t border-ink-800 ${
        isActive ? "bg-emerald-500/10" : "hover:bg-ink-800/50"
      }`}
    >
      <td className="px-2 py-1.5 font-mono text-[11px] text-ink-400">
        {index + 1}
      </td>
      <td className="px-2 py-1.5 text-ink-100">{word.word}</td>
      <td className="px-2 py-1.5">
        <input
          type="text"
          inputMode="decimal"
          value={startStr}
          onChange={(e) => setStartStr(e.target.value)}
          onBlur={() => commit("start", startStr)}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          }}
          className="w-24 rounded border border-ink-700 bg-ink-800 px-2 py-1 font-mono text-xs text-ink-100 focus:border-accent focus:outline-none"
        />
      </td>
      <td className="px-2 py-1.5">
        <input
          type="text"
          inputMode="decimal"
          value={endStr}
          onChange={(e) => setEndStr(e.target.value)}
          onBlur={() => commit("end", endStr)}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          }}
          className="w-24 rounded border border-ink-700 bg-ink-800 px-2 py-1 font-mono text-xs text-ink-100 focus:border-accent focus:outline-none"
        />
      </td>
      <td className="px-2 py-1.5 text-right">
        <button
          type="button"
          onClick={onPlay}
          className="rounded border border-ink-700 px-2 py-0.5 text-[11px] text-ink-200 hover:border-accent hover:text-accent"
          title="Seek audio to this word and play"
        >
          play
        </button>
      </td>
    </tr>
  );
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function BackArrow({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  );
}
