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
---


# Access Verification Discipline

**Summary:** confirmed access requires direct proof — a password-like string in an email is not a working login, and public reachability is not edit access.

- Keep a **confirmed-vs-unconfirmed access ledger per client** (live example on [[Blissful Zen Spa]]: Instagram + Squarespace confirmed; Boulevard/GBP/TikTok/YouTube/Facebook/17hats need proof).
- Search Gmail, Slack, and shared Docs first for login handoffs; **old notes are not passwords**.
- Platform-adjacent access is not platform access: Squarespace ≠ Boulevard admin; booking-integration code ≠ dashboard access; a partial login snippet (Revive/poptheagency) ≠ confirmed access.
- Google Ads corollary: missing campaign visibility is usually an **Ads-access or Chrome-attachment issue, not Search Console** (proven on Omega, May 2026). If a live read is blocked, don't guess counts — ask for reauth or explicit read-only browser approval.
- Google Ads has no Business Manager. That term is Meta. When a client is ready to grant access and the operator is away from a computer, the simplest path is **invite the operator email as Admin** under Admin → Access and security → Users. An onboarding form is not Ads access. An MCC manager-link can wait. Proven on Nexla, 2026-08-19, customer ID `791-780-2207`.
- Never copy credentials, OAuth files, cookies, browser profiles, or `.env` files into transfer docs — index where sensitive state lives instead.

## Links
- [[12_Brain/03_Concepts/Draft-First Operating Rules|Draft-First Operating Rules]] · [[12_Brain/03_Concepts/Truth Hierarchy|Truth Hierarchy]]
