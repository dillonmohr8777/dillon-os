---
note_type: session-recovery
status: recovered
created: 2026-09-23
updated: 2026-09-23
session_first: 2026-09-18T20:57:58
session_last: 2026-09-18T20:57:58
session_count: 1
cwd: "C:\Users\dillo\Documents\Codex\2026-09-18\https-dev-meta-ai-docs-cookbook"
open_flags: [auth-expired, quarantined]
tags: [codex-recovery, session, 202609]
---

# Documents\Codex\2026-09-18\https-dev-meta-ai-docs-cookbook

**1 session(s)** · 2026-09-18 20:57 → 2026-09-18 20:57 · 12.7h agent-time (summed; sessions may overlap) · 2 MB transcript · 6/6 turns completed

> **Open flags:** `auth-expired`, `quarantined`

## 1. 2026-09-18 20:57 · 12.7h · 1.6 MB

`01a0b64f-cc19-7ad1-b9df-6952fe447bcd` · turns 6/6 · flags: auth-expired, quarantined

**Asked:**

> https://dev.meta.ai/docs/cookbook#use-cases analyze every single used Case read through every page spawn as many agents as there is documentation on this page in parallel in particular focus on this URL too https://dev.meta.ai/docs/cookbook/multi-agent-orchestration I don’t know if we really need Hermes because we have so many other things set up now and harnesses and models but we can use whatever with my force API key and my open router key the open router has much more spend on it how does docker and deer look play a role?

> Update me on the Deerlick Plus Docker terminals.

> Provide full smamry on what theyre doing

**Outcome reported:**

> Can't spawn 13 parallel agents here — your `AGENTS.md` caps explicitly-requested delegation at 1 worker with a small packet, plus Codex is at 100% weekly until reset Sep 19 04:30 America/New_York. So single-session draft analysis only, no runs, no spend.
> 
> **All 13 use-cases from `meta-models/meta-model-cookbook/03_use_cases`:**
> 
> 1. `01_chart-explainer` — read charts, extract structured data. Useful for Look Alive / paid-media dashboards.
> 2. `02_screenshot_bugfix` — diagnose bug from screenshot, ship fix. Maps to your bugfix loop.
> 3. `03_visionclaw` — hands-free look-and-ask on Ray-Ban Meta + OpenClaw. Not relevant to current Windows delivery.
> 4. `04_doc_generation` — slide deck from prompt/source. BOK / GTM use.
> 5. `05_web_design` — coding agent builds site, checks own work in real browser. Core to your web delivery.
> 6. `06_iterative_game_dev` — browser game end-to-end, browser-verified. In-repo only.
> 7. `07_sandbox_execution` — execute model code in sandbox. Safety pattern you already want.
> 8. `08_multi_agent_orchestration` — 4-profile Hermes team, see below. Focus recipe.
> 9. `09_one-shot-game_dev` — full 3D game in one pass via AGENTS.md + structured prompt. In-repo only.
> 10. `10_perception_grounding` — pin dots at pixel locations, HTML overlay. Niche perception.
> 11. `11_github_repo_agent` — autonomous Actions bot for triage/PR review/bugfix PRs on OpenCode + Muse Spark. Relevant to your GitHub flow.
> 12. `12_computer_use` — drive Linux desktop via Cua sandbox from screenshots.
> 13. `13_macos_cua` — drive real Mac via `metacua` native input.
> 
> **08 multi-agent-orchestration deep dive:**
> PM + backend + frontend + GTM profiles, `muse-spark-1.3`, harness Hermes. Contract: persistent identity per profile, all cross-role decisions as `hermes kanban comment`, sequencing via `parent_id/child_id` + in-gateway dispatcher, `block --kind needs_input` to arbiter, per-project `runbook.md` written by PM. PM gets `clarify` but no `terminal/code_execution` so it can't implement. Use when deliverable spans roles and you want negotiation as durable evidence; use single OpenCode CLI when one-role, one-diff, fast iteration.
> 
> **Do you need Hermes?**
> No as primary. From memory: keep Codex as sole final orchestrator/verifier, others bounded draft-only. Hermes here is STALE-WARN / human-gated restart, not live readiness. Keep Hermes only for the auditable Kanban-trail pattern when you explicitly want it.
> 
> **Keys:**
> Recipe wants Base URL `https://api.meta.ai/v1`, mode 2 Chat Completions, `muse-spark-1.3`, 1M context. Use your Meta/Forge key for Muse Spark Standard (no training) v

> **Deerlick Plus Docker — live (deer-flow stack):**
> 
> - 4/4 Up ~30m: `deer-flow-nginx` (:2026 open, reachable), `gateway` (healthy, `/health/ready 200`s), `redis` (healthy), `frontend` (Next.js 16.3.3 Ready).
> - Idle load: 0-0.7% CPU, gateway 235MB max.
> - One flag: `POST /api/auth/register → 403` at 21:12 UTC, while `GET / → 200`. If open registration is expected, check gateway auth config.
> - Source: `C:\Users\dillo\Documents\Qwen\deer-flow\docker\docker-compose.yaml`, status `running(4)`.
> 
> Next: open `http://127.0.0.1:2026/` and try login/register to confirm if that 403 is blocking you.

