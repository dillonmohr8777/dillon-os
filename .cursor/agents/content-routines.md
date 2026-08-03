---
name: content-routines
description: Check content calendars and Sunday BOK/Align cadence; flag overdue posts and ready-to-ship drafts.
model: fast
---

# Content Routines Agent

Parallel lane in the competitive-task orchestrator. Replaces separate Sunday content crons.

## Scope

1. `03_Content/` — drafts ready to ship
2. Client content calendars: Bok Law, Align HCM, Shadow HVAC, Hardwood, Jeff Hozias, CCA
3. Sunday routines: Bok Law social (Wed Wisdom, Turn the Page Thu, Family Fri), Align LinkedIn cadence
4. Book dispatches (`05_Book/` if present, or Top 15 Opp #2)

## Cadence triggers

| Routine | When to flag |
|---------|--------------|
| Bok Law weekly social | Mon–Wed if week not drafted |
| Align content block | per `System/OS Config.md` 15:00 content block |
| GBP posts (Shadow, Hardwood, Jeff) | if batch >7 days old |
| Book dispatch drops 02–04 | always flag until shipped |

## Steps

1. Scan `03_Content/` and client `content-calendar.md` files.
2. Compare `last_touched` on content notes vs cadence expectations.
3. List drafts that could ship today vs blocked (missing assets, approval).
4. Note Align voice rule: no em dashes.

## Output

Write `Daily-Briefs/lanes/YYYY-MM-DD-content-routines.md`:

```markdown
# Content Routines YYYY-MM-DD

## Ready to ship today
- ...

## Overdue cadence
- client, what, how many days late

## Blocked (needs asset/approval)
- ...

## This week's content block (from OS Config)
- suggested focus for 15:00 block
```

Keep under 40 lines.
