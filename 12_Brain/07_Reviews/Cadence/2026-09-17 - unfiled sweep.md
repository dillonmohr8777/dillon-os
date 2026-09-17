---
note_type: review
status: active
date: 2026-09-17
updated: 2026-09-17
cadence: daily
job: unfiled-sweep
tags:
  - review
  - cadence
  - filing
---

# Unfiled sweep - 2026-09-17

## Counts

| repo | untracked (collapsed entries) | untracked (files, `-uall`) |
| --- | --- | --- |
| `C:/Users/dillo/repos/dillon-os` | **11** | **617** |
| `C:/Users/dillo/Documents/Codex/projects/client-operations` | - | **64,034** |

client-operations breakdown:

| | count |
| --- | --- |
| untracked files total | 64,034 |
| under a `deliverables/` path | 59,290 |
| finished-shaped (`.pdf`, `.mp4`, `.png`, `.html`, README/DELIVERY markdown) | **17,797** |
| size of those finished-shaped files | **9.75 GB** |

Against yesterday: dillon-os 621 to 617 files; client-operations 64,009 to 64,034 entries, finished-shaped 17,814 to 17,797. The finished-shaped count went *down* 17 while the total went up 25. That is churn inside `deliverables/` - files replaced or renamed in place, not work disappearing. Worth one look if it repeats, not worth a flag today.

The 9.75 GB number has been flat within 0.02 GB for four days. Nothing is being filed and nothing is being lost.

## New arrivals since yesterday's run - 10

All ten are client deliverables written during yesterday's late session (mtime after 2026-09-16 09:00). **All four client ids resolve in `registry/clients.json`.**

### bar-crawl-usa - resolves to `clients/bar-crawl-usa` - 5 files

- `deliverables/2026-09-16-september-plan/Bar-Crawl-USA-September-2026-Plan.pdf`
- `deliverables/2026-09-16-september-plan/plan.html`
- `deliverables/2026-09-16-september-plan/site/optimize-15/index.html`
- `deliverables/2026-09-16-september-plan/site/plan-10/index.html`
- `deliverables/2026-09-10-andy-report/_spec_stripped.html`

A September plan with both a PDF and a rendered HTML, plus two site variants. This is a complete, client-shaped package sitting untracked.

### onsite-concrete-landscape - resolves to `clients/onsite-concrete-landscape` - 3 files

- `deliverables/2026-09-16-blinds-pivot-plan/Onsite-Plan-2026-09-16.pdf`
- `deliverables/2026-09-16-blinds-pivot-plan/plan.html`
- `deliverables/2026-09-16-conversion-action-audit/README.md`

A pivot plan in PDF and HTML, and a conversion-action audit. The audit answers a 2026-07-12 approval-queue gate for this same client ("approve technical or campaign changes after allowlisted crawl and conversion-action audit") that has been open 67 days. The evidence it was waiting on now exists on disk and is untracked.

### nexla - resolves to `clients/nexla` - 1 file

- `deliverables/2026-09-16-spend-and-conversion-integrity/README.md`

Pairs directly with today's new high-risk queue item on Nexla Smart Bidding training on spam.

### omega-landscaping - resolves to `clients/omega-landscaping` - 1 file

- `deliverables/2026-09-16-search-terms-audit/README.md`

A search-terms audit, produced daily rather than as the weekly `omega-search-terms` job - which has been ABSENT from the ledger since 2026-09-14 because Cadence-weekly has never fired.

## Read

Yesterday's late session produced four clients' worth of real deliverables and filed none of them. Two of them (onsite conversion-action audit, omega search terms) are the evidence that long-stalled approval items were explicitly waiting on. Untracked work that unblocks a 67-day-old decision is the most expensive kind of unfiled work there is.

## What this job did not do

Nothing committed, staged, moved, or deleted. Read-only, as specified. Committing 9.75 GB of unbacked media remains the wrong reflex - see the 2026-09-14 approval-queue entry on the backup destination.
