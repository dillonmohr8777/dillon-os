---
note_type: session-recovery
status: recovered
created: 2026-09-23
updated: 2026-09-23
session_first: 2026-09-15T02:07:57
session_last: 2026-09-15T02:07:57
session_count: 1
cwd: "C:\Users\dillo\Documents\Codex\2026-09-14\do-this-2"
open_flags: [blocked]
tags: [codex-recovery, session, 202609]
---

# Documents\Codex\2026-09-14\do-this-2

**1 session(s)** · 2026-09-15 02:07 → 2026-09-15 02:07 · 16.0h agent-time (summed; sessions may overlap) · 14 MB transcript · 6/7 turns completed

> **Open flags:** `blocked`

## 1. 2026-09-15 02:07 · 16.0h · 14.1 MB

`01a0a2d2-2a46-7ac1-a5e1-e337e512ba23` · turns 6/7 · flags: blocked

**Asked:**

> Do this

**Outcome reported:**

> | Item | Before | After | Evidence command |
> |---|---|---|---|
> | Cursor worker and Git processes | 1 worker; 0 Git processes | Worker stopped; Git remained **0** beyond 90 seconds | `Get-CimInstance Win32_Process`; `Get-Process git` |
> | Cursor watchdog | Enabled; every 1 minute | **Disabled**, with task XML backed up | `Get-ScheduledTask Cursor-Dillon-LocalWorker-Watchdog` |
> | Claude’s configuration changes | Both concurrency limits at 3; all 5 named MCP servers disabled | Verified unchanged | `python .\verify-cleanup.py` |
> | Guard timing | Idle sleeps: 2,000 ms and 30,000 ms; settings task every 5 minutes | Verified unchanged | `rg -n Start-Sleep` on both guard scripts; `Get-ScheduledTask Codex-Settings-Guard` |
> | Align image plugin | Enabled; 25 enabled plugins | **Disabled**; 24 enabled. All 25 plugin blocks and 26 MCP blocks retained | `python .\verify-cleanup.py` |
> | Threads inactive over 48 hours | 2,818 old, unarchived records | **2,141 archived; 677 remain**: 671 missing rollouts, 5 unreadable sessions, 1 active writer | Native archive operations; [remaining records](</C:/Users/dillo/Documents/Codex/2026-09-14/do-this-2/remaining-old-threads.json>) |
> | `node_repl.exe` footprint | 28 processes | **26 processes** | `Get-Process node_repl` |
> | Rollouts older than 30 days | 792 files; 5,878,160,984 bytes | **792 archived**, with destination sizes verified; 0 remain in active sessions | [Verification script](</C:/Users/dillo/Documents/Codex/2026-09-14/do-this-2/verify-cleanup.py>) |
> | Active sessions folder | 2,136 rollouts; 19.05 GB | 102 rollouts; 1.13 GB. Files moved, so disk space was not reclaimed | `Get-ChildItem ~/.codex/sessions -Recurse -File` |
> | Three browser caches | 780,647,326 bytes | Unchanged: Codex remains open | `Get-ChildItem` for `Cache`, `Code Cache`, `GPUCache`; `Get-Process Codex` |
> | Hermes watchdog | Every 2 minutes; last result 1; Cursor executable missing | Unchanged under the brief’s one-minute-only action restriction | `Get-ScheduledTaskInfo Hermes-Reliability-Watchdog`; `Test-Path` for Cursor |
> | SitesBridge | Last result 1 | Failure identified: **Puttery NYC and Deborah Mara** are partial; 25 of 27 clients integrated. Queue unchanged | Read `hosted-sync.log.jsonl`; `Invoke-RestMethod` on configured Studio endpoint |
> | Power events | Brief reported 5 unclean shutdowns, 0 GPU recoveries | Verified **5 Kernel-Power 41 events; 0 display-driver recovery events** in seven days. Cleanup cannot resolve the power-offs | `Get-WinEvent` for IDs 41 and 4101 |
> | Backups | None for this cleanup | Dated configuration, task XML, worker 

