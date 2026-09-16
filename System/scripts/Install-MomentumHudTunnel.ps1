<#
.SYNOPSIS
  Register cloudflared as an always-on logon task, so the quick tunnel to
  the Momentum Agent Console restarts with the machine instead of dying
  with whatever shell started it.

.DESCRIPTION
  Same pattern as Install-MomentumHud.ps1 in this folder: AtLogOn for the
  current user, Interactive/Limited (not S4U, which needs elevation and is
  refused unelevated here), restart on failure, no execution time limit,
  survives battery. IDEMPOTENT, supports -Uninstall.

  This is the quick anonymous tunnel (cloudflared tunnel --url), not a
  named tunnel with a fixed hostname -- the URL changes on every restart.
  It only covers "the machine is on but this session ended," not "the
  machine is off." That ceiling is the known unfixed power supply fault
  (see 12_Brain/07_Reviews/2026-09-09 - Machine power fault diagnosis.md);
  the cloud mirror (_os/cloud-console/) is the real fix for that.

.EXAMPLE
  powershell -NoProfile -ExecutionPolicy Bypass -File Install-MomentumHudTunnel.ps1
.EXAMPLE
  powershell -NoProfile -ExecutionPolicy Bypass -File Install-MomentumHudTunnel.ps1 -Uninstall
#>
[CmdletBinding()]
param([switch]$Uninstall)

Set-StrictMode -Version Latest

$TASK       = 'Momentum-HUD-Tunnel'
$CLOUDFLARED = 'C:\Program Files (x86)\cloudflared\cloudflared.exe'
$WORKDIR    = 'C:\Users\dillo\repos\dillon-os'
$user       = "$env:USERDOMAIN\$env:USERNAME"

function Show-TaskState {
  $t = Get-ScheduledTask -TaskName $TASK -ErrorAction SilentlyContinue
  if (-not $t) { Write-Host "  $TASK is not registered." -ForegroundColor Yellow; return }
  $i = $t | Get-ScheduledTaskInfo
  [pscustomobject]@{ Name=$t.TaskName; Logon=$t.Principal.LogonType; State=$t.State; LastRun=$i.LastRunTime; NextRun=$i.NextRunTime; LastResult=$i.LastTaskResult } | Format-Table -AutoSize
}

$existing = Get-ScheduledTask -TaskName $TASK -ErrorAction SilentlyContinue
if ($existing) {
  if ($existing.State -eq 'Running') { Stop-ScheduledTask -TaskName $TASK -ErrorAction SilentlyContinue }
  Unregister-ScheduledTask -TaskName $TASK -Confirm:$false
  Write-Host "  removed existing $TASK"
}

if ($Uninstall) { Write-Host ''; Show-TaskState; exit 0 }

if (-not (Test-Path $CLOUDFLARED)) {
  Write-Host "  CLOUDFLARED NOT FOUND at $CLOUDFLARED. Nothing was registered." -ForegroundColor Red
  exit 1
}

try {
  $argStr    = 'tunnel --url http://127.0.0.1:4242 --no-autoupdate'
  $action    = New-ScheduledTaskAction -Execute $CLOUDFLARED -Argument $argStr -WorkingDirectory $WORKDIR
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
