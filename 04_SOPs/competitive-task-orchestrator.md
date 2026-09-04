---
tags: [sop, automation]
---

# Competitive Task Orchestrator SOP

## Purpose

One daily automation replaces seven legacy crons. Parallel agents gather intel; one consolidator writes the operator brief.

## Schedule

- **Cron:** `0 13 * * *` (1:00 PM America/New_York)
- **Automation name:** `competitive-task-orchestrator`
- **Prompt file:** [[System/competitive-task-orchestrator-prompt]]

## Runbook

### Setup (once)

1. Cursor → Automations → New → **Scheduled** → cron above.
2. Attach **this vault repo** (branch `main` or your working branch).
3. Paste prompt from `System/competitive-task-orchestrator-prompt.md`.
4. Enable tools: **Memories**, **MCP** (Gmail + Slack if available), file write.
5. Disable legacy automations listed in [[System/competitive-task-definition#Retired standalone crons]].

### Daily operator flow

1. Open `Daily-Briefs/competitive-task-today.md` after 1 PM ET.
2. Execute P0 stack top to bottom.
3. Check `System/urgent-replies.md` for email-specific wording.
4. Update client note frontmatter when you touch an account (`last_touched`, `next_action`).

### Phase map

| Phase | Agents | Mode |
|-------|--------|------|
| 1 | gmail-intel, slack-intel, vault-pulse, codex-session-sync, domain-ads-seo, content-routines | Parallel |
| 2 | memory-consolidator | Sequential |

### Day-gated content (Phase 1, conditional)

| Day | Agent branch |
|-----|----------------|
| Sunday | Bok Law social (`01_Clients/Bok Law`), Align LinkedIn (`02_FullTimeJob/AlignHCM/linkedin-calendar.md`) |
| Thursday | Book SEO (`05_Book/seo-strategy.md`) |

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

## Related

- [[System/competitive-task-definition]]
- [[11_Agents/Master Agent]]
- [[Daily-Briefs/competitive-task-today]]
