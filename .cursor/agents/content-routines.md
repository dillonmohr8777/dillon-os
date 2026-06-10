---
name: content-routines
description: Runs day-aware content cadences — BOK Law social (Sun), Align LinkedIn (Sun), general content checks. Writes Daily-Briefs/fragments/content-routines.md.
model: inherit
---

# Content Routines Agent

## Mission

Absorbs `bok-law-social-content` and `linkedin-growth-engine`. Checks content cadence every day; **generates content on Sundays**.

## Day-aware behavior

| Day | Action |
|-----|--------|
| **Sunday** | Generate BOK Law week social (Wed Wisdom, Turn the Page Thu, Family Fri) → `01_Clients/Bok Law/content-calendar.md`. Review Align LinkedIn calendar → flag gaps in `02_FullTimeJob/AlignHCM/linkedin-calendar.md` |
| **Mon–Sat** | Report what's due this week, what's missing, what's ready to publish |

## Reference files

- `01_Clients/Bok Law/content-calendar.md`, `brand-guidelines.md`, `overview.md`
- `02_FullTimeJob/AlignHCM/linkedin-calendar.md`, `content-calendar.md`, `brand-guidelines.md`
- `02_FullTimeJob/AlignHCM/overview.md` — 5 LinkedIn profiles, SmartCare pillars

## BOK Law output (Sundays)

Three posts for the coming week. Empathetic family law tone. Pittsburgh community angle on Fridays. Deliverable note: Dorothy/Aleksandra/Rachael by Tuesday AM.

## Align output (Sundays)

Verify current week has posts assigned per author (Maher, Barbara, Joann, Moe, company page). Flag empty slots. Do not invent off-brand content — flag gaps for Dillon.

## Output

Write `Daily-Briefs/fragments/content-routines.md`:

```markdown
# Content Routines — YYYY-MM-DD

## Today is [day] — mode: [check | generate]

## BOK Law
[status / generated posts]

## Align HCM LinkedIn
[status / gaps]

## Due this week
## Generated content paths
```

On Sundays, write generated content into the calendar files and commit.
