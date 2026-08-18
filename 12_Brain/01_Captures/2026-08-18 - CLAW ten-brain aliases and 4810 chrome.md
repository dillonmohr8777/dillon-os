---
note_type: capture
status: active
created: 2026-08-18
updated: 2026-08-18
owner: Dillon Mohr
area: agents
source_refs:
  - immohrtal-claw/src/models.js
  - immohrtal-claw/web/styles.css
  - "[[12_Brain/05_Projects/IMMOHRTAL CLAW]]"
  - "[[12_Brain/01_Captures/2026-08-18 - CLAW retrieval and readiness upgrade]]"
tags:
  - brain
  - capture
  - agents
  - models
---

# CLAW ten-brain aliases and 4810 chrome

Two operating facts from the 4810 pass.

## Exact aliases are a allowlist, not a prefix

A workstation often holds a near-miss tag (`gemma4:26b`, `qwen3-coder:30b`)
instead of the catalog canonical. The correct fix is an exact alias list, then
call the tag that actually exists. Prefix matching is still forbidden:
`gemma4:31b-cloud` is not `gemma4:31b`. Some near-misses are also the wrong
model family: `qwen3.5:27b-q4_K_M` answers with empty `content` on the OpenAI
path because the text lives in a reasoning field, so it must never alias to
Qwen3.6.

## Default listen port is 4810

`CLAW_PORT` wins, then `PORT`, then 4810. Older 4800 notes are stale unless
something is still bound there on purpose.
