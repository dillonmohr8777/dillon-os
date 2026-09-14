---
note_type: runbook
status: active
created: 2026-09-14
updated: 2026-09-14
tags:
  - runbook
  - automation
  - scheduling
source_refs:
  - _os/automation/cadence/README.md
  - _os/automation/cadence/driver.md
  - _os/automation/bin/daily-sweep.js
  - 12_Brain/registry/automations.json
  - 12_Brain/07_Reviews/2026-09-09 - Machine power fault diagnosis
---

# Installing the cadence driver and the daily sweep

## What is and is not wired, verified 2026-09-14

| Piece | State |
| --- | --- |
| `_os/automation/cadence/` manifests, driver spec, ledger | exists, committed |
| `_os/automation/bin/daily-sweep.js` | exists, runs, self-tested |
| `daily-sweep` as the first job in `daily.yaml` | wired |
| A scheduled task or launchd job that starts the cadence driver | **does not exist** |

So the layer works when someone runs it and does nothing when nobody does. That
is the gap this file closes.

## Windows, today

Register one task per cadence. The driver is a Claude Code run against
`driver.md`; the sweep inside it is plain Node and needs no model.

```powershell
$vault = 'C:\Users\dillo\repos\dillon-os'
$claude = 'C:\Users\dillo\.local\bin\claude.exe'

foreach ($c in 'daily','weekly','monthly') {
  $when = switch ($c) {
    'daily'   { New-ScheduledTaskTrigger -Daily -At 9:05am }
    'weekly'  { New-ScheduledTaskTrigger -Weekly -DaysOfWeek Monday -At 9:20am }
    'monthly' { New-ScheduledTaskTrigger -Daily -At 9:35am }  # driver no-ops unless day 1
  }
  $action = New-ScheduledTaskAction -Execute $claude `
    -Argument "-p `"Read _os/automation/cadence/driver.md and run the $c cadence.`"" `
    -WorkingDirectory $vault
  Register-ScheduledTask -TaskName "Cadence-$c" -Trigger $when -Action $action `
    -Settings (New-ScheduledTaskSettingsSet -StartWhenAvailable `
                 -ExecutionTimeLimit (New-TimeSpan -Minutes 30) `
                 -MultipleInstances IgnoreNew) `
    -Description "Dillon OS $c cadence. Spec: _os/automation/cadence/driver.md"
}
```

`-StartWhenAvailable` is the important flag on this machine. It tells the
scheduler to run a missed occurrence once the machine comes back, instead of
skipping it silently. It does **not** recover a day the machine was off for the
whole window — nothing does. That is why the sweep writes `MISSED` rows.

**The machine will still miss days.** 14 unclean power-offs in 30 days, zero
bugchecks, zero WHEA events, no battery — the diagnosis is the power supply and
it needs hands. Uptime has collapsed from 204 hours in August to 4–12 hours.
Design around it; do not pretend the schedule is reliable.

A cheap safety net that does not depend on the 9:05 window surviving: add the
sweep to the existing `Claude-Autonomous-Daily-Driver` task, which already fires
every 15 minutes with catch-up and has proven the most reliable thing on this
box. The sweep is idempotent and costs nothing, so running it 96 times a day is
harmless and means the gap record is never more than 15 minutes stale.

## macOS, after the move

`launchd` replaces Task Scheduler. A **LaunchAgent** (`~/Library/LaunchAgents/`)
runs as the logged-in user and has Keychain access; a LaunchDaemon does not and
is the wrong choice here.

`~/Library/LaunchAgents/com.dillon.cadence.daily.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>              <string>com.dillon.cadence.daily</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/zsh</string>
    <string>-lc</string>
    <string>cd ~/repos/dillon-os &amp;&amp; claude -p "Read _os/automation/cadence/driver.md and run the daily cadence."</string>
  </array>
  <key>StartCalendarInterval</key>
  <dict>
    <key>Hour</key>   <integer>9</integer>
    <key>Minute</key> <integer>5</integer>
  </dict>
  <key>StandardOutPath</key>    <string>/tmp/cadence-daily.log</string>
  <key>StandardErrorPath</key>  <string>/tmp/cadence-daily.err</string>
  <key>RunAtLoad</key>          <false/>
</dict>
</plist>
```

```bash
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.dillon.cadence.daily.plist
launchctl enable  gui/$(id -u)/com.dillon.cadence.daily
launchctl kickstart -p gui/$(id -u)/com.dillon.cadence.daily   # test it now
launchctl print gui/$(id -u)/com.dillon.cadence.daily          # state, last exit
```

`bootout` to remove. `launchctl load/unload` is the deprecated spelling; it still
works but `bootstrap`/`bootout` is the current one.

**The behaviour that matters:** with `StartCalendarInterval`, if the Mac is
asleep at 09:05, launchd fires the job when it wakes. If the Mac is powered
**off** at 09:05, that occurrence is lost — launchd does not queue it. So the
Mac mini has the same class of gap the Windows box has, for a different reason,
and the same answer: the sweep records the miss.

If the mini should wake itself to run, schedule the wake separately:

```bash
sudo pmset repeat wakeorpoweron MTWRFSU 09:00:00
```

That is a hardware wake, unrelated to launchd, and it needs the machine plugged
in and not shut down from the menu. Verify with `pmset -g sched`.

## Verify, on either platform

```bash
node _os/automation/bin/daily-sweep.js --selftest   # logic self-check, no writes
node _os/automation/bin/daily-sweep.js              # real run; exit 0 or 2
```

Exit 2 is a successful run reporting bad news. The only failure exit is 1.

Then open `System/sweep-status.md`. If the date in its frontmatter is not
today's, the schedule is not working, regardless of what the task list says.
