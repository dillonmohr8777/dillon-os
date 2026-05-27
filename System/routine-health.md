---
last_checked: 2026-05-27
tags: [system, routines]
---

# Routine Health Monitor

Vault is seeded with frontmatter fields the operator expects (`client`, `last_touched`, `next_action`, `due`, `tags`, `status`, `division`, `cc_list`, `contact_email`).

## Active automation (umbrella)

| Automation | Schedule (ET) | Spec |
| ------------ | ------------- | ---- |
| `dillon-os-operator` | Daily 1:00 PM (`0 13 * * *`) | `System/dillon-os-operator.md` |

Single cron replaces seven legacy routines. Disable legacy Cursor automations after **three consecutive green runs**.

## Last operator run

- **2026-05-27:** Umbrella workflow consolidated and documented on branch `cursor/competitive-task-consolidation-7043`. Legacy crons marked retired below. Live Gmail/Slack intel pending MCP on first full run.

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
- [ ] `Daily-Briefs/pulse-today.md` dated today after each run
- [ ] Legacy automations disabled (after 3 green runs)
