# Align HCM — reporting stack Edge audit

Updated: 2026-07-30
Authority: browser Edge pass on HubSpot portal 242825734 + LinkedIn Page + production site. Google stack blocked (no live session). This file is the handoff the Edge session could not write to disk.

## Identity proof

| Surface | Exact account | Role / proof |
|---------|---------------|--------------|
| HubSpot | Portal **242825734**, account name "Align HCM", company domain alignhcm.com | Signed in as **Dillon Mohr** (Align work identity), **Super Admin**. Portal 50612503 never touched. |
| LinkedIn | Align HCM Page, company ID **64272837** | Signed in as **Maher El-Abdallah**, Page admin. |
| Google (GA4 / GSC / Cloud) | Account chooser only | Both listed personal Gmail identities show **Signed out**. Neither is an `@alignhcm.com` identity. Password entry + ambiguous ownership → **hard stop**. |

## HARD STOP — Google stack has no session

`analytics.google.com`, `search.google.com/search-console`, and `console.cloud.google.com` all bounce to the same account chooser (two personal Gmail rows, both signed out / Use another account / Remove an account). GA4 sections that require the UI were not executed inside GA4. Workaround: verify GA4 from the production site (largest findings of the run).

## Audit table

| Platform | Exact account/property | Setting or permission | Previous state | Final state | Evidence | Remaining blocker | Exact access Dillon must grant |
|---|---|---|---|---|---|---|---|
| HubSpot | Portal 242825734 | Portal identity | — | Verified Align HCM | Account Defaults: name "Align HCM", domain alignhcm.com | None | — |
| HubSpot | Dillon Mohr | User permissions | — | Super Admin, all areas granted | Users & Teams row: Super Admin | None | — |
| HubSpot | UKG Sales Pipeline (id `default`) | Stage "Expressing Interest" probability | **Lost (0%) — closed-lost** | **10% — open** | "Success. Your pipeline was updated."; board now shows 26 deals / $4.5M / **$398,259 weighted (10%)** | None | — |
| HubSpot | Dayforce Sales Pipeline (1497621179) | Same stage | Lost (0%) | 10% | Save confirmed; board 7 deals / $3.1M / $306,300 weighted | None | — |
| HubSpot | Paylocity Sales Pipeline (1534968521) | Same stage | Lost (0%) | 10% | Reloaded page shows 10%, 2 deals | None | — |
| HubSpot | Channel Pipeline (2314068682) | Stage "Referral Received" | Lost (0%) | 10% | Save confirmed; 0 deals affected | None | — |
| HubSpot | Test Pipeline (1254922983) | Stage metadata | 20/40/60/80/90/Won/Lost | Unchanged | Inspected only | None | — |
| HubSpot | Portal-wide tracking | Page clicks (CTA/click event collection) | OFF | **ON** | Reloaded Advanced Tracking shows ON | None | — |
| HubSpot | alignhcm.com | Tracking code install | Validated | Validated | Validation log: `https://www.alignhcm.com` — Validated Jul 28 2026 | None | — |
| HubSpot | Advanced tracking | Cross-domain linking / bot filter / SMS bot filter / intent | ON | ON (unchanged) | Settings page | None | — |
| HubSpot | Advanced tracking | Internal IP exclusion list | ~30 IPs populated | Unchanged | Exclude Traffic field | None | — |
| HubSpot | Contact properties | "Align attribution" group | 33 fields (UTM/referrer/landing/channel/clickIDs/conversion) | Unchanged, preserved | Property list, all created by Dillon Mohr | Fill rates 0–0.25% | — |
| HubSpot | Contact properties | `align_ai_referral_engine` | Missing | **Created** (text) | Properties 307→312, group Align attribution | Nothing populates it yet | — |
| HubSpot | Contact properties | `align_attribution_confidence` | Missing | **Created** (dropdown: Direct / Deterministic / Unresolved) | Property list | Same | — |
| HubSpot | Contact properties | `align_attribution_evidence` | Missing | **Created** (multi-line) | Property list | Same | — |
| HubSpot | Contact properties | `align_hubspot_visitor_id` | Missing | **Created** (text) | Property list | Same | — |
| HubSpot | Contact properties | `align_revenue_attribution_status` | Missing | **Created** (dropdown: Unattributed / Pipeline / Closed-won) | Property list | Same | — |
| HubSpot | Contact properties | First/latest conversion timestamps | Native `First Conversion Date` / `Recent Conversion Date` exist, 4.75% fill | Reused, no duplicate created | Property search "conversion" | — | — |
| HubSpot | Native Original Source | Original Source + drill-downs | Intact | Intact, never written | No property edits to native source | — | — |
| HubSpot | Sources report | AI-assisted search classification | Native "AI Referrals" channel exists | Verified receiving data | Live report: **AI Referrals 291 sessions YTD, 3 contacts, 1.03% conv; 25 sessions last 30d at 8% session→contact** | None | — |
| HubSpot | Sources report | July (last 30d) sessions | — | Verified live | Direct 621 / Organic search 515 / Referrals 218 / Organic social 97 / AI Referrals 25 / Other campaigns 4 / Email 1 — total 1,481 | None | — |
| HubSpot | Sources report | YTD 2026 | — | Verified live | Sessions 10,747; new contacts 2,333 of which **Offline sources 2,170 (93%)** | Offline gap is real | — |
| HubSpot | Deals | Closed-won revenue + open pipeline | — | Verified live | UKG: Closed Won 753 deals **$53.6M**; open ≈ **$14.6M** ($4.77M weighted) | None | — |
| HubSpot | Google Search Console app | Integration | **Not installed** | Still not installed | SEO → SEO Analytics shows "Integrate Google Search Console… Get started"; marketplace listing shows **Install** | Needs Google OAuth + consent | Sign into the Align Google account, then approve the GSC app install |
| HubSpot | Social → LinkedIn | Align HCM Company Page @alignhcm | Active | Active, unchanged | Social settings; analytics returning data | None | — |
| HubSpot | Social → LinkedIn | Read-only analytics options | No per-metric toggles exist | Nothing to enable; all available metrics already reporting | Social Analyze Jul 1–30: audience 11,255 (Page 7,473 + Profile 3,782), 12 posts, 196 interactions; top Page post 1,833 impressions, 2 shares | Impressions/shares N/A for non-HubSpot-published posts | — |
| HubSpot | Social → LinkedIn | Maher El-Abdallah personal profile | Connected, Active | Unchanged | Profile posts show **IMPRESSIONS N/A, SHARES N/A** while Page posts show real numbers | Platform limit | — |
| LinkedIn | Align HCM Page, company 64272837 | Native Page analytics | — | Verified live | 7,477 followers; last 7d: 2,347 search appearances, 9 new followers, 2,551 post impressions, 122 page visitors. Content 6/30–7/29: **5,477 impressions, 129 reactions, 10 comments, 1 repost, 100% organic** | HubSpot under-reports (5,477 native vs 1,833 in HubSpot) | — |
| LinkedIn | Align HCM Page | Native export | Available | Not exported (no download without approval) | Analytics → Content/Visitors/Followers/Search appearances → **Export** | Needs OK to download | Approve the XLSX download if wanted |
| HubSpot | Social → X | Align HCM @AlignHcm | **Expired** | Left expired (did not disconnect) | Social settings: "Expired / Reconnect" | OAuth re-grant | Approve reconnecting X, or confirm drop |
| HubSpot | Connected app 16228553 "HubSpot connector for Claude" | 17 scopes pending re-auth | Pending | Left pending | App page: "Available after Re-authentication (17)" | Scope expansion incl. write scopes | Decision B below |
| **alignhcm.com** | gtag on production | **GA4 stream G-0Y6LQTTBRJ** | Assumed unverified | **Confirmed live and collecting** | Network: `POST google-analytics.com/g/collect?...tid=G-0Y6LQTTBRJ...en=page_view` from www.alignhcm.com | GA4 UI unreachable | Google sign-in |
| **alignhcm.com** | gtag on production | **Duplicate G-0Y6LQTTBRJ config** | Firing **twice per pageview** | Diagnosed, not changed | dataLayer contains `config G-0Y6LQTTBRJ` twice; two `page_view` hits (`_s=1` and `_s=2`) on one load; `template_align-attribution.min.js` loaded **twice** | Requires site code edit | Dev removes one include (script sits both inside and immediately after the `align-attribution-global-footer` block) |
| **alignhcm.com** | HubSpot GA4 integration field | Measurement ID | **`G-320235048`** — invalid, not a GA4 ID | Left as-is, changes cancelled | Settings → Pages → Integrations shows `G-320235048`; actively sending `page_view` + `user_engagement` to a non-existent property | Needs call | Decision A below |
| alignhcm.com | Consent Mode | Consent Mode v2 | Implemented | Unchanged | dataLayer `consent default` all denied → `consent update` all granted | None | — |
| alignhcm.com | Global CTA form | Attribution capture on submit | Posts only name/email/phone/company/service_interest/message + hutk to form `e733d928-0f1d-4b41-853b-df1e0096f330` | Unchanged | Site footer HTML source | **Why Align attribution fields sit at ~0% fill** | Dev adds the align_* fields to the form payload |
| HubSpot | Attribution reporting | Revenue/contact attribution reports | Locked | Locked | Reporting → Marketing → "Attribution reporting", "Clicks over time", "Clicks by page" show upgrade badges | Subscription tier | Marketing Hub Enterprise |
| HubSpot | Workflows | Deterministic attribution workflows | None exist | **Not built** | 37 workflows, none attribution-related | Blocked on two site-code fixes | Approve form + duplicate-script fixes first |
| HubSpot | ~2,175 offline contacts | Bulk reclassification | 2,170 YTD offline | **Untouched** | No deterministic evidence exists yet | By design | — |
| HubSpot | SEO tool | alignhcm.com crawl | Last scanned Jan 20 2026 | **Rescan running** | "Scan of alignhcm.com in progress…" | Results in ~3–6h | — |

