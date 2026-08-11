---
tags: [system, intelligence, routing]
source: "[[12_Brain/raw/research/2026-08-11 - verified model and harness snapshot]]"
canonical: 12_Brain
updated: 2026-08-11
expires: 2026-09-11
---

# Model Routing Roster

**Summary:** a dated evidence snapshot for route selection. It informs Codex's
decision; it does not choose the orchestrator or authorize configuration changes.

## Non-negotiable authority

Codex acting as Marketing Chief remains the primary orchestrator and final
verifier. Claude, Grok, Cursor, Hermes, and individual models are bounded
specialists selected for a task after live availability, health, billing mode,
and acceptance checks are known.

## Verified provider snapshot

Prices are API list prices per million input/output tokens unless stated
otherwise. Subscription or token-credit routes are different billing modes and
must be checked separately.

| Provider | Model | Verified price | Primary source |
|---|---|---:|---|
| OpenAI | `gpt-5.6-sol` | $5 / $30 | [OpenAI model catalog](https://developers.openai.com/api/docs/models) |
| OpenAI | `gpt-5.6-terra` | $2 / $12 | [OpenAI model catalog](https://developers.openai.com/api/docs/models) |
| OpenAI | `gpt-5.6-luna` | $0.20 / $1.20 | [OpenAI model catalog](https://developers.openai.com/api/docs/models) |
| Anthropic | `claude-fable-5` | $10 / $50 | [Anthropic model overview](https://platform.claude.com/docs/en/about-claude/models/overview) |
| Anthropic | `claude-opus-5` | $5 / $25 | [Anthropic model overview](https://platform.claude.com/docs/en/about-claude/models/overview) |
| Anthropic | `claude-sonnet-5` | $2 / $10 introductory through 2026-08-31; then $3 / $15 | [Anthropic model overview](https://platform.claude.com/docs/en/about-claude/models/overview) |
| Anthropic | `claude-haiku-4-5` | $1 / $5 | [Anthropic model overview](https://platform.claude.com/docs/en/about-claude/models/overview) |

## Verified harness benchmark snapshot

The public Terminal-Bench 2.1 board accessed 2026-08-11 reports harness/model
pairs rather than model-only scores. Its visible entries include:

| Rank | Harness + model | Effort | Accuracy | Submitted |
|---:|---|---|---:|---|
| 1 | Claude Code + Fable 5 | xhigh | 83.8% ± 1.2% | 2026-06-07 |
| 6 | Codex + GPT-5.6 Terra | max | 78.4% ± 1.3% | 2026-07-11 |
| 9 | Codex + GPT-5.6 Luna | max | 75.7% ± 1.3% | 2026-07-11 |

Source: [Terminal-Bench 2.1 leaderboard](https://www.tbench.ai/leaderboard/terminal-bench/2.1).
No visible verified Sol submission appeared on that board at access time, so the
roster makes no Sol-versus-Fable leaderboard claim.

## Capability classes

| Class | Use | Candidate route | Guardrail |
|---|---|---|---|
| Local/fast | extraction, formatting, classification, health checks | currently configured low-cost or local route | no unsupported synthesis |
| Balanced | routine coding, bounded research synthesis, first drafts | healthy approved mid-cost route | representative task check and declared budget |
| Frontier | strategy, hard refactors, brand-critical judgment, independent critique | strongest healthy approved Codex or specialist route | smallest context slice; max two evaluator loops |
| Research | current web evidence and long-context comparison | route with verified live retrieval | exact citations and expiry required |

## Selection checklist

Before changing a route or pin, verify the exact account and provider, current
availability, health, billing mode, representative workload result, fallback,
budget, timeout, and rollback. The scout drafts; Codex reconciles; a separate
approval authorizes consequential configuration changes.

## Links

[[12_Brain/System/Intelligence Ops|Intelligence Ops]] · [[12_Brain/System/Skill Registry|Skill Registry]] · [[12_Brain/System/Upgrade Log|Upgrade Log]]
