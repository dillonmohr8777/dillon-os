---
tags: [protocol, websites, codex]
created: 2026-08-15
updated: 2026-08-15
expires: 2026-11-13
source: "[[12_Brain/raw/research/2026-08-15 - research - homepage-template-systems]]"
---

# Codex Homepage Implementation Brief

**Summary:** build a reusable homepage engine from transferable systems — do not install a paid skin into the public factory, and do not copy proprietary pages.

For agents (Codex, Claude, Cursor) implementing [[12_Brain/concepts/Ultimate Homepage System]]. Research: [[12_Brain/research/Homepage Template Systems 2026]]. Design contract: `philly-sites/DESIGN-SYSTEM.md`. Skills: `/site-factory`, `/frontend-build`, `/ui-design`.

## Hard rules

- Do not copy Tailwind Plus, Relume, IronLine, Magic UI Pro, Aceternity, Framer, or Webflow files into this public repo as a redistributable kit.
- Do not infer permission to buy, subscribe, or connect a paid account.
- Harvest + client facts beat any template. LandingFolio / Recent are composition only.
- Licenses that ban website builders or AI generators (Tailwind Plus, shadcnblocks, several Pro kits) mean: **study privately, extract patterns, write original components.**
- Framer paid = one end product. Webflow paid = one client. Useless as a factory default.

## What to download or study

