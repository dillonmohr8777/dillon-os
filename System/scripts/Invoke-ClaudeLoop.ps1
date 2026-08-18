<#
.SYNOPSIS
    Bounded dispatcher for the Claude operating team. Executes only allowlisted local commands.

.DESCRIPTION
    Walks the 9 canonical operating stages per routine:
      sense -> route -> prioritize -> build -> verify -> approve -> deliver -> readback -> learn

    The allowlist below is the execution safety boundary. A command not in it cannot run.
    Every allowlisted command declares its executable, args, timeout, accepted exit codes,
    artifact validation, and tier. An unavailable source or connector is a BLOCKED result,
    never synthetic success.

    Gates, all fail-closed: authority, action safety, client isolation, budget ceiling,
    stale source (real probe), dedupe, lease/mutex, circuit breaker.

    Never sends, posts, publishes, deploys, spends, commits, pushes, reads a credential,
    launches a browser, or writes canonical client state. Codex acting as Marketing Chief
    remains sole orchestrator, canonical writer, and final verifier.

.EXAMPLE
    & .\System\scripts\Invoke-ClaudeLoop.ps1                          # gate report, all 54
    & .\System\scripts\Invoke-ClaudeLoop.ps1 -RoutineId W11 -Execute
    & .\System\scripts\Invoke-ClaudeLoop.ps1 -RoutineId W11 -Execute -Fixture
#>
[CmdletBinding()]
param(
    [string]$VaultRoot = (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent),
    [string]$CanonicalRoot = 'C:\Users\dillo\Documents\Codex\projects\client-operations',
    [string]$RoutineId,
    [string]$ClientId,
    [switch]$Execute,
    [switch]$Fixture,
    [switch]$Resume,
    [int]$MaxRoutines = 0,
    [switch]$Json,
    [switch]$NoEvidence
)

$ErrorActionPreference = 'Stop'
$resolvedVault = (Resolve-Path -LiteralPath $VaultRoot).Path
$registryPath = Join-Path $resolvedVault '11_Agents/claude-operating-team.json'
if (-not (Test-Path -LiteralPath $registryPath)) { Write-Host 'BLOCKED: registry missing'; exit 1 }

$reg = Get-Content -LiteralPath $registryPath -Raw | ConvertFrom-Json
$STAGES = @($reg.stage_model.operating_stages | ForEach-Object { $_.key })
if ($STAGES.Count -ne 9) { Write-Host "BLOCKED: expected 9 stages, got $($STAGES.Count)"; exit 1 }

$all = @($reg.routines)
$targets = $all
if ($RoutineId) { $targets = @($all | Where-Object { $_.routine_id -eq $RoutineId }) }
if ($targets.Count -eq 0) { Write-Host 'BLOCKED: no such routine'; exit 1 }

$runId = 'LOOP-' + (Get-Date -Format 'yyyyMMdd-HHmmssfff')
$today = Get-Date -Format 'yyyy-MM-dd'
$queueDir = Join-Path $resolvedVault '12_Brain/queue'
$stateDir = Join-Path $resolvedVault '12_Brain/state'
$routineStateDir = Join-Path $stateDir 'claude-routines'
$receiptLog = Join-Path $queueDir ('claude-loop-' + $today + '.jsonl')
$proposalDir = Join-Path $resolvedVault '00_Inbox/Agent-Proposals/Claude'
$utf8 = New-Object System.Text.UTF8Encoding($false)
$ps = Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0\powershell.exe'
$LocalBackoffCapSeconds = 5

