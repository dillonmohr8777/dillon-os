---
tags: [campaign, batch, selection]
campaign: "[[AI Site Builder Outreach Engine]]"
batch: radar-next10-2026-09-02b
date: 2026-09-02
---

# Replacements: radar-next10-2026-09-02b

Batch 02b keeps only `sprinkles-icecream` and `von-sas-and-son` (the two slugs
confirmed clean in `sheet-crosscheck-2026-09-02.md`). The other 8 — all flagged
"already built elsewhere" in that cross-check (`radar-unslop-20260819` /
`momentum-prospect-radar-next20-2026-08-11`, per CALL LIST / HOLD) — are
replaced below. No file under `batches/radar-next10-2026-09-02b/` other than
this one and `prospects-replacements.csv` was touched.

## Method

Same rules as `radar-next10-2026-09-02c/selection.md`: `12_Brain/state/radar/registry.json`
filtered to `current.verdict == "rebuild"` with a resolving `sqs > 0`, excluding
everything already built in any local `batches/*` dir, everything on `1 · CALL
LIST`, `2 · HOLD`, `3 · DO NOT PITCH`, and `Momentum 360 - 238 Call-Ready
Businesses`, and everything already selected for `radar-next10-2026-09-02c`
(10 slugs) or already unreachable when curl-checked for that batch. Preferred
verticals (dental, hvac, plumbing, electrical, vet, restaurant, auto, legal,
home services), cap of 4 per vertical, highest score first — dropping below 58
where the clean pool required it. **Lowest score used: 55.**

Two candidates that scored well and cleared every sheet check still failed a
live curl today and were dropped: Halligan & Keaton Law P.C. (55, lawyer —
`HTTP 404`, reproducible, no page left to harvest) and August Moon (65,
restaurant — `HTTP 500`, reproducible server error).

## The 8, ranked

| Slug | Business | Vertical | Town | Score | Current-site grade | Website | Why |
|---|---|---|---|---:|---|---|---|
| centurion-construction-group | Centurion Construction Group | construction-company (home services) | Lewisberry, York County | 82 | 21/100 (broken) | http://www.centurionconstructionllc.com/ | Highest-scoring clean candidate left after 02c's picks and all sheet/local exclusions; confirmed live 200 today |
| first-class-auto-land | First Class Auto Land | car (auto) | Philadelphia | 65 | 23/100 (broken) | https://www.firstclassautoland.com/ | Preferred vertical (auto); server responds `403` reproducibly on two curl passes (bot-blocked, not dead — registry bands it "broken"/live, distinct from the timeouts/resets that got other candidates dropped) |
| about-all-floors | About All Floors | floorer (home services) | Wyomissing, Berks County | 65 | 23/100 (broken) | https://www.aboutallfloors.com/ | Preferred vertical (home services); confirmed live 200 today |
| j-pro-inc | J-Pro, Inc. | swimming-pool (home services) | Bridgeport, Montgomery County | 57 | 35/100 (decayed) | https://www.j-propools.com/ | Preferred vertical (home services); reproducible `403` (bot-blocked, live per registry band) |
| shady-maple-rv | Shady Maple RV | car (auto) | East Earl, Lancaster County | 57 | 35/100 (decayed) | https://www.shadymaplerv.com/ | Preferred vertical (auto); reproducible `403` (bot-blocked, live per registry band) |
| nathan-bean-contracting | Nathan Bean Contracting LLC | roofer (home services) | Nazareth, Northampton County | 57 | 35/100 (decayed) | https://nathanbeancontractingllc.com/ | Preferred vertical (home services); reproducible `403` (bot-blocked, live per registry band) |
| dirt-work-solutions | Dirt Work Solutions | construction-company (home services) | Slatington, Lehigh County | 55 | 48/100 (decayed) | https://www.dirtworksolutions.com/ | Preferred vertical (home services); confirmed live 200 today; lowest score used in this batch |
| robert-c-moll-monumental-crafts | Robert C. Moll Monumental Crafts | stonemason (home services) | Hellertown, Northampton County | 55 | 38/100 (decayed) | http://monumentalcrafts.net/ | Preferred vertical (home services); confirmed live 200 today |

Verticals: construction-company ×2, car ×2, floorer ×1, swimming-pool ×1,
roofer ×1, stonemason ×1 — all under the 4-per-vertical cap (also clear of
`sprinkles-icecream`'s ice-cream and `von-sas-and-son`'s hvac, the two kept
slugs).

## Which slugs they replace, and why

| Replacement | Replaces | Why the original was dropped |
|---|---|---|
| centurion-construction-group | andorra-family-dentistry | Already built — `1 · CALL LIST`, `radar-unslop-20260819`, cleared to show |
| first-class-auto-land | dutton-road-veterinary-clinic | Already built — `2 · HOLD`, `radar-unslop-20260819`, not cleared |
| about-all-floors | always-dental-care | Already built — `1 · CALL LIST`, `radar-unslop-20260819`, cleared to show |
| j-pro-inc | colmar-dentistry-for-kids | Already built — `1 · CALL LIST`, `radar-unslop-20260819`, cleared to show |
| shady-maple-rv | pennsylvania-dental-group | Already built — `2 · HOLD`, `radar-unslop-20260819`, not cleared |
| nathan-bean-contracting | glen-eagle-pediatric-dentistry | Already built — `2 · HOLD`, `radar-unslop-20260819`, not cleared |
| dirt-work-solutions | davidson-fabricating | Already built — `2 · HOLD`, `radar-unslop-20260819`, not cleared |
| robert-c-moll-monumental-crafts | dream-team | Already built — `2 · HOLD` (as "Dream Team Home Services"), `momentum-prospect-radar-next20-2026-08-11`, not cleared |

## Sources checked

`12_Brain/state/radar/registry.json` (full), `12_Brain/state/radar/build-queue.csv`,
`batches/radar-next10-2026-09-02c/selection.md` (for the 10 already claimed
slugs and their curl-failure list), `batches/sheet-crosscheck-2026-09-02.md`,
Google Drive tabs `1 · CALL LIST`, `2 · HOLD`, `3 · DO NOT PITCH`, `5 · BATCHES`,
`0 · START HERE`, and `Momentum 360 - 238 Call-Ready Businesses - 2026-08-13`
(full-text checked for all 8 finalists — no hits). Live curl re-check of all 8
finalists plus 2 dropped near-misses, 2 passes each, 2026-09-02.
