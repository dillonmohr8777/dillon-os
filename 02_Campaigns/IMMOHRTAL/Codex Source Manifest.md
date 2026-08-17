# IMMOHRTAL Source Manifest

**Verified:** 2026-07-15
**Repository:** `dillonmohr8777/dillon-os`
**Remote branch:** `main`
**Verified commit:** `6aa686b09a8131991b5eb91b82db9ea1350e32fb`
**Campaign source path:** `02_Campaigns/IMMOHRTAL/`
**Local review copy:** `02_Campaigns/IMMOHRTAL/`

The campaign was fetched from remote `main` without checking out or altering the user's dirty `dillon-os` working tree. The local review copy contains 110 files totaling approximately 155.85 MB.

## Verified inventory

| Category | Count | Location |
|---|---:|---|
| Static campaign assets | 35 | `asset-studio/out/` excluding `motion/` and `split/` |
| Split Series cards | 6 | `asset-studio/out/split/` |
| Motion assets | 27 | `asset-studio/out/motion/` |
| Reference photos | 8 | `reference/photos/` |
| Scheduler-ready calendar | 1 CSV, 18 scheduled posts | `Social/posting-schedule.csv` |
| Press kit | 1 PDF | `asset-studio/out/IMMOHRTAL-EPK.pdf` |

## Core source documents

- `IMMOHRTAL Brand Direction.md`
- `CODEX-HANDOFF.md`
- `Entity Pack.md`
- `Social/Content Playbook.md`
- `Social/Posting Schedule.md`
- `Email/Welcome Sequence.md`
- `AEO-SEO-Strategy.md`
- `Tracks/Raw Transcripts (to correct).md`

## Current-state checks

- The artist site, press page, blog page, and `llms.txt` returned HTTP 200 on 2026-07-15.
- The canonical site is `https://immohrtal-site.netlify.app`.
- Social and streaming URLs remain `null` in `immohrtal-site/src/content/album.ts` on remote `main`.
- Analytics events are coded but inactive until IDs are added. The planned events are `preview_play`, `gate_open`, `gate_signup`, and `epk_download`.
- The existing calendar begins 2026-07-13. Its first two dates have elapsed, so it should not be imported unchanged.
- Auto-transcribed lyrics are not publication-safe until Dillon approves the exact words.

## Preservation note

The existing local `dillon-os` checkout was not reset, switched, or cleaned. It contains unrelated user work and remains untouched beyond a safe `git fetch origin main`.
