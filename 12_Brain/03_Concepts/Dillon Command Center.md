---
note_type: concept
status: active
created: 2026-08-14
updated: 2026-08-26
domain: automation
maturity: operational
summary: One umbrella daily workflow fans out eight parallel scout lanes then synthesizes a single AM report, plan, and approval board — replacing fragmented morning crons.
review_on: 2026-09-26
verification_status: verified
source_refs:
  - "[[00_Inbox/Automation Deep Analysis 2026-07-29]]"
  - "[[11_Agents/64gb Morning Orchestrator Spec 2026-07-08]]"
  - "[[11_Agents/Master Agent]]"
  - "[[GROK-HANDOFF-DILLON-OS]]"
tags:
  - brain
  - concept
  - automation
  - orchestration
---

# Dillon Command Center

**Summary:** one umbrella daily workflow that fans out eight parallel scout lanes
(comms, clients, intelligence, websites, outreach, ads, reporting) then synthesizes
a single AM report, plan, and approval board — replacing fragmented morning crons.

## Problem

Dillon's competitive daily work was split across:

- Separate Cursor cron automations (slack-intake, am-report, client-pulse)
- Dozens of duplicate daily-orchestrator PRs (#171–#260 family)
- Codex 64GB lanes A–H as separate mental models
- Mac's site-builder pipeline as a parallel stack
- Fifteen+ Codex heartbeat automations in Rockbot workflow estate

Each piece worked alone but duplicated routing, approval tiers, and the "one push"
contract from the [[11_Agents/64gb Morning Orchestrator Spec 2026-07-08|Morning Orchestrator Spec]].

## Solution

`dillon-command` is the canonical umbrella:

| Piece | Path |
| --- | --- |
| Skill | `.claude/skills/dillon-command/SKILL.md` |
| CLI | `_os/automation/bin/dillon-command.js` |
| Profile | `_os/automation/profiles/dillon-command.json` |
| Registry | `12_Brain/registry/automations.json` id `dillon-command` |
| Run artifacts | `automation-runs/dillon-command/YYYY-MM-DD/` |
| Commander | [[11_Agents/Master Agent|Master Agent]] |

## Eight parallel lanes

Maps Codex handoff lanes A–H into executable scouts:

1. **comms** (B) — Slack/Gmail triage → `00_Inbox/slack/`
2. **clients** (F) — roster pulse + frontmatter health
3. **intelligence** (H) — research sweep when a question exists
4. **websites** (D) — site-health sentinel
5. **outreach** (Mac) — prospect radar + site-factory queue
6. **ads** (C) — paid media scouts + metrics
7. **reporting** (F) — client report gaps
8. **command** (A) — am-report + plan-today synthesis

Scouts run in parallel (cap 8). Command lane runs last.

## Codex automations absorbed (scout sub-lanes)

These remain as deterministic CLIs or Codex-owned routines but are **invoked by**
`dillon-command` scouts rather than as separate daily pushes:

| Codex automation | Umbrella lane |
| --- | --- |
| `daily-morning-orchestrator-dry-board` | command + all scouts |
| `marketing-chief-twice-daily-brief` | command |
| `daily-communications-brain` | comms |
| `six-hour-important-email-drafter` | comms |
| `slack-reply-watchdog` | comms |
| `daily-grok-dillon-os-intelligence` | intelligence |
| `report-brain-reconciliation` | reporting |
| `weekly-client-marketing-reports` | reporting |
| `momentum-hubspot-day-pulse` / `night-pulse` | ads (Momentum only) |
| Prospect Radar Next 20 | outreach |

## Approval tiers (unchanged)

- Tier 0: scouts + vault writes — unattended
- Tier 1: reversible platform tweaks — one approval batch
- Tier 2: send/post/deploy/spend — queue only

## Open gates

From registry: `netlify_deploy_token`, `mail_vendor`, `outreach_send` still
block Mac's activate stage. Slack live scan needs MCP or 64GB reauth when vault
mirrors are stale.

## Related

- [[02_Campaigns/AI Site Builder Outreach Engine/Pipeline Spec|Pipeline Spec]] — outreach engine stages
- [[02_Campaigns/AI Site Builder Outreach Engine/Slack Evidence Log|Slack Evidence Log]] — Mac's automation ask
- [[12_Brain/02_Entities/Codex Workspace (Legacy)|Codex Workspace (Legacy)]]
- [[12_Brain/03_Concepts/Automation and Workflow Engineering|Automation and Workflow Engineering]]
