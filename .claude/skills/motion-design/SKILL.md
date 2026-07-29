---
name: motion-design
description: Motion and interaction pass: scroll reveals, hover behavior, transitions, and micro-interactions that make a static page feel alive without hurting performance or accessibility. Use on every site build and upgrade.
---

# Motion Design

Motion is what separated the upgraded Philly batch from the first pass. It has to feel intentional, cost nothing, and never block content.

## The three layers

**1. Scroll reveal (structural).** Elements carrying `.reveal` fade up as they enter view: opacity 0 to 1, `translateY(34px)` to none, `blur(7px)` to none, over `.75s` to `.85s` with `cubic-bezier(.2,.75,.2,1)`. Driven by one IntersectionObserver at threshold `.08` with `rootMargin: '0px 0px -6% 0px'`.

Rules:
- Reveal containers (a grid, a section head), not every individual child. Twenty-five separate reveals in one viewport reads as jitter.
- Stagger sibling groups by no more than `.1s`.
- Unobserve after revealing; never re-animate on scroll back.
- Elements above the fold reveal on load, not on scroll.

**2. Hover and focus (tactile).**
- Buttons: `translateY(-2px)` to `-4px` with a shadow bloom on hover, `scale(.97)` on active. Transitions `.16s` to `.28s` ease.
- Cards: `translateY(-8px)` with a slight rotation (`rotate(-.4deg)`) and a hard offset shadow. Restrained, not springy.
- Images in figures: `scale(1.04)` over `.6s` to `1.1s`, with `overflow:hidden` on the parent.
- Apply to `:focus-within` alongside `:hover` so keyboard users get the same feedback.
- Wrap image zoom in `@media(hover:none)` resets so touch devices don't get stuck hover states.

**3. Micro-interaction (accent).** One signature move per site, drawn from the business: a tilted marquee strip, a layered depth flourish behind the hero, a texture that shifts on scroll. Lives in the `.slug-<name>` skin layer. One per site, never three.

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
