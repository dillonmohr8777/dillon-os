---
note_type: ads-launch-packet
client: Kimberly James Bridal
status: create-ready
created: 2026-08-15
internal_only: true
do_not_send: true
tags: [google-ads, search, kjb, launch]
source: "https://www.kimberlyjamesbridal.com/bridal-appointment-request (fetched 2026-08-15)"
---

# KJB Google Search CREATE packet — 2026-08-15

Internal CREATE spec for a small, appointment-intent Search campaign to the existing tracked appointment URL. Meta stays primary. Do not email this. Do not apply live without Dillon.

## Decision trail (do not reopen)

- **2026-07-14:** Kim asked to cancel Google and focus on Meta. Dillon agreed "for now."
- **2026-08-15:** Dillon explicitly overrode that pause and ordered a **new** Google campaign launch using the existing tracked appointment URL.
- Role split stays the same: **Meta is the lead engine. Google is support.** This packet is the support slice, not a new lead-engine spend.
- This file is **internal only**. If a client email is ever drafted later (do not draft one now), it must follow the KJB CC rule in the client contact note. Do not copy addresses into this packet.

## Campaign

| Field | Value |
|---|---|
| **Campaign name** | `KJB \| Search \| Private Appointment \| PHL-CH \| 2026-08` |
| **Type** | Search only. Not Performance Max. Not Demand Gen. |
| **Networks** | Google Search on. Display Network off. Search Partners off. |
| **Language** | English |
| **Final URL (all ads)** | `https://www.kimberlyjamesbridal.com/bridal-appointment-request` |
| **Bid** | **Maximize Clicks** (launch). **Manual CPC** is the only allowed alternative. No Smart Bidding. No Target CPA. No Target ROAS. No Maximize Conversions. If a max-CPC cap is added, take it from live in-account Search CPC — do not invent a cap here. |
| **Budget rule** | Modest support slice of the **existing** Google daily budget. Meta stays primary. Do not invent a large daily budget. Do not add net-new lead-engine spend. Do not publish a dollar amount in this packet. |
| **Geo** | Philadelphia + Chestnut Hill + nearby suburbs. **Presence only** (People in or regularly in). Not Presence or Interest. |
| **Status after create** | Enabled once UI login works. New campaign is Tier 2. Meta stays primary; this is the support slice Dillon ordered on 2026-08-15. |

### Geo targets (Presence only)

Add these location targets. Do not expand to all of Pennsylvania, South Jersey, or the United States on this launch.

- Philadelphia, PA (city)
- Chestnut Hill, PA (boutique locality)
- Nearby suburbs / collar: Wyndmoor, PA; Flourtown, PA; Erdenheim, PA; Glenside, PA; Springfield Township (Montgomery County), PA
- Nearby Philadelphia neighborhoods already inside the city target: Mount Airy, Germantown (do not add as a statewide expansion)

If the UI is cleaner as a radius around Chestnut Hill, Philadelphia, use the **smallest** radius that covers the list above. Do not invent a mile figure in this packet. Location options: **Presence only**.

## Final URL and page facts (fetched 2026-08-15)

Live URL: `https://www.kimberlyjamesbridal.com/bridal-appointment-request`

Confirmed on-page (use these; do not invent extras):

- Private bridal appointment request. Boutique: Chestnut Hill, Philadelphia.
- CTAs: "Request a private appointment" / "Continue to scheduler."
- Types: Initial Bridal (private 90-minute styling), VIP Bridal (two-hour elevated experience with senior styling, snacks, and a toast), Retry, Accessories.
- Stylist language: private, relaxed appointment; stylist who listens first; private styling with an expert consultant; up to 4 guests for standard bridal appointments.
- Form captures an **appointment request**. The page states the boutique confirms it. A submit is not a confirmed booking.
- One on-page testimonial line: "I finally felt heard and unrushed." Do not name the reviewer. Do not invent more reviews.

This URL already received a real Google click with `gclid` in July 2026. That is tracking proof, not a performance metric. Do not invent click, spend, or conversion counts for this launch.

## Ad groups

Four ad groups. Phrase and exact keywords only. Every ad uses the appointment URL above. No homepage. No PMax asset groups. No plus-size landing-page dump (plus-size queries still land on the appointment request).

### AG1 — Bridal Appointment

Intent: book / request a bridal appointment.

