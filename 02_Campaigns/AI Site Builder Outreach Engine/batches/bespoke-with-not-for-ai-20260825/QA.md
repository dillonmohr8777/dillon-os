# QA Result

Status: **PASS — private local review build**

Report: `qa/report.json`

## Verified

- Five-second opening captured at 750, 1250, 2250, 3250, 4500, and 5500 ms.
- Final hero at 320×720, 390×844, 768×1024, and 1440×900.
- Major desktop sections captured individually: belief, all three horizontal highlights, all three adoption states, all three service chapters, Morning Briefing, human-control palm, and closing CTA.
- Zero console errors, page errors, or failed asset requests.
- Zero horizontal overflow at every tested viewport.
- No duplicate IDs and no images missing `alt` attributes.
- Mobile menu opens and closes through a native dialog.
- Robot pointer tracking, click-to-nod, and true alternate-frame blink all execute in the live page.
- Briefing tabs support click plus Arrow Left, Arrow Right, Home, and End.
- Reduced-motion mode loads the complete hero and converts sticky scroll scenes into static readable sections.
- `noindex, nofollow, noarchive` meta and a blocking `robots.txt` are present.

## Detector exception

The `aphoristic-cadence` rule is narrowly waived at the top of `site/index.html` because the flagged constructions are exact, source-backed With Not For copy that Dillon explicitly required us to preserve. The waiver does not cover layout, type, color, motion, or any other detector rule.

## Documented craft exception

The `WNF.AI` product mark and single-idea viewport statements use responsive display clamps above the ordinary 6rem content-heading ceiling. This is a narrow, intentional Apple-scale launch treatment for short product-object text, documented in `DESIGN.md`; body copy and interactive UI text remain on the standard readable scale. All display letterspacing is capped at the `-0.04em` floor.

## Current measured length

- 390×844 motion-enabled page: 20,876 px.
- Apple reference at 390×844 during capture: 28,351 px.
- The concept is approximately 74% of the captured Apple page length.

## Publication

No deployment and no prospect outreach occurred. The build remains local and private.
