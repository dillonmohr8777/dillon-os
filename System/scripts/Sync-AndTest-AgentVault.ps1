<#
.SYNOPSIS
Regenerate the shared agent-vault projection, then validate it. In that order.

.DESCRIPTION
Routine W09 ("Audit automation reliability") had 10 failures in 7 days -- the worst
reliability in the estate at 0.29 -- because its build command ran only
Test-AgentVault.ps1. That validator hashes every file listed in the projection's
sources/manifest.json and throws "Stale vault source" the moment a source differs
from the recorded sha256.

The projection is a GENERATED read layer over client-operations. Its sources change
on their own cadence: on 2026-08-19 state/ai-stack.json was rewritten at 01:45 UTC,
hours after the last sync, so the recorded hash 54635563... no longer matched the
actual 8db065aa... W09 then failed, and would keep failing until a human ran the sync
by hand. Validating a generated artifact without regenerating it first is not a
reliability audit; it is a staleness detector wired to a routine that cannot act on it.

The machine context map already documents the correct order: run Sync-AgentVault.ps1
and THEN Test-AgentVault.ps1. This wrapper is that documented procedure, so the loop
performs both steps instead of half of one.

Exit codes are chosen for the loop's allowlist:
  0  synced and validated
  2  blocked -- an honest degraded state (projection or scripts unavailable). Not a
     failure, so it does not trip the G8 circuit breaker.
  1  the validator genuinely failed after a successful sync. That is a real defect in
     the projection and SHOULD be loud.
#>
[CmdletBinding()]
param(
    [string]$VaultRoot = 'C:\Users\dillo\Documents\Codex\projects\agent-vault',
    [switch]$Json
)

$ErrorActionPreference = 'Stop'
$steps = [System.Collections.Generic.List[object]]::new()

function Add-Step {
    param([string]$Name, [string]$State, [string]$Detail, $Exit = $null)
    $steps.Add([ordered]@{ step = $Name; state = $State; detail = $Detail; exit = $Exit })
}

function Write-Result {
    param([string]$Status, [int]$Code)
    $doc = [ordered]@{
        script    = 'Sync-AndTest-AgentVault'
        status    = $Status
        vault     = $VaultRoot
        checked   = (Get-Date).ToUniversalTime().ToString('o')
        steps     = $steps
    }
    if ($Json) { $doc | ConvertTo-Json -Depth 6 }
    else {
        Write-Host ("agent-vault: {0}" -f $Status.ToUpperInvariant())
        foreach ($s in $steps) { Write-Host ("  [{0,-7}] {1,-14} {2}" -f $s.state, $s.step, $s.detail) }
    }
    exit $Code
}

$sync = Join-Path $VaultRoot 'scripts\Sync-AgentVault.ps1'
$test = Join-Path $VaultRoot 'scripts\Test-AgentVault.ps1'

foreach ($p in @($sync, $test)) {
    if (-not (Test-Path -LiteralPath $p -PathType Leaf)) {
        Add-Step 'preflight' 'blocked' "missing $p"
        Write-Result 'blocked' 2
    }
}
Add-Step 'preflight' 'ok' 'sync and test scripts present'

$ps = (Get-Command powershell.exe).Source

# 1. Regenerate. A stale projection is the expected steady state, not an error.
$syncOut = & $ps -NoLogo -NoProfile -NonInteractive -ExecutionPolicy Bypass -File $sync 2>&1
$syncCode = $LASTEXITCODE
if ($syncCode -ne 0) {
    Add-Step 'sync' 'blocked' (($syncOut | Out-String).Trim() -replace '\s+', ' ') $syncCode
    Write-Result 'blocked' 2
}
$rev = ($syncOut | Select-String -Pattern 'QueueRevision\s*:\s*(\d+)' | Select-Object -First 1)
$revText = if ($rev) { "queue revision $($rev.Matches[0].Groups[1].Value)" } else { 'synced' }
Add-Step 'sync' 'ok' $revText $syncCode

# 2. Validate the freshly generated projection.
$testOut = & $ps -NoLogo -NoProfile -NonInteractive -ExecutionPolicy Bypass -File $test 2>&1
$testCode = $LASTEXITCODE
$flat = (($testOut | Out-String).Trim() -replace '\s+', ' ')
if ($testCode -ne 0) {
    # Sync succeeded and validation still failed: a real defect worth being loud about.
    Add-Step 'validate' 'failed' $flat $testCode
    Write-Result 'failed' 1
}
Add-Step 'validate' 'ok' $flat $testCode
Write-Result 'ok' 0