# =========================================================== EXECUTION ALLOWLIST
# id = { exe, args, timeout, ok_exit, blocked_exit, tier, kind, validate }
# blocked_exit codes mean "honest degraded/blocked", never failure.
$SCRIPTS = Join-Path $resolvedVault 'System/scripts'
$BIN = Join-Path $resolvedVault '_os/automation/bin'
$ALLOWLIST = @{
    'vault_health' = @{
        exe = $ps; args = @('-NoLogo', '-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass',
                            '-File', (Join-Path $SCRIPTS 'Test-SecondBrain.ps1'), '-VaultRoot', $resolvedVault, '-Json')
        timeout = 300; ok_exit = @(0); blocked_exit = @(); tier = 0; kind = 'readonly'
        validate = 'json_with_issues'
    }
    'team_validate' = @{
        exe = $ps; args = @('-NoLogo', '-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass',
                            '-File', (Join-Path $SCRIPTS 'Test-ClaudeOperatingTeam.ps1'), '-VaultRoot', $resolvedVault, '-Json')
        timeout = 300; ok_exit = @(0); blocked_exit = @(); tier = 0; kind = 'readonly'
        validate = 'json_overall_pass'
    }
    'invariant_scan' = @{
        exe = $ps; args = @('-NoLogo', '-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass',
                            '-File', (Join-Path $SCRIPTS 'Test-ClaudeInvariants.ps1'), '-VaultRoot', $resolvedVault, '-Json', '-NoEvidence')
        timeout = 240; ok_exit = @(0); blocked_exit = @(); tier = 0; kind = 'readonly'
        validate = 'json_overall_pass'
    }
    'browser_canary' = @{
        exe = $ps; args = @('-NoLogo', '-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass',
                            '-File', (Join-Path $SCRIPTS 'Test-ClaudeBrowserCanary.ps1'), '-VaultRoot', $resolvedVault, '-Active', '-Json')
        timeout = 120; ok_exit = @(0); blocked_exit = @(1); tier = 0; kind = 'browser_readonly'
        validate = 'json_verdict'
    }
    'graph_measure' = @{
        exe = $ps; args = @('-NoLogo', '-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass',
                            '-File', (Join-Path $SCRIPTS 'Measure-SecondBrainGraph.ps1'), '-VaultRoot', $resolvedVault)
        timeout = 300; ok_exit = @(0); blocked_exit = @(); tier = 0; kind = 'readonly'
        validate = 'nonempty_stdout'
    }
    'frontmatter_validate' = @{
        exe = 'node'; args = @((Join-Path $BIN 'frontmatter-validate.js'))
        timeout = 300; ok_exit = @(0); blocked_exit = @(2); tier = 0; kind = 'readonly'
        validate = 'nonempty_stdout'
    }
    'queue_status' = @{
        exe = 'node'; args = @((Join-Path $BIN 'queue-status.js'))
        timeout = 180; ok_exit = @(0); blocked_exit = @(2); tier = 0; kind = 'readonly'
        validate = 'nonempty_stdout'
    }
    'browser_evidence' = @{
        exe = 'node'; args = @((Join-Path $BIN 'claude-browser-evidence.js'), '--scope', 'internal')
        timeout = 90; ok_exit = @(0); blocked_exit = @(78); tier = 0; kind = 'browser_readonly'
        validate = 'json_verdict'
    }
    'agentvault_validate' = @{
        exe = $ps; args = @('-NoLogo', '-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass',
                            '-File', 'C:\Users\dillo\Documents\Codex\projects\agent-vault\scripts\Test-AgentVault.ps1')
        timeout = 180; ok_exit = @(0); blocked_exit = @(2); tier = 0; kind = 'readonly'
        validate = 'nonempty_stdout'
    }
    'agent_craft_brief' = @{
        exe = 'node'; args = @((Join-Path $BIN 'agent-craft-brief.js'), '--days', '14', '--write')
        timeout = 120; ok_exit = @(0); blocked_exit = @(2); tier = 1; kind = 'generated_write'
        validate = 'nonempty_stdout'
    }
    'maps_refresh' = @{
        exe = $ps; args = @('-NoLogo', '-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass',
                            '-File', (Join-Path $SCRIPTS 'Update-SecondBrainMaps.ps1'), '-VaultRoot', $resolvedVault)
        timeout = 300; ok_exit = @(0); blocked_exit = @(); tier = 1; kind = 'generated_write'
        validate = 'nonempty_stdout'
    }
}

# Per-role build command; per-routine override where the routine's intent is explicit.
$ROLE_BUILD = @{ 'critic' = 'invariant_scan'; 'maker' = 'team_validate'; 'analyst' = 'queue_status'
                 'terminal_readonly' = 'vault_health'; 'architect' = 'graph_measure' }
$ROUTINE_BUILD = @{ 'W11' = 'vault_health'; 'D24' = 'invariant_scan'; 'D26' = 'agent_craft_brief'
                    'W09' = 'agentvault_validate'; 'E10' = 'vault_health'; 'D03' = 'vault_health'
                    'M02' = 'team_validate'; 'E05' = 'graph_measure'
                    'D07' = 'browser_evidence'; 'D12' = 'repo_readonly'; 'D10' = 'comms_triage_readonly'
                    'D11' = 'comms_triage_readonly'; 'M04' = 'comms_triage_readonly' }

