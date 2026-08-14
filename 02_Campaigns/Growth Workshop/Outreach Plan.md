---
tags: [campaign, growth-workshop, outreach, plan]
campaign: "[[Growth Workshop]]"
created: 2026-08-14
event_date: 2026-08-27
---

# Outreach Plan — two-week run to Aug 27

One-line summary: fill the Aug 27 workshop with zero ad spend — three email audiences inside Mac's three-touch cap, plus seven free organic channels, with deliverability gates before anything scales.

All copy lives in [[Drip Copy]]. Contact sourcing lives in [[Franchise Email Sourcing Playbook]]. Nothing sends without Sean/Mac approval; no agent sends anything, ever.

## Goals and honest math

Cold B2B email to a fresh list converts registration at roughly 1–3%; organic + warm channels do the heavy lifting on a two-week runway.

| Source | Volume | Expected registrations |
|---|---|---|
| Philly 200-list (3 touches) | ~200 | 4–10 |
| Franchise wave 1 (3 touches) | 50 | 1–3 |
| Franchise wave 2 (if gate passes) | 50–100 | 2–5 |
| Skool + LinkedIn + DMs + GBP + IG/X + signatures | — | 5–15 |
| **Total realistic range** | | **12–33 registered / ~40–60% show rate** |

A 15–25 person live room is a strong pilot. The real asset is the repeatable engine + the list + the replay.

## Channel plan (all free)

| # | Channel | Owner | Cadence |
|---|---|---|---|
| 1 | Cold email — 200-list | Sean sends, Dillon preps | T1 Aug 18 · T2 Aug 21 · T3 Aug 25 |
| 2 | Cold email — franchise wave 1 (50) | Sean sends, Dillon preps | T1 Aug 19 · T2 Aug 24 · T3 Aug 26 |
| 3 | Cold email — franchise wave 2 | gated | T1 Aug 21 · T2 Aug 25 · T3 Aug 27 AM |
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
- Franchise pilot sheet delivered to Sean (wave 1 = 50 rows marked).
- Sean/Mac approve Touch-1 copy word-for-word. Signatures go live.

**Tue Aug 18** — 200-list Touch 1 (40–60 sends, spread through the morning; rest Wed). Skool post. GBP post. LinkedIn post 1.

**Wed Aug 19** — 200-list Touch 1 remainder. **Franchise wave 1 Touch 1** (25–40 sends, rest Thu AM). LinkedIn DMs batch 1.

**Thu Aug 20** — **Gate check #1** (see gates). IG reel 1. DMs batch 2.

**Fri Aug 21** — 200-list Touch 2. Franchise wave 2 Touch 1 *only if gate #1 green*. LinkedIn post 2.

**Sat–Sun Aug 22–23** — quiet. Reply handling only.

**Mon Aug 24** — Franchise wave 1 Touch 2. X post. DMs batch 3.

**Tue Aug 25** — 200-list Touch 3 (final call). Franchise wave 2 Touch 2. IG reel 2. Skool bump.

**Wed Aug 26** — Franchise wave 1 Touch 3 (final call). Registrant day-before reminder (C2). LinkedIn post 3 ("tomorrow").

**Thu Aug 27 — event day**
- 11:00 AM: one-hour reminder (C3).
- 12:00 PM: **live**. Dillon monitors registrations/attendance.
- ~3:00 PM: no-show replay email (C4).

**Fri Aug 28** — post-event follow-up + booking CTA (C5). Retro: fill the metrics table below, log lessons to [[12_Brain/projects/Growth Workshop Franchise Pilot]].

Note on compression: wave-1 touches land Aug 19 → 24 → 26 (3 business days, then 2). Tighter than the ideal 3–4 / 5–7 spacing because the runway is two weeks; the touch cap still holds.

## Go/no-go gates

**Gate #1 — after franchise wave 1 Touch 1 (Thu Aug 20):**
- Bounce rate < 5% and zero spam complaints → green: proceed to wave 2.
- Bounce 5–8% → yellow: send wave 2 only to rows with `mx_ok` + named contacts.
- Bounce > 8% or any spam complaint → red: stop cold email, organic only, fix list quality before any further sends.

**Gate #2 — scale decision (post-event):** only consider paid data/enrichment tools if the free pilot converts registrations and Sean wants volume; take it through the normal MCP/tool gate with a firm monthly cap (per the Aug 8 DM commitment).

## Tracking

- Every cold email CTA uses the per-row UTM link → Netlify form captures `utm_*` + `source_prospect_id` → registration attributable to list + row.
- Organic uses the pretty URL (attribution = `utm_source=calendar/direct` bucket; acceptable for the pilot).
- Sheet columns to keep current: `Outreach Status` (not sent / sent-t1 / sent-t2 / sent-t3 / replied / registered / suppressed), `Email Sent Date`.
- Daily during send week: registrations count, bounce count, replies — 2 minutes in the Netlify dashboard + mailbox.

## Metrics table (fill at retro, Aug 28)

| Metric | 200-list | Franchise w1 | Franchise w2 | Organic |
|---|---|---|---|---|
| Sent T1/T2/T3 | | | | — |
| Bounce % | | | | — |
| Replies | | | | — |
| Registrations | | | | |
| Attended | | | | |
