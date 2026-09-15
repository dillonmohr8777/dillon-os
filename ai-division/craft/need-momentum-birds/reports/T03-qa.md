# T03 QA — NeedMomentumBirdsHero

**Composition:** `NeedMomentumBirdsHero`  
**Project:** `/workspace/ai-division/production/need-momentum-birds-2026-09-11/remotion/`  
**Updated:** 2026-09-11 ~5:40 PM ET

## Spec checklist

| Check | Expected | Status |
|-------|----------|--------|
| Runtime | 15.00 s | ✅ 450 frames ÷ 30 fps |
| Frames | 450 | ✅ `DURATION = 450` |
| FPS | 30 | ✅ `FPS = 30` |
| Dimensions | 1920×1080 | ✅ `WIDTH`/`HEIGHT` + Root Composition |
| Composition id | `NeedMomentumBirdsHero` | ✅ `Root.tsx` |
| Typecheck | `tsc --noEmit` clean | ✅ |
| Mid still | `out/hero-frame-225.png` | ✅ ~1.0 MB · 1920×1080 |
| End-card still | `out/end-card-proof.png` @ frame 420 | ✅ ~1.05 MB · 1920×1080 |

## Beat / timing checklist (Prosperity Takes Flight)

| Beat | Time | Frames | Wired in source | Status |
|------|------|--------|-----------------|--------|
| Paper settle | 0–2s | 0–60 | `BEATS.paperSettle` → paperIn | ✅ |
| Flock enter | 2–4.5s | 60–135 | `BEATS.flockEnter` + enterOffset | ✅ |
| Flock rise + arc | 4.5–7.5s | 135–225 | `BEATS.flockRise` → arcProgress / rise | ✅ |
| Cardinal signal | 7.5–10.5s | 225–315 | `BEATS.cardinalSignal` → lead glow | ✅ |
| Unity + word | 10.5–13s | 315–390 | `BEATS.unityWord` → wordIn | ✅ |
| Brand lockup | 13–15s | 390–450 | `BEATS.brandLockup` → lockupHold | ✅ |

## Replaceable asset IDs (manifest)

| ID | Role in hero | Status |
|----|--------------|--------|
| `NM-BIRD-DOVE-01` | Dove flock members (`data-asset-id`) | Placeholder SVG |
| `NM-BIRD-CARDINAL-01` | Lead / accent cardinals | Placeholder SVG |
| `NM-FLOCK-BG-01` | Small flock silhouettes | Placeholder SVG |
| `NM-WORDMARK-DRAFT` | Live Outfit Bold + DRAFT tag | Live type (asset optional) |
| `NM-PAPER-TEX-01` | Torn paper texture | Procedural layers (texture pending) |
| `NM-LOGO-OVERLAY` | Finals brand mark | Reserved — **not** on draft |
| `NM-GPT-PLATE-01`…`06` | Concept plates | Awaiting Pro |

## Craft checklist

| Item | Status |
|------|--------|
| Accent `#E27113` | ✅ |
| Cream scrapbook field | ✅ |
| Outfit Bold + Source Sans 3 loaded | ✅ `public/fonts/` |
| No Anthropic/Claude marks | ✅ |
| DRAFT label visible on wordmark | ✅ |
| Logo overlay absent on draft | ✅ |

## Commands

```bash
cd /workspace/ai-division/production/need-momentum-birds-2026-09-11/remotion
npx remotion compositions
npx remotion still NeedMomentumBirdsHero out/hero-frame-225.png --frame=225
npx remotion still NeedMomentumBirdsHero out/end-card-proof.png --frame=420
npx remotion render NeedMomentumBirdsHero out/NeedMomentumBirdsHero.mp4
```

## Open QA (blocked on Pro plates)

- [ ] Swap SVG birds for ingested bird/flock PNGs  
- [ ] Optional paper texture overlay from `NM-PAPER-TEX-01`  
- [ ] Full MP4 render when memory allows / after plate wire-up  
- [ ] Frame strip QC: 30 / 90 / 180 / 270 / 360 / 420 after plates
