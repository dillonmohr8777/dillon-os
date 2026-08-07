---
type: handoff
title: Align HCM reporting-stack Edge audit
date: 2026-07-30
source: browser-session ("Edge pass") audit, pasted by Dillon; captured by the site-health watchdog on 2026-08-01
portal: HubSpot 242825734 (Align HCM, alignhcm.com)
---

# Align HCM reporting-stack Edge audit (2026-07-30)

Portal identity proved and the Edge pass is done. Real misconfigurations were found and fixed,
verified against live data, with one hard stop that blocks the entire Google half of the stack.

## Identity proof
HubSpot portal **242825734**, "Align HCM", domain alignhcm.com, signed in as **Dillon Mohr
(dillon.mohr@alignhcm.com), Super Admin**. Portal 50612503 never touched. LinkedIn signed in as
**Maher El-Abdallah**, admin of the Align HCM Page (company ID 64272837).

## HARD STOP - Google stack has no session
`analytics.google.com`, `search.google.com/search-console`, and `console.cloud.google.com` all
bounce to the same account chooser (dillonmohr8777@gmail.com and pollotharuler@gmail.com, both
personal Gmail, both signed out). No @alignhcm.com Google identity. GA4 UI sections could not be
executed inside GA4; GA4 was instead verified from the production site, which produced the biggest
findings of the run.

## Audit summary

**Successfully activated**
- "Expressing Interest" stage corrected from closed-lost/0% to 10% open in UKG, Dayforce, and
  Paylocity pipelines; "Referral Received" corrected in Channel Pipeline.
- HubSpot page-click / CTA event collection turned ON (was OFF).
- Five normalized attribution fields created in the existing "Align attribution" group:
  `align_ai_referral_engine`, `align_attribution_confidence`, `align_attribution_evidence`,
  `align_hubspot_visitor_id`, `align_revenue_attribution_status`.
- SEO rescan of alignhcm.com kicked off (last scanned Jan 20 2026).

**Already configured and verified**
- GA4 stream **G-0Y6LQTTBRJ** is live and collecting from www.alignhcm.com. HubSpot tracking code
  validated. Cross-domain linking, bot filtering, intent data, internal-IP exclusions all on.
  Consent Mode v2 present. The 33 existing Align attribution fields intact; native Original Source
  untouched.
- HubSpot has a native **AI Referrals** channel and it is receiving data: **291 sessions YTD**
  (1.03% conv), **25 sessions in the last 30 days at 8% session->contact** (best of any channel).
- July (last 30d) sessions: Direct 621 / Organic search 515 / Referrals 218 / Organic social 97 /
  AI Referrals 25 / Other 4 / Email 1 = 1,481. YTD 2026: 10,747 sessions; 2,333 new contacts of
  which **Offline sources 2,170 (93%)**.
- UKG deals: Closed Won 753 deals **$53.6M**; open pipeline ~**$14.6M** ($4.77M weighted).
- LinkedIn Company Page connected and reporting. Native Page (6/30-7/29): 5,477 impressions, 129
  reactions, 10 comments, 100% organic; HubSpot under-reports (1,833 in HubSpot for the same window).

**Requires Dillon (MFA / consent)**
Everything Google: GA4 enhanced measurement, 14-month retention, internal-traffic filters, Signals,
Search Console link, custom dimensions, generate_lead key-event promotion, attribution settings,
BigQuery link, GA4 Data API and Search Console API. Also the HubSpot Google Search Console app
install, the X account reconnect, the LinkedIn CSV export, and the Claude connector re-auth.

**Requires higher subscription**
HubSpot Attribution reporting, Clicks over time, Clicks by page - Marketing Hub Enterprise.

**Platform limitation**
LinkedIn personal-profile analytics (Maher's posts) return N/A for impressions/shares in HubSpot;
even Page posts only report when published through HubSpot. Native export is the workaround.

## Production site findings (the biggest of the run)
- **GA4 G-0Y6LQTTBRJ confirmed live** from www.alignhcm.com (`POST google-analytics.com/g/collect
  ...tid=G-0Y6LQTTBRJ...en=page_view`).
- **Duplicate GA4 config**: fires twice per pageview; `template_align-attribution.min.js` loads
  twice (inside and immediately after the `align-attribution-global-footer` block). Needs a dev to
  remove one include.
- **Invalid GA4 ID in HubSpot**: the "Integrate with Google Analytics 4" field holds
  `G-320235048`, not a valid measurement ID, actively sending page_view/user_engagement into a
  non-existent property. Left unchanged (no edit made). Decision needed: repoint to G-0Y6LQTTBRJ or
  uncheck (recommend uncheck).
- **CTA form** posts only name/email/phone/company/service_interest/message + hutk to form
  `e733d928-0f1d-4b41-853b-df1e0096f330`. This is the direct cause of ~0% fill on all 33 attribution
  properties. A dev must add the `align_*` fields to the payload before deterministic workflows can
  read anything.
- Caveat: every `google-analytics.com/g/collect` returned HTTP 503 during capture (both IDs),
  HubSpot endpoints returned 200. Possibly transient; re-check realtime once signed into GA4.

## Three things needed from Dillon
- **A. Invalid GA4 ID.** Set the HubSpot field to `G-0Y6LQTTBRJ`, or uncheck the integration
  (recommended uncheck: G-0Y6LQTTBRJ is already deployed via the theme, so pointing HubSpot at it
  too would triple-count).
- **B. Claude connector 16228553 re-auth.** Re-auth grants 17 non-read-only scopes (CPQ quotes,
  marketing campaign/email writes, marketing events, plus reads on commerce/payments/conversations).
  Left pending; the one valuable scope, "View advanced revenue attribution data," needs Marketing
  Hub Enterprise anyway. Confirm before granting, or ask HubSpot to narrow the scope set.
- **C. Two production site code fixes** (not made in-session): remove the duplicate
  `align-attribution.min.js` include, and add the `align_*` fields to the footer CTA form payload.

## Not persisted by the browser session
It had browser tools only (no filesystem/git), so it could not write this handoff, update
`01_Clients/Align HCM.md`, or create a branch. This file is that handoff, captured by the watchdog.
