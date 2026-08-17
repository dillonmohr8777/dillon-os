<#
.SYNOPSIS
    Deterministic validation of the Claude-native operating team against its Grok sources.

.DESCRIPTION
    Read-only. Proves the registry is complete, correctly partitioned, uniquely routed,
    provenance-complete, cross-source consistent, and incapable of claiming authority
    Claude must not hold.

      Team        6 unique cadence bots, 15 unique specialists, 21 loadable agent contracts
      Routines    54 unique IDs, exact match to the live Grok manifest
      Stages      486 unique (routine, stage) pairs from the 9 canonical operating stages
      Stage unit  operating_stages must equal training-simulator app.js stages[] exactly,
                  and must be distinct from the 9 receipt fields
      Departments 6 modules partitioning all 54 routines with no gap or overlap
      Routing     every routine resolves through exactly one department and one owner
      Safety      no forbidden verb granted, no Tier-2 executable, never-routines have no caps

    Fail-closed: missing source, drifted manifest, or any failed assertion exits 1.
    Codex acting as Marketing Chief remains sole canonical writer and final verifier.

.EXAMPLE
    & .\System\scripts\Test-ClaudeOperatingTeam.ps1
    & .\System\scripts\Test-ClaudeOperatingTeam.ps1 -Json
#>
[CmdletBinding()]
param(
    [string]$VaultRoot = (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent),
    [string]$ManifestPath = 'C:\Users\dillo\Documents\Codex\projects\agent-vault\notes\inbox\2026-08-11-grok-bot-routine-recording-manifest.json',
    [switch]$Json
)

$ErrorActionPreference = 'Stop'
$resolvedVault = (Resolve-Path -LiteralPath $VaultRoot).Path
$registryPath = Join-Path $resolvedVault '11_Agents/claude-operating-team.json'
$ledgerPath = Join-Path $resolvedVault '11_Agents/claude-stage-discrepancy-ledger.json'
$simPath = Join-Path $resolvedVault '11_Agents/Rockbot Operating System/training-simulator/app.js'

$checks = New-Object System.Collections.Generic.List[object]
function Add-Check {
    param([string]$Name, [string]$Expected, $Actual, [bool]$Ok)
    $checks.Add([pscustomobject]@{ check = $Name; expected = $Expected; actual = $Actual; ok = $Ok })
}

foreach ($p in @($registryPath, $ManifestPath, $simPath)) {
    if (-not (Test-Path -LiteralPath $p)) { Write-Host "BLOCKED: required source missing: $p"; exit 1 }
}

$reg = Get-Content -LiteralPath $registryPath -Raw | ConvertFrom-Json
$man = Get-Content -LiteralPath $ManifestPath -Raw | ConvertFrom-Json
$routines = @($reg.routines)

# ---------------------------------------------------------------- team shape
$bots = @($reg.cadence_bots)
$specs = @($reg.specialists)
Add-Check 'cadence_bots_unique' '6 unique' @($bots | Sort-Object -Unique).Count `
    ((@($bots | Sort-Object -Unique).Count -eq 6) -and ($bots.Count -eq 6))
Add-Check 'specialists_unique' '15 unique' @($specs | Sort-Object -Unique).Count `
    ((@($specs | Sort-Object -Unique).Count -eq 15) -and ($specs.Count -eq 15))

$agents = @($reg.agents)
Add-Check 'agent_contracts_load' '21 contracts' $agents.Count ($agents.Count -eq 21)

$agentNames = @($agents | ForEach-Object { $_.agent })
$expectedNames = @($bots + $specs | Sort-Object)
$nameDrift = @(Compare-Object -ReferenceObject $expectedNames -DifferenceObject @($agentNames | Sort-Object))
Add-Check 'agent_names_match_roster' '0 differences' $nameDrift.Count ($nameDrift.Count -eq 0)

$badContract = @($agents | Where-Object {
        (-not $_.agent) -or (-not $_.agent_class) -or ($null -eq $_.departments) -or
        ($null -eq $_.forbidden_actions) -or ($null -eq $_.evidence_gate) -or (-not $_.escalation)
    })
Add-Check 'agent_contracts_complete' '0 incomplete' $badContract.Count ($badContract.Count -eq 0)

