<#
.SYNOPSIS
  Make the cadence and job-lane tasks run without an interactive logon.

.DESCRIPTION
  All six of these tasks are registered with LogonType Interactive -- "run only
  when the user is logged on." On 2026-09-15 a Windows Update restart at 03:31
  left the machine with no interactive session until 09:54, so Cadence-daily's
  09:05 slot was skipped and the hourly heartbeat missed six runs.
  See 12_Brain/07_Reviews/2026-09-15 - Cadence tasks cannot run unattended.

  Job-Shortlist-Daily had likewise NEVER fired (LastRunTime 11/30/1999) and
  Daily-Job-Outreach-Runner had been left Disabled. Both were enabled and
  started by hand on 2026-09-15 at 10:17/10:18, but a manual start does not fix
  the schedule -- without this repair they miss every slot the machine reboots
  through.

  This switches them to S4U -- runs whether or not the user is logged on, and
  stores no password -- and sets StartWhenAvailable so a slot missed while the
  machine is down is caught up on the next boot.

  MUST BE RUN FROM AN ELEVATED POWERSHELL. Verified 2026-09-15:
  Set-ScheduledTask returns "Access is denied" unelevated for BOTH the cadence
  tasks and the job tasks, so this is a machine-wide policy, not a per-task ACL.
  Enable-ScheduledTask and Start-ScheduledTask DO work unelevated -- only the
  principal change needs admin.

  Changes nothing else: same triggers, same actions, same schedule. Reversible
  by re-running with -Revert.
#>
[CmdletBinding()]
param([switch]$Revert)

$ErrorActionPreference = 'Stop'

$names = @(
  'Cadence-daily','Cadence-weekly','Cadence-monthly','Cadence-sweep-heartbeat',
  'Job-Shortlist-Daily','Daily-Job-Outreach-Runner','Claude-Job-Outreach-Daily'
)

if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()
      ).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
  throw "Not elevated. Re-run this from an Administrator PowerShell."
}

$logon = if ($Revert) { 'Interactive' } else { 'S4U' }

foreach ($n in $names) {
  $principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" `
                 -LogonType $logon -RunLevel Limited
  $settings  = New-ScheduledTaskSettingsSet -StartWhenAvailable `
                 -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries `
                 -MultipleInstances IgnoreNew `
                 -ExecutionTimeLimit (New-TimeSpan -Hours 2)
  Set-ScheduledTask -TaskName $n -Principal $principal -Settings $settings | Out-Null
  Write-Host "  set $n -> $logon"
}

Write-Host ""
Get-ScheduledTask -TaskName $names | ForEach-Object {
  $i = $_ | Get-ScheduledTaskInfo
  [pscustomobject]@{
    Name    = $_.TaskName
    Logon   = $_.Principal.LogonType
    CatchUp = $_.Settings.StartWhenAvailable
    LastRun = $i.LastRunTime
    NextRun = $i.NextRunTime
  }
} | Format-Table -AutoSize

Write-Host "Now prove it. Run one by hand and check its evidence:"
Write-Host "  Start-ScheduledTask -TaskName Cadence-daily"
Write-Host "  Get-Content 'C:\Users\dillo\repos\dillon-os\_os\automation\cadence\run-ledger.jsonl' -Tail 3"
Write-Host "  Get-ScheduledTask -TaskName Job-Shortlist-Daily | Get-ScheduledTaskInfo"
