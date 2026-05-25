---
last_checked: 2026-05-25
tags: [system, routines]
---

# Routine Health Monitor

## Umbrella automation (active)

| Automation | Schedule | Replaces |
| --- | --- | --- |
| **`dillon-os-operator`** | Daily 1:00 PM ET (`0 13 * * *`) | All rows below |

Prompt: `.cursor/automation/dillon-os-operator.md`  
Spec: `System/dillon-os-operator.md`  
Output: `Daily-Briefs/operator-today.md`

### Parallel lanes inside one run

| Lane | Phase | Old routine |
| --- | --- | --- |
| intel-gmail | 1 | gmail-to-vault-digest |
| intel-slack | 1 | (new) |
| intel-vault-pulse | 1 | nightly-client-pulse |
| intel-memory-sync | 1 | vault-integrity-sync |
| intel-codex-sessions | 1 | chat-to-vault-sync |
| content-bok-law | 2 (Sun) | bok-law-social-content |
| content-align-linkedin | 2 (Sun) | linkedin-growth-engine |
| content-book-seo | 2 (Thu) | book-site-seo-sweep |

## Legacy routines (retire)

Disable these separate Cursor automations after **three** successful `dillon-os-operator` runs:

- ~~`nightly-client-pulse`~~
- ~~`gmail-to-vault-digest`~~
- ~~`vault-integrity-sync`~~
- ~~`chat-to-vault-sync`~~
- ~~`bok-law-social-content`~~
- ~~`linkedin-growth-engine`~~
- ~~`book-site-seo-sweep`~~

## Vault prerequisites

Frontmatter fields expected on client notes: `client`, `last_touched`, `next_action`, `due`, `tags`, `status`, `division`, `cc_list`, `contact_email`.

## Status

- [x] Umbrella workflow documented
- [x] `.cursor/agents/` parallel subagents committed
- [ ] First live run with Gmail MCP
- [ ] First live run with Slack MCP
- [ ] Legacy automations disabled in Cursor dashboard
