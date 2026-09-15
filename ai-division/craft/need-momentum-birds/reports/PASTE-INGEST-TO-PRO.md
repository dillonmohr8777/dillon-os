Grok unblock — here is the full ingest contract (IDs + destinations). Mapping is unblocked. Please continue generating the six scene plates as clean standalone 16:9 backgrounds; keep birds/paper as separate assets where you already planned that. After each gen, name files to match the Expected path column.

# Ingest Contract — Need Momentum Birds

**Mode:** Draft/stage only · stable replaceable IDs  
**Drop zone root:** `assets/`  
**Manifest:** `manifests/ASSET-MANIFEST.json`

## Rules

1. Keep **asset IDs stable** — replace file bytes, do not rename IDs.
2. Prefer PNG (transparent where birds/cutouts) or WEBP; plates 1920×1080 minimum.
3. **No Anthropic/Claude marks** on any plate.
4. **NM-LOGO-OVERLAY** is reserved for finals — do not bake into draft hero comps.
5. Filename should include the ID (see paths below).
6. After drop, update `status` in `ASSET-MANIFEST.json` from `placeholder` / `awaiting-pro` → `ingested`.

## Core motion slots

| ID | Expected path | Spec |
|----|---------------|------|
| `NM-BIRD-DOVE-01` | `assets/birds/NM-BIRD-DOVE-01.png` | Dove cutout / scrapbook bird, transparent OK |
| `NM-BIRD-CARDINAL-01` | `assets/birds/NM-BIRD-CARDINAL-01.png` | Cardinal lead; accent-friendly `#E27113` |
| `NM-FLOCK-BG-01` | `assets/flock/NM-FLOCK-BG-01.png` | Wide flock/sky scrapbook plate |
| `NM-WORDMARK-DRAFT` | `assets/wordmarks/NM-WORDMARK-DRAFT.png` | Optional raster wordmark (Remotion also typesets live) |
| `NM-LOGO-OVERLAY` | `assets/logos/NM-LOGO-OVERLAY.png` | Finals only |
| `NM-PAPER-TEX-01` | `assets/paper/NM-PAPER-TEX-01.png` | Cream/torn paper texture |

## GPT Image plates (Pro ChatGPT — 6 concepts)

| ID | Concept | Expected path |
|----|---------|---------------|
| `NM-GPT-PLATE-01` | Flock Rising | `assets/gpt-plates/NM-GPT-PLATE-01-flock-rising.png` |
| `NM-GPT-PLATE-02` | Cardinal Signal | `assets/gpt-plates/NM-GPT-PLATE-02-cardinal-signal.png` |
| `NM-GPT-PLATE-03` | Prosperity Arc | `assets/gpt-plates/NM-GPT-PLATE-03-prosperity-arc.png` |
| `NM-GPT-PLATE-04` | Human Flightpath | `assets/gpt-plates/NM-GPT-PLATE-04-human-flightpath.png` |
| `NM-GPT-PLATE-05` | Many Birds One Direction | `assets/gpt-plates/NM-GPT-PLATE-05-many-birds-one-direction.png` |
| `NM-GPT-PLATE-06` | Future Needs Momentum Lockup | `assets/gpt-plates/NM-GPT-PLATE-06-future-needs-momentum-lockup.png` |

### Plate craft checklist (for Pro)

- [ ] Soft cream / torn-paper scrapbook energy (Fable 5.1)
- [ ] Doves / cardinals / flock motifs
- [ ] Negative space for Outfit Bold wordmark
- [ ] Accent `#E27113` sparingly
- [ ] No Anthropic/Claude marks
- [ ] No Momentum logo on draft plates
- [ ] ORIGINAL only

## Remotion wiring (post-ingest)

Once plates land, Grok swaps SVG placeholders in `NeedMomentumBirdsHero` for `staticFile(...)` / `Img` references keyed by these IDs. Composition id stays `NeedMomentumBirdsHero`.

## Handoff signal

When Pro finishes gens, set STATUS next-ask to "Grok: wire plates into Remotion + still QC".