| Priority | Resource | Action |
|---|---|---|
| 1 | Existing factory (`_templates/site-factory/`, `philly-sites/DESIGN-SYSTEM.md`) | **Keep as default output.** Extend sections; do not replace. |
| 2 | [Launch UI](https://github.com/launch-ui/launch-ui) (MIT) | Clone off-tree. Study token file, navbar/hero/FAQ/footer. Reimplement, do not vendor the repo. |
| 3 | [Tailark blocks](https://github.com/tailark/blocks) (MIT) | Study marketing block props. Same rule. |
| 4 | [Page UI](https://github.com/PageAI-Pro/page-ui) (MIT, TW3) | Steal section *ideas* (marquee, comparison, about). Port to TW4/CSS tokens. |
| 5 | [leoMirandaa](https://github.com/leomirandaa/shadcn-landing-page) | Use as a 16-section checklist. |
| 6 | [Relume Figma kit](https://www.figma.com/community/file/1078092050664989246/relume-figma-kit-v3-7) + [style guide cloneable](https://webflow.com/made-in-webflow/website/relume-library-styleguide) | Composition + naming. Unstyled. |
| 7 | [Untitled UI FREE](https://www.figma.com/community/file/1020079203222518115/untitled-ui-free-figma-ui-kit-and-design-system-v2-0) | Spacing, type scale, component hygiene. |
| 8 | [IronLine demo](https://trades-starter.vercel.app/) | Study IA only. Do not copy Durham Electric copy or fake license numbers. |
| 9 | [Magic UI](https://github.com/magicuidesign/magicui) (MIT) | One motion primitive max per page. |
| 10 | [Lenis](https://github.com/darkroomengineering/lenis) + [GSAP](https://gsap.com/pricing/) | Optional cinematic path. GSAP is $0 Standard, not MIT. |
| 11 | [[12_Brain/entities/LandingFolio MCP]] | Section composition. Sandbox-only until Inspector. Never search by client name. |
| 12 | Tailwind Plus / IronLine / Osmo / Launch UI Pro | **Operator purchase.** If owned, study locally; commit only original factory code. |

Skip: ChatDeck, Verve, Cruip free GPL repo, shadcnblocks (factory-license conflict), Framer/Webflow Single-Use skins as engines, Zentry/Fey clones, Satūs as a designed homepage.

## Patterns to combine

From Relume: named sections, mobile variants, props for copy/images/CTAs.  
From IronLine: proof chips, priced services, emergency band, recent work with place+date, estimate form, LocalBusiness JSON-LD.  
From Tailwind Plus / Untitled UI: spacing scale, quiet type, keyboard-first controls.  
From Launch UI / Tailark: CSS variables, shadcn-compatible primitives, independently editable sections.  
From the Philly 25: harvest palette, attitude via `--border`/`--radius`, 10-section target, 350–500 words, 12–13 real photos.

## Recommended stack

**Default (batch / local-service):** current factory — one `index.html`, inline CSS tokens, inline reveal, local `assets/*.webp`. No framework. Budget 27–37 KB HTML.

**Optional premium path (SaaS, CMS, multi-location):** Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui (or Base UI), `next-themes` only if the brand needs dark mode. Forms: native + server action or existing CRM-lite. CMS: only when the client will edit (Sanity is what IronLine uses; not required).

Do not add Lenis, GSAP, R3F, or Unicorn unless the brief is cinematic and the operator said so.

## Component architecture

One file per section. No brand strings inside components. Brief JSON (already used by `build-site.js`) remains the data contract.

```
brief.json          // harvest facts, copy, tokens, attitude
lib/tokens.css      // --paper --ink --accent --accent2 --panel --deep --on-* --border --radius
lib/type.css        // display + text, clamp scale
sections/nav.js
sections/hero.js
sections/proof.js
sections/problem.js
sections/offerings.js
sections/process.js
sections/work.js
sections/quotes.js   // omit if < 2 verified quotes
sections/compare.js  // omit if no real differentiators
sections/faq.js
sections/visit.js
sections/close.js
sections/footer.js
motion/reveal.js     // IntersectionObserver, respects prefers-reduced-motion
```

New factory sections (`quotes`, `compare`, `faq`) are additive. Do not drop `hero`, `offerings`, `story`, `gallery`, `contact-system`, `closing`.

## Animation libraries

| Need | Library | Constraint |
|---|---|---|
| Default | Existing reveal | Required. Works with `no-js`. |
| Accordion / menu | Native `<details>` or shadcn | Keyboard + SR |
| One flourish | CSS or Motion | < 5 KB extra on premium path |
| Cinematic | GSAP + optional Lenis | One section. Reduced-motion off. |
| WebGL | Paper Shaders or R3F | Never on prospect demos. Never Unicorn free (non-commercial + logo). |

## Performance constraints

- Factory HTML 27–37 KB. Images separate, webp, 12–13, unique hashes.
- Hero image eager + high fetch priority. Rest lazy.
- No custom cursor, no full-page smooth-scroll on trades sites.
- Lighthouse is a gate, not a vendor screenshot. Run it on the built page.
- Sticky mobile CTA must not cover the footer form.

## Accessibility requirements

- Skip link, labelled nav, semantic sections, alt on every image (QA fails without).
- `--on-*` contrast AA.
- Focus visible. Accordions are buttons or `<details>`, not clickable divs.
- `prefers-reduced-motion: reduce` disables reveal and any GSAP/Lenis.
- Phone links are `tel:`. Address is an `<address>`.
- JSON-LD only with verified NAP.

## Implementation sequence

1. **Read** `philly-sites/DESIGN-SYSTEM.md`, this brief, and the ranked research. Do not sweep template marketplaces again unless `expires:` has passed.
2. **Extend the brief schema** with optional `quotes`, `compare`, `faq`, `chips`, `emergency` — empty means omit.
3. **Implement original sections** in the factory using the table in [[Ultimate Homepage System]]. Tokens only.
4. **Study** Launch UI + one IronLine-style IA pass. Write original markup. Diff should not contain their class names or copy.
5. **Optional composition:** one LandingFolio query per new section type (`"dark FAQ accordion, three items"`). Do not keep the screenshot in the build.
6. **Skin** via existing `attitude` + harvest palette. Two sites in one batch must not share a reference.
7. **QA:** `node _templates/site-factory/qa.js <site-dir>`. Fix every FAIL. Playwright 390/850/1440 if available.
8. **Premium path (only if asked):** new Next app using shadcn/create as the shell, factory section list as the page, same tokens. Do not vendor paid templates.
9. **Log** the source of every fact on the client/prospect note. Deploy stays Tier 2.

## Acceptance

A page is done when: it looks like the business, not like Launch UI/Relume/IronLine; every fact is sourced; mobile CTA works; QA is green; motion still reads with JS off; no template license was laundered into the public tree.
