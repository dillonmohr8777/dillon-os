---
tags: [sop, automation]
---

# Competitive Task Orchestrator SOP

## Purpose

One daily Cursor automation replaces seven legacy crons plus the separate morning-loop
automation. Parallel intel lanes gather state; one consolidator writes the operator brief.

## Schedule

- **Cron:** `0 13 * * *` (1:00 PM America/New_York)
- **Automation name:** `competitive-task-orchestrator`
- **Prompt:** [[System/competitive-task-orchestrator-prompt]]

## Runbook

### Setup (once)

1. Cursor → Automations → Scheduled → cron above.
2. Attach **dillon-os** repository.
3. Paste prompt from `System/competitive-task-orchestrator-prompt.md`.
4. Enable: Memories, MCP (Gmail + Slack when available), file write, Task/subagents.
5. Disable legacy automations listed in [[System/competitive-task-definition#Retired standalone Cursor crons]].

### Daily operator flow

1. Open `Daily-Briefs/competitive-task-today.md` after 1 PM ET.
2. Execute P0 stack top to bottom.
3. Check `System/urgent-replies.md` and `System/slack-action-queue.md`.
4. Update client `last_touched` / `next_action` when you touch an account.

### Phase map

| Phase | Agents | Mode |
|-------|--------|------|
| 1 | ct-inbox-intel, ct-gmail-intel, ct-slack-intel, ct-vault-pulse, ct-session-sync, ct-ads-seo, ct-automation-health, ct-content-routines | **Parallel** |
| 2 | ct-consolidator | Sequential |

### Windows feeders (keep running — not duplicates)

| Feeder | Time | Umbrella reads |
|--------|------|----------------|
| daily-communications-brain | 7 AM | Captures + comms reviews |
| Claude-Autonomous-Daily-Driver | every 15m | Loop receipts |
| Prospect Radar Next 20 | 5:20 AM | Radar briefs |
| obsidian-guard-dog | 8:30 AM | Brain health only |

### Verification (first 3 runs)

- [ ] `Daily-Briefs/competitive-task-today.md` updated same day
- [ ] `System/claude-memory-sync.md` `last_sync` matches run date
- [ ] `System/routine-health.md` shows orchestrator timestamp
- [ ] Legacy Cursor crons disabled

## Related

- [[System/competitive-task-definition]]
- [[12_Brain/05_Projects/Competitive Task Umbrella Workflow]]
- [[Daily-Briefs/competitive-task-today]]
