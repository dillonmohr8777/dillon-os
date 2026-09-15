---
note_type: reference
status: compiled
created: 2026-09-10
updated: 2026-09-10
owner: Dillon Mohr
verification_status: verified
observed_at: 2026-09-10
source_type: filesystem enumeration
tags: [estate, automation, agents, skills, inventory]
---

# Estate Inventory — 2026-09-10

Read-only filesystem enumeration of Dillon Mohr's agentic estate on this machine.
Every path below was verified to exist and was read (frontmatter, first ~20-30
lines, or full for small config files) at compile time. This is a snapshot, not
a living document — re-run the enumeration before trusting dates as current.

---

## 1. Dillon OS automation — `C:\Users\dillo\repos\dillon-os\_os\automation`

### 1.1 `workflows\` (2 files)

| Path | What it does | Invoked by | Status |
|---|---|---|---|
| `workflows\daily-communications-brain.json` | Sequential workflow spec: pulls Gmail/Slack evidence, routes to canonical clients, redacts, writes an ingest envelope. Steps: verify_context → discover_sources → ... | Codex automation `daily-communications-brain` (cron, daily 07:00, ACTIVE) references this file by path in its prompt | Live, actively scheduled |
| `workflows\report-brain-ingest.json` | Sequential workflow spec: resolves a finished client report to one canonical client route, validates the envelope, archives it into the vault without implying delivery | Codex automation `report-brain-reconciliation` (cron, daily 19:00, ACTIVE) | Live, actively scheduled |

### 1.2 `bin\` (40 executable scripts, Node/Python/PowerShell)

Selected by recency and role (full listing on disk; not all 40 detailed here):

