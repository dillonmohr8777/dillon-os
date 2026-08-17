---
note_type: architecture
status: proposed
owner: Dillon Mohr
created: 2026-08-12
updated: 2026-08-12
review_on: 2026-09-12
verification_status: partial
source_refs:
  - "[[12_Brain/09_Ops/Architecture]]"
  - "[[12_Brain/09_Ops/AGENT_PROTOCOL]]"
  - "[[12_Brain/09_Ops/Schema]]"
  - "[[12_Brain/protocols/approval-tiers]]"
  - "11_Agents/claude-operating-team.json"
  - "11_Agents/claude-stage-discrepancy-ledger.json"
  - "C:/Users/dillo/Documents/Codex/projects/client-operations/AGENTS.md"
  - "C:/Users/dillo/Documents/Codex/projects/agent-vault/AGENTS.md"
tags:
  - brain
  - architecture
  - agents
  - proposal
---

# Claude Target Architecture Proposal

**Status: PROPOSAL. Nothing in this note has been migrated.** Codex acting as
Marketing Chief remains the sole orchestrator, final verifier, and only canonical
writer. Every migration row below is approval-gated.

This note answers the original architecture assignment against the now-complete
agent system: eleven layers, exact source and target paths, classification,
migration order, rollback, validation, and what must never be duplicated.

## 1. Classification vocabulary

| Class | Meaning | Write rule |
|---|---|---|
| **canonical** | The one true record | Exactly one writer, named |
| **generated** | Deterministically derived | Regenerate, never hand-edit |
| **read-only** | Consumed, never written here | No writes at all |
| **proposed** | Awaiting Codex reconciliation | Append-only proposal lane |
| **deprecated** | Superseded; retire on approval | No new writes |

## 2. Eleven-layer target architecture

| # | Layer | Canonical home | Class | Writer | Current defect |
|---|---|---|---|---|---|
| 1 | Persistent memory | Agent Memory, 32 isolated spaces | canonical | vault sync only | none; isolation verified |
| 2 | Episodic evidence | `12_Brain/01_Captures/`, `12_Brain/queue/*.jsonl` | canonical, append-only | any agent, append | none |
| 3 | Semantic knowledge | `12_Brain/02_Entities`–`06_Research` | canonical | update-before-create | `02_Entities` holds only a README |
| 4 | Procedures / skills | `.claude/skills/` (21), `_os/automation/bin` (17) | canonical | human + review | 16 automations vs 2 workflow JSONs |
| 5 | Correction learning | `client-operations/state/corrections.jsonl` | canonical | `Record-MarketingCorrection.ps1` only | `12_Brain/08_Memory` duplicates the intent with 1 note |
| 6 | Queues | `client-operations/queue/work-items.json` (rev 411) | canonical | Marketing Chief only | `System/approval-queue.md` is a second surface |
| 7 | Approvals | queue `approval` + `12_Brain/protocols/approval-tiers.md` | canonical policy | Marketing Chief | 131 duplicate items in the vault surface |
| 8 | Agent definitions | `11_Agents/claude-operating-team.json` (this build) | canonical | regenerate from Grok sources | 5 loose pre-bench specs in `11_Agents/` |
| 9 | Evaluations | `System/scripts/Test-*.ps1` + `12_Brain/queue/*.jsonl` | canonical | additive | none; four validators now exist |
| 10 | Checkpoints | `12_Brain/state/*.json` | canonical runtime | owning automation | 45 of 54 routines have no checkpoint |
| 11 | Archival | `12_Brain/07_Reviews/`, `client-operations/backups/` | canonical | dated append | `10_Sessions/` is a stale parallel archive |

## 3. Exact migration map

Every row is **approval-gated**. Order matters: rows are grouped so that no row
depends on a later one.

| # | Action | Source → Target | Class after | Rollback | Validation |
|---|---|---|---|---|---|
| A1 | Retire second approval surface | `System/approval-queue.md` → generated projection of `client-operations/CONTROL.md` | generated | file is in git history; restore from `origin/main` | `Test-ClaudeInvariants -Only B4` must report `clean` |
| A2 | Sweep resolved incident items | 131 Hermes lines → deleted | canonical | git restore | B4 duplicate_ratio < 0.25 |
| A3 | Retire ghost status notes | `System/routine-health.md`, `System/m360-leadership-notes.md` (both 119d) → `12_Brain/07_Reviews/Archive/` | deprecated | move back | `Test-SecondBrain.ps1` 0 errors |
| A4 | Regenerate stale status | `System/operating-status.md` (24d) → refreshed from registry + roster | canonical | git restore | client counts reconcile 24/22/14/26 |
| A5 | Retire loose agent specs | `11_Agents/{Google Ads,Master,Reporting,SEO,Web} Agent.md` → `11_Agents/Archive/` | deprecated | move back | `Test-ClaudeOperatingTeam.ps1` 32/32 |
| A6 | Fix numbering collision | `02_FullTimeJob/` → `08_FullTimeJob/` | canonical | reverse move | `Update-SecondBrainMaps.ps1` then `Test-SecondBrain.ps1` |
| A7 | Repoint empty memory layer | `12_Brain/08_Memory` Bases → `corrections.jsonl` read-only view | read-only | restore Base file | `Test-SecondBrain.ps1` 0 errors |
| A8 | Move site source out of vault | `immohrtal-site/`, `mohr-media-site/`, `philly-sites/` → `C:\Users\dillo\repos\` | read-only | move back | vault md count unchanged |
| A9 | Retire stale session archive | `10_Sessions/` → `12_Brain/07_Reviews/Archive/Sessions/` (keep `Session Index.md`) | deprecated | move back | 0 broken wiki-links |
| A10 | Root cleanup | 5 zips, 7 `Untitled*.canvas`, 2 `Untitled*.base` → deleted or `08_Assets/` | — | git history / recycle | `Test-SecondBrain.ps1` warnings 0 |

**Collision avoidance.** A6 and A9 move files that `12_Brain/10_Maps/Generated/`
links. Run `Update-SecondBrainMaps.ps1` **after** each move and **before** the
health check, per `Runbook.md`. Never run a move while Obsidian Sync is mid-flight
or another automation is writing — `System/gateway-health.md`, the Maps
generator, and `report-brain-ingest` all wrote during this session's window.

**Never duplicate, under any circumstance:**

1. Client routing identity outside `client-operations/registry/clients.json`.
2. Work state outside `queue/work-items.json`.
3. Approval state outside the queue plus the tier policy note.
4. Corrections outside `corrections.jsonl`.
5. Agent definitions outside `11_Agents/claude-operating-team.json`.
6. Client truth copied from `01_Clients/` into `12_Brain/`.
7. Any secret, in any layer, ever.

## 4. Phasing

**24 hours** — A1, A2 (approval surface), plus the Phase 1 items still open:
repository visibility decision, credential rotation, branch triage.

**7 days** — A3, A4, A5 (ghost layers and stale status), then run all four
validators as one gate.

**30 days** — A6 through A10 (structural moves), define the 37 missing budget
ceilings and 45 missing checkpoints, then re-run `Invoke-ClaudeLoop.ps1` and
measure how far autonomy eligibility rises above the current 1 of 54.

## 5. What this proposal deliberately does not do

It does not create a new repository, a second queue, a second approval surface,
a scheduler, or a parallel command center. It does not migrate anything. Nine of
its ten migration rows are deletions, moves, or regenerations of material that
already exists.
