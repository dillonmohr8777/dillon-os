---
name: mirror-and-improve
description: The core batch workflow. Harvest a target's website and socials, adopt their exact copy and lingo, then rebuild them a site that beats it on design, UX, motion, and technical quality. Use for every prospect site in a weekly batch.
---

# Mirror and Improve

The engine behind the outreach batches. Keep their voice, keep their facts, keep what makes them them. Beat their current site on everything else.

Campaign context: `02_Campaigns/AI Site Builder Outreach Engine/`. Design contract: `philly-sites/DESIGN-SYSTEM.md`.

## Step 1: Harvest

```bash
node _templates/site-factory/harvest.js <slug> <their-site-url> [social-url ...]
```

Captures into `_templates/site-factory/harvest/<slug>/`: full-page desktop and phone screenshots of their site, screenshots of each social profile it finds (or you pass in), their real high-resolution imagery, and `harvest.json` with their copy, palette, fonts, contact facts, and decay signals.

Social profiles behind a login wall get captured as far as possible and flagged `blocked: true`. Note it and move on; never fabricate what you couldn't see.

## Step 2: Mine their voice (this is the "copy lingo" requirement)

From `harvest.json`, pull the language they already use and keep it:

- `voice.title` and `voice.metaDescription` — how they describe themselves in their own words
- `voice.headings` — their taglines and section names. If they say "Eat Local | Drink Local", that line belongs on the new site.
- `voice.navLabels` — their vocabulary for their own sections. A bar that calls it "Inside The Tap" doesn't get a section called "About Us".
- `voice.paragraphs` — their history, positioning, and product descriptions. Reuse their phrasing; tighten it, don't replace it.
- `voice.ctaLabels` — how they ask for the sale.

Rules:
- **Their nouns, their names, their claims.** Menu items, service names, neighborhood references, founding stories, family names all carry over verbatim.
- **Improve the writing, not the voice.** Cut filler, fix structure, sharpen the hero claim. Apply `System/writing-rules.md`: no em dashes, contractions, no corporate jargon.
- **Never invent a fact.** Address, phone, hours, founding year, and prices come from the harvest or from verified research. If it isn't verifiable, the field stays empty.
- If their copy is genuinely thin (a one-image homepage with a tagline), research further: their socials, Google Maps listing, press coverage, and reviews for real substance. Reviews are a legitimate source for what customers actually praise.

## Step 3: Diagnose what to beat

Run the `ux-audit` skill against the harvest. Record specific failures with evidence: missing viewport, no phone on the homepage, stale copyright, no mobile layout, single-section homepage, no directions. This list is both the design brief and the outreach hook. Keep it in the prospect note.

## Step 4: Design the upgrade

Apply the designated skills in order. Each one has its own SKILL.md:

| Skill | Job |
|---|---|
| `ui-design` | Palette derived from their real brand colors, type pairing, attitude tokens, hierarchy |
| `ux-audit` | Conversion flow, one primary action, Maps-first directions, accessibility |
| `motion-design` | Scroll reveals, hover states, one signature micro-interaction |
| `frontend-build` | Semantic markup, page-weight budget, image handling, no-JS resilience |

Non-negotiable: the palette comes from `brand.palette` in their harvest, not from taste. Their brand, better executed.

## Step 5: Write the brief to the measured spec

Copy `_templates/site-factory/example-brief.json` and fill it out. Hit the canonical spec from `philly-sites/DESIGN-SYSTEM.md`, which was measured across all 25 existing sites:

- **10 sections** (hero, offerings, story, gallery, contact, closing are required; add proof, feature, and two of experience/catalog/spotlight)
- **350 to 500 words** of real copy
- **12 to 13 images**, all from their own harvested photography, none repeated

A build that lands at 8 sections and 300 words is thin next to the batch. Go back and research more rather than shipping it.

## Step 6: Build and QA

```bash
node _templates/site-factory/build-site.js <brief.json> <out-dir>
node _templates/site-factory/qa.js <out-dir>/<slug>
```

Copy their harvested images into `<slug>/assets/` as `image-1.webp` onward, hero first. Fix every QA FAIL. Then look at the screenshots in `qa-shots/<slug>/` and judge it by eye: does it look expensive, does it look like them, is the palette dull.

For a full batch, use `build-batch.js` instead; see `.claude/skills/site-batch/SKILL.md`.

## Step 7: Log it

Update the prospect note in `01_Clients/` with: the site folder path, the audit findings, the source of every fact, and the harvest date. If the job came from a Slack intake note, set `status: built`.

## Hard rules

- Prospect demos stay `noindex`. Always.
- Deploying, mailing, and sending are Tier 2. Prepare and stage; a human approves.
- Their imagery is used for a private mirror preview. Provenance is recorded in `harvest.json`; note it in the prospect note. Never republish their photos on a live indexed site we own.
- If the harvest failed and you have no real facts, don't build. A demo with invented details is worse than no demo.
