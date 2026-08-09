---
tags: [system, automation, orchestrator]
updated: 2026-08-09
---

# Competitive Task Definition

**Competitive task** is Dillon's recurring operational workload — the work that
competes for the same morning hours: boss Slack asks, client pulse, Gmail
triage, content routines, site health, prospect radar, and Codex session residue.

It is **not** competitor research. It is the daily fight to stay ahead of
client churn, billing risk, launch blockers, and inbox noise.

## What belongs in the umbrella

| Source | Examples | Lane |
|--------|----------|------|
| Slack | Mac site asks, Sean reporting, Jason bot alerts | slack-intel |
| Gmail | Billing blocks, calendar invites, client threads | gmail-intel |
| Vault clients | `due`, `next_action`, `at_risk` frontmatter | vault-pulse |
| Sessions | `10_Sessions/`, Codex handoffs | codex-session-sync |
| Infrastructure | Site health, radar queue, automation gates | domain-ads-seo |
| Content | Bok Law Sunday, Align LinkedIn, book SEO Thursday | content-routines |

## What stays outside

- **Tier 2 sends** — mail, Slack posts, deploys, live ads changes
- **Website factory builds** — triggered by classified `website-build` Slack notes → `/site-factory`
- **Weekly premium passes** — `/synthesize`, `/wiki-lint` (separate weekly cron)
- **64GB Chrome Tier-1 batch** — local machine only per Morning Orchestrator Spec

## Success criteria

One `Daily-Briefs/competitive-task-today.md` with ranked P0/P1, connector gaps
honestly stated, and `Dashboard.md` updated. Dillon reviews one PR, not seven.

## Links

- Skill: `.claude/skills/competitive-task-orchestrator/SKILL.md`
- SOP: `04_SOPs/competitive-task-orchestrator.md`
- Spec: `11_Agents/64gb Morning Orchestrator Spec 2026-07-08.md`
