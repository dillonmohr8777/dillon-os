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
  - 00_Inbox/Agent-Proposals/Cursor/2026-08-26-client-comms-desk-canary.md
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

## Final exposed roster (10)

| Exposed agent | Internal identities exposed | Primary business outcome |
|---|---|---|
| marketing-chief | Morning Marketing Chief Operator | Rank the day; delegate lanes |
| web-product-builder | Web and Product Builder | Ship surfaces locally |
| qa-critic | Independent QA + Delivery Evidence Auditor | Falsify release claims |
| paid-media-analyst | Paid Media Auditor | Honest ads delivery readbacks |
| **revenue-ops-analyst** | CRM/Revenue Ops + Reporting + Weekly Review | MRR truth, reports, capacity |
| **client-success-advisor** | Client Context Router | Onboarding, retention, separation |
| **client-comms-desk** | Comms Draft Desk + Comms Intake | Draft-only follow-up prep |
| growth-content | SEO/AEO/GEO + Brand Voice + CRO | Content and experiments |
| brain-curator | Knowledge and Obsidian Curator | Compounding vault knowledge |
| reliability-scout | Automation Reliability Scout | Loop and connector health |

## Routine rebalance (delegation view only)

Moved without changing registry `owner_bot`:

- **revenue-ops-analyst** ← D18, D19, W06, M03, W10 (from paid-media-analyst / marketing-chief)
- **client-success-advisor** ← D08, E01, M04 (from marketing-chief)
- **client-comms-desk** ← D04–D06, D20, D21, W07 (previously on no exposed agent)
- **qa-critic** ← D22, D23, E07 (Delivery Evidence Auditor; previously on no exposed agent)

All 54 routines now appear on exactly one exposed agent table.

## Rejected exposed roles (redundant)

| Tempting role | Why rejected |
|---|---|
| Grok Research Scout | Owns zero routines; `growth-content` + research-sweep already cover discovery |
| Separate Delivery Evidence Auditor | Folded into `qa-critic`; same falsification mission |
| Separate Design and Art Direction Critic | Stays merged in `web-product-builder` maker lane |
| Prospect Radar Website Factory bot | W05 stays on `web-product-builder`; not a business-outcome gap |
| Communications Intake Analyst alone | Merged into `client-comms-desk`; intake + draft is one outcome |
| Billing / invoice-chaser bot | Folded into `revenue-ops-analyst`; avoids MRR sprawl |
| Parallel Command / second marketing-chief | Violates single orchestrator contract |

## Unresolved blockers (not fixed by roster change)

- Google Ads API developer-token quota still blocks D17/D18 delivery readbacks
- Meta Ads connector not connected
- MRR unpublished until invoice evidence verified (`System/revenue-scorecard.md`)
- Raw Gmail/Slack routines remain Codex-owned; comms agent works from vault captures only
