---
note_type: review
status: active
date: 2026-09-16
updated: 2026-09-16
tags:
  - session-record
  - agents
  - momentum
  - control-plane
source_refs:
  - C:/Users/dillo/.claude/plans/purring-jumping-hickey.md (approved plan)
  - https://github.com/dillonmohr8777/dillon-os/pull/406
  - 12_Brain/06_Research/2026-09-16 - Momentum team bottlenecks and Workmate health.md
  - 12_Brain/07_Reviews/2026-09-16 - Fable estate analysis.md
---

# Agent control plane build, 2026-09-16

Orchestrated by Fable 5.1; built by Sonnet 5 and Opus 5 subagents. PR #406.

## Shipped

- Roster: `12_Brain/registry/automations.json` is the single agent list and on/off switch (`enabled`, `lifecycle`, `audience`, `function`). 53 records, 48 enabled, 32 Momentum facing.
- Run record: `_os/automation/runs.jsonl` via `_os/automation/lib/run-record.js`; sweep and cadence driver write it.
- Console: `GET /api/agents`, `POST /api/agents/:id/enabled`, Momentum Agent Console on the hosted v3 tokens. Live at 127.0.0.1:4242 under the `Momentum-HUD` logon task (`System/scripts/Install-MomentumHud.ps1`).
- Checks: `node _os/automation/bin/registry-validate.js`, `node --test _os/test/brain-hud.test.js`.

## Decisions

- Orca is a cockpit, not the platform: no API, no tenancy, scheduler dies with the app. Left installed, unused. Its hooks in `~/.claude/settings.json` are inert outside Orca launched sessions; `.bak` from 2026-09-15 restores.
- Roster unit is the automation record; business subagents are `kind: subagent`, on demand.
- Momentum audience only by default; internal and personal behind a switch.

## Next, in order (Sonnet sessions, not Fable)

1. Phase 3: run `System/scripts/Repair-ScheduledTasks.ps1` elevated so weekly and monthly cadence fire.
2. First business agent: dedupe Jason's #360leads alerts against CRM identity (biggest gap in the bottlenecks note).
3. Phase 2c imagery (OpenAI sunburst/flare, `_os/public/brand/`), Phase 2d 3D agent floor.
4. Phase 4 Langfuse + Grafana per client; unpause Managed Agents after rotating the exposed key (approval queue L132).
