# Align HCM video slate

Every rendered film is named for the **calendar slot it ships into**, not for the
project directory that builds it, so a file arrives ready to schedule. Names come
straight off the August 2026 content calendar (rev 0043).

| Ships | Post | File | Length | Built by |
| --- | --- | --- | --- | --- |
| Mon Aug 3 | The Team That Finishes It | `align-hcm-intro/2026-08-03 - The Team That Finishes It (Brand Intro Cut).mp4` | 48.4s | `align-hcm-intro/` |
| Mon Aug 3 | The Team That Finishes It | `align-motion/out/2026-08-03 - The Team That Finishes It (Reel Cut).mp4` | 56.2s | `align-motion/` |
| Fri Aug 14 | Public Service Cannot Pause | `align-motion/out/2026-08-14 - Public Service Cannot Pause.mp4` | 49.2s | `align-motion/` |
| Wed Aug 19 | Every Industry Depends On It | `align-hcm-industry/2026-08-19 - Every Industry Depends On It.mp4` | 65.8s | `align-hcm-industry/` |
| Fri Aug 28 | Transform, or Gather Dust | `2026-08-28 - Transform, or Gather Dust.mp4` | 45.0s | `_src/align-academy-in-motion/` |

All five are 1920x1080, 30fps, H.264, silent.

## Two cuts hold the same slot

Aug 3 has two films against it because two exist: the brand intro in
`align-hcm-intro/` and the reel in `align-motion/`. They are the same script and
the same argument, built by different engines, so the suffix says which cut each
one is rather than pretending one of them belongs somewhere else. **One of them
has to be dropped or moved before the month ships.** The calendar's own asset
line for Aug 3 reads 52.6s, which was the brand intro's length before "Kill
complexity." came out, so the calendar was written against that cut.

## Where the length in the calendar disagrees

The calendar records the length each film had when the page was written. Two have
moved since, and one never matched:

* **Aug 3** is listed at 52.6s. The brand intro is 48.4s now that "Kill
  complexity." is cut; the reel cut is 56.2s.
* **Aug 19** is listed at 64.6s against an actual 65.8s. That gap predates this
  pass.
* **Aug 14** is listed at 60.0s against an actual 49.2s. The 60s public sector
  animation in the calendar is `Different Missions. Same Workforce Pressure.`
  (AN06), which the 0043 revision displaced off the August slate. If Aug 14 is
  meant to run AN06 rather than this reel, the file here is the wrong asset, not
  the wrong length.

Update the calendar or the films, but do not leave them disagreeing.

## Video slots with no asset in this repo

Three of the calendar's video posts have nothing here to ship:

* **Wed Aug 12, HR at the Table** (1200x626, 2m13s) is the Maher El-Abdallah and
  Brent Skinner conversation. Source is on the 7/15 branch under
  `03_Content/Video-Edits/`, not in this directory.
* **Thu Aug 20, Joann Video** is undecided. The calendar page says the angle,
  footage and caption are all still open.
* **Thu Aug 27, Four Decisions Every HCM Integration Needs** is still to record
  with Moe El-Abdallah.

## Renaming

Each project's renderer writes the calendar name itself, so a re-render lands on
the right filename with no manual step. When a film moves to a different date,
change the slot constant in that project's `render.mjs` (or the ffmpeg line in
the Academy README) and rename the existing file to match.
