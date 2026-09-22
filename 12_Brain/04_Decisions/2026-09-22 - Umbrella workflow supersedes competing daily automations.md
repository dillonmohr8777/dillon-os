---
note_type: decision
status: active
date: 2026-09-22
directed_by: Dillon Mohr
tags: [automation, orchestration, cursor, claude]
source_refs:
  - "[[12_Brain/07_Reviews/2026-09-03 - Year Quarter Month Alignment]]"
  - "[[12_Brain/01_Captures/sessions/2026-09-05 - pr-sweep-and-client-archive]]"
  - "[[System/UMBRELLA-WORKFLOW]]"
---

# Umbrella workflow supersedes competing daily automations

Dillon asked for **one major automation** with **numerous agents in parallel** instead of separate morning brief, learning loop, hygiene, and Cursor “competitive task” jobs.

## Decision

1. **Canonical orchestrator:** `node _os/automation/bin/umbrella-run.js` with slices `morning` | `midday` | `nightly`, manifest at `_os/automation/umbrella/manifest.json`.
2. **Competitive tasks** are ranked from vault evidence (plan, inbox brief, approval queue), not from a new daily PR.
3. **Parallel agents** are declared in the manifest `agent_lanes`; Marketing Chief still does not become a second canonical queue writer.
4. **Retire** the Cursor automation behavior that opened a draft PR every day without merge. Midday slice commits to `main` or updates one rolling branch only.
5. **Keep** Windows Task Scheduler jobs (Claude daily driver, Immohrtal, prospect radar) but treat them as `local-continuous` receipts checked by the umbrella, not separate “competitive” workflows.

## Not decided here

- Merging or closing historical draft PRs (#333–#370) — owner batch close still required.
- Pasting updated claude.ai Routine prompts — still hand-off per [[11_Agents/Cloud Routine Prompts 2026-09-05]].
