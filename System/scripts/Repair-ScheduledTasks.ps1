<#
.SYNOPSIS
  Make the cadence, job-lane and Workmate tasks run without an interactive logon,
  and register the kanban board as an always-on task.

.DESCRIPTION
  All eight tasks below are registered LogonType Interactive, meaning "run only
  when the user is logged on." On 2026-09-15 a Windows Update restart at 03:31
  left the machine with no interactive session until 09:54, so the 09:05
  Cadence-daily slot was skipped, the hourly heartbeat missed six runs, and
  Job-Shortlist-Daily had never fired at all since it was registered.
  See 12_Brain/07_Reviews/2026-09-15 - Cadence tasks cannot run unattended.

  This switches each task to S4U, which runs whether or not the user is logged
  on and stores no password, and sets StartWhenAvailable so a slot missed while
  the machine was down is caught up on the next boot.

  Triggers and actions are NOT touched. Set-ScheduledTask is called with only
  -Principal and -Settings, so every task keeps its existing schedule and command.

  MUST BE RUN ELEVATED. Verified 2026-09-15: Set-ScheduledTask returns "Access is
  denied" unelevated for every task tried, and Register-ScheduledTask with S4U is
  refused the same way, so this is a machine-wide policy on the task principal
  rather than a per-task ACL. Enable-ScheduledTask and Start-ScheduledTask do
  work unelevated.

  IDEMPOTENT. Running it twice produces the same result. It reports the state it
  found and the state it left, skips tasks that are already correct, and
  continues past a failure instead of aborting half applied. Re-run with -Revert
  to put every task back to Interactive.

.EXAMPLE
  powershell -NoProfile -ExecutionPolicy Bypass -File Repair-ScheduledTasks.ps1
.EXAMPLE
  powershell -NoProfile -ExecutionPolicy Bypass -File Repair-ScheduledTasks.ps1 -Revert
#>
[CmdletBinding()]
param([switch]$Revert)

Set-StrictMode -Version Latest

# Momentum360-WorkmateOperator is a persistent Socket Mode listener, not a job
# that starts and finishes. Giving it a 2 hour execution limit would make this
# repair kill the Slack bot every 2 hours. It gets an unlimited limit instead.
$PERSISTENT = @('Momentum360-WorkmateOperator')

$names = @(
  'Cadence-daily','Cadence-weekly','Cadence-monthly','Cadence-sweep-heartbeat',
  'Job-Shortlist-Daily','Daily-Job-Outreach-Runner','Claude-Job-Outreach-Daily',
  'Momentum360-WorkmateOperator',
  'Momentum-Weekly-Client-Reports'
)

if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()
      ).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
  Write-Host ''
  Write-Host '  NOT ELEVATED. Nothing was changed.' -ForegroundColor Red
  Write-Host '  Re-run this from an Administrator PowerShell.' -ForegroundColor Red
  Write-Host ''
  exit 1
}

$target = if ($Revert) { 'Interactive' } else { 'S4U' }
$user   = "$env:USERDOMAIN\$env:USERNAME"

