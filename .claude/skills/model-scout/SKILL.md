---
name: model-scout
description: Keep the Model Roster honest — fan out on current benchmarks, pricing, and harness news; skeptic-gate the hype; re-tier 12_Brain/System/Model Roster.md; propose (never apply) config changes. Usage - /model-scout [focus, e.g. "cheap tier" or "coding models"].
---

# Model Scout

The stack audits itself. Input: optional focus area (default: full roster).

## 1. Read the roster first

Open `12_Brain/System/Model Roster.md`. Note current tiers, `updated:` date,
and which entries are past `expires:`. Expired entries are the priority targets.

## 2. Fan out

Launch parallel subagents (WebSearch/WebFetch always; more surfaces if
connected), one per angle:

- **Benchmarks** — SWE-bench Verified, Terminal-Bench, LMArena (text + WebDev),
  GPQA, agentic benches, artificialanalysis.ai composite. Leaders + deltas
  since the roster's `updated:` date only.
- **Pricing** — provider pricing pages + OpenRouter rankings (top used models,
  best free tier). Price moves change tiers as often as capability does.
- **Harnesses** — Claude Code / Codex CLI / Gemini CLI / opencode and new
  entrants: release notes, Terminal-Bench placements, mindshare shifts.
- **Practitioner layer** — what operators actually switched to in the last 30
  days (threads, changelogs, credible operators). Stale advice is actively wrong.

Every finding is a **receipt**: claim + source link + date. No receipt, no finding.

## 3. Skeptic gate

Fresh-context subagent that did NOT do the research attacks every claim:
undated → killed; single-source hype → labeled; benchmark win with no price
check → labeled `incomplete`. A tier-change recommendation needs **two
independent receipts + a price check** to survive.

## 4. Re-tier

Diff survivors against the roster. For each tier (premium / workhorse / cheap /
free-experimental / research) and each role row: keep, swap, or add a
challenger note. Be conservative — churn is a cost; a swap needs a clear win on
capability-per-dollar for that tier's actual workload, not leaderboard vanity.

## 5. Land it

- Full receipts + verdicts → `12_Brain/raw/research/YYYY-MM-DD - model-scout.md` (untouched after).
- Update `12_Brain/System/Model Roster.md`: new tiers, `updated:` today,
  `expires:` +30 days, receipts inline per change.
- Append one line to `12_Brain/System/Upgrade Log.md` (date, what changed,
  receipts, `approved: pending`).
- **Never edit configs from here.** If tiers changed, end with: "Roster changed —
  run `/stack-sync` to draft the config diffs."
- Reply with: the tier table, what changed and why (one line each), what got
  killed at the gate, `git diff --stat`.
