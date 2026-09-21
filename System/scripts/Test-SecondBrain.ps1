[CmdletBinding()]
param(
    [string]$VaultRoot = (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent),
    [switch]$Json
)

$ErrorActionPreference = 'Stop'

# The loop reads this script's stdout over a redirected pipe and parses it as JSON. Without
# this, Windows PowerShell encodes stdout in the OEM code page and best-fit-maps anything
# it cannot represent: U+201D becomes a bare ASCII quote, which terminates a JSON string
# early and fails the whole routine at stage:build. Parent-side StandardOutputEncoding
# cannot repair it - the character is destroyed in this process's encoder.
try { [Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false) } catch { }

$resolvedVault = (Resolve-Path -LiteralPath $VaultRoot).Path
$issues = New-Object System.Collections.Generic.List[object]

function Add-Issue {
    param(
        [ValidateSet('error', 'warning')]
        [string]$Severity,
        [string]$Code,
        [string]$Path,
        [string]$Detail
    )

    $issues.Add([pscustomobject]@{
        severity = $Severity
        code = $Code
        path = $Path
        detail = $Detail
    })
}

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
            $properties[$Matches.key] = [string]$Matches.value
        }
    }

    return $properties
}

$requiredPaths = @(
    'AGENTS.md',
    'INDEX.md',
    '12_Brain/00_Home.md',
    '12_Brain/09_Ops/Architecture.md',
    '12_Brain/09_Ops/Schema.md',
    '12_Brain/09_Ops/AGENT_PROTOCOL.md',
    '12_Brain/09_Ops/Runbook.md',
    '12_Brain/10_Maps/00_Atlas.md',
    '12_Brain/10_Maps/README.md',
    '12_Brain/Bases/Command Center.base',
    '12_Brain/Bases/Client Intelligence.base',
    '12_Brain/Bases/Memory Ledger.base',
    '12_Brain/Bases/Strategy Library.base',
    '12_Brain/Bases/Client Strategy Overlays.base',
    '.obsidian/templates.json',
    '.obsidian/daily-notes.json',
    'System/scripts/Measure-SecondBrainGraph.ps1',
    'System/scripts/Update-SecondBrainMaps.ps1',
    'System/scripts/Update-KnowledgeCoverage.ps1',
    'System/scripts/Update-ClientIntelligenceCoverage.ps1'
)

