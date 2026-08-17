---
tags: [concept, hubspot, ads]
source: "[[12_Brain/raw/2026-08-17 - jason-hubspot-attribution]]"
updated: 2026-08-17
expires: 2026-11-17
---

# HubSpot Channel Attribution

**Summary:** Original source is first-touch and sticky. Segment filters that key only on a shared landing-page URL will mix paid Google Ads and organic website leads.

HubSpot stamps [Original Traffic Source](https://knowledge.hubspot.com/properties/understand-traffic-source-properties) at first identification and keeps it unless someone edits it. Latest Traffic Source updates on later sessions. Paid Search drill-down 1 is the `utm_campaign` value. You can [filter contacts and segments on those properties](https://knowledge.hubspot.com/records/update-and-filter-contacts-using-traffic-source-properties).

Paid and organic GMB traffic on Momentum 360 both hit `fixmygooglelisting.com` CF7 form 804 under tracking portal 50612503. The form has no hidden `gclid` or UTM fields, so HubSpot falls back to the tracking cookie. An organic submit after an ads click stays Paid Search. A segment that only matches the landing-page URL therefore fills `GMB_LP_Organic` and `Google P-max Suspensions` with the same 32 contacts.

Correct split:

- Organic segment: website/organic/direct, exclude Paid Search and `gclid` / `utm_medium=cpc`.
- PMax segment: Paid Search plus live campaign/UTM names, not the old Christian-era list name alone.
- Slack `#360leads` Source must read `hs_analytics_source` (or a filled custom property). An empty mapping prints `Source =` with nothing after it.

## Links

- [[12_Brain/projects/HubSpot Attribution Repair]]
- [[12_Brain/concepts/Conversion Tracking Setup 2026]]
- [[11_Agents/HubSpot Agent]]
