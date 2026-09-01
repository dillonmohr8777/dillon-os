---
note_type: capture
status: captured
created: 2026-08-19
updated: 2026-08-19
captured_at: "2026-08-19T14:05:00Z"
source_type: connector_probe
verification_status: verified
tags:
  - capture
  - google-ads
  - composio
  - connector-health
source_refs:
  - "12_Brain/state/connector-health.json"
---

# Google Ads Composio login-customer-id block

## Why this matters

A connected Google Ads OAuth session can list customer IDs and still refuse every spend query. Listing is not a metric read.

## Verified source snapshot

- Toolkit: `googleads`, account `googleads_shover-norard`, alias Dillon, status ACTIVE.
- `GOOGLEADS_LIST_ACCESSIBLE_CUSTOMERS` returned 16 resource names, including known client CIDs `8145506229` (KJB), `2853981364` (Omega), `1033715894` (Onsite), `4357102897` (Bar Crawl USA), and `8096006448` (Link Eze).
- `GOOGLEADS_LIST_SUB_ACCOUNTS` with no `customer_id` hit `customers/6908592139` and returned `CUSTOMER_NOT_ENABLED`.
- `GOOGLEADS_SEARCH_STREAM_GAQL` against child accounts, including KJB `8145506229` and Omega `2853981364`, returned `USER_PERMISSION_DENIED` with the Google Ads API note that a manager `login-customer-id` header is required.
- Extra `login_customer_id` arguments on GAQL were ignored. The Composio GAQL schema has no manager-header field.
- The Aug 18 connector-health 429 (`RESOURCE_EXHAUSTED`, developer-token basic access) was not reproduced on this probe. Today's block is the deactivated MCC login, not quota.

## What was not captured

No customer names, campaign rows, cost, clicks, impressions, or conversions for 2026-08-17 through 2026-08-20. No secrets. No credential values.
