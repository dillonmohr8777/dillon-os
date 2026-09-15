---
note_type: reliability-scout
status: observed
created: 2026-09-10
updated: 2026-09-10
owner: Dillon Mohr
verification_status: verified-live
observed_at: 2026-09-10 ~15:40 America/New_York
source_type: live filesystem + Task Scheduler + Codex state_5.sqlite + automation.toml
scope: read-only
branch: cursor/immohrtal-standing-canary-3c2e
---

# Reliability scout — 2026-09-10

Read-only. Nothing enabled, unpaused, or mutated.
Live sources: `C:\Users\dillo\.codex\automations\*\automation.toml`, Codex `state_5.sqlite` threads (`thread_source=automation`), Windows Task Scheduler, `System/gateway-health.md` vs live Hermes state, `12_Brain/registry/automations.json`, Immohrtal-Crew / Claude daily-driver receipts.

## Headline counts (Codex scheduled roster)

| Bucket | Count | Notes |
|---|---:|---|
| **Live dirs on disk** | **25** | Inventory/MASTER said **26** — **overcount by 1**; table in inventory listed 25 |
| ACTIVE (`status="ACTIVE"`) | **13** | Configured to run; most have **no run evidence since ~2026-08-26** |
| PAUSED | **10** | Same 10 names as inventory — **still accurate** |
| INACTIVE | **1** | `tags-2-go-fast-email-reply` (terminal, not PAUSED) |
| Unmanaged / no status field | **1** | `momentum-radar-daily-12` |
| Non-ACTIVE (PAUSED+INACTIVE) | **11** | Matches the "11 … paused" *intent*; precise wording is **10 PAUSED + 1 INACTIVE** |
| Automation threads updated today (ET) | **1** | Only `daily-communications-brain` |

**Correction to CONTINUE-HERE / DAILY-PROMPT / MASTER claim:**  
"11 of 26 were paused" → live truth is **10 PAUSED + 1 INACTIVE of 25 dirs** (not 26). The **named 10 paused list is still correct.** Do not treat ACTIVE as "ran today."

### The 10 still PAUSED (verified live)

1. `finish-twelve-weekly-report-sends`
2. `keep-agency-wars-build-moving`
3. `slack-reply-watchdog`
4. `align-hcm-dashboard-live-refresh`
5. `daily-align-hcm-semrush-blog-intelligence`
6. `daily-morning-orchestrator-dry-board`
7. `momentum-hubspot-day-pulse`
8. `momentum-hubspot-night-pulse`
9. `momentum-workshop-calendar-intake`
10. `six-hour-important-email-drafter`

Plus INACTIVE: `tags-2-go-fast-email-reply`.

---

## Live

Evidence of healthy / intended-running systems today (2026-09-10 ET), without enabling anything.

### Codex automations with run evidence today

