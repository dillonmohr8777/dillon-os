---
note_type: review
status: active
created: 2026-09-09
updated: 2026-09-09
owner: Dillon Mohr
priority: high
verification_status: verified
observed_at: 2026-09-09
next_action: Set login-customer-id to 7038673437 on the googleads connection, or run GAQL through a client that sends that header
tags: [review, google-ads, api, composio, automation, blocker]
source_refs:
  - "Composio GOOGLEADS_SEARCH_STREAM_GAQL, six live calls 2026-09-09, all HTTP 403"
  - "Composio GOOGLEADS connection googleads_shover-norard, status ACTIVE"
  - "Google Ads account selector, read live 2026-09-09 in the in-app browser"
  - "[[_os/automation/google-ads-daily/PROVENANCE]]"
---

# Google Ads API access is blocked at the connector

**Summary:** The Composio Google Ads connection is ACTIVE and can list all
sixteen accessible accounts, but **cannot query a single one of them.** Tested
six accounts directly on 2026-09-09; all six returned HTTP 403
`USER_PERMISSION_DENIED`. This is not fixable from a session — it is a
connector capability gap. The value needed to fix it is now known.

## What was tested

Six live calls through `GOOGLEADS_SEARCH_STREAM_GAQL`, passing `customer_id`
explicitly as the tool's own schema instructs for MCC workflows ("For MCC
workflows, pass the child/sub-account ID"):

| Account | Client | Result |
|---|---|---|
| `2853981364` | Omega | 403 `USER_PERMISSION_DENIED` |
| `7917802207` | Nexla | 403 `USER_PERMISSION_DENIED` |
| `1033715894` | Onsite | 403 `USER_PERMISSION_DENIED` |
| `8145506229` | KJB | 403 `USER_PERMISSION_DENIED` |
| `6275014654` | Replenish | 403 `USER_PERMISSION_DENIED` |
| `4357102897` | Bar Crawl USA | 403 `USER_PERMISSION_DENIED` |

Two of the six were metric queries; four were minimal identity queries
(`SELECT customer.id, customer.descriptive_name, customer.manager FROM customer`)
with no metrics at all, to separate a permissions problem from a
manager-scope-metrics problem. All six failed identically, which rules out the
metrics explanation.

Google's error text names the cause exactly:

> "User doesn't have permission to access customer. Note: If you're accessing a
> client customer, **the manager's customer id must be set in the
> `login-customer-id` header.**"

`GOOGLEADS_SEARCH_STREAM_GAQL` exposes `query`, `customer_id` and
`summary_row_setting`. **There is no parameter for `login-customer-id`.** Passing
`customer_id` is not a substitute — it sets the URL path, not the header.

## The missing value is known now

Read live from the Google Ads account selector on 2026-09-09:

**`Dillon Mohr Hermes Agent` — Manager — `703-867-3437`.**

That is the MCC. `7038673437` is the exact `login-customer-id` value. The
existing diagnosis in the weekly dashboard said "Set login-customer-id to the
Momentum manager account" without naming it; it is named here.

## Why this matters more than it looks

Every Google Ads figure in every client report on this machine came from a
hand-driven authenticated browser session, because the API path has never
worked. That route is fragile in a specific, observed way — on 2026-09-08 the
pull failed because "the existing Chrome Ads tab was no longer available" and
reopening one timed out twice.

So the daily loop at [[_os/automation/google-ads-daily/PROVENANCE]] has a
working renderer and no collector, and cannot get one until this is fixed. The
renderer correctly refuses to invent the data the collector cannot fetch.

## The full account list, for the record

Read from the selector 2026-09-09. Sixteen accounts, one manager:

Bar Crawl USA `435-710-2897` · LinkEZE `809-600-6448` · Shadow Heating and
Cooling `314-136-4176` · Kimberly James Bridal (New) **(Cancelled)**
`721-491-4099` · Kimberly James Bridal `814-550-6229` · Replenish
`627-501-4654` · New Kensington Community Development Corporation
`100-209-6937` · Onsite Concrete & Landscape `103-371-5894` · Commercial
Cleaners Alliance `996-681-9458` · Capsule & Tonic (NEW) `715-518-1643` ·
Omega Landscaping `285-398-1364` · **Dillon Mohr Hermes Agent (Manager)
`703-867-3437`** · Mac YT Ads `741-199-9445` · BOM `772-955-2145` · Revive
Fitness / Mike Over LSA `648-634-5529` · Nexla `791-780-2207`

## Two ways to fix it

1. **Set `login-customer-id` to `7038673437` on the googleads Composio
   connection**, if that connection exposes the setting. Cheapest if available.
2. **Run GAQL through a client that sends the header** — a small local script
   against the Google Ads API with the MCC as login customer. Needs a developer
   token under the MCC, which is a Google approval step, not a code step.

Until one of them lands, no unattended daily Google Ads collection is possible
for any client.

## Related

- [[_os/automation/google-ads-daily/PROVENANCE]]
- [[12_Brain/07_Reviews/2026-09-09 - Session estate consolidation]]