- `claude-loop.js` (41.6 KB, Sep 2) — largest/newest core driver; orchestrates a Claude run loop.
- `agent-craft-brief.js` (16.6 KB, Sep 2), `connector-health.js` (Sep 2), `queue-status.js` (Sep 2) — reliability/status layer, paired with `reliability-scout` subagent and its test files.
- `radar-refresh.js` (27 KB, Sep 5), `harvest-sessions.py` (Sep 3) — prospect radar refresh pipeline (feeds `momentum-radar-daily-12`).
- `outreach-ledger.js` (Sep 3), `outcome-graph.js` (Aug 24), `reconcile-momentum-estate.js` / `plan-momentum-estate-waves.js` / `render-momentum-logo-candidate-review.js` (Aug 24) — Momentum-estate/prospect-batch tooling, all same day (Aug 24) as a large `lib\outcome-graph-*.js` family (below) — looks like one concentrated build sprint.
- `build-radar-report.py` (41.6 KB, Aug 17) — oldest large file, unmodified since the Aug 17 baseline commit; everything else in `bin\` at Aug 17 17:51 is that same baseline.
- `radar-morning.ps1`, `xai-research.ps1` — the only two `.ps1` files in `bin\` (everything else is `.js`/`.py`); both from the original Jul 30/Aug 17 baseline.

### 1.3 `lib\` (60+ modules)

- Core baseline (Aug 17, unchanged since): `brand.js`, `clients.js`, `contacts.js`, `net.js`, `netlify.js`, `opportunity.js`, `scorer.js`, `sentinel.js`, `site-audit.js`, `site-grader.js`, `places.js`, `indeed-api.js`, `workshop-calendar.js`, `direct-mail.js`.
- **`outcome-graph-*` family** (18 files, 22 KB–83 KB each, ALL dated Aug 24 in a single afternoon: 17:20–20:29): `outcome-graph.js`, `-audit`, `-canary`, `-command-comms`, `-durable-canary`, `-foundation`, `-governance`, `-outreach-state`, `-paid-media`, `-performance`, `-reliability`, `-routine-catalog` (76.8 KB, the largest file in the entire `lib\` tree), `-source-bound`, `-state`, `-web-design`, `-web-design-canary`, `-website-factory`, `-weekly-shadow`, `-weekly-tranche`. This is a large, self-consistent state/governance subsystem for tracking automation outcomes — built in one sprint, not touched since Aug 24. No workflow or `bin\` script found calling into more than a couple of these directly in this pass; worth a follow-up grep to confirm live wiring before assuming the whole family is load-bearing.
- Sep-dated (actively maintained): `communications.js` (Sep 8), `discovery.js` / `harvest-images.js` / `harvest-lite.js` / `imagery.js` / `logo-eligibility.js` / `radar.js` / `radar-dashboard.js` (83 KB, largest active file) — all Sep 5, feeding the prospect-radar and logo-candidate pipeline.
- `adapters\` subfolder: only 2 files — `indeed-signal.js`, `maps-prospect.js` (both Aug 17 baseline, untouched).

### 1.4 Other `_os\automation\` subdirectories

| Dir | What it is |
|---|---|
| `assets\` | Single static asset: `needmomentum-mark.png` |
| `brand-video-style\` | Active reference pack for a video-style project (Sep 9): README, a teardown note (`X-LIKES-TEARDOWN-2026-09-09.md`), 8 reference PNGs (paper-craft/engraving mood board) |
| `docs\` | `CURSOR-HANDOFF.md`, `OPERATOR.md`, `RADAR-SETUP.md` — operator-facing docs, Aug 17 baseline |
| `evidence\` | Single file `VERIFICATION.md`, Jul 30 |
| `fixtures\` | Test/sample data: `clients\`, `communications\`, `grok\`, `harvest\`, `mcp\`, `prospects\` (CSV/JSON prospect samples, Sep 8), `sites\`, `workflows\` |
| `google-ads-api\` | **New, Sep 10 (today).** `SETUP-2026-09-10.md` + `pulls\` (60 JSON pull files — campaigns, ad strength, change events, conversions, geography, keywords, landing pages, quality scores — per account: KimberlyJames, Nexla, Omega, Onsite, plus shared). This is the on-disk output of the `GoogleAdsProbe` scripts (§6) and is being actively written today. |
| `google-ads-daily\` | Active runbook set (Sep 9): `GOOGLE-ADS-DAILY-RUNBOOK.md`, `GOOGLE-ADS-REVIEW.md`, `INTAKE-REVIEW.md`, `OMEGA-RESTART-RECEIPT.md`, `OPERATING-REVIEW.md`, `PROVENANCE.md`, `RADAR-RUNBOOK.md`, plus `radar-state.mjs` + its test, and a `work\` subdir with dozens of dated JSON checkpoint files running through Sep 5–9 (frequent, ~15-30 min cadence intraday) |
| `incoming\` | Drop folders: `communications\`, `grok\`, `reports\` — landing zone consumed by the two workflows in §1.1 |
| `paper-craft-video\` | Active HyperFrames-style video project (Sep 9-10, still being touched — `build.mjs` last modified 02:39 today, receipts as recent as 02:57 today): README, STYLE-CONTRACT.md, `assets\`, `build\`, `plates\`, `projects\`, `receipts\` (5 dated JSON receipts through Sep 10 02:46) |
| `profiles\` | 2 JSON profiles: `daily-x-research.json`, `site-factory-default.json` (Aug 17 baseline) |
| `tests\` | ~20 `.test.js` files, Node's built-in test runner (`node --test`), one per major `lib\` module including the full `outcome-graph-*` family and `communications.js`/`logo-eligibility.js` (Sep-dated, kept in sync with the modules they cover) |

---

## 2. `11_Agents\` — agent playbooks and orchestration specs

| Path | What it is | Status |
|---|---|---|
| `Master Agent.md` | Markdown "commander" role spec: routes work, keeps run state, assembles approval board. Aug 17 baseline. | **Likely superseded** — see §7 |
| `Google Ads Agent.md`, `Reporting Agent.md`, `SEO Agent.md`, `Web Agent.md` | Frontmattered role specs (`last_updated: 2026-07-12`), each naming current client lanes (e.g. Google Ads Agent: KJB, Omega, Onsite, Shadow, Replenish, Fagan, Capsule & Tonic). File mtime Aug 17 (bulk copy), content date Jul 12. | **Stale relative to Sep 9 operating plan** — see §7 |
| `Daily Learning Loop (Local).md` | Local twin of a cloud routine (`trig_0147wYE44A32VYGkixrX31B9`); reads the live machine instead of only `origin/main`. Sep 3, current. | Live |
| `OPERATING-PLAN-2026-09-09.md` | Current, dated `status: active`, authored 2026-09-09 — the newest and most authoritative doc in this folder; explicitly critiques predecessor automations (drives the redesigned `.claude/agents` subagents in §4). | **Canonical / current authority** |
| `claude-operating-team.json` (415.8 KB) | Generated (`System\scripts\Build-ClaudeOperatingTeam.py`) machine-readable spec: "Executable Claude-native reconstruction of the Grok Bot operating team... clones capability, never authority." Defines `delegated-autonomy-v1-2026-08-12` scope (Tier 0/1 unsupervised, Tier 2+/external/canonical-write excluded). Aug 18. | Reference/generated artifact |
| `claude-stage-discrepancy-ledger.json` | Small evidence-chain doc resolving a specific arithmetic question ("does 486 mean 214 stages are missing?" → resolved, no, different units). Aug 18. | Closed/historical |
| `Rockbot Operating System\` | Knowledge pack ("Claude-readable copy of operating knowledge Dillon taught... for Rockbot, also called Grok Bot"). Contains `00-CLAUDE-START-HERE.md`, `INDEX.md`, `README.md`, `PROMPT-FOR-CLAUDE.md`, `SYNC-MANIFEST.json`, `Sync-RockbotKnowledge.ps1`, and subdirs `evidence\`, `recorded-training\`, `recordings\`, `research-intake\`, `training-simulator\`, `workflow-estate\`. Refreshed via `Sync-RockbotKnowledge.ps1` per the global CLAUDE.md instruction. | Reference layer, sync-maintained |
| `64gb Morning Orchestrator Spec 2026-07-08.md` | Named/dated spec file, Jul 8 — oldest doc in the folder. | Historical/likely superseded by OPERATING-PLAN-2026-09-09 |

---

## 3. `System\scripts\` (22 files, mostly PowerShell + 2 Python)

| Path | Role |
|---|---|
| `Build-ClaudeAgents.py` (39.6 KB, Aug 27) | Generator — builds the `.claude/agents/*.md` subagent definitions (§4) |
| `Build-ClaudeOperatingTeam.py` (35.1 KB, Aug 18) | Generator for `11_Agents\claude-operating-team.json` |
| `Invoke-ClaudeDailyDriver.ps1` (28.7 KB, Sep 2) + `Test-ClaudeDailyDriver.ps1` (Sep 4) | Largest active pair — the daily driver invocation + its test |
| `Invoke-ClaudeLoop.ps1` (Sep 2) | Thin wrapper, pairs with `bin\claude-loop.js` |
| `Invoke-ImmohrtalCrew.ps1` (23.5 KB) / `Register-ImmohrtalCrewTask.ps1` / `Test-ImmohrtalCrew.ps1` (Aug 26-27) | IMMOHRTAL Marketing Solutions (Dillon's other/former business identity — distinct signature/mailbox, called out explicitly in the `weekly-client-marketing-reports` automation prompt in §5) |
| `Measure-SecondBrainGraph.ps1`, `Test-SecondBrain.ps1` (Sep 2), `Update-SecondBrainMaps.ps1`, `Update-SecondBrainHealth.ps1`, `Update-KnowledgeCoverage.ps1`, `Update-ClientIntelligenceCoverage.ps1` | Vault-health tooling — `Test-SecondBrain.ps1` is the one named in the global CLAUDE.md as the required health check |
| `Test-ClaudeInvariants.ps1` (32.7 KB), `Test-ClaudeOperatingTeam.ps1`, `Test-ExposedAgents.ps1`, `Test-ClaudeBrowserCanary.ps1` | Test/verification suite around the Claude agent + operating-team generators |
| `Start-ClaudeLocalBrowser.ps1`, `Sync-AndTest-AgentVault.ps1` | Utility launchers |
| `refresh-gateway-health.ps1` (Jul 12) + `tmp_gateway_check.py` (Jul 31) | Oldest / smallest — look like one-off diagnostics rather than a maintained pair |

---

## 4. Skills — dillon-os-local and global

### 4.1 `dillon-os\.agents\skills\` and `dillon-os\.claude\skills\` (25 skills, near-duplicates)

Both trees hold the same 25 skill folders (`am-report`, `automation-ops`, `brain-capture`, `brain-compile`, `brain-review`, `client-pulse`, `client-report`, `content-scan`, `frontend-build`, `inbox-brief`, `metrics-pull`, `mirror-and-improve`, `motion-design`, `operating-team`, `plan-today`, `research-sweep`, `session-mine`, `site-batch`, `site-factory`, `site-grade`, `slack-intake`, `synthesize`, `ui-design`, `ux-audit`, `vault-clean`, `vault-compile`, `week-review`, `wiki-lint`) — one `SKILL.md` each, project-scoped Dillon OS operating skills (distinct from the global `~\.claude\skills` skill library in §4.2, and distinct from `~\.codex\skills`).

`diff -rq` shows the two trees are **not identical**: `client-report`, `mirror-and-improve`, `operating-team`, `site-batch`, and `vault-clean` differ between `.agents/skills` and `.claude/skills`, and `.claude/skills` has one extra skill — `fable-advisor` — not present in `.agents/skills`. This is most likely intentional (Codex reads `.agents/skills`, Claude Code reads `.claude/skills`, and `fable-advisor` — which dispatches the Fable model via the Claude-specific Agent tool — cannot exist in the Codex-facing tree) but the five diverging files should be spot-checked to confirm the drift is deliberate and not accidental fork.

### 4.2 `C:\Users\dillo\.claude\skills\` (global, ~90 skill directories)

Large installed skill library spanning: design/creative (`anti-ui-slop`, `client-deck`, `client-logo`, `framer`, `framer-code-components`), video (`general-video`, `hyperframes` + 6 satellite `hyperframes-*` skills, `motion-graphics`, `media-use`, `video-analyze`), Google Ads (`google-ads-audience-segmentation`, `google-ads-audit`, `google-ads-ppc-waste-finder`), plus a helper script `build-skills-reference.py`. Several (`client-deck`, `client-logo`, `google-ads-*`) carry their own `node_modules\`, `LICENSE`/`NOTICE`/`PIN.json` — installed third-party plugin skills, not hand-authored.

### 4.3 `C:\Users\dillo\.codex\skills\` (489 top-level directories)

This is a large, mostly third-party/marketplace skill collection (`.claude-plugin\marketplace.json`, `.codex-plugin\plugin.json`, `.gemini\skills-index.json` present at the root — i.e. this tree is itself a multi-harness skill-plugin distribution, not a curated Dillon list). Given the volume (489 dirs), this pass did not open each one; a representative sample (`a11y-audit`, `ab-test-setup`, `ab-testing`, `account-structure-audit-google-ads`, `account-triage-google-ads`, `ad-creative`, `ads`) matches the pattern of individually-licensed marketing/dev skills (each with its own `SKILL.md`, `references\`, `scripts\`, sometimes `evals\`). Treat this directory as a bulk-installed library, not a bespoke build — if an orchestrator needs to know "which skills are actually Dillon's own," look at `.claude/skills` (§4.2) and the dillon-os project skills (§4.1) instead.

### 4.4 `C:\Users\dillo\.claude\agents\` (17 subagent definitions)

All read via frontmatter. Generated by `System\scripts\Build-ClaudeAgents.py` (§3).

| name | model | tools (summary) | one-line description |
|---|---|---|---|
| `marketing-chief` | opus | Read/Grep/Glob/Bash/Edit/Write/Agent/TodoWrite/Web*, composio | Orchestrator/triage for Dillon OS; owns Command dept, delegates to lane agents |
| `brain-curator` | sonnet | Read/Grep/Glob/Bash/Edit/Write/Web*, composio | Keeps 12_Brain knowledge layer correct — capture, compile, hygiene, mining, weekly synthesis |
| `client-conversion` | sonnet | Read/Grep/Glob/Bash/Edit/Write/Web*, composio | Daily conversion push, priority clients (Omega first); never contacts clients or edits live campaigns |
| `client-success-advisor` | sonnet | Read/Grep/Glob/Bash/Edit/Write/WebFetch, composio | Onboarding prep, health signals, retention risk, roster/separation audits |
| `content-producer` | opus | Read/Grep/Glob/Bash/Edit/Write/Web*, Claude_Browser (nav/read/computer/text/find), composio | Ad creative, brand video, motion graphics, logo stings, design drafts — drafts only |
| `cross-reference` | sonnet | Read/Grep/Glob/Bash/WebFetch/ToolSearch, composio | Reconciles Slack/email/approval-queue; runs automatically on session open; read-only |
| `email-outreach` | sonnet | Read/Grep/Glob/Bash/Edit/Write/Web*, composio | Personalized prospect emails in Dillon's HTML signature (non-Apollo reachable only); drafts, never sends |
| `growth-content` | opus | Read/Grep/Glob/Bash/Edit/Write/Web*, Claude_Browser, composio | SEO/AEO/GEO, content production, CRO experiments |
| `hubspot-tracker` | sonnet | Read/Grep/Glob/Bash/WebFetch/ToolSearch, composio | Daily CRM read — what actually changed, not "degraded" noise; read-only |
| `job-search` | sonnet | Read/Grep/Glob/Bash/Edit/Write/Web*/ToolSearch, composio | North-star lane: role discovery, fit scoring, tailored application drafts — drafts only |
| `paid-media-analyst` | opus | Read/Grep/Glob/Bash/Edit/Write/Web*, composio | Google/Meta Ads, attribution, client performance reporting; read-only on ad accounts |
| `prospect-intelligence-scout` | sonnet | Read/Grep/Glob/Bash/WebFetch/WebSearch, composio | Ad-hoc prospect source intelligence pre-build/outreach; never builds/drafts/contacts/mutates |
| `qa-critic` | opus | Read/Grep/Glob/Bash/WebFetch, Claude_Browser | Independent QA/release criticism — deliberately separate from web-product-builder |
| `reliability-scout` | sonnet | Read/Grep/Glob/Bash/Edit/Write/WebFetch, composio | Watches the autonomous layer: scheduled tasks, routine failures, circuit breakers |
| `revenue-ops-analyst` | opus | Read/Grep/Glob/Bash/Edit/Write/Web*, composio | Revenue truth, invoice evidence, reporting integrity, capacity signals |
| `skill-selector` | haiku | Read/Grep/Glob only | Picks the minimal skill set for a task; read-only, never runs skills |
| `web-product-builder` | opus | Read/Grep/Glob/Bash/Edit/Write/WebFetch/Agent/WebSearch, Claude_Browser, composio | Builds/ships sites, landing pages, product surfaces — the MAKER, never self-signs-off |

