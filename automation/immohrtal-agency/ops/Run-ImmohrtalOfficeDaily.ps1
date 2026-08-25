[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [switch]$DryRun,

    [ValidateSet('standup', 'eod', 'both')]
    [string]$Mode = 'both',

    [string]$AsOf,

    [string]$RunId,

    [string]$OutputRoot,

    [string]$AgencyReceiptPath,

    [switch]$NoAgencyReceipt
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

if (-not $DryRun) {
    throw 'This entrypoint is local dry-run only. Pass -DryRun explicitly.'
}

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = (Resolve-Path -LiteralPath (Join-Path $scriptRoot '..\..\..')).Path
$nodeScript = Join-Path $scriptRoot 'run-office-report.mjs'

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    throw 'Node.js is required but was not found on PATH.'
}

$nodeArguments = @(
    $nodeScript,
    '--dry-run',
    '--mode', $Mode,
    '--repo-root', $repoRoot
)

if ($AsOf) {
    $nodeArguments += @('--as-of', $AsOf)
}
if ($RunId) {
    $nodeArguments += @('--run-id', $RunId)
}
if ($OutputRoot) {
    $nodeArguments += @('--output-root', $OutputRoot)
}
if ($AgencyReceiptPath) {
    $nodeArguments += @('--agency-receipt', $AgencyReceiptPath)
}
if ($NoAgencyReceipt) {
    $nodeArguments += '--no-agency-receipt'
}

& node @nodeArguments
if ($LASTEXITCODE -ne 0) {
    throw "IMMOHRTAL office report runner exited with code $LASTEXITCODE."
}
