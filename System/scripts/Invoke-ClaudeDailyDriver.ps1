<#
.SYNOPSIS
    Claude autonomous daily-driver controller. Polls cheaply, executes bounded safe work.

.DESCRIPTION
    The scheduled entry point. Designed to run many times a day at near-zero cost and to
    do real work only when local state actually changed.

      1 lease        one controller at a time, machine-local mutex
      2 poll         cheap state signature, no model usage, no network
      3 dedupe       unchanged signature within the min interval is a no-op
      4 select       only routines the loop's own gates already cleared
      5 budget       per-cycle and per-day routine ceilings; frontier calls ledgered
      6 execute      Invoke-ClaudeLoop.ps1 with allowlisted local commands only
      7 evidence     receipts, checkpoint, usage ledger, approval package
      8 breaker      consecutive-failure circuit breaker with cooldown
      9 catch-up     detects missed windows after sleep or reboot

    Frontier synthesis is implemented but disabled by default to preserve Claude usage.
    Enable it explicitly with -EnableFrontier; the daily ceiling, bounded redacted packet,
    proposal-only output, tool isolation, and recursion guard still apply.

    Never sends, posts, publishes, deploys, spends, commits, pushes, changes an account,
    reads a credential, launches a browser, or writes canonical client state.
    Codex acting as Marketing Chief remains sole orchestrator and canonical writer.

.EXAMPLE
    & .\System\scripts\Invoke-ClaudeDailyDriver.ps1
    & .\System\scripts\Invoke-ClaudeDailyDriver.ps1 -Force -MaxRoutinesPerCycle 2
#>
[CmdletBinding()]
param(
    [string]$VaultRoot = (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent),
    [string]$CanonicalRoot = 'C:\Users\dillo\Documents\Codex\projects\client-operations',
    # 3 is also the hard concurrent-worker cap carried from the specialist bench.
    [int]$MaxRoutinesPerCycle = 3,
    # Sized to the 26-routine daily band: one pass per daily routine per day.
    [int]$MaxRoutinesPerDay = 26,
    [int]$MaxFrontierCallsPerDay = 1,
    # The registered task fires at PT15M. A 15-minute min interval would suppress roughly
    # half the cycles on scheduler jitter, so this sits below the trigger interval.
    [int]$MinIntervalMinutes = 10,
    # The registered task has ExecutionTimeLimit PT12M. Stop starting new routines after
    # this many minutes so a cycle is never killed mid-routine by the scheduler.
    [int]$CycleWallClockBudgetMinutes = 8,
    [int]$BreakerThreshold = 3,
    [int]$BreakerCooldownMinutes = 120,
    # Opt in only when Claude usage is intentionally available.
    [switch]$EnableFrontier,
    [switch]$Force,
    [switch]$Json
)

$ErrorActionPreference = 'Stop'
$resolvedVault = (Resolve-Path -LiteralPath $VaultRoot).Path
$stateDir = Join-Path $resolvedVault '12_Brain/state'
$queueDir = Join-Path $resolvedVault '12_Brain/queue'
$proposalDir = Join-Path $resolvedVault '00_Inbox/Agent-Proposals/Claude'
$driverState = Join-Path $stateDir 'claude-daily-driver.json'
$usageLedger = Join-Path $stateDir 'claude-usage-ledger.json'
$loop = Join-Path $resolvedVault 'System/scripts/Invoke-ClaudeLoop.ps1'
$utf8 = New-Object System.Text.UTF8Encoding($false)
$ps = Join-Path $env:SystemRoot ('System32' + [char]92 + 'WindowsPowerShell' + [char]92 + 'v1.0' + [char]92 + 'powershell.exe')
$today = Get-Date -Format 'yyyy-MM-dd'
$cycleId = 'DRV-' + (Get-Date -Format 'yyyyMMdd-HHmmssfff')
$nowUtc = (Get-Date).ToUniversalTime().ToString('o')

$log = New-Object System.Collections.Generic.List[object]
function Add-Step { param([string]$Step, [string]$State, [string]$Detail)
    $log.Add([pscustomobject]@{ step = $Step; state = $State; detail = $Detail }) }

