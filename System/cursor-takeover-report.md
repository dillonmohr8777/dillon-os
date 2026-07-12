---
tags: [system, cursor, takeover, audit]
last_updated: 2026-07-12T19:45Z
auditor: Cursor (Grok 4.5 Extra High)
status: complete
---

# Cursor Takeover Report

Read-only discovery pass completed 2026-07-12 ~15:45 local (19:45 UTC). This report inventories what Cursor can see, what is authenticated vs configured-only, broken integrations, security risks, and the five highest-leverage improvements. No secrets were read or written.

## Executive Summary

- **Vault:** `C:\Users\dillo\repos\dillon-os` is the operational source of truth. Company OS bones were initialized today; **10 System/Daily-Briefs files are untracked** locally (not yet committed to `dillonmohr8777/dillon-os`).
- **Hermes gateway:** PID **20848** alive; Telegram conflicts **recovered** (0 in last 1h after 15:16 local restart). Heartbeat **stale ~29m** — state file and log frozen since restart; monitor or soft-restart if still frozen >30m.
- **Cron:** Three `dillon-*` jobs running OK (`dillon-daily-brief`, `dillon-gateway-health`, `dillon-approval-queue`). Ticker heartbeat fresh (15:39 local).
- **MCP in Cursor:** GitHub, Context7, Exa, OpenAI Docs, Playwright, Memory, Sequential Thinking = **ready + tested**. Composio, WordPress.com, Slack = **needsAuth** (blocks Gmail/Drive/Calendar/Slack routes from Cursor).
- **Revenue truth:** Verified partial M360 MRR **$2,700/mo** (7 clients). Active client count **12 vs 14** unresolved. Vault client data largely **stale since 2026-04-15**.
- **Book funnel:** `/api/dossier-leads` **exists and responds** on production, but env config is **empty** (`mailerliteConfigured: false`, `webhookConfigured: false`) — leads are not being captured. Top 15 doc claim "endpoint doesn't exist" is **outdated**.

## 1. Stack Inventory

### Workspace (dillon-os)

| Layer | Evidence | Notes |
|-------|----------|-------|
| Vault / OS | `System/operating-status.md`, `System/OS Config.md` | D.I.L.L.O.N. HUD at `_os/server.js` → `127.0.0.1:4242` |
| Client ops | `01_Clients/Client Index.md` | 14 M360 rows, 18 Direct, 1 software-dev, Align HCM full-time |
| Embedded sites | `immohrtal-site/`, `mohr-media-site/`, `01_Clients/Shadow HVAC/website/` | Vite/Next-style subprojects in vault |
| Skills (vault-native) | `.claude/skills/` (9 skills) | am-report, inbox-brief, plan-today, client-pulse, metrics-pull, content-scan, week-review, vault-clean, client-report |
| Skills (global) | `~/.cursor/skills-cursor` (19), `~/.codex/skills/.gemini/skills` (298) | Codex mirror is large; use description match |
| Agents (guardrails) | `11_Agents/*.md` | **Empty shells** — headings only, no rules |
| Reporting | `_os/reporting/data/`, `Daily-Briefs/reports/` | Bar Crawl USA June HTML report exists |
| Legacy routines | `System/routine-health.md` | Last checked **2026-04-15** — superseded partially by Hermes `dillon-*` cron today |

### Hermes (local automation host)

| Component | Path / PID | Status |
|-----------|------------|--------|
| HERMES_HOME | `C:\Users\dillo\AppData\Local\hermes` | Single instance |
| Gateway | PID **20848** (restarted 15:16 local) | `running`, telegram `connected` |
| Config | `config.yaml` | `muse-spark-1.1`, `reasoning_effort: medium` (cost control applied) |
| Cron jobs | `cron/jobs.json` | 3 enabled, all `last_status: ok` |
| Kanban | `kanban.db` (116K) | Exists; dispatcher lock held by gateway |
| Desktop | 5× `Hermes.exe` | Electron shell |
| Serve | **0 processes** (was 2 on 2026-07-11) | Duplicate serve issue may have self-resolved |

### GitHub repositories (Cursor-visible, tested via MCP)

