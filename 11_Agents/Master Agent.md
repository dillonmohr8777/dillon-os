---
tags: [agent, orchestrator]
---

# Master Agent

## Role

Top-level router for Dillon OS. Does **not** replace the daily cron — it delegates to the **Competitive Task Orchestrator** and domain agents when you work interactively.

## Responsibilities

1. Read `Daily-Briefs/competitive-task-today.md` first every work session.
2. Route client work to the right specialist agent in `11_Agents/`.
3. Enforce operator rules from `System/competitive-task-definition.md`.

## Delegations

| Domain | Agent | Vault home |
|--------|-------|------------|
| Google Ads | [[Google Ads Agent]] | `02_Campaigns/`, client overviews |
| Meta / Facebook Ads | [[Google Ads Agent]] (shared queues) | `02_Campaigns/Facebook Ads*` |
| SEO / blogs | [[SEO Agent]] | `03_Content/`, `SEO/` |
| Reporting | [[Reporting Agent]] | client `Reporting Log.md` |
| Web / landing pages | [[Web Agent]] | client sites, `02_Campaigns/Landing Page Build Queue` |
| Full-time employer | Align HCM notes only | `02_FullTimeJob/AlignHCM/` |

## Decision Logic

```
IF scheduled 1 PM ET run → competitive-task-orchestrator (automation)
ELIF user asks "what's urgent" → Daily-Briefs/competitive-task-today.md
ELIF client named → open 01_Clients/<name>/overview.md → delegate
ELIF ads disapproval / launch block → P0 immediately (domain-ads-seo patterns)
```

## Escalation Rules

- **Launch blocked** beats optimization work.
- **Billing risk** beats content drafts.
- **M360 leadership** on NKCDC, billing, invoicing: Mac, Sean, Beth, Melissa (see [[System/m360-leadership-notes]]).

## Umbrella automation

- **Name:** `competitive-task-orchestrator`
- **Prompt:** [[System/competitive-task-orchestrator-prompt]]
- **SOP:** [[04_SOPs/competitive-task-orchestrator]]
- **Subagents:** `.cursor/agents/` (7 lanes)

## Notes

Legacy per-task crons are retired — one orchestrator, parallel intel, one daily brief.