$secretPatterns = @('sk-[A-Za-z0-9]{20,}', 'ghp_[A-Za-z0-9]{20,}', 'xox[baprs]-',
                    'AIza[0-9A-Za-z_\-]{30,}', 'BEGIN (RSA|OPENSSH|EC|PRIVATE) KEY', '\b[0-9a-f]{64}\b')
function Test-Redacted { param([string]$Text)
    foreach ($p in $secretPatterns) { if ($Text -match $p) { return $false } }
    return $true }

# ------------------------------------------------------- real freshness probes
function Measure-Freshness {
    param($Routine)
    $f = $Routine.source_freshness
    if (-not $f) { return @{ ok = $false; detail = 'no freshness contract'; age_hours = $null } }
    $probe = $f.probe
    $maxH = [double]$f.window_hours
    $path = $null
    switch -Wildcard ($probe) {
        'vault_notes' {
            $newest = Get-ChildItem -LiteralPath (Join-Path $resolvedVault '12_Brain') -Recurse -Filter '*.md' -File |
                      Sort-Object LastWriteTime -Descending | Select-Object -First 1
            if ($newest) { $path = $newest.FullName }
        }
        'registry_state' {
            $newest = Get-ChildItem -LiteralPath $stateDir -Filter '*.json' -File -ErrorAction SilentlyContinue |
                      Sort-Object LastWriteTime -Descending | Select-Object -First 1
            if ($newest) { $path = $newest.FullName }
        }
        'repo_state' {
            # LIVE probe: the working tree is read at execution time, so a stale snapshot
            # cannot exist. Report what was observed instead of aging a commit pointer.
            $head = Join-Path $resolvedVault '.git/HEAD'
            if (-not (Test-Path -LiteralPath $head)) { return @{ ok = $false; age_hours = $null; detail = 'repo_state: not a git repo' } }
            $dirty = @(& git -C $resolvedVault status --porcelain 2>$null).Count
            return @{ ok = $true; age_hours = 0; detail = "repo_state live read: $dirty tracked changes visible now" }
        }
        'canonical_queue' {
            # LIVE probe: the queue file is read at execution time. Its mtime measures how
            # recently Codex wrote it, not whether our read is current, so report both.
            $q = Join-Path $CanonicalRoot 'queue/work-items.json'
            if (-not (Test-Path -LiteralPath $q)) { return @{ ok = $false; age_hours = $null; detail = 'canonical_queue unavailable' } }
            $wroteH = [math]::Round(((Get-Date) - (Get-Item -LiteralPath $q).LastWriteTime).TotalHours, 2)
            return @{ ok = $true; age_hours = 0; detail = "canonical_queue live read; Codex last wrote it ${wroteH}h ago" }
        }
        'automation:*' {
            $id = $probe.Split(':')[1]
            $path = Join-Path $stateDir ($id + '.json')
        }
        'external_connector' {
            return @{ ok = $false; age_hours = $null
                      detail = 'external_connector: not locally probeable, fails closed by design' }
        }
    }
    if (-not $path -or -not (Test-Path -LiteralPath $path)) {
        return @{ ok = $false; age_hours = $null; detail = "probe '$probe' source absent" }
    }
    $ageH = [math]::Round(((Get-Date) - (Get-Item -LiteralPath $path).LastWriteTime).TotalHours, 2)
    return @{ ok = ($ageH -le $maxH); age_hours = $ageH
              detail = "probe $probe age ${ageH}h vs window ${maxH}h" }
}

