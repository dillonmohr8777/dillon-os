---
client: Omega Landscaping
type: ads-launch-packet
action: CREATE
channel: google-ads
campaign_type: search
date: 2026-08-15
status: draft
tier: 2
---

# Omega Landscaping & Concrete — Search CREATE packet

One-line: new Search campaign to the live estimate LP; Maximize Clicks or Manual CPC; carve from current Search; no Smart Bidding.

**Status:** draft CREATE only. A human applies in-account. Do not email anyone. Do not send, publish, or flip live bids from this file.

## Evidence used (no invented metrics)

| Source | What it proves | What it does not prove |
|---|---|---|
| Live estimate LP, fetched 2026-08-15 | Destination URL, CTA language, services, named service area | Spend, CPC, conversion quality |
| Dillon Aug 2 email + Aug 10 Slack (paraphrase only) | Most inbound calls are wrong-company / material-supplier confusion | Named callers, in-account query graph |
| Same operator paraphrase | Existing Search spent about $388 in the Aug 3–9 week, with 56 clicks | Daily budget, CPC, impression share, which campaign name |
| Same operator paraphrase | Google reported 2 conversion events that still need matching to named inquiries | That those 2 events are qualified jobs |
| Same operator paraphrase | Google emailed a Smart Bidding deadline of Aug 17, 2026 | Permission to flip this new campaign to Smart Bidding |
| Live LP + this packet | Final URL is the Netlify estimate page, not a new PMax | Existing Search structure inside the account |

Pending-validation or unmatched conversion events are **not** conversions for bidding.

## Campaign

Paste name: `Omega | Search | Landscape+Concrete Estimate | COS Presence`

| Field | Set to |
|---|---|
| **Campaign name** | Omega / Search / Landscape+Concrete Estimate / COS Presence |
| **Type** | Search. Standard Search campaign. **Not** Performance Max. **Not** a second PMax. |
| **Goal in UI** | Create without a conversion-value / Smart Bidding goal. If the UI forces a goal picker, choose traffic / clicks — not conversions. |
| **Networks** | Google Search **on**. Search Partners **off**. Display Network **off**. |
| **Language** | English |
| **Final URL** | `https://omega-landscaping-landing-page.netlify.app/` |
| **URL extras** | Auto-tagging **on**. No invented UTM scheme. Do not append `utm_*` query params. Let `gclid` ride on the LP as Google appends it. |
| **Bid** | **Maximize Clicks** (preferred launch) **or Manual CPC**. No tCPA. No Maximize Conversions. No Maximize Conversion Value. No tROAS. No Smart Bidding. |
| **Budget rule** | **Carve from current Search daily budget; do not stack.** Existing Search already spent about $388 in the Aug 3–9 week (56 clicks). This campaign takes a slice of that Search daily budget. Do not add a second full-spend campaign on top. Do not invent a new daily dollar amount in this packet — the operator sets the carved daily number in-account so the two Search campaigns sum to the current Search daily, not current Search plus a new daily. |
| **Geo** | Colorado Springs, Monument, Falcon, Peyton, Black Forest. **Presence only** (people in or regularly in the targeted locations). Not Presence or interest. "Northern Colorado Springs" is named on the LP and is covered by the Colorado Springs location — do not add an invented radius or unlisted cities. |
| **Brand status** | **Protected — brand.** Do not negative `Omega`, `Omega Landscaping`, `Omega Concrete`, or obvious brand misspellings. |

## Ad groups

Three ad groups. Phrase and exact only. No Broad. All three point at the same final URL.

### 1. `AG | Landscape Install`

Intent: contractor / install for landscape-side work on the LP (grading/drainage, retaining walls, turf/rock, outdoor living).

**Phrase**

```
"landscaping contractor"
"landscape contractor"
"landscaping company"
"landscape installation"
"landscaping installation"
"retaining wall contractor"
"retaining wall installation"
"grading and drainage"
"yard drainage contractor"
"landscape drainage"
"turf installation"
"rock landscaping"
"outdoor living contractor"
"landscape design and build"
"colorado springs landscaping"
"colorado springs landscaping contractor"
"monument landscaping"
"falcon landscaping"
"peyton landscaping"
"black forest landscaping"
```

**Exact**

```
[landscaping contractor]
[landscape contractor]
[landscape installation]
[retaining wall contractor]
[retaining wall installation]
[grading and drainage]
[turf installation]
[outdoor living contractor]
[colorado springs landscaping]
[colorado springs landscaping contractor]
```

### 2. `AG | Concrete Install`

Intent: contractor / install for concrete-side work on the LP (driveways, patios, concrete site work).

**Phrase**

```
"concrete contractor"
"concrete installation"
"concrete driveway"
"concrete driveway contractor"
"concrete patio"
"concrete patio contractor"
"driveway installation"
"patio installation"
"concrete site work"
"colorado springs concrete"
"colorado springs concrete contractor"
"monument concrete contractor"
"falcon concrete contractor"
"peyton concrete contractor"
"black forest concrete"
```

