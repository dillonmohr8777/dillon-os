---
note_type: project
status: active
created: 2026-09-02
updated: 2026-09-02
owner: Dillon Mohr
finish_line: "One Cursor umbrella automation replaces fragmented crons; eight parallel lanes + consolidator; legacy schedulers disabled after three green runs."
next_action: "Disable duplicate Cursor automations in dashboard after verifying three green umbrella runs."
due: none
source_refs:
  - "[[System/competitive-task-definition]]"
  - "[[04_SOPs/competitive-task-orchestrator]]"
  - "[[12_Brain/04_Decisions/2026-09-01 - Daily comms single owner]]"
tags:
  - brain
  - project
  - automation
  - competitive-task
---

# Competitive Task Umbrella Workflow

## Problem

Dillon's **competitive task** is running ~25 client accounts without dropping launches,
billing, or comms. The vault accumulated overlapping automations: morning loop,
pulse crons, Gmail digest, session sync, content Sundays/Thursdays, Claude daily
driver, Codex daily-comms, and dozens of duplicate consolidation PR branches.

## Solution

**One Cursor scheduled automation** at 1:00 PM ET:

1. **Phase 1 (parallel):** eight `ct-*` subagents in `.cursor/agents/`
2. **Phase 2 (sequential):** `ct-consolidator` writes `Daily-Briefs/competitive-task-today.md`

Windows jobs remain as **ingest feeders** only — they do not write competing operator briefs.

## Operator artifact

Open `Daily-Briefs/competitive-task-today.md` after each run. P0 tie-break rules live in
`System/competitive-task-definition.md`.

## Setup

See [[04_SOPs/competitive-task-orchestrator]] — paste `System/competitive-task-orchestrator-prompt.md`
into Cursor Automations, disable retired crons listed in the definition file.

## Verification

- [ ] Three consecutive days with updated `competitive-task-today.md`
- [ ] `System/routine-health.md` shows green consolidator
- [ ] Legacy Cursor crons disabled in UI
- [ ] Gmail/Slack MCP connected (yellow → green on intel lanes)