# Dillon-Kanban-Board does not exist yet. Registration itself (not just the
# principal change) returned Access is denied unelevated on 2026-09-15, same
# as everything else in this file, so it is created here instead of by a
# separate script. It has no execution time limit and restarts on crash --
# it is a server, not a job that finishes.
if (-not $Revert) {
  $kanban = 'Dillon-Kanban-Board'
  if (-not (Get-ScheduledTask -TaskName $kanban -ErrorAction SilentlyContinue)) {
    $kAction    = New-ScheduledTaskAction -Execute 'node.exe' -Argument '_os\kanban\server.js' `
                    -WorkingDirectory 'C:\Users\dillo\repos\dillon-os'
    $kTrigLogon = New-ScheduledTaskTrigger -AtLogOn
    $kTrigBoot  = New-ScheduledTaskTrigger -AtStartup
    $kTriggers  = @($kTrigLogon, $kTrigBoot)
    $kSettings  = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries `
                    -DontStopIfGoingOnBatteries -MultipleInstances IgnoreNew `
                    -ExecutionTimeLimit ([TimeSpan]::Zero) -RestartCount 999 `
                    -RestartInterval (New-TimeSpan -Minutes 1)
    $kPrincipal = New-ScheduledTaskPrincipal -UserId $user -LogonType S4U -RunLevel Limited
    Register-ScheduledTask -TaskName $kanban -Action $kAction -Trigger $kTriggers `
      -Settings $kSettings -Principal $kPrincipal -Force | Out-Null
    Start-ScheduledTask -TaskName $kanban
    Write-Host "  REGISTERED $kanban (new task, S4U, auto-restart, no time limit)" -ForegroundColor Green
  }
}

Write-Host ''
Write-Host "  Target logon type: $target"
Write-Host ''

$changed = 0; $already = 0; $failed = 0; $running = @()

foreach ($n in $names) {
  $task = Get-ScheduledTask -TaskName $n -ErrorAction SilentlyContinue
  if (-not $task) {
    Write-Host ("  MISSING  {0}" -f $n) -ForegroundColor Yellow
    $failed++
    continue
  }

  $was = $task.Principal.LogonType
  if ($task.State -eq 'Running') { $running += $n }

  if ($was -eq $target -and $task.Settings.StartWhenAvailable) {
    Write-Host ("  already  {0,-30} {1}" -f $n, $was)
    $already++
    continue
  }

  $limit = if ($PERSISTENT -contains $n) { New-TimeSpan -Seconds 0 } else { New-TimeSpan -Hours 2 }

  try {
    $principal = New-ScheduledTaskPrincipal -UserId $user -LogonType $target -RunLevel Limited
    $settings  = New-ScheduledTaskSettingsSet -StartWhenAvailable `
                   -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries `
                   -MultipleInstances IgnoreNew -ExecutionTimeLimit $limit
    Set-ScheduledTask -TaskName $n -Principal $principal -Settings $settings -ErrorAction Stop | Out-Null
    $note = if ($PERSISTENT -contains $n) { '  (no execution time limit, persistent listener)' } else { '' }
    Write-Host ("  SET      {0,-30} {1} -> {2}{3}" -f $n, $was, $target, $note) -ForegroundColor Green
    $changed++
  }
  catch {
    Write-Host ("  FAILED   {0,-30} {1}" -f $n, $_.Exception.Message) -ForegroundColor Red
    $failed++
  }
}

Write-Host ''
Write-Host ("  changed {0}, already correct {1}, failed {2}" -f $changed, $already, $failed)

if ($running.Count) {
  Write-Host ''
  Write-Host ('  These were RUNNING during the change: {0}' -f ($running -join ', ')) -ForegroundColor Yellow
  Write-Host '  A principal change does not stop a running instance, but the new'
  Write-Host '  principal only takes effect on its next start. Restart to apply now:'
  foreach ($n in $running) {
    Write-Host ("    Stop-ScheduledTask -TaskName {0}; Start-ScheduledTask -TaskName {0}" -f $n)
  }
}

Write-Host ''
Get-ScheduledTask -TaskName $names -ErrorAction SilentlyContinue | ForEach-Object {
  $i = $_ | Get-ScheduledTaskInfo
  [pscustomobject]@{
    Name    = $_.TaskName
    Logon   = $_.Principal.LogonType
    CatchUp = $_.Settings.StartWhenAvailable
    State   = $_.State
    LastRun = $i.LastRunTime
    NextRun = $i.NextRunTime
  }
} | Format-Table -AutoSize

Write-Host '  Now prove it. Fire one by hand and read its evidence, do not trust the table:'
Write-Host '    Start-ScheduledTask -TaskName Cadence-daily'
Write-Host "    Get-Content 'C:\Users\dillo\repos\dillon-os\_os\automation\cadence\run-ledger.jsonl' -Tail 3"
Write-Host ''
Write-Host '  The real proof is tomorrow. Cadence-daily should show a LastRunTime of'
Write-Host '  2026-09-16 09:05 even if nobody logged in. If it still reads 11/30/1999,'
Write-Host '  this did not work and the vault note should be reopened.'
Write-Host ''
exit $(if ($failed) { 2 } else { 0 })
