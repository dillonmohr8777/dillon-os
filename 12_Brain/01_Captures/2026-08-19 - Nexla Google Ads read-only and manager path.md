---
note_type: capture
status: compiled
created: 2026-08-19
updated: 2026-08-19
captured_at: "2026-08-19T20:49:43Z"
source_type: gmail_thread
source_url: "gmail://thread/1a01b517fdc49369"
source_author: Jayashree Rajan
source_published: "2026-08-19"
verification_status: verified
related_entities:
  - Nexla
  - Momentum 360
tags:
  - brain
  - capture
  - google-ads
  - onboarding
  - nexla
source_refs:
  - "gmail://thread/1a01b517fdc49369"
  - "gmail://message/1a01bc9aa38c81a0"
  - "gmail://message/1a01bc7a1248dcc5"
  - "gmail://draft/r-4096301657939887568"
---

# Nexla Google Ads read-only invite and manager path

## Why this matters

The Admin user-invite path stalled. Google Ads required Jayashree to set a
passkey before she could grant Admin. She sent read-only instead. The
screenshot she called Business Manager is the Managers tab (MCC links), not
the Users tab. Write access does not wait on her passkey.

## Source material

- Jayashree, 2026-08-19T20:49:43Z, on thread `1a01b517fdc49369`: Google Ads
  required a passkey to invite Dillon as Admin; she was told it takes 1–2 days
  to attach to the ads account; she granted read-only for now.
- She said the person currently handling ads requested “business managed”
  access from their own account and shows as Business Manager.
- Attached screenshot is Access and security → Managers. Linked managers,
  all Owner: No:
  - Coralie Wood - Digital Marketing, `410-914-2068`, linked 2024-08-22
  - Octabrain, `303-439-8000`, linked 2024-07-29
  - Select Google Ads Manager, `638-757-0272`, linked 2024-07-29
- No + control on that Managers tab. Linking is initiated from the manager
  account; the client accepts.
- Separate Google Ads system mail `1a01bc7a1248dcc5` (still UNREAD at capture):
  invitation to account Nexla, customer ID `791-780-2207`, access level
  Read-only. Accept/decline URLs are not stored here.
- Reply to Jayashree is a Gmail draft only (`r-4096301657939887568`). Not sent.
  Dillon owns the Admin passkey. Do not wait on her to finish it.

## Claims to verify

- [x] Read-only invite exists for CID `791-780-2207`.
- [ ] Dillon accepted the read-only invite from his own Google Ads session.
- [ ] Momentum MCC manager-link to `791-780-2207` was sent and Jayashree
  accepted it on Managers.
- [ ] Live write access confirmed (campaigns can be built, not only viewed).

## Compile targets

- Entity: none yet; do not create `01_Clients/Nexla` until the canonical
  registry includes the route.
- Concept: [[12_Brain/03_Concepts/Access Verification Discipline]]
- Project: [[12_Brain/05_Projects/2026-08-19 - Nexla Google Ads onboarding]]
