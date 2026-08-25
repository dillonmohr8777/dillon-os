# IMMOHRTAL Marketing Solutions website

Production website for **IMMOHRTAL Marketing Solutions**.

- Canonical public origin: `https://www.immohrtalmarketing.com`
- Public brand: `IMMOHRTAL Marketing Solutions`
- Stack: Vite, React, TypeScript, Three.js, React Three Fiber, and generated static content routes
- Indexable launch surface: 23 URLs, including 10 editorial guides

## Brand and domain guardrail

Every design decision, component, page pattern, interaction, asset treatment, particle sequence, agent station, and responsive behavior in this repository belongs to IMMOHRTAL Marketing Solutions. Earlier builds may be used as historical implementation provenance only. Their names, domains, positioning, and attribution must not appear in public pages, metadata, structured data, feeds, sitemaps, crawler files, or generated discovery summaries.

The canonical origin is configured once in `content/site-content.mjs`. The homepage metadata in `index.html` must match it. Generated route HTML, `sitemap.xml`, `feed.xml`, `robots.txt`, and `llms.txt` are release artifacts and must be regenerated before deployment.

## Development

```powershell
npm install
npm run dev
```

## Production build

```powershell
npm run build
npm run preview
```

`npm run build` regenerates the static content routes before compiling the React application. A release is not ready until the built output contains no former-domain references and live canonical, redirect, sitemap, robots, metadata, and structured-data behavior has been verified on `https://www.immohrtalmarketing.com`.

## Design authority

`PRODUCT.md` owns durable product, brand, domain, audience, evidence, and publishing truth. `DESIGN.md` owns the visual system. The `.impeccable/surfaces/` briefs own surface-specific composition and mode.