| ID | Evidence | Outcome |
|---|---|---|
| `daily-communications-brain` | Thread `01a08afb-7201-7cb3-b951-6e0376fc88ee` updated **2026-09-10 11:02:16 UTC (07:02 ET)**; daily chain Sep 4–10 present | **Ran.** memory.md last written Sep 8 (today's memory append not confirmed on disk; thread is) |

### Task Scheduler / local loops that ran today

| Task / loop | Evidence | Notes |
|---|---|---|
| `Claude-Autonomous-Daily-Driver` | Ready; last run ~15:23–15:38 ET; `12_Brain/state/claude-daily-driver.json` cycle `DRV-20260910-153818973` | outcome **noop**, consecutive_failures **0** |
| `Immohrtal-Crew` | `12_Brain/state/immohrtal-crew/latest.json` cycle `CREW-20260910-134121066` finished 13:41 ET | outcome **worked**; reliability lane ok; agency lease **expired** since 2026-08-27 |
| Hermes gateway | Live PID **92560** (`python`), start 13:54 ET; `gateway_state.json` updated **2026-09-10T17:55:15Z** — telegram/photon/a2a **connected** | **Healthy now.** `System/gateway-health.md` is **stale** (last entry Sep 9 STALE-WARN for old PID 10180) |
| `Prospect Radar - Next 20 Daily Builder` | LastRun 05:20 ET today | LastResult **1** (non-zero — see Failed/Degraded) |
| `SignalHarbor Intelligence Daily` | LastRun 07:15 ET, Result **0** | OK |
| `Daily-Job-Outreach-Runner` | 09:00 ET, Result **0** | OK |
| `Local Web Foundry - Daily Design Scout` | 09:00 ET, Result **0** | OK |
| `DillonAgentOS-GmailBridge` / SlackBridge | Ran afternoon; SlackBridge often shows Running/267009 | Watchdogs alive |
| GPU / process / settings / OmniRoute watchdogs | Multiple Ready/Running this afternoon | Infrastructure keepalives |

### Separate lane (per kickoff; not Codex roster)

- **Grok Bot Mohr Media** morning standup + prospect scan: **succeeded today** (operator assertion; not re-verified against Mohr Media receipts in this pass).

### Vault registry (`12_Brain/registry/automations.json`)

Different catalog (script/implementations, updated 2026-09-03). Not the Codex scheduler. Statuses are mostly `implemented` / `active-scheduled` / gated — **not a live pause roster.** Useful as capability map only.

---

## Paused

### Codex PAUSED (10) — still paused live

| ID | Why it matters | Last known automation thread |
|---|---|---|
| `slack-reply-watchdog` | Slack triage/drafts dark | 2026-08-26 |
| `six-hour-important-email-drafter` | Important-mail drafts dark | 2026-08-26 |
| `momentum-hubspot-day-pulse` / `night-pulse` | CRM pulse dark (HubSpot access already contested) | no automation thread found |
| `align-hcm-dashboard-live-refresh` | Align ended as employer — pause is coherent | 2026-08-26 |
| `daily-align-hcm-semrush-blog-intelligence` | Same — Align-era | none found |
| `daily-morning-orchestrator-dry-board` | Morning board dark | 2026-07-14 |
| `momentum-workshop-calendar-intake` | Workshop intake dark | 2026-07-26 |
| `finish-twelve-weekly-report-sends` | One-off cleanup left on shelf | none |
| `keep-agency-wars-build-moving` | Unrelated game babysitter left on shelf | none |

### Task Scheduler Disabled (selected estate-relevant)

`IMMOHRTAL Agency Daily`, `Align HCM Marketing Attribution Dashboard - Live Refresh` (LastResult 267014), `Codex-Morning-Orchestrator-Preflight`, `DillonAgentOS-DailyBrief`, `DillonAgentOS-WeeklyCloseout`, `Momentum360-Daily-CallRail-Summary`, `Prospect Radar - Next 15 Builder`, `MarketingChief-Buzz*` (3 tasks, last fail Result 1 on Sep 9), `Cursor-Hermes-PrivateWorker`, `ClaudeBridge`, `DM Marketing - Weekly 25 Prospect Homepages`.

---

## Failed

Non-zero LastTaskResult on estate-relevant scheduled tasks with recent runs (Task Scheduler codes; not decoded further):

| Task | Last run (ET) | LastResult | Severity |
|---|---|---:|---|
| `Momentum360-Daily-Agent-Health` | 2026-09-10 09:00 | **4294770688** | High — daily agency health check failing |
| `Codex-PutteryNYC-TockDataExports` | 15:00 | **64** | High — Puttery Tock export path |
| `Codex-PutteryNYC-TockOperationalStatus` | 15:32 | **64** | High — paired with puttery-nyc automation |
| `Codex-Settings-Watch` | 15:35 | **2147946720** | Medium — settings guard path noisy |
| `Prospect Radar - Next 20 Daily Builder` | 05:20 | **1** | Medium — radar build returned failure |
| `MarketingChief-DailyCalibration` | 08:15 | **1** | Medium |
| `MarketingChief-SitesBridge` | 15:30 | **1** | Medium — recurring bridge failure pattern (also in Aug memory) |
| `IronicIneptocracy-DailyAnalytics` | 08:00 | **1** | Low/side |
| `Cursor-Dillon-LocalWorker` (+ Watchdog) | 15:35 | **1** | Medium — local worker exit 1 |
| `Momentum360-Weekly-Reporting` | 2026-09-06 | **1** | Medium — last weekly attempt failed |
| `DM Marketing - Prospect Sites - Tuesday` | 2026-09-08 | **1073807364** | Medium |

Note: several **Running** tasks report LastResult **267009** — common for long-lived "still active" tasks; treated as **not** hard failures unless paired with other evidence.

### Historical automation failures (ACTIVE but chronically blocked)

| ID | Status field | Last evidence | Failure mode |
|---|---|---|---|
| `daily-grok-dillon-os-intelligence` | ACTIVE | memory through **2026-08-26** | xAI collector **HTTP 403 + UV_HANDLE_CLOSING**; no payload |
| `bok-facebook-weekly-pdf-scheduler` | ACTIVE | last auto thread **2026-08-25**; weekly Tue 17:00 — next due Tue | Prior run blocked: PDF packet unschedulable / dates past |

---

## Degraded

1. **ACTIVE ≠ running.** Of 13 ACTIVE Codex automations, only `daily-communications-brain` produced an automation thread today. Marketing Chief (09:00), Grok intelligence (07:30), Signal Harbor crypto auto, Immohrtal clock-in, Obsidian guard-dog, Coinbase guardrails, Semrush opportunities, weekly SEO analytics, Puttery build monitor — **no automation-thread evidence today**. Last dense automation activity cluster ends ~**2026-08-26**.
2. **`report-brain-reconciliation`** ACTIVE daily 19:00 — not due yet at observation time; last automation thread **2026-08-25**. Treat as **unverified for today** until after 19:00 ET.
3. **Hermes gateway doc vs live:** `System/gateway-health.md` stuck on Sep 9 STALE-WARN / PID 10180. Live PID 92560 + fresh state at 13:55 ET. Health **log is degraded; process is not.**
4. **Connector health snapshot** (Immohrtal crew detail): `connector-health` status **blocked**, snapshot age **~334h**, usable connectors **0/5** — paid-media lane blocked in crew receipt.
5. **Align-era automations still on the shelf** while Align is confirmed ended (`operating-status.md`) — pause is correct, but they inflate "paused" counts and confuse operators.
6. **`momentum-radar-daily-12`** has **no `status` field** — unmanaged. Task Scheduler twin `Prospect Radar - Next 20 Daily Builder` ran at 05:20 with Result **1**.
7. **Immohrtal agency lease expired** (`IMMOHRTAL-DAY2-…` expired 2026-08-27) — crew still cycles but external actions held.
8. **Claude weekly limit hit** (CONTINUE-HERE) — resets Sep 14 2am ET; daily-driver noop is consistent with budget pressure / no eligible routines.

---

## Unverified

| Item | Why unverified |
|---|---|
| Full success/fail for each of the 13 ACTIVE Codex autos today | Only DC Brain left a fresh automation thread; others may fire without durable thread titles, or may be silently not scheduling |
| `weekly-client-marketing-reports` (Mon 10:00) | No automation thread ever found under that ID; Mon schedule — today is Thursday |
| `puttery-nyc-tock-build-monitor` Codex auto vs TS Puttery tasks | TS Puttery tasks failing (64); Codex auto memory absent |
| `obsidian-guard-dog` / `immohrtal-daily-business-clock-in` / `coinbase-portfolio-guardrails` / `daily-signal-harbor-crypto-intelligence` / `daily-momentum-semrush-opportunities` / `weekly-immohrtal-seo-analytics` | ACTIVE in toml; **zero** matching automation threads in state DB |
| Grok Bot Mohr Media standup/prospect-scan receipts | Accepted per kickoff note; paths not re-opened this pass |
| client-operations schedule files | No `*schedule*/*cron*/*automat*` files found under `client-operations` in this pass |
| `12_Brain/registry/automations.json` "active-scheduled" claims | Registry is aspirational/capability; not cross-checked run-by-run against Codex scheduler |

---

## Totals (roll-up)

| Section | Count |
|---|---:|
| Live (Codex ACTIVE with **today** run proof) | **1** (`daily-communications-brain`) |
| Live (Task Scheduler / local loops OK today) | **~8–12** infrastructure/health tasks (see Live) |
| Paused (Codex PAUSED) | **10** |
| Inactive (Codex) | **1** |
| Failed (TS non-zero today/recent estate tasks) | **≥9** notable |
| Degraded systemic issues | **8** |
| Unverified ACTIVE Codex autos | **12** (13 ACTIVE − 1 proven today) |
| Roster arithmetic correction | **25 dirs**, not 26; **11 non-ACTIVE** = 10 PAUSED + 1 INACTIVE |

---

## Top 5 risks that need Dillon

1. **PSU / unclean power-offs (P0).** Machine unreachable mid-scout twice; 14 unclean power-offs / 30 days. Can wipe uncommitted work and interrupt every schedule. Buy/replace SFF PSU — no software fix.
2. **Codex "ACTIVE" shelf is mostly dark since ~Aug 26.** Only DC Brain is proven firing daily. Marketing Chief briefs, Grok OS intelligence, Obsidian guard-dog, Coinbase guardrails, Immohrtal clock-in, Semrush opportunities, Signal Harbor auto — configured ACTIVE but **no recent automation threads**. Decide: repair scheduler, accept intentional quiet, or pause honestly.
3. **Client-facing pulse automations are paused:** Slack reply watchdog + six-hour email drafter + HubSpot day/night pulse. Combined with connector-health **0 usable / 334h stale**, inbound triage and CRM pulse are on Dillon's eyeballs only.
4. **Puttery Tock path failing now:** `Codex-PutteryNYC-TockDataExports` and `…OperationalStatus` LastResult **64** this afternoon; puttery monitor expires **2026-09-15**. Live client delivery risk.
5. **Momentum360-Daily-Agent-Health failing** (Result **4294770688** at 09:00) + Prospect Radar daily builder Result **1** + MarketingChief SitesBridge Result **1** — agency health/radar/sites sync degrading in parallel with the dark ACTIVE Codex set.

**Not acted on:** no unpause, enable, restart, or mutation performed.

Evidence anchors: live `automation.toml` parse 2026-09-10; `state_5.sqlite` automation threads; Task Scheduler LastRun/LastResult dump; Hermes `gateway_state.json` PID 92560; `claude-daily-driver.json`; `immohrtal-crew/latest.json`; `System/ESTATE-INVENTORY-2026-09-10.md` / `DAILY-PROMPT.md` / `MASTER-ORCHESTRATOR.md` claims checked and corrected.
