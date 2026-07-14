# Align HCM Broker Video: "The Moment of Truth"

An 80-second animated video for the channel team to show benefits brokers why Align HCM is the implementation partner to bring into client conversations.

**Final deliverable:** `Align-Broker-Implementation-Video.mp4` (1920x1080, 30fps, 1:20, H.264, silent — no audio track; the render muxes `assets/ambient.wav`, then the audio is stripped with `-c:v copy -an`)

## Structure

| Time | Scene |
|---|---|
| 0-7s | Ink-reveal intro: ink blots bloom on paper, the Align HCM logo emerges through an ink dissolve with 3D tilt |
| 7-16.5s | Broker hook: "You guide your clients through benefits... there's a moment of truth: implementation." |
| 16.5-58.5s | Five case-study pages (8.4s each), varied transitions (page-turn, horizontal push, vertical push): AWP Safety, Driscoll's, BEUMER, Arrow, Resorts World Las Vegas |
| 58.5-70s | The method: numbered 4-phase approach (deck style), then SmartCare: "Your HCM platform should work for you. Not the other way around." |
| 70-80s | Broker CTA: Channel Partner Program, alignhcm.com/partners/brokers |

The scene choreography is authored on the original 120s internal clock; per-scene time-scale factors (`SC` in `broker-video.html`) map real time onto it, so retiming the video means touching only `DUR`, `T`, `CASE_LEN`, and `SC`.

## Design system (v2, matched to the Align sales deck)

- PT Serif headlines, white with orange emphasis words; Inter body; orange rule + caps kicker title system on every scene
- Governance-slide background: deep navy gradient, soft rotated diamonds, warm orange glow bottom-left; no grid
- White boxes with navy text (The Challenge) paired with navy boxes with orange border (What Align Did)
- Footer continuity strip on every dark scene; 01/05 page counters
- Light EDM soundtrack, 122 BPM: soft four-on-the-floor kick, offbeat hats, sidechained pads, pluck arp; breakdown under SmartCare, lift for the CTA
- Refined with the "impeccable" design skill (github.com/pbakaus/impeccable): solid-color stat numbers (no gradient text), 10-16px card radii, exponential ease-outs only, display type at or under 96px

## Compliance guardrails

- **Vendor agnostic**: zero platform vendor names anywhere in the copy
- **No employee counts**: only scope/timeline stats (6-month go-live, 7 years of data)
- Client logos pulled from official sources, backgrounds removed, set on white cards
- All copy sourced from live alignhcm.com pages (broker pages, implementation page, case studies, SmartCare)
- Brand: navy #0A1628, orange #FF6B2B/#F05A28 gradient, teal #2BB5A0, Inter + Syne, glass panels, glow blobs, no em dashes in copy

## How to edit and re-render

1. Copy lives in the `CASES` array and scene markup inside `broker-video.html`. Open the file in a browser to preview: space plays, arrow keys scrub.
2. QA stills: `node tools/scrub.mjs` (writes to `scrubs/`)
3. Audio bed: `node tools/make-audio.mjs` (writes `assets/ambient.wav`)
4. Render: `node tools/render.mjs [out.mp4] [fps]` (needs `npm i playwright-core` and `pip install imageio-ffmpeg`)

Logo processing (background removal, cropping) is in `tools/process-logos.py` with raw downloads in `assets/raw/`.
