---
name: mistral-ocr
description: Read franchise FDDs and client PDFs with Mistral OCR 4 when a key is present. Stop if MISTRAL_API_KEY is missing. Do not spend, self-host, or commit extracted PII.
---

# Mistral OCR 4

Key-gated document skill. Mistral OCR 4 is the structured OCR from the
2026-08-17 Honeycove roundup. Useful for FDD PDFs and client docs.
It does **not** run without a key and it does **not** spend.

Official: https://mistral.ai/news/ocr-4/
Docs: https://docs.mistral.ai/models/ocr-4-0
Model id: `mistral-ocr-4-0` (GA 2026-06-23). Boxes, block types,
confidence, 170 languages. API list price $4 / 1k pages (batch $2).

## When to run

- A franchise FDD or client PDF needs structured text
- `/mistral-ocr <path-or-url>` after Dillon points at a file

## Order of operations

1. **Check for `MISTRAL_API_KEY`.** If it is missing, stop. Write the
   exact env var name and the official docs link. Do not mint a key.
2. **Do not call the API** unless Dillon approved the page spend.
   Draft the command / request shape only.
3. **Keep output out of public Git** when the source has contacts,
   financials, or other PII. Compiled notes go to
   `12_Brain/private/` or a working client folder Dillon names.
4. **Self-host is not the default.** The single-container option is
   an enterprise path, not something to install on this VM.

## Hard rules

- No key ⇒ no OCR. Do not fall back to uploading the PDF to a random
  third-party site.
- Do not put extracted emails, phones, or SSNs into tracked
  `12_Brain/` files.
- Pricing moves. Re-check https://mistral.ai/pricing/api/ before
  quoting a number as current.

## Reply shape

- Key present? yes / no
- Page-count guess and the spend gate
- Where the extract would land (private vs working folder)
