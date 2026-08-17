[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$VendorRoot = 'C:\Users\dillo\.codex\vendor_imports\TencentDB-Agent-Memory-v1.0.1'
$CredentialHelper = Join-Path $PSScriptRoot 'credential.py'
$RuntimePython = 'C:\Users\dillo\AppData\Local\Codex\AgentMemory\venv\Scripts\python.exe'
$Python = if (Test-Path -LiteralPath $RuntimePython) { $RuntimePython } else { (Get-Command python -ErrorAction Stop).Source }
$IsolationCanary = Join-Path $PSScriptRoot 'isolation_canary.py'
$issues = [System.Collections.Generic.List[string]]::new()

if (-not (Test-Path -LiteralPath $VendorRoot)) { $issues.Add('Pinned vendor source is missing.') }
if (-not (Test-Path -LiteralPath $CredentialHelper)) { $issues.Add('Credential helper is missing.') }
if (-not (Test-Path -LiteralPath $IsolationCanary)) { $issues.Add('Isolation canary is missing.') }

$credentialExists = $false
if (Test-Path -LiteralPath $CredentialHelper) {
    & $Python $CredentialHelper exists | Out-Null
    $credentialExists = $LASTEXITCODE -eq 0
    if (-not $credentialExists) { $issues.Add('Gateway credential is missing from Windows Credential Manager.') }
}

$ollamaOk = $false
try {
    $tags = Invoke-RestMethod -Uri 'http://127.0.0.1:11434/api/tags' -TimeoutSec 5
    $names = @($tags.models | ForEach-Object name)
    $ollamaOk = ('qwen3.5:9b' -in $names) -and ('nomic-embed-text-v2-moe:latest' -in $names)
    if (-not $ollamaOk) { $issues.Add('Required Ollama generation or embedding model is missing.') }
} catch { $issues.Add('Ollama is unavailable.') }

$health = $null
try { $health = Invoke-RestMethod -Uri 'http://127.0.0.1:8420/health' -TimeoutSec 5 }
catch { $issues.Add('Gateway health endpoint is unavailable.') }

$authOk = $false
if ($credentialExists -and $health) {
    try {
        Invoke-RestMethod -Method Post -Uri 'http://127.0.0.1:8420/v2/core/read' `
            -Headers @{ Authorization = 'Bearer invalid'; 'x-tdai-service-id' = 'dillon-test' } `
            -ContentType 'application/json' -Body '{}' -TimeoutSec 5 | Out-Null
        $issues.Add('Gateway accepted an invalid Bearer token.')
    } catch {
        $authOk = $_.Exception.Response.StatusCode.value__ -eq 401
        if (-not $authOk) { $issues.Add('Gateway authentication check did not return HTTP 401.') }
    }
}

$audit = $null
if (Test-Path -LiteralPath $VendorRoot) {
    Push-Location $VendorRoot
    try {
        $auditRaw = npm audit --omit=dev --json 2>$null
        $audit = $auditRaw | ConvertFrom-Json
        if ($audit.metadata.vulnerabilities.high -gt 0 -or $audit.metadata.vulnerabilities.critical -gt 0) {
            $issues.Add('Vendor runtime has high or critical npm audit findings.')
        }
    } finally { Pop-Location }
}

$isolation = $null
if ($credentialExists -and $health -and (Test-Path -LiteralPath $IsolationCanary)) {
    try {
        $isolationRaw = & $Python $IsolationCanary
        $isolation = $isolationRaw | ConvertFrom-Json
        if (-not $isolation.passed) { $issues.Add('Cross-space isolation canary failed.') }
    } catch { $issues.Add('Cross-space isolation canary could not run.') }
}

[pscustomobject]@{
    passed = $issues.Count -eq 0
    gatewayStatus = $health.status
    gatewayVersion = $health.version
    vectorStore = $health.stores.vectorStore
    embeddingService = $health.stores.embeddingService
    ollamaModels = $ollamaOk
    credential = $credentialExists
    authentication = $authOk
    isolation = $isolation
    npmHigh = if ($audit) { $audit.metadata.vulnerabilities.high } else { $null }
    npmCritical = if ($audit) { $audit.metadata.vulnerabilities.critical } else { $null }
    issues = @($issues)
}

if ($issues.Count -gt 0) { exit 1 }
