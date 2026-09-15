---
note_type: index
status: active
created: 2026-08-18
updated: 2026-09-15
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

[[12_Brain/11_Craft/earned-lessons|earned-lessons]] - **11** recorded, append-only.
Agents write there. Never into a generated brief.

## Briefs

- [[12_Brain/11_Craft/2026-08-19 - operating brief|2026-08-19 - operating brief]]
- [[12_Brain/11_Craft/2026-08-18 - operating brief|2026-08-18 - operating brief]]

Generated briefs are only as fresh as `12_Brain/queue/claude-loop-*.jsonl`, and that
writer stopped on 2026-08-18. Any brief dated after that is counting August. Read
`newest_receipt_day` before you read the tables — see proposal 1 in the 2026-09-15
review below.

## Daily learning reviews

Hand-written nightly passes over what the estate did and what its machinery got wrong.
Unlike the briefs above, these are not generated and are safe to edit.

- [[12_Brain/11_Craft/2026-09-15 - daily learning review|2026-09-15 - daily learning review]]

Earlier reviews (2026-09-03 through 2026-09-10) exist only on unmerged branches —
PRs #363, #368, #373, #380, #384, #388, #395. They are not readable from `main`.

