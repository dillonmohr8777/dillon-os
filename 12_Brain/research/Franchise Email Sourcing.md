---
tags: [research, franchise, sourcing, outreach]
created: 2026-08-14
expires: 2026-11-14
source: "[[12_Brain/raw/research/2026-08-14 Franchise Email Sourcing Receipts]]"
---

# Franchise Email Sourcing

One-line summary: free, legitimate franchise owner/operator emails come from brand
location infrastructure — two mechanisms verified 2026-08-14 produced 112
MX-clean contacts at $0; most brand locators are JS shells and yield nothing.

Method and rules live in
[[02_Campaigns/Growth Workshop/Franchise Email Sourcing Playbook|the campaign playbook]];
this page is what we now *know*. Contact rows live in the private Drive sheet, never here.

## Verified (receipts in source file)

1. **CertaPro Painters — zip-profile REST endpoint.** The brand's own locator
   exposes `GET certapro.com/wp-json/certapro-location-profile/v1/profile?zip={zip}`
   returning outlet, phone, territory email, subdomain, state. 93-zip sweep →
   **73 unique territories with emails** (25 PA/NJ/DE, 3 named owners). This is
   the single highest-yield free franchise-email mechanism found so far.
2. **The UPS Store — Yext location pages.** Static store pages print
   `store####@theupsstore.com`. 13 city indexes (Philly metro + NJ + DE) →
   **43 stores with emails**, all PA/NJ/DE, role mailboxes.
3. **MX pass rate 112/112** — brand-published mailboxes are effectively
   always-deliverable domains (corporate mail infrastructure), unlike scraped
   small-business domains.

## Lessons

- **The locator API beats the location page.** When a franchise site has a
  "find a location" box, its underlying endpoint (WP REST/Yext/Odoo) often
  returns structured contact data in one GET per zip — check page JS for
  `wp-json` routes before crawling HTML.
- **Static HTML is the filter.** Yext-generated location subdomains
  (`locations.{brand}.com`) are reliably static; React/Vue locators
  (Mathnasium, Fish, Minuteman, senior-care brands) render client-side and
  yield nothing to plain fetches. Probe one page per brand before committing.
- **Named-owner emails are rare on-page** (~4% of this harvest). The FDD Item 20
  lane (not yet run) is still the path to owner *names* at scale; location
  mailboxes are the path to volume.
- **Sister brands share plumbing.** CertaPro's FirstService sibling Paul Davis
  runs equivalent zip endpoints (POST-only). Franchise families = repeatable
  mechanisms; check siblings whenever one brand works.

## Open (next passes)

- Lane A: MN CARDS / CA DocQNet FDD pulls for owner-name enrichment of the
  CertaPro/UPS rows.
- Lane C: franchisor-tier (`franchising@`/`marketing@`) — held until wave-1
  send data by design.
- Lane D: 1851franchise.com / Franchise Times multi-unit owner names.
- More Yext-pattern brands (probe `locations.{brand}.com` for other ICP chains).
