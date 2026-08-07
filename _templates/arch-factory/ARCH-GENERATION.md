# Arch generation — the architecture actually deployed on batch 3 and 4

Reverse-engineered on 2026-08-06 from five live sites across the two Netlify hubs. **This supersedes `philly-sites/DESIGN-SYSTEM.md` for new builds.** That document describes the *profile* generation (the original Philly 25); batches 3 and 4 shipped something materially different, and nothing in dillon-os, claude-skills-repo or client-operations-canonical contains the generator that produced them.

Sources (fetched and diffed, not inferred):

| Sample | Arch skin | Words | Images |
|---|---|---:|---:|
| `batch-3/advanced-commercial-interior-inc` | `arch-fresh-bloom` | 1177 | 8 |
| `batch-3/a-positive-response-plumbing-llc` | `arch-poured-slab` | 1233 | 8 |
| `batch-3/choice-coating-inc` | `arch-kinetic-blueprint` | 1210 | 9 |
| `batch-4/all-phase-electric-co` | `arch-picket-run` | 1140 | 9 |
| `batch-4/apt-heating-and-cooling` | `arch-aurora-drift` | 1224 | 9 |

A full sample page is kept verbatim at `reference/sample-advanced-commercial-interior.html`, with its CSS and JS split out into `reference/engine.css` and `reference/engine.js`. Those three files are the generator's target.

## How it differs from the profile generation

This is the part that matters. Building a new batch on the old spec would ship prospects a visible downgrade.

| | Profile generation (`philly-sites/`) | **Arch generation (batch 3–4)** |
|---|---|---|
| Body class | `profile-page slug-<name> attitude-<x>` | `site-<slug> arch-<skin>` |
| Words of copy | 293–543 (target 350–500) | **1140–1233** |
| Page weight | 22–36 KB | **81–85 KB** |
| Images | 7–13 | 8–9 |
| Reveal hooks | none | **59–66 `data-rv`** |
| Radius token | `--radius` | `--r` |
| Border token | `--border` | `--bw` |
| Glass / depth | ad hoc | `--glass`, `--glass-line`, `--shadow` via `color-mix()` |
| Gutter | fixed padding | `--gut: clamp(20px, 5vw, 72px)` |
| Skins | 6 attitudes | **21 arch skins** |
| AEO sections | none | **`service-guide` + `faq` on every site** |

The word count is the biggest gap: roughly **2.5× the old target**. The old spec's "350 to 500 words" is not a small miss, it is a different product.

## The engine is fixed, the content varies

Every sampled page ships the **same** ~56 KB of CSS containing **all 21 arch skins**, then activates one through the body class. Same for the ~9 KB of JS. That is why pages land at 81–85 KB, and it is what makes a generator straightforward: the engine is a constant, and only tokens, copy, images and one class name change per site.

### The 21 arch skins

```
field-grid      poured-slab     pitch-shift     picket-run      circuit-live
forge-iron      ridge-line      impact-dossier  build-blocks    aurora-drift
fresh-bloom     clinic-orbit    soft-arch       aqua-lane       liquid-suite
stone-garden    zen-strata      porcelain       gilded-sheen    case-file
one-on-one
```

The five samples used five different skins, so assume one skin per site and no repeats within a batch — the same "don't look like 25 recolors" rule the profile generation had, escalated.

Names cluster by vertical, which is worth respecting when assigning: `circuit-live` and `forge-iron` read industrial/electrical, `clinic-orbit` and `porcelain` read medical, `fresh-bloom` and `stone-garden` read soft/wellness, `poured-slab` and `build-blocks` read construction, `case-file` and `impact-dossier` read professional services.

### Tokens

```css
:root{
  --paper:#F8F4EC;      /* base background, warm off-white tinted to brand */
  --ink:#17332F;        /* base text, near-black tinted to brand */
  --accent:#176B5E;     /* primary brand hue */
  --accent2:#E8A649;    /* secondary hue */
  --panel:#DCEBE5;      /* mid-tone surface */
  --deep:#0C2926;       /* darkest surface */
  --on-accent:#FFFFFF;  /* only emitted when white fails AA on the accent */
  --display:'Bricolage Grotesque',system-ui,sans-serif;
  --text:'Instrument Sans',system-ui,sans-serif;
  --r:26px;             /* radius: 0 brutalist -> 26 soft */
  --bw:0px;             /* border weight: 0 -> 2px observed */
  --glass:color-mix(in srgb,var(--paper) 62%,transparent);
  --glass-line:color-mix(in srgb,var(--ink) 16%,transparent);
  --shadow:0 24px 60px -24px color-mix(in srgb,var(--deep) 45%,transparent);
  --gut:clamp(20px,5vw,72px);
}
```

Observed spread across the five: `--paper` `#EEE9E1`–`#F8F4EC`, `--accent` `#0C7894` / `#176B5E` / `#9C4E36` / `#D7A243` / `#DE6B3F`, `--r` `0px`/`6px`/`26px`, `--bw` `0px`/`1px`/`2px`.

`--on-accent` appears only when needed — the source carries a comment saying it defaults to white and is set explicitly when the brand accent is too light for white text to reach AA. Contrast is a decision the generator must make, not a constant.

### Display fonts observed

`Bricolage Grotesque`, `Anton`, `Archivo`, `Bebas Neue`, `Fraunces` — paired with `Instrument Sans` and similar quiet text faces. Note that none of these appear in the profile generation's font list, so that list is stale too.

### Section vocabulary

Present in **all five** samples, so treat as required:

```
top  services  story  gallery  visit  service-guide  faq
```

