# Align HubSpot — what Claude on this computer should say / do

Updated: 2026-07-30
Portal: **242825734** only (`dillon.mohr@alignhcm.com`)
Audience: Claude Desktop / Claude Code on the Align OneDrive machine with a live HubSpot Chrome session
Source: Codex attribution handoff (draft PR #11 on `align-hcm-august-2026-content`, branch `claude/site-health-dashboard-design-7x2z1z`)

Do **not** use portal `50612503` (Jason / Momentum). That is a separate agent.
Do **not** enable Align Customer Agent website chat (still LAUNCH HOLD).
Do **not** print, commit, Slack, or paste the private-app token into any chat.

---

## Goal

Unblock Codex depth on July 2026 attribution by giving it **read-only** Align HubSpot access, then leave sales-facing notes/tasks so the #1 open question (response latency vs conversion) can be tested without waiting on more analysis.

---

## 1) Create the Codex private app (paste into HubSpot UI)

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
- Read only. No CRM writes, no workflow edits, no email/SMS send, no Customer Agent changes.
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

Leave every write / send / workflow / conversations write scope unchecked.

### After create

1. Confirm the token was issued for portal **242825734**.
2. Store it only via the local secure path Claude already uses for Align HubSpot (DPAPI / secret store). Prefer an Align-specific env name such as `ALIGN_HUBSPOT_PRIVATE_APP_TOKEN` — never reuse the Jason token or `JASON_HUBSPOT_PRIVATE_APP_TOKEN`.
3. Run one identity check that returns portal id `242825734` before any bulk pull.
4. Tell Dillon: app created, portal verified, token stored locally — no raw token in the reply.

---

## 2) Saved view for the latency test (UI, no API write beyond the view)

Create a contact saved view named:

```
July 2026 Organic AI Social Never Contacted
```

Filters (approximate; match live property names):
- Original / corrected channel in Organic, Organic Search, AI Referral, Social (use the `align_*` corrected channel fields if present; otherwise hs_analytics_source + notes)
- No sales email AND no call AND no meeting logged after create date
- Created in the capture window used by the July handoff (from Jul 17 capture-live forward, or the handoff cohort dates)

Sort: create date ascending (oldest first).

If Claude cannot build the view from UI filters alone, stop and report which properties are missing — do not invent filters.

---

## 3) What to say on each never-contacted contact

Leave a **note** (not an email) with this body. Replace bracketed fields from the live record / JSON only. Do not invent company or person details.

### Note title / first line

```
Attribution follow-up queue — organic/AI/social, never contacted
```

### Note body (exact paste template)

```
Internal note only. Do not send as email.

Why this contact is flagged:
- July 2026 attribution review put organic / AI / social inbound in the priority latency test.
- 13 of 29 contacts in that channel group had no logged sales contact after create.
- The two closed deals in the review set closed in 28 and 47 days, so speed-to-first-touch is the cheapest decision test before more channel spend.

Suggested first touch (human owner decides channel):
1. Same-day reply acknowledging the form/source page they used.
2. One clear next step (15-min fit call or reply with company size / payroll headcount).
3. If no reply in 2 business days, one short bump, then park.

Log the first touch here so we can measure create → first engagement hours against conversion.
Do not change lifecycle stage from this note alone.
```

### Task (assign to the contact owner; due today or next business morning)

```
First touch — July attribution latency test

Contact has no logged sales activity after create and sits in the organic/AI/social cohort. Make one real first touch today, log it on the timeline, and note hours since create.
```

Batch limit: do the oldest 5 first unless Dillon says otherwise. Do not mass-email the cohort from this handoff.

---

## 4) Optional Customer Agent tester copy (internal only)

Only if Dillon asks for a Ben / internal preview. Path: portal 242825734 → Customer Agent → Align HCM Customer Agent → internal tester only.

Say to Ben (or paste as the tester instruction):

```
Internal tester only. Do not turn on website chat.

Ask the agent real Align product questions, then trust the Sources citations more than any inline URL in the prose. If an inline link looks wrong or invented, ignore it and use the Sources panel.

Still on launch hold until fabricated / mislabeled inline URLs are cleared.
```

Do not paste attribution findings (22% inbound win rate, 44.8% never-contacted, data-quality faults) into the Customer Agent knowledge base. Those stay in `attribution-handoff/01-findings.md` for Codex / Dillon — the HTML report stays positive and aggregate.

---

## 5) What Claude should report back when done

1. Private app created: yes/no, portal id verified.
2. Token stored locally: yes/no (never show token).
3. Saved view created: yes/no, contact count shown.
4. Notes/tasks written: count (no PII in the reply — counts only).
5. Blockers: missing scopes, missing `align_*` properties, wrong portal, or Customer Agent still held.

---

## Context Claude may need

- Attribution package: `attribution-handoff/` in draft PR #11 — machine-readable source of truth is `data/july-2026-attribution.json`.
- Second unblock (not HubSpot UI): access to `align-hcm-lead-intelligence` (last push ~Jul 17, same day capture went live).
- Repo choice for the handoff was inferred as `align-hcm-august-2026-content` because of `codex-handoff/` convention + vendor-agnostic blog content + GitHub scope. If Codex actually uses another repo, move the package — do not duplicate HubSpot work.
