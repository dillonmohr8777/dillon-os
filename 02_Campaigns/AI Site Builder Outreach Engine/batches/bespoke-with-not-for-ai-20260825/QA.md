# QA Result

Status: **PASS — private local review build**

Report: `qa/report.json`

## Verified

- The complete 7.8-second opening captured at 700, 1500, 2400, 3300, 4200, 5100, 6200, and 7900 ms.
- Final hero at 320×720, 390×844, 768×1024, and 1440×900.
- Major desktop and 390px sections captured individually: belief, all three horizontal highlights, all three robot-theatre phases, all three adoption states, all three service chapters, Morning Briefing, human-control palm, closing CTA, and particle finale.
- Zero console errors, page errors, or failed asset requests.
- Zero horizontal overflow at every tested viewport.
- Zero clipped active text nodes in every captured desktop and mobile chapter.
- No duplicate IDs and no images missing `alt` attributes.
- Mobile menu opens and closes through a native dialog.
- Robot pointer tracking, click-to-nod, and true alternate-frame blink all execute in the live page.
- Briefing tabs support click plus Arrow Left, Arrow Right, Home, and End.
- Reduced-motion mode loads the complete hero and converts sticky scroll scenes into static readable sections.
- `noindex, nofollow, noarchive` meta and a blocking `robots.txt` are present.
- The Impeccable detector returns zero findings across the changed HTML, CSS, and JavaScript.
- The eight-frame animation contact sheet reports zero discontinuity warnings at `qa/contact-sheets/opening-overdrive.png`.

## Detector exception

The `aphoristic-cadence` rule is narrowly waived at the top of `site/index.html` because the flagged constructions are exact, source-backed With Not For copy that Dillon explicitly required us to preserve. The waiver does not cover layout, type, color, motion, or any other detector rule.

## Documented craft exception

The `WNF.AI` product mark and single-idea viewport statements use responsive display clamps above the ordinary 6rem content-heading ceiling. This is a narrow, intentional Apple-scale launch treatment for short product-object text, documented in `DESIGN.md`; body copy and interactive UI text remain on the standard readable scale. All display letterspacing is capped at the `-0.04em` floor.

## Current measured length

- 390×844 motion-enabled page: 26,129 px.
- Apple reference at 390×844 during capture: 28,351 px.
- The expanded concept is approximately 92% of the captured Apple page length.

## Publication

No deployment and no prospect outreach occurred. The build remains local and private.
