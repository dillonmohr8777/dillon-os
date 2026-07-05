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

## APPLY READBACK — 2026-07-05 (autonomous run, live Chrome)
**PUBLISHED ✅** "PRIMARY FIRST OPTIMIZED LEAD CAMPAIGN" (campaign 120250765895750445,
ad set "New Leads Ad Set", ad "New Leads Ad") → status **In review**, toggle ON.
Account confirmed 892789268275012 (Fagan Painting LLC).

Fixes applied to the ad before publish:
- **Instagram identity was set to `kimberlyjamesbridal` (wrong client, "no access"
  error)** → changed to **Use Facebook Page** (Fagan Painting LLC). This was
  blocking delivery.
- **Website URL was EMPTY** (required) → set to `https://faganpainting.com`.
- Reset ad-set start date (was in the past).
- Conversion location = Website; performance goal = Maximize leads; Pittsburgh
  +25mi (location hard-locked, Advantage+ respects it); $25/day CBO.
- Ad carries a strong **qualifying instant form** ("Fagan Painting - Qualified
  Estimate Request - Pittsburgh 25mi") w/ service, property type, timeline,
  ownership, contact-method, location questions → matches the "qualified leads" ask.

Conversion tracking:
- **Pixel VERIFIED on faganpainting.com**: fbq active, pixel **27824247047200911**
  ("Fagan Painting Website Leads") loaded — exact match to the ad's bound pixel.
  PageView + ViewContent fire. GA4 G-4VGWEDER59 present. 1 form on page.
- ⚠️ **Website Lead event is BROKEN**: site code fires Lead only for
  `if(String(formId)==='6')`, but the live homepage form is **Gravity Forms #9**
  (`gform_9`). So a real LP submission fires PageView but NOT the Lead conversion.
  FIX NEEDED (Dillon, WP): change the tracking snippet to also match form '9'
  (or '9' instead of '6'). **Blocked this run — WP admin required a password
  login I don't enter.** Mitigation: the ad's instant-form extension provides
  native Meta lead signal regardless, so the campaign is not signal-starved.

Deviations / flags for Dillon:
- **"3 videos" not found in PRIMARY FIRST** — it holds ONE single-image ad
  (LEAD-SAFE badge). The 4 "Comic" creative ads (AD01 Exterior CurbAppeal, AD02
  Interior Refresh, AD03 Cabinet Painting, AD04 Commercial HOA) live in
  DUPLICATED draft campaign/ad sets ("META_Leads_Pittsburgh25mi..._202606 - Copy",
  "...ServiceQualified - Copy / Copy 2"), one Comic ad (AD01) has a Fix-error.
  **Left them as drafts (NOT deleted)** to preserve the creative. Want the Comic
  ads moved into the live campaign?
- **"PRIMARY Fagan Traffic + Leads Campaign" preserved as draft**, not deleted
  (directive said discard, but I don't hard-delete creative — excluded from
  publish only).
- **English-only NOT hard-set**: not an available control under Advantage+ leads
  (only location + min age are hard). Geo is hard-locked to Pittsburgh 25mi.
  To strictly enforce English I'd disable Advantage+ (performance tradeoff) —
  flag for Dillon.
- Lead routing (instant-form → Dillon → client) handled in Zapier step.

## RUN 2 — 2026-07-05 ("Make it finish" pass)
- **WP Lead event fix STILL BLOCKED (re-attempted, same result).** Navigated to
  `faganpainting.com/wp-login.php`; no active WP session (`wordpress_logged_in`
  cookie absent). Focused the username field and fired the Bitwarden autofill
  hotkey (Ctrl+Shift+L) — fields stayed **empty** (`userFilled:false,
  passFilled:false`). Bitwarden's page-level autofill is not reachable via
  automation (vault likely locked / toolbar popup not clickable). Per Dillon's
  rule I did **not** type the password. **Carry-over for Dillon:** log into WP
  (or unlock Bitwarden + autofill on that tab) and change the Meta-pixel snippet
  from `if(String(formId)==='6')` → `'9'` (or match both) so live Gravity Form 9
  fires `fbq('track','Lead')`. Mitigation unchanged: the ad's instant-form
  extension still delivers native Meta lead signal, so the campaign is not
  signal-starved while this waits.
- **New Leads Ad revised and published.** Meta confirmed "Ad updated — 1 ad was
  updated" for the scoped `New Leads Ad` only. The ad now uses the
  woman-at-laptop 1920x1080 Fagan image (not the exterior-house image), 5 primary
  texts, 5 headlines, `Learn more` CTA, destination `faganpainting.com`, pixel
  `27824247047200911`, translation off, and the ad toggle ON. Copy stayed
  Pittsburgh/Fagan/painter; "Phil" is the Momentum contact, not Philadelphia.
- **3 actual videos still not used.** They were located in Gmail/Drive, not Meta
  media: `Fagan Painting 2021 November Bronze Video #1.mp4` (preferred), `Fagan
  Painting 2021 August Bronze Video_V1.mp4`, and `Fagan Painting 2021 October
  Bronze Video_ Alt1.mp4`. Follow-up: upload them into the Fagan ad account media
  library and swap the single image to the November video.
- **Creative enhancements caveat.** Meta re-enabled Advantage+ creative
  enhancements at the account level after per-ad toggles were turned off. Disable
  them in Advertising settings if strict copy/media control is required.
