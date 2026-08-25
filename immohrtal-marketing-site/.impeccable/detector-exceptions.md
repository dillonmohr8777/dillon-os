# Detector exceptions

## 2026-08-24 mobile-fit correction

The responsive correction introduces no new literal colors, font families, or
off-ramp font-size endpoints. The detector still reports the incumbent site's
supporting Foundry font declarations, established tonal colors, and existing
micro-type steps because those implementation details predate this patch and
are not fully represented in the portable frontmatter token layer. They are
retained as a narrow exception for this mobile-fit release: replacing the
mature palette and type system would expand a bounded responsive repair into a
brand-system migration. The supporting fonts and tonal treatment are already
described in the narrative DESIGN.md and remain visually consistent with the
approved Particle Proof Conveyor direction.