Optional, appearing in some: `feature`, `project-detail`, `path`.

Order varies — `all-phase-electric-co` runs `top, gallery, story, services` while the others run `top, services, story, gallery`. So order is a per-site decision, not fixed, but `top` is always first and `service-guide` + `faq` always close.

**`service-guide` and `faq` are the notable addition.** Both appear on every sample and both are answer-engine plays — they line up with the existing `_os/automation/bin/aeo-trust-gate.js`. A build without them is not this generation.

### Motion

The JS engine (`reference/engine.js`, ~9 KB) implements, in order of use:

| Hook | Count in sample | What it does |
|---|---:|---|
| `data-rv` | 59 | Reveal on scroll via `IntersectionObserver` |
| `data-delay` | 12 | Stagger within a revealed group |
| `data-mag` | 7 | Magnetic hover on interactive elements |
| `data-scrub` | 6 | Scroll-linked transform |
| `data-vanish` | 3 | Section fades as it leaves upward |
| `data-count` | 1 | Number count-up |
| `data-particles` | 1 | Canvas ambient layer |

It respects `prefers-reduced-motion` (two guards) and drives animation through `requestAnimationFrame` rather than scroll handlers. Roughly 60 reveal hooks per page is the density to match; a page with five looks static beside these.

### Head requirements

Unchanged from the profile generation and confirmed present: viewport, charset, `theme-color`, real meta description, `LocalBusiness` + `PostalAddress` JSON-LD, Google Fonts preconnect pair, and `noindex` on every prospect demo (verified present on all five samples).

## Copy voice — this shifted too

The profile generation's voice was loud and declarative: *"BEST CHEESESTEAK IN PHILLY."* The arch generation is restrained and specific. Verbatim from `advanced-commercial-interior-inc`:

> Interior surfaces, made easier to scope
>
> Measured planes, clean transitions, and a quiet service index give Folcroft interior work a sharper edge.

Note what it does: names the actual trade (painting / drywall), names the actual town (Folcroft), and makes a concrete claim about scoping rather than an adjective about quality. Proof blocks state facts — *"Listed location: 1050 E Ashland Ave"*, *"Direct contact: Call (610) 237-9900 to start the conversation."*

## How 1,200 words is actually reached — this is the key finding

The copy is **not mirrored from the prospect's site.** It is generated from a handful of verified facts poured into templated sections.

Proof: the `faq` section carries the identical four questions on every sample, across three different trades, with only the business name substituted.

| | `advanced-commercial-interior` | `a-positive-response-plumbing` | `all-phase-electric` |
|---|---|---|---|
| Q1 | What can I ask about? | What can I ask about? | What can I ask about? |
| Q2 | Where is **Advanced Commercial Interior** listed? | Where is **A Positive Response** listed? | Where is **All Phase Electric** listed? |
| Q3 | How can I get in touch? | How can I get in touch? | How can I get in touch? |
| Q4 | What should I prepare? | What should I prepare? | What should I prepare? |

The hero works the same way. Reading `advanced-commercial-interior`'s opening against its inputs:

> **Folcroft** · **Painting / drywall** — "Interior surfaces, made easier to scope"
> "Measured planes, clean transitions, and a quiet service index give **Folcroft** interior work a sharper edge."
> Listed location: **1050 E Ashland Ave, Folcroft, PA 19032** · Direct contact: Call **(610) 237-9900**

Everything bold is a fact. Everything else is prose generated around those facts, and *"Questions around painting / drywall in Folcroft, PA"* is visibly a filled template.

**So the inputs per site are five fields:** business name, trade/vertical, town, phone, address. That is exactly what the radar registry plus `lib/harvest-lite.js` already produce.

This matters enormously for feasibility. It means a thin source site is not a blocker — which is just as well, because it has to be true: these prospects were chosen *for* having bad websites. Harvesting the five buildable targets tested on 2026-08-06 returned 0–153 words of readable copy. There is nothing there to mirror. The old profile generation's "mine their exact lingo" premise does not survive contact with a decayed site, and the arch generation quietly replaced it with "state their verified facts and generate the connective prose."

### The cost of that, which is worth knowing before shipping 100 more

Templated copy across a whole batch is **duplicate content at scale**. Fifty sites sharing the same four FAQ questions and the same sentence skeletons will not earn the answer-engine visibility that having a `faq` section implies, and a prospect who opens two of them side by side sees the seams. It is fine for a one-look direct-mail demo whose job is to be better than what they have. It is not an SEO asset, and it should not be sold as one.

If these are ever meant to rank rather than just impress, the FAQ and service-guide bodies need real per-vertical variation — which is where genuine research cost reappears.

## What is still missing

The engine is banked; the generator is not. To build sites that match, something must:

1. Harvest each prospect's real copy, palette and imagery. `harvest.js` needs Playwright; a fetch-only fallback can get copy and text-derived palette hints but not computed styles or screenshots.
2. Derive the six surface tokens from their real signage and photos, then choose `--r`/`--bw` and an arch skin that fits the vertical.
3. Write ~1,200 words in the voice above, per prospect, grounded in verified facts.
4. Emit the fixed engine plus the per-site head, tokens, body class and nine sections.
5. QA at 390/850/1440, check contrast against the `--on-*` decision, confirm `noindex`.

Steps 1 and 3 are the real work. Step 4 is mechanical now that the engine is in hand.

## Provenance

Extracted by fetching the live pages over HTTPS and diffing five samples to separate the fixed engine from per-site variation. Every number here is measured from those pages, not estimated. Re-verify if the hubs are redeployed — this is a snapshot of what was live on 2026-08-06.
