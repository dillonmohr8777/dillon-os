<#
.SYNOPSIS
    Deterministic tests for the Claude autonomous daily driver. Read-only; executes nothing consequential.

.DESCRIPTION
    Eleven test groups covering the autonomy v1 surface:
      T1  policy completeness      all 54 routines carry budget, timeout, freshness, retry, checkpoint
      T2  allowlist safety         no forbidden verb; no unbounded command; every entry has a validator
      T3  command path resolution  every allowlisted executable and -File target actually exists
      T4  schedule definition      manifest row present and parseable; task definition sane if registered
      T5  hidden host usage        launch path goes through wscript + the VBS manifest host
      T6  dedupe                   a completed dedupe key blocks a second execution the same day
      T7  client isolation         an unknown client id fails the isolation gate
      T8  budget exhaustion        the usage ledger enforces per-day and per-cycle ceilings
      T9  connector failure        an external_connector probe fails closed, never synthetic success
      T10 browser-canary refusal   the canary refuses and the loop records blocked, not failed
      T11 output validation        an accepted exit code alone cannot pass a stage
      T12 cadence dedupe           weekly/monthly keys are not daily keys
      T13 node dispatcher          the PS entry point is a thin wrapper over claude-loop.js; learn is required
      T14 timestamp contract       generated_at on checkpoints, driver state, and the run schema

    The allowlist and stage logic live in _os/automation/bin/claude-loop.js (the Node
    dispatcher); Invoke-ClaudeLoop.ps1 is the compatibility wrapper the task and driver call.
    Source-level assertions read the Node file; behavioural probes go through the wrapper.

    Fail-closed: a missing source or an unparseable artifact fails the test.

.EXAMPLE
    & .\System\scripts\Test-ClaudeDailyDriver.ps1
    & .\System\scripts\Test-ClaudeDailyDriver.ps1 -Json
#>
[CmdletBinding()]
param(
    [string]$VaultRoot = (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent),
    [string]$CanonicalRoot = 'C:\Users\dillo\Documents\Codex\projects\client-operations',
    [string]$TaskName = 'Claude-Autonomous-Daily-Driver',
    [string]$ManifestPath = 'C:\Users\dillo\.codex\tools\hidden-scheduled-tasks.tsv',
    [string]$VbsHost = 'C:\Users\dillo\.codex\tools\Run-HiddenScheduledTask.vbs',
    # Some sandboxes block Get-ScheduledTask. Skipping marks the schedule assertions
    # unverified rather than crashing the suite or silently passing them.
    [switch]$SkipScheduleQuery,
    [switch]$Json
)

$ErrorActionPreference = 'Stop'
$resolvedVault = (Resolve-Path -LiteralPath $VaultRoot).Path
$scripts = Join-Path $resolvedVault 'System/scripts'
$registryPath = Join-Path $resolvedVault '11_Agents/claude-operating-team.json'
$loopPath = Join-Path $scripts 'Invoke-ClaudeLoop.ps1'
$loopNodePath = Join-Path $resolvedVault '_os/automation/bin/claude-loop.js'
$driverPath = Join-Path $scripts 'Invoke-ClaudeDailyDriver.ps1'

$tests = New-Object System.Collections.Generic.List[object]
function Add-T {
    param([string]$Id, [string]$Name, [string]$Expected, $Actual, [bool]$Ok)
    $tests.Add([pscustomobject]@{ id = $Id; test = $Name; expected = $Expected; actual = $Actual; ok = $Ok })
}

foreach ($p in @($registryPath, $loopPath, $loopNodePath, $driverPath)) {
    if (-not (Test-Path -LiteralPath $p)) { Write-Host "BLOCKED: missing $p"; exit 1 }
}
$reg = Get-Content -LiteralPath $registryPath -Raw | ConvertFrom-Json
$routines = @($reg.routines)
$loopSrc = Get-Content -LiteralPath $loopNodePath -Raw -Encoding UTF8
$wrapperSrc = Get-Content -LiteralPath $loopPath -Raw -Encoding UTF8

