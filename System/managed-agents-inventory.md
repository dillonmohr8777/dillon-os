---
date: 2026-09-14
status: live
owner: dillon
spend_today: ~22 cents of a 429 cent Console balance
---

# Managed Agents inventory

Everything Momentum has on Anthropic's Managed Agents platform, plus the local
bridge that delivers its output. **A local `.md` file is a definition. A
`agent_`/`env_`/`depl_`/`vlt_`/`file_` id is a billable Console resource.**
Only the second kind runs when this desktop is off.

Verified live at 2026-09-14. All Console resources below were created
2026-09-14, are active, and had their tools attached at creation.

## 1. Console resources

### Agents

| Agent | ID | Version | Model/effort | Env | Purpose | Status |
|---|---|---|---|---|---|---|
| `momentum-url-sentinel` | `agent_01HqNDQ64t3qfBFzDwpVd5F1` | v1 | Sonnet/low | monitor-net | Daily liveness of 11 report pages + Omega tracking fix | Verified ALL CLEAR, 6c |
| `momentum-analyst` | `agent_01UMXwDwbwqJLFXyZcCJCjqF` | v1 | Sonnet/medium | locked | Uploaded-export analysis | Never run |
| `momentum-researcher` | `agent_01RbidZ2iYpChBU3niguP9Vj` | v1 | Sonnet/medium | open, web_search+web_fetch | Finds URLs/locator endpoints; writes research.md, urls.json, dead-ends.md | Not yet run — a run was prepared and rejected pending Dillon's spend approval, est 15-25c |
| `momentum-research-coordinator` | `agent_01AC7RNJCzUxgXzJoe2FJMDK` | v1 | Sonnet/medium | open | Multiagent coordinator over researcher v1, ceiling 3 test / 5 prod | Not yet run, est 60-80c |
| `momentum-reporter` | `agent_01RMLxWLY2k3LsgAbWdowZYD` | v2 | Sonnet/medium | open | Pulls Ads+GSC via vault, renders house template, writes email to standard | Not yet run; needs vault secrets |
| `momentum-designer` | `agent_01QgDvhvE9Na6GzX6AR75jbX` | v2 | Opus/high | locked | Artboards from a brief on audited tokens | Not yet run, est ~$1 |
| `momentum-qa-reviewer` | `agent_01NL8Ld9kchYGPEfUqfxrdud` | v2 | Sonnet/medium | — | Independent review, no authority to change | Not yet run |
| `momentum-content-producer` | `agent_01RSjLoCvY5d82G3J6VRSDSJ` | v2 | Sonnet/medium | locked | Briefs/copy/SEO drafts/specs | Not yet run |
| `momentum-job-researcher` | `agent_01DpF1YeqgFeDHk7agdJ5F4i` | v2 | Sonnet/medium | open, web | Finds live first-party roles fitting resume.md, public contact path, drafts outreach. Never applies/sends | Not yet run |
| `momentum-smoke-test` | `agent_01SKQzvHy9vws7ofEzHB87ee` | v2 | — | — | Platform test, done | Safe to archive |

v2 = system prompt patched to the real mount path (gotcha 4 below).

### Environments

| Environment | ID | Networking |
|---|---|---|
| `momentum-open` | `env_01MshEwNFTUyoxhJPpxaQuZb` | Unrestricted |
| `momentum-monitor-net` | `env_012C6JvqEKA3fk95iaaqNdkv` | Limited — two Netlify hosts only |
| `momentum-test-locked` | `env_01VKzXQqDVsfohc5JTGzuCa7` | Limited — no hosts, fully offline |

### Vault

`momentum-google` `vlt_011Cf43aPqiZsFdRfM1Wv56J` — EMPTY. Dillon adds three
credentials in the Console (type `environment_variable`): `GOOGLE_ADS_DEVELOPER_TOKEN`
(allowed_hosts `googleads.googleapis.com`), `GOOGLE_OAUTH_REFRESH_TOKEN` and
`GOOGLE_OAUTH_CLIENT_SECRET` (allowed_hosts `oauth2.googleapis.com`). The vault
create field the API accepts is `display_name` — `name` and `description` are
rejected (gotcha 5).

