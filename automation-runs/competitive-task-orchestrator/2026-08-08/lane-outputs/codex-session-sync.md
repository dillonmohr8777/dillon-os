---
scout: codex-session-sync
run: competitive-task-orchestrator
date: 2026-08-08
tier: 0
status: complete
sources_read:
  - 11_Agents/Next Codex 64GB Orchestrator Handoff 2026-07-08.md
  - 11_Agents/64gb Morning Orchestrator Spec 2026-07-08.md
  - 10_Sessions/ (7 files)
  - 12_Brain/entities/Hermes.md
  - 12_Brain/entities/Codex Workspace (Legacy).md
  - 12_Brain/entities/King Agent OS.md
  - 00_Inbox/Automation Deep Analysis 2026-07-29.md
  - handoffs/prospect-radar-blockers-2026-08-06.md
  - GROK-HANDOFF-DILLON-OS.md
  - System/competitive-task-definition.md (brief baseline)
---

# Codex Session Sync — Run 3 scout output

One-line: Codex/Cursor lanes still carry blocking radar render debt, orphaned Hermes crons, and half-ported morning-orchestrator execution — most are **not** yet named in the competitive brief.

## Durable open loops from Codex

| Loop | Source | Vault / brief tracks it? |
|---|---|---|
| **Tier 1 site grader never executed on a real page** — `auditTier1()` unproven; 144 `verify` rows blocked; empty `fonts` / `horizontalOverflow` failure mode | `handoffs/prospect-radar-blockers-2026-08-06.md` (B1) | Partial — radar daily briefs mention 1 blocked render; **not** in `competitive-task-definition.md` P0 list |
| **Grader thresholds tuned on Tier 0 only** — `REBUILD_CEILING` / `POLISH_CEILING` will mis-order queue after Tier 1 | same (B2) | No |
| **OSM under-maps home services** (167 vs 365 medical in Philly metro); best-converting vertical thin | same (B3) | No — Market Roster exists but gap not in competitive brief |
| **Stage 8 learn ledger empty** — no batch→close attribution; ranking within `rebuild` is hypothesis | same (B4) | Partial — Automation Deep Analysis lists stage-8 gap; not competitive brief |
| **Human taste validation on grader scores** — rubric weights unvalidated vs pitch judgment | same (B6) | No |
| **Align July calendar blockers** — SmartCare July 21 (no video); Maher July 15/27/31 (missing assets/URLs) | `11_Agents/Next Codex 64GB Orchestrator Handoff 2026-07-08.md` | No — Align routed in brief generically, blockers not named |
| **Sunday Momentum + Align orchestrator cadence** — do not run Momentum report pass before Align calendar cleared | same handoff §8 | No |
| **Paid-media client map stale** — reconcile Fagan + Kimberly James Google Ads; Shadow Heating ≠ Google Ads unless proven | same handoff §Scaling Ads | Partial — client notes exist; reconciliation not a competitive P0 |
| **Bridge Software client dependencies** — Tori prototype walkthrough, official brand, role model, Miraj backend contracts | `10_Sessions/Bridge Software Development - 2026-07-11.md` | Partial — `01_Clients/Bridge Software Development/overview.md` has `next_action: TBD` |
| **Nick dashboard template + checker lane** — reusable Sheets→Sites reporting; independent validation before delivery | `10_Sessions/2026-07-29 Reporting Dashboard Training.md` | No — commitments unchecked in vault |
| **Hermes orphaned** — 12 crons on retired Intel machine; rebuild vs vault-replace decision open | `12_Brain/entities/Hermes.md` | Entity only — not competitive brief |
| **76 open PR triage + local worktree** — `cursor-mobile-sync-2026-07-12` 623 mixed entries; not bulk-merge safe | `GROK-HANDOFF-DILLON-OS.md` | No |
| **W5 report data pulls** — no per-client Ads/Meta/GA4/GBP JSON fetchers for `_os/reporting/` | `00_Inbox/Automation Deep Analysis 2026-07-29.md` | Partial — Opp #5; not competitive brief P0 |
| **Mac outreach activate gaps** — prospect sheet, mail vendor (PostGrid vs StackAdapt), Netlify token for stage 7 | Automation Deep Analysis O1–O4 | Partial — pipeline spec; competitive brief mentions pipeline generically |
| **Obsidian Sync + CLI gate** on DESKTOP-4AHKEC4 — cloud/desktop `12_Brain` split | Automation Deep Analysis H0 | Partial — health automation docs |
| **Facebook Ads automation lane** — session shells empty; no durable build log | `10_Sessions/Facebook Ads *.md` | No content to track |
| **Book `/api/dossier-leads` dead** — capture broken since ~June 2 | Top 15 Opp #1, site-health sentinel | **Yes** — competitive brief + domain-ads-seo scout |

## Port candidates (Codex crons → Dillon OS)

### Already absorbed by `competitive-task-orchestrator`

| Legacy Codex lane | Dillon OS replacement |
|---|---|
| Slack intake + inbox brief | `slack-intel`, `gmail-intel` scouts |
| Client pulse | `vault-pulse` |
| AM report synthesis | `memory-consolidator` |
| Thursday SEO/content sweep | `content-routines` |
| Codex session mining | `codex-session-sync` (this scout) |
| Ads / SEO / site-health scouts | `domain-ads-seo` |

### High-value, not yet ported

