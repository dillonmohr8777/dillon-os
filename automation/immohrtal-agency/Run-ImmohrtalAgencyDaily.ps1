[CmdletBinding()]
param(
  [string]$InputPath,
  [string]$SuppressionPath,
  [string]$RunId,
  [string]$AsOf,
  [switch]$DryRun,
  [switch]$UseModel
)

$ErrorActionPreference = 'Stop'
$node = (Get-Command node -ErrorAction Stop).Source
$root = $PSScriptRoot
$input = if ($InputPath) { (Resolve-Path -LiteralPath $InputPath).Path } else { Join-Path $root 'fixtures\prospects.json' }
$suppression = if ($SuppressionPath) { (Resolve-Path -LiteralPath $SuppressionPath).Path } else { Join-Path $root 'fixtures\suppressions.json' }
if ($RunId -and $RunId -notmatch '^\d{8}-\d{6}$') { throw 'RunId must use yyyyMMdd-HHmmss.' }
$stamp = if ($RunId) { $RunId } else { Get-Date -Format 'yyyyMMdd-HHmmss' }
$timestamp = if ($AsOf) { $AsOf } else { (Get-Date).ToUniversalTime().ToString('o') }
$output = if ($DryRun) { Join-Path $root '.tmp\dry-run' } else { Join-Path $root 'runs' }
$state = if ($DryRun) { Join-Path $root '.tmp\dry-state' } else { Join-Path $root 'state' }
$mutex = [System.Threading.Mutex]::new($false, 'Global\ImmohrtalAgencyDaily')
$locked = $false

try {
  $locked = $mutex.WaitOne(0)
  if (-not $locked) { throw 'Fail-closed overlap: another IMMOHRTAL daily run owns the mutex.' }
  $arguments = @(
    (Join-Path $root 'src\cli.mjs'),
    '--input', $input,
    '--suppression', $suppression,
    '--run-id', $stamp,
    '--as-of', $timestamp,
    '--output', $output,
    '--state', $state
  )
  if ($UseModel) { $arguments += @('--use-model', 'true') }
  & $node @arguments
  if ($LASTEXITCODE -ne 0) { throw "IMMOHRTAL orchestrator failed with exit code $LASTEXITCODE." }
} catch {
  $blockedDir = Join-Path $output $stamp
  New-Item -ItemType Directory -Force -Path $blockedDir | Out-Null
  $blocked = [ordered]@{
    automation = 'IMMOHRTAL Agency Daily Orchestrator'
    run_id = $stamp
    status = 'blocked'
    reason = $_.Exception.Message
    failed_at = (Get-Date).ToUniversalTime().ToString('o')
    delivery = 'draft_only'
    external_actions = 0
  }
  $temp = Join-Path $blockedDir "blocked-receipt.$PID.tmp"
  $blocked | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $temp -Encoding utf8
  Move-Item -LiteralPath $temp -Destination (Join-Path $blockedDir 'blocked-receipt.json') -Force
  Write-Error $_
  exit 1
} finally {
  if ($locked) { $mutex.ReleaseMutex() }
  $mutex.Dispose()
}
