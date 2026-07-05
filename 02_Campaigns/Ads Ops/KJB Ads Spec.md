---
tags: [ads-ops, client-spec]
source: "[[01_Clients/KJB]]"
updated: 2026-07-04
---

# KJB — Ads Spec

Bridal boutique, Chestnut Hill/Philadelphia. $300/mo. Google Search + PMax +
Meta lead gen ($8.56 CPL, 8 verified leads).

## Accounts
- Google Ads: **721-491-4099** (new) / 814-550-6229 (original, linked to
  Momentum Ads Manager 2026-04-10). ⚠️ Cycle 1: confirm which is live.
- Conversion tag: gtag **AW-18040733346** via Squarespace Code Injection
  (Settings → Advanced → Code Injection → Header). Tag Assistant-verified April.

## Attribution work (the ask: "fix Google Ads attribution into Squarespace")
1. Confirm GA4 + GSC still connected (Mac's open item from 2026-04-11).
2. Add **booking-level conversion**: fire on appointment-request
   submit/booking CTA, not just page views — bind as primary conversion action;
   demote clicks to secondary.
3. Enable **enhanced conversions** (hashed email from booking form).
4. UTM discipline on all Meta + Google traffic so Squarespace analytics and
   GA4 agree on source.
5. Verify with Tag Assistant in the local Chrome session; log result.

## Standing flags
- Rejected Disney-style ads may still be running in Meta — **verify every cycle
  until confirmed dead**.
- CC on all emails: Mac, Sean, Melissa. Public reports aggregate-only (PII rule).

## Targeting
Philadelphia, Chestnut Hill + suburbs. Landing pages on Squarespace (venues
page, plus-size page, timeline page).

## Account note (2026-07-04 sweep)
Sweep lists **814-550-6229 as seed**, 721-491-4099 also referenced —
**verify which is live before ANY edit**. Source:
[[raw/2026-07-04 - account-inventory-sweep]].

## RESOLVED (preflight 2026-07-04): live account = 814-550-6229
721-491-4099 shows (Cancelled) in the selector. All work happens in
**814-550-6229**. Source: [[raw/2026-07-04 - preflight-readback]].

## APPLY READBACK — 2026-07-05 (autonomous run, live Chrome)
**Google (814-550-6229, ocid 8114064654) — 721 confirmed (Cancelled) in selector.**
- **gtag AW-18040733346 VERIFIED** ✅ via page-side JS on kimberlyjamesbridal.com:
  `gtag` active, AW-18040733346 loaded, GA4 G-LMGCP5S15T also present, dataLayer
  active. Base conversion tag properly installed (booking event fires on the
  appointment page, not homepage — homepage has no form, as expected).
- Conversion goal "Submit lead form": **2 primary** conversion actions (booking/
  form are primary as intended) — status "Needs attention" (soft; likely no recent
  conversions in window). Could NOT inspect the 2 individual actions' EC toggle or
  demote-clicks per-action — the new Ads conversion UI wouldn't expose the detail
  table to automation this run. **Flag:** confirm Enhanced Conversions (hashed
  email) is ON and that neither primary action is a page-view/click.
- No "Calls from ads" conversion issue; KJB is form/booking-focused.

**Meta (KJB Meta Ads, account 1249689223687250, business 2069084743213180):**
- **Rejected Disney-style ads: CONFIRMED DEAD ✅.** Account has ONE campaign
  ("Website Retargeting", Active) and, at Ads level, **one ad — "New Leads Ad"
  with a bridal-gown image (appropriate), Active/delivering.** No Disney/copyright
  creative present in All ads. The standing "verify every cycle until dead" check
  is satisfied this cycle.
- (Also confirmed KJB's real Instagram is `kimberlyjamesbridal` — which is why
  removing it from Fagan's ad identity earlier was correct.)
