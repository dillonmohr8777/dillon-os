---
note_type: session-recovery
status: recovered
created: 2026-09-23
updated: 2026-09-23
session_first: 2026-09-12T19:26:16
session_last: 2026-09-12T19:26:16
session_count: 1
cwd: "C:\Users\dillo\Documents\Codex\2026-09-12\https-developers-openai-com-api-docs"
open_flags: [blocked]
tags: [codex-recovery, session, 202609]
---

# Documents\Codex\2026-09-12\https-developers-openai-com-api-docs

**1 session(s)** · 2026-09-12 19:26 → 2026-09-12 19:26 · 11m agent-time (summed; sessions may overlap) · 3 MB transcript · 3/3 turns completed

> **Open flags:** `blocked`

## 1. 2026-09-12 19:26 · 11m · 3.1 MB

`01a09715-b259-77d0-9c51-0e68d973918e` · turns 3/3 · flags: blocked

**Asked:**

> https://developers.openai.com/api/docs/models/compare How can we build a custom guide inside of this link that will allow us to better utilize and leverage our GPT-6 Astro engine?

> There's literally an option to build a custom guide.

**Outcome reported:**

> You can’t directly add content to the public OpenAI documentation page, but we can build a **private, contextual companion guide** that appears whenever you open that specific model-comparison URL. The cleanest form is a small Chrome/Edge extension that injects an “Astra Playbook” side panel on:
> 
> `https://developers.openai.com/api/docs/models/compare`
> 
> It would be local to your browser and source-controlled in your workspace, so it stays useful even as the public docs evolve.
> 
> The guide should not just repeat model specs. It should answer the operating questions that determine whether Astra is worth invoking:
> 
> | Decision | Default in your guide |
> |---|---|
> | Use Astra when | The task is high-consequence, cross-system, ambiguous, or needs sustained end-to-end judgment |
> | Do not use Astra when | Work is routine, repetitive, high-volume, or has a clear bounded implementation path |
> | Reasoning | Start `medium`; use `high` for difficult planning/debugging; use `low` for follow-ups and routine transformations |
> | Execution style | Give it the goal, concrete boundaries, definition of done, available tools, and verification standard |
> | Cost control | Keep stable instructions early for caching; preserve long-running state; route simple subproblems to less expensive models |
> | Reliability | Require a short plan, explicit assumptions, tool evidence, and a final status label: verified, partial, blocked, or draft |
> 
> A useful panel structure:
> 
> 1. **Astra decision gate**  
>    A 30-second checklist: Is this difficult enough? Is an agent allowed to act? Are there client, send, publish, spend, destructive, or MFA gates?
> 
> 2. **Prompt builder**  
>    Fields for objective, scope, source of truth, constraints, tool permissions, output format, and definition of done. It then emits an Astra-ready prompt.
> 
> 3. **Reasoning and routing selector**  
>    Select `low`, `medium`, or `high`, with your default model-routing policy embedded. Astra handles the hard coordination; GPT‑5.5 or Luna handles the routine workload.
> 
> 4. **Tool-workflow pattern**  
>    Prebuilt guidance for browser tasks, coding, research, client work, asset production, and audit/review workflows.
> 
> 5. **Verification checklist**  
>    Stops vague “done” claims: tested, source readback confirmed, exact artifact path, delivery state, and remaining human gates.
> 
> 6. **Live-doc links**  
>    Deep links to the current Astra guide, Responses API, tool calling, prompt caching, and configuration updates.
> 
> A strong default instruction block for Astra would look like this:
> 
> ```text
> You are the lead execution agent for this task.

> You were right. I used the page’s native **Build a custom guide** flow and created the guide:
> 
> [Build a Governed Automation Rollout](https://developers.openai.com/custom-guide/summit-binary-thread-6fccd875)
> 
> It covers the two areas you specified:
> 
> - Marketing agentic workflows: competitive research, content and campaign production, lead qualification, CRM enrichment/reporting, client reporting, and orchestration.
> - Business automation workflows: reusable skills, structured workflow contracts, remote MCP tools, staged outputs, approval gates, evaluation, observability, and cost controls.
> 
> It is explicitly designed for **stage-only operation**: the agent returns plans, drafts, verification requirements, and approval requests rather than making production writes. It also includes a TypeScript Responses API example with strict structured outputs, tool allowlists, deferred tool loading, and human approval required for external access.

> Handed off to the available **Master Orchestrator Session** with the completed guide and an explicit request to integrate it as a **draft/stage-only capability**:
> 
> [Build a Governed Automation Rollout](https://developers.openai.com/custom-guide/summit-binary-thread-6fccd875)
> 
> The handoff requires it to:
> 
> - Reconcile the guide with the canonical operating plan before changing anything.
> - Keep Astra for explicit high-judgment, multi-system work; retain GPT‑5.5 xhigh for demanding execution and Luna low/medium for routine volume.
> - Institute structured outputs, tool allowlists, evaluation, observability, verification, token/tool budgets, and staged workflow templates.
> - Preserve human gates for all sends, publishing, spending, MFA, client messaging, external writes, deployment, access changes, and destructive actions.
> 
> The older pinned Marketing Chief task could not be reached because its historical session record is missing in the app, so I used the available Master Orchestrator Session instead. The message was accepted there; its task-status watcher cannot monitor ChatGPT conversations, so I can’t claim a response from it yet.
> 

<sub>rollout: `C:\Users\dillo\.codex\archived_sessions\rollout-2026-09-12T15-26-16-01a09715-b259-77d0-9c51-0e68d973918e.jsonl`</sub>