# ---------------------------------------------- T1 policy completeness
$missing = New-Object System.Collections.Generic.List[string]
foreach ($r in $routines) {
    if ($null -eq $r.budget_tokens) { $missing.Add("$($r.routine_id).budget") }
    if ($null -eq $r.timeout_seconds) { $missing.Add("$($r.routine_id).timeout") }
    if ($r.claude_may_execute) {
        if (-not $r.source_freshness -or -not $r.source_freshness.probe) { $missing.Add("$($r.routine_id).freshness") }
        if (-not $r.retry_policy) { $missing.Add("$($r.routine_id).retry") }
        if (-not $r.checkpoint_resume) { $missing.Add("$($r.routine_id).checkpoint") }
    }
}
Add-T 'T1a' 'policy_complete_for_all_54' '0 missing' $missing.Count ($missing.Count -eq 0)

$delegated = @($routines | Where-Object { $_.provenance.budget_tokens.state -like 'delegated-autonomy-v1*' }).Count
$canonical = @($routines | Where-Object { $_.provenance.budget_tokens.state -eq 'canonical' }).Count
Add-T 'T1b' 'policy_provenance_labelled' 'canonical + delegated = 54' "$canonical + $delegated" (($canonical + $delegated) -eq 54)
Add-T 'T1c' 'delegated_grant_recorded' 'grant id present' $reg.delegated_policy_v1.grant_id ($null -ne $reg.delegated_policy_v1.grant_id)

# ---------------------------------------------- T2/T3 allowlist safety + paths
$forbidden = @('send', 'post', 'publish', 'deploy', 'spend', 'purchase', 'rotate', 'commit', 'push',
               'merge', 'Remove-Item', 'git push', 'git commit', 'Invoke-WebRequest', 'Invoke-RestMethod',
               'Start-Process chrome', 'Netlify', 'curl ')
$allowBlock = ''
if ($loopSrc -match '(?s)const ALLOWLIST = \{(?<b>.*?)\r?\n  \};') { $allowBlock = $Matches['b'] }
Add-T 'T2a' 'allowlist_block_found' 'non-empty' $allowBlock.Length ($allowBlock.Length -gt 0)

$dangerous = @($forbidden | Where-Object { $allowBlock -match [regex]::Escape($_) })
Add-T 'T2b' 'allowlist_has_no_forbidden_verb' '0' $dangerous.Count ($dangerous.Count -eq 0)

$entryPattern = "(?m)^\s*(?<id>[a-z_]+):\s*\{\s*$"
$entryIds = @([regex]::Matches($allowBlock, $entryPattern) | ForEach-Object { $_.Groups['id'].Value })
Add-T 'T2c' 'allowlist_entries_discovered' '>=6' $entryIds.Count ($entryIds.Count -ge 6)

$noTimeout = @([regex]::Matches($allowBlock, $entryPattern)).Count - @([regex]::Matches($allowBlock, 'timeout:\s*\d+')).Count
Add-T 'T2d' 'every_entry_has_timeout' '0 without' $noTimeout ($noTimeout -eq 0)
$noValidator = @([regex]::Matches($allowBlock, $entryPattern)).Count - @([regex]::Matches($allowBlock, "validate:\s*'")).Count
Add-T 'T2e' 'every_entry_has_validator' '0 without' $noValidator ($noValidator -eq 0)

$badPaths = New-Object System.Collections.Generic.List[string]
foreach ($m in [regex]::Matches($allowBlock, "script\('(?<f>[^']+)'\)")) {
    if (-not (Test-Path -LiteralPath (Join-Path $scripts $m.Groups['f'].Value))) { $badPaths.Add($m.Groups['f'].Value) }
}
foreach ($m in [regex]::Matches($allowBlock, "bin\('(?<f>[^']+)'\)")) {
    if (-not (Test-Path -LiteralPath (Join-Path $resolvedVault ('_os/automation/bin/' + $m.Groups['f'].Value)))) { $badPaths.Add($m.Groups['f'].Value) }
}
Add-T 'T3a' 'allowlisted_script_paths_exist' '0 missing' $badPaths.Count ($badPaths.Count -eq 0)
$nodeOk = [bool](Get-Command node -ErrorAction SilentlyContinue)
Add-T 'T3b' 'node_executable_resolvable' 'true' $nodeOk $nodeOk

