---
note_type: research
status: reference
created: 2026-08-16
updated: 2026-08-16
owner: Dillon Mohr
verification_status: partial
tags: [brain, research, mcp]
---

# 2026-08-16 MCP Stack Catalog 50 Receipts

Research receipts for "what MCPs does this stack need, and 50 that exist."
Not an install list. Does not authorize connect, send, spend, or account change.
Skeptic pass ran same day (fresh context). Survivors compiled to
`12_Brain/concepts/MCP Stack Catalog 2026.md`.

X MCP tool discovery failed this session. Exa hit a free-tier rate limit
on one call; later session status was ready. Directory blogs and
`awesome-gtm-mcp-servers` (claims no official Google Ads / Meta / Semrush)
are not used as official-status proof.

## Vault vs session (this run)

- Vault `.cursor/mcp.json` and `.mcp.json` declare only `landingfolio`.
- MCP reviews exist only for LandingFolio (sandbox-only, Inspector pending)
  and Context7 (ACCEPT 2026-07-30). Context7 is not in vault mcp.json.
- This Cloud Agent session injected many host MCPs. Session-present is not
  vault-declared and is not gate-accepted.
- Official Google Gmail MCP tool list is draft/label/search. This session's
  Gmail surface also listed send/reply/forward. Catalog official Google docs,
  not the Cursor tool dump.

## Receipts — official first-party pages fetched 2026-08-16

### Ads / analytics

- Claim: Official Google Ads MCP is read-only. Tools: `get_resource_metadata`,
  `list_accessible_customers`, `search` (GAQL). Transport stdio; optional
  Cloud Run HTTP. Auth OAuth or service account + developer token.
  Source: https://developers.google.com/google-ads/api/docs/developer-toolkit/mcp-server
  Date: accessed 2026-08-16. Official. Not on Cloud remote supported-products table.

- Claim: Official GA4 MCP landing exists.
  Source: https://developers.google.com/analytics/devguides/MCP
  Date: accessed 2026-08-16. Official. Local repo labeled Experimental.
  Skeptic: remote `https://analyticsdata.googleapis.com/mcp/v1` returned HTTP 200
  with `run_report`, `get_metadata`, `run_realtime_report`, `check_compatibility`
  on the skeptic run. Do not ship a hard "404" for that endpoint.

- Claim: Meta ads MCP opened to any developer with a Meta app. Create/edit/delete
  campaigns, ad sets, ads, audiences, catalogs. Rolling access.
  Source: https://developers.facebook.com/blog/post/2026/07/16/meta-ads-mcp-server/
  Date: 2026-07-16. Official.
  Also: https://www.facebook.com/business/news/meta-ads-ai-connectors
  Date: 2026-04-29, update 2026-07-16. Official. WRITE. Ads land paused per
  failure-mode research; portfolio rules can block budget edits.

### Comms / Workspace

- Claim: Official Gmail remote MCP `https://gmailmcp.googleapis.com/mcp/v1`.
  Tools listed: create_draft, get_thread, label_*, list_*, search_threads,
  unlabel_*. Docs say draft then send from Gmail. Prompt-injection warning.
  Source: https://developers.google.com/workspace/gmail/api/guides/configure-mcp-server
  Date: accessed 2026-08-16. Official. Developer Preview on Cloud supported-products.

- Claim: Official Slack MCP `https://mcp.slack.com/mcp`. Streamable HTTP.
  Tools include search AND send message, create conversation, canvases, reactions.
  Source: https://docs.slack.dev/ai/slack-mcp-server/
  Date: accessed 2026-08-16. Official. Changelog 2026-02-17 cited by researchers.

- Claim: Google-managed remote MCP table includes Drive, Gmail, Calendar, Chat,
  People (all Developer Preview). Also Design (Preview), Stitch (Beta),
  Maps Grounding Lite, Maps Code Assist (Preview). No Search Console, no
  Business Profile, no Google Ads, no Analytics rows on that table.
  Source: https://docs.cloud.google.com/mcp/supported-products
  Date: accessed 2026-08-16. Official. Absence of Ads/GA4 here ≠ those local
  official servers do not exist.

- Claim: Design MCP is a headless design engine (color, fonts, icons) at
  `design.googleapis.com`. No API key or OAuth required per overview page.
  Source: https://developers.google.com/design-mcp/overview
  Date: accessed 2026-08-16. Official. Preview.

### Sites / CRM / deploy

