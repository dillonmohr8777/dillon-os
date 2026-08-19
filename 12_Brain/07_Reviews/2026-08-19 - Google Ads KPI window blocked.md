---
note_type: review
review_kind: kpi_window
status: active
created: 2026-08-19
updated: 2026-08-19
owner: Dillon Mohr
period_start: 2026-08-17
period_end: 2026-08-20
verification_status: blocked
source_refs:
  - "[[Daily-Briefs/google-ads-kpi-2026-08-17-to-2026-08-20]]"
  - "[[12_Brain/01_Captures/2026-08-19 - Google Ads Composio login-customer-id block]]"
  - "[[12_Brain/state/connector-health.json]]"
  - "[[01_Clients/Client Index]]"
  - "[[11_Agents/Google Ads Agent]]"
tags:
  - brain
  - review
  - google-ads
  - kpis
  - blocked
---

# Google Ads KPI window blocked | Aug 17 to Aug 20, 2026

The requested Google Ads spend and KPI pull for Aug 17 to Aug 20 could not be live-verified. Aug 20 is still future. Aug 17 to 19 failed because Composio Google Ads metric reads require a live manager `login-customer-id`, and the connected default manager is deactivated.

Last verified live Google Ads numbers remain the Aug 10 to 16 weekly packet. They are not a substitute for this window. Replenish's nine-store launch on Aug 16 makes the missing days the highest-risk unmeasured spend.

Full operator table: [[Daily-Briefs/google-ads-kpi-2026-08-17-to-2026-08-20]].

## Decision needed

Reconnect Google Ads Composio to a live MCC. No spend or campaign mutation is requested.
