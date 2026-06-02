---
last_checked: 2026-06-02
tags: [system, routines]
---

# Routine Health Monitor

Vault is seeded with frontmatter fields the operator expects (`client`, `last_touched`, `next_action`, `due`, `tags`, `status`, `division`, `cc_list`, `contact_email`).

## Active automation (umbrella)

| Automation | Schedule (ET) | Prompt |
| ------------ | ------------- | ------ |
| `dillon-os-operator` | Daily 1:00 PM (`0 13 * * *`) | `.cursor/automation/dillon-os-operator.md` |

Spec: `System/dillon-os-operator.md`. Single cron replaces seven legacy routines. Disable legacy Cursor automations after **three consecutive green runs** (0/3 as of 2026-06-02).

## Last operator run

- **2026-06-02:** Phase 1 five parallel intel lanes executed. Gmail + Slack MCP unavailable — intel STALE from April vault. Memory sync + pulse synthesis committed. Phase 2 skipped (Tuesday).

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
- [x] `Daily-Briefs/pulse-today.md` dated 2026-06-02
- [ ] Legacy automations disabled (after 3 green runs)
- [ ] Codex/Cursor session exports landing in `10_Sessions/`