foreach ($relativePath in $requiredPaths) {
    $absolutePath = Join-Path $resolvedVault ($relativePath.Replace('/', '\'))
    if (-not (Test-Path -LiteralPath $absolutePath)) {
        Add-Issue -Severity error -Code 'required_path_missing' -Path $relativePath -Detail 'Required second-brain path is missing.'
    }
}

$markdownFiles = @(
    Get-ChildItem -LiteralPath $resolvedVault -Recurse -Filter '*.md' -File |
        Where-Object {
            $_.FullName -notmatch '\\.git\\' -and
            $_.FullName -notmatch '\\node_modules\\'
        }
)

$baseFiles = @(
    Get-ChildItem -LiteralPath $resolvedVault -Recurse -Filter '*.base' -File |
        Where-Object { $_.FullName -notmatch '\\.git\\' }
)

$notesByStem = @{}
$notesByBaseName = @{}
$noteRecords = New-Object System.Collections.Generic.List[object]
$ids = @{}

foreach ($file in $markdownFiles) {
    $relativePath = Get-RelativeVaultPath -FullName $file.FullName
    $relativeStem = $relativePath.Substring(0, $relativePath.Length - 3)
    $baseName = [IO.Path]::GetFileNameWithoutExtension($file.Name)

    $notesByStem[$relativeStem.ToLowerInvariant()] = $true
    if (-not $notesByBaseName.ContainsKey($baseName.ToLowerInvariant())) {
        $notesByBaseName[$baseName.ToLowerInvariant()] = New-Object System.Collections.Generic.List[string]
    }
    $notesByBaseName[$baseName.ToLowerInvariant()].Add($relativeStem)

    # Vault notes are BOM-less UTF-8. Without -Encoding, Windows PowerShell reads them in the
    # ANSI code page, so an em-dash arrives as three junk characters and a wikilink whose
    # target file exists on disk is reported unresolved.
    [string]$text = Get-Content -LiteralPath $file.FullName -Raw -Encoding UTF8
    $frontmatter = Get-Frontmatter -Text $text
    $noteRecords.Add([pscustomobject]@{
        file = $file
        relativePath = $relativePath
        relativeStem = $relativeStem
        text = $text
        frontmatter = $frontmatter
    })

    if ($frontmatter.ContainsKey('id') -and -not [string]::IsNullOrWhiteSpace([string]$frontmatter.id)) {
        $id = ([string]$frontmatter.id).Trim(' ', '"', "'")
        if ($ids.ContainsKey($id)) {
            Add-Issue -Severity error -Code 'duplicate_id' -Path $relativePath -Detail "Duplicate id also used by $($ids[$id])."
        }
        else {
            $ids[$id] = $relativePath
        }
    }

    if ($text -match '(?im)^\s*(api[_-]?key|access[_-]?token|password|secret)\s*:\s*["'']?[A-Za-z0-9_./+=-]{12,}') {
        Add-Issue -Severity error -Code 'possible_secret' -Path $relativePath -Detail 'Possible raw secret value detected; inspect privately without printing it.'
    }
}

foreach ($baseFile in $baseFiles) {
    $baseRelativePath = Get-RelativeVaultPath -FullName $baseFile.FullName
    $baseRelativeStem = $baseRelativePath.Substring(0, $baseRelativePath.Length - 5)
    $notesByStem[$baseRelativePath.ToLowerInvariant()] = $true
    $notesByStem[$baseRelativeStem.ToLowerInvariant()] = $true
}

# Canvas files are link targets too ([[12_Brain/Brain Map.canvas]]); without this the
# front door's own visual-view link is reported as unresolved every run.
$canvasFiles = @(
    Get-ChildItem -LiteralPath $resolvedVault -Recurse -Filter '*.canvas' -File |
        Where-Object { $_.FullName -notmatch '\\.git\\' }
)
foreach ($canvasFile in $canvasFiles) {
    $canvasRelativePath = Get-RelativeVaultPath -FullName $canvasFile.FullName
    $notesByStem[$canvasRelativePath.ToLowerInvariant()] = $true
    $notesByStem[$canvasRelativePath.Substring(0, $canvasRelativePath.Length - 7).ToLowerInvariant()] = $true
}

$compiledFolders = @(
    '12_Brain/02_Entities/',
    '12_Brain/03_Concepts/',
    '12_Brain/04_Decisions/',
    '12_Brain/05_Projects/',
    '12_Brain/06_Research/',
    '12_Brain/08_Memory/'
)

foreach ($record in $noteRecords) {
    $isCompiled = $false
    foreach ($folder in $compiledFolders) {
        if ($record.relativePath.StartsWith($folder, [StringComparison]::OrdinalIgnoreCase)) {
            $isCompiled = $true
            break
        }
    }

    if ($isCompiled -and [IO.Path]::GetFileName($record.relativePath) -ne 'README.md') {
        foreach ($requiredProperty in @('note_type', 'status', 'created', 'updated', 'source_refs', 'tags')) {
            if (-not $record.frontmatter.ContainsKey($requiredProperty)) {
                Add-Issue -Severity error -Code 'required_property_missing' -Path $record.relativePath -Detail "Missing required property: $requiredProperty."
            }
        }
    }

    # _archive holds retired sections. They stay in the vault and in git, but they
    # are not live knowledge, so they must not generate link or schema warnings.
    # Tool-harness folders (.claude, .agents for Codex, .codex, .cursor, .hermes) hold skill
    # and agent definitions with placeholder links like [[01_Clients/<Client>]]; they are
    # not vault knowledge and must not raise link warnings.
    if ($record.relativePath -match '^\.(?:claude|agents|codex|cursor|hermes)/' -or $record.relativePath -match '^_archive/') {
        continue
    }

    # Strip fenced blocks and inline code before extracting links: a doc that
    # shows `[[wikilinks]]` as an example is not making a broken reference.
    $linkScanText = [regex]::Replace($record.text, '(?ms)^```.*?^```', '')
    $linkScanText = [regex]::Replace($linkScanText, '`[^`

]*`', '')
    $linkMatches = [regex]::Matches($linkScanText, '\[\[(?<target>[^\]|#]+)(?:#[^\]|]+)?(?:\|[^\]]+)?\]\]')
    foreach ($linkMatch in $linkMatches) {
        $target = $linkMatch.Groups['target'].Value.Trim().Replace('\', '/')
        if ([string]::IsNullOrWhiteSpace($target) -or $target -match '^[a-z]+://') {
            continue
        }

        if ($target.EndsWith('.md', [StringComparison]::OrdinalIgnoreCase)) {
            $target = $target.Substring(0, $target.Length - 3)
        }

        $candidateKeys = New-Object System.Collections.Generic.List[string]
        $candidateKeys.Add($target.TrimStart('/').ToLowerInvariant())

        $recordDirectory = [IO.Path]::GetDirectoryName($record.relativeStem)
        if (-not [string]::IsNullOrWhiteSpace($recordDirectory)) {
            $combined = [IO.Path]::GetFullPath(
                (Join-Path $resolvedVault (Join-Path $recordDirectory $target))
            )
            if ($combined.StartsWith($resolvedVault, [StringComparison]::OrdinalIgnoreCase)) {
                $candidateKeys.Add(
                    $combined.Substring($resolvedVault.Length + 1).Replace('\', '/').ToLowerInvariant()
                )
            }
        }

        $resolved = $false
        foreach ($candidateKey in $candidateKeys) {
            if ($notesByStem.ContainsKey($candidateKey)) {
                $resolved = $true
                break
            }
        }

        if (-not $resolved) {
            $targetBaseName = [IO.Path]::GetFileName($target).ToLowerInvariant()
            if ($notesByBaseName.ContainsKey($targetBaseName)) {
                $resolved = $true
            }
        }

        if (-not $resolved) {
            Add-Issue -Severity warning -Code 'unresolved_wikilink' -Path $record.relativePath -Detail "Unresolved link target: $target."
        }
    }
}

foreach ($baseFile in $baseFiles) {
    $relativePath = Get-RelativeVaultPath -FullName $baseFile.FullName
    if ($baseFile.Length -eq 0 -and -not $relativePath.StartsWith('12_Brain/Bases/', [StringComparison]::OrdinalIgnoreCase)) {
        Add-Issue -Severity warning -Code 'empty_scratch_base' -Path $relativePath -Detail 'Empty scratch Base is outside the managed brain layer; either name it and add a view or remove it after review.'
        continue
    }
    [string]$baseText = Get-Content -LiteralPath $baseFile.FullName -Raw -Encoding UTF8
    if ($baseText -notmatch '(?m)^views:\s*$') {
        Add-Issue -Severity error -Code 'base_views_missing' -Path $relativePath -Detail 'Base file has no views section.'
    }
    if ($baseText -match "`t") {
        Add-Issue -Severity error -Code 'base_tab_indentation' -Path $relativePath -Detail 'Base YAML contains tab indentation.'
    }
}

$graphScript = Join-Path $PSScriptRoot 'Measure-SecondBrainGraph.ps1'
$graph = $null
if (Test-Path -LiteralPath $graphScript) {
    $graphOutput = & $graphScript -VaultRoot $resolvedVault -Json
    $graph = $graphOutput | ConvertFrom-Json

    if ($graph.components -gt 1) {
        $severity = if ($graph.largestComponentCoverage -lt 90) { 'error' } else { 'warning' }
        Add-Issue -Severity $severity -Code 'graph_fragmented' -Path '12_Brain/10_Maps/00_Atlas.md' -Detail "$($graph.components) components; largest component covers $($graph.largestComponentCoverage)% of visible notes."
    }
    if ($graph.orphans -gt 0) {
        Add-Issue -Severity warning -Code 'graph_orphans' -Path '12_Brain/10_Maps/00_Atlas.md' -Detail "$($graph.orphans) visible notes have no resolved connections. Run Update-SecondBrainMaps.ps1."
    }
}

$errorCount = @($issues | Where-Object severity -eq 'error').Count
$warningCount = @($issues | Where-Object severity -eq 'warning').Count
$brainNoteCount = @($markdownFiles | Where-Object FullName -like '*\12_Brain\*').Count
$status = 'pass'
if ($errorCount -gt 0) {
    $status = 'fail'
}
elseif ($warningCount -gt 0) {
    $status = 'warning'
}
$issueArray = $issues.ToArray()

$result = [pscustomobject]@{
    schemaVersion = 1
    status = $status
    vaultRoot = $resolvedVault
    checkedAtUtc = [DateTime]::UtcNow.ToString('o')
    summary = [pscustomobject]@{
        markdownFiles = $markdownFiles.Count
        brainNotes = $brainNoteCount
        baseFiles = $baseFiles.Count
        graphNodes = if ($null -ne $graph) { [int]$graph.nodes } else { 0 }
        graphEdges = if ($null -ne $graph) { [int]$graph.edges } else { 0 }
        graphComponents = if ($null -ne $graph) { [int]$graph.components } else { 0 }
        graphLargestComponentCoverage = if ($null -ne $graph) { [double]$graph.largestComponentCoverage } else { 0 }
        graphOrphans = if ($null -ne $graph) { [int]$graph.orphans } else { 0 }
        errorCount = $errorCount
        warningCount = $warningCount
    }
    issues = $issueArray
}

if ($Json) {
    $result | ConvertTo-Json -Depth 8
}
else {
    $result | Format-List status, vaultRoot, checkedAtUtc
    $result.summary | Format-List
    if ($issues.Count -gt 0) {
        $issues | Sort-Object severity, code, path | Format-Table -AutoSize -Wrap
    }
}

if ($errorCount -gt 0) {
    exit 1
}

exit 0
