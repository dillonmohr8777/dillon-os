---
note_type: ads-launch-packet
status: ready-to-create
created: 2026-08-15
updated: 2026-08-15
client: Onsite Concrete & Landscape
campaign_type: Search
final_url: https://onsite-gads-landing-page.netlify.app/
source: live LP fetch 2026-08-15; operator constraints (no invented metrics)
tags: [ads, google-search, onsite, vacaville, create-packet]
---

# Onsite Concrete & Landscape — Google Ads Search CREATE packet

One-line: new Search-only campaign to the existing Vacaville Netlify LP; Maximize Clicks or Manual CPC; fund from the current Google budget, not new spend.

This is a **CREATE packet**, not a performance report. No account IDs, no contact details, no invented KPIs. Do not email anyone. Enable in the UI only after login works.

## Campaign

| Field | Set this |
|---|---|
| **Campaign name** | `Onsite \| Search \| Vacaville \| Concrete-Landscape \| 2026-08` |
| **Type** | Search (Search Network only). Do not create Performance Max. Do not attach this build to an existing PMax campaign. |
| **Status** | **Enabled** once UI login works. Until then, leave the packet unused — do not stage a paused campaign as a substitute plan. |
| **Goal** | Leads / website traffic is fine as the UI campaign objective. **Do not** attach a conversion-based bid strategy. Pending on-page events are not conversions. |
| **Networks** | Google Search only. Display Network off. Search partners off (thin tracking; keep query control tight). |
| **Language** | English |
| **Start** | Day of UI create. No invented end date. |

## Geo

- **Primary pin:** Vacaville, CA.
- **Nearby-community pins** (Presence targeting only; the LP says “Vacaville and nearby communities” and does not name them). These are geographic neighbors, not a claimed exclusive service roster. Drop any pin that is outside the real service area before enable:
  - Fairfield, CA
  - Dixon, CA
  - Winters, CA
  - Suisun City, CA
  - Elmira, CA
  - Allendale, CA
- **Location options:** **Presence** — People in or regularly in your targeted locations.
- **Do not** use Presence or Interest.
- **Do not** invent a radius, DMA, or county-wide blast. No Sacramento / Bay Area interest overlay.

## Bid

- **Allowed:** Maximize Clicks **or** Manual CPC.
- **Preferred for this launch:** Maximize Clicks, with a **max CPC cap** set in the UI so a click-max strategy cannot run away. Do not invent the cap dollar amount here — set it from live auction/page-one estimates in-account at create time, then leave it.
- **Manual CPC fallback:** if Maximize Clicks is unavailable or the UI forces a conversion goal, use Manual CPC instead.
- **Forbidden:** Target CPA, Maximize Conversions, Maximize Conversion Value, Target ROAS, or any other Smart Bidding that needs conversion volume. Tracking is thin; pending events are not conversions.

## Budget rule

- **Do not invent a new monthly spend. Do not add net-new dollars on top of current PMax.**
- Fund this Search campaign by **slicing the existing Google daily budget** already running on PMax. Reduce or pause equivalent PMax dollars first, then assign that slice here.
- **Ceiling only (not a new appropriation):** late-July weekly reads sat at **$23–$60/week**. Treat that band as the maximum weekly envelope this Search slice may occupy if reallocated — about **$3.30–$8.60/day** as a hard ceiling copied from those reads, not as a recommended increase and not as a claimed current PMax daily.
- If live PMax is already at or under that envelope, take a **smaller** slice or do not launch until equivalent PMax dollars are freed.
- No monthly total is specified in this packet. Do not back-solve one.

## Final URL and tracking

- **Final URL (all ads, all ad groups):** `https://onsite-gads-landing-page.netlify.app/`
- Confirmed live 2026-08-15. Vacaville concrete + landscape LP. Form CTA: **Request consultation**. Form name on-page: `onsite-consultation`.
- **Auto-tagging:** ON (account setting). Do not invent a new UTM scheme. Do not add `utm_source` / `utm_medium` / `utm_campaign` suffixes.
- The live form already has hidden fields and JS that copy query params into: `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `gclid`, `gbraid`, `wbraid`. That is the implied ValueTrack surface. Leave it alone.
- **Final-URL suffix / tracking template:** none. Auto-tagging supplies `gclid`; Google may append `gbraid` / `wbraid`. If the UI requires a template, use `{lpurl}` only — no extra query keys.
- **Do not** point ads at `onsiteconcretelandscape.com` from this campaign.
- **Do not** invent conversion IDs, labels, values, or enhanced-conversion settings in this packet.

## Ad group split

Two ad groups. Same final URL. Same RSA promise. Keywords carry the service split.

| Ad group | Name | Intent |
|---|---|---|
| 1 | `AG \| Concrete \| Vacaville` | Driveways, stamped/decorative concrete, patios/walkways, foundations/flatwork |
| 2 | `AG \| Landscape \| Vacaville` | Drought-tolerant landscaping, irrigation/drainage, outdoor lighting/turf, retaining walls/pavers |

No third “both” ad group. Combined-scope queries can sit in either group via the LP form options (Concrete / Landscape / Concrete + landscape / Drainage or irrigation / Not sure yet). Do not add a DSA ad group.

Display path (15-char max, both ads):

- Path 1: `Vacaville`
- Path 2 (Concrete AG): `Concrete`
- Path 2 (Landscape AG): `Landscape`

Optional sitelinks (same host, live anchors only — no new URLs):

| Sitelink | URL |
|---|---|
| Request consultation | `https://onsite-gads-landing-page.netlify.app/#consultation` |
| Concrete & landscape | `https://onsite-gads-landing-page.netlify.app/#services` |
| Project work | `https://onsite-gads-landing-page.netlify.app/#work` |
| How it starts | `https://onsite-gads-landing-page.netlify.app/#sequence` |