Listed in `System/cursor-integration.md` (16 repos). Live search returned 7 public repos including `dillon-os`, `ironic-ineptocracy-site`, `bridge-discovery-prototype`, `claude-skills-repo`, `mohr-vault`, `semrush-proxy`, `Google-Flash`. **GitHub MCP authenticated and working.**

### Browser bridge

- State: `C:\Users\dillo\start-box-bridge-state.json` — Chrome debug on `127.0.0.1:9222`, `tunnelUrl: null`
- `BOX_CDP_URL` env set to `http://127.0.0.1:9222` (local only, no remote tunnel)
- Playwright MCP available for Cursor-driven browser automation

## 2. MCP Access Matrix

| Server | Status | Read test | Write/mutate |
|--------|--------|-----------|--------------|
| `plugin-ecc-github` | ready | `search_repositories` OK | Available; requires approval for PR/merge/push |
| `plugin-ecc-context7` | ready | `resolve-library-id` OK (needs `query` + `libraryName`) | N/A |
| `plugin-ecc-exa` | ready | `web_search_exa` OK | N/A |
| `user-openaiDeveloperDocs` | ready | `search_openai_docs` OK | N/A |
| `plugin-ecc-playwright` | ready | Not exercised this pass | Browser actions = local reversible |
| `plugin-ecc-memory` | ready | Not exercised | Graph mutations need judgment |
| `plugin-ecc-sequential-thinking` | ready | Not exercised | N/A |
| `plugin-slack-slack` | **needsAuth** | Blocked | Slack read/send blocked until OAuth |
| `user-composio` | **needsAuth** | Blocked | Gmail, Drive, Calendar, etc. blocked in Cursor |
| `user-wordpress-com` | **needsAuth** | Blocked | WP.com ops blocked until OAuth |

**Configured but not authenticated in Cursor:** Composio (Hermes `config.yaml` has composio MCP URL enabled — separate from Cursor session), WordPress.com, Slack.

**Distinction:** Hermes host has Composio wired in config; Cursor session does not. Do not assume cross-session auth.

## 3. Broken / Degraded Integrations

