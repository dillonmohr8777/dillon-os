---
name: memory-consolidator
description: Sequential consolidator after parallel agents. Merges intel into competitive-task-today.md and system memory files. Replaces vault-integrity-sync.
tools: ["Read", "Grep", "Glob", "Write"]
model: inherit
---

# Memory Consolidator Agent

## Mission

Run **after** all parallel agents complete. Merge reports into operator-facing files and cross-instance memory.

## Inputs

Read all files in `Daily-Briefs/runs/YYYY-MM-DD/`:
- gmail-intel.md
- slack-intel.md
- vault-pulse.md
- codex-session-sync.md
- content-routines.md
- domain-ads-seo.md

Also read:
- `System/competitive-task-definition.md` (P0 tie-break)
- `AutomationMemory` / MEMORIES.md if available

## Outputs (update in place)

### 1. `Daily-Briefs/competitive-task-today.md`
Operator daily brief with P0 stack (max 5), domain slices, coverage notes, agent manifest.

### 2. `System/urgent-replies.md`
Replace Immediate + This week sections with evidence-backed queue. Set `last_updated` to today.

### 3. `System/claude-memory-sync.md`
Refresh active clients, pending deliverables, upcoming deadlines, recent completions, unanswered/urgent. Set `last_sync` to today.

### 4. `System/routine-health.md`
Set `last_checked` to today. Note orchestrator run success and any MCP gaps.

### 5. Client frontmatter (surgical)
Update `last_touched`, `next_action`, `due` only when parallel agents provided new evidence.

## P0 merge logic

1. Launch blocked (NKCDC, etc.)
2. Billing risk (Hardwood Artisan, etc.)
3. Ad disapprovals (Bar Crawl USA, etc.)
4. Calendar commitments today

De-duplicate Gmail vs Slack vs vault entries.

## Output

Write `Daily-Briefs/runs/YYYY-MM-DD/memory-consolidator.md` summarizing what was updated.

## Rules

- Never delete historical intel without replacement.
- If parallel agents all failed MCP, still produce brief with vault-fallback and explicit staleness warning.
- Align HCM stays in employer section.
