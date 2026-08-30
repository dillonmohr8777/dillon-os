---
name: slack-intel
description: Slack intelligence for M360 and client workspaces. Use during competitive-task orchestrator Phase 1. Extracts action items to slack-action-queue.
model: inherit
is_background: true
---

# Slack Intel

## When invoked

Phase 1 lane: **Slack**. Parallel with gmail-intel and vault-pulse.

## Scope

- Momentum 360 internal channels (client escalations, billing, launches)
- Any client-shared Slack Connect threads referenced in vault notes

## Actions

1. If **Slack MCP** is available: read last 24–48h for mentions of Dillon, "blocked", "launch", "disapprov", "invoice", "urgent".
2. If MCP unavailable: read `System/slack-action-queue.md` if present; else note `source: vault-fallback` and infer from `System/claude-memory-sync.md`.
3. Write or update `System/slack-action-queue.md`:
   - `last_checked: YYYY-MM-DD`
   - Bullets: channel, summary, owner, due hint
4. Return consolidator summary: count of new actions, highest severity item.

## Do not

- Post to Slack unless automation explicitly enables Send to Slack tool and user policy allows it.
