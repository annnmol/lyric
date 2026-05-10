import type { ReactNode } from "react";

interface Props {
  step: number;
  title: string;
  description?: string;
  done?: boolean;
  children: ReactNode;
}

export function SectionCard({ step, title, description, done, children }: Props) {
  return (
    <section className="rounded-2xl border border-ink-700 bg-ink-900/60 p-5 backdrop-blur">
      <header className="mb-4 flex items-baseline justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-ink-400">
            Step {step}
          </div>
          <h2 className="mt-1 font-display text-xl font-semibold text-ink-100">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 text-sm text-ink-300">{description}</p>
          ) : null}
        </div>
        {done ? (
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-300">
            ready
          </span>
        ) : null}
      </header>
      {children}
    </section>
  );
}
