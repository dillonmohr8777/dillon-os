---
note_type: session-recovery
status: recovered
created: 2026-09-23
updated: 2026-09-23
session_first: 2026-09-15T02:12:00
session_last: 2026-09-15T02:12:00
session_count: 1
cwd: "C:\Users\dillo\Documents\Codex\2026-09-14\do-this\.claude\worktrees\momentum-creative-brief\brand-stills"
tags: [codex-recovery, session, 202609]
---

# Documents\Codex\2026-09-14\do-this\.claude\worktrees\momentum-creative-brief\brand-stills

**1 session(s)** · 2026-09-15 02:12 → 2026-09-15 02:12 · 7m agent-time (summed; sessions may overlap) · 21 MB transcript · 1/1 turns completed

## 1. 2026-09-15 02:12 · 7m · 20.6 MB

`01a0a2d5-dd58-75c3-bd15-fc6f17ac5d90` · turns 1/1

**Asked:**

> You are Astra, art director for Momentum. You have write access to this directory.
> 
> WHAT EXISTS: gen.py generates Momentum brand stills with OpenAI's gpt-image-2.5-sunburst. It has a STYLE preamble and 8 SUBJECTS. The 8 resulting PNGs are in this directory (01-skyline through 08-desk). Look at them.
> 
> THE JOB THESE STILLS DO: they are conditioning frames for image-to-video. Each one gets fed to Wan 2.2 image-to-video on a rented RTX 4090 to make a 5-10 second brand clip. So each still must have one obvious thing that can move, clear depth so a camera push reads, and no element that would break when animated.
> 
> BRAND CONSTRAINTS, non-negotiable:
> - The v3 ceramic artwork family: cool blue clay, warm gold detail, midnight ground. Palette midnight #03172E, navy #072D53, blue #1766AB, gold #EFB928, off-white ceramic.
> - No text, letters, numbers or logos in generated output. Ever. Typography is 

**Outcome reported:**

> Rewrote [gen.py](gen.py) and wrote [review-notes.md](review-notes.md) after inspecting all eight stills. Every scene now has a defined motion target and depth; replaced the gears, stairs, suspension bridge and magnifier.
> 
> Added true aspect controls, quality, takes, dry-run and local prompt variations. The [official API reference](https://developers.openai.com/api/reference/resources/images/methods/generate) documents no generation seed; the local seed controls framing only.
> 
> Offline checks passed. **No image API calls, no images generated.** Preview with `python gen.py --dry-run`.

<sub>rollout: `C:\Users\dillo\.codex\sessions\2026\09\14\rollout-2026-09-14T22-12-00-01a0a2d5-dd58-75c3-bd15-fc6f17ac5d90.jsonl`</sub>
