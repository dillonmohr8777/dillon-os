---
note_type: client_intelligence
status: active
client: Fresh Blends / Kwik Trip
client_id: fresh-blends-kwik-trip
relationship: client
division: Momentum 360
created: 2026-08-01
updated: 2026-08-01
evidence_as_of: 2026-07-26
verification_status: dated-evidence
intelligence_maturity: operational
keyword_state: developing
aeo_geo_state: developing
pipeline_state: developing
reporting_state: operational
workflow_state: operational
priority: medium
next_action: "Keep all four Ice Box campaigns paused until restart authority, store scope, and measurement definitions are confirmed."
review_on: 2026-08-08
source_refs:
  - "[[overview]]"
  - "C:/Users/dillo/Documents/Codex/projects/client-operations/clients/fresh-blends-kwik-trip/context/operating-context.md"
  - "C:/Users/dillo/Documents/Codex/projects/client-operations/clients/fresh-blends-kwik-trip/deliverables/2026-07-26-weekly-performance-dashboard/source-data.json"
  - "C:/Users/dillo/Documents/Codex/projects/client-operations/clients/fresh-blends-kwik-trip/paid-media/launch-authority.json"
tags: [client-intelligence, fresh-blends, kwik-trip, google-ads, retail, reporting]
---

# Fresh Blends / Kwik Trip Client Intelligence Overlay

## Executive operating thesis

Fresh Blends is a store-level demand and reporting system whose most important
current property is separation: it shares infrastructure with Replenish but not
campaign truth, store scope, metrics, launch authority, or conclusions. Paused
delivery is a valid current result, not a reason to borrow activity from another
brand.

## Current evidence snapshot

- Live Google Ads evidence through July 26 recorded four Ice Box campaigns as
  paused with no active delivery asserted.
- Replenish metrics were explicitly excluded from the Fresh Blends dashboard.
- Historical reporting contains store-level clicks and directions, but it does
  not establish the current week or downstream store visits and sales.
- Restart authority, exact store scope, and conversion definitions remain gates.

## Strategy-system coverage

| System | State | Evidence | Gap | Next move |
|---|---|---|---|---|
| Keyword and demand | Developing | Store and location campaigns produced search/direction signals historically | Search terms and store-level intent need current export | Classify queries by store, product, brand, navigation, and wrong intent |
| Intent architecture | Developing | Fresh Blends landing-page lane exists | Store/page/GBP parity and ownership unknown | Map exact store destinations before restart |
| AEO/GEO | Developing | Store entities and local discovery are relevant | GBP, website, menu/product, hours, and location parity unverified | Audit only confirmed locations and facts |
| Content | Developing | Creative specs and landing pages exist | Current approved offers and assets need validation | Build store-specific proof and destination library |
| Acquisition | Paused | Four Ice Box campaigns verified paused | Restart authority and measurement definition missing | Keep blocked until explicit activation inputs exist |
| Pipeline | Developing | Direction intent is a useful intermediate action | Visit, purchase, and incremental value are unknown | Define store outcome hierarchy and limitations |
| Reporting | Operational | Separate delivery-status dashboard exists | Live outcomes beyond pause are unavailable | Continue honest status reporting with no blended totals |
| Workflow | Operational | Launch authority and separate blueprints exist | Restart trigger and checker need current approval | Require store, budget, dates, events, and approval receipt |

## Measurement contract

```text
campaign/store -> landing or local surface -> direction or other intent
-> verified store visit or approved proxy -> transaction/outcome when available
```

Directions are not automatically visits or purchases. Keep modeled, platform,
and business outcomes labeled separately.

## Next evidence sprint

1. Confirm whether a restart is desired and who can authorize it.
2. Verify the exact store list, landing pages, GBP destinations, dates, budgets,
   and conversion definitions.
3. Export search terms and prior store-level results without Replenish rows.
4. Establish a complete pre-restart baseline and QA campaign/URL/UTM parity.
5. Resume only after the launch gate passes; then measure a complete store-level
   window before optimization.

## Shared systems

- [[12_Brain/03_Concepts/Keyword Research and Search Demand]]
- [[12_Brain/03_Concepts/Local Search and Maps Site Parity]]
- [[12_Brain/03_Concepts/Client Reporting and Outcome Scoreboards]]
- [[12_Brain/03_Concepts/Agent Governance and Verification]]
