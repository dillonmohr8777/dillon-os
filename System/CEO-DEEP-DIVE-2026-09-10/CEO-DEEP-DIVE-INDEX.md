# CEO Deep Dive Index — 2026-09-10

**Machine:** DESKTOP-4AHKEC4 (`feeac9f6-8347-4372-8943-e8ab69a3adf0`)
**Scan window:** 2026-09-10 ~18:42–19:00 ET
**Rules observed:** local disk READ only; no Slack/Gmail/messaging/spend/ads/Bitwarden unlock
**Mirrors:** this folder + `/workspace/ceo-deep-dive/` on the box

Companion files in this folder:
- `CLAUDE-WEEK-CLEANUP.md` — bloat vs cleaned themes
- `OPERATING-SURFACE.md` — what The CEO should open first
- This index — map of what exists where

---

## Authority order (do not invert)

1. `C:\Users\dillo\Documents\Codex\projects\client-operations\registry\clients.json` — client roster
2. `C:\Users\dillo\repos\dillon-os` — Obsidian vault / brain (knowledge, decisions, overlays)
3. Everything else is projection, worktree, or archaeology

Source: root `MACHINE-INDEX.md` (2026-09-04, still accurate on structure; vault health numbers drift daily).

---

## 1. Home top-level map — `C:\Users\dillo`

