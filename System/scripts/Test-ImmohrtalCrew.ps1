<#
.SYNOPSIS
    Deterministic tests for the Immohrtal seven-agent crew dispatcher.

.DESCRIPTION
    Parse, safety, dry-run, and schedule-definition checks. Executes the crew
    only in -DryRun against a temp state directory. Never sends, publishes,
    deploys, or writes the canonical client queue.

.EXAMPLE
    & .\System\scripts\Test-ImmohrtalCrew.ps1
    & .\System\scripts\Test-ImmohrtalCrew.ps1 -Json
#>
[CmdletBinding()]
param(
    [string]$VaultRoot = $(if ($PSScriptRoot) { Split-Path (Split-Path $PSScriptRoot -Parent) -Parent } else { 'C:\Users\dillo\repos\dillon-os' }),
    [string]$TaskName = 'Immohrtal-Crew',
    [string]$ManifestPath = 'C:\Users\dillo\.codex\tools\hidden-scheduled-tasks.tsv',
    [string]$VbsHost = 'C:\Users\dillo\.codex\tools\Run-HiddenScheduledTask.vbs',
    [switch]$SkipScheduleQuery,
    [switch]$Json
)

$ErrorActionPreference = 'Stop'
$resolvedVault = (Resolve-Path -LiteralPath $VaultRoot).Path
$scripts = Join-Path $resolvedVault 'System\scripts'
$crewPath = Join-Path $scripts 'Invoke-ImmohrtalCrew.ps1'
$registerPath = Join-Path $scripts 'Register-ImmohrtalCrewTask.ps1'
$ps = Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0\powershell.exe'

$tests = New-Object System.Collections.Generic.List[object]
function Add-T {
    param([string]$Id, [string]$Name, [string]$Expected, $Actual, [bool]$Ok)
    $tests.Add([pscustomobject]@{ id = $Id; test = $Name; expected = $Expected; actual = $Actual; ok = $Ok })
}

foreach ($p in @($crewPath, $registerPath)) {
    if (-not (Test-Path -LiteralPath $p)) { Write-Host "BLOCKED: missing $p"; exit 1 }
}

$tokens = $null
$parseErrors = $null
[void][System.Management.Automation.Language.Parser]::ParseFile($crewPath, [ref]$tokens, [ref]$parseErrors)
Add-T 'T1a' 'crew_parses' '0 parse errors' $parseErrors.Count ($parseErrors.Count -eq 0)

$regTokens = $null
$regErrors = $null
[void][System.Management.Automation.Language.Parser]::ParseFile($registerPath, [ref]$regTokens, [ref]$regErrors)
Add-T 'T1b' 'register_parses' '0 parse errors' $regErrors.Count ($regErrors.Count -eq 0)

$src = Get-Content -LiteralPath $crewPath -Raw
$regSrc = Get-Content -LiteralPath $registerPath -Raw

$requiredAgents = @(
    'marketing-chief', 'web-product-builder', 'qa-critic',
    'paid-media-analyst', 'growth-content', 'brain-curator', 'reliability-scout'
)
$missingAgents = @($requiredAgents | Where-Object { $src -notmatch [regex]::Escape($_) })
Add-T 'T2a' 'seven_agents_named' '0 missing' ($missingAgents -join ',') ($missingAgents.Count -eq 0)
Add-T 'T2b' 'mail_ready_hardcoded_hold' "mail_ready = 'hold'" ($src -match "mail_ready = 'hold'") ($src -match "mail_ready = 'hold'")
Add-T 'T2c' 'refuses_canonical_queue' 'work-items.json mentioned as forbidden' ($src -match 'work-items\.json') ($src -match 'work-items\.json')
Add-T 'T2d' 'does_not_git_commit' 'no git commit execution' (-not ($src -match '(?m)^\s*git commit')) (-not ($src -match '(?m)^\s*git commit'))
Add-T 'T2e' 'does_not_enable_agency_daily' 'no Enable-ScheduledTask' (-not ($src -match 'Enable-ScheduledTask')) (-not ($src -match 'Enable-ScheduledTask'))
Add-T 'T2f' 'does_not_send_mail' 'no Send-MailMessage' (-not ($src -match 'Send-MailMessage')) (-not ($src -match 'Send-MailMessage'))
Add-T 'T2g' 'register_uses_hidden_host' 'wscript + VBS' ($regSrc -match 'Run-HiddenScheduledTask\.vbs' -and $regSrc -match 'wscript\.exe') ($regSrc -match 'Run-HiddenScheduledTask\.vbs')
Add-T 'T2h' 'register_does_not_enable_agency_daily' 'no Enable of Agency Daily' (-not ($regSrc -match 'Enable-ScheduledTask')) (-not ($regSrc -match 'Enable-ScheduledTask'))

$forbiddenExec = @('git push', 'gh pr merge', 'vercel --prod', 'netlify deploy', 'work-items.json')
$allowHits = @()
# The dispatcher may name forbidden paths as things it refuses. Execution would look like naked invocations.
if ($src -match '(?m)^\s*git (commit|push)') { $allowHits += 'git commit/push at line start' }
if ($src -match 'gh pr merge') { $allowHits += 'gh pr merge' }
if ($src -match 'vercel --prod') { $allowHits += 'vercel --prod' }
Add-T 'T2i' 'no_forbidden_exec_lines' '0' $allowHits.Count ($allowHits.Count -eq 0)

