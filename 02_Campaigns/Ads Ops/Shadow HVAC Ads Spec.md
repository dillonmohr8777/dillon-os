---
tags: [ads-ops, client-spec]
source: "[[raw/2026-07-04 - full-autonomy-directive]]"
updated: 2026-07-04
---

# Shadow HVAC — Ads Spec

Residential HVAC, Hampshire IL. **Reactivated 2026-07-04** (was marked former
this morning; Dillon ordered instant-form work same day). Google Ads
**314-136-4176**; Search + LSA history; $250/mo historical rate.

## The instant-form fix (Dillon's spec, verbatim intent)
Meta instant form must deliver **qualified leads only, near Hampshire IL,
English-only**:

1. **Geo**: radius targeting on Hampshire, IL + documented service area —
   Kane County: Huntley, Pingree Grove, Gilberts, Burlington, Elgin (from the
   site build). Kill broad/statewide delivery; exclude "people traveling in".
2. **Language**: ad-set language targeting = **English only**; remove any
   Spanish/multi-language expansion; check Advantage+ audience isn't overriding
   geo/language (lock it down or switch to original audiences).
3. **Qualification**: add form questions — own/rent, service needed
   (repair/install/maintenance), timeline (now / this month / researching);
   switch form type from "More volume" to **"Higher intent"** (review screen).
4. **Delivery**: confirm the form's leads actually route to the client — wire
   through [[02_Campaigns/Ads Ops/Zapier Lead Routing|Zapier Lead Routing]].

## Unknowns for cycle 1 (find in the Chrome session)
- Which Meta Business Manager / page holds the form (not in vault).
- LSA state: background check was reset 2026-03-02; verify LSA ever served after.
- Conversion tracking on Google side: undocumented — audit and bind.

## Update (2026-07-04 sweep)
Google 314-136-4176 exists but **paused / no active spend**. Meta lane is
ACTIVE — recent campaign "Shadow AC Leads…". Dillon's priority call: Shadow is
last in the all-client session order. Source:
[[raw/2026-07-04 - account-inventory-sweep]].

## Scope lock (Dillon, 2026-07-04): META ONLY
**Ignore Shadow's Google Ads entirely** — no optimization, no reactivation of
314-136-4176. Shadow work = the Meta instant-form fix + Zapier routing, nothing
else. Source: [[raw/2026-07-04 - platform-scope-and-bitwarden-state]].

## APPLY READBACK — 2026-07-05 (autonomous run, live Chrome)
- Shadow's Meta campaigns live in **ad account 1399331594100332** (Dillon Mohr
  portfolio; there is no ad account literally named "Shadow"). Two campaigns:
  - **"Shadow AC Leads | Hampshire 30mi | Summer 2026" — Active + "High
    performing"** ✅ (geo per name = Hampshire 30mi; instant-form lead campaign).
  - **"Shadow AC Calls + Homeowner | Hampshire 30mi" — Off.**
- Instant-form geo (Hampshire 30mi) is in place and the lead campaign is
  performing well. English is not a hard control under Advantage+ audience
  (same limitation as Fagan) — location + creative carry it.
- **Zapier lead routing NOT wired/tested this run** (carry-over — see
  apply-log-2026-07-05 + [[02_Campaigns/Ads Ops/Zapier Lead Routing]]). Use
  Melissa's template: Facebook Lead Ads → Google Sheet → email (Dillon first,
  then client). Connect Shadow's page + the "Shadow AC Leads" form; send a test
  lead; verify each hop.