# Frontier output is model text; it must never carry a secret-shaped value into a proposal.
$secretPatterns2 = @('sk-[A-Za-z0-9]{20,}', 'ghp_[A-Za-z0-9]{20,}', 'xox[baprs]-',
                     'AIza[0-9A-Za-z_\-]{30,}', 'BEGIN (RSA|OPENSSH|EC|PRIVATE) KEY')
function Test-Redacted2 {
    param([string]$Text)
    foreach ($p in $secretPatterns2) { if ($Text -match $p) { return $false } }
    return $true
}

function Read-Json { param([string]$Path, $Default)
    if (-not (Test-Path -LiteralPath $Path)) { return $Default }
    try { return (Get-Content -LiteralPath $Path -Raw | ConvertFrom-Json) } catch { return $Default }
}

# ------------------------------------------------------------------- 1. lease
$mutex = $null; $lease = $false
try {
    $mutex = New-Object System.Threading.Mutex($false, 'Local\claude-daily-driver')
    $lease = $mutex.WaitOne(0)
} catch { $lease = $false }
if (-not $lease) {
    Add-Step 'lease' 'blocked' 'another controller instance holds the lease'
    if ($Json) { [pscustomobject]@{ cycle_id = $cycleId; outcome = 'skipped_lease'; steps = $log.ToArray() } | ConvertTo-Json -Depth 5 }
    else { Write-Host 'daily-driver: another instance holds the lease; exiting cleanly' }
    exit 0
}

