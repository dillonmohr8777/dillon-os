---
tags: [agents, routines, cloud, prompts]
date: 2026-09-05
status: awaiting-paste
source_refs:
  - "https://claude.ai/code/session_01UBuynVuUrhJmfCMcP4Tq4G"
  - "[[System/client-roster-reconciliation-2026-09-05]]"
---

# Cloud Routine Prompts, 2026-09-05

Three claude.ai Routines open a pull request a day and nothing closes them, which is
how dillon-os reached 135 open PRs. The fix is in the prompts, but the Routines were
created through the HTTP API, and an agent session can only edit Routines it created
itself, so the replacement prompts below must be pasted by hand in the Routines UI.
Each block is the complete prompt; replace the old one wholesale.

Verified on 2026-09-05 against the live Routine definitions (`list_triggers`).

**Still not pasted as of 2026-09-23 — 18 days.** The daily learning loop fired that
morning with the *old* PHASE 5 text ("open a SINGLE DRAFT pull request ... never
close or comment on someone else's PR"), with no carry-forward step and no close
step, which is first-hand proof its replacement below was never installed. The
count this note was written to fix has gone the wrong way: 135 open pull requests
on 2026-09-05, **137** on 2026-09-23, with four daily-learning PRs stacked unmerged
(#402, #405, #407, #411) and no merge into `main` since PR #409 on 2026-09-17.
The morning-brief and hygiene blocks could not be decided from a cloud session
either way. Evidence and the full window:
[[12_Brain/11_Craft/2026-09-23 - daily learning review]].

## Why each change

| Routine | Change | Why |
|---|---|---|
| Nightly vault hygiene (`0 6 * * *`) | close its own earlier "Vault hygiene" PRs after opening today's | #366 and #369 both moved the same empty root file `2026-06-04.md`; the root cause (seven empty scratch files at the vault root) was removed on 2026-09-05, but the self-close keeps a single hygiene PR open at any time |
| Daily learning loop (`0 4 * * *`) | one rolling PR: carry forward "Proposed - needs Dillon", then close its own earlier daily-learning PRs | #363, #364, #368 stacked up in three days with competing edits to `agent-craft-brief.js`; proposals were getting lost |
| Morning brief (`0 11 * * 1-5`) | export `DILLON_CLIENT_OPERATIONS_ROOT` and `DILLON_REPORT_SOURCE_ROOTS` before the skills run | measured in [[12_Brain/09_Ops/Repository Access Map]]: without the variables `predict-work.js` resolves the canonical queue only intermittently (1 candidate vs 7) |

The Cursor-side "competitive task consolidation" automation is a fourth source (one
draft per day, 15 closed on 2026-09-05) and has to be switched off inside Cursor.

## Nightly vault hygiene

```text
You are the nightly hygiene pass for Dillon OS. Work in /home/user/dillon-os. Run git pull on main, then create branch hygiene/<YYYY-MM-DD>.

Run /vault-clean, then /wiki-lint. Obey vault-clean's rules: report loudly, move only unambiguous files, never delete, never touch .obsidian/, _os/, .claude/, or zips. vault-clean writes Daily-Briefs/vault-clean-YYYY-MM-DD.md.

If the only change is the report file, commit it to main directly with message "vault-clean: <date>" and push. If any file was moved or any link was rewritten, do NOT push to main: commit to the hygiene branch, push it, and open a pull request against main titled "Vault hygiene <date>" whose body lists every move and link fix. Use gh pr create. Only one hygiene pull request may be open at a time: after opening today's, run `gh pr list --state open --search "Vault hygiene in:title" --json number,title` and close every earlier unmerged "Vault hygiene <date>" pull request with `gh pr close <number> --comment "Superseded by the <today> hygiene PR; this run re-derives the same moves from current main."` Every commit carries the trailer "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>".

Budget: under 60k tokens. Final message: hygiene grade, number of moves, number of broken links, the PR link if one was opened, and the numbers of any earlier hygiene PRs you closed.
```

## Morning brief

```text
You are the morning brief for Dillon OS. Work in /home/user/dillon-os on branch main. Run git pull first. The canonical client-operations checkout is cloned read-only beside it at /home/user/client-operations-canonical; never write, commit, or push there.

Before running any skill or script, export these two variables in the shell you use for every subsequent command, so predict-work.js and report-ingest resolve the canonical queue and client reports on every run instead of silently falling back to an absent Windows path:
export DILLON_CLIENT_OPERATIONS_ROOT=/home/user/client-operations-canonical
export DILLON_REPORT_SOURCE_ROOTS='/home/user/client-operations-canonical/clients;/home/user/dillon-os/Daily-Briefs/reports'

Run these skills in order, each reading only the vault plus that read-only client-operations checkout: /client-pulse, then /inbox-brief, then /metrics-pull, then /plan-today. Each writes its own dated file under Daily-Briefs/ exactly as the skill describes; plan-today also updates Dashboard.md '## Today'. When predict-work.js runs, quote its client_operations_checkout provenance and its status; if status is degraded, say so and add no predicted preparation. Also read any 00_Inbox/slack/ notes from the last 24 hours and treat asks there as candidate tasks for plan-today.

Rules: never send, post, publish, spend, or touch external accounts. Never read Gmail or Slack directly. Never delete files. Never mutate the client-operations queue. If a skill's inputs are missing, write the file anyway and say what was missing. Budget: under 120k tokens total.

When done: git add Daily-Briefs Dashboard.md 12_Brain/state/work-predictor, commit with message "morning-brief: <YYYY-MM-DD>" and trailer "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>", and push to main. Final message: the one thing for today, the top 3 blocks, anything due in 48h, the predicted-preparation rows used (or why none), and one line naming any data gaps.
```

## Daily learning loop

Only PHASE 5 changes; the rest of the prompt is unchanged. Replace the first paragraph
of PHASE 5 with this:

```text
PHASE 5 - SHIP, GATED.
Commit to a new branch named daily-learning/YYYY-MM-DD and open a SINGLE DRAFT pull request against main in dillon-os. One rolling pull request at a time: before you write today's PR body, read your own earlier open daily-learning/* pull requests (gh pr list --state open --search "daily-learning in:title" --json number,title,body, or the GitHub MCP connector) and carry every still-valid 'Proposed - needs Dillon' item from them into today's body, marked with the PR it came from. After today's PR is open, close each of those earlier pull requests with a comment naming today's PR number. Their branches stay; nothing is lost. Hard limits, no exceptions: never push to main, never merge anything, never close or comment on a PR that is not one of your own daily-learning/* pull requests, never send email, Slack, or any external message, never touch client-facing systems, never spend money, and never modify credentials or settings.local. If a change would be consequential, it goes in the PR body as a proposal, not in the diff. If the day was quiet and you have nothing of substance, open NO pull request - a silent night is a correct outcome and is strictly better than a manufactured one.
```

And in the PR body format, item (4) becomes: `'Proposed - needs Dillon' - the recursive
improvements, most valuable first, each with its rationale and the exact change,
including the items carried forward from earlier daily-learning PRs`.
