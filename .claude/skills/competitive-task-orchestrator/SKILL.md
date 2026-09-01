---
name: competitive-task-orchestrator
description: Umbrella daily operator cycle — parallel intel agents (Gmail, Slack, vault, sessions, ads, content) then one consolidated brief. Replaces 7 legacy crons.
---

# Competitive Task Orchestrator

Run the full daily operator cycle. Work only from this vault.

Read `System/competitive-task-orchestrator-prompt.md` and follow it exactly:

1. **Phase 0 — preflight:** `node _os/automation/bin/competitive-task-orchestrator.js --preflight --date YYYY-MM-DD`
2. **Phase 1 — parallel:** invoke scout lanes (max 8) — gmail-intel, slack-intel, vault-pulse, codex-session-sync, domain-ads-seo, websites, outreach, and content-routines (if day-gated).
3. **Phase 2 — sequential:** invoke memory-consolidator with all Phase 1 summaries.

Profile: `_os/automation/profiles/competitive-task-orchestrator.json`

Required outputs:

- `Daily-Briefs/competitive-task-today.md` (today's date)
- `System/claude-memory-sync.md` (`last_sync` = today)
- `System/routine-health.md` (`last_orchestrator_run` = today)
- `System/urgent-replies.md` and `System/slack-action-queue.md` when intel lanes run

Apply P0 tie-break from `System/competitive-task-definition.md`. If Gmail or Slack MCP is unavailable, use vault fallback — do not fail the run.
