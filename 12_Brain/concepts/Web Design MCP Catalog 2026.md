---
tags: [concept, mcp, research, web-design]
source: "[[12_Brain/raw/research/2026-08-16 Web Design MCP 25 Receipts]]"
updated: 2026-08-16
expires: 2026-11-14
---

# Web Design MCP Catalog — 2026

**Summary:** this factory needs four web-design MCPs, not 25 — LandingFolio (have), Firecrawl, one browser QA, and Netlify when deploy is an explicit ask.

This page does not authorize connect, send, spend, or account change. Every new server still goes through `_os/automation/bin/mcp-gate.js`. See [[12_Brain/concepts/MCP Stack Catalog 2026|MCP Stack Catalog 2026]] for the wider 50. Factory contract: [[12_Brain/entities/Website Factory|Website Factory]] + [[12_Brain/entities/LandingFolio MCP|LandingFolio]] composition-only + `philly-sites/DESIGN-SYSTEM.md`.

## What you need

Vault-declared: **LandingFolio only** (sandbox; Inspector pending). Brand still comes from harvest, never from a reference screenshot.

| Need | MCP | Job in this factory | Do not |
|---|---|---|---|
| Have | **LandingFolio** | Section composition screenshots. Skills already name it. | Copy a reference through. Query by client name. |
| Gate | **Firecrawl** | Harvest the live site → markdown/map. Not a layout library. | Enable `firecrawl_interact` (overlaps Playwright). |
| Gate | **Playwright** (`npx @playwright/mcp@latest`) | Factory QA already wants headed shots at 390/850/1440. | Also leave Chrome DevTools always-on. Pick one browser. |
| Later | **Netlify** | Factory host. Deploy/forms. Not design. | Turn on writes until Dillon asks for a deploy. |
| Only if | **WordPress.com** | Paid WP.com clients. Webflow does not touch WP. | Self-hosted WP (use Adapter, write off) or static demos. |
| Optional | **Brandfetch** *or* **Google Design** | Logos/colors/icons when harvest shots are thin. | Both. Neither composes a page. Harvest still wins. |

Context7 (ACCEPT, not in vault mcp.json) stays for the Next exception ([[01_Clients/Shadow HVAC/website|Shadow HVAC]]), not for batch HTML.

**Do not add** Figma, Magic Patterns, Lovable, Webflow, Wix, Penpot, Builder, Stitch, Canva, Recraft, Higgsfield, shadcn, or Storybook to the factory stack. They replace the pipeline or target React/canvas products this vault does not ship.

## The 25 (web-design orbit, 2026-08-16)

Do not connect all of these. Job labels are honest: most are not composition.

Fit: **vault** / **accept** / **need** / **session** / **skip** / **watch**.

| # | Server | Job | Fit | Write | Endpoint |
|---|---|---|---|---|---|
| 1 | LandingFolio | composition screenshots | vault | read | `mcp.landingfolio.com/mcp` |
| 2 | Firecrawl | harvest scrape | **need** | mixed | `mcp.firecrawl.dev/v2/mcp` |
| 3 | Playwright | visual QA | **need** | browser | `npx @playwright/mcp@latest` |
| 4 | Chrome DevTools | LCP / console | skip | local | `npx chrome-devtools-mcp@latest` (overlaps #3) |
| 5 | Netlify | factory deploy | **need** | **write** | `netlify-mcp.netlify.app/mcp` |
| 6 | WordPress.com | WP.com admin | watch | **write** | `public-api.wordpress.com/wpcom/v2/mcp/v1` (paid plans) |
| 7 | Context7 | library docs | accept | read | `mcp.context7.com/mcp` |
| 8 | Brandfetch | logos / colors | watch | credits | `mcp.brandfetch.io/mcp` (100/mo free) |
| 9 | Figma | canvas + design-to-code | skip | **write** | `mcp.figma.com/mcp` |
| 10 | Webflow | hosted builder | skip | **write** | `mcp.webflow.com/mcp` |
| 11 | Canva | design assets | skip | **write** | `mcp.canva.com/mcp` |
| 12 | Magic Patterns | prototype ↔ code | skip | **write** | `mcp.magicpatterns.com/mcp` (paid; readonly URL exists) |
| 13 | Lovable | full-stack app builder | skip | **write** | `mcp.lovable.dev` |
| 14 | Google Design | color / icons | watch | read | `design.googleapis.com/mcp` |
| 15 | Penpot | open-source canvas | skip | **write** | per-user stream URL + plugin; no single public URL |
| 16 | Builder Fusion | visual / design-system agent | skip | **write** | `mcp.builder.io/mcp/fusion` |
| 17 | Builder CMS | Publish-space CMS | skip | **write** | `mcp.builder.io/mcp/publish` |
| 18 | shadcn | React registry install | skip | local | `npx shadcn@latest mcp` |
| 19 | Storybook | running Storybook MCP | skip | local | `@storybook/addon-mcp` on your port; React preview |
| 20 | Recraft | image / vector gen | skip | credits | `mcp.recraft.ai/mcp` |
| 21 | Higgsfield | image / video gen | skip | credits | `mcp.higgsfield.ai/mcp` (paid help vs marketing disagree) |
| 22 | Wix | Wix docs + site APIs | skip | **write** | `mcp.wix.com/mcp` |
| 23 | Sanity | headless CMS | skip | **write** | `mcp.sanity.io` |
| 24 | Vercel | Next deploy / docs | session | mixed | `mcp.vercel.com` (not factory host) |
| 25 | Adobe Express Developer | add-on **docs**, not canvas | skip | read | `npx @adobe/express-developer-mcp@latest` |

## Killed this sweep

- Official Framer MCP. Server API says you can build one; External Agents (2026-08-14) says skip MCP setup. Community Framer MCP packages are not first-party.
- Official Relume, Unsplash, Iconify, Squarespace, Ghost, Contentful MCPs (not found).
- Official Google Stitch MCP URL. Product exists; `stitch.withgoogle.com/docs/mcp/setup` was an empty page this pass. Do not catalog `stitch.googleapis.com/mcp` until Google prints it.
- Official Adobe Firefly / Creative Cloud canvas MCP (Express Developer is docs-only).
- Connecting 25. Treating Lovable / Magic Patterns / Webflow as the factory.
- Running Playwright and Chrome DevTools always-on together.

## Gate next (vault judgment, not a receipt)

1. Finish LandingFolio Inspector (`landingfolio-verify.js` + token).
2. Firecrawl — harvest already expects it; interact off.
3. Playwright — if the host is not already injecting it; QA only.
4. Netlify — writes off until an explicit deploy ask.
5. WordPress.com — only for a paid WP.com client, write off.

## Links

- Receipts: [[12_Brain/raw/research/2026-08-16 Web Design MCP 25 Receipts]]
- [[12_Brain/concepts/MCP Stack Catalog 2026|MCP Stack Catalog 2026]]
- [[12_Brain/entities/LandingFolio MCP|LandingFolio MCP]] · [[12_Brain/entities/Website Factory|Website Factory]]
- [[12_Brain/concepts/Netlify Deploy Safety|Netlify Deploy Safety]]
- Skills: `/site-factory` · `/frontend-build` · `/ui-design`