## Buckets

### 1. Successfully activated

- Expressing Interest corrected from closed-lost to 10% open in UKG, Dayforce, and Paylocity.
- Referral Received corrected in Channel Pipeline.
- HubSpot page-click / CTA event collection turned **ON**.
- Five missing normalized attribution fields created in the existing Align attribution group: `align_ai_referral_engine`, `align_attribution_confidence`, `align_attribution_evidence`, `align_hubspot_visitor_id`, `align_revenue_attribution_status`.
- SEO rescan of alignhcm.com kicked off.

### 2. Already configured and verified

- GA4 stream **G-0Y6LQTTBRJ** is live and collecting from www.alignhcm.com.
- HubSpot tracking code validated; cross-domain linking, bot filtering, intent data, internal-IP exclusions on.
- Consent Mode v2 present.
- 33 existing Align attribution fields intact; native Original Source untouched.
- LinkedIn Company Page connected and reporting.
- HubSpot native **AI Referrals** channel receiving data: 291 sessions YTD @ 1.03% conv; 25 sessions last 30d @ **8%** session→contact (best rate of any channel).
- July / YTD source reporting, UKG closed-won (**$53.6M** / 753 deals) and open pipeline (~**$14.6M**, $4.77M weighted) reconcile in live reports.

### 3. Requires Dillon for MFA or consent

