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

## Editing

All copy/bars live in `render.py` (`SPECS` + builder functions).
Lyric quotes come from `../Tracks/` — correct the transcripts there
first, then update the bars here. New asset = new builder + SPECS row.
