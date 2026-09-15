# Dillon OS Agent Swarm

Agents SDK dependencies are installed separately in `sdk/`. See [SDK setup and build recommendations](../../System/OPENAI-AGENTS-SDK.md) for the distinction between this managed Agents API service and local SDK workflows. Run `npm run check` from `sdk/` to verify imports without API calls.

A local mission control surface for the OpenAI managed Agents API. It extends the existing Dillon OS Node platform conventions and the session lifecycle proven by `System/scripts/Invoke-OpenAIAgentsSession.ps1`.

## Start

```powershell
& C:\Users\dillo\repos\dillon-os\_os\agent-swarm\Start-Swarm.ps1
```

Open http://127.0.0.1:4243. Node 24 is available on this machine. There are no package installs or frontend build steps. The launcher reads the existing `OPENAI_API_KEY` from the process or Windows User environment without printing or copying it into a file.

## Use

1. Select **New mission**, enter the desired result, source context, and acceptance criteria.
2. Choose Engineering, Research, Content studio, or Operations. New missions default to GPT-5.5 with extra-high reasoning; choose Luna for routine throughput or Astra only for an explicit escalation. Set the lead model and one to three concurrent workers.
3. Save the mission as a local draft. **Launch mission** submits it to an OpenAI hosted workspace and begins API billing.
4. Follow observed worker records, saved conversation, turn evidence, and deliverables. Planned roles are explicitly labeled until API evidence exists.
5. Use **Send direction** to steer work or request a revision in the same session. **Stop work** requests cancellation while retaining the session.

The brief is the source package. A hosted sandbox cannot read a Windows path just because it appears in the prompt. Paste relevant source text or select text files with **Add source text**; their contents are appended for review before launch. Authenticated browser sessions, local credentials, client accounts, and the canonical client queue are not automatically shared with hosted workers.

## Runtime and persistence

- `server.js` owns the loopback API, provider requests, mission state, recovery, and artifact downloads.
- `public/index.html` is the native HTML/CSS/JavaScript control surface, using the existing Dillon OS palette.
- `teams.json` defines reusable team instructions and specialist roles. Edit this file to refine the teams.
- `data/` contains local mission state and is ignored by Git. Set `SWARM_DATA_DIR` for an alternate private directory.
- `SWARM_PORT` changes the loopback port. The launcher accepts `-Port`.
- The service uses the same public `/v1/agents/sessions` API and `OpenAI-Beta: agents=v1` header as the existing PowerShell probe. The probe remains unchanged.

Closing the browser does not stop a hosted turn. Restart the server and refresh to reconcile persisted sessions. An ambiguous create request is held for reconciliation rather than automatically retried, since repeating it could create a second billed session.

If launch is uncertain and no session ID was received, check the provider account for orphaned work. The explicit **Acknowledge possible orphan and release local hold** action releases only the local lock. It does not stop hosted work or establish its outcome. No automatic retry is performed.

## Limits and authority

One active mission at a time, with at most three concurrent workers. The worker limit excludes the coordinator and does not cap total sequential workers or delegation depth. Team instructions request bounded delegation. The API does not expose a separate model setting for each worker; the UI reports the lead model and labels worker models unavailable.

A 15 minute per-turn watchdog requests cancellation while the local server is running. It is best effort, not a hard dollar spending cap. If the server is stopped or a provider request fails, hosted work can continue. The token field displays provider-reported usage when available, otherwise “Not reported.” API model and sandbox billing are separate from the Codex subscription.

Mission scope remains draft and local preparation. This service supplies no client messaging, publishing, payment, arbitrary local shell, or credential tools. A hosted agent can run code in its own sandbox. Final outputs still need review before external use.

The server validates Host and Origin, bounds input and artifact sizes, keeps credentials server-side, and does not expose arbitrary local filesystem paths. It is intended for Dillon's single-user loopback environment, not a public or multi-user deployment.

## Checks

```powershell
node --test C:\Users\dillo\repos\dillon-os\_os\agent-swarm\server.test.js
```

Tests use fake provider responses and do not spend API tokens. A real hosted smoke run is separately recorded in the delivery evidence; a passing local test alone does not prove hosted access or delegation.

Delivery receipt: `C:/Users/dillo/Documents/Codex/2026-09-12/b/outputs/Agent-Swarm-Verification.json`. The adjacent `hosted-verification/` directory contains the downloaded and locally checked smoke deliverables.

## API surface

| Method and path | Action |
| --- | --- |
| `GET /api/state` | Saved missions, teams, model choices, key presence, and limits |
| `POST /api/missions` | Save a draft with title, brief, team, model, reasoning, and workers |
| `POST /api/missions/:id/start` | Launch the draft in a hosted session |
| `POST /api/missions/:id/refresh` | Reconcile saved provider evidence |
| `POST /api/missions/:id/message` | Submit `{ "text": "..." }` to continue or steer |
| `POST /api/missions/:id/cancel` | Request cancellation of current work |
| `POST /api/missions/:id/resolve-uncertain` | Explicitly release an unknown launch hold with `{ "acknowledgeOrphan": true }`; does not cancel possible hosted work |
| `GET /api/missions/:id/artifacts/:artifactId` | Download an eligible published output |

## Current official contracts

- [Sessions and continuation](https://developers.openai.com/api/docs/guides/agents-api/sessions)
- [Multi-agent orchestration](https://developers.openai.com/api/docs/guides/agents-api/multi-agent)
- [Hosted files and artifacts](https://developers.openai.com/api/docs/guides/agents-api/environments/files)
