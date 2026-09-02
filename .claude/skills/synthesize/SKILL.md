---
name: synthesize
description: Weekly synthesis pass on the big model — read across the whole vault and write what changed this week, what's drifting, and what deserves attention. The only loop that earns the premium tier.
---

# Synthesize

Read across the vault the way an operator would — this is the one pass where
breadth is the point. Use subagents for the heavy reading (each returns one
paragraph); keep this context for the conclusions.

Inputs: last 7 days of `git log`, `12_Brain/01_Captures/sessions/`, new `12_Brain/01_Captures/` captures, the
wiki layer (`12_Brain/02_Entities/`, `12_Brain/03_Concepts/`), `01_Clients/` movement, and the latest
`Daily-Briefs/` reports (pulse, wiki-lint).

Write `Daily-Briefs/synthesis-YYYY-MM-DD.md`:

1. **What changed** — the week's real movement: clients, campaigns, decisions,
   new knowledge compiled into the wiki.
2. **What's drifting** — commitments going stale, clients quiet too long,
   pages contradicting reality, loops that didn't run (check
   `12_Brain/01_Captures/sessions/session-log.md` cadence).
3. **What deserves attention** — the 3 highest-leverage moves for next week,
   grounded in vault pages ([[link]] each one). Tie back to the primary
   directive in `System/OS Config.md` (ROAD TO 100 CLIENTS).
4. **Predictions** — check every active client and open thread against
   `12_Brain/03_Concepts/Leading Indicators.md` and make explicit calls: who is at churn
   risk and why, what will bite in the next two weeks if untouched, which
   lane is compounding. State each as a falsifiable one-liner with a
   watch-signal. Grade last week's predictions (hit / miss / pending) and
   record confirmed hits or busts back into Leading Indicators.
5. **Wiki health** — one line: pages added/updated this week, lint status.

Update any wiki page the synthesis proves wrong or stale (with source), and
add the synthesis note itself to no index — briefs are output, not wiki.
End with `git diff --stat`.

## Rules

- Keep changes to what the task asks. Report nearby problems as follow-ups, do not fix them in the same pass.
- Edit surgically; never rewrite a whole file when a targeted edit does the job.

## Cost

- Step 1 Gather inputs (subagent reads across the vault): Sonnet (sonnet)
- Step 2 Write the synthesis (what changed, what's drifting, what deserves attention, predictions, wiki health): Fable 5.1 (claude-fable-5-1)
- Step 3 Update wiki pages and close out (`git diff --stat`): Sonnet (sonnet)
- Subagent return caps: scouts 150 words, builders 250 words, researchers 250 words plus receipts as file paths; no tables, no transcripts in returns.
- Lead reads reports and diffs only; it never fetches pages, reads images, or sweeps folders.
