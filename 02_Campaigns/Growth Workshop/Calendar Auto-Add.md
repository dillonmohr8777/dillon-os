---
tags: [campaign, growth-workshop, calendar]
campaign: "[[Growth Workshop]]"
created: 2026-08-14
---

# Calendar Auto-Add — Growth Workshop

One-line summary: registrants get the Aug 27 workshop on Google Calendar by invitation (Gmail) plus a one-click Google/Outlook/ICS save; never invite the cold franchise list.

## What is already live

Canonical event exists on Dillon's Google Calendar (created 2026-08-14 via Calendar API):

| | |
|---|---|
| Event id | `3onjuqp9rcgc5p346bc67h59vs` |
| When | Thu Aug 27, 2026, 12:00–1:00 PM America/New_York |
| Meet | https://meet.google.com/ive-hkws-xdg |
| Guests | none yet (privacy: guests cannot see other guests or invite others) |
| Reminders | email + popup at 24 hours and 1 hour |

Sean/Mac can still replace Meet with Zoom later. Until they do, this Meet URL is the working join link on the event, the LP, the ICS file, and drip C1–C3.

## How a registrant actually gets it on their calendar

Google will not let a public webpage silently write onto someone else's calendar. The working pattern is two layers:

1. **True auto for Gmail (Calendar API invite).** After Netlify Forms receives `workshop-registration`, a webhook adds that email as an attendee on the canonical event with `sendUpdates=all`. Google emails the invitation. Gmail usually places it on the calendar (often tentative until they click Yes). Outlook and Apple receive the same invite email and can accept it.
2. **Same-click save for everyone (no backend).** The LP defaults "Open my calendar" on. Submit opens Google Calendar's event template (or Outlook, or an ICS download) in the same click as register, so popup blockers do not eat it. Public ICS: https://momentum-workshop-pilot.netlify.app/momentum-workshops.ics

Template URLs still need the person to hit Save. The API invite is the path that does not depend on that click.

## Turn on layer 1 (do this once)

**Preferred: Apps Script webhook** (uses the Google account that already owns the event; no OAuth client to mint).

1. script.google.com → new project → paste `calendar-invite-apps-script.js` from this folder.
2. Services → add **Google Calendar API**.
3. Script properties: `WEBHOOK_SECRET` (long random, not in Git) and `WORKSHOP_EVENT_ID` = `3onjuqp9rcgc5p346bc67h59vs`.
4. Deploy → Web app → Execute as Me → Who has access: Anyone.
5. Netlify → Forms → Form notifications → Outgoing webhook on `workshop-registration`:
   `https://script.google.com/macros/s/DEPLOYMENT_ID/exec?secret=WEBHOOK_SECRET`

**Alternate: Netlify Function** in `lp-date-push/netlify/functions/calendar-invite.js`. Needs Netlify env `CALENDAR_INVITE_SECRET`, `GOOGLE_CALENDAR_CLIENT_ID`, `GOOGLE_CALENDAR_CLIENT_SECRET`, `GOOGLE_CALENDAR_REFRESH_TOKEN`. Point the same form notification at `/.netlify/functions/calendar-invite?secret=...`. This is heavier than Apps Script for a two-file static deploy.

**Operator CLI** (one-off registrant, dry-run safe):

```
node _os/automation/bin/workshop-calendar-invite.js --dry-run --email registrant@their-domain.tld
```

`--invite` only sends if `GOOGLE_CALENDAR_ACCESS_TOKEN` is set. Without a token, add that one guest via Google Calendar MCP: `update_event` → `addedAttendees` + `notificationLevel: ALL`. Cap is 25 emails. CSV import requires `--registrants-only` and refuses larger files.

## Hard rules

- **Registrants only.** Do not add the 5,359-contact franchise list as attendees.
- **No agent sends.** The Calendar API invitation email is the one Google sends when a guest is added. Cold outreach still waits for Sean/Mac.
- **Secrets stay out of Git.** Webhook secret, OAuth client, refresh token → Netlify env / Apps Script properties / `12_Brain/private/`.
- Organizer is currently Dillon's Google account (the connected Calendar). Transfer or add Sean as a guest when his mailbox is confirmed.

## Add-to-calendar URLs (paste-ready)

- Google: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Build+a+Business+That+Grows+Without+You&dates=20260827T160000Z%2F20260827T170000Z&details=Live+Momentum+360+workshop+hosted+by+Sean+and+Mac.+Bring+one+active+offer+and+one+growth+constraint.+Join+the+live+workshop%3A+https%3A%2F%2Fmeet.google.com%2Five-hkws-xdg&location=https%3A%2F%2Fmeet.google.com%2Five-hkws-xdg&ctz=America%2FNew_York`
- Outlook: `https://outlook.live.com/calendar/0/deeplink/compose?rru=addevent&subject=Build+a+Business+That+Grows+Without+You&startdt=2026-08-27T16%3A00%3A00.000Z&enddt=2026-08-27T17%3A00%3A00.000Z&body=Live+Momentum+360+workshop+hosted+by+Sean+and+Mac.+Bring+one+active+offer+and+one+growth+constraint.+Join+the+live+workshop%3A+https%3A%2F%2Fmeet.google.com%2Five-hkws-xdg&location=https%3A%2F%2Fmeet.google.com%2Five-hkws-xdg`
- ICS: https://momentum-workshop-pilot.netlify.app/momentum-workshops.ics
- Meet: https://meet.google.com/ive-hkws-xdg

Regenerate with `node _os/automation/bin/workshop-calendar-invite.js --print-urls` and `--write-ics`.
