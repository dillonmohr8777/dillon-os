---
note_type: review
status: active
created: 2026-09-02
updated: 2026-09-02
source_refs: ["System/scripts/Test-SecondBrain.ps1", "Daily-Briefs/vault-clean-2026-09-02.md"]
tags: [vault-clean, hygiene, generated]
hygiene_grade: B
errors: 0
warnings: 32
unresolved_wikilinks: 31
graph_components: 1
graph_coverage: 100
---

# Vault clean - 2026-09-02

Conservative sweep. Report loudly, move rarely. Nothing deleted.

**Hygiene grade: B.** Health check 0 errors, 32 warnings (was 38 at session start,
graph was 2 components, now 1 at 100% coverage with 0 orphans). The remaining warnings
are one class of debt: compiled notes citing captures that were never landed.

## Moves performed

| From | To | Why |
|---|---|---|
| `2026-06-04.md` (0 bytes, vault root) | `07_Daily_Notes/2026-06-04.md` | `.obsidian/daily-notes.json` names `07_Daily_Notes` as the daily-notes folder; the folder did not exist yet and was created. |

## Fixes performed (link hygiene, no content change)

- `12_Brain/03_Concepts/Context Economy.md` and `Second Brain Architecture.md`: the prose
  examples `[[wikilinks]]` and `[[link]]` are now inline code, so they stop registering as
  dead links. The same examples inside `01_Captures/2026-07-04 - obsidian-second-brain-article.md`
  are left alone: captures are immutable, and those two warnings are expected.
- `12_Brain/02_Entities/LandingFolio MCP.md`: the wikilink to `12_Brain/registry/automations`
  (a JSON file, never a note) is now a plain path.
- `.claude/skills/slack-intake/SKILL.md`: the client link template now points at
  `01_Clients/<Client>/overview`, the convention every client folder follows. Today's
  intake note `00_Inbox/slack/2026-09-02-mac-kjb-conversion-check.md` still carries the
  old form; it is inbox capture and was not edited. The `.agents/` mirror of the skill has
  the same defect and is not mine to edit.
- `System/scripts/Test-SecondBrain.ps1`: `.canvas` files are now indexed as link targets, so
  the front door's `[[12_Brain/Brain Map.canvas]]` resolves instead of warning every run.
- Maps regenerated after the move (`Update-SecondBrainMaps.ps1`), which closed the
  second graph component.

## Proposed moves and removals awaiting a human call

| File | Size | Proposal |
|---|---|---|
| `NUL` (vault root) | 0 B | Delete. A Windows redirect artifact from a shell command, not a note. |
| `Untitled 1.base` (vault root) | 0 B | Delete, or name it and add a view. It is the `empty_scratch_base` warning. |
| `Untitled 2.canvas` .. `Untitled 6.canvas` (vault root) | 2 B each (`{}`) | Delete. Empty canvases from Jul 29 to Aug 7. |
| `00_Inbox/Untitled.base`, `Untitled.canvas`, `Untitled 1.canvas` | scratch | Delete after review. |
| `GROK-HANDOFF-DILLON-OS.md` (vault root) | 9.4 KB, snapshot 2026-08-06 | Move to `11_Agents/Rockbot Operating System/` (Grok handoff material lives there) or `12_Brain/01_Captures/`. Ambiguous, so not moved. |

[[12_Brain/09_Ops/Claude Target Architecture Proposal|Architecture Proposal]] row A10 already
lists this root clutter; this brief is the evidence. Health baseline and history live in
[[12_Brain/09_Ops/Health|Brain Health]]; the loop-side lessons from the same session are in
[[12_Brain/11_Craft/00_Index|Agent Craft]].

## Broken links (31)

| Count | Target | Where | Reading |
|---|---|---|---|
| 16 | `12_Brain/01_Captures/2026-06-26 - intel-core-7-master-operating-transfer` | Hermes, King Agent OS, Access Verification Discipline, Draft-First Operating Rules, Evidence Boundaries in Reporting, Google Docs Sharding Pattern, Netlify Deploy Safety, Truth Hierarchy | Capture never existed: not in this repo, not deleted in git history, not in `Documents/Codex`, `.codex/memories`, or `repos`. These notes cite a source that was never landed. |
| 6 | `12_Brain/01_Captures/2026-07-04 - full-autonomy-directive` | Conversion Tracking Setup 2026, Google Ads Conversion Optimization 2026, Meta Lead Ads Optimization 2026 | Same: never existed. |
| 2 | `12_Brain/01_Captures/2026-07-04 - lost-clients-confirmation-2` | Leading Indicators | Same: never existed. |
| 3 | `02_Campaigns/Ads Ops/Ads Ops Hub` | the three 2026 ads concepts | No such hub; `02_Campaigns/` holds the ads queues flat. Either create the hub note or retarget to `02_Campaigns/Campaign Index`. |
| 1 | `01_Clients/Kimberly James Bridal` | today's Slack intake note | Template defect, fixed at the source; this note is inbox capture. |
| 1 | `Blissful Zen Spa` | Access Verification Discipline | No client or prospect note by that name. `zenspatropicana.com` appears in connector state; may be the same business under another name. |
| 2 | `wikilinks`, `link` | the Obsidian article capture | Prose examples inside an immutable capture. Expected. |

The 24 dead capture references are the real debt. The writing rule says a claim with no
source is labelled `unverified`, never given an invented one. That relabel is wiki-lint's
job, not a hygiene move, so it is handed to `/wiki-lint` rather than done here.

## Empty or near-empty notes (13 of 911 scanned)

Zero-byte: `00_Inbox/2026-04-09.md`, `00_Inbox/Dryer Vent John.md` (plus the daily note
moved above). Two-line stubs: `01_Clients/Onsite Concrete/{content-calendar, brand-guidelines,
active-campaigns}.md`, `01_Clients/Tags 2 Go/content-calendar.md`, `01_Clients/Omega Landscaping/content-calendar.md`,
`01_Clients/Shadow HVAC/content-calendar.md`, `01_Clients/Capsule & Tonic/overview.md`.
Three others are test fixtures and belong that way. Client stubs are canonical client truth
and were not touched.

## Stale inbox (21 of 66 items older than 14 days)

- `Top 15 Opportunities 2026-07-02.md` (last touched 2026-07-29): still the cited source for
  five open approval-queue items. Keep until those close.
- Four `00_Inbox/slack/2026-07-30-*` requests: each has an open approval item dated 2026-08-13
  or 2026-08-14. Keep until answered.
- `Automation Deep Analysis 2026-07-29.md`, `Start Here.md`: reference material, fine to stay.
- Nine dated `Agent-Proposals/Claude/*` packages from 2026-08-12 to 2026-08-17: superseded by
  later daily packages. Candidates for `12_Brain/07_Reviews/Archive/`.
- `2026-04-09.md`, `Dryer Vent John.md`: empty. Candidates for deletion after a glance.
- `Untitled.base`, `Untitled.canvas`, `Untitled 1.canvas`: scratch.

## Also swept this session (outside this skill's scope, recorded for the trail)

`System/approval-queue.md` went from 200 lines to 69: 132 duplicate Hermes Gateway storm
lines consolidated into one item (Architecture Proposal row A2), four stray items moved
above the Rules header. The gateway is quiet (conflicts 0/0/0 at 2026-09-02T15:31Z).
