---
note_type: session-recovery
status: recovered
created: 2026-09-23
updated: 2026-09-23
session_first: 2026-09-19T22:10:33
session_last: 2026-09-19T22:10:33
session_count: 1
cwd: "C:\Users\dillo\Documents\Codex\2026-09-19\https-www-tiktok-com-t-zp8tnpnys-2"
tags: [codex-recovery, session, 202609]
---

# Documents\Codex\2026-09-19\https-www-tiktok-com-t-zp8tnpnys-2

**1 session(s)** · 2026-09-19 22:10 → 2026-09-19 22:10 · 53m agent-time (summed; sessions may overlap) · 4 MB transcript · 3/3 turns completed

## 1. 2026-09-19 22:10 · 53m · 3.5 MB

`01a0bbb8-9deb-7662-b163-91a0457d4882` · turns 3/3

**Asked:**

> https://www.tiktok.com/t/ZP8TNPnYs/ Worth it for our stack?

> <realtime_delegation>
>   <input>What's, like, better? Like, is there a better way for us to, like, control- We're using Deer Flow, but, like, is-should we be using, like, Raspberry Pi? Like, what are other, like, places that we can actually. host... you know... Uh, tens, and twenty... and thirty of like parallel agents the way he's talking about... in that video</input>
>   <transcript_delta>user:  Read this back to me
> assistant:  Sure. Here’s the gist
> user:  Read this back to me
> assistant:  of what I found: Orca could be useful as a local coding cockpit, but it’s risky and overlaps with our existing control plane. Big concern: it pre-fills dangerous bypass flags and reads Codex accounts, which is a blocker for production. It also duplicates scheduling and routing we already have. Telemetry goes to PostHog in the US, so that should be disabled for any pilot. Fit score, high for local use, l

> <realtime_delegation>
>   <input>Um... [tongue click] Well, I mean, it's gonna be for my Mac Mini, so, you know, it can be... Cloud, and it could be on my machine. We could do both</input>
>   <transcript_delta>assistant:  Let me check the options.
> user:  What's, like, better? Like, is there a better way for us to, like, control- We're using Deer Flow, but, like, is-should we be using, like, Raspberry Pi? Like, what are other, like, places that we can actually. host... you know... Uh, tens, and twenty... and thirty of like parallel agents the way he's talking about... in that video
> assistant:  Okay, quick note: the controller and the machines that run agents are different pieces, and whether you’re calling cloud models or running local ones matters a lot.
> user:  Um... [tongue click] Well, I mean, it's gonna be for my Mac Mini, so, you know, it can be... Cloud, and it could be on my machine. 

**Outcome reported:**

