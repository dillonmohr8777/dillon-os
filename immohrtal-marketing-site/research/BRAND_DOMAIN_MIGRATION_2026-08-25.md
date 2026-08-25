# IMMOHRTAL brand and domain migration audit

Audit snapshot: 2026-08-25

Canonical public brand: **IMMOHRTAL Marketing Solutions**  
Canonical public origin: `https://immohrtalmarketing.com`

## Decision

The current visual system is not a renamed legacy skin. Every existing design decision, component, page pattern, interaction, asset treatment, particle sequence, browser frame, evidence window, agent station, and responsive behavior is now owned by IMMOHRTAL Marketing Solutions. Earlier codebases are historical implementation provenance only. They do not retain public naming, domain authority, design attribution, metadata, or brand ownership.

## Audit scope

The audit searched the complete project, including hidden design-system files, source content, the homepage shell, generated `public/` routes, ignored `dist/` output, configuration, scripts, and research artifacts. `node_modules/` and Git internals were excluded.

Search families:

- Former public name: `MOHR MEDIA`, case-insensitive
- Former public origin: `themohrmedia.com`, case-insensitive
- Current brand and origin: `IMMOHRTAL Marketing Solutions` and `immohrtalmarketing.com`

## Findings by severity

### Release blocker: stale generated canonicals and entity identifiers

At the audit snapshot, the authoritative source origin and homepage metadata had already been changed to `https://immohrtalmarketing.com`, but generated output had not yet been rebuilt:

- `public/`: 349 former-domain occurrences across 26 generated files
- `dist/`: 360 former-domain occurrences across 27 ignored build files

Affected generated file classes include route canonicals, Open Graph URLs and images, Twitter images, organization and author entity identifiers, breadcrumb identifiers, Article identifiers, RSS links, `sitemap.xml`, `robots.txt`, `feed.xml`, and `llms.txt`.

Complete affected `public/` inventory:

- `public/about/index.html`
- `public/aeo-geo/index.html`
- `public/business-agents/index.html`
- `public/contact/index.html`
- `public/content-schema/index.html`
- `public/feed.xml`
- `public/hubspot-crm-agents/index.html`
- `public/insights/aeo-vs-geo-service-businesses/index.html`
- `public/insights/ai-search-crawlers-discovery-citations/index.html`
- `public/insights/entity-first-content-architecture/index.html`
- `public/insights/google-ai-overviews-service-businesses/index.html`
- `public/insights/hubspot-business-agents-safe-integration/index.html`
- `public/insights/human-approval-gates-for-marketing-agents/index.html`
- `public/insights/index.html`
- `public/insights/javascript-seo-react-crawlable-html/index.html`
- `public/insights/measure-ai-search-visibility/index.html`
- `public/insights/schema-markup-service-businesses/index.html`
- `public/insights/website-redesign-checklist-service-businesses/index.html`
- `public/llms.txt`
- `public/robots.txt`
- `public/services/index.html`
- `public/sitemap.xml`
- `public/technical-seo/index.html`
- `public/web-design-optimization/index.html`
- `public/web-design/index.html`
- `public/work/index.html`

Complete affected `dist/` inventory:

- `dist/about/index.html`
- `dist/aeo-geo/index.html`
- `dist/business-agents/index.html`
- `dist/contact/index.html`
- `dist/content-schema/index.html`
- `dist/feed.xml`
- `dist/hubspot-crm-agents/index.html`
- `dist/index.html`
- `dist/insights/aeo-vs-geo-service-businesses/index.html`
- `dist/insights/ai-search-crawlers-discovery-citations/index.html`
- `dist/insights/entity-first-content-architecture/index.html`
- `dist/insights/google-ai-overviews-service-businesses/index.html`
- `dist/insights/hubspot-business-agents-safe-integration/index.html`
- `dist/insights/human-approval-gates-for-marketing-agents/index.html`
- `dist/insights/index.html`
- `dist/insights/javascript-seo-react-crawlable-html/index.html`
- `dist/insights/measure-ai-search-visibility/index.html`
- `dist/insights/schema-markup-service-businesses/index.html`
- `dist/insights/website-redesign-checklist-service-businesses/index.html`
- `dist/llms.txt`
- `dist/robots.txt`
- `dist/services/index.html`
- `dist/sitemap.xml`
- `dist/technical-seo/index.html`
- `dist/web-design-optimization/index.html`
- `dist/web-design/index.html`
- `dist/work/index.html`

These are generated artifacts, not independent content sources. The required remediation is a clean production build from the corrected origin followed by a zero-result scan of `public/` and `dist/`. No manual bulk replacement should be used on generated route HTML.

### Resolved source risk: former origin

The former origin is absent from authored source files outside generated `public/` and ignored `dist/` output. The two launch-critical source authorities now agree:

- `content/site-content.mjs`: `site.origin` is `https://immohrtalmarketing.com`
- `index.html`: canonical, Open Graph, Twitter, Organization, and WebSite URLs use `https://immohrtalmarketing.com`

Because source files were being updated concurrently, this report records the verified post-change state rather than attributing the edit to this audit lane.

### Intentional historical provenance

One `MOHR MEDIA` occurrence remains in `PRODUCT.md`. It names the exact historical source build and commit used as a quarry for the 3D agent renderer. The same line explicitly limits that name to non-public provenance and rejects the earlier brand, domain, metrics, pricing, and positioning as product truth.

This occurrence is intentional and must not flow into public copy, metadata, asset labels, examples, or generated output.

### No stale package identity

`package.json` and `package-lock.json` already use the private package name `immohrtal-marketing-solutions`. No package metadata change is required.

### Hosting configuration note

This project contains `vercel.json` for security and caching headers and ignores `.netlify/`. Neither file establishes the public domain. DNS, the host project mapping, HTTPS, deploy target, and any former-domain redirects require separate live verification against the actual hosting account.

## Release gate

Do not declare the migration complete until all of the following are verified:

1. `npm run build` regenerates all 23 indexable routes from the current origin.
2. A case-insensitive scan finds zero `themohrmedia.com` references in `index.html`, `public/`, and `dist/`.
3. A case-insensitive scan finds zero public `MOHR MEDIA` labels. The non-public `PRODUCT.md` provenance line is the only approved exception.
4. Every route returns the intended status and uses a self-referencing `https://immohrtalmarketing.com/...` canonical.
5. Open Graph, Twitter, Organization, WebSite, Person, Article, BreadcrumbList, Service, sitemap, feed, robots, and `llms.txt` URLs use the canonical origin.
6. `https://immohrtalmarketing.com` resolves over HTTPS to the exact intended production deployment.
7. The `www` and HTTP variants resolve or redirect consistently to the canonical origin without a chain.
8. Any controlled former domain redirects to the closest corresponding new URL with a permanent server redirect. If the former domain is not controlled, no redirect behavior is claimed.
9. Desktop and mobile pages visibly present only IMMOHRTAL Marketing Solutions while preserving the complete approved design and interaction system.

## Post-build audit commands

```powershell
rg -n -i "themohrmedia\.com|mohr\s+media" index.html public dist
rg -n -i "https://immohrtalmarketing\.com" index.html public dist
```

The first command must return no public matches. The second must cover every canonical and public entity URL expected from the 23-route build.