### Deployments

| Deployment | ID | Cron | Cap | Status |
|---|---|---|---|---|
| `momentum-url-sentinel-daily` | `depl_01NziWNpiq9wqnsuSRSm1RFF` | `0 6 * * *` America/New_York | 25c | PAUSED |
| `momentum-reporter-weekly` | `depl_01A3eaYHXaJCvYXaX7CXgkHt` | `0 6 * * 1` America/New_York | 300c | PAUSED — vault attached, three inputs mounted, brief covers nexla/omega-landscaping/onsite-concrete-landscape, next fire 2026-09-21T10:00Z once unpaused |

### Files uploaded (purpose: agent)

| File | ID |
|---|---|
| clients.json | `file_01KbkThoyhtKh9BWvd4xtKnu` |
| report-template.html | `file_01B2t3rPARHv98LG45jcEN3H` |
| build-report.js | `file_01PUw18zewmd3QG6G2PbxGad` |
| tokens.json | `file_011pvDs1P4mTotr68LfvBVNR` |
| tokens.css | `file_01MNGHfxaWYP28nGderAZWmZ` |
| AUDIT.md | `file_01TZt6xvR6nVHbTsoKFkWtmy` |
| dc-format.md | `file_01MzE9GNPEGK7WzRUKH8xaMZ` |

### Where the 75c went

11c platform tests + 6c sentinel + 16c across six smoke/mount/diagnostic
sessions + **42c on the first real researcher run**. That run is the calibration
number that matters: a single-target web research job with 16 tool calls cost
**42c against a 40c cap**, roughly double my 15-25c estimate. Budget research at
~40c per target, not 20c.

It also gave a second reading on the cap leak: 42c against a 40c cap is a **5%
overrun**, versus 400% on the 1c test. The leak is one turn's cost, so it shrinks
proportionally as the cap grows. Caps of 40c+ behave close to a real ceiling.

## 2. The bridge (local, in this repo)

`_os/automation/bridge/`:

- `collector.py` — stdlib only, SQLite WAL journal, manifest-last delivery.
  Idempotent deliver steps: `gmail_draft`, `designsync`, `receipt`, `git_commit`.
  `test_collector.py` 5/5 passing.
- `Run-Collector.ps1` — Task Scheduler entry point. Reads the API key from
  Windows Credential Manager (target `Momentum.ManagedAgents.ApiKey`) at run
  time, hands it to one child process only, never writes it to disk/env/file.
- `SETUP.md` — rotate key, `cmdkey` one-time setup, how to confirm the
  collector runs.
- `inputs/dc-format.md` — Claude Design artboard format reference for agents
  that produce `.dc.html` output.

Task Scheduler: `Momentum-ManagedAgents-Collector`, at logon + every 10 min,
registered and Ready. No-ops (logs one line, exits) until the credential
exists.

Agents write to `/mnt/session/outputs/` + `manifest.json` last; no custom
tools in v1.

## 3. Gotchas measured

1. **Budget cap is a pre-request gate, not a ceiling.** A 1c cap spent 5c with
   `stop_reason: null` and no `budget_reached` event — it refuses the *next*
   turn, not the current one. One turn can cost arbitrarily more than the cap.
2. **A session pinned to an agent version that predates its tools fabricates.**
   No error — it invents plausible tool output. Always pass `tools` at agent
   creation and check the event stream for `agent.tool_use` before trusting a
   result.
3. **Outputs surface, but only via `scope_id`.** `GET /v1/files?scope_id=<session_id>`
   with both `files-api-2025-04-14` and `managed-agents-2026-04-01` headers,
   ~1-3s after idle, then `GET /v1/files/{id}/content`.
