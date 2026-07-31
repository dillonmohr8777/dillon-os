# Vendored brand fonts

These are the Align HCM brand typefaces from `02_FullTimeJob/AlignHCM/brand-guidelines.md`,
vendored so `generate-pdfs.py` produces identical output on any machine with no
network access.

| File | Family | Use |
|------|--------|-----|
| `PlusJakartaSans-Regular.ttf` | Plus Jakarta Sans 400 | Body copy, table cells |
| `PlusJakartaSans-SemiBold.ttf` | Plus Jakarta Sans 600 | Labels, sub-heads |
| `PlusJakartaSans-Bold.ttf` | Plus Jakarta Sans 700 | Headings, table headers |
| `PlusJakartaSans-ExtraBold.ttf` | Plus Jakarta Sans 800 | Cover title, KPI numerals |
| `JetBrainsMono-Regular.ttf` | JetBrains Mono 400 | Code spans, flat prompt lists |
| `JetBrainsMono-Bold.ttf` | JetBrains Mono 700 | Emphasis inside code |

Both families are licensed under the SIL Open Font License 1.1, which permits
redistribution. Plus Jakarta Sans is by Tokotype; JetBrains Mono is by JetBrains.

## Subset warning

These are the **Latin subsets** (converted from the Fontsource web builds), so
they cover Latin-1 plus common punctuation and nothing else. Anything outside
that range would render as a blank box, so `align_pdf/brand.py` rewrites the
marks these documents actually use (`>=`, arrows, check marks) before layout.
If a document needs a new symbol, add it to `GLYPH_SUBSTITUTIONS` rather than
assuming the glyph exists.

If the directory is empty or a file is missing, the build falls back to
Helvetica and Courier and prints a warning. It still succeeds; it just stops
looking like Align.
