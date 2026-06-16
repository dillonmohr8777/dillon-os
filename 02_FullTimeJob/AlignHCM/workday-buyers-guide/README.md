# Workday Buyer's Guide — Align HCM (2026 Edition)

A polished, print-ready PDF buyer's guide for CHROs, CFOs, HRIS leaders, finance
leaders, and transformation teams evaluating Workday.

## Files
- `workday-buyers-guide.html` — source layout (all 14 chapters extracted)
- `Workday-Buyers-Guide-Align-HCM-2026.pdf` — rendered output (31 pages, US Letter)
- `assets/` — embedded brand fonts (Plus Jakarta Sans, DM Sans)

## Design notes
- On-brand palette: navy `#0A1628` / `#15233B`, orange `#F05A28` / `#FF6B35`,
  teal accent `#2BB5A0`, Workday blue `#0875E1`.
- Orange gradient chapter header bands, navy "Buyer takeaway" panels, teal
  "Buyer question" callouts, stat strips, scorecard, and a fill-in workbook.
- Align HCM and Workday logos are built as inline SVG wordmarks (editorial
  reference). Swap for official brand-kit logo files in Canva for the final.

## Rebuild the PDF
```bash
pip install weasyprint
python3 -c "from weasyprint import HTML; HTML('workday-buyers-guide.html', base_url='.').write_pdf('Workday-Buyers-Guide-Align-HCM-2026.pdf')"
```

## Status
Starting point for further design refinement (Canva / brand kit). Logos are
recreated wordmarks; replace with official assets before external distribution.
