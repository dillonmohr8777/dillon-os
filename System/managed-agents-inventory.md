---
date: 2026-09-14
status: live
owner: dillon
spend_today: 17 cents of a 429 cent Console balance
---

# Managed Agents inventory

Everything Momentum has on Anthropic's Managed Agents platform, plus every
agent-shaped thing that lives only on this machine, so nobody confuses the two
again. **A local `.md` file is a definition. A `agent_`/`env_`/`depl_` id is a
billable Console resource.** Only the second kind runs when this desktop is off.

Verified live at 2026-09-14 20:55 UTC. Re-verify with the read commands at the
bottom before trusting any status here.

## 1. Console resources (real, billable, run without this machine)

| Resource | ID | Purpose | Status | Cost model |
|---|---|---|---|---|
| **Agent** `momentum-url-sentinel` | `agent_01HqNDQ64t3qfBFzDwpVd5F1` v1 | Daily check that the 11 live client report pages and the Omega conversion fix are still correct. Sonnet 5, low effort. | active | ~6c per run, measured |
| **Agent** `momentum-analyst` | `agent_01UMXwDwbwqJLFXyZcCJCjqF` v1 | On-demand analysis of uploaded exports in a locked, no-network sandbox. The vehicle for the Omega search-terms audit once Codex exports the data. Sonnet 5, medium. | active, never run | est. 5-30c per run depending on file size |
| **Agent** `momentum-smoke-test` | `agent_01SKQzvHy9vws7ofEzHB87ee` v2 | The 2026-09-14 platform test. Done. | active, **safe to archive** | none idle |
| **Environment** `momentum-monitor-net` | `env_012C6JvqEKA3fk95iaaqNdkv` | Cloud sandbox, `limited` networking, egress ONLY to `momentum-weekly-client-reports.netlify.app` and `omega-landscaping-landing-page.netlify.app`. No package managers, no MCP. | active | none idle |
| **Environment** `momentum-test-locked` | `env_01VKzXQqDVsfohc5JTGzuCa7` | Cloud sandbox, `limited` networking, **no** allowed hosts. Fully offline. Use for the analyst. | active | none idle |
| **Deployment** `momentum-url-sentinel-daily` | `depl_01NziWNpiq9wqnsuSRSm1RFF` | Fires the sentinel every day at **06:00 America/New_York** (`0 6 * * *`). Each fired session carries a **25c cap**. | **PAUSED** (`paused_reason: manual`) | ~6c/day ≈ $1.80/month if unpaused |

### Why the deployment is paused

Creating it made it `active` with the first fire at 06:00 tomorrow. That is new
recurring spend, which needs Dillon's approval, so it was paused in the same
minute. **Nothing fires until he unpauses it.** Manual runs still work while
paused, which is how it was verified.

### The verification run

`drun_01RACz2pShdqh839hwUUZbZR` → `sesn_01J2LMarCTampsmQS3HPVeMG`,
trigger `manual`, 2026-09-14 20:55 UTC. Result **ALL CLEAR**: 11 report pages
HTTP 200 with titles, `script.js` carries `omega_submit_pending`, the premature
`gtag('event','conversion')` is absent from the submit block, `/thank-you/`
carries the marker. **5 `agent.tool_use` events** — real execution, not
narration. 6 cents, 29.8 active seconds.

### Sessions to date

| Session | Agent | Cap | Spent | What it proved |
|---|---|---|---|---|
| `sesn_01P8wvKyKtEVwXG1UN78qWKX` | smoke v1 | 50c | 1c | **Version trap.** Pinned to v1 which had no tools; model fabricated a bash session, fake 2025 timestamp. Zero tool events. |
| `sesn_01Jr28u9G83jmHVwzRpLTdX2` | smoke v2 | 50c | 3c | Real Firecracker VM, real 119-byte file. |
| `sesn_01S8qMU6W3eJ83mouCvrGUjV` | smoke v2 | 15c | 2c | Agent quit early; cap untested. |
| `sesn_017JDmG4JFapLbYXnzT7ub4z` | smoke v2 | **1c** | **5c** | **Cap does not bound spend.** Overran 5x, silently. Next turn refused. |
| `sesn_01J2LMarCTampsmQS3HPVeMG` | sentinel v1 | 25c | 6c | End-to-end through the deployment and the allowlisted environment. |

## 2. Local definitions (this machine only, run on the Max subscription)

These are markdown files. They cost nothing, they are not Console resources,
and they do not run unless a Claude Code session on this machine invokes them.

