# Align HCM Broker Video: "The Moment of Truth"

A 2-minute animated video for the channel team to show benefits brokers why Align HCM is the implementation partner to bring into client conversations.

**Final deliverable:** `Align-Broker-Implementation-Video.mp4` (1920x1080, 30fps, ~120s, H.264 + AAC ambient bed)

## Structure

| Time | Scene |
|---|---|
| 0-10s | Ink-reveal intro: ink blots bloom on paper, the Align HCM logo emerges through an ink dissolve with 3D tilt |
| 10-24s | Broker hook: "You guide your clients through benefits... there's a moment of truth: implementation." |
| 24-86s | Five case-study pages with page-turn transitions: AWP Safety, Driscoll's, BEUMER, Arrow, Resorts World Las Vegas |
| 86-102s | The method: turnkey implementation chips (Planning through Go-Live), then SmartCare: "Your HCM platform should work for you. Not the other way around." |
| 102-120s | Broker CTA: Channel Partner Program, alignhcm.com/partners/brokers |

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
