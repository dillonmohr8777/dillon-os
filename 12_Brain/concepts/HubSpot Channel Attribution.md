---
tags: [concept, hubspot, ads]
source: "[[12_Brain/raw/2026-08-17 - jason-hubspot-attribution]]"
updated: 2026-08-17
expires: 2026-11-17
---

# HubSpot Channel Attribution

**Summary:** Original source is first-touch and sticky. Segment filters that key only on a shared landing-page URL will mix paid Google Ads and organic website leads.

HubSpot stamps [Original Traffic Source](https://knowledge.hubspot.com/properties/understand-traffic-source-properties) at first identification and keeps it unless someone edits it. Latest Traffic Source updates on later sessions. Paid Search drill-down 1 is the `utm_campaign` value. You can [filter contacts and segments on those properties](https://knowledge.hubspot.com/records/update-and-filter-contacts-using-traffic-source-properties).

Paid and organic GMB traffic on Momentum 360 both hit `fixmygooglelisting.com` CF7 form 804 under tracking portal 50612503. The form has no hidden `gclid` or UTM fields, so HubSpot falls back to the tracking cookie. An organic submit after an ads click stays Paid Search. A segment that only matches the landing-page URL mixed `GMB_LP_Organic` and `Google P-max Suspensions` (32/32, 19 shared). After the 2026-08-17 filter merge those lists are 7 and 23 with overlap 0. Organic now has HubSpot email/in-app routing on list 302. Empty CallRail Source is filled from Original Traffic Source five minutes after contact create. `#360leads` Slack still reads CallRail Source at create via Zapier. Contact properties `utm_source` / `utm_medium` / `utm_campaign` / `utm_content` / `utm_term` exist as form fields as of 2026-08-17 so a later CF7 or GTM inject can map by name. Inject URL params only; do not copy the gclid cookie onto organic revisits.

Correct split:

- Organic segment: website/organic/direct, exclude Paid Search and `gclid` / `utm_medium=cpc`.
- PMax segment: Paid Search plus live campaign/UTM names, not the old Christian-era list name alone.
- Slack `#360leads` Source must read `hs_analytics_source` (or a filled custom property). An empty mapping prints `Source =` with nothing after it. Zapier zap `332246329` still needs that remap. Catch-all zap `332246329` also overlaps PMax zap `369135469` and Meta zap `368432826`; filter the catch-all, do not pause the campaign zaps.

## Links

- [[12_Brain/projects/HubSpot Attribution Repair]]
- [[12_Brain/concepts/Conversion Tracking Setup 2026]]
- [[11_Agents/HubSpot Agent]]
