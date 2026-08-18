---
note_type: project
status: active
created: 2026-08-18
updated: 2026-08-18
owner: Dillon Mohr
finish_line: "IMMOHRTAL CLAW is a PicoClaw-class personal agent with vault knowledge, ten brains (Opus 5 then Grok 4.6), website chrome, and no music identity."
next_action: "Paste immohrtal-claw/CLAUDE-UPGRADE-PROMPT.md into Opus 5. Put ANTHROPIC_API_KEY then XAI_API_KEY in immohrtal-claw/.env. Pull local models on the box."
due: none
review_on: 2026-09-18
source_refs:
  - "[[12_Brain/01_Captures/research/2026-08-18 - research - IMMOHRTAL CLAW harness]]"
  - "[[12_Brain/01_Captures/research/2026-08-18 - research - IMMOHRTAL CLAW is not music]]"
  - https://github.com/sipeed/picoclaw
  - immohrtal-claw/ARCHITECTURE.md
tags:
  - brain
  - project
  - immohrtal
  - agents
---

# IMMOHRTAL CLAW

**Summary:** PicoClaw-class personal agent. The name is cool on purpose. It is not the album, not SESSION 001, and not a music booth.

Visual system matches the IMMOHRTAL website. Vault knowledge via `kb_search` / `kb_read`. Ten brains in Harness: five local open-weight, five cloud (Opus 5 first, Grok 4.6 second, Gemini as the fifth family). Exec stays staged-off. ChatGPT later.

Paste `immohrtal-claw/CLAUDE-UPGRADE-PROMPT.md` into Claude for the next quality pass.

Code: `immohrtal-claw/`. Start: `node server.js` → http://127.0.0.1:4800