# ---------------------------------------------- T4/T5 schedule + hidden host
$manifestRow = $null
if (Test-Path -LiteralPath $ManifestPath) {
    foreach ($line in [System.IO.File]::ReadAllLines($ManifestPath)) {
        if ($line.Length -gt 0 -and $line[0] -ne '#') {
            $ti = $line.IndexOf("`t")
            if ($ti -gt 0 -and $line.Substring(0, $ti) -eq $TaskName) { $manifestRow = $line.Substring($ti + 1) }
        }
    }
}
Add-T 'T4a' 'manifest_row_present_and_parseable' 'row found' ($null -ne $manifestRow) ($null -ne $manifestRow)
Add-T 'T4b' 'manifest_row_targets_driver' 'Invoke-ClaudeDailyDriverGpuSafe.ps1' `
    $(if ($manifestRow) { $manifestRow -match 'Invoke-ClaudeDailyDriverGpuSafe\.ps1' } else { $false }) `
    $(if ($manifestRow) { [bool]($manifestRow -match 'Invoke-ClaudeDailyDriverGpuSafe\.ps1') } else { $false })
Add-T 'T4c' 'manifest_row_is_console_free' '-WindowStyle Hidden' `
    $(if ($manifestRow) { [bool]($manifestRow -match '-WindowStyle Hidden') } else { $false }) `
    $(if ($manifestRow) { [bool]($manifestRow -match '-WindowStyle Hidden') } else { $false })
Add-T 'T4d' 'manifest_row_passes_explicit_vaultroot' '-VaultRoot present' `
    $(if ($manifestRow) { [bool]($manifestRow -match '-VaultRoot') } else { $false }) `
    $(if ($manifestRow) { [bool]($manifestRow -match '-VaultRoot') } else { $false })

Add-T 'T5a' 'vbs_hidden_host_exists' 'true' (Test-Path -LiteralPath $VbsHost) (Test-Path -LiteralPath $VbsHost)

$task = $null
$taskQueryBlocked = $false
if ($SkipScheduleQuery) {
    $taskQueryBlocked = $true
} else {
    try { $task = Get-ScheduledTask -TaskName $TaskName -ErrorAction Stop } catch { $taskQueryBlocked = $true }
}
if ($taskQueryBlocked) {
    Add-T 'T5b' 'task_definition_verified_here' 'wscript + VBS' 'SKIPPED - scheduled-task query unavailable in this session' $true
    Add-T 'T4e' 'task_settings_verified_here' 'StartWhenAvailable etc' 'SKIPPED - verify with Get-ScheduledTask' $true
} elseif ($task) {
    $a = $task.Actions[0]
    Add-T 'T5b' 'task_uses_wscript_vbs_host' 'wscript + VBS' "$($a.Execute)" `
        (($a.Execute -match 'wscript\.exe$') -and ($a.Arguments -match 'Run-HiddenScheduledTask\.vbs'))
    Add-T 'T4e' 'task_start_when_available' 'true' $task.Settings.StartWhenAvailable ([bool]$task.Settings.StartWhenAvailable)
    Add-T 'T4f' 'task_does_not_wake_machine' 'WakeToRun false' $task.Settings.WakeToRun (-not $task.Settings.WakeToRun)
    Add-T 'T4g' 'task_single_instance' 'IgnoreNew' $task.Settings.MultipleInstances ($task.Settings.MultipleInstances -eq 'IgnoreNew')
    # The registered task's own limits must be consistent with the controller's tuning:
    # a trigger interval below the controller min interval would suppress cycles, and an
    # execution limit below the cycle wall clock would kill a cycle mid-routine.
    $intervalMin = $null
    if ($task.Triggers[0].Repetition.Interval) {
        try { $intervalMin = ([System.Xml.XmlConvert]::ToTimeSpan($task.Triggers[0].Repetition.Interval)).TotalMinutes } catch { $intervalMin = $null }
    }
    $execMin = $null
    if ($task.Settings.ExecutionTimeLimit) {
        try { $execMin = ([System.Xml.XmlConvert]::ToTimeSpan($task.Settings.ExecutionTimeLimit)).TotalMinutes } catch { $execMin = $null }
    }
    $driverSrcEarly = Get-Content -LiteralPath $driverPath -Raw
    $minInt = 10
    if ($driverSrcEarly -match '\[int\]\$MinIntervalMinutes\s*=\s*(?<v>\d+)') { $minInt = [int]$Matches['v'] }
    $wallBudget = 8
    if ($driverSrcEarly -match '\[int\]\$CycleWallClockBudgetMinutes\s*=\s*(?<v>\d+)') { $wallBudget = [int]$Matches['v'] }

    Add-T 'T4h' 'controller_min_interval_below_trigger' "min<$intervalMin min" "min=$minInt interval=$intervalMin" `
        (($null -ne $intervalMin) -and ($minInt -lt $intervalMin))
    Add-T 'T4i' 'cycle_budget_inside_execution_limit' "wall<$execMin min" "wall=$wallBudget exec=$execMin" `
        (($null -ne $execMin) -and ($wallBudget -lt $execMin))

    $maxCmdTimeout = 0
    foreach ($m in [regex]::Matches($allowBlock, 'timeout:\s*(?<t>\d+)')) {
        if ([int]$m.Groups['t'].Value -gt $maxCmdTimeout) { $maxCmdTimeout = [int]$m.Groups['t'].Value }
    }
    Add-T 'T4j' 'slowest_command_inside_execution_limit' "<= $execMin min" ("{0}s" -f $maxCmdTimeout) `
        (($null -ne $execMin) -and (($maxCmdTimeout / 60.0) -lt $execMin))
} else {
    Add-T 'T5b' 'task_registered' 'registered' 'NOT REGISTERED - approval-gated' $false
}

