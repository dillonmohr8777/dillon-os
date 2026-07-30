# Fold-in: July content analytics → attribution-handoff

Approved: 2026-07-30
Target: `attribution-handoff/` on draft PR #11 (`align-hcm-august-2026-content`)
Use: paste into findings, methodology/access notes, open questions, and (aggregate only) the HTML report

---

## Correction to access narrative

Replace any “no traffic or click data” wording.

HubSpot content analytics is live (`get_content_analytics_report` granted; portal Pro/Enterprise). July 1–31:

- 2,031 page views
- 38 submissions
- 24 contacts
- 84.2% bounce
- 106s average time on page

The remaining HubSpot-adjacent gap that was overstated is **search data** (impressions, position, query terms) — that is Search Console, not HubSpot.

---

## Findings snippet (full analytical tone — for `01-findings.md`)

### Guide pages convert unevenly; form presence predicts conversion

July content analytics by page:

| Page | Views | Submissions | Bounce |
| --- | ---: | ---: | ---: |
| Home | 583 | 1 | 79% |
| Careers | 225 | 0 | 91% |
| Buyer’s Guide to Workday | 103 | 0 | 100% |
| Buyer’s Guide to UKG | 53 | 0 | 94% |
| Buyer’s Guide to Paylocity | 32 | 0 | 100% |
| Buyer’s Guide to Dayforce | 17 | 2 | 44% |

Workday holds ~336 seconds and converts nobody. Dayforce gets about one-sixth the traffic and is the only guide that converts; it is also the guide with `#align-guide-form`. Guides are being read; most lack a working conversion path.

Additional conversion concentration:

- `/contact` converts 12 of 30 views
- Rep meeting links account for 15 of 38 July submissions

Implication: shipping the Dayforce form block to Workday / UKG / Paylocity this week is higher leverage than new guide content or CRM latency experiments.

---

## HTML report tone (aggregate, positive)

Keep client-facing language aggregate. Suggested framing:

- July site engagement: 2,031 page views, 38 submissions, 24 contacts created
- Buyer’s guides are earning meaningful dwell time; next iteration standardizes the proven guide form path across the set
- Contact and meeting paths continue to contribute a large share of submissions

Do not put bounce percentages, “converts nobody,” or the Dayforce-only form gap into the HTML report unless Dillon asks for a diagnostic version.

---

## Open question #1 (rank above latency)

**Q: Does adding `#align-guide-form` (or the Dayforce-equivalent block) to Workday, UKG, and Paylocity buyer’s guides recover conversions on pages that already hold attention?**

Method:

1. Confirm Dayforce page is the reference implementation (`#align-guide-form` present, 2 submissions / 17 views in July).
2. Add the same block to Workday, UKG, Paylocity without changing guide body copy beyond form placement/CTA.
3. Measure 14 days post-publish: views, submissions, submission rate, bounce, avg time on page vs July baseline.
4. Compare Workday specifically (high dwell, zero submits) as the primary success case.

Definition of done:

- All three pages have a live, tested form path equivalent to Dayforce
- 14-day post metrics written back into `data/` (or a dated analytics addendum JSON)
- Decision recorded: keep standardized guide form as default template for future buyer’s guides, or iterate CTA/placement

Then keep response-latency vs conversion as open question #2.

---

## Access / methodology addendum (for `02-methodology.md` or access section)

Needs reauthorization (one reconnect):

1. LEAD object read — `REQUIRES_REAUTHORIZATION` (most important for a real leads report; stop proxying via contact lifecycle)
2. MARKETING_EMAIL read and write — email channel otherwise unmeasurable
3. CAMPAIGN write — read works
4. MARKETING_EVENT write — read works

Skip unless Solutions Partner client portals matter: PARTNER_CLIENT read.

Outside HubSpot:

- Search Console — impressions, clicks, CTR, position, authenticated generative export for AI citations
- Bing Webmaster Tools — one July organic lead was Bing

Campaign note: five campaigns exist; no spend/budget → no ROAS. HubSpot attribution reports score closed-won only; with one organic win, defer.

Codex must use its own HubSpot connection (MCP as Dillon, or preferably a private app). Grant: contacts/deals/companies/owners read; CMS blog/site/landing read; analytics/business-intelligence read; leads + marketing-email read after reauth. Pull exact scope strings from the private-app UI.
