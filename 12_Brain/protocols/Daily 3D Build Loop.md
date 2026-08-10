---
tags: [protocol, prospect-radar, automation]
created: 2026-08-10
source: "[[12_Brain/concepts/Composited Scroll World System|Composited Scroll World System]]"
---

# Daily 3D Build Loop

**One lesson: a cinematic 3D prospect build is repeatable daily because every hand-made decision now lives in one spec file — the loop is images in, spec written, QA green, PR out.**

The pipeline that turns a radar prospect into a composited scroll world (see [[12_Brain/concepts/Composited Scroll World System|the design system]]). Everything below is what the next-ten batch actually did, written as a loop.

## Inputs (per prospect)

1. **Radar brief** — `12_Brain/state/radar/image-briefs/<slug>.json`: verified name, domain, vertical, city. No brief facts ⇒ maps-search links only, never an invented domain.
2. **Three plates** — hero-transformation (16:11, subject right, type field left), process-macro (4:3), material-study (4:3). Generated per the IMAGE-SYSTEM contract: no text, no logos, no faces, tinted near-black, disclosed as synthetic.
3. **A verb** — the one transformation the trade performs (ALIGN, STACK, MOVE, RESTORE…).

## The loop

1. **Import plates** → webp derivatives (hero 1600w + 900w, macro/material 1200w) into `public/assets/plates/<slug>/`.
2. **Write the spec** in `src/config.mjs`: palette from the plates, world (ground material, 5–8 props enacting the verb, practicals, particles, 2 panels, camera preset), and copy (context, H1, 4 chapters with scene states, 6 sequence cards, brief, verify links). Copy describes the trade, never the client.
3. **Generate + build** — `npm run build` (textures → pages → vite).
4. **QA gates** — `npm run qa` (static: disclosure, concept-mark label, plate presence, JS budget) and `npm run qa:browser` (all routes × desktop/mobile/reduced-motion/forced-fallback; per-site scene states from the spec).
5. **Screenshot review** — hero, mid-scroll, final frame, mobile hero. Fix what looks weak; the gates don't measure taste.
6. **Commit + push + PR** on the working branch. Deploy is a separate operator step (compose onto the live Netlify base).

## Cadence & guardrails

- One prospect/day is comfortable; ten/day is possible when plates arrive in a batch.
- Never assert services, prices, hours, staff, or history. Every page keeps `noindex`, mail hold, the source-boundary panel, and the synthetic-imagery note.
- Logos: verified artwork or a labeled concept mark, nothing in between.
- A Routine can run steps 1–4 unattended and leave step 5 (taste) + 6 (ship) for review — not yet armed; arm it only on explicit go-ahead.
