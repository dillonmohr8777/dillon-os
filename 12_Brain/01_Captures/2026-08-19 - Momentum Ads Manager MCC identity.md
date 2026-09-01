---
note_type: capture
status: compiled
created: 2026-08-19
updated: 2026-08-19
captured_at: "2026-08-19T21:40:00Z"
source_type: gmail
source_url: "gmail://message/19d7812455fba199"
source_author: ads-account-noreply@google.com
source_published: "2026-04-10"
verification_status: verified
related_entities:
  - Momentum 360
  - Nexla
tags:
  - brain
  - capture
  - google-ads
  - mcc
source_refs:
  - "gmail://message/19d7812455fba199"
  - "gmail://message/19d78131cd993a42"
  - "gmail://message/19d7817e91d8383b"
  - "gmail://message/19e9bab93bc58046"
---

# Momentum Ads Manager MCC identity

## Why this matters

Nexla write access needs a manager-link from the same Momentum MCC that
already linked other Momentum clients, not from Dillon's personal Hermes
Agent MCC.

## Source material

- 2026-04-10 Google Ads mail `19d7812455fba199`: pending request to link
  Kimberly James Bridal (`814-550-6229`) to manager account name Momentum
  Ads Manager, manager customer ID `743-802-1996`. The request was sent by
  the Momentum Ads Manager operator Gmail, not by a cloud agent.
- 2026-04-10 confirmation `19d78131cd993a42`: Kimberly James Bridal is now
  linked to Momentum Ads Manager (`743-802-1996`).
- 2026-04-10 confirmation `19d7817e91d8383b`: Replenish linked the same way.
- 2026-06-06 mail `19e9bab93bc58046`: a separate manager account named
  Dillon Mohr Hermes Agent (`703-867-3437`) was created. That is not the
  client-facing Momentum MCC.
- Accept/decline and sign-in URLs from those mails are not stored here.

## Claims to verify

- [x] Momentum Ads Manager CID is `743-802-1996`.
- [x] Hermes Agent MCC is a different account and must not be used for Nexla.
- [ ] Manager-link from Momentum Ads Manager to Nexla `791-780-2207` was sent.

## Compile targets

- Concept: [[12_Brain/03_Concepts/Access Verification Discipline]]
- Project: [[12_Brain/05_Projects/2026-08-19 - Nexla Google Ads onboarding]]
