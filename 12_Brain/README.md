---
tags: [system, brain, automation]
created: 2026-07-29
status: cloud-scaffold
sync_gate: pending
desktop_source: DESKTOP-4AHKEC4 Monitor Cursor and build vault run
---

# 12_Brain

Canonical automation and second-brain operating layer for Dillon OS.

## Sync reconciliation

A computer-use agent on **DESKTOP-4AHKEC4** built a full local `12_Brain` (native Bases, projects, decisions, research, bi-temporal memory, templates, agent protocols, Cursor rules, Claude skills, health automation) with 0 structural errors. That layer is **not yet visible in this cloud checkout**.

**Human gate (not automatable here):** on the desktop, complete visible Obsidian sign-in → select the remote vault → enable the Obsidian CLI so encrypted Sync bridges both machines.

Until Sync lands:

- This cloud scaffold is the **source of truth for automation registry, queue, state schemas, and operator tooling**.
- Desktop-only Bases / bi-temporal notes win for local Obsidian UX once they appear; do not fork a third architecture.
- Earlier sketch at `claude/fable-obsidian-second-brain-tya2zz` (`concepts/`, `entities/`, `raw/`, `Clients.base`) is absorbed here — do not recreate those trees in parallel.

## Layout

| Path | Role |
|---|---|
| `registry/automations.json` | Canonical list of automations, tiers, owners, dependencies |
| `queue/` | Pending work items (JSONL). Agents append; humans approve Tier 2 |
| `state/` | Last-run state per automation id |
| `schemas/` | JSON shapes for prospects, runs, client frontmatter |
| `bases/` | Obsidian Base stubs that match the desktop design once Sync arrives |
| `templates/` | Note templates for prospects / automation runs |
| `protocols/` | Agent protocol pointers (approval tiers, no-send rules) |
| `DEPENDENCY_PR226.md` | Exact dependency on the site-factory PR — inspect, do not duplicate |

## Tooling

Runnable code lives in `_os/automation/` (zero npm dependencies, Node 18+). Operator docs: `_os/automation/docs/OPERATOR.md`.

```bash
node _os/automation/bin/frontmatter-validate.js
node _os/automation/bin/frontmatter-repair.js --dry-run
node _os/automation/bin/site-health.js --dry-run
node _os/automation/bin/qualify.js --from _os/automation/fixtures/prospects/sample-intake.json
node _os/automation/bin/queue-status.js
node --test _os/automation/tests/*.test.js
```

## Hard gates (never cross from automation)

- No outreach sends (email, Slack post, LinkedIn DM, direct mail)
- No public deploys, no spend, no client-account mutations
- No credentials in vault files; Bitwarden stays human-owned
