<#
.SYNOPSIS
  The morning prospect radar sweep. Registered as a Windows Scheduled Task.

.DESCRIPTION
  Runs the full daily loop on this machine and leaves the result in Git:

    1. Fast-forward the vault so the run starts from current state.
    2. Discover new Pennsylvania businesses, weighted to Philadelphia.
    3. Enrich the highest-priority rows with Google Places review data.
    4. Grade the new arrivals and re-audit whatever went stale.
    5. Rewrite the dashboard, the queue CSV and a dated digest, then commit.

  This runs here rather than in the cloud for one concrete reason: Tier 1 needs a
  real Chromium that can reach the internet, and this machine has one. A cloud
  sandbox behind a CONNECT-only proxy cannot render, and without rendering the
  grader can never certify a site as good — the `verify` pile just grows. So
  -MaxTier defaults to 1 here.

  The Places API key is read from a DPAPI-protected file, matching the pattern in
  xai-research.ps1. It is injected into the child process environment only, never
  written to disk in the clear, never echoed, and never committed.

.PARAMETER Discover
  New candidates to look for. Default 200.

.PARAMETER Recheck
  Stale prospects to re-audit. Default 120.

.PARAMETER Enrich
  Google Places lookups to spend. Default 60. Every call is billed — this is a
  hard daily ceiling, not a target. Set 0 to skip.

.PARAMETER MaxTier
  Deepest audit tier. Default 1 (render). Use 0 to skip the browser.

.PARAMETER NoPush
  Commit locally but do not push.

.PARAMETER OpenDashboard
  Open the dashboard in the default browser when the run finishes.

.PARAMETER DryRun
  Do everything except write, commit or push.

.EXAMPLE
  .\radar-morning.ps1 -OpenDashboard

.EXAMPLE
  # Register it to run every weekday at 7:00am:
  $ps = "$env:ProgramFiles\PowerShell\7\pwsh.exe"   # or powershell.exe
  $script = "C:\path\to\dillon-os\_os\automation\bin\radar-morning.ps1"
  $action = New-ScheduledTaskAction -Execute $ps -Argument "-NoProfile -File `"$script`""
  $trigger = New-ScheduledTaskTrigger -Daily -At 7:00am
  $settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -RunOnlyIfNetworkAvailable
  Register-ScheduledTask -TaskName "Dillon OS prospect radar" -Action $action `
      -Trigger $trigger -Settings $settings -Description "Daily prospect discovery and website grading"

  -StartWhenAvailable matters: it runs the sweep after the machine wakes if it was
  off at 7am, rather than silently skipping the day.
#>
[CmdletBinding()]
param(
    # Defaults mirror lib/coverage-plan.js DAILY. They were 200/120, which is the
    # rate that reaches the dashboard's render ceiling in roughly a week — the
    # coverage planner's own header argues at length against it.
    [int]$Discover = 60,
    [int]$Recheck = 250,
    [int]$Render = 80,
    [int]$Enrich = 60,
    [int]$MaxTier = 1,
    [switch]$NoPush,
    [switch]$OpenDashboard,
    [switch]$DryRun,
    [string]$SecretPath = "$env:LOCALAPPDATA\Codex\Secrets\google-places-dillon-os.dpapi",
    [string]$Branch = 'main'
)

$ErrorActionPreference = 'Stop'
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..\..')).Path
$logDir = Join-Path $repoRoot '_os\automation\logs'
$null = New-Item -ItemType Directory -Force -Path $logDir
$stamp = Get-Date -Format 'yyyy-MM-dd'
$logFile = Join-Path $logDir "radar-$stamp.log"

function Write-Log {
    param([string]$Message, [string]$Level = 'INFO')
    $line = "{0} [{1}] {2}" -f (Get-Date -Format 'HH:mm:ss'), $Level, $Message
    Write-Host $line
    Add-Content -LiteralPath $logFile -Value $line
}

