---
note_type: capture
status: unprocessed
created: 2026-09-14
updated: 2026-09-14
captured_at: "2026-09-14T18:33:00Z"
source_type: api_pulls_and_live_checks
source_url: ""
source_author: Claude (local session, empeon-audit lane)
verification_status: verified
related_entities: "Align HCM, Empeon, Composio, Google Cloud project 150963436905"
source_refs:
  - "[[12_Brain/01_Captures/2026-09-14 - Empeon keyword map and Align Google evidence]]"
  - "[[12_Brain/01_Captures/2026-09-14 - Empeon audit text and live evidence]]"
  - "System/google-access-expansion/ACCESS-LEDGER-2026-09-14.md"
  - "12_Brain/01_Captures/Reports/2026-09/align-hcm/snapshot-2026-09-14/MANIFEST.json"
tags: [capture, align-hcm, empeon, search-console, ga4, google-access, gap-table]
---

# Align Search Console and GA4 direct snapshot, gap table, and the Google access answer (14 September 2026)

Local continuation of the cloud "Claude Full Access" session that built the Empeon sales
addendum (`origin/claude/sales-pitch-planning-cgitew`). Immutable receipt. Compile from it.

## A. What this audit is for

Empeon is a healthcare HCM/payroll vendor and a **prospective employer**; Dillon is
interviewing for a marketing role (next contact Jonathan Nack, VP Sales). Align HCM is the
**former employer** (ended 2026-09-02) and appears only as the evidence source behind the
addendum's pages D–E. This is job-pursuit collateral, not client work and not an Align
closeout. Nothing is owed to Align. The 2026-09-14 call brief already carries the open
question: whether the Align appendix "leaves the building" with the addendum. That decision
is Dillon's; the data below stays inside the vault until he makes it.

## B. The access answer

