---
note_type: review
status: active
date: 2026-09-22
updated: 2026-09-22
cadence: daily
job: approval-queue-diff
source: System/approval-queue.md
tags: [review, approvals, cadence]
---

# Approval queue diff, 2026-09-22

Previous report: `2026-09-21 - approval queue diff.md`. Baseline for this diff is
commit `d6f58335` (the 09-21 committed state, 138 open). `approval-queue.md` was
**not** modified by this job.

## Totals

| | 2026-09-21 | Now |
| --- | --- | --- |
| Open (unchecked) | 138 | **152** |
| Closed (`[x]`, still in file) | 0 | **0** |
| Rotting (own date older than 14 days) | 65 | **77** |

**Fourteen added, zero removed, zero decided.** Eighth consecutive report with no
`[x]` anywhere in the file. The queue is now growing faster than it did last week
and nothing has ever been closed in it.

## Added since 2026-09-21, 14

Thirteen of the fourteen come from one source: the 2026-09-21 DeerFlow /
Momentum Workspace block. One is from the AI Division lane.

| risk | item |
| --- | --- |
| **high** | **Credential rotation, two more live secrets.** 2026-09-21. An OpenRouter key pasted in chat 2026-09-18 ($16.73 already spent on it) and the DeerFlow account password pasted in chat 2026-09-21 03:40. Both unrotated. |
| **high** | **Machine PSU / unclean shutdowns.** 2026-09-21. Six unclean shutdowns since 09-17 (one each on 17, 18, 19, 20, and 21). Each kills every running agent session. Explicitly noted as unfixable in software. |
| med | **Post-0030 rollback hazard.** Once the new gateway image starts against the live DB, migration 0030 applies and the previous image refuses to start (`bootstrap.py:697 unknown revision`). A pre-deploy volume backup is mandatory. |
| med | **s09b memory scoping, still unmerged.** Full backend suite stalled 8+ minutes at ~46% and was killed at 22:00 ET. A process-wide `strict_user_scope` flip will not ship on a partial gate. |
| med | **Two VETO WINDOWS opened under delegation.** Claude approved the milestone-1 paper palette (13/13 contrast pairs pass) and chose Fraunces over Playfair Display; separately flipped the signed-out funnel to default to the paper treatment. Both are decided-unless-vetoed, not pending-until-approved. This is a different item shape from everything else in the queue and it has a clock on it. |
| med | **Command Center paper skin deployed but never seen.** S05, merged `0a256148`, behind the existing appearance radio. No agent has a workspace login and the layout redirects signed-out, so nothing has visually verified it. Needs a human to open Appearance and look. |
| med | **Email Mac Frederick** to schedule a 30-minute D01/D04/D07/D10/D18 decision call. Client message only, no outbound activation. The only item dated 2026-09-22. |
| med | **Docker Desktop AutoStart.** Currently false; cost roughly 40 minutes of downtime on 09-21 and killed a Codex session. Containers are already `restart=unless-stopped`, so this is the last gap. |
| low | **OpenRouter credit at $0.02 of $25.** The Luna and Spark tiers cannot fire. The $983 key cap is a cap, not money. |
| low | Pillow declaration in `backend/pyproject.toml` — two entries, the second marking the first **SUPERSEDED**: Pillow 12.3.0 is already present transitively in the live image and logo upload executes. Still worth declaring so a rebuild cannot drop it. |
| low | Paper-treatment token palette approval when the specimen page arrives, and the post-milestone-3 decision on whether the signed-out funnel keeps the paper default. |

## Closed since 2026-09-21, 0

No `[x]` line exists anywhere in the file.

## Removed, 0

Nothing vanished this time. Last week's eight silent Hermes removals were not
repeated.

## Rotting, 77 of 152 open, 51%

Every open item carries a leading date; none was inferred. The rot share crossed
half the queue for the first time.

| band | age | count |
| --- | --- | --- |
| 2026-07-12 | 72 days | 20 |
| 2026-07-13 | 71 days | 8 |
| 2026-07-16 | 68 days | 3 |
| 2026-07-19 | 65 days | 3 |
| 2026-08-13 to 08-31 | 22-40 days | 16 |
| 2026-09-01 to 09-06 | 16-21 days | 15 |
| 2026-09-07 | 15 days | 12 |

### Oldest first, the 2026-07-12 block, 20 items, 72 days

Kimberly James Bridal, Omega Landscaping & Concrete, On-Site Concrete &
Landscape, Replenish, Capsule & Tonic, Bar Crawl USA, Revive Systems, Hope
Wellness Center, Pro Fence & Deck, Everyday Life Insurance, VA Claims, Bridge
Software Development, and eight more in the same shape.

Fifth consecutive report making the same observation. These twenty are one
question — who is authorised to approve client-facing work, and against what
evidence — asked twenty times in per-client phrasing. Answering it once closes 20
of the 77.

### New this report: the 2026-09-07 band just aged in

Twelve items crossed the 14-day line since yesterday. That is where most of the
+12 in the rot count came from, not from new neglect.

## The pattern worth naming today

**Four live credentials are now sitting in this queue unrotated**: the GoDaddy
`gd_pat_` key (09-16), the `momentumlocalseo@gmail.com` password (09-17), the
OpenRouter key (09-18, $16.73 already spent), and the DeerFlow account password
(09-21). Four pastes in six days, none rotated, the oldest six days old. Last
week's report called two of these "the only two items on the queue with a clock
running". It is now four, and the rate is accelerating.

The queue has also never closed a single item in eight reports. A queue with no
close path is a log, not a queue.

## What this job did not do

Nothing checked off, edited, reworded, reordered, or archived. Read-only, as
specified.
