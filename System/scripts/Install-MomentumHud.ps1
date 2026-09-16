<#
.SYNOPSIS
  Register _os/server.js (the D.I.L.L.O.N. OS HUD) as an always-on logon
  task for the current Windows user.

.DESCRIPTION
  Registers Task Scheduler task Momentum-HUD: trigger AtLogOn for the
  current user, action node.exe _os/server.js from the repo root, restart on
  failure every 1 minute up to 99 times, no execution time limit, catches up
  a missed start with StartWhenAvailable, never stops the HUD just because
  the machine switched to battery, and refuses a second copy of itself
  (MultipleInstances IgnoreNew).

  LogonType Interactive, RunLevel Limited -- NOT S4U. S4U needs elevation and
  both Register-ScheduledTask and Set-ScheduledTask with S4U are refused
  unelevated on this machine (see Repair-ScheduledTasks.ps1 in this same
  folder). Interactive + Limited registers fine unelevated, as the current
  user, running only while that user is logged on -- which is what "always
  on for the current Windows user" means here.

  IDEMPOTENT. Stops and unregisters an existing Momentum-HUD first, then
  registers fresh. Prints the task's state at the end either way. Supports
  -Uninstall to remove the task and stop there.

.EXAMPLE
  powershell -NoProfile -ExecutionPolicy Bypass -File Install-MomentumHud.ps1
.EXAMPLE
  powershell -NoProfile -ExecutionPolicy Bypass -File Install-MomentumHud.ps1 -Uninstall
#>
[CmdletBinding()]
param([switch]$Uninstall)

Set-StrictMode -Version Latest

$TASK    = 'Momentum-HUD'
$NODE    = 'C:\Program Files\nodejs\node.exe'
$SERVER  = 'C:\Users\dillo\repos\dillon-os\_os\server.js'
$WORKDIR = 'C:\Users\dillo\repos\dillon-os'
$user    = "$env:USERDOMAIN\$env:USERNAME"

function Show-TaskState {
  $t = Get-ScheduledTask -TaskName $TASK -ErrorAction SilentlyContinue
  if (-not $t) {
    Write-Host "  $TASK is not registered." -ForegroundColor Yellow
    return
  }
  $i = $t | Get-ScheduledTaskInfo
  [pscustomobject]@{
    Name       = $t.TaskName
    Logon      = $t.Principal.LogonType
    State      = $t.State
    LastRun    = $i.LastRunTime
    NextRun    = $i.NextRunTime
    LastResult = $i.LastTaskResult
  } | Format-Table -AutoSize
}

# Idempotent: always start from a clean slate. Stop first so a running
# instance does not keep the port held open under an unregistered task.
$existing = Get-ScheduledTask -TaskName $TASK -ErrorAction SilentlyContinue
if ($existing) {
  if ($existing.State -eq 'Running') { Stop-ScheduledTask -TaskName $TASK -ErrorAction SilentlyContinue }
  Unregister-ScheduledTask -TaskName $TASK -Confirm:$false
  Write-Host "  removed existing $TASK"
}

if ($Uninstall) {
  Write-Host ''
  Show-TaskState
  exit 0
}

if (-not (Test-Path $NODE)) {
  Write-Host "  NODE NOT FOUND at $NODE. Nothing was registered." -ForegroundColor Red
  exit 1
}

try {
  $argStr    = '"' + $SERVER + '"'
  $action    = New-ScheduledTaskAction -Execute $NODE -Argument $argStr -WorkingDirectory $WORKDIR
  $trigger   = New-ScheduledTaskTrigger -AtLogOn -User $user
  $principal = New-ScheduledTaskPrincipal -UserId $user -LogonType Interactive -RunLevel Limited
  $settings  = New-ScheduledTaskSettingsSet -StartWhenAvailable -DontStopIfGoingOnBatteries `
                 -MultipleInstances IgnoreNew -ExecutionTimeLimit ([TimeSpan]::Zero) `
                 -RestartCount 99 -RestartInterval (New-TimeSpan -Minutes 1)

  Register-ScheduledTask -TaskName $TASK -Action $action -Trigger $trigger `
    -Settings $settings -Principal $principal -Force | Out-Null
  Write-Host "  REGISTERED $TASK (AtLogOn, Interactive, restart on failure)" -ForegroundColor Green
}
catch {
  Write-Host "  FAILED to register $TASK -- $($_.Exception.Message)" -ForegroundColor Red
  exit 2
}

Write-Host ''
Show-TaskState
