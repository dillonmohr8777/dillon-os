---
note_type: project
status: active
created: 2026-08-18
updated: 2026-08-18
owner: Dillon Mohr
finish_line: "IMMOHRTAL CLAW staged locally with harness tests green; no public GPT or host until Dillon approves."
next_action: "Run the local booth at http://127.0.0.1:4800 and decide whether to attach a live model or approve a Custom GPT later."
due: none
review_on: 2026-09-18
source_refs:
  - "[[12_Brain/01_Captures/research/2026-08-18 - research - IMMOHRTAL CLAW harness]]"
  - https://github.com/sipeed/picoclaw
  - immohrtal-claw/ARCHITECTURE.md
tags:
  - brain
  - project
  - immohrtal
  - agents
---

# IMMOHRTAL CLAW

**Summary:** Local PicoClaw-class booth harness with gig-scale disk memory. App and backend are staged. Publish to ChatGPT stays blocked.

Code: `immohrtal-claw/`. Start: `node server.js` → http://127.0.0.1:4800

This is not a copy of Sipeed's Go binary. It is the same loop (context → LLM → tools → session) with the 10MB RAM ceiling removed, IMMOHRTAL night-booth UI, and an OpenAI-compatible `/v1` draft for a later Custom GPT.

Approval card: attach a live model locally anytime; registering a GPT or public host needs an explicit yes.
