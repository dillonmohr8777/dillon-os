---
note_type: review
status: partial
created: 2026-09-19
updated: 2026-09-19
owner: Dillon Mohr
verification_status: verified_with_gaps
observed_at: 2026-09-19
tags: [review, brain, estate, sessions, claude, coverage]
source_refs:
  - C:/Users/dillo/Documents/Codex/2026-09-19/pro/work/brain-checkpoint-audit.md
  - C:/Users/dillo/Documents/Codex/2026-09-19/pro/work/claude-session-coverage.md
  - C:/Users/dillo/Documents/Codex/2026-09-19/pro/work/estate-agent-coverage.md
  - C:/Users/dillo/repos/dillon-os/System/machine-context/WINDOWS-WORLD-MAP.md
  - C:/Users/dillo/repos/dillon-os/12_Brain/09_Ops/Knowledge Coverage.md
---

# Agent and source estate coverage

This is the current source map for the September 19 brain-expansion pass. It
records discovery and bounded inspection, not a claim that every transcript or
artifact was semantically reviewed.

## Canonical hierarchy

- `C:/Users/dillo/repos/dillon-os` is the canonical vault and repository. The
  observed branch was `agent-control-plane` at `b394c324`; 113 dirty entries
  predated this compilation and were preserved.
- `C:/Users/dillo/Documents/Codex/projects/dillon-os` is a separate checkout,
  not a junction or registered worktree of the canonical checkout.
- `C:/Users/dillo/repos/mohr-vault` is a separate clean reference repository.
- `Knowledge Coverage` measures fourteen strategy domains. Its 100% value is
  not filesystem, source, or session coverage.

## Source coverage snapshot

| Source | Discovered and inspected | Coverage status |
| --- | --- | --- |
| Claude local histories | 937 JSONL files: 298 top-level sessions and 639 subagent files across 49 project roots; bounded first/last metadata parsed for every file | Partial. Two recent message sequences and four memory notes received semantic review; the remaining transcript bodies are backlog. |
| Claude background/scheduled | 21 CLI background records and 11 matching scheduled-task records | Partial. September 19 cadence and job-outreach runs both ended `rate_limit`; scheduler result was `1`. |
| Claude hosted/browser/phone | Authenticated recents route attempted | Unavailable in this pass. Browser attempt timed out; no cloud or phone-history coverage claim is supported. |
| Codex histories | 157 active and 2,925 archived rollout JSONL files; 1,596 title-index rows / 1,501 unique IDs | Metadata only; deduplicated semantic recovery remains pending. |
| Cursor | 102 chat metadata records and 116 exported transcripts located | Metadata only; live app databases were not opened. |
| Grok | 17 summaries located | Summary metadata only. |
| Hermes | Supported CLI statistics reported 4,433 sessions and 118,401 messages | Metadata only. The real home is `AppData/Local/hermes`; `.hermes` is absent. |
| Work estate | 837 dated workspaces in 63 date directories; 53 repository-root directories under `repos` | Metadata inventory. Dependency trees, caches, binaries, secrets, and cloud placeholders were excluded. |

## Corrections and current evidence

- `Documents/Codex/projects/machine-context` is absent. The existing twin is
  `Documents/Codex/machine-context`.
- Current filesystem-drive metadata still shows only C: plus a Temp alias, but
  WSL has Ubuntu and docker-desktop configured. Their contents were not scanned.
- The September 19 Claude failures are provider-capacity evidence only. They do
  not contradict the separately verified Codex weekly reset and do not prove
  current Claude availability after the observation time.
- `2026-08-24 - Perfect outcome graph engineering` is an automation/web
  production project, not the estate-compilation checkpoint. Continue this work
  from `2026-07-29 - Complete Dillon OS second brain`.

## Remaining coverage

1. Select high-value Claude sessions from the 937-row index and verify their
   referenced artifacts before promoting decisions or completion claims.
2. Recover hosted Claude and phone Remote Control history through an existing
   authenticated supported route; authentication or MFA remains Dillon's gate.
3. Deduplicate Codex title/index rows by session ID and compile current project
   decisions before expanding older archives.
4. Process Cursor exports, Grok summaries, and Hermes sessions in bounded,
   client-separated batches.
5. Reconcile stale generator wording and the existing Perfect Outcome project
   contradiction in focused follow-up passes.

## Detailed evidence

- `C:/Users/dillo/Documents/Codex/2026-09-19/pro/work/claude-session-coverage.md`
  contains the 937-row Claude index and access ledger.
- `C:/Users/dillo/Documents/Codex/2026-09-19/pro/work/estate-agent-coverage.md`
  contains per-root counts, exclusions, and cross-agent locators.
- `C:/Users/dillo/Documents/Codex/2026-09-19/pro/work/brain-checkpoint-audit.md`
  contains repository identity, template, navigation, and baseline evidence.
