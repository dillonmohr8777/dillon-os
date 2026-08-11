---
tags: [system, runbook, intelligence]
source: "[[12_Brain/raw/research/2026-08-10 - agent-stack practitioner pulse]]"
canonical: 12_Brain
updated: 2026-08-10
---

# Intelligence Ops

**Summary:** the brain that maintains the brain — the loops that keep the *stack
itself* current, so the OS gets smarter without anyone remembering to upgrade it.

[[12_Brain/System/Second Brain Ops|Second Brain Ops]] keeps the **knowledge**
alive. These loops keep the **machinery** alive: which models run each tier,
which skills are worth their context weight, which harness is winning.
Knowledge compounds automatically; machinery changes only through the gate.

## The contract

1. **Scouts research and propose. They never apply.**
2. Every claim lands with a receipt (source + date) and an `expires:` date.
3. A tier change in the [[12_Brain/System/Model Roster|Model Roster]] needs
   **two independent receipts + a price check** — a benchmark win without a
   price is not a recommendation.
4. Config mutations (workflows, `~/.codex/config.toml`, agent specs) happen only
   via `/stack-sync`, which drafts diffs for Dillon's approval —
   [[12_Brain/concepts/Draft-First Operating Rules|Draft-First Operating Rules]] apply.
   Machine-local diffs live in `12_Brain/private/proposals/` (gitignored), never
   in the public tree.
5. Every applied change gets a line in the [[12_Brain/System/Upgrade Log|Upgrade Log]].
   The log is append-only. An unlogged change is a bug.
6. Third-party skills pass the vetting protocol in `/skill-scout` before they
   touch `.claude/skills/`. Failed candidates land on the rejected list with why.
7. Any unattended loop carries a budget cap and never runs with permission
   bypasses on API billing (2026's runaway-cron incidents:
   [[12_Brain/concepts/Agent Stack Patterns|Agent Stack Patterns]] §7).

## The loops

| When | What | Model tier | How |
|------|------|-----------|-----|
| Monthly (1st) | `/model-scout` — who's winning benchmarks, what changed in pricing, re-tier the roster | mixed (cheap fan-out, premium verdict) | schedule or run manually |
| Monthly (1st) | `/skill-scout` — sweep the ecosystem, vet candidates, stage installs | cheap + vet pass | schedule or run manually |
| After any roster change | `/stack-sync` — propagate tiers into configs as draft diffs | cheap | run when the roster changes |
| Quarterly or on demand | `intel-sweep` workflow — full parallel sweep: models + skills + harness news, skeptic-gated, one brief | mixed | `.claude/workflows/intel-sweep.js` |

## Tier definitions (what the roster words mean)

- **premium** — the synthesis/verdict model. Used where being wrong is expensive:
  `/synthesize`, skeptic gates, client-facing drafts. Pay for it; use it sparingly.
- **workhorse** — the default working model for sessions and audits.
- **cheap** — bulk loops: `/vault-compile`, session mining, cache checks, formatting.
- **free/experimental** — free-tier and local models; sandbox only, never client work.
- **research** — must have live web + long context; used by sweep agents.

## Files

- [[12_Brain/System/Model Roster|Model Roster]] — who runs each tier, per-role picks, receipts. The single source of truth every workflow and config defers to.
- [[12_Brain/System/Skill Registry|Skill Registry]] — installed / staged / watchlist / rejected skills with provenance and vet results.
- [[12_Brain/System/Upgrade Log|Upgrade Log]] — append-only history of stack changes.
- `12_Brain/private/proposals/` — stack-sync draft diffs awaiting approval (machine-local, gitignored).

## Links

[[12_Brain/concepts/Context Economy|Context Economy]] · [[12_Brain/concepts/Research Verification Loop|Research Verification Loop]] · [[12_Brain/concepts/Truth Hierarchy|Truth Hierarchy]] · [[12_Brain/concepts/Agent Stack Patterns|Agent Stack Patterns]] · [[12_Brain/entities/King Agent OS|King Agent OS]] (the legacy patterns this replaces)
