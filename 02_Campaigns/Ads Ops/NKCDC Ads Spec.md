---
tags: [ads-ops, client-spec]
source: "[[01_Clients/NKCDC]]"
updated: 2026-07-04
---

# NKCDC — Ads Spec

Philadelphia nonprofit. Google Ads **100-209-6937** + Meta in scope. Single
offer: **Free Business Tax Prep**. Contact: Anthony Miller (amiller@nkcdc.org).

## Reality: this is an unblock lane, not an optimization lane
Campaigns are **built and approved** on the M360 side but launch has been
blocked since ~2026-04-15 on NKCDC shipping their landing page
(`businesstaxprep.fshtechnologies.org/intake/free-tax-prep?ref=…`).
**Preserve the `ref=` param verbatim** — it's their attribution.

## Cycle actions
1. Check LP status each cycle (page-side check works from remote: is the
   intake URL live yet?). The moment it's live → launch checklist.
2. Chase: Mac runs point on NKCDC follow-up — nudge through him if stale
   another cycle.
3. Pre-launch: bind conversion action to intake submit (or `ref=` arrival if
   form is off-domain), verify tag, then enable paused campaigns.

## Voice rules
"Free / no catch / community trust" framing. Never salesy. Audience: small
business owners in NKCDC's service area who qualify.

## Preflight 2026-07-04
PMax paused; Search learning at $15/day. July 1 keyword cleanup + BIRT/NPT
expansion awaits Dillon's approval. Source:
[[raw/2026-07-04 - preflight-readback]].

## Dillon's call (2026-07-04, full approval)
Search campaign launched ~6/30 has NOT SPENT. Full approval to: clean keywords,
cut dead weight, and **rebuild a fresh campaign if this one stays dead 48h
after fixes**. Diagnosis order lives in the Action Packet / session brief.

## APPLY READBACK — 2026-07-05 (autonomous run, live Chrome, acct 100-209-6937, ocid 8148243544)
**NO-SPEND ROOT CAUSE FOUND: the ad's Final URL is DEAD.**
- Campaign "NKCDC - Search - Free Business Tax Prep - Philadelphia - 2026-06"
  (id 23990030341): **Enabled**, Type Search, **already on "Maximize clicks"**
  (so the spec's "Max Clicks if conversion-starved" fix is ALREADY in place),
  budget **$15/day**, status "Bid strategy learning", ~5 days old.
- The RSA is **APPROVED** (green) — NOT disapproved. Headlines "Free Business
  Tax Prep | Philadelphia Tax Help…".
- **BUT the ad's Final URL `nkcdc.org/business-tax/philadelphia` is BROKEN** —
  it redirects to `nkcdc.org/venue/philadelphia-argentine-tango-school/` and shows
  **"There were no results found."** A dead/irrelevant destination throttles
  Google serving (and would waste any click). This is the likely primary no-spend
  cause — bigger than keywords.
- The intended intake `businesstaxprep.fshtechnologies.org/intake/free-tax-prep`
  IS live (shows 2026/2025 tax-year "Apply" selector) but has **no Google tag**
  (form is behind Apply, on the off-domain FSH platform) → conversions can't be
  measured there either.
- **Did NOT change the Final URL:** the correct destination needs the `ref=`
  attribution param preserved verbatim (spec rule), and I don't have the ref
  value — overwriting with a ref-less URL would break NKCDC's attribution.

**Fix needed (flag for Dillon/NKCDC):**
1. Point the ad at the LIVE intake URL WITH the correct `ref=` param (or fix the
   `nkcdc.org/business-tax/philadelphia` redirect on NKCDC's site). Provide the
   ref value and I'll update the Final URL next session.
2. Conversion tracking is not possible on the off-domain FSH intake without their
   cooperation — flag.
3. Bid strategy is already Max Clicks (correct). A rebuild alone won't help while
   the destination is dead.

## RUN 2 — 2026-07-05 ("Make it finish" pass)
- **Final-URL fix NOT possible this run — `ref=` still unrecoverable.** The task
  gated the fix on "only if the exact live intake URL with `ref=` can be
  recovered." It can't: the `ref=` value has never been in the vault or the live
  ad (the ad points at the dead `nkcdc.org/business-tax/philadelphia`, which
  carries no `ref=`), so there is nothing to preserve or copy. It must come from
  Dillon/NKCDC.
- **Pause/flag fallback: attempted, not completed within budget.** Google Ads was
  authenticated (dillonmohr8777@gmail.com), but the deep-link to acct 1002096937
  bounced through a Google account chooser and reaching the specific ad to pause
  it would have exhausted the run's remaining browser budget. **Left the ad
  as-is** (it is not spending, so no active harm) and flagged rather than risk a
  half-finished change. Recommended next session: pause the broken RSA or fix the
  `nkcdc.org` redirect, then repoint with the `ref=` param once Dillon supplies it.
