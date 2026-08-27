<#
.SYNOPSIS
    Validate exposed agent generation: partition, idempotence, and artifact parity.

.EXAMPLE
    & .\System\scripts\Test-ExposedAgents.ps1
    & .\System\scripts\Test-ExposedAgents.ps1 -Json
#>
[CmdletBinding()]
param(
    [string]$VaultRoot = (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent),
    [switch]$Json
)

$ErrorActionPreference = 'Stop'
try { [Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false) } catch { }

$resolvedVault = (Resolve-Path -LiteralPath $VaultRoot).Path
$builder = Join-Path $resolvedVault 'System/scripts/Build-ClaudeAgents.py'
$registry = Join-Path $resolvedVault '11_Agents/claude-operating-team.json'
$claudeDir = Join-Path $resolvedVault '.claude/agents'
$codexDir = Join-Path $resolvedVault '.codex/agents'
$userClaudeDir = Join-Path $env:USERPROFILE '.claude/agents'
$userCodexDir = Join-Path $env:USERPROFILE '.codex/agents'
$prospectCanary = Join-Path $resolvedVault '00_Inbox/Agent-Proposals/Cursor/2026-08-26-prospect-intelligence-scout-canary.md'

$checks = New-Object System.Collections.Generic.List[object]
function Add-Check {
    param([string]$Name, [string]$Expected, $Actual, [bool]$Ok)
    $checks.Add([pscustomobject]@{ check = $Name; expected = $Expected; actual = $Actual; ok = $Ok })
}

foreach ($p in @($builder, $registry)) {
    if (-not (Test-Path -LiteralPath $p)) {
        Write-Host "BLOCKED: required source missing: $p"; exit 1
    }
}

$expectedAgents = @(
    'marketing-chief', 'web-product-builder', 'qa-critic', 'paid-media-analyst',
    'revenue-ops-analyst', 'client-success-advisor', 'prospect-intelligence-scout',
    'growth-content', 'brain-curator', 'reliability-scout'
)

