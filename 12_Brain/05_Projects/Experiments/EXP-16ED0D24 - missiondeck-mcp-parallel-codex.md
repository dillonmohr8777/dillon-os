---
note_type: project
project_kind: experiment
experiment_id: EXP-16ED0D24
status: proposed
experiment_stage: intake
created: 2026-08-03
updated: 2026-08-03
owner: Dillon Mohr
area: automation
priority: normal
outcome: "Pass the acceptance contract for MissionDeck-mcp parallel Codex without weakening safety or existing capability."
next_action: "Spawn two worktree sessions via MCP; each completes independent template task; no cross-session mutation by non-owner; loopback-only; clean stop leaves no leaked tokens."
review_on: 2026-08-03
verification_status: unverified
risk: medium
source_refs:
  - "https://github.com/hermes-gadget/MissionDeck-mcp"
tags:
  - brain
  - project
  - experiment
  - automation
---

# MissionDeck-mcp parallel Codex

## Why this may matter

Local MCP + dashboard for multiple persistent Codex sessions/worktrees with ownership and quota controls; direct throughput lever for batch site work.

## Expected benefit

Higher parallel factory throughput with session isolation.

## Acceptance contract

- **Maker:** Unassigned implementation agent
- **Independent checker:** Manual audit of session logs and file diffs; confirm ownership enforcement.
- **Acceptance test:** Spawn two worktree sessions via MCP; each completes independent template task; no cross-session mutation by non-owner; loopback-only; clean stop leaves no leaked tokens.
- **Rollback:** systemctl/user stop services; remove .data directory; revert MCP config.
- **Human gate:** Confirm loopback and password before first start; no LAN expose.
- **Overlap:** Orchestrates Codex; does not replace skill content or Claude Code paths.

## Evidence

- https://github.com/hermes-gadget/MissionDeck-mcp

## Run history

- 2026-08-03: Added from Grok intelligence intake. No software installed or account authorized.
