---
tags: [concept, ops-rule]
source: "[[raw/2026-06-26 - intel-core-7-master-operating-transfer]]"
updated: 2026-07-04
---

# Access Verification Discipline

**Summary:** confirmed access requires direct proof — a password-like string in an email is not a working login, and public reachability is not edit access.

- Keep a **confirmed-vs-unconfirmed access ledger per client** (live example on [[Blissful Zen Spa]]: Instagram + Squarespace confirmed; Boulevard/GBP/TikTok/YouTube/Facebook/17hats need proof).
- Search Gmail, Slack, and shared Docs first for login handoffs; **old notes are not passwords**.
- Platform-adjacent access is not platform access: Squarespace ≠ Boulevard admin; booking-integration code ≠ dashboard access; a partial login snippet (Revive/poptheagency) ≠ confirmed access.
- Google Ads corollary: missing campaign visibility is usually an **Ads-access or Chrome-attachment issue, not Search Console** (proven on Omega, May 2026). If a live read is blocked, don't guess counts — ask for reauth or explicit read-only browser approval.
- Never copy credentials, OAuth files, cookies, browser profiles, or `.env` files into transfer docs — index where sensitive state lives instead.

## Links
- [[concepts/Draft-First Operating Rules|Draft-First Operating Rules]] · [[concepts/Truth Hierarchy|Truth Hierarchy]]
