---
tags: [campaign, growth-workshop, google, outreach]
campaign: "[[Growth Workshop]]"
created: 2026-08-14
source: "[[12_Brain/06_Research/Franchise Email Sourcing]]"
---

# Google RSVP Rail

One-line summary: Google is the RSVP rail for people who opted in; email the **720 send-ready franchisee rows**, never the UPS Store front-desk inboxes, and never calendar-invite the cold list.

## The breakthrough

Blasting 4,914 UPS Store location inboxes will not fill Thursday. Those boxes are the **shipping counter** — customers asking where a package is. A "grow without you" workshop in that inbox looks like spam, and one complaint round kills the sending domain before Gate #1.

Google will not let a public page silently write onto someone else's calendar. Calendar-inviting the cold list is the same abuse with a nicer UI.

The working split:

| Rail | Who | What Google does |
|---|---|---|
| **Fill** | 200-list + **720 send-ready** franchisee rows (CertaPro, Synergy, Mosquito Squad, PACKOUTS, Comfort Keepers). UPS `store####@` stays a LinkedIn/GBP research pool | Nothing. Plain-text email, one register link. LP already opens Google Calendar on submit. |
| **Show** | Registrants only | EventReservation card in Gmail (C1 HTML) + Calendar API invite (Apps Script, still to connect) + Event JSON-LD on the live LP so Search can understand Thursday |

## Do not do

- Do not add the franchise CSV as Google Calendar attendees.
- Do not attach `METHOD:REQUEST` ICS to Touch 1–3.
- Do not paste `c1-gmail-event.html` into cold email (Gmail markup on unsolicited mail is against [Gmail's registration guidelines](https://developers.google.com/workspace/gmail/markup/registering-with-google)).
- Do not publish Dillon's primary calendar. The canonical event `htmlLink` is on a private personal calendar; cold email uses the LP + Google template URL instead.

## Send pool (quality-first)

| Pool | Approx | Use |
|---|---|---|
| Philly 200-list | ~200 | Touch 1 Tue Aug 18 |
| Send-ready franchisee mailboxes | **720** (123 named-style) | Wave 1 = 50 named. Wave 2 = remaining 670 if Gate #1 is green |
| UPS Store front-desk inboxes | 4,914 | **Do not email.** PA/NJ/DE subset only as LinkedIn/GBP owner lookup, then DMs |
| Franchisor / franchise-dev | later | After wave-1 data |

Wave 1's original 50-cap still holds. It is 50 *owners*, not the first 50 spreadsheet rows if those rows are `store####@theupsstore.com`.

## Gmail card (C1)

Paste-ready HTML: `c1-gmail-event.html`. Rebuild with:

```
node _os/automation/bin/workshop-calendar-invite.js --write-markup
```

Production cards need [DKIM/SPF aligned to the From domain](https://developers.google.com/workspace/gmail/markup/registering-with-google), a self-test (send C1 to the same mailbox), then one registration email to `schema.whitelisting+sample@gmail.com` plus [the form](https://developers.google.com/workspace/gmail/markup/registering-with-google). Until Google approves, Gmail still shows the HTML body and the Google/Outlook/ICS links; the inbox card may only render on self-test.

Tester: [Gmail Email Markup Tester](https://www.google.com/webmasters/markup-tester/).

## LP Event schema

The live page carries schema.org `Event` + `OnlineEventAttendanceMode` + `VirtualLocation` (join/register URL is the LP, not a cold Meet blast from Search). Google's event rich-result rules: [Event structured data](https://developers.google.com/search/docs/appearance/structured-data/event).

## Optional volume (not this rail)

A $100 Google Ads Maximize Clicks test to the Netlify LP can add traffic. Thirteen days and zero conversion history is too thin for tCPA. That spend is a Sean/Dillon decision, not an agent send.