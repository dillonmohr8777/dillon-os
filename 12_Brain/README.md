---
tags: [system, brain, automation]
canonical: 12_Brain
created: 2026-07-29
updated: 2026-07-30
status: active
sync_gate: desktop-vault-open-api-token-pending
desktop_source: DESKTOP-4AHKEC4 Monitor Cursor and build vault run
---

# 12_Brain canonical second-brain layer

This is the only second-brain tree in Dillon OS. Do not create `1Z_Brain/` or another parallel architecture.

The layer combines the structured Obsidian brain, its agent protocols, and the fail-closed automation registry. The desktop vault is open locally. The Obsidian Local REST API token remains a separate connector gate and isn't required for filesystem-backed operation.

## Knowledge layout

| Path | Role |
|---|---|
| `INDEX.md` | Agent and operator front door |
| `raw/` | Private ground truth and read-only history |
| `entities/` and `concepts/` | Compiled wiki |
| `projects/`, `decisions/`, and `research/` | Delivery, decision, and research records |
| `memory/current/` and `memory/as-of/` | Bi-temporal memory |
| `protocols/` | Agent and approval protocols |
| `bases/` | Native Obsidian Bases |
| `templates/` | Brain note templates |
| `System/Second Brain Ops.md` | Loops, honesty rules, health, and sync operations |

## Automation layout

| Path | Role |
|---|---|
| `registry/automations.json` | Canonical automations, tiers, owners, and dependencies |
| `queue/` | Pending JSONL work. Agents append; humans approve Tier 2 |
| `state/` | Last-run state per automation |
| `schemas/` | Prospects, runs, client frontmatter, trust, and workflow contracts |
| `DEPENDENCY_PR226.md` | Site-factory dependency and ownership boundary |

Runnable code lives in `_os/automation/`. Operator docs live at `_os/automation/docs/OPERATOR.md`.

```bash
node _os/automation/bin/frontmatter-validate.js
node _os/automation/bin/frontmatter-repair.js --dry-run
node _os/automation/bin/site-health.js --dry-run
node _os/automation/bin/qualify.js --from _os/automation/fixtures/prospects/sample-intake.json
node _os/automation/bin/queue-status.js
node --test _os/automation/tests/*.test.js
```

## Safety boundary

1. No credentials, one-time codes, private access history, or raw contact corpora in the public tree.
2. No outreach sends, Slack posts, public deploys, spend, or client-account mutations from an ingestion or verification run.
3. Private sources compile into redacted, source-linked operational notes.
4. The HUD at `node _os/server.js` surfaces brain and automation health from this canonical tree.
