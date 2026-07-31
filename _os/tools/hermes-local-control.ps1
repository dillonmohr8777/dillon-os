# hermes-local-control.ps1 — start Chrome with CDP on Windows HP 64GB
# Run in PowerShell on the 64GB machine. Cloud agents cannot reach localhost:9222.
# Usage:
#   irm ...  OR
#   powershell -ExecutionPolicy Bypass -File _os\tools\hermes-local-control.ps1

$ErrorActionPreference = 'Stop'

$CdpPort = if ($env:HERMES_CDP_PORT) { $env:HERMES_CDP_PORT } else { '9222' }
$CdpUrl = "http://127.0.0.1:$CdpPort"
$ProfileDir = if ($env:HERMES_CHROME_PROFILE) {
  $env:HERMES_CHROME_PROFILE
} else {
  Join-Path $HOME '.hermes\chrome-debug'
}

New-Item -ItemType Directory -Force -Path $ProfileDir | Out-Null

function Test-Cdp {
  try {
    Invoke-RestMethod -Uri "$CdpUrl/json/version" -TimeoutSec 2 | Out-Null
    return $true
  } catch {
    return $false
  }
}

function Find-Chromium {
  $candidates = @(
    "${env:ProgramFiles}\Google\Chrome\Application\chrome.exe",
    "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
    "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe",
    "${env:ProgramFiles}\BraveSoftware\Brave-Browser\Application\brave.exe",
    "${env:ProgramFiles(x86)}\BraveSoftware\Brave-Browser\Application\brave.exe",
    "${env:ProgramFiles}\Microsoft\Edge\Application\msedge.exe",
    "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"
  )
  foreach ($path in $candidates) {
    if (Test-Path $path) { return $path }
  }
  return $null
}

if (Test-Cdp) {
  Write-Host "==> CDP already listening on $CdpUrl" -ForegroundColor Green
} else {
  $bin = Find-Chromium
  if (-not $bin) {
    Write-Host 'ERROR: Chrome / Brave / Edge not found. Install Chrome, then rerun.' -ForegroundColor Red
    exit 1
  }
  Write-Host "==> Launching: $bin"
  Write-Host "    CDP: $CdpUrl"
  Write-Host "    profile: $ProfileDir"
  Start-Process -FilePath $bin -ArgumentList @(
    "--remote-debugging-port=$CdpPort",
    '--remote-debugging-address=127.0.0.1',
    "--user-data-dir=$ProfileDir",
    '--no-first-run',
    '--no-default-browser-check',
    'about:blank'
  )
  $ready = $false
  foreach ($i in 1..20) {
    Start-Sleep -Milliseconds 500
    if (Test-Cdp) {
      Write-Host '==> CDP ready' -ForegroundColor Green
      $ready = $true
      break
    }
  }
  if (-not $ready) {
    Write-Host "ERROR: CDP did not come up on $CdpUrl" -ForegroundColor Red
    Write-Host 'Tip: quit Chrome windows using the hermes chrome-debug profile, then rerun.' -ForegroundColor Yellow
    exit 1
  }
}

Write-Host ''
Write-Host 'Browser version:'
try {
  Invoke-RestMethod -Uri "$CdpUrl/json/version" | ConvertTo-Json -Compress
} catch {
  Write-Host $_.Exception.Message
}

Write-Host ''
Write-Host '=============================================='
Write-Host '  hermes-local-control (Windows 64GB)'
Write-Host '=============================================='
Write-Host '1. Open Hermes in a terminal (not Web UI / Telegram):'
Write-Host '     hermes chat'
Write-Host ''
Write-Host '2. Attach to this Chrome (TV / monitor visible):'
Write-Host '     /browser connect'
Write-Host '     /browser status'
Write-Host ''
Write-Host '3. Start a NEW session and paste your task.'
Write-Host ''
Write-Host '4. When done:'
Write-Host '     /browser disconnect'
Write-Host '   (do not close the browser window)'
Write-Host '=============================================='
Write-Host ''
Write-Host 'Verify later:'
Write-Host "  Invoke-RestMethod $CdpUrl/json/version"
