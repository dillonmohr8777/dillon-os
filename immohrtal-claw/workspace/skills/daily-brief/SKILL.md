---
name: daily-brief
description: Compile the morning operating brief from the vault into Daily-Briefs. Local file, draft only.
---

# Daily brief

The morning read. What changed, what is waiting, what to do first.

## When to use

Dillon asks for the brief, the morning rollup, or where things stand today.

## Tools

The front door is already in context. Then `kb_search` and `kb_open` over
`System/approval-queue.md`, `00_Inbox/`, `01_Clients/`, and the most recent
`Daily-Briefs/` note. `brief_write` to save it. `memory_compile` at the end.

## How

1. Read the compiled front door first. It already carries operating status and
   the open approval titles; do not re-search what you can already see.
2. Diff against the most recent brief in `Daily-Briefs/`. The value is what
   CHANGED, not a restatement of standing facts.
3. Structure it: what changed since the last brief, what is waiting on Dillon,
   what is at risk, the one thing to do first.
4. Cite `path:line` for every claim. Mark anything you could not verify.
5. Save with `brief_write` as `YYYY-MM-DD - daily brief.md`.

## Stop conditions

- If nothing changed since the last brief, say that in two lines and stop.
  A brief that pads to look busy trains him to stop reading briefs.
- Do not invent progress. A client with no new notes is "no change", not "on track".
- One brief per day unless he asks to regenerate; pass overwrite only then.

## Approval boundary

Local file only. Writing the brief is not sending it. No email, no Slack, no
client contact, no platform changes. Everything in the waiting section stays
waiting until Dillon acts on it himself.
