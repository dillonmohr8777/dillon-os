---
tags: [client, momentum360]
status: active
industry: food/beverage
start_date: 2026-03-23
rate: $500/mo
google_ads_id: 627-501-4654
---

# Fresh Blends / Replenish

## Overview
- **Contact:** Mia Lange
- **Website:** freshblends.com
- **Industry:** Self-serve smoothie kiosks in 7-Eleven locations (South Florida)
- **Tier:** Momentum 360 Account Manager
- **Rate:** $500/mo

## Services
- Paid Media Strategy Development (B2C focused)
- Google Ads Campaign Build (4 campaigns: Search, Local, PMax, + Meta to follow)
- Interactive HTML Strategy Presentation
- Dedicated Landing Page (in testing)

## Google Ads
- **Account ID:** 627-501-4654 (setup in progress)
- Awaiting: Google Ads Admin access + GBP Manager access for all 5 kiosk locations

## Key Brand Rules (from Mia)
- No calorie references, no "only 3 ingredients," no IQF/flash frozen language
- No "no staff, no mess" copy
- Add "smoothies" throughout headlines/descriptions
- Brand name: "Replenish" (not "Fresh Blends" in ads)
- Approved messaging: "Self-serve in about 60 seconds"
- No phone call conversions (don't want people calling 7-Eleven stores)
- Primary KPI: increase in daily drink sales
- Secondary KPI: increase in branded searches for "7-Eleven smoothies" in South Florida
- 56th Street location near a school — Gen Z / Gen Alpha targeting

## Status
Awaiting Google Ads Admin and GBP Manager access. Meta campaign to follow once Google campaigns are live.

## Links
- [[Client Index]]

## 2026-06 update — compiled from [[raw/2026-06-26 - intel-core-7-master-operating-transfer]]

- **Rule: keep 7-Eleven/Replenish distinct from Fresh Blends.** Separate location pages per location unless Mia (mia@getreplenish.com, CC Sean) changes direction. Also keep Kwik Trip distinct (#633 had a Google Ads destination mismatch, 2026-06-11).
- Live landing-page family: `7-11-smoothies-boca`, `-miami-56`, `-coral-springs` (.netlify.app) — approved production shell is the **Pompano** page (`mia-7-eleven-smoothies-pompano`; the `-pompano-review` page was NOT approved source). Shared hero asset: `smoothie-hero-six.png`.
- Tracking: Google tag GT-WBK85GCG; UTM parsing, `pageview_paid` on utm_campaign, direction-click events, hidden Netlify form `get-directions-click`. **Offline conversion stitching incomplete — no gclid capture.**
- Page QA checklist: HTTP 200, location text, tag present, 5 tracked CTAs, images 200, no horizontal overflow at 390/1366px, deploy-manifest 404s publicly.
- ROAS model: directions clicks → visit rate → purchase rate → AOV → modeled revenue. Howard campaign: 803 clicks, 50,109 impr, 1.60% CTR, $0.29 CPC, $229.60.
- Caveat: Boca store address was inferred once — confirm before paid traffic.
