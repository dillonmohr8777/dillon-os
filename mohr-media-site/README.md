# Mohr Media Website

A full multi-page static site with an immersive WebGL look modeled on Active
Theory. No build step, no framework — plain HTML + shared assets, raw WebGL,
no external libraries or CDNs. Drop the folder on any static host and it runs.

## Pages
- `index.html` — home: hero, proof strip, 3D robot roster, services, method, results, operator, pricing, FAQ, CTA.
- `services.html` — the five systems (lead gen, SEO content, Google Ads, AI implementation, CRO) + the Mohr Method.
- `work.html` — four case studies (Bar Crawl USA, Kimberly James Bridal, Shadow HVAC, Onsite Concrete) in challenge → approach → result format.
- `about.html` — the operator story (Dillon), the eight-agent model, and operating principles.
- `pricing.html` — Audit / Build / Operate, a comparison table, guarantee, and pricing FAQ.
- `contact.html` — book-the-audit page with a qualifying form (composes a mailto on submit).

## Shared assets (`assets/`)
- `site.css` — the whole design system: embedded fonts (base64), tokens, layout, and every component. Cached once across pages.
- `spine.js` — the WebGL "spine" background (a triple-helix the camera flies down, bloom, cursor repulsion, adaptive performance governor, static fallback). Each page sets its own waypoints via `window.__SPINE = { anchors, wpts }` before loading it.
- `robot.js` — the 3D robot crew (home only): one procedural robot per agent card, dark-metallic body, emissive accent visor/core, rim lighting, idle bob, cursor tracking, hover emphasis. Falls back to an inline SVG glyph if WebGL is unavailable.

Design language: near-black immersive stage, single-accent neon, oversized tracked
uppercase display type, instrument-panel corner HUD, custom cursor. All motion is
gated behind `prefers-reduced-motion`.

## Operator photo
The About + home operator portraits load `operator.jpg` (~4:5). Replace
`mohr-media-site/operator.jpg` to update it; if it's missing, the frame shows a
"DM" monogram placeholder. No code change needed.

## Deploy
This project's Vercel deploys are done via the CLI (no linked git repo):
```
cd mohr-media-site && vercel deploy --prod
```
Or point any static host at the folder. Nothing to compile.

## Edit points
- Theme tokens: the `:root` blocks in `assets/site.css` (near-black `--bg`, blue→teal→green accent gradient, glows). The Active-Theory darkening override is the last `:root` block.
- Roster: the `.agents` block in `index.html`; each card's robot accent is set inline via `--bot-acc` and matched by the `ACC` array in `assets/robot.js`.
- Copy/case studies/pricing live directly in each page's HTML.
- CTAs point to `contact.html`; the contact form composes a `mailto:hello@themohrmedia.com`. Swap in a real form endpoint when one exists.