All 17 carry `composio` tool access (`COMPOSIO_SEARCH_TOOLS`, `COMPOSIO_MULTI_EXECUTE_TOOL`, `COMPOSIO_MANAGE_CONNECTIONS`). A sidecar file `_check-agents.mjs` (Sep 9) lives alongside them — a validation script for the agent roster. Most files are dated Aug 27 (initial generation); five were touched Sep 9 (`client-conversion`, `content-producer`, `cross-reference`, `email-outreach`, `hubspot-tracker`, `job-search`, `skill-selector`, `_check-agents.mjs`) — consistent with the Sep 9 `OPERATING-PLAN-2026-09-09.md` redesign in §2.

---

## 5. `C:\Users\dillo\.codex\automations\` (26 scheduled automations)

Read every `automation.toml`. Status/kind/schedule as of 2026-09-10:

| id | kind | status | schedule |
|---|---|---|---|
| `daily-communications-brain` | cron | **ACTIVE** | daily 07:00 |
| `report-brain-reconciliation` | cron | **ACTIVE** | daily 19:00 |
| `marketing-chief-twice-daily-brief` | cron | **ACTIVE** | daily 09:00, 17:00 |
| `weekly-client-marketing-reports` | heartbeat | **ACTIVE** | weekly Mon 10:00 — very long, detailed prompt; hard account scopes, hard exclusions (never touch Replenish Ads, never blend Fresh Blends/Replenish), draft-only for email/Slack |
| `daily-momentum-semrush-opportunities` | heartbeat | **ACTIVE** | daily 09:00, until 2026-10-04 |
| `daily-grok-dillon-os-intelligence` | cron | **ACTIVE** | daily 07:30 |
| `daily-signal-harbor-crypto-intelligence` | heartbeat | **ACTIVE** | daily 08:00 |
| `coinbase-portfolio-guardrails` | heartbeat | **ACTIVE** | every 6h — strictly read-only, explicit prohibition on any trade/transfer/order action, models forward DCA/profit-taking scenarios as review-only |
| `immohrtal-daily-business-clock-in` | heartbeat | **ACTIVE** | daily 08:30 |
| `obsidian-guard-dog` | heartbeat | **ACTIVE** | daily 08:30 |
| `puttery-nyc-tock-build-monitor` | heartbeat | **ACTIVE** | 3x/weekday, until 2026-09-15 (expires in 5 days) |
| `bok-facebook-weekly-pdf-scheduler` | cron | **ACTIVE** | weekly Tue 17:00 |
| `weekly-immohrtal-seo-analytics` | heartbeat | **ACTIVE** | daily 09:00 |
| `momentum-radar-daily-12` | cron | (no status field — treat as unmanaged/default) | daily 05:00 — 12 prospect homepages, QA, deploy to preview, "SEND NOTHING," lease-guarded via `Set-OrchestratorLease.ps1` |
| **`finish-twelve-weekly-report-sends`** | heartbeat | **PAUSED** | every 5 min | Narrow cleanup task (send 3 remaining client emails); explicitly excludes NKCDC per correction; looks like a short-lived task left paused rather than deleted |
| **`keep-agency-wars-build-moving`** | heartbeat | **PAUSED** | every 10 min | A game-dev keep-alive/babysitter for an unrelated project (Agency Wars / Philadelphia city build) — long, very specific prompt referencing a worktree and a resumable PTY session |
| **`slack-reply-watchdog`** | cron | **PAUSED** | every 6h | Guarded Slack triage/draft system; detailed voice-and-triage rules; paused, not deleted |
| **`align-hcm-dashboard-live-refresh`** | cron | **PAUSED** | weekday 07:00/13:00 | |
| **`daily-align-hcm-semrush-blog-intelligence`** | heartbeat | **PAUSED** | daily 14:00 | |
| **`daily-morning-orchestrator-dry-board`** | cron | **PAUSED** | daily | |
| **`momentum-hubspot-day-pulse`** | cron | **PAUSED** | every 15 min, 07:00-19:45 | |
| **`momentum-hubspot-night-pulse`** | cron | **PAUSED** | hourly overnight | |
| **`momentum-workshop-calendar-intake`** | cron | **PAUSED** | every 5 min | |
| **`six-hour-important-email-drafter`** | cron | **PAUSED** | every 6h | |
| **`tags-2-go-fast-email-reply`** | cron | **INACTIVE** | every 15 min | Only automation with `INACTIVE` rather than `PAUSED` — distinct/likely-terminal state |

