---
tags: [concept, web-design, site-factory]
source: "[[12_Brain/entities/Website Factory]]"
updated: 2026-08-14
---

# Phone Catalog Stacks

**Summary:** catalog cards on phones must stack full-width. A 3-up grid or a carousel whose flex-basis misses the wrapper is a ship-blocking layout bug.

Wrapping each `.catalog-card` in `.t-tilt` made the phone rule `.catalog-grid .catalog-card { flex: 0 0 min(82vw,340px) }` miss the actual flex items. Every w36 homepage then rendered three skinny columns, stretched those cards to equal height (`height: 100%` on `.t-tilt`), and parked the bottom dock over the empty card feet.

Fix lives in the factory, not in one brief:

- `@media (max-width: 700px)` catalog is `grid-template-columns: 1fr`
- tilt wrappers are `height: auto; width: 100%` on phones
- QA fails a 390px pass if the first two catalog items share a row or the first item is under 78% of the viewport

Do not bulk-add catalog copy to clear whitespace. The word cap is 380–720; stacked cards make the existing sentence fill. Skip Dutton / Sprinkles / Andorra if a site is already against the cap.

## Links

- [[12_Brain/entities/Website Factory|Website Factory]] · [[12_Brain/concepts/Netlify Deploy Safety|Netlify Deploy Safety]]
