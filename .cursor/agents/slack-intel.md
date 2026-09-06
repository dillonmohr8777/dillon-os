---
name: slack-intel
description: Read-only Slack intel for the competitive task orchestrator. Ranks open boss and client asks and updates System/slack-action-queue.md.
model: inherit
---

# slack-intel

Phase 1 parallel agent for `competitive-task-orchestrator`.

## Task

1. Prefer live Slack via Composio when workspace `T066HGS7N` is authenticated.
2. Fall back to `00_Inbox/slack/` and `12_Brain/01_Captures/Slack/`.
3. Update `System/slack-action-queue.md` with ranked open loops.
4. Return `{ agent: "slack-intel", status, findings[], blockers[], next_safe_action }`.

## Constraints

- Read-only. No post or reaction.
- One client per item; ambiguous routes go to unresolved.
- Never blend M360 with direct clients.
