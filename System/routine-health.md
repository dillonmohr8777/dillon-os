---
last_checked: 2026-05-26
last_orchestrator_run: 2026-05-26-bootstrap
tags: [system, routines]
---

# Routine Health Monitor

## Active automation (use this only)

| Automation | Schedule | Mode |
| --- | --- | --- |
| **dillon-os-orchestrator** | `0 13 * * *` (1:00 PM ET daily) | full |

Prompt: [[System/ORCHESTRATOR_PROMPT|ORCHESTRATOR_PROMPT]]  
Architecture: [[System/dillon-os-orchestrator|dillon-os-orchestrator]]  
Config: `System/orchestrator-manifest.json`

### Parallel agents per run

- Inbox Scout → `System/urgent-replies.md`
- Client Pulse → `Daily-Briefs/pulse-today.md`
- Memory Curator → `System/claude-memory-sync.md`
- Google Ads Agent → `02_Campaigns/*Queue.md`
- SEO Agent → book sweep (Thu) + SEO queues
- Content Scheduler → BOK Law (Sun 6pm+) + Align LinkedIn (Sun 9pm+)
- Session Harvester → `10_Sessions/`
- **Master Agent** → `Daily-Briefs/command-center.md`

## Deprecated (disable in Cursor Automations)

These are **merged** into `dillon-os-orchestrator`. Do not schedule separately:

- ~~`nightly-client-pulse`~~
- ~~`gmail-to-vault-digest`~~
- ~~`vault-integrity-sync`~~
- ~~`chat-to-vault-sync`~~
- ~~`bok-law-social-content`~~
- ~~`linkedin-growth-engine`~~
- ~~`book-site-seo-sweep`~~

## Optional light sync

If you still want memory updates every 2 hours without a full Gmail scan, run orchestrator in **light mode** (Memory Curator + Session Harvester only). Prefer one daily full run + manual triggers over re-enabling seven crons.

## Vault frontmatter expected

`client`, `last_touched`, `next_action`, `due`, `tags`, `status`, `division`, `cc_list`, `contact_email`

## Notes

- First unified orchestrator run: 2026-05-26
- Read [[Daily-Briefs/command-center]] each morning after the 1 PM run completes
