import { useMemo, useState } from "react";
import { AudioPanel } from "./components/AudioPanel";
import { BackgroundPanel } from "./components/BackgroundPanel";
import { ExportPanel } from "./components/ExportPanel";
import { LyricsPanel } from "./components/LyricsPanel";
import { PresetPanel } from "./components/PresetPanel";
import { ReelPreview } from "./components/ReelPreview";
import { SectionCard } from "./components/SectionCard";
import { clearArtifacts } from "./lib/api";
import { PRESETS } from "./lib/presets";
import type {
  AlignmentResult,
  BackgroundAsset,
  Preset,
  ReelProps,
} from "./lib/types";

export function App() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioName, setAudioName] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState<number | null>(null);

  const [aligned, setAligned] = useState<AlignmentResult | null>(null);
  const [background, setBackground] = useState<BackgroundAsset | null>(null);
  const [preset, setPreset] = useState<Preset>(PRESETS[0]);

  const [clearKey, setClearKey] = useState(0);
  const [clearing, setClearing] = useState(false);

  const reel: ReelProps = useMemo(
    () => ({
      words: aligned?.words ?? [],
      background,
      audioUrl,
      preset,
      durationInSeconds: audioDuration ?? aligned?.duration ?? 30,
    }),
    [aligned, background, audioUrl, preset, audioDuration],
  );

  const exportReady =
    audioFile != null &&
    aligned != null &&
    background != null &&
    audioUrl != null;

  const hasState =
    audioFile != null || aligned != null || background != null;

  async function handleClear() {
    if (
      !window.confirm(
        "Delete all uploaded audio, backgrounds, and rendered MP4s on the server, and reset the workspace?",
      )
    ) {
      return;
    }
    setClearing(true);
    try {
      const { uploadsDeleted, outDeleted } = await clearArtifacts();
      setAudioFile(null);
      setAudioUrl(null);
      setAudioName(null);
      setAudioDuration(null);
      setAligned(null);
      setBackground(null);
      setClearKey((k) => k + 1);
      console.log(
        `cleared ${uploadsDeleted} upload(s) and ${outDeleted} render(s)`,
      );
    } catch (e) {
      window.alert(
        `Couldn't clear: ${e instanceof Error ? e.message : String(e)}`,
      );
    } finally {
      setClearing(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-ink-950 via-ink-900 to-ink-950">
      <header className="border-b border-ink-800 px-8 py-5">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Lyric Reel
            <span className="ml-2 text-sm font-normal text-ink-400">
              local-first cinematic typography
            </span>
          </h1>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleClear}
              disabled={clearing || !hasState}
              title="Delete all uploads + renders on the server and reset the workspace"
              className="rounded-md border border-ink-700 bg-ink-800 px-3 py-1.5 text-xs font-medium text-ink-200 transition hover:border-accent hover:text-accent disabled:opacity-40 disabled:hover:border-ink-700 disabled:hover:text-ink-200"
            >
              {clearing ? "clearing…" : "Clear workspace"}
            </button>
            <span className="font-mono text-xs text-ink-400">v0.1 · MVP</span>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-8 py-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="space-y-5">
          <SectionCard step={1} title="Import audio" done={audioUrl != null}>
            <AudioPanel
              key={`audio-${clearKey}`}
              fileName={audioName}
              durationSeconds={audioDuration}
              onAudio={(file, url, dur) => {
                setAudioFile(file);
                setAudioUrl(url);
                setAudioName(file.name);
                setAudioDuration(dur);
              }}
            />
          </SectionCard>

          <SectionCard
            step={2}
            title="Paste lyrics & align"
            description="WhisperX runs locally — first run downloads the language model."
            done={aligned != null}
          >
            <LyricsPanel
              key={`lyrics-${clearKey}`}
              audioFile={audioFile}
              audioName={audioName}
              aligned={aligned}
              onAligned={setAligned}
            />
          </SectionCard>

          <SectionCard
            step={3}
            title="Background"
            description="Image loops over the full duration; video keeps its own timing."
            done={background != null}
          >
            <BackgroundPanel
              key={`bg-${clearKey}`}
              background={background}
              onBackground={setBackground}
            />
          </SectionCard>

          <SectionCard step={4} title="Animation preset">
            <PresetPanel preset={preset} onSelect={setPreset} />
          </SectionCard>

          <SectionCard step={5} title="Export">
            <ExportPanel
              key={`export-${clearKey}`}
              reel={reel}
              ready={exportReady}
            />
          </SectionCard>
        </div>

        <aside className="lg:sticky lg:top-8 lg:self-start">
          <ReelPreview reel={reel} />
        </aside>
      </main>
    </div>
  );
}
