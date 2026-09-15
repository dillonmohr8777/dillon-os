<#
.SYNOPSIS
    Bounded local dispatcher for the seven Immohrtal agents.

.DESCRIPTION
    Ranks one board, probes each lane, and writes receipts. Designed to run from
    Windows Task Scheduler and from the Cursor private-worker wake timer.

    Never sends, posts, publishes, deploys, spends, merges, force-pushes,
    exposes a port, reads a credential, writes client-operations/queue/work-items.json,
    or re-enables the disabled IMMOHRTAL Agency Daily task. mail_ready is always hold.
    This script does not git commit or push; the Cursor worker commits feature-branch
    receipts after a wake.

.EXAMPLE
    & .\System\scripts\Invoke-ImmohrtalCrew.ps1 -Json
    & .\System\scripts\Invoke-ImmohrtalCrew.ps1 -Force -Json
    & .\System\scripts\Invoke-ImmohrtalCrew.ps1 -DryRun -Force -Json -StateDir $env:TEMP\immohrtal-crew-dry
#>
[CmdletBinding()]
param(
    [string]$VaultRoot = $(if ($PSScriptRoot) { Split-Path (Split-Path $PSScriptRoot -Parent) -Parent } else { 'C:\Users\dillo\repos\dillon-os' }),
    [string]$AgencyRoot = 'C:\Users\dillo\Documents\Codex\worktrees\immohrtal-marketing-solutions-20260824\automation\immohrtal-agency',
    [string]$StateDir,
    [int]$MinIntervalMinutes = 90,
    [int]$BreakerThreshold = 3,
    [int]$BreakerCooldownMinutes = 120,
    [switch]$DryRun,
    [switch]$Force,
    [switch]$Json,
    [switch]$NoEvidence
)

$ErrorActionPreference = 'Stop'
try { [Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false) } catch { }
$resolvedVault = (Resolve-Path -LiteralPath $VaultRoot).Path
$utf8 = New-Object System.Text.UTF8Encoding($false)
$today = Get-Date -Format 'yyyy-MM-dd'
$now = Get-Date
$nowUtc = $now.ToUniversalTime().ToString('o')
$cycleId = 'CREW-' + $now.ToString('yyyyMMdd-HHmmssfff')

if ([string]::IsNullOrWhiteSpace($StateDir)) {
    $StateDir = Join-Path $resolvedVault '12_Brain\state\immohrtal-crew'
}
$queueDir = Join-Path $resolvedVault '12_Brain\queue'
$proposalDir = Join-Path $resolvedVault '00_Inbox\Agent-Proposals\Cursor'
$latestPath = Join-Path $StateDir 'latest.json'
$receiptLog = if ($DryRun) {
    Join-Path $StateDir ('immohrtal-crew-' + $today + '.jsonl')
} else {
    Join-Path $queueDir ('immohrtal-crew-' + $today + '.jsonl')
}
$planDir = if ($DryRun) { $StateDir } else { Join-Path $resolvedVault 'Daily-Briefs' }
$proposalOutDir = if ($DryRun) { $StateDir } else { $proposalDir }
$node = Join-Path $env:ProgramFiles 'nodejs\node.exe'
if (-not (Test-Path -LiteralPath $node)) {
    $nodeCmd = Get-Command node -ErrorAction SilentlyContinue
    if ($nodeCmd) { $node = $nodeCmd.Source } else { $node = $null }
}

function Write-Utf8 {
    param([string]$Path, [string]$Text)
    $dir = Split-Path -Parent $Path
    if (-not (Test-Path -LiteralPath $dir)) {
        New-Item -ItemType Directory -Force -Path $dir | Out-Null
    }
    $temp = "$Path.$PID.tmp"
    [System.IO.File]::WriteAllText($temp, $Text, $utf8)
    Move-Item -LiteralPath $temp -Destination $Path -Force
}

function Read-JsonFile {
    param([string]$Path)
    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) { return $null }
    try { return (Get-Content -LiteralPath $Path -Raw -Encoding UTF8 | ConvertFrom-Json) } catch { return $null }
}

function New-Lane {
    param(
        [string]$Id,
        [string]$Agent,
        [string]$Status,
        [string]$Summary,
        [object[]]$Evidence = @(),
        [object]$Detail = $null
    )
    return [pscustomobject]@{
        id = $Id
        agent = $Agent
        status = $Status
        summary = $Summary
        evidence = @($Evidence)
        detail = $Detail
    }
}

