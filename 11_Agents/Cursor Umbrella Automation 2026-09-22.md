---
tags: [agents, cursor, automation, umbrella]
date: 2026-09-22
status: active
source_refs:
  - "[[System/UMBRELLA-WORKFLOW]]"
  - "[[12_Brain/01_Captures/sessions/2026-09-05 - pr-sweep-and-client-archive]]"
---

# Cursor umbrella automation — replaces competitive-task PR factory

## Operator action

In Cursor Automations, edit the cron job that was titled **competitive task consolidation**:

1. **Disable** “open pull request on every run” (or remove `open_git_pr` from the automation actions if that was the only output).
2. Paste the midday prompt from [[System/UMBRELLA-WORKFLOW#Cursor automation prompt (midday slice)]].
3. Keep schedule `0 13 * * *` or merge into a single daily run at 09:05 local — **one** umbrella schedule is enough.

## Why

Fifteen+ draft PRs (#333–#370) duplicated the same design with zero merges ([[12_Brain/07_Reviews/2026-09-03 - Year Quarter Month Alignment]]). The competitive task is **ranking Dillon's work**, not opening another branch.

## Evidence this run should leave

- `Daily-Briefs/umbrella-2026-09-22.md`
- `12_Brain/state/umbrella-latest.json`
- Commit on `main` titled `umbrella: 2026-09-22 midday` (not a new daily PR)
