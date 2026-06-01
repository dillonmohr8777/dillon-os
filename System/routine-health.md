---
last_checked: 2026-06-01
tags: [system, routines]
---

# Routine Health Monitor

## Active (umbrella)

| Automation | Schedule | Output |
|------------|----------|--------|
| `competitive-task-orchestrator` | `0 13 * * *` (1 PM ET) | `Daily-Briefs/competitive-task-today.md` |

Spec: `System/competitive-task-workflow.md` · SOP: `04_SOPs/competitive-task-orchestrator.md` · Agents: `.cursor/agents/dillon-*.md`

**Last run:** 2026-06-01 — consolidation installed; MCP fallback (vault-only). Connect Gmail + Slack on automation for live intel.

## Retired (merged into umbrella — disable in Cursor)

- `nightly-client-pulse` → `dillon-vault-pulse`
- `gmail-to-vault-digest` → `dillon-gmail-intel`
- `vault-integrity-sync` → `dillon-memory-consolidator`
- `chat-to-vault-sync` → `dillon-codex-session-sync`
- `bok-law-social-content` → `dillon-content-routines` (Sunday)
- `linkedin-growth-engine` → `dillon-content-routines` (Sunday)
- `book-site-seo-sweep` → `dillon-content-routines` (Thursday)

## Vault frontmatter expected

`client`, `last_touched`, `next_action`, `due`, `tags`, `status`, `division`, `cc_list`, `contact_email`

## Notes

- Disable seven legacy automations after **three** green umbrella runs.
- `Daily-Briefs/pulse-today.md` kept for history; **competitive-task-today.md** is the daily read going forward.
