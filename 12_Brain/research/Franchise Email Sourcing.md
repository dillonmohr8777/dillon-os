---
tags: [research, franchise, sourcing, outreach]
created: 2026-08-14
expires: 2026-11-14
source: "[[12_Brain/raw/research/2026-08-14 Franchise Send-Ready Harvest]]"
---

# Franchise Email Sourcing

One-line summary: the send list is **720 MX-ok franchisee/office mailboxes**
(not the 4,914 UPS Store front-desk inboxes). Evening harvest added Synergy
HomeCare + Mosquito Squad on top of CertaPro / PACKOUTS / Comfort Keepers.

Method: [[02_Campaigns/Growth Workshop/Franchise Email Sourcing Playbook]].
Contact rows: private Drive / artifact only.

Afternoon receipts: [[12_Brain/raw/research/2026-08-14 Franchise Email Sourcing Receipts]].
Evening receipts: [[12_Brain/raw/research/2026-08-14 Franchise Send-Ready Harvest]].

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

## Open (next passes)

- Lane A: FDD Item 20 owner-name enrichment for LinkedIn/GBP DMs (still almost never emails).
- Lane C franchisor-tier after send data.
- Lane D trade-press multi-unit names with a literal public email.
