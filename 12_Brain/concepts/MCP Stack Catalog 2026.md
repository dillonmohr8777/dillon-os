---
tags: [concept, mcp, research]
source: "[[12_Brain/raw/research/2026-08-16 MCP Stack Catalog 50 Receipts]]"
updated: 2026-08-16
expires: 2026-11-14
---

# MCP Stack Catalog — 2026

**Summary:** this page lists 50 official MCP servers sampled 2026-08-16 — it is not a complete inventory. This vault needs a small gated stack, not 50 connections.

This page does not authorize connect, send, spend, or account change. Every new server still goes through `_os/automation/bin/mcp-gate.js` (source, Inspector, permission, prompt-injection, overlap). See [[12_Brain/concepts/Draft-First Operating Rules|draft-first]] and [[12_Brain/06_Research/References/2026-07-30 - Casepoint permission-aware MCP pattern|permission-aware MCP]].

Google Cloud's remotes table plus Workspace Docs/Sheets/Slides remotes are extra official servers omitted here. Official client guidance: dumping every server's tools wastes tokens and the model picks worse. One job per server. Overlap review is mandatory.

## What you actually have

Vault-declared in `.cursor/mcp.json` / `.mcp.json`: **LandingFolio**, the
[[12_Brain/concepts/MCP Blind Spots 2026|2026-08-16 blind-spot batch]], the
free need-list / design helpers (Context7, Firecrawl keyless, Google Design,
Playwright, Brandfetch, Netlify, official GA4), and the 2026-08-16 Google ops
set (Gmail, Drive, Calendar, official Ads, Maps Grounding Lite, Developer
Knowledge). Session-injected host MCPs are still not vault-owned. No data lake.
GBP stays API-only — [[12_Brain/concepts/Google Business Profile API 2026|Google Business Profile API 2026]].

| Server | Status | Job |
|---|---|---|
| [[12_Brain/entities/LandingFolio MCP|LandingFolio]] | sandbox-only; Inspector pending | Section composition screenshots. Unique. Brand still comes from harvest. Marketing page claims 4,600+ components. |
| [[12_Brain/07_Reviews/MCP/2026-08-16 - context7|Context7]] | **ACCEPT** and vault-declared | Version-sensitive library docs. Next exception, not batch HTML. |
| [[12_Brain/07_Reviews/MCP/2026-08-16 - firecrawl|Firecrawl]] | **ACCEPT** keyless | Harvest / research-sweep scrape-search-parse. Do not add an API key. |
| [[12_Brain/07_Reviews/MCP/2026-08-16 - google-design|Google Design]] | **ACCEPT** | Material color schemes + icon search. Harvest still wins. |
| [[12_Brain/07_Reviews/MCP/2026-08-16 - playwright|Playwright]] | sandbox-only | Factory QA screenshots. Do not call `browser_run_code_unsafe`. |
| [[12_Brain/07_Reviews/MCP/2026-08-16 - brandfetch|Brandfetch]] | sandbox-only | Free-plan brand lookup after OAuth. Harvest still wins. |
| [[12_Brain/07_Reviews/MCP/2026-08-16 - netlify|Netlify]] | sandbox-only | Factory host. Writes off until an explicit deploy ask. |
| [[12_Brain/07_Reviews/MCP/2026-08-16 - google-analytics|GA4]] | sandbox-only | Official `pipx run analytics-mcp`. Needs ADC. |
| [[12_Brain/07_Reviews/MCP/2026-08-16 - gmail|Gmail]] | sandbox-only | Official `gmailmcp.googleapis.com/mcp/v1`. `create_draft` / read. No send on 2026-08-16 `tools/list`. |
| [[12_Brain/07_Reviews/MCP/2026-08-16 - google-drive|Drive]] | sandbox-only | File-level. Writes off. |
| [[12_Brain/07_Reviews/MCP/2026-08-16 - google-calendar|Calendar]] | sandbox-only | Workshop RSVP rail. Writes off. |
| [[12_Brain/07_Reviews/MCP/2026-08-16 - google-ads|Google Ads]] | sandbox-only | Official read-only `pipx` + developer token. Inspector pending (needs token). |
| [[12_Brain/07_Reviews/MCP/2026-08-16 - maps-grounding-lite|Maps Grounding Lite]] | sandbox-only | Places/weather/routes. Not GBP. Live calls billed. |
| [[12_Brain/07_Reviews/MCP/2026-08-16 - developer-knowledge|Developer Knowledge]] | **ACCEPT** | Official Google docs. Context7 stays for third-party libs. |

This Cloud Agent session also injected GitHub, Slack, Vercel, Webflow, Exa, and others. **Session-present is not vault-owned and is not gate-accepted.** Official Gmail MCP had no send/reply/forward on the 2026-08-16 `tools/list`; ignore host dumps that listed send.

