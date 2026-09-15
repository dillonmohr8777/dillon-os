# Quiet orchestrator runtime audit

Evidence snapshot: 2026-09-04 20:02–20:11 America/New_York. Read-only worker audit for `quiet-orchestrator-20260904 / runtime-audit`. No schedules, configuration, canonical state, accounts, or notification settings changed. Findings precede any changes made by the main agent.

## Findings that affect the requested behavior

1. The quiet radar exists and is ACTIVE, but it had **no observed run yet** at 20:09 ET: database `last_run_at=null`, no `automation_runs` row, and no automation memory file. ACTIVE is configuration, not proof that Slack/Gmail monitoring has executed.
2. Its `notification_policy = "failed_runs_only"` suppresses successful action and bedtime alerts. The installed app explicitly overrides successful heartbeat `NOTIFY` decisions with `DONT_NOTIFY` under this policy. Use the normal policy for the user's requested selective alerts, then emit `DONT_NOTIFY` for unchanged/no-action runs.
3. The existing Slack watchdog and Gmail drafter are ACTIVE, not paused. They overlap the radar's communication triage. The Slack watchdog also sends self-email approval digests; the Gmail drafter creates or updates unsent threaded drafts. Consolidation should retain desired draft behavior explicitly, otherwise pausing them removes that capability.
4. Windows hidden launch infrastructure is working at the process/task level. NoPopupGuard is Running. The two bridge tasks use `wscript.exe` and the hidden manifest wrapper. Their latest result 0 means the wrapper completed, not that live communication acquisition occurred.
5. Local heartbeats run inside the desktop app process. They can continue after voice closes or after Windows closes the app's last window while its process remains running. They cannot execute while the PC is asleep/off or after the desktop app actually quits. A heartbeat also waits for an eligible, idle target thread and known renderer collaboration mode. A fixed 00:30 bedtime notification is consequently best-effort if this thread is busy.

## Automation inventory

All configuration paths below are under `C:\Users\dillo\.codex\automations\<id>\automation.toml`.

| ID | File configuration at snapshot | Run evidence inspected | Meaning |
|---|---|---|---|
| quiet-client-action-radar | ACTIVE heartbeat, 15 minutes; target `01a06ecd-8569-72d3-8f9c-7a63651db77a`; failed_runs_only | DB last_run_at null; no run rows or memory | Configured, execution unproven |
| slack-reply-watchdog | ACTIVE cron, every 6 hours, Luna / medium; failed_runs_only | Latest run row and memory Aug 26 08:01 ET; DB last_run_at advanced Sep 4 20:01 ET | Historical successful scan evidence; recent completion not established |
| six-hour-important-email-drafter | ACTIVE cron, every 6 hours, Luna / medium; failed_runs_only | Latest run row/memory Aug 26 11:36 ET; DB last_run_at Sep 4 14:39 ET | Historical draft readback evidence; recent completion not established |
| daily-communications-brain | ACTIVE cron, daily 07:00, Luna / medium; failed_runs_only | Sep 4 07:02:59 success envelope with Gmail/Slack ok; 8 curated items, 1 duplicate, checkpoints advanced | Current successful ingestion evidence; preserve distinct archival function |
| weekly-client-marketing-reports | TOML ACTIVE heartbeat Monday 10:00; target `019fec0c-e044-7122-a575-0e62783ff0cf`; failed_runs_only | DB currently labels the same ID cron and policy null; no automation_runs rows | File/DB representation disagreement; native view should reconcile before depending on type |
| report-brain-reconciliation | ACTIVE cron daily 19:00, Luna / medium; failed_runs_only | Latest memory/run row Aug 25: duplicate-only ingest; DB last_run_at Sep 4 19:01 ET | Preserve distinct archive/dedupe function; recent completion not established |
| marketing-chief-twice-daily-brief | ACTIVE cron 09:00 and 17:00, Luna / medium; failed_runs_only | Latest run row Aug 26 | Separate evidence brief, not an immediate inbox trigger |

Other relevant configuration: Momentum HubSpot day/night pulses and workshop calendar intake are PAUSED. Align HCM dashboard/blog monitors are PAUSED. Tags 2 Go fast email file says INACTIVE, a value outside the current app enum ACTIVE/PAUSED/DELETED; it should not be assumed to be a valid runnable automation.

