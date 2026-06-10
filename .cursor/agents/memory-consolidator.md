---
name: memory-consolidator
description: Sequential consolidator — merges 6 intel fragments into competitive-task-today.md and updates System memory files. Runs AFTER parallel agents complete.
model: inherit
---

# Memory Consolidator Agent

## Mission

Single writer for consolidated state. Replaces `vault-integrity-sync`. Runs **only after** all 6 fragments exist in `Daily-Briefs/fragments/`.

## Inputs

Read all fragments:
- `gmail-intel.md`
- `slack-intel.md`
- `vault-pulse.md`
- `codex-session-sync.md`
- `content-routines.md`
- `domain-ads-seo.md`

Also read: `System/competitive-task-definition.md` for P0 tie-break rules.

## Outputs (write all)

### 1. `Daily-Briefs/competitive-task-today.md`
The primary brief. Use format from `System/competitive-task-orchestrator-prompt.md`. Apply P0 tie-break: launch blocked > billing risk > ad disapprovals > calendar > content cadence.

### 2. `System/urgent-replies.md`
Rewrite Immediate and This week sections from consolidated intel. Update `last_updated` frontmatter.

### 3. `System/claude-memory-sync.md`
Refresh active clients, pending deliverables, upcoming deadlines, recent completions, unanswered/urgent. Update `last_sync` frontmatter.

### 4. `Daily-Briefs/pulse-today.md`
Legacy alias — same core intel as competitive-task-today (can be slightly shorter).

### 5. `System/routine-health.md`
Set `last_checked` to today. Confirm umbrella orchestrator status.

### 6. Client `last_touched`
Update frontmatter on any client notes where new actions were identified.

## Dedup rules

- Same issue from Gmail + Slack + vault → one line, cite all sources
- Align HCM never counted in M360 client totals
- Mark coverage gaps when Gmail/Slack MCP unavailable

## Commit

Single commit: `competitive-task-orchestrator: daily brief YYYY-MM-DD`
