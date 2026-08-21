---
note_type: concept
status: active
created: 2026-08-21
updated: 2026-08-21
domain: automation
maturity: operational
summary: One umbrella workflow runs eight parallel agent lanes and emits a single approval board instead of competing morning automations.
review_on: 2026-09-21
verification_status: verified
source_refs:
  - "[[11_Agents/64gb Morning Orchestrator Spec 2026-07-08]]"
  - "[[00_Inbox/Automation Deep Analysis 2026-07-29]]"
  - "[[12_Brain/03_Concepts/Automation and Workflow Engineering]]"
  - "_os/automation/profiles/dillon-command.json"
tags:
  - brain
  - concept
  - automation
  - orchestration
---

# Dillon Command Center

Competing automations were doing overlapping work: morning Slack intake, AM report,
client pulse, Claude daily driver receipts, prospect radar, Grok ingest, and
scattered registry jobs. Dillon Command Center is the **one scheduled umbrella**
that fans out eight parallel lanes and synthesizes a single approval board.

## Architecture

```mermaid
flowchart TB
  Trigger["Scheduled trigger or on-demand"] --> Umbrella["dillon-command.js"]
  Umbrella --> L1["comms"]
  Umbrella --> L2["clients"]
  Umbrella --> L3["intelligence"]
  Umbrella --> L4["websites"]
  Umbrella --> L5["outreach"]
  Umbrella --> L6["ads"]
  Umbrella --> L7["reporting"]
  L1 --> Command["command lane synthesis"]
  L2 --> Command
  L3 --> Command
  L4 --> Command
  L5 --> Command
  L6 --> Command
  L7 --> Command
  Command --> Board["approval-board.md"]
  Command --> AM["am-report-YYYY-MM-DD.md"]
  Command --> Pulse["pulse-today.md"]
```

## Eight lanes

| Lane | Primary evidence | Agent owner |
|---|---|---|
| comms | `00_Inbox/slack/`, communication state | chief-of-staff |
| clients | `01_Clients/` pulse, client approval items | marketing-chief |
| intelligence | Grok ingest, research, craft brief | brain-curator |
| websites | site health, radar, LP queue | web-product-builder |
| outreach | prospect rebuild queue | growth-content |
| ads | billing/disapproval/campaign gates | paid-media-analyst |
| reporting | report ingest state | paid-media-analyst |
| command | P0 ranking across all lanes | marketing-chief |

## Operator contract

- **One push per cycle:** approval board + AM report PR
- **P0 tie-break:** launch blocked → billing risk → ad disapprovals → calendar
- **Tier 2 stays gated:** send, publish, deploy, spend, account change
- **Retained micro-loops:** Claude daily driver (15m), Prospect Radar Next 20 (05:20)

## Entry points

- CLI: `node _os/automation/bin/dillon-command.js run --agent-mode`
- Skill: `.claude/skills/dillon-command/SKILL.md`
- Registry: `12_Brain/registry/automations.json` → `dillon-command`
- Artifacts: `automation-runs/dillon-command/YYYY-MM-DD/`

## Supersedes

- [[handoffs/Morning Loop Scheduled Agent Setup|Morning Loop three-step cron]]
- Separate cloud agents for slack-intake, am-report, and client-pulse alone

## Related

- [[12_Brain/03_Concepts/Automation and Workflow Engineering]]
- [[11_Agents/64gb Morning Orchestrator Spec 2026-07-08]]
