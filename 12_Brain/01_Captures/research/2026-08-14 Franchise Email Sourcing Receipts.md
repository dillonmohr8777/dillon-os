---
tags: [raw, research, franchise, sourcing]
captured: 2026-08-14
method: "direct fetches (curl/node), GET-only, throttled 300-400ms"
agent: cloud (growth-workshop-franchise-pilot branch)
note_type: capture
status: unprocessed
created: 2026-08-14
updated: 2026-08-14
source_refs: []
---


# Raw receipts — franchise email sourcing run, 2026-08-14

Verbatim log of what was probed, what worked, and what didn't. Contact rows
(names/emails) are NOT here — they live in the private Drive sheet
"Franchise Workshop Pilot List — 2026-08-14". This file is method + counts only.

## Context

Three research subagents were dispatched for lanes A/C/D and all failed on a
Cursor usage-limit error before doing any work. The harvest below was executed
directly in the main session instead (Lane B, the volume lane).

## Confirmed mechanism 1 — CertaPro Painters zip-profile REST endpoint

- CertaPro territory subdomains render the local franchisee's email in static
  HTML (confirmed on `central-lower-bucks.certapro.com`, 2 addresses in page).
- Their locator calls a public WordPress REST route, found in
  `certapro.com/wp-content/themes/certapro/js/core.odoo.js`:
  `GET https://certapro.com/wp-json/certapro-location-profile/v1/profile?zip={zip}`
- Response per zip: outlet name, phone, **territory email**, subdomain, state,
  branch id. Same data the public site displays — no auth, no POST.
- Swept 93 zips (Philly metro + PA + NJ + DE + MD + Northeast + national
  spread), throttled 400ms: **73 unique territories, 73 with emails**.
  25 of them PA/NJ/DE. 3 emails are named-person format (`first_last@`).
- Sister-brand check (FirstService Brands): `pauldavis.com` exposes
  `pd-zipcode/v1/zipcode` + `franchise-code/v1/zipcode` but POST-only — skipped
  (kept the run GET-only). `pillartopost.com`, `californiaclosets.com`,
  `floorcoveringsinternational.com` wp-json indexes show no equivalent route.

## Confirmed mechanism 2 — The UPS Store Yext location pages

- `locations.theupsstore.com/{state}/{city}` are static Yext-generated indexes;
  store detail pages print the store mailbox (`store####@theupsstore.com`) in
  HTML (confirmed on `/pa/philadelphia/1201-arch-st`).
- Crawled 13 valid city indexes (Philly + PA suburbs + South Jersey + Princeton
  + Wilmington/Newark DE), 43 store pages fetched, throttled 300ms:
  **43 stores, 43 with emails**, all PA/NJ/DE. No owner names on-page
  (role mailboxes only). 404 city slugs: `pa/ardmore`, `nj/moorestown`.

## Dead ends (JS-shell locators, no static emails — do not re-probe blindly)

- Index/locator pages returning JS shells or zero addresses: Pillar To Post,
  HouseMaster (857KB bundle, 0 emails), Kitchen Tune-Up, Mathnasium, Fish
  Window Cleaning, Signarama, AlphaGraphics centers index, Minuteman Press
  (store links JS-injected), Visiting Angels, Senior Helpers (dummy placeholder
  address only), Interim HealthCare (corporate mailbox only), Amada.
- Budget Blinds / Mosquito Joe guessed subdomains returned 0 bytes.
- Exa MCP search hit its free-tier rate limit mid-run; enumeration switched to
  sitemap/endpoint discovery, which worked better anyway.

## Output

- 116 raw rows → 112 unique after dedupe (email key).
- MX verification (`_os/automation/bin/mx-check.js`, DNS-only): 112/112 `mx_ok`.
- Delivered: private Drive sheet + private run artifact
  `franchise_pilot_list_2026-08-14.csv`. Wave 1 = first 50 rows
  (named owners first, then PA/NJ/DE).

