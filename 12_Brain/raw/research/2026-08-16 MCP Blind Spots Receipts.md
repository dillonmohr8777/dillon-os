---
note_type: research
status: reference
created: 2026-08-16
updated: 2026-08-16
owner: Dillon Mohr
verification_status: partial
tags: [brain, research, mcp]
---

# 2026-08-16 MCP Blind Spots Receipts

Research receipts for "which official MCPs did the 50-catalog and 25 web-design catalog omit — ones this stack is not even thinking about."
Not an install list. Does not authorize connect, send, spend, or account change.
Skeptic pass ran same day (fresh context). Survivors compiled to
`12_Brain/concepts/MCP Blind Spots 2026.md`.

X MCP tool discovery was not used. Directory blogs are not official-status proof.
No live Inspector `tools/list` against these remotes this pass — tool names are
docs-asserted.

## Frame (vault, not a vendor receipt)

- Vault mcp.json still declares only `landingfolio`.
- The 50-catalog already listed HubSpot, Notion, Linear, Stripe, PostHog,
  Cloudflare, Neon, Exa, Gmail, Drive, Calendar. Those are not blind spots.
- The 50-catalog line 14 already named Docs/Sheets/Slides as omitted extras.
  Calling those three "undiscovered" is hype; calling them unranked is fair.
- Cloud remotes table also lists warehouse/infra servers (AlloyDB, Cloud Storage,
  Cloud Run, Firestore, …) this business does not run. BigQuery is the one
  named here because ads/GA4 warehouses are the only plausible fit.

## Receipts — official first-party pages fetched 2026-08-16

### Workspace documents (omitted from the 50 table)

- Claim: Official Google Docs remote MCP exists at
  `https://docsmcp.googleapis.com/mcp/v1`. Each Workspace product has its own
  dedicated MCP server. Test prompt uses `docs.read_doc`.
  Source: https://developers.google.com/workspace/guides/configure-mcp-servers
  Also: https://developers.google.com/workspace/docs/api/guides/configure-mcp-server
  Date: accessed 2026-08-16. Official. Developer Preview class with the rest of
  Workspace MCP. WRITE via `update_doc`.
  Skeptic: SURVIVE. Drive MCP is a different host (`drivemcp.googleapis.com`).

- Claim: Official Google Sheets remote MCP at
  `https://sheetsmcp.googleapis.com/mcp/v1`. Tools: `get_values`,
  `get_spreadsheet`, `update_spreadsheet`, `update_values`, `update_formulas`,
  `insert_dimension`.
  Source: https://developers.google.com/workspace/sheets/api/guides/configure-mcp-server
  Date: accessed 2026-08-16. Official. WRITE.
  Skeptic: SURVIVE. Drive can open a spreadsheet as a file; it does not expose
  grid/formula/dimension tools. Growth Workshop tracker lives in Drive sheets
  (vault judgment, not vendor proof of "need").

- Claim: Official Google Slides remote MCP at
  `https://slidesmcp.googleapis.com/mcp/v1`. Tools: `read_presentation`,
  `update_presentation`.
  Source: https://developers.google.com/workspace/slides/api/guides/configure-mcp-server
  Date: accessed 2026-08-16. Official. WRITE.
  Skeptic: SURVIVE.

- Claim: Google Cloud supported-products table lists Drive/Gmail/Calendar/Chat/
  People and omits Docs/Sheets/Slides even though dedicated Workspace pages
  exist. Absence on that table is not proof the remotes are fake.
  Source: https://docs.cloud.google.com/mcp/supported-products
  Date: accessed 2026-08-16. Official. Catalog-vs-table inconsistency is Google's.

### Warehouse

- Claim: Official BigQuery remote MCP at `https://bigquery.googleapis.com/mcp`.
  Tools include `execute_sql` and `execute_sql_readonly`. Default query time
  three minutes; results capped at 3,000 rows. `execute_sql` is the only
  non-read-only tool and can be denied. No Drive external tables.
  Source: https://docs.cloud.google.com/bigquery/docs/use-bigquery-mcp
  Date: accessed 2026-08-16. Official.
  Skeptic: SURVIVE. Useful only if ads/GA4 data is already warehoused.

