---
tags: [concept, ads, skills]
source: "[[12_Brain/raw/research/2026-08-15 - research - ads-optimization-skills]]"
updated: 2026-08-15
expires: 2026-11-13
---

# Ads Optimization Skill Stack

One-line: Dillon OS now runs four vault-native ads skills on the Command Deck;
the owned `claude-ads` fork stays a reference pack, not a vendored plugin.

## What shipped in this vault

| Skill | Job |
|---|---|
| `/ads-audit` | Evidence-only Google + Meta health check → `Daily-Briefs/` + draft ledger |
| `/ads-search-terms` | Query waste → themed negative draft (Tier 1) |
| `/ads-tracking` | Primary/secondary, EC, GA4 double-count, CAPI preflight |
| `/meta-ads` | Higher Intent forms, Advantage+ geo hold, CAPI, fatigue |

All four refuse invented metrics, client email, and Tier 2 live edits
(budget, bid, new campaigns, goal changes). See
[[11_Agents/Google Ads Agent]] and [[12_Brain/protocols/approval-tiers]].

## Already owned, not copied in

- [[12_Brain/entities/Claude Ads|Claude Ads]] fork at
  `dillonmohr8777/claude-ads` — `/ads audit` style contracts, 12 platforms.
  Optional Claude Code plugin later. Wrong output paths for this HUD.
- `dillonmohr8777/claude-skills-repo` skills `paid-ads` and
  `campaign-analytics` — generic strategy / offline JSON math. Useful
  reference, not Command Deck buttons.

## Stay out until an operator gate

- Adspirer and AdKit hosted ads MCPs — OAuth + paid + overlap with Composio
  Google Ads. Must pass `_os/automation/bin/mcp-gate.js` first.
- Any new Twitter/X bearer. Composio `twitter` has no active connection.
  Do not paste tokens into this public repo.

## Feeds

- [[12_Brain/concepts/Google Ads Conversion Optimization 2026]]
- [[12_Brain/concepts/Conversion Tracking Setup 2026]]
- [[12_Brain/concepts/Meta Lead Ads Optimization 2026]]
  (those three still carry `expires: 2026-08-04` — refresh on the next
  `/research-sweep` of tactics, not this skills pass)

## Links

- [[12_Brain/entities/Claude Ads]]
- [[12_Brain/entities/LandingFolio MCP]] — still the only project MCP
- Skill files: `.claude/skills/ads-audit`, `ads-search-terms`,
  `ads-tracking`, `meta-ads`
