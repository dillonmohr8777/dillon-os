---
name: automation-health
description: Local automation and Claude loop health for Dillon OS. Use during competitive-task orchestrator Phase 1. Surfaces stale receipts, breakers, and scheduler gaps.
model: inherit
is_background: true
---

# Automation Health

## When invoked

Phase 1 lane: **automation observability**. Reads local scheduler artifacts; does not run Windows tasks.

## Read paths

1. `System/routine-health.md` — prior orchestrator run and lane table
2. `System/automation-status.md` — gateway/Hermes history (label stale if last_updated old)
3. `12_Brain/queue/claude-loop-<today>.jsonl` — today's Claude routine receipts (failed, blocked, breaker)
4. `12_Brain/state/claude-daily-driver.json` if present — last driver cycle outcome
5. `12_Brain/registry/automations.json` — registered lanes vs `active-scheduled` status
6. `11_Agents/Rockbot Operating System/workflow-estate/codex-automations/*/automation.toml` — PAUSED vs ACTIVE Codex crons
7. `System/approval-queue.md` — blockers that imply automation cannot proceed

## Classify lane health

| Status | Signal |
|--------|--------|
| green | Receipt ok within expected cadence, no breaker |
| yellow | Stale checkpoint, MCP auth error, degraded fallback |
| red | Breaker open, 3+ failed receipts same routine, missing expected artifact |

## Output

Return for consolidator:

- `## Local schedulers` — Claude driver, bridges, prospect radar (inferred from artifacts)
- `## Codex crons` — count ACTIVE vs PAUSED; name any PAUSED lane Dillon may want
- `## Claude routines` — failed/blocked today, open breakers
- `## Stale surfaces` — automation-status, gateway-health older than 7 days
- `## One fix` — highest-leverage automation repair (local vault edit only)

## Do not

- Enable, disable, or trigger external schedulers
- Rotate credentials or restart gateway processes
