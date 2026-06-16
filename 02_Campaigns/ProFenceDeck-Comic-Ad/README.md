# ProFence Deck — 60s Comic-Book Ad

A single continuous, comic-book-style ad for ProFence Deck. Summer-focused, funny,
and built to read clearly **without a voiceover** (native SFX + music bed).

- **File:** `ProFenceDeck_60s.mp4`
- **Spec:** MP4 / H.264, 960×960, 24 fps, 60.000 s
- **Brand navy:** `#22346b` (sampled from the official logo)

## Story timeline

| Time | Beat |
|------|------|
| 0:00 | Logo intro burst — *"Every backyard has a story…"* |
| 0:04 | Sunny backyard, proud homeowner, old fence leaning & shaking |
| 0:12 | Comic card: **"DIY only made it worse."** |
| 0:15 | Comic card: **"Bad timing. Worse fence."** (*the BBQ is in one hour*) |
| 0:18 | Comic card: **"Time to call the pros."** |
| 0:21 | ProFence Deck logo swirl + **"to the Rescue!"** hero entrance |
| 0:30 | Truck arrives, clean blue-uniform crew inspects & builds |
| 0:37 | Slow-mo transformation montage — *old fence out / clean lines / done right* |
| 0:51 | Branded end card: *"Fence repairs. Deck upgrades. Backyard transformations."* + **"Book your estimate today."** |

## How it was assembled

Edited from three supplied comic clips (~27.5 s total) plus the official logo,
using `ffmpeg` (cuts, crossfades, dramatic zoom pushes, interpolated slow-mo
montage, audio crossfades) and `Pillow` for the comic caption / end cards.

- `build_cards.py` — generates the comic caption + end cards (`cards/`)
- `assemble.sh` — the exact ffmpeg xfade chain that produces the final 60 s cut
- `cards/` — generated card art + trimmed transparent logo

> Note: no new footage was AI-generated; the cut is bounded by the three source
> clips. Added runtime comes from the comic cards, transitions, zooms, and the
> slow-mo montage.
