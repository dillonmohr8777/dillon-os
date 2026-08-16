---
tags: [concept, ads, skills]
source: "[[12_Brain/raw/research/2026-08-15 - research - optmyzr-skills]]"
updated: 2026-08-15
expires: 2026-11-13
---

# Ads Optimization Skill Stack

One-line: Dillon OS now runs five vault-native ads skills; Optmyzr's
official libraries stay reference-only, and `/ads-optimize` drafts the
IF/THEN rules their MCP would write.

## What shipped in this vault

| Skill | Job |
|---|---|
| `/ads-audit` | Evidence-only Google + Meta health check → `Daily-Briefs/` + draft ledger |
| `/ads-optimize` | Optmyzr-style IF/THEN rule drafts (waste, bid-fit, budget, PMax) |
| `/ads-search-terms` | Query waste → Waste / Review / Protected → themed negatives |
| `/ads-tracking` | Primary/secondary, EC, GA4 double-count, CAPI preflight |
| `/meta-ads` | Higher Intent forms, Advantage+ geo hold, CAPI, fatigue |

All five refuse invented metrics, client email, and Tier 2 live edits
(budget, bid, new campaigns, goal changes). See
[[11_Agents/Google Ads Agent]] and [[12_Brain/protocols/approval-tiers]].

## Already owned, not copied in

- [[12_Brain/entities/Claude Ads|Claude Ads]] fork at
  `dillonmohr8777/claude-ads` — `/ads audit` style contracts, 12 platforms.
  Optional Claude Code plugin later. Wrong output paths for this HUD.
- `dillonmohr8777/claude-skills-repo` skills `paid-ads` and
  `campaign-analytics` — generic strategy / offline JSON math. Useful
  reference, not Command Deck buttons.
- [[12_Brain/entities/Optmyzr Skills|Optmyzr Skills]] — official Apache-2.0
  audit / waste-finder / audience-segmentation repos. Distilled, not copied.

## Stay out until an operator gate

- Adspirer and AdKit hosted ads MCPs — OAuth + paid + overlap with Composio
  Google Ads. Must pass `_os/automation/bin/mcp-gate.js` first.
- `itallstartedwithaidea/agent-skills` (googleadsagent.ai / Buddy Agent) —
  MIT reference dump, 12 Google Ads skills plus a commercial agent. Do not
  vendor into `.claude/skills/`.
- Optmyzr hosted MCP (`tools.optmyzr.com/OptmyzrMcp`) — paid account +
  `mcp-gate.js`. Keyword writes only; preview in Optmyzr. Not this session.
- `mardab96/google-ads-skills` — CPA-spike / IS-gap / PMax diagnosis.
  Next harvest, not vendored.
- X keyword search this session. Operator Bearer authenticates, but
  `GET /2/tweets/search/recent` returns 402 credits-depleted. The tweet-usage
  meter (`/2/usage/tweets`) showed 0 used — a different wallet. Activity API
  is a per-user event stream, not a search substitute. Keys stay gitignored
  under `12_Brain/private/access/`. See
  [[12_Brain/raw/research/2026-08-15 - research - x-api-search-credits]].

## Feeds

- [[12_Brain/concepts/Google Ads Conversion Optimization 2026]]
- [[12_Brain/concepts/Conversion Tracking Setup 2026]]
- [[12_Brain/concepts/Meta Lead Ads Optimization 2026]]
  (those three still carry `expires: 2026-08-04` — refresh on the next
  `/research-sweep` of tactics, not this skills pass)

## Links

- [[12_Brain/entities/Claude Ads]]
- [[12_Brain/entities/Optmyzr Skills]]
- [[12_Brain/entities/LandingFolio MCP]] — still the only project MCP
- Skill files: `.claude/skills/ads-audit`, `ads-optimize`,
  `ads-search-terms`, `ads-tracking`, `meta-ads`
