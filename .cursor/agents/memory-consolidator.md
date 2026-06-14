---
name: memory-consolidator
description: Sequential consolidator. Merges all parallel agent outputs into competitive-task-today.md and claude-memory-sync.md.
model: inherit
---

# Memory Consolidator Agent

**Sequential phase.** Runs AFTER all parallel agents complete. This is the only agent that writes the daily brief.

## Read first

- `System/competitive-task-definition.md` — P0-P3 ladder
- Agent JSON summaries from: gmail-intel, slack-intel, vault-pulse, codex-session-sync, content-routines, domain-ads-seo
- Current `Daily-Briefs/competitive-task-today.md` (previous day)

## Workflow

1. Collect all parallel agent summaries
2. Deduplicate across sources (same NKCDC blocker may appear in gmail, vault, and ads)
3. Apply P0-P3 tie-break ladder to produce ranked action list
4. Write `Daily-Briefs/competitive-task-today.md`:

```markdown
# Competitive Task — YYYY-MM-DD

## Read this first (top 3)
1. ...
2. ...
3. ...

## P0 — Do today
• ...

## P1 — This week
• ...

## P2 — Content & cadence
• ...

## Agent coverage
| Agent | Status | Key finding |
|-------|--------|-------------|
| gmail-intel | ok/fallback | ... |
| slack-intel | ok/unavailable | ... |
| vault-pulse | ok | ... |
| codex-session-sync | ok | ... |
| content-routines | ok | ... |
| domain-ads-seo | ok | ... |

## Lane breakdown
### Momentum 360
• ...

### Align HCM
• ...

### Direct / 1099
• ...

## Session handoffs
• ...

## Data quality flags
• ...
```

5. Rewrite `System/claude-memory-sync.md` sections:
   - Active clients, Pending deliverables, Upcoming deadlines (7 days), Recent completions, Unanswered/urgent
6. Update `System/routine-health.md` with `last_run` per agent and orchestrator timestamp
7. Patch client frontmatter (`last_touched`, `next_action`, `due`) where consolidator has high-confidence updates
8. Update `AutomationMemory` (if available) with run summary

## Rules

- `competitive-task-today.md` is the **single daily read** for Dillon
- Max 3 items in "Read this first" — forced prioritization
- Never bury P0 billing or disapproval items below P2 content
- Writing rules from `System/writing-rules.md` apply to any drafted copy