### Booking vs Calendar

- Claim: Official Cal.com hosted MCP at `https://mcp.cal.com/mcp`. Streamable
  HTTP, OAuth 2.1. Docs header says 34 tools. Printed tables include bookings
  (create/reschedule/cancel/confirm), event types, schedules, availability.
  WRITE.
  Source: https://cal.com/docs/mcp-server
  Date: accessed 2026-08-16. Official.
  Skeptic: QUALIFY. Hosted URL and write tools survive. Enumerated tables add
  to 33, not 34. Distinct from Google Calendar MCP (different objects, auth).

### Email send / inbound infra

- Claim: Official Resend hosted MCP at `https://mcp.resend.com/mcp`. Tools
  include send/list/cancel/batch emails, broadcasts, contacts, inbound read,
  domains, webhooks. WRITE/send.
  Source: https://resend.com/docs/mcp-server
  Date: accessed 2026-08-16. Official.
  Skeptic: SURVIVE as existence. Conflicts with vault draft-first (Gmail
  official MCP is draft/label). Not a "missing Gmail."

### Next backends

- Claim: Official Supabase hosted MCP at `https://mcp.supabase.com/mcp`.
  Query params `read_only=true` and `project_ref` exist. Docs say never
  connect to production; designed for development and testing.
  Source: https://supabase.com/docs/guides/getting-started/mcp
  Date: accessed 2026-08-16. Official. WRITE unless read-only param is set.
  Skeptic: SURVIVE. Neon already in the 50 as skip. Shadow HVAC is the Next
  exception, not a reason to point this at prod.

### Prospect / local-SEO surfaces the 50 skipped

- Claim: Official BuiltWith hosted MCP at `https://api.builtwith.com/mcp`.
  First-party GitHub `builtwith/builtwith-mcp`. Standard lookup tools spend
  account credits. Registry/whoami/usage tools are documented as no-credit.
  Source: https://api.builtwith.com/ and https://github.com/builtwith/builtwith-mcp
  Date: accessed 2026-08-16. Official.
  Skeptic: QUALIFY. Hosted URL survives. "Always burns credits" does not.
  Different job from DataForSEO (tech stack vs SERP). Thin overlap for
  Prospect Radar domain enrichment.

- Claim: Official Microsoft Advertising MCP (OpenBeta). Server URL
  `https://partner.api.bingads.microsoft.com/ext/mcp/vnext` with
  `toolSetNames=OpenBeta`. AAD OAuth. Example prompts: list customers, user
  info. ms.date 2026-07-22.
  Source: https://learn.microsoft.com/en-us/advertising/guides/mcp-setup?view=bingads-13
  Date: 2026-07-22. Official. Beta, not GA.
  Skeptic: SURVIVE as first-party. The 50-catalog never listed it. This ads
  operator stack thought only Google + Meta.

- Claim: Official Birdeye MCP at `https://mcp.birdeye.com/mcp`. Reviews,
  listings, surveys, social, ticketing, Search AI. Docs advertise 31 tools
  (not counted this pass).
  Source: https://docs.birdeye.com/mcp/introduction
  Date: accessed 2026-08-16. Official.
  Skeptic: SURVIVE as first-party. Tool count is vendor copy. Only useful if
  a client already sits in Birdeye (not a BrightLocal substitute).

- Claim: Official CallRail MCP exists in CallRail API v3 docs. OAuth. No
  public static hostname — URL is provisioned by the CallRail account team.
  Session scoped to the CallRail user. Docs say no API keys required.
  Source: https://apidocs.callrail.com/
  Date: accessed 2026-08-16. Official, but not a paste-this-URL server.
  Skeptic: SURVIVE as "vendor MCP exists." Kill any claim of a public
  `mcp.callrail.com` hostname.

