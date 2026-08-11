---
tags: [concept, agent-stack, research]
source: "[[12_Brain/raw/research/2026-08-10 - agent-stack practitioner pulse]]"
updated: 2026-08-10
expires: 2026-11-10
---

# Agent Stack Patterns (2026 practitioner consensus)

**Summary:** eight durable patterns for running a personal agent OS, surviving
a skeptic pass across independent 2026 sources — plus the hype list. This OS
already embodies 1–3; 4, 7, 8 are the correction targets.

1. **Dual-harness, cross-provider review.** Claude Code (depth, design,
   governance) + Codex (fast execution, adversarial review), one shared
   instruction file. Different blind spots = the point. *(This OS: yes — keep.)*
2. **Plan expensive, execute cheap.** Premium plans/verdicts, workhorse
   executes, cheap absorbs the tool-call tail. Measured 30–60% savings, no
   quality loss. *(Codified in [[12_Brain/System/Model Roster|Model Roster]].)*
3. **Files and git are the real memory.** Versioned plain text + fresh context
   per iteration beats clever context threading. *(This vault's whole design.)*
4. **Always-present beats invocable.** Vercel: 56% of installed skills never
   fire; big libraries can score below baseline. Keep CLAUDE.md ≤80 lines,
   prune the plugin surface, lazy-load the rest. **A stale MEMORY.md is worse
   than none.** *(Correction target: audit the ~400-skill global plugin surface.)*
5. **Scheduled agents are infrastructure.** Official cron + credential vaults
   (Claude Managed Agents, Jun 2026) replaced homebrew schedulers.
6. **Verification is the bottleneck.** Plan gates, hooks, kill-after-3-failures,
   small overnight change sets. Generation is cheap; checking is the work.
7. **Spend guardrails are table stakes.** 2026's horror stories are runaway
   crons ($1.8K/2-day, $6K/overnight). Any unattended loop carries a budget cap
   and never runs `--dangerously-skip-permissions` on API billing.
8. **Loops compound only against a measurable check.** Keep-or-revert vs a
   metric (autoresearch), outcome-scored memory (roampal), structured
   corrections > chat-history mining.

**Hype/avoid:** "continual learning" branding on skill-miners · mega skill
libraries · uniform-premium-everywhere · Grok as a third generalist
subscription (its durable role: cheap X-native research engine) · 20–30-agent
fleets for individuals (~$100/hr + comprehension debt).

Related: [[12_Brain/concepts/Context Economy|Context Economy]] · [[12_Brain/concepts/Research Verification Loop|Research Verification Loop]] · [[12_Brain/System/Intelligence Ops|Intelligence Ops]]