| Match | Keyword |
|---|---|
| Phrase | `"bridal appointment"` |
| Exact | `[bridal appointment]` |
| Phrase | `"private bridal appointment"` |
| Exact | `[private bridal appointment]` |
| Phrase | `"bridal appointment philadelphia"` |
| Exact | `[bridal appointment philadelphia]` |
| Phrase | `"bridal appointment chestnut hill"` |
| Exact | `[bridal appointment chestnut hill]` |
| Phrase | `"book bridal appointment"` |
| Exact | `[book bridal appointment]` |

### AG2 — Wedding Dress Appointment

Intent: wedding-dress appointment, not generic dress shopping.

| Match | Keyword |
|---|---|
| Phrase | `"wedding dress appointment"` |
| Exact | `[wedding dress appointment]` |
| Phrase | `"wedding dress appointment philadelphia"` |
| Exact | `[wedding dress appointment philadelphia]` |
| Phrase | `"book wedding dress appointment"` |
| Exact | `[book wedding dress appointment]` |
| Phrase | `"wedding gown appointment"` |
| Exact | `[wedding gown appointment]` |

### AG3 — Bridal Boutique Chestnut Hill

Intent: the Chestnut Hill boutique, then the appointment.

| Match | Keyword |
|---|---|
| Phrase | `"bridal boutique chestnut hill"` |
| Exact | `[bridal boutique chestnut hill]` |
| Phrase | `"chestnut hill bridal boutique"` |
| Exact | `[chestnut hill bridal boutique]` |
| Phrase | `"bridal shop chestnut hill"` |
| Exact | `[bridal shop chestnut hill]` |
| Phrase | `"wedding dress shop chestnut hill"` |
| Exact | `[wedding dress shop chestnut hill]` |

### AG4 — Plus-Size Wedding Dresses Philadelphia

Intent: plus-size wedding dresses in Philadelphia, sent to the **appointment** URL only. Supported by prior KJB plus-size SEO work and this launch brief. Do not claim inventory, size range, or designers that the appointment page does not state.

| Match | Keyword |
|---|---|
| Phrase | `"plus-size wedding dresses philadelphia"` |
| Exact | `[plus-size wedding dresses philadelphia]` |
| Phrase | `"plus size wedding dresses philadelphia"` |
| Exact | `[plus size wedding dresses philadelphia]` |
| Phrase | `"plus size wedding dress appointment"` |
| Exact | `[plus size wedding dress appointment]` |
| Phrase | `"plus size bridal philadelphia"` |
| Exact | `[plus size bridal philadelphia]` |

## Negatives (campaign-level)

Phrase negatives unless noted. **Do not invent competitor brand negatives** — no competitor list is confirmed in-vault for this launch; skip brands.

**Jobs**

- `"job"` / `"jobs"` / `"hiring"` / `"career"` / `"careers"` / `"salary"` / `"resume"`

**Wholesale**

- `"wholesale"` / `"wholesaler"` / `"distributor"` / `"bulk order"`

**Cheap / costume**

- `"cheap"` / `"cheapest"` / `"costume"` / `"costumes"` / `"halloween"` / `"cosplay"`

**DIY**

- `"diy"` / `"do it yourself"` / `"sewing pattern"` / `"how to sew"` / `"make your own"`

Do not add broad-match positives to "make up for" these negatives.

## RSA copy

One RSA per ad group. Same body for AG1–AG3. AG4 may add the plus-size headlines marked optional; do not replace the private-appointment / Chestnut Hill / stylist pins with inventory claims.

Display path: `Appointment` / `ChestnutHill`

All headlines ≤30 characters. All descriptions ≤90. No discount language. Brand voice: elegant, warm, boutique — never pushy ([[01_Clients/Kimberly James Bridal/brand-guidelines]]).

### Headlines (15)

| # | Headline | Chars | Source |
|---|---|---|---|
| 1 | Private Bridal Appointment | 26 | Live CTA / page purpose |
| 2 | Request a Private Visit | 23 | Live CTA |
| 3 | Continue to Scheduler | 21 | Live CTA |
| 4 | Chestnut Hill Bridal | 20 | Live boutique locality |
| 5 | Chestnut Hill, Philadelphia | 27 | Live boutique locality |
| 6 | Stylist-Led Appointment | 23 | Live stylist framing |
| 7 | Book With a Bridal Stylist | 26 | Live stylist framing |
| 8 | Wedding Dress Appointment | 25 | Keyword + page purpose |
| 9 | A Dress That Feels Like You | 27 | Live H1, shortened to 30 |
| 10 | Kimberly James Bridal | 21 | Brand |
| 11 | Relaxed Private Styling | 23 | Live "private, relaxed" |
| 12 | Private 90-Minute Styling | 25 | Live Initial Bridal fact |
| 13 | Up to 4 Guests Welcome | 22 | Live page fact |
| 14 | Expert Bridal Stylist | 21 | Live "expert consultant" |
| 15 | Boutique in Chestnut Hill | 25 | Live boutique locality |

