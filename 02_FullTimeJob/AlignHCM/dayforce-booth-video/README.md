# Align HCM × Dayforce · Booth Video (Dayforce Discover 2026)

A 4-minute looping booth video for Dayforce Discover 2026 (Oct 27–29, Wynn Las Vegas). Built for the 32"/42" 1080p countertop booth screens in the exhibitor catalog: works fully muted, huge type, seamless loop (fades to black at both ends).

**Deliverable:** `Align-Dayforce-Booth-Video.mp4` (1920x1080, 30fps, 4:00, H.264 + 124bpm EDM bed)

## Chapters (240s loop)

| Time | Chapter |
|---|---|
| 0:00–0:20 | Cold open: Align × Dayforce lockup slides into alignment, "Get more from Dayforce." |
| 0:20–0:50 | 01 · Why Dayforce: unified architecture, real-time data, "catching errors before they happen. Not after." |
| 0:50–1:38 | 02 · What we do: 6 numbered services in white/navy boxes (planning, full-suite implementation, integration, data conversion, training & reporting, optimization & fractional) |
| 1:38–2:08 | 03 · Method: turnkey, 4 numbered phases through go-live |
| 2:08–2:44 | SmartCare™ for Dayforce: "Go-live isn't the finish line." |
| 2:44–3:14 | 04 · Why Align: Five Star Consulting Partner, client satisfaction, "right now." |
| 3:14–3:42 | Outcomes: Reduce friction. Improve adoption. Keep Dayforce aligned. |
| 3:42–4:00 | CTA: "Let's talk Dayforce." + partner lockup + URL, fade out to loop |

## Design system

- Continuation of the Align video system: PT Serif + Inter, navy world, orange accents, deck backgrounds, footer strip
- **Partnership signature:** Dayforce blue (#3067db) joins Align orange as a second accent; chapter cuts are a dual-slash sweep (orange from the left, blue from the right) echoing the Align mark
- Copy sourced from alignhcm.com/partners/dayforce (unified architecture, continuous calculation engine, reduce friction / improve adoption / keep Dayforce aligned) and the main site (Five Star Consulting Partner, satisfaction metric, "right now")
- WCAG AA contrast verified for all pairs, including the blue accents
- No employee counts; no competitor platform names

## Rebuild

Same pipeline as `../broker-video`: edit `booth-video.html` (space plays, arrows scrub), `node tools/make-audio.mjs`, `node tools/scrub.mjs`, `node tools/render.mjs [out] [fps]`.