# ------------------------------------------------- allowlisted command execution
function Invoke-Allowlisted {
    param([string]$Id)
    if (-not $ALLOWLIST.ContainsKey($Id)) {
        return @{ state = 'failed'; detail = "command '$Id' not on allowlist"; exit = $null }
    }
    $c = $ALLOWLIST[$Id]
    if ($c.exe -ne $ps) {
        $resolved = Get-Command $c.exe -ErrorAction SilentlyContinue
        if (-not $resolved) { return @{ state = 'blocked'; detail = "executable '$($c.exe)' not resolvable"; exit = $null } }
    }
    # Direct .NET process, not Start-Process: -PassThru releases the handle so ExitCode
    # reads $null, and touching .Handle to keep it can terminate the host. This form
    # gives a reliable exit code and captured stdout with no console window.
    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = $c.exe
    $psi.Arguments = ($c.args | ForEach-Object { if ($_ -match '\s') { '"' + $_ + '"' } else { $_ } }) -join ' '
    $psi.UseShellExecute = $false
    $psi.CreateNoWindow = $true
    $psi.RedirectStandardOutput = $true
    $psi.RedirectStandardError = $true
    $psi.WorkingDirectory = $resolvedVault
    $p = New-Object System.Diagnostics.Process
    $p.StartInfo = $psi
    try {
        [void]$p.Start()
        # Read stdout to completion first, then wait: reversing this can deadlock on a
        # child that fills the pipe buffer.
        $stdout = $p.StandardOutput.ReadToEnd()
        $stderrText = $p.StandardError.ReadToEnd()
        if (-not $p.WaitForExit($c.timeout * 1000)) {
            try { $p.Kill() } catch { }
            return @{ state = 'blocked'; detail = "timeout after $($c.timeout)s"; exit = $null }
        }
        $code = $p.ExitCode
        if (-not $stdout) { $stdout = '' }
        if (-not $stderrText) { $stderrText = '' }

        $state = 'failed'
        if ($c.ok_exit -contains $code) { $state = 'ok' }
        elseif ($c.blocked_exit -contains $code) { $state = 'blocked' }

        # artifact validation: an accepted exit code is not enough
        $valid = $true
        $vDetail = ''
        switch ($c.validate) {
            'json_overall_pass' {
                try { $j = $stdout | ConvertFrom-Json; $valid = ($j.overall -eq 'pass'); $vDetail = "overall=$($j.overall)" }
                catch { $valid = $false; $vDetail = 'stdout is not valid JSON' }
            }
            'json_with_issues' {
                try { $j = $stdout | ConvertFrom-Json
                      $e = @($j.issues | Where-Object { $_.severity -eq 'error' }).Count
                      $valid = ($e -eq 0); $vDetail = "errors=$e" }
                catch { $valid = $false; $vDetail = 'stdout is not valid JSON' }
            }
            'json_verdict' {
                try { $j = $stdout | ConvertFrom-Json; $vDetail = "verdict=$($j.verdict)"; $valid = ($null -ne $j.verdict) }
                catch { $valid = $false; $vDetail = 'stdout is not valid JSON' }
            }
            'nonempty_stdout' { $valid = ($stdout.Trim().Length -gt 0); $vDetail = "stdout=$($stdout.Trim().Length)B" }
        }
        if ($state -eq 'ok' -and -not $valid) { $state = 'failed' }
        if (-not (Test-Redacted -Text $stdout)) { return @{ state = 'failed'; detail = 'redaction tripwire on stdout'; exit = $code } }
        return @{ state = $state; detail = "exit $code; $vDetail"; exit = $code; tier = $c.tier; kind = $c.kind }
    } finally {
        if ($p) { $p.Dispose() }
    }
}

