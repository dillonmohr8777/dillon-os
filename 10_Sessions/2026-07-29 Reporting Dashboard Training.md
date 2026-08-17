---
note_type: meeting
status: complete
created: 2026-07-30
updated: 2026-07-30
meeting_date: 2026-07-29
client: Momentum 360
project: Reporting automation
attendees:
  - Nick Groh
  - Melissa Silber
  - Dillon Mohr
source_refs:
  - "gmail:thread:19faf975f02639c9"
  - "gmail:thread:19faf9daae5c2e2f"
tags: [brain, meeting, momentum360, reporting, automation]
---

# Reporting Dashboard Training

## Outcome

Evaluate a reusable client-reporting workflow that turns verified Google Sheets data into client-facing dashboards, embeds the presentation in Google Sites, and pairs delivery with a short recorded walkthrough.

## Demonstrated workflow

1. Export Google Ads, GA4, Search Console, and product or CRM data at day-level granularity.
2. Publish controlled Google Sheets or CSV views for the dashboard pipeline.
3. Use a dedicated per-client Claude conversation to preserve reporting history and iterate on bugs or updates.
4. Generate the client-facing dashboard and embed it in a Google Sites presentation.
5. Record a short interpretation video so clients receive conclusions, not only charts.

## Important controls

1. Human validation of date ranges, filters, totals, and source parity is mandatory because model aggregation can be wrong.
2. Lead qualification may still require manual mapping when a client lacks a CRM.
3. Call duration can be a useful qualification input, but the threshold must be client-specific and verified.
4. Publish-to-web sharing creates a security review requirement before broad adoption.
5. Refresh cadence affects connector usage and cost.

## Economics discussed

1. Claude was described as approximately $20 per month.
2. A Sheets connector such as SyncWith was described as approximately $20 to $50 per month.
3. Refresh frequency is a primary cost driver.

## Commitments

1. [ ] Nick shares the reusable dashboard template.
2. [ ] Nick maintains the dedicated Zaret dashboard conversation.
3. [ ] Melissa shares the Read AI and Dillon recordings with the team.
4. [ ] Dillon evaluates which clients need granular dashboards and which can use a lighter reporting lane.
5. [ ] The independent checker validates source totals before any client delivery.

## Linked knowledge

1. [[Communication Intelligence Map]]
2. [[04_SOPs/Communication Intelligence Ingestion|Communication Intelligence Ingestion]]
