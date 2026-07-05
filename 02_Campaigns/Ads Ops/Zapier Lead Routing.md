---
tags: [ads-ops, automation, leads]
source: "[[raw/2026-07-04 - full-autonomy-directive]]"
updated: 2026-07-04
---

# Zapier Lead Routing

**The standing fix**: every Meta instant-form lead must reach the client
within minutes, automatically. This is the problem Codex never solved; Dillon
has the Zapier login and granted full autonomy to build it.

## The standard Zap (one per client)

```
Trigger:  Facebook Lead Ads — New Lead
          (connect the client's PAGE + the specific FORM — this binding is
           where it usually silently breaks)
Filter:   only real submissions (skip test leads; optionally geo/answer filter
          using the qualifying-question fields)
Action 1: Email to DILLON first — every lead, every client (his standing rule,
          2026-07-04: he sees it before/alongside the client)
Action 2: Email to client — "New lead: {name} {phone} {answers}"
Action 3: Append row to "[Client] - Leads" Google Sheet (the permanent log —
          same pattern as KJB's lead sheet)
Action 4: (optional) SMS to client via their preferred channel
```

## Why it breaks (the Codex failure modes — check in this order)
1. **Page permission**: the Zapier Facebook connection must be made by a user
   with full page + leads_retrieval access on the client's page; agency-level
   BM access often isn't enough. Reconnect per page.
2. **Form binding**: a Zap bound to an old/duplicated form silently gets
   nothing when the form is re-created in Ads Manager. After any form edit,
   re-select the form in the Zap and re-test.
3. **Stale token**: Facebook connections expire quietly — Zap history shows
   "no new data". Reauthorize.
4. **CRM sync assumption**: Meta's own "CRM setup" and Zapier are separate;
   leads landing in Meta's Leads Center prove nothing about the Zap.
5. **Test discipline**: use Meta's Lead Ads Testing Tool → confirm the test
   lead appears in Zap history → confirm client email actually delivered
   (check spam) → THEN mark routed. Every step separately (the
   [[concepts/Draft-First Operating Rules|separate-actions rule]]).

## Rollout order
1. [[02_Campaigns/Ads Ops/Shadow HVAC Ads Spec|Shadow HVAC]] (with the form fix)
2. [[02_Campaigns/Ads Ops/Fagan Painting Ads Spec|Fagan Painting]] (after intake)
3. [[02_Campaigns/Ads Ops/KJB Ads Spec|KJB]] (currently manual sheet — automate it)
4. Every future lead-gen client gets this at launch, by default.

Per-cycle check: Zap history green for all clients; any "no new data" streak
longer than the client's normal lead cadence gets flagged in the Action Packet.

## APPLY READBACK — 2026-07-05 (live Zapier audit, Dillon's Chrome, owner 2958868)
**The Zaps already exist and are ON — the real blocker is a task/plan quota hold.**

**What's live (Zap workflows list, all toggles ON):**
- **Fagan Painting** — Facebook Lead → +2 steps → **Gmail** (client routing exists).
- **Netlify Leads - Omega + Onsite** — covers those two clients.
- **Reset - Send Email when Facebook Lead From - Hyperbaric…** (FB → email).
- **NEW MDLEAD → MAILCHIMP LEAD EMAIL AUTOMATION**, **remarketing md meta
  leads zap**, plus Melissa-template experiments: **"(Copy) md leads june mel
  test"**, **"christian md lead test"** (each FB + 4 steps).
- **Penn Nursing 2026 - LinkedIn Lauder Lead Gen Form**, **Google Forms
  responses to Slack**.

**⛔ ROOT CAUSE of "leads not reaching clients" — 9 HELD Zap runs.**
Zap History banner (2026-07-05): *"Action needed: 9 held Zap runs. These 9 Zap
runs will be held until **August 08, 2026**. You can replay Zap runs individually
or in bulk."* Held runs = leads that arrived but whose downstream steps (Google
Sheet + client/Dillon email) **never fired** → clients weren't notified. The
account is **over its monthly task quota**; Aug 8 is the quota reset date. The
"Save 33% / Contact Sales / Contact Support" banners confirm a constrained plan.

**So the Melissa template ("Facebook Lead → Google Sheet → email") does NOT need
to be built from scratch — equivalents already exist.** Building another Zap now
would only consume more of the exhausted task quota and add to the duplicate
"…test / (Copy)…" clutter.

**Decisions that are Dillon's to make (not auto-actioned — billing + sending
client emails require his go-ahead; both are outside autonomous scope):**
1. **Resolve the quota hold** — upgrade the Zapier plan for more monthly tasks
   (only Dillon can pay), OR wait for the Aug 8 reset. Until then, new leads keep
   getting held.
2. **Replay the 9 held runs** — pushes those held leads through now (fires client
   emails). NOT done autonomously: replaying sends messages on Dillon's behalf and
   generally requires being back under quota first. Dillon to bulk-replay (or say
   the word).
3. **Prune duplicate/test Zaps** — "(Copy) md leads june mel test", "christian md
   lead test", "remarketing md meta leads zap", old "MDLEAD" experiments are
   likely burning the task budget. Turning off the dead tests frees quota for the
   real client Zaps (Fagan, Omega+Onsite, etc.). Dillon to confirm which are safe
   to disable.
4. **Per-Zap recipient check** — once quota is healthy, confirm each live client
   Zap emails **Dillon first**, then the client, then logs the sheet (his standing
   rule), and re-test with Meta's Lead Ads Testing Tool per the failure-mode list
   above.
