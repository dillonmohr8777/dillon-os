---
name: seedance
description: Draft ByteDance Seedance 2.5 one-take video prompts for ads, GBP, and IG/LI outreach. Use when the user wants Sea Dance / Seedance, 30-second clips, omni references, or "hey we made you this" video. Draft only unless spend is approved. Higgsfield is optional and currently needsAuth.
---

# Seedance 2.5

Production-adjacent video skill. ByteDance Seedance 2.5 is the one-take
model from the 2026-08-17 Honeycove roundup. This skill writes the shot
list. It does **not** generate, publish, or spend.

`/motion-design` is CSS scroll/hover. Do not overload it.

## When to run

- `/seedance` — draft a 9:16 or 16:9 one-take for ads, GBP, or outreach
- `/seedance <brief>` — same, for a named job (no client names in the
  model prompt)

Also trigger for "Sea Dance", Seedance, Higgsfield video, or Mac's
"AI Video Outreach" lane.

## Order of operations

1. **Draft first.** Write the shot list in the vault or the reply.
   Generating a clip, connecting Higgsfield, minting BytePlus/Jimeng
   keys, or posting to IG/LI/GBP is Tier 2.
2. **Name the job.** Aspect, duration (4–30s), audio on/off, mode.
   Default social/ads: `9:16`, 15–30s, `generate_audio` **false** if a
   platform soundtrack will replace it.
3. **Write the prompt like a shot list.** Subject, camera, lighting,
   mood, sound, timestamp blocks (`0–5s`, `5–12s`, …). Official
   one-take example style:
   https://seed.bytedance.com/en/blog/one-take-creation-flexible-referencing-introducing-seedance-2-5
4. **Pick a mode** (Higgsfield id `seedance_2_5`, verified 2026-08-07):

   | Mode | Use |
   |---|---|
   | `t2v` | First render, prompt only |
   | `omni_reference` | Identity / product / location must hold |
   | `video_edit` | Repair a region; bills by source duration |
   | `video_extension` | Continue past 30s; aspect follows the source |

5. **Do not generate.** If Higgsfield MCP tools are present **and**
   Dillon approved spend, list the exact call (`seedance_2_5`, mode,
   duration, aspect, `generate_audio`) and wait. If the server is
   `needsAuth`, stop. Do not run account connect. BytePlus ModelArk
   was still "coming soon" on the 2026-07-31 Seed post.

## Live facts vs marketing

| Claim | Treat as |
|---|---|
| 30s one-take + extensions | Official (Seed 2026-07-31) |
| Up to 30 images + 10 videos + 10 audio | Official Seed split |
| "50 multimodal refs" / "native 4K" | Marketing. Live Higgsfield enum is **480p or 720p** |
| `generate_audio` default true | Live Higgsfield default — turn it off for silent/trending-audio work |
| Start/end frame | **Not on 2.5.** That stays on Seedance 2.0 |

Do not tell Dillon the live path outputs 4K.

## Hard rules

- Never put client names, harvested phones, addresses, or private facts
  in a model prompt. Describe the business in generic visual terms.
- Follow the client's brand guidelines (Bar Crawl: no alcohol language).
- Never invent testimonials, licenses, or "as seen on" claims.
- Higgsfield / Jimeng / Doubao / BytePlus credits are spend.
- Do not install a new video MCP. New MCPs still go through
  `_os/automation/bin/mcp-gate.js`.
- Do not download model weights.
- A finished clip is still a draft until Dillon says to post.

## Reply shape

- One-line job (aspect × duration × mode × audio on/off)
- The shot-list prompt
- Operator gates left: Higgsfield auth, credits, publish
- Resolution honesty: 720p live ceiling unless a newer official spec
  says otherwise
