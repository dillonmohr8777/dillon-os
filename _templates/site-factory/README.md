# Site Factory

Generates a complete Momentum profile site (the Philly-25 template system) from one JSON brief. Plain Node, no dependencies for building; Playwright is optional for the visual QA step.

Design contract: `philly-sites/DESIGN-SYSTEM.md`. Agent workflow: `.claude/skills/site-factory/SKILL.md`.

## Quick start

```bash
# 1. Copy the example and fill it in for the business
cp _templates/site-factory/example-brief.json 01_Clients/some-client/brief.json

# 2. Build (writes <output-dir>/<slug>/index.html + assets/ folder)
node _templates/site-factory/build-site.js 01_Clients/some-client/brief.json 01_Clients/some-client

# 3. Drop real images into <slug>/assets/ (image-1.webp ... plus logo.png unless "logo": false)

# 4. QA: static checks always; screenshots + overflow check when Playwright is installed
node _templates/site-factory/qa.js 01_Clients/some-client/<slug>
```

Playwright for the full QA (one-time): `npm i --no-save playwright && npx playwright install chromium --with-deps`. Screenshots land in `_templates/site-factory/qa-shots/<slug>/` (gitignored).

## The brief

See `example-brief.json` for the full shape. The important parts:

- `tokens` — the whole brand personality: 6 surface colors, 5 `--on-*` contrast colors, `border` (1px elegant to 8px loud) and `radius` (0 brutalist to 56px soft). Derive them from the business's real signage and photos, per the design system.
- `fonts.display` / `fonts.text` — Google Font names. Display carries the brand, text stays quiet.
- `sections` — optional array to reorder; defaults to hero, offerings, proof, gallery, story, experience, feature, catalog, contact, closing. Sections with no content are skipped automatically.
- `noindex` — defaults to true (prospect demo). Set `false` only when a paying client's site goes live.
- `skinCss` — optional per-site decoration layer, scoped under `.slug-<name>`. Base classes never change.

## Files

| File | Role |
|---|---|
| `base.css` | The shared template CSS, extracted from the Philly-25 profile template |
| `build-site.js` | Brief JSON in, finished `index.html` out |
| `qa.js` | Ship checklist from the design system: JSON-LD, meta, alt text, assets, CTAs, surface rhythm, plus Playwright screenshots and overflow checks at 390/850/1440px |
| `example-brief.json` | A complete worked example (fictional Philly service business) |
