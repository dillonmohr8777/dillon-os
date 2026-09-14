---
note_type: visual-audit
status: complete-review-not-approval
updated: 2026-09-12
source_refs:
  - "../assets/gpt-plates/"
  - "../manifests/ASSET-MANIFEST.json"
  - "../SHOT-LIST.md"
---

# Six-frame visual audit

Inspected all six PNGs directly with `view_image` on 2026-09-12. These are source plates, not six finished advertising frames. They have attractive tactile paper, readable silhouettes and room for copy, but the dominant palette is cream/orange/olive. None is already blue-and-cream. Only plate 04 contains people. No readable copy or logo was visible in any of the six.

| Source ID / actual file inspected | Visible evidence | Decision against current 30s brief |
|---|---|---|
| NM-GPT-PLATE-01 / [NM-GPT-PLATE-01-flock-rising.png](../assets/gpt-plates/NM-GPT-PLATE-01-flock-rising.png) | Diagonal mixed-species flock rises bottom left to upper right; cream center; orange and olive corners; leaves and flowers. | Keep as flight-direction reference. Already a large flock, so unsuitable as the opening before activity grows. Bird details are useful extraction sources; full plate would repeat later flock scenes. |
| NM-GPT-PLATE-02 / [NM-GPT-PLATE-02-cardinal-signal.png](../assets/gpt-plates/NM-GPT-PLATE-02-cardinal-signal.png) | Oversized perched red cardinal dominates left; small birds, floral branch, city skyline and river across bottom; empty upper right. | Keep as cardinal material reference. Bird portrait says little about useful business work; city landmark risks an unintended geography. Exclude full plate from the 30s story. |
| NM-GPT-PLATE-03 / [NM-GPT-PLATE-03-prosperity-arc.png](../assets/gpt-plates/NM-GPT-PLATE-03-prosperity-arc.png) | Birds form a broad arch over a large empty center; orange sun and rays; layered landscape and foliage. | Keep as flock-spacing reference only. Visually close to ceremonial/wreath framing; no task or human action. Do not use as a separate logo/title scene. |
| NM-GPT-PLATE-04 / [NM-GPT-PLATE-04-human-flightpath.png](../assets/gpt-plates/NM-GPT-PLATE-04-human-flightpath.png) | Three people at a round cafe table, one with laptop; storefront lower left; bird path passes into broad cream upper/right space; orange/olive details. | Strongest narrative source. Derive intact people/table/cafe foreground for opening and human payoff. People are conversing, not visibly approving a software action; communicate review via separate paper copy and pencil mark without pretending a UI demonstration. |
| NM-GPT-PLATE-05 / [NM-GPT-PLATE-05-many-birds-one-direction.png](../assets/gpt-plates/NM-GPT-PLATE-05-many-birds-one-direction.png) | Dense flock on left narrows right; large foreground dove/cardinal; orange sun lower left; substantial upper-right copy space. | Best dove/cardinal extraction source and perspective reference. Independent foreground birds needed for flock growth; a flat full-plate drift cannot show coordination. Avoid the baked orange landscape in current master. |
| NM-GPT-PLATE-06 / [NM-GPT-PLATE-06-future-needs-momentum-lockup.png](../assets/gpt-plates/NM-GPT-PLATE-06-future-needs-momentum-lockup.png) | Blank torn cream center sheet with shadow; doves and cardinals framing corners; foliage and orange torn pieces. | Keep end-card spatial idea, not full orange frame. Final typography and authentic logo remain separate. A second or third treatment like this would make the ad a poster slideshow. |

**Minimum change:** retain originals and their material vocabulary; create one shared blue/cream background and derive three foregrounds (people tableau, dove, cardinal). Build business actions in editable type and paper layers. Four artwork outputs total, one new and three derived; extraction feasibility remains untested. No need for six replacement full-scene generations. If a source-derived cutout fails edge QA, record the revised foreground as extra work instead of claiming it was extracted cleanly.

**Logo evidence from parent's current verification:** `momentum-mark.png`, original blue cursive M inside circle, SHA256 `046b7bc27374c1d38f3885a3c638908e1dd8097cfed6fafed9631d7d60bc1ef2`; `momentum-logo.png`, same mark plus MOMENTUM, SHA256 `a5ae2c88eb4f78b201612dc9597c8190e4e86e36fd70451bb1989500e7c3ad62`. Both live under `C:/Users/dillo/Documents/Codex/projects/client-operations/clients/momentum-360/deliverables/2026-09-08-momentum-brand-system-v3/assets/`. Parent reports sidecars verify exact copies from v2, with no generated/raster edits. This is relayed verification, not a second independent logo audit. Exact intended-reference match remains unverified. Small raster mark requires resolution review before final enlargement.

**Technical limits:** Parent verified all six source plates decode at 1672x941 and match the Remotion public copies byte-for-byte. Original Downloads files were not found; ingest history remains the documented provenance rather than newly verified account history. Source plates are at 1672x941, below its own 1920x1080 ingest minimum. Do not label these native full-HD finals; check intended crop and upscale quality. Existing 15s Remotion still proof does not prove this 30s story is implemented. No new images, motion, render, audio, or export was made in this audit. Original reference visual identity remains pending parent reconciliation.

The durable correction is in `../SHOT-LIST.md` and the existing `../manifests/ASSET-MANIFEST.json`: customer work drives the six beats, with one final logo lockup. Review-ready direction is not user approval or a finished video.

