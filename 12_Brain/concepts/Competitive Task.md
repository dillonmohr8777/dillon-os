---
tags: [concept, automation, operations]
updated: 2026-08-09
source: "[[System/competitive-task-definition]]"
expires: 2026-11-09
---

# Competitive Task

**Summary:** Dillon's recurring operational workload — Slack asks, Gmail triage,
client pulse, content routines, and infrastructure health — consolidated into
one umbrella automation with parallel lane agents.

## The problem

Seven separate crons (morning loop, client pulse, Gmail digest, vault sync,
content routines, LinkedIn engine, book SEO) each produced partial output. Dillon
had to mentally merge them.

## The fix

One `competitive-task-orchestrator` cron spawns six parallel Tier-0 scouts, then
one memory consolidator writes `Daily-Briefs/competitive-task-today.md` and
opens a single PR.

## Lanes

| Lane | Skill | Output |
|------|-------|--------|
| gmail-intel | inbox-brief | inbox brief |
| slack-intel | slack-intake | slack task notes |
| vault-pulse | client-pulse | pulse-today |
| codex-session-sync | session-mine | session gaps |
| domain-ads-seo | site-grade | health + radar |
| content-routines | content-scan | content brief |

## Approval model

Inherited from [[11_Agents/64gb Morning Orchestrator Spec 2026-07-08|Morning Orchestrator Spec]]:
Tier 0 unattended, Tier 1 batched after one approval, Tier 2 Dillon-only.

## Links

- [[04_SOPs/competitive-task-orchestrator|SOP]]
- [[11_Agents/Master Agent|Master Agent]]
- [[12_Brain/registry/automations|Automations registry]]
