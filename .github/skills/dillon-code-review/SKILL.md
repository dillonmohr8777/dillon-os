---
name: dillon-code-review
description: Two-axis review of a diff since a fixed point. Standards versus spec. Use on pull requests, branch reviews, and "review since X" requests.
---

# Dillon code review

Checker skill. A different identity from the maker. Never infer human approval, deployment authority, or a Netlify target.

Read `.claude/skills/code-review/SKILL.md` and follow it.

1. Pin the fixed point (base branch, SHA, or merge-base). Confirm a non-empty three-dot diff.
2. Run **Standards** and **Spec** as separate reviews. Do not merge the two lists.
3. Standards sources: `AGENTS.md`, `CLAUDE.md`, applicable `.cursor/rules/`, product README, plus the Fowler smell baseline in the Claude skill.
4. Spec sources: originating `12_Brain/05_Projects/` note, PR body, or the path the author named.
5. Return pass or fail per axis with cited evidence. A failed spec axis fails the overall verdict even if the code is clean.
6. Website PRs still require the independent visual review in `dillon-independent-web-checker`.

Source: Matt Pocock two-axis review, adapted for Dillon OS maker/checker gates.
