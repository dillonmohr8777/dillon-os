---
tags: [ads-ops, client-spec]
source: "[[01_Clients/Fresh Blends - Replenish]]"
updated: 2026-07-04
---

# Replenish / 7-Eleven — Ads Spec

South Florida smoothie kiosks. $500/mo. Contact Mia Lange (CC Sean).

## Accounts & structure
- Google Ads: **627-501-4654**. Campaign 1 "Smoothie Near Me" (local Search),
  Campaign 2 gas-station/kiosk concept, **PMax at $200/location/mo
  (~$6.50/day)** across 5 kiosks. Meta follows once Google is proven.
- Tag: **GT-WBK85GCG**; UTM parsing, `pageview_paid`, direction-click events,
  hidden Netlify form `get-directions-click`.

## Brand rules (law — from Mia)
- Brand as **"Replenish"**, never "Fresh Blends"; "smoothies" everywhere;
  "Self-serve in about 60 seconds".
- **No phone-call conversions** (no calls to 7-Eleven stores).
- Banned language: calories, "3 ingredients", IQF, "no staff no mess".
- Keep 7-Eleven/Replenish ≠ Fresh Blends ≠ Kwik Trip. Negatives on file
  (protein shake, gym supplement, competitor brands).

## Cycle-1 actions
1. Fix **Kwik Trip #633 destination mismatch** in Google Ads (flagged 2026-06-11).
2. Add **gclid capture** to the LP family (offline conversion stitching gap).
3. Confirm Boca store address with Mia before more paid traffic (inferred once).
4. Per-location performance: kill/scale by store; 56th St skews Gen Z (near school).

## KPIs
Daily drink sales (primary, modeled via directions clicks → visit → purchase →
AOV); branded "7-Eleven smoothies" searches (secondary).

## Preflight 2026-07-04
Kwik Trip **#1161 paused** (holding); Pampano running. Pending: $500-cap
dollar check (cost column wouldn't render) and confirm #573/#633 Ended.
Source: [[raw/2026-07-04 - preflight-readback]].
