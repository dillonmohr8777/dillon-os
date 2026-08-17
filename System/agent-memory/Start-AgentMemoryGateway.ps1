[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$VendorRoot = 'C:\Users\dillo\.codex\vendor_imports\TencentDB-Agent-Memory-v1.0.1'
$RuntimeRoot = 'C:\Users\dillo\AppData\Local\Codex\AgentMemory'
$ConfigPath = Join-Path $PSScriptRoot 'tdai-gateway.yaml'
$CredentialHelper = Join-Path $PSScriptRoot 'credential.py'
$Python = (Get-Command python -ErrorAction Stop).Source
$Node = (Get-Command node -ErrorAction Stop).Source
$HealthUri = 'http://127.0.0.1:8420/health'

try {
    $existing = Invoke-RestMethod -Uri $HealthUri -TimeoutSec 2
    if ($existing.status -in @('ok', 'degraded')) {
        [pscustomobject]@{ status = $existing.status; started = $false; endpoint = $HealthUri }
        return
    }
} catch {}

if (-not (Test-Path -LiteralPath $VendorRoot)) { throw "Pinned vendor source missing: $VendorRoot" }
if (-not (Test-Path -LiteralPath $ConfigPath)) { throw "Gateway config missing: $ConfigPath" }

New-Item -ItemType Directory -Path $RuntimeRoot -Force | Out-Null
$credentialStatus = & $Python $CredentialHelper ensure
if ($LASTEXITCODE -ne 0) { throw 'Unable to initialize the Agent Memory gateway credential.' }
$gatewayKey = & $Python $CredentialHelper get
if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($gatewayKey)) {
    throw 'Unable to retrieve the Agent Memory gateway credential.'
}

$env:TDAI_GATEWAY_API_KEY = $gatewayKey
$env:TDAI_GATEWAY_CONFIG = $ConfigPath
$env:NO_PROXY = '127.0.0.1,localhost'
$stdout = Join-Path $RuntimeRoot 'gateway.stdout.log'
$stderr = Join-Path $RuntimeRoot 'gateway.stderr.log'

try {
    $process = Start-Process -FilePath $Node `
        -ArgumentList @('--import', 'tsx/esm', 'src/gateway/server.ts') `
        -WorkingDirectory $VendorRoot `
        -WindowStyle Hidden `
        -RedirectStandardOutput $stdout `
        -RedirectStandardError $stderr `
        -PassThru
} finally {
    Remove-Item Env:TDAI_GATEWAY_API_KEY -ErrorAction SilentlyContinue
}

[System.IO.File]::WriteAllText((Join-Path $RuntimeRoot 'gateway.pid'), [string]$process.Id)

$deadline = [DateTime]::UtcNow.AddSeconds(45)
do {
    Start-Sleep -Milliseconds 500
    if ($process.HasExited) {
        throw "Agent Memory gateway exited during startup with code $($process.ExitCode)."
    }
    try {
        $health = Invoke-RestMethod -Uri $HealthUri -TimeoutSec 2
        if ($health.status -in @('ok', 'degraded')) {
            [pscustomobject]@{
                status = $health.status
                started = $true
                pid = $process.Id
                credential = $credentialStatus
                endpoint = $HealthUri
            }
            return
        }
    } catch {}
} while ([DateTime]::UtcNow -lt $deadline)

throw 'Agent Memory gateway did not become healthy within 45 seconds.'

