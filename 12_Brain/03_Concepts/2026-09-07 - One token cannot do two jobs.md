---
note_type: concept
status: active
created: 2026-09-07
updated: 2026-09-07
tags: [concept, design-system, accessibility, momentum-360, tokens, qa]
source_refs:
  - 'C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\deliverables\2026-09-05-momentum-design-system\AUDIT.md'
  - 'C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\deliverables\2026-09-05-momentum-design-system\audit\contrast.json'
  - 'C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\deliverables\2026-09-05-momentum-design-system\tokens\momentum.tokens.css'
---

# One token cannot do two jobs

**Summary:** A colour token named for the colour will eventually be used as both
a field and as text on another field, and no saturated accent can pass contrast
in both roles. Name tokens by **job**, not by hue — and enforce it in the build,
not in a style guide.

## The measurement

Momentum's brand orange `#f58320` scores:

- **7.19:1** as a field, with near-black text on it — comfortably AA.
- **2.58:1** as text on white — a failure, and it is the live primary CTA on
  `needmomentum.com`.

There is no orange that is recognisably the brand orange and clears 4.5:1 in both
roles. The token was doing two incompatible jobs, so the failure was structural
rather than careless.

## What it produced in shipped work

Ten live prospect builds, every `:root` block parsed from the shipped HTML and
independently re-measured in-browser. **120 token pairs measured, 37 fail WCAG
AA.** Three defects account for nearly all of it:

- **`--accent` on `--brand`** — the circular seal. 6 of 10 sites, ratios from
  **1.01:1** to 2.72:1 against a 4.5 requirement. At 1.01:1 the text is invisible.
- **`--muted` on `--panel`** — **9 of 10 sites**, 4.28:1 to 4.49:1. Nine
  consecutive near-misses is a formula, not nine accidents: `--muted` is derived
  as `color-mix(in srgb, var(--ink) 66%, var(--paper))`, validated against
  `--paper`, and then rendered on `--panel`, a surface it was never checked on.
  One site misses by 0.01.
- **`--brand` on `--brand-2`** — headings on the deep field. 7 of 10 sites,
  1.78:1 to 2.86:1 against a 3.0 large-text requirement. Both derive from the same
  hue, so the darker is always too close to the lighter.

Two client-affecting specifics worth keeping: **Nolt's Auto Parts and Weathers
Motors both shipped the kit's unmodified demo palette** (`--accent: #d4762a` on
`--brand: #1d4e6d`), and `advance-exterior` carries the same demo navy. Build
notes claimed colours that appear nowhere in the shipped HTML.

The kit itself is disciplined — all ten sites define the same 68 properties, the
same three fonts, the same six radii, the same easing curve. Exactly the seven
per-prospect tint tokens vary, which is correct. The failure is narrow and
systemic, which is why it repeated.

## The fix, and why it generalises

Split the accent by **job**, not by shade:

| Token | Job | Measured |
|---|---|---|
| `--m-accent` | field only | — |
| `--m-on-accent` | label on that field | 7.19:1 |
| `--m-accent-ink` | text on paper | 6.18:1 |
| `--m-accent-on-deep` | text on the deep field | 8.51:1 |
| `--m-accent-on-brand` | text on the brand field | **3.14:1, declared large-text-only** |

`--m-muted` is validated on **both** grounds (6.25:1 paper, 5.43:1 surface)
instead of derived from one. `--m-deep` is a fixed field with its own measured
on-colours instead of being derived from `--m-brand`.

Result: **31 pairs, 0 failures**, 22 of them small-text. Lowest small-text pair
4.54:1. The single pair that cannot pass at body size is **stated** as
large-text-only rather than shipped as a silent failure — which is the honest
move and the one worth copying.

## The part that actually holds

Two mechanisms, and they matter more than the palette:

1. **`build.py` refuses to render the page if any pair fails.** The gate is in the
   build, so a regression cannot ship quietly.
2. **`contrast.py` reads `momentum.tokens.css` itself**, not a transcription. A
   token cannot pass the audit and ship a different value.

And the methodology caveat, kept because it nearly produced a false report: the
first in-browser probe read `color(srgb 0.87 0.89 0.89)` as 0–255 rather than
0–1 and reported roughly a dozen false failures at 1.2:1. **A contrast tool that
has not been checked against a known value is not evidence.** `contrast.py`
asserts 21.00:1 for white-on-black and 4.54:1 for `#767676`-on-white before it
runs.

## The commercial reading

The drift is the "before" half of a sellable story, told in this order: we
measured our own shipped work, found 37 failures, built a gate that makes them
impossible, and the gate ships with every client build. Told in that order it is a
verifiable claim. Told as "we never fail the design test" it is a claim the
existing estate contradicts.

Feeds [[12_Brain/05_Projects/2026-09-07 - Momentum AI division launch]] and
[[12_Brain/03_Concepts/2026-09-07 - The delivery machinery is the product]].
