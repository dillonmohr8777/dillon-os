---
tags: [ads-ops, client-spec]
source: "[[raw/2026-07-04 - full-autonomy-directive]]"
updated: 2026-07-04
---

# Fagan Painting — Ads Spec

Active client; **same instant-form treatment as Shadow HVAC** per Dillon
2026-07-04: qualified leads only, geo-restricted to their service area,
English-only, higher-intent form, Zapier delivery to client.

## Intake needed (vault knows almost nothing — cycle 1 discovers in Chrome session, Dillon confirms)
- Meta Business Manager / page / ad account ID
- Service area (city + radius) — **not on file anywhere**
- Offer (interior/exterior? residential/commercial? free-estimate?)
- Budget and what a qualified lead means to Fagan
- Google Ads: does an account exist?
- Resolve who "John" (CC) is before any client email goes out

## Treatment once intake lands (mirror of [[02_Campaigns/Ads Ops/Shadow HVAC Ads Spec|Shadow spec]])
1. Radius geo on service area, exclusions on out-of-area delivery
2. English-only language targeting; lock Advantage+ overrides
3. Higher-intent form + qualifying questions (project type, timeline, own/rent)
4. Zapier route: lead → instant client notification + sheet log

## Intake filled by evidence (2026-07-04 sweep + screenshot)
- **Service area: Pittsburgh** (draft ad offer: "Get a Free Pittsburgh
  Painting Estimate").
- Meta lane ACTIVE. ⚠️ Account conflict: **892789268275012** (older/live docs)
  vs **23849136117580444** (later candidate) — verify which is live before
  editing anything.
- A "New Leads Ad" (New Leads Ad Set) is **in draft right now** with a Form
  Extension — finish it per this spec: Pittsburgh radius geo, English-only,
  higher-intent form questions, then the Zapier route (Dillon first → client
  → sheet) with a test lead before publish.
Source: [[raw/2026-07-04 - account-inventory-sweep]].

## Account resolution (Dillon, 2026-07-04)
Fagan's Meta runs on **his LLC's own account (Fagan Painting LLC)** — not a
Momentum/Dillon BM. When verifying the 892789268275012 vs 23849136117580444
conflict, the LLC-owned one is the live lane. Source:
[[raw/2026-07-04 - platform-scope-and-bitwarden-state]].

## RESOLVED + URGENT (preflight 2026-07-04)
Real account: **892789268275012** (878824100200277 = empty shell; the
23849…444 candidate was a misread). **Fagan is fully dark** — both
website-leads campaigns off; 2 draft campaigns + 13 unpublished changes
pending Dillon's publish/discard/replace call, and website-form vs
instant-form must be settled. Source: [[raw/2026-07-04 - preflight-readback]].

## Dillon's call (2026-07-04): WEBSITE LEADS, not instant form
- Keep ONLY the draft "PRIMARY FIRST OPTIMIZED LEAD CAMPAIGN" (it has the
  videos). Discard the other draft + unrelated pending changes.
- **Pixel on the landing page** — he wants to test the LP. Install Meta pixel
  on Fagan's site (WP login in Bitwarden), Lead event on form
  submit/thank-you, verify with Pixel Helper, THEN publish.
- Ad set still: Pittsburgh radius, English-only, lock Advantage+ overrides.
- Lead delivery: WP form notification → Dillon first, then client (Zapier
  webhook later if wanted). Instant-form plan is superseded.
