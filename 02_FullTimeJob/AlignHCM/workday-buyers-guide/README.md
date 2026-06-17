# Workday Buyer's Guide — Align HCM (2026 Edition)

A polished, print-ready PDF buyer's guide for CHROs, CFOs, HRIS leaders, finance
leaders, and transformation teams evaluating Workday.

## Files
- `workday-buyers-guide.html` — source layout (all 14 chapters extracted)
- `Workday-Buyers-Guide-Align-HCM-2026.pdf` — rendered output (29 pages, US Letter)
- `assets/` — embedded brand fonts (Plus Jakarta Sans, DM Sans) + official Align HCM logo

## Design notes
- On-brand palette: navy `#0A1628` / `#15233B`, orange `#F05A28` / `#FF6B35`,
  teal accent `#2BB5A0`, Workday blue `#0875E1`.
- Orange gradient chapter header bands, navy "Buyer takeaway" panels, teal
  "Buyer question" callouts, stat strips, scorecard, and a fill-in workbook.
- Uses the official Align HCM logo (`assets/alignhcm-logo.png`, transparent,
  extracted from the SmartCare video project). The Workday logo is a clean
  editorial wordmark; swap for the official asset before external distribution.
- Layout flows continuously (chapters do not force page breaks) to avoid
  near-empty pages, on an 8pt spacing grid: 29 pages.

## Design system
- 8pt spacing grid and 1.25 modular type scale (per `apple-hig-expert` / `ui-design-system` skills).
- Editorial newspaper-style pull-quotes and a navy at-a-glance "key questions" box.
- All text meets readable contrast (no light-gray body type).

## Rebuild the PDF
```bash
pip install weasyprint
python3 -c "from weasyprint import HTML; HTML('workday-buyers-guide.html', base_url='.').write_pdf('Workday-Buyers-Guide-Align-HCM-2026.pdf')"
```

## Status
Starting point for further design refinement (Canva / brand kit). Logos are
recreated wordmarks; replace with official assets before external distribution.
