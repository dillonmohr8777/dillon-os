---
note_type: research
status: reference
created: 2026-08-16
updated: 2026-08-16
owner: Dillon Mohr
verification_status: partial
tags: [brain, research, gbp, google, mcp]
---

# 2026-08-16 Google Business Profile API Receipts

Research receipts for "use the official Google ops MCPs; do we need a data
lake; I also need Google Business APIs."
Not an install list. Does not authorize connect, send, spend, or account change.
Skeptic pass ran same day (fresh context). Survivors compiled to
`12_Brain/concepts/Google Business Profile API 2026.md`.

No official GBP MCP URL was invented. Merchant MCP and Maps Grounding Lite
were checked so they are not mistaken for listing ops.

## Frame (vault, not a vendor receipt)

- Operator asked to wire the official Google ops set (Ads, Workspace
  Gmail/Drive/Calendar, Maps Grounding Lite, Developer Knowledge) and to
  cover Google Business Profile APIs.
- Data-lake skip is vault judgment. Official Cloud remotes include Cloud
  Storage and Bigtable; those pages do not say this business needs them.
- BigQuery MCP is already vault-declared from the blind-spot batch. It is
  only useful if Ads/GA4 already export there.

## Receipts — official first-party pages fetched 2026-08-16

### No official GBP MCP

- Claim: Google Cloud remote MCP table lists Workspace remotes (Gmail,
  Drive, Calendar, Chat, People), Maps Grounding Lite
  (`https://mapstools.googleapis.com/mcp`), Developer Knowledge, Design,
  Stitch, BigQuery, Cloud Storage (`https://storage.googleapis.com/storage/mcp`),
  Bigtable, and many infra remotes. It has no Business Profile / my-business
  row.
  Source: https://docs.cloud.google.com/mcp/supported-products
  Date: accessed 2026-08-16. Official.
  Skeptic: SINGLE-SOURCE. Absence on this table is not a positive "there is
  no GBP MCP anywhere." The same page also omits Merchant (Merchant has its
  own official MCP page) and points local Google-maintained servers at an
  unfetched GitHub repo.

- Claim: Official GBP docs are REST/RPC APIs. Business Information service
  endpoint is `https://mybusinessbusinessinformation.googleapis.com`.
  Legacy Google My Business API service endpoint is
  `https://mybusiness.googleapis.com`.
  Source: https://developers.google.com/my-business/reference/businessinformation/rest
  Also: https://developers.google.com/my-business/reference/rest
  Date: accessed 2026-08-16. Official.
  Skeptic: SURVIVE as API hosts. Do not turn these into invented `/mcp`
  URLs.

- Claim: Community GBP MCP wrappers are not first-party. Do not fill the
  official gap with them.
  Source: prior catalog kill in
  `12_Brain/raw/research/2026-08-16 MCP Stack Catalog 50 Receipts.md`
  (narkov, A1-x-Tech named there). Not re-fetched this pass.
  Skeptic: EXTRA KILL on community wrappers and invented hostnames.

### GBP API access (operator gate)

- Claim: Access requires a Google Account; familiarity with Business
  Profile; a Google Cloud project; an Organization account; then a request
  for API access.
  Source: https://developers.google.com/my-business/content/prereqs
  Date: accessed 2026-08-16. Official.
  Skeptic: SURVIVE.

- Claim: Applicants must manage a Google Business Profile that is verified
  and active for 60+ days (own office/HQ or a client they manage) and have
  a website representing the business listed on that GBP. Request uses the
  GBP API contact form, dropdown "Application for Basic API Access." Use an
  address listed as owner/manager on that GBP. Provide the Cloud project
  number.
  Source: https://developers.google.com/my-business/content/prereqs
  Date: accessed 2026-08-16. Official.
  Skeptic: SURVIVE.

- Claim: Approval check in Cloud Console quotas: 0 QPM = not approved;
  300 QPM = approved.
  Source: https://developers.google.com/my-business/content/prereqs
  Date: accessed 2026-08-16. Official.
  Skeptic: SURVIVE.

- Claim: Overview eligibility also requires a valid business reason and a
  valid business website URL. APIs can manage photos, posts, and reviews.
  For public local-business information / location awareness, use Google
  Maps Platform, not as a replacement for listing-management APIs.
  Source: https://developers.google.com/my-business/content/overview
  Date: accessed 2026-08-16. Official.
  Skeptic: SURVIVE the Maps-vs-GBP split. Maps page itself does not use
  the phrase "not a GBP substitute."

### Eight APIs after approval

- Claim: After approval, enable these eight APIs: Google My Business API,
  My Business Account Management API, My Business Lodging API, My Business
  Place Actions API, My Business Notifications API, My Business
  Verifications API, My Business Business Information API, My Business
  Q&A API. No sandbox. Use `validateOnly` to validate without modifying
  data. OAuth Playground example scope:
  `https://www.googleapis.com/auth/business.manage`. Example request URI:
  `https://mybusinessaccountmanagement.googleapis.com/v1/accounts`.
  Workspace orgs with Business Profile turned off get `403 PERMISSION DENIED`.
  Source: https://developers.google.com/my-business/content/basic-setup
  Date: accessed 2026-08-16. Official.
  Skeptic: SURVIVE. Do not invent a ninth MCP or treat Performance as
  part of this eight-row list (it is not on this page).

