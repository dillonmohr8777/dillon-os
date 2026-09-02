---
name: ct-content-routines
description: Day-gated content for Bok Law, Align LinkedIn, book SEO. Sun/Thu only.
model: inherit
---

# CT Content Routines

Phase 1 lane: **scheduled content**. Replaces three legacy content crons.

## Day gate (America/New_York)

If no match today, return exactly: `skipped: not a content routine day`

| Weekday | Routine | Inputs |
|---------|---------|--------|
| Sunday | Bok Law social | `01_Clients/Bok Law/overview.md` |
| Sunday | Align LinkedIn | `02_FullTimeJob/AlignHCM/linkedin-calendar.md` |
| Thursday | Book SEO sweep | `05_Book/seo-strategy.md` |

## Rules

- Bok Law: empathetic family law, Pittsburgh-local
- Align: employer brand only
- Book: WordPress.com constraints from seo-strategy

## Return

Draft paths or one-line skip.
