---
note_type: review
status: active
date: 2026-09-17
updated: 2026-09-17
cadence: daily
job: approval-queue-diff
source: System/approval-queue.md
tags:
  - review
  - approvals
  - cadence
---

# Approval queue diff - 2026-09-17

Baseline: commit `984a18c7` (2026-09-16 09:07), the committed state immediately after yesterday's run. It reads **129** open; yesterday's report said 128, a one-line drift from the queue append that run made against itself. Working tree today reads **136**. `approval-queue.md` was **not** modified by this job.

## Totals

| | Baseline 2026-09-16 | Now |
| --- | --- | --- |
| Open (unchecked) | 129 | **136** |
| Closed (checked, still in file) | 0 | **0** |
| Rotting (own date older than 2026-09-03) | 60 | **65** |

**Net +7. Zero items closed. Third consecutive day with nothing decided.**

Two clean things this pass, both firsts in this report's short history: **nothing was removed from the queue, and nothing was relocated to the archive undecided.** The 09-15 and 09-16 runs each flagged still-open items being moved out of the file without a decision. That did not happen today.

## Added since yesterday - 7

All seven are dated 2026-09-16 and all came out of yesterday's late session. Every one is gated on a human action, not on more analysis.

| risk | item |
| --- | --- |
| **high** | **GoDaddy API key - ROTATE.** A `gd_pat_` key was pasted into a Claude Code chat on 09-16. Not used, not written to disk, but it is now permanently in a transcript that syncs to Dillon's phone. Rotate at developer.godaddy.com/keys, reset as Windows user env var. |
| **high** | **Nexla - Smart Bidding is training on spam.** Live budget burn. Generic conversion event plus captcha-off form means every junk submission teaches the model to buy worse traffic. Diagnosed 2026-09-09, still unpublished. $365.95 in a week, zero real conversions, and the damage compounds. |
| med | **Client registry - five clients have no route.** look-alive, capsule-and-tonic, everyday-life-insurance, green-slate-masonry need records; nine more active clients have empty `slackChannels` despite live named channels. |
| med | **GT Clinic - access request email** to Ghazala Farooqui MD. Corrected scope: SiteGround/WordPress admin, domain/DNS, Search Console owner plus GA4. Does not re-ask for GBP, does not reopen Ads billing. |
| med | **Momentum Agent Console - go public.** cloudflared tunnel login (human-only browser auth), real hostname, Cloudflare Access policy before the hostname goes live. |
| low | **GT Clinic - GBP owner grant has no written record.** Owner access reportedly already granted; no document anywhere records it. |
| low | **Momentum Console - D1 sync token scope.** Add D1 Edit to `CLOUDFLARE_API_TOKEN`; the workflow is on main and starts working the moment the scope exists. |

## Closed since yesterday - 0

No `[x]` lines exist anywhere in the file. The queue has had zero checked items since 2026-09-15.

## Removed without being decided - 0

Clean pass.

## Rotting - 65 of 136 open (48%)

Up from 60 (47%). Every open item carries a leading date; none had to be guessed.

| band | count |
| --- | --- |
| 67 days (2026-07-12) | 20 |
| 66 days (2026-07-13) | 8 |
| 60-63 days (2026-07-16 to 07-19) | 10 |
| 49-54 days (2026-07-25 to 07-30) | 4 |
| 21-35 days (2026-08-13 to 08-31) | 16 |
| 16-17 days (2026-09-01 to 09-02) | 7 |

### Oldest first - the 2026-07-12 block, 20 items, 67 days

Kimberly James Bridal, Omega Landscaping & Concrete, On-Site Concrete & Landscape, Replenish, Capsule & Tonic, Bar Crawl USA, Revive Systems, Hope Wellness Center, Pro Fence & Deck, Everyday Life Insurance, VA Claims, Bridge Software Development, plus eight more in the same shape.

This is the third consecutive report to make the same observation, so it is worth stating flatly: these twenty are **not twenty decisions**. They are one unanswered question - who is authorised to approve client-facing work, and against what evidence - asked twenty times in per-client phrasing. Nothing in this block will move until that one question is answered, and answering it would close 20 of the 65 rotting items in a single stroke.

## Shape of the growth

Six days of data now. Open count 110 (09-14 baseline) to 114 to 128 to 136. Items are added at roughly 7-18 a day and closed at 0. The queue is not a queue; it is an append-only log. The two high-risk additions today (a live credential to rotate, a live budget burning on a known-bad signal) are exactly the kind that get buried when the file grows 7 a day.

## What this job did not do

Nothing checked off, edited, reworded, reordered, or archived. Read-only, as specified.
