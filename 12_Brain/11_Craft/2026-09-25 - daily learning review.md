---
note_type: review
status: active
created: 2026-09-25
updated: 2026-09-25
window: 2026-09-24T00:14 to 2026-09-25T00:13 America/New_York
source_refs:
  - "commit 98c6e79 (PR #418) — Codex session recovery archive + ads playbook"
  - "10_Sessions/Codex-Recovery-2026-09-23/README.md"
  - "_os/public-safety.js:82 listBrainFiles"
  - "02_Campaigns/2026-09-24 Ads Playbook - Nexla, Deb Mara, Onsite.md"
  - "System/approval-queue.md (last_scan 2026-09-15T07:04:22Z)"
  - "client-operations-canonical 1eb3bf3..2945f01"
tags: [craft, agent-infrastructure, reliability, security, daily-learning]
---

# Daily learning review — 2026-09-25

**The biggest day in six weeks shipped past every gate the estate owns.** PR #418
landed 661 files and 132,723 lines on `main` — the first merge since 2026-09-18 —
and the secret scanner did not read one of them, the approval queue did not
receive its three named decisions, and the brain layer recorded none of it. Each
of those is a different mechanism, and each failed the same way: it was pointed
at a folder the work did not land in.

## The window

`dillon-os`, four commits: `98c6e79` PR #418 (13:32 ET, Dillon), `5ca1ec3` radar
sweep, `f7c74e2` morning-brief, `dfe1cd7` vault-clean. `client-operations-canonical`,
fourteen commits `1eb3bf3..2945f01` — a shared Momentum print kit, then the AI
division one-pagers, the AI Search Snapshot and five Field Notes ebooks rebuilt on
it — merged as PRs #74–#77. `dillon-claude-config` unchanged since `c4816ae`
(2026-09-05), now twenty days.

[[12_Brain/09_Ops/AGENT_PROTOCOL|AGENT_PROTOCOL.md]] governs this run. It did not
conflict with the routine prompt on substance. It did on placement: the prompt
asks for a dated note under `12_Brain/11_Craft/`, and
`_os/automation/bin/agent-craft-brief.js:239` generates
`<date> - operating brief.md` into that same folder. This note uses the
`- daily learning review` name the routine has used since 2026-09-22, which does
not collide, and leaves the generated `00_Index.md` alone.

## VERIFIED

### The secret gate has never looked at the tree the secrets are in

`CLAUDE.md` states that `_os/test/public-safety.test.js` "fails the build on any
secret-shaped value." It fails the build on any secret-shaped value **in
`12_Brain/`**. `listBrainFiles()` at `_os/public-safety.js:82` joins `vaultRoot`
with `BRAIN_DIR` and walks that alone. Measured in this checkout: the gate scans
**902** tracked files; **2,399** tracked text files sit outside it, including all
**667** under `10_Sessions/`, **141** under `01_Clients/` and **252** under
`02_Campaigns/`.

PR #418 put 661 recovered Codex transcripts into that blind spot. Its own commit
message records the consequence: *"One Align HCM HubSpot token quoted verbatim in
a July session transcript was redacted before commit."* The redaction was correct
and it happened — by a person reading a 132,723-line diff. `node --test
_os/test/public-safety.test.js` passed 9/9 before and after, because it never
opened the file.

Running the gate's own blocking rules across the blind spot tonight returns
**12 files** still on `main`: nine in the new archive (eight `bitwarden_locator`,
including `data/all-codex-sessions.csv`; two `credential_shaped`) and three under
`System/` that predate today. `CLAUDE.md` names Bitwarden locators specifically as
a thing that must never reach a tracked file.

These are leads, not proof. `bitwarden_locator` matches the bare phrase "vault
item"; `credential_shaped` matches the word "password" followed by a colon, even
in prose. No matched value was read, and none is reproduced here or in the audit's
output. The gate does work where it looks: an earlier draft of this note quoted
that pattern literally and failed the suite, which is exactly the protection the
661 archive files never got.

### The recovery shipped its output and threw away its method

`10_Sessions/Codex-Recovery-2026-09-23/` is the richest self-observation the
estate has ever produced: 3,505 sessions and ~31 GB reduced to 655 thread notes, a
3,506-row CSV, and a hand-verified loss report. Its README documents the
extraction exactly — three passes, the four JSONL keys that matter
(`session_meta`, `task_complete.last_agent_message`, `apply_patch`, `error`), the
`task_started` minus `task_complete` abandonment test, eight regex flag classes
with their counts.

