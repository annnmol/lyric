import type { ReactNode } from "react";
import { useState } from "react";
import { renderReel } from "../lib/api";
import type { ReelProps, RenderResponse, Resolution } from "../lib/types";

interface Props {
  reel: ReelProps;
  ready: boolean;
}

export function ExportPanel({ reel, ready }: Props) {
  const [resolution, setResolution] = useState<Resolution>("1080x1920");
  const [fps, setFps] = useState<30 | 60>(30);
  const [crf, setCrf] = useState<number>(18);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RenderResponse | null>(null);

  async function handleExport() {
    setError(null);
    setBusy(true);
    setResult(null);
    try {
      const r = await renderReel({ reel, resolution, fps, crf });
      setResult(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  const filename = result?.outputPath.split("/").pop() ?? "";

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <Field label="resolution">
          <select
            value={resolution}
            onChange={(e) => setResolution(e.target.value as Resolution)}
            className="w-full rounded-lg border border-ink-700 bg-ink-800 px-2 py-2 text-sm"
          >
            <option value="1080x1920">1080 × 1920</option>
            <option value="1440x2560">1440 × 2560</option>
            <option value="2160x3840">2160 × 3840 (4K)</option>
          </select>
        </Field>
        <Field label="fps">
          <select
            value={fps}
            onChange={(e) => setFps(Number(e.target.value) as 30 | 60)}
            className="w-full rounded-lg border border-ink-700 bg-ink-800 px-2 py-2 text-sm"
          >
            <option value={30}>30</option>
            <option value={60}>60</option>
          </select>
        </Field>
        <Field
          label="crf (quality)"
          hint="Lower = better · 14 lossless · 18 high · 23 standard"
        >
          <input
            type="number"
            min={14}
            max={28}
            value={crf}
            onChange={(e) => setCrf(Number(e.target.value))}
            className="w-full rounded-lg border border-ink-700 bg-ink-800 px-2 py-2 text-sm"
          />
        </Field>
      </div>

      <button
        onClick={handleExport}
        disabled={!ready || busy}
        className="w-full rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-ink-950 hover:brightness-110 disabled:bg-ink-700 disabled:text-ink-300"
      >
        {busy ? "rendering…" : "Export MP4"}
      </button>

      {result ? (
        <a
          href={result.outputUrl}
          download={filename}
          className="group flex items-center justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 transition hover:border-emerald-400/50 hover:bg-emerald-500/15"
        >
          <span className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-200 group-hover:bg-emerald-500/25">
              <DownloadIcon className="h-4 w-4" />
            </span>
            <span className="flex flex-col">
              <span className="text-sm font-semibold text-emerald-100">
                Download MP4
              </span>
              <span className="font-mono text-[11px] text-emerald-200/70">
                {filename} · {(result.durationMs / 1000).toFixed(1)}s render
              </span>
            </span>
          </span>
          <span className="text-[11px] uppercase tracking-[0.14em] text-emerald-300/70">
            save
          </span>
        </a>
      ) : null}

      {error ? <p className="text-xs text-accent">{error}</p> : null}
      {!ready ? (
        <p className="text-[11px] text-ink-400">
          Need audio + alignment + background to export.
        </p>
      ) : null}
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-[0.16em] text-ink-400">
        {label}
      </span>
      {children}
      {hint ? (
        <span className="text-[10px] leading-snug text-ink-400">{hint}</span>
      ) : null}
    </label>
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
