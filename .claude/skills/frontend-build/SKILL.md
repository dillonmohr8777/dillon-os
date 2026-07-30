---
name: frontend-build
description: Front-end implementation standards for batch sites: semantic markup, performance budget, responsive behavior, and no-JS resilience. Use when generating or hand-editing any site in the factory.
---

# Front-end Build

How batch sites are actually implemented. The generator at `_templates/site-factory/build-site.js` already enforces most of this; follow it when hand-editing or when adding a skin layer.

## Architecture

- **One self-contained `index.html`** per site: inline `<style>`, inline reveal script, local `assets/`. No build step, no framework, no runtime dependency. This is why 25 sites a week is feasible and why every preview deploys as a static drop.
- **Page weight budget: 27 to 37 KB** of HTML (matching the measured range of the 25). Images are separate and lazy.
- Customization goes in a `.slug-<name>` skin layer appended after the base CSS. Never fork the base.

## Markup

- Semantic sectioning: `<header>`, `<main id="main">`, `<section>`, `<figure>`/`<figcaption>`, `<address>`, `<footer>`
- Skip link as the first focusable element
- `<nav aria-label="Primary">` and a labeled footer nav
- Decorative flourishes carry `aria-hidden="true"`
- `LocalBusiness` JSON-LD in the head with name, url, telephone, address
- `noindex,nofollow` on every prospect demo. It comes off only when a paying client goes live.

## CSS

- Design tokens in a single `:root` block; every color, border, and radius reads from a token so rebranding is a one-block edit
- Surface utilities (`.surface-paper`, `.surface-accent`, `.surface-panel`, `.surface-deep`) instead of per-section color rules
- `clamp()` for all type and section padding; no fixed pixel font sizes
- Breakpoints at 850px (stack splits, hide nav links, show the mobile action bar) and 520px (single column, tighter scale)
- `box-sizing: border-box` globally, `overflow-x: hidden` on body
- `color-mix()` for tints so surfaces stay in the brand family

## Images

- Local `assets/image-N.webp`, 12 to 13 per site
- Hero image: `loading="eager"` plus `fetchpriority="high"`. Everything below the fold: `loading="lazy"`
- `object-fit: cover` with explicit container heights so nothing reflows on load
- Descriptive alt text on all of them; the QA gate fails the build on a missing alt
- Never reuse the same photo twice in one site, and never across a batch (the batch runner checks this by content hash)

## JavaScript

- One small inline IntersectionObserver for scroll reveals. That's the entire JS budget.
- Progressive enhancement: `<html class="no-js">` upgraded to `js` on parse, so `.reveal` content is visible when JS is off or fails
- No external scripts, no analytics on prospect demos, no fonts loaded from anywhere but Google Fonts with `preconnect`

## Verification

Every site must pass before review:

```bash
node _templates/site-factory/qa.js <site-dir>
```

That checks JSON-LD parsing, viewport and meta description, alt text, asset existence, empty CTA hrefs, required sections, surface rhythm, and with Playwright, horizontal overflow at 390/850/1440px plus screenshots. Fix every FAIL. Warnings need a judgment call.
