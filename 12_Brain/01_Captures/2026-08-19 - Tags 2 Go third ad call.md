---
note_type: capture
status: captured
created: 2026-08-19
updated: 2026-08-19
captured_at: "2026-08-19T16:37:00Z"
source_type: google_ads_api
verification_status: verified
tags:
  - capture
  - google-ads
  - tags-2-go
  - call-quality
source_refs:
  - "12_Brain/01_Captures/2026-08-19 - Tags 2 Go call quality and CTR check.md"
---

# Tags 2 Go third ad-originated call

## Why this matters

The morning quality pull had eight `call_view` rows. A later same-day read found a ninth ad-originated call before the client email went out.

## Verified source snapshot

CID `9214292423`. Method: Composio `proxy_execute` search on `call_view` filtered by `start_call_date_time` (not `segments.date`; that segment is incompatible with `CALL_VIEW`). No phone numbers captured.

Nine rows, all `RECEIVED`, `HIGH_END_MOBILE_SEARCH`, display location `AD`, country code `1`:

| Start (account TZ) | Duration |
|---|---:|
| 2026-08-17 13:55:07 | 26s |
| 2026-08-17 16:42:00 | 16s |
| 2026-08-17 16:42:30 | 49s |
| 2026-08-18 11:02:47 | 187s |
| 2026-08-18 11:23:24 | 253s |
| 2026-08-18 15:28:08 | 3s |
| 2026-08-19 09:44:55 | 2s |
| 2026-08-19 11:29:16 | 23s |
| 2026-08-19 11:48:11 | 592s |

Campaign Search-1 at this pull: 522 impressions, 53 clicks, 10.15% CTR, $35.93, **2 conversions**, 9 phone calls, 2 invalid clicks. Search IS 16.7%, rank-lost 83.3%, budget-lost 0%.

The 592-second call is ad-originated. Google's conversion column had not yet moved from 2 at this pull.

Converting keywords still only Aug 18: exact `auto tags near me` (1) and phrase `car registration` (1).
