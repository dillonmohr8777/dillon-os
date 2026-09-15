[CmdletBinding()]
param(
    [string]$VaultRoot = (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent),
    [string]$RegistryPath = 'C:\Users\dillo\Documents\Codex\projects\client-operations\registry\clients.json',
    [string]$OutputPath = '12_Brain/09_Ops/Client Intelligence Coverage.md'
)

$ErrorActionPreference = 'Stop'
$resolvedVault = (Resolve-Path -LiteralPath $VaultRoot).Path
$resolvedRegistry = (Resolve-Path -LiteralPath $RegistryPath).Path
$utf8NoBom = New-Object Text.UTF8Encoding($false)
$today = (Get-Date).ToString('yyyy-MM-dd')
$checkedAt = (Get-Date).ToString('s')

function Get-RelativeVaultPath {
    param([string]$FullName)
    return $FullName.Substring($resolvedVault.Length + 1).Replace('\', '/')
}

function Get-Frontmatter {
    param([string]$Text)
    $properties = @{}
    if ($Text -notmatch '(?s)\A---\s*\r?\n(?<yaml>.*?)\r?\n---(?:\r?\n|\z)') {
        return $properties
    }
    foreach ($line in ($Matches.yaml -split '\r?\n')) {
        if ($line -match '^(?<key>[a-zA-Z0-9_-]+):(?:\s*(?<value>.*))?$') {
            $properties[$Matches.key] = ([string]$Matches.value).Trim(' ', '"', "'")
        }
    }
    return $properties
}

$registry = Get-Content -LiteralPath $resolvedRegistry -Raw | ConvertFrom-Json
$activeClients = @($registry.clients | Where-Object { $_.status -like 'active*' } | Sort-Object displayName)
$activeIds = New-Object 'System.Collections.Generic.HashSet[string]' ([StringComparer]::OrdinalIgnoreCase)
foreach ($client in $activeClients) { [void]$activeIds.Add([string]$client.id) }

$notes = @(
    Get-ChildItem -LiteralPath $resolvedVault -Recurse -Filter '*.md' -File |
        Where-Object {
            $_.FullName -notmatch '\\.git\\' -and
            $_.FullName -notmatch '\\node_modules\\'
        } |
        ForEach-Object {
            [string]$text = Get-Content -LiteralPath $_.FullName -Raw
            [pscustomobject]@{
                relativePath = Get-RelativeVaultPath -FullName $_.FullName
                frontmatter = Get-Frontmatter -Text $text
            }
        }
)

$overlays = @(
    $notes | Where-Object {
        $_.frontmatter.ContainsKey('note_type') -and
        $_.frontmatter.note_type -eq 'client_intelligence'
    }
)
$activeOverlays = @($overlays | Where-Object {
    -not $_.frontmatter.ContainsKey('status') -or $_.frontmatter.status -like 'active*'
})
$historicalOverlays = @($overlays | Where-Object {
    $_.frontmatter.ContainsKey('status') -and $_.frontmatter.status -notlike 'active*'
})

$missing = New-Object System.Collections.Generic.List[object]
$duplicates = New-Object System.Collections.Generic.List[object]
$rows = New-Object System.Collections.Generic.List[object]
foreach ($client in $activeClients) {
    $matches = @($activeOverlays | Where-Object {
        $_.frontmatter.ContainsKey('client_id') -and
        $_.frontmatter.client_id -eq $client.id
    })
    if ($matches.Count -eq 0) {
        $missing.Add($client)
        continue
    }
    if ($matches.Count -gt 1) { $duplicates.Add($client) }
    $overlay = $matches[0]
    $fm = $overlay.frontmatter
    $rows.Add([pscustomobject]@{
        client = $client.displayName
        clientId = $client.id
        path = $overlay.relativePath
        relationship = if ($fm.ContainsKey('relationship')) { $fm.relationship } else { '' }
        maturity = if ($fm.ContainsKey('intelligence_maturity')) { $fm.intelligence_maturity } else { 'missing' }
        evidenceAsOf = if ($fm.ContainsKey('evidence_as_of')) { $fm.evidence_as_of } else { '' }
        verification = if ($fm.ContainsKey('verification_status')) { $fm.verification_status } else { 'missing' }
        keyword = if ($fm.ContainsKey('keyword_state')) { $fm.keyword_state } else { 'missing' }
        aeoGeo = if ($fm.ContainsKey('aeo_geo_state')) { $fm.aeo_geo_state } else { 'missing' }
        pipeline = if ($fm.ContainsKey('pipeline_state')) { $fm.pipeline_state } else { 'missing' }
        reporting = if ($fm.ContainsKey('reporting_state')) { $fm.reporting_state } else { 'missing' }
        workflow = if ($fm.ContainsKey('workflow_state')) { $fm.workflow_state } else { 'missing' }
        nextAction = if ($fm.ContainsKey('next_action')) { $fm.next_action } else { '' }
    })
}

$extraOverlays = @($activeOverlays | Where-Object {
    -not $_.frontmatter.ContainsKey('client_id') -or
    -not $activeIds.Contains([string]$_.frontmatter.client_id)
})
$unmappedActiveOverviews = @($notes | Where-Object {
    $_.relativePath -match '^01_Clients/.+/overview\.md$' -and
    $_.frontmatter.ContainsKey('status') -and
    $_.frontmatter.status -like 'active*' -and
    -not $_.frontmatter.ContainsKey('client_id')
})

$status = if ($missing.Count -gt 0 -or $duplicates.Count -gt 0) { 'blocked' } elseif ($unmappedActiveOverviews.Count -gt 0 -or $extraOverlays.Count -gt 0) { 'needs-review' } else { 'healthy' }
$lines = @(
    '---'
    'note_type: system'
    "status: $status"
    'generated: true'
    'generated_by: Update-ClientIntelligenceCoverage'
    "updated: $today"
    "checked_at: $checkedAt"
    'tags:'
    '  - brain'
    '  - client-intelligence'
    '  - generated'
    '---'
    ''
    '# Client Intelligence Coverage'
    ''
    '> [!info] Generated portfolio audit'
    '> The canonical registry determines the expected active roster. Dated local'
    '> evidence does not prove present-tense platform state.'
    ''
    '## Snapshot'
    ''
    "- Canonical active routes: **$($activeClients.Count)**"
    "- Active intelligence overlays present: **$($rows.Count)**"
    "- Historical intelligence overlays retained: **$($historicalOverlays.Count)**"
    "- Missing overlays: **$($missing.Count)**"
    "- Duplicate overlays: **$($duplicates.Count)**"
    "- Extra or non-active overlays: **$($extraOverlays.Count)**"
    "- Active vault overviews without a canonical `client_id`: **$($unmappedActiveOverviews.Count)**"
    ''
    '## Active portfolio'
    ''
    '| Client | Relationship | Maturity | Evidence as of | Keywords | AEO/GEO | Pipeline | Reporting | Workflow |'
    '|---|---|---|---|---|---|---|---|---|'
)

foreach ($row in $rows | Sort-Object client) {
    $stem = $row.path.Substring(0, $row.path.Length - 3)
    $lines += "| [[$stem|$($row.client)]] | $($row.relationship) | $($row.maturity) | $($row.evidenceAsOf) | $($row.keyword) | $($row.aeoGeo) | $($row.pipeline) | $($row.reporting) | $($row.workflow) |"
}

$lines += @('', '## Reconciliation findings', '')
if ($missing.Count -eq 0 -and $duplicates.Count -eq 0 -and $extraOverlays.Count -eq 0 -and $unmappedActiveOverviews.Count -eq 0) {
    $lines += '- None.'
}
foreach ($client in $missing) { $lines += "- **Missing overlay:** $($client.displayName) (``$($client.id)``)." }
foreach ($client in $duplicates) { $lines += "- **Duplicate overlay:** $($client.displayName) (``$($client.id)``)." }
foreach ($overlay in $extraOverlays) { $lines += "- **Extra overlay:** [[$($overlay.relativePath.Substring(0, $overlay.relativePath.Length - 3))]]." }
foreach ($overview in $unmappedActiveOverviews) { $lines += "- **Unmapped active vault overview:** [[$($overview.relativePath.Substring(0, $overview.relativePath.Length - 3))]]. Confirm its canonical registry disposition before promotion or removal." }

$lines += @(
    ''
    '## Operating rule'
    ''
    'An overlay is a client-specific strategy and evidence surface. It does not'
    'replace the canonical client record, authorize account changes, or turn a'
    'dated metric into a current result. Refresh live sources before present-tense'
    'reporting or consequential action.'
    ''
    '## Connected views'
    ''
    '- [[12_Brain/Bases/Client Strategy Overlays.base|Client Strategy Overlays]]'
    '- [[12_Brain/09_Ops/Knowledge Coverage|Knowledge Coverage]]'
    '- [[12_Brain/09_Ops/Health|Brain Health]]'
)

$absoluteOutput = Join-Path $resolvedVault ($OutputPath.Replace('/', '\'))
if (-not $absoluteOutput.StartsWith($resolvedVault, [StringComparison]::OrdinalIgnoreCase)) {
    throw "Output path must remain inside the vault: $absoluteOutput"
}
[IO.File]::WriteAllText($absoluteOutput, (($lines -join [Environment]::NewLine) + [Environment]::NewLine), $utf8NoBom)

[pscustomobject]@{
    outputPath = $absoluteOutput
    status = $status
    activeRegistryClients = $activeClients.Count
    overlays = $rows.Count
    historical = $historicalOverlays.Count
    missing = $missing.Count
    duplicates = $duplicates.Count
    extra = $extraOverlays.Count
    unmappedActiveOverviews = $unmappedActiveOverviews.Count
}
