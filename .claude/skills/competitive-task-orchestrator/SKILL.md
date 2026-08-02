---
name: competitive-task-orchestrator
description: Umbrella daily operator cycle — parallel intel agents (Gmail, Slack, vault, sessions, ads, content) then one consolidated brief. Replaces 7 legacy crons.
---

# Competitive Task Orchestrator

Run the full daily operator cycle. Work only from this vault.

Read `System/competitive-task-orchestrator-prompt.md` and follow it exactly:

1. **Phase 1 — parallel:** invoke gmail-intel, slack-intel, vault-pulse, codex-session-sync, domain-ads-seo, and content-routines (if day-gated) as subagents.
2. **Phase 2 — sequential:** invoke memory-consolidator with all Phase 1 summaries.

Required outputs:

- `Daily-Briefs/competitive-task-today.md` (today's date)
- `System/claude-memory-sync.md` (`last_sync` = today)
- `System/routine-health.md` (`last_orchestrator_run` = today)
- `System/urgent-replies.md` and `System/slack-action-queue.md` when intel lanes run

Apply P0 tie-break from `System/competitive-task-definition.md`. If Gmail or Slack MCP is unavailable, use vault fallback — do not fail the run.
