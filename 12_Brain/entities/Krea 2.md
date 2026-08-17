---
tags: [entity, tool, image]
source: "[[12_Brain/raw/research/2026-08-17 Honeycove Seedance Roundup Receipts]]"
updated: 2026-08-17
expires: 2026-11-17
---

# Krea 2

**Summary:** aesthetic image model with moodboards — fill thin site-factory
harvests, never replace real photos or download the 12B weights here.

Official: https://www.krea.ai/krea-2 (2026-05-12)
Open-source: https://www.krea.ai/krea-2-open-source
Weights: `krea/Krea-2-Raw` (train/LoRA) and `krea/Krea-2-Turbo`
(8-step distilled). Architecture note: 12B dense DiT. Hosted API is
paid.

## How Dillon OS uses it

Skill: `.claude/skills/krea-2/SKILL.md`. Trigger is
`GENERATE_SIMILAR` from
`_templates/site-factory/apply-harvest-images.js` when harvest < 6
images. Label every generated file. Palette and facts stay in
`harvest.json`.

## Links

- [[12_Brain/entities/Website Factory|Website Factory]]
- [[12_Brain/entities/Seedance 2.5|Seedance 2.5]]
- Decision: [[12_Brain/decisions/2026-08-17 - Institute Seedance 2.5 and gated companions|2026-08-17 — Seedance stack]]
