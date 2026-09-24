---
note_type: index
status: complete
created: 2026-09-23
updated: 2026-09-23
scope: "All Codex session history on DESKTOP-4AHKEC4 as of 2026-09-23"
source: "C:\Users\dillo\.codex\sessions + .codex\archived_sessions"
tags: [codex-recovery, index, sessions]
---

# Codex session recovery — 2026-09-23

Every finished Codex session on this machine, read and reduced to what survives.
The transcripts stay where they are; nothing in `.codex` was moved or deleted.

## Start here

| If you want | Open |
|---|---|
| What was lost, unfinished, or is still waiting on you | **[[LOST-AND-UNFINISHED]]** |
| Every work thread, newest first, with open flags | **[[THREADS]]** |
| One thread's prompts, outcomes and files | `threads/<month>/<date>-<slug>.md` |
| Raw queryable inventory of all 3,505 sessions | `data/all-codex-sessions.csv` |

## The on-disk format

Codex writes one **JSONL rollout file per session**, one JSON object per line:

- `session_meta` (line 1) — `session_id`, ISO start timestamp, **`cwd`**, `originator`
  (`Codex Desktop` / terminal), `cli_version`, `model_provider`.
- `response_item` — the actual conversation: `message` (role `user` / `assistant` /
  `developer`), `reasoning`, function calls, `apply_patch` payloads.
- `event_msg` — lifecycle: `task_started`, `item_completed`, `token_count`, and
  **`task_complete`**, which carries `last_agent_message`.
- `turn_context`, `world_state`, `token_usage_record` — per-turn config and usage.

Two facts made this recoverable at all:

1. **`task_complete.last_agent_message` is the session's own closing report.** Codex
   writes disciplined wrap-ups naming what shipped, what is unverified, and what is
   blocked. Those messages are the substance of this archive — not reconstructed
   summaries, but what each session said about itself as it finished.
2. **`task_started` minus `task_complete` counts detect abandonment.** A session with
   more starts than completes died mid-turn. 998 sessions show that gap.

`cwd` is the thread identity: Codex Desktop creates one directory per opening prompt
(`Documents\Codex\<date>\<slugified-prompt>\`), so the path itself records the ask.

## Scale

| | Files | Size | Range |
|---|---|---|---|
| `sessions/2026/**` | 584 | 3.9 GB | 2026-08-05 → 2026-09-23 |
| `archived_sessions/` | 2,926 | 27 GB | 2026-07-08 → 2026-09 |
| **Total scanned** | **3,505** | **~31 GB** | **2026-07-08 → 2026-09-24** |

All 31 GB was read. Not all of it is work:

| Class | Sessions | What it is |
|---|---|---|
| Real work | 3,032 | Human-driven sessions |
| Automation | 214 | Smoke tests (`Reply with exactly MUSE_OK`), Watchtower workers, `/loop` role runs, 13:0x cron |
| Trivial | 169 | Under 150 KB and 90 seconds |
| No prompt | 90 | Opened, never asked anything |

Of the 3,032 work sessions, **520 are substantive** (over 20 MB of transcript or over
two hours). **1,846** produced at least one completed turn worth keeping, grouped into
**655 threads** — one note each. Peak day was 2026-09-20 at 110 sessions.

## Coverage, honestly

- **Complete:** metadata, prompts, turn accounting, `apply_patch` file writes, and every
  `task_complete` closing report for all 3,505 sessions.
- **Summarised, not transcribed:** intermediate tool calls and reasoning. The final six
  closing reports per session are kept verbatim; the step-by-step is left in the rollout
  file, whose path every note cites.
- **Curated by hand:** [[LOST-AND-UNFINISHED]] only. Every live-state claim in it was
  re-checked against the filesystem and git on 2026-09-23 — several session claims had
  gone stale.

4,921 distinct files were written by these sessions; each thread note lists its own.

## The high-value threads

| Thread | Sessions | State |
|---|---|---|
| [[2026-09-23-documents-codex-2026-09-20-find-my-very-latest-powerpoint-i\|AI division deck]] | 23 across Sep 20–23 | **Shipped.** "Disposition: ship" after post-fix review; DeerFlow live-state slide re-verified Sep 22 |
| [[2026-09-21-documents-codex-2026-09-21-pi\|DeerFlow + Docker recovery (`pi`)]] | 5, 2026-09-21 | Live app restored; **candidate never committed or deployed** |
| [[2026-09-23-documents-qwen-deer-flow-claude-worktrees-m1-integrate\|DeerFlow M1/M3 integration]] | 5, 2026-09-23 | Adversarial plan reviews, read-only |
| [[2026-09-20-documents-qwen-deer-flow\|DeerFlow mode-resolution fix]] | 1, 2026-09-20 | Fixed + 1,774 tests pass; **no commit or push** |
| [[2026-09-21-documents-codex-2026-09-21-for-the-deer-flow-terminal-hi\|DeerFlow prompt injection]] | 1, 2026-09-21 | **Never delivered** — see loss report |
| Momentum client-operations | 98 across Jul 20 – Sep 15 | Mostly cron and Watchtower noise; real work is Sep 14 (28 h) and Sep 4 SEO deep-dive |
| Mac Mini / local-model migration | Aug 26 (12.9 h), Sep 19 AI glasses | Research and planning; hardware rigging still open |

### On the DeerFlow Docker recovery

The ~8 hours extracted from running containers after the checkout was deleted **is
preserved and committed.** Verified 2026-09-23:

- `Documents/Qwen/deer-flow` is on `recover/momentum-integrate-20260921`, clean tree,
  tracking `fork/`. PRs #1 (`plan/backend-goal-20260922`) and #2
  (`m0/rescue-record-20260922`) are merged.
- `Documents/Qwen/deer-flow-deploy-20260920` — the dirty 17-tracked/10-untracked
  working copy the Sep 21 session quarantined — **no longer exists at that path.**
- Its contents survive as a patch bundle: `deer-flow-WIP-BACKUP-20260921-0347/`
  holds `HEAD.txt` (`bc99e707`, branch `codex/enterprise-fleet-20260920`),
  `tracked-changes.patch` covering **57 files**, and 8 untracked files.
  **That patch has never been applied or merged** — see [[LOST-AND-UNFINISHED]].

## How this was built

Three passes over `.codex`, read-only:

1. **Structure** — line 1 plus head/tail of every file for metadata and prompts.
2. **Content** — full byte scan of all 31 GB, JSON-parsing only lines carrying
   `task_started`, `task_complete`, `apply_patch`, or `error`; lines over 3 MB
   (embedded images) skipped past.
3. **Flagging** — eight regex classes over the closing reports: `blocked` (488),
   `unverified` (285), `unpublished` (218), `unsent` (78), `auth-expired` (73),
   `quarantined` (61), `uncommitted` (37), `waiting-on-user` (22).

Flags are what a session said about its own end state. They are leads, and several were
already stale when re-checked — trust the live verification in [[LOST-AND-UNFINISHED]]
over a flag on a thread note.
