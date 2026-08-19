---
note_type: capture
status: captured
created: 2026-08-19
updated: 2026-08-19
captured_at: "2026-08-19T16:20:00Z"
source_type: google_ads_api
verification_status: verified
tags:
  - capture
  - google-ads
  - tags-2-go
  - call-quality
source_refs:
  - "12_Brain/01_Captures/2026-08-19 - Google Ads live KPI Aug 17-19.md"
---

# Tags 2 Go call quality and CTR check

## Why this matters

Two "Calls from ads" conversions and a ~10% CTR on a $15/day Search campaign look unusually strong. This receipt is the live Ads API read that tests whether those numbers are junk.

## Verified source snapshot

CID `9214292423`, campaign `Search-1` (`23974466138`). Window `2026-08-17` to `2026-08-19`. Method: Composio `proxy_execute` search. No phone numbers captured.

Conversion action `Calls from ads`: type `AD_CALL`, counting `MANY_PER_CLICK`, minimum duration **60 seconds**.

Campaign totals at this pull (Aug 19 still open): 500 impressions, 52 clicks, $34.97, 10.4% CTR, 2 conversions, 8 phone calls, 2 invalid clicks (3.7% invalid-click rate). Search impression share 16.7%. Rank-lost IS 83.3%. Budget-lost IS 0%. Absolute top IS 10.0%.

Device: mobile 48 clicks / 2 conv / 10.2% CTR; desktop 3 clicks / 0 conv / 10.3% CTR; tablet 1 click.

Call_view rows in-window (duration only): 26s, 16s, 49s, **187s**, **253s**, 3s, 2s, 23s. All `RECEIVED`, `HIGH_END_MOBILE_SEARCH`, display location `AD`, US. The two conversions match the two calls at or above 60s: 2026-08-18 11:02:47 (187s) and 2026-08-18 11:23:24 (253s), account timezone.

Converting keywords: exact `auto tags near me` (1) and phrase `car registration` (1), both `Calls from ads` on 2026-08-18. Search-term report only names `auto tags near me` for a conversion (5 clicks that day, 1 conv). Google hid the other converting query.

Keyword `auto tags near me` exact: 124 impr, 14 clicks, 11.3% CTR, $8.82, QS **1**, creative/LP/predicted-CTR all `BELOW_AVERAGE`.

Insurance search terms: 1 impression, 0 clicks. Notary exact `notary near me`: 44 impr, 7 clicks, $5.00, 0 conversions, QS 1.

One competitor-ish click: `jack rabbit auto tags norristown`.

## What was not captured

Call recordings, caller identity, whether either long call became a paid job. No secrets.