try {
    Add-Step 'lease' 'ok' 'exclusive controller lease acquired'

    # ----------------------------------------------- 1b. browser bootstrap (idempotent)
    # Restores the dedicated loopback Chrome after reboot or sleep by reusing the existing
    # Start-ClaudeLocalBrowser.ps1. Never touches Dillon's foreground Chrome, never tunnels.
    $browserState = 'not_checked'
    try {
        $listen = @(Get-NetTCPConnection -LocalAddress '127.0.0.1' -LocalPort 9223 -State Listen -ErrorAction SilentlyContinue)
        if ($listen.Count -eq 0) {
            $boot = Join-Path $resolvedVault 'System/scripts/Start-ClaudeLocalBrowser.ps1'
            if (Test-Path -LiteralPath $boot) {
                & $boot | Out-Null
                $listen = @(Get-NetTCPConnection -LocalAddress '127.0.0.1' -LocalPort 9223 -State Listen -ErrorAction SilentlyContinue)
                if ($listen.Count -ge 1) { $browserState = 'restored' } else { $browserState = 'restore_failed' }
            } else { $browserState = 'bootstrap_script_missing' }
        } else { $browserState = 'already_listening' }
    } catch { $browserState = 'probe_failed' }
    $bootOk = ($browserState -eq 'already_listening') -or ($browserState -eq 'restored')
    Add-Step 'browser_bootstrap' $(if ($bootOk) { 'ok' } else { 'blocked' }) "dedicated loopback 9223: $browserState"

    # ------------------------------------------------------------- 2. cheap poll
    # No model, no network. Only mtimes and cheap counts.
    function Get-Signature {
        $parts = New-Object System.Collections.Generic.List[string]
        $reg = Join-Path $resolvedVault '11_Agents/claude-operating-team.json'
        foreach ($p in @($reg, (Join-Path $resolvedVault 'System/approval-queue.md'),
                         (Join-Path $CanonicalRoot 'queue/work-items.json'))) {
            if (Test-Path -LiteralPath $p) {
                $i = Get-Item -LiteralPath $p
                $parts.Add("$($i.Name)=$($i.LastWriteTimeUtc.Ticks):$($i.Length)")
            } else { $parts.Add("$(Split-Path $p -Leaf)=absent") }
        }
        $newestNote = Get-ChildItem -LiteralPath (Join-Path $resolvedVault '12_Brain') -Recurse -Filter '*.md' -File |
                      Sort-Object LastWriteTimeUtc -Descending | Select-Object -First 1
        if ($newestNote) { $parts.Add("note=$($newestNote.LastWriteTimeUtc.Ticks)") }
        $newestState = Get-ChildItem -LiteralPath $stateDir -Filter '*.json' -File -ErrorAction SilentlyContinue |
                       Sort-Object LastWriteTimeUtc -Descending | Select-Object -First 1
        if ($newestState) { $parts.Add("state=$($newestState.LastWriteTimeUtc.Ticks)") }
        $raw = ($parts -join '|')
        $sha = [System.Security.Cryptography.SHA256]::Create()
        $hash = -join (($sha.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($raw)) | Select-Object -First 8) |
                       ForEach-Object { $_.ToString('x2') })
        $sha.Dispose()
        return @{ signature = $hash; inputs = $parts.Count }
    }
    $sig = Get-Signature
    Add-Step 'poll' 'ok' "signature $($sig.signature) over $($sig.inputs) local inputs, no model used"

    $prev = Read-Json -Path $driverState -Default $null
    $lastRunUtc = $null
    if ($prev -and $prev.last_cycle_utc) {
        # Casting an ISO-8601 'Z' string with [datetime] yields LOCAL time. Comparing that
        # against (Get-Date).ToUniversalTime() shifts every gap by the UTC offset, which
        # silently broke both the min-interval throttle and catch-up detection.
        $lastRunUtc = ([datetime]::Parse($prev.last_cycle_utc, [cultureinfo]::InvariantCulture,
                        [System.Globalization.DateTimeStyles]::RoundtripKind)).ToUniversalTime()
    }

    # ------------------------------------------------------------ 9. catch-up
    $catchUp = $false
    if ($lastRunUtc) {
        $gapH = ((Get-Date).ToUniversalTime() - $lastRunUtc).TotalHours
        if ($gapH -gt 24) { $catchUp = $true }
        Add-Step 'catch_up' 'ok' ("last cycle {0}h ago; catch_up={1}" -f [math]::Round($gapH, 2), $catchUp)
    } else {
        $catchUp = $true
        Add-Step 'catch_up' 'ok' 'no prior cycle; first run treated as catch-up'
    }

    # ------------------------------------------------------------ 8. breaker
    $consecFail = 0
    if ($prev -and $prev.consecutive_failures) { $consecFail = [int]$prev.consecutive_failures }
    $breakerOpen = $false
    if ($consecFail -ge $BreakerThreshold) {
        $openedAt = $null
        if ($prev.breaker_opened_utc) {
            $openedAt = ([datetime]::Parse($prev.breaker_opened_utc, [cultureinfo]::InvariantCulture,
                          [System.Globalization.DateTimeStyles]::RoundtripKind)).ToUniversalTime()
        }
        if ($openedAt -and ((Get-Date).ToUniversalTime() - $openedAt).TotalMinutes -lt $BreakerCooldownMinutes) {
            $breakerOpen = $true
        }
    }
    Add-Step 'circuit_breaker' $(if ($breakerOpen) { 'blocked' } else { 'ok' }) `
        "consecutive_failures=$consecFail threshold=$BreakerThreshold open=$breakerOpen"

    # ------------------------------------------------------------- 3. dedupe
    $changed = $true
    if ($prev -and $prev.signature -eq $sig.signature) { $changed = $false }
    $withinMin = $false
    if ($lastRunUtc -and ((Get-Date).ToUniversalTime() - $lastRunUtc).TotalMinutes -lt $MinIntervalMinutes) { $withinMin = $true }
    $shouldWork = ($changed -or $catchUp -or $Force) -and (-not $breakerOpen)
    if ($withinMin -and -not $Force -and -not $catchUp) { $shouldWork = $false }
    Add-Step 'dedupe' 'ok' "changed=$changed within_min_interval=$withinMin force=$Force -> work=$shouldWork"

    # --------------------------------------------------------------- 5. budget
    $ledger = Read-Json -Path $usageLedger -Default $null
    $todayRoutines = 0; $todayFrontier = 0; $todayCycles = 0
    if ($ledger -and $ledger.date -eq $today) {
        $todayRoutines = [int]$ledger.routines_executed
        $todayFrontier = [int]$ledger.frontier_calls
        $todayCycles = [int]$ledger.cycles
    }
    $remaining = $MaxRoutinesPerDay - $todayRoutines
    if ($remaining -lt 0) { $remaining = 0 }
    $perCycle = [Math]::Min($MaxRoutinesPerCycle, $remaining)
    if ($perCycle -le 0 -and $shouldWork) {
        $shouldWork = $false
        Add-Step 'budget' 'blocked' "daily routine ceiling reached: $todayRoutines/$MaxRoutinesPerDay"
    } else {
        Add-Step 'budget' 'ok' "day $todayRoutines/$MaxRoutinesPerDay routines, cycle cap $perCycle, frontier $todayFrontier/$MaxFrontierCallsPerDay"
    }

    # --------------------------------------------------- frontier synthesis (real)
    # At most one Opus call per day, ledger-enforced. The child gets a bounded redacted
    # packet, writes a local proposal, gains no authority, and cannot itself invoke
    # frontier (recursion guard via CLAUDE_FRONTIER_CHILD).
    $frontierState = 'not_attempted'
    $frontierArtifact = $null
    if (-not $EnableFrontier) { $frontierState = 'disabled_by_default' }
    elseif ($env:CLAUDE_FRONTIER_CHILD -eq '1') { $frontierState = 'recursion_guard_blocked' }
    elseif ($todayFrontier -ge $MaxFrontierCallsPerDay) { $frontierState = 'ceiling_reached' }
    elseif (-not $shouldWork) { $frontierState = 'skipped_no_work' }
    else {
        # `claude` on PATH resolves to claude.ps1, which Process.Start cannot execute.
        # Prefer the .cmd shim; fall back to running the .ps1 through powershell.exe.
        $claudeExe = $null
        $claudeArgs = '--model claude-opus-5 --effort medium --tools "" -p'
        $cmdShim = Join-Path $env:APPDATA 'npm\claude.cmd'
        if (Test-Path -LiteralPath $cmdShim) {
            $claudeExe = $cmdShim
        } else {
            $resolved = Get-Command claude -ErrorAction SilentlyContinue
            if ($resolved -and $resolved.Source -like '*.ps1') {
                $claudeExe = $ps
                $claudeArgs = "-NoLogo -NoProfile -ExecutionPolicy Bypass -File `"$($resolved.Source)`" --model claude-opus-5 --effort medium --tools `"`" -p"
            } elseif ($resolved) { $claudeExe = $resolved.Source }
        }
        if (-not $claudeExe) { $frontierState = 'cli_unavailable' }
        else {
            # The packet used to hard-code a findings list. It went stale and started
            # asserting things that were no longer true (a public remote, client files
            # staged for deletion), which is worse than saying nothing: the model
            # reasons confidently from false premises. Facts now come from the craft
            # brief's counted output, refreshed daily by routine D26.
            $craft = $null
            $craftPath = Join-Path $stateDir 'agent-craft-brief.json'
            if (Test-Path -LiteralPath $craftPath) {
                try { $craft = Get-Content -LiteralPath $craftPath -Raw | ConvertFrom-Json } catch { $craft = $null }
            }
            $packetLines = New-Object System.Collections.Generic.List[string]
            $packetLines.Add('You are a bounded Claude specialist inside Dillon''s operating team. Read-only synthesis.')
            $packetLines.Add('Codex acting as Marketing Chief is the sole canonical writer. Propose only; do not act.')
            $packetLines.Add('')
            $packetLines.Add(("State: eligible={0} consecutive_failures={1} routines_today={2}/{3}" -f $eligibleIds.Count, $consecFail, $todayRoutines, $MaxRoutinesPerDay))
            if ($craft) {
                $packetLines.Add(("Counted over {0} day(s) of loop receipts:" -f $craft.window_days))
                $packetLines.Add(("  routines observed={0} reliable-every-day={1} failing={2} cadence-drift={3} authorized-never-ran={4}" -f `
                    $craft.counts.routines_seen, $craft.counts.workhorses, $craft.counts.unreliable, `
                    $craft.counts.cadence_drift, $craft.counts.authorized_never_ran))
                foreach ($u in @($craft.unreliable | Select-Object -First 3)) {
                    $packetLines.Add(("  failing: {0} {1} - {2} failure(s), reliability {3}" -f $u.id, $u.name, $u.failures, $u.reliability))
                }
                foreach ($g in @($craft.gate_blocks | Select-Object -First 3)) {
                    $packetLines.Add(("  gate {0} blocked {1} time(s)" -f $g.gate, $g.blocks))
                }
            } else {
                $packetLines.Add('No craft brief available; state above is the only evidence. Say so rather than guessing.')
            }
            $packetLines.Add('')
            $packetLines.Add('Task: from the counted evidence above only, name the single highest-value SAFE next')
            $packetLines.Add('action for the autonomous loop, and the one contradiction most likely still hiding.')
            $packetLines.Add('Do not assert any fact not present above. Under 200 words. No client data.')
            $packetLines = $packetLines.ToArray()
            $packet = ($packetLines -join "`n")
            try {
                $env:CLAUDE_FRONTIER_CHILD = '1'
                $fpsi = New-Object System.Diagnostics.ProcessStartInfo
                $fpsi.FileName = $claudeExe
                $fpsi.Arguments = $claudeArgs
                $fpsi.UseShellExecute = $false
                $fpsi.CreateNoWindow = $true
                $fpsi.RedirectStandardInput = $true
                $fpsi.RedirectStandardOutput = $true
                $fpsi.RedirectStandardError = $true
                $fpsi.WorkingDirectory = $resolvedVault
                $fproc = New-Object System.Diagnostics.Process
                $fproc.StartInfo = $fpsi
                [void]$fproc.Start()
                $fproc.StandardInput.Write($packet)
                $fproc.StandardInput.Close()
                $fout = $fproc.StandardOutput.ReadToEnd()
                $ferr = $fproc.StandardError.ReadToEnd()
                if (-not $fproc.WaitForExit(180000)) {
                    try { $fproc.Kill() } catch { }
                    $frontierState = 'timeout'
                } else {
                    $fcode = $fproc.ExitCode
                    $combined = "$fout`n$ferr"
                    if ($combined -match '(?i)usage limit|rate limit|quota|too many requests|429') {
                        $frontierState = 'provider_quota_blocked'
                    } elseif ($fcode -ne 0 -or -not $fout.Trim()) {
                        $frontierState = "cli_error_exit_$fcode"
                    } elseif (-not (Test-Redacted2 -Text $fout)) {
                        $frontierState = 'redaction_tripwire'
                    } else {
                        $frontierState = 'invoked'
                        $todayFrontier = $todayFrontier + 1
                        if (-not (Test-Path -LiteralPath $proposalDir)) { New-Item -ItemType Directory -Path $proposalDir -Force | Out-Null }
                        $fa = Join-Path $proposalDir "$today-frontier-synthesis.md"
                        $fb = New-Object System.Collections.Generic.List[string]
                        $fb.Add("# Claude frontier synthesis - $today")
                        $fb.Add('')
                        $fb.Add("Cycle: ``$cycleId``  Route: Opus via claude CLI  Ceiling: $MaxFrontierCallsPerDay/day")
                        $fb.Add('Status: PROPOSAL ONLY, unverified. Codex remains final verifier and canonical writer.')
                        $fb.Add('Packet was bounded and redacted: counts and finding titles only, no client content.')
                        $fb.Add('')
                        $fb.Add('## Synthesis')
                        $fb.Add('')
                        foreach ($line in ($fout.Trim() -split "`r?`n")) { $fb.Add($line) }
                        $fb.Add('')
                        $fb.Add('## Independent verification required before any downstream action')
                        $fb.Add('')
                        $fb.Add('- [ ] Codex confirms each claim against a live source')
                        $fb.Add('- [ ] No proposed step performs a Tier 2 action without exact approval')
                        [System.IO.File]::WriteAllText($fa, (($fb.ToArray() -join "`n") + "`n"), $utf8)
                        $frontierArtifact = "00_Inbox/Agent-Proposals/Claude/$today-frontier-synthesis.md"
                    }
                }
                $fproc.Dispose()
            } catch {
                $frontierState = 'invocation_failed'
            } finally {
                Remove-Item Env:\CLAUDE_FRONTIER_CHILD -ErrorAction SilentlyContinue
            }
        }
    }
    $frontierOk = @('invoked', 'ceiling_reached', 'skipped_no_work', 'disabled_by_flag') -contains $frontierState
    Add-Step 'frontier' $(if ($frontierOk) { 'ok' } else { 'blocked' }) `
        "state=$frontierState ceiling=$MaxFrontierCallsPerDay used=$todayFrontier artifact=$frontierArtifact"

    # ---------------------------------------------- 4. select + 6. execute
    $executedRows = @()
    $eligibleIds = @()
    $outcome = 'noop'
    if ($shouldWork) {
        $gate = & $loop -VaultRoot $resolvedVault -CanonicalRoot $CanonicalRoot -Json -NoEvidence | ConvertFrom-Json
        $eligible = @($gate.rows | Where-Object { $_.outcome -eq 'eligible_not_executed' })
        $eligibleIds = @($eligible | ForEach-Object { $_.routine_id })
        Add-Step 'select' 'ok' "gate-cleared eligible: $($eligible.Count) -> $($eligibleIds -join ' ')"

        # daily cadence first, then weekly, then monthly, then event
        $order = @{ 'daily' = 0; 'weekly-twice' = 1; 'weekly' = 2; 'monthly' = 3; 'event' = 4 }
        $picked = @($eligible | Sort-Object @{ e = { $order[$_.cadence] } }, routine_id | Select-Object -First $perCycle)
        Add-Step 'plan' 'ok' "selected $($picked.Count): $(($picked | ForEach-Object { $_.routine_id }) -join ' ')"

        $cycleClock = [System.Diagnostics.Stopwatch]::StartNew()
        foreach ($pick in $picked) {
            if ($cycleClock.Elapsed.TotalMinutes -ge $CycleWallClockBudgetMinutes) {
                Add-Step 'wall_clock_budget' 'blocked' `
                    ("stopped starting routines at {0}m of {1}m budget; scheduler limit is PT12M" -f [math]::Round($cycleClock.Elapsed.TotalMinutes, 1), $CycleWallClockBudgetMinutes)
                break
            }
            $r = & $loop -VaultRoot $resolvedVault -CanonicalRoot $CanonicalRoot `
                         -RoutineId $pick.routine_id -Execute -Json | ConvertFrom-Json
            $row = $r.rows[0]
            $executedRows += $row
            Add-Step "execute:$($pick.routine_id)" `
                $(if (@('complete', 'complete_degraded') -contains $row.outcome) { 'ok' } else { 'blocked' }) `
                "$($row.outcome) stages_ok=$(@($row.stages | Where-Object { $_.state -eq 'ok' }).Count)/9 independent_verified=$($row.independent_verification.verified)"
        }
        $good = @($executedRows | Where-Object { @('complete', 'complete_degraded') -contains $_.outcome }).Count
        $bad = $executedRows.Count - $good
        $outcome = if ($executedRows.Count -eq 0) { 'noop' } elseif ($bad -eq 0) { 'worked' } else { 'worked_with_failures' }
        $consecFail = if ($bad -gt 0) { $consecFail + 1 } else { 0 }
        $todayRoutines += $executedRows.Count
    } else {
        Add-Step 'select' 'ok' 'no work this cycle'
    }

    # ------------------------------------------------------- 7. evidence + state
    $breakerOpenedUtc = $null
    if ($prev -and $prev.breaker_opened_utc) { $breakerOpenedUtc = $prev.breaker_opened_utc }
    if ($consecFail -ge $BreakerThreshold -and -not $breakerOpenedUtc) { $breakerOpenedUtc = $nowUtc }
    if ($consecFail -eq 0) { $breakerOpenedUtc = $null }

    [System.IO.File]::WriteAllText($driverState, ([pscustomobject]@{
        cycle_id = $cycleId; last_cycle_utc = $nowUtc; signature = $sig.signature
        outcome = $outcome; consecutive_failures = $consecFail; breaker_opened_utc = $breakerOpenedUtc
        catch_up = $catchUp; routines_executed_this_cycle = $executedRows.Count
        eligible_at_cycle = $eligibleIds.Count
        canonical_write_attempted = $false; external_action_attempted = $false
    } | ConvertTo-Json -Depth 4), $utf8)

    [System.IO.File]::WriteAllText($usageLedger, ([pscustomobject]@{
        date = $today; cycles = ($todayCycles + 1); routines_executed = $todayRoutines
        frontier_calls = $todayFrontier
        limits = [pscustomobject]@{ max_routines_per_cycle = $MaxRoutinesPerCycle
                                    max_routines_per_day = $MaxRoutinesPerDay
                                    max_frontier_calls_per_day = $MaxFrontierCallsPerDay
                                    min_interval_minutes = $MinIntervalMinutes }
        frontier_state = $frontierState
        updated_utc = $nowUtc
    } | ConvertTo-Json -Depth 4), $utf8)

    $cycleLog = Join-Path $queueDir ('claude-daily-driver-' + $today + '.jsonl')
    [System.IO.File]::AppendAllText($cycleLog, (([pscustomobject]@{
        ts = $nowUtc; harness = 'claude-daily-driver'; cycle_id = $cycleId
        outcome = $outcome; signature = $sig.signature; catch_up = $catchUp
        eligible = $eligibleIds.Count; executed = $executedRows.Count
        consecutive_failures = $consecFail; frontier_state = $frontierState
        privacy = 'redacted'; canonical_write_attempted = $false; external_action_attempted = $false
    } | ConvertTo-Json -Depth 3 -Compress) + "`n"), $utf8)

    # approval package: only consequential next steps, never an action
    if (-not (Test-Path -LiteralPath $proposalDir)) { New-Item -ItemType Directory -Path $proposalDir -Force | Out-Null }
    $pkg = Join-Path $proposalDir "$today-daily-driver-approval-package.md"
    $body = New-Object System.Collections.Generic.List[string]
    $body.Add("# Claude daily-driver approval package - $today")
    $body.Add('')
    $body.Add("Cycle: ``$cycleId``  Outcome: **$outcome**  Catch-up: $catchUp")
    $body.Add('Status: PROPOSAL ONLY. Codex acting as Marketing Chief is the sole canonical writer.')
    $body.Add('Nothing was sent, posted, published, deployed, purchased, committed, or pushed.')
    $body.Add('')
    $body.Add('## This cycle')
    $body.Add('')
    foreach ($s in $log) { $body.Add("- ``$($s.step)`` **$($s.state)** - $($s.detail)") }
    if ($executedRows.Count -gt 0) {
        $body.Add('')
        $body.Add('## Routines executed')
        $body.Add('')
        foreach ($row in $executedRows) {
            $body.Add("### $($row.routine_id) - $($row.name)")
            $body.Add("- outcome: **$($row.outcome)**, independent verification: $($row.independent_verification.verified)")
            $body.Add("- route: $($row.route)")
            $body.Add("- freshness: $($row.receipt.sources_and_freshness)")
            $body.Add("- next safest action: $($row.receipt.next_safest_action)")
        }
    }
    $body.Add('')
    $body.Add('## Awaiting Dillon or Codex')
    $body.Add('')
    $body.Add('1. Browser evidence work stays disabled: canary is NOT-READY on P4/P9 (public tunnel endpoints).')
    $body.Add('2. Website deployment excluded from the daily loop; previews build and package evidence only.')
    $body.Add('3. Connector-backed routines (D17, D18, W06, E04) fail closed until a read-only probe exists.')
    $body.Add('4. Frontier synthesis is ledgered but disabled in v1; enable with -EnableFrontier when desired.')
    $body.Add('')
    $body.Add("Evidence: ``12_Brain/queue/claude-daily-driver-$today.jsonl``, ``12_Brain/state/claude-usage-ledger.json``")
    [System.IO.File]::WriteAllText($pkg, (($body -join "`n") + "`n"), $utf8)

    if ($Json) {
        [pscustomobject]@{
            harness = 'Invoke-ClaudeDailyDriver'; cycle_id = $cycleId; outcome = $outcome
            signature = $sig.signature; catch_up = $catchUp; breaker_open = $breakerOpen
            eligible = $eligibleIds.Count; executed = $executedRows.Count
            frontier_state = $frontierState; frontier_artifact = $frontierArtifact
            browser_state = $browserState; consecutive_failures = $consecFail
            canonical_write_attempted = $false; external_action_attempted = $false
            approval_package = "00_Inbox/Agent-Proposals/Claude/$today-daily-driver-approval-package.md"
            steps = $log.ToArray()
        } | ConvertTo-Json -Depth 6
    } else {
        Write-Host ''
        Write-Host ("Claude daily driver  {0}  outcome {1}" -f $cycleId, $outcome.ToUpperInvariant())
        Write-Host ('-' * 88)
        foreach ($s in $log) { Write-Host ("  [{0,-7}] {1,-22} {2}" -f $s.state, $s.step, $s.detail) }
        Write-Host ('-' * 88)
        Write-Host ("  approval package: 00_Inbox/Agent-Proposals/Claude/$today-daily-driver-approval-package.md")
        Write-Host ("  usage ledger    : 12_Brain/state/claude-usage-ledger.json")
        Write-Host '  sends 0  posts 0  publishes 0  spend 0  canonical writes 0'
        Write-Host ''
    }
} finally {
    if ($mutex) { if ($lease) { $mutex.ReleaseMutex() }; $mutex.Dispose() }
}
exit 0
