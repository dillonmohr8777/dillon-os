---
tags: [sop, automation, competitive-task]
status: active
created: 2026-08-06
owner: Dillon Mohr
source: "[[System/competitive-task-definition]]"
---

# Competitive Task Orchestrator — runbook

## What it is

One daily automation that runs six parallel scouts (Gmail, Slack, vault pulse, Codex sync, ads/SEO, content) and merges them into `Daily-Briefs/competitive-task-today.md`. Replaces seven legacy morning crons.

## Schedule

- **Cursor Automation:** `competitive-task-orchestrator` — cron `0 13 * * *` (UTC) ≈ 09:00 ET
- **Manual:** `/competitive-task-orchestrator` skill or Command Deck button

## Operator checklist

### Before first run

1. Confirm Gmail MCP and Slack MCP are authenticated in Cursor (optional but preferred).
2. Verify vault mirrors exist under `00_Inbox/slack/` when MCP is down.
3. Disable legacy crons after **two verified runs** (see table below).

### Each run

1. Check `Daily-Briefs/competitive-task-today.md` for P0 stack.
2. Execute or delegate P0 items; draft Tier 2 replies in vault, never auto-send.
3. Glance at `automation-runs/competitive-task-orchestrator/YYYY-MM-DD/run-state.json` for MCP gaps.

### After run

- If vault `last_touched` dates are stale, schedule a `/vault-compile` backfill pass.
- File completed boss asks by updating `status:` in `00_Inbox/slack/` notes.

## Legacy crons to disable (after 2 green runs)

| Cron / skill | Status |
|---|---|
| standalone `/am-report` | → absorbed |
| standalone `/inbox-brief` | → absorbed |
| standalone `/client-pulse` | → absorbed |
| standalone `/slack-intake` | → absorbed (still callable on demand) |
| standalone `/plan-today` morning | → read competitive-task-today instead |
| Thursday `/content-scan` | → absorbed in `content-routines` |
| ad-hoc morning intelligence crons | → absorbed |

**Keep separate:** `/vault-compile` (nightly), `/wiki-lint` + `/synthesize` (weekly), `/research-sweep` (weekly).

## Troubleshooting

| Symptom | Fix |
|---|---|
| Empty Gmail section | Authenticate Gmail MCP; until then trust client overview Gmail intel sections |
| Empty Slack section | Authenticate Slack MCP; run `/slack-intake` manually to refresh `00_Inbox/slack/` |
| All clients stalled | Vault dates frozen — run live connector pass, then `/vault-compile` |
| P0 list too long | memory-consolidator should cap at 5; re-run consolidator only |

## Artifacts

```
automation-runs/competitive-task-orchestrator/YYYY-MM-DD/
  run-state.json
  lane-outputs/
    gmail-intel.md
    slack-intel.md
    vault-pulse.md
    codex-session-sync.md
    domain-ads-seo.md
    content-routines.md
Daily-Briefs/competitive-task-today.md
```

## Related

- [[System/competitive-task-definition]]
- [[System/competitive-task-orchestrator-prompt]]
- [[11_Agents/Master Agent]]
- [[04_SOPs/Communication Intelligence Ingestion]]