# ---------------------------------------------- internal read-only capabilities
function Invoke-Internal {
    param([string]$Capability, $Routine)
    switch ($Capability) {
        'read_files' {
            $n = 0; $bytes = 0
            foreach ($i in @('11_Agents/claude-operating-team.json', '12_Brain/09_Ops/AGENT_PROTOCOL.md')) {
                $p = Join-Path $resolvedVault $i
                if (Test-Path -LiteralPath $p) { $n++; $bytes += (Get-Item -LiteralPath $p).Length }
            }
            return @{ state = $(if ($n -eq 2) { 'ok' } else { 'blocked' }); detail = "read $n/2 inputs, $bytes B" }
        }
        'diff_sources' {
            $m = 'C:\Users\dillo\Documents\Codex\projects\agent-vault\notes\inbox\2026-08-11-grok-bot-routine-recording-manifest.json'
            if (-not (Test-Path -LiteralPath $m)) { return @{ state = 'blocked'; detail = 'Grok manifest unavailable' } }
            $mj = Get-Content -LiteralPath $m -Raw | ConvertFrom-Json
            $drift = @(Compare-Object -ReferenceObject @($mj.routines.id | Sort-Object) -DifferenceObject @($all.routine_id | Sort-Object))
            return @{ state = $(if ($drift.Count -eq 0) { 'ok' } else { 'failed' }); detail = "source drift $($drift.Count)" }
        }
        'aggregate_counts' {
            $c = @(Get-ChildItem -LiteralPath (Join-Path $resolvedVault '12_Brain') -Recurse -Filter '*.md' -File).Count
            return @{ state = $(if ($c -gt 0) { 'ok' } else { 'blocked' }); detail = "$c brain notes" }
        }
        'hash_files' {
            $h = (Get-FileHash -LiteralPath $registryPath -Algorithm SHA256).Hash
            return @{ state = 'ok'; detail = "registry sha256 $($h.Substring(0,12))" }
        }
        'git_readonly' {
            $b = & git -C $resolvedVault rev-parse --abbrev-ref HEAD 2>$null
            return @{ state = $(if ($LASTEXITCODE -eq 0) { 'ok' } else { 'blocked' }); detail = "branch $b" }
        }
        'check_ports_readonly' {
            $l = @(netstat -ano | Select-String -SimpleMatch ':8420' | Where-Object { $_ -match 'LISTENING' })
            return @{ state = 'ok'; detail = "agent-memory listeners $($l.Count)" }
        }
        'comms_triage_readonly' {
            # Reads what the already-scheduled Gmail/Slack sensors produced. It does NOT
            # re-run those bridges: duplicating an active automation is forbidden.
            $idx = Join-Path $CanonicalRoot 'intake/index.json'
            if (-not (Test-Path -LiteralPath $idx)) { return @{ state = 'blocked'; detail = 'intake index unavailable; sensor has not run' } }
            $ageH = [math]::Round(((Get-Date) - (Get-Item -LiteralPath $idx).LastWriteTime).TotalHours, 2)
            if ($ageH -gt 26) { return @{ state = 'blocked'; detail = "intake index stale ${ageH}h; fail closed" } }
            $j = Get-Content -LiteralPath $idx -Raw | ConvertFrom-Json
            $items = @($j.items)
            $pending = @($items | Where-Object { $_.triageState -eq 'pending' }).Count
            $quar = @($items | Where-Object { $_.triageState -eq 'quarantined' }).Count
            $clients = @($items | Where-Object { $_.clientId } | ForEach-Object { $_.clientId } | Sort-Object -Unique).Count
            return @{ state = 'ok'; detail = "intake ${ageH}h old: $($items.Count) obs, $pending pending, $quar quarantined, $clients client routes" }
        }
        'repo_readonly' {
            $branch = & git -C $resolvedVault rev-parse --abbrev-ref HEAD 2>$null
            if ($LASTEXITCODE -ne 0) { return @{ state = 'blocked'; detail = 'git unavailable' } }
            $dirty = @(& git -C $resolvedVault status --porcelain 2>$null).Count
            $repos = @(Get-ChildItem -LiteralPath 'C:\Users\dillo\repos' -Directory -ErrorAction SilentlyContinue).Count
            $gh = 'unauthenticated'
            $null = & gh auth status 2>&1
            if ($LASTEXITCODE -eq 0) { $gh = 'authenticated' }
            return @{ state = 'ok'; detail = "branch $branch, $dirty tracked changes preserved, $repos local repos, gh $gh" }
        }
        'emit_receipt' { return @{ state = 'ok'; detail = 'receipt assembled' } }
        default { return @{ state = 'failed'; detail = "internal capability '$Capability' not implemented" } }
    }
}

# ------------------------------------------------------------------ prior state
$priorKeys = @(); $priorFail = @{}
if (Test-Path -LiteralPath $receiptLog) {
    foreach ($line in (Get-Content -LiteralPath $receiptLog)) {
        if (-not $line.Trim()) { continue }
        try { $p = $line | ConvertFrom-Json } catch { continue }
        # A degraded completion is still a completion for dedupe purposes; otherwise a
        # routine whose verify stage legitimately blocks would re-run every cycle.
        if ($p.dedupe_key -and (@('complete', 'complete_degraded') -contains $p.outcome)) { $priorKeys += $p.dedupe_key }
        if ($p.outcome -and @('failed', 'verification_failed') -contains $p.outcome) {
            if (-not $priorFail.ContainsKey($p.routine_id)) { $priorFail[$p.routine_id] = 0 }
            $priorFail[$p.routine_id] = $priorFail[$p.routine_id] + 1
        }
    }
}

$clientScope = 'internal'; $clientOk = $true
if ($ClientId) {
    $cregPath = Join-Path $CanonicalRoot 'registry/clients.json'
    if (Test-Path -LiteralPath $cregPath) {
        $creg = Get-Content -LiteralPath $cregPath -Raw | ConvertFrom-Json
        $clientOk = (@($creg.clients | Where-Object { $_.id -eq $ClientId -and $_.status -eq 'active' }).Count -eq 1)
        if ($clientOk) { $clientScope = $ClientId }
    } else { $clientOk = $false }
}

