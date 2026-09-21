---
note_type: reference
status: staged
created: 2026-09-14
owner: Dillon Mohr
verification_status: installed-import-verified-api-unverified
source_refs:
  - "https://developers.openai.com/api/docs/guides/agents/sdk"
  - "https://developers.openai.com/showcase/agents-api-slack-bot"
  - "_os/agent-swarm/sdk/package.json"
  - "_os/agent-swarm/sdk/package-lock.json"
  - "_os/agent-swarm/README.md"
  - "https://learn.chatgpt.com/docs/app-server"
  - "C:/Users/dillo/Documents/Codex/projects/client-operations/clients/momentum-360/deliverables/2026-09-12-dedicated-agents/SLACK-INSTALLATION-2026-09-14.md"
---

# OpenAI agents: installation, workflow map, and build shortlist

Researched September 14, 2026. The JavaScript Agents SDK is installed locally under `_os/agent-swarm/sdk`. API execution and Slack activation are not verified by this installation.

## Workmate operator scope correction

Dillon explicitly expanded Workmate to the full Marketing Chief operator plus the five organizational modes. The selected integration is the local Codex app-server through Slack Socket Mode. Reuse the existing Codex identity, installed skills, connected apps, client registry, workflow files, and Marketing Chief authority. The five modes are focuses within the operator, not a capability ceiling.

Official standalone `@openai/codex` 0.154.0 was installed under `C:/Users/dillo/AppData/Local/Dillon/MomentumWorkmate/codex-runtime`. Its executable and stdio initialization were verified. A read-only app-server probe returned managed ChatGPT Pro authentication, 912 enabled skills, and 32 apps marked callable, including Gmail, Drive, Slack, HubSpot, GitHub, Canva, Figma, and Vercel. This proves local discovery, not that every provider operation succeeds. Desktop-only features and browser control still require an actual runtime check.

This operator route uses the existing Codex login; it does not require the blocked new API key. The Agents SDK and managed swarm remain available for separate API workflows. Slack transport credentials and a real message/response acceptance receipt are still required before Workmate can be called live. See the linked installation receipt for the latest implementation state.

The local bridge subsequently completed two real subscription turns in one Codex thread: a terminal file read with exit code 0 and a connected Slack profile lookup. Its offline trust/continuity/cancellation checks and independent review passed. Slack delivery remains unverified and activation is off. Exact source hashes and tool-event evidence are recorded in the Workmate package's `OPERATOR-READINESS-2026-09-14.json`.

## Installation and verification

| Component | Current evidence |
| --- | --- |
| Node | v24.18.0 |
| npm | 12.0.2 |
| Agents SDK | `@openai/agents` 0.18.0, exact version in package and lockfile |
| Schema validation | `zod` 4.6.5, matching SDK's Zod 4 peer requirement |
| Installation | 25 packages added; 26 audited; npm reported zero vulnerabilities at installation |
| Verification | Agent, Runner, tool, and Zod imported successfully; no model call |
| API credentials | Dillon selected new-key creation; OpenAI connector requires reauthentication and browser verification has not completed |
| Python | 3.13.14 on PATH; uv available |
| Docker | No command found on PATH; installation elsewhere not exhaustively checked |
| Existing swarm UI | Source present; no listener found on port 4243 during this inspection |

Installed with `npm install --ignore-scripts --no-fund`. No global package, secret file, Slack app, scheduled job, or paid API session was created. Existing swarm server code was not changed.

```powershell
Set-Location C:\Users\dillo\repos\dillon-os\_os\agent-swarm\sdk
npm run check
# Reproduce the dependency installation later:
npm ci --ignore-scripts --no-fund
```

This installs the library for our Node stack. It does not automatically give SDK agents Codex's connectors, browser sessions, local skills, or client permissions. Dillon subsequently authorized a new key and Workmate installation. Slack app `A0C2K8ZU6AU` is installed in Momentum team `T066HGS7N`; API-backed workflow wiring remains pending authentication, secure credentials, and runtime implementation. The package check only proves installation and imports.

Repository verification: `Test-SecondBrain.ps1 -Json` was run and reported six metadata errors in two existing September 14 decision notes, plus twelve warnings. None of the reported errors names the SDK package or this reference. This is not a clean whole-vault result. The general diff check also found whitespace in unrelated existing files; those files were left untouched.

## How the pieces work

| Piece | Responsibility | Fit for Dillon OS |
| --- | --- | --- |
| Responses API | Model calls and configured tools; application supplies workflow logic | Simple extraction or a single classification |
| Agents SDK | Library in our process that loops through model calls, tools, and handoffs | Controlled daily workflows integrated with local records |
| Agents API | OpenAI runs a managed Codex harness with persistent sessions and optional sandbox | Longer research, code investigation, and the new Slack teammate example |
| ChatKit | Embedded conversational interface | A future client portal or internal web interface |

