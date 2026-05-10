# Samples

- `alignment-example.json` — example WhisperX output for the line *"tere bina mera jee lagda nahi…"* (Hindi). Same shape returned by `POST /align`.
- `presets.json` — the four built-in animation presets (mirrors `frontend/src/lib/presets.ts`).

You can drop `alignment-example.json` into the renderer to dry-run the export pipeline without running WhisperX:

```ts
const reel = {
  words: require("../samples/alignment-example.json").words,
  background: { kind: "image", url: "http://localhost:8766/uploads/your.jpg", filename: "your.jpg" },
  audioUrl: "http://localhost:8766/uploads/your.mp3",
  preset: require("../samples/presets.json")[0],
  durationInSeconds: 6.5,
};
```
