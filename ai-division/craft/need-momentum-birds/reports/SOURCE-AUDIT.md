# SOURCE AUDIT — Need Momentum Birds · 2026-09-11

**Root:** `/workspace/ai-division/production/need-momentum-birds-2026-09-11/`  
**Updated:** 2026-09-11 ~5:40 PM ET

## Exists (ready)

| Area | Path / item | Notes |
|------|-------------|-------|
| README / mission | `README.md` | Role split, craft SoT, render cmds |
| Production SoT | `Sot/PRODUCTION-SOT.md` | Prosperity Takes Flight beats locked |
| Concepts | `concepts/CONCEPTS.md` | 6 named directions |
| Hero brief | `briefs/15s-hero-brief.md` | Shot list matches Remotion `BEATS` |
| Status | `STATUS.md` | Done / next ask |
| Remotion project | `remotion/` | Remotion 4.0.523 via mai01 node_modules symlink |
| Composition | `remotion/src/NeedMomentumBirdsHero.tsx` | 450f/30/1080p + exported `BEATS` |
| Root registry | `remotion/src/Root.tsx` | id `NeedMomentumBirdsHero` |
| Craft fonts | `remotion/public/fonts/Outfit-Bold.ttf`, `SourceSans3-Regular.ttf` | Copied |
| Mid still | `remotion/out/hero-frame-225.png` | Frame 225 · 1920×1080 |
| End-card still | `remotion/out/end-card-proof.png` | Frame 420 · 1920×1080 |
| Asset manifest | `manifests/ASSET-MANIFEST.json` | Stable replaceable IDs |
| Ingest contract | `manifests/INGEST-CONTRACT.md` | Pro drop slots |
| ID stub notes | `assets/placeholders-NM-*.txt` | Six stub files |
| Slot dirs | `assets/{birds,flock,gpt-plates,logos,paper,wordmarks}/` | Empty dirs + `.gitkeep` |
| Reports (this turn) | `reports/*` | Return, QA, audit, end-card, paste |

## Gaps (blocking polish)

| Gap | Expected ID / path | Impact |
|-----|-------------------|--------|
| **GPT plates missing** | `assets/gpt-plates/NM-GPT-PLATE-01`…`06-*.png` | No concept stills to wire; hero stays SVG-only |
| Bird dove plate | `assets/birds/NM-BIRD-DOVE-01.png` | Placeholder SVG |
| Bird cardinal plate | `assets/birds/NM-BIRD-CARDINAL-01.png` | Placeholder SVG |
| Flock BG plate | `assets/flock/NM-FLOCK-BG-01.png` | Placeholder SVG |
| Paper texture | `assets/paper/NM-PAPER-TEX-01.png` | Procedural torn layers only |
| Wordmark asset (optional) | `assets/wordmarks/NM-WORDMARK-DRAFT.png` | Live type covers draft |
| **Logo overlays pending** | `assets/logos/NM-LOGO-OVERLAY.png` | Reserved for **finals only** — correct gap for draft |
| Full MP4 | `remotion/out/NeedMomentumBirdsHero.mp4` | Not rendered (memory); still path proven |
| Pro handoff files | `briefs/MASTER-HANDOFF.md`, `briefs/PRO-LATEST-INSTRUCTIONS.md` | Not present during this turn |

## Manifest status snapshot

| status | Count | IDs |
|--------|------:|-----|
| placeholder | 5 | dove, cardinal, flock-bg, wordmark-draft, paper-tex |
| reserved | 1 | `NM-LOGO-OVERLAY` |
| awaiting-pro | 6 | `NM-GPT-PLATE-01`…`06` |

## Recommendation

Pro: generate all 6 concept GPT Image plates + bird/flock/paper assets per ingest contract. Grok next: wire plates → Remotion → frame-strip QC → optional MP4.
