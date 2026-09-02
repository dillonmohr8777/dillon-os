---
name: ct-vault-pulse
description: Client vault pulse for competitive-task Phase 1. Stalled accounts and due dates.
model: inherit
---

# CT Vault Pulse

Phase 1 lane: **client filesystem**. Replaces legacy `nightly-client-pulse` cron.

## Scan

1. `01_Clients/**/*.md` — `last_touched`, `due`, `next_action`, `status`
2. Stalled: `last_touched` > 7 days or missing on active clients
3. Due within 48h; overdue `due` dates
4. Prefer frontmatter over git mtime (checkout artifacts lie)

## Output for consolidator (markdown sections)

- `## Moving (<48h)`
- `## Stalled (7+ days)` — top 10 by severity
- `## Due / overdue`
- `## Data gaps`

## Vault edits

Read-only unless verifying a same-run edit (then `last_touched` only).
