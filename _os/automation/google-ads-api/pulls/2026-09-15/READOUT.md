# Google Marketing Command Center: September 15, 2026

State: read-only, partial cross-platform coverage, no material new change detected. No external mutations or client messages.

## Live evidence

18 successful Google Ads queries, direct customer route with no manager header, restricted to Omega 2853981364, Nexla 7917802207 and Onsite 1033715894. Raw responses are the JSON files in this directory. Campaign status and budget inventory is unchanged against the September 13 baseline in the parent directory.

Last 30 days, excluding today (August 16 through September 14). Values below are platform metrics, not qualified leads; conversion reporting remains pending Ads/GA4/CRM validation.

| Client / campaign | Status | Daily budget | Spend | Clicks | Platform conversions |
| --- | --- | ---: | ---: | ---: | ---: |
| Omega / 24082267830 High Intent | ENABLED | 50.00 | 994.65 | 130 | 2 |
| Nexla / 22038365681 Brand Exact | ENABLED | 25.00 | 247.37 | 104 | 0 |
| Nexla / 23705317332 MCP-Agentic | ENABLED | 40.75 | 702.68 | 177 | 0 |
| Onsite / all five campaigns | PAUSED | unchanged | see raw history | see raw history | pending validation |

September 14 spend: Omega 38.57, Nexla Brand 17.44, Nexla MCP 59.19. No new daily-spend spike relative to the collected 14-day history. Onsite's most recent returned spend was September 8 (6.40); no relaunch indicated. Budget values are configuration, not a strict per-day spend cap. Currency was not re-queried in this run.

Nexla GTM API returned HTTP 200: account 4701213587, container 11055555 / GTM-K7B389B, published version 60, Pausing Warmly & ZoomInfo. Workspace 73 still has seven changes and zero merge conflicts. Published Google Ads tag 88, GAds Conversion - Form Submit, is unpaused and references trigger 86. These are configuration reads, not successful-form or delivery tests.

GA4 Admin and Search Console inventory reads succeeded (HTTP 200); no property/site explicitly identifiable as these three clients was returned. No unrelated properties were queried for performance. GTM account inventory returned Nexla, with no further page; Omega and Onsite container mappings remain unresolved. SEO performance and GA4 attribution could not be assessed for the active three. ADC token refresh succeeded, but identity endpoints did not return an email (userinfo HTTP 401; tokeninfo HTTP 200 without email). The configured account association was not independently re-proven by these endpoints; no credential/account switch was attempted.

## Ranked action queue (existing issues, not new approvals)

1. Nexla measurement: retain current budgets and bidding; validate the prepared workspace 73 changes against one accepted demo submission and its CRM receipt before any approved publication. Ads still reports zero conversions on the two enabled Search campaigns. Version 60 and seven unpublished changes are unchanged, not a new regression.
2. Resolve exact read-only GA4/GSC resource access for each active client and Omega/Onsite GTM ownership. Do not substitute another client's resource or install duplicate tags. Proposed campaign changes: none until measurement/resource mapping is validated.
3. Search intent: keep observed excluded terms excluded. Nexla MCP historical "ai for customer insights" (77.51) and "artificial intelligence products" (17.86), and Omega "araco concrete" (23.61) and "preferred concrete colorado springs" (23.34), already report EXCLUDED; do not propose duplicate negatives or treat historical cost as post-exclusion leakage. Nexla "model context protocol" (27.35) and "mcp server" (18.32) remain relevant review candidates, not evidence sufficient for automatic exclusion. No new negative recommended this run.
4. Onsite: retain the existing pause. No campaign activation or budget change proposed under this monitor.

## Limits and notification decision

Search-term queries are capped at 500 rows; Nexla reached the cap, so its search-term sweep is partial. Landing-page reports are historical destinations, not live HTTP/form QA. GA4, Search Console performance, CRM qualification, live conversion firing and Ads grant email identity were not verified. This run establishes Ads and Nexla GTM read availability, not full developer access or end-to-end lead attribution.

Decision: DONT_NOTIFY. Existing measurement/access gaps and intentional Onsite pause remain unchanged. No new failure, completion or decision request warrants another notification.
