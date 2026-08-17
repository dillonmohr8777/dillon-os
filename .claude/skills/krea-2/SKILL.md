---
name: krea-2
description: Draft Krea 2 atmosphere stills when a site-factory harvest is thin. Harvest photos win. Label every generated image. Do not download the 12B weights or spend on the hosted API without approval.
---

# Krea 2

Thin-harvest image skill. Krea 2 is the moodboard / style-reference
image model from the 2026-08-17 Honeycove roundup. It fills atmosphere
gaps. It does **not** replace harvest photography.

Official: https://www.krea.ai/krea-2
Open weights: https://www.krea.ai/krea-2-open-source
(`krea/Krea-2-Raw`, `krea/Krea-2-Turbo` — Turbo is 8-step distilled).

## When to run

- `/site-factory` printed `GENERATE_SIMILAR` (harvest < 6 images)
- Dillon asks for moodboard stills, not a video

Otherwise skip. Real photos of the business always win.

## Order of operations

1. **Read the harvest.** Palette, screenshots, and any real photos
   first. Match their surfaces, not a generic "AI aesthetic."
2. **Draft the prompt + refs.** Moodboard of harvest stills + one
   sentence of atmosphere (storefront dusk, stainless prep line, truck
   in the lot). No client name in the prompt.
3. **Generate nothing.** Hosted Krea API calls are spend (Tier 2).
   Downloading the 12B DiT into this VM is an install (Tier 2) and
   the wrong machine for it.
4. **If Dillon approved a hosted generate:** label every file
   `generated`, never as official photography. Honest alt text.
   Provenance stays in `assets/PROVENANCE.json`.

## Hard rules

- Never ship a generated face as a real owner, tech, or customer.
- Never invent a storefront, truck wrap, or interior the harvest
  does not support.
- Do not treat Krea output as brand truth. Palette and facts stay
  with `harvest.json`.
- `/ui-design` still owns tokens. This skill only fills empty image
  slots.

## Reply shape

- Why harvest is thin (count)
- The atmosphere prompt
- Whether a generate is approved or still a draft
