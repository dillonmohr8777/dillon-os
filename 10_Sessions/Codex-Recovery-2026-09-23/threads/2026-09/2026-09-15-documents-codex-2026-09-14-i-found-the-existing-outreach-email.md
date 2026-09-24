---
note_type: session-recovery
status: recovered
created: 2026-09-23
updated: 2026-09-23
session_first: 2026-09-15T03:18:20
session_last: 2026-09-15T03:18:20
session_count: 1
cwd: "C:\Users\dillo\Documents\Codex\2026-09-14\i-found-the-existing-outreach-email"
open_flags: [unverified]
tags: [codex-recovery, session, 202609]
---

# Documents\Codex\2026-09-14\i-found-the-existing-outreach-email

**1 session(s)** · 2026-09-15 03:18 → 2026-09-15 03:18 · 15.5h agent-time (summed; sessions may overlap) · 13 MB transcript · 11/11 turns completed

> **Open flags:** `unverified`

## 1. 2026-09-15 03:18 · 15.5h · 12.9 MB

`01a0a312-9b8b-76d2-a4fa-031f3be03c5a` · turns 11/11 · flags: unverified

**Asked:**

> I found the existing outreach-email engine (40 scripts, no role shortlist, scheduled task unregistered). I'll rank today's roles into a deduped daily shortlist while checking the engine's config, autonomous sending behavior, and where top roles' apply forms live.
> 
> Gathering several independent pieces in parallel: each top role's apply form location, the evidence ledger text for tailoring, the shared answer profile, the status of the existing harvester, and the scoring rules to refine.
> 
> Indeed blocks the headless browser, so I can't submit Indeed-Apply roles directly, but the harvester still pulled 916 postings—I'll build a scored daily shortlist on top of that. Now checking the scorer and dedup interfaces to reuse them, and running web searches to find employer-direct apply pages.
> 
> I'm writing the daily shortlist script (harvesting listings, deduping against your log, scoring with a 90k 

**Outcome reported:**

> **Configured. You still have 24% of your Codex weekly allowance remaining**, resetting **September 19 at 4:30 AM Eastern**.
> 
> - **Sessions:** Luna low is now the saved default. Workers also default to Luna low, with concurrency capped at one. Automatic delegation is disabled by instruction; demanding work stays GPT-5.5 xhigh.
> - **Automations:** Paused 10 routines and reduced scheduled Codex wakeups from approximately **64 to 6 daily**. Essential communications, commitments, Google Ads, and portfolio checks remain active.
> - **Job search:** Kept the Windows shortlist and direct Claude outreach task enabled. Paused the duplicate Codex outreach launch.
> 
> Installed the [session workflow and rollback instructions](C:/Users/dillo/Documents/Codex/2026-09-14/i-found-the-existing-outreach-email/usage-conservation-2026-09-15/README.md). Saved-configuration checks passed. **Existing open tasks retain their selected model**—choose Luna low in those for routine work. Optional routines remain paused pending the reset review.
> 

> Paste this into your **main coordinator task** at the start of a working session:
> 
> ```text
> Start my work session as Marketing Chief.
> 
> Read C:\Users\dillo\.codex\AGENTS.md and inspect my existing tasks and their latest checkpoints.
> 
> Coordinate the relevant worker sessions. Prioritize my current request, job opportunities, and urgent client commitments.
> 
> Queue bounded assignments and dispatch one worker at a time. Reuse existing tasks and completed research. Give each worker one outcome, exact source files, and a clear completion check.
> 
> Use Luna low for routine work and GPT-5.5 xhigh when demanding work requires it. Use Astra only if I explicitly request it.
> 
> Check my Codex allowance once. Follow the conservation workflow, keep optional automations paused, and avoid duplicate research or unnecessary review loops.
> 
> Execute the highest-priority authorized work now. Verify each result, stop finished workers, and save a short checkpoint so the next session can continue.
> ```
> 
> **One coordinator manages the workers.** This prompt coordinates across your existing tasks while keeping worker execution sequential to conserve your remaining allowance.