> **The main cleanup left is stale threads and failing background tasks.** Your screenshot shows a **99+ badge**; that number doesn’t measure storage or memory that needs cleaning.
> 
> I checked the live state:
> 
> | Priority | What needs attention | Current state | Recommended action |
> |---|---|---|---|
> | **1** | Failing background tasks | Hermes fails every **2 minutes**; SitesBridge every **15 minutes** | Disable the unnecessary Hermes watchdog; fix SitesBridge’s client-coverage failure. |
> | **2** | Old thread records | **699** unarchived threads inactive over 48 hours; **671** reference missing files | Finish archiving stale sidebar records through Codex. Review the other 28 before touching their files. |
> | **3** | Running session processes | **30 `node_repl.exe` processes** | Identify their owning sessions and close inactive ones. The count alone doesn’t prove they’re orphaned. |
> | **4** | Browser caches | **792 MB** across the three cache folders | Clear or move those caches after closing Codex. Preserve login and site-storage folders. |
> | **5** | Plugin load | **24 plugins enabled** | Review whether `sales`, `data-analytics`, `product-design`, `sol-advisor`, and `chatcut` need to stay enabled. |
> | **6** | Archived history on disk | **18.08 GB** in `archived_sessions` | Keep it unless disk space is the problem. Archiving moved the history; it didn’t free storage. |
> 
> **The urgent Cursor problem is still contained:** its watchdog remains disabled, and there are **0 Git processes**. The Align image plugin is still disabled, and both concurrency limits remain at **3**.
> 
> My order: **stop failed-task churn → finish stale-thread cleanup → review inactive sessions → clear caches during a restart.**
> 

