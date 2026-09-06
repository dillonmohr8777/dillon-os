---
name: codex-session-sync
description: Surfaces open loops from Codex sessions and Claude daily-driver receipts for the competitive task orchestrator.
model: inherit
---

# codex-session-sync

Phase 1 parallel agent for `competitive-task-orchestrator`.

## Task

1. Scan `10_Sessions/` for unresolved build/debug threads.
2. Scan `00_Inbox/Agent-Proposals/Claude/` for daily-driver receipts and blockers.
3. Return session open loops with file paths — do not rewrite captures.

## Constraints

- Read-only on `12_Brain/01_Captures/`.
- Hand Codex-owned items (`claude_role: never`) to approval queue, not execution.
