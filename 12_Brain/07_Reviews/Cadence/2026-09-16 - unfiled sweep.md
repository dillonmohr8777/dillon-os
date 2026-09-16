---
note_type: review
status: active
date: 2026-09-16
updated: 2026-09-16
cadence: daily
job: unfiled-sweep
tags:
  - review
  - deliverables
  - cadence
---

# Unfiled sweep - 2026-09-16

## Counts

| repo | untracked entries (dirs collapsed) | untracked FILES (`-uall`) | prev run |
| --- | --- | --- | --- |
| `repos/dillon-os` | 14 | **621** | 577 |
| `Codex/projects/client-operations` | 3,423 | **64,009** | 3,394 entries |

**Read the file column, not the entry column.** `git status --porcelain` collapses
an untracked directory into one line, so dillon-os looks like it fell from 577 to
14 overnight. It did not: all 14 collapsed entries are this morning's automation
output, and the true file count went **up** 577 → 621. Nothing was filed; the
shape of the untracked set changed.

dillon-os's 14 entries are all dated today and all machine-generated - four
`12_Brain/queue/*.jsonl` run logs, two daily briefs, an operating brief, a
communications capture, a communication-intelligence review, a browser-evidence
folder, an incoming COMMS json, a radar batch folder, and two agent proposals
(`Claude/2026-09-16-daily-driver-approval-package.md`,
`Cursor/immohrtal-crew-2026-09-16.md`). Routine, not deliverables.

client-operations: **59,267** of the 64,009 untracked files sit under a
`deliverables/` path, of which **17,814** are finished-shaped (`.pdf`, `.mp4`,
`.png`, `.html`, or a README/DELIVERY markdown). Yesterday: 17,726. **+88.**

## New arrivals since the last run - 57 files, 35.8 MB

Filtered by mtime after 2026-09-15 09:59, the previous run's timestamp. Two
clients, both of which resolve in `registry/clients.json`.

### BOK Law Firm - `bok-law-firm`, status active - 41 files, ~33 MB

A complete weekly social packet, `clients/bok-law-firm/deliverables/2026-09-15-weekly-social-w38/`.
Finished, not in progress: it carries its own `DELIVERY.md` (4,995 B, written
10:51) and `README.md`, eight separate graphics, four preview page sets, six
generated scene assets at ~1.6 MB each, and two PDFs -
`This-Week-With-BOK-2026-W38.pdf` (6.96 MB) and an email variant (476 KB).

**Registry caveat, because this one is a known trap:** the BOK record carries
`affiliationConstraints: [{relation: "not-client-of", organizationId:
"momentum-360", confidence: 1.0, observedAt: "2026-07-16"}]`. BOK is an active
client record with its own folder, but it is **not** a Momentum 360 portfolio
client, and its `portfolioOwner` is recorded as `unknown`. Anything that rolls
this delivery into a Momentum client count is wrong. Also worth noting:
`lastEvidenceAt` on the record is still `2026-07-14` while a full packet shipped
into the folder yesterday, so the registry's evidence date is two months stale
against its own disk.

### Momentum 360 - `momentum-360`, status active - 16 files, ~2.8 MB

Three separate pieces of work, all untracked:

- `deliverables/2026-09-15-organic-proof-asset/` - `index.html` (21 KB) plus a
  built `site/index.html` (38 KB, written 01:02 today) and a logo asset.
- `deliverables/2026-09-15-attribution-proof/raw/live-serp/` - a Playwright SERP
  capture, `playwright__taco-and-tequila-bar-crawl__2026-09-15.png` (184 KB).
  This is evidence for an attribution claim and currently exists in one place.
- `deliverables/2026-09-12-dedicated-agents/org-modes/brand/` - two complete icon
  sets at 20/48/192/512 (`momo-bot-*`, `momentum-answers-*`), three brand
  renders in `gen/`, and a `render.html`.

## The unchanged fact underneath

**17,814 finished deliverable files are untracked in client-operations and there
is still no off-device destination.** That number has gone up every day this job
has run: 17,774 → 17,726 → 17,814. The 2026-09-14 approval-queue entry naming a
backup destination is still open, and as of this morning's diff job the two
migration items that were attached to it have been relocated into
`approval-queue-archive.md` undecided - so the loudest version of this problem is
now outside the file anything reads.

Nothing was committed, staged, moved, or deleted by this job.
