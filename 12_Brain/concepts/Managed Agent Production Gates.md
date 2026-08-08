---
tags: [concept, agents-research]
source: "[[12_Brain/01_Captures/X/2026-08-08 - langchain-managed-deep-agents-launch]]"
updated: 2026-08-08
expires: 2026-11-08
---

# Managed Agent Production Gates

One-line: LangChain's seven production gates are a free audit rubric — this
stack already passes most of them split across two engines; the gaps are one
unified memory, state-based skill acceptance, and durable batch runs. The
moat is context, not harness.

## Why this matters here

LangChain just productized "an agent you define declaratively, running on
managed infrastructure with memory, evals, identity, and channels." That is
a description of what this stack hand-rolled: the Claude engine (this vault +
skills + triggers + MCP connectors) and the Codex engine (Marketing Chief:
canonical queue, maker/checker worker handoffs, execution graphs, corrections
ledger, approval gates, credential broker). The market converging on this
shape is validation — and a warning that the harness itself is becoming a
commodity. What a hosted runtime will never ship with is our context layer:
the vault graph, client registry, per-client blueprints, corrections history,
and approval envelopes. Invest there; stay portable on runtime.

## The seven-gate audit (2026-08-08)

| Gate | What it means | Where we stand | Gap |
|------|---------------|----------------|-----|
| Durable execution | Runs pause/retry/resume without losing progress | Codex: versioned queue + execution graphs. Claude: idempotent skills, re-firing triggers | Claude-side batch runs (site-batch, research-sweep) lose mid-run state if a session dies |
| Streaming UX | Operator sees live progress | HUD reads the vault live; CONTROL.md is a deterministic queue projection; Daily-Briefs | None urgent for a solo operator |
| Sandboxes | Isolated place for file/CLI work | Remote sessions are containers; MCP acceptance gate governs new tools | Per-skill tool allowlists not written down |
| Context & memory | Thread-scoped state vs agent-scoped memory that survives restarts | 12_Brain is agent-scoped memory done right (raw → compiled, bi-temporal) | **Two brains.** The Chief's corrections ledger and this vault never sync; lessons die in whichever engine learned them |
| Evaluation | Check resulting state, not just the final message | "Ship diffs, not claims"; one verifier per definition-of-done check in execution graphs; research skeptic gate | Skills have no acceptance suite — a skill edit can silently break am-report or site-factory |
| Identity | Know who triggered the run; never trust prompt text for routing | Codex: exact registry routing + intake quarantine (built after one broadcast Slack message fanned out into 19 duplicate per-client work items) | slack-intake on the Claude side still infers client from message text instead of binding sender → registry route |
| Channels | Agents live where work arrives (Slack, GitHub, schedules) | Slack/Gmail bridges (prepare-only by design), GitHub PR watching, scheduled triggers | None — human-gated writes are a feature here, not a gap |

## The three moves

1. **One brain.** Extend nightly `/vault-compile` to read a redacted export of
   the ops corrections ledger; lessons that generalize beyond one client
   compile into `12_Brain/concepts/` with source links, same as any raw
   capture. One memory, two writers, vault canonical.
2. **State-based skill acceptance.** Each production skill gets a
   definition-of-done block checkable from files alone (output file exists,
   required sections present, links resolve, no placeholder text) — wiki-lint
   style, wired into `/automation-ops` as a maker/checker gate. A skill edit
   that breaks its own acceptance check never ships.
3. **Durable batch runs.** Batch skills write a run manifest first (work list
   + per-item status), tick items off as they complete, and resume from the
   manifest instead of restarting. Port of the Codex execution-graph idea,
   sized for the Claude engine.

Plus the identity fix folded into move 2's gate work: slack-intake binds
sender → client registry route before filing anything, and a broadcast
message files once, never per-client.

## The offer angle

"Managed agents" is also sales language for work already being delivered
(caller-response workflows, CRM agents, AI training). A managed-agent
retainer — client pays monthly for an agent we run, monitor, and improve —
prices like ads management and is how one operator services the back half of
ROAD TO 100 CLIENTS without hours scaling linearly. Worth a real offer page
when a second client asks for agent work unprompted.

## Links

- [[12_Brain/entities/Managed Deep Agents (LangChain)|Managed Deep Agents (LangChain)]] — the product, watch-list verdict
- [[12_Brain/concepts/Second Brain Architecture|Second Brain Architecture]] · [[12_Brain/concepts/Context Economy|Context Economy]] · [[12_Brain/concepts/Research Verification Loop|Research Verification Loop]]
- [[12_Brain/protocols/approval-tiers|Approval & safety protocol]]
