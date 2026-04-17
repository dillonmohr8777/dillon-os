---
tags: [content, hyperframes, video, ai-agents, html-video, toolchain]
type: reference
status: reference
platform: html-video
publish_date:
source: HeyGen
captured: 2026-04-17
purpose: Reference for May calendar HTML video creation
---

# HyperFrames — HTML Video Toolchain for AI Agents

> AI agents can write, can code, can talk, and operate autonomously — but they still cannot edit videos — now they can.

Today HeyGen is open-sourcing **HyperFrames** — an HTML-based video toolchain and rendering framework built for AI agents.

With HyperFrames, Claude Code is now an in-house Video Editor.

Give the HyperFrames Skill to your Agent, and they will immediately start to build videos by writing HTML (plus JS + CSS), then render them into MP4, MOV or WebM.

---

## HTML for Video Editing? What?

What the symphony was to Beethoven, play was to Shakespeare — HTML is to agents.

AI Agents shouldn't be learning After Effects or DaVinci Resolve. JSON or XML based tools are simply not built for Agents — they are built for humans.

Agents (LLMs) were trained on the web. Billions of pages of HTML. Millions of CSS & JavaScript animations. Hundreds of thousands of GSAP snippets, SVG compositions, Canvas experiments. The web is the largest creative medium in their training data by orders of magnitude.

When you let agents write HTML, CSS, and JavaScript, they're working in their native tongue.

So take their best work, add a thin set of HyperFrames' `data-` attributes — done. HTML becomes the best agent-native video editing toolchain.

---

## HyperFrames' Backstory

HeyGen started by helping millions of people create AI avatars to replace the camera — but the avatar is only half the story. People still need complex motion graphics, B-rolls, and visual storytelling to make videos engaging.

Mastering video editing is incredibly hard. It always involves a complex timeline, layers, keyframes — skills that take years to learn. After Effects is even more difficult for most people. So they took a different route and started experimenting with using HTML & JavaScript to make motion graphics.

They eventually adopted **GSAP** — a JavaScript animation library — and built it into their Video Editor so users can add editable motion graphics to their videos.

At the time, Agents weren't good enough. Building motion designs by writing HTML+CSS+JS based animations was still challenging. It required a lot of back-and-forth and often needed engineers to manually build them (yes, hand-written code).

But they already knew that **code → video** was the direction.

Then came November 2025, **Gemini 3** and **Opus 4.5** previewed.

They swapped them into their agent — and voilà. The Video Agent started producing motion graphics and multi-scene b-rolls consistently and with high-quality.

With pure HTML+CSS+JavaScript, they were able to get full-length videos, aesthetically striking and engaging, built from the most basic HTML primitives and JavaScript animations. Almost production-ready.

That's when the earliest versions of HyperFrames converged.

---

## How Does HyperFrames Work?

HyperFrames gets its name because it turns **HT**M**L** (HyperText Markup Language) into Video **Frames**: Hyper—Frames.

On top of the standard Web syntax, HyperFrames simply require a handful of `data-` attributes to be added to HTML elements so we can define a video timeline.

> read `/hyperframes/SKILL.md` for details

### Minimal Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
  <style>
    body { margin:0; width:1920px; height:1080px; overflow:hidden; background:#0D1B2A; }
    .scene { position:absolute; inset:0; width:1920px; height:1080px; overflow:hidden; background:#0D1B2A; }
    #scene2 { z-index:2; opacity:0; }

    .s1 { display:flex; flex-direction:column; justify-content:center; width:100%; height:100%; padding:120px 160px; gap:20px; box-sizing:border-box; }
    .s2 { display:flex; flex-direction:column; justify-content:center; align-items:center; width:100%; height:100%; padding:100px 160px; gap:32px; box-sizing:border-box; }
  </style>
</head>
<body>
  <div id="root" data-composition-id="hyperframes-intro"
       data-width="1920" data-height="1080" data-start="0" data-duration="5">
    <div id="scene1" class="scene">
      <div class="s1">
        <div class="s1-title">HTML is Video</div>
        <div class="s1-sub">Compose. Animate. Render.</div>
      </div>
    </div>

    <div id="scene2" class="scene">
      <div class="s2-title">Start composing.</div>
    </div>
  </div>
  <script>
    window.__timelines = window.__timelines || {};
    var tl = gsap.timeline({ paused: true });

    // Scene 1 — title entrance
    tl.from(".s1-title", { x:-40, opacity:0, duration:0.5, ease:"power3.out" }, 0.25);
    tl.from(".s1-sub", { y:15, opacity:0, duration:0.4, ease:"power2.out" }, 0.5);

    // Blur crossfade transition
    var T = 2.2;
    tl.to("#scene1", { filter:"blur(8px)", scale:1.03, opacity:0, duration:0.35, ease:"power2.inOut" }, T);
    tl.fromTo("#scene2",
      { filter:"blur(8px)", scale:0.97, opacity:0 },
      { filter:"blur(0px)", scale:1, opacity:1, duration:0.35, ease:"power2.inOut" }, T + 0.08);

    // Fade out
    tl.to(".s2-title", { y:-12, opacity:0, duration:0.3, ease:"power2.in" }, 4.5);
    tl.to(".s2-cmd", { y:-8, opacity:0, duration:0.3, ease:"power2.in" }, 4.6);

    window.__timelines["hyperframes-intro"] = tl;
  </script>
</body>
</html>
```

A complete video composition in under 70 lines:
- Scene one fades in a title
- Scene two blur-crossfades into a CTA
- All in 5 seconds
- `data-start` and `data-duration` control timing
- `data-track-index` controls layering
- GSAP drives animation
- Everything else is just HTML, CSS & JS

Anything that works in a browser works in HyperFrames: CSS animations, GSAP timelines, Lottie, Three.js, D3 visualizations, Google Fonts — the agent can use whatever web technology it already knows. No wrappers. No heavy-handed framework to learn.

---

## Summary

- Lets agents build videos through HTML
- Create, Preview, Render all done locally
- Fully open source at https://github.com/heygen-com/hyperframes
- Apache 2.0 license

### One Command — Make Your Agent a Video Editor

```bash
npx skills add heygen-com/hyperframes
```

---

## Why Open Source?

Video is one of the most effective communication mediums, and Agents should be able to create videos to communicate with humans with rich visualization. But the friction today is immense because all the video building tools are not architected for Agents.

Open-sourcing HyperFrames removes that friction entirely: **any agent, any LLM, zero API keys, instant video, all done locally.**

More fundamentally: HTML is the format for the future of video.

---

## Credits

**HyperFrames v1.0.0 team:** Abhay (@AbhayZala7), Jake (@JakeFromHeyGen), James (@Rames_Jusso), Miguel (@Miguel07Code), Vance Ingalls.

**Inspiration:** GreenSock (GSAP), Remotion, openclaw.

---

## My Application — May Calendar

- [ ] Install HyperFrames skill locally: `npx skills add heygen-com/hyperframes`
- [ ] Give Claude Code the HyperFrames skill
- [ ] Draft May content calendar video concepts (hooks, CTAs, B-rolls)
- [ ] Prompt Claude Code to produce first test composition (5s intro)
- [ ] Establish a reusable brand HTML template (fonts, colors, motion presets)
- [ ] Batch-generate weekly motion graphic overlays for May posts
- [ ] Render pipeline check: MP4 for social, WebM for web embeds

## Related
- [[Content Index]]
- [[Master Agent]]
- [[Facebook Ads Hook Library]]
