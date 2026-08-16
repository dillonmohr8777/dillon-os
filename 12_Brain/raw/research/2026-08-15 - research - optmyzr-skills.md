---
tags: [research, raw, ads, optmyzr]
captured: 2026-08-15
topic: Official Optmyzr skill libraries plus optimizer-shaped public packs
---

# 2026-08-15 research — Optmyzr-style Google Ads optimizer skills

Receipts for the official Optmyzr skill org and the public optimizer packs
that sit next to it. Compiled into [[12_Brain/entities/Optmyzr Skills]] and
[[12_Brain/concepts/Ads Optimization Skill Stack]].

## Question

Where do new Google Ads *optimizer* skills (rule-engine / waste / bid-fit)
actually live, and what can enter Dillon OS without a paid MCP?

## Receipts

1. **Claim:** The official skill libraries are under
   [github.com/optmyzr-skills](https://github.com/optmyzr-skills), not
   `github.com/Optmyzr`. Three public repos as of 2026-08-15.
   - Source: GitHub org search + operator screenshot of the org page,
     2026-08-15.

2. **Claim:** [optmyzr-skills/google-ads-audit](https://github.com/optmyzr-skills/google-ads-audit)
   is Apache 2.0, Claude Code plugin, ~42 checks / 14 categories, 4-CSV
   paste flow. No API key required. Connecting Optmyzr MCP unlocks Auction
   Insights, change history, feed health, alerts, and Rule Engine
   auto-remediation. Vendor copy says the commercial product has ~93
   signals; this repo is the top-3-per-category subset.
   - Source: repo README + `skills/google-ads-audit/SKILL.md`, fetched
     2026-08-15.

3. **Claim:** [optmyzr-skills/google-ads-ppc-waste-finder](https://github.com/optmyzr-skills/google-ads-ppc-waste-finder)
   is Apache 2.0. Default filter: last 7 days, cost > $20, conversions = 0.
   Intent guardrail is the load-bearing idea: classify each term
   `Waste` / `Review — competitor` / `Protected — brand` *before* building
   negatives. Brand and conquest terms are never auto-negatived. Human
   applies the list. Live pull requires Optmyzr MCP
   (`SearchTermPerformance`).
   - Source: repo README + skill file, fetched 2026-08-15.

4. **Claim:** [optmyzr-skills/Google-Ads-audience-segmentation](https://github.com/optmyzr-skills/Google-Ads-audience-segmentation)
   is a Claude skill (root `SKILL.md`) that maps business context to
   Custom Segments / In-Market / Customer Match / RLSA and forces
   Targeting vs Observation as a real choice. Stops if margin/CPA or
   targeting-mode is unknown on real data.
   - Source: `SKILL.md` fetched 2026-08-15.

5. **Claim:** Optmyzr also ships a hosted MCP at
   `https://tools.optmyzr.com/OptmyzrMcp` that writes Rule Engine
   strategies from plain English, with a mandatory Optmyzr preview.
   Keyword writes are supported; broader campaign writes are not yet.
   Needs a paid Optmyzr account + API key or OAuth.
   - Source: [Optmyzr MCP](https://www.optmyzr.com/solutions/optmyzr-mcp/)
     and [Claude + Optmyzr MCP](https://www.optmyzr.com/blog/manage-ppc-accounts-with-claude-optmyzr/),
     2026-08-15.

6. **Claim:** Adjacent public optimizer packs (advisory markdown, not
   live writers): [thalesholleben/skill-google-ads](https://github.com/thalesholleben/skill-google-ads)
   (`references/06-optimization-playbook.md` — cadence, CPA-ratio budget
   table, learning-phase hold); [narayan-metaflow/metaflow-marketing-skills](https://github.com/narayan-metaflow/metaflow-marketing-skills)
   skills `google-ads-optimizer` and `google-ads-scripts`;
   [mardab96/google-ads-skills](https://github.com/mardab96/google-ads-skills)
   (CPA spike, IS gap, PMax diagnosis — next harvest, not this commit).
   - Source: raw SKILL.md / README fetches 2026-08-15.

7. **Claim:** Dillon OS already had `/ads-audit`, `/ads-search-terms`,
   `/ads-tracking`, `/meta-ads`. None emit Optmyzr-style IF/THEN rule
   drafts. `/ads-search-terms` already themed waste but did not use the
   three-status guardrail.
   - Source: this vault's `.claude/skills/` on 2026-08-15.

## Killed claims

- Installing Optmyzr MCP, AdKit, or Adspirer this session. Vault MCP gate
  (`_os/automation/bin/mcp-gate.js`) + paid account + overlap with
  Composio Google Ads. LandingFolio is still the only project MCP and is
  sandbox-only.
- Vendoring the three Optmyzr plugins into `.claude/skills/`. They write
  Claude-plugin reports and upsell the MCP. Distill the contracts; keep
  `Daily-Briefs/` + Optimization Ledger.
- Using thalesholleben cross-industry 2026 medians (CPC $4.22, CPA $53.52)
  as operator targets for local-service accounts. Same playbook says
  targets come from client economics; local-services band is different.
- Encoding “QS 5→7 cuts CPC >40%” as a hard rule. Single-source blog
  heuristic; metaflow uses softer 15–25% / 10–15% tiers. QS stays a lever,
  not a formula.
- Treating a 7-day zero-conversion brand term as waste. Contradicted by
  receipt 3 (the whole point of the Optmyzr guardrail).

## Single-source / keep labeled

- “~93 signals” in the commercial Optmyzr audit vs “~42” in the open
  skill. Vendor framing. The 14-category list in the public repo is
  verified; the 93 count is not re-counted here.
- Portfolio-strategy “19–27% ROAS lift” in the Metaflow optimizer.
  Google/vendor benchmark. Do not put it in a vault skill as a promise.

## Decision this run

Ship one vault-native `/ads-optimize` that drafts IF/THEN rules
(Waste / bid-fit / budget starvation / PMax brand exclusions / learning
hold). Patch `/ads-search-terms` with the three-status guardrail. Do not
install Optmyzr MCP. Do not vendor the plugins. Audience-segmentation
stays a reference for a later `/ads-audiences` if Dillon asks.

## Path to the next new skills

1. Watch [optmyzr-skills](https://github.com/optmyzr-skills) — three repos
   today; they will add more.
2. Harvest [mardab96/google-ads-skills](https://github.com/mardab96/google-ads-skills)
   for CPA-spike / IS-gap / PMax diagnosis (not this commit).
3. After an operator Optmyzr login + `mcp-gate.js`, reconsider the hosted
   Rule Engine MCP. Until then, draft rules in the vault.
