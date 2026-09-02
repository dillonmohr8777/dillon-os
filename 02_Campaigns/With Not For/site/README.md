# With Not For — homepage rebuild

Single-file rebuild of the With Not For AI Consulting preview homepage
(`with-not-for-ai-human-led-preview.netlify.app`). Private preview concept, `noindex`.

## What changed vs the preview

- Headline, subhead, and CTAs visible at load (the preview painted an empty first fold).
- 6.9 MB of PNG replaced with sized WebP, inlined; whole page ~306 KB.
- 28,000 px scroll theatre reduced to ~7,100 px with no blank states.
- Reveals via IntersectionObserver, sticky adoption stepper, CSS scroll-driven parallax where supported, full `prefers-reduced-motion` support.
- Semantic landmarks, keyboard-visible focus, no horizontal overflow at 390 px or 1440 px.

## Layout

- `index.template.html` — the page, with `{{TOKEN}}` image slots
- `assets/*.png` — original art; `assets/*.webp.b64` — sized WebP data URIs
- `scripts/build.mjs` — inlines the WebP into `index.html`
- `index.html` — deployable output (drag to Netlify)

## Build

```
node scripts/build.mjs
```

No dependencies.
