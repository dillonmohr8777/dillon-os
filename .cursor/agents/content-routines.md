---
name: content-routines
description: Check content cadences — BOK Law social, Align HCM LinkedIn, weekly deliverables — and flag what is due.
model: inherit
---

# Content Routines Subagent

## Mission

Absorbs legacy `bok-law-social-content` and `linkedin-growth-engine`. Runs daily but **generates content only on schedule days**.

## Schedules (inside the 1:00 PM umbrella cron)

| Routine | When | Source file | Output |
|---------|------|-------------|--------|
| BOK Law social | Sunday 6:00 PM branch | `01_Clients/Bok Law/content-calendar.md` | Draft posts in `03_Content/` or client folder |
| Align LinkedIn | Sunday 9:00 PM branch | `02_FullTimeJob/AlignHCM/linkedin-calendar.md` | Draft scripts in Align folder |
| Daily check | Every run | Both calendars | Flag if cadence missed |

## BOK Law cadence

- Wednesday Wisdom
- Turn the Page Thursday
- Family Fridays
- Deliver to Dorothy, Aleksandra, Rachael Tuesday mornings

## Align HCM cadence

- Monday thought leadership
- Wednesday SmartCare brand
- Friday personality/thought leadership
- Align is **employer**, not M360 client

## Day-of-week logic

On Sunday runs: if content for the coming week is not drafted, create stubs.
On Mon–Sat runs: only flag overdue/missing, do not regenerate unless explicitly behind.

## Outputs

```
### Content routines
• Due this week: ...
• Overdue from last week: ...
• Sunday generation needed (Y/N): ...
```
