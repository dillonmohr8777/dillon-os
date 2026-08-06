# Editable source — Align HCM Customer Agent v2 PDFs

These two HTML files are the editable source used to generate the v2 PDFs. They are laid out at true US‑Letter geometry (612×792 pt) and rendered to PDF with headless Chromium, which preserves clickable links and embeds the fonts.

## Files
- `knowledge-core.html` → `Align-HCM-Customer-Agent-Knowledge-Core-v2-2026-07-24.pdf`
- `readiness-report.html` → `Align-HCM-Customer-Agent-Readiness-Report-v2-2026-07-24.pdf`
- `assets/` — brand logo (`align-logo.png`) and the two type families used:
  - **Poppins** (Regular/Medium/SemiBold/Bold/ExtraBold) — display/headings
  - **Mulish** (variable) — body text

  Both are Google Fonts under the SIL Open Font License, bundled here so the build is reproducible offline.

## Rebuild
```bash
./build.sh
```
`build.sh` installs the bundled fonts for the current user (fontconfig), then prints each HTML file to its PDF with:
```
chromium --headless=new --no-pdf-header-footer --allow-file-access-from-files \
         --print-to-pdf=<out.pdf> file://<in.html>
```
Set `CHROME=/path/to/chrome` if the script can't auto‑detect your browser.

## Editing notes
- Colors, type sizes, and spacing are defined once in the `<style>` block at the top of each file (CSS variables for the palette). Edit text directly in the page `<div class="page">` blocks.
- Each page is one `.page` element; keep content within the visible area (the page uses `overflow:hidden`). After edits, re‑render and eyeball every page — a few pages are intentionally dense (Knowledge Core p10; Readiness Report p4 and p10).
- Links are real `<a href>` elements, so they stay clickable in the PDF. Keep the visible text human‑readable.
