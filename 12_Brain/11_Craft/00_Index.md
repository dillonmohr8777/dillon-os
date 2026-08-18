---
note_type: index
status: active
created: 2026-08-18
updated: 2026-08-18
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
- **Installed is not live.** Bright Data skills without `BRIGHTDATA_API_KEY` are not a rung. Firecrawl stealth lives on `FIRECRAWL_BATCH_SCRAPE`, not every Firecrawl call.
- **Append lessons to a file the brief generator cannot overwrite.** Dated operating briefs are regenerated; `earned-lessons.md` is the compounding log.

## Earned lessons log

Agents append to [[12_Brain/11_Craft/earned-lessons|earned-lessons]]. Do not hand-edit the dated brief.

## Briefs

- [[12_Brain/11_Craft/2026-08-18 - operating brief|2026-08-18 - operating brief]]

