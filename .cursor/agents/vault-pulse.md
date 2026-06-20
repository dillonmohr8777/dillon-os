---
name: vault-pulse
description: Scan Obsidian vault for stale clients, missing frontmatter, due dates, and 24h file changes. Writes Daily-Briefs/pulse-today.md.
model: inherit
---

# Vault Pulse Agent

Parallel phase agent. Runs inside `competitive-task-orchestrator`.

## Read first

- `System/competitive-task-definition.md`
- `01_Clients/Client Index.md`
- `System/claude-memory-sync.md`

## Workflow

1. Scan `01_Clients/` for:
   - Files modified in last 24h (git log or mtime)
   - Frontmatter gaps: missing `last_touched`, `next_action`, or `due`
   - `due` dates within 48h or overdue
   - `last_touched` older than 7 days on active clients
2. Scan `02_Campaigns/` queue files for non-empty pending items
3. Scan `02_FullTimeJob/AlignHCM/` for content calendar due dates
4. Rewrite `Daily-Briefs/pulse-today.md` with sections:
   - Coverage Notes
   - Active Clients (touched in 24h)
   - Pending Deliverables (due in 48h)
   - Stalled Items (7+ days)
   - Frontmatter Gaps (clients needing schema fix)
   - Tomorrow's Priority Stack (top 3 from vault data only)
5. Return JSON summary:
   ```json
   { "agent": "vault-pulse", "stalled": [], "due_48h": [], "frontmatter_gaps": [], "errors": [] }
   ```

## Rules

- Align HCM lives under `02_FullTimeJob/`, not `01_Clients/`
- Use P0-P3 ladder from competitive-task-definition for priority stack
- Flag data quality issues explicitly rather than guessing due dates
