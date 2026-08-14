---
tags: [entity, system]
source: "[[12_Brain/raw/2026-07-04 - obsidian-second-brain-article]]"
updated: 2026-08-14
---

# Website Factory

**Summary:** web/landing-page production pipeline and its shipped builds (the
growth lane). Public Git describes the pipeline, not customer account IDs or
deploy credentials.

## Public facts

- Outputs: static / Netlify / Vercel marketing sites for clients.
- Templates and QA live under `_templates/site-factory/` when present, or
  campaign folders under `02_Campaigns/`.
- Attitude skins: `glass`, `editorial`, `brutal`, `warm`, `industrial`, `neon`,
  and `align` (Align HCM liquid glass / 3D / ink-reveal; colors from each brand).
- Latest radar batch: `phl-2026-w36` (25 rebuilds after w33/w34/w35, Jakub
  Antalik transitions.dev motion on every homepage). Hub:
  https://phl-2026-w36.netlify.app. `noindex` on. `mail_ready` stays hold.
  Prior hub still live: https://phl-2026-w35.netlify.app.
- Secrets and host tokens never land in this note.

## Links

- [[12_Brain/concepts/Netlify Deploy Safety|Netlify Deploy Safety]]
- [[12_Brain/entities/Momentum 360|Momentum 360]]
