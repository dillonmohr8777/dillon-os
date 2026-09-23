---
note_type: review
status: active
date: 2026-09-23
updated: 2026-09-23
cadence: daily
job: unfiled-sweep
tags: [review, cadence, filing]
---

# Unfiled sweep, 2026-09-23

Previous run: 2026-09-22 (08:11).

## Counts

| repo | untracked (collapsed) | untracked (files, `-uall`) |
| --- | --- | --- |
| `C:/Users/dillo/repos/dillon-os` | **124** (was 110) | **1,334** (was 1,318) |
| `C:/Users/dillo/Documents/Codex/projects/client-operations` | **3,509** (was 3,502) | **64,262** (was 64,249) |

client-operations breakdown:

| | 2026-09-22 | now |
| --- | --- | --- |
| untracked files total | 64,249 | **64,262** |
| under a `deliverables/` path | 59,458 | **59,469** |
| finished-shaped (`.pdf`, `.mp4`, `.png`, `.html`, README/DELIVERY markdown) | 17,834 | **17,864** |

dillon-os +16 files, none under `deliverables/`.

Note on the finished-shaped count: +30 against only 3 files newer than the last
report. The other 27 are older-mtime files that became untracked or newly
matched since yesterday (for example a move or checkout that preserved mtimes).
Not investigated further; flagged so the jump is not read as 30 new deliverables.

## New arrivals since the last run: 3 files, 115 KB

One deliverable, written 2026-09-22 17:40:

`clients/onsite-concrete-landscape/deliverables/2026-09-22-blinds-competitor-audit-chatgpt/`

| file | size |
| --- | --- |
| `Onsite-Blinds-Competitor-Audit-and-ChatGPT-Ads-2026-09-22.pdf` | 103,574 B |
| `audit.html` | 15,010 B |
| `README.md` | 407 B |

Client: **`onsite-concrete-landscape`**, resolves in
`client-operations/registry/clients.json`. Not present in the 09-22 report.

A competitor audit plus ChatGPT Ads piece for a "blinds" line under the
On-Site Concrete & Landscape client id. Blinds is not concrete or landscaping:
either On-Site has a blinds business or this was filed under the wrong client.
A human should confirm the routing before it is sent anywhere.

## What this job did not do

Nothing committed, staged, moved, or deleted in either repo. Report only.
