<#
.SYNOPSIS
    Register the Immohrtal seven-agent crew as a hidden scheduled task.

.DESCRIPTION
    Writes the console-free command into hidden-scheduled-tasks.tsv and registers
    Immohrtal-Crew through Run-HiddenScheduledTask.vbs. Does not enable the
    disabled IMMOHRTAL Agency Daily task. Does not send, publish, or deploy.

.EXAMPLE
    & .\System\scripts\Register-ImmohrtalCrewTask.ps1
#>
[CmdletBinding()]
param(
    [string]$VaultRoot = $(if ($PSScriptRoot) { Split-Path (Split-Path $PSScriptRoot -Parent) -Parent } else { 'C:\Users\dillo\repos\dillon-os' }),
    [string]$TaskName = 'Immohrtal-Crew',
    [string]$ManifestPath = 'C:\Users\dillo\.codex\tools\hidden-scheduled-tasks.tsv',
    [string]$VbsHost = 'C:\Users\dillo\.codex\tools\Run-HiddenScheduledTask.vbs',
    [int]$IntervalHours = 2
)

$ErrorActionPreference = 'Stop'
$resolvedVault = (Resolve-Path -LiteralPath $VaultRoot).Path
$crew = Join-Path $resolvedVault 'System\scripts\Invoke-ImmohrtalCrew.ps1'
if (-not (Test-Path -LiteralPath $crew)) { throw "missing $crew" }
if (-not (Test-Path -LiteralPath $VbsHost)) { throw "missing $VbsHost" }

$ps = 'C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe'
$commandLine = '"' + $ps + '" -NoLogo -NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -File "' + $crew + '" -VaultRoot "' + $resolvedVault + '" -Json'
$row = $TaskName + "`t" + $commandLine

$lines = New-Object System.Collections.Generic.List[string]
if (Test-Path -LiteralPath $ManifestPath) {
    Copy-Item -LiteralPath $ManifestPath -Destination ($ManifestPath + '.bak-immohrtal-crew') -Force
    foreach ($line in [System.IO.File]::ReadAllLines($ManifestPath)) {
        if ($line.Length -gt 0 -and $line[0] -ne '#') {
            $ti = $line.IndexOf("`t")
            if ($ti -gt 0 -and $line.Substring(0, $ti) -eq $TaskName) { continue }
        }
        $lines.Add($line)
    }
} else {
    $lines.Add('# Task name<TAB>original command line. This manifest is the reversible source of truth for console-free scheduled-task launch.')
}
$lines.Add($row)
$utf8 = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllLines($ManifestPath, $lines.ToArray(), $utf8)

$action = New-ScheduledTaskAction -Execute 'C:\Windows\System32\wscript.exe' `
    -Argument ('//B //Nologo "' + $VbsHost + '" "' + $TaskName + '"')
$start = (Get-Date).AddMinutes(2)
$trigger = New-ScheduledTaskTrigger -Once -At $start -RepetitionInterval (New-TimeSpan -Hours $IntervalHours) -RepetitionDuration ([TimeSpan]::FromDays(3650))
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -MultipleInstances IgnoreNew -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit (New-TimeSpan -Minutes 20)
$settings.WakeToRun = $false
$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited
$description = 'Immohrtal seven-agent local crew. Drafts and receipts only. mail_ready=hold. Does not send, publish, deploy, or write the canonical client queue.'

$existing = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($existing) {
    Set-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Description $description | Out-Null
} else {
    Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Description $description | Out-Null
}

$task = Get-ScheduledTask -TaskName $TaskName
[pscustomobject]@{
    task = $task.TaskName
    state = [string]$task.State
    execute = $task.Actions[0].Execute
    arguments = $task.Actions[0].Arguments
    interval_hours = $IntervalHours
    manifest = $ManifestPath
    crew = $crew
    mail_ready = 'hold'
    enabled_agency_daily = $false
} | ConvertTo-Json -Depth 4
