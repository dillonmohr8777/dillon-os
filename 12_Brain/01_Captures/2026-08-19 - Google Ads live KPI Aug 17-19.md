---
note_type: capture
status: captured
created: 2026-08-19
updated: 2026-08-19
captured_at: "2026-08-19T16:10:00Z"
source_type: google_ads_api
verification_status: verified
tags:
  - capture
  - google-ads
  - composio
  - kpis
source_refs:
  - "12_Brain/state/connector-health.json"
---

# Google Ads live KPI Aug 17-19

## Why this matters

The same Composio Google Ads OAuth that failed wrapped GAQL earlier on 2026-08-19 returned dated spend when called through `proxy_execute` without a `login-customer-id` header.

## Verified source snapshot

- Toolkit: `googleads`, account `googleads_shover-norard`, alias Dillon, ACTIVE.
- Endpoint: `POST https://googleads.googleapis.com/v23/customers/{cid}/googleAds:search`.
- Window: `segments.date BETWEEN '2026-08-17' AND '2026-08-20'`. Aug 20 returned no rows. Aug 19 is partial.
- Customer-level totals (cost micros converted to USD):

| CID | Ads name | Spend | Clicks | Impr | Conv | Conv name |
|---|---|---:|---:|---:|---:|---|
| 1033715894 | Onsite Concrete & Landscape | $10.17 | 74 | 1743 | 1 | Web Phone Calls (2026-08-17) |
| 2853981364 | Omega Landscaping | $14.21 | 2 | 42 | 0 | |
| 8145506229 | Kimberly James Bridal | $44.19 | 9 | 302 | 0 | |
| 9214292423 | (blank descriptive name) | $33.04 | 50 | 485 | 2 | Calls from ads (2026-08-18) |

- CID `9214292423` is Tags 2 Go: RSA final URL `https://tags2go.pro/philadelphia-title-registration-services/`, campaign `Search-1` ENABLED, budget 15000000 micros/day, Search network only, 5-mile proximity at 6001 Torresdale Avenue, Philadelphia, PA.
- Enabled leftover exact keywords on that campaign include `car insurance` and `auto insurance`.
- Wrapped tool `GOOGLEADS_SEARCH_STREAM_GAQL` still fails with `USER_PERMISSION_DENIED` / deactivated MCC `6908592139`.
- Live MCC `7038673437` (`Dillon Mohr Hermes Agent`) has no child accounts besides itself.

## What was not captured

No secrets, tokens, or passwords. No campaign mutations. Conversion quality was not matched to CRM or call recordings.