Both legacy comms crons preserve these fields if updated: `execution_environment=local`, target project ID `c3eeaa32-cbe8-4ad8-881e-ff992cb203c6`, cwd `C:\Users\dillo\Documents\Codex\2026-07-08\we-made-u-a-master-ochesta`, model `gpt-5.6-luna`, reasoning `medium`. The Slack prompt itself instead requires the July 14 watchdog project, so its configured project and declared working scope differ. Read exact prompts from the files; avoid reconstructing them from this summary.

Database source: `C:\Users\dillo\.codex\sqlite\codex-dev.db`, opened with Node SQLite `readOnly:true`; only automation metadata queried. `PENDING_REVIEW` rows are app record state, not proof of external delivery. The source scheduler sets a cron's `last_run_at` before attempting the new thread, so a recent value alone does not demonstrate execution or completion.

## Windows task evidence

| Task | State / latest observation | Launch and interpretation |
|---|---|---|
| Codex-NoPopupGuard | Running; started Sep 4 18:28 ET; result 267009 | `wscript.exe //B //Nologo Start-NoPopupGuard.vbs`; running result is not an error |
| DillonAgentOS-GmailBridge | Ready; Sep 4 19:12 ET result 0; hourly | Hidden manifest invokes `Run-AgentOsPoll.ps1 -Source gmail -PrepareOnly`; WakeToRun false |
| DillonAgentOS-SlackBridge | Ready; Sep 4 20:01 ET result 0; every 15 minutes | Hidden manifest invokes `Run-AgentOsPoll.ps1 -Source slack -PrepareOnly`; WakeToRun false |
| Hermes-Reliability-Watchdog | Ready; Sep 4 20:02 ET result 1; every 2 minutes | Hidden manifest launcher. Latest 20:06 ET status: gateway healthy, worker healthy, Cursor desktop `start_failed` |
| Cursor-Hermes-PrivateWorker | Disabled; last run Aug 27 | Do not infer worker availability from this task alone; the latest reliability status reports the worker itself healthy |

`Run-HiddenScheduledTask.vbs:41` and `Start-NoPopupGuard.vbs:12` both call `shell.Run(commandLine, 0, True)`, specifying hidden launch and waiting for the child exit code. Manifest lines 16–17 contain the bridge commands. Scheduler `Hidden` flags are not the mechanism that hides the process windows.

Bridge source: `C:\Users\dillo\Documents\Codex\2026-07-10\i-see-that-all-of-my\automation\Run-AgentOsPoll.ps1:15–26`; `src\agent_os.py:1405–1429`. Slack consumes local native-connector event files and marks an empty queue healthy while explicitly waiting for native Slack events. Gmail consumes native files and can also perform configured Composio background intake; the current sanitized config read reports `background_transport=composio`. PrepareOnly prevents downstream execution/notify flags, but does not itself prove all acquisition is disabled. Both Sep 4 bridge log tails showed `count:0`, `results:[]`; this is not evidence of full inbox coverage.

Hermes source: `C:\Users\dillo\Documents\Codex\projects\hermes-control\scripts\Watch-HermesReliability.ps1:256–288`; safe status fields read from `C:\Users\dillo\AppData\Local\Codex\HermesReliability\status.json` at `2026-09-05T00:06:16Z`. Investigate the Cursor desktop launch separately; do not restart a healthy gateway merely because the combined task returns 1.

## Installed scheduler proof

Installed package: `OpenAI.Codex 26.901.4073.0`.
Read directly in memory from `C:\Program Files\WindowsApps\OpenAI.Codex_26.901.4073.0_x64__2p2nqsd0c76g0\app\resources\app.asar` without unpacking or modifying it. Archive SHA-256: `689A59ECCD6B4D38F3DDAF202DAC05B7CF5CA9CBA93B2703F7AA8A44BE90B23E`.

Archive member locators (line numbers refer to the bundled member, not the binary archive):