No call assets and no location assets in this packet.

## Keyword list (phrase + exact only)

No broad match. No broad-match-modifier leftovers. Add both match types for each term. Geo-qualified terms first; service-only terms rely on Presence geo.

### AG | Concrete | Vacaville

| Phrase | Exact |
|---|---|
| `"vacaville concrete contractor"` | `[vacaville concrete contractor]` |
| `"vacaville concrete company"` | `[vacaville concrete company]` |
| `"concrete contractor vacaville"` | `[concrete contractor vacaville]` |
| `"concrete driveway vacaville"` | `[concrete driveway vacaville]` |
| `"stamped concrete vacaville"` | `[stamped concrete vacaville]` |
| `"decorative concrete vacaville"` | `[decorative concrete vacaville]` |
| `"concrete patio vacaville"` | `[concrete patio vacaville]` |
| `"concrete walkway vacaville"` | `[concrete walkway vacaville]` |
| `"concrete flatwork vacaville"` | `[concrete flatwork vacaville]` |
| `"foundation contractor vacaville"` | `[foundation contractor vacaville]` |
| `"concrete driveway contractor"` | `[concrete driveway contractor]` |
| `"stamped concrete contractor"` | `[stamped concrete contractor]` |
| `"decorative concrete contractor"` | `[decorative concrete contractor]` |
| `"concrete patio contractor"` | `[concrete patio contractor]` |
| `"concrete flatwork contractor"` | `[concrete flatwork contractor]` |
| `"vacaville driveway contractor"` | `[vacaville driveway contractor]` |

### AG | Landscape | Vacaville

| Phrase | Exact |
|---|---|
| `"vacaville landscaping"` | `[vacaville landscaping]` |
| `"vacaville landscape contractor"` | `[vacaville landscape contractor]` |
| `"landscape contractor vacaville"` | `[landscape contractor vacaville]` |
| `"drought tolerant landscaping vacaville"` | `[drought tolerant landscaping vacaville]` |
| `"drought tolerant landscaping"` | `[drought tolerant landscaping]` |
| `"irrigation installation vacaville"` | `[irrigation installation vacaville]` |
| `"drainage contractor vacaville"` | `[drainage contractor vacaville]` |
| `"retaining wall vacaville"` | `[retaining wall vacaville]` |
| `"paver contractor vacaville"` | `[paver contractor vacaville]` |
| `"outdoor lighting vacaville"` | `[outdoor lighting vacaville]` |
| `"turf installation vacaville"` | `[turf installation vacaville]` |
| `"landscape design vacaville"` | `[landscape design vacaville]` |
| `"irrigation and drainage"` | `[irrigation and drainage]` |
| `"retaining wall contractor"` | `[retaining wall contractor]` |
| `"paver patio contractor"` | `[paver patio contractor]` |
| `"vacaville paver contractor"` | `[vacaville paver contractor]` |

Do not add competitor brand keywords. Do not add “near me” as a standalone keyword list — Presence geo already covers local intent.

## Negative themes (campaign-level)

Add as phrase (and exact where the UI wants a tight block). **Do not invent a competitor brand list.** If competitor names are unknown, skip them.

| Theme | Example negatives (phrase) |
|---|---|
| Jobs / careers | `"jobs"`, `"careers"`, `"hiring"`, `"employment"`, `"salary"`, `"resume"`, `"intern"` |
| DIY / how-to | `"diy"`, `"how to"`, `"yourself"`, `"tutorial"`, `"homemade"` |
| Wholesale | `"wholesale"`, `"bulk"`, `"distributor"`, `"dealer"` |
| Materials-only | `"for sale"`, `"supplies"`, `"bags"`, `"mix"`, `"ready mix"`, `"delivery only"`, `"home depot"`, `"lowes"` |
| Training / certs | `"class"`, `"course"`, `"certification"`, `"license exam"` |
| Equipment rental | `"rental"`, `"rent"`, `"equipment rental"` |
| Competitor brands | **Skip.** Do not invent names. |

