[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$RegistryCsv,
    [Parameter(Mandatory = $true)][string]$OutputRoot,
    [Parameter(Mandatory = $true)][string]$RepositoryRoot
)

$ErrorActionPreference = 'Stop'
$utf8NoBom = [System.Text.UTF8Encoding]::new($false)
$registryPath = [System.IO.Path]::GetFullPath($RegistryCsv)
$outputPath = [System.IO.Path]::GetFullPath($OutputRoot)
$repositoryPath = [System.IO.Path]::GetFullPath($RepositoryRoot)

if (-not (Test-Path -LiteralPath $registryPath -PathType Leaf)) {
    throw "Registry CSV does not exist: $registryPath"
}
if (-not (Test-Path -LiteralPath $repositoryPath -PathType Container)) {
    throw "Repository root does not exist: $repositoryPath"
}
if (Test-Path -LiteralPath $outputPath) {
    throw "Output root already exists; refusing to overwrite: $outputPath"
}

$rows = @(Import-Csv -LiteralPath $registryPath)
if ($rows.Count -ne 245) {
    throw "Expected 245 unique businesses, found $($rows.Count)"
}
if (@($rows.slug | Sort-Object -Unique).Count -ne $rows.Count) {
    throw 'Registry contains duplicate slugs.'
}

$sitesRoot = Join-Path $outputPath 'dist\sites'
[System.IO.Directory]::CreateDirectory($sitesRoot) | Out-Null

function Resolve-SourceSite {
    param([pscustomobject]$Row)

    if ($Row.sourceLocator -like 'git://*') {
        if ($Row.currentBatch -notin @('phl-2026-w33', 'phl-2026-w34')) {
            throw "Unsupported git source for $($Row.slug): $($Row.sourceLocator)"
        }
        return Join-Path $repositoryPath "02_Campaigns\AI Site Builder Outreach Engine\batches\$($Row.currentBatch)\sites\$($Row.slug)"
    }
    return [System.IO.Path]::GetFullPath($Row.sourceLocator)
}

$manifestRows = [System.Collections.Generic.List[object]]::new()
foreach ($row in $rows) {
    $source = Resolve-SourceSite -Row $row
    $indexPath = Join-Path $source 'index.html'
    if (-not (Test-Path -LiteralPath $indexPath -PathType Leaf)) {
        throw "Missing source site for $($row.slug): $source"
    }

    $destination = Join-Path $sitesRoot $row.slug
    Copy-Item -LiteralPath $source -Destination $destination -Recurse

    $manifestRows.Add([pscustomobject][ordered]@{
        ordinal = $manifestRows.Count + 1
        slug = $row.slug
        business = $row.business
        currentBatch = $row.currentBatch
        sourceClass = $row.sourceClass
        previousQaReady = $row.qaReady
        previousPublicationState = $row.publicationState
        route = "/sites/$($row.slug)/"
        sourceLocator = $row.sourceLocator
        copiedFrom = $source
        occurrenceCount = [int]$row.occurrenceCount
        sourceBatches = $row.sourceBatches
    })
}

$cards = foreach ($record in $manifestRows) {
    $business = [System.Net.WebUtility]::HtmlEncode($record.business)
    $batch = [System.Net.WebUtility]::HtmlEncode($record.currentBatch)
    $slug = [System.Net.WebUtility]::HtmlEncode($record.slug)
    $route = [System.Net.WebUtility]::HtmlEncode($record.route)
    "<a class=`"build`" href=`"$route`" data-search=`"$($business.ToLowerInvariant()) $slug $($batch.ToLowerInvariant())`"><span>$(('{0:D3}' -f $record.ordinal))</span><strong>$business</strong><small>$batch</small><em data-qa-status>Pending full QA</em></a>"
}

$hub = @"
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex,nofollow,noarchive">
  <title>Momentum Prospect Radar | 245 Business Call Review</title>
  <style>
    :root{--bg:#080a0e;--panel:#11151c;--ink:#f4f6fb;--muted:#aeb6c5;--accent:#b6f36d;--line:#2b3340}
    *{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif}
    header{padding:clamp(32px,6vw,80px);border-bottom:1px solid var(--line)}h1{max-width:15ch;margin:0;font-size:clamp(2.6rem,7vw,6.2rem);line-height:.95;letter-spacing:-.04em;text-wrap:balance}
    header p{max-width:68ch;color:var(--muted)}.controls{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-top:24px}input{min-height:48px;width:min(560px,100%);padding:0 16px;border:1px solid var(--line);border-radius:10px;background:var(--panel);color:var(--ink)}
    main{padding:clamp(20px,5vw,72px)}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px}.build{display:flex;min-height:210px;flex-direction:column;padding:22px;border:1px solid var(--line);border-radius:14px;background:var(--panel);color:inherit;text-decoration:none}.build[hidden]{display:none}.build span,.build small,.build em{color:var(--muted)}.build strong{margin:28px 0 8px;font-size:1.35rem;line-height:1.15}.build em{margin-top:auto;font-style:normal}.build:hover,.build:focus-visible{border-color:var(--accent);outline:0}.build:hover em,.build:focus-visible em{color:var(--accent)}
    @media(max-width:600px){header,main{padding-inline:18px}.grid{grid-template-columns:1fr}}
  </style>
</head>
<body>
  <header><h1>245 businesses. One call-ready review.</h1><p>Deduplicated website inventory for Jesse's business-by-business calling workflow. Every route remains private and noindex. QA labels are updated only from the full desktop, tablet, and mobile verification run.</p><div class="controls"><input id="search" type="search" placeholder="Search business or batch" aria-label="Search businesses"><strong><span id="visible">245</span> visible</strong></div></header>
  <main><div class="grid">$($cards -join "`n")</div></main>
  <script>const q=document.querySelector('#search'),cards=[...document.querySelectorAll('.build')],visible=document.querySelector('#visible');q.addEventListener('input',()=>{const s=q.value.toLowerCase().trim();let n=0;for(const card of cards){const show=!s||card.dataset.search.includes(s);card.hidden=!show;if(show)n++}visible.textContent=n});</script>
</body>
</html>
"@

$headers = @"
/*
  X-Robots-Tag: noindex, nofollow, noarchive
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
"@

$manifest = [pscustomobject][ordered]@{
    schemaVersion = 1
    generatedAt = (Get-Date).ToUniversalTime().ToString('o')
    clientId = 'momentum-360'
    purpose = 'Jesse business-by-business call review'
    uniqueBusinesses = $manifestRows.Count
    mailReady = 'hold'
    records = @($manifestRows)
}

[System.IO.File]::WriteAllText((Join-Path $outputPath 'dist\index.html'), $hub, $utf8NoBom)
[System.IO.File]::WriteAllText((Join-Path $outputPath 'dist\_headers'), $headers, $utf8NoBom)
[System.IO.File]::WriteAllText((Join-Path $outputPath 'ALL-BUSINESSES-MANIFEST.json'), ($manifest | ConvertTo-Json -Depth 8), $utf8NoBom)
[System.IO.File]::WriteAllLines((Join-Path $outputPath 'business-inventory.csv'), @($manifestRows | ConvertTo-Csv -NoTypeInformation), $utf8NoBom)

[pscustomobject]@{
    outputRoot = $outputPath
    routes = $manifestRows.Count
    sourceLocal = @($manifestRows | Where-Object sourceClass -like 'historical-*').Count
    sourceWeek33 = @($manifestRows | Where-Object sourceClass -eq 'week-33-current-review').Count
    sourceWeek34 = @($manifestRows | Where-Object sourceClass -eq 'week-34-current-review').Count
}
