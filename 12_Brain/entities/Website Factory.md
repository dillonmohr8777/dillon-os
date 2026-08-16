---
tags: [entity, system]
source: "[[12_Brain/raw/2026-07-04 - obsidian-second-brain-article]]"
updated: 2026-08-16
---

# Website Factory

**Summary:** web/landing-page production pipeline and its shipped builds (the
growth lane). Public Git describes the pipeline, not customer account IDs or
deploy credentials.

## Public facts

- Outputs: static / Netlify / Vercel marketing sites for clients.
- Templates and QA live under `_templates/site-factory/` when present, or
  campaign folders under `02_Campaigns/`.
- Secrets and host tokens never land in this note.
- Vault-declared factory MCPs (2026-08-16): [[12_Brain/entities/LandingFolio MCP|LandingFolio]] (composition, sandbox), Firecrawl keyless (harvest, ACCEPT), Playwright (QA, sandbox), Google Design (tokens/icons, ACCEPT), Brandfetch (optional logos, sandbox), Netlify (host, writes off). Harvest remains brand truth.

## Links

- [[12_Brain/concepts/Netlify Deploy Safety|Netlify Deploy Safety]]
- [[12_Brain/concepts/Web Design MCP Catalog 2026|Web Design MCP Catalog 2026]]
- [[12_Brain/entities/Momentum 360|Momentum 360]]