Optional AG4-only swaps (still ≤30; do not invent size-range claims):

- `Plus-Size Bridal in Philly` (26)
- `Plus Size Wedding Dresses` (25)

Do not pin more than headline 1 (`Private Bridal Appointment`) in position 1. Leave the rest unpinned.

### Descriptions (4)

| # | Description | Chars | Source |
|---|---|---|---|
| 1 | Request a private appointment with a stylist at our Chestnut Hill, Philadelphia boutique. | 89 | Live CTA + locality |
| 2 | Private, relaxed styling. The boutique confirms every request — not a walk-in hold. | 83 | Live confirmation rule |
| 3 | Initial, VIP, Retry, or Accessories. A Kimberly James stylist who listens first. | 80 | Live appointment types |
| 4 | I finally felt heard and unrushed. Private styling in Chestnut Hill, Philadelphia. | 82 | Live testimonial line; reviewer name omitted |

## Tracking note

- Turn **auto-tagging on** at the account (if it is not already).
- Final URL is the existing tracked appointment page. It already accepts `gad_source`, `gclid`, and `gbraid`.
- **Do not invent a new UTM scheme.** Do not append handmade `utm_*` parameters to this URL.
- July 2026: this same URL already received a real Google click with `gclid`. Use that as proof the page accepts Google click IDs — not as a KPI.
- The form is an appointment **request**. The boutique confirms. Do not bid as if a submit equals a confirmed booking. Do not invent conversion counts, CPA, or "booked appointment" volume.
- Do not put Google Ads customer IDs, conversion IDs, emails, or phones in ads, URLs, or this packet.

## Meta stays primary

Meta remains the lead engine. This Search campaign is a **modest support slice of the existing Google daily budget**. It exists to catch appointment-intent queries (bridal appointment, wedding dress appointment, Chestnut Hill boutique, plus-size wedding dresses Philadelphia) and send them to the tracked appointment URL.

Do not treat early Google clicks as a reason to grow Google into a second lead engine. Do not pause or starve Meta to fund this. Kim's 2026-07-14 Meta-first preference still describes the mix; the 2026-08-15 override is "launch a small Google support campaign," not "make Google primary again."

## Do-not-do list

- Do not build Performance Max, Demand Gen, or a Display expansion.
- Do not send this campaign to the homepage or to unpublished / unconfirmed landing pages.
- Do not use broad match. Phrase and exact only.
- Do not use Smart Bidding, Target CPA, Target ROAS, or Maximize Conversions.
- Do not invent a large daily budget or a dollar cap in this packet.
- Do not use Presence or Interest geo. Presence only. Do not go statewide or national.
- Do not invent competitor brand negatives.
- Do not invent reviews, ratings, designer lists, or size-range claims beyond the live appointment page.
- Do not name brides or reviewers.
- Do not invent a UTM scheme. Auto-tagging only.
- Do not treat a form submit as a confirmed booking.
- Do not invent metrics (clicks, spend, CPA, conversion volume) for this launch.
- Do not put emails, phones, or Google Ads customer IDs in any create field or in this file.
- Do not email Kim, the CC list, or anyone else from this packet. Internal only.
- Do not draft the client email now. A future draft would need the KJB CC rule.
- Do not leave this as a homepage or PMax dump. Enable the Search support slice once UI login works.
- Do not copy prior PMax structure or dump leftover Search keywords into this campaign.

## Apply checklist (operator)

1. Create the Search campaign with the name, networks, geo, bid, and budget rule above. Enable once UI login works.
2. Confirm auto-tagging is on. Paste the final URL with no extra query params.
3. Build the four ad groups and the phrase/exact keywords. Add the campaign negatives.
4. Load the RSA. Confirm character limits and that no review name appears.
5. Meta stays primary. This Search campaign is the support slice only.
