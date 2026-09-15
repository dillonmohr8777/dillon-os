# PLATE-INGEST-MAP — Need Momentum Birds

**Ingested:** 2026-09-11 ~6:00 PM ET  
**Source batch:** ChatGPT Image · Sep 11, 2026 · ~02:54 PM  
**Sort:** ChatGPT `(N)` suffix ascending (= mtime ascending within batch)  
**Format note:** All six are **clean 16:9 scrapbook plates** (full-bleed collage art), **not** presentation boards. Native size **1672×941** (≈16:9); Remotion scales cover to 1920×1080.

| Plate ID | Dest filename | Source download | Concept match (visual) |
|----------|---------------|-----------------|------------------------|
| `NM-GPT-PLATE-01` | `NM-GPT-PLATE-01-flock-rising.png` | `ChatGPT Image Sep 11, 2026, 02_54_54 PM (1).png` | Flock rising diagonally on cream torn paper |
| `NM-GPT-PLATE-02` | `NM-GPT-PLATE-02-cardinal-signal.png` | `ChatGPT Image Sep 11, 2026, 02_54_55 PM (2).png` | Large cardinal lead + soft city / dove accents |
| `NM-GPT-PLATE-03` | `NM-GPT-PLATE-03-prosperity-arc.png` | `ChatGPT Image Sep 11, 2026, 02_54_55 PM (3).png` | Arc flock toward sun / prosperity light |
| `NM-GPT-PLATE-04` | `NM-GPT-PLATE-04-human-flightpath.png` | `ChatGPT Image Sep 11, 2026, 02_54_56 PM (4).png` | Cafe humans + dashed flightpath birds |
| `NM-GPT-PLATE-05` | `NM-GPT-PLATE-05-many-birds-one-direction.png` | `ChatGPT Image Sep 11, 2026, 02_54_56 PM (5).png` | Dense flock L→R, open cream right |
| `NM-GPT-PLATE-06` | `NM-GPT-PLATE-06-future-needs-momentum-lockup.png` | `ChatGPT Image Sep 11, 2026, 02_54_56 PM (6).png` | Corner birds framing blank cream lockup field |

## Paths

- Canonical: `assets/gpt-plates/*.png`
- Remotion `staticFile`: `remotion/public/gpt-plates/*.png` (mirrored bytes)

## Remotion beat wiring

| Beat | Frames | Primary plate |
|------|--------|---------------|
| paperSettle / flockEnter | 0–135 | PLATE-01 |
| flockRise | 135–225 | PLATE-03 |
| cardinalSignal | 225–315 | PLATE-02 |
| unityWord (early) | 315–360 | PLATE-04 |
| unityWord (late) | 360–400 | PLATE-05 |
| brandLockup | 390–450 | PLATE-06 |

SVG flock kept as **optional overlay** (`SHOW_SVG_BIRDS=false` — plates already include birds).
