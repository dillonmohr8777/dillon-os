---
name: competitive-task-orchestrator
description: Umbrella daily commander — spawns six parallel intel agents, consolidates into one ranked competitive-task board. Replaces morning loop, slack-intake, client-pulse, am-report, plan-today, and inbox-brief crons.
---

# Competitive Task Orchestrator

One automation. Six parallel scouts. One ranked board. Replaces seven legacy crons.

## When to run

- Daily at 1:00 PM UTC via Cursor Automation cron (`0 13 * * *`)
- On demand when Dillon says "run competitive task" or "what's my competitive task today"

## Prerequisites

1. Read `System/competitive-task-definition.md` for P0 tie-break and output contract.
2. Read `AGENTS.md` and `11_Agents/Master Agent.md`.
3. Ensure `Daily-Briefs/lanes/` exists (create if missing).

## Steps

### Phase 0 — Preflight

1. Record `started_at` (ISO timestamp) and today's date `YYYY-MM-DD`.
2. Read `Dashboard.md`, `System/OS Config.md`, and the newest file in `Daily-Briefs/`.
3. Create run folder metadata path: `12_Brain/state/competitive-task-orchestrator.json`.

### Phase 1 — Parallel swarm (all six at once)

Launch **six** Task subagents **in a single message** (parallel). Each reads its agent definition in `.cursor/agents/<lane>.md` and writes:

`Daily-Briefs/lanes/YYYY-MM-DD-<lane>.md`

| Lane | Agent file | Fallback when MCP unavailable |
|------|------------|-------------------------------|
| gmail-intel | `.cursor/agents/gmail-intel.md` | `12_Brain/01_Captures/Gmail/`, client notes, `Daily-Briefs/source-intake-*.md` |
| slack-intel | `.cursor/agents/slack-intel.md` | `00_Inbox/slack/`, `12_Brain/01_Captures/Slack/` |
| vault-pulse | `.cursor/agents/vault-pulse.md` | `01_Clients/` frontmatter + modified times |
| codex-session-sync | `.cursor/agents/codex-session-sync.md` | `10_Sessions/`, `handoffs/` |
| domain-ads-seo | `.cursor/agents/domain-ads-seo.md` | `12_Brain/state/site-health-sentinel.json`, client agent memory |
| content-routines | `.cursor/agents/content-routines.md` | `03_Content/`, client content calendars |

**Do not proceed to Phase 2 until all six lane files exist** (or explicitly failed with a noted blind spot).

### Phase 2 — Consolidate (sequential)

Launch one `memory-consolidator` Task subagent (`.cursor/agents/memory-consolidator.md`).

Inputs: all six lane files + `System/competitive-task-definition.md`.

Outputs:

1. `Daily-Briefs/competitive-task-today.md` — sections:
   - **P0 today** — ranked 1–5 with one-line reason and source lane
   - **Boss requests** — open Slack asks (omit if none)
   - **Client movement** — moving / watch / stalled
   - **Blocked** — billing, hosting, launch, auth
   - **Content cadence** — what's due this week
   - **Codex / session carryover** — unfinished threads from sessions
   - **Deliberately not today** — what got cut
   - **Blind spots** — MCP gaps, stale vault dates

2. Update `Dashboard.md` `## Today` with top 3 P0 items (unchecked, replace stale generics).

### Phase 3 — State + commit

Write `12_Brain/state/competitive-task-orchestrator.json`:

```json
{
  "automation_id": "competitive-task-orchestrator",
  "run_date": "YYYY-MM-DD",
  "started_at": "...",
  "completed_at": "...",
  "lanes": {
    "gmail-intel": "ok|fallback|failed",
    "slack-intel": "ok|fallback|failed",
    "vault-pulse": "ok",
    "codex-session-sync": "ok",
    "domain-ads-seo": "ok",
    "content-routines": "ok",
    "memory-consolidator": "ok"
  },
  "p0_count": 3,
  "legacy_crons_replaced": 7
}
```

Commit all artifacts. Open PR if on a feature branch.

## Boundaries

- **Never** send email, post Slack, deploy, purchase credits, or change ad accounts.
- **Never** fabricate messages when MCP is down — use vault fallback and flag blind spots.
- **Never** run legacy skills (`/am-report`, `/client-pulse`, etc.) as separate passes in the same run.
- Tier 2 actions appear on the board as "prepared, needs Dillon" — not executed.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Slack MCP auth error | Fall back to `00_Inbox/slack/` + captures; note in blind spots |
| Gmail MCP unavailable | Fall back to `12_Brain/01_Captures/Gmail/` + `source-intake-*.md` |
| Lane agent times out | Write partial lane file with `status: partial`; consolidator proceeds |
| Empty P0 list | Check P0 tie-break in definition; surface stalled clients with billing risk |
