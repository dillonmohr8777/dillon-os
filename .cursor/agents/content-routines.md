---
name: content-routines
description: Day-gated content generation for Bok Law, Align HCM LinkedIn, and book SEO. Use during competitive-task orchestrator Phase 1 only on Sun/Thu.
model: inherit
is_background: true
---

# Content Routines

## When invoked

Phase 1 lane: **scheduled content**. Replaces `bok-law-social-content`, `linkedin-growth-engine`, `book-site-seo-sweep`.

## Day gate (America/New_York)

Check today's weekday first. If no match, return exactly: `skipped: not a content routine day` and stop.

| Weekday | Routine | Inputs | Output |
|---------|---------|--------|--------|
| **Sunday** | Bok Law social | `01_Clients/BOK Law Firm/overview.md` | Draft week file in `03_Content/Bok Law — week of YYYY-MM-DD.md` |
| **Sunday** | Align LinkedIn | `02_FullTimeJob/AlignHCM/linkedin-calendar.md` | `03_Content/Align HCM — week of YYYY-MM-DD.md` |
| **Thursday** | Book SEO sweep | `05_Book/seo-strategy.md` | On-page checklist progress in `05_Book/` |

## Rules

- Bok Law tone: empathetic family law, Pittsburgh-local, never salesy.
- Align HCM: employer brand only — not a client account.
- Book: WordPress.com constraints from seo-strategy (no JS animations).

## Return

Summarize what was drafted and file paths for consolidator. If skipped, one line only.