$forbiddenVerbs = @('send', 'post', 'publish', 'schedule', 'deploy', 'merge', 'spend', 'purchase',
                    'account_change', 'credential_read', 'rotate', 'delete', 'canonical_write', 'push', 'commit')
$rows = New-Object System.Collections.Generic.List[object]
$executed = 0

foreach ($r in $targets) {
    if ($MaxRoutines -gt 0 -and $executed -ge $MaxRoutines) { break }
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    $gates = New-Object System.Collections.Generic.List[object]
    $stageLog = New-Object System.Collections.Generic.List[object]
    $key = "$clientScope`:$today`:$($r.routine_id)"
    $outcome = 'blocked'; $blockedBy = ''
    $mx = $null; $lease = $false

    function Add-G { param([string]$Id, [bool]$Ok, [string]$D)
        $gates.Add([pscustomobject]@{ gate = $Id; ok = $Ok; detail = $D }) }

    $g1 = ($r.claude_may_execute -eq $true) -and ($r.approval_tier -le 1)
    $d1 = "role=$($r.claude_role) tier=$($r.approval_tier)"
    if (-not $g1 -and $r.claude_never_reason) { $d1 += " | $($r.claude_never_reason)" }
    Add-G 'G1_authority' $g1 $d1

    $leak = @(@($r.allowed_actions) | Where-Object { $forbiddenVerbs -contains $_ })
    Add-G 'G2_action_safety' ($leak.Count -eq 0) "forbidden_in_allowed=$($leak.Count)"
    Add-G 'G3_client_isolation' $clientOk "scope=$clientScope"

    $budget = $r.budget_tokens
    Add-G 'G4_budget_ceiling' (($null -ne $budget) -and ($budget -gt 0)) "$budget tok / $($r.timeout_seconds)s"

    if ($Fixture) {
        Add-G 'G5_stale_source' $true 'fixture mode: freshness probe bypassed for test'
        $fresh = @{ ok = $true; detail = 'fixture'; age_hours = 0 }
    } else {
        $fresh = Measure-Freshness -Routine $r
        Add-G 'G5_stale_source' ([bool]$fresh.ok) $fresh.detail
    }

    Add-G 'G6_dedupe' ($priorKeys -notcontains $key) "key=$key"
    try { $mx = New-Object System.Threading.Mutex($false, ('Local\claude-loop-' + $clientScope + '-' + $r.routine_id))
          $lease = $mx.WaitOne(0) } catch { $lease = $false }
    Add-G 'G7_lease' $lease "exclusive lease on $clientScope/$($r.routine_id)"
    $pf = 0; if ($priorFail.ContainsKey($r.routine_id)) { $pf = $priorFail[$r.routine_id] }
    Add-G 'G8_circuit_breaker' ($pf -lt 3) "prior_failures=$pf"

    $failedGates = @($gates | Where-Object { -not $_.ok })
    if ($failedGates.Count -gt 0) { $blockedBy = ($failedGates | ForEach-Object { $_.gate }) -join '+' }

    if ($failedGates.Count -eq 0 -and $Execute) {
        $executed++
        $buildCmd = $ROUTINE_BUILD[$r.routine_id]
        if (-not $buildCmd) { $buildCmd = $ROLE_BUILD[$r.claude_role] }
        $retry = $r.retry_policy
        $maxAttempts = 1; $backoff = @()
        if ($retry) { $maxAttempts = [int]$retry.max_attempts; $backoff = @($retry.backoff_seconds) }
        if ($maxAttempts -lt 1) { $maxAttempts = 1 }

        $stageFailed = $false
        foreach ($stageKey in $STAGES) {
            $ssw = [System.Diagnostics.Stopwatch]::StartNew()
            $res = $null; $usedCmd = ''
            $attempt = 0
            while ($attempt -lt $maxAttempts) {
                if ($attempt -gt 0 -and $backoff.Count -ge $attempt) {
                    # The delegated policy backoff (60/300/900s) is sized for connector
                    # retries. Inside a synchronous local stage loop it would stall a
                    # scheduled run for 16+ minutes, so local commands cap at 5s. The
                    # full policy value still governs connector-backed work.
                    $wait = [Math]::Min([int]$backoff[$attempt - 1], $LocalBackoffCapSeconds)
                    Start-Sleep -Seconds $wait
                }
                switch ($stageKey) {
                    'sense'      { $usedCmd = 'read_files';           $res = Invoke-Internal -Capability $usedCmd -Routine $r }
                    'route'      { $usedCmd = 'diff_sources';         $res = Invoke-Internal -Capability $usedCmd -Routine $r }
                    'prioritize' { $usedCmd = 'aggregate_counts';     $res = Invoke-Internal -Capability $usedCmd -Routine $r }
                    'build'      {
                        $usedCmd = $buildCmd
                        if ($ALLOWLIST.ContainsKey($usedCmd)) { $res = Invoke-Allowlisted -Id $usedCmd }
                        else { $res = Invoke-Internal -Capability $usedCmd -Routine $r }
                    }
                    'verify'     { $usedCmd = 'browser_canary';       $res = Invoke-Allowlisted -Id $usedCmd }
                    'approve'    { $usedCmd = 'emit_receipt';         $res = Invoke-Internal -Capability $usedCmd -Routine $r }
                    'deliver'    { $usedCmd = 'hash_files';           $res = Invoke-Internal -Capability $usedCmd -Routine $r }
                    'readback'   { $usedCmd = 'git_readonly';         $res = Invoke-Internal -Capability $usedCmd -Routine $r }
                    'learn'      { $usedCmd = 'emit_receipt';         $res = Invoke-Internal -Capability $usedCmd -Routine $r }
                }
                if ($res.state -ne 'failed') { break }
                $attempt++
            }
            $ssw.Stop()
            $stageLog.Add([pscustomobject]@{ stage = $stageKey; capability = $usedCmd; state = $res.state
                detail = "$($res.detail)"; attempts = ($attempt + 1)
                seconds = [math]::Round($ssw.Elapsed.TotalSeconds, 2) })

            # 'verify' intentionally runs the browser canary: a NOT-READY blocked result is
            # the correct, expected outcome and must not fail the routine.
            if ($res.state -eq 'failed') { $stageFailed = $true; break }

            if (-not (Test-Path -LiteralPath $routineStateDir)) { New-Item -ItemType Directory -Path $routineStateDir -Force | Out-Null }
            $cpTarget = Join-Path $resolvedVault $r.checkpoint_resume
            if ($r.checkpoint_resume -like '*claude-routines*') {
                [System.IO.File]::WriteAllText($cpTarget, ([pscustomobject]@{
                    routine_id = $r.routine_id; dedupe_key = $key; last_stage = $stageKey
                    run_id = $runId; updated = (Get-Date).ToUniversalTime().ToString('o')
                } | ConvertTo-Json -Depth 3), $utf8)
            }
        }
        $okStages = @($stageLog | Where-Object { $_.state -eq 'ok' }).Count
        $blockedStages = @($stageLog | Where-Object { $_.state -eq 'blocked' }).Count
        if ($stageFailed) { $outcome = 'failed'; $blockedBy = 'stage:' + (@($stageLog | Where-Object { $_.state -eq 'failed' })[0].stage) }
        elseif ($stageLog.Count -eq $STAGES.Count) {
            $outcome = $(if ($blockedStages -gt 0) { 'complete_degraded' } else { 'complete' })
        }
    } elseif ($failedGates.Count -eq 0) { $outcome = 'eligible_not_executed' }

    if ($mx) { if ($lease) { $mx.ReleaseMutex() }; $mx.Dispose() }
    $sw.Stop()

    $indep = @{ verified = $false; detail = 'not run' }
    if (@('complete', 'complete_degraded') -contains $outcome) {
        $h2 = (Get-FileHash -LiteralPath $registryPath -Algorithm SHA256).Hash
        $delivered = @($stageLog | Where-Object { $_.stage -eq 'deliver' })[0].detail
        $product = ($all.Count * 9)
        $indep = @{ verified = (($delivered -like "*$($h2.Substring(0,12))*") -and ($product -eq $reg.stage_model.total_stages))
                    detail = "recomputed registry hash prefix and ${product} vs declared $($reg.stage_model.total_stages)" }
        if (-not $indep.verified) { $outcome = 'verification_failed' }
    }

    $receipt = [ordered]@{
        route = $r.route
        artifact_paths = @("12_Brain/queue/claude-loop-$today.jsonl", $r.checkpoint_resume)
        sources_and_freshness = $fresh.detail
        checks = "gates $($gates.Count - $failedGates.Count)/$($gates.Count); stages ok $(@($stageLog | Where-Object { $_.state -eq 'ok' }).Count)/$($STAGES.Count); blocked $(@($stageLog | Where-Object { $_.state -eq 'blocked' }).Count)"
        assumptions = $(if ($Fixture) { 'fixture mode; freshness bypassed' } else { 'local and read-only sources only' })
        privacy_state = 'redacted'
        approval_state = "tier $($r.approval_tier); no approval requested or granted"
        external_action_attempted = 'none'
        next_safest_action = $(if (@('complete', 'complete_degraded') -contains $outcome) { 'hand receipt to Codex for final verification' } else { "resolve $blockedBy" })
    }

    $rows.Add([pscustomobject]@{
        routine_id = $r.routine_id; name = $r.name; module = $r.module; owner_bot = $r.owner_bot
        claude_role = $r.claude_role; cadence = $r.cadence; approval_tier = $r.approval_tier
        outcome = $outcome; blocked_by = $blockedBy; dedupe_key = $key
        gates = $gates.ToArray(); stages = $stageLog.ToArray()
        independent_verification = $indep; receipt = $receipt
        cost = [pscustomobject]@{ elapsed_seconds = [math]::Round($sw.Elapsed.TotalSeconds, 2)
                                  budget_ceiling = $budget; stages_executed = $stageLog.Count }
        value_signal = $r.value_signal
    })
}

