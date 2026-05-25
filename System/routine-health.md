---
last_checked: 2026-05-25
tags: [system, routines]
---

# Routine Health Monitor

## Umbrella automation (active)

| Automation | Schedule | Status |
|------------|----------|--------|
| `competitive-task-orchestrator` | `0 13 * * *` (daily 1 PM) | **Primary** — replaces all legacy routines below |

Prompt: [[System/competitive-task-orchestrator-prompt]]  
Workflow map: [[System/competitive-task-workflow]]  
Output: [[Daily-Briefs/competitive-task-today]]

### Subagents (parallel → consolidate)
- `gmail-intel`, `slack-intel`, `vault-pulse`, `codex-session-sync`, `content-routines`, `domain-ads-seo`
- Sequential: `memory-consolidator`

## Deprecated — disable in Cursor UI

These should **not** run as separate automations:

- ~~`nightly-client-pulse`~~ → `vault-pulse` + brief writer
- ~~`gmail-to-vault-digest`~~ → `gmail-intel` + `urgent-replies.md`
- ~~`vault-integrity-sync`~~ → `memory-consolidator`
- ~~`chat-to-vault-sync`~~ → `codex-session-sync`
- ~~`bok-law-social-content`~~ → `content-routines` (Sunday)
- ~~`linkedin-growth-engine`~~ → `content-routines` (Sunday)
- ~~`book-site-seo-sweep`~~ → `content-routines` (Thursday)

## Vault readiness

Frontmatter expected on client overviews: `client`, `last_touched`, `next_action`, `due`, `tags`, `status`, `division`, `cc_list`, `contact_email`.

## Health checks

- [ ] `Daily-Briefs/competitive-task-today.md` updated after last cron
- [ ] `System/claude-memory-sync.md` `last_sync` matches run date
- [ ] No duplicate cron automations still enabled
- [ ] Gmail MCP connected on automation

## Notes

- First umbrella run on branch `cursor/competitive-task-workflow-4612` — 2026-05-25.
- Legacy pulse file `Daily-Briefs/pulse-today.md` retained for history; competitive brief supersedes it.
