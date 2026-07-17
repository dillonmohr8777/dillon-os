[CmdletBinding()]
param(
  [switch]$Apply,
  [string]$TokenDpapiPath = $env:ALIGN_HUBSPOT_TOKEN_DPAPI_PATH
)

$ErrorActionPreference = 'Stop'
$ExpectedPortalId = '242825734'
$ApiRoot = 'https://api.hubapi.com'
$OldSlug = 'blog/paylocity-vs-paycheck-best-platform'
$NewSlug = 'blog/paylocity-vs-paychex-best-platform'
$OldPath = '/blog/paylocity-vs-paycheck-best-platform'
$NewPath = '/blog/paylocity-vs-paychex-best-platform'
$DefaultTokenPath = 'C:\Users\dillo\Documents\Codex\2026-07-12\hubspot-agent-set-jasonhubspottoken-ps1-hubspot\hubspot-agent\.secrets\align-hubspot-token.dpapi'
$BackupRoot = Join-Path $env:LOCALAPPDATA ("Codex\AlignHCMBackups\paylocity-slug-" + (Get-Date -Format 'yyyyMMdd-HHmmss'))

function Get-Token {
  if ($env:HUBSPOT_SERVICE_KEY) { return $env:HUBSPOT_SERVICE_KEY }
  if ($env:HUBSPOT_ACCESS_TOKEN) { return $env:HUBSPOT_ACCESS_TOKEN }
  $path = if ($TokenDpapiPath) { $TokenDpapiPath } else { $DefaultTokenPath }
  if (!(Test-Path -LiteralPath $path)) { throw 'No Align HubSpot token environment variable or DPAPI token was found.' }
  $secure = ConvertTo-SecureString (Get-Content -Raw -LiteralPath $path)
  $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  try { [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr) }
  finally { if ($ptr -ne [IntPtr]::Zero) { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) } }
}

function Invoke-Api {
  param([ValidateSet('Get', 'Post', 'Patch', 'Delete')][string]$Method, [string]$Uri, [hashtable]$Headers, $Body)
  $params = @{ Method = $Method; Uri = $Uri; Headers = $Headers }
  if ($null -ne $Body) {
    $params.ContentType = 'application/json'
    $params.Body = $Body | ConvertTo-Json -Depth 30 -Compress
  }
  Invoke-RestMethod @params
}

function Get-AllRedirects {
  param([hashtable]$Headers)
  $items = @(); $uri = "$ApiRoot/cms/url-redirects/2026-03?limit=100"
  do {
    $page = Invoke-Api -Method Get -Uri $uri -Headers $Headers
    $items += @($page.results)
    $uri = if ($page.paging.next.link) { [string]$page.paging.next.link } else { $null }
  } while ($uri)
  @($items)
}

function Get-NoRedirect {
  param([string]$Uri)
  Add-Type -AssemblyName System.Net.Http
  $handler = [Net.Http.HttpClientHandler]::new()
  $handler.AllowAutoRedirect = $false
  $client = [Net.Http.HttpClient]::new($handler)
  try {
    $response = $client.GetAsync($Uri).GetAwaiter().GetResult()
    [pscustomobject]@{ status = [int]$response.StatusCode; location = if ($response.Headers.Location) { [string]$response.Headers.Location } else { '' } }
  } finally { $client.Dispose(); $handler.Dispose() }
}

function Get-LiveHtml { param([string]$Uri) (Invoke-WebRequest -UseBasicParsing -Uri $Uri -MaximumRedirection 5 -TimeoutSec 60).Content }

