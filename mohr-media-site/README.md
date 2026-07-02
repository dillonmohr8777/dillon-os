# Mohr Media Website (redesign)

Single-file static site: `index.html`, zero build step, fully self-contained apart from Google Fonts.

Design direction: immersive black, WebGL-driven, in the spirit of activetheory.net — full-viewport particle stage, technical mono labels, light-weight uppercase display type, custom cursor, load counter.

## Deploy
• Vercel: `vercel deploy mohr-media-site` from the vault root, or point a new Vercel project at this folder.
• Netlify: drag the folder into the Netlify drop zone.
• Any static host works. Nothing to compile.

## The 3D stage
• Hand-rolled WebGL (no libraries): ~8,200 GPU particles that morph between four shapes as you scroll — fibonacci sphere (hero) → wave grid (systems) → torus knot (method) → vortex funnel (intake).
• Mouse-reactive: particles repel around the cursor; camera drifts with pointer and scroll.
• Graceful degradation: no WebGL or `prefers-reduced-motion` → static gradient fallback, no cursor/tilt/marquee animation.

## Edit points
• Brand tokens live in the `:root` block: near-black `--bg`, bone `--ink`, and the single hot copper `--hot` (#e8632e) reserved for accents and CTAs.
• Offer pricing on the "Engagement modes" plates comes straight from the Mohr Media Business Plan. Change the plan, change the plates.
• CTA buttons use `mailto:hello@themohrmedia.com`. Swap in a form endpoint when one exists.
• Fonts: Space Grotesk (display, 300 weight does the Active Theory look), IBM Plex Mono (spec labels), loaded from Google Fonts with safe fallbacks.
• Particle count / shapes: see the `webgl particle stage` block at the bottom of the inline script (`N`, and the four `p0..p3` shape generators).
