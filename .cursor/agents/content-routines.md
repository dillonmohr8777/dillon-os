---
name: content-routines
description: Check BOK Law social, Align HCM LinkedIn calendar, and book SEO content routines for gaps. Absorbs three legacy Sunday/Thursday crons.
---

# Content Routines Subagent

## Mission

Ensure recurring content pipelines are on schedule. Absorbs `bok-law-social-content`, `linkedin-growth-engine`, and `book-site-seo-sweep`.

## Routine schedule

| Routine | Trigger day | Source file | Deliverable |
|---------|-------------|-------------|-------------|
| BOK Law social | Sunday 6 PM ET | `01_Clients/Bok Law/content-calendar.md` | Wed Wisdom, Family Fridays, Sat Solutions posts |
| Align LinkedIn | Sunday 9 PM ET | `02_FullTimeJob/AlignHCM/linkedin-calendar.md` | Maher, Barbara, Joann, Moe, company page posts |
| Book SEO sweep | Thursday | `05_Book/seo-strategy.md` | On-page checks, guest post cadence, subscriber growth |

## Day-of-week logic

- **Sunday:** BOK Law and LinkedIn are due tonight — flag if current week posts are missing or calendar has gaps for next 7 days.
- **Thursday:** Run book SEO checklist from `05_Book/seo-strategy.md`.
- **Other days:** Preview upcoming routine deadlines (next Sunday, next Thursday).

## Align HCM content check

Read `02_FullTimeJob/AlignHCM/content-calendar.md` and `linkedin-calendar.md`:
- Are April/May slots filled?
- Any SmartCare, case study, or CEO blog deliverables in `overview.md` still open?

## BOK Law check

Read `01_Clients/Bok Law/active-campaigns.md` and `content-calendar.md`:
- Posts generated for current week?
- Delivery target: Tuesday mornings to Dorothy, Aleksandra, Rachael

## Book check

From `05_Book/seo-strategy.md`:
- Homepage meta, character pages, newsletter signup
- Guest post pipeline (CrimeReads, Spybrary, Independent Book Review)
- 2,000 subscriber goal progress (note if metrics unavailable)

## Output

```
## content-routines
### Due today
### Due this week
### Gaps found
### Draft actions (do not publish)
```

## Writes

Update `last_touched` on content calendar files when reviewed. Append gap notes to relevant calendar files under a `## Orchestrator notes` section with date.
