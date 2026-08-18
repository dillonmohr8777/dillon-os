# Prospect Radar next 15 builder

This is a private, local-only worker for the next untouched 15 radar targets.

- Windows task: `Prospect Radar - Next 15 Builder`
- Cadence: every six hours, starting from the task's next scheduled run
- Launcher: `C:\Users\dillo\.codex\tools\Run-HiddenScheduledTask.vbs`
- Manifest key: `Prospect Radar - Next 15 Builder`
- Worker: `Run-ProspectRadarNext15Builder.ps1`
- Run receipts: `automation\prospect-radar-next15\runs\<timestamp>`
- Delivery boundary: `mail_ready=hold`; no CRM, queue, send, publish, deploy, or public-site writes

The worker acquires a named mutex so overlapping runs are skipped safely. Each run refreshes the radar, excludes all prior completed domains, resumes blocked pre-build selections, writes a resumable manifest, and asks Codex to build a new dated batch. Missing source or address produces a clearly labelled private concept preview with `qa_ready=hold`, not invented proof. Vault sync and validation run before the worker starts. A failed or blocked run leaves its log and status receipt in the run directory.

The worker uses the isolated matching Codex CLI at `C:\Users\dillo\.codex\tools\codex-cli-0147` and carries the explicit prior-delivery exclusion set, including `erlegal.com`, so a stale provenance scan cannot reuse a completed prospect.

The Codex-app recurring-automation endpoint was unavailable in the current session, so this uses the approved hidden scheduled-task wrapper rather than writing a second scheduler or hosted service.
