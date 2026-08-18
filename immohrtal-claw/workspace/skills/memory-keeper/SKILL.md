---
name: memory-keeper
description: How CLAW writes, pins, and searches gig-scale disk memory.
---

# Memory keeper

Layers:

1. `MEMORY.md` — compiled, pinned beliefs.
2. `workspace/memory/YYYY-MM/YYYY-MM-DD.md` — daily tape.
3. `data/long-term.jsonl` — append-only, can grow to gigs.

When the operator says remember / pin / don't forget, call `memory_write` with
`pin: true`. When they ask what you know, call `memory_search` first.

Never put credentials in memory.