- `.vite/build/main-B6oTeDcE.js:94–96`, character offsets 159,300–177,100: scheduler uses local `setInterval`, queries due automations, clears the interval on disposal, resumes heartbeat target thread, and waits/defers for busy thread state, missing mode state, cooldown, approval, or user-input gates. Runs do not become arbitrary independent sessions; cron and heartbeat are distinct implementations.
- `.vite/build/main-B6oTeDcE.js:1321`, around offset 2,651,600: actual app quit drains/disposes application context. The active automation check is part of quit behavior.
- `.vite/build/window-all-closed-KNH8jchn.js:11`, around offset 560,458: last-window close does not call `app.quit()` on Windows. Closing a window and quitting the runtime differ.
- `webview/assets/app-initial-d2e74794629d.js:1944`, around offset 2,780,000: parses heartbeat decision; `failed_runs_only` changes successful completion to `DONT_NOTIFY`, failure to `NOTIFY`. With normal policy, explicit heartbeat decisions control whether to mark unread.
- `.vite/build/src-VqXTPopo.js:740`, around offset 1,146,100: native heartbeat instructions require one nonempty final heartbeat XML block with decision `NOTIFY` or `DONT_NOTIFY` and a short message. Quiet turns must contain no visible prose/commentary outside that block. Although the renderer has an empty-message fallback, use the formal DONT_NOTIFY contract.
- `.vite/build/src-VqXTPopo.js:681`, around offset 650,000: archiving a target thread deletes its active heartbeat. Keep the orchestrator thread unarchived.

No claim is made that a midnight checkpoint will wake a sleeping/off PC. The relevant Windows bridge tasks explicitly have WakeToRun false. No power, sleep, or launch settings were changed.

## KJB daily leads

No dedicated daily KJB/Meta lead schedule was found in the scoped Codex automation inventory or Windows task-name checks. The weekly report heartbeat explicitly retrieves individual Meta leads from account `1249689223687250`, with Google customer `814-550-6229` separate, and produces a private Kimberly-only lead handoff draft. This is weekly behavior, not a daily collector.

`client-operations\scripts\Render-KimberlyJamesBridalLeadReport-2026-08-24.mjs` is a dated report renderer, not evidence of unattended daily acquisition. Its presence should be reused as a rendering reference only after current lead data is fetched through the exact authorized account. Lead PII remains excluded from Slack and cross-client radar cards.

## Limited loop reliability cross-check

Imported the existing `agent-craft-brief.js` analysis function and fed it the last 14 daily receipt files, Aug 22–Sep 4, without writing generated notes or state. The CLI's supposed dry run still unconditionally invokes `writeRunState` at line 393, so running it directly would violate this worker's read-only assignment.

Receipts show D03 and D07 14 completions each; M05 has 6 completions and 21 failures; E05 has 7 completions and 18 failures. Both latest failure summaries point to build stage (3/9 stages okay). No failed rows were found in the Sep 4 receipt file. These counts describe the receipt window, not universal runtime health, and do not prove current provider access.

## Proposed changes for the main agent

1. Update existing radar with durable checkpoint/dedupe state, exact client routes, bounded draft/session dispatch, budget/concurrency limits, bedtime preference, and the normal notification policy. Prove one bounded acquisition/triage run before saying the full pipeline works.
2. Once radar retains desired drafting capability, pause the two overlapping legacy comms crons through the native automation tool, preserving full fields. Keep distinct brain ingestion and report archival jobs.
3. Use native automation view to reconcile the weekly report file/DB disagreement and inspect recent scheduled-run errors where last_run_at advances without new run receipts.
4. Create/extend daily KJB collection only through the verified exact Meta lane, with a private table and source timestamps. Do not infer it from weekly report configuration.
5. Investigate Hermes' Cursor launch failure independently, and preserve the healthy hidden gateway/worker processes.

Earned lesson proposal for the parent to record, if appropriate: selective heartbeat alerts must use the normal notification policy plus explicit NOTIFY/DONT_NOTIFY decisions; `failed_runs_only` mutes successful meaningful notifications. Evidence is the installed code cited above. A second concrete lesson is that ACTIVE and last_run_at are configuration/attempt metadata; acquisition and completion require source checkpoints and run receipts.
