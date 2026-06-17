# Momentum 360 — The AI Search Playbook (2026 Edition)

A brand-accurate, redesigned PDF / ebook on **AEO, GEO, and AI search** for small businesses.
This is an upgrade of the earlier 20-page draft: longer (29 pages), with refreshed 2026 data,
corrected best-practice guidance, and a full Momentum 360 visual design system.

## Deliverable
- **`momentum360-ai-search-playbook.pdf`** — the final ebook (29 pages, US Letter).

## Source files
| File | Purpose |
|------|---------|
| `ebook.html` | Editable source content + structure |
| `style.css` | Brand design system (print stylesheet for WeasyPrint) |
| `assets/logos/momentum360-logo.png` | Official full logo (high-res; gold wordmark + white tagline — used on the navy cover & back cover) |
| `assets/logos/momentum360-emblem.png` | Circular "M" emblem (transparent), used as the recurring brand mark in Momentum Edge panels and section watermarks |
| `assets/fonts/Montserrat.ttf` | Display / headings |
| `assets/fonts/SourceSans3.ttf` | Body text |

## Brand palette
Colors were sampled **directly from the official Momentum 360 logo** (not estimated):

| Role | Hex |
|------|-----|
| Brand Gold (wordmark) | `#F0B018` |
| Brand Blue (emblem) | `#0857A8` → bright `#2878C0` |
| Deep Navy (sections) | `#062A4F` |

## Regenerate the PDF
```bash
pip install weasyprint
cd 03_Content/Momentum360-AI-Search-Ebook
python3 -c "from weasyprint import HTML; HTML('ebook.html').write_pdf('momentum360-ai-search-playbook.pdf')"
```

## What changed vs. the prior draft
- Redesigned cover, part dividers, stat dashboards, the 6-layer Visibility Stack, tables,
  checklists, "Momentum Edge" panels, CTA band, and back cover — all on the blue + gold system.
- Added 2026 data points (ChatGPT ~900M WAU, AI Mode 1B+ users, Pew/Ahrefs/BrightEdge CTR data).
- New chapter: **Get Mentioned, Not Just Linked** (brand mentions > backlinks; listicles; share of voice).
- New chapters: **Structured Data & Schema** and a rebuilt **Crawler Controls & AI Readiness**.
- Accuracy corrections from Google's 2026 guidance: AEO/GEO is "still SEO," no special schema/`llms.txt`
  required, the self-serving review rule, `nosnippet` as the key AI control, and the Google-Extended nuance.

## Sourcing note
Third-party statistics are attributed to their publishers in the References section. Figures drawn from
secondary coverage should be confirmed against the primary source before public release. Third-party marks
(Google, OpenAI, Matterport, etc.) are used only as small nominative/educational references.
