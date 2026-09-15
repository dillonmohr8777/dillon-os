# Google MCP installation receipt

Status: LIVE VERIFIED — runtimes installed, registered, authenticated, and exercised read-only

## Installed machine-wide

| Runtime | Version | State |
|---|---:|---|
| MCP Toolbox for Databases | 1.11.0 | INSTALLED; no database source configured |
| gcloud MCP | 0.5.3 | LIVE VERIFIED; Codex enabled; Gemini CLI extension registered |
| Google Ads MCP | 0.0.3 | LIVE VERIFIED; direct Omega query succeeded |
| Google Analytics MCP | 0.7.0 | LIVE VERIFIED; account summaries succeeded |
| Firebase CLI/MCP | 15.30.0 | LIVE VERIFIED; project listing succeeded with zero Firebase projects |

## Existing live capabilities retained

- Google Ads API v23 direct read route to Omega customer `2853981364`.
- Google Ads Explorer access on Cloud project `momentum-360-489301`.
- Gemini Developer API model metadata through the existing restricted credential.
- Gmail, Drive, Calendar, and Contacts connector reads as `dillonmohr8777@gmail.com`.

## Configuration

- Codex global MCP config: `C:\Users\dillo\.codex\config.toml`
- Gemini CLI gcloud extension: `C:\Users\dillo\.gemini\extensions\gcloud-mcp\gemini-extension.json`
- Existing Ads probe: `C:\Users\dillo\AppData\Local\Dillon\GoogleAdsProbe`
- Cloud project: `momentum-360-489301`

All four MCP servers are enabled in Codex. ADC and gcloud CLI use `dillonmohr8777@gmail.com`; the active quota/project route is `momentum-360-489301`.

## Live verification

- Google Ads REST: 16 accessible customers.
- Google Ads MCP: direct read of Omega `2853981364` succeeded.
- GA4 REST: 11 account summaries and 12 properties.
- Search Console REST: 10 verified sites.
- Tag Manager REST: 3 accounts.
- YouTube REST: 1 channel.
- Cloud project: ACTIVE.
- Firebase REST and MCP: authenticated successfully; zero Firebase projects are currently attached to the identity.
- MCP calls succeeded for gcloud, Ads, Analytics, and Firebase.

ADC scopes:

- `https://www.googleapis.com/auth/cloud-platform`
- `https://www.googleapis.com/auth/adwords`
- `https://www.googleapis.com/auth/analytics.readonly`
- `https://www.googleapis.com/auth/webmasters.readonly`
- `https://www.googleapis.com/auth/tagmanager.readonly`
- `https://www.googleapis.com/auth/youtube.readonly`
- `https://www.googleapis.com/auth/yt-analytics.readonly`

No campaign mutation, spend, publish, OAuth production transition, IAM change, billing change, Firebase project creation, or client message occurred.

## Additional Google estate candidates

Highest-value next integrations after identity proof:

1. Search Console API for properties already verified to the identity.
2. Tag Manager API with read scopes first; container/version publishing remains separately gated.
3. YouTube Data and Analytics APIs for verified channel identities.
4. Business Profile APIs for named organizations and locations.
5. BigQuery, Logging, Monitoring, Trace, Storage, Cloud Run, and Dataform through least-privilege Cloud roles.
6. AI Studio/Gemini generation and quota verification without exposing the existing API key.
7. Firebase MCP limited to a named project and selected feature groups.
8. Merchant Center and offline/enhanced conversion services only when a real client, consent model, and operating requirement exist.

## Guardrails

- No secrets were printed or copied into the MCP configuration.
- No Ads mutation, campaign change, spend, publish, OAuth production transition, IAM change, billing change, or client message occurred.
- Full machine installation does not mean universal Google authorization; every product still follows its own identity, scope, account, and resource permissions.
