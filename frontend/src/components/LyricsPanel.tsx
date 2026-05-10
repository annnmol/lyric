import { useEffect, useRef, useState } from "react";
import { alignAudio, fetchLanguages } from "../lib/api";
import type { AlignedWord, AlignmentResult } from "../lib/types";

interface Props {
  audioFile: File | null;
  audioName: string | null;
  onAlignmentSourced: (result: AlignmentResult) => void;
  onOpenEditor: () => void;
  aligned: AlignmentResult | null;
}

export function LyricsPanel({
  audioFile,
  audioName,
  onAlignmentSourced,
  onOpenEditor,
  aligned,
}: Props) {
  const [lyrics, setLyrics] = useState("");
  const [language, setLanguage] = useState("hi");
  const [languages, setLanguages] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchLanguages()
      .then(setLanguages)
      .catch(() => setError("alignment service offline (port 8765)"));
  }, []);

  async function handleAlign() {
    if (!audioFile || !lyrics.trim()) return;
    setError(null);
    setBusy(true);
    try {
      // Strip CR (the actual culprit behind "hanjoo\r\nAkh"-style polluted
      // tokens) but keep \n so the backend can use line breaks as natural
      // phrase boundaries when distributing words across speech regions.
      const cleaned = lyrics
        .replace(/\r/g, "")
        .split("\n")
        .map((line) => line.replace(/\s+/g, " ").trim())
        .filter((line) => line.length > 0)
        .join("\n");
      if (!cleaned) {
        setError("lyrics had no usable text after cleanup");
        return;
      }
      const r = await alignAudio(audioFile, cleaned, language);
      onAlignmentSourced(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function handleUploadJson(file: File) {
    setError(null);
    try {
      const text = await file.text();
      const parsed = parseAlignmentJson(text);
      if (parsed.language && languages[parsed.language]) {
        setLanguage(parsed.language);
      }
      onAlignmentSourced(parsed);
    } catch (e) {
      setError(
        `couldn't read alignment JSON: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  }

  function handleDownloadJson() {
    if (!aligned) return;
    const base = safeBasename(audioName) || "alignment";
    const filename = `alignment-${base}-${aligned.language}.json`;
    downloadJson(filename, aligned);
  }

  return (
    <div className="space-y-3">
      <textarea
        value={lyrics}
        onChange={(e) => setLyrics(e.target.value)}
        rows={6}
        spellCheck={false}
        placeholder="paste lyrics, one phrase per line…"
        className="w-full resize-y rounded-xl border border-ink-700 bg-ink-800/60 p-3 font-mono text-sm text-ink-100 placeholder:text-ink-400 focus:border-accent focus:outline-none"
      />

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="rounded-lg border border-ink-700 bg-ink-800 px-3 py-2 text-sm text-ink-100 focus:border-accent focus:outline-none"
        >
          {Object.entries(languages).length === 0 ? (
            <option>loading…</option>
          ) : (
            Object.entries(languages).map(([code, label]) => (
              <option key={code} value={code}>
                {label}
              </option>
            ))
          )}
        </select>

        <input
          ref={jsonInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleUploadJson(f);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => jsonInputRef.current?.click()}
          disabled={!audioFile}
          className="rounded-lg border border-ink-600 bg-ink-800 px-3 py-2 text-sm text-ink-100 hover:border-ink-500 disabled:opacity-50"
          title="Upload a previously-saved alignment JSON to skip re-running WhisperX"
        >
          Upload JSON
        </button>

        <button
          onClick={handleAlign}
          disabled={!audioFile || !lyrics.trim() || busy}
          className="ml-auto rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-ink-950 hover:brightness-110 disabled:bg-ink-700 disabled:text-ink-300"
        >
          {busy ? "aligning…" : "Generate Alignment"}
        </button>
      </div>

      {aligned ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
          <span>
            aligned <strong>{aligned.words.length}</strong> words ·{" "}
            {aligned.duration.toFixed(2)}s · {aligned.language}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenEditor}
              className="flex items-center gap-1.5 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-[11px] font-medium text-emerald-100 hover:bg-emerald-500/20"
              title="Open the timing editor to fix offset, stretch, or per-word placement"
            >
              Tune timing
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={handleDownloadJson}
              className="flex items-center gap-1.5 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-[11px] font-medium text-emerald-100 hover:bg-emerald-500/20"
              title="Download as JSON to edit timings or re-import later"
            >
              <DownloadIcon className="h-3.5 w-3.5" />
              JSON
            </button>
          </div>
        </div>
      ) : null}

      {error ? <p className="text-xs text-accent">{error}</p> : null}
    </div>
  );
}

function ArrowRight({ className }: { className?: string }) {
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
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
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
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  );
}

function parseAlignmentJson(text: string): AlignmentResult {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("not valid JSON");
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("expected an object at the top level");
  }
  const obj = data as Record<string, unknown>;
  if (!Array.isArray(obj.words)) {
    throw new Error("missing 'words' array");
  }
  const words: AlignedWord[] = obj.words.map((raw, i) => {
    if (!raw || typeof raw !== "object") {
      throw new Error(`words[${i}] is not an object`);
    }
    const w = raw as Record<string, unknown>;
    if (typeof w.word !== "string" || typeof w.start !== "number" || typeof w.end !== "number") {
      throw new Error(`words[${i}] needs string 'word' and numeric 'start'/'end'`);
    }
    return {
      word: w.word,
      start: w.start,
      end: w.end,
      score: typeof w.score === "number" ? w.score : 0,
    };
  });
  return {
    language: typeof obj.language === "string" ? obj.language : "",
    duration:
      typeof obj.duration === "number"
        ? obj.duration
        : (words[words.length - 1]?.end ?? 0),
    words,
  };
}

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function safeBasename(name: string | null): string {
  if (!name) return "";
  const stem = name.replace(/\.[^/.]+$/, "");
  return stem.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 60);
}
