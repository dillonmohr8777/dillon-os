# Codex Session Sync — 2026-08-07 (Run 2)

**Tier:** 0 read-only scout  
**Sources read:** `11_Agents/Next Codex 64GB Orchestrator Handoff 2026-07-08.md`, `11_Agents/64gb Morning Orchestrator Spec 2026-07-08.md`, `handoffs/Morning Loop Scheduled Agent Setup.md`, `GROK-HANDOFF-DILLON-OS.md`, `00_Inbox/Automation Deep Analysis 2026-07-29.md`, `00_Inbox/Top 15 Opportunities 2026-07-02.md`, `12_Brain/entities/{Codex Workspace (Legacy),King Agent OS,Hermes}.md`, `10_Sessions/` (sparse), Run 1 lane output, automation memory.

---

## Umbrella blockers (what still stops the competitive workflow)

| Blocker | Severity | Why it blocks |
|---|---|---|
| **Gmail + Slack MCP unavailable** (Run 2, same as Run 1) | P0 | `gmail-intel` and `slack-intel` fall back to vault mirrors; boss/client ask ages are minimum 8d and email intel is Apr 2026 on overviews |
| **Codex Slack connector `oauth_refresh_token_rejected`** | P0 | Codex-side live Slack read still dead per `handoffs/windows-6gb-slack-codex-reauth-2026-07-22.md`; separate from browser Slack session |
| **76 open PRs / duplicate orchestrator runs** | P0 | `GROK-HANDOFF-DILLON-OS.md`: do not add another daily umbrella PR until `#260` family is collapsed; operator noise blocks merge confidence |
| **Legacy 7 crons not disabled** | P1 | Automation memory: disable after **2 verified runs** — only **1/2** complete (2026-08-06); risk of double morning briefs |
| **`01_Clients/*/overview.md` `last_touched` frozen Apr 2026** | P1 | Root client notes repaired to 2026-07-29 (`frontmatter-validate`: 38/38 complete) but **overview Gmail intel sections** still stale — competitive ranking uses wrong ages |
| **Book capture `/api/dossier-leads` dead** | P1 | Site-health sentinel FAIL on fixture; live book site skipped in dry-run — blocks 2,000-subscriber target entirely |
| **Mac activate path (Netlify token + mail vendor)** | P1 | `automations.json` gates: `netlify_deploy_token` pending-secret, `mail_vendor` pending-decision, `outreach_send` hard-blocked |
| **64GB Tier-1 Chrome batch not in repo** | P2 | Morning Orchestrator Spec defines CDP parallel execution + Optimization Ledger — no `automation-runs/morning-orchestrator/`, no `Optimization Ledger.md` under clients, no `claude-skills-repo` skill tree in vault |
| **Report data fetchers missing** | P2 | `_os/reporting/build-report.js` renders JSON only; per-client Google Ads / Meta / GA4 / GBP pullers still open (Opp #5, Automation Deep Analysis W5) |
| **Obsidian Sync + CLI gate** | P2 | `obsidian_sync_cli` pending-human — desktop `12_Brain` and cloud registry remain two brains |
| **Hermes orphaned** | P3 | 12 cron jobs on retired machine; Slack `invalid_auth`; decision: rebuild vs let vault loops replace |

---

## Durable open loops from Codex

| Item | Source | Vault tracks? | Run 2 status |
|---|---|---|---|
| 8-lane commander + bounded workers | Codex 64GB Handoff §Delegation | Yes — `competitive-task-orchestrator` + `.cursor/agents/*` | **Absorbed** for Tier 0 scouts; Tier 1 Chrome execution **not** |
| 28 Codex automations → vault schedules | Top 15 Opp #12 | Partial — `12_Brain/registry/automations.json` | Wave 1–2 done; live Gmail/Slack hourly triage, King Agent money run, vault dumps **not** scheduled |
| Book form dead | Top 15 Opp #1 | Yes — `site-health-sentinel`, `properties.json` | **Unresolved** — still FAIL |
| Client reporting factory | Top 15 Opp #5, Codex workflow #5 | Partial — CLI + skills | Fetchers **missing** |
| Mac site-factory activate | Automation Deep Analysis O1–O4 | Partial — templates + qualify scorer in repo | Blocked on Jesse sheet, Netlify secret, PostGrid vs StackAdapt |
| King Agent morning / money run | King Agent OS entity | Patterns → `/am-report`, `/plan-today` | **Unified** into competitive-task-orchestrator |
| Sunday Momentum + Align orchestrator | Codex Handoff workflow #8 | Referenced in handoffs | **Not** in daily cron; Align calendar blockers (July Maher/SmartCare assets) still noted in handoff, unverified |
| Optimization Ledger hypotheses | 64GB Morning Spec §Learning Loop | No | **Not ported** — no ledger files under `01_Clients/` |
| Paid-media client map reconciliation | Codex Handoff §Scaling Ads | Partial in overviews | Fagan/KJB Google Ads status, Shadow≠Google unless proven — **needs live UI** |
| Local-only worktree 623 entries | GROK-HANDOFF §Local-only state | No | Recovery source only; **not** merge-ready |
| Guardrail / pre-flight enforcement | Top 15 Opp #4 | Partial — `11_Agents/*` shells **filled** since July | D4 creative guardrail automation still open |
| Revenue scorecard | Top 15 Opp #9 | No unified HUD number | Fragmented; `metrics-pull` not wired to weekly board |
| Obsidian MCP second brain | Top 15 Opp #14 | Dead config noted | Still orphaned; vault uses Git + skills instead |
| Morning Loop scheduled agent (6:45 ET) | `handoffs/Morning Loop Scheduled Agent Setup.md` | Superseded by competitive-task | Old prompt references separate PR branch flow — **operator should confirm only one cron is active** |

---

## Consolidation status

| Layer | Status | Notes |
|---|---|---|
| **competitive-task-orchestrator** | Run 2 in progress (`run-state.json`: running) | Branch `cursor/competitive-task-consolidation-bfa6`; replaces 7 legacy crons on paper |
| **Registry (`automations.json`)** | Updated 2026-08-06 | Frontmatter validate/repair, site-health, qualify, grok-ingest marked `implemented` |
| **PR #226 site-factory** | Consumed in repo | `_templates/site-factory/` present; dependency doc still references merge — treat factory as **on branch**, not a rebuild target |
| **PR #260 umbrella** | In flight | Grok handoff: canonical orchestrator; close duplicate daily-run PRs after harvest |
| **64GB morning-orchestrator** | Spec only | Companion to Codex handoff; **no runtime artifacts** in vault — local-machine execution contract |
| **King Agent OS** | Legacy patterns ported | SMS draft-only, approval queue → competitive brief + tier gates |
| **Hermes / Codex Workspace** | Legacy | Entity pages mark retired; do not route new work there |
| **Frontmatter repair** | **Done** (38/38) | Root `01_Clients/*.md` keys present; **overview intel sections** still need live backfill |
| **Slack inbox mirror** | Stale | 4 notes in `00_Inbox/slack/`, all `status: new`, last capture 2026-07-30 |

---

## Port candidates (high-value Codex lanes not yet daily)

1. **Per-client metrics-pull → weekly revenue scorecard** (Opp #9) — unblocks honest HUD / competitive scoreboard.
2. **Grok/xAI daily bridge** — `grok-intelligence-ingest` + `xai-daily-search` implemented in registry but depend on `xai-api-credit` + `dpapi-secret` (local/operator gates).
3. **Reporting data fetchers** for ~8 M360 retainers + Align (biggest recurring manual load).
4. **64GB Tier-1 batch executor** — CDP tab-per-client, `tier1-batch.json`, ledger append — only on 64GB machine with logged-in Chrome.
5. **Hourly Gmail client-reply triage** — Codex cron pattern; draft-only; needs Gmail MCP or Codex connector healthy.
6. **Stage-8 learn ledger** for Mac outreach (batch results → qualify score tuning) — after O3–O4 activate.

**Already absorbed (do not re-port):** slack-intake, am-report synthesis, client-pulse, content-scan (Thu), plan-today morning block, codex-session-sync scout, domain-ads-seo sentinel fixtures.

---

## Connector health

| Connector | State | Evidence |
|---|---|---|
| **Cursor Slack MCP** | Unavailable Run 2 | `slack-intel` lane output 2026-08-07 |
| **Cursor Gmail MCP** | Unavailable Run 2 | Run 1 brief + agent fallbacks |
| **Codex Slack plugin** | Broken | `oauth_refresh_token_rejected` — `handoffs/windows-6gb-slack-codex-reauth-2026-07-22.md` |
| **Hermes Slack** | Historical `invalid_auth` | `12_Brain/entities/Hermes.md` |
| **Gmail (Codex connector)** | Unverified this run | Communication Intelligence SOP claims primary mailbox; no live proof in cloud |
| **Netlify deploy** | Gated | `netlify_deploy_token` pending-secret; Netlify credits suspension note 2026-07-30 |
| **Book form endpoint** | Broken | `/api/dossier-leads` missing — site-health FAIL |
| **LandingFolio MCP** | Sandbox-only | `LANDINGFOLIO_TOKEN` + Inspector gate |
| **Obsidian MCP (mohr-vault)** | Dead | Top 15 Opp #14 — wrong path, placeholder key |
| **Chrome CDP / Plugin** | Local-only | 64GB handoff; not available in cloud scout |

---

## Session patterns (durable, worth preserving)

1. **One commander, one push** — commander owns board + approval queue; Dillon touches once (64GB spec steps 1–5 unattended, step 6 approval).
2. **Scout before build** — Tier 0 read-only lanes fan out before any write; matches competitive-task subagent design.
3. **Structured worker return** — JSON handoff (`lane`, `verified_facts`, `blockers`, `approval_required`) in Codex handoff; mirrored in `.cursor/agents/*` lane outputs.
4. **Draft-first outbound** — Gmail send, Slack post, ads writes, deploys = Tier 2; ingestion never posts.
5. **Evidence beats memory** — verify client deliverables against live UI/artifacts; vault mirrors labeled when MCP down.
6. **Run folders** — `automation-runs/<workflow>/YYYY-MM-DD/` with `run-state.json`, lane outputs, approval artifacts.
7. **Gmail > Slack for truth** — approvals, dates, access proof live in Gmail threads; Slack is intake/triage.
8. **Parallel only when safe** — one tab = one client = one ads account; never two writers same target.
9. **Session archives elsewhere** — `10_Sessions/` nearly empty; Codex history on operator machine (`10_Sessions/Codex/`, `.codex/memories/`) not visible to cloud scouts.
10. **Bridge-style sessions** — when evidence is cross-channel (Gmail + Slack + Drive), compile one decision package before build (see `10_Sessions/Bridge Software Development - 2026-07-11.md`).

---

## Recommended vault backfill (operator / memory-consolidator)

1. **After Gmail MCP auth:** refresh `01_Clients/*/overview.md` Gmail intel + `last_touched` from live threads (root notes already 2026-07-29).
2. **After Slack MCP auth:** run `/slack-intake`, set `00_Inbox/slack/*` to `status: filed` or `replied` when drafts exist; add `Daily-Briefs/slack-intake-2026-08-07.md`.
3. **Codex desktop:** run Slack reauth checklist in `handoffs/windows-6gb-slack-codex-reauth-2026-07-22.md` (do not copy tokens between machines).
4. **Close PR duplicate queue** per Grok handoff before Run 3 adds another umbrella branch.
5. **Disable 7 legacy morning crons** in Cursor UI after Run 2 consolidator verifies `Daily-Briefs/competitive-task-today.md`.
6. **Book site:** fix `/api/dossier-leads` (Opp #1) before any subscriber-growth work surfaces on the competitive board.
7. **Add `10_Sessions/Codex/` index** when operator resumes mining `.codex/session_index.jsonl` into vault (handoff §Session History).

---

## Cross-lane alignment (Run 2)

- **slack-intel** (same day): 4 inbox notes unchanged, 8d+ ages — consistent with stale mirror.
- **domain-ads-seo** (same day): book form failure mode confirmed in sentinel fixtures.
- **vault-pulse** (pending Run 2): expect same P0 roster until overview backfill.
- **memory-consolidator:** should carry connector gaps into `run-state.json` `mcp_gaps` and today's brief header.
