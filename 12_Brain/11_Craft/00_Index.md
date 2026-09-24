---
note_type: index
status: active
created: 2026-08-18
updated: 2026-09-23
source_refs: []
tags: [craft, index]
---

# Agent Craft

How to build the infrastructure this operating team runs on, learned from what this
estate actually does. Briefs are generated daily from the loop receipts; lessons that
repeat get promoted into `12_Brain/03_Concepts/` and linked back here.

## Standing lessons

- **`blocked` is usually healthy.** Most blocks are `G6_dedupe`: the routine already ran today. Read `G5_stale_source` and `G8_circuit_breaker` instead.
- **A driver that reports `noop` cannot distinguish "nothing to do" from "everything is stuck."** The receipt log is the only honest signal.
- **A fail-closed probe pointed at a source nothing writes is not caution, it is a dead routine.** Verify something actually produces the state a gate reads.
- **One unapproved input must not sink a finished batch.** Collect refusals per item; never let item 20 discard items 1-19.
- **Untracked code that a scheduler runs is the highest-risk code in an estate.** Source belongs in git; artifacts do not.
- **A generated file and its generator drift.** Fix the generator, then verify it reproduces the committed output before regenerating.

## Earned lessons

[[12_Brain/11_Craft/earned-lessons|earned-lessons]] - **22** recorded, append-only.
Agents write there. Never into a generated brief.

Loop learn output, last 14 day(s): **11** concrete lesson(s), **168** explicit no-finding(s), **1** promotion candidate(s). Recorded per execution in the loop receipts; the latest brief lists them.

## Reviews

Hand-written passes over the generated briefs and the loop that produces them.
Unlike the briefs, these are not generated and may be edited.

- [[12_Brain/11_Craft/2026-09-23 - daily learning review|2026-09-23 - daily learning review]] - the diagnosis lane works, the installation lane does not: 137 open PRs, zero merges since 2026-09-17, and the replacement routine prompts still unpasted after eighteen days.

## Briefs

- [[12_Brain/11_Craft/2026-09-15 - operating brief|2026-09-15 - operating brief]]
- [[12_Brain/11_Craft/2026-09-14 - operating brief|2026-09-14 - operating brief]]
- [[12_Brain/11_Craft/2026-09-13 - operating brief|2026-09-13 - operating brief]]
- [[12_Brain/11_Craft/2026-09-12 - operating brief|2026-09-12 - operating brief]]
- [[12_Brain/11_Craft/2026-09-11 - operating brief|2026-09-11 - operating brief]]
- [[12_Brain/11_Craft/2026-09-10 - operating brief|2026-09-10 - operating brief]]
- [[12_Brain/11_Craft/2026-09-09 - operating brief|2026-09-09 - operating brief]]
- [[12_Brain/11_Craft/2026-09-08 - operating brief|2026-09-08 - operating brief]]
- [[12_Brain/11_Craft/2026-09-07 - operating brief|2026-09-07 - operating brief]]
- [[12_Brain/11_Craft/2026-09-06 - operating brief|2026-09-06 - operating brief]]
- [[12_Brain/11_Craft/2026-09-05 - operating brief|2026-09-05 - operating brief]]
- [[12_Brain/11_Craft/2026-09-04 - operating brief|2026-09-04 - operating brief]]
- [[12_Brain/11_Craft/2026-09-03 - operating brief|2026-09-03 - operating brief]]
- [[12_Brain/11_Craft/2026-09-02 - operating brief|2026-09-02 - operating brief]]
- [[12_Brain/11_Craft/2026-09-01 - operating brief|2026-09-01 - operating brief]]
- [[12_Brain/11_Craft/2026-08-31 - operating brief|2026-08-31 - operating brief]]
- [[12_Brain/11_Craft/2026-08-30 - operating brief|2026-08-30 - operating brief]]
- [[12_Brain/11_Craft/2026-08-29 - operating brief|2026-08-29 - operating brief]]
- [[12_Brain/11_Craft/2026-08-28 - operating brief|2026-08-28 - operating brief]]
- [[12_Brain/11_Craft/2026-08-27 - operating brief|2026-08-27 - operating brief]]
- [[12_Brain/11_Craft/2026-08-26 - operating brief|2026-08-26 - operating brief]]
- [[12_Brain/11_Craft/2026-08-25 - operating brief|2026-08-25 - operating brief]]
- [[12_Brain/11_Craft/2026-08-24 - operating brief|2026-08-24 - operating brief]]
- [[12_Brain/11_Craft/2026-08-23 - operating brief|2026-08-23 - operating brief]]
- [[12_Brain/11_Craft/2026-08-22 - operating brief|2026-08-22 - operating brief]]
- [[12_Brain/11_Craft/2026-08-21 - operating brief|2026-08-21 - operating brief]]
- [[12_Brain/11_Craft/2026-08-20 - operating brief|2026-08-20 - operating brief]]
- [[12_Brain/11_Craft/2026-08-19 - operating brief|2026-08-19 - operating brief]]
- [[12_Brain/11_Craft/2026-08-18 - operating brief|2026-08-18 - operating brief]]