function Get-HttpStatus {
    param([string]$Url)
    if ($DryRun) { return [pscustomobject]@{ url = $Url; status = $null; skipped = $true } }
    $curl = Get-Command curl.exe -ErrorAction SilentlyContinue
    if (-not $curl) { return [pscustomobject]@{ url = $Url; status = $null; error = 'curl.exe missing' } }
    $out = Join-Path $env:TEMP ("immohrtal-crew-http-" + [guid]::NewGuid().ToString('N') + '.bin')
    try {
        $code = & curl.exe -sS -L --max-time 20 -o $out -w '%{http_code}' $Url 2>$null
        return [pscustomobject]@{ url = $Url; status = [string]$code; skipped = $false }
    } catch {
        return [pscustomobject]@{ url = $Url; status = $null; error = $_.Exception.Message }
    } finally {
        if (Test-Path -LiteralPath $out) { Remove-Item -LiteralPath $out -Force -ErrorAction SilentlyContinue }
    }
}

function Test-LandingPage {
    param([string]$RelPath, [string]$Client)
    $full = Join-Path $resolvedVault $RelPath
    $checks = New-Object System.Collections.Generic.List[object]
    $ok = $true
    if (-not (Test-Path -LiteralPath $full -PathType Leaf)) {
        $checks.Add([pscustomobject]@{ check = 'exists'; ok = $false; detail = 'missing' })
        return [pscustomobject]@{ client = $Client; path = $RelPath; ok = $false; publish = 'fail'; checks = $checks.ToArray() }
    }
    $html = Get-Content -LiteralPath $full -Raw -Encoding UTF8
    $hasH1 = $html -match '(?is)<h1\b'
    $cta = [regex]::Matches($html, '(?is)<a\b[^>]*href="([^"]+)"')
    $imgs = [regex]::Matches($html, '(?is)<img\b')
    $checks.Add([pscustomobject]@{ check = 'exists'; ok = $true })
    $checks.Add([pscustomobject]@{ check = 'h1'; ok = $hasH1 })
    $checks.Add([pscustomobject]@{ check = 'cta'; ok = ($cta.Count -gt 0); count = $cta.Count })
    if (-not $hasH1 -or $cta.Count -eq 0) { $ok = $false }
    $publish = 'hold'
    $defects = New-Object System.Collections.Generic.List[string]
    if ($Client -eq 'Omega' -and $imgs.Count -eq 0) {
        $ok = $false
        $publish = 'fail'
        $defects.Add('no photos')
    }
    if ($Client -eq 'KJB') {
        $homepageOnly = 0
        foreach ($m in $cta) {
            $href = [string]$m.Groups[1].Value
            if ($href -match '^https?://(www\.)?kimberlyjamesbridal\.com/?$') { $homepageOnly++ }
        }
        if ($homepageOnly -gt 0) {
            $ok = $false
            $publish = 'fail'
            $defects.Add('CTA points at homepage')
        }
    }
    $checks.Add([pscustomobject]@{ check = 'img'; count = $imgs.Count })
    return [pscustomobject]@{
        client = $Client
        path = $RelPath
        ok = $ok
        publish = $publish
        defects = $defects.ToArray()
        checks = $checks.ToArray()
    }
}

New-Item -ItemType Directory -Force -Path $StateDir, $queueDir, $proposalDir | Out-Null

$lanes = New-Object System.Collections.Generic.List[object]
$outcome = 'worked'
$skipReason = $null

# ------------------------------------------------------------------- lease
$mutex = $null
$lease = $false
$mutexName = 'Local\immohrtal-crew'
if ($DryRun) { $mutexName = 'Local\immohrtal-crew-dry' }
try {
    $mutex = New-Object System.Threading.Mutex($false, $mutexName)
    $lease = $mutex.WaitOne(0)
} catch { $lease = $false }

if (-not $lease) {
    $result = [ordered]@{
        schema = 1
        cycle_id = $cycleId
        started_at_utc = $nowUtc
        finished_at_utc = (Get-Date).ToUniversalTime().ToString('o')
        outcome = 'skipped_lease'
        mail_ready = 'hold'
        canonical_write_attempted = $false
        external_action_attempted = $false
        dry_run = [bool]$DryRun
        detail = 'another Immohrtal crew cycle holds the lease'
    }
    if ($Json) { $result | ConvertTo-Json -Depth 6 }
    else { Write-Host 'immohrtal-crew: another instance holds the lease; exiting cleanly' }
    exit 0
}

