---
note_type: review
status: active
created: 2026-09-17
updated: 2026-09-17
source_refs:
  - "commit a95a0db"
  - "commit c2f9504"
  - "commit 05a8c97"
  - "commit 42ae1b6"
  - ".github/workflows/sync-momentum-console.yml"
  - "Daily-Briefs/wiki-lint-2026-09-16.md"
  - "Daily-Briefs/vault-clean-2026-09-16.md"
tags: [craft, agent-infrastructure, daily-learning]
window: 2026-09-15T12:00 to 2026-09-17T00:00 ET
---

# Daily learning review — 2026-09-17

Two things happened worth keeping. A scheduled workflow that would have run
unreviewed code with Cloudflare credentials existed on `main` for five minutes
and was closed by a human reading it, not by any check. And the two hygiene
routines that ran the same night both graded the vault on numbers that are not
true.

## The window

Six commits, all in `dillon-os`. `dillon-claude-config` has not moved since
`c4816ae` (2026-09-05); `client-operations-canonical` has not moved since
`e9be4e0` (2026-09-15).

| Time (ET) | Commit | What |
|---|---|---|
| 09-16 02:11 | `42ae1b6` | vault-clean + wiki-lint reports for 09-16 |
| 09-16 07:24 | `a8037e0` | morning-brief: plan, metrics, pulse, work prediction |
| 09-16 11:29 | `0536d01` | radar sweep: +2 found, 2 re-graded, 1 rendered, 1477 tracked |
| 09-16 17:01 | `05a8c97` | deploy workflow for the momentum-console Worker |
| 09-16 18:18 | `c2f9504` | scheduled D1 sync for the cloud console |
| 09-16 18:23 | `a95a0db` | security: close poisoned pipeline in the sync workflow |

## VERIFIED — a poisoned pipeline was open for five minutes

`c2f9504` put a workflow on `main` that ran every 30 minutes
(`cron: '17,47 * * * *'`, 48 unattended runs a day). It checked out the
**moving branch** `agent-control-plane` and ran that branch's
`_os/automation/bin/sync-cloud-console.js` with `CLOUDFLARE_API_TOKEN` and
`CLOUDFLARE_ACCOUNT_ID` in env. The workflow file had to live on `main` —
GitHub only fires schedules from the default branch — but the code it executed
did not, and was not reviewed. Anyone able to write that branch could have
rewritten the script and had it run with the account token.

`a95a0db`, five minutes later, removed the schedule, pinned the ref to the
reviewed commit `89d1471`, and left `workflow_dispatch` only, with the reason
written into the file's header where the next editor will read it.

The other four workflows were checked and do not share the shape:
`deploy-momentum-console-worker.yml`, `deploy-radar-d1-worker.yml` and
`workshop-lp-deploy.yml` are dispatch-only; `radar-daily.yml` is scheduled but
checks out `${{ github.ref_name }}`, which under a schedule trigger is the
default branch.

