# WINDOWS CONTEXT PACK — DESKTOP-4AHKEC4

- Captured: 2026-09-11 ~12:45 PM ET (live read-mostly archaeology)
- MachineId: feeac9f6-8347-4372-8943-e8ab69a3adf0
- Label: DESKTOP-4AHKEC4 (PRIMARY Windows desktop)
- Authoring agent: Grok Bot executor subagent
- Safety: no passwords/tokens/cookies/private keys/API secrets persisted here
- If a credential exists: service name + existence + expected config location only

---

## VERIFIED

### Canonical profile
- **Proven live:** `C:\Users\dillo` (USERNAME=`dillo`, USERPROFILE=`C:\Users\dillo`, whoami=`desktop-4ahkec4\dillo`)
- Windows filesystem is case-insensitive: `C:\Users\Dillo` and `C:\Users\dillo` are the **same** directory (not a junction/symlink pair)
- `C:\Users\DillonMohr`: **MISSING** (historical only)
- `C:\Users\Dillon`: **MISSING**
- Prompt typo note: `C:\Users\Dillo.codex` does **not** exist; real path is `C:\Users\dillo\.codex`

### Known roots (live)
| Path | Status |
|------|--------|
| `C:\Codex` | MISSING |
| `C:\DillonOS` | MISSING |
| `C:\Users\dillo\.codex` | EXISTS (primary Codex home) |
| `C:\Users\dillo\repos\dillon-os` | EXISTS (active Dillon OS vault / SoT workspace) |
| `C:\Users\dillo\Documents\Codex\projects\client-operations` | EXISTS (DIRTY worktree) |
| `C:\Users\dillo\Documents\Codex\projects\agent-vault` | EXISTS (DIRTY) |
| `C:\DillonOS\mohr-vault\vault\00_Memory_File.md` | MISSING (root `C:\DillonOS` absent) |
| `C:\Users\dillo\repos\mohr-vault\vault\00_Memory_File.md` | EXISTS (historical/template SoT candidate) |
| `C:\Users\dillo\Desktop` | MISSING |
| `D:\` / `E:\` | MISSING |

### 1) Machine identity
- Host: **DESKTOP-4AHKEC4**
- Hardware: **HP EliteDesk 800 G4 SFF**
- OS: **Microsoft Windows 11 Pro** 64-bit, Version **10.0.26200**, Build **26200**
- Install date (WMI): 2026-07-08 ~9:11 PM ET
- Last boot (WMI): 2026-09-10 ~8:27 PM ET
- CPU: **Intel Core i7-8700** @ 3.20 GHz — 6 cores / 12 logical
- RAM: **~64 GB** (63.78 GB visible; ~42.9 GB free at capture)
- Storage: **C:** 952.5 GB total / **379.2 GB** free (VolumeName=Windows)
- GPU: **Intel UHD Graphics 630** (driver 31.0.101.2141)

### 2) Dev environment versions
| Tool | Version / notes |
|------|-----------------|
| PowerShell | **7.6.4** (Core) — default shell on this machine |
| Git | **2.55.0.windows.3** |
| Node | **v24.18.0** |
| npm | **12.0.2** |
| Python | **3.13.14** (`py` / `python`) |
| pip | **26.1.2** (Python313 user install) |
| FFmpeg | **8.1.2**-full_build (gyan.dev) |
| Chrome | **152.0.7977.84** at `C:\Program Files\Google\Chrome\Application\chrome.exe` |
| Playwright | CLI **1.55.0** (via npx); browsers under `%LOCALAPPDATA%\ms-playwright` (chromium-1187/1228/1234 + headless shells) |
| Codex CLI | **codex-cli 0.153.4** (`%APPDATA%\npm\codex.cmd`) |
| Codex desktop runtime | `%LOCALAPPDATA%\OpenAI\Codex` present; app build flavor env shows **26.903.71938**; bundled `codex.exe` under `...\bin\7ac07f4ce733f89a\` |
| Cursor | Installed under `%LOCALAPPDATA%\Programs\cursor`; Cursor.exe FileVersion **3.20.10** (package.json also saw 3.19.19 — treat as mid-update dual); `cursor-agent` **2026.09.08-6caf4ff** |
| Grok CLI | **grok 1.0.4** (stable) |
| Hermes | **v0.20.0 (2026.8.3)** at `%LOCALAPPDATA%\hermes\hermes-agent` (Python 3.11.15) |
| Ollama | **0.33.2** |
| n8n | Present globally (npm tree showed n8n@2.31.6) |
| Docker | **NOT** on PATH |
| Bitwarden CLI (`bw`) | **NOT** on PATH (bridge script exists separately) |
| Tailscale | **NOT** installed / not on PATH |
| ChatGPT desktop exe | Not found at common Local\Programs paths (Codex/OpenAI stack used instead) |

### 3) Codex
- CLI: **0.153.4**; models_cache `client_version=0.153.4`, fetched_at 2026-09-11T16:45:35Z
- Account state (**no secrets**): `auth_mode=chatgpt`; `OPENAI_API_KEY` null in auth.json; **tokens object present** (id/access/refresh/account_id) with last_refresh **2026-09-03T16:52:12Z** — treat as authenticated ChatGPT/Codex session, refresh age ~8 days
- Default model in `config.toml`: **`gpt-5.6-luna`** (reasoning_effort=max)
- Agents / native multi-agent:
  - `[agents] enabled = true`; max_concurrent_threads_per_session=6; default_subagent_model=`gpt-5.6-terra`
  - `[features.multi_agent_v2] enabled = true` (native multi-agent v2 ON)
- Model availability visible in models_cache (IDs only): `gpt-6-astra`, `gpt-reserve`, `gpt-5.6-sol`, `gpt-5.6-terra`, `gpt-5.6-luna`, `gpt-5.5`, `gpt-5.3-codex-spark`, `codex-auto-review`
- Key locations:
  - Home: `C:\Users\dillo\.codex`
  - Config: `C:\Users\dillo\.codex\config.toml`
  - Auth: `C:\Users\dillo\.codex\auth.json` (exists; not dumped)
  - Skills: `C:\Users\dillo\.codex\skills` (large library)
  - Agents: `C:\Users\dillo\.codex\agents\*.toml`
  - Managed agents contract: `C:\Users\dillo\.codex\managed-agents.json` (updated 2026-08-08)
  - Secrets dir (name only): `C:\Users\dillo\.codex\secrets\mcp_oauth.age` exists
  - Access Broker registry: `C:\Users\dillo\AppData\Local\Codex\AccessBroker\registry.json` (exists; not dumped)
  - Bitwarden bridge script: `C:\Users\dillo\.codex\credential-bridge\Invoke-CodexBitwardenBridge.ps1`
- Plugins enabled (sample): computer-use, chrome, browser, documents/pdf/spreadsheets/presentations, chatcut, sites, visualize, codex-security, sales/data-analytics/product-design role plugins, ponytail, never-cutoff, indeed/linkedin outreach helpers, obsidians skills, unified-computer-use, etc.
- MCP servers configured (presence): node_repl, composio, local-ai-worker, openaiDeveloperDocs, omniroute (enabled=false)
- Codex Router scheduled task: **Running**
- version.json stale relative to CLI: latest_version noted 0.147.0 / last_checked 2026-08-17 (CLI is newer)

### 5) Dillon OS / mohr-vault SoT
- **Primary active vault:** `C:\Users\dillo\repos\dillon-os` (remote `https://github.com/dillonmohr8777/dillon-os.git`)
  - System control plane: `C:\Users\dillo\repos\dillon-os\System\` (MASTER-ORCHESTRATOR, GROKBOT-ORCHESTRATOR, daily-orchestrator, approval-queue, gateway-health, ESTATE-INVENTORY, tool-access-catalog, …)
  - Brain: `12_Brain\`; Agents: `11_Agents\`; Daily-Briefs through **2026-09-11**
  - INDEX.md / Dashboard.md present
- **mohr-vault Memory File:** `C:\Users\dillo\repos\mohr-vault\vault\00_Memory_File.md` (CLEAN main; dated content ~2026-08-15; Claude-oriented master context — **not** the live Dillon OS System plane)
- Worktree copy: `C:\Users\dillo\Claude\worktrees\repo-analysis-1bien2\mohr-vault-review\vault\00_Memory_File.md`
- `C:\DillonOS\...` root: **does not exist** on this machine
- Documents mirrors: `Documents\Codex\dillon-os`, `Documents\Codex\projects\dillon-os` (secondary / older checkouts)

### 6) Browser automation
- Chrome profile **names only:** `Default => Your Chrome` (gaia signed-in flag true in Local State; no cookies/paths dumped)
- Playwright: installed + browser binaries present (see above)
- CDP / remote-debugging docs (historical Zen Spa lane):
  - Port **9222** documented in `Documents\Codex\2026-07-09\i-need-you-to-go-and\automation\` (Start-ZenSpaRemoteChrome.ps1, README, Install script)
  - Env var pattern `BOX_CDP_URL=http://127.0.0.1:9222`
  - Scheduled task `ZenSpa-RemoteChrome`: **Disabled**
  - `Codex-Chrome-Watchdog`: **Disabled**
