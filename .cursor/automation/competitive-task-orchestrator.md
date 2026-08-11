---
tags: [automation, cursor]
updated: 2026-08-09
---

# Cursor Automation: competitive-task-orchestrator

| Field | Value |
|-------|-------|
| ID | `competitive-task-orchestrator` |
| Schedule | `0 13 * * *` (daily, 1 PM UTC) |
| Repo | dillon-os |
| Skill | `.claude/skills/competitive-task-orchestrator/SKILL.md` |
| Prompt | `System/competitive-task-orchestrator-prompt.md` |

## Parallel agents

Spawned via Task tool from `.cursor/agents/`:

1. gmail-intel
2. slack-intel
3. vault-pulse
4. codex-session-sync
5. domain-ads-seo
6. content-routines
7. memory-consolidator (sequential, after 1–6)

## Replaces

Eight legacy routines documented in `System/routine-health.md` and the morning
loop handoff at `handoffs/Morning Loop Scheduled Agent Setup.md`.

## Registry

Canonical entry: `12_Brain/registry/automations.json` → `competitive-task-orchestrator`
