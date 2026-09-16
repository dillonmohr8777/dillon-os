---
note_type: review
status: active
date: 2026-09-16
updated: 2026-09-16
cadence: daily
job: approval-queue-diff
source: System/approval-queue.md
tags:
  - review
  - approvals
  - cadence
---

# Approval queue diff - 2026-09-16

Compared against the previous run, `2026-09-15 - approval queue diff.md`, using
the committed state of `System/approval-queue.md` that run actually measured
(`aa67eb19`, 2026-09-14 19:32) as the baseline. That commit reads 114 open,
matching yesterday's report exactly, so the baseline is sound.
`approval-queue.md` was **not** modified by this job.

## Totals

| | Baseline 2026-09-15 | Now |
| --- | --- | --- |
| Open (unchecked) | 114 | **128** |
| Closed (checked, still in file) | 1 | **0** |
| Rotting (own date older than 14 days) | 51 | **60** |

**Net +14 open. Nothing was closed in place. Second consecutive day with zero
items decided.** Arithmetic: 114 open, minus 4 removed, plus 18 added = 128.

## The headline: a git merge resurrected 8 archived items

13 of the 18 "added" items are not new work. They are **older items that came
back into the file**, and the cause is traceable to one commit.

| commit | time | open count | Hermes items present |
| --- | --- | --- | --- |
| `fd75d710` | 09-15 10:27 | 112 | 0 |
| `121bf052` **merge origin/main** | 09-15 11:01 | **123** | **8** |
| `581091f6` | 09-15 15:19 | 127 | 8 |

`121bf052` is titled "merge origin/main into the working branch". It added 11 open
items in one step, including eight July Hermes Gateway items (dated 2026-07-16
through 2026-07-30) that the 2026-09-14 closing pass had archived - `ea79f0a2`
carried only one Hermes mention, and every commit from `aa67eb19` to `fd75d710`
carried zero.

So the queue is now the union of a branch where those items were archived and a
branch where they were not. `origin/main` never received the archival. Until those
branches reconcile, **every closing pass on the working branch can be undone by
the next merge**, which is a worse failure than the queue simply being long.

The other resurrections in the same shape: `2026-09-01` Prospect Radar Worker
deploy, `2026-09-01` With Not For repo creation, `2026-09-05` registry retirement
patch, `2026-09-05` Netlify Shadow HVAC cleanup.

## Genuinely new since yesterday - 5 items

All arrived from `Daily-Briefs/predicted-work-2026-09-15.md` and one agent
proposal. All are gated on a human decision, none on more analysis.

| date | item | risk |
| --- | --- | --- |
| 2026-09-15 | **Momentum 360 / CallRail** - restore direct CallRail membership, one controlled unanswered after-hours test call per line | high |
| 2026-09-15 | **Revive Systems** - human Google OAuth gate for the exact HighLevel location, then publish, test lead path, submit sitemap | high |
| 2026-09-15 | **Tags 2 Go** - obtain or restore agency-admin access to the Google Ads account, capture a redacted health baseline | high |
| 2026-09-15 | **BigOrange Marketing** - factual sign-off, invoice recipient, due date, payment timing before publishing the WordPress pilot | med |
| 2026-09-15 | **Cindy May Christmas** - client message to resolve video destination, newsletter, photo map, Shopify prerequisites, or reschedule | med |
| 2026-09-16 | **Agent Infrastructure** - enable Frontier synthesis with `-EnableFrontier`; model spend stays gated | med |

## Closed since yesterday - 0

One `[x]` line left the file (the weekly-report auto-publish capability
announcement), but it was a standing-capability notice rather than a pending
approval, and it moved to the archive rather than being decided. **Zero open items
were resolved.**

## Removed from the queue without being decided - 4

Same pattern the 2026-09-15 run flagged: still-open items relocated to
`System/approval-queue-archive.md`. Verified present in the archive, verified
absent from the queue, verified never checked off.

