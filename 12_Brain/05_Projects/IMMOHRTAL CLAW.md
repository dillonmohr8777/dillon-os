---
note_type: project
status: active
created: 2026-08-18
updated: 2026-08-18
owner: Dillon Mohr
finish_line: "IMMOHRTAL CLAW is a PicoClaw-class personal agent with sourced vault retrieval, an always-on operator front door, streaming across every brain, a second-brain checker, and no music identity."
next_action: "Put ANTHROPIC_API_KEY in immohrtal-claw/.env, restart CLAW, press Probe live brains, then add XAI_API_KEY so second_opinion has a second family."
due: none
review_on: 2026-09-18
source_refs:
  - "[[12_Brain/01_Captures/research/2026-08-18 - research - IMMOHRTAL CLAW harness]]"
  - "[[12_Brain/01_Captures/research/2026-08-18 - research - IMMOHRTAL CLAW is not music]]"
  - "[[12_Brain/01_Captures/2026-08-18 - CLAW retrieval and readiness upgrade]]"
  - https://github.com/sipeed/picoclaw
  - immohrtal-claw/ARCHITECTURE.md
tags:
  - brain
  - project
  - immohrtal
  - agents
---

# IMMOHRTAL CLAW

**Summary:** PicoClaw-class personal agent. The name is cool on purpose. It is
not the album, not SESSION 001, and not a music booth.

Visual system matches the IMMOHRTAL website. Ten brains in Harness: five local
open-weight, five cloud (Opus 5 first, Grok 4.6 second, Gemini as the fifth
family). Exec stays staged-off. ChatGPT hosting is later.

Code: `immohrtal-claw/`. Start: `node server.js` then http://127.0.0.1:4800

## Current state, 2026-08-18

Branch `cursor/immohrtal-claw-d550`. `node --test tests/harness.test.js` passes
33 tests, up from 15.

### Live

- **Retrieval.** `kb_search` is BM25 with title, heading, and recency boosts,
  reading `updated:` from frontmatter. Generated maps are excluded unless
  asked for. An mtime cache keeps repeat searches near 45ms against the real
  vault. Every hit explains its own score in a `why` field.
- **`kb_open`.** Returns the smallest sourced excerpt for a question with a
  `path:line` citation, instead of an 80k dump. `kb_read` is now the fallback.
- **Front door.** Every turn compiles roughly 900 tokens from `INDEX.md`,
  `System/operating-status.md`, `System/approval-queue.md` (titles only, since
  the file is ~95KB) and this note. Cached 60s, degrades to a message rather
  than killing a turn.
- **Streaming.** Anthropic, OpenAI, xAI, Gemini, and Ollama all stream tokens
  into the paper UI as `llm.delta`, with tool events preserved. Opus caches the
  system block. SSE sets `x-accel-buffering: no` so the tunnel does not buffer
  it into one late blob on the phone.
- **Readiness.** The picker shows every brain as ready or not ready with the
  real blocker attached. `Probe live brains` does a live reachability check.
- **`second_opinion`.** Routes a consequential claim to a different model
  family. With no second family ready it says so instead of pretending.
- **`brief_write`.** The only write path into the vault, scoped to
  `Daily-Briefs/` only, and it refuses paths, subdirectories, empty bodies, and
  silent overwrites.
- **Memory.** Refuses to persist credentials, compiles a deduplicated daily
  tape, and keeps pinned preferences short because pinned memory rides in every
  prompt.
- **Skills.** 18 modules. New: inbox-triage, client-pulse, gbp-content-drafts,
  report-builder. Each carries when-to-use, tools, stop conditions, and an
  approval boundary.

### Still rehearsal

- No cloud key is on the box, so every cloud brain reads not ready and CLAW runs
  the rehearsal provider. The streaming and checker paths are verified against
  recorded provider streams, not against live Opus or Grok.
- `calendar-read` and `browser-read` are written and gated on
  `CLAW_CALENDAR_API_KEY` / `CLAW_CDP_URL`. The gates work; the transports are
  not built. They stay out of the prompt until wired, so CLAW does not advertise
  them.

### Known on this box

None of the five catalog Ollama tags are pulled. The box has near misses
(`gemma4:26b`, `gemma4:31b-cloud`, `qwen3-coder:30b`, `qwen3.5:27b-q4_K_M`).
Tag matching is now exact on purpose: `gemma4:31b-cloud` used to satisfy
`gemma4:31b` and then 404 on the first real call. Either pull the exact tags or
point the catalog at what is already installed with the `CLAW_*_MODEL`
overrides in `.env`.

## Boundaries that did not move

Exec is staged-off and throws even when flagged. No send, publish, deploy, or
spend from CLAW. Gate cookie still required when `CLAW_GATE_TOKEN` is set.
`12_Brain/private/` and `.env` remain unreadable through the knowledge
allowlist.