## Unique ones you do not have

Vault judgment, not vendor proof. Free need-list and Google ops servers were vault-declared 2026-08-16. These remaining gaps still need a paid plan or do not exist as official MCPs.

| # | MCP | Unique job | Why it is a gap | Risk |
|---|---|---|---|---|
| 1 | **Meta Ads** (official, `mcp.facebook.com/ads`) | Meta Lead Ads read + writes | Core lane. First-party. | **WRITE.** Create/edit campaigns. Rolling access. Vault policy: keep writes off. Not free. |
| 2 | **DataForSEO** (official) | SERP / keyword / business-data listings | Local SEO + prospect radar. Pick **one** SEO-data vendor. | Burns API credits. Overlaps Ahrefs/Semrush. Not a GBP API. |
| 3 | **WordPress.com / WP MCP Adapter** | Live WP posts/pages | Service list includes WordPress. Webflow MCP does not touch WP. | **WRITE.** Paid plans. Keep write tools off. |
| 4 | **BrightLocal** (official) | BrightLocal account data (rankings / reviews / citations) | Closest first-party **local-SEO dataset** MCP. **Not** Google Business Profile API. **No official GBP MCP exists.** | Grow plan. Write still unproven shipped. |
| 5 | **ScrapeCreators** (official) | Public social + ad-library scrape | Practitioner intel when X is down. | Untrusted third-party text. Burns credits. |

Google Ads, GA4, Firecrawl, Netlify, Playwright, Context7, Google Design, Gmail, Drive, Calendar, Maps Grounding Lite, and Developer Knowledge are now vault-declared. Chrome DevTools stays skipped (overlaps Playwright). Do not add a data lake. GBP stays [[12_Brain/concepts/Google Business Profile API 2026|API-only]].

Also unique but **do not add unless the product is already paid and gated**: Ahrefs *or* Semrush (not both; not with DataForSEO), Screaming Frog 24 (licensed desktop), Instantly (conflicts with draft-first), HubSpot (CRM write), Higgsfield (UGC video; generations burn credits; already in some Cloud sessions).

**Still missing as official MCPs:** Google Search Console, Google Business Profile, Obsidian. Do not fill those with random community wrappers.

## The 50 (first-party, 2026-08-16)

Do not connect all of these.

Fit: **vault** = declared in vault mcp.json. **accept** = MCP review ACCEPT, not vault-declared. **need** = unique-gap judgment above. **session** = seen in this Cloud host, not vault-owned. **skip** = official but overlaps or not this business. **watch** = official, useful later, write-heavy or paid.

