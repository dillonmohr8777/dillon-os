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
    'revenue-ops-analyst', 'client-success-advisor', 'client-comms-desk',
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

$reg = Get-Content -LiteralPath $registry -Raw | ConvertFrom-Json
$allRoutineIds = @($reg.routines | ForEach-Object { $_.routine_id } | Sort-Object -Unique)
$found = New-Object System.Collections.Generic.List[string]
foreach ($md in Get-ChildItem -LiteralPath $claudeDir -Filter '*.md' -File) {
    $text = Get-Content -LiteralPath $md.FullName -Raw
    foreach ($id in $allRoutineIds) {
        if ($text -match ('\|\s*`' + [regex]::Escape($id) + '`\s*\|')) { $found.Add($id) }
    }
}
$foundUnique = @($found | Sort-Object -Unique)
$partitionOk = ($foundUnique.Count -eq 54) -and (@(Compare-Object $allRoutineIds $foundUnique).Count -eq 0)
Add-Check 'routine_partition_in_agents' '54/54' $foundUnique.Count $partitionOk

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
