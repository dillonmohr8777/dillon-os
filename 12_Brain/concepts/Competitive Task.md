---
tags: [concept, automation, strategy]
source: "[[System/competitive-task-definition]]"
updated: 2026-08-06
expires: 2026-09-06
---

# Competitive Task

One-line summary: the ranked daily execution loop that advances ROAD TO 100 CLIENTS, Mohr Media revenue, and book subscribers through one parallel-agent orchestrator.

## Definition

The competitive task is not a single ticket — it is winning the day against three scoreboards while clearing boss/client asks. See [[System/competitive-task-definition]] for P0 tie-break rules and operator constraints.

## How it runs

- **Automation:** `competitive-task-orchestrator` (cron `0 13 * * *`)
- **Skill:** `/competitive-task-orchestrator`
- **Daily read:** `Daily-Briefs/competitive-task-today.md`
- **Subagents:** `.cursor/agents/` — gmail-intel, slack-intel, vault-pulse, codex-session-sync, domain-ads-seo, content-routines, memory-consolidator

## Replaces

Seven legacy morning crons (am-report, inbox-brief, client-pulse, slack-intake, plan-today morning, Thursday content-scan, ad-hoc intel crons).

## Related

- [[11_Agents/Master Agent]] · [[04_SOPs/competitive-task-orchestrator]] · [[12_Brain/entities/King Agent OS|King Agent OS]] (patterns ported)
