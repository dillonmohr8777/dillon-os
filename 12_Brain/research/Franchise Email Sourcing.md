---
tags: [research, franchise, sourcing, outreach]
created: 2026-08-14
updated: 2026-08-15
expires: 2026-11-15
source: "[[12_Brain/raw/research/2026-08-14 Franchise Send-Ready Harvest]]"
---

# Franchise Email Sourcing

One-line summary: the send list is **720 MX-ok franchisee/office mailboxes**
(not the 4,914 UPS Store front-desk inboxes). Evening harvest added Synergy
HomeCare + Mosquito Squad on top of CertaPro / PACKOUTS / Comfort Keepers.
2026-08-15 filled Lanes A/C/D (no new emails) and flipped OSM discovery into
an opt-in franchise targeting mode.

Method: [[02_Campaigns/Growth Workshop/Franchise Email Sourcing Playbook]].
Contact rows: private Drive / `12_Brain/private/contacts/` only.

Afternoon receipts: [[12_Brain/raw/research/2026-08-14 Franchise Email Sourcing Receipts]].
Evening receipts: [[12_Brain/raw/research/2026-08-14 Franchise Send-Ready Harvest]].
Lane A/C/D + radar flip: [[12_Brain/raw/research/2026-08-15 Franchise Lanes A-C-D Receipts]].

## Send-ready (what to email)

| Mechanism | Unique emails | Notes |
|---|---|---|
| CertaPro `GET /wp-json/certapro-location-profiles/v1/profiles` | 354 | Franchisee territory mailbox |
| Synergy HomeCare location pages (`location-sitemap.xml`) | 152 | Printed on the location home |
| Mosquito Squad `/{territory}/contact-us/` | 123 | Franchisee territory mailbox |
| Comfort Keepers offices API | 53 | Office mailbox |
| 1-800-PACKOUTS `/locations/` HTML | 38 | 30 named first.last |
| **Send-ready, MX-ok** | **720** | 123 named-style · 56 PA/NJ/DE |

UPS Store Yext pages still exist (**4,914** `store####@` front-desk boxes). They are a LinkedIn/GBP research pool, not a send list. MX-ok ≠ owner.

## Lessons

- **A store counter inbox is not an owner.** UPS `store####@` is for shipping customers. Do not blast it.
- **Look for the dump endpoint before crawling.** CertaPro's plural profiles dump and Comfort Keepers' JSON:API include beat zip GETs.
- **When there is no dump, probe one location page, then the contact subpage.** Mosquito Squad homes have no email; `contact-us` does. Synergy homes often do.
- **Yext / Neighborly locators are usually JS shells.** Joint clinic pages print a vendor domain. Lawn Doctor REST dumps are 401. Probe one page before a national crawl.
- **Named-owner density is brand-specific.** PACKOUTS is mostly first.last. CertaPro/MSQ are territory mailboxes (still the franchisee's business email). Sort by `Email Type`.

## Lanes A / C / D (2026-08-15)

- **Lane A:** Item 20 is names + phones ([16 CFR § 436.5(t)](https://www.law.cornell.edu/cfr/text/16/436.5)). WI DFI search is the easiest free FDD UI. MN CARDS is bot-walled from agents. CA search moved to dfpi.ca.gov/search. MD has no public FDD download. Zero new emails (correct).
- **Lane B flip:** `discover-prospects.js --keep-chains service-franchise` keeps ICP franchises and still drops CVS. Default grader unchanged. OSM hit ≠ sendable email.
- **Lane C:** IFA / Entrepreneur 500 / Franchise Times 400 are brand pickers. Franchisor-tier still held.
- **Lane D:** CAN-SPAM applies to B2B ([FTC guide](https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business)). Cold footer needs a commercial-message line plus a real postal address, not opt-out alone. Hold Canada / `.ca` rows. MX DNS-only. 25–40/day. Three-touch cap. No cold-list calendar invites.

## Open (next passes)

- Lane A owner-name enrichment on the existing 720 (WI first) for LinkedIn/GBP DMs.
- Lane C franchisor-tier after wave-1 send data.
- Lane D trade-press multi-unit names only when a literal public email is on the page.
