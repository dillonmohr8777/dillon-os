---
tags: [system, intelligence, roster]
source: "[[12_Brain/raw/research/2026-08-10 - model-scout - benchmark landscape]]"
canonical: 12_Brain
updated: 2026-08-10
expires: 2026-09-10
---

# Model Roster

**Summary:** who runs each tier of this OS and why — receipts required, price
checked, re-tiered monthly by `/model-scout`. When a loop says "cheap" or
"premium," THIS file defines what that means. `/stack-sync` propagates changes
as draft diffs.

## Tier table

| Tier | Claude Code | Codex CLI | API/OpenRouter (bulk) | Receipt |
|---|---|---|---|---|
| **premium** (synthesis, skeptic gates, client-facing) | Claude Opus 5 (`claude-opus-5`, $5/$25) — escalate to Fable 5 ($10/$50) for the longest-horizon work only | `gpt-5.6-sol` ($5/$30) | — | Opus 5: SWE-V #1 96%, AA "new leader in agentic knowledge work"; Sol: T-Bench 2.1 #1 89.5%, BrowseComp #1 |
| **workhorse** (sessions, audits, subagents) | Claude Sonnet 5 ($2/$10 **intro ends Aug 31** → $3/$15) or Opus 5 for deep coding | `gpt-5.6-terra` ($2/$12) | GLM-5.2 (~$1.40/$4.40) | Terra −20% cut Jul 30; GLM-5.2 beats GPT-5.5 on SWE-Pro at ~1/6 price |
| **cheap** (vault-compile, mining, cache gates, formatting) | Claude Haiku 4.5 ($1/$5) | `gpt-5.6-luna` ($0.20/$1.20) | DeepSeek V4 Flash 0731 ($0.14/$0.28, MIT) | Luna −80% cut Jul 30; DS Flash = #2 model on earth by OpenRouter volume |
| **free/experimental** (sandbox only, never client work) | — | `openrouter-free` profile | Nvidia Nemotron 3 Ultra 550B (free, 1M ctx) | best free model Aug 2026; free lineup churns — recheck monthly |
| **research** (live web, long context) | Fable 5 / Opus 5 + WebSearch | `gpt-5.6-sol` (BrowseComp 92.2% #1) | Kimi K3 ($3/$15, open) · Grok 4.5 ($2/$6, live X data — gated on grok CLI auth) | receipts in source capture |

## Per-role picks

| Role | Top | Runner-up | Budget |
|---|---|---|---|
| Orchestrator / supervisor | **Opus 5** | Fable 5 (escalation ceiling; FrontierSWE 0.900) | Kimi K3 |
| Deep coding | **Claude Code + Opus 5** (SWE-V 96%) | Codex + GPT-5.6 Sol (T-Bench #1) | GLM-5.2 via opencode / Coding Plan |
| Bulk cheap tasks | **DeepSeek V4 Flash** | GPT-5.6 Luna | Nemotron 3 Ultra (free) · Haiku 4.5 for Claude-consistent formatting |
| Web research agents | **GPT-5.6 Sol** | Kimi K3 | Grok 4.5 (terse = cheap loops; + X data) |
| Vision / ad-creative review | **Gemini 3.1 Pro** ($2/$12, best effective long-ctx) | Opus 5 (house-voice critique) | Qwen3.8-Max ($2/$6, can also operate UIs) |
| Long-document analysis | **Opus 5 / Fable 5** (1M ctx, 90% cache discount) | Gemini 3.1 Pro (effective ctx = claimed) | DeepSeek V4 Pro (MRCR-1M #1 at $0.435/$0.87) |

## Harness standings (Terminal-Bench 2.1 — scores the harness+model PAIR)

Codex + Sol (xhigh) 89.5% · **Claude Code + Opus 5 (max) 89.1%** · KimiCode + K3
88.3% · opencode = model-agnostic counterweight (150K★). The dual-harness split
(Codex = operator of record, Claude Code = brain/analysis) is benchmark-rational:
the two top pairs are 0.4 points apart.

## Stack reality check (found 2026-08-10 — drives `/stack-sync` run #1)

- Codex global default `gpt-5.6-luna` @ xhigh — deliberate cheap+max-thinking
  choice; keep unless quality complaints.
- Most model pins in `~/.codex/automations/*/automation.toml` are stale
  (gpt-5.2/5.4/5.5 era). **GPT-5.4 leaves ChatGPT-auth Codex Aug 31** — any
  revived automation pinning 5.4/5.4-mini breaks that day.
- `~/.codex/AGENTS.md` carries zero model guidance — a `## Model routing`
  section pointing at this roster is drafted (machine-local diffs live in
  `12_Brain/private/proposals/`, not in the public tree).

## Watch (challengers, not swaps yet)

- **Sonnet 5 price jump Sep 1** ($2/$10 → $3/$15): re-check cheap-vs-workhorse split next scout.
- **Qwen3.8-Max** weights promised-not-landed; vendor-run benches — hold for independent numbers.
- **Grok 5 / Gemini 3.5 Pro / Haiku 5**: none released as of 2026-08-10; ignore rumor pricing.
- **ARC-AGI-3** is the new frontier signal (Opus 5 leads 30.2%, ~3× next) — watch for jumps.

## Links

[[12_Brain/System/Intelligence Ops|Intelligence Ops]] · [[12_Brain/System/Skill Registry|Skill Registry]] · [[12_Brain/System/Upgrade Log|Upgrade Log]] · [[12_Brain/concepts/Context Economy|Context Economy]]
