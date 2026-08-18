---
tags: [raw, research, picoclaw, immohrtal, agents]
captured: 2026-08-18
method: "PicoClaw public architecture (DeepWiki + workspace files) mapped into a Node harness"
agent: cloud (cursor/immohrtal-claw-d550)
note_type: capture
status: compiled
created: 2026-08-18
updated: 2026-08-18
source_refs:
  - https://github.com/sipeed/picoclaw
  - https://github.com/sipeed/picoclaw/blob/main/workspace/AGENT.md
  - https://github.com/sipeed/picoclaw/blob/main/workspace/SOUL.md
  - https://deepwiki.com/sipeed/picoclaw/2-core-agent-architecture
---

# Raw receipts — IMMOHRTAL CLAW harness, 2026-08-18

Dillon: reverse-engineer PicoClaw, give it more capabilities and memory, build the app, stage backend, name it IMMOHRTAL CLAW. Publish to ChatGPT later, after the build.

## Receipt 1 — PicoClaw is MIT source, not a closed APK to crack

- Official repo `sipeed/picoclaw`. Workspace files: AGENT.md, SOUL.md, USER.md, MEMORY.md, skills.
- Loop: AgentLoop / ContextBuilder / ToolRegistry / SessionStore / SKILL.md.
- Product constraint they advertise: ~10MB RAM, $10 boards.
- Skeptic: SURVIVES. We do not vendor their Go tree. We map the loop.

## Receipt 2 — CLAW additions

- Node gateway + night-booth UI.
- Disk long-term JSONL with 8 GiB ceiling.
- 128k context, 16 tool iterations.
- Exec off. Path sandbox on.
- `/v1/chat/completions` staged, publish blocked.
- Skeptic: SURVIVES as a local stage, not a live GPT.

## Killed

- Publishing a Custom GPT in this pass.
- Copying PicoClaw crypto-scam domains.
- Unrestricted shell.
- Secrets in Git.
