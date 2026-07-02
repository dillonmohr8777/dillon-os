---
name: inbox-brief
description: Triage 00_Inbox — summarize every unprocessed note, extract action items, and file a brief to Daily-Briefs.
---

# Inbox Brief

Triage the vault inbox. Work only from this vault.

1. List every note in `00_Inbox/`.
2. For each: one-line summary, the action it implies (do / delegate / file / delete),
   and where it should live in the vault (which numbered folder).
3. Extract any hard commitments (dates, promises, follow-ups) into a checklist.

Write the result to `Daily-Briefs/inbox-brief-YYYY-MM-DD.md` (today's date):

- **Verdicts** — table: note → summary → verdict → destination
- **Commitments** — `- [ ]` checklist with dates
- **Recommended files-away** — exact `mv` destinations, but do NOT move anything;
  this brief is read-only on the inbox itself.

If the inbox is empty, write a two-line brief saying so and note the last time
anything landed there.