- Claim: Official Intercom MCP at `https://mcp.intercom.com/mcp` (US) and
  `https://mcp.eu.intercom.com/mcp` (EU). 13 tools documented (search, fetch,
  conversations, contacts, companies, articles including create/update).
  AU not supported. Wrong URL `docs.intercom.com/getting-started/mcp` 404s.
  Source: https://developers.intercom.com/docs/guides/mcp
  Date: accessed 2026-08-16. Official. WRITE on articles.
  Skeptic: SURVIVE. Researcher first-pass "no Intercom MCP" was a bad URL.

- Claim: Official Klaviyo remote MCP at `https://mcp.klaviyo.com/mcp`.
  Owner/Admin/Manager only. Default includes write (`create_campaign`).
  Query param `read-only=true` exists (hyphen). Also
  `disable-tools-with-user-generated-content=true` and `core-tools-only=true`.
  Source: https://developers.klaviyo.com/en/docs/klaviyo_mcp_server
  Date: accessed 2026-08-16. Official. WRITE by default.
  Skeptic: SURVIVE. Only a gap if a client already runs Klaviyo. Conflicts
  with Instantly-skip and draft-first if campaign create is left on.

### Analytics that is not GA4

- Claim: Official Microsoft Clarity MCP is local
  `npx @microsoft/clarity-mcp-server`. Data Export API: up to 10 requests
  per day, max 3 days of data, up to 3 dimensions. Learn ms.date 2026-06-24.
  Source: https://learn.microsoft.com/en-us/clarity/third-party-integrations/clarity-mcp-server
  Also: https://github.com/microsoft/clarity-mcp-server
  Date: accessed 2026-08-16. Official.
  Skeptic: QUALIFY. Existence survives. "Daily reporting MCP" dies on quota.
  Planned enhancement: increased API limits (not shipped).

- Claim: Official Mixpanel hosted MCP at `https://mcp.mixpanel.com/mcp` (US).
  Tools include `Run-Query` and writes (`Create-Dashboard`, `Delete-Dashboard`,
  `Create-Cohort`).
  Source: https://docs.mixpanel.com/docs/mcp
  Date: accessed 2026-08-16. Official. WRITE.
  Skeptic: SURVIVE. Skip unless Mixpanel is already paid. PostHog already in
  the 50 as skip.

- Claim: Official Amplitude hosted MCP at `https://mcp.amplitude.com/mcp`.
  OAuth. Create dashboards/charts/experiments/cohorts is first-party, not
  read-only. `amplitude/mcp-server-guide` is a how-to repo, not the runtime.
  Source: https://amplitude.com/mcp-server
  Also: https://amplitude.com/docs/amplitude-ai/amplitude-mcp
  Date: accessed 2026-08-16. Official. WRITE.
  Skeptic: QUALIFY. Hosted URL survives. GitHub cite is a guide.

### Search / scrape overlap (omitted from the 50 table, not unique)

- Claim: Official Parallel Search MCP at `https://search.parallel.ai/mcp`
  is free anonymous. Task MCP at `https://task-mcp.parallel.ai/mcp` requires
  auth. Docs MCP at `https://docs.parallel.ai/mcp` is docs-only.
  Source: https://docs.parallel.ai/integrations/mcp
  Date: accessed 2026-08-16. Official.
  Skeptic: SURVIVE as omitted-from-table. QUALIFY as unique gap: Exa is
  already catalog row 11 and session-present. Same job class.

- Claim: Official Tavily remote MCP at `https://mcp.tavily.com/mcp/`.
  Cited docs body names search and extract. First-party GitHub also names
  map and crawl. OAuth path exists without putting a key in the URL.
  Source: https://docs.tavily.com/documentation/mcp
  Also: https://github.com/tavily-ai/tavily-mcp
  Date: accessed 2026-08-16. Official.
  Skeptic: QUALIFY. Map/crawl not proven by the cited docs body alone.
  Overlaps Exa / Firecrawl / Perplexity.

