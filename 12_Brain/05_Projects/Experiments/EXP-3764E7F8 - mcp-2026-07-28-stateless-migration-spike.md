---
note_type: project
project_kind: experiment
experiment_id: EXP-3764E7F8
status: proposed
experiment_stage: intake
created: 2026-08-01
updated: 2026-08-01
owner: Dillon Mohr
area: automation
priority: normal
outcome: "Pass the acceptance contract for MCP 2026-07-28 stateless migration spike without weakening safety or existing capability."
next_action: "Single request succeeds with no session header; independent auth validates; one multi-round-trip elicit works; old client rejected cleanly"
review_on: 2026-08-01
verification_status: unverified
risk: medium
source_refs:
  - "https://blog.modelcontextprotocol.io/posts/2026-07-28/"
  - "https://aaif.io/blog/mcp-is-growing-up"
tags:
  - brain
  - project
  - experiment
  - automation
---

# MCP 2026-07-28 stateless migration spike

## Why this may matter

Core protocol change enabling scalable, session-free tool servers for factory agents

## Expected benefit

Easier multi-instance MCP, better auth/audit, future compatibility

## Acceptance contract

- **Maker:** Unassigned implementation agent
- **Independent checker:** Second SDK client + request log review by human
- **Acceptance test:** Single request succeeds with no session header; independent auth validates; one multi-round-trip elicit works; old client rejected cleanly
- **Rollback:** Pin previous SDK and dual-run old server for 12-month window
- **Human gate:** true
- **Overlap:** all existing MCP servers

## Evidence

- https://blog.modelcontextprotocol.io/posts/2026-07-28/
- https://aaif.io/blog/mcp-is-growing-up

## Run history

- 2026-08-01: Added from Grok intelligence intake. No software installed or account authorized.
