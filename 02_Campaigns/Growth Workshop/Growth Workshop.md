---
tags: [campaign, webinar, franchise, outreach]
status: active
owner: Dillon Mohr
requested_by: Sean Boyle
stakeholders: [Sean Boyle, Mac Frederick]
started: 2026-07-23
event_date: 2026-08-27
source: "Slack DM D0A6ECLQ0S1 + #skool-gbp-course"
---

# Growth Workshop

The master campaign note. Momentum 360's free webinar funnel: a 60-minute live working session hosted by Mac + Sean ("Build a Business That Grows Without You"), registration page built by Dillon, filled by free permission-appropriate outreach to franchise owners and the existing Philly prospect list.

Companion notes:
- [[Outreach Plan]] — channels, day-by-day Aug 14–27 calendar, send rules, go/no-go gates
- [[Google RSVP Rail]] — quality-first send pool + Gmail EventReservation for registrants (not the cold list)
- [[Drip Copy]] — every email, reminder, DM script, and organic post, paste-ready
- [[Franchise Email Sourcing Playbook]] — how the free franchise contact engine works
- [[Scale Harvest Report]] — 720 send-ready franchisee emails (UPS counters dropped)
- `lp-date-push/` — patched LP files + [[lp-date-push/DEPLOY-CHECKLIST|deploy checklist]] for the Aug 27 date
- [[Calendar Auto-Add]] — Google Calendar invitation for registrants + ICS / template URLs (never the cold list)
- Project page: [[12_Brain/projects/Growth Workshop Franchise Pilot|Growth Workshop Franchise Pilot]]

## The event

| | |
|---|---|
| What | Momentum 360 Growth Workshop — "Build a Business That Grows Without You" |
| When | **Thursday, August 27, 2026, 12:00 PM ET** (60 min) — pushed from Aug 13 |
| Hosts | Mac Frederick + Sean Boyle |
| Where | Live online — working Meet link https://meet.google.com/ive-hkws-xdg (Sean/Mac may still swap in Zoom) |
| Registration (pretty URL) | https://www.momentumvirtualtours.com/growth-workshop/ |
| Registration (tracking URL for email CTAs) | https://momentum-workshop-pilot.netlify.app/ + UTMs + `#register` |
| Captures | name, email, company, real growth bottleneck; calendar add; UTM source |
| Dashboard | Netlify Forms (`workshop-registration`) + on-page registration dashboard |

**Why two URLs:** the WordPress page embeds the Netlify app in a fixed iframe, so UTM parameters on the WordPress URL never reach the form. Cold email CTAs therefore link the Netlify app directly with per-prospect UTMs (same pattern as the existing 200-prospect sheet); organic/social uses the pretty WordPress URL.

## The ask (Sean, Aug 7–8 DMs)

> could u scrape franchise emails? … What would cost be or how can we do it

Answered with the phased plan in the same DM (Aug 8, 03:21 ET): lock one canonical workshop link, clean the existing 200-prospect list, run a small franchise-email pilot from public sources before buying anything, keep outreach inside Mac's three-touch cap. This campaign executes that plan with the event moved to Aug 27.

## Audiences

1. **Existing 200-prospect Philly list** (Drive sheet, all rows `Not sent`) — warm-up audience, invite is fresh, not a reschedule.
2. **Franchise list** (send-ready) — **720** franchisee/office mailboxes a human can actually email (CertaPro, Synergy HomeCare, Mosquito Squad, Comfort Keepers, PACKOUTS). Wave 1 = 50 named people. **Do not email the 4,914 UPS Store front-desk inboxes** — those are shipping counters, used only as LinkedIn/GBP research in PA/NJ/DE. See [[Google RSVP Rail]].
3. **Franchisor marketing / franchise-development contacts** — secondary tier, only after wave-1 data.

## Hard rules

- **No sends by agents. Ever.** Every email, Slack message, and deploy is executed by Dillon or Sean after explicit approval. Drafts live in [[Drip Copy]].
- **No purchased data in the pilot.** Free public sources only; every contact row carries its source URL.
- **Three-touch cap** per contact (Mac's rule), then stop.
- **PII stays out of this public repo.** Contact lists live in the private Drive sheet; this folder holds methods, copy, and counts only.

## Open decisions (owners)

| Decision | Owner | Status |
|---|---|---|
| Meeting link (Zoom vs this Meet) | Sean/Mac | **Meet is live** on the canonical calendar event; confirm or replace |
| Calendar auto-invite webhook | Dillon | Apps Script (or Netlify function) not connected yet — LP click-to-save works now |
| Sender mailbox for cold email (recommend `sean@needmomentum.com`) | Sean | open |
| Seat cap | Sean/Mac | open (default: none) |
| Wave-2 franchise expansion | Dillon+Sean | gated on wave-1 deliverability |
