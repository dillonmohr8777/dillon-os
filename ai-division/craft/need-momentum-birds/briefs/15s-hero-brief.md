# Brief — 15s Hero · NeedMomentumBirdsHero

## Spec

| Field | Value |
|-------|--------|
| Duration | 15s (450 frames) |
| FPS | 30 |
| Size | 1920×1080 |
| Composition id | `NeedMomentumBirdsHero` |
| Stack | Remotion on Linux box |
| Shot list | **Prosperity Takes Flight** |
| Status | DRAFT |

## Creative

**Tone:** Scrapbook prosperity — warm, human, hopeful. Birds (doves + cardinals + flock) as metaphor for AI that lifts people, not replaces them.

**Look:** Soft cream background, torn-paper layers, orange `#E27113` accents, Outfit Bold wordmark **"Need Momentum"** (DRAFT). No Anthropic/Claude marks. Momentum logo overlay **out of scope** for this draft.

## Shot list — Prosperity Takes Flight

| # | Time | Frames | Beat | Visual |
|---|------|--------|------|--------|
| 1 | **0–2s** | 0–60 | Paper settle | Cream field + torn paper layers settle; craft tag fades in |
| 2 | **2–4.5s** | 60–135 | Flock enter | SVG flock silhouettes stagger in (placeholders → `NM-BIRD-*` / `NM-FLOCK-*`) |
| 3 | **4.5–7.5s** | 135–225 | Flock rise | Flock drifts upward; orange prosperity arc draws |
| 4 | **7.5–10.5s** | 225–315 | Cardinal signal | Lead cardinal (`c1` / `NM-BIRD-CARDINAL-01`) accent pulse / glow |
| 5 | **10.5–13s** | 315–390 | Unity + word | Many birds one direction; DRAFT wordmark rises in |
| 6 | **13–15s** | 390–450 | Brand lockup | Wordmark hold / end-card lockup (logo overlay finals only) |

Beat constants live in `remotion/src/NeedMomentumBirdsHero.tsx` as exported `BEATS`.

## Placeholders OK

CSS/SVG birds until Pro GPT Image plates arrive (`NM-BIRD-*`, `NM-FLOCK-BG-01`, concept plates `NM-GPT-PLATE-01`…`06`).

## Success

Composition compiles; beat segments match this shot list; render/still commands documented; assets swappable via manifest IDs.
