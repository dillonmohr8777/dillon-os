[CmdletBinding()]
param(
    [string]$VaultRoot = (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent),
    [string]$OutputPath = '12_Brain/09_Ops/Knowledge Coverage.md'
)

$ErrorActionPreference = 'Stop'
$resolvedVault = (Resolve-Path -LiteralPath $VaultRoot).Path
$today = (Get-Date).ToString('yyyy-MM-dd')
$checkedAt = (Get-Date).ToString('s')
$utf8NoBom = New-Object Text.UTF8Encoding($false)

function Get-RelativeVaultPath {
    param([string]$FullName)

    return $FullName.Substring($resolvedVault.Length + 1).Replace('\', '/')
}

$domains = @(
    [pscustomobject]@{ key = 'keywords'; label = 'Keyword research'; concept = '12_Brain/03_Concepts/Keyword Research and Search Demand.md'; pattern = '(?i)keyword|search term|search console|search demand' },
    [pscustomobject]@{ key = 'intent'; label = 'Intent and topic architecture'; concept = '12_Brain/03_Concepts/Search Intent and Topic Architecture.md'; pattern = '(?i)search intent|topic cluster|content cluster|information architecture' },
    [pscustomobject]@{ key = 'aeo'; label = 'AEO, GEO, and AI discovery'; concept = '12_Brain/03_Concepts/AEO GEO and AI Discovery.md'; pattern = '(?i)\baeo\b|\bgeo\b|ai search|answer engine|generative engine' },
    [pscustomobject]@{ key = 'entity'; label = 'Entity authority and citation readiness'; concept = '12_Brain/03_Concepts/Entity Authority and Citation Readiness.md'; pattern = '(?i)entity authority|citation readiness|knowledge graph|structured data|schema' },
    [pscustomobject]@{ key = 'local'; label = 'Local search and maps parity'; concept = '12_Brain/03_Concepts/Local Search and Maps Site Parity.md'; pattern = '(?i)local search|google business profile|maps|service area|local seo' },
    [pscustomobject]@{ key = 'ai-measure'; label = 'AI visibility measurement'; concept = '12_Brain/03_Concepts/AI Visibility Measurement.md'; pattern = '(?i)ai visibility|citation share|grounding quer|chatgpt|perplexity|ai referral' },
    [pscustomobject]@{ key = 'pipeline'; label = 'Qualified pipeline measurement'; concept = '12_Brain/03_Concepts/Qualified Pipeline Measurement.md'; pattern = '(?i)qualified pipeline|qualified lead|opportunit|revenue attribution|offline conversion' },
    [pscustomobject]@{ key = 'reporting'; label = 'Client reporting and scoreboards'; concept = '12_Brain/03_Concepts/Client Reporting and Outcome Scoreboards.md'; pattern = '(?i)client report|scoreboard|kpi|reporting|dashboard' },
    [pscustomobject]@{ key = 'content'; label = 'Content systems and distribution'; concept = '12_Brain/03_Concepts/Content Systems and Distribution.md'; pattern = '(?i)content system|content strateg|distribution|editorial|repurpos' },
    [pscustomobject]@{ key = 'website'; label = 'High-craft website factory'; concept = '12_Brain/03_Concepts/High Craft Website Factory.md'; pattern = '(?i)site factory|website factory|landing page|web build|website build' },
    [pscustomobject]@{ key = 'workflow'; label = 'Automation and workflow engineering'; concept = '12_Brain/03_Concepts/Automation and Workflow Engineering.md'; pattern = '(?i)automation|workflow|orchestrat|scheduled task' },
    [pscustomobject]@{ key = 'governance'; label = 'Agent governance and verification'; concept = '12_Brain/03_Concepts/Agent Governance and Verification.md'; pattern = '(?i)maker.checker|agent protocol|verification|approval gate|fail closed' },
    [pscustomobject]@{ key = 'evidence'; label = 'Evidence, context, and learning'; concept = '12_Brain/03_Concepts/Evidence Context and Learning Loops.md'; pattern = '(?i)evidence|context|learning loop|memory|research' },
    [pscustomobject]@{ key = 'outreach'; label = 'Prospect-to-build-to-outreach'; concept = '12_Brain/03_Concepts/Prospect to Build to Outreach Pipeline.md'; pattern = '(?i)prospect|outreach|direct mail|site builder|qualification' }
)

$sourceFiles = @(
    Get-ChildItem -LiteralPath $resolvedVault -Recurse -Filter '*.md' -File |
        ForEach-Object {
            $relativePath = Get-RelativeVaultPath -FullName $_.FullName
            if (
                $relativePath -notmatch '^(?:\.git|\.obsidian|\.claude|\.cursor|\.hermes)(?:/|$)' -and
                $relativePath -notmatch '(?:^|/)node_modules(?:/|$)' -and
                $relativePath -notmatch '^12_Brain/03_Concepts/' -and
                $relativePath -notmatch '^12_Brain/10_Maps/' -and
                $relativePath -notmatch '^12_Brain/09_Ops/(?:Knowledge Coverage|Health)\.md$'
            ) {
                [pscustomobject]@{
                    relativePath = $relativePath
                    text = Get-Content -LiteralPath $_.FullName -Raw
                }
            }
        }
)

$rows = New-Object System.Collections.Generic.List[object]
foreach ($domain in $domains) {
    $conceptPath = Join-Path $resolvedVault ($domain.concept.Replace('/', '\'))
    $exists = Test-Path -LiteralPath $conceptPath
    $wordCount = 0
    $wikilinkCount = 0
    $sourceCount = 0
    $maturity = 'missing'

    if ($exists) {
        [string]$conceptText = Get-Content -LiteralPath $conceptPath -Raw
        $wordCount = [regex]::Matches($conceptText, '\b[\p{L}\p{N}][\p{L}\p{N}_-]*\b').Count
        $wikilinkCount = [regex]::Matches($conceptText, '\[\[').Count
        if ($conceptText -match '(?m)^maturity:\s*(?<value>.+?)\s*$') {
            $maturity = $Matches.value.Trim(' ', '"', "'")
        }
    }

    $sourceCount = @($sourceFiles | Where-Object { $_.text -match $domain.pattern }).Count
    $operational = $exists -and $maturity -eq 'operational' -and $wordCount -ge 500 -and $wikilinkCount -ge 3 -and $sourceCount -ge 2

    $rows.Add([pscustomobject]@{
        key = $domain.key
        label = $domain.label
        concept = $domain.concept
        exists = $exists
        maturity = $maturity
        wordCount = $wordCount
        wikilinkCount = $wikilinkCount
        sourceCount = $sourceCount
        operational = $operational
    })
}

$operationalCount = @($rows | Where-Object operational).Count
$coveragePercent = [math]::Round(($operationalCount / [double]$rows.Count) * 100, 1)
$lines = @(
    '---'
    'note_type: system'
    'status: active'
    'generated: true'
    'generated_by: Update-KnowledgeCoverage'
    "updated: $today"
    "checked_at: $checkedAt"
    'tags:'
    '  - brain'
    '  - knowledge-coverage'
    '  - generated'
    '---'
    ''
    '# Knowledge Coverage'
    ''
    '> [!info] Generated knowledge-depth audit'
    '> Run `System/scripts/Update-KnowledgeCoverage.ps1` after adding or materially'
    '> revising strategy notes. Edit canonical concept and source notes, not this file.'
    ''
    '## Snapshot'
    ''
    "- Operational domains: **$operationalCount / $($rows.Count)**"
    "- Coverage: **$coveragePercent%**"
    '- Operational threshold: canonical concept exists, maturity is `operational`,'
    '  at least 500 words, at least three internal links, and at least two matching'
    '  source notes elsewhere in the vault.'
    ''
    '## Domain coverage'
    ''
    '| Domain | State | Maturity | Words | Links | Matching source notes |'
    '|---|---|---|---:|---:|---:|'
)

foreach ($row in $rows) {
    $state = if ($row.operational) { 'Operational' } elseif ($row.exists) { 'Developing' } else { 'Missing' }
    $conceptStem = $row.concept.Substring(0, $row.concept.Length - 3)
    $lines += "| [[$conceptStem|$($row.label)]] | $state | $($row.maturity) | $($row.wordCount) | $($row.wikilinkCount) | $($row.sourceCount) |"
}

$gaps = @($rows | Where-Object { -not $_.operational })
$lines += @('', '## Development queue', '')
if ($gaps.Count -eq 0) {
    $lines += '- No structural knowledge-depth gaps detected. Continue validating freshness, client application, and real outcomes.'
}
else {
    foreach ($gap in $gaps) {
        $reasons = New-Object System.Collections.Generic.List[string]
        if (-not $gap.exists) { $reasons.Add('canonical concept is missing') }
        if ($gap.exists -and $gap.maturity -ne 'operational') { $reasons.Add("maturity is $($gap.maturity)") }
        if ($gap.wordCount -lt 500) { $reasons.Add("only $($gap.wordCount) words") }
        if ($gap.wikilinkCount -lt 3) { $reasons.Add("only $($gap.wikilinkCount) internal links") }
        if ($gap.sourceCount -lt 2) { $reasons.Add("only $($gap.sourceCount) matching source notes") }
        $lines += "- **$($gap.label):** $($reasons -join '; ')."
    }
}

$lines += @(
    ''
    '## Interpretation'
    ''
    'This audit measures whether the strategy layer is deep and connected enough'
    'to operate. It does not prove that any specific tactic is current or effective.'
    'Those claims still require dated research, platform evidence, experiments,'
    'client outcomes, and independent verification.'
    ''
    '## Connected operations'
    ''
    '- [[12_Brain/03_Concepts/README|Strategy library]]'
    '- [[12_Brain/10_Maps/00_Atlas|Knowledge Atlas]]'
    '- [[12_Brain/09_Ops/Health|Brain Health]]'
    '- [[12_Brain/09_Ops/Runbook|Second Brain Runbook]]'
)

$absoluteOutput = Join-Path $resolvedVault ($OutputPath.Replace('/', '\'))
$outputDirectory = Split-Path $absoluteOutput -Parent
if (-not (Test-Path -LiteralPath $outputDirectory)) {
    New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null
}
if (-not $absoluteOutput.StartsWith($resolvedVault, [StringComparison]::OrdinalIgnoreCase)) {
    throw "Output path must remain inside the vault: $absoluteOutput"
}

[IO.File]::WriteAllText(
    $absoluteOutput,
    (($lines -join [Environment]::NewLine) + [Environment]::NewLine),
    $utf8NoBom
)

[pscustomobject]@{
    outputPath = $absoluteOutput
    domains = $rows.Count
    operationalDomains = $operationalCount
    coveragePercent = $coveragePercent
}
