---
date: 2026-09-22
type: decisions
status: waiting
source_refs:
  - "01_Clients/Cindy May Christmas/overview.md"
  - "01_Clients/Cindy May Christmas/Client Intelligence Overlay.md"
  - "01_Clients/BigOrange Marketing/overview.md"
  - "12_Brain/state/work-predictor/latest.json#queue-wi-20260718-0001"
  - "01_Clients/Replenish/Google Ads Billing Block 2026-07-30.md"
  - "_os/automation/google-ads-api/pulls/Replenish_FreshBlends_campaigns_all_status.json"
  - "System/approval-queue.md"
---

# Three decisions — 2026-09-22

Each item is one decision. Nothing below was sent, published, or changed in an ad account.

## Cindy May Christmas

The overview is still `due: 2026-09-01` and `last_touched: 2026-08-01`. The build is waiting on four named prerequisites: video destination, newsletter connection, photo map, and Shopify. No live traffic or commerce baseline is in the vault.

**Decision:** name a new due date and an owner for each of the four prerequisites, or pause the build until those four exist. A silent carry-forward does not clear it.

## BigOrange Marketing

Canonical item `wi-20260718-0001` is `needs_approval`. The overview due date is still 2026-08-10. The predictor says keep the private WordPress pilot and the review draft unsent until factual sign-off, the invoice recipient, the due date, and the payment timing are named.

**Decision:** yes, with those four invoice facts, or no. Do not build or publish from this note.

## Replenish

`01_Clients/Replenish/Google Ads Billing Block 2026-07-30.md` is still `status: blocked`, with the three billing checks unchecked. Re-read today of `Replenish_FreshBlends_campaigns_all_status.json` (customer 6275014654):

- Seven campaigns named `Replenish | PMAX | …` are `ENABLED` and `servingStatus: ENDED`.
- Fresh Blends #1110 and #1161 are `PAUSED` and `servingStatus: SERVING`. Fresh Blends #633 and #573 are `PAUSED` and `ENDED`.
- Pampano Campaign and Howard Camaign are `ENABLED` and `ENDED`. Their store identity is still unverified. Do not fold them into a Replenish total.
- The export has no `endDate` field, so expired flight dates are the reading of `servingStatus: ENDED`, not a confirmed end date from this file.

A customer-wide billing suspension would not leave two campaigns in the same customer serving-eligible. The July billing story is still untested against a billing-banner read.

**Decision:** authorize one read of each campaign end date and one look at the billing banner. Do not extend dates, restart campaigns, or change spend from this note.