- `2026-07-12` Shadow Heating & Cooling - site deployment and spend change after Meta access verification (Risk: high)
- `2026-07-12` Shadow HVAC - catch-up report to Mike after LSA verification (Risk: medium)
- `2026-09-14` Migration - private GitHub remote for `website-design-engine`, `momentum-design-system`, `momentum-slack-agent` (Risk: high)
- `2026-09-14` Migration kit - private repo for `mac-mini-handoff` (Risk: low)

The archive now carries 0 unchecked items by checkbox, because relocation strips
the checkbox state. **Moving an undecided item into an archive makes it
undecidable, not decided.** The two migration items are the ones with a hardware
deadline attached ("BEFORE THE MAC ARRIVES") and they are now outside the file
anything reads.

## Rotting - 60 of 128 open (47%)

Counted by each item's own leading date against a 2026-09-02 cutoff. Up from 51
yesterday, and the share is up from 45% to 47%.

By age band:

| band | count |
| --- | --- |
| 66 days (2026-07-12) | 21 |
| 65 days (2026-07-13) | 7 |
| 58-62 days (2026-07-16 to 07-19) | 11 |
| 48-53 days (2026-07-24 to 07-30) | 15 |
| 16-46 days (2026-08-01 to 09-01) | 6 |

A wider read of the prompt - any date appearing anywhere in the item text - gives
**69**, because two Kimberly James Bridal and Bar Crawl USA items quote April
approval dates inside otherwise-July items. The KJB Wedding Dress Timeline has now
been "approved 2026-04-13, pending publish" for **156 days**.

### The 15 oldest, oldest first

| 2026-07-12 | 66 | Bar Crawl USA - Approve publish after current-event hub and Boos & Booze SEO QA; do not alter ticketing or source data - Risk: medium |
| 2026-07-12 | 66 | Book funnel - Configure and test lead-capture delivery before production deployment - Risk: high |
| 2026-07-12 | 66 | Bridge Software Development - Approve client-facing milestone after Phase 1 ownership board and compliance review - Risk: medium |
| 2026-07-12 | 66 | Capsule & Tonic - Approve optimization only after platform conversions reconcile to real leads - Risk: high |
| 2026-07-12 | 66 | Everyday Life Insurance - Approve launch changes after 404 and site QA; approve links before acquisition - Risk: medium |
| 2026-07-12 | 66 | Hope Wellness Center - Approve external response and any added graphic-design scope after request analysis - Risk: low |
| 2026-07-12 | 66 | Kimberly James Bridal - Approve completion update after FAQ desktop image crop and responsive QA; verify appointment-source reconciliat |
| 2026-07-12 | 66 | Omega Landscaping & Concrete - Approve account changes only after Google/Meta call, form, and lead-quality attribution is verified - Ri |
| 2026-07-12 | 66 | On-Site Concrete & Landscape - Approve technical or campaign changes after allowlisted crawl and conversion-action audit - Risk: medium |
| 2026-07-12 | 66 | Pro Fence & Deck - Approve future LSA work separately; current lane is SEO only - Risk: medium |
| 2026-07-12 | 66 | Replenish - Confirm recurring fifth dashboard slot; approve any new location, budget, or campaign change - Risk: high |
| 2026-07-12 | 66 | Revenue - Verify current invoices or contracts for all 14 active clients before publishing MRR - Risk: low |
| 2026-07-12 | 66 | Revive Systems - Approve paid-media option and any publish action after the 48-hour recovery brief - Risk: high |
| 2026-07-12 | 66 | VA Claims - Approve client review after VACE design reconciliation; backend and DNS changes remain gated - Risk: medium |
| 2026-07-12 | 66 | [Bar Crawl USA] -- Approve clearance of 2 disapproved ads (Halloween/Fall Cocktail) and audit PMax for Presence Only + tCPA guardrail;  |

Fifteen of the twenty-one 66-day items are the original `2026-07-12` per-client
approval gates - one per client, all phrased "approve X only after Y is
verified". None has moved in 66 days. They are not really twenty-one decisions;
they are one unanswered question about who is authorised to approve client-facing
work, asked twenty-one times.

## What this job did not do

Nothing was checked off, edited, reworded, reordered, or archived by this run.
Read-only, as specified.