| # | Server | Endpoint / path | Fit | Write | Notes |
|---|---|---|---|---|---|
| 1 | LandingFolio | `mcp.landingfolio.com/mcp` | vault | read | Vault-declared. Sandbox. Marketing page: 4,600+ components. |
| 2 | Context7 | `mcp.context7.com/mcp` | vault | read | ACCEPT and vault-declared 2026-08-16. |
| 3 | GitHub | `api.githubcopilot.com/mcp/` | session | mixed | Official Copilot MCP docs. Host-injected here. |
| 4 | Playwright | `microsoft/playwright-mcp` | vault | browser | Official local. Vault-declared. QA only; `browser_run_code_unsafe` off. |
| 5 | Slack | `mcp.slack.com/mcp` | session | **write** | Official. `/slack-intake` needs it. Draft-only in skills. |
| 6 | Gmail | `gmailmcp.googleapis.com/mcp/v1` | vault | draft | Official remote. `create_draft` / read. No send on 2026-08-16 `tools/list`. Writes beyond draft stay off. |
| 7 | Google Drive | `drivemcp.googleapis.com/mcp/v1` | vault | mixed | Developer Preview. Writes off. |
| 8 | Google Calendar | `calendarmcp.googleapis.com/mcp/v1` | vault | **write** | Official tools include create/update/delete. Writes off. Workshop RSVP rail. |
| 9 | Vercel | `mcp.vercel.com` | session | mixed | Official. Shadow HVAC / Next. Not the factory host. |
| 10 | Webflow | `mcp.webflow.com/mcp` | session | **write** | Official. Canvas writes need Designer Bridge. |
| 11 | Exa | `mcp.exa.ai/mcp` | session | read | Official GitHub `exa-labs/exa-mcp-server` + docs URL. Hosted works anonymously with rate limits. Overlaps Perplexity. |
| 12 | Google Ads | google-ads-mcp (stdio) | vault | read | Official `pipx` + developer token. No mutate tools. Inspector pending. Do not deploy the Cloud Run sample. |
| 13 | Meta Ads | `mcp.facebook.com/ads` | **need** | **write** | Official. Unique. Gate writes. Rolling access. |
| 14 | GA4 | analytics MCP (local Experimental) | vault | read | Official `pipx run analytics-mcp`. Sandbox-only until ADC. Do not ship a guessed remote Data API URL. |
| 15 | Firecrawl | `mcp.firecrawl.dev/v2/mcp` | vault | read | **ACCEPT** keyless (search/scrape/parse). Do not add `FIRECRAWL_API_KEY`. |
| 16 | DataForSEO | `mcp.dataforseo.com/mcp` | **need** | credits | Official. Unique SEO data. Pick one vendor. Not GBP API. |
| 17 | Netlify | `netlify-mcp.netlify.app/mcp` | vault | **write** | Official. Sandbox-only. Writes off until Dillon asks. |
| 18 | WordPress.com | `public-api.wordpress.com/wpcom/v2/mcp/v1` | **need** | **write** | Official. Paid plans. Default write off. |
| 19 | WP MCP Adapter | WordPress/mcp-adapter | **need** | **write** | Official adapter for self-hosted WP. |
| 20 | HubSpot | `mcp.hubspot.com` | watch | **write** | Official GA 2026-04-13. Draft-first CRM. Separate local Dev MCP. |
| 21 | Ahrefs | `api.ahrefs.com/mcp/mcp` | skip | credits | Official. Lite+. Overlaps DataForSEO. |
| 22 | Semrush | `mcp.semrush.com/v2/mcp` | skip | credits | Official. Docs updated 2026-08-05. Same job as Ahrefs. |
| 23 | BrightLocal | `mcp.brightlocal.com/mcp` | **need** | later | Official help (Grow plan). BrightLocal data, not GBP. Write unproven shipped. |
| 24 | ScrapeCreators | `api.scrapecreators.com/mcp` | **need** | credits | Official. Social + ad libraries. |
| 25 | Instantly | `mcp.instantly.ai/mcp` | skip | **write** | Official help. Campaign/reply writes. Conflicts with draft-first. |
| 26 | Screaming Frog 24 | desktop MCP | watch | local | Official 2026-05-19. Licensed machine only. |
| 27 | Chrome DevTools | `npx chrome-devtools-mcp` | skip | local | Official. Overlaps vault Playwright. Do not run both always-on. |
| 28 | Figma | `mcp.figma.com/mcp` | skip | **write** | Official. Factory is harvest + LandingFolio, not Figma-to-code. |
| 29 | Notion | `mcp.notion.com/mcp` | skip | **write** | Official. Vault is Git/Obsidian, not Notion. |
| 30 | Linear | `mcp.linear.app/mcp` | skip | **write** | Official. Readonly URL exists. Not the tracker here. |
| 31 | Stripe | `mcp.stripe.com` | skip | **write** | Official. No payment lane in this OS. |
| 32 | Shopify Storefront | `{shop}.myshopify.com/api/mcp` | skip | cart | Official. Unauthenticated storefront, **not Admin**. |
| 33 | Sentry | `mcp.sentry.dev/mcp` | skip | mixed | Official. Useful if a Next site is already on Sentry. |
| 34 | Perplexity | `api.perplexity.ai/mcp` | skip | billed | Official. Overlaps Exa. |
| 35 | Browserbase | `mcp.browserbase.com/mcp` | skip | browser | Official. Overlaps Playwright. |
| 36 | Google Design | `design.googleapis.com/mcp` | vault | read | **ACCEPT**. Tokens/icons. Harvest still wins. |
| 37 | Google Stitch | `stitch.googleapis.com/mcp` | watch | mixed | Official Beta on Cloud remotes table. |
| 38 | Maps Grounding Lite | `mapstools.googleapis.com/mcp` | vault | read | Official. Places/weather/routes, not GBP posts. Live calls billed. |
| 39 | Google Chat | `chatmcp.googleapis.com/mcp/v1` | skip | mixed | Developer Preview. Slack is the Momentum rail. |
| 40 | People API | `people.googleapis.com/mcp/v1` | skip | read | Developer Preview. |
| 41 | Maps Code Assist | `mapscodeassist.googleapis.com/mcp` | skip | read | Product page: **experimental**. Cloud table: Preview. Dev helper, not local SEO ops. |
| 42 | Higgsfield | `mcp.higgsfield.ai/mcp` | watch | credits | Official. UGC/video. Session-present. Generations burn plan credits. |
| 43 | Canva | `mcp.canva.com/mcp` | skip | **write** | Official. Core tools any plan; resize Pro+; brand kits Enterprise. Connector vs remote vs developer are three surfaces. |
| 44 | PostHog | `mcp.posthog.com/mcp` | skip | mixed | Official. Connect/call free; some tools bill as PostHog AI. Not the reporting stack (GA4/Ads). |
| 45 | Cloudflare | `mcp.cloudflare.com/mcp` | skip | mixed | Official catalog of many `*.mcp.cloudflare.com` servers. This URL is the Code Mode API server. 2026-07-28 = spec support, not catalog launch. |
| 46 | Atlassian Rovo | `mcp.atlassian.com/v1/mcp` | skip | **write** | Official. Jira/Confluence/Compass/JSM/Bitbucket. Authv2 variant also documented. |
| 47 | Harness | `mcp.harness.io/mcp` | session | mixed | Official hosted OAuth for SaaS. Also `harness/mcp-server` + `harness-mcp-v2`. Docs updated 2026-08-14. |
| 48 | GitLab MCP server | `gitlab.com/api/v4/mcp` | skip | mixed | Official **GitLab MCP server** (Beta), not "GitLab Duo MCP." Duo availability is a prerequisite. Self-managed: `https://<host>/api/v4/mcp`. |
| 49 | Docker MCP Gateway | `docker mcp gateway run` | skip | local | Official first-party **gateway/orchestrator** for the Docker MCP Catalog (many third-party servers). AI Governance Gateway is invite-only. |
| 50 | Neon | `mcp.neon.tech/mcp` | skip | SQL | Official hosted. `?readonly=true` exists. GitHub is OSS/local. No product DB in this vault. |

