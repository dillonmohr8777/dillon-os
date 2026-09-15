# Google Access Expansion ledger

Run: 2026-09-12, first Codex cycle
Automation: `google-access-expansion-daily`, ACTIVE, daily at 10:00 AM ET
Execution evidence: initial audit was run interactively. No unattended scheduled execution has been verified. ACTIVE is configuration proof only.
Safety: Ads audits remain read-only. On 2026-09-13 Dillon explicitly approved the OAuth production change and Ads Basic application; no billing, IAM, client permissions, customer-data terms, or advertising state changed.

## Machine-wide MCP layer installed

| Capability | State | Evidence |
|---|---|---|
| MCP Toolbox for Databases 1.11.0 | INSTALLED UNCONFIGURED | Global package installed; no database source or credential configured |
| gcloud MCP 0.5.3 | LIVE VERIFIED | Authenticated project describe call succeeded through MCP |
| Official Google Ads MCP 0.0.3 | LIVE VERIFIED | Direct Omega customer query succeeded through MCP |
| Google Analytics MCP 0.7.0 | LIVE VERIFIED | Account summary call succeeded through MCP |
| Firebase MCP 15.30.0 | LIVE VERIFIED EMPTY | Authenticated project list succeeded; zero Firebase projects returned |

Receipt: `GOOGLE-MCP-INSTALL-RECEIPT-2026-09-12.md`

## Verified now

| Capability | State | Evidence |
|---|---|---|
| Google Ads API v23 direct reads | LIVE VERIFIED | Live diagnosis returned four successful calls out of five |
| Accessible Ads customers | LIVE VERIFIED | `customers:listAccessibleCustomers` returned HTTP 200 and 16 customer resources; request `KGtp0xeIOzYZh_e7XDGw3g` |
| Manager identity, direct | LIVE VERIFIED | Customer `7038673437` returned HTTP 200; request `RFKfnwuJjAg7Y4EJSY63Mw` |
| Manager identity, manager header | LIVE VERIFIED | Returned HTTP 200; request `__RLVEpi-mkYtM82eP21yw` |
| Omega identity, direct | LIVE VERIFIED | Customer `2853981364` returned HTTP 200; request `bceIhg2amxLXhjpRvQMVSQ` |
| Omega through manager `7038673437` | BLOCKED | Manager lists only itself and Omega lists no manager links; HTTP 200 topology requests `a_n_tmWAYX0cE3yAbGXS5Q` and `cC18IIuuMY6yfpheEra13A`. Direct access remains correct |
| Local probe regression checks | LIVE VERIFIED | Seven of seven `unittest` checks passed |
| Google Ads Explorer level | LIVE VERIFIED, BASIC DENIED | Cloud access page still shows Explorer with 15,000 test operations and 2,880 production operations; 2026-09-13 Basic application was denied because OAuth brand verification is incomplete |
| Google Ads mutation capability | LIVE VERIFIED | Cloud 30-day metrics show successful v23 campaign, budget, criterion, and grouped mutate calls; this is capability evidence, not authorization for new changes |
| Google Ads Keyword Planner | BLOCKED | Two `GenerateKeywordIdeas` requests show 100% errors in 30-day metrics, matching Explorer restrictions |
| Cloud Console identity | LIVE VERIFIED | Authenticated Chrome session is `dillonmohr8777@gmail.com` on project `momentum-360-489301` (`Momentum 360`) |
| Cloud enabled-service inventory | LIVE VERIFIED | Cloud Console lists 24 enabled APIs/services |
| Gemini Developer API metadata | LIVE VERIFIED | Existing environment credential returned HTTP 200 and 55 model records from the models endpoint; no generation invoked and no key displayed |
| Gmail, Drive, Calendar, Contacts connector identity | LIVE VERIFIED | Current connector profile reads succeeded as `dillonmohr8777@gmail.com`; product-level write scopes were not tested |
| Gmail metadata | LIVE VERIFIED | Bounded INBOX label metadata read succeeded |
| Calendar | LIVE VERIFIED | Calendar list read succeeded; primary calendar role is owner |
| Drive | LIVE VERIFIED | Shared-drive list read succeeded and returned an empty inventory |
| Windsor.ai connector | BLOCKED | Connector returned reauthentication required |

