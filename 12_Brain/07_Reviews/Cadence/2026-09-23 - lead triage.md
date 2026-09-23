---
note_type: review
status: active
date: 2026-09-23
updated: 2026-09-23
cadence: daily
job: leads-triage
source: "Slack #360leads (C05R2B1ULF6)"
tags: [review, cadence, leads]
---

# Lead triage, 2026-09-23

Window: 2026-09-22 08:09 EDT to 2026-09-23 08:09 EDT (oldest=1790078948,
latest=1790165348, one page, Slack reported no more messages). Returned
timestamps run from 09-22 10:27 to 09-23 01:24, all inside the window.
33 Zapier lead messages, plus 9 human messages (not classified).

## Counts

**real 8 / duplicate 4 / noise 21**: duplicate **12.1%**, noise **63.6%**.

Noise rose again, from 50.0% yesterday to 63.6%. Almost two thirds of the feed
is caller ID with no identity attached.

## The real leads, 8

| name | email | phone | business | source |
| --- | --- | --- | --- | --- |
| *(name field is the email)* hassanayaz | hassanayazhassanayaz97@gmail.com | 03116351145 | none given | HubSpot, 09-23 01:24 |
| Steve Halterman | stevehalterman@gmail.com | +1 515-491-5955 | Pontiac Club | HubSpot, 09-22 23:21 |
| Jason Olivo | jaytime25@gmail.com | none | none given | HubSpot, 09-22 17:28 |
| *(name field is the email)* Glen Franchi | glen.franchi@massinteract.com | 773-796-7171 | Mass Interact (from email domain) | HubSpot, 09-22 16:47 |
| Jose Immanuel Marrero Ureña | Josemarrero1996@icloud.com | +1 856-409-4445 | Retail (form answer) | **Meta Lead Ads 2026 Suspension Ads**, 09-22 15:47 |
| Carlos Hernandez | foreverhardwoodinc@gmail.com | +1 305-889-4892 | Forever Hardwood Inc. | Audit call, GMBS PMax Leads - Suspensions 1, 09-22 13:34 |
| *(name field is the email)* calebsinn | calebsinn@socialbloomgrowth.site | 727-434-2236 | Social Bloom Growth (from email domain) | HubSpot, 09-22 12:23 |
| Uptown Cheapskate (contact: Joslin) | joslin@wrightresaleuc.com | none | Uptown Cheapskate / Wright Resale | HubSpot, 09-22 12:03 |

Notes on the list:

- **Jose Marrero Ureña** is the one row with campaign attribution and
  qualifying answers: profile currently suspended, suspended less than a
  week, business type Retail, HubSpot record `250091495035`.
- **Carlos Hernandez** is the one audit-call lead, attributed to
  "GMBS PMax Leads - Suspensions 1". Sean routed it to Scott Ryan at 13:36.
- **Glen Franchi** arrived with the email in the name field, but Sean flagged
  it in-channel at 17:05 as a "hot 360 website lead" and handed it to Jason.
- Three rows have an email in the name field. They carry a second contact
  (a phone), so they are not the "bare email, nothing else" noise case and are
  counted real. Two of them look weak and are worth a glance before anyone
  calls: **hassanayaz** gives a Pakistan-format mobile (`0311...`) with no
  business, and **calebsinn@socialbloomgrowth.site** reads like a growth
  agency pitching us rather than a buyer.

## Duplicate pairs that fired, 4

| person | kept | discarded | gap | matched on |
| --- | --- | --- | --- | --- |
| Jose Marrero Ureña | Meta 15:47:11 (campaign + answers) | HubSpot 15:47:39 (no phone) | 28 sec | email |
| Carlos Hernandez | Audit call 13:34:35 (has company) | HubSpot 13:49:37 | 15 min | email + phone |
| Nana and Papaw's Saltroom & More LLC | Audit call **09-21 16:19** (counted real yesterday) | HubSpot 09-22 11:24:19 | ~19 h | email + phone |
| "YY" / Pure Massage & Spa | Audit call **09-21 16:29** (counted real yesterday) | HubSpot 09-22 11:22:16 | ~19 h | email + phone (3126943599) |

Two of the four duplicates are cross-day: the HubSpot copy of yesterday's
audit-call leads fired roughly 19 hours later. That is a longer lag than the
71 minutes recorded yesterday, so any dedupe that only looks within one day's
feed will count Nana and Papaw's and "YY" twice.

## Noise, 21

Place names: `Valrico Fl`, `Saint Johns Fl`, `New York Ny`, `Jenkintown Pa`,
`Pittsburgh Pa`, `Atlanta GA`, `Los Angeles Ca`, `Geraldton On`, `Ambler Pa` ×2
(215-461-4305, fired twice one second apart at 13:22:11 and 13:22:12),
`New Hope Pa`, `Philadelphia Pa` (215-492-3689).
Generic caller ID: `Wireless Caller` ×2 (619-502-2144, 440-669-4313),
`Private N/A`, `Bhsg N/A`, `Wlp N/A`, `Law Offices` (609-796-4016).

Borderline, classified noise under the caller-ID-only rule but listed so a
human can decide whether to call back:

- `Sol Velez`, 727-510-6605, 09-22 15:07
- `Karen Kolthoff`, 815-821-4126, 09-22 10:46
- `Bellaro,Elizabe N/A`, 702-884-2247, 09-22 15:24

All three are in the call-tracking format (dashed `tel:` number, no email, no
business), the same shape as the place-name rows. Form submissions arrive as
`+1XXXXXXXXXX` with an email. These look like real people who phoned, but the
only identity is the carrier's caller-ID name.

## Routing happened in-channel, by hand

Sean asked Jason at 11:26 whether a lead was his; Jason said Scott was being
set up with leads for calls (11:27). Sean gave the Carlos Hernandez audit lead
to Scott Ryan at 13:36. Jason tagged Scott at 15:53 to "take and mark" the lead
above (most likely the Jose Marrero Meta lead, the last lead posted before it). Sean gave Jason the Glen Franchi website
lead at 17:05. Nothing in the channel records whether any call was made.

## What this job did not do

Nothing posted to Slack, no reply in the channel, nothing touched in HubSpot.
Report only.