## Not run (blocked lanes)

- Lane A (FDD/Item 20 owner-name cross-check): not run this pass.
- Lane C (franchisor-tier contacts): intentionally held until wave-1 data.
- Lane D (trade-press multi-unit owners): not run this pass.

---

## Scale run (same day, afternoon) — 5,359 MX-ok unique contacts

Operator ask: "way more emails… like a thousand." Same rules (public sources, no guessed addresses, no sends, no PII in repo). Subagents still unavailable (usage limit). Direct fetches again.

### Mechanism 1b — CertaPro all-profiles dump (supersedes the 93-zip sweep)

- `GET https://certapro.com/wp-json/certapro-location-profiles/v1/profiles` (plural namespace, discovered from `/wp-json/` index). One unauthenticated GET returns the full franchisee table: outlet, email, phone, city, state, website.
- 406 profiles, 399 with emails, **354 unique emails** after dedupe (multi-unit territories share a mailbox). Also `…/v1/bystate?state=PA` works (19 PA rows).
- Zip-by-zip sweep is obsolete for this brand.

### Mechanism 2b — UPS Store national Yext sitemap

- `locations.theupsstore.com/sitemap.xml` → 36 shards. Unique US store-detail URLs (`/{st}/{city}/{slug}`, skip `/es/` and `/search`): **4,922**.
- Fetched at concurrency 8: **4,914 unique store mailboxes**, 5 pages with no email, 3 404s (`&amp;` in sitemap slugs). All 50 US states. Role mailboxes (`store####@theupsstore.com`) printed in JSON-LD / mailto on each page.

### Mechanism 3 — Comfort Keepers offices API

- Locations HTML embeds `https://ckficms-api.ckweb.org/api/states?filter[include]=offices`. JSON:API dump: 52 states, **567 offices**, 58 unique emails published. Dropped gmail/msn/yahoo personal inboxes for send-quality → **54 kept**.

### Mechanism 4 — 1-800-PACKOUTS locations page

- `https://www.1800packouts.com/locations/` prints franchisee mailboxes in static HTML. **38 contacts, 31 named first.last@** (highest named-owner density of the run). Dropped corporate `info@`.

### Brand probe (68 locators) — dead ends worth not repeating

JS-shell / no static emails: 360 Painting, Five Star Painting, SERVPRO, Neighborly family (Molly Maid, Mr Rooter, Mr Electric, Aire Serv, Window Genie, Grounds Guys, Mister Sparky), Fish, Mathnasium, Visiting Angels (621 `/home` pages, 0 emails), Massage Envy Yext pages (no email in JSON-LD), HouseMaster, PostalAnnex store pages (345 URLs, 0 emails), PakMail. Yext sitemaps exist for Merry Maids / Two Men / ServiceMaster Restore / Stanley Steemer / Tropical Smoothie / Smoothie King but sample pages did not print emails — do not crawl those until a sample page shows a mailbox.

Paul Davis zip lookup is POST + auth-token on the franchise-code route; skipped.

### Output (scale)

- 5,360 merged unique emails → 1 concatenated-mailbox row dropped (`bad_syntax`) → **5,359 mx_ok** (DNS-only).
- Mix: UPS Store 4,914 · CertaPro 354 · Comfort Keepers 54 · 1-800-PACKOUTS 38.
- Named-owner heuristic: 46 (PACKOUTS 31 + CertaPro first.last). A couple of role mailboxes still match `first.last` (e.g. territory names); treat `Email Type=named_mailbox` as a sort key, not a legal identity.
- PA/NJ/DE: 429. Wave 1 = first 50. Send Batch A = first 1,000 by priority. Batch B = remainder 4,359.
- Delivered: Drive folder `Franchise Workshop Lists — 2026-08-14` (README, no contact rows in git) + private artifact `franchise_pilot_list_scale_2026-08-14.csv`.
