---
note_type: client_intelligence
status: active
client: Replenish / 7-Eleven
client_id: replenish-7-eleven
relationship: client
division: Momentum 360
created: 2026-08-01
updated: 2026-08-01
evidence_as_of: 2026-07-26
verification_status: dated-evidence
intelligence_maturity: operational
keyword_state: operational
aeo_geo_state: developing
pipeline_state: developing
reporting_state: operational
workflow_state: operational
priority: high
next_action: "Preserve store-level separation and validate direction intent against approved business outcomes before city budget changes."
review_on: 2026-08-08
source_refs:
  - "[[overview]]"
  - "C:/Users/dillo/Documents/Codex/projects/client-operations/clients/replenish-7-eleven/context/operating-context.md"
  - "C:/Users/dillo/Documents/Codex/projects/client-operations/clients/replenish-7-eleven/deliverables/2026-07-26-weekly-performance-presentation/source-data.json"
tags: [client-intelligence, replenish, seven-eleven, google-ads, locations, reporting]
---

# Replenish / 7-Eleven Client Intelligence Overlay

## Executive operating thesis

Replenish is a multi-location optimization system. Each city and store needs a
verified campaign, destination, location fact set, budget, direction-intent
definition, and outcome trail. Modeled direction clicks are planning signals;
they are not observed visits, sales, or incremental revenue.

## Current evidence snapshot

- Authenticated Google Ads evidence for July 20–26 recorded $153.72 spend,
  5,049 impressions, 288 clicks, 5.70% CTR, and $0.53 average CPC.
- Six of seven campaign rows had spend; row sums matched the account total and
  Fresh Blends was explicitly excluded.
- Weekly direction clicks were modeled from verified ad clicks and stated rates;
  conversion reporting remained pending validation.
- No canonically mapped Replenish Meta account was exposed in the verified
  selector, so no Meta metrics were attributed.

## Strategy-system coverage

| System | State | Evidence | Gap | Next move |
|---|---|---|---|---|
| Keyword and demand | Operational foundation | City/store campaigns and click patterns exist | Search-term and store-outcome reconciliation incomplete | Classify queries and themes per market/store |
| Intent architecture | Developing | Location pages and campaign destinations exist | Store/GBP/page parity and canonical ownership need audit | Validate every destination and local fact |
| AEO/GEO | Developing | Store/location entities and local actions are central | Entity parity, merchant/local proof, citations, and AI baseline unknown | Audit exact approved locations only |
| Content | Developing | Location creative and reporting assets exist | Approved offer and store proof vary | Create reusable assets with location-specific fact fields |
| Acquisition | Operational | Seven campaign rows and complete source period exist | Future budgets/restarts remain approval-gated | Optimize only after full-window and outcome review |
| Pipeline | Developing | Click and modeled direction intent are available | Visits, transactions, incremental lift, and value not linked | Define approved store-outcome hierarchy |
| Reporting | Operational | Source data labels observed versus modeled and excludes Fresh Blends | Business-outcome layer missing | Maintain observed/modeled/outcome separation |
| Workflow | Operational | Deck, dashboard, methodology, and location reporting system exist | Store activation/change receipts need one canonical ledger | Add city/store owner, approval, state, and event definition |

## Measurement contract

Report observed spend, impressions, clicks, and campaign state separately from
modeled direction clicks. Report verified store visits, redemptions, transactions,
or sales only when an authorized source and definition exist. Never use one
client's store rows to fill gaps in another account.

## Next evidence sprint

1. Re-verify current city/store campaign state and billing before changes.
2. Export query/theme and destination data by market.
3. Validate store name, location, page, GBP, UTM, and campaign parity.
4. Agree on the business outcome or defensible proxy and its limitations.
5. Use a complete period to compare markets, creative, direction intent, and
   verified outcomes before budget shifts.

## Shared systems

- [[12_Brain/03_Concepts/Keyword Research and Search Demand]]
- [[12_Brain/03_Concepts/Local Search and Maps Site Parity]]
- [[12_Brain/03_Concepts/Client Reporting and Outcome Scoreboards]]
- [[12_Brain/03_Concepts/Agent Governance and Verification]]
