---
tags: [campaign, growth-workshop, sourcing, franchise]
campaign: "[[Growth Workshop]]"
created: 2026-08-14
research: "[[12_Brain/research/Franchise Email Sourcing]]"
---

# Franchise Email Sourcing Playbook

One-line summary: how we build franchise owner/operator email lists for $0, fully legitimately — four lanes, one schema, MX verification, and a hard PII boundary.

Verified findings and receipts live in [[12_Brain/research/Franchise Email Sourcing]] (with `expires:`); this page is the operating method.

## What "legitimate" means here (the rules)

1. **Public business contact info only** — published by the business itself on a public page (brand location page, the location's own site, a government filing). No logins, no trials, no paywalls, no purchased lists in the pilot.
2. **Never guess an email.** No pattern-derivation (`first.last@brand.com` guessing is banned). The address must appear literally on the cited source page. Skip rather than guess.
3. **Source URL + access date on every row.** A row without a receipt doesn't ship.
4. **One contact per company.** Owner-named beats generic location mailbox; both get typed honestly (`role_type`).
5. **CAN-SPAM compliant sending** (B2B cold email is legal in the US when done right): truthful from-name, non-deceptive subject, physical mailing address, working opt-out honored immediately, suppression list maintained. Three-touch cap on top (Mac's rule).
6. **PII boundary:** contact rows live in the private Drive sheet and private artifacts only. This public repo carries methods and counts, never addresses.

## The four lanes

### Lane A — FDDs and state franchise registries (names ledger)

Franchisors must file Franchise Disclosure Documents; **Item 20** lists every current franchisee with business address and phone. Several states publish FDDs free:

| Portal | What you get |
|---|---|
| Minnesota CARDS (`cards.web.commerce.state.mn.us`) | free direct FDD PDF downloads, easiest flow |
| California DFPI DocQNet (`docqnet.dfpi.ca.gov`) | free FDD search/download |
| Wisconsin DFI | free franchise filing search |
| Indiana Securities Portal | free filings search |

Item 20 gives **names + cities + phones, almost never emails** — it's the authoritative "who owns which location" ledger. Emails come from Lane B enrichment. Full SOP + verified portal behavior: see the research page.

### Lane B — brand location pages (the email harvest) — RUN 2026-08-14

Service franchises publish per-location pages, and some list the location email right on the page. This is the volume lane, and it's now verified: **the winning move is the brand's own locator endpoint, not page-by-page crawling.** Check the locator page's JS for `wp-json`/Yext routes first.

Verified mechanisms (full receipts: [[12_Brain/research/Franchise Email Sourcing]]):

| Mechanism | Yield |
|---|---|
| CertaPro Painters `GET /wp-json/certapro-location-profiles/v1/profiles` (full dump) | 354 unique territory emails |
| The UPS Store national Yext sitemap → store pages | 4,914 store mailboxes, all 50 states |
| Comfort Keepers `ckficms-api.ckweb.org` offices include | 54 unique office emails |
| 1-800-PACKOUTS `/locations/` HTML | 38 (31 named) |

Confirmed dead ends (JS-shell locators, no static emails): Pillar To Post, HouseMaster, Mathnasium, Fish Window Cleaning, Minuteman Press, Signarama, AlphaGraphics, Visiting Angels, Senior Helpers, Interim HealthCare, Amada. Probe one location page per brand before committing to a crawl.

Per row capture: brand, location, contact name, email, phone, city, state, category, `role_type` (owner_operator | location_mailbox), source URL, accessed date.

### Lane C — franchisor-tier contacts (secondary)

Corporate `franchising@` / `marketing@` addresses and named marketing leads from brand sites — one email can influence many locations, but it's a different pitch (partner/co-marketing, not "attend the workshop"). Hold until wave-1 data exists. PA/NJ-headquartered brands first (Visiting Angels — Bryn Mawr; Hand & Stone — NJ; PrimoHoagies — NJ; Saxbys — Philly).

### Lane D — trade-press multi-unit owners (quality seasoning)

Franchise trade press (1851franchise.com, Franchise Times, local business journals) names multi-unit franchisees and area developers in the Philly metro. Named owner + their operating company's public email = the highest-value rows on the list.

## Pipeline (repeatable)

1. Pick brands (ICP: home services, fitness/wellness, senior care, pet; PA/NJ/DE first).
2. Lane B harvest → rows with literal on-page/on-endpoint emails.
3. Lane A cross-check for owner names where location pages don't name them.
4. Dedupe (email + domain), one row per company.
5. MX-verify: `node _os/automation/bin/mx-check.js <list.csv>` (DNS-only, adds `mx_status`).
6. Load `mx_ok` rows into the Drive tracker with per-row UTM registration links (`utm_content=FRAN-WORKSHOP-###`).
7. Wave 1 = 50 rows, prioritized: named owner > PA/NJ/DE > category fit.
8. After sends: bounces/replies/opt-outs → `Outreach Status` immediately.

**Scale run result (2026-08-14 afternoon):** **5,359** unique contacts, 429 PA/NJ/DE, 5,359/5,359 `mx_ok` after dropping one bad row. Wave 1 = 50. Send Batch A = first 1,000. Remainder = 4,359 behind the bounce gate. Delivered as Drive folder "Franchise Workshop Lists — 2026-08-14" + private artifact — zero contact rows in this repo.

## Tracker schema (same as the 200-list sheet)

`Prospect ID | Business Name | Contact Name | Email | Franchise Brand | Category | City | State | Phone | Website | Registration Link | Role Type | Email Type | MX Status | Source | Source URL | Accessed | Outreach Status | Email Sent Date | Notes`

## When to spend money (not now)

Only after the free pilot produces send data (gate #2 in [[Outreach Plan]]): if registrations convert and Sean wants volume, evaluate a paid enrichment tool with a firm monthly cap, through the normal tool gate. The free lanes above scale to several hundred contacts before that conversation is even necessary.