> You’re right—your current setup is **Codex, Claude, and local models**. “Cursor worker” meant a leftover Windows startup task that was still launching automatically. I disabled it and the obsolete watchdog. **No Cursor worker remains running.**
> 
> ## Fixed
> 
> | Issue | Verified result |
> |---|---|
> | Historical conversations appeared missing | Recovered **775 rollout files containing 10.25 GB** from an older archive. All matched their saved hashes. |
> | Old task backlog | Used Codex’s native archive operation; reduced the old unarchived backlog from **699 to 5**. |
> | Plugin warnings | Fixed invalid prompt metadata in Never Cutoff and ChatCut. |
> | Incomplete SitesBridge coverage | Added the missing source-backed local records; coverage now passes **27/27**. |
> | Database health | Structural check passes; **zero missing paths among unarchived tasks**. |
> 
> The process snapshots also improved: **209 → 168 descendants**, **28 → 22 REPL processes**, and **38,867 → 31,532 handles**. These are before/after observations, not a controlled performance benchmark. Ollama reports healthy, with all three configured local models installed.
> 
> ## Still unresolved or staged
> 
> - **Five damaged history files:** They contain only zero bytes. I preserved them and backups; no usable replacements exist in the archives checked. Recovery needs an independent good copy.
> - **About 792 MB of browser cache:** Cleanup is prepared, but the helper correctly refuses while Codex is open. Run it after active work finishes and Codex closes.
> - **SitesBridge’s hosted sync:** Local coverage is repaired. The scheduled sync remains paused because it also publishes data and writes the canonical queue.
> - **Unexpected shutdowns:** Windows recorded unclean restarts, but the evidence does **not** establish a hardware cause. Event 41 alone cannot identify one. [Microsoft’s explanation](https://learn.microsoft.com/en-us/troubleshoot/windows-client/performance/event-id-41-restart)
> 
> **No files were permanently deleted.** Active Claude work, credentials, and client registry data were preserved.
> 
> [Full repair report](C:/Users/dillo/Documents/Codex/2026-09-14/do-this-2/MACHINE-REPAIR-2026-09-15.md) · [Cache cleanup helper](C:/Users/dillo/Documents/Codex/2026-09-14/do-this-2/Finish-CodexMaintenance.ps1)
> 

> **All five roles are included, and the implementation is now backed up remotely.** The team assistant is locally verified. **Slack activation is still pending.**
> 
> ## What’s included
> 
> The assistant reuses the existing role contracts:
> 
> | Role | Team-facing help |
> |---|---|
> | **Jason** | Lead-review checklists and sales follow-up drafts |
> | **Sean** | Operations plans, dependencies, and decision options |
> | **Mac** | Reporting and revenue-review drafts, with missing figures clearly identified |
> | **Melissa Silber** | Creative briefs, individual asset concepts, copy, and production directions |
> | **Melissa Rigby** | Delivery plans, milestones, review steps, and acceptance criteria |
> 
> It also has **23 reviewed resources** covering the AM Masterhub, onboarding, client updates, reporting, training, templates, and your website-build reference.
> 
> Draft follow-ups retain the employee’s supplied details within the same Slack thread. The listener handles duplicate events, progress notices, and stop requests. Automatic startup is prepared.
> 
> ## What I verified
> 
> - **12 transport and security test groups passed**, plus the existing **36 role-runtime checks**.
> - A real local FAQ run returned Monday-update guidance with source links.
> - An unsupported vacation-policy question correctly returned “unknown.”
> - The revised creative-brief test produced **three distinct concepts**, copy, production directions, and missing inputs.
> 
> The private [review branch](https://github.com/dillonmohr8777/client-operations-canonical/tree/codex/momentum-team-assistant-20260915) now contains this implementation and the eight previously unpushed **client-operations** commits. Remote commit verification passed.
> 
> ## What still separates this from full operation
> 
> The shared assistant currently produces answers and drafts. **Your existing Workmate remains the execution path** for broader work; employee requests do not yet execute CRM changes, render assets, or deliver client work automatically.
> 
> This host also needs to remain on and signed in. The tested draft took about **99 seconds**, so reliable availability and throughput still matter before calling this an organization-wide production service.
> 
> [Full implementation and activation report](C:/Users/dillo/Documents/Codex/projects/client-operations/clients/momentum-360/deliverables/2026-09-12-dedicated-agents/TEAM-ASSISTANT-2026-09-15.md)
> 
> **Next step is the pending Slack approval:** install Momentum Answers, configure `#momentum-help`, enter its credentials directly, and verify actual team replies.
> 
> The browser’s access policy requires confirmation

> **Momentum Answers is installed and added to [#momentum-help](https://app.slack.com/client/T066HGS7N/C0C2VSTBQ9W).** The five role workflows are configured. **It is not answering yet—both credentials still need entry.**
> 
> The protected PowerShell window is open:
> 
> 1. Copy the **Bot User OAuth Token** from [Install App](https://api.slack.com/apps/A0C23EC7TPB/install-on-team) into the first hidden prompt.
> 2. In the prepared [app-level token form](https://api.slack.com/apps/A0C23EC7TPB/general), click **Generate** with only `connections:write`, then paste that token into the second prompt.
> 3. Reply **Ready** after the window confirms storage. I’ll run the approved Slack tests and complete automatic startup. **Keep tokens out of this chat.**
> 
> The browser tool requires direct human control for credential creation and entry. Your installation approval is already applied; this is the remaining credential handoff.
> 

> **Momentum Answers is live in [#momentum-help](https://app.slack.com/client/T066HGS7N/C0C2VSTBQ9W).** Sourced FAQ answers and five-role drafting are configured for Jason, Sean, Mac, Melissa Silber and Melissa Rigby. The [live test thread](https://momentum3d.slack.com/archives/C0C2VSTBQ9W/p1789492316385399) verifies the FAQ answer and three-concept draft; **14 checks pass**.
> 
> The Windows background task is running and starts at login. The PC must stay on and signed in with Ollama running. [Team quick-start](C:/Users/dillo/Documents/Codex/projects/client-operations/clients/momentum-360/deliverables/2026-09-12-dedicated-agents/TEAM-QUICKSTART.md) and the eight-line checkpoint are saved; private backup commit **`765a62e`** is verified.
> 
> **Luna parallelism was blocked by the app’s agent limit; no subagents ran.** I completed the work directly. The remaining rollout check is a real teammate’s interaction—live acceptance so far used your Slack identity. These workflows produce reviewed-resource answers and drafts, not autonomous client-account execution.
> 

**Files written (15):**

- `C:/Users/dillo/Documents/Codex/projects/client-operations/clients/deborah-mara/CLIENT.md`
- `C:/Users/dillo/Documents/Codex/projects/client-operations/clients/deborah-mara/context/operating-context.md`
- `C:/Users/dillo/Documents/Codex/projects/client-operations/clients/momentum-360/deliverables/2026-09-12-dedicated-agents/TEAM-ASSISTANT-2026-09-15.md`
- `C:/Users/dillo/Documents/Codex/projects/client-operations/clients/momentum-360/deliverables/2026-09-12-dedicated-agents/TEAM-ASSISTANT-CHECKPOINT.md`
- `C:/Users/dillo/Documents/Codex/projects/client-operations/clients/momentum-360/deliverables/2026-09-12-dedicated-agents/TEAM-QUICKSTART.md`
- `C:/Users/dillo/Documents/Codex/projects/client-operations/clients/momentum-360/deliverables/2026-09-12-dedicated-agents/org-modes/faq-setup.md`
- `C:/Users/dillo/Documents/Codex/projects/client-operations/clients/momentum-360/deliverables/2026-09-12-dedicated-agents/org-modes/faq_bridge.py`
- `C:/Users/dillo/Documents/Codex/projects/client-operations/clients/momentum-360/deliverables/2026-09-12-dedicated-agents/org-modes/faq_bridge_test.py`
- `C:/Users/dillo/Documents/Codex/projects/client-operations/clients/puttery-nyc/context/operating-context.md`
- `CHECKPOINT.md`
- `Finish-CodexMaintenance.ps1`
- `MACHINE-REPAIR-2026-09-15.md`
- `archive-old-threads.py`
- `recover-legacy-rollouts.py`
- `verify-cleanup.py`

<sub>rollout: `C:\Users\dillo\.codex\sessions\2026\09\14\rollout-2026-09-14T22-07-57-01a0a2d2-2a46-7ac1-a5e1-e337e512ba23.jsonl`</sub>