## Broader Google estate

| Capability | State | Next proof |
|---|---|---|
| Google Cloud project API inventory | LIVE VERIFIED | Browser-authenticated Cloud Console exposed all 24 enabled services; local `gcloud` remains unauthenticated |
| GA4 Data and Admin APIs | LIVE VERIFIED | ADC returned 11 account summaries and 12 properties; Analytics MCP account-summary call succeeded |
| Search Console API | LIVE VERIFIED | Read-only ADC returned 10 verified sites |
| Tag Manager API | LIVE VERIFIED READ-ONLY | Read-only ADC returned 3 accounts; publishing remains separately gated |
| Business Profile APIs | BLOCKED | No authenticated local client demonstrated; resolve exact organization/location access |
| Workspace APIs | LIVE VERIFIED | Gmail, Drive, Calendar, and Contacts connector profile reads succeeded; exact per-product scopes and mutation rights remain unverified |
| YouTube Data and Analytics APIs | LIVE VERIFIED READ-ONLY | ADC returned one channel; Analytics scope granted without publishing authority |
| BigQuery and Google Cloud services | ENABLED UNVERIFIED | BigQuery family, Analytics Hub, Dataplex, Dataform, Datastore, SQL, Storage, Logging, Monitoring, and Trace are enabled; no resource/data read was performed |
| Gemini API | LIVE VERIFIED | API is enabled and its models endpoint returned 55 records with the existing API credential; generation quota and billing remain unverified |
| Firebase | LIVE VERIFIED EMPTY | Firebase API and MCP project listings succeeded; no Firebase projects are attached to this identity |
| Merchant Center API | NOT NEEDED | No current client or operating requirement established |
| Data Manager and enhanced/offline conversions | HUMAN APPROVAL REQUIRED | Requires exact client, consent/terms, privacy design, identifiers, and product prerequisites |

Interpretation correction: BLOCKED rows based only on lack of a demonstrated client mean UNVERIFIED, not proven denial. Firebase, YouTube, Business Profile, GA4, Search Console, and GTM require further exact-service verification. The Gemini environment key's project association was not proven. Enabled services, identity reads, product reads, and effective write access are distinct evidence levels. Historical mutation metrics do not prove which requests used validate-only or which state changes persisted.

## Highest-value next gains

1. Complete OAuth brand verification, publish the verified branding within Google's seven-day validity window, then reapply for Ads Basic.
2. Resolve the proven branding issue: the home-page domain is not verified as owned by this Google account. Verification was started through Information and summary without uploading a logo. Search Console provided a TXT record; SiteGround DNS login is the current external dependency. Exact record and next steps are in the OAuth packet.
3. Map the already verified GA4, Search Console, and GTM account inventories to each active client; do not request broader scopes without a named operating use.

## Enabled Cloud services, verified in Console

Google Ads API; Analytics Hub API; BigQuery API; BigQuery Connection API; BigQuery Data Policy API; BigQuery Data Transfer API; BigQuery Migration API; BigQuery Reservation API; BigQuery Storage API; Cloud Dataplex API; Cloud Datastore API; Cloud Logging API; Cloud Monitoring API; Cloud SQL; Cloud Storage; Cloud Storage API; Cloud Trace API; Dataform API; Gemini API; Google Cloud APIs; Google Cloud Storage JSON API; Map Tiles API; Service Management API; Service Usage API.

## Credential and OAuth posture

- Two restricted API keys exist: one for Map Tiles and one for Gemini. Secret values were not opened.
- Two OAuth clients exist: the September 10 desktop Ads probe and an older web client for Business Profile that Cloud marks unused.
- No service accounts exist in this project.
- OAuth user type is External and publishing status is In production. The Audience page shows one lifetime user against the 100-user cap.
- The project has a 10,000-grant daily OAuth token grant limit, but no recent OAuth traffic appears on the overview.
- Branding now contains the saved Momentum 360 home, privacy-policy, and terms URLs; `momentumvirtualtours.com` remains the authorized domain. Verification Center still reports branding not shown and sensitive/restricted data access unverified.

## Guardrail

The daily desk may diagnose, verify, and prepare complete application packets. It must stop before submissions, restricted OAuth grants, billing, IAM/account changes, customer-data terms, client requests, or Google Ads mutations.
