---
tags: [sop, video, content, hyperframes]
---

# HyperFrames Video Production SOP

Standard procedure for producing short-form MP4 assets with HeyGen HyperFrames in Claude Code. Reference: `System/hyperframes-skill.md`.

## Pre-Production Checklist

- [ ] Client brief pulled from `01_Clients/{client}/content-calendar.md`
- [ ] Brand guidelines open (`01_Clients/{client}/brand-guidelines.md`) — fonts, palette, logo lockup
- [ ] Target platform decided (IG Reel / TikTok / YouTube Short / LinkedIn / Meta feed)
- [ ] Aspect ratio and duration locked (see Format Matrix below)
- [ ] Copy approved (hook, body, CTA)
- [ ] Any licensed footage / imagery placed in `assets/{client}/`

## Format Matrix

| Platform             | Resolution   | Duration   | Fps |
| -------------------- | ------------ | ---------- | --- |
| IG Reel / TikTok     | 1080x1920    | 9-15s      | 30  |
| IG Feed              | 1080x1350    | 15s        | 30  |
| LinkedIn (Align HCM) | 1920x1080    | 20-45s     | 30  |
| Meta ad (most)       | 1080x1080    | 15s        | 30  |
| YouTube Short        | 1080x1920    | 30-60s     | 30  |

## Composition Steps (Claude Code)

1. `cd` to `content/{client}/{yyyy-mm-dd}-{slug}/`, run `npx hyperframes init .` if not already scaffolded.
2. Prompt Claude: "Build composition using brand guidelines at {path}. Hook: {x}. CTA: {y}. Duration: {n}s. Resolution: {w}x{h}."
3. Claude writes `index.html` with `data-composition-id`, `data-width`, `data-height`, `data-start`, `data-duration` attributes.
4. `npx hyperframes preview` — review in browser with live reload.
5. Iterate copy + motion with Claude until approved internally.
6. `npx hyperframes lint` to catch missing attributes / overflow.
7. `npx hyperframes render` — MP4 written to `out/`.

## Review & Approval

- [ ] Internal review against brand-guidelines.md (colors, fonts, logo safe area)
- [ ] Captions on-screen if spoken audio present (`hyperframes transcribe`)
- [ ] Mute check — readable without sound
- [ ] Client approval sent via normal channel (email / Slack per `contact-info.md`)
- [ ] MP4 archived in `content/{client}/{yyyy-mm-dd}-{slug}/out/`

## Delivery

- [ ] Posted / scheduled per `content-calendar.md`
- [ ] Delivery logged to `01_Clients/{client}/content-calendar.md`
- [ ] Video added to client's recurring asset library
- [ ] Entry added to `03_Content/Content Index.md` under Published

## Troubleshooting

- Render hangs → `npx hyperframes doctor` (checks Node 22+, FFmpeg, Puppeteer).
- Wrong fonts → embed via `@font-face` in the composition, not `<link>` (Puppeteer captures deterministically).
- Audio drift → keep TTS + captions generated via `hyperframes tts` / `hyperframes transcribe` so tracks stay frame-aligned.

## Notes
- All compositions are plain HTML/CSS/JS — check them into git the same way as any client asset.
- Prefer re-using blocks from `hyperframes-registry` before writing custom motion.
