[CmdletBinding()]
param(
    [string]$Profile,
    [string]$Out,
    [switch]$Ingest,
    [switch]$DryRun,
    [string]$SecretPath = 'C:\Users\dillo\AppData\Local\Codex\Secrets\xai-dillon-os-daily-x-search.dpapi'
)

$ErrorActionPreference = 'Stop'
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..\..')).Path
if (-not $Profile) {
    $Profile = Join-Path $repoRoot '_os\automation\profiles\daily-x-research.json'
}
if (-not (Test-Path -LiteralPath $SecretPath) -and -not $DryRun) {
    throw "Protected xAI key is missing. Expected the Access Broker locator dpapi-bootstrap://xai/dillon-os/daily-x-search."
}

$arguments = @(
    (Join-Path $PSScriptRoot 'xai-research.js'),
    '--profile',
    $Profile
)
if ($Out) { $arguments += @('--out', $Out) }
if ($Ingest) { $arguments += '--ingest' }
if ($DryRun) { $arguments += '--dry-run' }

try {
    if (-not $DryRun) {
        $protected = Get-Content -Raw -LiteralPath $SecretPath
        $secure = ConvertTo-SecureString $protected
        $credential = [System.Net.NetworkCredential]::new('', $secure)
        $env:XAI_API_KEY = $credential.Password
    }
    & node @arguments
    $exitCode = $LASTEXITCODE
} finally {
    Remove-Item Env:\XAI_API_KEY -ErrorAction SilentlyContinue
    $credential = $null
    $secure = $null
    $protected = $null
}
exit $exitCode
