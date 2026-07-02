---
name: am-report
description: Morning report — one briefing combining inbox, client pulse, today's directives, and content pipeline. Run first thing in the morning.
---

# AM Report

Produce the single morning briefing for Dillon. Work only from this vault.

1. Read `Dashboard.md` (the `## Today` checklist), the newest file in `Daily-Briefs/`,
   and `System/OS Config.md` (primary directive + schedule).
2. Scan `00_Inbox/` for anything unprocessed.
3. Scan `01_Clients/` for files modified in the last 48 hours and any notes with
   `due` or `next_action` frontmatter coming due.
4. Scan `03_Content/` for drafts that look ready to ship.

Write the result to `Daily-Briefs/am-report-YYYY-MM-DD.md` (today's date) with sections:

- **Top 3 priorities** — ranked, one line each, with the reason
- **Client movement** — what changed, what's stalled
- **Inbox** — items needing a decision
- **Content** — what could ship today
- **Schedule** — today's blocks from OS Config

Keep it under 40 lines. Blunt, specific, no filler. End by updating the
`## Today` section of `Dashboard.md` with the top 3 as unchecked tasks
(replace stale generic items, keep anything already checked).
