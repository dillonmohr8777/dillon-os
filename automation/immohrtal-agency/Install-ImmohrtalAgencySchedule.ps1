[CmdletBinding()]
param(
  [ValidateSet('Install', 'Remove')]
  [string]$Action = 'Install',
  [string]$Time = '08:10'
)

$ErrorActionPreference = 'Stop'
$taskName = 'IMMOHRTAL Agency Daily'
$launcher = 'C:\Users\dillo\.codex\tools\Run-HiddenScheduledTask.vbs'
$manifest = 'C:\Users\dillo\.codex\tools\hidden-scheduled-tasks.tsv'

if ($Action -eq 'Remove') {
  & schtasks.exe /Delete /TN $taskName /F | Out-Null
  exit $LASTEXITCODE
}

if (-not (Test-Path -LiteralPath $launcher)) { throw "Hidden launcher missing: $launcher" }
if (-not (Test-Path -LiteralPath $manifest)) { throw "Hidden task manifest missing: $manifest" }
$manifestLine = Get-Content -LiteralPath $manifest | Where-Object { $_ -like "$taskName`t*" }
if (-not $manifestLine) { throw "Hidden task manifest has no entry for $taskName." }

$taskCommand = "wscript.exe `"$launcher`" `"$taskName`""
& schtasks.exe /Create /TN $taskName /TR $taskCommand /SC WEEKLY /D MON,TUE,WED,THU,FRI /ST $Time /RL LIMITED /F | Out-Null
if ($LASTEXITCODE -ne 0) { throw "schtasks create failed with exit code $LASTEXITCODE." }
& schtasks.exe /Query /TN $taskName /FO LIST /V