> My call: **useful optional cockpit, not worth adding to the core stack right now.**
> 
> The link resolves to a short Orca ADE setup demo. Orca runs Codex, Claude, Grok, and other CLI agents side-by-side in isolated Git worktrees, with terminals, diffs, browser/design mode, and a local orchestration layer. ([overview](https://www.onorca.dev/))
> 
> - **Good fit:** disposable local web/product builds, UI experiments, and bounded two-to-five-agent coding races.
> - **Poor fit:** Dillon OS command-center work, client operations, CRM/ads/comms, or anything involving production credentials.
> - **Main blocker:** Orca pre-fills dangerous bypass flags, including Codex’s `--dangerously-bypass-approvals-and-sandbox`, and reads `~/.codex` accounts. ([permissions](https://www.onorca.dev/docs/agents/supported), [Codex integration](https://www.onorca.dev/docs/agents/codex))
> - **Redundancy:** Its Runs/tasks/gates and scheduled automations would create a second orchestration and scheduler beside our canonical Dillon OS routing and Task Scheduler. ([orchestration](https://www.onorca.dev/docs/cli/orchestration), [automations](https://www.onorca.dev/docs/cli/automations))
> - **Privacy:** Orca says it does not transmit prompts, files, repo names, or terminal output, but it does send anonymous usage telemetry to PostHog in the US. Disable it for any pilot. ([telemetry](https://www.onorca.dev/docs/telemetry))
> 
> **Fit score:** 8/10 as a local coding cockpit; 2/10 as our estate-wide control plane.
> 
> If we test it, use Manual permissions, never YOLO, set `ORCA_TELEMETRY_DISABLED=1`, use a throwaway clone with no `.env` or client data, and measure one bounded two-agent web task against the current Codex workflow. The current host has no Orca executable or process installed.
> 

> Yes — and the clean mental model is:
> 
> **DeerFlow should be one agent runtime inside the platform, not the platform itself.**
> 
> For your Mac Mini plus cloud setup, I’d use:
> 
> | Layer | Recommended role |
> |---|---|
> | Docker Compose | Run local worker containers and scale identical workers on the Mac |
> | LiteLLM or direct OpenRouter | One API gateway for model routing, budgets, rate limits, and logging |
> | Claude/Codex CLI workers | Keep subscription-based agents isolated in their own containers |
> | Docker Model Runner / Ollama | Serve local models on the Mac |
> | DeerFlow | Momentum, client-specific agents, and workflows that benefit from its UI and sandbox model |
> | k3s/Kubernetes or E2B | Cloud burst capacity and isolated workers once local Docker is full |
> | Temporal | Optional later, only for workflows that must survive crashes and resume over days |
> 
> Docker Compose can scale a worker service on one host, which makes it the right first layer for the Mac. It is not a complete multi-host scheduler, so move the same worker images to k3s/Kubernetes or managed sandboxes when you genuinely need 20–30 concurrent isolated workers. ([Docker Compose production guidance](https://docs.docker.com/compose/how-tos/production/), [Compose scaling](https://docs.docker.com/reference/cli/docker/compose/scale/))
> 
> LiteLLM is useful for the OpenRouter/API side because it provides a common gateway with auth hooks, rate limiting, and cost tracking. Keep Claude and Codex subscription sessions as separate CLI workers rather than trying to force them through the API gateway. ([LiteLLM Proxy](https://docs.litellm.ai/))
> 
> Docker Model Runner is useful for the local-model side on Apple Silicon, but it is an inference service, not the thing that schedules 30 agent processes. ([Docker Model Runner](https://docs.docker.com/ai/model-runner/))
> 
> The practical architecture would be:
> 
> ```text
> Mac Mini
>   Docker Compose
>     DeerFlow
>     Postgres + queue
>     LiteLLM
>     Docker Model Runner/Ollama
>     3–6 local workers
> 
> Cloud Linux host
>   same worker images
>   10–30 burst workers
>   optional k3s/Kubernetes or E2B sandboxes
> ```
> 
> Use one shared job ledger, but separate:
> 
> - Momentum work
> - Each client
> - Dillon’s daily work
> - Personal experiments
> 
> Each should have its own workspace, credentials, model budget, worktree, and approval policy. Codex/Marketing Chief should remain the final authority so DeerFlow, Claude, OpenRouter, and any future runtime do not become competing command centers.
> 
> What I would not do:
> 
> - Build a Raspberry Pi cluster for agent compute.
> - Install Orca as another fleet controller.

> Short answer: at $1,000/month, I would not replace DeerFlow and I would not buy Raspberry Pis. I’d build a hybrid around it:
> 
> ```text
> Mac Mini control plane
>         ↓
> Dedicated cloud CPU workers
>         ↓
> Docker sandboxes + Postgres/Redis + audit logs
>         ↓
> LiteLLM → OpenRouter/direct model APIs
>         ↓
> Optional GPU burst for local-model jobs
> ```
> 
> The better answer is a layered agent fabric, not another all-in-one orchestrator.
> 
> I checked the other enterprise/DeerFlow session. Its useful conclusion was that your current DeerFlow deployment is a good local runtime, but not yet a safe multi-client SaaS platform: SQLite, incomplete auth/RBAC, non-durable run events, and broad host mounts are bigger risks than raw agent count. So the first $1,000 should buy isolation, durability, and measured capacity—not another orchestration product.
> 
> ### What I’d use
> 
> - **Mac Mini:** controller, dashboards, personal agents, local Docker workers, and attended Claude/Codex work.
> - **Dedicated cloud CPU host:** always-on worker pool for Momentum/client workloads.
> - **DeerFlow:** keep it as the primary agent runtime for Momentum and client-specific flows.
> - **Docker Compose:** start here on one cloud host. Docker’s own guidance treats Compose as the simplest production option for a single server; move to Swarm/Kubernetes only when you actually need multiple hosts. [Docker production Compose guidance](https://docs.docker.com/compose/how-tos/production/)
> - **LiteLLM:** model gateway for OpenRouter and direct API providers, with budgets, routing, rate limits, and cost tracking. [LiteLLM documentation](https://docs.litellm.ai/)
> - **Postgres + Redis + object storage:** durable state, queues, audit records, and artifacts.
> - **GPU burst provider:** RunPod/Lambda-style GPU only when you need local model inference or GPU workloads. Don’t pay for a GPU 24/7 just to run API-backed agents.
> - **Docker Model Runner/Ollama:** optional local model endpoint on the Mac; useful for small/private jobs, not a solution for 30 heavy parallel agents. [Docker Model Runner](https://docs.docker.com/ai/model-runner/)
> 
> ### The capacity reality
> 
> DeerFlow’s production guidance estimates roughly **2 vCPU and 2 GB RAM per sandbox**. That means:
> 
> - 20 heavier sandboxes ≈ 40 vCPU and 40 GB RAM before gateway, database, browser, and queue overhead.
> - 30 heavier sandboxes ≈ 60 vCPU and 60 GB RAM before overhead.
> 
> DeerFlow allows a configured `max_running` ceiling up to 64, but its own capacity plan says to raise concurrency gradually, observe provider throttling and sandbox pressure, and use multiple worke

<sub>rollout: `C:\Users\dillo\.codex\sessions\2026\09\19\rollout-2026-09-19T18-10-33-01a0bbb8-9deb-7662-b163-91a0457d4882.jsonl`</sub>
