---
tags: [raw, research, models, harnesses]
captured: 2026-08-11
method: "direct first-party pages opened and checked; no search-result summaries used as evidence"
---

# Verified model and harness snapshot — 2026-08-11

Immutable receipt ledger for [[12_Brain/System/Model Roster]].

## Provider catalogs

### OpenAI

- URL: https://developers.openai.com/api/docs/models
- Publisher: OpenAI
- Accessed: 2026-08-11
- Source type: primary
- Observed claims:
  - `gpt-5.6-sol`: $5 input / $30 output per million tokens.
  - `gpt-5.6-terra`: $2 input / $12 output per million tokens.
  - `gpt-5.6-luna`: $0.20 input / $1.20 output per million tokens.
- Scope: API list price. This does not establish Codex subscription or
  token-credit cost, account access, route health, or task quality.
- Expires: 2026-09-11

### Anthropic

- URL: https://platform.claude.com/docs/en/about-claude/models/overview
- Publisher: Anthropic
- Accessed: 2026-08-11
- Source type: primary
- Observed claims:
  - `claude-fable-5`: $10 input / $50 output per million tokens.
  - `claude-opus-5`: $5 input / $25 output per million tokens.
  - `claude-sonnet-5`: $3 input / $15 output list price, with introductory
    $2 / $10 pricing through 2026-08-31.
  - `claude-haiku-4-5`: $1 input / $5 output per million tokens.
- Scope: API list price. It does not establish subscription cost, availability,
  route health, or superiority for Dillon's work.
- Expires: 2026-09-11

## Verified harness benchmark

- URL: https://www.tbench.ai/leaderboard/terminal-bench/2.1
- Publisher: Terminal-Bench
- Accessed: 2026-08-11
- Source type: independent benchmark
- Observed visible rows:
  - rank 1: Claude Code + Fable 5, xhigh, 83.8% ± 1.2%, submitted 2026-06-07.
  - rank 6: Codex + GPT-5.6 Terra, max, 78.4% ± 1.3%, submitted 2026-07-11.
  - rank 9: Codex + GPT-5.6 Luna, max, 75.7% ± 1.3%, submitted 2026-07-11.
- The visible board did not contain a verified GPT-5.6 Sol row at access time.
- Scope: benchmark candidates only. Scores do not choose the orchestrator and
  do not replace representative task evaluation.
- Expires: 2026-09-11

## Rejected draft claims

- `Codex + Sol 89.5%` was not present on the accessed public verified
  Terminal-Bench 2.1 board, so it is excluded from the roster.
- Model-only ranking language is excluded because Terminal-Bench evaluates a
  harness/model/effort combination.
- Secondary-site price and leaderboard summaries are excluded when the primary
  provider or benchmark page is available.
