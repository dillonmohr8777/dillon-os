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

## Attitude skins (unique look per site)

Every brief should set `attitude` to one of: `glass`, `editorial`, `brutal`, `warm`, `industrial`, `neon`. If omitted, the factory infers it from border/radius tokens and category. Liquid-glass panels, marquees, scroll vanish, and sticky mobile CTAs ship in the base CSS; the attitude skin changes how hard those lean in.

## Harvest imagery

```bash
node _templates/site-factory/harvest.js <slug> <site-url> [social-url ...]
node _templates/site-factory/apply-harvest-images.js <slug> <site-dir>
```

`apply-harvest-images.js` copies social/site photos into `assets/image-N.webp` and writes `PROVENANCE.json`. If fewer than 6 images come back, it prints `GENERATE_SIMILAR` so an agent can create lookalike atmosphere shots (labeled generated, never claimed as theirs).

## Weekly batch of 25

The outreach engine runs one batch of 25 sites per week. Full runbook: `02_Campaigns/AI Site Builder Outreach Engine/Batch Runbook.md`. Skill: `.claude/skills/site-batch/SKILL.md`.

```bash
# 1. Harvest every target's site and socials (screenshots, imagery, copy, palette)
node _templates/site-factory/harvest.js --from targets.json

# 2. Author one brief per prospect (see the mirror-and-improve skill)

# 3. Build + QA the whole batch, emit the hub and the sheets
node _templates/site-factory/build-batch.js <batch-dir>
```

A batch directory holds `batch.json` plus `briefs/*.json`, and the runner emits `sites/`, `index.html` (the review hub, one link for the bosses), `manifest.csv` (QR sheet), `prospects.csv` (`qa_ready` + always-held `mail_ready`), `batch-report.md`, and `batch-summary.json`.

Production runs require brief count == `targetCount`. Use `--allow-partial` only for test/preview. Full QA requires Playwright visual checks; static-only is not a pass.

## Files

| File | Role |
|---|---|
| `base.css` | The shared template CSS, extracted from the Philly-25 profile template |
| `build-site.js` | Brief JSON in, finished `index.html` out. Also requireable as `buildSite(brief, outRoot)`. |
| `build-batch.js` | Whole-batch runner: builds, QAs, checks spec compliance, detects duplicate imagery, emits the hub and CSVs |
| `harvest.js` | Playwright harvester: screenshots a target's site and socials, downloads their imagery, extracts their copy, brand palette, fonts, facts, and decay signals |
| `qa.js` | Ship checklist from the design system: JSON-LD, meta, alt text, assets, CTAs, surface rhythm, plus Playwright screenshots and overflow checks at 390/850/1440px |
| `example-brief.json` | A complete worked example (fictional Philly service business) |

`harvest/` and `qa-shots/` are gitignored; they hold third-party reference material and generated screenshots.
