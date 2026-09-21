<#
.SYNOPSIS
    Thin compatibility wrapper. The bounded dispatcher now lives in
    _os/automation/bin/claude-loop.js so the read-only allowlist runs wherever the repo is cloned.

.DESCRIPTION
    Keeps the parameter surface the Windows scheduled task, Invoke-ClaudeDailyDriver.ps1, and
    Test-ClaudeDailyDriver.ps1 already use, maps it onto the Node CLI flags, and returns the
    child's stdout as ONE string so `| ConvertFrom-Json` keeps working (a native command
    would otherwise emit one pipeline object per line). Exit code is passed through.

    Gates, stages, receipts, dedupe, checkpoints, lease, circuit breaker, and the approval
    boundary are implemented in claude-loop.js. Nothing here executes work itself.

.EXAMPLE
    & .\System\scripts\Invoke-ClaudeLoop.ps1                          # gate report, all 54
    & .\System\scripts\Invoke-ClaudeLoop.ps1 -RoutineId W11 -Execute
    & .\System\scripts\Invoke-ClaudeLoop.ps1 -RoutineId W11 -Execute -Fixture
#>
[CmdletBinding()]
param(
    [string]$VaultRoot = (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent),
    [string]$CanonicalRoot = 'C:\Users\dillo\Documents\Codex\projects\client-operations',
    [string]$RoutineId,
    [string]$ClientId,
    [switch]$Execute,
    [switch]$Fixture,
    [switch]$Resume,
    [int]$MaxRoutines = 0,
    [switch]$Json,
    [switch]$NoEvidence
)

$ErrorActionPreference = 'Stop'
# Node writes UTF-8. Without this, Windows PowerShell decodes the child's stdout in the OEM
# code page and a non-ASCII character in a receipt detail breaks the JSON contract.
try { [Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false) } catch { }

$resolvedVault = (Resolve-Path -LiteralPath $VaultRoot).Path
$dispatcher = Join-Path $resolvedVault '_os\automation\bin\claude-loop.js'
if (-not (Test-Path -LiteralPath $dispatcher)) { Write-Host 'BLOCKED: dispatcher missing (_os/automation/bin/claude-loop.js)'; exit 1 }
$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) { Write-Host 'BLOCKED: node not resolvable'; exit 1 }

$nodeArgs = @($dispatcher, '--vault-root', $resolvedVault, '--canonical-root', $CanonicalRoot)
if ($RoutineId) { $nodeArgs += @('--routine', $RoutineId) }
if ($ClientId) { $nodeArgs += @('--client', $ClientId) }
if ($Execute) { $nodeArgs += '--execute' }
if ($Fixture) { $nodeArgs += '--fixture' }
if ($Resume) { $nodeArgs += '--resume' }
if ($MaxRoutines -gt 0) { $nodeArgs += @('--max-routines', "$MaxRoutines") }
if ($Json) { $nodeArgs += '--json' }
if ($NoEvidence) { $nodeArgs += '--no-evidence' }

$out = @(& $node.Source @nodeArgs)
$code = $LASTEXITCODE
if ($out.Count -gt 0) { Write-Output ($out -join "`n") }
exit $code
