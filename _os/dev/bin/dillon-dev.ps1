[CmdletBinding()]
param(
    [ValidateSet('doctor', 'verify', 'help')]
    [string]$Command = 'help',
    [string]$Profile
)

$ErrorActionPreference = 'Stop'
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..\..')).Path
if (-not $Profile) {
    $Profile = Join-Path $repoRoot '_os\dev\profiles\site-factory-sandbox.json'
}

& node (Join-Path $PSScriptRoot 'dillon-dev.js') $Command --profile $Profile
exit $LASTEXITCODE
