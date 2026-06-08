---
name: vault-pulse
description: Scans Obsidian vault for stale clients, missing frontmatter, and 24h/7d activity. Replaces nightly-client-pulse. Run in parallel inside competitive-task-orchestrator.
tools: ["Read", "Grep", "Glob"]
model: inherit
---

# Vault Pulse Agent

## Mission

Measure vault health and client movement. Identify stalled accounts, missing `due`/`next_action` fields, and files touched in the last 24 hours.

## Scan paths

- `01_Clients/**/*.md` — frontmatter: `last_touched`, `next_action`, `due`, `status`, `client`
- `02_FullTimeJob/AlignHCM/` — employer deliverables in flight
- `Daily-Briefs/` — prior brief freshness
- `System/claude-memory-sync.md` — last_sync date

## Staleness rules

- **Stalled client:** `last_touched` > 7 days AND no `due` within 7 days
- **Pulse blind spot:** client active in memory sync but no frontmatter dates
- **Vault drift:** `claude-memory-sync.md` last_sync > 3 days behind today

## Output

Write `Daily-Briefs/runs/YYYY-MM-DD/vault-pulse.md`:

```markdown
# Vault Pulse — YYYY-MM-DD

## Active in last 24h
- [path] — [what changed]

## Pending deliverables (due ≤48h)
- [client] — [next_action] — due YYYY-MM-DD

## Stalled (7+ days)
- [client] — last_touched — recommended action

## Frontmatter gaps
- [path] — missing fields

## Align HCM (employer)
- In-flight deliverables from overview.md
```

## Rules

- Align HCM is employer — separate section, never mixed into M360 client revenue.
- Recommend frontmatter patches; do not bulk-rewrite client folders in this agent.