After launch, dump search terms and add query-level negatives. Do not pre-write a fake search-terms report.

## RSA copy (15 headlines / 4 descriptions)

One RSA, used in both ad groups. All lines are from the live LP promise (fetched 2026-08-15). No reviews. No star ratings. No invented years beyond **Since 2004** (on the LP). Headlines ≤30 characters. Descriptions ≤90 characters.

### Headlines

| # | Headline | Chars |
|---|---|---|
| 1 | Concrete Meets Landscape. | 25 |
| 2 | Vacaville CA Since 2004 | 23 |
| 3 | Licensed + Insured Team | 23 |
| 4 | One Team. No Subcontractors | 27 |
| 5 | Concrete + Landscape Together | 29 |
| 6 | Request a Consultation | 22 |
| 7 | Driveways, Patios, Flatwork | 27 |
| 8 | Stamped & Decorative Concrete | 29 |
| 9 | Drought-Tolerant Landscaping | 28 |
| 10 | Irrigation and Drainage | 23 |
| 11 | Outdoor Lighting and Turf | 25 |
| 12 | Retaining Walls and Pavers | 26 |
| 13 | Keep the Site Connected | 23 |
| 14 | Local Intent. Local Answer. | 27 |
| 15 | Free Project-Fit Consult | 24 |

Pin none. Let the RSA mix. Do not pin a phone number.

### Descriptions

| # | Description | Chars |
|---|---|---|
| 1 | One Vacaville team for hard surfaces, drainage, planting, and exterior details. | 79 |
| 2 | Since 2004. Licensed + insured. One team handles concrete and landscape together. | 81 |
| 3 | Share the basics for a free consultation. A project-fit talk, not a generic sales form. | 87 |
| 4 | Centered on Vacaville and nearby communities. Start with address and project type. | 82 |

LP sources for the lines above: hero “Concrete meets landscape.”; “Vacaville, CA · Since 2004”; “Licensed + insured”; “One team” / “No subcontractors”; service lists (driveways, stamped/decorative concrete, patios/walkways, foundations/flatwork, drought-tolerant landscaping, irrigation/drainage, outdoor lighting/turf, retaining walls/pavers); “Keep the site connected.”; “Local intent deserves a local answer.”; “free consultation request” / “project-fit conversation, not a generic sales form.”

## Tracking note

- Auto-tagging on. Final URL is the Netlify LP only.
- Live LP JS copies `gclid` / `gbraid` / `wbraid` (and unused UTM keys) from the query string into hidden form fields. That is enough. Do not invent a second tagging plan.
- On-page `dataLayer` pushes observed 2026-08-15: `estimate_start`, `phone_call`, `contact_form`. **These are pending / analytics events, not Primary conversions, not bid signals.**
- Do not optimize this campaign to those events. Do not mark them Primary. Do not switch to Maximize Conversions or tCPA because a pending event appeared.
- Operator stated the URL is already wired for Google Ads leads. This packet does not invent conversion names, IDs, or fire counts. Verify in-account after login; if the lead action is still Unverified / No recent conversions / Pending, keep Maximize Clicks or Manual CPC.
- Form submit copy on the LP: “Submitting requests a follow-up. It does not schedule work or commit you to a project.” Treat inbound as consultation requests, not booked jobs.

## Do-not-do list

1. Do not create or expand Performance Max. This packet is Search only.
2. Do not use tCPA, Maximize Conversions, Maximize Conversion Value, or Target ROAS.
3. Do not treat pending `dataLayer` events as conversions or bid goals.
4. Do not add net-new spend on top of current PMax. Slice the existing Google daily budget.
5. Do not invent a monthly budget, CPA target, expected CTR, or lead volume.
6. Do not use broad match. Do not use Presence or Interest.
7. Do not invent competitor brand negatives or keywords.
8. Do not invent reviews, ratings, or years other than Since 2004.
9. Do not add a new UTM scheme or a final-URL suffix.
10. Do not point this campaign at the WordPress site. Final URL is the Netlify LP.
11. Do not put emails, phone numbers, or Google Ads customer IDs in ads, extensions, or follow-up notes spawned from this packet.
12. Do not email anyone from this packet. Do not send the client a “launch” message.
13. Do not enable Display, Search partners, or a DSA/PMax hybrid “to get more volume.”
14. Do not create a third ad group, a brand-only group, or a “near me” dumping group.
15. Do not enable the campaign until UI login works. Status after login: Enabled.
