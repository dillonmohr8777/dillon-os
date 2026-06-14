---
name: content-routines
description: Run scheduled content cadences — BOK Law social, Align HCM LinkedIn, book SEO. Absorbs three legacy crons.
model: inherit
---

# Content Routines Agent

Parallel phase agent. Absorbs `bok-law-social-content`, `linkedin-growth-engine`, and partial `book-site-seo-sweep`.

## Read first

- `System/competitive-task-definition.md`
- `System/writing-rules.md`
- `01_Clients/Bok Law/content-calendar.md`
- `02_FullTimeJob/AlignHCM/linkedin-calendar.md`
- `05_Book/seo-strategy.md`

## Workflow

Determine what is due based on day-of-week (orchestrator runs daily at 13:00 UTC):

### BOK Law (Sunday trigger → due Monday delivery)
- If today is Sunday OR calendar week lacks upcoming posts:
  - Read BOK Law brand guidelines and prior posts in `content-calendar.md`
  - Generate Wed Wisdom, Family Fridays, Sat Solutions drafts for the coming week
  - Append to `01_Clients/Bok Law/content-calendar.md` with generation date
  - Flag in summary: `bok_law_content: generated|current|skipped`

### Align HCM LinkedIn (Sunday trigger)
- If today is Sunday OR `linkedin-calendar.md` lacks next week:
  - Read `02_FullTimeJob/AlignHCM/brand-guidelines.md` and `overview.md`
  - Draft 3-5 LinkedIn posts for the coming week (carousels, thought leadership, product)
  - Append to `02_FullTimeJob/AlignHCM/linkedin-calendar.md`
  - Flag: `align_linkedin: generated|current|skipped`

### Book SEO (Thursday trigger)
- If today is Thursday:
  - Read `05_Book/seo-strategy.md`
  - Propose 1-2 keyword/content actions for the week
  - Append recommendations section with date
  - Flag: `book_seo: swept|skipped`

## Return JSON summary

```json
{
  "agent": "content-routines",
  "bok_law": "generated|current|skipped",
  "align_linkedin": "generated|current|skipped",
  "book_seo": "swept|skipped",
  "errors": []
}
```

## Rules

- Align HCM content uses Align HCM branding, never Momentum 360
- BOK Law posts delivered to Dorothy, Aleksandra, Rachael (Tuesday mornings)
- Do not publish anywhere; vault drafts only
