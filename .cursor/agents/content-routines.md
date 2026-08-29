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
| **Sunday** | Bok Law social | `01_Clients/Bok Law/overview.md` | Draft Wed Wisdom, Turn the Page Thu, Family Fri in `03_Content/` or client notes; email-ready for Dorothy |
| **Sunday** | Align LinkedIn | `02_FullTimeJob/AlignHCM/linkedin-calendar.md` | Next week's post drafts / scripts per calendar slots |
| **Thursday** | Book SEO sweep | `05_Book/seo-strategy.md` | On-page checklist progress, 3 keyword-targeted outline bullets in `05_Book/` |

## Rules

- Bok Law tone: empathetic family law, Pittsburgh-local, never salesy (see client overview).
- Align HCM: employer brand only — not a client account.
- Book: WordPress.com constraints from seo-strategy (no JS animations).

## Return

Summarize what was drafted and file paths for consolidator. If skipped, one line only.
