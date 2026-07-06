# IMMOHRTAL — Campaign Brand Direction (v1)

Campaign for **Dance With The Delusional** (SESSION 001). Design source of truth
is the site itself: `immohrtal-site/src/index.css` (tokens) and
`immohrtal-site/src/content/album.ts` (copy, tracks, links).

Interactive direction board (mockups in real brand fonts):
https://claude.ai/code/artifact/0fcc4421-464a-43e4-992a-e69b23cab9e6

## The Angle

**The delusion is the point.** 28, almost 29, professional career that works —
and a record anyway. The audience isn't asked to believe he'll blow up; they're
asked to recognize the feeling of a dream you were supposed to have outgrown.
"Delusional" is not an insult, it's the ticket in.

**Campaign line: IF NOT NOW, WHEN.**
Usage: caption closer, end card, bio line, last frame of every video.

### Voice rules

| Do | Never |
|---|---|
| Confess, don't promote — "I'm 28 and I probably shouldn't be doing this" | "New single out now, go stream it!" |
| Specific — Erie, 814, lake-effect, notebooks, Faces in 2014 | Generic grind-talk ("no days off", "chasing greatness") |
| Self-aware and funny about *himself* | Ironic about *the music* — the delusion is sincere |

## The Duality (visual system)

Two worlds that **alternate, never blend**:

- **DAY — The Office**: ink on paper (`#141922` on `#F7F9FB`). The marketer.
- **NIGHT — The Booth**: chrome on ink (chrome-light gradient on `#10151D`). The rapper.
- **Signal blue `#1F9EFF`** is the only color in both worlds — the thread that
  says same person.
- **Green `#17A86B`** is the destination (descent gradient ends on it), never a
  second loud accent beside signal in one frame.

### Type roles

| Role | Face | Use |
|---|---|---|
| Display | Anton | Track titles, headlines, chrome treatment |
| The Bars | Instrument Serif *italic* | Any quoted lyric, always |
| Body | Space Grotesk | Everything readable |
| HUD | IBM Plex Mono | Session tags, labels, coordinates |

### Motifs

- **Session HUD** — `SESSION 001 // BAR 04`, `TRK 02 · LEVELS 043.1%` on every asset
- **Coordinates** — `42.1292 N / 80.0851 W` instead of city names
- **Roman numerals** — series content (The Split I, II, III…)
- **The Descent** — blue→green particle gradient from the site's WebGL spine;
  the motion signature for all animated assets

## Master asset formats

1. **Quote card** — 1080×1080, day world. One bar, serif italic, HUD header,
   `IF NOT NOW, WHEN` footer. → Canva brand template, data field per bar.
2. **Story / reel cover** — 1080×1920, night world. Chrome track title +
   audio-bar meter. Same layout = the Remotion lyric-video frame.
3. **YouTube thumbnail** — 1280×720, night world. Chrome Anton, ≤11 chars/line,
   mono footer states what the video is.
4. **Spotify Canvas** — 720×1280, 3–8s loop. The descent, cropped vertical.
   One pipeline, eleven loops (one per track).

## Content pillars

| # | Pillar | What it is |
|---|---|---|
| I | The Split | Day-job/night-booth duality content — suit and session in one frame |
| II | The Bars | Quote cards + 15–30s lyric clips |
| III | The Making | Process content with HUD overlays — studio, notebooks, session tags |
| IV | The Why | The confessionals — Mac, Erie, the daughter, almost-29-and-doing-it-anyway |

Everything posted fits one pillar. If it doesn't, it's off-campaign.

### Story beat: King Keev

Both features on the record (TRK 03 *814 Blood*, TRK 09 *On My Way*) are
**King Keev — Dillon's best friend**. That's not a credit, it's a campaign
asset: no industry placements, just the guy who was there. Content lane:
The Split / The Why — two friends from the 814 doing it anyway.
Track studies live in `Tracks/`.

## Pipeline (next builds)

- [ ] Canva brand templates for the four master formats
- [ ] Remotion render pipeline — lyric videos + Canvas loops, audio-reactive
- [ ] EPK one-pager (day-world format carrying the night-world story)
- [ ] Cover-art variations / single artwork system
