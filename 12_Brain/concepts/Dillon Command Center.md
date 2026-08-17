---
tags: [concept, automation, orchestration]
source: "[[11_Agents/64gb Morning Orchestrator Spec 2026-07-08]]"
updated: 2026-08-17
expires: 2026-11-17
---

# Dillon Command Center

One umbrella daily automation with eight parallel lane agents — replaces fragmented morning crons and scattered Codex routines.

## What it is

The **Dillon Command Center** (`dillon-command`) is the single scheduled automation for Dillon OS. One commander (L0) fans out eight read-only scouts in parallel, synthesizes one approval board, and delivers one push (PR in cloud, notification on the 64GB machine).

- **Skill:** `.claude/skills/dillon-command/SKILL.md`
- **CLI:** `node _os/automation/bin/dillon-command.js`
- **Profile:** `_os/automation/profiles/dillon-command.json`
- **Artifacts:** `automation-runs/dillon-command/YYYY-MM-DD/`
- **Registry:** [[12_Brain/registry/automations|automations.json]] id `dillon-command`

## Eight lanes (Codex A–H mapped)

| Lane | Codex source | Primary skills |
|------|--------------|----------------|
| command | A + H | routing, board, directives |
| comms | B | [[slack-intake]], [[inbox-brief]] |
| clients | F pulse | [[client-pulse]] |
| intelligence | G intel | [[research-sweep]] |
| websites | D + E | [[site-factory]], site-health sentinel |
| outreach | Mac pipeline | [[site-batch]], discover/qualify |
| ads | C | [[metrics-pull]] |
| reporting | F delivery | [[am-report]], [[client-report]] |

## Competitive tasks consolidated

These were spread across Codex sessions, Slack, Gmail digests, and separate crons. All route through lanes above:

1. **Boss Slack loops** — bot stability, Melissa training, CallRail, Jenny brand ([[12_Brain/01_Captures/Slack/2026-07-30 Slack Open Loops|2026-07-30 capture]])
2. **Site factory + outreach** — Maps discover → qualify → batch build → mail activate ([[02_Campaigns/AI Site Builder Outreach Engine/Pipeline Spec|Pipeline Spec]])
3. **Stalled client revival** — NKCDC, Hardwood, Shadow, Omega chase list ([[00_Inbox/Top 15 Opportunities 2026-07-02|Opp #6]])
4. **Book launch blocker** — dead dossier-leads form ([[00_Inbox/Top 15 Opportunities 2026-07-02|Opp #1]])
5. **Growth Workshop** — Aug 27 webinar + franchise email engine ([[02_Campaigns/Growth Workshop/Growth Workshop|Growth Workshop]])
6. **Report factory** — Align + M360 monthly HTML ([[00_Inbox/Top 15 Opportunities 2026-07-02|Opp #5]])
7. **Ads ops + billing** — Replenish billing risk, disapprovals, optimization ledgers
8. **Align delivery** — SmartCare tools, SEO blogs (full-time lane, not M360)
9. **Intelligence** — Grok/X daily scout + experiment queue
10. **28 Codex automations** — Gmail triage, money run, vault dump → lane ports ([[00_Inbox/Top 15 Opportunities 2026-07-02|Opp #12]])

## What it replaces

- Three-step morning loop (slack-intake → am-report → client-pulse as separate scheduled agents)
- Duplicate daily-orchestrator PR runs (see [[GROK-HANDOFF-DILLON-OS]])
- Per-lane crons without a commander

## Operator setup

See `handoffs/Dillon Command Center Scheduled Agent Setup.md`.

## P0 tie-break

launch blocked > billing risk > ad disapprovals > calendar hard deadline

## Related

- [[11_Agents/Master Agent]] — commander role
- [[11_Agents/64gb Morning Orchestrator Spec 2026-07-08]] — tier + parallel contract
- [[11_Agents/Next Codex 64GB Orchestrator Handoff 2026-07-08]] — Codex lane source
- [[12_Brain/entities/King Agent OS]] — prior command-center patterns
- [[00_Inbox/Automation Deep Analysis 2026-07-29]] — automation registry contract