**Exact**

```
[concrete contractor]
[concrete installation]
[concrete driveway contractor]
[concrete patio contractor]
[driveway installation]
[patio installation]
[concrete site work]
[colorado springs concrete contractor]
```

### 3. `AG | Estimate Intent`

Intent: people asking for an estimate / quote on landscape, concrete, or both. Copy stays contractor/install/estimate. Do not bid "free estimate" — the live LP says "Start your estimate" / "Request estimate", not free.

**Phrase**

```
"landscaping estimate"
"landscape estimate"
"concrete estimate"
"landscaping quote"
"landscape quote"
"concrete quote"
"concrete driveway estimate"
"patio estimate"
"retaining wall estimate"
"colorado springs landscaping estimate"
"colorado springs concrete estimate"
```

**Exact**

```
[landscaping estimate]
[landscape estimate]
[concrete estimate]
[landscaping quote]
[concrete driveway estimate]
[colorado springs landscaping estimate]
[colorado springs concrete estimate]
```

## Negative themes

Apply at **campaign** level on this new Search campaign (and draft the same themes onto the existing Search if the operator is already carving budget there). Phrase for themes. Exact only when a later search-terms export proves a single waste query.

**Protected — brand:** do **not** add Omega or brand misspellings.

| Theme | Draft negatives (phrase unless noted) | Why |
|---|---|---|
| Supplier / wholesale | `"supplier"`, `"wholesale"`, `"distributor"`, `"materials"`, `"ceramic"`, `"products"`, `"material supplier"`, `"landscape supply"`, `"concrete supply"`, `"supply store"`, `"warehouse"`, `"bulk"`, `"pallet"` | Operator: most calls are wrong-company / material-supplier confusion |
| Buy / yard language | `"supply yard"`, `"buy materials"`, `"for sale"` | RSA and keywords must stay contractor/install/estimate |
| Jobs / employment | `"jobs"`, `"employment"`, `"hiring"`, `"career"`, `"salary"`, `"indeed"`, `"resume"`, `"job opening"` | Employment queries are not estimate demand |
| Another-company language | Theme only — do not guess rival names in this packet. Add a named other-company as **exact** only after a search-terms export proves spend. Do not use the brand `Omega` as the negative. | Wrong-entity calls are the stated problem; inventing competitor names is not evidence |

Paste-ready campaign negatives (no comments inside the fence):

```
supplier
wholesale
distributor
materials
ceramic
products
"material supplier"
"landscape supply"
"concrete supply"
"supply store"
"supply yard"
"buy materials"
"for sale"
warehouse
bulk
pallet
jobs
employment
hiring
career
salary
indeed
resume
"job opening"
```

After launch, run a search-terms pass. Classify each flagged row **Waste** / **Review — competitor** / **Protected — brand** before adding more negatives. Zero-conversion is not automatically waste.

## RSA copy

Live-page language only: contractor / install / estimate. Never "buy materials" or "supply yard" as the offer. Do not pin headlines. Do not put a phone, email, or customer ID in any asset. Do not promise "free." Do not use the vault Meta line about homeowner volume — that number is not on the live LP and this packet does not invent metrics.

Character limits: headlines ≤ 30, descriptions ≤ 90, paths ≤ 15. Counts are in the last column.

Display path (all three ads): `estimate` / `cos` (8 / 3).

### RSA — Landscape Install

| # | Headline | n |
|---|---|---|
| 1 | Landscape Install, Not Store | 28 |
| 2 | Start Your Landscape Estimate | 29 |
| 3 | Colorado Springs Landscaping | 28 |
| 4 | Grading and Drainage Install | 28 |
| 5 | Retaining Wall Contractor | 25 |
| 6 | Turf and Rock Installation | 26 |
| 7 | Outdoor Living Contractor | 25 |
| 8 | Request a Landscape Estimate | 28 |
| 9 | Design + Build Landscaping | 26 |
| 10 | Local Landscape Contractor | 26 |
| 11 | Built Around Site Conditions | 28 |
| 12 | Monument Falcon Peyton Work | 27 |
| 13 | Black Forest Landscaping | 24 |
| 14 | One Coordinated Exterior | 24 |
| 15 | Talk Through the Project | 24 |

| # | Description | n |
|---|---|---|
| 1 | Landscape install: grade, drainage, retaining walls, turf, and rock. Start your estimate. | 89 |
| 2 | Start your estimate for Colorado Springs, Monument, Falcon, Peyton, Black Forest. | 81 |
| 3 | We install the work. This is not a materials store. Request a landscape estimate. | 81 |
| 4 | Grading, drainage, retaining walls, turf, and outdoor living — one exterior plan. | 81 |

### RSA — Concrete Install

