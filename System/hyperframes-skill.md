---
tags: [system, skill, video, claude-code]
added: 2026-04-16
source: https://github.com/heygen-com/hyperframes
license: Apache-2.0
---

# HyperFrames Skill (HTML → MP4 for Claude Code)

HeyGen's open-source, agent-native video framework. Claude Code (and Cursor / Gemini CLI / Codex) writes HTML compositions and renders them to MP4 locally. Zero cloud calls. Apache 2.0.

## Why this is in Dillon OS
Replaces static carousels and graphics with short motion assets produced from the same HTML/CSS primitives already used by the `align-asset-builder` and `scroll-motion-engine` skills. Every client that currently gets image deliverables can get MP4 deliverables for the same effort.

## Install

```bash
npx skills add heygen-com/hyperframes
```

Or manual project scaffold:

```bash
npx hyperframes init my-video
cd my-video
npx hyperframes preview      # live reload in browser
npx hyperframes render       # write MP4
```

## Requirements
- Node.js >= 22
- FFmpeg on PATH
- Runs fully local — no API keys required for the render pipeline

## Skills registered
- `hyperframes` — composition authoring, captions, TTS, audio-reactive animation
- `hyperframes-cli` — `init`, `lint`, `preview`, `render`, `transcribe`, `tts`, `doctor`
- `hyperframes-registry` — block/component installation
- `gsap` — animation timelines

## How Claude Code invokes it
After `npx skills add`, the four skills appear as slash commands in Claude Code. Prompt pattern:

> "Use hyperframes to build a 15-second vertical MP4 for {client}. Composition: {hook → offer → CTA}. Brand colors from `01_Clients/{client}/brand-guidelines.md`. Render at 1080x1920."

Claude writes the HTML composition, runs `npx hyperframes preview` to verify, then `npx hyperframes render` to output MP4.

## Integration points in Dillon OS
- **`align-asset-builder`** — existing HTML motion graphics skill. HyperFrames extends it from web-embedded motion to exportable MP4.
- **`scroll-motion-engine`** — reuse scroll/timeline primitives inside HyperFrames GSAP timelines.
- **Client brand guidelines** (`01_Clients/*/brand-guidelines.md`) — feed fonts, palette, and logo placement into compositions.
- **Content calendar** (`01_Clients/*/content-calendar.md` and `02_FullTimeJob/AlignHCM/linkedin-calendar.md`) — the queue of motion assets to produce.
- **SOP** — see `04_SOPs/HyperFrames Video Production SOP.md`.
- **Agent** — see `11_Agents/HyperFrames Agent.md`.

## Notes / open questions
- v0.3.0 at time of adoption (2026-04-16). Expect rough edges.
- Confirm FFmpeg install on the workstation before first render.
- Outputs are deterministic (Puppeteer frame capture + FFmpeg encode), so the same HTML produces identical MP4s across machines — good for client approvals.
