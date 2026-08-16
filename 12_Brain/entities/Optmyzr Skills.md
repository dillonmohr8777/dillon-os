---
tags: [entity, tool]
source: "[[12_Brain/raw/research/2026-08-15 - research - optmyzr-skills]]"
updated: 2026-08-15
---

# Optmyzr Skills

**Summary:** Official Apache-2.0 Claude skill libraries from Optmyzr;
reference only. Do not vendor. Do not connect their MCP without the gate.

## What it is

GitHub org: [optmyzr-skills](https://github.com/optmyzr-skills)
(three public repos, 2026-08-15).

| Repo | Job | Needs Optmyzr MCP? |
|---|---|---|
| [google-ads-audit](https://github.com/optmyzr-skills/google-ads-audit) | 14-category / ~42-check graded audit, 4-CSV paste | Optional (live + Rule Engine) |
| [google-ads-ppc-waste-finder](https://github.com/optmyzr-skills/google-ads-ppc-waste-finder) | 7-day, >$20, 0-conv terms → negatives | Yes for live pull |
| [Google-Ads-audience-segmentation](https://github.com/optmyzr-skills/Google-Ads-audience-segmentation) | Segments → Targeting vs Observation plan | No |

Hosted MCP: `https://tools.optmyzr.com/OptmyzrMcp` — paid account, preview
before apply. Keyword writes only for now.

## How Dillon OS uses it

Do **not** install the plugins into `.claude/skills/`. Distill:

- Waste-finder guardrail → `/ads-search-terms`
- Rule-engine shape (IF/THEN, human apply) → `/ads-optimize`

See [[12_Brain/concepts/Ads Optimization Skill Stack]].

## Links

- [[12_Brain/raw/research/2026-08-15 - research - optmyzr-skills]]
- [[11_Agents/Google Ads Agent]]
- [[12_Brain/entities/LandingFolio MCP]] — still the only project MCP
