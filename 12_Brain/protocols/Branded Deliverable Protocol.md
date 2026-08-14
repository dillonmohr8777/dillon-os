---
tags: [protocol, brand, align-hcm]
updated: 2026-08-10
source: "[[12_Brain/raw/research/2026-08-10 - research - align-hcm-brand-extraction|2026-08-10 brand extraction receipt]]"
---

# Branded Deliverable Protocol

**Summary:** every Align HCM deliverable an agent produces ships fully branded
with the exact logo and the shipped token set; tabular deliverables get an HTML
twin. Standing directive from Dillon, 2026-08-10.

## Rules

- Use the **exact** Align HCM logo, never a recreation:
  `02_FullTimeJob/AlignHCM/assets/align-hcm-logo-reverse.png` (transparent,
  extracted from shipped PDFs). Big in the masthead, on navy `#0A1628`.
- Colors, type, and effects come verbatim from
  [[02_FullTimeJob/AlignHCM/brand-guidelines|Brand Guidelines]]. No "close enough"
  (skill mirror: `claude-skills-repo/skills/alignhcm-brand`).
- Client logos inside a deliverable load from each client's public domain
  (logo.clearbit.com pattern) with a styled monogram fallback. Transparent
  marks on a white chip; never redistribute downloaded logo files.
- Spreadsheet deliverables ship with an HTML twin: same data, brand masthead,
  stat band, logo wall, print CSS.
- Deliverable copy follows Align writing rules: no em dashes, contractions
  fine, bullet characters only. Quoted source data stays verbatim.
- Client-identifying content (names, deal values, CRM reads) goes to the
  **private** `client-operations-canonical` repo, never this public vault.

## Reference implementation

`client-operations-canonical` →
`clients/align-hcm/deliverables/2026-08-10-top30-story-shortlist-branded/`
(branded xlsx + HTML twin + build script; masthead, glass stat cards, platform
chips, value bars, editable-yellow preservation, cached-formula handling for
the Calc-less sandbox).