| # | Headline | n |
|---|---|---|
| 1 | Concrete Install, Not Store | 27 |
| 2 | Start Your Concrete Estimate | 28 |
| 3 | Colorado Springs Concrete | 25 |
| 4 | Driveway Installation | 21 |
| 5 | Concrete Patio Contractor | 25 |
| 6 | Concrete Site Work Install | 26 |
| 7 | Request a Concrete Estimate | 27 |
| 8 | Local Concrete Contractor | 25 |
| 9 | Patios and Driveways Built | 26 |
| 10 | Concrete + Landscape Scope | 26 |
| 11 | Monument to Black Forest | 24 |
| 12 | Built Around Site Conditions | 28 |
| 13 | Talk Through the Project | 24 |
| 14 | Driveways, Patios, Site Work | 28 |
| 15 | Contractor Concrete Install | 27 |

| # | Description | n |
|---|---|---|
| 1 | Driveways, patios, and concrete site work installed with the grade and drainage plan. | 85 |
| 2 | Start your estimate for Colorado Springs, Monument, Falcon, Peyton, Black Forest. | 81 |
| 3 | We install the work. This is not a materials store. Request a concrete estimate. | 80 |
| 4 | Concrete surfaces planned with landscape scope. Request an estimate to talk it through. | 87 |

### RSA — Estimate Intent

| # | Headline | n |
|---|---|---|
| 1 | Start Your Estimate | 19 |
| 2 | Request an Estimate | 19 |
| 3 | Landscape + Concrete Estimate | 29 |
| 4 | Colorado Springs Estimate | 25 |
| 5 | Contractor Estimate, Not Store | 30 |
| 6 | Grading to Concrete Estimate | 28 |
| 7 | Local Install Estimate | 22 |
| 8 | Talk Through the Project | 24 |
| 9 | Design + Build Estimate | 23 |
| 10 | Monument Falcon Peyton | 22 |
| 11 | Black Forest Estimate | 21 |
| 12 | Outdoor Living Estimate | 23 |
| 13 | Driveway and Patio Estimate | 27 |
| 14 | Retaining Wall Estimate | 23 |
| 15 | One Property, One Estimate | 26 |

| # | Description | n |
|---|---|---|
| 1 | Request an estimate for landscape and concrete install. Starts a project-fit talk. | 82 |
| 2 | Start your estimate for Colorado Springs, Monument, Falcon, Peyton, Black Forest. | 81 |
| 3 | We install the work. Not a store. Share the site and the work you need. | 71 |
| 4 | Grading, walls, turf, rock, driveways, patios — one estimate for the exterior. | 78 |

## Tracking note

- Auto-tagging **on**.
- Final URL is the live LP with **no** invented UTM scheme.
- Google reported **2 conversion events** in the operator paraphrase that **still need matching to named inquiries**. Those 2 events are not validated conversions and are not a Smart Bidding signal.
- Do not count the same estimate submit in both a native Google Ads primary and a GA4-imported primary.
- Once matching exists, the primary action for this LP is a qualified estimate / project-fit request (the LP states the form requests a follow-up and does not schedule work). Until then, this campaign bids on clicks, not conversions.
- Do not add call assets in this CREATE (this packet must not carry phone numbers).

## Smart Bidding hold

Google emailed a Smart Bidding deadline of **Aug 17, 2026**. That email is not permission to flip **this** new campaign.

**Hold:** Maximize Clicks or Manual CPC only. Do not switch this campaign to Maximize Conversions, tCPA, tROAS, or any Smart Bidding strategy until named inquiries match conversion events and volume is real. Two unmatched events do not clear the vault bid-fit bar (~30 validated conversions / 30 days per campaign). Do not "accept the deadline" on this CREATE.

## Do-not-do list

1. Do not create another Performance Max campaign.
2. Do not stack a second full-spend Search on top of the existing ~$388/week Search. **Carve from current Search daily budget; do not stack.**
3. Do not use tCPA, Maximize Conversions, Maximize Conversion Value, tROAS, or any Smart Bidding strategy on this campaign.
4. Do not flip to Smart Bidding because of the Aug 17, 2026 deadline email.
5. Do not negative the brand **Omega** (Protected — brand), including obvious misspellings.
6. Do not write "buy materials", "supply yard", wholesale, or store-offer RSA.
7. Do not invent a UTM scheme or change the confirmed final URL.
8. Do not put emails, phones, or Google Ads customer IDs in ads, extensions, or this packet.
9. Do not use Presence or interest. Presence only.
10. Do not add Broad match keywords on this launch.
11. Do not treat the 2 unmatched conversion events as qualified jobs or as bidding signal.
12. Do not invent a daily budget dollar amount, CPC cap, or forecast CPA.
13. Do not promise a free estimate (not on the live LP).
14. Do not expand geo to cities the LP does not name.
15. Do not email anyone from this packet. Draft CREATE only; a human applies.

## Apply notes

- Tier 2: new campaign. Human applies in the live account.
- After the carve is live, the next evidence pass is a search-terms export — not a bid-strategy change.
- Review date for the carve + negatives: 14 days after apply, or the first full week with a search-terms export, whichever comes first.
