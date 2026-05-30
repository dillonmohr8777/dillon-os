---
last_checked: 2026-05-30
tags: [system, routines]
---

# Routine Health Monitor

## Umbrella automation (active)

• **`competitive-task-orchestrator`** — daily `0 13 * * *` UTC
• Prompt: [[System/competitive-task-orchestrator-prompt]]
• Output: [[Daily-Briefs/competitive-task-today]]
• Subagents: `.cursor/agents/` (6 parallel + 1 consolidator)
• Manifest: [[System/automation-manifest]]

## Legacy routines (deprecated — disable in Cursor)

Do **not** schedule these separately; they are absorbed by the orchestrator:

• ~~`nightly-client-pulse`~~
• ~~`gmail-to-vault-digest`~~
• ~~`vault-integrity-sync`~~
• ~~`chat-to-vault-sync`~~
• ~~`bok-law-social-content`~~
• ~~`linkedin-growth-engine`~~
• ~~`book-site-seo-sweep`~~

## Connectors required

| Connector | Used by | Status |
|-----------|---------|--------|
| Gmail MCP | gmail-intel | Enable on orchestrator automation |
| Slack MCP | slack-intel | Enable on orchestrator automation |
| Git push | memory-consolidator | Cloud agent / local with credentials |

## Vault frontmatter

Routines expect on active client notes: `client`, `last_touched`, `next_action`, `due`, `tags`, `status`, `division`, `cc_list`, `contact_email`.

## Notes

• First full umbrella run documented 2026-05-28; daily run 2026-05-30 (Gmail/Slack still need MCP).
• If competitive-task-today is missing, check Automation Debug Log and connector gaps section in the brief.
