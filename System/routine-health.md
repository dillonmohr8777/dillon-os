---
last_checked: 2026-05-29
last_orchestrator_run: 2026-05-29
tags: [system, routines]
---

# Routine Health Monitor

## Umbrella workflow (active)

**One automation replaces all legacy crons:**

- `competitive-task-orchestrator` — daily 1:00 PM ET (`0 13 * * *`)
- Prompt: `System/competitive-task-orchestrator-prompt.md`
- Daily read: `Daily-Briefs/competitive-task-today.md`
- Parallel subagents: `.cursor/agents/` (gmail-intel, slack-intel, vault-pulse, codex-session-sync, content-routines, domain-ads-seo → memory-consolidator)

## Legacy crons — RETIRED (do not re-enable)

These are absorbed into the umbrella orchestrator:

| Legacy cron | Absorbed by |
|-------------|-------------|
| `nightly-client-pulse` | vault-pulse subagent |
| `gmail-to-vault-digest` | gmail-intel subagent |
| `vault-integrity-sync` | memory-consolidator |
| `chat-to-vault-sync` | codex-session-sync + memory-consolidator |
| `bok-law-social-content` | content-routines (Sunday branch) |
| `linkedin-growth-engine` | content-routines (Sunday branch) |
| `book-site-seo-sweep` | domain-ads-seo (Thursday branch) |

## Known gaps (2026-05-29)

- Gmail MCP not available on last cloud run → urgent-replies may be stale
- Slack MCP not available on last cloud run
- Vault `last_touched` often stale without live inbox sync
- Client files: 0 modified in 7 days as of 2026-05-29

## Next actions

1. Connect Gmail + Slack MCP to automation runner
2. Disable any remaining legacy cron automations in Cursor dashboard
3. Seed `last_touched` / `due` / `next_action` on high-touch client notes
