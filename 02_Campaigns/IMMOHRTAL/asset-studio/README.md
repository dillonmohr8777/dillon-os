# IMMOHRTAL Asset Studio

Code-rendered brand assets. Every PNG in `out/` is generated from the
site's exact design tokens and font files (`immohrtal-site/src/`), so
assets and website are pixel-identical by construction.

## Render

```bash
python3 render.py              # everything
python3 render.py endcard      # one asset
```

Requires `pip install playwright pillow` and a Chromium at
`/opt/pw-browsers/chromium-*` (or edit `main()` to point at yours).

## Inventory (v1)

| Asset | Size | World | Use |
|---|---|---|---|
| `quote-day-*` ×3 | 1080×1080 | Day | IG/FB feed quote cards (The Bars) |
| `quote-night-tatted` | 1080×1080 | Night | 814 Blood quote card |
| `story-814`, `story-onmyway` | 1080×1920 | Night | Stories/Reels covers, lyric-video frame |
| `thumb-814/-onmyway/-album` | 1280×720 | Night | YouTube thumbnails |
| `endcard` | 1920×1080 | Night | Last frame of every video |
| `avatar` | 1000×1000 | Day | Profile picture, all platforms |
| `banner-youtube` | 2560×1440 | Night | YouTube channel art (safe-area centered) |
| `banner-x` | 1500×500 | Day | X header |
| `og-image` | 1200×630 | Day | Site social-share card |
| `tracklist` | 1080×1350 | Day | 4:5 feed post — album announcement |

## Motion (`motion.py` → `out/motion/`)

| Asset | Spec | Notes |
|---|---|---|
| `canvas-814.mp4` | 720×1280 · 7.81s | Spotify Canvas — seamless, locked to 16 beats @ 123 BPM |
| `canvas-onmyway.mp4` | 720×1280 · 7.52s | Seamless, 12 beats @ ~96 BPM |
| `canvas-album.mp4` | 720×1280 · 7.0s | Generic Canvas for the other 9 tracks until per-track ones exist |
| `lyric-814.mp4` | 1080×1920 · 12s | Audio-reactive lyric clip (0:17–0:29), meter driven by the real waveform. Captions are auto-transcribed — correct before posting. |

```bash
python3 motion.py                 # all motion assets
python3 motion.py canvas-814      # one
```

## Clip factory (`clips.py` → `out/motion/clip-*.mp4`)

Batch-cuts each track's best-energy windows (per `data/analysis.json`)
into captioned 1080×1920 verticals for TikTok/Reels/Shorts, using the
lyric-clip treatment. Captions auto-pull from `data/transcripts.json`
(⚠ auto-transcribed — correct in `../Tracks/` before posting).

| Clip | Window | Why |
|---|---|---|
| `clip-814-15s` | 0:40–0:55 | Peak-energy 15s |
| `clip-814-30s` | 0:25–0:55 | Best 30s run |
| `clip-onmyway-15s` | 0:40–0:55 | First hook |
| `clip-onmyway-30s` | 2:00–2:30 | Double-hook + Keev |

## EPK (`epk.py` → `out/IMMOHRTAL-EPK.pdf`)

One-page press kit (Letter, print-safe) — bio, angle, tracklist,
cover + artist photo, booking contact. `epk-preview.png` for a quick look.

## Editing

All copy/bars live in `render.py` (`SPECS` + builder functions).
Lyric quotes come from `../Tracks/` — correct the transcripts there
first, then update the bars here. New asset = new builder + SPECS row.