These are different resources and integration choices. Our current `_os/agent-swarm/server.js` talks to the managed Agents API. Installing the Agents SDK alongside it does not migrate or replace that service. [Official runtime comparison](https://developers.openai.com/api/docs/guides/agents).

An SDK agent combines instructions, a selected model, callable tools, and optionally a typed result. A run sends input to the model, executes requested tools, follows handoffs if configured, and repeats until it returns an answer or reaches a limit or approval pause. A single user turn can therefore involve several model requests. [Agent loop](https://developers.openai.com/api/docs/guides/agents/running-agents).

Our code must supply actual capabilities. A tool called `read_client_status` should resolve an authorized client record and return bounded evidence. A prompt saying “check HubSpot” does not create a HubSpot connection. Credentials and authenticated client identity belong in local run context; only necessary evidence belongs in model input. [Agent definitions and local context](https://developers.openai.com/api/docs/guides/agents/define-agents).

## Configuration for our stack

The following is the proposed application contract, not an activated workflow:

| Choice | Recommended initial setting |
| --- | --- |
| Language | JavaScript ESM on existing Node 24; no duplicate Python service for the same workflow |
| Owner | Marketing Chief retains the final answer and canonical queue authority |
| First workflow | One agent produces a draft morning brief from selected, current evidence |
| Routine model | Explicit `gpt-5.6-luna`, medium effort |
| Demanding work | Explicit `gpt-5.5`, xhigh, only for a bounded escalation |
| Astra | Only when Dillon explicitly requests it; tutorial defaults do not change local policy |
| Initial tools | Narrow reads of approved records; local draft output; no external messaging tools |
| Result | Structured status, source references, owner, blocker, next action, draft artifact |
| Run limits | Bounded input, max turns, output allowance, deadline, and limited concurrency |
| Retry policy | Bounded retries for safe reads; reconcile uncertain consequential operations before retrying |
| Trace policy | Disable export during offline checks; review data policy before real client tracing |
| Schedules | Reuse the existing scheduler and queue when a workflow is accepted |

Use per-agent model settings rather than relying on a changing SDK fallback. Current package declarations expose `modelSettings.reasoning`, `maxTokens`, `maxTurns`, `tracingDisabled`, and `traceIncludeSensitiveData`; their placement differs between agent, runner, and run options. [Model configuration](https://developers.openai.com/api/docs/guides/agents/models).

When specialists are justified, use **agents as tools** so Marketing Chief calls a bounded specialist and synthesizes its findings. A **handoff** transfers conversation ownership to the specialist, which is a different arrangement. Begin with one agent and split only when tool permissions or responsibilities actually differ. [Orchestration](https://developers.openai.com/api/docs/guides/agents/orchestration).

Choose one state strategy per conversation: stored local history, SDK sessions backed by suitable persistence, or server continuation IDs. Do not combine full replay with server history without deduplication. JavaScript `MemorySession` is memory for the running process, not a restart recovery plan. Client history needs separate storage keys based on verified identity, not model-generated names. [State and continuation](https://developers.openai.com/api/docs/guides/agents/running-agents).

For a future approval tool, pause with `needsApproval`, persist the returned state, and resume after the exact action is approved or rejected. Do not copy the tutorial's automatic `state.approve()` loop into production. Validate client scope and arguments at the actual tool boundary; agent-level guardrails do not cover every intermediate call. [Human review](https://developers.openai.com/api/docs/guides/agents/guardrails-approvals).

## The Slack example you were looking for

Strong match: [Build an AI teammate for Slack](https://developers.openai.com/showcase/agents-api-slack-bot). The [Showcase gallery](https://developers.openai.com/showcase) and [Agents API examples index](https://developers.openai.com/cookbook/examples/agents_api/readme) are the places to find the other apps.

The Slack example uses mentions and Socket Mode, retains conversation context per thread, and connects scoped Slack functions with optional workplace MCP integrations. A thread workspace can analyze files or investigate code, and the bot streams activity into Slack. It is a managed Agents API application. The published example requires Python 3.14+, uv, a sandbox, an API key, and an installable internal Slack app.

There is documentation drift to resolve before adopting its code: the showcase still illustrates `agent_api_sdk.AgentAPISDK`, while the current examples index identifies the official `openai>=3.13.0` package and `client.beta.agents`. The linked Slack README did not resolve through the documentation fetcher. Use the current repository example and installed types as the implementation contract, not copied showcase snippets.

Our existing Momentum alternative is at:

`C:/Users/dillo/Documents/Codex/projects/client-operations/clients/momentum-360/deliverables/2026-09-12-dedicated-agents/`

Its `SLACK-READINESS-2026-09-13.md` reports a proposed Momentum Workmate app, a draft manifest, and local shadow receiver work. That dated report says external installation remained pending. It is not evidence that a Workmate bot is live today. Keep those files and the existing webhook app separate when deciding whether to adapt the new example.

## What is worth building

These are recommended adaptations, not claims that the apps already exist in our stack.

| Priority | Build | What Dillon experiences | Smallest useful version |
| --- | --- | --- | --- |
| 1 | Slack operations teammate | “What is blocking this client?” returns sources, owner, next action, and a prepared draft | One internal channel, explicit mentions, one client context per request, read-only tools |
| 2 | Build catalog and artifact finder | “Find the dashboard we built last week” returns a preview, canonical path, launch command, and verified status | Add a catalog to the existing OS interface using artifact metadata; use ordinary search before AI |
| 3 | Paid-media investigation desk | “Why did qualified leads fall?” produces evidence, discrepancies, charts, and a client-ready draft | One active account, approved exports, deterministic calculations, no campaign edits |
| 4 | Client delivery packet | “Prepare Friday's update” assembles completed work, missing evidence, report links, and draft copy | One client and one reporting period; existing queue remains authoritative |
| 5 | Automation incident investigator | “Why did this routine stop?” identifies the first failing step and prepares a repair | Read existing receipts and logs; reproduce locally; stage a patch |
| 6 | Bug-to-patch assistant | A screenshot or issue becomes a reproduction, diagnosis, patch, and test evidence | One repository in an isolated checkout; draft review output |
| 7 | Voice briefing with actions | Ask about the day aloud, inspect evidence, and prepare the next work item | Read-only voice over an already reliable status tool |

The Slack, data analysis, incident response, and bug investigation recommendations adapt official examples: [Slack](https://developers.openai.com/showcase/agents-api-slack-bot), [data agent](https://developers.openai.com/showcase/agents-api-data-analyst), [incident response](https://developers.openai.com/showcase/agents-api-sev-bot), [GitHub investigation](https://developers.openai.com/showcase/agents-api-github-issues). Voice is a separate integration path described in [Voice agents](https://developers.openai.com/api/docs/guides/voice-agents).

Another useful example is [bulk document review](https://developers.openai.com/showcase/agents-api-document-review): apply one review policy across a batch and retain structured findings for human review. Adapt it for scope and invoice evidence checks once the higher-priority workflows work reliably.

Build order: make our artifacts findable, prove one useful SDK workflow, then expose that workflow through a Slack teammate. Add specialist tools as needed. A new full agent roster, vector database, or replacement dashboard is not required to start.

## Costs, testing, and acceptance

The SDK installation incurred no model run. Future model calls use API billing. On the researched pricing page, standard short-context Luna rates are $0.20 per million input tokens and $1.20 per million output tokens; GPT-5.5 rates are $5 and $30 respectively. For illustration, 20,000 uncached input tokens plus 2,000 output tokens is about $0.0064 on Luna or $0.16 on GPT-5.5, before additional tool, sandbox, or other usage charges. These are arithmetic examples, not a per-task quote; multiple turns and reasoning can increase usage. Recheck [pricing](https://developers.openai.com/api/docs/pricing) before setting a production budget.

Max turns and timeouts are not exact dollar caps. Record usage for every model call, include nested specialist work, and reconcile provider usage. Keep one workflow's quality and cost visible before increasing concurrency.

Tracing is enabled by default on the normal server-side SDK path and can record model and tool activity. Decide what client data may leave the local process before enabling export. Start with a few synthetic cases: correct client, missing evidence, stale source, tool failure, and attempted external action. Then evaluate representative authorized work for citation accuracy, useful output, boundary adherence, and cost. [Tracing](https://developers.openai.com/api/docs/guides/agents/integrations-observability), [workflow evaluations](https://developers.openai.com/api/docs/guides/agent-evals).

Acceptance must remain explicit:

1. Installed: dependencies resolve and import. Achieved here.
2. Locally verified workflow: offline tool and state checks pass. Not yet built here.
3. API verified: an approved bounded run produces inspected output and usage. Pending.
4. Slack verified: correct app identity receives an authorized event and its reply is read back. Pending.
5. Daily operation: the existing scheduler produces useful artifacts with receipts over representative runs. Pending.

## Documentation reading order

Read [SDK overview](https://developers.openai.com/api/docs/guides/agents/sdk), [quickstart](https://developers.openai.com/api/docs/guides/agents/quickstart), [definitions](https://developers.openai.com/api/docs/guides/agents/define-agents), [models](https://developers.openai.com/api/docs/guides/agents/models), [running](https://developers.openai.com/api/docs/guides/agents/running-agents), [orchestration](https://developers.openai.com/api/docs/guides/agents/orchestration), [approvals](https://developers.openai.com/api/docs/guides/agents/guardrails-approvals), [results](https://developers.openai.com/api/docs/guides/agents/results), and [integrations](https://developers.openai.com/api/docs/guides/agents/integrations-observability). Use the managed API's own state and sandbox documentation for the Slack showcase or existing swarm.
