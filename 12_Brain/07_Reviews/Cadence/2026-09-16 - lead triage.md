---
note_type: review
status: active
date: 2026-09-16
updated: 2026-09-16
tags:
  - cadence
  - lead-gen
  - momentum
source_refs:
  - Slack #360leads (C05R2B1ULF6), 40 messages read 2026-09-16 18:20 EDT, covering 2026-09-15 11:25 to 2026-09-16 17:12
  - 12_Brain/06_Research/2026-09-16 - Momentum team bottlenecks and Workmate health.md
---

# Lead triage, 2026-09-16

First run of the `leads-triage` cadence job, executed by hand to validate the
classifier before it runs unattended.

**38 lead messages: 14 real, 3 duplicate, 21 noise.** 37 percent real,
8 percent duplicate, 55 percent noise. Jason is reading roughly two junk
alerts for every real one.

## The real leads

| Name | Email | Phone | Business | Source |
|---|---|---|---|---|
| Sean O'Donnell | sodonnell@flannerys.com | +12163748546 | | HubSpot |
| Dylan Martin | dylan@alphateamconstructionatx.com | +15123501088 | alpha Team Roofing and Construction | HubSpot |
| Amalia Severino | snark-prelate.4w@icloud.com | +13028988827 | 2179 | Meta Lead Ads 2026 Suspension Ads |
| Mike Piple | mike@nationwideabstrax.com | | | HubSpot |
| Mohamed Saccoh | medsaccohtransport@gmail.com | +12408901108 | Investor med towing company | Meta Lead Ads 2026 Suspension Ads |
| Terry Lindner | terry.lindner@usfati.org | | | HubSpot |
| Steve Estes | steve@brewedfw.com | +19728977169 | | HubSpot |
| B Barber | bbarber@referral-station.com | +17274342236 | | HubSpot |
| Gregory Scampone | gregoryscampone@gmail.com | +14125964397 | Foxs Pizza Den | GMBS PMax Leads, Suspensions 1 |
| Cassie Kennell | cassiekennell@gmail.com | +14783965937 | Dog Life Salon and Resort | GMBS PMax Leads, Suspensions 1 |
| Ben Benkiran | ben@hilowroofing.com | +14072876171 | | HubSpot |
| Kevin Choi | kevin@belleviesalons.com | | | HubSpot |
| Lydia Mann | lmann@mannlawny.com | +19174121421 | | HubSpot |
| Tanya Ware | tanya@propertyclaimsconsultant.com | | | HubSpot |

## The duplicate pairs

Every one is the same shape: a rich lead lands, then a thin "New Hubspot Lead /
Contact" fires seconds later for the same person, because the first Zap created
the HubSpot contact that triggers the second Zap. The rich copy is the keeper.

| Person | Rich copy | Thin duplicate | Gap |
|---|---|---|---|
| Amalia Severino | Meta Lead, 13:01:46 | HubSpot Contact, 13:02:09 | 23s |
| Mohamed Saccoh | Meta Lead, 09-15 17:42:29 | HubSpot Contact, 17:43:17 | 48s |
| Cassie Kennell | Audit Call Lead, 09-15 12:49:40 | HubSpot Contact, 13:13:55 | 24m |

This is fixable upstream and should be: Zap 379667050 and the HubSpot contact
Zap both fire on the same person. Triage only hides it.

## The noise

21 of 38. Two kinds, both from caller ID with no email attached:

- **Place names**, where the caller ID returned a city: Philadelphia Pa (x2),
  Philadelphia G, Salinas Ca, Herkimer Ny, Mc Kenzie Tn, Indianapls In,
  Caldwell Tx, Eutaw Al, Creston Oh
- **Generic carrier strings**: Wireless Caller, Toll Free Call, Na N/A (x2)
- **Surname first caller ID with no email**: Price Andrea, Terpstra Kelly,
  Craft Danielle, S Felixmoquete, Thomas Jacob, Jason Olivo, Renita Marshall

The last group is the only judgment call in the classifier. They read like
caller ID name lookups rather than submitted leads, and none carry an email,
but a few could be real inbound callers. Flagged rather than silently dropped.

## What this does not do

No Slack post, no reply in channel, no HubSpot write. Reporting only. The
upstream Zap overlap and the caller ID noise are both decisions for Jason and
Sean.
