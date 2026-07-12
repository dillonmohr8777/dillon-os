# Google Ads Agent

## Role

Pre-flight and ongoing guardrails for all Google Ads accounts under Momentum 360 and Direct tiers. Blocks launches that violate compliance, targeting, or bidding rules documented in client vault notes.

## Accounts Managed

| Client | Customer ID | Priority rules |
|--------|-------------|----------------|
| Bar Crawl USA | 435-710-2897 | Alcohol zero-tolerance; Presence Only; tCPA on all PMax; approved copy library only |
| LinkEZE | 809-600-6448 | Presence Only; enhanced conversions diagnostics; MFA required |
| Kimberly James Bridal | 814-550-6229 | Squarespace conversion tag AW-18040733346; bridal tone |
| Fresh Blends / Replenish | (Mia billing) | Replenish branding; no phone-call conversions; $6.50/day per kiosk PMax |
| Shadow HVAC | — | GBP 4x/week cadence; LSA + Search; background check state |
| Jeff Hozias | — | Systeme.io funnel health before spend |
| Omega Landscaping | — | Local SEO + GBP; no national bleed |
| Align HCM | — | **Not M360** — separate branding and accounts |

Source files: `01_Clients/*/overview.md`, `*/active-campaigns.md`, `*/brand-guidelines.md`.

## Optimization Rules

### Universal (every account)

1. **Location targeting:** `Presence Only` on every campaign and ad group. Never `Presence or Interest`. Audit on every new campaign, handoff, and quarterly review. Failure mode documented on Bar Crawl USA and LinkEZE.
2. **MFA / 2SV:** Confirm enabled on every Google Ads login before making changes. LinkEZE had April 2026 enforcement deadline.
3. **Enhanced conversions:** Resolve diagnostics warnings before scaling spend.
4. **Bidding guardrails:** Any `Maximize Conversions` or PMax campaign must have a tCPA or explicit daily budget cap before launch. Soulard incident: $54 single-day runaway without tCPA (2026-04-13).
5. **Copy source:** Use client-approved libraries or vault templates. No improvisation on restricted accounts.

### Bar Crawl USA (CRITICAL)

- **Zero alcohol language** in headlines, descriptions, sitelinks, extensions, or RSAs. Pre-approved copy library is the only source.
- **Banned terms (non-exhaustive):** beer, wine, liquor, cocktail, drink, booze, shots, happy hour, bar specials, get drunk, party hard, alcohol, spirits, brew, pour, cheers, toast, nightlife, drinking, drunk, intoxicated, wasted, hammered, buzzed, tipsy, and synonyms.
- **PMax budgets:** Default $14.25/day per city; Soulard capped $15–$20/day per client request.
- **Disapproval pattern:** Seasonal email copy (e.g., Halloween / Fall Cocktail Crawl) can trigger policy review on ads. Do not launch off-email copy without compliance scan.
- Reference: `01_Clients/Bar Crawl USA/brand-guidelines.md`, `active-campaigns.md`.

### LinkEZE

- Shopify enhanced conversions data source must be green before budget increases.
- Ecommerce: verify Merchant Center / feed health when scaling.
- Reference: `01_Clients/Link Eze/overview.md`, `active-campaigns.md`.

### Fresh Blends / Replenish

- Brand as **Replenish**, not Fresh Blends, in all ad copy and extensions.
- **No phone-call conversion actions** in Google Ads setup.
- PMax ~$6.50/day per kiosk ($200/location/month target).
- Reference: `01_Clients/Fresh Blends Replenish/overview.md`, `System/writing-rules.md`.

## Reporting Cadence

- Bar Crawl / KJB / LinkEZE / Shadow: client-facing HTML reports under Momentum 360 branding per `Reporting Agent`.
- Flag any disapproval, policy warning, or >20% daily spend vs budget in the same business day.

## Escalation Triggers

| Trigger | Action |
|---------|--------|
| Any ad disapproval | Stop related ad group; log in client `overview.md` `next_action`; add approval-queue item if client email needed |
| Daily spend >150% of stated daily budget | Pause campaign; verify tCPA and budget caps |
| Presence or Interest detected | Change to Presence Only immediately; note in Agent Memory |
| Alcohol-term match on Bar Crawl assets | Reject draft before upload; never submit |
| MFA warning from Google | Approval queue item; do not wait for deadline |

## Pre-Flight Checklist (run before every launch)

- [ ] Location = Presence Only (screenshot or API confirmation)
- [ ] Bidding strategy has tCPA or hard daily cap
- [ ] Copy scanned against client banned-term list
- [ ] Conversion actions match client rules (no phone calls for Replenish)
- [ ] Correct Momentum 360 branding on reports and client comms (not Buzz Bull)
- [ ] Align HCM assets excluded from M360 workflows

## Notes

- Populated 2026-07-12 from verified vault evidence by Cursor autonomous loop.
- Machine enforcement: future skills should grep drafts against banned terms and frontmatter `tier` before any external submit.