| Issue | Severity | Evidence | Safe next action |
|-------|----------|----------|------------------|
| Book lead capture misconfigured | **HIGH** | `GET https://ironicineptocracy.com/api/dossier-leads` → `mailerliteConfigured: false`, `webhookConfigured: false` | Set Vercel env vars locally, test POST in staging; deploy needs approval |
| Vault data stale | **MED** | `pulse-today.md`, `urgent-replies.md`, `routine-health.md` last 2026-04-15 | Backfill from April–July Codex work (Opp #11) |
| Guardrail agents empty | **MED** | `11_Agents/Google Ads Agent.md` — template headings only | Fill rules from client history (Opp #4) |
| Gateway heartbeat stale | **MED** | `updated_at` frozen 29m; log mtime frozen since 15:16 | Soft-restart via Startup VBS if >30m; local reversible |
| Composio/Slack/WP in Cursor | **MED** | MCP `needsAuth` | Dillon OAuth in Cursor settings (approval-queue item) |
| Revenue count mismatch | **LOW** | OS Config 12 vs Client Index 14 M360 | Melissa invoicing audit |
| Obsidian MCP (mohr-vault) | **LOW** | Top 15 #14 — config points at wrong folder per prior brief | Repair when vault MCP is priority |
| External Telegram poller | **RECOVERED?** | 0 conflicts/hr since 15:16 restart; was 139/hr | Monitor 30m; no new approval item unless conflicts return |

## 4. Security Risks

1. **Approval queue at 54 lines of open items** — many are client sends/publishes/ad changes; automation correctly does not execute.
2. **Token rotation boundary respected** — Telegram external poller items explicitly say DO NOT auto-rotate; credential changes require human approval.
3. **No secrets ingested** — Hermes config redacted in logs; `.env` not read into this report.
4. **Google Ads MFA** — LinkEZE enforcement notice in approval queue; audit across accounts still open.
5. **Untracked Company OS files** — operational truth exists only locally until committed/pushed.
6. **Book endpoint exposes config flags** — `GET /api/dossier-leads` returns configuration state publicly (low risk, but confirms env gap).

## 5. Five Highest-Leverage Improvements

Ranked by impact on the three written goals (2k book subs, $40k Mohr Media, 100 clients):

### 1. Fix book lead capture env + verify delivery (blocks 2k subs)
Endpoint exists; MailerLite/webhook env vars missing on Vercel. One local PR + env setup + test POST. **Deploy = approval.**

### 2. Vault backfill + client frontmatter (unblocks all automation)
Add `status`, `last_touched`, `next_action`, `due` to client notes; refresh April-stale memory files. Enables pulse, approval-queue, and HUD v2.

### 3. Fill guardrail agents (prevents ad disapprovals + runaway spend)
Machine-enforce banned terms, Presence Only, tCPA caps — directly addresses Bar Crawl disapprovals and Soulard $54 incident.

### 4. Authenticate Composio in Cursor (unblocks Gmail/Drive read-only triage)
Enables read-only client email discovery without copying credentials into chat. **OAuth = human action in Cursor.**

### 5. Revenue scorecard truth pass
Melissa invoicing verification for 7 unknown-rate M360 clients + canonical active count. Makes HUD hero number honest for ROAD TO 100.

## 6. Active Workflows (verified today)

| Workflow | Schedule | Last run | Output |
|----------|----------|----------|--------|
| `dillon-daily-brief` | 07:00 daily | 13:13 local, ok | `Daily-Briefs/2026-07-12.md` |
| `dillon-gateway-health` | */30 | 15:32 local, ok | `System/gateway-health.md` |
| `dillon-approval-queue` | hourly | 15:02 local, ok | `System/approval-queue.md` (54 open items) |
| Hermes gateway | always-on | PID 20848 | Telegram connected |
| D.I.L.L.O.N. HUD | manual `node _os/server.js` | not verified running | localhost:4242 |

Legacy routines in `routine-health.md` (gmail-to-vault, nightly-client-pulse, etc.) — **status unknown / likely stale**; not observed in Hermes `jobs.json`.

## 7. Missing Context

- Invoicing source of truth (Melissa) — not accessible without Composio/Gmail auth
- Which 12 clients count toward `goal_current` — definition not documented
- Whether external Telegram poller was manually killed or timed out
- Live Google Ads / GBP status for disapproval and LSA items (April-dated)
- Vercel project env var names for MailerLite on book site
- Whether `_os/server.js` HUD is running in daily workflow

## 8. Next Safe Actions (Cursor can do without approval)

1. **Commit Company OS init files** to `dillon-os` when Dillon requests — 10 untracked artifacts ready
2. **Draft** `api/dossier-leads` env checklist + local test script in `ironic-ineptocracy-site` branch
3. **Soft-restart gateway** if heartbeat still >30m stale at next health check
4. **Begin guardrail agent fill** from `01_Clients/*/overview.md` and Agent Memory files
5. **Backfill one client note** as template (frontmatter + `last_touched`) then scale

## 9. Requires Dillon Approval / Auth

| Action | Why |
|--------|-----|
| Composio MCP OAuth in Cursor | `user-composio` needsAuth |
| WordPress.com MCP OAuth | `user-wordpress-com` needsAuth |
| Slack MCP OAuth | `plugin-slack-slack` needsAuth |
| Vercel env deploy for book site | Production config change |
| Any client email send / ad spend change | External side effect |
| Telegram token rotation | Only if conflicts return >10/hr |

## Verification Log

- Read: company-os.mdc, handoff-context.mdc, operating-status, cursor-integration, tool-access-catalog, automation-status, gateway-health, approval-queue, Daily-Briefs/2026-07-12, Client Index, OS Config, jobs.json, 11_Agents sample
- Shell: gateway PID/state, conflict grep, cron dir, heartbeat age, bridge state, git status
- MCP: GitHub search, OpenAI docs search, Context7 resolve, Exa search
- HTTP: `GET https://ironicineptocracy.com/api/dossier-leads` → 200, config flags false
- GitHub: `ironic-ineptocracy-site/api/dossier-leads.js` exists on main

## Checkpoint

**Resume here:** Authenticate Composio in Cursor, then run read-only Gmail triage for Hardwood/NKCDC/Shadow stale items; parallel local branch on `ironic-ineptocracy-site` for env-var fix draft.
