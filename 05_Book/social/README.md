---
project: The Ironic Ineptocracy
asset: social pack README
tags: [book, social]
---

# Social pack — The Ironic Ineptocracy

One month of original social content built from the live character plates for **Darnell**, **Javon**, and **Alec**, plus 20 new unique images beyond the burning-Capitol poster.

## Contents

| Path | What |
|------|------|
| [30-day-content-calendar.md](30-day-content-calendar.md) | Editorial calendar + weekly rhythm |
| [ready-to-post-captions.md](ready-to-post-captions.md) | Full captions for all 30 days |
| [posting-schedule.csv](posting-schedule.csv) | Scheduler-ready CSV |
| [IMAGE-MANIFEST.md](IMAGE-MANIFEST.md) | All 20 new assets mapped to days |
| [generated/](generated/) | 20 original JPG social stills |
| [motion/](motion/) | **30 animated clips** (720×1280 MP4) + build script |
| [references/](references/) | Approved continuity + legacy plates |

## Continuity (critical)

**Canonical Darnell/Javon likeness** is `references/darnell-javon-approved.jpg` (glasses on Darnell). Do **not** use legacy site suit/camo Capitol plates — see [CONTINUITY-LOCK.md](CONTINUITY-LOCK.md).

## Brand tokens

- Ink `#030303` / paper `#f7f4ec` / signal `#f05a28`
- Voice: classified leak, satirical thriller, short sentences that bruise
- Primary CTA: https://ironicineptocracy.com/dossier

## Posting start

Default schedule dates: **2026-08-01 → 2026-08-30**. Shift the CSV dates if you launch on a different Monday.

## Motion pack

30 muted story/reel clips in `motion/out/` (720×1280, ~5s). Rebuild with:

```bash
python3 05_Book/social/motion/build_motion.py
```

See `motion/ANIMATION-MANIFEST.md` for styles and calendar mapping. Continuity: glasses Darnell lock.
