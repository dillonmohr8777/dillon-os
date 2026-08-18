---
note_type: project
status: active
created: 2026-08-18
updated: 2026-08-18
owner: Dillon Mohr
finish_line: "IMMOHRTAL CLAW is a PicoClaw-class personal agent with sourced vault retrieval, an always-on operator front door, streaming across every brain, a second-brain checker, and no music identity."
next_action: "On the Windows box: printf ANTHROPIC_API_KEY into immohrtal-claw/.env, node server.js, open http://127.0.0.1:4810, Probe live brains, one who-are-you turn. Then XAI_API_KEY for Grok / second_opinion."
due: none
review_on: 2026-09-18
source_refs:
  - "[[12_Brain/01_Captures/research/2026-08-18 - research - IMMOHRTAL CLAW harness]]"
  - "[[12_Brain/01_Captures/research/2026-08-18 - research - IMMOHRTAL CLAW is not music]]"
  - "[[12_Brain/01_Captures/2026-08-18 - CLAW retrieval and readiness upgrade]]"
  - "[[12_Brain/01_Captures/2026-08-18 - CLAW ten-brain aliases and 4810 chrome]]"
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

Code: `immohrtal-claw/`. Start: `node server.js` then http://127.0.0.1:4810
(`CLAW_PORT` wins, then `PORT`, then 4810).

## Current state, 2026-08-18

Branch `cursor/immohrtal-claw-d550`. Harness tests cover aliases, Sol/Grok
wiring, default port, and the chrome brain deck.

### Live (code)

- **Ten-brain catalog.** Locals: Qwen3.6 27B, Gemma 4 31B, Qwen3-Coder, Llama 4
  Scout, DeepSeek V4 Flash. Cloud: Opus 5, GPT-5.6 Sol, Grok 4.6, Composer 2.5,
  Gemini 2.5 Pro. The rail is a card deck, not only a `<select>`.
- **Exact aliases.** `gemma4:26b` may stand in for Gemma 31B. `qwen3-coder:30b`
  may stand in for Qwen3-Coder. Prefixes still fail: `gemma4:31b-cloud` is not
  `gemma4:31b`. `qwen3.5:27b-q4_K_M` is not Qwen3.6.
- **Retrieval, front door, streaming, checker, memory, brief_write** as of the
  earlier quality pass.
- **browser-read.** CDP transport exists. Registers only when `CLAW_CDP_URL` or
  `BOX_CDP_URL` is set. Read-only; same SSRF guard as `web_fetch`.
- **UI.** Paper/chrome. IBM Plex Sans for thread copy, Anton chrome wordmark,
  3D hover on nav/mark/cards, thinking chip that counts seconds.

### Still rehearsal on this cloud VM

- No Anthropic / OpenAI / xAI / Gemini key on this box, so Opus, Sol, Grok, and
  Gemini stay not-ready. No live cloud call was made. Zero Align HCM quota spent.
- No Ollama on this VM, so local brains are configured and shown with blockers,
  not live-verified here. Dillon's Windows box already verified `gemma4:26b` and
  `qwen3-coder:30b`.
- **calendar-read** still gated. No `CLAW_CALENDAR_API_KEY` on the box.

### Boundaries that did not move

Exec is staged-off and throws even when flagged. No send, publish, deploy, or
spend from CLAW. Gate cookie still required when `CLAW_GATE_TOKEN` is set.
`12_Brain/private/` and `.env` remain unreadable through the knowledge
allowlist.
