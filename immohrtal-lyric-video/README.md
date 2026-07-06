# IMMOHRTAL — Animated Lyric Video

Programmatic lyric video built with [Remotion](https://remotion.dev): word-by-word
lyric sync driven by faster-whisper word timestamps, chrome-3D kinetic typography,
the IMMOHRTAL mark in a 3D treatment, and a blue/green/grey night aesthetic pulled
from `immohrtal-site`.

## Structure

- `scripts/transcribe.py` — faster-whisper transcription with word-level timestamps → `src/lyrics.json`
- `scripts/prep_logo.py` — knocks the white background out of the logo JPEG → `public/logo.png`
- `src/LyricVideo.tsx` — main composition: intro → word-synced lyric lines → logo interludes on instrumental gaps → outro
- `src/LyricLine.tsx` — per-line entrance/exit variants + per-word chrome pop synced to the vocal
- `src/Background.tsx` / `src/Motifs.tsx` — animated gradient wash, light streaks, rising particles, floor grid, floating inspirational sparkle/star/bolt motifs
- `src/Logo3D.tsx` — logo with perspective wobble, alpha-masked light sweep, glow, floor reflection

## Commands

```bash
npm install
npm run transcribe        # regenerate src/lyrics.json from public/track.mp3
npm run studio            # open Remotion Studio to preview
npm run render            # render out/lyric-video.mp4 (1280x720 @ 30fps)
```

To swap the song: replace `public/track.mp3`, run `npm run transcribe`, re-render.
Fix any misheard words by editing `src/lyrics.json` directly (only `word` text
matters for display; `start`/`end` drive the sync).

Note: `remotion.config.ts` pins the browser executable to this remote
environment's pre-installed Chromium — adjust or remove that line elsewhere.
