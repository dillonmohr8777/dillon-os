---
tags: [entity, tool, ocr]
source: "[[12_Brain/raw/research/2026-08-17 Honeycove Seedance Roundup Receipts]]"
updated: 2026-08-17
expires: 2026-11-17
---

# Mistral OCR 4

**Summary:** structured document OCR — useful for FDD and client PDFs,
blocked without `MISTRAL_API_KEY`, and every page is spend.

Official: https://mistral.ai/news/ocr-4/
Docs: https://docs.mistral.ai/models/ocr-4-0
Model: `mistral-ocr-4-0` (GA 2026-06-23). Bounding boxes, block
types, confidence, 170 languages. List price on the news/docs pages:
$4 / 1k pages, batch $2, Document AI $5. Self-host container is an
enterprise option, not a cloud-VM default.

## How Dillon OS uses it

Skill: `.claude/skills/mistral-ocr/SKILL.md`. Stop if the key is
missing. Do not commit extracted contacts or financials to public
Git — private layer or a named working folder only.

## Links

- [[12_Brain/research/Franchise Email Sourcing|Franchise Email Sourcing]]
- [[12_Brain/concepts/Access Verification Discipline|Access Verification Discipline]]
- Decision: [[12_Brain/decisions/2026-08-17 - Institute Seedance 2.5 and gated companions|2026-08-17 — Seedance stack]]
