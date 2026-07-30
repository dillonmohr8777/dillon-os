# Align HubSpot CRM — what Claude on this computer should say / do

Updated: 2026-07-30
Portal: **242825734** only (`dillon.mohr@alignhcm.com`)
Audience: Claude Desktop / Claude Code on the Align OneDrive machine with a live HubSpot Chrome session
Source: Codex attribution handoff (draft PR #11 on `align-hcm-august-2026-content`, branch `claude/site-health-dashboard-design-7x2z1z`)

This is **CRM-only** work inside HubSpot (contacts, notes, tasks, private app). It is not Customer Agent, website chat, or knowledge-base work.

Do **not** use portal `50612503` (Jason / Momentum).
Do **not** print, commit, Slack, or paste the private-app token into any chat.
Do **not** send mass email from this handoff.

---

## Goal

Unblock Codex depth on July 2026 attribution with **read-only** Align HubSpot access, then put sales-facing notes/tasks on the never-contacted organic/AI/social contacts so response latency can be tested in the CRM.

---

## 1) Create the Codex private app

Path: HubSpot → Settings (gear) → Integrations → Private Apps → Create a private app

### App name

```
Align Codex Attribution Reader
```

### Description (exact paste)

```
Read-only private app for Codex attribution analysis on Align HCM portal 242825734.

Purpose: compute marketing attribution, first-touch / last-touch channel, contact response latency, deal cycle length, and data-quality checks against the July 2026 attribution handoff (attribution-handoff/data/july-2026-attribution.json).

Rules:
- Read only. No CRM writes, no workflow edits, no email/SMS send.
- Aggregate and PII-safe reporting by default.
- Token stays on the Align OneDrive Codex machine / secure secret store. Never commit or paste into Slack/chat.
```

### Scopes to check (read only)

CRM objects:
- `crm.objects.contacts.read`
- `crm.objects.companies.read`
- `crm.objects.deals.read`
- `crm.objects.leads.read` (if shown)
- `crm.objects.owners.read`
- `crm.objects.calls.read`
- `crm.objects.emails.read`
- `crm.objects.meetings.read`
- `crm.objects.notes.read`
- `crm.objects.tasks.read`
- `crm.objects.communications.read` (if shown)

Schemas / lists / forms:
- `crm.schemas.contacts.read`
- `crm.schemas.companies.read`
- `crm.schemas.deals.read`
- `crm.lists.read`
- `forms` (or Forms read / form submissions timeline if labeled that way)

Optional if present and clearly read-only:
- `sales-email-read`
- marketing campaign read scopes that do not grant send

Leave every write / send / workflow scope unchecked.

### After create

1. Confirm the token was issued for portal **242825734**.
2. Store it only via the local secure path (DPAPI / secret store) as `ALIGN_HUBSPOT_PRIVATE_APP_TOKEN` — never reuse the Jason token.
3. Run one identity check that returns portal id `242825734` before any bulk pull.
4. Tell Dillon: app created, portal verified, token stored locally — no raw token in the reply.

---

## 2) Saved view for the latency test

Create a contact saved view named:

```
July 2026 Organic AI Social Never Contacted
```

Filters (match live property names; do not invent):
- Channel in Organic, Organic Search, AI Referral, Social (prefer `align_*` corrected channel fields if present; else hs_analytics_source)
- No sales email AND no call AND no meeting logged after create date
- Created in the July handoff cohort window (from Jul 17 capture-live forward, or the dates in `july-2026-attribution.json`)

Sort: create date ascending (oldest first).

If the view cannot be built from UI filters, stop and report which properties are missing.

---

## 3) What to say on each never-contacted contact

Leave a **CRM note** (not an email). Pull names/dates from the live record or JSON only.

### Note first line

```
Attribution follow-up queue — organic/AI/social, never contacted
```

### Note body (exact paste)

```
Internal CRM note only. Do not send as email.

Why this contact is flagged:
- July 2026 attribution review put organic / AI / social inbound in the priority latency test.
- 13 of 29 contacts in that channel group had no logged sales contact after create.
- The two closed deals in the review set closed in 28 and 47 days, so speed-to-first-touch is the cheapest decision test before more channel spend.

Suggested first touch (owner picks channel):
1. Same-day reply acknowledging the form/source page they used.
2. One clear next step (15-min fit call or reply with company size / payroll headcount).
3. If no reply in 2 business days, one short bump, then park.

Log the first touch on this timeline so we can measure create → first engagement hours against conversion.
Do not change lifecycle stage from this note alone.
```

### Task (assign to contact owner; due today or next business morning)

```
First touch — July attribution latency test

Contact has no logged sales activity after create and sits in the organic/AI/social cohort. Make one real first touch today, log it on the timeline, and note hours since create.
```

Batch limit: oldest 5 first unless Dillon says otherwise.

---

## 4) What Claude should report back when done

1. Private app created: yes/no, portal id verified.
2. Token stored locally: yes/no (never show token).
3. Saved view created: yes/no, contact count shown.
4. Notes/tasks written: count only (no PII).
5. Blockers: missing scopes, missing `align_*` properties, or wrong portal.

---

## Context

- Attribution package: `attribution-handoff/` in draft PR #11 — source of truth is `data/july-2026-attribution.json`.
- Second unblock (not HubSpot UI): access to `align-hcm-lead-intelligence`.
