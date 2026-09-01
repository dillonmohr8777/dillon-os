---
note_type: concept
status: active
created: 2026-08-19
updated: 2026-08-19
source_refs:
  - "[[12_Brain/01_Captures/2026-08-19 - Google Ads Composio login-customer-id block]]"
  - "[[12_Brain/01_Captures/2026-08-19 - Google Ads live KPI Aug 17-19]]"
tags:
  - concept
  - google-ads
  - composio
  - connector-health
---

# Google Ads Composio Proxy Read Path

**Summary:** wrapped Composio Google Ads GAQL tools inject the connection's default MCC; `proxy_execute` search against the child CID does not.

- `GOOGLEADS_LIST_ACCESSIBLE_CUSTOMERS` can succeed while `GOOGLEADS_SEARCH_STREAM_GAQL` fails with `USER_PERMISSION_DENIED` because Composio sends deactivated MCC `6908592139` as `login-customer-id`.
- Extra `login_customer_id` arguments on the wrapped GAQL tool are ignored; the schema has no manager-header field.
- `COMPOSIO_REMOTE_WORKBENCH` `proxy_execute("POST", "/v23/customers/{cid}/googleAds:search", "googleads", body={"query": gaql})` returns customer names and dated metrics without that header.
- `read_verified` is true only after a dated metric row returns. Listing customers is not a metric read.
- Reconnecting the default MCC is optional hygiene once the proxy path works. Do not stall a spend pull on it.
- Limit: this is a read path. It is not approval to mutate campaigns, budgets, or bids.
