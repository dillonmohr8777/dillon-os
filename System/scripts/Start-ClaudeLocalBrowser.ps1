<#
.SYNOPSIS
    Starts Claude's isolated, loopback-only Chrome evidence browser with no visible window.

.DESCRIPTION
    This is the only supported Claude browser bootstrap. It never exposes CDP over LAN or a
    public tunnel, never reuses Dillon's foreground Chrome profile, and writes only non-secret
    connection metadata. Existing authenticated state stays inside the dedicated profile.
#>
[CmdletBinding()]
param(
    [string]$ChromePath = 'C:\Program Files\Google\Chrome\Application\chrome.exe',
    [string]$ProfileDir = 'C:\Users\dillo\claude-chrome',
    [int]$Port = 9223,
    [switch]$Quiet
)

$ErrorActionPreference = 'Stop'
$statePath = 'C:\Users\dillo\start-box-bridge-state.json'
$utf8 = New-Object System.Text.UTF8Encoding($false)

if (-not (Test-Path -LiteralPath $ChromePath -PathType Leaf)) { throw "Chrome missing: $ChromePath" }
if (-not (Test-Path -LiteralPath $ProfileDir)) { New-Item -ItemType Directory -Path $ProfileDir -Force | Out-Null }

$existing = @(Get-NetTCPConnection -LocalAddress '127.0.0.1' -LocalPort $Port -State Listen -ErrorAction SilentlyContinue)
if ($existing.Count -eq 0) {
    $args = @(
        '--headless=new',
        '--remote-debugging-address=127.0.0.1',
        "--remote-debugging-port=$Port",
        "--user-data-dir=$ProfileDir",
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-background-networking',
        'about:blank'
    )
    $process = Start-Process -FilePath $ChromePath -ArgumentList $args -WindowStyle Hidden -PassThru
    $deadline = (Get-Date).AddSeconds(20)
    do {
        Start-Sleep -Milliseconds 250
        $existing = @(Get-NetTCPConnection -LocalAddress '127.0.0.1' -LocalPort $Port -State Listen -ErrorAction SilentlyContinue)
    } while ($existing.Count -eq 0 -and (Get-Date) -lt $deadline -and -not $process.HasExited)
}

if ($existing.Count -eq 0) { throw "Claude browser did not bind 127.0.0.1:$Port" }

$state = [ordered]@{
    startedAt = (Get-Date).ToString('o')
    debugAddress = '127.0.0.1'
    debugPort = $Port
    profileDir = $ProfileDir
    chromePath = $ChromePath
    browserPolicy = 'claude-dedicated'
    remoteTransport = 'loopback'
    tunnelProvider = $null
    tunnelUrl = $null
    edgeFallback = $false
}
[System.IO.File]::WriteAllText($statePath, ($state | ConvertTo-Json -Depth 4), $utf8)
[Environment]::SetEnvironmentVariable('BOX_CDP_URL', $null, 'User')
[Environment]::SetEnvironmentVariable('CLAUDE_CDP_URL', "http://127.0.0.1:$Port", 'User')

if (-not $Quiet) { Write-Host "Claude browser READY at loopback port $Port (PID owner $($existing[0].OwningProcess))." }

# This bootstrap is also invoked from the daily-driver host. `exit` would terminate
# that caller before it can write its state and receipts, so return control instead.
return
