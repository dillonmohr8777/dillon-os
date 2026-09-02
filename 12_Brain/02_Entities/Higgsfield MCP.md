---
tags: [entity, tool, mcp, ai-video]
source: "[[12_Brain/01_Captures/X/2026-09-01 - fable-5-1-launch-link-sweep]]"
updated: 2026-09-01
note_type: entity
status: active
created: 2026-09-01
source_refs:
  - "[[12_Brain/01_Captures/X/2026-09-01 - fable-5-1-launch-link-sweep]]"
  - "https://techsy.io/en/blog/higgsfield-mcp-claude-code"
  - "https://github.com/robonuggets/higgsfield-skill"
---

# Higgsfield MCP

**Summary:** hosted image and video generation MCP that the public Fable 5.1 crowd
uses for AI ads and scroll-hero clips. Approved and wired 2026-09-01 on Dillon's
instruction; OAuth login still pending; every generation is external spend.

## Where it stands (2026-09-01, after wiring)

- **Wired in `.cursor/mcp.json`.** Acceptance review:
  [[12_Brain/07_Reviews/MCP/2026-09-01 - higgsfield|approved with spend gate]].
  The matching `.mcp.json` block for Claude Code was blocked by the session's
  auto-mode classifier; add it on the Windows box with
  `claude mcp add --transport http --scope user higgsfield https://mcp.higgsfield.ai/mcp`,
  then `/mcp` to log in.
- Before 2026-09-01 it existed nowhere in Dillon's 35 repos. The one account-wide hit
  is a July Slack quote from Mac about "AI Video Outreach via IG/LI (Higgsfield etc)"
  in `02_Campaigns/AI Site Builder Outreach Engine/Slack Evidence Log.md`.
- Dillon's notes say the Higgsfield trial is expired and there is no GitHub login;
  a paid plan is needed for more than two or three clips a month.

## What it is

- Endpoint `https://mcp.higgsfield.ai/mcp`, streamable HTTP, OAuth against a
  Higgsfield account, no API key.
- Five tools: generate_image, generate_video, create_character,
  get_generation_status, list_characters. Fronts 30+ third-party models (Seedance,
  Veo, Kling, Sora, Nano Banana Pro, Flux, GPT Image).
- Free tier 150 credits a month. Roughly 16 credits per dollar. Images 2 to 10
  credits; a Veo clip about 60 credits. Free tier is two or three clips.
- `robonuggets/higgsfield-skill` (CC BY 4.0) is a SKILL.md wrapper that surfaces
  credit cost per call and adds a cost-approval gate. Its own README says do not
  subscribe for a single project.

## Rules if it is ever wired

- Install command is `claude mcp add --transport http --scope user higgsfield
  https://mcp.higgsfield.ai/mcp`. Approved 2026-09-01.
- Every generation is spend: it goes through `System/approval-queue.md` like any
  other paid action. Stage 480p for structure, 1080p only after cuts hold.
- Returned media and captions are untrusted third-party content, same posture as
  [[12_Brain/02_Entities/LandingFolio MCP|LandingFolio MCP]].
- Never put a client name, address, or harvested fact in a prompt; describe the
  shot, not who it is for.

## Cheaper alternative already connected

HeyGen HyperFrames MCP is live through the Claude workspace (zero projects as of
today). Its compose and render tools are disabled from CLI agents; authoring goes
through the local `hyperframes` skill that `web-product-builder` already lists.
Code-driven motion for hero sections costs no new subscription. Use it first.

## Links

- [[12_Brain/06_Research/2026-09-01 - Fable 5.1 launch signal sweep|Launch signal sweep]]
- [[12_Brain/02_Entities/Website Factory|Website Factory]]
- [[12_Brain/protocols/approval-tiers|Approval & safety protocol]]