function Get-FileSha {
    param([string]$Path)
    if (-not (Test-Path -LiteralPath $Path)) { return 'ABSENT' }
    return (Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash
}

function Get-AgentHashes {
    param([string]$Dir, [string]$Ext)
    $map = @{}
    foreach ($name in $expectedAgents) {
        $map[$name] = Get-FileSha -Path (Join-Path $Dir ($name + $Ext))
    }
    return $map
}

$beforeClaude = Get-AgentHashes -Dir $claudeDir -Ext '.md'
$beforeCodex = Get-AgentHashes -Dir $codexDir -Ext '.toml'

& python $builder | Out-Null
if ($LASTEXITCODE -ne 0) { Add-Check 'builder_first_run' 'exit 0' $LASTEXITCODE $false }
else { Add-Check 'builder_first_run' 'exit 0' 0 $true }

$midClaude = Get-AgentHashes -Dir $claudeDir -Ext '.md'
$midCodex = Get-AgentHashes -Dir $codexDir -Ext '.toml'

& python $builder | Out-Null
if ($LASTEXITCODE -ne 0) { Add-Check 'builder_second_run' 'exit 0' $LASTEXITCODE $false }
else { Add-Check 'builder_second_run' 'exit 0' 0 $true }

$afterClaude = Get-AgentHashes -Dir $claudeDir -Ext '.md'
$afterCodex = Get-AgentHashes -Dir $codexDir -Ext '.toml'

$idempotent = $true
foreach ($name in $expectedAgents) {
    if ($midClaude[$name] -ne $afterClaude[$name]) { $idempotent = $false; break }
    if ($midCodex[$name] -ne $afterCodex[$name]) { $idempotent = $false; break }
}
Add-Check 'generator_idempotent' 'stable hashes on rerun' $idempotent $idempotent

$claudeFiles = @(Get-ChildItem -LiteralPath $claudeDir -Filter '*.md' -File | ForEach-Object { $_.BaseName })
$codexFiles = @(Get-ChildItem -LiteralPath $codexDir -Filter '*.toml' -File | ForEach-Object { $_.BaseName })
Add-Check 'claude_agent_count' '10' $claudeFiles.Count ($claudeFiles.Count -eq 10)
Add-Check 'codex_agent_count' '10' $codexFiles.Count ($codexFiles.Count -eq 10)

$claudeDrift = @(Compare-Object -ReferenceObject ($expectedAgents | Sort-Object) -DifferenceObject ($claudeFiles | Sort-Object))
$codexDrift = @(Compare-Object -ReferenceObject ($expectedAgents | Sort-Object) -DifferenceObject ($codexFiles | Sort-Object))
Add-Check 'claude_names_match' '0 differences' $claudeDrift.Count ($claudeDrift.Count -eq 0)
Add-Check 'codex_names_match' '0 differences' $codexDrift.Count ($codexDrift.Count -eq 0)

$newUserAgents = @('revenue-ops-analyst', 'client-success-advisor', 'prospect-intelligence-scout')
$userCodexDrift = @()
foreach ($name in $newUserAgents) {
    $projectHash = Get-FileSha -Path (Join-Path $codexDir ($name + '.toml'))
    $userHash = Get-FileSha -Path (Join-Path $userCodexDir ($name + '.toml'))
    if ($projectHash -ne $userHash) { $userCodexDrift += $name }
}
Add-Check 'user_codex_new_agents_match' '0 hash differences' $userCodexDrift.Count ($userCodexDrift.Count -eq 0)

$retiredUserPaths = @(
    (Join-Path $userClaudeDir 'client-comms-desk.md'),
    (Join-Path $userCodexDir 'client-comms-desk.toml')
)
$retiredPresent = @($retiredUserPaths | Where-Object { Test-Path -LiteralPath $_ })
Add-Check 'retired_user_agent_absent' '0 files' $retiredPresent.Count ($retiredPresent.Count -eq 0)

$prospectClaudeText = Get-Content -LiteralPath (Join-Path $claudeDir 'prospect-intelligence-scout.md') -Raw
$prospectCodexText = Get-Content -LiteralPath (Join-Path $codexDir 'prospect-intelligence-scout.toml') -Raw
$scheduledHeadingCount = @([regex]::Matches($prospectClaudeText, '(?m)^## Scheduled routines\s*$')).Count
$scheduledCodexHeadingCount = @([regex]::Matches($prospectCodexText, '(?m)^## Scheduled routines\s*$')).Count
Add-Check 'scout_single_scheduled_heading_claude' '1' $scheduledHeadingCount ($scheduledHeadingCount -eq 1)
Add-Check 'scout_single_scheduled_heading_codex' '1' $scheduledCodexHeadingCount ($scheduledCodexHeadingCount -eq 1)

$specialistQueueLeaks = @()
foreach ($name in $expectedAgents | Where-Object { $_ -ne 'marketing-chief' }) {
    foreach ($path in @((Join-Path $claudeDir ($name + '.md')), (Join-Path $codexDir ($name + '.toml')))) {
        $text = Get-Content -LiteralPath $path -Raw
        if ($text -match 'Draft locally, append to `System/approval-queue\.md`') { $specialistQueueLeaks += $path }
        if ($text -notmatch 'Marketing Chief is the sole queue writer') { $specialistQueueLeaks += ($path + ':missing-sole-writer') }
    }
}
Add-Check 'specialists_cannot_write_queue' '0 leaks' $specialistQueueLeaks.Count ($specialistQueueLeaks.Count -eq 0)

$marketingChiefQueueContract = Get-Content -LiteralPath (Join-Path $codexDir 'marketing-chief.toml') -Raw
$marketingChiefIsQueueWriter =
    ($marketingChiefQueueContract -match 'Marketing Chief is the only') -and
    ($marketingChiefQueueContract -match 'allowed to write that approval surface or another canonical queue')
Add-Check 'marketing_chief_is_queue_writer' 'explicit sole-writer contract' `
    $marketingChiefIsQueueWriter `
    $marketingChiefIsQueueWriter

$canaryText = if (Test-Path -LiteralPath $prospectCanary) { Get-Content -LiteralPath $prospectCanary -Raw } else { '' }
$canaryIdentityOk = ($canaryText -match '`registry:redrosefamilydental`') -and ($canaryText -notmatch '`domain:redrosefamilydental`')
Add-Check 'canary_registry_fallback_key' 'registry fallback, no fake domain key' $canaryIdentityOk $canaryIdentityOk

$reg = Get-Content -LiteralPath $registry -Raw | ConvertFrom-Json
$allRoutineIds = @($reg.routines | ForEach-Object { $_.routine_id } | Sort-Object -Unique)
$routineCounts = @{}
foreach ($id in $allRoutineIds) { $routineCounts[$id] = 0 }
$scoutPath = Join-Path $claudeDir 'prospect-intelligence-scout.md'
$scoutText = if (Test-Path -LiteralPath $scoutPath) { Get-Content -LiteralPath $scoutPath -Raw } else { '' }
$scoutRoutineRows = @([regex]::Matches($scoutText, '\|\s*`([A-Z][0-9]{2})`\s*\|') | ForEach-Object { $_.Groups[1].Value })
Add-Check 'scout_zero_scheduled_routines' '0 rows' $scoutRoutineRows.Count ($scoutRoutineRows.Count -eq 0)

foreach ($md in Get-ChildItem -LiteralPath $claudeDir -Filter '*.md' -File) {
    $text = Get-Content -LiteralPath $md.FullName -Raw
    foreach ($id in $allRoutineIds) {
        if ($text -match ('\|\s*`' + [regex]::Escape($id) + '`\s*\|')) {
            $routineCounts[$id] = $routineCounts[$id] + 1
        }
    }
}
$foundUnique = @($routineCounts.GetEnumerator() | Where-Object { $_.Value -gt 0 } | ForEach-Object { $_.Key } | Sort-Object -Unique)
$missingIds = @($allRoutineIds | Where-Object { $routineCounts[$_] -eq 0 })
$duplicateIds = @($routineCounts.GetEnumerator() | Where-Object { $_.Value -gt 1 } | ForEach-Object { $_.Key } | Sort-Object)
$partitionOk = ($foundUnique.Count -eq 54) -and ($missingIds.Count -eq 0) -and ($duplicateIds.Count -eq 0)
Add-Check 'routine_partition_in_agents' '54/54 unique' $foundUnique.Count $partitionOk
Add-Check 'routine_exactly_once' '0 duplicates' $duplicateIds.Count ($duplicateIds.Count -eq 0)
if ($duplicateIds.Count -gt 0) {
    Add-Check 'routine_duplicate_ids' 'none' ($duplicateIds -join ', ') $false
}
if ($missingIds.Count -gt 0) {
    Add-Check 'routine_missing_ids' 'none' ($missingIds -join ', ') $false
}

$codexRoutineCounts = @{}
foreach ($id in $allRoutineIds) { $codexRoutineCounts[$id] = 0 }
foreach ($toml in Get-ChildItem -LiteralPath $codexDir -Filter '*.toml' -File) {
    $text = Get-Content -LiteralPath $toml.FullName -Raw
    foreach ($id in $allRoutineIds) {
        if ($text -match ('\|\s*`' + [regex]::Escape($id) + '`\s*\|')) {
            $codexRoutineCounts[$id] = $codexRoutineCounts[$id] + 1
        }
    }
}
$codexMissing = @($allRoutineIds | Where-Object { $codexRoutineCounts[$_] -eq 0 })
$codexDuplicates = @($codexRoutineCounts.GetEnumerator() | Where-Object { $_.Value -gt 1 })
$codexPartitionOk = ($codexMissing.Count -eq 0) -and ($codexDuplicates.Count -eq 0)
Add-Check 'codex_routine_exactly_once' '54/54, no duplicates' $codexPartitionOk $codexPartitionOk

$failed = @($checks | Where-Object { -not $_.ok })
$overall = $(if ($failed.Count -eq 0) { 'pass' } else { 'fail' })

if ($Json) {
    [pscustomobject]@{
        harness = 'Test-ExposedAgents'; overall = $overall
        passed = ($checks.Count - $failed.Count); total = $checks.Count
        checks = $checks.ToArray()
    } | ConvertTo-Json -Depth 6
} else {
    Write-Host ''
    Write-Host 'Exposed agent validation'
    Write-Host ('-' * 72)
    foreach ($c in $checks) {
        $mark = $(if ($c.ok) { 'ok  ' } else { 'FAIL' })
        Write-Host ("  [{0}] {1,-34} expected {2,-18} actual {3}" -f $mark, $c.check, $c.expected, $c.actual)
    }
    Write-Host ('-' * 72)
    Write-Host ("  overall {0}  {1}/{2} checks passed" -f $overall.ToUpperInvariant(), ($checks.Count - $failed.Count), $checks.Count)
    Write-Host ''
}

if ($overall -ne 'pass') { exit 1 }
exit 0
