---
tags: [research, franchise, sourcing, outreach]
created: 2026-08-14
expires: 2026-11-14
source: "[[12_Brain/raw/research/2026-08-14 Franchise Email Sourcing Receipts]]"
---

# Franchise Email Sourcing

One-line summary: brand locator dumps and static Yext store pages produced
**5,359 MX-ok franchise contacts at $0** on 2026-08-14; most other locators
are JS shells and are not worth crawling.

Method and rules live in
[[02_Campaigns/Growth Workshop/Franchise Email Sourcing Playbook|the campaign playbook]].
Contact rows live in the private Drive folder / artifact, never here.

## Verified (receipts in source file)

| Mechanism | Unique emails | Notes |
|---|---|---|
| CertaPro `GET /wp-json/certapro-location-profiles/v1/profiles` | 354 | Full dump; zip-by-zip sweep is obsolete |
| UPS Store Yext sitemap → store pages | 4,914 | National, all 50 states, role mailboxes |
| Comfort Keepers `ckficms-api.ckweb.org/api/states?filter[include]=offices` | 54 | 567 offices, most share/omit email |
| 1-800-PACKOUTS `/locations/` HTML | 38 | 31 named first.last@ |
| **Total unique, MX-ok** | **5,359** | 46 named-heuristic, 429 PA/NJ/DE |

MX pass rate 5,359 / 5,360 (one concatenated-mailbox row dropped). Brand-published corporate domains remain effectively always-deliverable.

## Lessons

- **Look for the dump endpoint before crawling.** CertaPro's plural `…-profiles/v1/profiles` and Comfort Keepers' JSON:API include beat thousands of zip GETs. Check `/wp-json/` namespaces and fat locator HTML for embedded `api.` hosts.
- **Yext sitemaps are not enough.** UPS Store pages print `email` in JSON-LD. Massage Envy / Merry Maids / Two Men sitemaps exist but sample pages had no mailbox — probe one page before a national crawl.
- **Static HTML is still the filter.** Neighborly, 360/Five Star Painting, SERVPRO, Visiting Angels (621 location homes), PostalAnnex store pages: large sitemaps, zero harvestable emails.
- **Named-owner density is brand-specific.** PACKOUTS locations page is ~80% named; UPS Store is ~0% named (store####@); CertaPro is a mix. Sort by `Email Type`, don't trust the heuristic as identity.
- **Sister brands do not always share a GET dump.** Paul Davis (FirstService sibling) zip lookup is POST / token-gated. Don't assume CertaPro's route exists next door.

## Open (next passes)

- Lane A: FDD Item 20 owner-name enrichment on the 4,914 UPS rows.
- Yext brands whose *sample page* shows an email (none of the afternoon probes did).
- Lane C franchisor-tier after send data.
- Lane D trade-press multi-unit names.
