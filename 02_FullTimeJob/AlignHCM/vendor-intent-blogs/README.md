# Claude-designed vendor-intent blog PDFs

Designed review PDFs for VIB01 to VIB10, built from the approved Markdown drafts
in `../articles/` following `../CLAUDE-DESIGN-BRIEF.md`.

## What's here

- `pdfs/` — the 10 designed review PDFs (A4 portrait, 6 to 7 pages each).
- `html/` — editable, fully self-contained HTML sources. Fonts (Plus Jakarta Sans +
  DM Sans) and the Align logo are embedded as base64, so each file prints to an
  identical PDF with no external assets and no font substitution.
- `EXPORT-QA.md` — per-brief export QA note: fonts, links, page breaks, table
  legibility, missing assets, content-rule compliance, and the change log
  (no copy was altered for layout).

## Design system

Align editorial system: deep navy `#0A1628` fields, orange `#F05A28`→`#FF6B35`
gradient emphasis, warm paper `#FBF9F6`, teal `#2BB5A0` accents. Plus Jakarta Sans
for display, DM Sans for body. Align logo on each cover; platform names are
text-only labels (no third-party logos), per the brief.

Each PDF preserves its article's keyword target, heading order, tables, numbered
processes, checklists, FAQs, CTA, and sources (source name plus visible destination
URL). Nothing merged, nothing published, no Paylocity. These are review artifacts;
the SEO destination remains an HTML article on alignhcm.com.
