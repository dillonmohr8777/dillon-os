---
tags: [raw, research, franchise, sourcing]
captured: 2026-08-14
method: GET-only locator crawls + merge of the earlier scale CSV; MX DNS-only
agent: cloud (growth-workshop-franchise-pilot branch)
note_type: capture
status: unprocessed
created: 2026-08-14
updated: 2026-08-14
source_refs: []
---


# Raw receipts — send-ready franchise harvest, 2026-08-14 evening

Operator ask: the 5,359-row file is not a send list; UPS `store####@` inboxes are not owners. Find emails a human can actually send the workshop to. Contact rows are NOT here — private Drive + artifact only.

## What a UPS Store location inbox is (plain English)

Yext store pages print `store####@theupsstore.com`. That mailbox is the **front desk / shipping counter**. Customers use it for packages. The franchise owner almost never sits there. MX-ok means the domain accepts mail, not that an owner will read it.

## New mechanisms that printed franchisee mailboxes

### Synergy HomeCare location pages

- `https://synergyhomecare.com/location-sitemap.xml` → 306 location homes (`/{st}-{city}-{zip}/`).
- 301 fetched (5 persistent 404s). **161 pages printed an email → 152 unique.**
- Mix: concatenated person locals, territory codes, a few franchisee-owned domains.
- 140 location URLs are service-area satellites with no mailbox (contact subpages also empty). Do not treat those as missing owners — they are extra geo pages.

### Mosquito Squad contact-us pages

- National sitemap → **158** territory homes. `/{territory}/contact-us/` prints a mailbox on **145** pages.
- **123 unique** after dropping vendor domains (`in.getslingshot.com`, affiliate-tech).
- Locals are mostly territory slugs on `mosquitosquad.com` plus a handful of franchisee-owned domains and 6 personal inboxes published on the page.

## Merge (drop UPS)

From the afternoon scale CSV, kept CertaPro 354 + Comfort Keepers 53 + PACKOUTS 38. Dropped **4,914** UPS Store rows. Added Synergy + Mosquito Squad.

**Send-ready: 720 unique, 720/720 mx_ok.** Named-style (first.last / Synergy person-local / published personal): **123**. Wave 1 = 50 of those. PA/NJ/DE = 56 (10 named).

| Brand | Send-ready rows | Named-style |
|---|---|---|
| CertaPro Painters | 354 | 15 |
| Synergy HomeCare | 152 | 68 |
| Mosquito Squad | 123 | 10 |
| Comfort Keepers | 53 | 0 |
| 1-800-PACKOUTS | 38 | 30 |

## Still dead (re-probed, do not crawl)

Joint clinic/city pages are dominated by a vendor domain, not owners. Lawn Doctor REST dumps are 401. Christmas Decor / Fibrenew print one corporate mailbox on every page. Neighborly family, ShelfGenie, Precision Door, Always Best Care, Griswold, Homewatch: JS shells or no mailbox. FDD Item 20 still names/phones, not emails — do not guess.

## Output

- Artifact: `franchise_send_ready_2026-08-14.csv` (no UPS rows).
- Drive folder "Franchise Workshop Lists — 2026-08-14".
- No contact rows in git.