- Claim: Official Netlify remote MCP `https://netlify-mcp.netlify.app/mcp`.
  Local fallback `npx -y @netlify/mcp`. Can create/deploy/manage.
  Source: https://docs.netlify.com/build/build-with-ai/netlify-mcp-server
  Date: accessed 2026-08-16. Official. WRITE.

- Claim: Official Vercel MCP `https://mcp.vercel.com`. Docs last_updated 2026-07-23.
  Search docs, manage teams/projects/deployments, query Web Analytics.
  Source: https://vercel.com/docs/mcp/vercel-mcp
  Date: 2026-07-23 / accessed 2026-08-16. Official. Do not freeze 2025 "read-only beta."

- Claim: Official Webflow MCP. Remote + Designer companion app. Canvas writes.
  Source: https://developers.webflow.com/data/docs/ai-tools
  Date: accessed 2026-08-16. Official. WRITE. Live canvas needs Bridge app open.

- Claim: Official WordPress.com MCP `https://public-api.wordpress.com/wpcom/v2/mcp/v1`.
  Paid plans. Default read-only tools on; write tools exist and can be enabled.
  Source: https://developer.wordpress.com/docs/mcp/
  Date: last updated 2026-06-19 / accessed 2026-08-16. Official.

- Claim: Official WordPress MCP Adapter maps Abilities → MCP tools.
  Source: https://developer.wordpress.org/news/2026/02/from-abilities-to-ai-agents-introducing-the-wordpress-mcp-adapter/
  Date: February 2026. Official (WordPress.org news). Separate from WP.com hosted MCP.

- Claim: HubSpot remote MCP GA 2026-04-13. Endpoint `https://mcp.hubspot.com`.
  OAuth 2.1 + PKCE. CRM read + create/update. Separate local Developer MCP.
  Source: https://developers.hubspot.com/changelog/remote-hubspot-mcp-server-is-now-generally-available
  Date: 2026-04-13, changelog updated 2026-04-15. Official. WRITE.

- Claim: Official Shopify Storefront MCP `https://{shop}.myshopify.com/api/mcp`
  (cart/policies) and `https://{shop}.myshopify.com/api/ucp/mcp` (catalog).
  No auth. Not Admin API.
  Source: https://shopify.dev/docs/apps/build/storefront-mcp/servers/storefront
  Date: accessed 2026-08-16. Official.

### SEO / scrape / research

- Claim: Official Firecrawl MCP `https://mcp.firecrawl.dev/v2/mcp` (Bearer key)
  and `/v2/mcp-oauth`. Keyless limited to Search/Scrape/Parse.
  Source: https://docs.firecrawl.dev/mcp-server
  Date: accessed 2026-08-16. Official.

- Claim: Official DataForSEO MCP `https://mcp.dataforseo.com/mcp`. Basic auth
  or OAuth. SERP, keyword, on-page, labs, backlinks, business data. Burns credits.
  Source: https://dataforseo.com/model-context-protocol
  Date: accessed 2026-08-16. Official.

- Claim: Official Ahrefs remote MCP `https://api.ahrefs.com/mcp/mcp`. Lite+.
  Burns API units. Local MCP no longer supported.
  Source: https://docs.ahrefs.com/mcp/docs/introduction.md
  Date: accessed 2026-08-16. Official.

- Claim: Official Semrush MCP `https://mcp.semrush.com/v2/mcp`. Streamable HTTP.
  Trends + SEO APIs + read-only Projects API. Burns units.
  Source: https://developer.semrush.com/api/introduction/semrush-mcp/
  Date: last updated 2026-08-05. Official.

- Claim: Official ScrapeCreators MCP `https://api.scrapecreators.com/mcp`.
  OAuth or x-api-key. Public social + ad-library scrape.
  Source: https://docs.scrapecreators.com/integrations/mcp/
  Date: accessed 2026-08-16. Official.

- Claim: Official Instantly remote MCP `https://mcp.instantly.ai/mcp`.
  Help center lists campaign create/pause, leads, email view/reply/verify,
  analytics, accounts. "31 tools" is single-source (that article).
  Source: https://help.instantly.ai/en/articles/12980002-instantly-mcp-model-context-protocol
  Date: "Updated over 3 weeks ago" / accessed 2026-08-16. Official help center.
  WRITE. Conflicts with draft-first if send/pause enabled.

- Claim: BrightLocal launched an official MCP 2026-01-15 as BrightLocal Anywhere.
  Grow plan + Labs. Read now; write "later" / next round (hours, keywords).
  Source: https://www.brightlocal.com/blog/introducing-mcp-server/
  Date: 2026-01-15. Official blog. Developer docs URL was flaky (500 then 200).
  No durable public endpoint verified in the compiled page.

