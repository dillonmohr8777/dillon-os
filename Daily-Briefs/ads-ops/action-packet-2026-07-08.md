---
tags: [ads-ops, action-packet]
date: 2026-07-08
authored-by: remote analysis session (cloud — repo access only, no live browser)
source: "[[Daily-Briefs/ads-ops/apply-log-2026-07-05]]"
cycle-status: READY-TO-APPLY — sequenced for the local `claude --chrome` session
---

# Ads Ops Action Packet — 2026-07-08

**One-liner:** carries the six open items from the 2026-07-05 live run into exact,
ordered apply steps. This packet was written by the **remote half** (cloud
session: repo access, no logged-in browser) so it plans only — **execution
happens in the local `claude --chrome` "Claude Ops" profile** where the Zapier /
Google / Meta / Squarespace logins live. Re-verify each account against the LIVE
state first (the newest readbacks may be unpushed on Dillon's offline machine).

**Standing gates (do not auto-cross):** budget increases >20% in one step, and
sending any client email. Everything else has full standing approval.

## Apply list — Dillon's priority order

### 1 — ZAPIER (owner 2958868) — free quota, replay held leads, audit order

Root cause from 07-05 is a **task/plan quota hold: 9 held Zap runs until Aug 8**,
not a missing Zap. Sequence:

1. **Prune dead test Zaps to free quota.** Turn OFF (don't delete yet) the
   experiments that burn tasks: `(Copy) md leads june mel test`,
   `christian md lead test`, `remarketing md meta leads zap`, old `MDLEAD`
   experiments. Leave live client Zaps ON: **Fagan Painting**,
   **Netlify Leads - Omega + Onsite**, and any real Meta-lead Zap.
   - Verify: task-usage meter drops; no live client Zap toggled off by mistake.
2. **Replay the 9 held runs** (Zap History → held → bulk replay). ⚠️ This fires
   client-facing emails → **client-email gate applies**: confirm with Dillon
   before bulk-replay, or replay only the Dillon-first internal notifications.
   Do the prune (step 1) FIRST so replays don't immediately re-hold under quota.
3. **Audit each live client Zap for order:** Action 1 = email **Dillon first**,
   Action 2 = client, Action 3 = append row to the client's Google Sheet
   (standing rule). Fix any Zap that skips Dillon or reorders.
4. **Re-test** with Meta's Lead Ads Testing Tool per the failure-mode list in
   [[02_Campaigns/Ads Ops/Zapier Lead Routing]]: test lead → appears in Zap
   history → Dillon email delivered (check spam) → client email → sheet row.
   Mark routed only when every step is separately confirmed.
- **Dillon's billing call (flag, not auto):** upgrade the plan for more monthly
  tasks, or wait for the Aug 8 reset. Until resolved, new leads keep getting held.

### 2 — KJB (Google 814-550-6229) — booking click as SECONDARY only

- **Change:** add the Squarespace **"Schedule Appointment"** click as a
  **SECONDARY** conversion action — booking *intent*, NOT a completed booking.
  Do **not** set it primary and do **not** demote the existing booking/form
  primaries. gtag **AW-18040733346** is already verified live.
- **Document (do not fix here):** the true fix is **Poppy Bridal admin access
  for AW-18040733346** so a real completed-booking event can be bound. Note this
  in the readback and the KJB spec; no creative changes this cycle.
- **Verify:** new action shows as Secondary in the conversion table; Tag
  Assistant sees the click event fire on the appointment page.

### 3 — FAGAN (Meta 892789268275012) — finish creative swap + copy

- The New Leads Ad is live on the woman-at-laptop image. Finish the intended
  **3-video swap**: the 3 videos are **NOT yet in Meta media** — upload them
  first (Gmail thread "Re: Fagan Painting Meta Ads next steps", 2026-06-28):
  - Preferred: **Fagan Painting 2021 November Bronze Video #1.mp4**
  - Also: **…August Bronze Video_V1.mp4**, **…October Bronze Video_ Alt1.mp4**
  Then swap the ad's single media to the November video; keep the **5 primary
  texts + 5 headlines** already written (Pittsburgh/painter, no Philly — see
  07-05 log). CTA Learn more, destination faganpainting.com, pixel
  27824247047200911, translation OFF.
- ⚠️ **Disable Advantage+ creative enhancements at the ACCOUNT level**
  (Advertising settings) — per-ad toggles didn't stick; "Text improvements" can
  reword the copy.
- **Verify:** ad renders on the November video; enhancements show OFF after
  reload; copy unaltered.

### 4 — ONSITE (Google 103-371-5894) — single primary conversion

- **Change:** consolidate to **one primary conversion = the 39-conversion
  Contact action** (the one actually firing). Demote the extras to secondary:
  today Contact has 6 primary, Phone call lead 3, Submit lead form 3 → double-count
  risk, 3 goals "Needs attention". Submit-form and Phone show 0 conversions.
- **Verify:** exactly one primary remains; "Needs attention" clears; no drop in
  Contact recording after the change.

### 5 — NKCDC (Google 100-209-6937) — repoint URL + install tag

- **Blocked on input:** the ad's Final URL `nkcdc.org/business-tax/philadelphia`
  is dead (redirects to a tango-school page). Repoint to the live intake
  `businesstaxprep.fshtechnologies.org/intake/free-tax-prep` **WITH the `ref=`
  param preserved verbatim** — but the `ref=` value has never been in the vault
  or the live ad. **Dillon/NKCDC must supply `ref=`** before the URL is changed
  (a ref-less URL breaks attribution — do not overwrite without it).
- **Then:** install **GT-WBK85GCG** on the intake per the task (off-domain FSH
  platform needs their cooperation to place the tag / bind a conversion).
- **Verify:** ad Final URL resolves 200 to the intake with `ref=` intact; tag
  present via Tag Assistant. Bid strategy is already Maximize clicks (correct).

### 6 — OMEGA (Google 285-398-1364) — finish PMax assets

- **Change:** complete PMax "Asset Group 1" (id 6534360768) — currently
  Incomplete, needs image/logo/**video** assets. Text-only won't clear it.
- **Blocked on input:** needs **David's brand assets** (incl. the wanted drone
  footage). Flag to Dillon/David.
- **Decision (flag):** two live domains — omegalandscapecorp.com and
  omegalandscapingandconcrete.com — standardize ads/conversions on ONE
  (Dillon's pick). Copy angle: "helped over 3,000 homeowners", NOT "15 years".
- ⚠️ Budget: was Limited-by-budget at $50/day — any raise is a **>20% gate**;
  flag, don't apply.
- **Verify:** asset group shows "Eligible/Complete" once assets are in; single
  canonical domain across ads.

## Blocked (need Dillon / client input before the local session can finish)

- **Zapier:** billing decision (upgrade vs wait for Aug 8); client-email go-ahead
  before bulk-replaying the 9 held runs.
- **KJB:** Poppy Bridal admin access to AW-18040733346 for the true completed-
  booking fix (secondary click can ship without it).
- **NKCDC:** the `ref=` param value; FSH cooperation to place GT-WBK85GCG.
- **Omega:** David's brand assets (image/logo/video) to complete PMax; canonical-
  domain pick.

## Applied log (local `claude --chrome` session fills in)

- [ ] Zapier — prune / replay / order-audit / re-test — result:
- [ ] KJB — Schedule Appointment as secondary — result:
- [ ] Fagan — 3-video swap + enhancements off — result:
- [ ] Onsite — single primary (Contact/39) — result:
- [ ] NKCDC — repoint URL w/ ref= + GT-WBK85GCG — result:
- [ ] Omega — PMax assets complete — result:
