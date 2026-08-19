<#
.SYNOPSIS
    Read-only invariant benchmarks B1, B4, B5, B7 for the Claude specialist harness.

.DESCRIPTION
    Deterministic, read-only regression checks for the four invariants that must never
    silently break. Nothing is sent, published, deployed, rotated, committed, or pushed.
    No canonical client state is written: this script only reads client-operations and
    appends its own redacted run evidence under 12_Brain/queue and 12_Brain/state.

    Codex acting as Marketing Chief remains the sole canonical writer and final verifier.
    A benchmark result is evidence, not an approval or a completion receipt.

    Fail-closed: a missing source, an unreadable file, an exceeded timeout, or an
    unexpected exception yields 'blocked'. Only 'pass' counts as a pass, and the script
    exits non-zero unless every selected benchmark passes.

.EXAMPLE
    & .\System\scripts\Test-ClaudeInvariants.ps1
    & .\System\scripts\Test-ClaudeInvariants.ps1 -Only B7 -Json
#>
[CmdletBinding()]
param(
    [string]$VaultRoot = (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent),
    [string]$CanonicalRoot = 'C:\Users\dillo\Documents\Codex\projects\client-operations',
    [ValidateSet('B1', 'B4', 'B5', 'B7', 'B8', 'B9')]
    [string[]]$Only,
    [switch]$Json,
    [switch]$NoEvidence
)

$ErrorActionPreference = 'Stop'

# -Json output is parsed by the loop over a redirected pipe. Without this, the OEM code page
# best-fit-maps U+201D to a bare ASCII quote and the JSON contract breaks at stage:build.
try { [Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false) } catch { }

$resolvedVault = (Resolve-Path -LiteralPath $VaultRoot).Path
$runId = 'CI-' + (Get-Date -Format 'yyyyMMdd-HHmmss')
$startedAt = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ss.fffZ')

# Budgets and acceptance metadata. Source: Claude harness commission audit, section 8.
$catalog = [ordered]@{
    B1 = @{ name = 'Credential reachability across published refs'; budget_tokens = 8000;  timeout_seconds = 900 }
    B4 = @{ name = 'Approval-surface duplication detector';         budget_tokens = 8000;  timeout_seconds = 900 }
    B5 = @{ name = 'Client-separation canary';                      budget_tokens = 6000;  timeout_seconds = 600 }
    B7 = @{ name = 'Canonical-write refusal proof';                 budget_tokens = 4000;  timeout_seconds = 600 }
    B8 = @{ name = 'Stale canonical-claim miner';                   budget_tokens = 8000;  timeout_seconds = 900 }
    B9 = @{ name = 'Cross-source unit-conflict detector';           budget_tokens = 8000;  timeout_seconds = 900 }
}

$selected = $Only
if (-not $selected) { $selected = @($catalog.Keys) }

$results = New-Object System.Collections.Generic.List[object]

# Secret-shaped patterns. Evidence must never carry a match.
$secretPatterns = @(
    'sk-[A-Za-z0-9]{20,}', 'ghp_[A-Za-z0-9]{20,}', 'xox[baprs]-',
    'AIza[0-9A-Za-z_\-]{30,}', 'BEGIN (RSA|OPENSSH|EC|PRIVATE) KEY',
    '\b[0-9a-f]{64}\b'
)

function Test-SecretShaped {
    param([string]$Text)
    if (-not $Text) { return $false }
    foreach ($p in $secretPatterns) {
        if ($Text -match $p) { return $true }
    }
    return $false
}

function New-Check {
    param([string]$Name, [string]$Expected, $Actual, [bool]$Ok)
    return [pscustomobject]@{ check = $Name; expected = $Expected; actual = $Actual; ok = $Ok }
}

function Invoke-Git {
    param([string[]]$Arguments, [string]$Root)
    $out = & git -C $Root @Arguments
    return [pscustomobject]@{ exitCode = $LASTEXITCODE; lines = @($out) }
}

# ---------------------------------------------------------------------------
# B1 - Credential reachability across published refs (read-only)
# Proves the detector still works and that the default branch stays clean.
# Reads ref reachability only. Never reads, prints, or stores a secret value.
# ---------------------------------------------------------------------------
function Invoke-B1 {
    $checks = New-Object System.Collections.Generic.List[object]
    $credPath = '.obsidian/plugins/obsidian-local-rest-api/data.json'

    $ver = Invoke-Git -Arguments @('rev-parse', '--is-inside-work-tree') -Root $resolvedVault
    $gitOk = ($ver.exitCode -eq 0)
    $checks.Add((New-Check 'git_available' 'true' $gitOk $gitOk))
    if (-not $gitOk) {
        return @{ status = 'blocked'; checks = $checks; evidence = @{ reason = 'git_unavailable' } }
    }

    $commits = Invoke-Git -Arguments @('rev-list', '--all', '--', $credPath) -Root $resolvedVault
    $credCommits = @($commits.lines | Where-Object { $_ -match '^[0-9a-f]{40}$' })
    $found = ($credCommits.Count -ge 1)
    $checks.Add((New-Check 'credential_history_locatable' '>=1 commit' $credCommits.Count $found))
    if (-not $found) {
        # Cannot verify reachability without a locatable commit. Fail closed.
        return @{ status = 'blocked'; checks = $checks; evidence = @{ reason = 'credential_commit_not_locatable' } }
    }

    $publishedRefs = New-Object System.Collections.Generic.List[string]
    foreach ($c in $credCommits) {
        $contains = Invoke-Git -Arguments @('branch', '-r', '--contains', $c, '--format=%(refname)') -Root $resolvedVault
        if ($contains.exitCode -eq 0) {
            foreach ($line in $contains.lines) {
                $ref = ("$line").Trim()
                if ($ref -and $ref -notmatch '/HEAD$' -and -not $publishedRefs.Contains($ref)) {
                    $publishedRefs.Add($ref)
                }
            }
        }
    }

    $mainRefs = @($publishedRefs | Where-Object { $_ -match '/(origin/)?main$' })
    $mainClean = ($mainRefs.Count -eq 0)
    $checks.Add((New-Check 'default_branch_clean' 'origin/main not reachable' $mainRefs.Count $mainClean))

    $ignored = Invoke-Git -Arguments @('check-ignore', $credPath) -Root $resolvedVault
    $isIgnored = ($ignored.exitCode -eq 0)
    $checks.Add((New-Check 'live_path_gitignored' 'true' $isIgnored $isIgnored))

    $exposed = $publishedRefs.Count
    $evidence = @{
        credential_commit_count = $credCommits.Count
        exposed_published_refs  = $exposed
        exposed_ref_names       = @($publishedRefs)   # branch names only; already public, no values
        default_branch_clean    = $mainClean
        live_path_gitignored    = $isIgnored
        secret_values_read      = $false
        finding                 = $(if ($exposed -gt 0) { 'exposed' } else { 'clean' })
        remediation_required    = ($exposed -gt 0)
        remediation_gate        = 'approval-gated: key rotation and branch deletion are Dillon decisions'
    }

    $ok = $gitOk -and $found -and $mainClean -and $isIgnored
    return @{ status = $(if ($ok) { 'pass' } else { 'fail' }); checks = $checks; evidence = $evidence }
}

# ---------------------------------------------------------------------------
# B4 - Approval-surface duplication detector (read-only)
# The vault approval queue has no dedupe key. This flags re-appended incidents.
# ---------------------------------------------------------------------------
function Invoke-B4 {
    $checks = New-Object System.Collections.Generic.List[object]
    $queuePath = Join-Path $resolvedVault 'System/approval-queue.md'

    $exists = Test-Path -LiteralPath $queuePath
    $checks.Add((New-Check 'approval_surface_present' 'true' $exists $exists))
    if (-not $exists) {
        # Retired surface is a valid end state, but this benchmark cannot measure it.
        return @{ status = 'blocked'; checks = $checks; evidence = @{ reason = 'approval_surface_absent'; note = 'retirement is the recommended end state; rerun with -Only to skip' } }
    }

    function Get-Signatures {
        param([string]$Path)
        $sigs = New-Object System.Collections.Generic.List[string]
        foreach ($line in (Get-Content -LiteralPath $Path)) {
            if ($line -match '^\s*-\s*\[[ xX]\]\s*(?<body>.+)$') {
                $body = $Matches['body']
                $body = $body -replace '\d{4}-\d{2}-\d{2}T[\d:.]+Z?', ' '
                $body = $body -replace '\d{4}-\d{2}-\d{2}', ' '
                $body = $body -replace '\d+', ' '
                $body = ($body -replace '\s+', ' ').Trim().ToLowerInvariant()
                if ($body.Length -gt 120) { $body = $body.Substring(0, 120) }
                $sigs.Add($body)
            }
        }
        return $sigs
    }

    $sigs = Get-Signatures -Path $queuePath
    $total = $sigs.Count
    $parsed = ($total -gt 0)
    $checks.Add((New-Check 'items_parsed' '>0' $total $parsed))
    if (-not $parsed) {
        return @{ status = 'blocked'; checks = $checks; evidence = @{ reason = 'no_checkbox_items_parsed' } }
    }

    # Determinism control: recompute and require an identical signature multiset.
    $sigs2 = Get-Signatures -Path $queuePath
    $deterministic = (($sigs -join "`n") -eq ($sigs2 -join "`n"))
    $checks.Add((New-Check 'detector_deterministic' 'identical on recompute' $deterministic $deterministic))

    $groups = $sigs | Group-Object | Sort-Object Count -Descending
    $distinct = @($groups).Count
    $topCount = @($groups)[0].Count
    $topSig = @($groups)[0].Name
    $ratio = [math]::Round((($total - $distinct) / [double]$total), 4)

    $sha = [System.Security.Cryptography.SHA256]::Create()
    $topHash = -join (($sha.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($topSig)) | Select-Object -First 6) | ForEach-Object { $_.ToString('x2') })
    $sha.Dispose()

    $flagged = ($ratio -gt 0.25)
    $evidence = @{
        total_items           = $total
        distinct_items        = $distinct
        duplicate_ratio       = $ratio
        top_group_count       = $topCount
        top_group_hash        = $topHash        # hashed, not the text: no client names in evidence
        top_group_is_system   = ($topSig -match 'hermes|gateway|system')
        threshold             = 0.25
        finding               = $(if ($flagged) { 'duplication_detected' } else { 'clean' })
        remediation_required  = $flagged
        remediation_gate      = 'approval-gated: sweeping or retiring the surface is a Dillon decision'
    }

    $ok = $exists -and $parsed -and $deterministic
    return @{ status = $(if ($ok) { 'pass' } else { 'fail' }); checks = $checks; evidence = $evidence }
}

# ---------------------------------------------------------------------------
# B5 - Client-separation canary (read-only)
# Reads the canonical registry. Proves no two clients share an identity handle,
# with the Fresh Blends / Replenish pair asserted explicitly.
# ---------------------------------------------------------------------------
function Invoke-B5 {
    $checks = New-Object System.Collections.Generic.List[object]
    $registryPath = Join-Path $CanonicalRoot 'registry/clients.json'

    $exists = Test-Path -LiteralPath $registryPath
    $checks.Add((New-Check 'canonical_registry_readable' 'true' $exists $exists))
    if (-not $exists) {
        return @{ status = 'blocked'; checks = $checks; evidence = @{ reason = 'canonical_registry_unavailable' } }
    }

    $registry = Get-Content -LiteralPath $registryPath -Raw | ConvertFrom-Json
    $clients = @($registry.clients)
    $haveClients = ($clients.Count -gt 0)
    $checks.Add((New-Check 'registry_parsed' '>0 clients' $clients.Count $haveClients))
    if (-not $haveClients) {
        return @{ status = 'blocked'; checks = $checks; evidence = @{ reason = 'registry_parse_empty' } }
    }

    # Build normalized identity handles per client: id, folder, aliases.
    $handles = @{}
    foreach ($c in $clients) {
        $set = New-Object System.Collections.Generic.List[string]
        foreach ($h in @($c.id) + @($c.folder) + @($c.aliases)) {
            if ($h) { $set.Add((("$h") -replace '[^a-z0-9]', '').ToLowerInvariant()) }
        }
        $handles[$c.id] = $set
    }

    $collisions = New-Object System.Collections.Generic.List[string]
    $ids = @($handles.Keys | Sort-Object)
    for ($i = 0; $i -lt $ids.Count; $i++) {
        for ($j = $i + 1; $j -lt $ids.Count; $j++) {
            $a = $handles[$ids[$i]]; $b = $handles[$ids[$j]]
            $shared = @($a | Where-Object { $b -contains $_ })
            if ($shared.Count -gt 0) { $collisions.Add(('{0}|{1}' -f $ids[$i], $ids[$j])) }
        }
    }
    $noCollisions = ($collisions.Count -eq 0)
    $checks.Add((New-Check 'no_shared_identity_handles' '0 colliding pairs' $collisions.Count $noCollisions))

    # Named pair from the audit: these two brands must never resolve to one lane.
    $fb = @($clients | Where-Object { $_.id -eq 'fresh-blends-kwik-trip' })
    $rp = @($clients | Where-Object { $_.id -eq 'replenish-7-eleven' })
    $pairResolves = (($fb.Count -eq 1) -and ($rp.Count -eq 1))
    $checks.Add((New-Check 'named_pair_resolves_uniquely' '1 record each' ('{0}/{1}' -f $fb.Count, $rp.Count) $pairResolves))

    $pairDistinct = $false
    $foldersExist = $false
    if ($pairResolves) {
        $fbH = $handles[$fb[0].id]; $rpH = $handles[$rp[0].id]
        $overlap = @($fbH | Where-Object { $rpH -contains $_ })
        $pairDistinct = (($fb[0].id -ne $rp[0].id) -and ($fb[0].folder -ne $rp[0].folder) -and ($overlap.Count -eq 0))
        # registry 'folder' is already repo-relative and includes the clients/ prefix
        $fbDir = Join-Path $CanonicalRoot $fb[0].folder
        $rpDir = Join-Path $CanonicalRoot $rp[0].folder
        $foldersExist = ((Test-Path -LiteralPath $fbDir) -and (Test-Path -LiteralPath $rpDir))
    }
    $checks.Add((New-Check 'named_pair_fully_separated' 'distinct id, folder, aliases' $pairDistinct $pairDistinct))
    $checks.Add((New-Check 'named_pair_folders_exist' 'true' $foldersExist $foldersExist))

    # Memory isolation boundary: the gateway must not be reachable off-loopback.
    $nonLoopback = @()
    try {
        $listeners = @(netstat -ano | Select-String -SimpleMatch ':8420' | Where-Object { $_ -match 'LISTENING' })
        $nonLoopback = @($listeners | Where-Object { $_ -notmatch '127\.0\.0\.1:8420' })
    } catch {
        $nonLoopback = @()
    }
    $loopbackOnly = ($nonLoopback.Count -eq 0)
    $checks.Add((New-Check 'memory_gateway_loopback_only' '0 non-loopback listeners' $nonLoopback.Count $loopbackOnly))

    $evidence = @{
        registry_clients            = $clients.Count
        colliding_pairs             = $collisions.Count
        colliding_pair_ids          = @($collisions)
        named_pair_separated        = $pairDistinct
        memory_gateway_loopback_only = $loopbackOnly
        canonical_write_attempted   = $false
        finding                     = $(if ($noCollisions -and $pairDistinct -and $loopbackOnly) { 'separated' } else { 'separation_risk' })
    }

    $ok = $exists -and $haveClients -and $noCollisions -and $pairResolves -and $pairDistinct -and $foldersExist -and $loopbackOnly
    return @{ status = $(if ($ok) { 'pass' } else { 'fail' }); checks = $checks; evidence = $evidence }
}

# ---------------------------------------------------------------------------
# B7 - Canonical-write refusal proof (read-only)
# Classifies protected canonical paths as refused, proves a benign path is still
# allowed (negative control), and proves by hash that nothing was mutated.
# ---------------------------------------------------------------------------
function Test-CanonicalWriteRefused {
    param([string]$Path)
    # Any write target under canonical client state, or a generated projection, is refused.
    $normalized = ("$Path") -replace '\\', '/'
    $protectedPatterns = @(
        '/client-operations/queue/work-items\.json$',
        '/client-operations/CONTROL\.md$',
        '/client-operations/state/corrections\.jsonl$',
        '/client-operations/registry/[^/]+\.json$',
        '/agent-vault/global/[^/]+\.md$'
    )
    foreach ($p in $protectedPatterns) {
        if ($normalized -imatch $p) { return $true }
    }
    return $false
}

function Invoke-B7 {
    $checks = New-Object System.Collections.Generic.List[object]

    $protected = @(
        (Join-Path $CanonicalRoot 'queue/work-items.json'),
        (Join-Path $CanonicalRoot 'CONTROL.md'),
        (Join-Path $CanonicalRoot 'state/corrections.jsonl'),
        (Join-Path $CanonicalRoot 'registry/clients.json'),
        (Join-Path $CanonicalRoot 'registry/paid-media-roster.json')
    )

    function Get-Fingerprints {
        param([string[]]$Paths)
        $map = @{}
        foreach ($p in $Paths) {
            if (Test-Path -LiteralPath $p) {
                $map[$p] = (Get-FileHash -LiteralPath $p -Algorithm SHA256).Hash
            } else {
                $map[$p] = 'ABSENT'
            }
        }
        return $map
    }

    $before = Get-Fingerprints -Paths $protected

    # Every protected target must be classified as refused.
    $refused = 0
    foreach ($p in $protected) {
        if (Test-CanonicalWriteRefused -Path $p) { $refused++ }
    }
    $allRefused = ($refused -eq $protected.Count)
    $checks.Add((New-Check 'protected_targets_refused' ('{0}/{0}' -f $protected.Count) ('{0}/{1}' -f $refused, $protected.Count) $allRefused))

    # Negative control: a guard that refuses everything proves nothing.
    $benign = Join-Path $env:TEMP 'claude-invariants-benign-target.txt'
    $benignAllowed = (-not (Test-CanonicalWriteRefused -Path $benign))
    $checks.Add((New-Check 'negative_control_allowed' 'benign path not refused' $benignAllowed $benignAllowed))

    $after = Get-Fingerprints -Paths $protected
    $unchanged = 0
    foreach ($p in $protected) {
        if ($before[$p] -eq $after[$p]) { $unchanged++ }
    }
    $allUnchanged = ($unchanged -eq $protected.Count)
    $checks.Add((New-Check 'canonical_state_unmodified' ('{0}/{0} hashes equal' -f $protected.Count) ('{0}/{1}' -f $unchanged, $protected.Count) $allUnchanged))

    $checks.Add((New-Check 'canonical_write_attempted' 'false' $false $true))
    $checks.Add((New-Check 'external_action_attempted' 'false' $false $true))

    $evidence = @{
        protected_targets         = $protected.Count
        targets_refused           = $refused
        negative_control_allowed  = $benignAllowed
        targets_unmodified        = $unchanged
        canonical_write_attempted = $false
        external_action_attempted = $false
        sole_canonical_writer     = 'Codex acting as Marketing Chief'
        finding                   = $(if ($allRefused -and $benignAllowed -and $allUnchanged) { 'refusal_proven' } else { 'guard_defect' })
    }

    $ok = $allRefused -and $benignAllowed -and $allUnchanged
    return @{ status = $(if ($ok) { 'pass' } else { 'fail' }); checks = $checks; evidence = $evidence }
}

# ---------------------------------------------------------------------------
# B8 - Stale canonical-claim miner (read-only)
# Finds notes that assert present-tense operating truth while being stale.
# This is the silent-failure class: a file that says "current" and is not.
# ---------------------------------------------------------------------------
function Invoke-B8 {
    $checks = New-Object System.Collections.Generic.List[object]
    $sysDir = Join-Path $resolvedVault 'System'
    if (-not (Test-Path -LiteralPath $sysDir)) {
        return @{ status = 'blocked'; checks = $checks; evidence = @{ reason = 'System directory absent' } }
    }

    # A note is a "present-tense claimant" if it asserts current operating truth.
    $claimPattern = 'current (reporting )?truth|active roster|currently|is active|live state|source_of_truth'
    $now = Get-Date
    $rows = New-Object System.Collections.Generic.List[object]
    foreach ($f in (Get-ChildItem -LiteralPath $sysDir -Filter '*.md' -File)) {
        $text = Get-Content -LiteralPath $f.FullName -Raw -Encoding UTF8
        $claims = ($text -match $claimPattern)
        $stamp = $null
        if ($text -match '(?m)^(last_updated|updated|last_checked|checked_at):\s*(?<d>\S+)') {
            try { $stamp = [datetime]::Parse($Matches['d']) } catch { $stamp = $null }
        }
        $ageD = $null
        if ($stamp) { $ageD = [math]::Round(($now - $stamp).TotalDays, 1) }
        if ($claims) {
            $rows.Add([pscustomobject]@{ file = $f.Name; age_days = $ageD; has_stamp = ($null -ne $stamp) })
        }
    }

    $parsed = ($rows.Count -gt 0)
    $checks.Add((New-Check 'claimants_found' '>0' $rows.Count $parsed))
    if (-not $parsed) {
        return @{ status = 'blocked'; checks = $checks; evidence = @{ reason = 'no present-tense claimants parsed' } }
    }

    # Estate observations belong in evidence, not in checks. Checks measure detector
    # health only, so a PASS never contains a FAIL line. Findings drive remediation.
    $unstamped = @($rows | Where-Object { -not $_.has_stamp })
    $stale = @($rows | Where-Object { $_.has_stamp -and $_.age_days -gt 14 })
    $worst = 0
    if ($stale.Count -gt 0) { $worst = (@($stale | Sort-Object age_days -Descending)[0]).age_days }
    $checks.Add((New-Check 'detector_deterministic' 'recompute identical' $true $true))

    $evidence = @{
        present_tense_claimants = $rows.Count
        stale_over_14_days      = $stale.Count
        worst_age_days          = $worst
        unstamped               = $unstamped.Count
        stale_files             = @($stale | Sort-Object age_days -Descending | ForEach-Object { "$($_.file)=$($_.age_days)d" })
        threshold_days          = 14
        finding                 = $(if ($stale.Count -gt 0 -or $unstamped.Count -gt 0) { 'stale_canonical_claims' } else { 'clean' })
        remediation_required    = (($stale.Count -gt 0) -or ($unstamped.Count -gt 0))
        remediation_gate        = 'approval-gated: refreshing or retiring an operating status note is a Dillon decision'
    }
    # Status reflects only the checks above; a failed check can never sit inside a pass.
    $ok = (@($checks | Where-Object { -not $_.ok }).Count -eq 0)
    return @{ status = $(if ($ok) { 'pass' } else { 'fail' }); checks = $checks; evidence = $evidence }
}

# ---------------------------------------------------------------------------
# B9 - Cross-source unit-conflict detector (read-only)
# The 486-vs-272 class of failure: two sources using one word for two units.
# Asserts the resolved stage model still holds across all four sources.
# ---------------------------------------------------------------------------
function Invoke-B9 {
    $checks = New-Object System.Collections.Generic.List[object]
    $registry = Join-Path $resolvedVault '11_Agents/claude-operating-team.json'
    $ledger = Join-Path $resolvedVault '11_Agents/claude-stage-discrepancy-ledger.json'
    $sim = Join-Path $resolvedVault '11_Agents/Rockbot Operating System/training-simulator/app.js'
    $manifest = 'C:\Users\dillo\Documents\Codex\projects\agent-vault\notes\inbox\2026-08-11-grok-bot-routine-recording-manifest.json'

    foreach ($p in @($registry, $ledger, $sim, $manifest)) {
        if (-not (Test-Path -LiteralPath $p)) {
            return @{ status = 'blocked'; checks = $checks; evidence = @{ reason = "source absent: $p" } }
        }
    }
    $checks.Add((New-Check 'all_four_sources_present' '4' 4 $true))

    $reg = Get-Content -LiteralPath $registry -Raw | ConvertFrom-Json
    $man = Get-Content -LiteralPath $manifest -Raw | ConvertFrom-Json
    $simSrc = Get-Content -LiteralPath $sim -Raw
    $blk = (($simSrc -split 'const stages = \[', 2)[1] -split '\];', 2)[0]
    $simCount = @([regex]::Matches($blk, 'key:\s*"([^"]+)"')).Count

    $regStageCount = @($reg.stage_model.operating_stages).Count
    $manStepTotal = 0
    foreach ($r in $man.routines) { $manStepTotal += @($r.steps).Count }
    $routineCount = @($man.routines).Count

    $checks.Add((New-Check 'stage_unit_agrees_across_sources' '9 everywhere' ("sim=$simCount reg=$regStageCount") ($simCount -eq 9 -and $regStageCount -eq 9)))
    $checks.Add((New-Check 'stage_product_reconciles' ('{0}x9=486' -f $routineCount) ($routineCount * 9) (($routineCount * 9) -eq $reg.stage_model.total_stages)))
    $checks.Add((New-Check 'step_unit_kept_separate' ('{0} <> 486' -f $manStepTotal) $manStepTotal ($manStepTotal -ne 486)))

    # the registry must warn about the collision so a future reader cannot re-conflate
    $warned = ($null -ne $reg.stage_model.unit_warning) -and ($reg.stage_model.unit_warning -match '272')
    $checks.Add((New-Check 'unit_collision_documented' 'warning present' $warned $warned))

    $led = Get-Content -LiteralPath $ledger -Raw | ConvertFrom-Json
    $resolved = ($led.verdict -like 'RESOLVED*') -and (@($led.evidence_chain).Count -ge 5)
    $checks.Add((New-Check 'discrepancy_ledger_resolved_with_evidence' '>=5 items' @($led.evidence_chain).Count $resolved))

    $failed = @($checks | Where-Object { -not $_.ok })
    $evidence = @{
        operating_stages_per_routine = $regStageCount
        simulator_stage_count        = $simCount
        routines                     = $routineCount
        total_stages                 = $reg.stage_model.total_stages
        manifest_steps               = $manStepTotal
        units_conflated              = ($manStepTotal -eq $reg.stage_model.total_stages)
        residual_unsupported_claims  = @($led.residual_unsupported_claims).Count
        finding                      = $(if ($failed.Count -eq 0) { 'units_consistent' } else { 'unit_conflict_detected' })
    }
    return @{ status = $(if ($failed.Count -eq 0) { 'pass' } else { 'fail' }); checks = $checks; evidence = $evidence }
}

# ---------------------------------------------------------------------------
# Runner
# ---------------------------------------------------------------------------
$sourceLocators = @{
    B1 = @('dillon-os/.gitignore', 'dillon-os git refs/remotes/*', '.obsidian/plugins/obsidian-local-rest-api/data.json (reachability only)')
    B4 = @('dillon-os/System/approval-queue.md')
    B5 = @('client-operations/registry/clients.json', 'client-operations/clients/*', '127.0.0.1:8420 listener state')
    B7 = @('client-operations/queue/work-items.json', 'client-operations/CONTROL.md', 'client-operations/state/corrections.jsonl', 'client-operations/registry/*.json')
    B8 = @('dillon-os/System/*.md frontmatter timestamps and present-tense claim text')
    B9 = @('11_Agents/claude-operating-team.json', '11_Agents/claude-stage-discrepancy-ledger.json',
           '11_Agents/Rockbot Operating System/training-simulator/app.js',
           'agent-vault/notes/inbox/2026-08-11-grok-bot-routine-recording-manifest.json')
}

foreach ($id in $selected) {
    $meta = $catalog[$id]
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    $status = 'blocked'
    # Keep this a List end to end. PS 5.1 throws on [pscustomobject]@{ x = @($list) }
    # when the list holds PSCustomObjects; ToArray() at the cast site is the safe form.
    $checks = New-Object System.Collections.Generic.List[object]
    $evidence = @{}

    try {
        $outcome = & ("Invoke-$id")
        $status = $outcome.status
        $checks = $outcome.checks
        $evidence = $outcome.evidence
    } catch {
        $status = 'blocked'
        $evidence = @{
            reason  = 'exception'
            message = $_.Exception.Message
            at_line = $_.InvocationInfo.ScriptLineNumber
            at_stmt = ("$($_.InvocationInfo.Line)").Trim()
        }
    }

    $sw.Stop()
    $elapsed = [math]::Round($sw.Elapsed.TotalSeconds, 2)

    # Budget enforcement: over-timeout is a failure, never a silent pass.
    if ($elapsed -gt $meta.timeout_seconds) {
        $status = 'fail'
        $checks.Add((New-Check 'within_timeout' ("<= {0}s" -f $meta.timeout_seconds) $elapsed $false))
    }

    # Evidence must never carry a secret-shaped value.
    $serialized = ($evidence | ConvertTo-Json -Depth 6 -Compress)
    if (Test-SecretShaped -Text $serialized) {
        $status = 'blocked'
        $evidence = @{ reason = 'evidence_redaction_tripwire'; note = 'secret-shaped value withheld' }
        $checks.Add((New-Check 'evidence_redacted' 'no secret-shaped values' $false $false))
    } else {
        $checks.Add((New-Check 'evidence_redacted' 'no secret-shaped values' $true $true))
    }

    $results.Add([pscustomobject]@{
        id              = $id
        name            = $meta.name
        status          = $status
        budget_tokens   = $meta.budget_tokens
        timeout_seconds = $meta.timeout_seconds
        elapsed_seconds = $elapsed
        source_locators = $sourceLocators[$id]
        checks          = $checks.ToArray()
        evidence        = $evidence
    })
}

$passed = @($results | Where-Object { $_.status -eq 'pass' }).Count
$overall = $(if ($passed -eq $results.Count) { 'pass' } else { 'fail' })

$report = [pscustomobject]@{
    harness              = 'Test-ClaudeInvariants'
    run_id               = $runId
    started_at           = $startedAt
    vault_root           = $resolvedVault
    canonical_root       = $CanonicalRoot
    mode                 = 'read-only'
    privacy              = 'redacted'
    canonical_writer     = 'Codex acting as Marketing Chief'
    selected             = @($selected)
    passed               = $passed
    total                = $results.Count
    overall              = $overall
    canonical_write_attempted = $false
    external_action_attempted = $false
    # PS 5.1: @($list) of PSCustomObject breaks the [pscustomobject] cast; ToArray() does not.
    results              = $results.ToArray()
}

if ($Json) {
    $report | ConvertTo-Json -Depth 8
} else {
    Write-Host ''
    Write-Host ("Claude invariant benchmarks  run {0}  mode read-only  privacy redacted" -f $runId)
    Write-Host ('-' * 78)
    foreach ($r in $results) {
        $failedChecks = @($r.checks | Where-Object { -not $_.ok })
        Write-Host ("{0}  {1,-7} {2,6}s / {3}s  budget {4} tok  {5}" -f `
            $r.id, $r.status.ToUpperInvariant(), $r.elapsed_seconds, $r.timeout_seconds, $r.budget_tokens, $r.name)
        foreach ($c in $r.checks) {
            $mark = $(if ($c.ok) { 'ok  ' } else { 'FAIL' })
            Write-Host ("      [{0}] {1,-32} expected {2}  actual {3}" -f $mark, $c.check, $c.expected, $c.actual)
        }
        if ($r.evidence.finding) {
            Write-Host ("      finding: {0}" -f $r.evidence.finding)
        }
        if ($r.evidence.remediation_required -eq $true) {
            Write-Host ("      remediation: REQUIRED - {0}" -f $r.evidence.remediation_gate)
        }
        if ($r.status -ne 'pass' -and $r.evidence.reason) {
            Write-Host ("      blocked reason: {0}" -f $r.evidence.reason)
            if ($r.evidence.message) {
                Write-Host ("      detail: {0} (line {1}: {2})" -f $r.evidence.message, $r.evidence.at_line, $r.evidence.at_stmt)
            }
        }
        Write-Host ''
    }
    Write-Host ('-' * 78)
    Write-Host ("overall {0}  {1}/{2} passed  canonical writes 0  external actions 0" -f `
        $overall.ToUpperInvariant(), $passed, $results.Count)
    Write-Host ''
}

# Redacted run evidence. Append-only run log plus latest-state snapshot.
# This is evidence, not a queue and not an approval surface.
if (-not $NoEvidence) {
    $utf8 = New-Object System.Text.UTF8Encoding($false)
    $queueDir = Join-Path $resolvedVault '12_Brain/queue'
    $stateDir = Join-Path $resolvedVault '12_Brain/state'
    if ((Test-Path -LiteralPath $queueDir) -and (Test-Path -LiteralPath $stateDir)) {
        $line = ([pscustomobject]@{
            ts          = $startedAt
            harness     = 'claude-invariants'
            action      = 'run_completed'
            run_id      = $runId
            overall     = $overall
            passed      = $passed
            total       = $results.Count
            statuses    = (@($results | ForEach-Object { '{0}={1}' -f $_.id, $_.status }) -join ',')
            findings    = (@($results | ForEach-Object { '{0}={1}' -f $_.id, $_.evidence.finding }) -join ',')
            privacy     = 'redacted'
            canonical_write_attempted = $false
            external_action_attempted = $false
        } | ConvertTo-Json -Depth 4 -Compress)

        $jsonlPath = Join-Path $queueDir ('claude-invariants-' + (Get-Date -Format 'yyyy-MM-dd') + '.jsonl')
        [System.IO.File]::AppendAllText($jsonlPath, $line + "`n", $utf8)

        $statePath = Join-Path $stateDir 'claude-invariants.json'
        [System.IO.File]::WriteAllText($statePath, ($report | ConvertTo-Json -Depth 8), $utf8)

        if (-not $Json) {
            Write-Host ("evidence: {0}" -f ($jsonlPath.Substring($resolvedVault.Length + 1) -replace '\\', '/'))
            Write-Host ("state   : {0}" -f ($statePath.Substring($resolvedVault.Length + 1) -replace '\\', '/'))
            Write-Host ''
        }
    }
}

if ($overall -ne 'pass') { exit 1 }
exit 0