### Orientation / start hubs
| Path | Role |
|---|---|
| `00 - DILLON START HERE\` | Symlink hub to projects/repos/Downloads (Jul 16); shortcut layer, not a second root |
| `MACHINE-INDEX.md` | Living root map — **read first on a cold machine** |
| `MACHINE-REPORT.md` | What is wrong with the machine |
| `RECOVERED-ASSETS.md` | Orphaned Netlify / session recoveries |
| `AGENTS.md` / `CLAUDE.md` | Home-level agent contracts (also under `.claude\`) |

### Live work roots
| Path | Role | Health note |
|---|---|---|
| `repos\` | ~45 git repos (client sites, tooling, forks) | Mostly clean; `dillon-os` dirty |
| `repos\dillon-os\` | **LIVE vault** | Branch `cursor/immohrtal-standing-canary-3c2e` (not main); **40 worktrees**; many uncommitted mods |
| `Documents\Codex\projects\client-operations\` | **Canonical client queue + registry** | CONTROL.md queue revision **434**; shared-checkout collision risk |
| `Documents\Codex\momentum-design-system\` | Momentum token SoT | Now under git (baseline 75b386a) — CLAUDE.md still says unversioned (stale claim) |
| `Documents\Codex\projects\job-search-2026\` | Employer search lane | Guardrails hard-block client orgs |
| `Downloads\` | Recent film packs, Semrush CSVs, Claude video stages (Sep 6–10) | Heavy Momentum AI film traffic this week |

### Agent / automation state (config, not “work”)
`.claude` (hot; last cleanup 2026-09-10 21:01Z) · `.codex` · `.cursor` · `.grok` / `.grokbot` · `.omniroute` (sqlite live tonight) · `.hermes` (minimal; lsp only under home) · `.buzz` · `.n8n` / `.n8n-mcp` · `.secrets` (do not unlock Bitwarden) · `.claude-bridge` · `.hyperframes` · many other CLI homes

### Archaeology / collision magnets
- `Documents\Codex\2026-07-*` / `2026-08-*` dated session folders (~130; many nested git clones) — deletion candidates listed in `repo-deletion-candidates-2026-09-01.md`
- Multiple `client-operations-*` forks under Codex projects
- `repos\client-operations-canonical` — **not** canonical despite the name (missing clients vs Documents path)
- `repos\dillon-os-films` — separate worktree/branch of vault (`claude/momentum-bot-branding-u34449`), film lane
- Home itself: chronically occupied by Claude sessions (67 historical project locks) — never start work here

### Other notable
`Claude\worktrees\` · `work\coinbase-history-20260906` · `Videos\Codex` · `outputs` · `blobs` · `manifests` · `agent-tools` (per-run dumps) · `terminals`

---

## 2. dillon-os structure (vault)

**Path:** `C:\Users\dillo\repos\dillon-os`

| Area | Purpose |
|---|---|
| `INDEX.md` | Front door — command center links |
| `System\operating-status.md` | Active roster narrative (goal 14 / target 100; Fagan retired; Align ended) |
| `System\approval-queue.md` | Consequential approvals (very long; many Jul–Sep items still open) |
| `12_Brain\09_Ops\AGENT_PROTOCOL.md` | Read → Think → Write → Route → Verify |
| `System\MASTER-ORCHESTRATOR.md`, `GROKBOT-ORCHESTRATOR.md`, `CONTINUE-HERE-2026-09-10.md`, `DAILY-PROMPT.md` | Today’s orchestrator surface |
| `01_Clients\` | Vault client folders (27 dirs + legacy `.md` stubs) |
| `02_FullTimeJob\` | **Isolation:** `AlignHCM\` (historical), `Empeon\` (live interview prep), `Job Search\` |
| `02_Campaigns\`, `03_Content\`, `04_SOPs\`, `08_Prospects\`, `10_Sessions\`, `11_Agents\`, `12_Brain\` | Operating domains |
| `Daily-Briefs\` | Daily plans / outreach ledger |
| `automation\prospect-radar-next15|next20` | Site-factory automation |
| `_os\automation\paper-craft-video\` | Paper-craft video pipeline |
| `mohr-media-site\` | Personal/agency marketing site (agents pantheon pages) |
| `immohrtal-site\`, `philly-sites\` | Personal brand + prospect factory outputs |
| `System\CEO-DEEP-DIVE-2026-09-10\` | **This deep dive** |

CONTROL-adjacent: vault uses `System\operating-status.md` + `approval-queue.md`; Marketing Chief CONTROL.md lives in client-operations (projection of `queue\work-items.json`).

---

## 3. client-operations (canonical)

**Path:** `C:\Users\dillo\Documents\Codex\projects\client-operations`

| Artifact | Role |
|---|---|
| `AGENTS.md` | Dual-machine writer rules (DESKTOP + AHCM), Marketing Chief, Buzz loop, approval gates |
| `CONTROL.md` | Human projection of queue; **revision 434**; Predicted / Active / Commitment / Waiting on Dillon / Blocked |
| `registry\clients.json` | 24 routes in file read tonight (`schemaVersion` + `clients[]`); **folder set has 29** — drift |
| `clients\<id>\` | Per-client homes (deliverables, work, docs) |
| `queue\work-items.json` | Machine canonical state (Marketing Chief only writer) |
| `scripts\*.ps1` | Mutation, ranking, graph, handoff, CONTROL regen |

### Registry snapshot (status as filed)

**Active (22 in json):** align-hcm (! stale), momentum-360, kimberly-james-bridal, bok-law-firm, fagan-painting (! vault says retired), pro-fence-deck, replenish-7-eleven, fresh-blends-kwik-trip, nkcdc, hope-wellness-center, omega-landscaping, shadow-heating-cooling, va-claims-edge, bercos-popcorn, cindy-may-christmas, bar-crawl-usa, bridge-software, onsite-concrete-landscape, revive-systems, bigorange-marketing, pritzker-law-group, tags-2-go

**Inactive in json:** zen-spa-tropicana, ami-cleaning

**On disk under `clients\` but not in tonight’s 24-entry json summary:** `nexla`, `puttery-nyc`, `deborah-mara`, `gt-clinic`, `immohrtal-marketing` (and possibly more) — Claude memory 2026-09-09 says PR #65 added three of these on `client-operations-canonical`; Documents path may still lag or diverge.

### Deliverables pattern
Per-client trees under `clients\<id>\` with recurring shapes: `deliverables\`, `work\`, reports/PDFs, ad builds, attribution, staging audits. Heavy recent Momentum work under `clients\momentum-360\` (philadelphia-service-world, brand films, AI division). Reusable PDF pipeline: `scripts\New-ReportPdf.mjs` (from Sep 9 handoff).

---

## 4. Claude last ~7 days (map only; themes in CLAUDE-WEEK-CLEANUP.md)

| Location | Finding |
|---|---|
| `.claude\HANDOFF-2026-09-09.md` | Primary evening handoff (registry PR, Empeon sample, Matt Otten, drafts) |
| `.claude\plans\` | 6 plans Sep 5–9 (kitten/toast/pie/rossum/wilkes/kahn) |
| `.claude\scheduled-tasks\` | am-report-local, client-ads-metrics-pull, forecast-backtest-weekly, google-ads-oauth-reminder, slack-intake-local |
| `.claude\.last-cleanup` | `2026-09-10T21:01:06.280Z` |
| `.claude\projects\…\memory\` | worktree collision, roster drift, AI division, priorities |
| `.claude\sessions\` | Mostly tiny key files; real session bodies live under `projects\` |

---

## 5. Automation landscape

| System | Where | Notes |
|---|---|---|
| **Hermes** | `Documents\Codex\projects\hermes-control\` + home `.hermes\lsp` | Full control repo (scripts, skills, Start-CursorHermesWorker.ps1); home dir is thin |
| **OmniRoute** | `.omniroute\` | `storage.sqlite` + WAL hot 2026-09-10 evening; `runtime\mcp-heartbeat.json` |
| **Buzz / SitesBridge** | Scripts under `repos\client-operations-canonical\integrations\buzz\` and `scripts\*SitesBridge*`; policy in client-ops `AGENTS.md` | Canonical Documents tree did not surface SitesBridge copies in depth-3 name search — live wiring may still be via Buzz ACP / Marketing Chief |
| **Paper-craft** | `repos\dillon-os\_os\automation\paper-craft-video\` | Present in vault automation |
| **Prospect radar** | `dillon-os\automation\prospect-radar-next15|next20` | Site factory |
| **Claude schedules** | `.claude\scheduled-tasks\` | Local report/ads/slack/forecast |
| **n8n** | `.n8n`, `.n8n-mcp` | Present; not deep-audited this pass |

---

## 6. Isolation boundaries (as on disk)

| Lane | Disk home | Guard |
|---|---|---|
| **Momentum 360 / Need Momentum** | Vault `01_Clients\Momentum 360\`; client-ops `clients\momentum-360\`; design system `Documents\Codex\momentum-design-system\`; films in Downloads + `dillon-os-films` | Employer-search guardrails **hard-block** Momentum / Need Momentum for job outreach |
| **Mohr Media / IMMOHRTAL (personal brand)** | `mohr-media-site\`, `immohrtal-site\`, `immohrtal-website` repo, `immohrtal-marketing` client folder | Separate from client revenue roster |
| **Employer search** | `02_FullTimeJob\Job Search\`, `Documents\Codex\projects\job-search-2026\`, Empeon under `02_FullTimeJob\Empeon\` | `JOB_SEARCH_GUARDRAILS.md` — never outreach to active client orgs; Align/BOM/Momentum blocked by name |
| **Former employer Align HCM** | `02_FullTimeJob\AlignHCM\` + align-* repos | operating-status: **ended 2026-09-02**; registry still marks active (stale) |

---

## 7. Video / deliverable landscape (non-3D masters, brief)

| Location | Contents |
|---|---|
| `Downloads\Claude-videos-2026-09-10\` | Anatomy of a Lead (rebuild + vertical), Search Term |
| `Downloads\Claude-videos-2026-09-09\` | Built Not Templated + `ai-division-launch-ads\` |
| `Downloads\momentum_ai_division_launch_pack\` | 30s launch mp4, storyboards, slogans |
| `Downloads\` zips/mp4s Sep 6–8 | Need Momentum AI Launch Films, Momo Living Portfolio, Field Guides, launch films |
| `repos\dillon-os-films\` | Film worktree (Momentum Brand Films campaign paths dirty) |
| Vault `01_Clients\Momentum 360\AI Division Library\` | Private videos/ebooks/blog packages |
| `repos\dillon-os\videos\` | One older notepad mp4 |
| `Videos\Codex\` | Codex video scratch |

Non-3D masters this week cluster in **Downloads Claude-videos-* + Momentum AI packs**, not in a single vault “masters” folder.

---

## Open questions / risks

See also `OPERATING-SURFACE.md` and `CLAUDE-WEEK-CLEANUP.md`. Top risks:

1. **Registry ↔ folder ↔ vault roster triple drift** (Align/Fagan still “active” in places; Nexla/Puttery/Deborah folders vs json).
2. **Shared checkout data loss** on client-operations (verified 2026-09-09).
3. **Vault not on main** + dirty tree + 40 worktrees → sessions disagree about truth.
4. **Power fault** (14 Kernel-Power 41 unclean shutdowns / 30d) — hands needed; disk untrusted for unpushed work.
5. **Approval queue bloat** — many Jul items still open; archive rule exists but file is huge.
6. **Google Ads API connector 403** — unattended collection blocked.
7. **Credential exposure items** still queued (Tock revocation unsent; Slack plaintext sets).
8. **Netlify estate** — 397 sites, ~72% no local source (RECOVERED-ASSETS).
9. `repos\client-operations-canonical` false “canonical” name.
10. Design-system “not a git repo” docs now false.

---

## Phase log

- Phase 0: box `/workspace/ceo-deep-dive` + PC `System\CEO-DEEP-DIVE-2026-09-10` created; PC briefly unreachable then recovered
- Phase 1: home / repos / Documents / Downloads / Claude mapped
- Phase 2: dillon-os INDEX, operating-status, approval-queue, AGENT_PROTOCOL, System/*
- Phase 3: client-operations AGENTS, CONTROL, clients.json, clients folders
- Phase 4: Claude handoff, plans, schedules, memory
- Phase 5: automation + isolation + video
- Phase 6: three deliverables written to PC + box

---

## 8. Craft stack addendum (Hyperframes / GPT Image 2.5 / Claude Design)

See **`CRAFT-STACK.md`** in this folder (written same session).

**Short map:**
- Hyperframes SoT: `repos\hyperframes` + `.hyperframes\` (CLI 0.8.33, 50 successful renders) + `.claude\skills\hyperframes*`
- Live pipeline: `dillon-os\_os\automation\paper-craft-video\` → Momentum deliverables `2026-09-09|10-paper-craft-*`
- GPT Image 2.5: named in `.../2026-09-09-ai-division-launch-ads\IMAGE-PROMPTS.md`; API id `gpt-image-2` in `.claude\skills\impeccable\scripts\generate-image.mjs`
- Claude Design (not Fable/Quad): `.../2026-09-07-ai-division-claude-design\` + massive `2026-09-08-claude-design-exports|ebooks`; MCP auth currently rejected
- Prefer Hyperframes over Higgsfield for new motion; HF `hf_*` / library sources are legacy plates
