---
tags: [ads-ops, client-spec]
source: "[[01_Clients/Omega Landscaping]]"
updated: 2026-07-04
---

# Omega Landscaping — Ads Spec

Colorado Springs landscaping/concrete. $400/mo. Contact David Granados.

## Scope (corrected 2026-07-04)
- **Dillon runs Omega's ads — Google AND Meta**
  ([[raw/2026-07-04 - ads-ownership-correction|correction]]; the June brief's
  John-Belaska claim is superseded). Creative note that survives: drone
  footage from David is still wanted for refreshed Meta creative.
- **No Google Ads account ID on file**, and May evidence showed the account
  wasn't visible in the signed-in Ads selector (access/Chrome-attachment
  issue). June report showed real spend ($125.42, 56 clicks, 4.61% CTR,
  2 form submissions) — find the account ID in the first Chrome session and
  record it here.

## Cycle-1 actions
1. In the Chrome session: resolve which Google Ads account exists, get the ID
   into this spec, confirm access.
2. Audit conversion tracking (2 form submissions counted in June — verify the
   source and that the conversion action is bound).
3. Then normal optimization cadence: search terms, geo (Colorado Springs
   metro), budget pacing.
4. Ad copy angle on file: "helped over 3,000 homeowners elevate their outdoor
   living" (not "15 years experience").
5. Domain check: omegalandscapecorp.com vs omegalandscapingandconcrete.com —
   confirm canonical before pointing ads.

## Account confirmed (2026-07-04 sweep)
Google Ads **285-398-1364** — live, **active PMax**. Source:
[[raw/2026-07-04 - account-inventory-sweep]]. Meta account ID still
unconfirmed — discover next session.

## Preflight 2026-07-04
PMax Limited-by-budget at $50/day (opt score 60.7%); asset group Incomplete —
needs assets; Call & Messaging Terms unaccepted (Dillon's call). Source:
[[raw/2026-07-04 - preflight-readback]].

## Dillon's call (2026-07-04, full approval): fix + optimize everything
Full approval to optimize the PMax as much as possible and get conversion
tracking configured properly. Known state: Limited-by-budget $50/day, opt
score 60.7%, asset group Incomplete, Call & Messaging Terms unaccepted
(accept them — calls are wanted for landscaping lead gen). Verify the
form-submission conversion action is bound, firing (site login in Bitwarden),
and set as primary.

## APPLY READBACK — 2026-07-05 (autonomous run, live Chrome, acct 285-398-1364, ocid 6827997273)
**Call & Messaging Ads Terms: ACCEPTED ✅** (Account settings → confirmed
"Accepted"; a stale banner still shows "Fix it" but the setting is authoritative).
Also verified: **Auto-tagging = Yes** (gclid ok), **Call reporting = Turned on**.

**Conversion tracking (verified, healthy):**
- **Phone call lead**: ✅ Active, 8/8 campaigns, **2 primary** actions, **9 conversions**
  in last 30d → calls are tracked AND in bidding ("add calls" already satisfied).
- **Submit lead form**: **1 primary** action, **4 conversions** → form conversion
  IS primary and firing. Goal status = ⚠️ "Needs attention" (soft — likely
  recording on only 3/8 campaigns; tag fires, conversions present).
- **Contact**: ✅ Active, 1 primary.
- No misconfiguration like Replenish; tags are firing.

**PMax asset group ("Asset Group 1", id 6534360768):** ENABLED/serving (green).
Did NOT fully "complete" it this run: completing an Incomplete PMax group needs
image/logo/**video** assets, and Omega's brand assets (incl. the drone footage
from David the spec already flags as wanted) are not available to me. Text-only
additions won't clear image/logo/video gaps. **Needs David's brand assets to
finish** — flag. Budget note: was Limited-by-budget at $50/day (a budget INCREASE
is the one hard-stop per the run rules; not touched — flag as a suggestion).

**Canonical domain:** still TWO live sites (omegalandscapecorp.com AND
omegalandscapingandconcrete.com). Ads/conversion should standardize on ONE —
unresolved this run (needs Dillon's pick). Flag.

**Net:** the explicit asks (accept Call terms; verify form primary + calls) are
DONE. Asset-group completion is asset-blocked; canonical domain needs a decision.
