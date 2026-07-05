---
tags: [ads-ops, client-spec]
source: "[[01_Clients/Fresh Blends - Replenish]]"
updated: 2026-07-04
---

# Replenish / 7-Eleven — Ads Spec

South Florida smoothie kiosks. $500/mo. Contact Mia Lange (CC Sean).

## Accounts & structure
- Google Ads: **627-501-4654**. Campaign 1 "Smoothie Near Me" (local Search),
  Campaign 2 gas-station/kiosk concept, **PMax at $200/location/mo
  (~$6.50/day)** across 5 kiosks. Meta follows once Google is proven.
- Tag: **GT-WBK85GCG**; UTM parsing, `pageview_paid`, direction-click events,
  hidden Netlify form `get-directions-click`.

## Brand rules (law — from Mia)
- Brand as **"Replenish"**, never "Fresh Blends"; "smoothies" everywhere;
  "Self-serve in about 60 seconds".
- **No phone-call conversions** (no calls to 7-Eleven stores).
- Banned language: calories, "3 ingredients", IQF, "no staff no mess".
- Keep 7-Eleven/Replenish ≠ Fresh Blends ≠ Kwik Trip. Negatives on file
  (protein shake, gym supplement, competitor brands).

## Cycle-1 actions
1. Fix **Kwik Trip #633 destination mismatch** in Google Ads (flagged 2026-06-11).
2. Add **gclid capture** to the LP family (offline conversion stitching gap).
3. Confirm Boca store address with Mia before more paid traffic (inferred once).
4. Per-location performance: kill/scale by store; 56th St skews Gen Z (near school).

## KPIs
Daily drink sales (primary, modeled via directions clicks → visit → purchase →
AOV); branded "7-Eleven smoothies" searches (secondary).

## Preflight 2026-07-04
Kwik Trip **#1161 paused** (holding); Pampano running. Pending: $500-cap
dollar check (cost column wouldn't render) and confirm #573/#633 Ended.
Source: [[raw/2026-07-04 - preflight-readback]].

## APPLY READBACK — 2026-07-05 (autonomous run, live Chrome, acct 627-501-4654)
**Conversion tracking (the #1 job): BROKEN AT THE SOURCE.**
- Conversion goals: **Purchase** = Active; **Get directions** = ⚠️ Needs attention
  (this is the KPI — directions clicks); **Page view** = ❌ Misconfigured (0 primary).
- **Root cause found (page-side JS check):** the LP
  `mia-7-eleven-smoothies-pompano.netlify.app` has **NO Google tag at all** —
  GT-WBK85GCG absent, `gtag` undefined, dataLayer empty, zero gtag events. There
  are 4 "directions" links but nothing fires a conversion on click. Google's own
  panel flags: "Install a Google tag on mia-7-eleven-smoothies-pompano.netlify.app."
  ⇒ Smart bidding on these PMax campaigns has essentially no site conversion signal.
- **FIX (blocked this run):** install GT-WBK85GCG + a get-directions-click event
  (and PageView) on the Netlify LP(s). No Netlify/site login in the shared
  Bitwarden collection (Dillon: "not replenish... im not sure"). Needs site access.
- **No phone-call conversion exists** → Mia's "no phone-call conversions" rule is
  satisfied ✅ (goals are Purchase / Get directions / Page view only).

**Kwik Trip #633:** campaign found (id 23902535468, PMax, ~$16/day budget) but
**Status = ENDED** (end date passed; not serving). The 2026-06-11 "destination
mismatch" is therefore not actively harming anything. Did NOT edit an ended
campaign's Final URL blindly — if Dillon reactivates #633 it needs the correct
#633 LP AND the tag fix above. Flag.

**Branding:** left as-is (correct). "Replenish | PMAX | Miami 56 / Coral Springs /
Pampano / Howard" = 7-Eleven/Replenish line (correct branding). "Fresh Blends x
Kwik Trip #573/#633/#1161/#1110" = separate Kwik Trip retail line — NOT renamed
(per spec: Replenish ≠ Fresh Blends ≠ Kwik Trip). Active: Miami 56, Coral Springs,
Pampano, Kwik Trip #573. Paused: #1161, #1110, Howard.

**Net:** verification done, root cause pinned; the meaningful fix is site-side
(tag install) and is access-blocked. No in-platform change was safe/valuable to
apply (real issue is off-platform; #633 is ended).
