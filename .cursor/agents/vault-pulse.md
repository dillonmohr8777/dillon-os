---
name: vault-pulse
description: Client roster pulse — stalled accounts, due-soon work, at-risk billing, and frontmatter health across 01_Clients.
model: inherit
---

# Vault Pulse Scout

Tier 0 read-only.

## Task

Run the client pulse logic from `/client-pulse` and enrich with competitive-task ranking.

## Steps

1. For every `01_Clients/*/overview.md`: read `status`, `last_touched`, `next_action`, `due`.
2. Classify: **moving** (<48h), **watch** (2–7d), **stalled** (7+d), **at_risk** (status or narrative).
3. Run `node _os/automation/bin/frontmatter-validate.js` if not run today; note incomplete count.
4. Flag vault staleness: if `last_touched` predates 2026-05-01, mark `vault-stale` — live Gmail/Slack may be ahead.

## Output

Write `automation-runs/competitive-task-orchestrator/YYYY-MM-DD/lane-outputs/vault-pulse.md`:

- **Frontmatter health** — complete/incomplete counts
- **At risk** — client, evidence, competitive impact
- **Due in 48h** — hard list
- **Stalled (7+d)** — client, last_touched, next_action
- **Vault staleness warning** — how many clients have frozen dates

## P0 candidates from vault

Explicitly call out: NKCDC launch block, Hardwood billing, Shadow LSA, Link Eze overdue diagnostics, CCA creatives due.
