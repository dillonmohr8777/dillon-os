---
note_type: project
status: active
created: 2026-07-30
updated: 2026-07-30
owner: Dillon Mohr
area: paid media
priority: critical
outcome: Omega, Onsite, and KJB optimize toward verified service-fit opportunities, estimates, appointments, and booked work instead of raw platform events.
next_action: Send the prepared Omega access request, connect the approved lead export after admin access lands, publish the prepared Onsite Search replacement after Google's human security confirmation, then reconcile recent calls and forms to named qualified outcomes.
review_on: 2026-08-01
source_refs:
  - "[[12_Brain/01_Captures/2026-07-30 - Dillon operating goals and revenue-first delegation]]"
  - https://momentum3d.slack.com/archives/C09DP3AMNQ7/p1785429069958449
  - "Google Ads live read-only audit 2026-07-30"
tags:
  - brain
  - project
  - paid-media
  - lead-quality
  - revenue
---

# Qualified pipeline recovery

## Immediate diagnosis

Platform “conversions” are not currently a safe proxy for qualified business
opportunities.

### Omega Landscaping and Concrete

- Live Google Ads account: `285-398-1364`.
- The $50/day Performance Max campaign was the only enabled campaign at the
  start of the audit.
- June 30 through July 29: $1,503.85 spend, 710 clicks, five platform
  conversions.
- July 23 through July 29: $318.14 spend and no platform conversions.
- The search-term report attributes four conversions to the competitor query
  `timberline landscaping`; the same query appears as a top bidding signal.
- The account records three form submissions and two calls, but no qualified
  or converted lead stage is populated.
- Existing Search campaigns are paused. The standard Search campaign contains
  exact-match hardscaping and concrete intent, but its campaign budget is
  $70/day, its ad groups are also paused, its location setting is `All
  countries and territories`, and Google shows no optimization goal. It uses
  Manual CPC. Its negative structure also needs review before reuse.

**Conclusion:** this is not only a negative-keyword problem. Performance Max is
learning from wrong-company behavior because calls/forms are treated as
primary outcomes without downstream qualification. The dormant Search campaign
must be rebuilt or corrected before activation; merely switching it on would
create a new location and measurement failure.

**Immediate action:** Dillon explicitly requested Search-only delivery. The
Performance Max campaign was paused in the live account on 2026-07-30 after the
wrong-company signal and unsafe dormant Search settings were verified. No
replacement was enabled blindly.

**Published correction:** `Search | High Intent | Colorado Springs |
2026-07-30` is enabled at $50/day. It uses Google Search only, Maximize Clicks
with an $8 CPC ceiling, 15 phrase/exact high-intent keywords, one responsive
Search ad, AI Max/text customization/final URL expansion off, and presence-only
targeting for Colorado Springs, Monument, Falcon, Peyton, and Black Forest.
Campaign ID: `24082267830`.

### Onsite Concrete and Landscape

- Live Google Ads account: `103-371-5894`.
- Two campaigns are enabled: a Smart campaign and Performance Max.
- June 30 through July 29: $254.38 combined spend, 1,363 clicks, and 46.99 raw
  platform conversions.
- Google shows no qualified or converted lead stage.
- Thirty-four of the recorded all-conversion events come from the primary
  `Web Phone Calls` action, which is flagged `Needs attention`.
- The Smart campaign reports 44.3K impressions, 1,053 clicks, no calls, and one
  website conversion on $125.69.
- One of two Performance Max asset groups is disapproved for a non-working
  destination.

**Conclusion:** delivery is active, but the conversion model and destination
health are not reliable enough to guide budget or bidding.

**Live correction:** the Smart campaign and `Leads-Performance Max-1` were
paused on 2026-07-30. A Search-only replacement named `Search | High Intent |
Solano County | 2026-07-30` is fully prepared at the same combined $9.39/day
spend ceiling with Maximize Clicks, an $8 CPC ceiling, 14 phrase/exact
high-intent keywords, one responsive Search ad, AI Max off, Search Partners and
Display off, and presence-only targeting for Vacaville, Davis, Dixon,
Fairfield, Napa, Winters, and Suisun City. Google requires a human security
confirmation before the prepared draft can be published. Draft ID:
`10207039555`.

### Kimberly James Bridal

- Live Google Ads account: `814-550-6229`.
- The old Performance Max campaign is paused.
- The Philadelphia Search campaign is enabled at $20/day.
- Since launch it has spent $53.96 for 16 clicks at a 5.90% CTR.
- Google explicitly warns that the Search campaign's submit-lead-form goal is
  missing a usable primary conversion action for optimization.
- The only website `Submit lead form` action is primary but flagged
  `Needs attention`; the Google-hosted lead form is secondary.
- The active Search campaign was changed to campaign-specific `Submit lead
  forms` using the website source, removing the broken Google-hosted goal from
  bidding. The campaign remains enabled at $20/day.