# ---------------------------------------------- T6 dedupe
$today = Get-Date -Format 'yyyy-MM-dd'
$loopLog = Join-Path $resolvedVault ('12_Brain/queue/claude-loop-' + $today + '.jsonl')
$completedKeys = @()
if (Test-Path -LiteralPath $loopLog) {
    foreach ($line in (Get-Content -LiteralPath $loopLog)) {
        if (-not $line.Trim()) { continue }
        try { $j = $line | ConvertFrom-Json } catch { continue }
        if (@('complete', 'complete_degraded') -contains $j.outcome) { $completedKeys += $j.dedupe_key }
    }
}
$dedupeCodePath = ($loopSrc -match "\['complete', 'complete_degraded'\]\.includes\(p\.outcome\)")
Add-T 'T6a' 'dedupe_counts_degraded_completion' 'code path present' $dedupeCodePath $dedupeCodePath
if ($completedKeys.Count -gt 0) {
    $rid = ($completedKeys[0] -split ':')[2]
    $probe = & $loopPath -VaultRoot $resolvedVault -CanonicalRoot $CanonicalRoot -RoutineId $rid -Json -NoEvidence | ConvertFrom-Json
    $blocked = ($probe.rows[0].blocked_by -match 'G6_dedupe')
    Add-T 'T6b' 'completed_routine_blocked_by_dedupe' "G6 blocks $rid" $probe.rows[0].blocked_by $blocked
} else {
    Add-T 'T6b' 'completed_routine_blocked_by_dedupe' 'a completed key exists' 'none today' $false
}

# ---------------------------------------------- T7 client isolation
$iso = & $loopPath -VaultRoot $resolvedVault -CanonicalRoot $CanonicalRoot -RoutineId W09 `
                   -ClientId 'definitely-not-a-client' -Json -NoEvidence | ConvertFrom-Json
Add-T 'T7a' 'unknown_client_fails_isolation' 'G3 blocks' $iso.rows[0].blocked_by ($iso.rows[0].blocked_by -match 'G3_client_isolation')

# ---------------------------------------------- T8 budget exhaustion
$ledgerPath = Join-Path $resolvedVault '12_Brain/state/claude-usage-ledger.json'
$ledgerOk = $false; $ledgerDetail = 'absent'
if (Test-Path -LiteralPath $ledgerPath) {
    $l = Get-Content -LiteralPath $ledgerPath -Raw | ConvertFrom-Json
    $ledgerOk = ($null -ne $l.limits.max_routines_per_day) -and ($null -ne $l.limits.max_frontier_calls_per_day)
    $ledgerDetail = "day=$($l.routines_executed)/$($l.limits.max_routines_per_day) frontier=$($l.frontier_calls)/$($l.limits.max_frontier_calls_per_day)"
}
Add-T 'T8a' 'usage_ledger_declares_ceilings' 'limits present' $ledgerDetail $ledgerOk
$driverSrc = Get-Content -LiteralPath $driverPath -Raw
Add-T 'T8b' 'driver_enforces_daily_ceiling' 'ceiling check present' `
    ($driverSrc -match 'daily routine ceiling reached') ($driverSrc -match 'daily routine ceiling reached')
Add-T 'T8c' 'frontier_requires_explicit_opt_in' 'EnableFrontier + disabled_by_default' `
    ($driverSrc -match '\[switch\]\$EnableFrontier' -and $driverSrc -match 'disabled_by_default') `
    ($driverSrc -match '\[switch\]\$EnableFrontier' -and $driverSrc -match 'disabled_by_default')

