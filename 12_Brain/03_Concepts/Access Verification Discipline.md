---
tags: [concept, ops-rule]
source: "[[12_Brain/01_Captures/2026-06-26 - intel-core-7-master-operating-transfer]]"
updated: 2026-08-19
note_type: concept
status: active
created: 2026-07-04
source_refs:
  - "[[12_Brain/01_Captures/2026-06-26 - intel-core-7-master-operating-transfer]]"
  - "[[12_Brain/01_Captures/2026-08-19 - Nexla Google Ads Admin invite]]"
  - "[[12_Brain/01_Captures/2026-08-19 - Nexla Google Ads read-only and manager path]]"
  - "[[12_Brain/01_Captures/2026-08-19 - Momentum Ads Manager MCC identity]]"
---


# Access Verification Discipline

**Summary:** confirmed access requires direct proof — a password-like string in an email is not a working login, and public reachability is not edit access.

- Keep a **confirmed-vs-unconfirmed access ledger per client** (live example on [[Blissful Zen Spa]]: Instagram + Squarespace confirmed; Boulevard/GBP/TikTok/YouTube/Facebook/17hats need proof).
- Search Gmail, Slack, and shared Docs first for login handoffs; **old notes are not passwords**.
- Platform-adjacent access is not platform access: Squarespace ≠ Boulevard admin; booking-integration code ≠ dashboard access; a partial login snippet (Revive/poptheagency) ≠ confirmed access.
- Google Ads corollary: missing campaign visibility is usually an **Ads-access or Chrome-attachment issue, not Search Console** (proven on Omega, May 2026). If a live read is blocked, don't guess counts — ask for reauth or explicit read-only browser approval.
- Google Ads has no Business Manager. That term is Meta. Two grants, two tabs: **Users** is an email invite (Admin / Standard / Read-only); **Managers** is an MCC link initiated by the manager account, not a + on the client tab. An onboarding form is not Ads access.
- Admin on Users can require the **client** to enroll a passkey before the invite will send (Jayashree on Nexla, 2026-08-19: 1–2 days to attach; she sent Read-only instead). Do not wait on that. If existing agencies already show on Managers (Nexla: Coralie Wood `410-914-2068`, Octabrain `303-439-8000`, Select `638-757-0272`, all Owner: No), send the same manager-link from the operator MCC to the customer ID. The client only accepts. Read-only is review/reporting, not campaign write access. Proven on Nexla CID `791-780-2207`.
- Momentum client manager-links come from **Momentum Ads Manager** (`743-802-1996`), proven on Kimberly James Bridal and Replenish, 2026-04-10. Do not send client links from the Hermes Agent MCC (`703-867-3437`). Composio Google Ads search in this environment cannot set `login-customer-id`; MCC and MCC-linked clients return `USER_PERMISSION_DENIED` even when the CID appears in the connection's accessible-customer list. Do not wait on list-accessible-customers quota to send a manager-link — send it from the signed-in Momentum Ads Manager UI.
- Unread Gmail is not the only accept signal, but it is a live one. A cheaper accept-probe than `listAccessibleCustomers` (which is quota-fragile on basic-access developer tokens) is GAQL `SELECT customer.id, customer.descriptive_name FROM customer` on the invited CID. After a direct Users-tab accept, that query succeeds without `login-customer-id`. `USER_PERMISSION_DENIED` means the user invite is not in effect yet (proven on Nexla `791-780-2207`, 2026-08-19T21:48Z). The invitee cannot accept via API — administrators can only create or revoke invitations; the invited user must accept in the Ads UI ([Manage User Access Invitations](https://developers.google.com/google-ads/api/docs/account-management/managing-invitations)). API invitation status can lag up to 24 hours after UI accept, so a live Ads UI open of the account outranks GAQL.
- Composio `proxy_execute` does reach `CustomerClientLinkService` when the body uses singular `operation` (not `operations`) and `validateOnly`. Validate-only against Momentum Ads Manager `743-802-1996` still returns `USER_PERMISSION_DENIED` on Dillon's Ads OAuth, with or without a `login-customer-id` header (2026-08-19T21:57Z). Send the manager-link from the signed-in Momentum Ads Manager UI. Do not send client links from the Hermes Agent MCC.
- Never copy credentials, OAuth files, cookies, browser profiles, or `.env` files into transfer docs — index where sensitive state lives instead.

## Links
- [[12_Brain/03_Concepts/Draft-First Operating Rules|Draft-First Operating Rules]] · [[12_Brain/03_Concepts/Truth Hierarchy|Truth Hierarchy]]
