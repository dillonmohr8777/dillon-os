# Automation ops — operator guide

Implementation of Wave 1–2 from `00_Inbox/Automation Deep Analysis 2026-07-29.md`.

## Prerequisites

- Node 18+ (repo already uses Node 22 in cloud)
- No npm install required for `_os/automation`
- PR #226 site-factory is a **dependency** for building sites after qualify — see `12_Brain/DEPENDENCY_PR226.md`. Do not copy those files into this tree.

## Commands

```bash
# Registry / queue snapshot
node _os/automation/bin/queue-status.js

# Frontmatter (Opp #11)
node _os/automation/bin/frontmatter-validate.js
node _os/automation/bin/frontmatter-repair.js --dry-run
# explicit write (safe defaults only: status/last_touched/next_action TBD/due=none)
node _os/automation/bin/frontmatter-repair.js --write

# Site health — fixtures by default (dry-run)
node _os/automation/bin/site-health.js --dry-run
# Optional live GETs (still no public deploy / no credential use)
node _os/automation/bin/site-health.js --live

# Shared discover/qualify (Maps pipeline)
node _os/automation/bin/qualify.js --from _os/automation/fixtures/prospects/sample-intake.json

# Same scorer via Indeed hiring-signal adapter (import file only — no live scrape)
node _os/automation/bin/qualify.js --adapter indeed --from _os/automation/fixtures/prospects/indeed-signals.json

# Tests
node --test _os/automation/tests/*.test.js
```

## Outputs

| Command | Writes |
|---|---|
| frontmatter-validate | `12_Brain/state/frontmatter-validate.json`, `Daily-Briefs/frontmatter-report.md` |
| frontmatter-repair | `12_Brain/state/frontmatter-repair.json` (+ optional vault writes with `--write`) |
| site-health | `12_Brain/state/site-health-sentinel.json`, `Daily-Briefs/site-health-report.md` |
| qualify | `12_Brain/state/discover-qualify.json`, `12_Brain/state/qualify-last.json`, `12_Brain/queue/discover-qualify-*.jsonl`, `08_Prospects/*.md` |

## Safety

- No outreach sends, no mail, no Slack posts, no public deploys
- Indeed adapter accepts **imported JSON only** (live scrape = ToS/credential gate)
- Site-health `--live` is GET-only; canary POST remains blocked without an explicit endpoint contract
- Existing clients are suppressed via `01_Clients/` website domains

## Human gates still open

1. Desktop Obsidian Sync sign-in + CLI (surfaces full desktop `12_Brain`)
2. Merge/rebase coordination with PR #226 (no path collision today)
3. Netlify deploy token + mail vendor decision before activate
4. Mac/Melissa approval before any outbound batch