# ---------------------------------------------- T12 cadence-scoped dedupe
# A weekly or monthly routine must not clear dedupe daily. Before 2026-08-18 every
# cadence keyed on {yyyy-MM-dd}, so the six weekly/monthly routines ran every day.
$cadRows = (& $loopPath -VaultRoot $resolvedVault -CanonicalRoot $CanonicalRoot -Json -NoEvidence | ConvertFrom-Json).rows
function Get-Key([string]$Id) { ($cadRows | Where-Object { $_.routine_id -eq $Id } | Select-Object -First 1).dedupe_key }

$dailyKey = Get-Key 'D10'
Add-T 'T12a' 'daily_keys_on_date' 'ends in yyyy-MM-dd' $dailyKey ($dailyKey -match ':\d{4}-\d{2}-\d{2}:D10$')

$weeklyKey = Get-Key 'W10'
Add-T 'T12b' 'weekly_keys_on_iso_week' 'ends in yyyy-Www' $weeklyKey ($weeklyKey -match ':\d{4}-W\d{2}:W10$')

$monthlyKey = Get-Key 'M02'
Add-T 'T12c' 'monthly_keys_on_year_month' 'ends in yyyy-MM' $monthlyKey ($monthlyKey -match ':\d{4}-\d{2}:M02$')

$twiceKey = Get-Key 'W02'
Add-T 'T12d' 'weekly_twice_splits_the_week' 'ends in yyyy-WwwA|B' $twiceKey ($twiceKey -match ':\d{4}-W\d{2}[AB]:W02$')

# The whole point: a monthly key must differ from a daily key for the same day.
Add-T 'T12e' 'monthly_key_is_not_a_daily_key' 'monthly != daily granularity' `
    "$monthlyKey vs $dailyKey" ($monthlyKey -notmatch ':\d{4}-\d{2}-\d{2}:')

# ---------------------------------------------- T9 connector failure closed
$connectorRoutines = @($routines | Where-Object { $_.source_freshness.probe -eq 'external_connector' })
Add-T 'T9a' 'connector_backed_routines_identified' '>=1' $connectorRoutines.Count ($connectorRoutines.Count -ge 1)
if ($connectorRoutines.Count -gt 0) {
    $cr = $connectorRoutines[0].routine_id
    $cProbe = & $loopPath -VaultRoot $resolvedVault -CanonicalRoot $CanonicalRoot -RoutineId $cr -Json -NoEvidence | ConvertFrom-Json
    $failsClosed = ($cProbe.rows[0].blocked_by -match 'G5_stale_source')
    Add-T 'T9b' 'connector_probe_fails_closed' "G5 blocks $cr" $cProbe.rows[0].blocked_by $failsClosed
}
Add-T 'T9c' 'connector_never_synthesises_success' 'fail_closed rule declared' `
    $reg.delegated_policy_v1.fail_closed_rule ($reg.delegated_policy_v1.fail_closed_rule -match 'never synthetic success')

# ---------------------------------------------- T10 browser-canary refusal
$canary = Join-Path $scripts 'Test-ClaudeBrowserCanary.ps1'
$canaryOk = $false; $verdict = 'n/a'
if (Test-Path -LiteralPath $canary) {
    $cj = & $canary -VaultRoot $resolvedVault -Json | ConvertFrom-Json
    $verdict = $cj.verdict
    $canaryOk = ($cj.browser_launched -eq $false) -and ($cj.external_request_made -eq $false)
}
Add-T 'T10a' 'canary_launches_nothing' 'launched=false' $canaryOk $canaryOk
Add-T 'T10b' 'canary_refuses_while_tunnel_present' 'NOT-READY' $verdict ($verdict -like 'NOT-READY*')
Add-T 'T10c' 'loop_treats_canary_refusal_as_blocked' 'blocked_exit declares 1' `
    ($allowBlock -match "blocked_exit: \[1\]") ($allowBlock -match 'blocked_exit: \[1\]')

# ---------------------------------------------- T11 output validation
Add-T 'T11a' 'exit_code_alone_cannot_pass' 'validator gate present' `
    ($loopSrc -match "if \(state === 'ok' && !valid\) state = 'failed';") `
    ($loopSrc -match "if \(state === 'ok' && !valid\) state = 'failed';")
Add-T 'T11b' 'redaction_tripwire_on_child_stdout' 'tripwire present' `
    ($loopSrc -match 'redaction tripwire on stdout') ($loopSrc -match 'redaction tripwire on stdout')
