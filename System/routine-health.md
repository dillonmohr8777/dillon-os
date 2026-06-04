---
last_checked: 2026-06-04
tags: [system, routines]
---

# Routine Health Monitor

## Active automation (umbrella)

| Automation | Schedule | Status |
|------------|----------|--------|
| **dillon-os-orchestrator** | `0 13 * * *` UTC | **Active** — replaces all legacy routines below |

Spec: [[System/dillon-os-orchestrator]]  
Skill: `.cursor/skills/dillon-os-orchestrator/SKILL.md`

## Retired routines (do not re-enable)

These seven automations are consolidated into the orchestrator. Disable them in [cursor.com/automations](https://cursor.com/automations) if still listed:

- ~~`nightly-client-pulse`~~ → Pulse Agent
- ~~`gmail-to-vault-digest`~~ → Comms Agent
- ~~`vault-integrity-sync`~~ → Vault Agent
- ~~`chat-to-vault-sync`~~ → Vault Agent
- ~~`bok-law-social-content`~~ → Content Agent (Sundays)
- ~~`linkedin-growth-engine`~~ → Content Agent (Sundays)
- ~~`book-site-seo-sweep`~~ → Content Agent (Thursdays)

## Sub-agent health (2026-06-04 first run)

| Agent | Last run | Notes |
|-------|----------|-------|
| Comms | 2026-06-04 | Vault-only; Gmail MCP not connected |
| Pulse | 2026-06-04 | All M360 overviews 50–94d stale |
| Vault | 2026-06-04 | memory-sync `last_sync` updated |
| Ops | 2026-06-04 | Queues were empty; seeded from active-campaigns |
| Content | — | Skipped (Wednesday) |

## Vault frontmatter

Expected on active client notes: `client`, `last_touched`, `next_action`, `due`, `tags`, `status`, `division`, `cc_list`, `contact_email`.

**Gap:** Florecita, Buzz Bull, and most Direct clients lack `overview.md` pulse files.

## Next actions for operator

1. Point Cursor cron automation prompt at: `Run the dillon-os-orchestrator skill end-to-end.`
2. Enable Gmail MCP on the automation.
3. Disable legacy routine automations in Cursor UI.
