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

### Lane A — FDDs and state franchise registries (names ledger) — PROBED 2026-08-15

Franchisors must file Franchise Disclosure Documents. [16 CFR § 436.5(t) Item 20](https://www.law.cornell.edu/cfr/text/16/436.5) requires **name + outlet address + telephone** for current franchisees. Email is not a required field. Treat Item 20 as the owner-name ledger; emails still come from Lane B. Never invent a mailbox from a filing name.

| Portal | Probed 2026-08-15 | Use |
|---|---|---|
| Minnesota CARDS | Browser UA: no-login FDD PDFs at https://cards.web.commerce.state.mn.us/franchise-registrations. Bots get 403. 2026 Clean FDD first page = 500 rows / 340 file numbers | **Primary** owner-name source |
| Wisconsin DFI | Search → Details → Download is a no-login PDF. Active list = **1,861** names only (no FDD on that page) | **Primary** |
| Indiana Securities search | https://securities.sos.in.gov/public-portfolio-search/ — form is public, **reCAPTCHA** on submit | Human-only; FDD download not verified |
| California DFPI DocQNet / FRANSES | **Not a free FDD library.** Filings moved to FRANSES (account). Copies via PRA | **Skip** |
| Maryland OAG | Guidance only; no public download corpus | **Skip** |

Receipts: [[12_Brain/raw/research/2026-08-15 Franchise Lanes A-C-D Receipts]] · [[12_Brain/raw/research/2026-08-15 Franchise Lane A Portal Probe]].

### Lane B — brand location pages + radar targeting — RUN 2026-08-14 / flip 2026-08-15

OSM discovery used to **drop** every franchise so the site grader would not pitch CVS. That signal now has an opt-in targeting mode that does **not** change the default grader:

```
node _os/automation/bin/discover-prospects.js --market PHL --keep-chains service-franchise --dry-run
```

Keeps Momentum ICP service franchises (home services, restoration, senior care, local fitness). Still drops pharmacies, convenience, hotels, banks. Default write path for that flag is gitignored `12_Brain/private/contacts/`. An OSM hit is a lead — still require a literal on-page mailbox before the row is send-ready.

### Lane B harvest — brand location pages — RUN 2026-08-14

Service franchises publish per-location pages, and some list the location email right on the page. **The winning move is the brand's own locator endpoint** (`wp-json` / offices API). When that is 401/JS-shell, probe one location home **and** its contact-us page before a national crawl.

**UPS Store `store####@` is not Lane B for sending.** It is a front-desk shipping inbox. Keep those rows as LinkedIn/GBP research only.

Verified sendable mechanisms (full receipts: [[12_Brain/research/Franchise Email Sourcing]]):

| Mechanism | Yield | Send? |
|---|---|---|
| CertaPro Painters `GET /wp-json/certapro-location-profiles/v1/profiles` | 354 territory emails | yes — franchisee business mailbox |
| Synergy HomeCare location pages (`location-sitemap.xml`) | 152 | yes — printed on the location page |
| Mosquito Squad `/{territory}/contact-us/` | 123 | yes — franchisee territory mailbox |
| Comfort Keepers offices API | 53 | yes — office mailbox |
| 1-800-PACKOUTS `/locations/` HTML | 38 (30 named) | yes — best named density |
| The UPS Store national Yext sitemap → store pages | 4,914 `store####@` | **no** — front desk, not owner |

Confirmed dead ends (JS-shell locators, no static emails): Pillar To Post, HouseMaster, Mathnasium, Fish Window Cleaning, Minuteman Press, Signarama, AlphaGraphics, Visiting Angels, Senior Helpers, Interim HealthCare, Amada, The Joint (vendor mailbox on clinic pages), Lawn Doctor REST (401), Neighborly family, ShelfGenie, Precision Door, Always Best Care, Griswold, Homewatch. Probe one location page per brand before committing to a crawl.

Per row capture: brand, location, contact name, email, phone, city, state, category, `role_type` (owner_operator | location_mailbox), source URL, accessed date.

### Lane C — directories, then brand pages (secondary) — PROBED 2026-08-15

Use directories to **pick the next brands**, then run the Lane B one-page probe. Not an email source.

| Directory | URL | Notes |
|---|---|---|
| Franchise Times Top 400 **category** tables | https://www.franchisetimes.com/top-400-2025/ | **Best free ranked list.** Homepage teasers; category pages (home services, health/medical, cleaning) render full tables with no login. 2026 list is not up yet. |
| Entrepreneur Franchise 500 hub | https://www.entrepreneur.com/franchise500 | JS teaser / subscribe wall. Use the free 2026 editorial top-10-by-industry articles instead of scraping the hub. |
| IFA opportunities | https://www.franchise.org/franchise-opportunities/ | Free, JS grid. Brand cards sometimes print a franchise-development mailbox (franchisor-tier, not owner). |

**Next Lane B probes** (one page each, then stop if no literal mailbox). Subtract the 720 + known dead ends first:

| Brand | Why | First probe |
|---|---|---|
| Blue Kangaroo Packoutz | Public `GET /wp-json/belfor/v1/locations` includes an email field (same restoration family as PACKOUTS) | one record from the dump, then decide on a crawl |
| Mosquito Authority | Static territory index, 0 emails on the list page | one territory home + contact subpage |
| Mighty Dog Roofing | Static `/locations/` with phones, many `/contact` hrefs | same one-page rule as Mosquito Squad |
| HomeWell | 187 location URLs, sampled PA contact-us = form only | one `/meet-the-team/` page, not a crawl |
| PuroClean / ComForCare | Phone/form locators | one location page |

Do not recrawl Joint, Lawn Doctor REST, Neighborly, Christmas Decor, Visiting Angels locations, Senior Helpers, SERVPRO JS, or UPS store counters.

Franchisor-tier stays **held** until wave-1 send data. Different pitch. If that pass opens: Visiting Angels (Bryn Mawr) and PrimoHoagies (Westville NJ) have corporate development/support mailboxes; Hand & Stone HQ is Trevose PA and form-only; **drop Saxbys** (campus / company-operated, `/franchise/` 404).

LinkedIn (free, no Sales Nav): Google `site:linkedin.com/in "{Brand}" ("Owner" OR Franchisee) (Pennsylvania OR "New Jersey" OR Philadelphia)` — confirm the operator, then take the mailbox from a location page. No scraped profiles in git.

### Lane D — verification + compliance — DOCUMENTED 2026-08-15

- MX: `node _os/automation/bin/mx-check.js <csv> --email-col Email` (DNS only). Send-ready is 720/720 `mx_ok`.
- MX-ok ≠ owner. Store-counter and vendor mailboxes stay off the send file.
- CAN-SPAM applies to B2B ([FTC guide](https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business)): truthful headers, non-deceptive subject, **identify as a commercial message**, physical postal address, working opt-out honored within 10 business days (house rule: same hour). Hold `.ca` / Canada rows for a separate CASL review.
- 25–40 cold sends/day from one real mailbox after SPF/DKIM. Three-touch cap. No calendar invite on the cold list.
- PII: Drive + `12_Brain/private/contacts/` only.

## Pipeline (repeatable)

1. Pick brands (ICP: home services, fitness/wellness, senior care, pet; PA/NJ/DE first).
2. Lane B harvest → rows with literal on-page/on-endpoint emails.
3. Lane A cross-check for owner names where location pages don't name them.
4. Dedupe (email + domain), one row per company.
5. MX-verify: `node _os/automation/bin/mx-check.js <list.csv>` (DNS-only, adds `mx_status`).
6. Load `mx_ok` rows into the Drive tracker with per-row UTM registration links (`utm_content=FRAN-WORKSHOP-###`).
7. Wave 1 = 50 rows, prioritized: named owner > PA/NJ/DE > category fit.
8. After sends: bounces/replies/opt-outs → `Outreach Status` immediately.

**Send-ready result (2026-08-14 evening):** **720** unique MX-ok franchisee/office mailboxes (CertaPro 354 · Synergy 152 · Mosquito Squad 123 · Comfort Keepers 53 · PACKOUTS 38). Named-style **123**. Wave 1 = 50 named. PA/NJ/DE = 56. The 4,914 UPS Store front-desk inboxes are **not** in this file. Drive sheets live in folder "Franchise Workshop Lists — 2026-08-14" (Wave 1 + full 720). Zero contact rows in this repo.

## Tracker schema (same as the 200-list sheet)

`Prospect ID | Business Name | Contact Name | Email | Franchise Brand | Category | City | State | Phone | Website | Registration Link | Role Type | Email Type | MX Status | Source | Source URL | Accessed | Outreach Status | Email Sent Date | Notes`

## When to spend money (not now)

Only after the free pilot produces send data (gate #2 in [[Outreach Plan]]): if registrations convert and Sean wants volume, evaluate a paid enrichment tool with a firm monthly cap, through the normal tool gate. The free lanes above scale to several hundred contacts before that conversation is even necessary.
