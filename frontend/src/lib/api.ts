import type {
  AlignmentResult,
  BackgroundAsset,
  RenderRequest,
  RenderResponse,
} from "./types";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8765";

export async function fetchLanguages(): Promise<Record<string, string>> {
  const r = await fetch(`${API}/languages`);
  if (!r.ok) throw new Error(`languages: ${r.status}`);
  return r.json();
}

export async function alignAudio(
  audio: File,
  lyrics: string,
  language: string,
): Promise<AlignmentResult> {
  const fd = new FormData();
  fd.append("audio", audio);
  fd.append("lyrics", lyrics);
  fd.append("language", language);

  const r = await fetch(`${API}/align`, { method: "POST", body: fd });
  if (!r.ok) {
    const detail = await r.text();
    throw new Error(`alignment failed (${r.status}): ${detail}`);
  }
  return r.json();
}

export async function uploadAsset(
  file: File,
  kind: "audio" | "image" | "video",
): Promise<{ url: string; path: string; filename: string }> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("kind", kind);
  const r = await fetch(`${API}/upload`, { method: "POST", body: fd });
  if (!r.ok) throw new Error(`upload failed: ${r.status}`);
  return r.json();
}

export async function uploadBackground(file: File): Promise<BackgroundAsset> {
  const kind: "image" | "video" = file.type.startsWith("video") ? "video" : "image";
  const { url, filename } = await uploadAsset(file, kind);
  return { url, kind, filename };
}

export async function clearArtifacts(): Promise<{
  uploadsDeleted: number;
  outDeleted: number;
}> {
  const r = await fetch(`${API}/clear`, { method: "POST" });
  if (!r.ok) {
    const detail = await r.text();
    throw new Error(`clear failed (${r.status}): ${detail}`);
  }
  return r.json();
}

export async function renderReel(req: RenderRequest): Promise<RenderResponse> {
  const r = await fetch(`${API}/render`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!r.ok) {
    const detail = await r.text();
    throw new Error(`render failed (${r.status}): ${detail}`);
  }
  return r.json();
}
