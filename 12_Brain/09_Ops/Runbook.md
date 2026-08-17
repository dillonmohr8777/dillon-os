---
note_type: runbook
status: active
owner: Dillon Mohr
created: 2026-07-29
updated: 2026-08-01
review_on: 2026-08-12
tags:
  - brain
  - operations
  - runbook
---

# Second Brain Runbook

## Cadence

| When | Loop | Output |
|---|---|---|
| During work | Capture | Inbox item or immutable receipt |
| Session close | Mine | Decision, correction, lesson, or nothing |
| Nightly | Compile | Updated canonical pages and resolved links |
| Daily morning | Plan | One focused project outcome and next actions |
| Friday | Review | Drift, wins, open loops, and next-week priorities |
| Monthly | Health | Property, link, freshness, and duplicate audit |
| Quarterly | Reset | 3 to 7 rocks, ownership, scorecard, and archive |

## Obsidian desktop

Obsidian is installed locally and `C:\Users\dillo\repos\dillon-os` is the
registered `Dillon OS` vault. Before agent writes, verify the selected vault and
confirm `obsidian vault="dillon-os" sync:status` reports `status: synced`.

The command-line interface is enabled once in **Settings → General → Command
line interface**. After registration, agents can use:

```powershell
obsidian vault="dillon-os" vault
obsidian vault="dillon-os" bases
obsidian vault="dillon-os" tasks todo
obsidian vault="dillon-os" unresolved counts
obsidian vault="dillon-os" properties counts
obsidian vault="dillon-os" sync:status
```

## Sync and Git lease

1. Wait until Sync is caught up.
2. Confirm no other agent is editing the same files.
3. Make a bounded change.
4. Run health checks and inspect `git diff`.
5. Let Sync catch up again.
6. Create a Git checkpoint only when the diff is coherent and reviewed.

Never use a blanket conflict resolution. Keep both sides until the meaning is
reconciled.

## Link atlas

After adding, moving, or renaming notes, rebuild the deterministic maps before
running health checks:

```powershell
System/scripts/Update-SecondBrainMaps.ps1
System/scripts/Test-SecondBrain.ps1
System/scripts/Update-SecondBrainHealth.ps1
```

The atlas groups related notes and creates a connected graph without injecting
mechanical backlinks into canonical source notes.

## Knowledge compilation

After a substantial research, campaign, automation, or delivery cycle:

1. Preserve the source note or immutable capture.
2. Update the canonical concept in `12_Brain/03_Concepts/`.
3. Add the operational model, inputs, decisions, metrics, failure modes, and
   connected template or workflow.
4. Keep hypotheses and platform-specific claims dated and source-labeled.
5. Run the coverage, map, structural, and health scripts in that order:

```powershell
System/scripts/Update-KnowledgeCoverage.ps1
System/scripts/Update-ClientIntelligenceCoverage.ps1
System/scripts/Update-SecondBrainMaps.ps1
System/scripts/Test-SecondBrain.ps1
System/scripts/Update-SecondBrainHealth.ps1
```

Structural coverage is a floor. The strategy becomes trusted only after current
source verification and real outcome evidence.

## Client overlay loop

1. Resolve the exact client through the canonical registry.
2. Read the canonical client record and newest safe evidence before the overlay.
3. Update the existing overlay; never create a competing strategy note.
4. Preserve source date, verification status, known unknowns, and account/client
   separation.
5. Compile reusable lessons into shared concepts only after removing sensitive
   client detail and preserving evidence scope.
6. Run `Update-ClientIntelligenceCoverage.ps1` after roster or overlay changes.

An overlay may propose research, experiments, drafts, and local artifacts. It
does not authorize sending, publishing, spending, account mutation, or access
expansion.

## Capture routes

- Fast thought: `00_Inbox/`.
- Web article, X thread, video, or transcript:
  `_templates/Brain Capture.md` into `12_Brain/01_Captures/`.
- Meeting: `_templates/Brain Meeting.md`.
- Choice: `_templates/Brain Decision.md`.
- Finite outcome: `_templates/Brain Project.md`.
- Time-sensitive external knowledge: `_templates/Brain Research.md`.

The official Web Clipper is the preferred browser capture route once it is
installed in the dedicated Chrome profile. It saves locally and can use
site-specific templates.

## Model routing

- Capture normalization and lint: low-cost model.
- Compile and project maintenance: balanced model.
- Cross-vault synthesis, contradiction resolution, and strategic review:
  frontier model with a fresh verifier.

## Failure handling

- Missing source: mark `unverified` and continue safe work.
- Duplicate page: stop writing, choose the canonical page, and link or merge.
- Sync conflict: preserve both versions and create a reconciliation task.
- Secret in a note: remove it from model-visible content, rotate only with
  explicit approval, and document the non-secret route only.