> **DeerFlow Docker — full summary:**
> 
> This is `deer-flow` prod stack at `C:\Users\dillo\Documents\Qwen\deer-flow\docker\docker-compose.yaml`, project `deer-flow`, status `running(4)`. Up ~44 min, all healthy/idle.
> 
> What each container is doing right now:
> 
> 1. `deer-flow-nginx` (Up 43m, `127.0.0.1:2026 + [::1]:2026 → 2026`) — reverse proxy, loopback-only by design. Live traffic: `GET / → 200`, `POST /api/auth/register → 403`. Port 2026 is reachable.
> 2. `deer-flow-gateway` (Up 42m healthy, 235MB) — FastAPI agent runtime, single worker (`uvicorn app.gateway.app`). Only traffic is `GET /health/ready → 200` every ~5s. Run state is in-memory + Redis bridge. Data dir has `channels / data / skills_view / users` — no active threads seen.
> 3. `deer-flow-redis` (Up 44m healthy, 6MB) — Redis 7 Streams bridge for cross-worker SSE delivery/reconnect.
> 4. `deer-flow-frontend` (Up 44m, 91MB) — Next.js 16.3.3 prod (`next start`), Ready.
> 
> Not running: `provisioner` (optional K8s sandbox mode) — so no K8s sandboxes right now.
> 
> What DeerFlow 2.0 itself is: ByteDance open-source **super-agent harness** — orchestrates sub-agents, long-term memory, sandboxes, session goals, skills/tools, MCP servers, IM channels, scheduled tasks, tracing. Ground-up rewrite from v1 Deep Research. Your compose notes confirm the secure defaults: Docker socket NOT mounted (DooD only via opt-in overlay), `~/.claude` / `~/.codex` NOT mounted, SQLite on named volume `gateway-data` (avoids Windows bind-mount WAL failure found today).
> 
> So: stack is up and idle awaiting first-run setup in the UI. That `register 403` is the one flag — open `http://127.0.0.1:2026/`, if you expect open registration, check `BETTER_AUTH_SECRET` / frontend `.env` and gateway auth config.
> 
> Skipped: secret values, log dumps. Say if you want thread/user counts or the register-403 root cause next.

> That screenshot is expected: `127.0.0.1` on your iPhone means the phone itself, not this Windows host — so Safari can't reach DeerFlow.
> 
> Your stack binds `BIND_HOST=0.0.0.0` with nginx on host port 2026, so from the phone use this machine's LAN IP:
> 
> `http://10.0.0.165:2026/`
> 
> Both devices must be on the same Wi-Fi. If that still fails, it's Windows Firewall blocking inbound 2026 (I found no deer rule) — say so and I'll give you the one-line allow rule. Don't expose this to the internet without your own TLS/auth front door; the agent can execute commands.

> **DeerFlow Docker — full status: up, healthy, idle. No agent work running.**
> 
> Source: `C:\Users\dillo\Documents\Qwen\deer-flow\docker\docker-compose.yaml`, project `deer-flow`, `running(4)`. Up ~44+ min.
> 
> **What each container is doing:**
> 
> - `deer-flow-nginx` — reverse proxy on host `2026`. Traffic is only page loads: `GET / → 200`, `GET /health/ready → 200`, plus `GET /api/models → 401` and earlier `POST /api/auth/register → 403`. Port 2026 reachable locally.
> - `deer-flow-gateway` — FastAPI agent runtime, 1 worker, healthy. Logs are 100% `GET /health/ready → 200 OK`. No agent runs, no model calls, no errors in tail. Health: `{"status":"ready","database":"ok","checkpointer":"ok"}` on both `:2026/health/ready` and `:8001/health/ready`.
> - `deer-flow-redis` — Redis 7 Streams bridge for SSE, healthy, ~6MB. No cross-worker traffic to carry since single worker + no runs.
> - `deer-flow-frontend` — Next.js 16.3.3 prod, `Ready in 601ms` on `:3000` internally. Serving via nginx.
> - Not running: `provisioner` (optional K8s sandbox mode). So no K8s sandboxes.
> 
> **State on disk (`gateway-data` volume):**
> 
> - `.deer-flow/channels/` — empty, no IM sessions.
> - `.deer-flow/data/deerflow.db` (+shm/wal) — present, SQLite alive per health check.
> - `.deer-flow/skills_view/public/` — 20 skills staged: deep-research, data-analysis, chart-visualization, frontend-design, web-design-guidelines, image/video/music-generation, ppt/newsletter/podcast-generation, github-deep-research, academic-paper-review, systematic-literature-review, consulting-analysis, skill-creator/reviewer, find-skills, bootstrap, surprise-me, claude-to-deerflow, vercel-deploy-claimable.
> - `.deer-flow/users/` — present.
> 
> **Configured models (`config.yaml`, names only):** `deepseek-v4-flash/pro/chat`, `gemini-2.5-flash`, `gemini-3.8-flash`, `gemini-3.5-flash-lite`, `claude-opus-5`, `claude-sonnet-5`, `claude-fable-5.1`, `gpt-5.6-luna`, `gpt-5.6-terra`, `grok-4.6`, `kimi-k3`, `qwen3.8-max-0902`, `glm-5.3`. No live call observed — `/api/models` returns `not_authenticated` without login.
> 
> **Bottom line:** harness is staged and waiting at `http://127.0.0.1:2026/` (this PC) / `http://10.0.0.165:2026/` (phone, same Wi-Fi). First-run setup / login not completed — that's why register/models hit 401/403. No threads, no spend, no failures beyond auth gate.
> 
> Next: complete first-run setup in UI, then tell me if you want the register-403 root cause traced.

> DeerFlow is still up and healthy — 10-11h uptime on all four containers, gateway ready with database and checkpointer ok. Codex quota has reset to 0% used, so we have full allowance again.
> 
> This cookbook workspace is still empty, and your iPhone fix stands: use `http://10.0.0.165:2026/` on the same Wi-Fi, not `127.0.0.1`.
> 
> What do you want as the one outcome for this session — pilot one cookbook use-case, trace the DeerFlow register 403, or something else?

<sub>rollout: `C:\Users\dillo\.codex\sessions\2026\09\18\rollout-2026-09-18T16-57-58-01a0b64f-cc19-7ad1-b9df-6952fe447bcd.jsonl`</sub>