| Where | Names | Built by |
|---|---|---|
| `C:\Users\dillo\.claude\agents\` | `closer`, `conversion-truth`, `report-courier`, `creative-foundry`, `auditor`, `scout`, `design-canvas` | this session, 2026-09-14 |
| `C:\Users\dillo\.claude\agents\` | `dillon-builder`, `dillon-client-operations`, `dillon-critic`, `dillon-growth`, `dillon-intelligence`, `dillon-mission-director`, `dillon-reliability`, `dillon-revenue` | a concurrent session, 2026-09-14 |
| `C:\Users\dillo\.claude\agents\` | the 17 original advisors (`marketing-chief`, `paid-media-analyst`, ...) | earlier; refusal clauses rewritten 2026-09-14 |
| `C:\Users\dillo\repos\dillon-os\_os\automation\cadence\` | `daily.yaml`, `weekly.yaml`, `monthly.yaml` + `driver.md` | 2026-09-14; Task Scheduler entries exist, first fire 09-15 09:05 |
| `C:\Users\dillo\repos\dillon-os\_os\agent-swarm\` | OpenAI Agents API swarm scaffold | earlier |
| `C:\Users\dillo\repos\momentum-slack-agent\` | Workmate answering runtime (OpenAI Agents API), commit `483dc7f` | 2026-09-14 |

Overlap to reconcile: `dillon-revenue`/`conversion-truth`, `dillon-critic`/`auditor`,
`dillon-reliability`/`auditor`. Two agents with contradictory instructions is the
failure this whole architecture exists to prevent.

**Other-vendor Console resources.** An OpenAI Agents API session was created and
verified from this machine earlier on 2026-09-14 (plain curl, `openai_hosted`
environment). Its id is in that session's transcript and in the memory note
`agents-api-curl-path.md`; it is not reproduced here because it was not
re-verified live for this inventory. Distinct wallet, distinct vendor.

## 3. Three things measured today that the docs do not make obvious

1. **The budget cap is a pre-request gate, not a ceiling.** A 1c cap spent 5c
   with `stop_reason: null` and no `budget_reached` event. It refuses the *next*
   turn; it does not stop the current one. One turn can cost arbitrarily more
   than the cap. **You cannot promise a client a hard dollar ceiling.** For
   single-turn jobs like the sentinel this is fine; for anything multi-turn,
   size the cap knowing it leaks by up to one turn.
2. **A session pinned to an agent version that predates its tools fabricates.**
   It does not error. It invents plausible tool output. Always pass `tools` at
   agent creation (both real agents here were created that way) and always
   check the event stream for `agent.tool_use` before believing a result.
3. **Files written to `/mnt/session/outputs/` do not surface through the API.**
   `/artifacts` 404s, `/resources` and `/files` come back empty. The agent's
   **final message is the record.** Both agents here are instructed accordingly.

## 4. Runbook

The key is a locator, never a value. Set it for one process only:
`$env:ANTHROPIC_API_KEY` in a single PowerShell process, or `-H "x-api-key: ..."`
inline. **Never `setx`, never `settings.local.json`, never a `.env`** — Claude
Code flips to API billing the instant that variable exists in any scope.

Every call needs `anthropic-version: 2023-06-01` and
`anthropic-beta: managed-agents-2026-04-01`.

**Read state (free):**
```
GET https://api.anthropic.com/v1/agents
GET https://api.anthropic.com/v1/environments
GET https://api.anthropic.com/v1/deployments
GET https://api.anthropic.com/v1/deployment_runs?deployment_id=depl_01NziWNpiq9wqnsuSRSm1RFF
GET https://api.anthropic.com/v1/sessions          (usage.list_cost per session = spend)
```

**Turn the daily sentinel on** (Dillon's call — it is ~$1.80/month):
```
POST https://api.anthropic.com/v1/deployments/depl_01NziWNpiq9wqnsuSRSm1RFF/unpause   body: {}
```
Turn it off: `.../pause`. Fire it once by hand without unpausing: `.../run`.

**Read a sentinel result:** list runs for the deployment, take `session_id`,
then `GET /v1/sessions/{id}/events` and read the last `agent.message`. Line 1
is `ALL CLEAR` | `DEGRADED` | `CRITICAL`.

**Use the analyst on an export:**
```
POST /v1/sessions   {"agent":{"type":"agent","id":"agent_01UMXwDwbwqJLFXyZcCJCjqF","version":1},
                     "environment_id":"env_01VKzXQqDVsfohc5JTGzuCa7",
                     "budget":{"type":"limit","max_list_cost":{"amount":"50","currency":"USD"}}}
POST /v1/files      (multipart upload of the CSV)  -> file_id
POST /v1/sessions/{id}/resources   {"type":"file","file_id":"..."}
POST /v1/sessions/{id}/events      {"events":[{"type":"user.message","content":[{"type":"text","text":"Analyse the attached search-terms export, pages 2-6."}]}]}
```
Then read the final `agent.message`. The analyst never applies anything.

## 5. Open on this lane

- **Unpause the deployment** — Dillon.
- **Rotate the API key.** It was pasted into a chat transcript that syncs to his
  phone. Every resource above keeps working after rotation.
- **Archive `momentum-smoke-test`** — safe, optional, keeps the list clean.
- **Top up the balance** before it matters: ~412c left; the sentinel alone would
  run ~7 months on that, but one real analyst job on a big export could be
  30-50c.
- **The Omega export for the analyst** still depends on Codex pulling it
  (account 285-398-1364, direct route). That prompt is in
  `Documents\Codex\2026-09-14\codex-full-access\PROMPT-CODEX-PARALLEL.md`.
- **Puttery dashboard is not in the sentinel.** Its Netlify hostname was not to
  hand; add it to the environment's `allowed_hosts` and to Check Set A when it is.
