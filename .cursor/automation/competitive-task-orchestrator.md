---
tags: [automation, cursor]
id: competitive-task-orchestrator
cadence: "0 13 * * *"
replaces:
  - am-report
  - inbox-brief
  - client-pulse
  - slack-intake
  - plan-today-morning
  - content-scan-thursday
status: active
created: 2026-08-06
---

# Cursor Automation: competitive-task-orchestrator

## Registration

| Field | Value |
|---|---|
| **Name** | `competitive-task-orchestrator` |
| **Schedule** | `0 13 * * *` (daily, 09:00 ET) |
| **Prompt** | `System/competitive-task-orchestrator-prompt.md` |
| **Skill** | `.claude/skills/competitive-task-orchestrator/SKILL.md` |
| **Runbook** | `04_SOPs/competitive-task-orchestrator.md` |

## Architecture

```
competitive-task-orchestrator (commander)
├── gmail-intel          ─┐
├── slack-intel          ─┤
├── vault-pulse          ─┼─ parallel Tier 0 scouts
├── codex-session-sync   ─┤
├── domain-ads-seo       ─┤
├── content-routines     ─┘
└── memory-consolidator  ─── sequential merge → competitive-task-today.md
```

Subagent definitions: `.cursor/agents/*.md`

## Outputs

- `Daily-Briefs/competitive-task-today.md` — operator-facing brief
- `automation-runs/competitive-task-orchestrator/YYYY-MM-DD/` — run evidence
- `Dashboard.md` `## Today` — top 3 priorities

## Tier policy

- Scouts: Tier 0 (read/draft only)
- Operator execution of P0 items: Tier 1–2 per `12_Brain/protocols/approval-tiers.md`

## Disable legacy automations

After two consecutive successful runs, turn off the standalone crons listed in the runbook. This automation is the single daily intelligence entry point.