4. **`mount_path` is relative to `/mnt/session/uploads/`.** A resource with
   `mount_path` `/workspace/clients.json` lands at
   `/mnt/session/uploads/workspace/clients.json` — `/workspace` itself is
   empty (verified: echo returned Nexla/27 only at the real path). `pwd` in
   the sandbox is `/`, not `/workspace`.
5. **Vault create body is `{"display_name": ...}`.** `name`/`description` are
   rejected.
6. **The files listing also returns mounted inputs**, not just outputs — the
   collector delivers only files its manifest names, so it filters on that
   rather than trusting the listing alone.

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

**Pause / unpause a deployment:**
```
POST https://api.anthropic.com/v1/deployments/<depl_id>/pause    body: {}
POST https://api.anthropic.com/v1/deployments/<depl_id>/unpause  body: {}
POST https://api.anthropic.com/v1/deployments/<depl_id>/run      (fire once by hand, no unpause)
```

**Run an agent:**
```
POST /v1/sessions   {"agent":{"type":"agent","id":"<agent_id>","version":<n>},
                     "environment_id":"<env_id>",
                     "budget":{"type":"limit","max_list_cost":{"amount":"<cents>","currency":"USD"}}}
POST /v1/files      (multipart upload, if the agent needs an input)  -> file_id
POST /v1/sessions/{id}/resources   {"type":"file","file_id":"..."}
POST /v1/sessions/{id}/events      {"events":[{"type":"user.message","content":[{"type":"text","text":"..."}]}]}
```

**Read a result:** list runs for the deployment (or the session directly),
take `session_id`, then `GET /v1/sessions/{id}/events` and read the last
`agent.message`. For the sentinel, line 1 is `ALL CLEAR` | `DEGRADED` | `CRITICAL`.

**Read files a session produced:**
```
GET /v1/files?scope_id=<session_id>   (both beta headers — see gotcha 3)
GET /v1/files/{id}/content
```

## 5. Still Dillon's

- **Rotate the API key**, then store it via `cmdkey` (`SETUP.md`).
- **Paste the three vault credentials** in the Console (`momentum-google`).
- **Unpause the two deployments** — sentinel (~$1.80/month) and reporter.
- **Approve the first verification runs**: researcher ~20c, coordinator ~70c,
  designer ~$1, reporter cred probe ~2c then full ~20c.
- **Optionally archive `momentum-smoke-test`.**
- **Pending test:** expiry survival — re-list session
  `sesn_01U2CouEefMGvwhMQajKLJsN` outputs after 22:41 UTC to confirm files
  persist past sandbox idle expiry.

Budget: $50 was the pilot allowance for two agents. Operating float for the
nine-role fleet is ~$150/month (Sonnet everywhere except the Opus designer;
coordinator used deliberately). Pay-per-use; a quiet week costs a few dollars.

## 6. Sessions to date

| Session | Agent | Cap | Spent | What it proved |
|---|---|---|---|---|
| `sesn_01P8wvKyKtEVwXG1UN78qWKX` | smoke v1 | 50c | 1c | **Version trap.** Pinned to v1 which had no tools; model fabricated a bash session, fake 2025 timestamp. Zero tool events. |
| `sesn_01Jr28u9G83jmHVwzRpLTdX2` | smoke v2 | 50c | 3c | Real Firecracker VM, real 119-byte file. |
| `sesn_01S8qMU6W3eJ83mouCvrGUjV` | smoke v2 | 15c | 2c | Agent quit early; cap untested. |
| `sesn_017JDmG4JFapLbYXnzT7ub4z` | smoke v2 | **1c** | **5c** | **Cap does not bound spend.** Overran 5x, silently. Next turn refused. |
| `sesn_01J2LMarCTampsmQS3HPVeMG` | sentinel v1 | 25c | 6c | End-to-end through the deployment and the allowlisted environment. ALL CLEAR, 11 report pages + Omega fix, 5 `agent.tool_use` events. |