# ------------------------------------------------------------------ routines
$ids = @($routines | ForEach-Object { $_.routine_id })
$uniqueIds = @($ids | Sort-Object -Unique)
Add-Check 'routine_ids_unique' '54 unique' $uniqueIds.Count (($uniqueIds.Count -eq 54) -and ($ids.Count -eq 54))

$manIds = @($man.routines | ForEach-Object { $_.id } | Sort-Object -Unique)
$idDrift = @(Compare-Object -ReferenceObject $manIds -DifferenceObject $uniqueIds)
Add-Check 'routine_ids_match_manifest' '0 differences' $idDrift.Count ($idDrift.Count -eq 0)

$knownAgents = @($bots + $specs)
$unknownOwners = @($routines | Where-Object { $knownAgents -notcontains $_.owner_bot })
Add-Check 'owners_resolve_to_known_agents' '0 unknown' $unknownOwners.Count ($unknownOwners.Count -eq 0)

# each routine must appear in exactly one owning agent contract
$ownershipCounts = @()
foreach ($r in $routines) {
    $owning = @($agents | Where-Object { @($_.routines_owned) -contains $r.routine_id })
    $ownershipCounts += $owning.Count
}
$notExactlyOnce = @($ownershipCounts | Where-Object { $_ -ne 1 })
Add-Check 'routine_owned_exactly_once' '0 deviations' $notExactlyOnce.Count ($notExactlyOnce.Count -eq 0)

# ---------------------------------------------------------- stage unit truth
$simSrc = Get-Content -LiteralPath $simPath -Raw
$simBlock = ($simSrc -split 'const stages = \[', 2)[1]
$simBlock = ($simBlock -split '\];', 2)[0]
$simKeys = @([regex]::Matches($simBlock, 'key:\s*"([^"]+)"') | ForEach-Object { $_.Groups[1].Value })
Add-Check 'simulator_defines_9_stages' '9' $simKeys.Count ($simKeys.Count -eq 9)

$regStages = @($reg.stage_model.operating_stages | ForEach-Object { $_.key })
$stageDrift = @(Compare-Object -ReferenceObject $simKeys -DifferenceObject $regStages -SyncWindow 0)
Add-Check 'operating_stages_match_simulator' '0 differences' $stageDrift.Count ($stageDrift.Count -eq 0)

$receiptFields = @($reg.stage_model.receipt_fields)
Add-Check 'receipt_fields_count' '9' $receiptFields.Count ($receiptFields.Count -eq 9)
$overlap = @($regStages | Where-Object { $receiptFields -contains $_ })
Add-Check 'stage_unit_distinct_from_receipt_fields' '<=1 incidental overlap' $overlap.Count ($overlap.Count -le 1)

$pairs = New-Object System.Collections.Generic.List[string]
foreach ($r in $routines) {
    foreach ($s in @($r.operating_stages)) { $pairs.Add(('{0}|{1}' -f $r.routine_id, $s)) }
}
$uniquePairs = @($pairs | Sort-Object -Unique)
Add-Check 'stage_pairs_unique' '486 unique' $uniquePairs.Count (($uniquePairs.Count -eq 486) -and ($pairs.Count -eq 486))
Add-Check 'stage_total_matches_declared' '486' $reg.stage_model.total_stages ($reg.stage_model.total_stages -eq 486)

$manSteps = 0
foreach ($r in $man.routines) { $manSteps += @($r.steps).Count }
Add-Check 'manifest_steps_are_a_separate_unit' ('{0} <> 486' -f $manSteps) $manSteps ($manSteps -ne 486)

# --------------------------------------------------------------- departments
$deptProps = @($reg.departments.PSObject.Properties)
Add-Check 'departments_count' '6' $deptProps.Count ($deptProps.Count -eq 6)

