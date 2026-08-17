[CmdletBinding()]
param(
    [string]$VaultRoot = (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent),
    [string]$OutputRoot = '12_Brain/10_Maps'
)

$ErrorActionPreference = 'Stop'
$resolvedVault = (Resolve-Path -LiteralPath $VaultRoot).Path
$resolvedOutputRoot = Join-Path $resolvedVault ($OutputRoot.Replace('/', '\'))
$generatedRoot = Join-Path $resolvedOutputRoot 'Generated'
$utf8NoBom = New-Object Text.UTF8Encoding($false)
$today = (Get-Date).ToString('yyyy-MM-dd')

if (-not $resolvedOutputRoot.StartsWith($resolvedVault, [StringComparison]::OrdinalIgnoreCase)) {
    throw "Output root must remain inside the vault: $resolvedOutputRoot"
}

function Get-RelativeVaultPath {
    param([string]$FullName)

    return $FullName.Substring($resolvedVault.Length + 1).Replace('\', '/')
}

function Get-NoteLabel {
    param([string]$RelativePath)

    return [IO.Path]::GetFileNameWithoutExtension($RelativePath)
}

function Get-Wikilink {
    param(
        [string]$RelativePath,
        [string]$Label
    )

    $stem = if ($RelativePath.EndsWith('.md', [StringComparison]::OrdinalIgnoreCase)) {
        $RelativePath.Substring(0, $RelativePath.Length - 3)
    }
    else {
        $RelativePath
    }
    $safeLabel = $Label.Replace('|', ' ')
    return "[[$stem|$safeLabel]]"
}

function Get-SafeSlug {
    param([string]$Value)

    $slug = $Value.ToLowerInvariant()
    $slug = [regex]::Replace($slug, '[^a-z0-9]+', '-')
    $slug = $slug.Trim('-')
    if ([string]::IsNullOrWhiteSpace($slug)) {
        return 'map'
    }
    return $slug
}

function Get-Frontmatter {
    param(
        [string]$Title,
        [string]$MapType
    )

    return @(
        '---'
        'note_type: map'
        'status: active'
        'generated: true'
        'generated_by: Update-SecondBrainMaps'
        "map_type: $MapType"
        "updated: $today"
        'tags:'
        '  - brain'
        '  - map'
        '  - generated'
        '---'
        ''
        "# $Title"
        ''
        '> [!info] Generated connection map'
        '> Run `System/scripts/Update-SecondBrainMaps.ps1` after adding, moving, or'
        '> renaming notes. Edit source notes, not this generated file.'
        ''
    )
}

function Write-GeneratedMap {
    param(
        [string]$FileName,
        [string[]]$Lines
    )

    $absolutePath = Join-Path $generatedRoot $FileName
    if (-not $absolutePath.StartsWith($generatedRoot, [StringComparison]::OrdinalIgnoreCase)) {
        throw "Generated map path escaped its root: $absolutePath"
    }
    [IO.File]::WriteAllText(
        $absolutePath,
        (($Lines -join [Environment]::NewLine) + [Environment]::NewLine),
        $utf8NoBom
    )
    return Get-RelativeVaultPath -FullName $absolutePath
}

function Get-TopLevelGroup {
    param([string]$RelativePath)

    $parts = $RelativePath -split '/'
    if ($parts.Count -gt 1) {
        return $parts[0]
    }
    return '(root)'
}

function Get-DomainKey {
    param([string]$RelativePath)

    $top = Get-TopLevelGroup -RelativePath $RelativePath
    switch -Regex ($top) {
        '^01_Clients$' {
            return 'clients'
        }
        '^(02_Campaigns|03_Content|05_Offers|SEO)$' {
            return 'growth'
        }
        '^02_FullTimeJob$' {
            return 'align'
        }
        '^(11_Agents|System|_os)$' {
            return 'automation'
        }
        '^12_Brain$' {
            return 'knowledge'
        }
        '^(00_Inbox|10_Sessions|Daily-Briefs)$' {
            return 'sessions'
        }
        '^(04_SOPs|_templates)$' {
            return 'standards'
        }
        '^(05_Book|06_Personal|07_DBA|immohrtal-site|mohr-media-site)$' {
            return 'ventures'
        }
        '^\(root\)$' {
            if ($RelativePath -match '^(?:2026-\d\d-\d\d|Dashboard|INDEX)\.md$') {
                return 'sessions'
            }
            if ($RelativePath -match '^(?:AGENTS|CLAUDE)\.md$') {
                return 'standards'
            }
            if ($RelativePath -match '^Dryer Vent John\.md$') {
                return 'ventures'
            }
            return 'other'
        }
        default {
            return 'other'
        }
    }
}

if (-not (Test-Path -LiteralPath $generatedRoot)) {
    New-Item -ItemType Directory -Path $generatedRoot -Force | Out-Null
}

$outputPrefix = ($OutputRoot.TrimEnd('/') + '/')
$sourceNotes = @(
    Get-ChildItem -LiteralPath $resolvedVault -Recurse -Filter '*.md' -File |
        ForEach-Object {
            $relativePath = Get-RelativeVaultPath -FullName $_.FullName
            if (
                $relativePath -notmatch '^(?:\.git|\.obsidian|\.claude|\.cursor|\.hermes)(?:/|$)' -and
                $relativePath -notmatch '(?:^|/)node_modules(?:/|$)' -and
                -not $relativePath.StartsWith($outputPrefix, [StringComparison]::OrdinalIgnoreCase)
            ) {
                [pscustomobject]@{
                    relativePath = $relativePath
                    label = Get-NoteLabel -RelativePath $relativePath
                    topLevel = Get-TopLevelGroup -RelativePath $relativePath
                    domain = Get-DomainKey -RelativePath $relativePath
                }
            }
        } |
        Sort-Object relativePath
)

$domainDefinitions = @(
    [pscustomobject]@{
        key = 'clients'
        fileName = '01 Clients and Revenue.md'
        title = 'Clients and Revenue'
        description = 'Canonical client context, delivery records, active work, and revenue truth.'
        related = @('growth', 'automation', 'sessions')
    },
    [pscustomobject]@{
        key = 'growth'
        fileName = '02 Growth and Content.md'
        title = 'Growth and Content'
        description = 'Campaigns, content, SEO, offers, and the assets that turn strategy into demand.'
        related = @('clients', 'automation', 'standards')
    },
    [pscustomobject]@{
        key = 'align'
        fileName = '03 Align HCM.md'
        title = 'Align HCM'
        description = 'Full-time Align HCM work, kept distinct from client revenue and client delivery.'
        related = @('growth', 'sessions', 'standards')
    },
    [pscustomobject]@{
        key = 'automation'
        fileName = '04 Agents and Automation.md'
        title = 'Agents and Automation'
        description = 'Agent roles, system state, tooling, automation, and operating infrastructure.'
        related = @('clients', 'growth', 'knowledge')
    },
    [pscustomobject]@{
        key = 'knowledge'
        fileName = '05 Knowledge and Memory.md'
        title = 'Knowledge and Memory'
        description = 'Concepts, decisions, projects, research, reviews, memory, and brain operations.'
        related = @('automation', 'sessions', 'standards')
    },
    [pscustomobject]@{
        key = 'sessions'
        fileName = '06 Work Sessions and Reviews.md'
        title = 'Work Sessions and Reviews'
        description = 'Inbox material, sessions, daily briefs, dashboards, and dated operating context.'
        related = @('clients', 'knowledge', 'automation')
    },
    [pscustomobject]@{
        key = 'standards'
        fileName = '07 Standards and Templates.md'
        title = 'Standards and Templates'
        description = 'SOPs, reusable templates, and the rules that keep agent work consistent.'
        related = @('automation', 'knowledge', 'growth')
    },
    [pscustomobject]@{
        key = 'ventures'
        fileName = '08 Personal Ventures.md'
        title = 'Personal Ventures'
        description = 'Book, personal, DBA, music, and owned web-property work.'
        related = @('growth', 'sessions', 'knowledge')
    },
    [pscustomobject]@{
        key = 'other'
        fileName = '09 Other Connected Notes.md'
        title = 'Other Connected Notes'
        description = 'Visible notes that do not yet belong to a stable operating domain.'
        related = @('knowledge', 'sessions')
    }
)

$domainPaths = @{}
foreach ($definition in $domainDefinitions) {
    $domainPaths[$definition.key] = "$outputPrefix" + "Generated/$($definition.fileName)"
}

$generatedFiles = New-Object System.Collections.Generic.List[string]
$clientMapLinks = New-Object System.Collections.Generic.List[string]
$clientNotes = @($sourceNotes | Where-Object domain -eq 'clients')
$clientFolderGroups = @(
    $clientNotes |
        Where-Object { ($_.relativePath -split '/').Count -gt 2 } |
        Group-Object { ($_.relativePath -split '/')[1] } |
        Sort-Object Name
)

foreach ($clientGroup in $clientFolderGroups) {
    $clientName = $clientGroup.Name
    $clientFileName = "client-$((Get-SafeSlug -Value $clientName)).md"
    $lines = Get-Frontmatter -Title $clientName -MapType 'client'
    $lines += @(
        "Client cluster for **$clientName**."
        ''
        '## Canonical notes'
        ''
    )

    $sortedClientNotes = @(
        $clientGroup.Group |
            Sort-Object @{
                Expression = {
                    switch -Regex ($_.label) {
                        '^overview$' { 0; break }
                        '^active-campaigns$' { 1; break }
                        '^Agent Memory$' { 2; break }
                        default { 3 }
                    }
                }
            }, relativePath
    )
    foreach ($note in $sortedClientNotes) {
        $lines += "- $(Get-Wikilink -RelativePath $note.relativePath -Label $note.label)"
    }
    $lines += @(
        ''
        '## Connected domains'
        ''
        "- $(Get-Wikilink -RelativePath $domainPaths['clients'] -Label 'Clients and Revenue')"
        "- $(Get-Wikilink -RelativePath $domainPaths['growth'] -Label 'Growth and Content')"
        "- $(Get-Wikilink -RelativePath $domainPaths['sessions'] -Label 'Work Sessions and Reviews')"
    )

    $clientRelativePath = Write-GeneratedMap -FileName $clientFileName -Lines $lines
    $generatedFiles.Add($clientRelativePath)
    $clientMapLinks.Add("- $(Get-Wikilink -RelativePath $clientRelativePath -Label $clientName)")
}

foreach ($definition in $domainDefinitions) {
    $notes = @($sourceNotes | Where-Object domain -eq $definition.key)
    $lines = Get-Frontmatter -Title $definition.title -MapType 'domain'
    $lines += @(
        $definition.description
        ''
    )

    if ($definition.key -eq 'clients') {
        $rootClientNotes = @(
            $notes |
                Where-Object { ($_.relativePath -split '/').Count -eq 2 } |
                Sort-Object relativePath
        )
        if ($rootClientNotes.Count -gt 0) {
            $lines += @('## Client index and root records', '')
            foreach ($note in $rootClientNotes) {
                $lines += "- $(Get-Wikilink -RelativePath $note.relativePath -Label $note.label)"
            }
            $lines += ''
        }
        if ($clientMapLinks.Count -gt 0) {
            $lines += @('## Client clusters', '')
            $lines += $clientMapLinks
            $lines += ''
        }
    }
    else {
        $topLevelGroups = @($notes | Group-Object topLevel | Sort-Object Name)
        foreach ($group in $topLevelGroups) {
            $sectionTitle = if ($group.Name -eq '(root)') { 'Vault front doors' } else { $group.Name }
            $lines += @("## $sectionTitle", '')
            foreach ($note in @($group.Group | Sort-Object relativePath)) {
                $lines += "- $(Get-Wikilink -RelativePath $note.relativePath -Label $note.label)"
            }
            $lines += ''
        }
    }

    $lines += @('## Related domains', '')
    foreach ($relatedKey in $definition.related) {
        $relatedDefinition = $domainDefinitions | Where-Object key -eq $relatedKey | Select-Object -First 1
        $lines += "- $(Get-Wikilink -RelativePath $domainPaths[$relatedKey] -Label $relatedDefinition.title)"
    }
    $domainRelativePath = Write-GeneratedMap -FileName $definition.fileName -Lines $lines
    $generatedFiles.Add($domainRelativePath)
}

$atlasLines = Get-Frontmatter -Title 'Dillon OS Knowledge Atlas' -MapType 'atlas'
$atlasLines += @(
    'The atlas is the connective layer for the whole vault. It groups notes by'
    'meaning and operating context, while each source note remains canonical in'
    'its existing folder.'
    ''
    '## Navigate by domain'
    ''
)
foreach ($definition in $domainDefinitions) {
    $atlasLines += "- $(Get-Wikilink -RelativePath $domainPaths[$definition.key] -Label $definition.title) - $($definition.description)"
}
$atlasLines += @(
    ''
    '## Operating front doors'
    ''
    "- $(Get-Wikilink -RelativePath 'INDEX.md' -Label 'Dillon OS Index')"
    "- $(Get-Wikilink -RelativePath '12_Brain/00_Home.md' -Label 'Brain Home')"
    "- $(Get-Wikilink -RelativePath 'Dashboard.md' -Label 'D.I.L.L.O.N. Dashboard')"
    "- $(Get-Wikilink -RelativePath '12_Brain/09_Ops/Health.md' -Label 'Brain Health')"
    "- $(Get-Wikilink -RelativePath '12_Brain/10_Maps/README.md' -Label 'Map Maintenance')"
    ''
    '## How the graph works'
    ''
    '1. The atlas connects the stable operating domains.'
    '2. Domain maps connect related folders and cross-domain workflows.'
    '3. Client maps keep each client cluster distinct while linking it to growth,'
    '   automation, and session context.'
    '4. Source notes stay where they are; backlinks expose the map that gives each'
    '   note context.'
)
$atlasPath = Join-Path $resolvedOutputRoot '00_Atlas.md'
[IO.File]::WriteAllText(
    $atlasPath,
    (($atlasLines -join [Environment]::NewLine) + [Environment]::NewLine),
    $utf8NoBom
)

$expectedGenerated = New-Object 'System.Collections.Generic.HashSet[string]' ([StringComparer]::OrdinalIgnoreCase)
foreach ($relativePath in $generatedFiles) {
    [void]$expectedGenerated.Add((Join-Path $resolvedVault ($relativePath.Replace('/', '\'))))
}

foreach ($existingFile in @(Get-ChildItem -LiteralPath $generatedRoot -Filter '*.md' -File)) {
    if ($expectedGenerated.Contains($existingFile.FullName)) {
        continue
    }
    [string]$existingText = Get-Content -LiteralPath $existingFile.FullName -Raw
    if ($existingText -match '(?m)^generated_by:\s*Update-SecondBrainMaps\s*$') {
        Remove-Item -LiteralPath $existingFile.FullName -Force
    }
}

[pscustomobject]@{
    vaultRoot = $resolvedVault
    atlasPath = $atlasPath
    sourceNotes = $sourceNotes.Count
    domainMaps = $domainDefinitions.Count
    clientMaps = $clientFolderGroups.Count
    generatedMaps = $generatedFiles.Count
}

