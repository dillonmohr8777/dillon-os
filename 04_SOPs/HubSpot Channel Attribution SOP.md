---
note_type: sop
status: active
created: 2026-08-17
updated: 2026-08-17
owner: Dillon Mohr
area: hubspot
source: "[[12_Brain/raw/2026-08-17 - jason-hubspot-attribution]]"
tags: [sop, hubspot, attribution]
---

# HubSpot Channel Attribution SOP

## Purpose

Split organic GMB landing-page leads from Google PMax leads in Momentum 360 HubSpot, and keep `#360leads` Source filled.

## Live portal checklist (Tier 2)

1. Confirm portal 50612503 in the URL.
2. CRM → Segments → Contacts. Record size and Used In for `GMB_LP_Organic` and `Google P-max Suspensions`.
3. Open each filter. If both match the same landing-page URL and neither excludes Paid Search, that is the overlap.
4. Edit `GMB_LP_Organic`:
   • Original Traffic Source is any of Organic search, Direct traffic, Referrals, Offline, Other campaigns
   • Original Traffic Source is not Paid search
   • `gclid` and `utm_medium` do not contain `cpc`
5. Edit `Google P-max Suspensions`:
   • Original Traffic Source is Paid search
   • Campaign or `utm_campaign` contains the live Alexandra PMax name (confirm in Google Ads, do not reuse a dead Christian list name alone)
6. Confirm the two sizes no longer match. Spot-check five contacts in each.
7. Workflow that posts `#360leads`: map Source to `hs_analytics_source` (or the custom source property that actually has values).
8. Optional WordPress: add hidden CF7 fields on form 804 for `gclid`, `utm_source`, `utm_medium`, `utm_campaign`.

## CLI

```
node _os/automation/bin/hubspot-attribution-repair.js --dry-run
node _os/automation/bin/hubspot-attribution-repair.js --apply --confirm-apply
```

`--apply` requires `JASON_HUBSPOT_PRIVATE_APP_TOKEN` or `HUBSPOT_TOKEN`, verifies portal 50612503, and still refuses if the named segments are missing. Live apply 2026-08-17: organic 32→7, PMax 32→23, overlap 19→0.
