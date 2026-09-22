---
note_type: review
status: active
date: 2026-09-22
updated: 2026-09-22
cadence: daily
job: leads-triage
source: "Slack #360leads (C05R2B1ULF6)"
tags: [review, cadence, leads]
---

# Lead triage, 2026-09-22

Window: 2026-09-21 08:12 EDT to 2026-09-22 08:12 EDT. 32 Zapier lead messages,
plus 4 human messages and 1 channel join (not classified).

## Counts

**real 13 / duplicate 3 / noise 16** — duplicate **9.4%**, noise **50.0%**.

Half the channel is caller-ID with no identity attached. That is worse than the
roughly 30% measured on 2026-09-16 and is now the single largest category.

## The real leads, 13

| name | email | phone | business | source |
| --- | --- | --- | --- | --- |
| Rob Thor | sequent-probate-6y@icloud.com | +1 682-277-5784 | Rob Thor LLC | HubSpot, 09-22 08:06 |
| Jonathan Wornardt | jw@askforhomes.com | +1 775-771-8800 | eXp Realty | HubSpot, 09-22 00:07 |
| ShaunJamel | shaunjamel15@gmail.com | +1 872-224-1272 | BoycottAsianShopBlack.store | Audit call, 09-21 18:38 |
| xavierosorto | xosorto02@gmail.com | +1 214-207-5495 | High Rollerz Barbershop | Audit call, 09-21 18:18 |
| Jason Adams | captainjason1980@yahoo.com | +1 570-709-6948 | Jay & Sons Construction LLC | HubSpot, 09-21 17:24 |
| *(name field reads "yy")* | adhgeorge@gmail.com | +1 312-694-3599 | Pure Massage & Spa | Audit call, 09-21 16:29 |
| Nana and Papaw's Saltroom & More LLC | nanaandpapawssaltroom@gmail.com | +1 931-247-8333 | same | Audit call, 09-21 16:19 |
| Courtney DeCarlo | courtneydecarlo18@gmail.com | +1 856-383-4891 | — | HubSpot, 09-21 15:05 |
| BrianTedaldi | bjt232@gmail.com | +1 631-497-4772 | JTB Luxury Car Service | Audit call, 09-21 12:02 |
| BiodynFlow | office@biodynflow.com | — | BiodynFlow | HubSpot, 09-21 11:11 |
| Lydia Mann | lydia.mann@gmail.com | — | — | HubSpot, 09-21 10:40 |
| DmpPainting LLC | dmppaintingllc2@gmail.com | +1 636-208-0134 | Dmp Painting LLC | Audit call, 09-21 10:07 |
| Priscillas Travels | LynnPBowers1991@icloud.com | +1 717-379-0196 | Priscilla's Travel | **Meta Lead Ads 2026 Suspension Ads**, 09-21 08:34 |

Only the Priscillas Travels row carries campaign attribution and qualifying
answers: profile not currently suspended, suspended more than a month, business
type Other, HubSpot record `249724183399`. That is one attributed lead out of
thirteen.

Three rows have a company name in the person-name field and one reads literally
`yy`. They are real submissions with reachable contact details, so they are
counted real, but the name field is not trustworthy on the audit-call form.

## Duplicate pairs that fired, 3

| person | kept | discarded | gap |
| --- | --- | --- | --- |
| Brian Tedaldi | Audit call 12:02:53 (has company JTB Luxury Car Service) | HubSpot 13:14:31 | 71 min |
| Dmp Painting / "Martin Daniel" | Audit call 10:07:45 (has email + company) | HubSpot 10:03:43 | **HubSpot fired 4 min *before* the audit copy** |
| Priscillas Travels | Meta 08:34:59 (has campaign + qualifying answers) | HubSpot 08:35:38 | 39 sec |

Matched on email for Priscillas Travels and Dmp Painting, on last-10-digits
(`6362080134`) for the "Martin Daniel" HubSpot row, which carried no email at
all, and on email + phone for Brian Tedaldi.

Two things worth keeping visible until the Zap overlap is fixed upstream:

- The gap is **not** always seconds. 39 seconds, 4 minutes, and 71 minutes in
  one day. Any dedupe window tighter than about 90 minutes will miss the Brian
  Tedaldi pair.
- The HubSpot copy sometimes arrives **first** and under a different name
  ("Martin Daniel" for the Dmp Painting submission). Keep-the-later-copy logic
  would have thrown away the richer record.

## Noise, 16

Caller-ID rows with a number and nothing else: `Philadelphia Pa` ×4
(215-400-3998, 215-492-5816, 215-922-1104, 215-281-4924), `Wireless Caller` ×2
(949-800-7835, 830-463-1838), `New York Ny`, `Northbrook Il`, `Reading Pa`,
`Bammel Tx`, `Aitech N/A`, `South Port Plaz`, `Law Offices`, `Allstate Insura`,
and `Smith Marcella` (215-782-7014 — a last-first caller-ID name with no email
and no business; classified noise under the "number that is just caller ID"
rule, flagged here because it is the one borderline call in the set).

One more, listed separately because it is not caller ID: **`Jason fallon`,
8183893996, jason@momentumvirtualtours.com, 09-21 15:00**. That is the team's own
Jason Fallon submitting through the form. An internal test is not a lead; it is
counted in the noise total.

## Routing happened in-channel, by hand

Sean asked at 12:11 who wanted a lead, Scott Ryan joined the channel at 12:11
and Jason handed it to him at 12:21; Sean handed another to Jason at 17:25.
Assignment is a human reading the feed in real time. Nothing in the channel
records whether either call was made.

## What this job did not do

Nothing posted to Slack, no reply in the channel, nothing touched in HubSpot.
Report only.
