---
tags: [campaign, growth-workshop, copy, email]
campaign: "[[Growth Workshop]]"
created: 2026-08-14
event_date: 2026-08-27
status: draft-awaiting-sean-mac-approval
---

# Drip Copy — Growth Workshop (Aug 27)

One-line summary: every message the campaign needs, paste-ready, nothing sends until Sean/Mac approve and a human presses send.

## Sending rules (apply to every email below)

- **Sender:** one real person mailbox — recommend `sean@needmomentum.com`, name "Sean Boyle". No `noreply@`.
- **Before the first send:** confirm SPF + DKIM pass for the sending domain (GHL settings or `dig txt needmomentum.com`), and fill in the meeting link.
- **Volume:** 25–40 cold sends per day per mailbox, spread across the morning. Never blast the whole list at once.
- **Windows:** Tue–Thu 8:30–11:00 AM ET first, Mon/Fri second.
- **Three-touch cap** per contact, then stop (Mac's rule). Replies remove a contact from all remaining touches.
- **Format:** plain text, one link per email, no images, no attachments — **except C1**, which is HTML with Gmail EventReservation markup (`c1-gmail-event.html`) and is registrants-only.
- **CAN-SPAM footer on every cold email** (fill the address once in the template):

> Momentum 360 · [MOMENTUM 360 MAILING ADDRESS — required, fill before send]
> Don't want these? Reply "no thanks" and we won't email you again. {{unsubscribe_link}}

- **Suppression:** any bounce, "no thanks," or unsubscribe goes into the sheet's `Outreach Status` column immediately (`suppressed`).

## Token map

| Token | Sheet column | GHL merge tag |
|---|---|---|
| `{{first_name}}` (fallback "there") | Contact Name (first word) | `{{contact.first_name}}` |
| `{{business}}` | Business Name | `{{contact.company_name}}` |
| `{{city}}` | City | `{{contact.city}}` |
| `{{brand}}` | Franchise brand column (franchise list only) | custom field |
| `{{reg_link}}` | Registration Link (per-row UTM URL) | custom field |

Franchise-list `{{reg_link}}` pattern:
`https://momentum-workshop-pilot.netlify.app/?utm_source=franchise_pilot&utm_medium=permissioned_outreach&utm_campaign=franchise_workshop_2026_08&utm_content=FRAN-WORKSHOP-####register`
200-list rows keep the links already in the sheet (`utm_campaign=phl_owner_workshop_2026_08`).

---

# A. Cold sequence — franchise owners (3 touches)

## A1 · Touch 1 — invite (wave 1: Wed Aug 19)

**Subject options (pick/test two):**
1. `Free workshop for franchise owners — Aug 27`
2. `{{first_name}}, one hour on {{business}}'s next 30 days`
3. `Local demand is yours to win, {{first_name}}`

**Body:**

Hi {{first_name}},

I'm Sean, co-founder of Momentum 360 in Philadelphia. On **Thursday, August 27 at 12 PM ET** my partner Mac and I are running a free 60-minute working session for business owners: **Build a Business That Grows Without You**.

For franchise owners it's built around one thing: the brand gives you the playbook, but local demand — Google Business Profile, reviews, local pages, lead flow — is yours to win. Bring the one bottleneck slowing {{business}} down and you'll leave with a 30-day plan for it. No pitch, no fluff, working session format.

Grab a seat here (takes 30 seconds — we drop Thursday on your Google Calendar in the same click): {{reg_link}}

If it's not for you, no worries at all — reply "no thanks" and that's the last you'll hear from me.

Sean Boyle
Momentum 360 · Philadelphia
[CAN-SPAM footer]

## A2 · Touch 2 — agenda (wave 1: Mon Aug 24)

**Subject options:**
1. `The agenda for Thursday (Aug 27, 12 PM ET)`
2. `One hour. One bottleneck. One 30-day plan.`

**Body:**

Hi {{first_name}},

Quick follow-up on the Growth Workshop this **Thursday at 12 PM ET**. Here's the whole hour:

1. Find the bottleneck — we diagnose what's actually capping growth at your location
2. See the system — the exact local-marketing setup we run for multi-location businesses
3. Build the plan — you leave with a written 30-day plan and the first three moves

We keep it small enough to work on real businesses live. If {{business}} has a growth question you keep putting off, this is a free hour with two founders who do this every day.

Seat's here: {{reg_link}}

Sean

[CAN-SPAM footer]

## A3 · Touch 3 — final call (wave 1: Wed Aug 26)

**Subject options:**
1. `Tomorrow at noon — last call`
2. `Doors close on this one, {{first_name}}`

**Body:**

Hi {{first_name}} — last note from me, promise.

The Growth Workshop is **tomorrow, Thursday Aug 27 at 12 PM ET**. 60 minutes, live, free. You bring the bottleneck, you leave with a 30-day plan. If Thursday's packed, register anyway and we'll send the replay.

Register: {{reg_link}}

Either way — rooting for {{business}}.

Sean

[CAN-SPAM footer]

---

# B. Cold sequence — Philly 200-list (same skeleton, local angle)

Only Touch 1's body differs; Touches 2–3 reuse A2/A3 verbatim.

## B1 · Touch 1 — invite (Tue Aug 18)

**Subject options:**
1. `Free Philly business workshop — Aug 27`
2. `{{first_name}}, an hour on {{business}}'s next 30 days`

**Body:**

Hi {{first_name}},

I'm Sean, co-founder of Momentum 360 here in Philadelphia. On **Thursday, August 27 at 12 PM ET**, my partner Mac and I are hosting a free 60-minute working session for local business owners: **Build a Business That Grows Without You**.

We came across {{business}} doing research on {{city}} businesses we think we can genuinely help. The format is simple: bring the one bottleneck slowing you down — leads, reviews, the website, hiring pressure on your time — and leave with a written 30-day plan for it. No pitch, working session.

Seat's here (30 seconds — Google Calendar opens with Thursday already filled in): {{reg_link}}

Not for you? Reply "no thanks" and that's the last email you'll get from me.

Sean Boyle
Momentum 360 · Philadelphia
[CAN-SPAM footer]

---

# C. Registrant lifecycle (send to registrants only — these are permission-based, no touch cap)

## C1 · Confirmation (instant, or same-day manual)

**Subject:** `You're in — Growth Workshop, Thu Aug 27, 12 PM ET`

**Send as HTML** from Sean's mailbox (GHL HTML or Gmail). Paste `c1-gmail-event.html`. Merge `{{first_name}}`, `{{email}}`, `{{reservation_id}}` (any stable id is fine). Do **not** use this file on the cold sequence.

Plain-text fallback if the ESP cannot send HTML:

Hi {{first_name}},

You're registered for the Momentum 360 Growth Workshop — **Thursday, August 27, 12:00–1:00 PM ET**.

Join link: https://meet.google.com/ive-hkws-xdg
Add to calendar: https://calendar.google.com/calendar/render?action=TEMPLATE&text=Build+a+Business+That+Grows+Without+You&dates=20260827T160000Z%2F20260827T170000Z&details=Live+Momentum+360+workshop+hosted+by+Sean+and+Mac.+Bring+one+active+offer+and+one+growth+constraint.+Join+the+live+workshop%3A+https%3A%2F%2Fmeet.google.com%2Five-hkws-xdg&location=https%3A%2F%2Fmeet.google.com%2Five-hkws-xdg&ctz=America%2FNew_York
Outlook: https://outlook.live.com/calendar/0/deeplink/compose?rru=addevent&subject=Build+a+Business+That+Grows+Without+You&startdt=2026-08-27T16%3A00%3A00.000Z&enddt=2026-08-27T17%3A00%3A00.000Z&body=Live+Momentum+360+workshop+hosted+by+Sean+and+Mac.+Bring+one+active+offer+and+one+growth+constraint.+Join+the+live+workshop%3A+https%3A%2F%2Fmeet.google.com%2Five-hkws-xdg&location=https%3A%2F%2Fmeet.google.com%2Five-hkws-xdg
ICS: https://momentum-workshop-pilot.netlify.app/momentum-workshops.ics

One ask before Thursday: hit reply and tell us the single biggest bottleneck at your business right now. Mac and I build the session around what registrants send.

See you Thursday,
Sean + Mac

## C2 · Day-before reminder (Wed Aug 26, ~10 AM)

**Subject:** `Tomorrow, 12 PM ET — bring your bottleneck`

Hi {{first_name}},

Quick reminder: the Growth Workshop is **tomorrow at 12 PM ET**. 60 minutes, live, working format.

Join link: https://meet.google.com/ive-hkws-xdg

Have your numbers handy (rough is fine): where leads come from now, and what a new customer is worth. That's all the prep the session needs.

Sean + Mac

## C3 · One-hour reminder (Thu Aug 27, 11 AM)

**Subject:** `We're live at noon — join link inside`

{{first_name}} — we go live in an hour. Join here at 12 PM ET: https://meet.google.com/ive-hkws-xdg

Bring the bottleneck. We'll bring the plan.

Sean + Mac

## C4 · No-show replay (Thu Aug 27, ~3 PM, non-attendees)

**Subject:** `Missed it? Here's the replay + the 30-day plan template`

Hi {{first_name}},

Life happens — here's the full replay of today's Growth Workshop: [REPLAY LINK]

The 30-day plan template we built live is here: [TEMPLATE/RECAP LINK]

If you want the 15-minute version applied to {{business}} directly, grab a time: [BOOKING LINK]

Sean + Mac

## C5 · Post-event follow-up (Fri Aug 28, all registrants)

**Subject:** `Your 30-day plan (and what happened yesterday)`

Hi {{first_name}},

Thanks for being part of yesterday's workshop. Recap in three lines:

1. The replay: [REPLAY LINK]
2. The 30-day plan template: [TEMPLATE LINK]
3. Every business that attended can claim a free 15-minute plan review with me or Mac this week: [BOOKING LINK]

If yesterday surfaced a bottleneck you want handled for you — local visibility, reviews, the website, lead flow — that call is where we map it.

Sean + Mac
Momentum 360

---

# D. LinkedIn DM scripts (manual, from Sean's or Mac's profile — 10–15/day max)

**D1 · Cold-ish (franchise owner you don't know):**

> Hi {{first_name}} — saw you run {{business}} in {{city}}. Mac and I (Momentum 360, Philly) are hosting a free 60-min working session for owners on Aug 27: bring your biggest growth bottleneck, leave with a 30-day plan. Thought of you because franchise owners get the brand playbook but still own local demand. Want the link?

**D2 · Warm (existing connection):**

> {{first_name}}! Quick one — Mac and I are running our Growth Workshop live on Thu Aug 27, 12 PM ET. One hour, one bottleneck, one 30-day plan. Would love to have you in the room: https://www.momentumvirtualtours.com/growth-workshop/

"Want the link?" in D1 is deliberate — reply-gated links get fewer spam flags and start conversations.

---

# E. Organic posts (free channels)

## E1 · Skool community post (Mon Aug 18)

**Title:** `Live working session Aug 27: Build a Business That Grows Without You`

We're doing this one live. Thursday Aug 27, 12 PM ET — Mac and I take real businesses, find the one bottleneck capping growth, and write a 30-day plan on the spot. Free, 60 minutes, no pitch. If you want your business used as a live example, register and reply here with your bottleneck. Link: https://www.momentumvirtualtours.com/growth-workshop/

## E2 · LinkedIn post 1 — save the date (Mac + Sean + Dillon repost, Tue Aug 18)

Most business owners don't have a marketing problem. They have a bottleneck problem — one constraint eating everything downstream.

On Thursday Aug 27 at 12 PM ET, Mac Frederick and I are hosting a free 60-minute working session: **Build a Business That Grows Without You.**

Format: you bring the bottleneck. We find it, show the system we use on real multi-location businesses, and you leave with a written 30-day plan.

Franchise and multi-location owners: this one is especially for you. The brand gives you the playbook — local demand is still yours to win.

Free seat: link in comments.

## E3 · LinkedIn post 2 — agenda (Fri Aug 21)

One hour. One bottleneck. One 30-day plan.

That's the whole agenda for next Thursday's Growth Workshop (Aug 27, 12 PM ET):

1. Find the bottleneck
2. See the system
3. Build the plan — live, on real businesses

Two founders, zero pitch. Link in comments.

## E4 · LinkedIn post 3 — tomorrow (Wed Aug 26)

Tomorrow at noon ET we go live.

If your business grew 0–10% this year and you can't name the exact constraint — that's the thing we fix in one hour tomorrow. Free seat, link in comments. See you there.

## E5 · Google Business Profile post (Mon Aug 18, Momentum 360 listing)

**Free Growth Workshop — Thu Aug 27, 12 PM ET.** A 60-minute live working session with Momentum 360's founders. Bring your biggest business bottleneck, leave with a 30-day plan. Register: https://www.momentumvirtualtours.com/growth-workshop/ [CTA button: Sign up]

## E6 · Instagram reel script (Sean, ~30s, post Thu Aug 20 + Tue Aug 25)

Hook (0–3s, on camera): "Franchise owners — the brand gave you a playbook. Nobody gave you local demand."
Middle (3–20s): "Aug 27 at noon ET, Mac and I are doing a free live working session. You bring the one thing slowing your location down — leads, reviews, Google — and we build your 30-day plan on the spot."
CTA (20–30s): "It's free, it's one hour, link's in bio. Bring the bottleneck."
**Caption:** One hour. One bottleneck. One 30-day plan. Free live workshop Thu Aug 27, 12 PM ET. Link in bio. #franchise #smallbusiness #philadelphia #marketing
**Bio link:** https://www.momentumvirtualtours.com/growth-workshop/

## E7 · X post (Mon Aug 24)

Free 60-min working session Thu Aug 27, 12 PM ET: bring your business's biggest bottleneck, leave with a 30-day plan. Hosted by the two founders of Momentum 360 (Philly). No pitch. https://www.momentumvirtualtours.com/growth-workshop/

## E8 · Email signature line (everyone at M360, from Mon Aug 17)

`P.S. Free Growth Workshop Thu Aug 27, 12 PM ET — bring your bottleneck, leave with a 30-day plan → momentumvirtualtours.com/growth-workshop`

---

# F. Fill-before-send checklist

- [ ] Meeting link: live Meet https://meet.google.com/ive-hkws-xdg — Sean/Mac confirm or replace with Zoom
- [ ] [MOMENTUM 360 MAILING ADDRESS] in the footer template
- [ ] [BOOKING LINK] (Sean's or Mac's calendar link)
- [ ] [REPLAY LINK] + [TEMPLATE LINK] after the event
- [ ] Sean/Mac approve A1/B1 word-for-word before the first send