Write-Log "radar sweep starting in $repoRoot"
Push-Location $repoRoot
try {
    # --- 1. Start from current state ---------------------------------------
    # A stale working tree means today's run re-discovers businesses that were
    # already added from another machine, and the commit conflicts on push.
    if (-not $DryRun) {
        $dirty = git status --porcelain
        if ($dirty) {
            # Explicit pathspecs. A bare `git add -A` here would commit whatever
            # the operator was mid-edit, unreviewed, and would depend on
            # .gitignore alone to keep 12_Brain/private out of a PUBLIC repo.
            Write-Log "working tree has local changes; committing the radar's own outputs so the sweep starts clean" 'WARN'
            git add -A -- 12_Brain/state Daily-Briefs
            if (-not (git diff --cached --quiet; $LASTEXITCODE -eq 0)) {
                git commit -q -m "Radar outputs before sweep $stamp"
            }
        }
        git fetch origin $Branch --quiet
        # Rebase rather than merge: the radar's own commits are the only thing on
        # this branch locally, and a merge bubble per day is noise.
        git pull --rebase --quiet origin $Branch
        Write-Log "pulled origin/$Branch"
    }

    # --- 2. Unwrap the Places key into the child environment ----------------
    if ($Enrich -gt 0 -and -not $DryRun) {
        if (Test-Path -LiteralPath $SecretPath) {
            try {
                $protected = Get-Content -Raw -LiteralPath $SecretPath
                $secure = ConvertTo-SecureString -String $protected
                $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
                try {
                    $env:GOOGLE_PLACES_API_KEY = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
                } finally {
                    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
                }
                Write-Log "Places key loaded; enrichment budget $Enrich lookups"
            } catch {
                Write-Log "could not unwrap the Places key: $($_.Exception.Message). Continuing without enrichment." 'WARN'
                $Enrich = 0
            }
        } else {
            Write-Log "no Places key at $SecretPath — skipping enrichment. Create it with:" 'WARN'
            Write-Log '  Read-Host -AsSecureString "Places API key" | ConvertFrom-SecureString | Set-Content <path>' 'WARN'
            $Enrich = 0
        }
    }

    # --- 3. The sweep -------------------------------------------------------
    $nodeArgs = @(
        (Join-Path $PSScriptRoot 'radar-refresh.js'),
        '--discover', $Discover,
        '--recheck', $Recheck,
        '--render', $Render,
        '--enrich', $Enrich,
        '--max-tier', $MaxTier
    )
    if ($DryRun) { $nodeArgs += '--dry-run' }

    Write-Log "node radar-refresh.js --discover $Discover --recheck $Recheck --render $Render --enrich $Enrich --max-tier $MaxTier"
    $output = & node @nodeArgs 2>&1
    $exit = $LASTEXITCODE
    $output | ForEach-Object { Add-Content -LiteralPath $logFile -Value "    $_" }
    $output | Select-Object -Last 30 | ForEach-Object { Write-Host "    $_" }

    if ($exit -ne 0) {
        Write-Log "radar-refresh exited $exit — not committing a failed run" 'ERROR'
        exit $exit
    }

    # --- 4. Commit and push -------------------------------------------------
    if ($DryRun) {
        Write-Log 'dry run: nothing written, nothing committed'
    } else {
        $changed = git status --porcelain
        if ($changed) {
            git add -A -- 12_Brain/state Daily-Briefs

            # The same guard the GitHub workflow runs. This repository is PUBLIC
            # and after a find-contacts run 12_Brain/private holds real email
            # addresses and personal names; .gitignore must not be the only thing
            # standing between them and the internet.
            $staged = git diff --cached --name-only
            if ($staged -match '^12_Brain/private/') {
                Write-Log 'REFUSING TO COMMIT: a file under 12_Brain/private is staged' 'ERROR'
                git reset -q
                exit 1
            }
            $leaked = @()
            foreach ($f in @('12_Brain/state/radar/registry.json',
                             '12_Brain/state/radar/build-queue.csv',
                             'Daily-Briefs/prospect-radar.html')) {
                if (-not (Test-Path $f)) { continue }
                $text = Get-Content $f -Raw
                if ($text -match '"(phone|street|lat|lon|osm_id)"\s*:') { $leaked += "$f: contact or location field" }
                if ($text -match '\b(215|267|610|484|445|835)\d{7}\b') { $leaked += "$f: phone-shaped digits" }
                $addrs = [regex]::Matches($text, '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}') |
                         ForEach-Object { $_.Value } |
                         Where-Object { $_ -notmatch '@(needmomentum\.com|momentum360\.com)$' }
                if ($addrs.Count -gt 0) { $leaked += "$f: third-party email ($($addrs[0]))" }
            }
            if ($leaked.Count -gt 0) {
                Write-Log 'REFUSING TO COMMIT — private data in a tracked file:' 'ERROR'
                $leaked | ForEach-Object { Write-Log "  $_" 'ERROR' }
                git reset -q
                exit 1
            }

            git commit -q -m "Prospect radar sweep $stamp

Automated by _os/automation/bin/radar-morning.ps1.
Dashboard: Daily-Briefs/prospect-radar.html
Digest: Daily-Briefs/radar-$stamp.md"
            Write-Log 'committed the sweep'

            if (-not $NoPush) {
                # Transient network failures are common on a desktop waking from
                # sleep, so retry with backoff rather than losing the day's run.
                $pushed = $false
                foreach ($delay in @(0, 2, 4, 8, 16)) {
                    if ($delay -gt 0) { Start-Sleep -Seconds $delay }
                    git push --quiet origin HEAD 2>&1 | Out-Null
                    if ($LASTEXITCODE -eq 0) { $pushed = $true; break }
                    Write-Log "push failed, retrying in $([Math]::Max($delay * 2, 2))s" 'WARN'
                }
                if ($pushed) { Write-Log "pushed to origin/$Branch" }
                else { Write-Log 'push failed after retries; the commit is safe locally' 'WARN' }
            }
        } else {
            Write-Log 'no changes to commit'
        }
    }

    if ($OpenDashboard) {
        $dash = Join-Path $repoRoot 'Daily-Briefs\prospect-radar.html'
        if (Test-Path -LiteralPath $dash) { Start-Process $dash }
    }

    Write-Log 'radar sweep complete'
} finally {
    # Never leave the key in this shell's environment.
    Remove-Item Env:\GOOGLE_PLACES_API_KEY -ErrorAction SilentlyContinue
    Pop-Location
}