- Current Meta state could not be reverified because Ads Manager required a
  human passkey. The last local execution evidence says the qualified Instant
  Form campaign was published on 2026-07-27 and was still processing.

## Recovery sequence

1. Reconcile every recent call/form to a named service-fit outcome.
2. Establish one primary offline outcome per client:
   - Omega: qualified opportunity.
   - Onsite: qualified estimate.
   - KJB: verified appointment request, followed by booked appointment.
3. Keep phone clicks, form starts, raw calls, directions, and page views as
   secondary diagnostics.
4. Build a Search-first structure separated by service line and geography.
5. Add verified competitor, supplier, vendor, employment, DIY, materials-only,
   and wrong-company negatives from real inquiry evidence.
6. Verify location presence, Search Partners, landing-page identity, phone
   number, call duration, form delivery, and CRM ownership.
7. Use Performance Max only after qualified outcomes are imported and volume is
   sufficient for automation.
8. Review twice weekly until three consecutive weeks reconcile platform events
   to real pipeline.

## Omega execution follow-up — 2026-07-30

- Published 30 campaign-level negative keywords covering employment, training,
  DIY, supplier/vendor, materials-only, equipment-rental, research-only,
  retailer, and the verified `timberline landscaping` wrong-company intent.
- Changed the active campaign from account-default conversion reporting to
  campaign-specific reporting for `Submit lead forms` and `Phone call leads`;
  generic `Contact` activity is excluded.
- Rejected Google's Maximize Conversions recommendation because its suggested
  $161.16 target CPA is derived from historically polluted raw conversions.
- Rejected Google's 29-keyword Broad-match bundle. Keep phrase/exact control
  until qualified lead volume and a stable exclusion set exist.
- Verified that `AW-16794883273` and `GTM-TRPJ69M7` load on the Omega website.
  Individual enabled conversion actions still show no recent recording
  activity.
- Offline qualified-opportunity setup reaches Google's customer-data policy
  attestation. An authorized client owner must confirm the legal/data-policy
  statement before activation; do not attest automatically.
- Website conversion blockers verified live:
  homepage-looping CTA links, no click-to-call phone link, `CONRETE` header
  typo, generic placeholder copy, and no completed end-to-end form test.

## Omega qualified-pipeline activation — 2026-07-30

- Dillon approved the customer-data policy attestation.
- Enabled enhanced conversions for leads through Omega's existing Google tag.
- Created `Omega Qualified Lead (Upload)` and
  `Omega Won Contract (Upload)` as primary offline conversion actions.
- Qualified leads count once per ad interaction; won contracts accept
  transaction-specific values.
- Google confirmed both actions were created. They remain pending a connected
  data source or validated upload process, so the Search campaign remains on
  Maximize Clicks rather than being pointed at empty conversion signals.
- Next execution step: reconcile each real call/form to service fit and outcome,
  then import only qualified leads and won contracts with their privacy-safe
  identifiers and verified values.

## Omega direct lead capture and permission audit — 2026-07-30

- Published and enabled Google Ads lead-form asset `400863777374` on campaign
  `24082267830`; Google currently reports `Pending` and `Under review`.
- The form requires full name, email, verified phone, and ZIP code, and uses a
  qualifying service question plus Google's `More qualified` optimization
  setting.
- Attempted the native Google Ads integration for Google Sheets through
  Zapier. Authorization is blocked by account permissions.
- Live Google Ads access review:
  - `dillonmohr8777@gmail.com`: Standard.
  - `elitelandscapingconcrete@gmail.com`: Admin.
  - `john.belaska@gmail.com`: Standard.
  - `sam@gadsnomads.com`: Standard.
- Live GoHighLevel verification found only the unrelated `REVIVE Systems`
  location. Omega is not available to Dillon's current login.
- Gmail confirms the Omega Wix Studio invitation granted only `Billing
  Manager`, not website-editing access.
- Prepared, but did not send, Gmail draft `r4420360796608729033` requesting:
  Wix Website Manager or Co Owner, Google Ads Admin, and Omega-only
  GoHighLevel access for contacts, opportunities, workflows, forms, and
  integrations.
- Safe temporary operating path: download the lead form's `CSV for CRM` from
  Google Ads until the automated export is authorized.

## Human gates

- Meta Ads Manager passkey for the current KJB live-status read.
- Google human security confirmation to publish the prepared Onsite Search
  replacement. The browser-side confirmation flow is currently blocked before
  it displays a number-match value.
- Omega permissions: Google Ads Admin for the lead export, Wix Website Manager
  or Co Owner for landing-page fixes, and access to the Omega GoHighLevel
  location. The drafted request remains unsent pending Dillon's review.

## Client records

- [[01_Clients/Omega Landscaping/Agent Memory]]
- [[01_Clients/Onsite Concrete/Agent Memory]]
- [[01_Clients/Kimberly James Bridal/Agent Memory]]
