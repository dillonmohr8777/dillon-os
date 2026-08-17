---
tags: [campaign, growth-workshop, list-hygiene]
campaign: "[[Growth Workshop]]"
verified: 2026-08-14
---

# 200-list clean report — verified 2026-08-14

One-line summary: the existing Philly workshop sheet is send-ready as-is — no dupes, no blanks, every email re-verified with live MX today.

Checked the Drive sheet Dillon re-shared with Sean on Aug 7 (the "200 list"). What's actually in the shared tab: **117 prospect rows**, IDs `PHL-WORKSHOP-051` → `PHL-WORKSHOP-167`.

| Check | Result |
|---|---|
| Rows | 117 |
| Blank emails | 0 |
| Duplicate emails | 0 |
| MX re-verification (2026-08-14, DNS-only) | **117/117 pass** |
| Outreach status | all `Not sent` — invite is fresh, not a reschedule |
| Registration links | per-row UTM links to the workshop LP, already in place |

Method: sheet exported to CSV, deduped, then `node _os/automation/bin/mx-check.js` (DNS MX lookups only — nothing sent, no SMTP probing). Full re-checked CSV delivered privately (Cursor artifacts); no contact data lives in this repo.

## What this means for the calendar

- The Mon Aug 17 "clean the 200 list" step in [[Outreach Plan]] is **already done** — the list can go straight to Touch 1 on Tue Aug 18 once Sean/Mac approve copy and the LP shows Aug 27.
- Row count is 117, not ~200, so expected registrations from this audience adjust to **2–6** (1–3% cold conversion). Organic + franchise lanes carry the rest.
- If a second tab or earlier batch (IDs 001–050) exists outside the shared sheet, run the same two-minute re-check on it before sending.
