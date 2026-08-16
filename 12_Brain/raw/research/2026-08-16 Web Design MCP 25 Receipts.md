---
note_type: research
status: reference
created: 2026-08-16
updated: 2026-08-16
owner: Dillon Mohr
verification_status: partial
tags: [brain, research, mcp, web-design]
---

# 2026-08-16 Web Design MCP 25 Receipts

Research receipts for "which web-design MCPs does this factory need, and 25 that exist."
Not an install list. Does not authorize connect, send, spend, or account change.
Skeptic pass ran same day (fresh context). Survivors compiled to
`12_Brain/concepts/Web Design MCP Catalog 2026.md`.

Factory contract (vault, not a vendor receipt): harvest + one-file static HTML +
`philly-sites/DESIGN-SYSTEM.md` + LandingFolio composition-only. Deploy is
Netlify-first and operator-gated. WordPress is a service lane. Shadow HVAC is
the Next.js exception.

## Vault vs session

- Vault mcp.json declares only `landingfolio`.
- Skills already name LandingFolio (composition), Playwright (QA shots),
  Firecrawl-if-available (research/harvest). Deploy is Tier 2 / human.
- Session-present Webflow / Vercel / Lovable / Magic Patterns / Higgsfield
  are not vault-owned and are not gate-accepted.

## Receipts — official first-party pages fetched 2026-08-16

### Composition / canvas / prototype

- Claim: LandingFolio hosted MCP `https://mcp.landingfolio.com/mcp`. Token
  header. Screenshots, category, source link. 100 requests/day. Not code.
  Source: https://www.landingfolio.com/mcp
  Date: accessed 2026-08-16. Official marketing.

- Claim: Official Figma remote MCP `https://mcp.figma.com/mcp`. Design context
  plus write-to-canvas (beta; Figma says write becomes usage-based paid).
  Source: https://developers.figma.com/docs/figma-mcp-server/remote-server-installation/
  Date: accessed 2026-08-16. Official. WRITE.

- Claim: Official Webflow product MCP `https://mcp.webflow.com/mcp`. OAuth.
  Designer/CMS. Separate Fern docs MCP exists at developers.webflow.com.
  Source: https://developers.webflow.com/mcp/reference/getting-started
  Also: https://developers.webflow.com/data/docs/ai-tools
  Date: accessed 2026-08-16. Official. WRITE.

- Claim: Official Canva remote MCP `https://mcp.canva.com/mcp`. Core tools any
  plan; resize Pro+; brand kits Enterprise. Separate Help Center connector and
  developer MCP (`npx @canva/cli` path documented on same site).
  Source: https://www.canva.dev/docs/mcp/
  Date: accessed 2026-08-16. Official. WRITE.

- Claim: Official Magic Patterns MCP `https://mcp.magicpatterns.com/mcp`.
  Paid plan required. Read-only URL `…/mcp/readonly`. Design-to-code and
  code-to-design. Credits billed to the account.
  Source: https://www.magicpatterns.com/docs/documentation/features/mcp-server/overview
  Date: accessed 2026-08-16. Official. WRITE unless readonly URL.

- Claim: Official Lovable MCP `https://mcp.lovable.dev`. Streamable HTTP.
  OAuth. Create/edit/deploy Lovable projects. Research Preview on docs.
  Marketing page: available on every plan including Free; OAuth only (no API
  key). Directory blogs claiming Pro-only / API-key headers are not the docs.
  Source: https://docs.lovable.dev/integrations/lovable-mcp-server
  Also: https://lovable.dev/mcp
  Date: accessed 2026-08-16. Official. WRITE.

- Claim: Official Penpot MCP exists. Marketing: https://penpot.app/ai/mcp-server
  Help: hosted or local. GitHub `penpot/penpot-mcp` archived 2026-02-03 into
  `penpot/penpot/mcp`. Skeptic: no single public URL; SaaS uses a per-user
  stream URL on the Penpot domain plus a plugin.
  Source: https://penpot.app/ai/mcp-server
  Also: https://help.penpot.app/mcp/ (skeptic)
  Date: accessed 2026-08-16. Official. WRITE.

