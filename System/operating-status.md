---
tags: [system, operating-status]
last_updated: 2026-08-19
callsign: D.I.L.L.O.N.
operator: Dillon Mohr
goal_label: ACTIVE CLIENTS
goal_current: 14
goal_target: 100
source_of_truth: C:\Users\dillo\repos\dillon-os
---

# Operating Status

## 138-site unslop — QA green, awaiting review

Pickup finished 2026-08-19. **136** unique concept sites rebuilt with five unique 4:5 collages each (people at work, food for kitchens). **2** duplicate rows dropped (`#23` johnny-s-pizza, `#42` thr-insurance-agency). `qa-batch.js`: 136 ready, 0 collisions, 0 mode mismatches. Sheet `Fixed?` is YES for the 136 QA-green rows; duplicates stay blank. PR `dillon-os#326` on `cursor/prospect-unslop-collages-56f2`. Do not deploy. Do not send mail. `mail_ready` stays hold.

The vault was reconciled on 2026-07-12 against current work from the rolling three-week window. The April-era client roster is superseded.

## Active roster

- Paid media and growth: Kimberly James Bridal, Omega Landscaping & Concrete, On-Site Concrete & Landscape, Shadow Heating & Cooling, Replenish, Fagan Painting, Capsule & Tonic.
- Web, SEO, product, and delivery: Bar Crawl USA, Revive Systems, Hope Wellness Center, Pro Fence & Deck, Everyday Life Insurance, VA Claims, Bridge Software Development.
- Full-time, excluded from client count: Align HCM.

## Current reporting truth

- Confirmed blue-dashboard accounts: Kimberly James Bridal, Omega, Onsite, and Shadow.
- Replenish is the leading fifth account and must remain separate from Fresh Blends.
- NKCDC is paused pending a new contract and excluded from the active roster.
- Fresh Blends is paused and excluded from the active-ad cycle.

## Verified separation risks — 2026-07-19

- Fresh Blends has meetings on the 2026-07-20 calendar, but no current contract evidence was found. Calendar presence alone does not reactivate it or merge it with Replenish.
- Replenish has current live evidence (getreplenish.com GA4 traffic and a store-specific Miami 56 direction-action email) and remains the active 7-Eleven reporting lane.
- Align HCM GitHub repository `align-hcm-august-2026-content` contains an unrelated open draft Coinbase paper-trading PR #8. Do not merge it; migration to a dedicated repository and closure are approval-gated.

## Operating rules

- Keep one canonical client record per active name.
- Refresh the roster weekly using current Slack, Gmail, Ads, project, and delivery evidence.
- Do not revive a removed name from historical notes without current evidence.
- No send, publish, deploy, campaign mutation, spend change, or client-account change without explicit approval.