**11 of 26 automations are non-ACTIVE** (10 PAUSED + 1 INACTIVE) as of this snapshot — see §7 for interpretation.

---

## 6. `C:\Users\dillo\AppData\Local\Dillon\GoogleAdsProbe\` (Python, all dated 2026-09-10 — built today)

A standalone, non-MCP, direct-REST Google Ads client built and used the same day as this inventory.

| File | What it does |
|---|---|
| `account_guard.py` | Hard-coded safety rules: shared CID `6275014654` holds two clients (campaign-level reads OK, account-level totals forbidden); CID `7214914099` is fully forbidden; helper functions `classify_campaign`, `refuse_account_total`, `split_rows`, `assert_cid_allowed` used by every downstream analysis script |
| `ads_probe.py` | Read-only Google Ads REST probe (explicit docstring: "No campaign or account mutations") |
| `authorize.py` | One-time OAuth flow using a local Desktop OAuth client to produce `google-ads.yaml` |
| `deep_explore.py` / `pull_missing.py` | Bulk pull scripts writing JSON into `dillon-os\_os\automation\google-ads-api\pulls\` (the 60 files in §1.4) |
| `pull_all.py` | Simpler 7-day snapshot puller across the 5 named accounts (Omega, Nexla, Onsite, KJB, Replenish/FreshBlends) |
| `analyze_pulls.py`, `run_ad_strength_analysis.py`, `run_change_analysis.py`, `run_conv_analysis.py`, `run_geo_device_analysis.py`, `run_hist_analysis.py`, `run_is_analysis.py`, `run_lp_analysis.py`, `run_odd_analysis.py`, `run_qs_analysis.py` | One analysis script per report type (ad strength, change history, conversions, geo/device, 24-month history, lost impression share, landing pages, budget/status anomalies, quality score), all reading from the shared `pulls\` directory |
| `verify_budgets.py`, `verify_negs.py` | Point checks against a specific account (CID `7917802207` = Nexla) |
| **`nexla_all.py`**, **`nexla_fix.py`** | **Mutation-capable.** Both gate on `--apply` (dry-run by default) but, when passed, perform live write operations against Nexla's Google Ads account directly via REST (e.g. `nexla_all.py` disarms paused large budgets) — this bypasses the read-only posture used by the sanctioned Google Ads MCP/composio connectors elsewhere in the estate. |
| `nexla_negs.py`, `nexla_terms.py` | Search-term / negative-keyword analysis feeding a manual negative-keyword list for Nexla |
| `test_probe.py` | Offline unit tests for `ads_probe.py` — no live requests, no OAuth |
| `oauth-client.json`, `google-ads.yaml` | Credential/config files (not inspected for content beyond confirming presence — treat as containing live OAuth secrets) |

---

## 7. `C:\Users\dillo\Documents\Codex\projects\agent-vault\` (workflows + scripts)

- `workflows\` — **only 1 file**: `alignhcm-linkedin.pipeline.json`. This is a much smaller footprint than the `dillon-os\_os\automation\workflows\` (§1.1); agent-vault's workflow catalog looks largely unpopulated relative to its role as "shared cross-harness workflow definitions" in the global CLAUDE.md.
- `scripts\` — `Sync-AgentVault.ps1` (8.4 KB) + `Test-AgentVault.ps1` (4.7 KB), Aug 11 — the sync/validate pair named in the global CLAUDE.md as required before marketing/client/orchestration work.

---

## 8. `C:\Users\dillo\Documents\Codex\projects\client-operations\registry\clients.json`

Schema v1, `generatedAt: 2026-08-07T16:12:51Z`. Communication-scan metadata shows a completed live scan: 2555 deduplicated Gmail messages / 897 threads, 106 visible Slack conversations, window 2025-07-21 → 2026-07-16.

**26 client records.** Full id / display name / status list:

| id | displayName | status |
|---|---|---|
| `align-hcm` | Align HCM | active |
| `momentum-360` | Momentum 360 | active |
| `kimberly-james-bridal` | Kimberly James Bridal | active |
| `bok-law-firm` | BOK Law Firm | active |
| `fagan-painting` | Fagan Painting | active |
| `pro-fence-deck` | Pro Fence & Deck | active |
| `replenish-7-eleven` | Replenish / 7-Eleven | active |
| `fresh-blends-kwik-trip` | Fresh Blends / Kwik Trip | active |
| `nkcdc` | NKCDC | active |
| `zen-spa-tropicana` | Zen Spa at Tropicana | **inactive** |
| `hope-wellness-center` | Hope Wellness Center | active |
| `omega-landscaping` | Omega Landscaping and Concrete | active |
| `shadow-heating-cooling` | Shadow Heating and Cooling | active |
| `va-claims-edge` | VA Claims Edge | active |
| `bercos-popcorn` | Bercos Popcorn | active |
| `ami-cleaning` | AMI Cleaning | **inactive** |
| `cindy-may-christmas` | Cindy May Christmas | active |
| `bar-crawl-usa` | Bar Crawl USA | active |
| `bridge-software` | Bridge Software | active |
| `onsite-concrete-landscape` | Onsite Concrete & Landscape | active |
| `revive-systems` | Revive Systems | active |
| `bigorange-marketing` | BigOrange Marketing | active |
| `pritzker-law-group` | Pritzker Law Group | active |
| `tags-2-go` | Tags 2 Go | active |

(24 rows captured by ID/displayName grep against an 867-line file with 26 declared client entries in the schema; two records may have been truncated by the grep pass at the file tail — treat 24 as the verified floor, 26 as the header-declared count. `bok-law-firm` carries an explicit `affiliationConstraints`: "not-client-of momentum-360", confidence 1.0, sourced to a 2026-07-16 user correction — i.e. a documented past mix-up between BOK and Momentum client identity.)

Note: `nexla-terms.json` and the GoogleAdsProbe scripts (§6) reference a client "Nexla" (CID `7917802207`) that does **not** appear as an id/displayName in this registry grep — worth reconciling; either Nexla is filed under a different canonical id/alias not captured in this pass, or it is an account being worked ahead of registry entry.

---

## 9. Dead / superseded — evidence-backed

1. **`11_Agents\Master Agent.md`, `Google Ads Agent.md`, `Reporting Agent.md`, `SEO Agent.md`, `Web Agent.md`** — Markdown "agent" role prose (content-dated Jul 12, bulk-touched Aug 17) naming a flat five-role team (Master/Google Ads/Reporting/SEO/Web). This has been functionally replaced by the 17-agent `.claude/agents/*.md` Claude Code subagent roster (§4.4), which is finer-grained (separate `paid-media-analyst`, `growth-content`, `web-product-builder`, `qa-critic`, `revenue-ops-analyst`, etc.), carries real `tools:`/`model:` bindings, and was itself generated Aug 27 by `Build-ClaudeAgents.py` — after these five files were last touched. `OPERATING-PLAN-2026-09-09.md` (the newest, canonical doc in the same folder) explicitly critiques the predecessor automation generation these five files describe ("of 75 automations, zero served this lane," "the predecessor's failure mode... reported degraded every day"). These five files were not deleted, but nothing in this pass found them still being read by a live workflow or automation prompt — they read as historical/superseded rather than current source-of-truth.

2. **`.codex\automations\tags-2-go-fast-email-reply`** — the only automation with `status = "INACTIVE"` (every other non-running automation uses `PAUSED`), suggesting it was deliberately retired rather than temporarily suspended.

3. **`.codex\automations\finish-twelve-weekly-report-sends`** and **`keep-agency-wars-build-moving`** — both PAUSED heartbeats with very narrow, task-specific prompts (finish sending 3 named emails; babysit one game-dev build). Both read as one-off task automations that outlived their task and were paused rather than deleted — candidates for cleanup once verified complete.

4. **10 PAUSED + 1 INACTIVE of 26 total `.codex\automations`** (§5) — nearly half the automation roster is currently not running. None were found deleted; this is a live "shelf" of suspended automations rather than a clean active set.

5. **`_os\automation\lib\outcome-graph-*.js`** (18 files, single-afternoon build Aug 24, largest subsystem in `lib\` by file count and size) — no caller was found in this pass from `bin\` or `workflows\` invoking more than a couple of these modules directly. Not confirmed dead, but unconfirmed-live; flagged for a follow-up grep of actual `require`/`import` call sites before assuming the whole family is wired into a running pipeline.

6. **Registry/Nexla gap** — GoogleAdsProbe and its pulls actively work a "Nexla" Google Ads account (CID `7917802207`) that does not surface under that name in the `clients.json` registry grep (§8). Either a naming/alias mismatch or a gap in the canonical registry — the global CLAUDE.md's stated rule is "when the vault and the registry disagree about who is a client, the registry wins," so this should be reconciled before treating Nexla as a fully registered client.

7. **`.agents/skills` vs `.claude/skills` drift in dillon-os** — 5 of 25 shared skill files differ between the two trees, and `.claude/skills` has one skill (`fable-advisor`) absent from `.agents/skills`. Likely intentional harness-specific divergence, not confirmed accidental — flagged rather than fixed (read-only inventory).

---

## Roots not covered above (out of scope per task instructions)

`node_modules`, `.git`, `assets` binary trees, and `02_Campaigns` batch site folders were excluded from recursion per instructions.