- Claim: Official Builder Fusion MCP `https://mcp.builder.io/mcp/fusion`.
  OAuth. Create/iterate Fusion projects. Separate CMS/Publish MCP
  `https://mcp.builder.io/mcp/publish`. Third path: `npx @builder.io/dev-tools`.
  Source: https://www.builder.io/c/docs/fusion-mcp-server
  Also: https://www.builder.io/c/docs/mcp-builder-server
  Date: accessed 2026-08-16. Official. WRITE.

- Claim: Official Google Design MCP `https://design.googleapis.com/mcp`.
  Preview. Color / fonts / icons. Overview says no API key; reference mentions
  enabling MCP and auth. Skeptic: live tools/list returned 2 tools vs docs
  listing more.
  Source: https://developers.google.com/design-mcp/overview
  Date: accessed 2026-08-16. Official.

- Claim: Google Stitch product exists (Labs UI generator). Cloud remotes table
  lists Stitch Beta at `https://stitch.googleapis.com/mcp` in the prior
  50-catalog sweep. Official setup page
  `https://stitch.withgoogle.com/docs/mcp/setup` returned empty HTML this
  pass. Skeptic: no Google page printed the URL; `developers.google.com/stitch/mcp`
  404. Do not treat the URL as documented first-party until Google prints it.
  Source: https://docs.cloud.google.com/mcp/supported-products (prior catalog)
  Date: accessed 2026-08-16. Official product; MCP URL unverified in this sweep.

### Harvest / QA / deploy (factory-adjacent, not composition)

- Claim: Official Firecrawl MCP `https://mcp.firecrawl.dev/v2/mcp`. Scrape /
  map / crawl / search. Authenticated surface includes interact.
  Source: https://docs.firecrawl.dev/mcp-server
  Also: https://docs.firecrawl.dev/mcp-server/tools
  Date: accessed 2026-08-16. Official.

- Claim: Official Playwright MCP install is `npx @playwright/mcp@latest`.
  Repo is `microsoft/playwright-mcp`.
  Source: https://github.com/microsoft/playwright-mcp
  Skeptic also: https://playwright.dev/docs/getting-started-mcp
  Date: accessed 2026-08-16. Official. Local browser.

- Claim: Official Chrome DevTools MCP public preview.
  `npx chrome-devtools-mcp@latest`.
  Source: https://developer.chrome.com/blog/chrome-devtools-mcp
  Skeptic also: https://developer.chrome.com/docs/devtools/agents/get-started
  Date: published 2025-09-23 / accessed 2026-08-16. Official. Local.

- Claim: Official Netlify remote MCP `https://netlify-mcp.netlify.app/mcp`.
  Local fallback `npx -y @netlify/mcp`. Create/deploy/manage.
  Source: https://docs.netlify.com/build/build-with-ai/netlify-mcp-server
  Date: accessed 2026-08-16. Official. WRITE. Not design.

- Claim: Official Vercel MCP `https://mcp.vercel.com`.
  Source: https://vercel.com/docs/mcp/vercel-mcp
  Date: 2026-07-23 / accessed 2026-08-16. Official. Not the factory host.

- Claim: Official WordPress.com MCP
  `https://public-api.wordpress.com/wpcom/v2/mcp/v1`. Paid plans. Default
  write tools off.
  Source: https://developer.wordpress.com/docs/mcp/
  Date: last updated 2026-06-19 / accessed 2026-08-16. Official. WRITE.

### Assets / brand / image

- Claim: Official Brandfetch MCP `https://mcp.brandfetch.io/mcp`. OAuth or
  dashboard MCP token as bearer. Logos, colors, fonts, brand context. Free
  plan 100 requests/month. MCP counts against Brand API quota.
  Source: https://docs.brandfetch.com/mcp/overview
  Date: accessed 2026-08-16. Official.

- Claim: Official Recraft remote MCP `https://mcp.recraft.ai/mcp`. OAuth.
  Image/vector generate/edit. Burns subscription credits. Local npm package
  deprecated.
  Source: https://www.recraft.ai/docs/mcp-reference/remote-server
  Date: accessed 2026-08-16. Official. Credits.

- Claim: Official Higgsfield MCP `https://mcp.higgsfield.ai/mcp`. OAuth.
  Image/video generations burn plan credits. Skeptic: help article "how do I
  connect" left the URL blank and said active paid subscription.
  Source: https://higgsfield.ai/mcp
  Date: accessed 2026-08-16. Official. Credits.