- Claim: Screaming Frog SEO Spider 24 shipped a native MCP 2026-05-19.
  Local desktop, paid licence.
  Source: https://www.screamingfrog.co.uk/blog/seo-spider-24/
  Date: 2026-05-19. Official.

### Design / browser / payments / issues

- Claim: Official Figma remote MCP `https://mcp.figma.com/mcp`. Write to canvas.
  Source: https://developers.figma.com/docs/figma-mcp-server/remote-server-installation/
  Date: accessed 2026-08-16. Official. WRITE.

- Claim: Official Notion remote MCP. Read/create/update pages and databases. OAuth.
  Source: https://developers.notion.com/docs/mcp
  Date: accessed 2026-08-16. Official. Skeptic: canonical path also
  `developers.notion.com/guides/mcp`; URL `https://mcp.notion.com/mcp`. WRITE.

- Claim: Official Linear MCP `https://mcp.linear.app/mcp` (read-write default)
  and `/mcp/readonly`.
  Source: https://linear.app/docs/mcp
  Date: accessed 2026-08-16. Official.

- Claim: Official Stripe MCP `https://mcp.stripe.com`. OAuth or restricted key.
  Source: https://docs.stripe.com/mcp
  Date: accessed 2026-08-16. Official. WRITE to Stripe resources.

- Claim: Official Sentry MCP `https://mcp.sentry.dev/mcp`. OAuth. Org/project scope.
  Source: https://docs.sentry.io/product/sentry-mcp/
  Date: accessed 2026-08-16. Official.

- Claim: Official Perplexity MCP `https://api.perplexity.ai/mcp`. Bearer API key.
  Tools: search, ask, research, reason. Overlaps Exa.
  Source: https://docs.perplexity.ai/guides/mcp-server
  Date: accessed 2026-08-16. Official.

- Claim: Official Browserbase MCP (hosted Streamable HTTP + local stdio).
  Overlaps Playwright.
  Source: https://docs.browserbase.com/integrations/mcp/introduction
  Date: accessed 2026-08-16. Official. Hosted URL from vendor docs:
  https://mcp.browserbase.com/mcp (skeptic).

- Claim: Official Chrome DevTools MCP public preview. `npx chrome-devtools-mcp@latest`.
  Source: https://developer.chrome.com/blog/chrome-devtools-mcp
  Date: published 2025-09-23. Official. Local, not hosted.

- Claim: Official Playwright MCP is `microsoft/playwright-mcp`.
  Source: https://github.com/microsoft/playwright-mcp
  Date: accessed 2026-08-16. Official. Local.

- Claim: Official GitHub MCP setup lives in Copilot docs.
  Source: https://docs.github.com/en/copilot/how-tos/provide-context/use-mcp/set-up-the-github-mcp-server
  Date: accessed 2026-08-16. Official. Remote cited by skeptic:
  `https://api.githubcopilot.com/mcp/`.

- Claim: Official Higgsfield MCP `https://mcp.higgsfield.ai/mcp`. OAuth, no API key.
  Image/video generation burns plan credits. MCP generations are not "unlimited."
  Source: https://higgsfield.ai/mcp
  Date: accessed 2026-08-16. Official. Also help:
  https://higgsfield.ai/creator-hub/help-center/mcp-cli/what-is-higgsfield-mcp

- Claim: Canva AI Connector is MCP-backed for Pro/Teams/Business/Nonprofit.
  Help page: not the same as Canva Developer MCP.
  Source: https://www.canva.dev/docs/connect/canva-mcp-server-setup/
  Date: accessed 2026-08-16 (page resolved to Canva Help). Official help.
  Skeptic: IT/admin URL `https://mcp.canva.com/mcp`. Three surfaces.

### Extra official (search + first-party URL, not all fully fetched)

- Claim: Official PostHog MCP `https://mcp.posthog.com/mcp`.
  Source: https://posthog.com/docs/model-context-protocol
  Date: accessed via search 2026-08-16. Official docs URL.

- Claim: Official Cloudflare managed MCP catalog. API server
  `https://mcp.cloudflare.com/mcp`. Docs updated 2026-07-28.
  Source: https://developers.cloudflare.com/agents/model-context-protocol/cloudflare/servers-for-cloudflare/
  Date: 2026-07-28. Official.

- Claim: Official Atlassian Rovo MCP. Endpoint
  `https://mcp.atlassian.com/v1/mcp` (authv2 variant also documented).
  Jira/Confluence/Bitbucket write.
  Source: https://developer.atlassian.com/cloud/rovo-mcp/
  Date: accessed via search 2026-08-16. Official.

