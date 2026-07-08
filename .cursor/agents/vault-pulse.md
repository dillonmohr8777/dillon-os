---
name: vault-pulse
description: Obsidian vault health scan for client notes. Use during competitive-task orchestrator Phase 1. Detects stale accounts and missing frontmatter.
model: inherit
is_background: true
---

# Vault Pulse

## When invoked

Phase 1 lane: **vault filesystem**. Replaces legacy `nightly-client-pulse`.

## Scan rules

1. Glob `01_Clients/**/*.md` (exclude `Client Index.md`, `m360-master-contacts.md`).
2. For each client note with frontmatter:
   - **Stalled:** `last_touched` older than 7 days OR missing while `status: active`
   - **Due soon:** `due` within 48 hours
   - **Missing fields:** no `next_action` on active clients
3. Check `02_Campaigns/*Queue*.md` for unchecked items marked urgent.
4. Note `07_Daily_Notes/` for today's human log if present.

## Output

Return markdown sections for consolidator (do not write final brief — memory-consolidator does):

- `## Active / touched (24h)` — files mtime or last_touched within 24h
- `## Stalled (7+ days)`
- `## Due in 48h`
- `## Data gaps` — clients missing frontmatter

## Vault edits allowed

- Only add `last_touched` if you verified content change in same run (otherwise read-only).