> **Yes. I found actual APIs that submit job applications—not just APIs that return job listings.** The strongest candidates for your Claude workflow are **Apply Guy** and **The Boring Project**. If you want a ready-made app with less setup, **JobCopilot** is worth testing.
> 
> I checked official product pages, API documentation, pricing, and support information as of **September 15, 2026**. These are researched options; I have not purchased access or verified a real submission through them.
> 
> ## The shortlist
> 
> | Platform | What we could automate | Published price / access | My assessment |
> |---|---|---|---|
> | **[Apply Guy](https://applyguy.ai/developers)** | Search, employer application submission, Claude-supplied answers, status callbacks | **$0.05/application** using your agent; **$0.10 managed** | **Best API pilot candidate** |
> | **[The Boring Project](https://boringproject.ai/developer-docs/introduction)** | Submit batches to employer hiring systems; recurring search-and-apply campaigns | Credit-based; numeric pricing unverified | Strong second API candidate |
> | **[JobCopilot](https://jobcopilot.com/pricing/)** | Hosted job matching and applications; review mode; hiring-manager contact credits | Premium from **$0.93/day**, Elite from **$1.05/day**; actual billing totals need checkout verification | **Best ready-made app to test** |
> | **[LoopCV](https://www.loopcv.pro/developers/)** | Applications, employer emails, matching, advertised REST API | API access/pricing need confirmation; Claude connector is beta | Closest combined application-and-outreach product |
> | **[LazyApply](https://lazyapply.com/)** | Advertised Indeed, ZipRecruiter, Dice and Greenhouse automation | Basic **$99/year, 15/day**; Premium **$149/year, 150/day** | Browser-based option, with the Indeed limitations below |
> | **[Simplify Copilot](https://simplify.jobs/copilot)** | Free application autofill and tracking | Free core features | Useful for forms needing your review; reviewed documentation does not establish unattended bulk submission |
> 
> ## 1. Apply Guy: the most promising connection for Claude
> 
> Its documentation describes the exact missing part of your current engine:
> 
> - Send a selected job to an application endpoint.
> - Check readiness before submitting.
> - Let Claude supply answers when the form needs judgment.
> - Receive success, failure, or pending-answer status.
> - Prevent duplicate requests from creating duplicate applications.
> 
> That would let us reuse your existing shortlist and answer profile while the provider handles the employer’s form. Its documentation also distinguishes a

> **Yes: 25, 50, or 100 applications per batch, with 50 as the default.** I removed the mandatory ten-application pilot from the [workflow requirements](C:/Users/dillo/Documents/Codex/2026-09-14/i-found-the-existing-outreach-email/APPLICATION-API-RESEARCH-2026-09-15.md).
> 
> **The Boring Project explicitly supports up to 100 jobs in one API request**, then processes and tracks those applications. That is the clearest documented fit for your batch-size requirement. One coordinator can manage that batch. [Batch API documentation](https://boringproject.ai/developer-docs/sessions)
> 
> The remaining dependency is **connecting and funding the submission provider**. The larger batch requirement is saved; actual bulk submission is not connected yet.

> ```powershell
> & 'C:\Users\dillo\.local\bin\claude.exe' attach 2a8b3e6c
> ```
> 
> - **I built it and started the 50-role batch in Claude.** Fable 5.1 coordinates, Sonnet 5 handles research and tailoring, and the main session owns Chrome. Both models ran successfully and the extension responded in the [live check](C:/Users/dillo/Documents/Codex/projects/job-search-2026/automation/runs/2026-09-15/claude-applications-20260915-144209-355.json).
> - **The [launcher](C:/Users/dillo/Documents/Codex/projects/job-search-2026/automation/Start-ClaudeApplications.ps1) supports 25, 50, or 100 roles**, defaulting to 50. The old three-draft limit is removed for this project. One Sonnet worker runs at a time under your usage-conservation rules; Claude supports this [model routing](https://code.claude.com/docs/en/subagents).
> - **Current status: preparing, with no submissions verified yet.** Your [saved job guardrails](C:/Users/dillo/Documents/Codex/projects/job-search-2026/JOB_SEARCH_GUARDRAILS.md) keep employer applications staged until you authorize the prepared batch. That authorization then covers the batch without asking again for every role.
> 

> Paste this into the **existing Claude session**:
> 
> ```text
> Continue the current 50-role batch through actual application submission. I authorize submitting up to 50 qualified, deduped applications using my existing resume, verified experience, and saved screening answers. Do not stop at drafts or ask for approval again per application.
> 
> Use Fable 5.1 to coordinate and one Sonnet worker for research and tailoring. Keep one browser owner. Reuse the existing queue, evidence, and application log.
> 
> Target US-eligible remote full-time marketing/growth roles at $90,000+ base, plus part-time or contract marketing/web roles at $25+/hour. Hold unknown compensation or unresolved qualifications instead of guessing or padding the batch.
> 
> Use supported application flows and employer-direct pages. I will handle browser permission prompts, login, MFA, CAPTCHA, and required personal consent. Do not bypass these or purchase services. If one application needs an answer from me, record the exact question and continue other eligible applications.
> 
> Save a confirmation receipt for each submission. Do not count drafts or attempts as submitted, and do not blindly retry an uncertain submission.
> 
> Finish with separate counts for submitted, prepared, awaiting my input, failed, and uncertain, plus the evidence paths. Preserve existing client suppression rules.
> ```

**Files written (8):**

- `C:/Users/dillo/.codex/tools/hidden-scheduled-tasks.tsv`
- `C:/Users/dillo/Documents/Codex/projects/job-search-2026/.claude/agents/job-search.md`
- `C:/Users/dillo/Documents/Codex/projects/job-search-2026/CLAUDE-APPLICATION-ACCESS.md`
- `C:/Users/dillo/Documents/Codex/projects/job-search-2026/CLAUDE.md`
- `C:/Users/dillo/Documents/Codex/projects/job-search-2026/automation/README.md`
- `C:/Users/dillo/Documents/Codex/projects/job-search-2026/automation/Run-DailyJobOutreach.ps1`
- `C:/Users/dillo/Documents/Codex/projects/job-search-2026/automation/Start-ClaudeApplications.ps1`
- `C:/Users/dillo/Documents/Codex/projects/job-search-2026/automation/daily_job_outreach.py`

<sub>rollout: `C:\Users\dillo\.codex\sessions\2026\09\14\rollout-2026-09-14T23-18-20-01a0a312-9b8b-76d2-a4fa-031f3be03c5a.jsonl`</sub>