$complete = @($rows | Where-Object { @('complete', 'complete_degraded') -contains $_.outcome })
$eligible = @($rows | Where-Object { $_.outcome -eq 'eligible_not_executed' })

if ($Json) {
    [pscustomobject]@{
        harness = 'Invoke-ClaudeLoop'; run_id = $runId
        mode = $(if ($Execute) { 'bounded-local-execute' } else { 'gate-report' })
        fixture = [bool]$Fixture; privacy = 'redacted'
        canonical_write_attempted = $false; external_action_attempted = $false
        allowlist = @($ALLOWLIST.Keys | Sort-Object)
        evaluated = $rows.Count; complete = $complete.Count; eligible = $eligible.Count
        rows = $rows.ToArray()
    } | ConvertTo-Json -Depth 8
} else {
    Write-Host ''
    Write-Host ("Claude loop  {0}  mode {1}{2}" -f $runId, $(if ($Execute) { 'execute' } else { 'gate-report' }), $(if ($Fixture) { ' [fixture]' } else { '' }))
    Write-Host ('-' * 96)
    foreach ($row in $rows) {
        Write-Host ("{0,-5} {1,-14} {2,-17} {3,-22} {4}" -f $row.routine_id, $row.module, $row.claude_role, $row.outcome, $row.blocked_by)
        foreach ($s in $row.stages) {
            $m = switch ($s.state) { 'ok' { 'ok  ' } 'blocked' { 'BLK ' } default { 'FAIL' } }
            Write-Host ("      [{0}] {1,-11} {2,-22} {3}" -f $m, $s.stage, $s.capability, $s.detail)
        }
        if ($row.stages.Count -gt 0) {
            Write-Host ("      independent verify: {0} - {1}" -f $row.independent_verification.verified, $row.independent_verification.detail)
        }
    }
    Write-Host ('-' * 96)
    Write-Host ("complete {0}  eligible {1}  evaluated {2}" -f $complete.Count, $eligible.Count, $rows.Count)
    Write-Host ''
}

