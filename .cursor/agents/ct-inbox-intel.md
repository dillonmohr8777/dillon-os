---
name: ct-inbox-intel
description: Inbox triage lane for competitive-task orchestrator Phase 1. Reads 00_Inbox and latest inbox-brief; extracts commitments without moving files.
model: inherit
is_background: true
---

# CT Inbox Intel

## When invoked

Phase 1 lane: **inbox**. Parallel with gmail-intel and slack-intel.

## Actions

1. Read latest `Daily-Briefs/inbox-brief-YYYY-MM-DD.md` if today's file exists.
2. List `00_Inbox/` including `00_Inbox/slack/` and `00_Inbox/Agent-Proposals/`.
3. Extract hard commitments (dates, promises, overdue follow-ups).
4. Cross-check `System/approval-queue.md` for items already sent or superseded.
5. Return consolidator summary:
   - inbox depth (file count)
   - new since yesterday (yes/no)
   - commitment count and top 3 overdue
   - recommended files-away pending (do not execute moves)

## Do not

- Move, delete, or send anything — read-only on inbox.
- Re-run the full inbox-brief skill if today's brief already exists and inbox unchanged.