- Claim: Official Apify hosted MCP at `https://mcp.apify.com`. Discover and
  run Actors. SSE endpoint removed 2026-04-01. Anonymous limited to Actor
  discovery and docs. Running Actors burns usage.
  Source: https://docs.apify.com/integrations/mcp
  Also: https://github.com/apify/apify-mcp-server
  Date: accessed 2026-08-16. Official.
  Skeptic: SURVIVE. Overlaps Firecrawl on scrape; Apify is a marketplace
  runtime, not a harvest clone. Catalog already marks Firecrawl as a need.

### Voice / SMS-docs / ops bases

- Claim: Official ElevenLabs MCP is local (`elevenlabs/elevenlabs-mcp`).
  No first-party hosted `mcp.elevenlabs.com` found this pass. Voice/audio,
  not UGC video (Higgsfield).
  Source: https://github.com/elevenlabs/elevenlabs-mcp
  Date: accessed 2026-08-16. Official local.
  Skeptic: QUALIFY. Local-only.

- Claim: Official Twilio MCP at `https://mcp.twilio.com/docs` is public
  beta docs/OpenAPI search. Tools `twilio__search` and `twilio__retrieve`.
  Does not execute SMS or calls. No auth. dateModified 2026-07-20.
  Source: https://www.twilio.com/docs/ai/mcp
  Date: 2026-07-20. Official.
  Skeptic: SURVIVE. Not a call-tracking or SMS ops MCP.

- Claim: Official Airtable MCP at `https://mcp.airtable.com/mcp`. Support
  page last updated 2026-08-10. Create/update records, `create_base`.
  Read-only via scopes `data.records:read` (and related read scopes).
  `https://airtable.com/developers/ai/mcp` 404s this session.
  Source: https://support.airtable.com/docs/using-the-airtable-mcp-server
  Date: 2026-08-10. Official. WRITE by default.
  Skeptic: SURVIVE. Skip unless ops already live in Airtable. Vault is
  Git/Obsidian.

## Negatives (still no first-party MCP this pass)

- ServiceTitan, Housecall Pro, Jobber, Podium inbox/messaging: community
  wrappers or REST only. Skeptic agreed.
- LinkedIn Ads, YouTube, Google Search Console, Google Business Profile,
  Obsidian: still no official MCP. Already killed in the 50-catalog.
- Microsoft Ads / Birdeye / CallRail / Intercom were falsely grouped into
  "none found" on the first researcher pass. Skeptic killed that bundle.

## Skeptic verdicts (fresh context, same day)

SURVIVE: Docs, Sheets, Slides, 50-catalog omission admission, BigQuery,
Resend, Supabase, Apify, Mixpanel, Airtable, Klaviyo, Parallel Search (as
official + omitted), Twilio docs MCP, HubSpot/Notion/Linear/Stripe/PostHog/
Cloudflare/Neon already in the 50.

QUALIFY: Cal.com tool count 33 not 34; BuiltWith credits not universal;
Clarity quota; Amplitude GitHub is a guide; Tavily map/crawl GitHub-only vs
cited docs; ElevenLabs local; "no official MCP" list was sloppy.

KILLED sub-claims: "no Microsoft Ads MCP", "no Birdeye MCP", "no Intercom
MCP", "no CallRail MCP", "Sheets equals Drive", "Cal.com equals Calendar",
"Parallel Search is a unique capability gap vs Exa", "Clarity is a daily
GA4 replacement", "Resend is missing Gmail", "BuiltWith always burns
credits", "34 Cal.com tools" as a counted fact.

## Killed this sweep

- Connecting any of these.
- Treating session-injected MCPs as vault-owned.
- Filling HVAC field-software holes with community ServiceTitan/Jobber MCPs.
- Official GSC / GBP / Obsidian MCP (still missing).
- Parallel/Tavily as unique research tools (Exa already cataloged).
- Mixpanel/Amplitude as reporting stack (GA4/Ads is the stack).
- Resend send tools under draft-first.
- Supabase against production.
- Intercom absence based on a 404 URL.
- CallRail as a public hostname you can paste today.
