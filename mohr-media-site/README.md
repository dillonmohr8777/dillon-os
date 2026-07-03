# Mohr Media Website (WebGL redesign)

Single file: `index.html`. Zero build step, **fully self-contained** — fonts are
embedded (base64), and the 3D is raw WebGL with no external libraries or CDNs.
Drop it on any static host and it runs.

## What's in it
- **Immersive WebGL "spine" background** — a triple-helix the camera flies down as
  you scroll, with a particle "station" for each section. Bloom, adaptive
  performance governor, cursor repulsion, graceful static fallback.
- **3D robot crew** — each of the eight agents is a procedural 3D robot rendered
  in a second WebGL canvas (`#crew-stage`), one per card: dark-metallic body,
  emissive accent visor/core, rim lighting, idle bob, cursor tracking, and a
  hover emphasis wired to the card. Falls back to an inline SVG glyph if WebGL is
  unavailable.
- **Operator section** (`#operator`) — a HUD-framed portrait of the operator with
  oversized display type and stats.
- Custom cursor (dot + difference-blend trailing ring), corner HUD telemetry,
  section waypoint rail, percentage boot loader. All motion is gated behind
  `prefers-reduced-motion`.

Design language deliberately mirrors Active Theory: near-black immersive stage,
single-accent neon, oversized tracked uppercase type, instrument-panel HUD.

## Add the operator photo
The operator portrait loads `operator.jpg` (portrait / ~4:5). Drop a headshot at
`mohr-media-site/operator.jpg` and it appears automatically; until then the frame
shows a "DM" monogram placeholder. No code change needed.

## Deploy
- Vercel: point a project at this folder, or `vercel deploy mohr-media-site`.
- Netlify / any static host: upload the folder. Nothing to compile.

## Edit points
- Brand/theme tokens live in the `:root` blocks in the `<style>` (near-black `--bg`,
  blue→teal→green accent gradient, glows). The Active-Theory darkening override is
  the last `:root` block.
- Agent roster (names, roles, copy) is the `.agents` block; each card's robot accent
  is set inline via `--bot-acc` and matched by the `ACC` array in the robot script.
- CTAs use `mailto:hello@themohrmedia.com`. Swap in a form endpoint when one exists.
