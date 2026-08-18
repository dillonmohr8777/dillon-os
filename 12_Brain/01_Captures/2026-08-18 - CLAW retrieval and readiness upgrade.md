---
note_type: capture
status: active
created: 2026-08-18
updated: 2026-08-18
owner: Dillon Mohr
area: agents
source_refs:
  - immohrtal-claw/src/models.js
  - immohrtal-claw/src/knowledge.js
  - immohrtal-claw/src/memory-store.js
  - "[[12_Brain/05_Projects/IMMOHRTAL CLAW]]"
tags:
  - brain
  - capture
  - agents
  - retrieval
---

# CLAW retrieval and readiness upgrade

Three things learned building the CLAW quality pass that generalise past this
agent.

## Prefix-matching a model tag is a silent liar

CLAW checked Ollama readiness with
`tags.some(t => t === want || t.startsWith(want))`. The box holds
`gemma4:31b-cloud`, which prefix-matches `gemma4:31b`. So the picker showed
Gemma as **ready**, the checker picked it as a second opinion, and the call
404'd with `model 'gemma4:31b' not found`.

A readiness check that is loose in the permissive direction is worse than no
check: it converts a clear "not installed" into a confusing runtime failure at
the worst moment. Match identity exactly; treat a bare name as `:latest`.

The same shape shows up anywhere a near-miss identifier is treated as a match:
model tags, account ids, client folder names, campaign names.

## Retrieval quality is mostly about what you exclude

Moving `kb_search` from token-overlap to BM25 helped, but the two changes that
actually made results usable were **exclusions**, not scoring:

- Drop auto-generated maps by default (`generated: true` in frontmatter). They
  are dense keyword rollups, so they beat real notes on raw term frequency
  while carrying no new information.
- Boost title and heading matches above body frequency. A note *about* a topic
  beats a note that merely mentions it forty times.

Recency from `updated:` breaks ties in the right direction in a vault where
notes are superseded rather than deleted.

Also: returning the smallest sourced excerpt with a `path:line` citation
(`kb_open`) beats returning the whole note. An 80k dump is not retrieval, it is
context laundering, and it makes citation optional.

## An agent that can write anywhere will eventually write somewhere wrong

The report-builder needed to write into `Daily-Briefs/`. The lazy move would
have been widening the existing file tools to the vault. Instead it got one
narrow tool that only accepts a bare `.md` filename, only targets
`Daily-Briefs/`, and refuses silent overwrite.

Worth keeping as the default shape: widen a trust boundary with a new
purpose-built hole, never by loosening an existing general one.

Related: `memory_write` now refuses credential-shaped text. Pinned memory rides
in **every** prompt, so a token pinned once is re-sent to every provider on
every turn. The guard uses known key shapes and labelled assignments, not
generic entropy, because rejecting git SHAs would just train a workaround.
