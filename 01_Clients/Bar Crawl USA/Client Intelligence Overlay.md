---
note_type: client_intelligence
status: active
client: Bar Crawl USA
client_id: bar-crawl-usa
relationship: client
division: Momentum 360
created: 2026-08-01
updated: 2026-08-01
evidence_as_of: 2026-07-15
verification_status: dated-evidence
intelligence_maturity: operational
keyword_state: operational
aeo_geo_state: developing
pipeline_state: developing
reporting_state: developing
workflow_state: developing
priority: high
next_action: "Repair confirmed-event schema and hub inventory, then connect city and theme demand to verified ticket outcomes."
review_on: 2026-08-08
source_refs:
  - "[[overview]]"
  - "C:/Users/dillo/Documents/Codex/projects/client-operations/clients/bar-crawl-usa/context/operating-context.md"
tags: [client-intelligence, bar-crawl-usa, events, seo, schema, ticketing]
---

# Bar Crawl USA Client Intelligence Overlay

## Executive operating thesis

Bar Crawl USA wins when live event inventory, city and theme demand, structured
event facts, landing pages, ticket destinations, and reporting agree exactly.
Seasonal speed matters, but unsupported cities, stale events, wrong years, or
broken schema destroy both trust and discovery.

## Current evidence snapshot

- The last verified inventory contained 12 live Halloween events.
- Confirmed issues included a Birmingham schema year of 2065 and an Atlanta
  organization state mismatch.
- Ten priority pages previously received SEO work, but the confirmed-inventory
  pivot supersedes unsupported page expansion.
- No ads were running at the last verified Slack status; historic ticket volume
  does not establish current delivery.

## Strategy-system coverage

| System | State | Evidence | Gap | Next move |
|---|---|---|---|---|
| Keyword and demand | Operational foundation | City, event, theme, date, ticket, and seasonal demand are explicit | Current query and ticket data need refresh | Map queries only to verified live inventory |
| Intent architecture | Operational foundation | City, theme, event, and hub pages exist | Unsupported and stale paths can compete or mislead | Establish one canonical event-page ownership map |
| AEO/GEO | Developing | Event, Organization, FAQ, and city facts are extractable | Schema and inventory parity contain errors | Validate every visible fact and JSON-LD field |
| Content | Developing | On-page SEO, FAQs, quick facts, and internal links exist | Seasonal reuse and expiry rules need automation | Add launch, update, sold-out, and archive states |
| Acquisition | Developing | Google, Meta, and Eventbrite history exists | Current delivery and approved inventory unknown | Re-verify before any campaign recommendation |
| Pipeline | Developing | Ticket sales are the business outcome | Platform-to-ticket attribution contract is not current | Join campaign, landing, Eventbrite, city, and order data |
| Reporting | Developing | GA4 and paid reporting routes exist | Historical volume must not be presented as current | Build event and city-level delivery-to-sale scoreboard |
| Workflow | Developing | Repeatable WordPress SEO work exists | Inventory truth is not yet the enforced upstream gate | Make confirmed inventory mandatory before generation |

## Demand and answer map

- **Primary entities:** event brand, crawl theme, city, venue or district, date,
  organizer, ticket destination, and current status.
- **High-intent jobs:** find an event in a city, confirm date and eligibility,
  understand what is included, compare themes, and buy a valid ticket.
- **Trust questions:** schedule, participating venues, check-in, age rules,
  refunds, attire, safety, accessibility, and changes—only from approved facts.
- **Hard exclusions:** unconfirmed cities, invented venues, stale dates, wrong
  geography, unsupported ticket links, and schema that differs from the page.

## Next evidence sprint

1. Export the approved live event inventory with stable event IDs.
2. Repair the known schema errors and validate page/schema parity.
3. Crawl hubs, canonicals, internal links, ticket destinations, and archive
   behavior.
4. Reconcile search queries and ticket sales by event, city, theme, and date.
5. Create a launch-to-archive checklist that blocks unsupported page creation.

## Shared systems

- [[12_Brain/03_Concepts/Keyword Research and Search Demand]]
- [[12_Brain/03_Concepts/Entity Authority and Citation Readiness]]
- [[12_Brain/03_Concepts/Content Systems and Distribution]]
- [[12_Brain/03_Concepts/Automation and Workflow Engineering]]
