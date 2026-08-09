# Pro Fence Deck — "Built To Last"

Motion-graphics brand video. **3:40**, 1920×1080, 30fps, silent.

Built as a deterministic HTML/CSS/JS motion engine rather than an NLE timeline, so
every frame is a pure function of `t`. The same code drives live playback in a
browser and headless frame capture into ffmpeg — which means re-cutting is a code
edit and a re-render, not a manual re-edit.

## Deliverables
| File | What it is |
|---|---|
| `ProFenceDeck-BuiltToLast-1080p.mp4` | The video. H.264, yuv420p, faststart. |
| `pfd-video.html` | Self-contained player — every image, font and the logo inlined as data URIs. Opens offline, scrubbable. |
| `src/` | Full build source (see below). |

## Structure

| # | Beat | Treatment |
|---|---|---|
| — | Logo ignition | Wordmark revealed by a clip wipe with a gradient shine travelling through a CSS mask of the real logo |
| — | Hero open | "BUILT TO LAST" over the lit-deck night shot, per-word rise, Ken Burns push |
| — | What we build | 45/55 split — photo slides from the left, navy panel from the right |
| — | Trust bar | 1998 / 2 / 100% / FREE, scale-bounce staggered off a drawing rule |
| 01 | Decks | Filmstrip — eight photos travelling horizontally on sprocket rails, cards scaling toward screen centre |
| 01 | Low maintenance | Split editorial + pill chips popping in |
| 02 | Fences | Grid bloom — twelve tiles scaling in from the centre outward with a slight rotate |
| 02 | Materials | Split editorial, mirrored |
| 03 | Railings | Split on the fabrication-shop shot, then a railings grid |
| 04 | Gates | Three parallax columns scrolling at different speeds behind a navy band that wipes in |
| 05 | Pool safety | Full-bleed statement, "FOUR FEET IS THE LAW." |
| 06 | Structures | Grid bloom |
| — | Reviews | Three Google quotes swiping through with five-star rules |
| — | Service area | Seventeen towns cascading in, plus a work strip |
| — | End card | Logo reveal, tagline, phone, URL |

Chapter cards transition with a two-bar split wipe. Consecutive scenes overlap by
0.34s so cuts crossfade instead of dipping to black.

## Design system
- **Navy `#25386C`** — sampled from the logo. **Amber `#F2A93B`** as the accent.
- **Poppins** 800/900 for display, **Lato** for body — the same pair as profencedeck.com. Both subset and embedded, no external font requests.
- The real logo is used throughout. The 471×92 site PNG was 4× Lanczos-upscaled with the alpha edge re-hardened, giving effectively vector-quality edges at 1120px wide, plus a matching alpha mask so the mark can be gradient-filled and shine-swept.

## Photos
77 images, all pulled from profencedeck.com and re-optimised. They fall into two
groups worth knowing about:

- **Real project photos** — Sergei's own job-site shots (decks, fences, gates, mesh pool fencing, the railing fabrication shop). These carry the film.
- **Stock/AI renders already on their site** — the 2026-era landing-page images. Used as the process and lifestyle B-roll.

`src/build_assets.py` holds the full curated index → category → caption map.

## Rebuild
```bash
cd src
python3 mklogo.py            # upscale + mask the logo (needs logo PNGs from the site)
python3 build_assets.py      # curate + optimise photos into full/ and web/ profiles
python3 build_html.py        # -> render.html (file refs) + pfd-video.html (inlined)
npx http-server -p 8899 -s . # CORS matters: CSS masks won't load over file://
node shots.js 12 44 96       # preview stills at given timestamps
node render.js               # frame-by-frame -> MP4 (~13 min)
```
Timings live at the bottom of `template.html`; each `scene(dur, …)` call sets its
own duration and the timeline re-flows automatically.

## Open items
- **No audio.** Needs a licensed music bed, and a VO if we want one.
- **No 9:16 cut yet.** The engine is resolution-aware but the layouts are composed for 16:9; vertical needs its own layout pass.
- Waiting on the 30 client photos in `pro-fence-deck-claude-handoff` — swapping them in is an edit to `SEL` in `build_assets.py` plus the key lists in the timeline.
- Confirm before publishing: which phone number, and the wood-decks yes/no contradiction. See [[Pro Fence Deck]].
