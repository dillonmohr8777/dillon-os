---
note_type: decision
status: accepted
owner: Dillon Mohr
created: 2026-08-26
updated: 2026-08-26
decided_at: 2026-08-26
review_on: 2026-09-09
source_refs:
  - System/scripts/Build-ClaudeAgents.py
  - 11_Agents/claude-operating-team.json
  - Daily-Briefs/plan-2026-08-26.md
  - 00_Inbox/Agent-Proposals/Cursor/2026-08-26-revenue-ops-analyst-canary.md
  - 00_Inbox/Agent-Proposals/Cursor/2026-08-26-client-success-advisor-canary.md
  - 00_Inbox/Agent-Proposals/Cursor/2026-08-26-prospect-intelligence-scout-canary.md
  - automation/prospect-radar-next20/runs/20260826-232808/PREFLIGHT-EVIDENCE.json
tags:
  - decision
  - agents
  - immohrtal
  - operating-layer
---

# Ten-agent business operating roster

## Decision

Expand the exposed IMMOHRTAL worker layer from seven to **ten** runnable agents by
combining existing governed specialist identities. Do not add parallel roles or change
`owner_bot` in `11_Agents/claude-operating-team.json`. Regenerate `.claude/agents/`,
`.codex/agents/`, and user-level Claude installs from `System/scripts/Build-ClaudeAgents.py`
only.

Codex acting as Marketing Chief remains the sole canonical queue writer and final
synthesis authority. Cursor and all specialists are workers.

## Correction (2026-08-26)

The first commit exposed `client-comms-desk` with six routines that are entirely
`claude_role: never` / Codex-owned-refuse — a misleading "runnable" table with no
executable gap closed. Replace it with **`prospect-intelligence-scout`**, exposing the
existing **Grok Research Scout** identity as an ad-hoc, read-only pre-W05/W07 worker.

- **Zero scheduled routine IDs** on the scout. W05 stays on `web-product-builder`; W07
  stays Codex-owned.
- Codex-owned comms routines (D04–D06, D20–D21, W07) move to the **marketing-chief**
  delegation table only — still refuse at execution time.
- Canary evidence: W05 run `20260826-232808` blocked at 4/20 source-ready; scout classifies
  held rows from stored preflight without live reverification.

## Final exposed roster (10)

| Exposed agent | Internal identities exposed | Primary business outcome |
|---|---|---|
| marketing-chief | Morning Marketing Chief Operator | Rank the day; delegate lanes |
| web-product-builder | Web and Product Builder | Ship surfaces locally |
| qa-critic | Independent QA + Delivery Evidence Auditor | Falsify release claims |
| paid-media-analyst | Paid Media Auditor | Honest ads delivery readbacks |
| **revenue-ops-analyst** | CRM/Revenue Ops + Reporting + Weekly Review | MRR truth, reports, capacity |
| **client-success-advisor** | Client Context Router | Onboarding, retention, separation |
| **prospect-intelligence-scout** | Grok Research Scout | Pre-W05/W07 source readiness |
| growth-content | SEO/AEO/GEO + Brand Voice + CRO | Content and experiments |
| brain-curator | Knowledge and Obsidian Curator | Compounding vault knowledge |
| reliability-scout | Automation Reliability Scout | Loop and connector health |

## Routine rebalance (delegation view only)

Moved without changing registry `owner_bot`:

- **revenue-ops-analyst** ← D18, D19, W06, M03, W10 (from paid-media-analyst / marketing-chief)
- **client-success-advisor** ← D08, E01, M04 (from marketing-chief)
- **marketing-chief** ← D04–D06, D20, D21, W07 (Codex-owned comms; delegation visibility only)
- **qa-critic** ← D22, D23, E07 (Delivery Evidence Auditor; previously on no exposed agent)
- **prospect-intelligence-scout** ← **zero** scheduled routines (ad-hoc only)

All 54 routines appear on exactly one exposed agent table. Only the scout may have zero rows.

## Rejected exposed roles (redundant)

| Tempting role | Why rejected |
|---|---|
| **client-comms-desk** | Entire routine table is Codex-owned refuse — not a runnable gap |
| Separate Grok Research Scout scheduler | RF1 already owns 0/54; expose ad-hoc via scout instead |
| Separate Delivery Evidence Auditor | Folded into `qa-critic`; same falsification mission |
| Separate Design and Art Direction Critic | Stays merged in `web-product-builder` maker lane |
| Prospect Radar Website Factory bot | W05 stays on `web-product-builder`; scout prepares source only |
| Communications Intake Analyst alone | Codex-owned on raw Gmail/Slack; orchestrator table only |
| Billing / invoice-chaser bot | Folded into `revenue-ops-analyst`; avoids MRR sprawl |
| Parallel Command / second marketing-chief | Violates single orchestrator contract |

## Unresolved blockers (not fixed by roster change)

- Google Ads API developer-token quota still blocks D17/D18 delivery readbacks
- Meta Ads connector not connected
- MRR unpublished until invoice evidence verified (`System/revenue-scorecard.md`)
- Raw Gmail/Slack routines remain Codex-owned; scout never drafts outreach
- W05 source-ready pool blocked at 4/20 on run `20260826-232808` (stored preflight evidence)
