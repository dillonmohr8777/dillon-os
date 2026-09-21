---
note_type: proposal
status: blocked
created: 2026-08-27
verified_at: 2026-08-27T12:06:00Z
agent: paid-media-analyst
privacy: redacted
external_action_attempted: none
mail_ready: hold
source_refs:
  - 12_Brain/state/connector-health.json
---

# paid-media-analyst - Ads LIST recovered; campaign GAQL still blocked

## What was verified

- `GOOGLEADS_LIST_ACCESSIBLE_CUSTOMERS` succeeded on `googleads_shover-norard`. 16 customer resource names. Developer-token 429 is cleared for this call.
- Replenish child `6275014654` GAQL `searchStream` returned HTTP 403 `USER_PERMISSION_DENIED` with the standard manager `login-customer-id` header requirement.
- Three more accessible customers returned the same 403. One listed customer returned `CUSTOMER_NOT_ENABLED` (deactivated or not yet enabled). Stopped further GAQL.
- Composio `GOOGLEADS_SEARCH_STREAM_GAQL` has no `login-customer-id` argument. This matches the 2026-07-19 manager-header blocker. Not a re-auth problem.
- No live campaign status, spend, or conversion readback. No pause, enable, or budget.
- Replenish Google Ads user-invite remains untouched.

## Not done

Search Console from the prior tick is still organic presence, not paid delivery. Meta Ads remains not connected.
