---
note_type: decision
status: accepted
created: 2026-08-21
updated: 2026-08-21
owner: Dillon Mohr
decision: "Consolidate competing morning automations into Dillon Command Center — one umbrella workflow with eight parallel agent lanes."
verification_status: verified
source_refs:
  - "[[12_Brain/03_Concepts/Dillon Command Center]]"
  - "[[00_Inbox/Automation Deep Analysis 2026-07-29]]"
  - "[[handoffs/Morning Loop Scheduled Agent Setup]]"
  - "_os/automation/profiles/dillon-command.json"
tags:
  - brain
  - decision
  - automation
---

# Unify automation under Dillon Command Center

## Decision

Replace the scattered morning automation stack with **one umbrella workflow**:

1. `dillon-command.js` runs eight parallel lanes (comms, clients, intelligence,
   websites, outreach, ads, reporting, command).
2. Each lane maps to an existing agent owner and routine family from
   `11_Agents/claude-operating-team.json`.
3. The command lane synthesizes a single P0 approval board and AM report.
4. Separate cron agents for slack-intake, am-report, and client-pulse are
   **superseded** by this workflow.

## What stays separate

| Loop | Why |
|---|---|
| Claude daily driver (15m) | Micro execution of 54 gated routines |
| Prospect Radar Next 20 (05:20) | Heavy site builder batch |
| Agent-memory vault sync (hourly) | Memory projection, not operator synthesis |
| Hermes gateway health | Infrastructure probe |

## Evidence of competing tasks (2026-08-21)

- 4 Slack requests still `status: new` in `00_Inbox/slack/` (18+ days)
- Replenish Google Ads billing blocked (P0 ads lane)
- Momentum brand direction + CallRail status (comms lane)
- 207 prospect rebuild queue (outreach lane)
- 180+ open approval items (command lane scoreboard)

## Rollback

Restore separate scheduled agents using
`handoffs/Morning Loop Scheduled Agent Setup.md` and disable the
`dillon-command` registry row. Run artifacts remain under
`automation-runs/dillon-command/`.

## Next safe action

Schedule one cloud agent using
[[handoffs/Dillon Command Center Scheduled Agent Setup]] and disable the
superseded morning-loop cron.
