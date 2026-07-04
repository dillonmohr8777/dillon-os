---
name: synthesize
description: Weekly synthesis pass on the big model — read across the whole vault and write what changed this week, what's drifting, and what deserves attention. The only loop that earns the premium tier.
---

# Synthesize

Read across the vault the way an operator would — this is the one pass where
breadth is the point. Use subagents for the heavy reading (each returns one
paragraph); keep this context for the conclusions.

Inputs: last 7 days of `git log`, `raw/sessions/`, new `raw/` captures, the
wiki layer (`entities/`, `concepts/`), `01_Clients/` movement, and the latest
`Daily-Briefs/` reports (pulse, wiki-lint).

Write `Daily-Briefs/synthesis-YYYY-MM-DD.md`:

1. **What changed** — the week's real movement: clients, campaigns, decisions,
   new knowledge compiled into the wiki.
2. **What's drifting** — commitments going stale, clients quiet too long,
   pages contradicting reality, loops that didn't run (check
   `raw/sessions/session-log.md` cadence).
3. **What deserves attention** — the 3 highest-leverage moves for next week,
   grounded in vault pages ([[link]] each one). Tie back to the primary
   directive in `System/OS Config.md` (ROAD TO 100 CLIENTS).
4. **Wiki health** — one line: pages added/updated this week, lint status.

Update any wiki page the synthesis proves wrong or stale (with source), and
add the synthesis note itself to no index — briefs are output, not wiki.
End with `git diff --stat`.
