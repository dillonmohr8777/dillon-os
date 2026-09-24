---
note_type: review
status: active
date: 2026-09-24
updated: 2026-09-24
cadence: daily
job: leads-triage
source: "Slack #360leads (C05R2B1ULF6)"
tags: [review, cadence, leads]
---

# Lead triage, 2026-09-24

Window: 2026-09-23 08:09 EDT to 2026-09-24 08:11 EDT (oldest=1790165348,
latest=1790251906, one page, Slack reported no more messages). Returned
timestamps run from 09-23 09:25 to 09-24 08:00, all inside the window.
25 Zapier lead messages, plus 3 human messages (not classified).

## Counts

**real 12 / duplicate 5 / noise 8**: duplicate **20.0%**, noise **32.0%**.

Noise fell by half, from 63.6% yesterday to 32.0%. Duplicates rose from 12.1%
to 20.0%: every Meta and audit-call lead in the window was followed by a HubSpot
copy, and one caller fired HubSpot twice.

## The real leads, 12

| name | email | phone | business | source |
| --- | --- | --- | --- | --- |
| *(name field is the email)* aftab541raza001 | aftab541raza001@gmail.com | 03280412682 | none given | HubSpot, 09-24 08:00 |
| *(name field is the email)* mansour-john | mansour-john@bookhypergen.com | 619-822-1960 | Book Hypergen (from email domain) | HubSpot, 09-24 06:14 |
| Towanda C. Lewis | towanda.lewis4445@gmail.com | +1 484-632-4499 | "Philadelphia, Pennsylvania" (form answer) | **Meta Lead Ads 2026 Suspension Ads**, 09-24 01:00 |
| Mariam Zinn | mariamzinn@graysonlife.com | +1 425-330-9491 | The Grayson Bed & Breakfast + Extended Stays | HubSpot, 09-23 23:17 |
| Doreen Drake Hand | oakstgal44@aol.com | +1 814-207-9016 | "Retired" (form answer) | **Meta Lead Ads 2026 Suspension Ads**, 09-23 21:33 |
| Darius Myers | darius@feroscitus.com | +1 646-704-2196 | Fero Scitus | HubSpot, 09-23 18:15 |
| Deisy / Micaela Mza | delilahsicecreamjb@gmail.com | +1 501-442-2642 | Delilah's Ice Cream | Audit call, GMBS PMax Leads - Suspensions 1, 09-23 17:29 |
| Christopher Ramirez | chrisrdrums@aol.com | +1 818-371-3436 | Freedom Drum Circles | HubSpot, 09-23 17:20 |
| Rodolfo Mercado | rod@sl-outsourcing.com | none | SL Outsourcing (from email domain) | HubSpot, 09-23 14:46 |
| Herman Bowdry | none | +1 303-653-4839 | none given | HubSpot, 09-23 12:10 |
| Yaki Avosta | avostayaki@gmail.com | +1 816-281-4575 | "Linpiesa sindi" | Audit call, GMBS PMax Leads - Suspensions 1, 09-23 09:56 |
| Millie Pagan | milliepagan97@yahoo.com | +1 727-999-0118 | Pinellas County Schools (form answer) | **Meta Lead Ads 2026 Suspension Ads**, 09-23 09:25 |

Notes on the list:

- **Two audit-call leads** (Delilah's Ice Cream, Yaki Avosta), both on
  "GMBS PMax Leads - Suspensions 1". These are the strongest rows: named
  business, email, phone, campaign.
- **The three Meta suspension leads are weak on their own answers.** Towanda
  Lewis and Doreen Drake Hand both answered "No" to "is your Google Business
  Profile currently suspended", and gave a city and "Retired" as their business.
  Millie Pagan answered "Yes" but gave a public school district as her business.
  None of the three describes a suspended small business, which is what the ad
  is selling to.
- **Four rows look like vendors, not buyers**: mansour-john@bookhypergen.com and
  Rodolfo Mercado at sl-outsourcing.com read like outbound pitches;
  aftab541raza001 gives a Pakistan-format mobile (`0328...`) with no business,
  the same shape as yesterday's hassanayaz row. Counted real under the rule
  (name or email plus a second contact) but worth a glance before anyone calls.
- **Herman Bowdry** has no email. He first appeared as caller ID at 12:05
  (`303-653-4839`), then again at 12:10 as `+13036534839`, the form or manual
  entry format. The second record is counted real on that basis; if the 12:10
  row was just HubSpot reformatting the same call, he belongs in the borderline
  list below instead.
- Mariam Zinn (Grayson B&B), Darius Myers (Fero Scitus) and Christopher Ramirez
  (Freedom Drum Circles) are clean inbound rows with a named business, email and
  phone and no qualifying answers attached.

## Duplicate pairs that fired, 5

| person | kept | discarded | gap | matched on |
| --- | --- | --- | --- | --- |
| Towanda C. Lewis | Meta 01:00:47 (answers + phone) | HubSpot 01:01:52 (no phone) | 65 sec | email |
| Doreen Drake Hand | Meta 21:33:05 (answers + phone) | HubSpot 21:33:32 (no phone) | 27 sec | email |
| Millie Pagan | Meta 09:25:37 (answers + phone) | HubSpot 09:26:23 (no phone) | 46 sec | email |
| Yaki Avosta | Audit call 09:56:07 (company + campaign) | HubSpot 10:08:32 | 12 min | email + phone |
| Herman Bowdry | HubSpot 12:10:30 (`+1` format) | HubSpot 12:05:26 (caller ID) | 5 min | phone, last 10 digits |

The Meta to HubSpot overlap is now fully regular: three of three Meta leads,
each copied within about a minute, and each HubSpot copy drops the phone number.
The fifth pair is new: HubSpot fired twice for one caller, which is not the
Meta/audit Zap overlap but a second source of duplication.

Watch item for tomorrow: the **Delilah's Ice Cream** audit lead (17:29) has not
yet produced a HubSpot copy. The last two days showed HubSpot copies of audit
leads arriving up to ~19 hours later, so expect it in tomorrow's window.

No person in this window repeats any of yesterday's 8 real leads.

## Noise, 8

Place names: `Nederland Tx` (409-527-2382), `Philadelphia Pa` (267-297-3545),
`Los Angeles Ca` (213-786-3376).
Generic caller ID: `Wireless Caller` (559-514-1866), `Law Offices`
(405-883-8103), `Google N/A` (650-204-1111).

Borderline, classified noise under the caller-ID-only rule but listed so a
human can decide whether to call back:

- `George Beown`, 214-764-3651, 09-23 10:38 (a person's name via caller ID)
- `Nrfj Llc,Needha`, 252-670-3290, 09-23 17:32 (a truncated business name via
  caller ID)

## Routing happened in-channel, by hand

Sean at 09:30: "Jason you and Scott can take all of the leads" (then "Today*").
Jason replied "on it" at 09:37. That is the only routing in the window: one
blanket assignment, no per-lead owner, and nothing in the channel records
whether any call was made.

## What this job did not do

Nothing posted to Slack, no reply in the channel, nothing touched in HubSpot.
Report only.
