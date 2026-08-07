# Vendored brand fonts

Poppins, the display and text face used across the approved Align HCM Customer
Agent documents, vendored so `generate-pdfs.py` produces identical output on any
machine with no network access.

| File | Weight | Use |
|------|--------|-----|
| `Poppins-Regular.ttf` | 400 | Body copy, table cells |
| `Poppins-Medium.ttf` | 500 | Nested list copy |
| `Poppins-SemiBold.ttf` | 600 | Tracked labels, field values, footer left |
| `Poppins-Bold.ttf` | 700 | Card titles, subheads, page numbers |
| `Poppins-ExtraBold.ttf` | 800 | Cover title, phase numbers, section headings |

Poppins is by Indian Type Foundry and Jonny Pinhorn, licensed under the SIL Open
Font License 1.1, which permits redistribution.

## Subset warning

These are the **Latin subsets** (converted from the Fontsource web builds), so
they cover Latin-1 plus common punctuation. Anything outside that range renders
as a blank box. The documents stick to Latin text, the middot, and en/em dashes.
If a new symbol is needed, check it exists here before using it.

The fonts are inlined into the HTML as data URIs at build time, so Chromium
never needs them installed system-wide. They are also used directly by the
post-pass that stamps the page header and footer.
