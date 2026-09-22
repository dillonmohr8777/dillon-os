---
note_type: review
status: active
date: 2026-09-22
updated: 2026-09-22
cadence: daily
job: unfiled-sweep
tags: [review, cadence, filing]
---

# Unfiled sweep, 2026-09-22

Previous run: 2026-09-21.

## Counts

| repo | untracked (collapsed) | untracked (files, `-uall`) |
| --- | --- | --- |
| `C:/Users/dillo/repos/dillon-os` | **110** | **1,318** |
| `C:/Users/dillo/Documents/Codex/projects/client-operations` | 3,502 | **64,249** |

client-operations breakdown:

| | 2026-09-21 | now |
| --- | --- | --- |
| untracked files total | 64,214 | **64,249** |
| under a `deliverables/` path | 59,427 | **59,458** |
| finished-shaped (`.pdf`, `.mp4`, `.png`, `.html`, README/DELIVERY markdown) | 17,828 | **17,834** |

dillon-os went 1,265 to 1,318 untracked files, +53 in one day — normal daily
agent output, and the first day-over-day figure that is not a four-day catch-up.
None of it sits under a `deliverables/` path.

## New arrivals since the last run, 30 files, 3.5 MB

One event, not thirty: the weekly client report build that ran on the evening of
2026-09-21. Fifteen clients, two files each — the PDF written at 19:34 and the
`report.html` written at 20:49, both into
`deliverables/2026-09-21-weekly-report-2026-09-14-to-2026-09-20/`.

| client id | registry | PDF | HTML |
| --- | --- | --- | --- |
| `omega-landscaping` | resolves | 178 K | 17 K |
| `onsite-concrete-landscape` | resolves | 206 K | 15 K |
| `kimberly-james-bridal` | resolves | 74 K | 15 K |
| `nexla` | resolves | 56 K | 15 K |
| `replenish-7-eleven` | resolves | 120 K | 13 K |
| `revive-systems` | resolves | 190 K | 12 K |
| `bar-crawl-usa` | resolves | 1,319 K | 14 K |
| `bridge-software` | resolves | 51 K | 13 K |
| `va-claims-edge` | resolves | 143 K | 13 K |
| `pritzker-law-group` | resolves | 135 K | 10 K |
| `puttery-nyc` | resolves | 50 K | 13 K |
| `pro-fence-deck` | resolves | 57 K | 10 K |
| `hope-wellness-center` | resolves | 200 K | 10 K |
| `fresh-blends-kwik-trip` | resolves | 77 K | 11 K |
| **`capsule-and-tonic`** | **DOES NOT RESOLVE** | 438 K | 11 K |

### Two things in that table

**`capsule-and-tonic` has a built weekly client report and no registry record.**
Fourteen of the fifteen ids resolve against the 28 entries in
`registry/clients.json`; this one does not. A client-facing PDF and HTML page
were generated for an id the canonical roster does not know. That is the same
shape the approval queue has been carrying since 2026-07-12 ("is Capsule & Tonic
a current client, yes or no") and since 2026-09-14
(`status: pending-registry-reconciliation`) — except the question is no longer
theoretical, because the deliverable now exists.

**`pro-fence-deck` produced both files anyway.** The 09-21 ledger records
`weekly-client-reports` as `failed` with
`bin/archive.py ... KeyError: 'pro-fence-deck'`. The build clearly got far enough
to write the PDF and the HTML; only the archive step died. The failure is in the
`VAULT_FOLDER` map in `weekly-reports/bin/archive.py`, not in the report itself.

## Read

Yesterday's signal, the two untracked email drafts from 09-18
(`gt-clinic/2026-09-18-access-request-email/` and
`deborah-mara/2026-09-18-lead-status-email/`), is still untracked and still
unsent, now four days old. Nothing new has surfaced it.

Today's signal is a single unresolvable client id on a finished, client-facing
report.

## What this job did not do

Nothing committed, staged, moved, or deleted. Read-only, as specified. The
finished-shaped pile in client-operations is still 17,834 files with no approved
backup destination; see the 2026-09-14 approval-queue entry. Committing it
remains the wrong reflex.
