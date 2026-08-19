# Prospect unslop — 138 fix-queue sites

Rebuilds every row in the Google fix queue as a noindex concept with:

- Exact first-party logos (never redrawn)
- Palettes sampled from those logos
- Five unique images per site, industry-intentional
- People at work for services; food/kitchen/plating for restaurants
- Align HCM industry-solutions motion (swipe, ken burns, caption card)
- CSS fallback instead of WebGL, so pages do not render black

Duplicates in the sheet (`johnny-s-pizza`, `thr-insurance-agency`) are marked dropped, not rebuilt. Canonical rows are `johnnys-pizza` and `thr-insurance`.

`Fixed?` on the Google Sheet is written only after a site is QA green (5 unique collages, noindex, swipe, reduced-motion, no WebGL, ≥3 unique official or generated industry photographs).

Deploy stays approval-gated. `mail_ready` stays hold.

```bash
cd /workspace
node --test automation/prospect-unslop/test/intent.test.js
node automation/prospect-unslop/run.js --only=al-tacos-locos
node automation/prospect-unslop/run.js            # full 136 unique sites
```

Playwright Chromium is required for official sites behind Cloudflare. Harvested photos stay in `automation/prospect-unslop/harvest/` (gitignored). Composed collages live with the sites.
