---
note_type: concept
status: active
created: 2026-08-19
updated: 2026-08-19
domain: agent skills
maturity: operational
summary: Sharpen the idea by interview, write the spec, build test-first at agreed seams, then review standards and spec on separate axes before any gated action.
review_on: 2026-11-19
verification_status: partial
source_refs:
  - "[[12_Brain/01_Captures/X/2026-08-19 - theo-mattpocock-skills]]"
  - "[[12_Brain/01_Captures/Grok/2026-07-30 - daily-ai-workflow-design-and-consumer-pulse]]"
  - "https://github.com/mattpocock/skills"
tags:
  - brain
  - concept
  - skills
  - grilling
  - tdd
  - maker-checker
---

# Grill Spec Verify Loop

**One lesson:** alignment happens in the interview, not in the first generated diff. Grill until the frontier is empty, write the spec, then build only at seams you already agreed, and keep standards review separate from spec review.

## The loop

1. **Grill.** Walk a design tree in rounds. Ask every question whose prerequisites are settled. Recommend an answer. Wait. Facts come from the vault and the codebase. Decisions come from Dillon. Stop at shared understanding. Skills: `grilling`, `grill-me`, `grill-with-docs`.
2. **Spec.** Synthesize. Do not interview again. Seams first. Save to `12_Brain/05_Projects/`. Skill: `to-spec`.
3. **Build.** Red, then green, one slice, public seams only. Skill: `tdd` inside `implement`. Website work still uses `frontend-build` and the factory.
4. **Verify.** Two axes, two contexts: Standards versus Spec. The maker cannot be the passing checker. Skills: `code-review`, `qa-critic`, `dillon-independent-web-checker`.
5. **Gate.** Send, publish, deploy, spend, and merge stay on [[System/approval-queue]]. A finished grill is not approval.

## Why this beats a thin checklist

The 2026-07-30 `dillon-plan-grill` wrapper named the gate and skipped the interview. Theo's 2026-08-19 trial of Matt Pocock's pack, plus the upstream SKILL.md files, show the missing piece: the agent has to ask the frontier, not summarize a plan it already wants to build.

## Limits

- Interactive. These skills stay off the HUD Command Deck.
- Wayfinder is out. Foggy multi-session work uses this loop plus vault projects, not a GitHub issue map.
- Untrusted source. The video was not fully transcribed. The loop is grounded in the public skill files and in prior vault research, then adapted to Dillon OS.

## Links

- [[Agent Governance and Verification]]
- [[Context Economy]]
- [[12_Brain/02_Entities/Matt Pocock Skills]]
- [[12_Brain/09_Ops/engineering-skills]]