`git show --name-only 98c6e79` returns six non-thread paths. **None is code.** The
scanner that read 31 GB exists only inside the session that ran it. `.codex` keeps
growing — the archive's own peak day is 2026-09-20 at 110 sessions — and the next
pass starts from zero, by hand, over a larger corpus.

### The day's client plan named three decisions and reached no queue

`02_Campaigns/2026-09-24 Ads Playbook - Nexla, Deb Mara, Onsite.md` closes with a
section headed **"Decisions only you can make"** — ChatGPT Ads account ownership
for Deb Mara and Onsite, the Nexla negatives and conversion-goal fix, the Onsite
primary conversion — plus a drafted, unsent reply to Gracie. Exactly the class of
item `System/approval-queue.md` exists to hold.

The queue has **123 open items**, `last_scan: 2026-09-15T07:04:22Z`, and its
newest open item is dated **2026-09-14**. Ten days. And its own frontmatter
`scan_sources` lists `00_Inbox/`, `01_Clients/`, `System/urgent-replies.md`,
`System/claude-memory-sync.md` and `Daily-Briefs/` — **`02_Campaigns/` is not on
the list.** Even a working scan would have walked past this note. (That field is
documentation: nothing in `_os/` or `System/` reads `scan_sources`.)

### One PR merged in seven days, and it was the author's own

`is:merged merged:>=2026-09-18` returns exactly one result: #418, by
`dillonmohr8777`. Open PRs went 139 → **141**. Ten of them are this routine's:
#380, #384, #388, #395, #402, #405, #407, #411, #415, #417. Six are near-identical
"Umbrella competitive-task orchestrator" drafts — #381, #385, #390, #396, #397,
#413 — one reopened per week since 2026-09-07.

This is why `main` looks frozen while the estate is busy: `12_Brain/01_Captures/`,
`12_Brain/09_Ops/` and `12_Brain/11_Craft/` have no commit on `main` since
`215c09c1` (2026-09-15), and the last generated operating brief is
[[12_Brain/11_Craft/2026-09-15 - operating brief|2026-09-15]]. Everything learned
since is sitting in draft.

### Receipt streams, day ten

`12_Brain/queue/claude-loop-*.jsonl` ends `2026-09-15`; `immohrtal-crew-*.jsonl`
ends `2026-09-15`. Both had run daily without a gap before that. The cause is
already on the record in [[System/operating-status|Operating Status]] — all four
cadence tasks registered `LogonType: Interactive`, the `S4U` fix refused with
"Access is denied" on 2026-09-15 — and it still needs elevation, so it still needs
Dillon. Recorded here only as the tenth consecutive day, not as a new finding.

## INFERRED

- **The cloud loop's stated blind spot is now half open.** Every prior run of this
  routine, and `11_Agents/Daily Learning Loop (Local).md`, records session
  transcripts as gitignored and unreadable from the cloud. As of #418, 655 thread
  notes covering 2026-07-08 → 2026-09-24 are on `main` and readable here. They are
  Codex sessions, not Claude ones, and they are a frozen snapshot — but the "what
  did Dillon actually ask for" signal the local twin was built to supply is
  partially available to the cloud twin now. Both prompts still say it is not.
- **The five `client-operations` PRs were batch-merged, not reviewed.** #74 through
  #77 closed at 16:46:10, :13, :17 and :21 — eleven seconds for four PRs. Not
  wrong for self-authored design work; worth knowing when tracing a regression
  back to a review that did not happen.

## Not verified

- Whether any of the 12 flagged files holds a live credential. Verifying means
  reading the matched lines, which the machine context map forbids. This is a
  human read, and the two `System/` hits are the older risk.
- Whether the HubSpot token redacted in #418 was rotated. Not visible from here.
- Whether the local cadence layer produced anything after 2026-09-15 that was
  never pushed. Only `origin/main` is visible.
- Raw Claude session transcripts remain gitignored and were not read.
  `dillon-claude-config` `projects/*/memory/*.md` were used as the session proxy;
  all are dated 2026-08-17/18 and the repo has no commit since 2026-09-05.
- File mtimes are worthless in this container — the whole checkout carries one
  clone time. Every freshness claim above comes from git, the GitHub API, or a
  timestamp written inside a file.

## Links

- [[12_Brain/11_Craft/earned-lessons|earned-lessons]]
- [[12_Brain/09_Ops/AGENT_PROTOCOL|Agent Protocol]]
- [[System/approval-queue|Approval Queue]]
- [[System/operating-status|Operating Status]]
- [[10_Sessions/Codex-Recovery-2026-09-23/README|Codex session recovery — 2026-09-23]]
- [[10_Sessions/Codex-Recovery-2026-09-23/LOST-AND-UNFINISHED|Lost, unfinished, and still waiting]]
