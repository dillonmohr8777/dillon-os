---
note_type: decision
status: active
created: 2026-09-08
updated: 2026-09-08
owner: Dillon Mohr
decision: "Adopt one competitive-task umbrella workflow with parallel agent lanes; retire daily draft-PR consolidation pattern and fold Claude morning/learning/hygiene into phased lanes."
verification_status: verified
review_on: 2026-10-08
source_refs:
  - "[[12_Brain/01_Captures/sessions/2026-09-05 - pr-sweep-and-client-archive]]"
  - "[[11_Agents/Cloud Routine Prompts 2026-09-05]]"
  - "[[12_Brain/09_Ops/Repository Access Map]]"
  - "[[System/competitive-task-definition]]"
tags:
  - brain
  - decision
  - automation
  - orchestration
---

# Adopt umbrella competitive-task orchestrator

## Decision

1. **One workflow** — `competitive-task-orchestrator` in
   `12_Brain/registry/umbrella-workflow.json`, run by
   `node _os/automation/bin/competitive-task-run.js` plus Cursor agent lanes.
2. **Parallel lanes** — command scripts (`intel`, `learn`) run concurrently;
   agent lanes (`vault-pulse`, `gmail-intel`, `slack-intel`, `codex-session-sync`,
   `domain-ads-seo`, `memory-consolidator`, optional `content-routines`) run in
   the Cursor session via `.cursor/agents/`.
3. **Retire PR spam** — brief-only output commits to `main`. Code changes use
   **one rolling PR**, not a new draft every day.
4. **Fold competing schedulers** — morning brief, daily learning, nightly hygiene,
   and the old Cursor consolidation automation become **phases** of this workflow.
   Keep `Claude-Autonomous-Daily-Driver` and Prospect Radar separate.
5. **"Competitive task"** means operator throughput across clients and channels,
   not competitor research — see [[System/competitive-task-definition]].

## Why

Fifteen+ `cursor/competitive-task-consolidation-*` branches and three Claude
Routines each opened a PR per day with no self-close. The vault already
documented the fix in [[11_Agents/Cloud Routine Prompts 2026-09-05]]; this
decision ships the runner and registry so the Cursor cron executes one
orchestrated pass instead of inventing a new umbrella spec daily.

## Owner follow-ups

- [ ] Disable the legacy Cursor automation that only opens draft PRs.
- [ ] Paste Routine prompt fixes from [[11_Agents/Cloud Routine Prompts 2026-09-05]]
      or disable redundant Claude Routines.
- [ ] Set `DILLON_CLIENT_OPERATIONS_ROOT` in cloud environment for predict-work.

## Supersedes

Informal daily "competitive task consolidation" draft PRs (#333–#370 era).