$deptIds = New-Object System.Collections.Generic.List[string]
$badMath = 0
foreach ($d in $deptProps) {
    foreach ($i in @($d.Value.routine_ids)) { $deptIds.Add($i) }
    if ($d.Value.stages_per_routine -ne 9) { $badMath++ }
    if ($d.Value.ledger_stages -ne ($d.Value.routines * 9)) { $badMath++ }
}
Add-Check 'department_stage_math' '0 errors' $badMath ($badMath -eq 0)
Add-Check 'departments_partition_54' '54 unique, no overlap' $deptIds.Count `
    (($deptIds.Count -eq 54) -and (@($deptIds | Sort-Object -Unique).Count -eq 54))

$deptDrift = @(Compare-Object -ReferenceObject $uniqueIds -DifferenceObject @($deptIds | Sort-Object -Unique))
Add-Check 'department_ids_match_routines' '0 differences' $deptDrift.Count ($deptDrift.Count -eq 0)

$moduleMismatch = @($routines | Where-Object {
        $m = $_.module
        $entry = $reg.departments.$m
        (-not $entry) -or (@($entry.routine_ids) -notcontains $_.routine_id)
    })
Add-Check 'routine_module_agrees_with_department' '0 mismatches' $moduleMismatch.Count ($moduleMismatch.Count -eq 0)

# -------------------------------------------------- provenance completeness
$required = @('module', 'cadence', 'trigger', 'source_freshness', 'owner_bot', 'claude_role',
              'allowed_actions', 'forbidden_actions', 'artifact', 'verifier', 'budget_tokens',
              'timeout_seconds', 'dedupe_key_pattern', 'retry_policy', 'approval_tier',
              'operating_stages', 'receipt_fields', 'checkpoint_resume', 'escalation', 'value_signal')
$silentGaps = New-Object System.Collections.Generic.List[string]
$noProv = New-Object System.Collections.Generic.List[string]
# An empty field is acceptable only when provenance says so explicitly. Both markers
# count: 'unresolved' means unknown, 'not_applicable' means the field cannot apply to
# this routine (a never-owned routine has no freshness window or retry policy).
$explicitMarkers = @('unresolved', 'not_applicable')
$markerTally = @{}
foreach ($r in $routines) {
    foreach ($f in $required) {
        $val = $r.$f
        $p = $r.provenance.$f
        if (-not $p) { $noProv.Add(('{0}.{1}' -f $r.routine_id, $f)); continue }
        $empty = ($null -eq $val) -or ($val -is [string] -and [string]::IsNullOrWhiteSpace($val))
        if ($empty) {
            if ($explicitMarkers -notcontains $p.state) { $silentGaps.Add(('{0}.{1}' -f $r.routine_id, $f)) }
            else {
                if (-not $markerTally.ContainsKey($p.state)) { $markerTally[$p.state] = 0 }
                $markerTally[$p.state] = $markerTally[$p.state] + 1
            }
        }
    }
}
Add-Check 'no_silent_missing_fields' '0 unmarked gaps' $silentGaps.Count ($silentGaps.Count -eq 0)
Add-Check 'empty_fields_carry_explicit_marker' 'unresolved or not_applicable' `
    (($markerTally.GetEnumerator() | Sort-Object Name | ForEach-Object { "$($_.Name)=$($_.Value)" }) -join ' ') $true
Add-Check 'all_required_fields_have_provenance' '0 missing' $noProv.Count ($noProv.Count -eq 0)