- Claim: Official Harness MCP repo `https://github.com/harness/mcp-server`.
  Date: accessed via catalog 2026-08-16. Official repo. This session needsAuth.

## Killed / not catalog rows

- Official Google Business Profile MCP: not on supported-products; my-business
  docs are API-only. Community repos only (narkov, A1-x-Tech).
- Official Search Console MCP: open request google/mcp#17; community only.
- Official Obsidian MCP: community Local REST API wrappers. Vault is already files.
- last30days as an MCP product: it is a skill.
- "Connect 50 servers": contradicts MCP client best practices and this vault's
  overlap gate.
- `awesome-gtm-mcp-servers` "no official Google Ads / Meta / Semrush": stale,
  contradicted by first-party pages fetched this run.
- X as official first-party MCP: this session discovery failed; no first-party
  docs page fetched (403 on docs.x.com/tools/mcp).
- cursor-cloud: Cursor-internal diagnostics, not a vendor product to adopt.
- Memory / Sequential Thinking: MCP reference servers, not vendor products.
- Composio, Magic Patterns, Lovable, Agentmail, Braintrust: session-present;
  no first-party page fetched this run. Appendix only.

## Dillon OS work-lane map (vault, not a receipt)

Skills/agents already name Slack, LandingFolio, Context7, X, Firecrawl,
Gmail/Calendar, Google Ads, GA4, Search Console. Morning-loop handoff names
Gmail, Google Ads, GA4, Vercel. Factory deploys are Netlify-first
(`Netlify Deploy Safety`). SEO agent: reports wait on GSC/GA4 MCPs.
Google Ads agent: live apply is Chrome CDP or platform MCPs.
Draft-first names HubSpot. mohr-vault MCP is a dead in-house server
(00_Inbox Top 15 #14), not a third-party product.

## Skeptic + missing-receipt fetches (same day, fresh context)

Fresh-context skeptic attacked the compiled 50. Survivors and kills compiled
above. Additional first-party pages fetched 2026-08-16 after the first pass:

- Claim: Official Exa hosted MCP is `https://mcp.exa.ai/mcp`. First-party
  GitHub org repo `exa-labs/exa-mcp-server` (homepage
  `https://docs.exa.ai/reference/exa-mcp`). Hosted works anonymously with
  rate limits; OAuth or API key for higher limits. This session's Exa MCP
  returned a free-tier rate-limit JSON-RPC error pointing at that URL.
  Source: https://github.com/exa-labs/exa-mcp-server
  Also: https://docs.exa.ai/reference/exa-mcp (fetch timed out this pass;
  GitHub org README + live rate-limit response used).
  Date: accessed 2026-08-16. Official.

- Claim: Official GitLab product name is **GitLab MCP server** (Beta), not
  "GitLab Duo MCP." HTTP `https://<host>/api/v4/mcp`. Duo availability is a
  prerequisite. Free/Premium/Ultimate; GitLab.com / Self-Managed / Dedicated.
  Source: https://docs.gitlab.com/user/model_context_protocol/mcp_server/
  Date: accessed 2026-08-16 (WebSearch snippet + docs title). Direct fetch
  timed out / 503 on an older Duo-path URL.

- Claim: Docker MCP Gateway is Docker's open-source orchestrator/proxy for
  MCP servers from the Docker MCP Catalog. Runs servers as isolated
  containers. `docker mcp gateway run`. AI Governance Gateway is invite-only.
  Source: https://docs.docker.com/ai/mcp-catalog-and-toolkit/mcp-gateway/
  Date: accessed 2026-08-16. Official. Also https://github.com/docker/mcp-gateway

- Claim: Official Neon hosted MCP `https://mcp.neon.tech/mcp`. Supports
  `?readonly=true`, `?projectId=`, `?category=`. Deprecated SSE
  `https://mcp.neon.tech/sse`. Docs recommend MCP for development/testing
  only, not production.
  Source: https://neon.com/docs/ai/neon-mcp-server
  Date: accessed 2026-08-16. Official.

- Claim: Official PostHog hosted MCP `https://mcp.posthog.com/mcp`.
  Connect/call is free; some tools bill as PostHog AI. Read and write.
  Source: https://posthog.com/docs/model-context-protocol
  Date: accessed 2026-08-16. Official.