$token = Get-Token
$headers = @{ Authorization = "Bearer $token" }
try {
  $identity = Invoke-Api -Method Get -Uri "$ApiRoot/integrations/v1/me" -Headers $headers
  if ("$($identity.portalId)" -ne $ExpectedPortalId) { throw "HubSpot portal mismatch. Expected $ExpectedPortalId, got $($identity.portalId)." }

  $search = Invoke-Api -Method Get -Uri "$ApiRoot/cms/v3/blogs/posts?slug__icontains=paylocity-vs-payc&limit=20" -Headers $headers
  $posts = @($search.results | Where-Object { $_.slug -in @($OldSlug, $NewSlug) })
  if ($posts.Count -ne 1) { throw "Expected exactly one published Paychex post at the old or new slug, found $($posts.Count)." }
  $post = $posts[0]
  if ("$($post.state)" -ne 'PUBLISHED' -or "$($post.currentState)" -ne 'PUBLISHED') { throw 'The Paychex post is not currently published.' }

  $redirects = Get-AllRedirects -Headers $headers
  $matching = @($redirects | Where-Object {
    $_.routePrefix -eq $OldPath -or
    $_.routePrefix -eq ("http://www.alignhcm.com" + $OldPath) -or
    $_.routePrefix -eq ("https://www.alignhcm.com" + $OldPath)
  })
  $plan = [pscustomobject][ordered]@{
    portalId = $ExpectedPortalId
    apply = [bool]$Apply
    post = $post | Select-Object id, name, slug, state, currentState, url, publishDate
    newSlug = $NewSlug
    oldPath = $OldPath
    newPath = $NewPath
    existingRedirect = $matching | Select-Object id, routePrefix, destination, redirectStyle, isOnlyAfterNotFound
  }
  if (!$Apply) { $plan | ConvertTo-Json -Depth 8; return }

  New-Item -ItemType Directory -Path $BackupRoot -Force | Out-Null
  [IO.File]::WriteAllText((Join-Path $BackupRoot 'post.json'), (($post | ConvertTo-Json -Depth 50) + "`n"), [Text.UTF8Encoding]::new($false))
  [IO.File]::WriteAllText((Join-Path $BackupRoot 'redirects.json'), (($matching | ConvertTo-Json -Depth 30) + "`n"), [Text.UTF8Encoding]::new($false))

  if ($post.slug -eq $OldSlug) {
    $updated = Invoke-Api -Method Patch -Uri "$ApiRoot/cms/v3/blogs/posts/$($post.id)" -Headers $headers -Body @{ slug = $NewSlug }
    if ("$($updated.state)" -ne 'PUBLISHED' -and "$($updated.currentState)" -ne 'PUBLISHED') { throw 'The slug update did not remain published.' }
  }

  $redirectBody = @{ destination = $NewPath; redirectStyle = 301; isOnlyAfterNotFound = $true; isTrailingSlashOptional = $true }
  $pathRedirect = @($matching | Where-Object { $_.routePrefix -eq $OldPath }) | Select-Object -First 1
  if ($pathRedirect) {
    Invoke-Api -Method Patch -Uri "$ApiRoot/cms/url-redirects/2026-03/$($pathRedirect.id)" -Headers $headers -Body $redirectBody | Out-Null
  } else {
    $redirectBody.routePrefix = $OldPath
    Invoke-Api -Method Post -Uri "$ApiRoot/cms/url-redirects/2026-03" -Headers $headers -Body $redirectBody | Out-Null
  }
  foreach ($duplicate in @($matching | Where-Object { !$pathRedirect -or $_.id -ne $pathRedirect.id })) {
    Invoke-Api -Method Delete -Uri "$ApiRoot/cms/url-redirects/2026-03/$($duplicate.id)" -Headers $headers | Out-Null
  }

  $checks = @()
  for ($attempt = 1; $attempt -le 8; $attempt++) {
    $old = Get-NoRedirect -Uri ("https://www.alignhcm.com" + $OldPath)
    $newHtml = ''
    try { $newHtml = Get-LiveHtml -Uri ("https://www.alignhcm.com" + $NewPath) } catch { $newHtml = '' }
    $canonicalOk = $newHtml -match '<link[^>]+rel="canonical"[^>]+href="https://www\.alignhcm\.com/blog/paylocity-vs-paychex-best-platform"'
    $oldOk = $old.status -eq 301 -and $old.location -match '/blog/paylocity-vs-paychex-best-platform'
    $newOk = $newHtml -and $canonicalOk
    if ($oldOk -and $newOk) { break }
    if ($attempt -lt 8) { Start-Sleep -Seconds 3 }
  }
  $sitemap = [xml](Invoke-WebRequest -UseBasicParsing -Uri 'https://www.alignhcm.com/sitemap.xml' -TimeoutSec 60).Content
  $sitemapUrls = @($sitemap.SelectNodes("//*[local-name()='loc']") | ForEach-Object { $_.InnerText.Trim() })
  $checks = @{
    oldRedirect = $oldOk
    newCanonical = $canonicalOk
    newPublished = [bool]$newHtml
    oldRedirectLocation = $old.location
    sitemapHasNew = ('https://www.alignhcm.com' + $NewPath -in $sitemapUrls)
    sitemapHasOld = ('https://www.alignhcm.com' + $OldPath -in $sitemapUrls)
  }
  if (!$checks.oldRedirect -or !$checks.newCanonical -or !$checks.newPublished) { throw "Paychex slug migration verification failed: $($checks | ConvertTo-Json -Compress)" }
  $checks.sitemapStatus = if ($checks.sitemapHasNew -and !$checks.sitemapHasOld) { 'current' } else { 'pending_hubspot_cache_refresh' }
  [pscustomobject]@{ portalId = $ExpectedPortalId; applied = $true; postId = "$($post.id)"; backup = $BackupRoot; checks = $checks } | ConvertTo-Json -Depth 8
} finally { $token = $null }
