---
name: ct-content-routines
description: Day-gated content for Bok Law, Align HCM LinkedIn, and book SEO. Phase 1 only on Sun/Thu.
model: inherit
is_background: true
---

# CT Content Routines

## When invoked

Phase 1 lane: **scheduled content**. Replaces `bok-law-social-content`,
`linkedin-growth-engine`, `book-site-seo-sweep`.

## Day gate (America/New_York)

Check today's weekday first. If no match, return exactly:
`skipped: not a content routine day` and stop.

| Weekday | Routine | Inputs | Output |
|---------|---------|--------|--------|
| **Sunday** | Bok Law social | `01_Clients/Bok Law/overview.md` | Draft week posts in `03_Content/` |
| **Sunday** | Align LinkedIn | `02_FullTimeJob/AlignHCM/linkedin-calendar.md` | Next week's post drafts |
| **Thursday** | Book SEO sweep | `05_Book/seo-strategy.md` | On-page checklist + 3 keyword outlines |

## Rules

- Bok Law: empathetic family law, Pittsburgh-local, never salesy.
- Align HCM: employer brand only — not a client account.
- Book: WordPress.com constraints from seo-strategy.

## Return

Summarize drafts and file paths. If skipped, one line only.
