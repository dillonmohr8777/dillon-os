---
tags: [concept, system]
source: "[[12_Brain/raw/2026-07-04 - obsidian-second-brain-article]]"
updated: 2026-07-04
---

# Second Brain Architecture

**Summary:** the vault is a codebase — the canonical brain lives under `12_Brain/` (never `1Z_Brain/`). raw/ is ground truth, entities/ and
concepts/ are compiled pages, INDEX.md is the front door, and every `[[link]]`
is an edge in a graph that gets stronger as it grows.

The agent's job is compiling: read new material in `12_Brain/raw/`, update the entity
and concept pages, link as it goes. Four writing rules (one lesson per file,
update don't duplicate, delete what's wrong, never touch raw/) live in the
root `CLAUDE.md` + `12_Brain/` layer.

Why it works: a search-based knowledge base gets noisier as it grows; a linked
wiki gets stronger, because every new page connects into the web and makes the
surrounding pages more useful. When answering, the agent walks links — client
page → campaign concept → competitor page — instead of scanning everything.

Key claims worth remembering (single-source, from the article — treat as
directional, not gospel):

- Accounting task accuracy: ~70% without client history → 85–90%+ with it.
- A mid-tier model with a good voice profile out-writes a frontier model
  with no profile. The files carry more of the result than the model tier.
- Anthropic's memory benchmark (deck-building game): Fable improved ~3× more
  than the previous flagship when given file-based memory. Vendor-run,
  unreplicated.

## Links

- Reading discipline: [[Context Economy]]
- Feeding it: [[Research Verification Loop]]
- Operations: [[12_Brain/System/Second Brain Ops|Second Brain Ops]]