### Component registries / other builders / CMS / docs

- Claim: Official shadcn MCP via `npx shadcn@latest mcp`. Browse/install
  registry components into a `components.json` project (React).
  Source: https://ui.shadcn.com/docs/mcp
  Date: accessed 2026-08-16. Official.

- Claim: Official Storybook MCP via `@storybook/addon-mcp`. Served from the
  running Storybook (example `http://localhost:6006/mcp`). Preview. Docs
  toolset React-only.
  Source: https://storybook.js.org/docs/ai/mcp/overview
  Date: accessed 2026-08-16 (v10.5 docs). Official. Not a hosted catalog.

- Claim: Official Wix MCP `https://mcp.wix.com/mcp`. Docs search plus
  List/Call/Manage Wix sites. WRITE on site tools.
  Source: https://dev.wix.com/docs/api-reference/articles/wix-mcp/about-the-wix-mcp
  Date: accessed 2026-08-16. Official.

- Claim: Official Sanity hosted MCP `https://mcp.sanity.io`. OAuth or token.
  GROQ, documents, schema. CMS, not one-file HTML.
  Source: https://www.sanity.io/docs/ai/mcp-server
  Date: accessed 2026-08-16. Official. WRITE.

- Claim: Official Context7 MCP `https://mcp.context7.com/mcp`. Library docs.
  Source: https://context7.com/docs/resources/all-clients
  Date: accessed 2026-08-16. Official.

- Claim: Official Adobe Express Developer MCP
  `npx @adobe/express-developer-mcp@latest`. Add-on documentation and
  TypeScript definitions. Not a live Express canvas. Free. Replaces deprecated
  `@adobe/express-add-on-dev-mcp`.
  Source: https://developer.adobe.com/express/add-ons/docs/guides/getting-started/local-development/mcp-server
  Also: https://blog.developer.adobe.com/en/publish/2026/03/build-faster-with-the-adobe-express-developer-mcp-server
  Date: Mar 2026 blog / accessed 2026-08-16. Official. Docs only.

## Killed / not catalog rows

- Official Framer MCP: Framer Server API intro mentions "build a little MCP"
  as a use case. Skeptic: External Agents page (published 2026-08-14) says
  you do not set up a Framer MCP; Framer ships `@framer/agent`.
  Source: https://www.framer.dev/developers/server-api-introduction
  Skeptic: https://www.framer.com/agents/external/
  Community `framer-mcp-server` packages are not first-party.

- Official Relume MCP: not found.
- Official Unsplash MCP: community wrappers only.
- Official Iconify MCP: community wrappers only.
- Official Squarespace MCP: not found.
- Official Ghost MCP: not found.
- Official Contentful MCP: not found this sweep.
- Official Adobe Firefly / Creative Cloud canvas MCP: Express Developer MCP
  is docs-only; Firefly wrappers are unofficial.
- Connecting 25 design servers.
- Treating Magic Patterns / Lovable / Stitch / Webflow as factory replacements.
- Treating harvest/QA/deploy MCPs as composition tools.

## Skeptic (same day, fresh context)

- Only LandingFolio, Figma, Webflow, Canva, and Magic Patterns survive as
  first-party **composition/canvas** MCPs with a durable public URL.
- Firecrawl / Playwright / DevTools / Netlify / Vercel / WP.com / Context7 /
  Brandfetch / Recraft / Higgsfield / shadcn / Storybook / Wix / Sanity /
  Lovable / Builder / Adobe Express Developer / Google Design are first-party
  but not "compose a landing page" tools. Keep them in the 25 as orbit rows
  with honest job labels.
- Stitch URL: kill as documented until Google prints it.
- Penpot: official product, no single public URL.
- Playwright install string is `@playwright/mcp@latest`, not the repo name.
- WordPress.com MCP is paid-plan.
- Magic Patterns MCP is paid-plan (confirmed).
- Higgsfield help vs marketing disagree on paid and URL.
- Factory need list is small: LandingFolio + harvest fetch + one browser QA.
  Brandfetch optional. WP.com only for paid WP.com jobs. Netlify is deploy,
  not design. Do not run Playwright and DevTools always-on together.
