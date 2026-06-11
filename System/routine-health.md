---
last_checked: 2026-06-11
tags: [system, routines]
---

# Routine Health Monitor

Vault is seeded with frontmatter fields the operator expects (`client`, `last_touched`, `next_action`, `due`, `tags`, `status`, `division`, `cc_list`, `contact_email`).

## Active automation (umbrella)

| Automation | Schedule (ET) | Spec |
| ------------ | ------------- | ---- |
| `dillon-os-operator` | Daily 1:00 PM (`0 13 * * *`) | `System/dillon-os-operator.md` |

Single cron replaces seven legacy routines. Disable legacy Cursor automations after **three consecutive green runs** (live Gmail + Slack MCP connected).

## Last operator run

- **2026-06-11:** Full Phase 1 parallel intel (5 lanes). Phase 2 Thursday `content-book-seo` completed. Gmail + Slack MCP unavailable. Pulse, urgent-replies, memory-sync synthesized. Umbrella infrastructure restored on `cursor/competitive-task-consolidation-db25`. **Partial run** (MCP gap).
- **2026-06-07:** Full Phase 1 + Sunday content on branch ce14. Gmail + Slack MCP unavailable. Partial run 2 of 3.
- **2026-06-06:** Full Phase 1 on branch dc88. Gmail + Slack MCP unavailable. Partial run 1 of 3.

## Retired (merged into dillon-os-operator)

| Legacy ID | Now handled by |
| --------- | -------------- |
| `nightly-client-pulse` | `intel-vault-pulse` + pulse synthesis |
| `gmail-to-vault-digest` | `intel-gmail` |
| `vault-integrity-sync` | `intel-memory-sync` |
| `chat-to-vault-sync` | `intel-codex-sessions` |
| `bok-law-social-content` | Sunday `content-bok-law` |
| `linkedin-growth-engine` | Sunday `content-align-linkedin` |
| `book-site-seo-sweep` | Thursday `content-book-seo` |

## Health checks

- [ ] Gmail MCP connected for `intel-gmail`
- [ ] Slack MCP connected for `intel-slack`
- [x] `Daily-Briefs/pulse-today.md` dated today after each run
- [ ] Legacy automations disabled (after 3 green runs with live MCP)
- [ ] Client notes carry `last_touched` / `due` / `next_action` for stall detection
