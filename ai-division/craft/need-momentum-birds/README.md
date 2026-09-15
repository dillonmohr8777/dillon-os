# Need Momentum: 30-second scrapbook launch ad

Updated September 12, 2026. Draft and staged only.

Dillon explicitly assigned GPT-6 Astra as temporary creative director and production coordinator for this ad. GPT Image through the conversation's image tool handles later artwork. GrokBot is not required between direction and generation. This is a project-specific assignment; persistent machine and model settings remain unchanged.

Current working files:

- [SHOT-LIST.md](SHOT-LIST.md): single current 30-second storyboard, scene timings, copy, and transitions.
- [Asset manifest](manifests/ASSET-MANIFEST.json): stable asset IDs, provenance, layer requirements, and review status.
- [STATUS.md](STATUS.md): current completion and production gaps.

Current visual direction is blue-and-cream torn paper with tactile shadows, doves, cardinals, and a growing flock. Show people, customers, and useful business actions. Keep typography and the authentic M-and-circle logo as separate compositing layers. The six ingested plates are visual development, not a finished commercial.

This pass audits those six frames and locks a continuous story before producing further artwork. It authorizes local storyboard and manifest work. It does not authorize paid API generation, publication, spending, machine-setting changes, or declaring an unverified editor connected.

The Windows project has existing Remotion dependencies, an available Chrome executable, and a prior inspected still. Its implemented composition remains 15 seconds. A new 30-second composition, sound, and finished export are not yet demonstrated. After Effects is an available integration path elsewhere in the stack, not a verified connection for this project.

## Historical 15-second scaffold

The September 11 snapshot below preserves provenance. Its Grok ownership, no-Astra wording, orange palette, 15-second timing, and Linux execution assumptions are superseded for the current pass. Do not treat them as current instructions.

# Need Momentum — Birds Prosperity (2026-09-11)

**Client / brand:** Need Momentum  
**Owner:** Dillon Mohr  
**Status:** DRAFT / stage only — no send, post, or spend  
**Root:** `/workspace/ai-division/production/need-momentum-birds-2026-09-11/`

## Mission

Produce scrapbook-energy bird prosperity hero motion and still plates that humanize AI through flock symbolism (doves, cardinals, collective flight). Visual metaphor: prosperity + direction + warmth. Original craft only — no Anthropic/Claude marks.

## Role split

| Role | Agent | Responsibility |
|------|--------|----------------|
| **Orchestrator** | ChatGPT Pro Master | Concept naming, GPT Image plate gens, creative direction, ingest asks |
| **Executor** | Grok (this box) | Scaffold SoT, Remotion comps, manifests, renders, status |

Windows Codex Luna loop may run separately. Do **not** use Astra. Do **not** drive desktop/Chrome while user may have box control.

## Craft SoT (locked)

- **Motifs:** doves, cardinals, flock = prosperity + humanizing AI
- **Energy:** Fable 5.1 scrapbook — torn paper, cream, layered; ORIGINAL only
- **Type:** Outfit Bold (display) + Source Sans 3 (body)
- **Accent:** `#E27113`
- **Logo:** Momentum logo overlay on **finals only** (not draft hero)
- **Motion primary:** Remotion on this Linux box

## Concepts (Pro ChatGPT)

See `concepts/CONCEPTS.md`:

1. Flock Rising  
2. Cardinal Signal  
3. Prosperity Arc  
4. Human Flightpath  
5. Many Birds One Direction  
6. Future Needs Momentum Lockup  

## Remotion hero (15s)

- **Composition id:** `NeedMomentumBirdsHero`
- **Spec:** 450 frames · 30 fps · 1920×1080
- **Project:** `remotion/`

### Install / deps

Uses existing Remotion `4.0.523` via symlink to  
`/workspace/ai-division/production/2026-09-11-remotion-mai01/mai01/node_modules`  
(same pattern as kit20-videos). If the symlink breaks:

```bash
cd remotion && npm install
```

### Preview

```bash
cd remotion
npx remotion studio
```

### Render (export)

```bash
cd remotion
npx remotion render NeedMomentumBirdsHero out/NeedMomentumBirdsHero.mp4
```

Optional still / frame probe:

```bash
npx remotion still NeedMomentumBirdsHero out/hero-frame.png --frame=225
```

### Bundle

```bash
cd remotion && npm run build
```

## Key paths

| Path | Purpose |
|------|---------|
| `Sot/PRODUCTION-SOT.md` | Production source of truth |
| `concepts/CONCEPTS.md` | Six concept one-liners |
| `briefs/15s-hero-brief.md` | Hero brief |
| `remotion/` | Remotion project |
| `assets/` | Replaceable plates / placeholders |
| `manifests/ASSET-MANIFEST.json` | Stable asset IDs |
| `manifests/INGEST-CONTRACT.md` | Ingest slots for Pro GPT Image |
| `STATUS.md` | Done / next ask |

## Guardrails

- Draft/stage only
- No Anthropic/Claude branding
- Momentum logo overlay on finals only
- Do not touch Astra or user desktop/Chrome during this loop