### Nearby official MCPs that are not GBP

- Claim: Maps Grounding Lite MCP is `https://mapstools.googleapis.com/mcp`.
  Tools: search places, lookup weather, compute routes, plus experimental
  resolve names / resolve Maps URLs. Billed per request. Quotas 300 QPM
  for the three main tools. Live calls need the Maps Grounding Lite API
  enabled plus an API key header or OAuth scope
  `https://www.googleapis.com/auth/maps-platform.mapstools`.
  Source: https://developers.google.com/maps/ai/grounding-lite
  Date: accessed 2026-08-16. Official.
  Skeptic: SURVIVE. Not posts, reviews, or listing edits.

- Claim: Merchant API MCP Access Service (Alpha) is
  `https://merchantapi.googleapis.com/mcp`. Merchant Center products,
  data sources, reports. Scope `https://www.googleapis.com/auth/content`.
  Not on the Cloud supported-products table fetched this pass.
  Source: https://developers.google.com/merchant/api/guides/agentic-tools/merchant-data-mcp
  Date: accessed 2026-08-16. Official. Alpha. Shared Merchant API quota.
  Skeptic: SURVIVE. EXTRA KILL if treated as GBP listing management.

- Claim: Official Google Ads MCP current release is read-only stdio:
  `pipx run --spec git+https://github.com/googleads/google-ads-mcp.git google-ads-mcp`.
  Env: `GOOGLE_PROJECT_ID`, `GOOGLE_ADS_DEVELOPER_TOKEN`. Tools:
  `get_resource_metadata`, `list_accessible_customers`, `search`. Auth is
  OAuth 2.0 or a service account / application default credentials.
  Cloud Run HTTP is an alternate host, not a mutate mode.
  Source: https://developers.google.com/google-ads/api/docs/developer-toolkit/mcp-server
  Date: accessed 2026-08-16. Official.
  Skeptic: SURVIVE.

- Claim: Official Gmail remote is `https://gmailmcp.googleapis.com/mcp/v1`
  (Developer Preview) on the Cloud Workspace table and the Workspace
  configure page. Inspector `tools/list` this day listed `create_draft`,
  `list_drafts`, read/search, and label/trash/spam tools. No send / reply
  / forward on that list.
  Source: https://docs.cloud.google.com/mcp/supported-products
  Also: https://developers.google.com/workspace/guides/configure-mcp-servers
  Inspector excerpt: `12_Brain/07_Reviews/MCP/2026-08-16 - gmail.md`
  Date: accessed 2026-08-16. Official + Inspector.
  Skeptic: SINGLE-SOURCE on calling the product "draft/label." Official
  page documents create/search/get with compose + readonly. Do not treat
  host session dumps that listed send as this server.

### Data lakes (vault judgment, not a receipt)

- Claim: Cloud remotes include Cloud Storage, Bigtable, Spanner, AlloyDB,
  Firestore, Pub/Sub, and other infra. They exist.
  Source: https://docs.cloud.google.com/mcp/supported-products
  Date: accessed 2026-08-16. Official.
  Skeptic: SURVIVE that the remotes exist.

- Claim: This vault does not need a data lake.
  Source: none (vault judgment).
  Skeptic: KILL as a vendor receipt. Keep as operator architecture, not
  as something Google documented for this business.

## Killed this sweep

- Official GBP MCP URL (none found; do not invent one).
- Community GBP MCP wrappers.
- Maps Grounding Lite as GBP posts/reviews/listing edits.
- Merchant API MCP as GBP listing management.
- "We need Cloud Storage / Bigtable / a lake" as a Google requirement.
- Official Google Ads mutate tools (current release is read-only).
- Official Gmail send/reply/forward on the 2026-08-16 tools/list.
- Wiring Chat, People, Stitch, or Cloud infra remotes in this batch.
- Treating absence on the Cloud table as a complete census (Merchant is
  official and missing from that table).

## Operator actions (Tier 2 — do not mint here)

- Ads developer token + OAuth or ADC (`GOOGLE_ADS_DEVELOPER_TOKEN`,
  `GOOGLE_PROJECT_ID`, same ADC file as GA4 if used).
- Workspace OAuth for Gmail / Drive / Calendar.
- Enable Maps Grounding Lite and supply a key or OAuth before live calls.
- GBP API access request only if the 60-day verified profile + website
  rule is already true. Check quotas (0 vs 300 QPM) after review.

## Links

- Compiled: `12_Brain/concepts/Google Business Profile API 2026.md`
- Stack: `12_Brain/concepts/MCP Stack Catalog 2026.md`
