---
tags: [raw, research, franchise, sourcing]
captured: 2026-08-15
method: live HTTP probes + official FTC/CFR pages; counts only
agent: cloud (growth-workshop-franchise-pilot branch)
expires_hint: compile into 12_Brain/06_Research/Franchise Email Sourcing
note_type: capture
status: unprocessed
created: 2026-08-15
updated: 2026-08-15
source_refs: []
---


# Raw receipts — franchise lanes A / C / D + radar flip, 2026-08-15

Method and portal status only. No franchisee names, emails, phones, or
addresses. Contact rows stay in the private Drive sheet and
`12_Brain/private/contacts/` (gitignored).

Lane B volume harvest already landed 2026-08-14 (720 MX-ok send-ready). This
pass fills the three lanes the Aug 14 run skipped, plus the radar-engine
targeting flip.

## Lane A — FDD / state registries (names ledger, not an email dump)

Official Item 20 fields ([16 CFR § 436.5(t)](https://www.law.cornell.edu/cfr/text/16/436.5),
[FTC Amended Franchise Rule FAQs](https://www.ftc.gov/business-guidance/resources/amended-franchise-rule-faqs)):

- Current franchisees: **name + outlet address + telephone**.
- Email is **not** a required current-franchisee field. It appears only as a
  substitute (home-based / not-yet-open outlet, or a former franchisee who
  asked to swap contact info).
- Do **not** guess a mailbox from an Item 20 name (no first-dot-last patterns).
  Use the name for LinkedIn / GBP owner DMs and to fill `Contact Name` on an
  existing Lane B row.

| Portal | Live URL probed 2026-08-15 | Result |
|---|---|---|
| Minnesota CARDS | https://www.cards.commerce.state.mn.us/ (legacy host `cards.web.commerce.state.mn.us`) | This environment got **HTTP 403** (bot wall). Operator browser: Area of Interest = Franchise Registrations, then franchisor name + year. Free public docs after the state accepts a filing ([MN Commerce filing tips](https://mn.gov/commerce-stat/pdfs/franchise-filing-instructions.pdf)). |
| California DFPI | https://docqnet.dfpi.ca.gov/ **200**. Search moved to https://dfpi.ca.gov/search (**200**, redirects to `/search-results/`). | [DFPI DOCQNET FAQ](https://dfpi.ca.gov/regulated-industries/self-service-portal-docqnet/self-service-docqnet-portal-frequently-asked-questions/): new filings go through FRANSES; copies of older franchise applications may need a Public Records Act request. Not a one-click email list. |
| Wisconsin DFI Franchise Search | https://dfi.wi.gov/apps/FranchiseSearch/MainSearch.aspx → **200** (apps.dfi.wi.gov). E-filing hub https://apps.dfi.wi.gov/apps/FranchiseEFiling/ **200**. | Search by legal/trade name; status + disclosure document when the franchisor is registered in WI. Easiest free FDD UI of the four. |
| Indiana Securities Portal | https://securities.sos.in.gov/general-information/franchise/ **200**. Portal home https://securities.sos.in.gov/ **200**. | Registration-type search (pick franchise, then franchisor name). FDDs are what franchisors file; public search is for those filings, not a harvested mailbox list. |
| Maryland OAG Securities | https://oag.maryland.gov/i-need-to/Pages/securities-division.aspx **200**. | Registration state, **no public FDD download search**. Status check is a phone call to the Securities Division (number is on that page). Skip for this pilot. |

Lane A yield this pass: **zero new emails** (correct). Use WI first, then MN/IN, then CA search/PRA, for owner-name enrichment on the existing 720. Do not recrawl Item 20 PDFs into git.

## Lane B — radar-engine flip (targeting, default grader unchanged)

`_os/automation/lib/discovery.js` still **drops** chains for the site grader.
New opt-in: `toCandidates(elements, { keepChains: 'service-franchise' })` and
`node _os/automation/bin/discover-prospects.js --market PHL --keep-chains service-franchise --dry-run`.

- Keeps Momentum ICP service franchises (CertaPro, SERVPRO, senior care, etc.).
- Still drops CVS / Wawa / hotels / banks.
- Default output for that flag is `12_Brain/private/contacts/` (gitignored).
  Tracked `--out` paths still run `sanitizeForGit`.
- An OSM hit is a **lead for Lane B / LinkedIn**, not a sendable row. UPS Store
  OSM nodes are in the allowlist for owner research only — do not email
  `store####@` counters.

`_os/automation/bin/radar-refresh.js` is unchanged (still exclude_chains).

## Lane C — directories and brand pages

Probed 2026-08-15 (HTTP only, no contact harvest):

| Source | URL | Result |
|---|---|---|
| IFA franchise opportunities | https://www.franchise.org/franchise-opportunities | **301** to trailing slash. Brand directory for targeting, not emails. |
| Entrepreneur Franchise 500 | https://www.entrepreneur.com/franchise500 | **200**. Ranked brand list; teaser without a subscription. Use to pick the next Lane B brands. |
| Franchise Times Top 400 | https://www.franchisetimes.com/top-400/ → **200** (`/top-400-2025/`) | Same: brand targeting, not mailboxes. |

Next-harvest rule (unchanged): pick a brand from those lists → probe **one**
location home **and** its contact-us page → only crawl if a literal franchisee
mailbox prints. Confirmed dead ends stay dead (Joint vendor mailbox, Lawn
Doctor REST 401, Neighborly JS shells, Christmas Decor / Fibrenew corporate-only).

Franchisor-tier (`franchising@` / `marketing@`) stays **held** until wave-1
send data. Different pitch (co-marketing), not the owner workshop invite.
PA/NJ-headquartered brands first when that pass opens.

LinkedIn (free, no Sales Nav): `"{brand}" "{city}" (owner OR franchisee OR "multi-unit")` then open the company page and the person's About. Message only people who show as the operator. Query pattern only — no scraped profiles in git.

## Lane D — verification + compliance

- MX: `node _os/automation/bin/mx-check.js <csv> --email-col Email` — DNS only, never SMTP. Send-ready file is **720/720 `mx_ok`**.
- MX-ok ≠ owner. Role mailboxes and store counters accept mail and still waste the send.
- CAN-SPAM applies to B2B commercial email ([FTC CAN-SPAM compliance guide](https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business)): truthful From/headers, non-deceptive subject, valid physical postal address, clear opt-out, honor within 10 business days, keep the mechanism working 30 days. This environment got HTTP 403 on the FTC URL (bot wall); the official page is the source of record.
- Wave 1 = 50 named, 25–40/day from one real mailbox after SPF/DKIM. Gate #1 before the other 670.
- Three-touch cap. Do not calendar-invite the cold list.
- Suppression: bounce / "no thanks" / unsubscribe → `Outreach Status = suppressed` the same day.
- PII: Drive + `12_Brain/private/contacts/` only. Public-safety test must stay green.

## Output (counts only)

- New emails this pass: **0** (Lane A/C/D are not email dumps).
- Send-ready still **720** unique MX-ok (Wave 1 = 50). Local gitignored copies written 2026-08-15.
- Drive 720 sheet still live (Google login wall, expected for a private sheet).
