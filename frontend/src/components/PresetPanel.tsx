import { PRESETS } from "../lib/presets";
import type { Preset } from "../lib/types";

interface Props {
  preset: Preset;
  onSelect: (p: Preset) => void;
}

export function PresetPanel({ preset, onSelect }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {PRESETS.map((p) => {
        const active = p.id === preset.id;
        return (
          <button
            key={p.id}
            onClick={() => onSelect(p)}
            className={`group flex flex-col items-start gap-1 rounded-xl border px-3 py-3 text-left transition ${
              active
                ? "border-accent bg-accent/10"
                : "border-ink-700 bg-ink-800/50 hover:border-ink-500"
            }`}
          >
            <span
              className="text-base font-semibold leading-tight"
              style={{
                fontFamily: p.fontFamily,
                color: active ? p.highlightColor : p.color,
                textTransform: p.textTransform,
              }}
            >
              {p.name}
            </span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-ink-400">
              {p.animation}
            </span>
          </button>
        );
      })}
    </div>
  );
}