- Claim: Cloudflare runs a catalog of managed remote MCP servers. The URL
  `https://mcp.cloudflare.com/mcp` is the Cloudflare API / Code Mode server
  (`search` + `execute`). Many product-specific `*.mcp.cloudflare.com/mcp`
  servers exist. "2026-07-28" on the page is MCP spec support, not catalog
  launch.
  Source: https://developers.cloudflare.com/agents/model-context-protocol/cloudflare/servers-for-cloudflare/
  Date: accessed 2026-08-16. Official.

- Claim: Official Atlassian Rovo MCP endpoint
  `https://mcp.atlassian.com/v1/mcp`. Write across Jira, Confluence, Compass,
  JSM, Bitbucket. OAuth 2.1. Page last updated Jun 30, 2026.
  Source: https://developer.atlassian.com/cloud/rovo-mcp/
  Date: accessed 2026-08-16. Official.

- Claim: Official Harness hosted MCP `https://mcp.harness.io/mcp` (OAuth for
  SaaS). Also open-source `github.com/harness/mcp-server` and npm
  `harness-mcp-v2`. 11 consolidated tools. Docs last updated 2026-08-14.
  Source: https://developer.harness.io/docs/platform/harness-ai/harness-mcp-server/
  Date: 2026-08-14 / accessed 2026-08-16. Official.

- Claim: BrightLocal help names BrightLocal Anywhere URL
  `https://mcp.brightlocal.com/mcp?api-key=YOUR_API_KEY`. Grow plan required
  (Track/Manage must upgrade). Help article is ChatGPT connector setup.
  Direct fetch of help.brightlocal.com hit Cloudflare bot challenge; URL and
  plan language from search snippets of official help.
  Source: https://help.brightlocal.com/hc/en-us/articles/31736426555666-How-do-I-connect-BrightLocal-Anywhere-to-ChatGPT
  Also: https://help.brightlocal.com/hc/en-us/articles/31736361283602-What-is-BrightLocal-Anywhere
  Date: accessed 2026-08-16. Official help. Not a GBP API.

- Claim: LandingFolio marketing page lists
  `https://mcp.landingfolio.com/mcp` and "4,600+ components." Token header
  auth. 100 req/day free.
  Source: https://www.landingfolio.com/mcp
  Date: accessed 2026-08-16. Official marketing (not a developer spec).

- Claim: Context7 first-party client docs list `https://mcp.context7.com/mcp`.
  Source: https://context7.com/docs/resources/all-clients
  Date: accessed 2026-08-16. Official.

- Claim: Firecrawl official tools include `firecrawl_interact` and
  `firecrawl_interact_stop` for clicks, forms, navigation, dynamic pages.
  Keyless hosted mode is search/scrape/parse only.
  Source: https://docs.firecrawl.dev/mcp-server/tools
  Date: accessed 2026-08-16. Official.

- Claim: Canva official remote `https://mcp.canva.com/mcp`. Prerequisites: a
  Canva account (any plan). Core features all plans; resize Pro+; brand kits
  Enterprise. Separate Help Center AI Connector vs developer MCP.
  Source: https://www.canva.dev/docs/mcp/
  Date: accessed 2026-08-16. Official.

- Claim: Maps Code Assist product page titles the toolkit **experimental**.
  Endpoint `https://mapscodeassist.googleapis.com/mcp`. Cloud supported-
  products table lists it as Preview. Both labels are first-party.
  Source: https://developers.google.com/maps/ai/code-assist
  Date: accessed 2026-08-16. Official.

- Claim: Official GA4 MCP landing documents the local Experimental server
  ("Try the Google Analytics MCP server"). Does not document a remote Data
  API MCP URL on that page.
  Source: https://developers.google.com/analytics/devguides/MCP
  Date: accessed 2026-08-16. Official.
  Skeptic contradiction: earlier same-day fetch of
  `https://analyticsdata.googleapis.com/mcp/v1` returned HTTP 200 with
  report tools; skeptic pass got HTTP 404. Do not ship a hard remote URL.

- Claim: Official GSC MCP still does not exist (google/mcp#17 open). Official
  GBP MCP still does not exist (my-business is API-only). Official Obsidian
  MCP still does not exist (forum request for a core plugin).
  Date: skeptic pass 2026-08-16.

- Killed by skeptic: "50 first-party MCPs exist" as a census; Context7 Fit
  `have` meaning vault-owned; BrightLocal as GBP stand-in; "GitLab Duo MCP"
  product name; Instantly "31 tools"; Stitch schema-bugs clause; Higgsfield
  "MCP always burns credits"; GA4 remote as verified; Gmail send tools;
  Google Ads mutate tools.
