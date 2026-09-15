---
note_type: review
status: active
created: 2026-09-10
updated: 2026-09-10
owner: Dillon Mohr
priority: high
verification_status: verified
observed_at: 2026-09-10
next_action: Use this as the Beth 13:00 Ads brief; do not wait on Antigravity
tags: [review, google-ads, api, omega, nexla, onsite, kjb, replenish]
source_refs:
  - "[[12_Brain/07_Reviews/2026-09-10 - Orchestrator pickup]]"
  - "[[System/handoff-2026-09-10]]"
  - "[[12_Brain/07_Reviews/2026-09-10 - Antigravity desktop Gemini monitor]]"
---

# Ads API five-account pull — 2026-09-10

Antigravity finished the raw pull and died on Gemini 3.8 Flash High quota.
Cursor synthesized it the same morning from
`_os/automation/google-ads-api/pulls/` via
`%LOCALAPPDATA%\Dillon\GoogleAdsProbe\analyze_pulls.py`. Direct REST v23.
No login-customer-id. No mutation. No send.

Human brief with tables:
`C:\Users\dillo\Documents\Codex\muse-spark-driver\ADS-API-PULL-FINDINGS-2026-09-10.md`

## Load-bearing findings

1. **Omega** traffic is landing on Wix `/blank-1` ($3,442.96 / 505 clicks / 7.0
   conv in 2026 LP view) almost as much as the homepage. Live Search $50/day
   loses 65% IS to rank, 4% to budget. Access request still unsent.
2. **Onsite** original Search and PMax are paused. LSA is ENABLED at $80/day
   with $0 / 0 impr in 90 days. Solano Search $7/day is ENABLED and 77% lost
   to rank. Homepage shows 95.0 conversions in 2026 because a stack of
   Primary actions (directions, clicks, forms, phone clicks) is still live.
3. **Nexla** live pair remains Brand $25 + MCP $40.75 = $65.75/day. MCP Search
   IS is 12% (54% rank, 34% budget). Paused campaign budget objects still
   sum to $1,443/day; they do not spend unless enabled. Demo Request is
   Secondary. `nexla.com/demo/` is $16,098.70 / 2,770 clicks / 3.0 conv YTD.
4. **KJB** Search campaigns are paused. Appointment RSA is POOR. Homepage
   took most 2026 clicks.
5. **Replenish / Fresh Blends** campaign rows are ENABLED/ENDED or paused.
   Do not publish a CID total. Landing pull mixes Replenish Netlify URLs
   with Kwik Trip Ice Box URLs. Gemini's 10:20 ET hist dump blended June
   as $3433.37 / 7945 clicks. Campaign-split from the same file: Replenish
   $1489.60 / 4108 clicks; Fresh Blends $1943.76 / 3837 clicks.

Keyword-metrics joins can duplicate brand-term spend across campaigns. Do
not add those repeated Nexla `Nexla` exact rows.

## Not done by this pass

- Omega competitor-term re-pull (still 2026-09-09 browser audit).
- GTM publish for Nexla.
- Any draft send.
