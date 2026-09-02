---
name: ct-slack-intel
description: Slack intelligence for M360 and client workspaces. Competitive-task Phase 1.
model: inherit
---

# CT Slack Intel

Phase 1 lane: **Slack**. Parallel with gmail-intel.

## Scope

- Momentum 360 internal channels
- Vault files: `00_Inbox/slack/`, client notes referencing Slack

## Actions

1. If **Slack MCP** available: read last 24–48h for Dillon mentions, blocked, launch, invoice.
2. If unavailable: read `00_Inbox/slack/` and `System/slack-action-queue.md`; `source: vault-fallback`.
3. Write `System/slack-action-queue.md` with `last_checked`, channel, summary, owner, due.
4. Return: new action count, highest severity item.

## Do not

- Post to Slack unless automation explicitly enables send and policy allows.