## What to gate next (vault judgment, not a receipt)

Operator action, not authorization. One candidate JSON through `mcp-gate.js` at a time. Pending Inspector = sandbox-only.

Free need-list and Google ops remotes are already vault-declared (2026-08-16). Still paid / not free / not an MCP:

1. Finish Ads + GA4 ADC / developer token so the read-only servers actually answer.
2. DataForSEO **or** Ahrefs — one SEO dataset, not three. Credits.
3. Meta Ads — after Ads MCP server rules; read first. Not free.
4. WordPress.com or Adapter — only for WP clients, write off. Paid plans.
5. Finish LandingFolio Inspector (`landingfolio-verify.js` + token).
6. Authenticate Brandfetch / Netlify / Workspace OAuth / Maps key if those products are already in use. Do not deploy from Netlify MCP until asked.
7. GBP API access request — only if the 60-day verified profile + website rule is already true. See [[12_Brain/concepts/Google Business Profile API 2026|GBP API 2026]].

Do not add community GSC or GBP servers. Do not add Cloud Storage / Bigtable / a data lake. Do not wire Merchant MCP as GBP.

## Killed this sweep

- Official GBP MCP, official GSC MCP, official Obsidian MCP.
- A data lake (Cloud Storage / Bigtable / extra warehouse remotes).
- Merchant API MCP as a GBP substitute.
- last30days as an MCP product (it is a skill).
- "No official Google Ads / Meta / Semrush" (stale directory).
- Connecting 50 servers.
- Treating Cursor Cloud injections as the vault stack.
- Treating this 50 as a complete official census.
- BrightLocal as a GBP API substitute.
- "GitLab Duo MCP" as the product name.
- Official Gmail send/reply/forward tools.
- Official Google Ads mutate tools.
- GA4 remote Data API MCP as a shipped hard URL.
- Instantly "31 tools" (single help article).
- Stitch "client schema bugs reported 2026" (no first-party receipt).
- Higgsfield "MCP always burns credits" (generations do; history browse is documented).
- mohr-vault repair is an in-house rebuild, not a third-party MCP to install.

## Links

- Receipts: [[12_Brain/raw/research/2026-08-16 MCP Stack Catalog 50 Receipts]]
- GBP API: [[12_Brain/concepts/Google Business Profile API 2026|Google Business Profile API 2026]] · [[12_Brain/raw/research/2026-08-16 Google GBP API Receipts]]
- Slice: [[12_Brain/concepts/Web Design MCP Catalog 2026|Web Design MCP Catalog 2026]]
- Blind spots: [[12_Brain/concepts/MCP Blind Spots 2026|MCP Blind Spots 2026]]
- [[12_Brain/entities/LandingFolio MCP|LandingFolio MCP]] · [[12_Brain/07_Reviews/MCP/2026-07-30 - context7|Context7 review]]
- [[12_Brain/06_Research/References/2026-07-30 - Casepoint permission-aware MCP pattern|Casepoint permission-aware pattern]]
- [[12_Brain/concepts/Draft-First Operating Rules|Draft-First]] · [[12_Brain/concepts/Truth Hierarchy|Truth Hierarchy]]
