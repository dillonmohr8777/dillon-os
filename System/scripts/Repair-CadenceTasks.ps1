<#
.SYNOPSIS
  Make the four cadence tasks run without an interactive logon.

.DESCRIPTION
  As registered on 2026-09-14 all four cadence tasks use LogonType Interactive
  ("run only when the user is logged on"). On 2026-09-15 a Windows Update
  restart at 03:31 left the machine with no interactive session until 09:54, so
  Cadence-daily's 09:05 slot was skipped and the hourly heartbeat missed six
  runs. See 12_Brain/07_Reviews/2026-09-15 - Cadence tasks cannot run unattended.

  This switches them to S4U -- runs whether or not the user is logged on, and
  stores no password -- and sets StartWhenAvailable so a slot missed while the
  machine is down is caught up on the next boot.

  MUST BE RUN FROM AN ELEVATED POWERSHELL. Set-ScheduledTask on these tasks
  returns "Access is denied" otherwise.

  Changes nothing else: same triggers, same actions, same schedule. Reversible
  by re-running with -Revert.
#>
[CmdletBinding()]
param([switch]$Revert)

$ErrorActionPreference = 'Stop'
$names = 'Cadence-daily','Cadence-weekly','Cadence-monthly','Cadence-sweep-heartbeat'

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
Get-ScheduledTask -TaskName 'Cadence-*' | ForEach-Object {
  $i = $_ | Get-ScheduledTaskInfo
  [pscustomobject]@{
    Name      = $_.TaskName
    Logon     = $_.Principal.LogonType
    CatchUp   = $_.Settings.StartWhenAvailable
    LastRun   = $i.LastRunTime
    NextRun   = $i.NextRunTime
  }
} | Format-Table -AutoSize

Write-Host "Now prove it. Run the daily task once by hand and check the ledger:"
Write-Host "  Start-ScheduledTask -TaskName Cadence-daily"
Write-Host "  Get-Content 'C:\Users\dillo\repos\dillon-os\_os\automation\cadence\run-ledger.jsonl' -Tail 3"