| Cron / loop | Codex source | Port target | Notes |
|---|---|---|---|
| **64GB morning orchestrator daily loop** — wake → pre-flight → scout swarm → Tier 1 batch on one approval | `64gb Morning Orchestrator Spec`, handoff Lane H | `morning-orchestrator` skill + Task Scheduler on desktop | Spec exists; **Tier 1 Chrome tab execution** not in cloud orchestrator |
| **campaign-intel optimization ledger** — hypothesis → win/loss on review date | Morning Orchestrator Spec §Learning Loop | `01_Clients/<Client>/Optimization Ledger.md` + skill | Pattern documented; automation not wired |
| **2-hour money run** | King Agent OS, Top 15 Opp #12 | Scheduled skill or HUD trigger | Patterns only in entity page |
| **Hourly Gmail client-reply triage** | Top 15 Opp #12 | Gmail scout at higher cadence or webhook | Competitive orchestrator is daily |
| **Slack mention triage** | Top 15 Opp #12 | Slack scout / webhook | Daily `slack-intel` is weaker |
| **Sunday Momentum + Align orchestrator** | Handoff §8, Lane G/H | Weekly cron separate from daily competitive run | Explicit cadence rule not scheduled |
| **Daily vault dumps / session compile** | Handoff Lane H | `/vault-compile` nightly | On own cadence per competitive definition |
| **Netlify deploy manifest tracking** | Handoff §Netlify Deployment | CLI hook on report/site deploy | Manual manifests in Codex history only |
| **Hermes 12 cron jobs** | `Hermes.md` | Re-register in `12_Brain` health automation **or** deprecate | Machine orphaned — do not port blindly |
| **Align HubSpot GEO scheduling** | Handoff Lane G | `tools/hubspot-agent/` loop on desktop Codex | Not in vault automation registry |

### Low priority / empty

- Facebook Ads API automation — `10_Sessions/` files are blank templates; no Codex artifact to port.
- `10_Sessions/Automation Debug Log.md` — empty; no active debug patterns captured.

## Connector health

| Connector / surface | Status | Evidence |
|---|---|---|
| **Book signup (`/api/dossier-leads`)** | **Broken** | `Daily-Briefs/site-health-report.md`, `12_Brain/registry/properties.json`, Top 15 Opp #1 |
| **Hermes Slack** | **Broken** (`invalid_auth`) | `12_Brain/entities/Hermes.md` |
| **Hermes email/SMS/Discord/WhatsApp/Signal** | Never configured | same |
| **Gmail live MCP / sync** | **Unknown in cloud** — Codex treated Gmail as source of truth; competitive scouts prefer MCP; vault mirrors are fallback | Handoff Lane B; no live Gmail evidence in this run |
| **Slack live MCP** | **Unknown in cloud** — 4 vault slack mirrors through 2026-07-30 only | `00_Inbox/slack/` |
| **GOOGLE_PLACES_API_KEY** | **Missing** — enrichment stuck at 0.65 confidence | `prospect-radar-blockers` B5 |
| **Netlify deploy token** | **Missing** — stage 7 activate blocked | Automation Deep Analysis, radar B5 |
| **LandingFolio MCP** | Inert without `LANDINGFOLIO_TOKEN`; sandbox-only | `AGENTS.md`, Grok handoff |
| **Obsidian MCP (mohr-vault)** | Dead wiring — wrong folder, placeholder API key | Top 15 Opp #14 |
| **IMMOHRTAL forms** | Local dev does not persist; needs hosted Netlify backend | `AGENTS.md` |
| **Chrome Plugin / CDP (`127.0.0.1:9222`)** | Desktop-only; required for Tier 1 radar + Tier 1 ads batch | Handoff, Morning Orchestrator Spec |
| **OpenRouter priority profile (Hermes)** | Staged pending credits | `Hermes.md` |

## Recommended vault backfill

1. **`01_Clients/Bridge Software Development/overview.md`** — replace `next_action: TBD` with Monday-package follow-ups (Tori walkthrough, brand approval, Miraj API contract).
2. **`02_FullTimeJob/AlignHCM/` or Align project note** — add July 2026 calendar blockers (SmartCare video, Maher asset gaps) as dated `due` items; competitive brief names Align generically but not these dates.
3. **`12_Brain/projects/` or radar project** — add Tier 1 desktop validation task (handoff B1 commands on `claude/pa-business-website-grader-5vi5hx`) as tracked blocker; links PR #262.
4. **`01_Clients/` frontmatter sweep** — many `due` dates still April 2026 (`Bok Law`, `Onsite`, `CCA`, `Link Eze`, `Bar Crawl`, `Hardwood`); competitive brief references Hardwood billing but vault dates are stale vs radar/automation state.
5. **`10_Sessions/Session Index.md`** — link Bridge session + Reporting Training; index is empty.
6. **`12_Brain/entities/Hermes.md`** — add decision row: deprecate vs rebuild; competitive orchestrator should not assume Hermes crons are running.
7. **New inbox or project note for PR/worktree triage** — Grok handoff items (#205, #208, #260 umbrella) are operational debt not captured in `00_Inbox/`.

## Scout verdict for memory-consolidator

**Escalate to competitive P0 consideration (not yet in brief):**

1. Desktop Tier 1 radar proof (B1) — blocks honest build queue and 147 `rebuild` rows.
2. Book form fix — already cross-lane; keep P0.
3. Hardwood billing + stale client `due` frontmatter — brief mentions retention; vault dates need sync.

**Defer to weekly / desktop lanes:**

- Hermes rebuild decision, 76-PR triage, Sunday orchestrator, Align July calendar specifics, Bridge brand dependencies, grader taste validation (B6).

**Safe to ignore this cycle:**

- Empty Facebook Ads session templates, empty Automation Debug Log.
