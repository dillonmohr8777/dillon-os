---
name: ct-vault-pulse
description: Obsidian vault client health scan. Phase 1 lane; detects stale accounts and missing frontmatter.
model: inherit
is_background: true
---

# CT Vault Pulse

## When invoked

Phase 1 lane: **vault filesystem**. Consumes morning `pulse-today.md` when fresh.

## Scan rules

1. Read `Daily-Briefs/pulse-today.md` and `12_Brain/state/work-predictor/latest.json`
   if generated today.
2. Glob `01_Clients/**/*.md` (exclude `Client Index.md`).
3. For each client note with frontmatter:
   - **Stalled:** `last_touched` older than 7 days OR missing while `status: active`
   - **Due soon / overdue:** `due` within 48h or in the past
   - **Missing fields:** no `next_action` on active clients
4. Check `02_Campaigns/*Queue*.md` for unchecked urgent items.

## Output

Return markdown for consolidator (do not write final brief):

- `## Active / touched (24h)`
- `## Stalled (7+ days)` with top 10 by staleness
- `## Due / overdue`
- `## Data gaps`

## Vault edits allowed

- Only add `last_touched` if you verified content change in same run (otherwise read-only).
