---
note_type: concept
status: active
created: 2026-08-06
updated: 2026-09-05
domain: automation
maturity: operational
summary: One daily umbrella orchestrator with six parallel intel lanes and a single consolidated operator brief advancing ROAD TO 100, Mohr Media revenue, and book subscribers.
review_on: 2026-10-04
verification_status: verified
source_refs:
  - "[[System/competitive-task-definition]]"
  - "[[04_SOPs/competitive-task-orchestrator]]"
  - "[[11_Agents/64gb Morning Orchestrator Spec 2026-07-08]]"
  - "[[12_Brain/01_Captures/GROK-HANDOFF-DILLON-OS]]"
tags:
  - brain
  - concept
  - automation
  - orchestration
---

# Competitive Task

The competitive task is not a single ticket. It is the ranked daily execution
loop that advances three North Star scoreboards without dropping launches,
billing, or client comms.

## Scoreboards

| Target | Lever |
|--------|-------|
| ROAD TO 100 CLIENTS | Site-factory outreach + retention |
| Mohr Media revenue | Audit-to-retainer + reporting factory |
| Book subscribers | Capture → dispatch calendar → paid funnel |

## How it runs

- **Automation:** `competitive-task-orchestrator` (cron `0 13 * * *` America/New_York)
- **Skill:** `/competitive-task-orchestrator`
- **Deterministic runner:** `node _os/automation/bin/competitive-task-run.js`
- **Daily read:** `Daily-Briefs/competitive-task-today.md`
- **Parallel agents:** `.cursor/agents/` — gmail-intel, slack-intel, vault-pulse, codex-session-sync, domain-ads-seo, content-routines; then memory-consolidator

## P0 tie-break

1. Launch blocked (client waiting on you)
2. Billing / engagement at risk
3. Ad disapprovals / account health
4. Hard calendar commitments

See [[System/competitive-task-definition]] for operator rules.

## Replaces

Seven legacy morning crons and the paused Codex `daily-morning-orchestrator-dry-board`. Does **not** replace weekly reports, comms-brain ingest, Grok intelligence, or Prospect Radar.

## Related

- [[11_Agents/Master Agent]]
- [[12_Brain/03_Concepts/Automation and Workflow Engineering]]
