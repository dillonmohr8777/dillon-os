---
note_type: review
status: active
date: 2026-09-21
updated: 2026-09-21
cadence: daily
job: approval-queue-diff
source: System/approval-queue.md
tags: [review, approvals, cadence]
---

# Approval queue diff, 2026-09-21

Baseline: commit `990662a1` (2026-09-17), the last committed state of
`System/approval-queue.md` before today. Previous report in this series:
`2026-09-17 - approval queue diff.md`. The four-day gap is because the daily
cadence never fired on 09-18, 09-19 or 09-20; see today's heartbeat.

`approval-queue.md` was **not** modified by this job.

## Totals

| | Baseline 2026-09-17 | Now |
| --- | --- | --- |
| Open (unchecked) | 137 | **137** |
| Closed (checked, still in file) | 0 | **0** |
| Rotting (own date older than 2026-09-07) | 65 | **65** |

**Net zero. Eight added, eight removed, zero decided.** Seventh consecutive
report with no `[x]` anywhere in the file.

## Added since 2026-09-17, 8

| risk | item |
| --- | --- |
| **high** | **Google account password, ROTATE.** 2026-09-17. A password for `momentumlocalseo@gmail.com` was pasted into a Claude Code chat while asking for a Google login. Not used, not written to disk, but permanently in a transcript that syncs to Dillon's phone. This is the **second** pasted live secret in two days; the GoDaddy `gd_pat_` key from 09-16 is still open and unrotated directly above it. |
| **high** | **Google Ads probe OAuth token is dead.** 2026-09-21. `omega_terms_full.py` aborts on `invalid_grant` refreshing `google-ads.yaml`. Recovery needs a browser consent click, so no automated run can fix it. Measured consequence this week: `omega-search-terms` fell back to 09-16 on-disk evidence, and `revenue-exceptions` had **no SPEND source at all for any of 26 clients**. The `google-ads` MCP server is also down this session (`EUNKNOWN: uv_spawn`), so there is no second route. |
| **high** | **Tunnel endpoints P4/P9.** 2026-09-20. Approve or reject public tunnel endpoints before browser-evidence work is enabled; canary reads NOT-READY. |
| med | **HubSpot connector unauthorised.** 2026-09-21. Non-interactive runs cannot OAuth, so the CRM field reads "pending validation" for all 26 clients and no reconciliation completes. |
| med | **Omega proposed negatives, pages 1 to 5.** 2026-09-21. Proposed only, nothing applied. 32 terms took $356.13, 96.0% of spend, for zero conversions. Carries one item that must be said to the client before it happens: negating `pikes peak landscaping` will drop the reported conversion count from 2 to 1, because that is where one of the two conversions came from. Separately `concrete contractors colorado springs` took **$44.52 for a single click**. |
| med | **Bar Crawl USA pause response.** 2026-09-19. Andy asked about pausing work. Unanswered churn signal. |
| med | **IMMOHRTAL company outreach**, exact-recipient approval, `mail_ready=hold`. |
| med | **IMMOHRTAL preview LP deployment**, four queued pages, one preview still failing QA. |

## Closed since 2026-09-17, 0

No `[x]` line exists anywhere in the file.

## Removed without being decided, 8

All eight are Hermes Gateway items dated 2026-07-16 through 2026-07-30: two
soft-restart approvals, one `dispatcher_embedded=false` config change, and five
active-conflict-storm attributions. They were removed from the queue, not checked
off. The likely reason is the 09-16 finding that the gateway was never frozen and
the monitor was reading the wrong file (`ce3221c0`), which would make these eight
moot. That is plausible and probably correct, but **no decision was recorded**,
so from this file's point of view eight items vanished. Worth one line in the
commit next time.

## Rotting, 65 of 137 open, 47%

Unchanged count from 09-17, which is its own finding: the eight added this week
are all recent, and the eight removed were all old, so the rot total happens to
land in the same place. Every open item carries a leading date; none was guessed.

| band | count |
| --- | --- |
| 71 days (2026-07-12) | 20 |
| 70 days (2026-07-13) | 8 |
| 64-67 days (2026-07-16, 07-19) | 6 |
| 21-39 days (2026-08-13 to 08-31) | 16 |
| 15-20 days (2026-09-01 to 09-06) | 15 |

### Oldest first, the 2026-07-12 block, 20 items, 71 days

Kimberly James Bridal, Omega Landscaping & Concrete, On-Site Concrete &
Landscape, Replenish, Capsule & Tonic, Bar Crawl USA, Revive Systems, Hope
Wellness Center, Pro Fence & Deck, Everyday Life Insurance, VA Claims, Bridge
Software Development, plus eight more in the same shape.

Fourth consecutive report making the same observation. These twenty are not
twenty decisions. They are one unanswered question, who is authorised to approve
client-facing work and against what evidence, asked twenty times in per-client
phrasing. Answering it once closes 20 of the 65 rotting items.

## The pattern worth naming this week

Two live credentials pasted into chat transcripts in two days (GoDaddy 09-16,
Google password 09-17), both still open, both still unrotated five and four days
later. That is not a queue-length problem, it is the queue burying the only two
items on it with a clock running.

## What this job did not do

Nothing checked off, edited, reworded, reordered, or archived. Read-only, as
specified.
