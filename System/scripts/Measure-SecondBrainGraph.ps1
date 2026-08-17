[CmdletBinding()]
param(
    [string]$VaultRoot = (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent),
    [switch]$Json
)

$ErrorActionPreference = 'Stop'
$resolvedVault = (Resolve-Path -LiteralPath $VaultRoot).Path

function Get-RelativeVaultPath {
    param([string]$FullName)

    return $FullName.Substring($resolvedVault.Length + 1).Replace('\', '/')
}

function Test-IsGraphNote {
    param([string]$RelativePath)

    return (
        $RelativePath -notmatch '^(?:\.git|\.obsidian|\.claude|\.cursor|\.hermes)(?:/|$)' -and
        $RelativePath -notmatch '(?:^|/)node_modules(?:/|$)'
    )
}

$files = @(
    Get-ChildItem -LiteralPath $resolvedVault -Recurse -Filter '*.md' -File |
        Where-Object {
            Test-IsGraphNote -RelativePath (Get-RelativeVaultPath -FullName $_.FullName)
        }
)

$records = New-Object System.Collections.Generic.List[object]
$notesByStem = @{}
$notesByBaseName = @{}

foreach ($file in $files) {
    $relativePath = Get-RelativeVaultPath -FullName $file.FullName
    $relativeStem = $relativePath.Substring(0, $relativePath.Length - 3)
    $baseName = [IO.Path]::GetFileName($relativeStem).ToLowerInvariant()
    [string]$text = Get-Content -LiteralPath $file.FullName -Raw

    $record = [pscustomobject]@{
        relativePath = $relativePath
        relativeStem = $relativeStem
        text = if ($null -eq $text) { '' } else { $text }
    }
    $records.Add($record)
    $notesByStem[$relativeStem.ToLowerInvariant()] = $relativeStem

    if (-not $notesByBaseName.ContainsKey($baseName)) {
        $notesByBaseName[$baseName] = New-Object System.Collections.Generic.List[string]
    }
    $notesByBaseName[$baseName].Add($relativeStem)
}

$adjacency = @{}
foreach ($record in $records) {
    $adjacency[$record.relativeStem] = New-Object 'System.Collections.Generic.HashSet[string]' ([StringComparer]::OrdinalIgnoreCase)
}

$edges = New-Object 'System.Collections.Generic.HashSet[string]' ([StringComparer]::OrdinalIgnoreCase)
$unresolvedLinkOccurrences = 0

foreach ($record in $records) {
    $linkMatches = [regex]::Matches(
        $record.text,
        '\[\[(?<target>[^\]|#]+)(?:#[^\]|]+)?(?:\|[^\]]+)?\]\]'
    )

    foreach ($linkMatch in $linkMatches) {
        $target = $linkMatch.Groups['target'].Value.Trim().Replace('\', '/')
        if ([string]::IsNullOrWhiteSpace($target) -or $target -match '^[a-z]+://') {
            continue
        }
        if ($target.EndsWith('.md', [StringComparison]::OrdinalIgnoreCase)) {
            $target = $target.Substring(0, $target.Length - 3)
        }

        $resolvedTarget = $null
        $directKey = $target.TrimStart('/').ToLowerInvariant()
        if ($notesByStem.ContainsKey($directKey)) {
            $resolvedTarget = $notesByStem[$directKey]
        }

        if ($null -eq $resolvedTarget) {
            $recordDirectory = [IO.Path]::GetDirectoryName($record.relativeStem)
            if (-not [string]::IsNullOrWhiteSpace($recordDirectory)) {
                try {
                    $combined = [IO.Path]::GetFullPath(
                        (Join-Path $resolvedVault (Join-Path $recordDirectory $target))
                    )
                    if ($combined.StartsWith($resolvedVault, [StringComparison]::OrdinalIgnoreCase)) {
                        $relativeCombined = $combined.Substring($resolvedVault.Length + 1).Replace('\', '/').ToLowerInvariant()
                        if ($notesByStem.ContainsKey($relativeCombined)) {
                            $resolvedTarget = $notesByStem[$relativeCombined]
                        }
                    }
                }
                catch {
                    $resolvedTarget = $null
                }
            }
        }

        if ($null -eq $resolvedTarget) {
            $targetBaseName = [IO.Path]::GetFileName($target).ToLowerInvariant()
            if (
                $notesByBaseName.ContainsKey($targetBaseName) -and
                $notesByBaseName[$targetBaseName].Count -eq 1
            ) {
                $resolvedTarget = $notesByBaseName[$targetBaseName][0]
            }
        }

        if ($null -eq $resolvedTarget) {
            $unresolvedLinkOccurrences++
            continue
        }
        if ($resolvedTarget -eq $record.relativeStem) {
            continue
        }

        [void]$adjacency[$record.relativeStem].Add($resolvedTarget)
        [void]$adjacency[$resolvedTarget].Add($record.relativeStem)
        $edgePair = @($record.relativeStem, $resolvedTarget) | Sort-Object
        [void]$edges.Add(($edgePair -join '|'))
    }
}

$visited = New-Object 'System.Collections.Generic.HashSet[string]' ([StringComparer]::OrdinalIgnoreCase)
$componentRecords = New-Object System.Collections.Generic.List[object]

foreach ($record in $records) {
    $start = $record.relativeStem
    if ($visited.Contains($start)) {
        continue
    }

    $queue = New-Object System.Collections.Generic.Queue[string]
    $members = New-Object System.Collections.Generic.List[string]
    $queue.Enqueue($start)
    [void]$visited.Add($start)

    while ($queue.Count -gt 0) {
        $node = $queue.Dequeue()
        $members.Add($node)
        foreach ($neighbor in $adjacency[$node]) {
            if ($visited.Add($neighbor)) {
                $queue.Enqueue($neighbor)
            }
        }
    }

    $componentRecords.Add([pscustomobject]@{
        size = $members.Count
        sample = @($members | Sort-Object | Select-Object -First 5)
    })
}

$sortedComponents = @($componentRecords | Sort-Object size -Descending)
$orphanPaths = @(
    $records |
        Where-Object { $adjacency[$_.relativeStem].Count -eq 0 } |
        ForEach-Object relativeStem |
        Sort-Object
)
$nodeCount = $records.Count
$largestComponent = if ($sortedComponents.Count -gt 0) { $sortedComponents[0].size } else { 0 }
$largestComponentCoverage = if ($nodeCount -gt 0) {
    [math]::Round((100 * $largestComponent / $nodeCount), 1)
}
else {
    100
}
$orphanRate = if ($nodeCount -gt 0) {
    [math]::Round((100 * $orphanPaths.Count / $nodeCount), 1)
}
else {
    0
}

$folderRecords = @(
    $records |
        ForEach-Object {
            $parts = $_.relativeStem -split '/'
            $folder = if ($parts.Count -gt 1) { $parts[0] } else { '(root)' }
            [pscustomobject]@{
                folder = $folder
                orphan = [int]($adjacency[$_.relativeStem].Count -eq 0)
            }
        } |
        Group-Object folder |
        ForEach-Object {
            [pscustomobject]@{
                folder = $_.Name
                notes = $_.Count
                orphans = @($_.Group | Where-Object orphan -eq 1).Count
            }
        } |
        Sort-Object notes -Descending
)

$topDegree = @(
    $records |
        ForEach-Object {
            [pscustomobject]@{
                note = $_.relativeStem
                degree = $adjacency[$_.relativeStem].Count
            }
        } |
        Sort-Object degree -Descending |
        Select-Object -First 15
)

$result = [pscustomobject]@{
    schemaVersion = 1
    vaultRoot = $resolvedVault
    checkedAtUtc = [DateTime]::UtcNow.ToString('o')
    nodes = $nodeCount
    edges = $edges.Count
    components = $sortedComponents.Count
    largestComponent = $largestComponent
    largestComponentCoverage = $largestComponentCoverage
    orphans = $orphanPaths.Count
    orphanRate = $orphanRate
    unresolvedLinkOccurrences = $unresolvedLinkOccurrences
    largestComponents = @($sortedComponents | Select-Object -First 10)
    orphanPaths = $orphanPaths
    folders = $folderRecords
    topDegree = $topDegree
}

if ($Json) {
    $result | ConvertTo-Json -Depth 8
}
else {
    $result | Format-List nodes, edges, components, largestComponent, largestComponentCoverage, orphans, orphanRate, unresolvedLinkOccurrences
    $folderRecords | Format-Table -AutoSize
}