**What the fix cost, and nothing says so.** The D1 mirror behind
`momentum-console.workers.dev` now has no scheduled sync at all. The console was
built, in its own words, "so the cloud console shows live roster state instead
of a frozen snapshot." It is now a frozen snapshot that updates only when
somebody dispatches the workflow by hand, and the page does not say when it was
last filled. The pin is also a dangling obligation: the header says to set the
ref to `main` once [PR #406](https://github.com/dillonmohr8777/dillon-os/pull/406)
lands, and nothing outside that comment tracks it.

## VERIFIED — the nightly hygiene pair graded the vault on fabricated counts

`42ae1b6` committed two reports. `Daily-Briefs/wiki-lint-2026-09-16.md` opens
with **"Lint Status: ⚠️ FAILING — Critical INDEX sync issue"** and rests it on
three numbers. All three are wrong when counted:

| Reported | Counted |
|---|---|
| "220+ empty link stubs `[[]]` in `12_Brain/INDEX.md`" | **0** in that file. Vault-wide, exactly **3** tracked files contain the pattern, and **2 of them are these two reports** quoting it. The third is one placeholder in `_templates/Client.md`. |
| "**53 orphan pages** … not listed in INDEX.md" | **5**. Of the 54 names it listed, 47 are indexed — **40 of them in `12_Brain/INDEX.md`**, the exact file the skill names. |
| Dead links (`wiki-lint-2026-09-10.md`, same check) | 7 of 7 sampled targets exist on disk. Most of the list is full-path wikilinks that resolve fine. |

The real state, counted: **0 empty stubs, 7 unresolved links, 5 orphan pages.**
The five orphans are [[12_Brain/02_Entities/Chronos-2|Chronos-2]],
[[12_Brain/02_Entities/Momentum Design System|Momentum Design System]],
[[12_Brain/02_Entities/TimesFM|TimesFM]],
[[12_Brain/03_Concepts/Dillon Voice Profile|Dillon Voice Profile]] and
[[12_Brain/03_Concepts/OpenAI Agents API|OpenAI Agents API]].

`Daily-Briefs/vault-clean-2026-09-16.md` is the same shape one grade milder:
**B+**, "Many empty wiki-link stubs `[[]]` scattered across the vault," and
**"Actions Taken: None."** It has now flagged the same two empty files —
`00_Inbox/2026-04-09.md` and `00_Inbox/Dryer Vent John.md` — on 09-14 and 09-16
and moved neither. Its own skill authorises INDEX sync and renamed-link repair
as direct fixes, and the report carries no `git diff --stat` because there was
no diff.

Both routines are chat-session skills, not programs. That is the mechanism:
nothing counted, so the counts came from a model's impression of a grep.

## INFERRED

- The five-minute close on the poisoned pipeline reads as the same session
  catching itself: `c2f9504` and `a95a0db` both carry a Claude Opus 5
  co-author trailer, `05a8c97` a Sonnet 5 one. No log proves who noticed.
- The hygiene reports are improvised rather than generated. Two reports six days
  apart use different section headings, different grading vocabularies and
  different orphan definitions. That is what an unprogrammed count looks like,
  but no run receipt was read to confirm it.
- The `[[]]` figure most likely came from matching `[[` rather than `[[]]`.
  Unprovable; the report shows no command.

## NOT VERIFIED

- Session transcripts. Gitignored, genuinely unreachable from the cloud. None
  were read and nothing here derives from them.
- Local and unpushed work on the Windows box, including whether anything there
  dispatches the sync workflow by hand.
- Whether `momentum-console.workers.dev` is in fact serving stale data. The
  inference is from the workflow file; the live surface was not probed.
- Whether `89d1471` is still the intended pin, and whether PR #406's head
  (`20ee2e3`) has since changed the sync script.
- File mtimes in this checkout are all clone time (2026-09-17 00:02), so `git
  log` is the only evidence base for the window. The mtime sweep the routine
  brief asks for returns nothing usable here.

## What this says about the machinery

1. **The credential boundary held because a person read the file.** Nothing in
   `_os/test/` checks workflow shape, and the vault's one build gate,
   `public-safety.test.js`, tests for secret-shaped *values*, not for a
   pipeline that hands a secret to unreviewed code. The near-miss was caught,
   and the estate learned nothing mechanical from it.
2. **A grade computed from unverified counts is worse than no grade.** It costs
   a run, it cannot be diffed against last night, and it is unactionable — which
   is why three weeks of these reports have produced zero moves. Fixed tonight
   for checks 1 and 2 by giving the routine a program to call:
   `_os/automation/bin/wiki-lint-check.js`.
3. **A security fix that silently stops a data feed is half a fix.** Removing
   the schedule was right. Leaving the console with no freshness stamp and the
   un-pin tracked only in a code comment is the part still open.

## See also

- [[12_Brain/11_Craft/earned-lessons|Earned lessons]] — both lessons appended
  there tonight.
- [[12_Brain/02_Entities/Cloudflare D1 Radar|Cloudflare D1 Radar]] — the other
  Worker sharing these Cloudflare secrets.
- [[12_Brain/09_Ops/AGENT_PROTOCOL|Agent Protocol]] — the "treat missing
  evidence as missing" rule is what the VERIFIED / INFERRED split implements.
