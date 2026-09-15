---
name: scroll-hero
description: Turn a site-factory harvest.json into a 6-8 second looping HyperFrames hero video in the prospect's palette and headline, then QA it by JSON (duration, dimensions, weight under 2 MB). Use after site-factory or mirror-and-improve, before the review hub.
---

# Scroll Hero

Turns a finished harvest into a looping motion hero for the top of a batch site. It never invents copy: every word in the loop already exists in `harvest.json` or the site's own `brief.json`. It runs after the site is built and QA'd, and before the batch review hub goes up.

## Inputs

Primary: `_templates/site-factory/harvest/<slug>/harvest.json`. Secondary, read when present: `<build-dir>/brief.json` (the brief `build-site.js` consumed — carries fields harvest.json doesn't). Fields consumed, with the fallback when a field is missing:

| Field | Source | Fallback |
|---|---|---|
| Business name | `voice.title` (strip any `\| tagline` suffix) | Title-cased `slug` |
| Headline (≤7 words) | `voice.headings[0]` | `brief.name` + `brief.category`, else business name alone |
| Supporting line | `voice.metaDescription` or `voice.ogDescription` | First entry in `voice.paragraphs`, trimmed to ~120 chars |
| Palette | `brief.tokens` (already brand-derived by `ui-design`) | Top two `brand.palette` entries by `weight`; background/text picked by contrast check (see Step 1) |
| Font | `brief.fonts.display` | `brand.fonts[0].family`, else system stack (no webfont load) |
| Logo | `<build-dir>/assets/logo.png` when `brief.logo` is truthy | No logo; text wordmark only |
| City / category | `brief.city`, `brief.category` | Omitted from the line entirely — never guessed |

`<build-dir>` is the site folder `build-site.js` produced: `philly-sites/<slug>/` for prospect demos, `01_Clients/<Client>/website/<slug>/` for client builds. Pass it explicitly; don't infer it from harvest alone.

## Outputs

All under `<build-dir>/hero/`:
- `hero-loop.html` — the HyperFrames composition, standalone HTML + GSAP
- `hero-loop.mp4`, `hero-loop.webm` — rendered loops
- `hero-poster.jpg` — first-frame still for the poster attribute and reduced-motion
- `hero-qa.json` — the QA contract below

## Steps

1. **Read and derive.** Pull the fields above. Compute palette roles: `primary` = highest-weight brand color, `accent` = second, `background`/`text` from `brief.tokens.paper`/`.ink` when present, else the palette entry pair that clears WCAG AA per the contrast rule in `ui-design` (`--on-*` tokens must pass 4.5:1). Cap the headline at 7 words — cut, don't paraphrase past recognition. One supporting line, one optional logo.

2. **Check for HyperFrames.** `ls ~/.claude/skills .claude/skills 2>/dev/null | grep -i hyperframes`. If absent, install it once per machine: `npx skills add heygen-com/hyperframes`. This gives you `/hyperframes` (compose) and `/hyperframes-cli` (init, lint, preview, render). The hosted HyperFrames MCP's `compose` and `render_video` tools are disabled for CLI agents by the MCP's own instructions — never call them from here; its read tools (`list_projects`, `get_project`, `get_project_status`, `get_render_status`) stay usable for inspecting anything already in the hosted app, but nothing in this skill depends on them.

3. **Compose.** Use `/hyperframes` to build a 1920x1080 (or 1600x900 if that's the site's aspect) 30fps composition, 6-8 seconds, that loops seamlessly — first and last frame must be pixel-identical (hold the composition on its rest state at both ends, don't just cut). Motion vocabulary comes from `motion-design`: reveal-in on headline and line, a slow drift on the background/media layer, ease-out timing, transform/opacity only, no more than 3 concurrent tweens, duration ceiling 1.1s per tween same as the site's own reveals. Export `hero-poster.jpg` as the rest-state frame — it's what reduced-motion and no-JS viewers see instead of the video.

4. **Render.** `/hyperframes-cli render` to both mp4 and webm. Target under 2 MB each: start around CRF 28-30 (mp4, libx264) / equivalent webm quality, drop to two-pass at a capped bitrate (~1.8 Mbps for 7s at 1080p) if the single-pass export lands over budget. Never ship a file over 2,097,152 bytes to hit a quality bar — re-encode instead.

5. **QA.** `node .claude/skills/scroll-hero/scripts/hero-qa.mjs --dir <build-dir>/hero` and fix every failure it reports before handing the loop off. It writes `hero-qa.json` itself.

6. **Embed.** On the site, the hero media block becomes:
   ```html
   <video autoplay muted loop playsinline poster="hero/hero-poster.jpg" aria-hidden="true">
     <source src="hero/hero-loop.webm" type="video/webm">
     <source src="hero/hero-loop.mp4" type="video/mp4">
   </video>
   ```
   webm first, mp4 fallback, poster under 120 KB. This is markup, not a script — `frontend-build`'s no-JS rule holds: the poster renders with JS off or before the video loads, and the video plays with JS off too since `autoplay`/`loop` are HTML attributes, not IntersectionObserver-driven.

7. **Degraded path.** If HyperFrames render isn't reachable (install failed, `/hyperframes-cli render` errors, or you're in a context where it's genuinely unavailable), stop after Step 3: `hero-loop.html` is the deliverable, mark the step `degraded` per `12_Brain/protocols/Connector Preflight` result states, and note it in the batch's review hub instead of silently shipping no hero.

## QA contract

`hero-qa.json`:
```json
{
  "duration_s": 7.0,
  "width": 1920,
  "height": 1080,
  "fps": 30,
  "size_bytes_mp4": 1480000,
  "size_bytes_webm": 1210000,
  "loops_seamlessly": true,
  "poster_bytes": 98000,
  "pass": true,
  "failures": []
}
```
Pass requires all of: `6 <= duration_s <= 8`; `1920x1080` or `1600x900`; `size_bytes_mp4` and `size_bytes_webm` each `<= 2097152`; `poster_bytes <= 122880`. `loops_seamlessly` is a first/last-frame pixel diff — false is a warning, not a hard fail, but note it in the prospect record. Any hard-fail field lands in `failures[]` as a plain sentence.

## Cost

- **Sonnet**: reads harvest/brief, derives palette and copy, drives `/hyperframes` compose and `/hyperframes-cli render`.
- **Haiku**: runs `hero-qa.mjs` and reports pass/fail — no composition judgment needed for that step.
- **Fable**: nothing in this skill needs the premium tier. Don't route any step to it.
- A subagent invoked for this skill returns a summary capped at 150 words: pass/fail, file sizes, what's degraded.
- One hero per prospect per batch. Re-running a hero on an unchanged harvest just re-spends render cost for nothing — check `hero-qa.json`'s timestamp against the harvest and brief before re-rendering.

## Rules

- Keep changes to what the task asks. Report nearby problems as follow-ups, never fix them unasked.
- Edit surgically; never rewrite a whole file when a targeted edit does the job.
- Never put words in the loop the prospect didn't use — same lingo rule as `mirror-and-improve`: headline and line trace to `voice.headings`, `voice.metaDescription`, or `voice.paragraphs`, not invented copy.
- Never spend Higgsfield or HeyGen render credits without the batch already being approved to run; this skill's own HyperFrames compose/render is local and free, but if it ever falls back to a paid generator, that spend goes through `System/approval-queue.md` like any other paid action.
- No invented logos. If `brief.logo` is false or the asset is missing, ship the text wordmark — never generate a mark that looks like one.

## References

[[motion-design]] · [[frontend-build]] · [[site-factory]] · [[mirror-and-improve]] · [[12_Brain/protocols/Connector Preflight]]
