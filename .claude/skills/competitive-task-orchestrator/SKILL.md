---
name: competitive-task-orchestrator
description: Run Dillon OS daily competitive-task cycle. Launches 6 parallel intel agents then memory-consolidator. Use when asked to run the umbrella workflow, daily brief, or competitive task.
---

# Competitive Task Orchestrator

## When to use

- Daily 1:00 PM ET cron (`0 13 * * *`)
- User asks for competitive task brief, daily operator cycle, or umbrella workflow
- Replacing any of the 7 retired standalone crons

## Read first

1. `System/competitive-task-definition.md` — scope + P0 tie-break
2. `System/competitive-task-orchestrator-prompt.md` — full automation prompt

## Execution

### Phase 1 — Parallel (one message, multiple Task calls)

| Subagent | File |
|----------|------|
| gmail-intel | `.cursor/agents/gmail-intel.md` |
| slack-intel | `.cursor/agents/slack-intel.md` |
| vault-pulse | `.cursor/agents/vault-pulse.md` |
| codex-session-sync | `.cursor/agents/codex-session-sync.md` |
| domain-ads-seo | `.cursor/agents/domain-ads-seo.md` |
| content-routines | `.cursor/agents/content-routines.md` (Sun/Thu only) |

If Gmail/Slack MCP unavailable: use vault-fallback, do not fail the run.

### Phase 2 — Sequential

Invoke `memory-consolidator` (`.cursor/agents/memory-consolidator.md`) with all Phase 1 summaries.

Writes:
- `Daily-Briefs/competitive-task-today.md`
- `System/claude-memory-sync.md`
- `System/routine-health.md`

## Operator rules

- KJB emails CC: mjfrederick334@gmail.com, sean@needmomentum.com, melissarobinn@gmail.com
- Align HCM = full-time employer, not M360 client revenue
- P0: launch blocked > billing risk > ad disapprovals > calendar

## Related

- Runbook: `04_SOPs/competitive-task-orchestrator.md`
- Registration: `.cursor/automation/competitive-task-orchestrator.md`
