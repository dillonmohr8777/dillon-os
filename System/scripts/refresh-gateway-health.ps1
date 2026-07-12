# refresh-gateway-health.ps1
# Local-only Hermes gateway probe. Appends snapshot to System/gateway-health.md.
# No broadcasts. No token rotation. No external API calls except reading local files/processes.

param(
    [string]$HermesHome = "$env:LOCALAPPDATA\hermes",
    [string]$VaultRoot = (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent),
    [int]$ConflictThresholdPerHour = 10
)

$ErrorActionPreference = 'Stop'
$statePath = Join-Path $HermesHome 'gateway_state.json'
$logPath = Join-Path $HermesHome 'logs\gateway.log'
$outPath = Join-Path $VaultRoot 'System\gateway-health.md'

if (-not (Test-Path $statePath)) {
    Write-Error "Missing gateway_state.json at $statePath"
}

$state = Get-Content $statePath -Raw | ConvertFrom-Json
$nowUtc = [datetime]::UtcNow
$updatedAt = [datetime]$state.updated_at
$hbAgeSec = [math]::Round(($nowUtc - $updatedAt).TotalSeconds, 0)
$gatewayPid = [int]$state.pid
$proc = Get-Process -Id $gatewayPid -ErrorAction SilentlyContinue
$alive = [bool]$proc

$logInfo = if (Test-Path $logPath) { Get-Item $logPath } else { $null }
$conflictPattern = 'polling conflict|terminated by other'
$allConflicts = @()
if ($logInfo) {
    $allConflicts = Select-String -Path $logPath -Pattern $conflictPattern
}

# Count conflicts in rolling windows using log line timestamps (local format in gateway.log)
function Get-ConflictCountSince($hours) {
    $cutoff = (Get-Date).AddHours(-$hours)
    ($allConflicts | Where-Object {
        if ($_.Line -match '^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})') {
            [datetime]::ParseExact($matches[1], 'yyyy-MM-dd HH:mm:ss', $null) -ge $cutoff
        } else { $false }
    }).Count
}

$c1h = Get-ConflictCountSince 1
$c6h = Get-ConflictCountSince 6
$c24h = Get-ConflictCountSince 24
$total = $allConflicts.Count

$severity = if ($c1h -gt $ConflictThresholdPerHour) { 'CRITICAL' }
            elseif ($hbAgeSec -gt 120) { 'WARN' }
            else { 'OK' }

$stamp = $nowUtc.ToString('yyyy-MM-ddTHH:mm:ssZ')
$localStamp = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss')

$entry = @"

## $stamp - $severity Gateway Probe (script)
- **timestamp:** $stamp ($localStamp local) - local-only script
- **gateway_pid:** $gatewayPid - $(if ($alive) { 'ALIVE' } else { 'NOT RUNNING' }) $(if ($proc) { "WS $([math]::Round($proc.WorkingSet64/1MB,1))MB" })
- **state file:** ``$statePath``
  - ``gateway_state``: $($state.gateway_state) / active_agents $($state.active_agents)
  - ``updated_at``: $($state.updated_at) - age ${hbAgeSec}s $(if ($hbAgeSec -gt 120) { 'STALE' } else { 'healthy' })
  - ``telegram.state``: $($state.platforms.telegram.state)
- **log:** ``$logPath`` $(if ($logInfo) { "$($logInfo.Length) bytes mtime $($logInfo.LastWriteTime)" } else { 'MISSING' })
- **conflict counts:** 1h=$c1h 6h=$c6h 24h=$c24h total=$total
- **recommended action:** $(if ($c1h -gt $ConflictThresholdPerHour) { 'External poller likely - see approval-queue; do NOT auto-rotate token' } elseif ($hbAgeSec -gt 1800 -and $alive) { 'PID alive but heartbeat stale >30m - consider soft restart via Startup VBS after approval' } else { 'Continue monitoring' })

"@

# Prepend after frontmatter closing ---
$content = Get-Content $outPath -Raw
if ($content -match '(?s)^---\r?\n.*?\r?\n---\r?\n') {
    $fm = $Matches[0]
    $body = $content.Substring($fm.Length).TrimStart()
    if ($body -match '(?s)^# Gateway Health\r?\n>[^\r\n]*\r?\n') {
        $body = $body.Substring($Matches[0].Length).TrimStart()
    }
    # Update frontmatter fields
    $newFm = $fm -replace 'last_updated:.*', "last_updated: $stamp"
    $newFm = $newFm -replace 'gateway_pid:.*', "gateway_pid: $gatewayPid"
    $newFm = $newFm -replace 'heartbeat_age_sec:.*', "heartbeat_age_sec: $hbAgeSec"
    $newFm = $newFm -replace 'conflicts_1h:.*', "conflicts_1h: $c1h"
    $newFm = $newFm -replace 'conflicts_6h:.*', "conflicts_6h: $c6h"
    $newFm = $newFm -replace 'conflicts_24h:.*', "conflicts_24h: $c24h"
    $newContent = $newFm + "`n# Gateway Health`n> Local-only health report. No broadcasts. Latest at top.`n" + $entry + $body
} else {
    $newContent = "# Gateway Health`n" + $entry + $content
}

# Trim old entries if file grows past ~200 lines (keep header + last 8 probes)
$lines = $newContent -split "`r?`n"
if ($lines.Count -gt 200) {
    $headerEnd = 0
    for ($i = 0; $i -lt $lines.Count; $i++) {
        if ($lines[$i] -match '^## \d{4}-\d{2}-\d{2}T') { $headerEnd = $i; break }
    }
    $probeStarts = @()
    for ($i = 0; $i -lt $lines.Count; $i++) {
        if ($lines[$i] -match '^## \d{4}-\d{2}-\d{2}T') { $probeStarts += $i }
    }
    if ($probeStarts.Count -gt 9) {
        $cutAt = $probeStarts[9]
        $newContent = ($lines[0..($cutAt - 1)] -join "`n") + "`n`n## Archived`nOlder probes trimmed by refresh-gateway-health.ps1`n"
    }
}

Set-Content -Path $outPath -Value $newContent -Encoding utf8
Write-Output "OK gateway-health updated severity=$severity pid=$gatewayPid hb=${hbAgeSec}s c1h=$c1h"
