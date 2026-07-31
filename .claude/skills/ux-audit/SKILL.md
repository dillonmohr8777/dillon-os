---
name: ux-audit
description: UX and conversion pass. Audits the target's existing site for friction, then defines the flow, information architecture, and accessibility of the replacement. Use on every mirror build and before any site ships.
---

# UX Audit

Two jobs: find what's broken on the business's current site (that's the sales argument), and make sure the site we build actually converts.

## Part 1: audit their current site

From `harvest/<slug>/harvest.json` and the screenshots, score each item and record the evidence. This becomes both the design brief and the outreach hook.

| Check | What failure looks like |
|---|---|
| Mobile | `decaySignals.missingViewport` true, or the phone screenshot shows a desktop layout squeezed down |
| Primary action | No obvious book/order/call path above the fold; `voice.ctaLabels` empty or vague |
| Contact friction | Phone or address not on the homepage (`facts.phone` or `facts.hours` empty) |
| Content depth | Homepage is a single hero image with no substance, or fewer than 3 real sections |
| Currency | `decaySignals.staleCopyrightYear` 3+ years old |
| Wayfinding | Nav labels that name nothing (`voice.navLabels` full of "More", "Info") |
| Trust | No reviews, no history, no team, no real photography |
| Local intent | No map, no directions, no service area, no hours |

Write findings to the prospect's note as specific observations, never generic slop. "Their phone number appears nowhere on the homepage and the site has no mobile viewport" beats "outdated design."

## Part 2: design the replacement flow

- **One primary action** for the whole page, repeated in the header, the hero, and the closing section. Restaurants: reserve or order. Services: book or call. Retail: shop or visit.
- **Above the fold** answers who they are, what they sell, where they are, and what to do next.
- **Phone is a `tel:` link everywhere it appears.** Address links to Google Maps directions (the Maps-first pattern from the July pilots).
- **Sticky mobile action bar** so the primary action is always one thumb away under 850px.
- **Reduce decisions.** Two hero buttons maximum: primary plus one secondary.
- **Deep links, not dead ends.** The catalog section points at their real menu, booking, or shop URLs.

## Information architecture

Follow the measured section order in `philly-sites/DESIGN-SYSTEM.md`. The narrative arc that works across the 25: who you are (hero), what you sell (offerings), why you're credible (proof), what it looks like (gallery), where you came from (story), what visiting is like (experience), one signature thing (feature), where to go deeper (catalog), how to reach you (contact), one last ask (closing).

When a section resists that arc and you need to see how real converting pages solve it, the `landingfolio` MCP tools return reference screenshots for a given section type. Reference only, and never queried with a client or prospect name: `12_Brain/entities/LandingFolio MCP.md`. The measured order in the design system still wins any disagreement.

## Accessibility (non-negotiable, the QA gate enforces some of it)

- Skip link first in the body
- One `h1`, then no heading levels skipped
- Every image has descriptive alt text; decorative elements get `aria-hidden="true"`
- `:focus-visible` outlines on every interactive element, never `outline:none`
- All text passes WCAG AA on its surface
- Full `prefers-reduced-motion` opt-out
- Content is readable with JavaScript disabled (reveal animations must be progressive enhancement)
- Touch targets at least 44px tall

## Self-check

- Can someone book, call, or order within one interaction from anywhere on the page?
- On a 390px phone, is the primary action visible without scrolling?
- Tab through: does focus order make sense and stay visible?
- Is every claim on the page verifiable from the harvest?