Everything Google: GA4 enhanced measurement, 14-month retention, internal-traffic filters, unwanted referrals, Signals, Search Console link, seven custom dimensions, `generate_lead` key-event promotion, attribution settings/channel groups, BigQuery link, GA4 Data API and Search Console API enablement. Also: HubSpot GSC app install, X reconnect, LinkedIn CSV download, Claude connector re-auth.

### 4. Requires higher subscription or admin permission

HubSpot Attribution reporting, Clicks over time, and Clicks by page — Marketing Hub Enterprise.

### 5. Requires billing approval

Nothing hit a billing screen (Google Cloud never reached). BigQuery export remains unassessed.

### 6. Platform limitation not solvable through HubSpot

- LinkedIn personal-profile analytics: Maher's posts return N/A for impressions/shares in HubSpot; Page posts return real values.
- HubSpot only reports posts published through HubSpot — **1,833** impressions in HubSpot vs **5,477** native for the same window.
- Native export paths: Page admin → Analytics → Content / Visitors / Followers / Search appearances → Export (XLSX); for Maher personally, Me → Profile → Analytics → Post impressions / Followers → Export.

## Open decisions (need Dillon)

### A. Invalid HubSpot GA4 ID — `G-320235048`

HubSpot "Integrate with Google Analytics 4" holds `G-320235048` (not a valid measurement ID) and is firing `page_view` / `user_engagement` into nothing. Field opened, stale "You've changed 2 web page settings" banner seen, **Cancel** clicked — value left unchanged.

**Options:** set to `G-0Y6LQTTBRJ`, or uncheck the integration.

**Lean:** uncheck — `G-0Y6LQTTBRJ` is already deployed twice via the theme; pointing HubSpot at it would make three page_views per pageview.

### B. Claude connector 16228553 re-auth

Re-auth grants 17 new scopes including write: create/modify CPQ quotes, quote templates, marketing campaigns, marketing emails/experiments, marketing events; plus read on commerce payments, payment links, conversations. Prompt said reconnect if safe and don't exercise CPQ/payments/send — granting those write scopes is not obviously safe. Left pending.

**Options:** confirm and re-auth, or ask HubSpot support to narrow scopes first. Valuable scope "View advanced revenue attribution data" needs Marketing Hub Enterprise anyway.

### C. Two production site fixes (do not apply from browser-only agent)

1. Remove duplicate `align-attribution.min.js` include (renders both inside and immediately after the `align-attribution-global-footer` marker in global Site footer HTML; second copy from theme template or page-level footer).
2. Add `align_*` fields to custom footer CTA form payload (form `e733d928-0f1d-4b41-853b-df1e0096f330` currently posts only name, email, phone, company, service_interest, message + hutk). Direct cause of ~0% fill on all 33 attribution properties. Deterministic workflows deliberately **not built** until the form carries evidence.

## Caveats

- Every `google-analytics.com/g/collect` request returned **HTTP 503** during capture for both measurement IDs, while HubSpot endpoints returned 200. May be transient; re-check realtime hits once GA4 UI is reachable.
- Offline contacts (~2,170 YTD) left untouched — no deterministic evidence yet.

## Follow-on

- [[handoffs/align-dayforce-guide-form-audit-2026-07-31|Dayforce guide form / in-post CTA audit]] — step #1 record pull done; #2 live `#blog-conversion-form` remeasure next.

## Client page

- [[01_Clients/Align HCM|Align HCM]]
