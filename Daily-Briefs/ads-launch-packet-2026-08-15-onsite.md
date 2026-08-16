---
client: Onsite Concrete
type: ads-launch-packet
action: CREATE
channel: google-ads
campaign_type: search
date: 2026-08-15
status: draft
tier: 2
---

# Onsite Concrete & Landscape — Search CREATE packet

One-line: new Search campaign to the live Vacaville Google Ads LP; Maximize Clicks or Manual CPC; carve from current Google daily budget; no new PMax.

**Status:** draft CREATE only. A human applies in-account after Google UI login. Do not email anyone.

## Evidence used (no invented metrics)

| Source | What it proves | What it does not prove |
|---|---|---|
| Live LP fetched 2026-08-15 | Destination URL, services, Vacaville framing, consultation form | Spend, CPC, conversion quality |
| Drive intake + Netlify form mail | This Netlify URL is the known Google Ads landing page and already captures click IDs | That Netlify form rows are production customer leads (July export called stored rows test) |
| Late-July operator reports (paraphrase) | Google weeks in that window read about $23–$60 spend | A new monthly appropriation |

Pending-validation events are **not** conversions for bidding.

## Campaign

Paste name: `Onsite | Search | Vacaville | Concrete-Landscape | 2026-08`

| Field | Set to |
|---|---|
| **Campaign name** | Onsite / Search / Vacaville / Concrete-Landscape / 2026-08 |
| **Type** | Search. **Not** Performance Max. Do not add another PMax. |
| **Goal in UI** | Traffic / clicks. Not conversions. |
| **Networks** | Google Search **on**. Search Partners **off**. Display Network **off**. |
| **Language** | English |
| **Final URL** | `https://onsite-gads-landing-page.netlify.app/` |
| **URL extras** | Auto-tagging **on**. No invented `utm_*` scheme. Let `gclid` / `gbraid` / `wbraid` append. |
| **Bid** | **Maximize Clicks** (preferred) **or Manual CPC**. No tCPA. No Maximize Conversions. No Smart Bidding. |
| **Budget rule** | **Carve from the existing Google daily budget. Do not add net-new spend on top of current PMax.** Ceiling only from late-July weekly reads: about $23–$60 / week. Do not invent a new monthly budget in this packet. |
| **Geo** | Vacaville, CA. **Presence only.** If the live account already targets named nearby communities, keep that existing set — do not invent a new city list in this packet. |
| **Status after create** | Enabled once UI login works. |

## Ad groups

Two ad groups. Phrase and exact only. No Broad. Both use the same final URL.

### 1. `AG | Concrete`

**Phrase**

```
"concrete contractor"
"concrete driveway"
"stamped concrete"
"decorative concrete"
"concrete patio"
"concrete walkway"
"flatwork contractor"
"vacaville concrete"
"vacaville concrete contractor"
```

**Exact**

```
[concrete contractor]
[concrete driveway]
[stamped concrete]
[concrete patio]
[vacaville concrete]
[vacaville concrete contractor]
```

### 2. `AG | Landscape`

**Phrase**

```
"landscape contractor"
"landscape installation"
"drought tolerant landscaping"
"irrigation and drainage"
"retaining wall contractor"
"paver installation"
"vacaville landscaping"
"vacaville landscape contractor"
```

**Exact**

```
[landscape contractor]
[landscape installation]
[retaining wall contractor]
[vacaville landscaping]
[vacaville landscape contractor]
```

## Negative themes

Campaign-level. Do not invent competitor brand names.

```
jobs
careers
hiring
salary
diy
"do it yourself"
wholesale
"for sale"
materials
supplier
"how to"
```

## RSA copy

Live-LP language only. Headlines ≤ 30. Descriptions ≤ 90. No reviews. "Since 2004" is on the LP.

Display path: `vacaville` / `consult`

### RSA — Concrete

| # | Headline |
|---|---|
| 1 | Vacaville Concrete Work |
| 2 | Concrete Meets Landscape |
| 3 | Driveways and Flatwork |
| 4 | Stamped and Decorative |
| 5 | Patios and Walkways |
| 6 | Local Concrete Contractor |
| 7 | One Team, Hard Surfaces |
| 8 | Since 2004, Vacaville |
| 9 | Discuss a Concrete Project |
| 10 | Licensed and Insured Crew |
| 11 | No Subcontractor Split |
| 12 | Start the Conversation |
| 13 | Surfaces the Site Needs |
| 14 | Vacaville Concrete + Site |
| 15 | Request a Consultation |

| # | Description |
|---|---|
| 1 | Driveways, stamped concrete, patios, and flatwork from one Vacaville team. |
| 2 | Concrete planned with the landscape around it. Request a consultation. |
| 3 | Local crew since 2004. Licensed and insured. Start the conversation. |
| 4 | Hard surfaces, drainage, and finish — one site conversation, not a generic form. |

### RSA — Landscape

| # | Headline |
|---|---|
| 1 | Vacaville Landscape Work |
| 2 | Concrete Meets Landscape |
| 3 | Planting, Water, and Grade |
| 4 | Irrigation and Drainage |
| 5 | Retaining Walls and Pavers |
| 6 | Drought-Tolerant Planting |
| 7 | Local Landscape Contractor |
| 8 | Since 2004, Vacaville |
| 9 | Discuss a Landscape Project |
| 10 | One Team, Living System |
| 11 | No Subcontractor Split |
| 12 | Start the Conversation |
| 13 | Outdoor Lighting and Turf |
| 14 | Vacaville Landscape + Site |
| 15 | Request a Consultation |

| # | Description |
|---|---|
| 1 | Landscape design and install coordinated with concrete and drainage. |
| 2 | Drought-tolerant planting, irrigation, lighting, walls, and pavers. |
| 3 | Local crew since 2004. Request a consultation for Vacaville and nearby. |
| 4 | One team for the living system around the hardscape. Start the conversation. |

## Tracking note

- Auto-tagging **on**.
- Final URL is the existing Netlify Google Ads LP. No new UTM scheme.
- The LP form already has fields for source URL and click IDs. July Netlify exports labeled stored rows as test — do not treat those rows as customer conversions.
- Do not add call assets in this CREATE (this packet must not carry phone numbers).
- Do not send this campaign to the WordPress homepage.

## Do-not-do list

1. Do not create another Performance Max campaign.
2. Do not add net-new spend on top of current PMax. Carve from the existing Google daily budget.
3. Do not use tCPA, Maximize Conversions, or Smart Bidding.
4. Do not invent a UTM scheme or change the confirmed final URL.
5. Do not use Presence or interest. Presence only.
6. Do not add Broad match.
7. Do not invent competitor negatives.
8. Do not put emails, phones, or customer IDs in ads or this packet.
9. Do not email the client.
10. Do not treat pending or test form rows as conversions.