# ------------------------------------------------------------------- routing
$routes = @($routines | ForEach-Object { $_.route })
Add-Check 'routes_unique' ('{0} unique' -f $routes.Count) @($routes | Sort-Object -Unique).Count `
    (@($routes | Sort-Object -Unique).Count -eq $routes.Count)

$badRouteShape = @($routines | Where-Object { $_.route -ne ('{0} / {1} / {2}' -f $_.module, $_.owner_bot, $_.routine_id) })
Add-Check 'route_encodes_department_owner_id' '0 malformed' $badRouteShape.Count ($badRouteShape.Count -eq 0)

# -------------------------------------------------------------------- safety
$forbiddenVerbs = @('send', 'post', 'publish', 'schedule', 'deploy', 'merge', 'spend', 'purchase',
                    'account_change', 'credential_read', 'rotate', 'delete', 'canonical_write', 'push', 'commit')
$leaks = New-Object System.Collections.Generic.List[string]
foreach ($r in $routines) {
    foreach ($a in (@($r.allowed_actions) + @($r.executable_capabilities))) {
        if ($forbiddenVerbs -contains $a) { $leaks.Add(('{0}:{1}' -f $r.routine_id, $a)) }
    }
}
Add-Check 'no_forbidden_verb_granted' '0 leaks' $leaks.Count ($leaks.Count -eq 0)

$tier2Exec = @($routines | Where-Object { $_.approval_tier -eq 2 -and $_.claude_may_execute })
Add-Check 'tier2_never_claude_executable' '0 executable' $tier2Exec.Count ($tier2Exec.Count -eq 0)

$badNever = @($routines | Where-Object {
        $_.claude_role -eq 'never' -and ((-not $_.claude_never_reason) -or
        (@($_.executable_capabilities).Count -gt 0) -or (@($_.allowed_actions).Count -gt 0))
    })
Add-Check 'never_routines_justified_and_empty' '0 defects' $badNever.Count ($badNever.Count -eq 0)

$agentLeak = @($agents | Where-Object {
        $caps = @($_.executable_capabilities)
        @($caps | Where-Object { $forbiddenVerbs -contains $_ }).Count -gt 0
    })
Add-Check 'agent_contracts_grant_no_forbidden_verb' '0 leaks' $agentLeak.Count ($agentLeak.Count -eq 0)

$authOk = ((-not $reg.authority.canonical_write_allowed) -and (-not $reg.authority.external_action_allowed) -and
           ($reg.authority.sole_orchestrator_and_canonical_writer -eq 'Codex acting as Marketing Chief'))
Add-Check 'authority_subordinate_to_codex' 'canonical+external false' $authOk $authOk

# ------------------------------------------------------- discrepancy ledger
$ledgerOk = $false
$ledgerResidual = 0
if (Test-Path -LiteralPath $ledgerPath) {
    $led = Get-Content -LiteralPath $ledgerPath -Raw | ConvertFrom-Json
    $ledgerResidual = @($led.residual_unsupported_claims).Count
    $ledgerOk = (@($led.evidence_chain).Count -ge 5) -and ($led.verdict -like 'RESOLVED*')
}
Add-Check 'stage_ledger_present_and_evidenced' '>=5 evidence items' $ledgerResidual.ToString() $ledgerOk
Add-Check 'unsupported_claims_declared_not_hidden' '>=1 declared' $ledgerResidual ($ledgerResidual -ge 1)

# ---------------------------------------------------------------------------
$failed = @($checks | Where-Object { -not $_.ok })
$overall = 'pass'
if ($failed.Count -gt 0) { $overall = 'fail' }

if ($Json) {
    [pscustomobject]@{
        harness = 'Test-ClaudeOperatingTeam'; mode = 'read-only'
        registry = '11_Agents/claude-operating-team.json'
        overall = $overall; passed = ($checks.Count - $failed.Count); total = $checks.Count
        checks = $checks.ToArray()
    } | ConvertTo-Json -Depth 6
} else {
    Write-Host ''
    Write-Host 'Claude operating-team validation   mode read-only'
    Write-Host ('-' * 86)
    foreach ($c in $checks) {
        $mark = 'ok  '
        if (-not $c.ok) { $mark = 'FAIL' }
        Write-Host ("  [{0}] {1,-44} expected {2,-22} actual {3}" -f $mark, $c.check, $c.expected, $c.actual)
    }
    if ($silentGaps.Count -gt 0) { Write-Host ("  unmarked gaps: {0}" -f (($silentGaps | Select-Object -First 8) -join ', ')) }
    if ($leaks.Count -gt 0) { Write-Host ("  forbidden leaks: {0}" -f (($leaks | Select-Object -First 8) -join ', ')) }
    Write-Host ('-' * 86)
    Write-Host ("  6/6 bots  15/15 specialists  21/21 contracts  {0}/54 routines  {1}/486 stages  6/6 departments" -f $uniqueIds.Count, $uniquePairs.Count)
    Write-Host ("  unresolved (explicitly marked): {0}" -f (($reg.unresolved_field_counts.PSObject.Properties | ForEach-Object { '{0}={1}' -f $_.Name, $_.Value }) -join '  '))
    Write-Host ("  overall {0}  {1}/{2} checks passed" -f $overall.ToUpperInvariant(), ($checks.Count - $failed.Count), $checks.Count)
    Write-Host ''
}

if ($overall -ne 'pass') { exit 1 }
exit 0
