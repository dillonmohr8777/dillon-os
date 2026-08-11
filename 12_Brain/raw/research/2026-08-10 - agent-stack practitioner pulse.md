---
tags: [raw, research, agent-stack]
captured: 2026-08-10
method: "background research agent, 30+ searches; X via quote-coverage/mirrors (direct X fetch blocked unauthenticated)"
---

# Raw capture — agent-stack practitioner pulse (Jul–Aug 2026)

Receipts feeding [[12_Brain/concepts/Agent Stack Patterns]]. Untouched after capture.

## Durable patterns (multi-source survivors)

1. **Dual-harness is the consensus power setup** — Claude Code (depth/design/governance) + Codex (fast execution, adversarial review), shared AGENTS.md, cross-provider review because "Claude and GPT have different blind spots" (danielvaughan.com Apr 18 upd Jul 5; DoltHub Aug 5 — 1,500+ agent-authored PRs: Codex daily driver, Claude for ambiguous/design work, Grok mechanical only; agi-labo Jul; morphllm Aug).
2. **Plan expensive, execute cheap** — "opusplan" named pattern (Opus plans, Sonnet executes, Haiku tool-call tail); measured: 3-tier routing $0.98 vs $2.02/session = 51% cut (developertoolkit); orchestrator-worker 40–60% (beam.ai, twilio).
3. **Files and git are the real memory** — Ralph progress.md, Karpathy llm-wiki (Apr 4 gist, dozens of implementations in 2 weeks), learnings.md, Obsidian vaults; fresh context per iteration + persistent artifacts (ghuntley.com/ralph; humanlayer Jan 6; dwmkerr Mar 4 — 451 files/58K LOC removed in 8 iterations).
4. **Always-present beats invocable** — Vercel eval: skills never invoked in 56% of cases, sometimes below baseline (58% vs 63%); compressed always-present AGENTS.md hit 100%. Context rot: 160 skills ≈ 25K tokens/call; keep CLAUDE.md 50–80 lines; **stale MEMORY.md is worse than none** (vercel.com/blog; maketocreate; mindstudio).
5. **Scheduled agents are infrastructure now** — Claude Managed Agents cron + credential vaults public beta Jun 9, 2026 (Rakuten, Actively AI deleted custom schedulers) (claude.com/blog).
6. **Verification is the bottleneck, not generation** — plan gates, hooks, kill-after-3-failed-iterations, small overnight change sets (addyosmani.com Mar 26).
7. **Spend guardrails are table stakes** — $1,800/2-day and $6K/overnight runaway-cron incidents; `max_budget_usd`, workspace caps, subscription-vs-API awareness mandatory for unattended loops (devtoolpicks May 3).
8. **Loops compound only against a measurable check** — Karpathy autoresearch (66K★ in a month; 700 experiments/2 days, keep-or-revert vs metric); outcome-scored memory (roampal 85.8% LoCoMo, absorbs 1,135 poison memories −4 pts); corrections beat chat-history mining (HN 47010873).

## Self-improvement tooling verdicts

- **Hivemind** (Activeloop YC): trace→SKILL.md; +19–25 pts vendor claims; best independent test: 19 skills in ~2 min, *refused* redundant skills; BUT +23% tokens/+75% turns on short documented tasks — use selectively (medium.com Jul 17).
- **roampal**: outcome-based promote/demote memory, local-first — the credible primitive.
- `/insights` → CLAUDE.md rules loop; learnings.md with weekly consolidation (chatwithgpt Mar 6; mindstudio).

## Grok/X

Grok 4.5 (Jul 8): AA #4/168 (54), **best agentic tool-use on the board (33%)**; Cursor CEO: "Opus-class, fast, low cost." Practitioner verdict: mechanical tasks + X-native/live-data research; dropping it as a third $300/mo generalist sub (DoltHub Aug 5; eesel Jul 9). Agent Tools API = real-time X search + web + Python sandbox (docs.x.ai). Named operators wiring Grok-as-research-organ into Claude-orchestrated stacks: **not found** — Dillon would be early.

## Marketing-ops receipts

- AdVenture Media (PPC agency playbook): morning-brief automation 75–80 hrs/mo saved; client reporting 4 hrs → 15 min; one social manager 40–50 accounts vs 10–15 (adventuremedia.ai).
- Six freelancer-replacing workflows w/ build costs: perf reporting (4–8 hr build vs $1.5–6K freelance), content briefs, ad-copy A/B, lead scoring, competitor monitoring (Playwright + Meta Ad Library), email personalization (adventuremedia.ai Apr 27).
- Firecrawl marketing stack: brand-mention agent, decaying-content refresh → Slack → human review, internal-linking agent replacing $30/mo SaaS; human-in-the-loop for strategy/brand voice (firecrawl.dev Feb 17).
- Agency stack: 45–75 hrs/mo saved reporting across 15 clients, $3–6K/mo labor, 1–3 mo payback (metaflow.life Mar 4).
- Caution: viral "12-person team, 80+ clients" claim traces to a 404'd article — unverified.

## Hype / avoid list

"Continual learning" branding (it's shared context/caching) · big skill libraries · stale MEMORY.md / 500-line CLAUDE.md · uniform-premium-everywhere (~2× cost) · unattended dangerously-skip-permissions cron on API billing · Gas Town-scale fleets for individuals (~$100/hr, "comprehension debt") · Grok as third generalist subscription.