try {
    $previous = Read-JsonFile -Path $latestPath

    if (-not $Force -and $previous -and $previous.outcome -eq 'worked' -and $previous.finished_at_utc) {
        try {
            $prevFinished = [datetime]$previous.finished_at_utc
            $ageMin = ($now.ToUniversalTime() - $prevFinished.ToUniversalTime()).TotalMinutes
            if ($ageMin -ge 0 -and $ageMin -lt $MinIntervalMinutes) {
                $outcome = 'skipped_dedupe'
                $skipReason = "last cycle $($previous.cycle_id) finished $([int]$ageMin)m ago"
            }
        } catch { }
    }

    $failCount = 0
    if ($previous -and $previous.consecutive_failures) { $failCount = [int]$previous.consecutive_failures }
    if (-not $Force -and $failCount -ge $BreakerThreshold -and $previous.breaker_opened_utc) {
        try {
            $opened = [datetime]$previous.breaker_opened_utc
            $coolMin = ($now.ToUniversalTime() - $opened.ToUniversalTime()).TotalMinutes
            if ($coolMin -lt $BreakerCooldownMinutes) {
                $outcome = 'blocked'
                $skipReason = "circuit breaker open ($failCount failures); cooldown $BreakerCooldownMinutes m"
            }
        } catch { }
    }

    if ($outcome -eq 'worked') {
        # reliability-scout
        $taskNames = @(
            'Claude-Autonomous-Daily-Driver',
            'Prospect Radar - Next 20 Daily Builder',
            'IMMOHRTAL Agency Daily',
            'Immohrtal-Crew'
        )
        $taskRows = New-Object System.Collections.Generic.List[object]
        $taskQueryOk = $true
        foreach ($name in $taskNames) {
            try {
                $task = Get-ScheduledTask -TaskName $name -ErrorAction Stop
                $expectedDisabled = ($name -eq 'IMMOHRTAL Agency Daily')
                $healthy = if ($expectedDisabled) { $task.State -eq 'Disabled' } else { $task.State -eq 'Ready' -or $task.State -eq 'Running' }
                $taskRows.Add([pscustomobject]@{
                    name = $name
                    state = [string]$task.State
                    expected = $(if ($expectedDisabled) { 'Disabled' } else { 'Ready' })
                    healthy = [bool]$healthy
                })
            } catch {
                $taskQueryOk = $false
                $taskRows.Add([pscustomobject]@{
                    name = $name
                    state = 'unqueried'
                    healthy = $false
                    detail = $_.Exception.Message
                })
            }
        }
        $driver = Read-JsonFile -Path (Join-Path $resolvedVault '12_Brain\state\claude-daily-driver.json')
        $loopLog = Join-Path $queueDir ('claude-loop-' + $today + '.jsonl')
        $loopFailed = 0
        if (Test-Path -LiteralPath $loopLog) {
            $loopFailed = @(Select-String -LiteralPath $loopLog -Pattern '"failed"|"verification_failed"' -SimpleMatch:$false).Count
        }
        $agencyLease = $null
        $agencyExpired = $null
        $agencyRuntime = Join-Path $AgencyRoot '.runtime\crew-runtime.json'
        if (Test-Path -LiteralPath $agencyRuntime) {
            $rt = Read-JsonFile -Path $agencyRuntime
            if ($rt) {
                $agencyExpired = $true
                try { $agencyExpired = ([datetime]$rt.lease_expires_at) -lt $now.ToUniversalTime() } catch { }
                $agencyLease = [pscustomobject]@{
                    runtime_id = $rt.runtime_id
                    expires_at = $rt.lease_expires_at
                    expired = $agencyExpired
                    external_actions_allowed = [bool]$rt.external_actions_allowed
                }
            }
        }
        $relHealthy = @($taskRows | Where-Object { $_.healthy }).Count
        $relStatus = if ($taskQueryOk -and $relHealthy -ge 2) { 'ok' } else { 'degraded' }
        $lanes.Add((New-Lane -Id 'reliability' -Agent 'reliability-scout' -Status $relStatus `
            -Summary "tasks healthy=$relHealthy/$($taskRows.Count); daily-driver=$($driver.outcome); loop-fail-lines=$loopFailed; agency-lease-expired=$agencyExpired" `
            -Evidence @('12_Brain/state/claude-daily-driver.json', 'hidden-scheduled-tasks.tsv') `
            -Detail @{ tasks = $taskRows.ToArray(); driver_outcome = $driver.outcome; loop_fail_lines = $loopFailed; agency_lease = $agencyLease }))

        # paid-media-analyst
        $connectorPath = Join-Path $resolvedVault '12_Brain\state\connector-health.json'
        $connector = Read-JsonFile -Path $connectorPath
        $ads = $null
        $adsRetryUtc = $null
        if ($connector -and $connector.connectors) {
            $adsMatches = @($connector.connectors | Where-Object { $_.toolkit -eq 'googleads' })
            if ($adsMatches.Count -gt 0) { $ads = $adsMatches[0] }
            if ($ads -and $ads.blocker -and $ads.blocker.retry_delay_seconds -and $ads.last_verified_utc) {
                try {
                    $adsRetryUtc = ([datetime]$ads.last_verified_utc).ToUniversalTime().AddSeconds([int]$ads.blocker.retry_delay_seconds).ToString('o')
                } catch { }
            }
        }
        $healthCli = @{ status = 'skipped'; detail = 'dry-run' }
        if (-not $DryRun -and $node) {
            $healthScript = Join-Path $resolvedVault '_os\automation\bin\connector-health.js'
            if (Test-Path -LiteralPath $healthScript) {
                $raw = & $node $healthScript --json 2>&1 | Out-String
                $healthCli = @{ exit = $LASTEXITCODE; parsed = $true }
                try { $healthCli = ($raw | ConvertFrom-Json) } catch { $healthCli = @{ status = 'unparseable'; exit = $LASTEXITCODE } }
            }
        }
        $adsUsable = $false
        if ($ads -and $ads.status -eq 'active' -and $ads.read_verified -eq $true) { $adsUsable = $true }
        $pmStatus = if ($adsUsable) { 'ok' } elseif ($ads -and $ads.blocker) { 'blocked' } else { 'degraded' }
        $pmSummary = if ($adsUsable) {
            'Google Ads read verified; pause/enable/budget still requires a live campaign readback this cycle'
        } elseif ($adsRetryUtc) {
            "Google Ads 429 developer quota; retry after $adsRetryUtc; no pause/enable/budget"
        } else {
            'Google Ads not read-verified; Meta stays read-only; no mutation'
        }
        $lanes.Add((New-Lane -Id 'paid-media' -Agent 'paid-media-analyst' -Status $pmStatus -Summary $pmSummary `
            -Evidence @('12_Brain/state/connector-health.json') `
            -Detail @{ ads_retry_utc = $adsRetryUtc; ads_read_verified = [bool]$adsUsable; health_cli = $healthCli }))

        # web-product-builder
        $lpQueue = Join-Path $resolvedVault '02_Campaigns\Landing Page Build Queue.md'
        $preflight = Read-JsonFile -Path (Join-Path $resolvedVault '02_Campaigns\AI Site Builder Outreach Engine\batches\radar-next20-20260826-232808\PREFLIGHT-EVIDENCE.json')
        $readyCount = 0
        if ($preflight -and $preflight.ready) { $readyCount = @($preflight.ready).Count }
        $lpExists = Test-Path -LiteralPath $lpQueue
        $webStatus = if ($lpExists) { 'ok' } else { 'blocked' }
        $lanes.Add((New-Lane -Id 'web' -Agent 'web-product-builder' -Status $webStatus `
            -Summary "preview LPs queued; radar preflight ready=$readyCount; no production deploy; no new public site" `
            -Evidence @('02_Campaigns/Landing Page Build Queue.md', '02_Campaigns/AI Site Builder Outreach Engine/batches/radar-next20-20260826-232808/PREFLIGHT-EVIDENCE.json') `
            -Detail @{ radar_ready = $readyCount; queue_present = $lpExists }))

        # qa-critic
        $qa = @(
            (Test-LandingPage -RelPath '_os/creative-factory/landing-pages/omega-outdoor-living.html' -Client 'Omega'),
            (Test-LandingPage -RelPath '_os/creative-factory/landing-pages/kjb-wedding-timeline.html' -Client 'KJB'),
            (Test-LandingPage -RelPath '_os/creative-factory/landing-pages/shadow-hvac-summer-ac.html' -Client 'Shadow')
        )
        $qaFail = @($qa | Where-Object { $_.publish -eq 'fail' }).Count
        $qaStatus = if ($qaFail -gt 0) { 'fail_publish' } else { 'ok' }
        $lanes.Add((New-Lane -Id 'qa' -Agent 'qa-critic' -Status $qaStatus `
            -Summary "preview QA: $qaFail/3 fail for publish; no artifact edits by critic" `
            -Evidence @('_os/creative-factory/landing-pages/') `
            -Detail @{ pages = $qa }))

        # growth-content
        $live = @(
            (Get-HttpStatus -Url 'https://www.immohrtalmarketing.com/'),
            (Get-HttpStatus -Url 'https://www.immohrtalmarketing.com/robots.txt'),
            (Get-HttpStatus -Url 'https://www.immohrtalmarketing.com/sitemap.xml')
        )
        $liveOk = @($live | Where-Object { $_.status -match '^2' }).Count
        $growthStatus = if ($DryRun) { 'ok' } elseif ($liveOk -ge 1) { 'ok' } else { 'degraded' }
        $lanes.Add((New-Lane -Id 'growth' -Agent 'growth-content' -Status $growthStatus `
            -Summary "agency site live probes $liveOk/3; outreach remains DRAFT_ONLY_DO_NOT_SEND; mail_ready=hold" `
            -Evidence @('https://www.immohrtalmarketing.com/') `
            -Detail @{ live = $live }))

        # brain-curator: compile only; never rewrite captures
        $capturesDir = Join-Path $resolvedVault '12_Brain\01_Captures'
        $lanes.Add((New-Lane -Id 'brain' -Agent 'brain-curator' -Status 'ok' `
            -Summary 'compiled crew state only; 12_Brain/01_Captures untouched' `
            -Evidence @('12_Brain/state/immohrtal-crew/latest.json') `
            -Detail @{ captures_rewritten = $false; captures_dir_exists = (Test-Path -LiteralPath $capturesDir) }))

        # marketing-chief rank
        $board = @(
            [pscustomobject]@{ rank = 1; item = 'Paid-media truth (Omega / Onsite / KJB / Replenish)'; lane = 'paid-media-analyst'; status = $pmStatus; note = $pmSummary }
            [pscustomobject]@{ rank = 2; item = 'Web finish lines and IMMOHRTAL outreach hold packets'; lane = 'web-product-builder'; status = $webStatus; note = "radar ready=$readyCount; publish gated" }
            [pscustomobject]@{ rank = 3; item = 'Independent QA of preview LPs'; lane = 'qa-critic'; status = $qaStatus; note = "$qaFail fail for publish" }
            [pscustomobject]@{ rank = 4; item = 'Agency site + growth copy, no publish'; lane = 'growth-content'; status = $growthStatus; note = 'live probes; drafts hold' }
            [pscustomobject]@{ rank = 5; item = 'Reliability of local loops vs stuck'; lane = 'reliability-scout'; status = $relStatus; note = 'do not restart Hermes; do not re-enable excluded Agency Daily' }
        )
        $lanes.Add((New-Lane -Id 'chief' -Agent 'marketing-chief' -Status 'ok' `
            -Summary 'one ranked Immohrtal board; Codex remains canonical queue writer' `
            -Evidence @('Daily-Briefs/plan-' + $today + '.md') `
            -Detail @{ board = $board }))

        $planPath = Join-Path $planDir ("plan-$today.md")
        if (-not $NoEvidence) {
            $plan = @"
---
note_type: plan
status: active
created: $today
updated: $today
source_refs:
  - System/scripts/Invoke-ImmohrtalCrew.ps1
  - 12_Brain/state/immohrtal-crew/latest.json
  - 12_Brain/state/connector-health.json
  - 02_Campaigns/Landing Page Build Queue.md
  - https://www.immohrtalmarketing.com/
tags:
  - plan
  - marketing-chief
  - immohrtal
  - autonomous-crew
---

# Plan - $today

## The one thing

Run the Immohrtal seven-agent crew unattended on local, reversible work. Stop at send, publish, deploy, merge, and the canonical client queue.

## Ranked Immohrtal board

1. **Paid-media truth** - $pmSummary
2. **Web finish lines and company outreach** - preview LPs and radar ready=$readyCount. ``mail_ready=hold``.
3. **Independent QA** - $qaFail/3 preview LPs fail for publish. Critic does not edit.
4. **Agency site / growth** - live probes $liveOk/3. Drafts only.
5. **Reliability** - local loops vs stuck. Do not restart Hermes. Do not re-enable ``IMMOHRTAL Agency Daily`` until the source audit clears.

## Stop rules this cycle

- No send, publish, production deploy, merge to main, force-push, port exposure, secrets, or ``client-operations/queue/work-items.json``.
- Ordinary Gmail and ordinary Google Ads pause/enable/budget stay with the Cursor worker after live readback.
- Replenish user-invite stays untouched.

## Crew

cycle ``$cycleId`` dry_run=$DryRun
"@
            Write-Utf8 -Path $planPath -Text $plan
        }
    }

    $finished = (Get-Date).ToUniversalTime().ToString('o')
    $nextFailures = 0
    $breakerOpened = $null
    if ($outcome -eq 'blocked' -and $skipReason -match 'circuit breaker') {
        $nextFailures = $failCount
        $breakerOpened = $previous.breaker_opened_utc
    } elseif ($outcome -eq 'worked') {
        $hardFail = @($lanes | Where-Object { $_.status -eq 'failed' }).Count
        if ($hardFail -gt 0) {
            $outcome = 'blocked'
            $nextFailures = $failCount + 1
            if ($nextFailures -ge $BreakerThreshold) { $breakerOpened = $finished }
        } else {
            $nextFailures = 0
        }
    } else {
        $nextFailures = $failCount
        if ($previous) { $breakerOpened = $previous.breaker_opened_utc }
    }

    $payload = [ordered]@{
        schema = 1
        cycle_id = $cycleId
        started_at_utc = $nowUtc
        finished_at_utc = $finished
        outcome = $outcome
        skip_reason = $skipReason
        mail_ready = 'hold'
        canonical_write_attempted = $false
        external_action_attempted = $false
        dry_run = [bool]$DryRun
        consecutive_failures = $nextFailures
        breaker_opened_utc = $breakerOpened
        vault = $resolvedVault
        lanes = $lanes.ToArray()
        stop_rules = @(
            'mail_ready=hold',
            'no send/publish/deploy/merge/force-push',
            'no client-operations/queue/work-items.json',
            'no secrets',
            'no Hermes restart',
            'do not re-enable IMMOHRTAL Agency Daily'
        )
    }

    if (-not $NoEvidence) {
        $jsonText = ($payload | ConvertTo-Json -Depth 10)
        if ($outcome -ne 'skipped_dedupe') {
            Write-Utf8 -Path $latestPath -Text $jsonText
        }
        Add-Content -LiteralPath $receiptLog -Value (($jsonText -replace '[\r\n]+', ' ').Trim()) -Encoding UTF8
        $proposalPath = Join-Path $proposalOutDir ("immohrtal-crew-$today.md")
        $laneLines = ($lanes | ForEach-Object { "- **$($_.agent)** ($($_.status)): $($_.summary)" }) -join "`n"
        $proposal = @"
---
note_type: proposal
status: $($outcome)
created: $today
verified_at: $finished
agent: marketing-chief
privacy: redacted
external_action_attempted: none
mail_ready: hold
source_refs:
  - 12_Brain/state/immohrtal-crew/latest.json
---

# Immohrtal crew - $today

cycle ``$cycleId`` outcome **$outcome**

## Lanes

$laneLines

## Gates

mail_ready=hold. Canonical queue not written. No send, publish, deploy, or merge.
"@
        Write-Utf8 -Path $proposalPath -Text $proposal
    }

    if ($Json) { $payload | ConvertTo-Json -Depth 10 }
    else {
        Write-Host "immohrtal-crew $cycleId $outcome mail_ready=hold lanes=$($lanes.Count)"
        if ($skipReason) { Write-Host $skipReason }
    }
    if ($outcome -eq 'blocked' -and $skipReason -match 'circuit breaker') { exit 2 }
    exit 0
}
finally {
    if ($lease -and $mutex) {
        try { $mutex.ReleaseMutex() | Out-Null } catch { }
        try { $mutex.Dispose() } catch { }
    }
}
