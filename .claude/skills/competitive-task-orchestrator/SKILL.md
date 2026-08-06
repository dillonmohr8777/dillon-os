---
name: competitive-task-orchestrator
description: One umbrella daily loop — parallel scouts across Gmail, Slack, vault, Codex sessions, ads/SEO, and content; writes Daily-Briefs/competitive-task-today.md.
---

# Competitive Task Orchestrator

Replaces seven legacy morning crons with one parallel workflow. Full definition:
`System/competitive-task-definition.md`. Automation prompt:
`System/competitive-task-orchestrator-prompt.md`.

## When to run

- Daily at ~09:00 ET via Cursor Automation (`0 13 * * *` UTC)
- On demand when Dillon asks "what's my competitive task today?"
- After a heavy Codex session to resync priorities

## Steps

1. Read `System/competitive-task-definition.md` and `System/OS Config.md`.
2. Create today's run folder under `automation-runs/competitive-task-orchestrator/YYYY-MM-DD/`.
3. **Parallel (Tier 0)** — launch all six scouts; each writes to `lane-outputs/`:
   - `.cursor/agents/gmail-intel.md`
   - `.cursor/agents/slack-intel.md`
   - `.cursor/agents/vault-pulse.md`
   - `.cursor/agents/codex-session-sync.md`
   - `.cursor/agents/domain-ads-seo.md`
   - `.cursor/agents/content-routines.md`
4. **Sequential** — run `.cursor/agents/memory-consolidator.md` to merge lanes.
5. Write `Daily-Briefs/competitive-task-today.md` and update `Dashboard.md` `## Today`.
6. Set `run-state.json` to `complete`.

## Boundaries

- Read and draft only. Sends, Slack posts, deploys, and spend are Tier 2.
- Gmail/Slack MCP preferred; vault mirrors are fallback — always label the source.
- Do not duplicate `/vault-compile` or weekly `/research-sweep` — those stay on their own cadence.

## Output quality bar

- P0 list ≤ 5 items, ranked with evidence
- Every boss ask names who asked and how long it's been open
- Honest about stale vault dates and MCP gaps
- Under 80 lines in the daily brief
