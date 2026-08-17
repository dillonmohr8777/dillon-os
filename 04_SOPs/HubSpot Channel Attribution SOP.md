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
7. Workflow that posts `#360leads`: Zapier zap `332246329` still maps Source to CallRail `source`. HubSpot workflow `1868243574` copies `hs_analytics_source` into empty `source` five minutes after create. Remap the zap to `hs_analytics_source` when Zapier access exists.
8. Optional WordPress/GTM: add hidden CF7 fields on form 804 for `gclid`, `utm_source`, `utm_medium`, `utm_campaign`. Public container is `GTM-WHKR99SC`.

## CLI

```
node _os/automation/bin/hubspot-attribution-repair.js --dry-run
node _os/automation/bin/hubspot-attribution-repair.js --apply --confirm-apply
node _os/automation/bin/hubspot-attribution-repair.js --workflows --dry-run
node _os/automation/bin/hubspot-attribution-repair.js --workflows --apply --confirm-apply
```

`--apply` requires `JASON_HUBSPOT_PRIVATE_APP_TOKEN` or `HUBSPOT_TOKEN`, verifies portal 50612503, and still refuses if the named segments are missing. Live apply 2026-08-17: organic 32→7, PMax 32→23, overlap 19→0. `--workflows --apply --confirm-apply` created Source-copy `1868243574` and organic-notify `1868243571`.
