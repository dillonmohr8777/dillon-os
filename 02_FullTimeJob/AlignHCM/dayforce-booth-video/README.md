# Align HCM × Dayforce · Booth Video (Dayforce Discover 2026)

A 90-second looping booth video for Dayforce Discover 2026 (Oct 27–29, Wynn Las Vegas). Built for the 32"/42" 1080p countertop booth screens in the exhibitor catalog: works fully muted, huge type, seamless loop (fades to black at both ends).

**Deliverable:** `Align-Dayforce-Booth-Video.mp4` (1920x1080, 30fps, 1:30, H.264, silent — no audio track)

## Chapters (90s loop)

| Time | Chapter |
|---|---|
| 0:00–0:12 | Cold open: large Align × Dayforce lockup, "Implementation & Post-Implementation Partner," "Get more from Dayforce" + managed-services positioning |
| 0:12–0:22 | 01 · Why Dayforce: single-stack architecture, real-time workforce data |
| 0:22–0:36 | 02 · What we do: all six icon services on one grid, "From implementation to managed services." |
| 0:36–0:48 | 03 · How we deliver: turnkey, 4 numbered phases through go-live |
| 0:48–1:00 | SmartCare™ Managed Services: "Go-live isn't the finish line" + 3 post-implementation items |
| 1:00–1:18 | 04 · Our Dayforce experience: certified across the suite, capabilities, managed services, satisfaction metric |
| 1:18–1:30 | CTA: "Let's talk Dayforce." + partner lockup + URL, fade out to loop |

## Design system

- Continuation of the Align video system: PT Serif + Inter, navy world, orange accents, deck backgrounds, footer strip
- **Partnership signature:** Dayforce blue (#3067db) joins Align orange as a second accent; chapter cuts are a dual-slash sweep (orange from the left, blue from the right) echoing the Align mark
- Copy sourced from alignhcm.com/partners/dayforce (unified architecture, continuous calculation engine, reduce friction / improve adoption / keep Dayforce aligned) and the main site (Five Star Consulting Partner, satisfaction metric, "right now")
- WCAG AA contrast verified for all pairs, including the blue accents
- No employee counts; no competitor platform names

## Rebuild

Same pipeline as `../broker-video`: edit `booth-video.html` (space plays, arrows scrub), `node tools/make-audio.mjs`, `node tools/scrub.mjs`, `node tools/render.mjs [out] [fps]`.