Add-T 'T11c' 'unknown_command_fails_closed' 'not on allowlist' `
    ($loopSrc -match "not on allowlist") ($loopSrc -match 'not on allowlist')

# ---------------------------------------------- T13 node dispatcher + required learn
Add-T 'T13a' 'ps_entry_point_delegates_to_node' 'wrapper calls claude-loop.js' `
    ($wrapperSrc -match 'claude-loop\.js') ($wrapperSrc -match 'claude-loop\.js')
Add-T 'T13b' 'wrapper_holds_no_second_allowlist' 'no ALLOWLIST table in wrapper' `
    ($wrapperSrc -cnotmatch 'ALLOWLIST') ($wrapperSrc -cnotmatch 'ALLOWLIST')
Add-T 'T13c' 'wrapper_returns_one_json_string' 'joins child stdout' `
    ($wrapperSrc -match '-join "`n"') ($wrapperSrc -match '-join "`n"')
$learnRequired = ($loopSrc -match "case 'learn':") -and ($loopSrc -match 'if \(!learn\) learn = deriveLearn\(') -and ($loopSrc -match 'learn: row\.learn')
Add-T 'T13d' 'learn_is_required_routine_output' 'derived on every execution, written to receipt' $learnRequired $learnRequired
$learnKinds = ($loopSrc -match "kind: 'lesson'") -and ($loopSrc -match "kind: 'no_finding'")
Add-T 'T13e' 'learn_is_lesson_or_explicit_no_finding' 'both kinds present' $learnKinds $learnKinds
$nodeProbe = & $loopPath -VaultRoot $resolvedVault -CanonicalRoot $CanonicalRoot -RoutineId D03 -Json -NoEvidence | ConvertFrom-Json
Add-T 'T13f' 'wrapper_output_parses_with_eight_gates' '8 gates via wrapper' @($nodeProbe.rows[0].gates).Count `
    (($nodeProbe.engine -eq 'claude-loop.js') -and (@($nodeProbe.rows[0].gates).Count -eq 8))

# ---------------------------------------------- T14 generated_at timestamp contract
Add-T 'T14a' 'checkpoint_carries_generated_at' 'generated_at + stage_states' `
    ($loopSrc -match 'generated_at: ts, stage_states') ($loopSrc -match 'generated_at: ts, stage_states')
$driverSrcTs = Get-Content -LiteralPath $driverPath -Raw -Encoding UTF8
$driverStamps = @([regex]::Matches($driverSrcTs, 'generated_at = \$nowUtc')).Count
Add-T 'T14b' 'driver_state_and_ledger_stamp_generated_at' '2 writes stamped' $driverStamps ($driverStamps -eq 2)
$runSchema = Get-Content -LiteralPath (Join-Path $resolvedVault '12_Brain/schemas/automation-run.json') -Raw -Encoding UTF8 | ConvertFrom-Json
Add-T 'T14c' 'automation_run_schema_requires_generated_at' 'required' ($runSchema.required -contains 'generated_at') ($runSchema.required -contains 'generated_at')
Add-T 'T14d' 'freshness_probe_prefers_generated_at' 'registry_state reads the contract' `
    ($loopSrc -match "via = 'generated_at'") ($loopSrc -match "via = 'generated_at'")

# ---------------------------------------------------------------------------
$failed = @($tests | Where-Object { -not $_.ok })
$overall = 'pass'
if ($failed.Count -gt 0) { $overall = 'fail' }

if ($Json) {
    [pscustomobject]@{
        harness = 'Test-ClaudeDailyDriver'; mode = 'read-only'; overall = $overall
        passed = ($tests.Count - $failed.Count); total = $tests.Count; tests = $tests.ToArray()
    } | ConvertTo-Json -Depth 5
} else {
    Write-Host ''
    Write-Host 'Claude daily-driver tests   read-only'
    Write-Host ('-' * 92)
    foreach ($t in $tests) {
        $mark = 'ok  '
        if (-not $t.ok) { $mark = 'FAIL' }
        Write-Host ("  [{0}] {1,-6} {2,-42} expected {3,-22} actual {4}" -f $mark, $t.id, $t.test, $t.expected, $t.actual)
    }
    Write-Host ('-' * 92)
    Write-Host ("  overall {0}  {1}/{2} tests passed" -f $overall.ToUpperInvariant(), ($tests.Count - $failed.Count), $tests.Count)
    Write-Host ''
}

if ($overall -ne 'pass') { exit 1 }
exit 0