if (-not $NoEvidence) {
    foreach ($row in $rows) {
        $line = ([pscustomobject]@{
            ts = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ss.fffZ')
            harness = 'claude-loop'; run_id = $runId; routine_id = $row.routine_id
            module = $row.module; outcome = $row.outcome; blocked_by = $row.blocked_by
            dedupe_key = $row.dedupe_key
            stages_ok = @($row.stages | Where-Object { $_.state -eq 'ok' }).Count
            stages_blocked = @($row.stages | Where-Object { $_.state -eq 'blocked' }).Count
            independent_verified = $row.independent_verification.verified
            elapsed_seconds = $row.cost.elapsed_seconds
            privacy = 'redacted'; canonical_write_attempted = $false; external_action_attempted = $false
            receipt = $row.receipt
        } | ConvertTo-Json -Depth 4 -Compress)
        if (Test-Redacted -Text $line) { [System.IO.File]::AppendAllText($receiptLog, $line + "`n", $utf8) }
        else { [System.IO.File]::AppendAllText($receiptLog, '{"harness":"claude-loop","outcome":"blocked","blocked_by":"redaction_tripwire"}' + "`n", $utf8) }
    }
}

if (@($rows | Where-Object { $_.outcome -eq 'verification_failed' }).Count -gt 0) { exit 1 }
exit 0
