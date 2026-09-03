---
tags: [sop, automation]
summary: One umbrella automation replaces eight legacy crons; parallel agents gather intel, one consolidator writes the afternoon operator brief.
source_refs:
  - System/competitive-task-definition.md
  - System/competitive-task-orchestrator-prompt.md
---

# Competitive Task Orchestrator SOP

## Purpose

One daily automation replaces eight legacy Cursor crons plus the redundant
morning-loop cloud agent. Parallel agents gather intel from vault, Gmail, Slack,
sessions, ads queues, and automation health; one consolidator writes the
operator brief Dillon opens every afternoon.

## Schedule

- **Cron:** `0 13 * * *` (1:00 PM America/New_York)
- **Automation name:** `competitive-task-orchestrator`
- **Prompt file:** [[System/competitive-task-orchestrator-prompt]]

## Runbook

### Setup (once)

1. Cursor → Automations → New → **Scheduled** → cron above.
2. Attach **this vault repo** (branch `main` or working branch).
3. Paste prompt from `System/competitive-task-orchestrator-prompt.md`.
4. Enable tools: **Memories**, **MCP** (Gmail + Slack when available), file write.
5. Disable legacy automations listed in
   [[System/competitive-task-definition#Retired standalone Cursor crons]].

### Daily operator flow

1. Morning (7 AM): Windows feeders run am-report, inbox-brief, plan-today,
   client-pulse, metrics — **do not duplicate these in the umbrella**.
2. Afternoon (1 PM): umbrella runs Phase 1 parallel + Phase 2 consolidator.
3. Open `Daily-Briefs/competitive-task-today.md` after 1 PM ET.
4. Execute P0 stack top to bottom.
5. Check `System/urgent-replies.md` and `System/slack-action-queue.md`.
6. Update client note frontmatter when you touch an account (`last_touched`,
   `next_action`).

### Phase map

| Phase | Agents | Mode |
|-------|--------|------|
| 1 | ct-inbox-intel, ct-gmail-intel, ct-slack-intel, ct-vault-pulse, ct-session-sync, ct-ads-seo, ct-automation-health, ct-content-routines | Parallel |
| 2 | ct-consolidator | Sequential |

### Day-gated content (Phase 1, conditional)

| Day | Routine | Inputs |
|-----|---------|--------|
| Sunday | Bok Law social | `01_Clients/Bok Law/overview.md` |
| Sunday | Align LinkedIn | `02_FullTimeJob/AlignHCM/linkedin-calendar.md` |
| Thursday | Book SEO sweep | `05_Book/seo-strategy.md` |

### Verification (first 3 runs)

- [ ] `Daily-Briefs/competitive-task-today.md` updated same day
- [ ] `System/claude-memory-sync.md` `last_sync` matches run date
- [ ] `System/routine-health.md` shows orchestrator timestamp
- [ ] Legacy crons disabled in Cursor UI

### Failure modes

| Symptom | Fix |
|---------|-----|
| Brief empty / stale | Check cloud agent repo attachment; confirm write permissions |
| Gmail lane always fallback | Connect Gmail MCP on automation; verify OAuth |
| Slack lane silent | Connect Slack MCP; add workspace channels to agent scope |
| Vault pulse says all stalled | Add `last_touched` frontmatter when editing clients |
| Duplicates morning brief | Umbrella should cross-check, not re-run inbox-brief skill |

## Related

- [[System/competitive-task-definition]]
- [[Daily-Briefs/competitive-task-today]]
- [[handoffs/Morning Loop Scheduled Agent Setup]]
