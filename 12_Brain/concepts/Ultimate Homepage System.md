---
tags: [concept, design, websites]
created: 2026-08-15
updated: 2026-08-15
expires: 2026-11-13
source: "[[12_Brain/raw/research/2026-08-15 - research - homepage-template-systems]]"
---

# Ultimate Homepage System

**Summary:** one harvest-driven homepage engine — Relume-shaped IA, IronLine conversion, Tailwind Plus spacing, shadcn tokens, one earned motion moment — never a copied template skin.

This is interpretation compiled from [[12_Brain/research/Homepage Template Systems 2026]]. It does not copy Tailwind Plus, Relume, IronLine, Framer, or Webflow files. It names transferable systems. Build order: [[12_Brain/protocols/Codex Homepage Implementation Brief]]. Brand still comes from harvest + `philly-sites/DESIGN-SYSTEM.md`.

## Navigation

- Skip link first. `aria-label="Primary"`.
- Desktop: wordmark left, 4–6 links, one solid CTA right (Call / Get estimate / Book).
- Mobile: hamburger or none — prefer a **sticky bottom action bar** (Call + Quote) at the 850px break already used by the factory.
- Do not hide the phone number behind a menu on local-service pages.

## Hero

- Full-bleed **real** photo or a quiet paper surface. No gradient orbs, no fake 3D product.
- One claim, one subline, two CTAs (primary action + secondary proof: “See recent work” / “View services”).
- Optional proof chips in the hero (licensed, insured, years, rating) — IronLine pattern, only with verified facts.
- Type: display `clamp(3.6rem, 7vw, 7rem)`, `text-wrap: balance`.

## Social proof

- Immediate strip under the hero. 2–4 **facts**, not adjectives (founded, service area, response time, review score with source).
- Logo walls only if the logos are real and licensed. Otherwise skip.

## Problem and outcome

- Split: the costly failure on one side, the after-state on the other.
- Local-service: “power out at 2am” / “no heat in January” — specific, not “we care.”
- SaaS/agency: one problem sentence, one outcome metric, no feature dump yet.

## Services or features

- 3–6 offerings, numbered 01–0n, each with a real name, a price or “from” only if verified, and a deep link.
- Alternate surfaces so this block does not match the hero.

## Process

- 3–5 steps. Estimate → schedule → do the work → follow-up. Names the human, not “our process.”

## Case studies

- 3–6 recent jobs with place, date, and what changed. Photo required.
- Invented testimonials and stock Unsplash “portfolio” grids are a fail.

## Interactive or cinematic section

- **At most one.** CSS scroll-reveal is the default (factory already has it).
- Earned upgrades: Lenis only if the page is otherwise quiet; GSAP or Motion for one pinned sequence; Paper Shaders for one hero background if the brand is digital.
- Local-service default: **none**. A sticky call bar beats a WebGL blob.

## Testimonials

- Named person, place, date, source (Google / GBP). Pull quotes short.
- If you cannot verify, omit the section.

## Comparison or differentiation

- 3–5 rows: what they do that the usual competitor does not (shows up, licensed, same-day, written warranty).
- Avoid fake “us vs them” tables with strawmen.

## FAQ

- 5–8 real objections (price, emergency, warranty, service area, how to start).
- Accordion with a real button/heading pattern (shadcn/Radix or native `<details>`).

## Final CTA

- Repeat the claim. One action. Phone + form on local-service. Calendar or demo on SaaS.
- Surface: `--deep` or `--accent`, not another paper card.

## Footer

- Address, hours, phone, email, primary links, legal.
- `LocalBusiness` JSON-LD already required by the factory.
- No “made in Framer / Webflow / Relume” chrome on client sites.

## Mobile behavior

- Breakpoints stay **850px** and **520px**.
- Sticky call/quote bar. No horizontal overflow (QA already screens 390/850/1440).
- Hero image `eager` + `fetchpriority="high"`; everything else lazy.
- Type and padding via `clamp()`. Thumb-reachable primary CTA.

## Motion system

1. Progressive enhancement: visible without JS.
2. One IntersectionObserver reveal (existing factory).
3. Optional: Motion or CSS for hover/focus on buttons and accordions.
4. Optional cinematic: GSAP + Lenis, one section, `prefers-reduced-motion: reduce` kills it.
5. Never custom cursors, scrolljacking, or marquees of fake logos on trades sites.

## Typography system

- One display + one text. Google Fonts with `preconnect` only.
- Display from the business (serif heritage, slab/condensed trades, grotesque tech).
- Text stays quiet: the factory list (Inter, Work Sans, Source Serif is fine if they already use a serif body).
- Heading line-length short. Body `text-wrap: pretty`.

## Color approach

- Six tokens from harvest photos: `--paper --ink --accent --accent2 --panel --deep` plus `--on-*`.
- Never generic blue. Never the template’s purple-black AI kit.
- `--border` and `--radius` set attitude (1px/round upscale, 3–8px/square trades).
- WCAG AA on every pair. QA already checks this.

## Reusable component architecture

Map Relume-style names onto the factory vocabulary. One component per section, data in, no brand inside.

| Engine name | Factory class | Data |
|---|---|---|
| `Nav` | `header` | links, phone, cta |
| `Hero` | `hero` | claim, sub, media, ctas, chips |
| `Proof` | `proof` | 2–4 facts |
| `Problem` | `story` or `feature` | before/after copy + image |
| `Offerings` | `offerings` | named services |
| `Process` | `experience` | steps |
| `Work` | `gallery` / `catalog` | jobs |
| `Quotes` | (new, optional) | verified testimonials |
| `Compare` | (new, optional) | differentiators |
| `Faq` | (new, optional) | Q/A |
| `Visit` | `contact-system` | NAP + actions |
| `Close` | `closing` | claim + cta |
| `Footer` | `footer` | links + legal |

Keep the static factory as the default output (27–37 KB HTML). A Next.js 16 + Tailwind 4 + shadcn path is optional for CMS/SaaS clients — same section list, same tokens.

## Links

- [[12_Brain/research/Homepage Template Systems 2026]]
- [[12_Brain/entities/Website Factory]]
- [[12_Brain/entities/LandingFolio MCP]]
- [[12_Brain/protocols/Codex Homepage Implementation Brief]]
