---
tags: [campaign, growth-workshop, outreach, plan]
campaign: "[[Growth Workshop]]"
created: 2026-08-14
event_date: 2026-08-27
---

# Outreach Plan — two-week run to Aug 27

One-line summary: fill the Aug 27 workshop with zero ad spend — three email audiences inside Mac's three-touch cap, plus seven free organic channels, with deliverability gates before anything scales.

All copy lives in [[Drip Copy]]. Contact sourcing lives in [[Franchise Email Sourcing Playbook]]. Registrant calendar auto-add lives in [[Calendar Auto-Add]]. The Google/outreach split lives in [[Google RSVP Rail]]. Nothing sends without Sean/Mac approval; no agent sends anything, ever.

## Goals and honest math

Cold B2B email converts when it hits an owner. A UPS Store `store####@` box is the **shipping counter** — the person who hands you a package, not the person who owns the franchise. Blasting those inflates send volume and spam-complaint risk without filling Thursday.

| Source | Volume | Expected registrations |
|---|---|---|
| Philly 200-list (3 touches) | ~200 | 4–10 |
| Franchise send-ready (3 touches) | 50 wave 1, then 670 if gate green | 8–20 |
| UPS Store front-desk inboxes | 4,914 | **0 from email.** LinkedIn/GBP DMs on PA/NJ/DE owners only, 1–4 |
| Skool + LinkedIn + DMs + GBP + IG/X + signatures | — | 5–15 |
| **Total realistic range** | | **18–49 registered / ~40–60% show rate** |

Show rate is the Google problem, not the fill problem. Registrants get the Gmail EventReservation C1 + LP one-click calendar save. A 15–25 person live room is still a strong pilot. The real asset is the repeatable engine + a domain that is not burned.

## Channel plan (all free)

| # | Channel | Owner | Cadence |
|---|---|---|---|
| 1 | Cold email — 200-list | Sean sends, Dillon preps | T1 Aug 18 · T2 Aug 21 · T3 Aug 25 |
| 2 | Cold email — franchise send-ready (50 named, then rest if gate green) | Sean sends, Dillon preps | T1 Aug 19 · T2 Aug 24 · T3 Aug 26 |
| 3 | Cold email — UPS Store front-desk inboxes | **blocked** | Do not send. Convert PA/NJ/DE rows to owner DMs instead |
| 4 | Skool community post | Sean | Aug 18, bump Aug 25 |
| 5 | LinkedIn posts (Mac + Sean, Dillon reposts) | Mac/Sean | Aug 18 · Aug 21 · Aug 26 |
| 6 | LinkedIn DMs (10–15/day, manual) | Sean/Mac | Aug 19–26 |
| 7 | Momentum GBP post | Dillon | Aug 18 |
| 8 | IG reels (Sean on camera) | Sean | Aug 20 · Aug 25 |
| 9 | X post | Dillon | Aug 24 |
| 10 | Email signatures (whole team) | everyone | from Aug 17 |

## Day-by-day calendar

**Fri Aug 14 (today)**
- LP date-push package ready (`lp-date-push/`) — deploy + verify per checklist.
- Ask Sean/Mac for the three open decisions: meeting link, sender mailbox, seat cap ([[Slack Draft — Sean]] is ready to paste).
- Check SPF/DKIM on the sending domain.

**Sat–Sun Aug 15–16** — no sends. Stage organic posts, reel script to Sean, signature line to team.

**Mon Aug 17**
- LP verified live with Aug 27. Meeting link into all copy placeholders.
- 200-list cleaned in the Drive sheet (dupes out, dead domains flagged, statuses normalized).
- Franchise **send-ready** sheet delivered to Sean (wave 1 = 50 named people marked; 670 more franchisee mailboxes in Wave 2; UPS counters are not in this file).
- Sean/Mac approve Touch-1 copy word-for-word. Signatures go live.

**Tue Aug 18** — 200-list Touch 1 (40–60 sends, spread through the morning; rest Wed). Skool post. GBP post. LinkedIn post 1.

**Wed Aug 19** — 200-list Touch 1 remainder. **Franchise owner-density Touch 1** (25–40 sends, rest Thu AM). LinkedIn DMs batch 1 (start with PA/NJ/DE UPS *owners*, not store inboxes).

**Thu Aug 20** — **Gate check #1** (see gates). IG reel 1. DMs batch 2.

**Fri Aug 21** — 200-list Touch 2. Remaining owner-density Touch 1 *only if gate #1 green*. LinkedIn post 2.

**Sat–Sun Aug 22–23** — quiet. Reply handling only.

**Mon Aug 24** — Franchise wave 1 Touch 2. X post. DMs batch 3.

**Tue Aug 25** — 200-list Touch 3 (final call). Owner-density Touch 2. IG reel 2. Skool bump.

**Wed Aug 26** — Franchise wave 1 Touch 3 (final call). Registrant day-before reminder (C2). LinkedIn post 3 ("tomorrow").

**Thu Aug 27 — event day**
- 11:00 AM: one-hour reminder (C3).
- 12:00 PM: **live**. Dillon monitors registrations/attendance.
- ~3:00 PM: no-show replay email (C4).

**Fri Aug 28** — post-event follow-up + booking CTA (C5). Retro: fill the metrics table below, log lessons to [[12_Brain/projects/Growth Workshop Franchise Pilot]].

Note on compression: wave-1 touches land Aug 19 → 24 → 26 (3 business days, then 2). Tighter than the ideal 3–4 / 5–7 spacing because the runway is two weeks; the touch cap still holds.

## Go/no-go gates

**Gate #1 — after franchise owner-density Touch 1 (Thu Aug 20):**
- Bounce rate < 5% and zero spam complaints → green: remaining owner-density rows.
- Bounce 5–8% → yellow: named contacts only.
- Bounce > 8% or any spam complaint → red: stop cold email, organic + LinkedIn only.
- UPS Store role mailboxes stay blocked regardless of this gate.

**Gate #2 — scale decision (post-event):** only consider paid data/enrichment tools if the free pilot converts registrations and Sean wants volume; take it through the normal MCP/tool gate with a firm monthly cap (per the Aug 8 DM commitment).

## Tracking

- Every cold email CTA uses the per-row UTM link → Netlify form captures `utm_*` + `source_prospect_id` → registration attributable to list + row.
- Organic uses the pretty URL (attribution = `utm_source=calendar/direct` bucket; acceptable for the pilot).
- Sheet columns to keep current: `Outreach Status` (not sent / sent-t1 / sent-t2 / sent-t3 / replied / registered / suppressed), `Email Sent Date`.
- Daily during send week: registrations count, bounce count, replies — 2 minutes in the Netlify dashboard + mailbox.

## Metrics table (fill at retro, Aug 28)

| Metric | 200-list | Owner-density | UPS DMs | Organic |
|---|---|---|---|---|
| Sent T1/T2/T3 | | | | — |
| Bounce % | | | | — |
| Replies | | | | — |
| Registrations | | | | |
| Attended | | | | |
