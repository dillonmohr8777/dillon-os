---
tags: [raw, research, franchise, sourcing]
captured: 2026-08-14
method: direct fetches (curl/node), GET-only, throttled 300-400ms
agent: cloud (growth-workshop-franchise-pilot branch)
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
