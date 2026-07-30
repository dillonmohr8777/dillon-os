---
name: motion-design
description: Motion and interaction pass: scroll reveals, hover behavior, transitions, and micro-interactions that make a static page feel alive without hurting performance or accessibility. Use on every site build and upgrade.
---

# Motion Design

Motion is what separated the upgraded Philly batch from the first pass. It has to feel intentional, cost nothing, and never block content.

## The three layers

**1. Scroll reveal (structural).** Elements carrying `.reveal` fade up as they enter view. Direction variants: `.reveal-left`, `.reveal-right`. Stagger with `.delay-1` … `.delay-3`. Driven by one IntersectionObserver.

**2. Vanish on leave.** Sections with `.vanish-out` fade/blur as they scroll out upward — the "disappearing" motion for long homepages. Progressive enhancement only.

**3. Hover, marquee, glass float.** Buttons lift; images scale; the hero marquee scrolls their lingo; a liquid-glass float sits on the hero media. Attitude skins tune the intensity.

## Hard limits

- **Transform and opacity only.** Never animate width, height, top, left, or box-shadow geometry; they force layout.
- **No layout shift.** Reveals move within their own box; containers hold their space before animating.
- **No motion on the critical path.** Hero copy and the primary CTA are readable at first paint, animated or not.
- **Duration ceiling 1.1s.** Anything slower feels broken.
- **No autoplay carousels, no parallax hijacking, no scroll-jacking.** The 25 use none of these and they hold up.

## Accessibility (mandatory)

Two guards, both required:

```css
/* 1. Content is visible when JS never runs */
.reveal { opacity: 1; transform: none; }
.js .reveal { opacity: 0; transform: translateY(34px); filter: blur(7px); }
.js .reveal.visible { opacity: 1; transform: none; filter: none; }

/* 2. Full opt-out for reduced motion */
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  .js .reveal, .js .reveal.visible {
    opacity: 1 !important; transform: none !important;
    filter: none !important; transition: none !important;
  }
  *, *::before, *::after {
    animation-duration: .01ms !important;
    transition-duration: .01ms !important;
  }
}
```

## Self-check

- Disable JavaScript: is all content still visible?
- Turn on reduced motion: does everything render instantly and statically?
- Scroll fast top to bottom: does anything jump, flash, or land late?
- On a mid-range phone, does scrolling stay smooth?
- Would the motion still read as tasteful with the client watching over your shoulder?