- Codex Chrome native hosts / chatgpt-control extension present under `.codex`

### 10) Reinstall manifest (no secrets)
1. Windows 11 Pro + HP EliteDesk 800 G4 baseline drivers
2. Git for Windows 2.55+
3. Node.js 24 LTS + npm
4. Python 3.13 + pip
5. FFmpeg full build
6. Google Chrome stable
7. Playwright browsers (`npx playwright install`)
8. Codex CLI (npm global) + OpenAI Codex desktop/runtime under Local\OpenAI\Codex
9. Cursor IDE
10. Grok CLI + Grok Bot app
11. Hermes Agent
12. Ollama
13. Obsidian (vault = dillon-os)
14. Optional: n8n, Kimi desktop, Antigravity, Cua, Blender, Loom, Spline
15. Re-auth: ChatGPT/Codex (auth_mode chatgpt), GitHub CLI (dillonmohr8777), Cursor account, Composio/WordPress/Slack OAuth as needed
16. Restore `C:\Users\dillo\.codex` (config/skills/agents) from backup — **never** commit secrets
17. Clone `dillon-os`, `mohr-vault`, `client-operations-canonical`, `agent-vault`
18. Recreate useful Scheduled Tasks from inventory below (many Ready/Disabled)
19. Tailscale: **not** currently installed — design-only for future private overlay