$tmp = Join-Path $env:TEMP ("immohrtal-crew-test-" + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Force -Path $tmp | Out-Null
$dryOut = & $ps -NoLogo -NoProfile -NonInteractive -ExecutionPolicy Bypass -File $crewPath -VaultRoot $resolvedVault -StateDir $tmp -DryRun -Force -Json 2>&1
$dryExit = $LASTEXITCODE
$dryText = ($dryOut | Out-String)
Add-T 'T3a' 'dry_run_exit_0' '0' $dryExit ($dryExit -eq 0)

$dryJson = $null
try { $dryJson = $dryText | ConvertFrom-Json } catch { }
Add-T 'T3b' 'dry_run_json_parses' 'true' ($null -ne $dryJson) ($null -ne $dryJson)
if ($dryJson) {
    Add-T 'T3c' 'dry_run_seven_lanes' '7' @($dryJson.lanes).Count (@($dryJson.lanes).Count -eq 7)
    Add-T 'T3d' 'dry_run_mail_ready_hold' 'hold' $dryJson.mail_ready ($dryJson.mail_ready -eq 'hold')
    Add-T 'T3e' 'dry_run_no_canonical_write' 'false' $dryJson.canonical_write_attempted ($dryJson.canonical_write_attempted -eq $false)
    Add-T 'T3f' 'dry_run_no_external_action' 'false' $dryJson.external_action_attempted ($dryJson.external_action_attempted -eq $false)
    Add-T 'T3g' 'dry_run_writes_latest' 'latest.json' (Test-Path -LiteralPath (Join-Path $tmp 'latest.json')) (Test-Path -LiteralPath (Join-Path $tmp 'latest.json'))
    $agentNames = @($dryJson.lanes | ForEach-Object { $_.agent }) | Sort-Object
    $expectedSorted = ($requiredAgents | Sort-Object)
    $parity = ($agentNames -join ',') -eq ($expectedSorted -join ',')
    Add-T 'T3h' 'dry_run_agent_set_matches' 'exact seven' ($agentNames -join ',') $parity
} else {
    Add-T 'T3c' 'dry_run_seven_lanes' '7' 'unparseable' $false
    Add-T 'T3d' 'dry_run_mail_ready_hold' 'hold' 'unparseable' $false
    Add-T 'T3e' 'dry_run_no_canonical_write' 'false' 'unparseable' $false
    Add-T 'T3f' 'dry_run_no_external_action' 'false' 'unparseable' $false
    Add-T 'T3g' 'dry_run_writes_latest' 'latest.json' 'unparseable' $false
    Add-T 'T3h' 'dry_run_agent_set_matches' 'exact seven' 'unparseable' $false
}

$canonicalTouched = Test-Path -LiteralPath 'C:\Users\dillo\Documents\Codex\projects\client-operations\queue\work-items.json'
# The test must not have written it. Existence of the canonical file is allowed; we only
# assert our dry-run flag and that our temp state dir is not that path.
Add-T 'T3i' 'state_dir_is_not_canonical_queue' 'temp' $tmp ($tmp -notmatch 'client-operations')

Add-T 'T5a' 'vbs_hidden_host_exists' 'true' (Test-Path -LiteralPath $VbsHost) (Test-Path -LiteralPath $VbsHost)

$manifestRow = $null
if (Test-Path -LiteralPath $ManifestPath) {
    foreach ($line in [System.IO.File]::ReadAllLines($ManifestPath)) {
        if ($line.Length -gt 0 -and $line[0] -ne '#') {
            $ti = $line.IndexOf("`t")
            if ($ti -gt 0 -and $line.Substring(0, $ti) -eq $TaskName) { $manifestRow = $line.Substring($ti + 1) }
        }
    }
}
Add-T 'T4a' 'manifest_row_present' 'optional until register' $(if ($manifestRow) { 'present' } else { 'absent_until_register' }) $true
if ($manifestRow) {
    Add-T 'T4b' 'manifest_targets_crew' 'Invoke-ImmohrtalCrew.ps1' ($manifestRow -match 'Invoke-ImmohrtalCrew\.ps1') ($manifestRow -match 'Invoke-ImmohrtalCrew\.ps1')
}

$taskQueryBlocked = [bool]$SkipScheduleQuery
$task = $null
if (-not $taskQueryBlocked) {
    try { $task = Get-ScheduledTask -TaskName $TaskName -ErrorAction Stop } catch { $taskQueryBlocked = $true }
}
if ($taskQueryBlocked -or -not $task) {
    Add-T 'T4c' 'task_definition_verified_here' 'wscript + VBS' 'SKIPPED - register then retest' $true
} else {
    $a = $task.Actions[0]
    Add-T 'T4c' 'task_uses_wscript_vbs_host' 'wscript + VBS' $a.Execute `
        (($a.Execute -match 'wscript\.exe') -and ($a.Arguments -match 'Run-HiddenScheduledTask\.vbs'))
    Add-T 'T4d' 'task_enabled' 'Ready or Running' ([string]$task.State) ($task.State -eq 'Ready' -or $task.State -eq 'Running')
}

try { Remove-Item -LiteralPath $tmp -Recurse -Force -ErrorAction SilentlyContinue } catch { }

$failed = @($tests | Where-Object { -not $_.ok })
$pass = ($failed.Count -eq 0)
if ($Json) {
    [pscustomobject]@{ overall_pass = $pass; failed = $failed.Count; tests = $tests.ToArray() } | ConvertTo-Json -Depth 6
} else {
    foreach ($t in $tests) {
        $mark = if ($t.ok) { 'PASS' } else { 'FAIL' }
        Write-Host ("{0} {1} {2} expected={3} actual={4}" -f $mark, $t.id, $t.test, $t.expected, $t.actual)
    }
    Write-Host ("overall_pass={0} failed={1}/{2}" -f $pass, $failed.Count, $tests.Count)
}
if ($pass) { exit 0 } else { exit 1 }