- **Composio is live for Search Console and GA4.** `COMPOSIO_MANAGE_CONNECTIONS list` at
  18:20 UTC: google_search_console, google_analytics and googleads all `active`. A live
  read-only `GET_SITE` on `https://www.alignhcm.com/` through account
  `google_search_console_mooner-urban` returned `siteOwner`; `LIST_SITEMAPS` and a totals
  query returned data; `LIST_ACCOUNT_SUMMARIES` on the GA4 connection returned the
  "Align HCM" account with property 320235048. The vault's "Composio is dead" is true of
  **Google Ads entitlement only** (Explorer access attaches to Cloud project 150963436905,
  which Composio's OAuth client does not use). It was never a Search Console or GA4 fact.
- **Composio is not needed.** The gcloud Application Default Credential on this machine
  (created 2026-09-12 23:55, `%APPDATA%/gcloud/application_default_credentials.json`,
  client under project 150963436905, account dillonmohr8777@gmail.com) refreshes and carries
  seven scopes: adwords, analytics.readonly, webmasters.readonly, tagmanager.readonly,
  cloud-platform, youtube.readonly, yt-analytics.readonly. Live direct reads today:
  Search Console 11 sites including alignhcm.com as siteOwner; GA4 Admin 11 accounts
  including Align HCM / properties/320235048; GTM 3 accounts (Nexla, BigOrange, Puttery).
- **All four APIs are already enabled** on `momentum-360-489301` (project number
  150963436905): `searchconsole`, `analyticsadmin`, `analyticsdata`, `tagmanager`, plus
  `googleads`. Verified with `gcloud services list --enabled` (gcloud is authenticated as
  dillonmohr8777@gmail.com, project set). The 2026-09-12 closeout's "gcloud is
  unauthenticated" is superseded.
- **What Dillon has to click: nothing, for reads.** The Ads probe folder now also has a
  read-only `authorize.py` default (adwords + webmasters.readonly + analytics.readonly +
  tagmanager.readonly, `--gtm-publish` opt-in) and `google_probe.py --adc` as the check.
  The two things still on him are unchanged from 2026-09-13: OAuth brand verification
  (DNS TXT at SiteGround) and the GTM publish grant for Nexla.
- The Ads probe's `google-ads.yaml` token carries the adwords scope only and cannot reach
  Search Console or GA4 (403 `ACCESS_TOKEN_SCOPE_INSUFFICIENT` on all four endpoints).
  That is why the cloud session had no direct path and fell back to Composio.

## C. The snapshot, pulled direct

Script: `_os/automation/google-ads-api/pull_align_snapshot.py` (read-only, ADC, prints no
secret values). Output: `12_Brain/01_Captures/Reports/2026-09/align-hcm/snapshot-2026-09-14/`.
Window 2026-01-01 to 2026-09-11 (Search Console final data lags three days).
Pulled 2026-09-14T18:32:47Z.

| File | Rows | Bytes |
|---|---:|---:|
| gsc-query.json | 3,316 | 864,289 |
| gsc-query+page.json | 4,296 | 1,364,573 |
| gsc-date+page.json | 4,873 | 930,555 |
| gsc-page.json | 188 | 34,355 |
| gsc-country.json | 162 | 17,701 |
| gsc-date.json | 47 | 6,676 |
| gsc-device.json | 3 | 421 |
| gsc-sitemaps.json | 1 | 468 |
| gsc-totals.json | 1 | 114 |
| ga4-date+channel.json | 177 | 25,008 |
| ga4-landing+channel.json | 123 | 23,433 |
| ga4-source+medium.json | 21 | 3,075 |
| ga4-events.json | 13 | 774 |
| gap-table.csv | 254 days | 7,362 |

Per-file SHA-256 in `MANIFEST.json`. Bundle hash over the sorted per-file hashes:
`42f3015ddc4af57a9248d3a7406b314c33bc299b20dc2076f3a1326ee3b3b0d4` (`MANIFEST.sha256`).

**No compressed export, recorded SHA-256, ledger script or gap table from the cloud session
exists anywhere reachable** — not in `origin/claude/sales-pitch-planning-cgitew`, not in any
branch of `client-operations-canonical` or `align-hcm-lead-intelligence`, not in the dated
Codex folders (two exhaustive searches). So there was nothing to reassemble or to verify a
hash against; the dataset was re-pulled from source instead. The only `.b64` chunk set is the
older 2026-08-30 Empeon audit package under `projects/job-search-2026`.

## D. Cross-check against the cloud session's captured figures

Every number the cloud session recorded from Composio reproduces exactly from the direct pull:

| Figure | Cloud capture (Composio) | Direct pull (ADC) |
|---|---|---|
| Search Console 27 Jul–11 Sep, web, all countries | 552 clicks, 92,972 impressions | 552 clicks, 92,972 impressions |
| Property history begins | 27 Jul 2026 | first day with rows 2026-07-27 |
| Sitemap | 124 web submitted, 0 indexed; 1,353 image, 0 indexed; last downloaded 2026-09-07 | identical |
| Brand queries | align hcm 190/319; align hcm careers 38/47; alignhcm 32/51 | identical |
| GA4 Aug 2026 by channel | Direct 225, Organic 196, Referral 34, Social 19, Unassigned 11, AI Assistant 5 | identical |
| GA4 Sep 1–11 by channel | Organic 67, Direct 47, Referral 4, Unassigned 4, Email 2, AI Assistant 1 | identical |
| GA4 Feb / Jun | Referral 1 / Direct 1 | identical |

The sitemap "indexed: 0" is the API's known behaviour for that field since 2022, not
evidence that zero pages are indexed; Search Console records impressions on 188 pages.

## E. What the gap table shows

`gap-table.csv`, one row per day 2026-01-01 to 2026-09-11, status per day:

| Status | Days |
|---|---:|
| both present (ok) | 42 |
| gsc_only | 5 |
| ga4_only | 17 |
| both_missing | 190 |
| total | 254 |

- **Search Console has 47 days of history, all from 2026-07-27 onward.** Nothing before
  that: the property was added 27–28 July 2026 (sitemap first submitted 2026-07-28). Any
  claim about Align organic search before late July cannot come from Search Console.
- **GA4 has 59 days with any session, first 2026-01-01**, then near-silence from February
  to June (one referral session in Feb, one direct in Jun), and real data only from
  late July. Tracking was effectively absent for five months.
- **The five gsc_only days** are 27, 28 and 29 July (Search Console live before the GA4
  tag recorded anything) plus 15 August and 5 September, two mid-run days on which GA4
  logged zero sessions while Search Console still saw clicks. The **17 ga4_only days** are
  15 days in January 2026 plus single sessions on 23 February and 22 June, all before
  Search Console existed.
- Consequence for the addendum: pages D–E can honestly speak to **27 July – 11 September
  2026 only**. The HubSpot ledger's credit window (from 26 January) has no Google-side
  counterpart for its first six months; the Weissman journey (Feb 2026) rests on HubSpot
  source fields, not on Search Console or GA4 rows, exactly as the call brief already says.

## F. Boundaries kept

Read-only API calls only. Nothing sent, published, deployed or emailed. No spend. No
credential value read, printed, copied or written; scopes were checked via tokeninfo and
reported as scope names only. `01_Clients/Align HCM.md` and the client-operations registry
still mark Align `active` against the 2026-09-02 end; left untouched, flagged.
