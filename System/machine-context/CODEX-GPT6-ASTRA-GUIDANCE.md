# Rethinking skills and prompts for GPT-6 Astra (Codex-only)

Source: OpenAI Codex docs guidance Dillon pasted 2026-09-11. Apply when Codex runs as GPT-6 Astra.

## Better skills
- Skill descriptions: as short as possible; clear WHEN to use. Bad: broad "databases/queries/models". Good: "adding or changing a migration".
- Progressive disclosure: root skill = minimal router → supporting docs/scripts. Do not force-load unused workflows.
- Avoid elaborate itineraries/recipes that overconstrain Astra. Prefer outcomes + decision boundaries.
- Repo skills may be used by Sol/Luna too; do not leave Astra-only overconstraints that break older models unless scoped.

## AGENTS.md
- Do not require reading architecture/database/deployment before every edit. Point docs contextually.
- Do not push unnecessary testing theater; Astra already checks work. Authorize safe local tests to run/fix/rerun without per-step asks.
- Revisit every standing instruction: still needed for Astra?

## Decision boundaries
- Astra is more aligned; overly strong "always ask first" language can stall safe work. Prefer: interrupt only for real blockers / material decisions / gated actions (send/post/spend/MFA).

## Persistence
- Define completion before starting (implement + run + inspect + fix until done) when you want full carry-through.
- Avoid "stop for review after first implementation" unless you actually want that early stop.
- If exploration is wanted, say what to explore and where to stop.

## Audit habit
When switching to Astra or cleaning house: ask Astra to audit AGENTS.md + skills against this guidance, then proceed.
