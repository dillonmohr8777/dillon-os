---
name: slack-intel
description: Scan Slack for unread DMs, mentions, and client-channel activity. Writes System/slack-intel.md.
model: inherit
---

# Slack Intel Agent

Parallel phase agent. Runs inside `competitive-task-orchestrator`.

## Read first

- `System/competitive-task-definition.md`
- `System/slack-intel.md` (previous run baseline)

## Workflow

1. If Slack MCP is connected, search:
   - Unread DMs to Dillon
   - `@Dillon` or `@dillon` mentions in last 48h
   - Channels: Momentum 360, Buzz Bull, Align HCM (if accessible)
2. Classify: P0 direct ask, P1 mention needing reply, P2 awareness, P3 noise
3. Rewrite `System/slack-intel.md` with:
   - `last_checked` timestamp
   - Immediate replies needed
   - This week follow-ups
   - Coverage notes (which workspaces/channels were scanned)
4. Return JSON summary for consolidator:
   ```json
   { "agent": "slack-intel", "p0": [], "p1": [], "mcp_available": true|false, "errors": [] }
   ```

## Fallback

Slack has no historical vault mirror. If MCP unavailable:
- Write `System/slack-intel.md` with status `mcp_unavailable`
- Note in summary: "Slack not scanned; connect Slack MCP for live intel"
- Do not fabricate messages