### Grok Linux coordination (design note only)
- **Windows = executor** (this machine; local Shell/Read via machineId)
- **Grok Bot box = orchestration** (Debian Docker shared box; no shared desktop across agents)
- Future private overlay (Tailscale-class): design only; **do not install** unless already present — **not present** as of this capture

---

## HISTORY RECOVERED

- Machine reimage/install cluster around **2026-07-08** (OS InstallDate + heavy `Documents\Codex\2026-07-*` session folders)
- Daily dated Codex session folders from **2026-07-08 through 2026-09-11** under `C:\Users\dillo\Documents\Codex\`
- Historical path vocabulary (`C:\DillonOS`, `C:\Codex`, `C:\Users\DillonMohr`) **not** present on disk; estate consolidated under `C:\Users\dillo\repos\` + `Documents\Codex\`
- King Agent OS: entity note at `dillon-os\12_Brain\02_Entities\King Agent OS.md` — patterns from retired machine; status active/unverified; maps to morning command / approval queue patterns
- Prospect Radar / site factory waves Aug 2026 under `Documents\Codex\work\*` and dated folders
- Job outreach batches Jul–Aug 2026 under dated Codex folders
- `managed-agents.json` documents prior runtime bench: grok-build, cursor-auto, cursor-grok, cursor-kimi (usage-limit note dated through 2026-09-01), hermes
- ESTATE-INVENTORY-2026-09-10.md already in System (prior inventory pass)

---

## ACCESS

| Surface | State | Notes |
|---------|-------|-------|
| Local filesystem read | **available** | Broad read authorized this pass |
| GitHub CLI | **authenticated** | `dillonmohr8777` via keyring; scopes gist/read:org/repo/workflow |
| Codex / ChatGPT | **authenticated** (tokens present) | auth_mode=chatgpt; last_refresh 2026-09-03 — may need refresh soon |
| Cursor | **available** | cursor-agent present; account historically dillonmohr8777@gmail.com per managed-agents |
| Grok CLI | **available** | 1.0.4; managed-agents noted dillonmohr1@icloud.com for grok-build |
| Hermes | **available** | v0.20.0; local gateway historically `127.0.0.1:9900` per tool-access-catalog |
| Access Broker registry | **present** | non-secret registry file exists |
| Bitwarden CLI | **unknown/missing CLI** | bridge script exists; `bw` not on PATH |
| Docker | **blocked/missing** | not installed on PATH |
| Tailscale | **missing** | not installed |
| Composio / WP.com / Slack (Cursor MCP) | **stale/needsAuth** per 2026-07-12 catalog | re-verify live before assuming |
| Chrome profile | **available** | single Default profile |
| CDP ZenSpa automation | **stale/disabled** | task Disabled |
| OPENAI_API_KEY in auth.json | null | Agents API key expected via env / private store per api-keys-setup.md (existence of key not verified this pass) |

---

## LUNA

- **Native Luna model is the active Codex default:** `model = "gpt-5.6-luna"` in `C:\Users\dillo\.codex\config.toml`
- Luna appears in models_cache and pricing/bench notes inside dillon-os AI Division library
- Native multi-agent: **`features.multi_agent_v2.enabled = true`** + `[agents] enabled = true` with Terra as default subagent model
- Dedicated agent configs: `sol-advisor-luna-implementer.toml` (model gpt-5.6-luna), paired with Terra implementer + Sol reviewer
- No unofficial Luna wrapper installed this pass; stock Codex feature flags/config used
- UI/docs strings: Luna referenced across agents TOMLs and Momentum planning docs; not a separate desktop app

---

## CHANGED

- Created this pack (new documentation only):
  - `C:\Users\dillo\repos\dillon-os\System\machine-context\2026-09-11-WINDOWS-CONTEXT-PACK.md`
  - Twin: `C:\Users\dillo\Documents\Codex\machine-context\2026-09-11-WINDOWS-CONTEXT-PACK.md`
- Created parent dirs `System\machine-context` and `Documents\Codex\machine-context` if missing
- **No** dirty worktrees discarded; **no** installs; **no** Tailscale; **no** secret dumps

---

## DIRTY WORK

Preserve — do not reset/discard:

| Path | Branch | Dirty | Client / purpose |
|------|--------|-------|------------------|
| `repos\dillon-os` | `cursor/immohrtal-standing-canary-3c2e` | **DIRTY ~612** | Primary Dillon OS vault / SoT |
| `Documents\Codex\projects\client-operations` | `cursor/bar-crawl-andy-send-24e0` | **DIRTY ~3414** | Momentum client ops (Bar Crawl / multi-client) |
| `Documents\Codex\projects\agent-vault` | `main` | **DIRTY ~9** | Agent vault backup/snapshot |
| `Documents\Codex\projects\dillon-os` | `main` | **DIRTY ~33** | Older/secondary dillon-os checkout |
| `repos\client-operations-canonical` | `cursor/fable-51-higgsfield-delta-6b7a` | **DIRTY ~1** | Canonical client-operations remote twin |

Clean (sampled): mohr-vault main; bridge-software-frontend; agentic-inbox; dillon-claude-config; Documents\Codex\dillon-os (setup-dev branch); momentum-design-system (local git, no remote)

---

## STALE

- `C:\Codex`, `C:\DillonOS`, `C:\Users\DillonMohr` path assumptions
- `.codex\version.json` checker (0.147 / Aug 17) vs live CLI 0.153.4
- ZenSpa CDP scheduled automation (Disabled)
- Many one-shot Codex scheduled tasks from Jul 2026 (Disabled/Ready but aged)
- Cursor MCP OAuth notes from **2026-07-12** in tool-access-catalog (needs live re-check)
- King Agent OS physical plugins on retired machine (patterns only)
- `Documents\Codex` has a `.git` directory but `git` reports **not a repository** (broken/orphan metadata)
- daily-orchestrator / grokbot-orchestrator folders are **lock folders only** (README stubs); real SoT in `dillon-os\System\`
- mohr-vault `00_Memory_File.md` last substantive tree stamp ~2026-08-15 vs live ops in dillon-os System (prefer System + Daily-Briefs for current ops)

---

## BLOCKED

- No Tailscale / private overlay present (design-only; not installed)
- Docker not available on PATH
- Bitwarden CLI not on PATH (bridge script only)
- ChatGPT standalone desktop exe not found at common paths
- Cannot treat `C:\DillonOS` or `C:\Codex` as live roots
- Did not exercise live Composio/Slack/WP OAuth (prior catalog says needsAuth)
- Did not dump Access Broker / auth token values (policy)
- Documents\Codex root git metadata appears broken for status operations
- Desktop folder missing under profile (unusual; not investigated deeply)

---

## Project map (meaningful repos / workspaces)

### Primary
| Path | Purpose | Remote | Branch | State |
|------|---------|--------|--------|-------|
| `C:\Users\dillo\repos\dillon-os` | Dillon OS vault / operating system SoT | github.com/dillonmohr8777/dillon-os | cursor/immohrtal-standing-canary-3c2e | DIRTY |
| `C:\Users\dillo\Documents\Codex\projects\client-operations` | Client operations (Momentum + clients) | client-operations-canonical | cursor/bar-crawl-andy-send-24e0 | DIRTY heavy |
| `C:\Users\dillo\repos\client-operations-canonical` | Canonical client-ops clone | same | cursor/fable-51-higgsfield-delta-6b7a | DIRTY light |
| `C:\Users\dillo\Documents\Codex\projects\agent-vault` | Agent vault | agent-vault | main | DIRTY |
| `C:\Users\dillo\repos\mohr-vault` | Obsidian-style vault + Memory File | mohr-vault | main | CLEAN |
| `C:\Users\dillo\.codex` | Codex home (config/skills/sessions) | n/a | n/a | LIVE |

### Notable product / client clones under `repos\`
- Align HCM cluster: align-hcm-* repos, dillon-claude-config
- Bridge: bridge-software-frontend (CLEAN), bridge-discovery-prototype*, bridge-wt-*
- Marketing sites: bigorange-marketing-homepage, shadow-heating-website, nkcdc-*, philadelphia-prospect-sites, immohrtal-*, ironic-ineptocracy-site
- Platforms: rockbot, vace-platform, camofox-browser, Open-LLM-VTuber, hyperframes, semrush-proxy
- Job/search: jason-fallon-hubspot-agent; Documents\Codex\projects\job-search-2026 (not git)
- Coinbase paper platform clones (historical)

### Documents\Codex active project dirs (non-exhaustive)
- daily-orchestrator, grokbot-orchestrator (locks)
- muse-spark-driver, momentum-design-system, weekly-report-dashboard, ai-division-*, m360-game, philly-game, Higgsfield, fable-review, Reliability, worktrees, outputs
- projects\*: astra-prep, box-company-brain, codex-router, hermes-control, local-ai-worker, website-design-engine, deepseek-harness-canary, wt-*

---

## Agent / automation history (active vs stale)

| Name / lane | Evidence | Label |
|-------------|----------|-------|
| Master / Grokbot orchestrator | `System\MASTER-ORCHESTRATOR.md`, `GROKBOT-ORCHESTRATOR.md`, Daily-Briefs through 2026-09-11, lock folders | **ACTIVE** |
| Daily unfinished-work / daily-orchestrator | `System\daily-orchestrator.md`, `DAILY-PROMPT.md`, Daily-Briefs `plan-2026-09-11.md` | **ACTIVE** |
| Marketing Chief / authority | `managed-agents.json` authority + `.codex\agents\marketing-chief.toml` | **ACTIVE (config)** |
| Chief of Staff | skill `.codex\skills\chief-of-staff` (dated Jul) | **PRESENT / likely stale skill pack** |
| Hermes | installed + scheduled Reliability Watchdog Ready; private worker task Disabled | **ACTIVE runtime / mixed tasks** |
| Codex Router | project + skill; Scheduled Task **Running** | **ACTIVE** |
| Prospect Radar | multiple dated builds; tasks Ready/Disabled | **SEMI-ACTIVE / aged** |
| King Agent | Brain entity only; retired-machine infra | **STALE infra / ACTIVE pattern note** |
| Outreach Orchestrator / Daily-Job-Outreach-Runner | Scheduled Task Ready; Jul–Aug outreach docs | **SEMI-ACTIVE / verify** |
| ZenSpa Remote Chrome / CDP | docs exist; task Disabled | **STALE** |
| Sweep / Trace (named agents) | No clear first-class active System agent docs found this pass; many false-positive `.next\trace` files | **UNKNOWN / not confirmed active** |
| DillonAgentOS Gmail/Slack bridges | Scheduled Tasks Ready | **PRESENT — verify health** |
| Rockbot Operating System | under `11_Agents\` | **PRESENT** |
| AI Division / reporting agents | `11_Agents\*Agent.md`, OPERATING-PLAN Sep 9–10 | **ACTIVE docs** |

### Scheduled tasks snapshot (agent-relevant)
Running: Codex Router; Codex-NoPopupGuard; Codex-PutteryNYC-TockReceiver; Codex-Settings-Guard; Codex-Settings-Watch; Codex-TelegramModelGateway  
Ready (sample): Codex-AgentMemory-*; Cursor-Dillon-LocalWorker*; Hermes-Reliability-Watchdog; Daily-Job-Outreach-Runner; Prospect Radar - Next 20; DillonAgentOS Gmail/Slack bridges  
Disabled (sample): ZenSpa-RemoteChrome; Codex-Chrome-Watchdog; Codex-Morning-Orchestrator-Preflight; DillonAgentOS-DailyBrief; Cursor-Hermes-PrivateWorker; Prospect Radar - Next 15

---

## NEXT (5 upgrades)

1. **Refresh Codex ChatGPT auth** (last_refresh 2026-09-03) and confirm Luna + multi_agent_v2 still healthy in a 60-second canary spawn/interrupt.
2. **Reconcile dirty giants safely:** inventory (not discard) `client-operations` ~3414-line dirty and `dillon-os` ~612-line dirty into named WIP commits or stash notes; keep Bar Crawl / immohrtal canary work.
3. **Promote this pack into operating HUD:** link from `INDEX.md` / `operating-status.md`; keep twin under `Documents\Codex\machine-context` for non-git access if dillon-os worktree is awkward.
4. **Live re-verify access map:** Composio/Slack/WP OAuth, Hermes gateway `:9900`, OmniRoute `:20128`, Access Broker entries — mark available vs needsAuth without dumping secrets.
5. **Design-only private overlay decision:** document whether Tailscale-class mesh should bind Windows executor ↔ Grok box; do not install until approved; if approved later, record version only in this pack series.

---

## Capture metadata
- Primary write: `C:\Users\dillo\repos\dillon-os\System\machine-context\2026-09-11-WINDOWS-CONTEXT-PACK.md`
- Twin write: `C:\Users\dillo\Documents\Codex\machine-context\2026-09-11-WINDOWS-CONTEXT-PACK.md`
- Method: PowerShell live probes via machineId feeac9f6-8347-4372-8943-e8ab69a3adf0
- Policy honored: read-mostly; safe docs only; secrets redacted to existence+location
