[CmdletBinding()]
param(
  [switch]$Apply,
  [string]$TokenDpapiPath = $env:ALIGN_HUBSPOT_TOKEN_DPAPI_PATH
)

$ErrorActionPreference = 'Stop'
$ExpectedPortalId = '242825734'
$ApiRoot = 'https://api.hubapi.com'
$DefaultTokenPath = 'C:\Users\dillo\Documents\Codex\2026-07-12\hubspot-agent-set-jasonhubspottoken-ps1-hubspot\hubspot-agent\.secrets\align-hubspot-token.dpapi'
$BackupRoot = Join-Path $env:LOCALAPPDATA ("Codex\AlignHCMBackups\legacy-case-studies-" + (Get-Date -Format 'yyyyMMdd-HHmmss'))
$PageIds = @('246001712875', '246015931085')
$Redirects = [ordered]@{
  '/success-stories' = '/case-studies'
  '/case-studies-old' = '/case-studies'
  '/case-studies-old/results-vibra' = '/case-studies/vibra-healthcare-payroll-process-transformation'
  '/case-studies-old/results-driscolls' = '/case-studies/automating-complex-labor-compliance-for-driscolls-mexico-division'
  '/case-studies-old/results-farming-organization' = '/case-studies/automating-complex-labor-compliance-for-driscolls-mexico-division'
  '/case-studies-old/results-invision' = '/case-studies/invision-integrates-enterprise-applications-for-better-outcomes'
  '/case-studies-old/case-study-greater-toronto-airports' = '/case-studies/gtaa-optimizes-workforce-management-with-align-hcm-and-ukg-pro-suite'
  '/case-studies-old/results-electronics-manufacturing-firm' = '/case-studies/seamless-hcm-overhaul-for-north-american-division'
}

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
  param([string]$Method, [string]$Uri, [hashtable]$Headers, $Body)
  $params = @{ Method = $Method; Uri = $Uri; Headers = $Headers }
  if ($null -ne $Body) {
    $params.ContentType = 'application/json'
    $params.Body = $Body | ConvertTo-Json -Depth 20 -Compress
  }
  Invoke-RestMethod @params
}

function Get-AllRedirects {
  param([hashtable]$Headers)
  $results = @()
  $uri = "$ApiRoot/cms/url-redirects/2026-03?limit=100"
  do {
    $page = Invoke-Api -Method Get -Uri $uri -Headers $Headers
    $results += @($page.results)
    $uri = $page.paging.next.link
  } while ($uri)
  @($results)
}

function Get-PageIfPublished {
  param([string]$Id, [hashtable]$Headers)
  try { Invoke-Api -Method Get -Uri "$ApiRoot/cms/pages/2026-03/site-pages/$Id" -Headers $Headers }
  catch {
    $status = try { [int]$_.Exception.Response.StatusCode } catch { 0 }
    if ($status -eq 404) { return $null }
    throw
  }
}

function Get-FinalUrl {
  param([string]$Path)
  $response = Invoke-WebRequest -Uri ("https://www.alignhcm.com" + $Path) -UseBasicParsing -MaximumRedirection 8 -TimeoutSec 60
  [string]$response.BaseResponse.ResponseUri.AbsoluteUri
}

$token = Get-Token
$headers = @{ Authorization = "Bearer $token" }
try {
  $identity = Invoke-Api -Method Get -Uri "$ApiRoot/integrations/v1/me" -Headers $headers
  if ("$($identity.portalId)" -ne $ExpectedPortalId) { throw "HubSpot portal mismatch. Expected $ExpectedPortalId, got $($identity.portalId)." }

  $pages = @()
  foreach ($id in $PageIds) {
    $page = Get-PageIfPublished -Id $id -Headers $headers
    if ($page) { $pages += $page }
  }
  $unexpectedPages = @($pages | Where-Object { $_.slug -notin @('case-studies-old', 'success-stories') })
  if ($unexpectedPages.Count) { throw "Refusing to archive unexpected page ID(s): $($unexpectedPages.id -join ', ')." }

  $allRedirects = Get-AllRedirects -Headers $headers
  $obsoleteReverseRedirects = @($allRedirects | Where-Object {
    $_.routePrefix -match '(?i)sandbox\.hs-sites-na2\.com/case-studies/?$' -and
    $_.destination -eq '/case-studies-old'
  })
  $matchingRedirects = @($allRedirects | Where-Object {
    $_.routePrefix -in @($Redirects.Keys) -or $_.id -in @($obsoleteReverseRedirects.id)
  })
  $plan = [pscustomobject]@{
    portalId = $ExpectedPortalId
    apply = [bool]$Apply
    publishedPagesToArchive = @($pages | Select-Object id, name, slug)
    obsoleteReverseRedirectsToDelete = @($obsoleteReverseRedirects | Select-Object id, routePrefix, destination)
    redirectsToEnsure = @($Redirects.GetEnumerator() | ForEach-Object { [pscustomobject]@{ routePrefix = $_.Key; destination = $_.Value } })
  }
  if (!$Apply) { $plan | ConvertTo-Json -Depth 7; return }

  New-Item -ItemType Directory -Path $BackupRoot -Force | Out-Null
  [IO.File]::WriteAllText((Join-Path $BackupRoot 'pages.json'), (($pages | ConvertTo-Json -Depth 50) + "`n"), [Text.UTF8Encoding]::new($false))
  [IO.File]::WriteAllText((Join-Path $BackupRoot 'redirects.json'), (($matchingRedirects | ConvertTo-Json -Depth 30) + "`n"), [Text.UTF8Encoding]::new($false))

  foreach ($redirect in $obsoleteReverseRedirects) {
    Invoke-Api -Method Delete -Uri "$ApiRoot/cms/url-redirects/2026-03/$($redirect.id)" -Headers $headers | Out-Null
  }

  foreach ($entry in $Redirects.GetEnumerator()) {
    $existing = @($allRedirects | Where-Object { $_.routePrefix -eq $entry.Key }) | Select-Object -First 1
    $body = @{
      destination = $entry.Value
      redirectStyle = 301
      isOnlyAfterNotFound = $true
      isTrailingSlashOptional = $true
    }
    if ($existing) {
      Invoke-Api -Method Patch -Uri "$ApiRoot/cms/url-redirects/2026-03/$($existing.id)" -Headers $headers -Body $body | Out-Null
    } else {
      $body.routePrefix = $entry.Key
      Invoke-Api -Method Post -Uri "$ApiRoot/cms/url-redirects/2026-03" -Headers $headers -Body $body | Out-Null
    }
  }

  foreach ($page in $pages) {
    Invoke-Api -Method Delete -Uri "$ApiRoot/cms/pages/2026-03/site-pages/$($page.id)" -Headers $headers | Out-Null
  }

  $checks = @()
  foreach ($entry in $Redirects.GetEnumerator()) {
    $expected = 'https://www.alignhcm.com' + $entry.Value
    $final = ''
    for ($attempt = 1; $attempt -le 6; $attempt++) {
      try { $final = Get-FinalUrl -Path $entry.Key } catch { $final = '' }
      if ($final.TrimEnd('/') -eq $expected.TrimEnd('/')) { break }
      if ($attempt -lt 6) { Start-Sleep -Seconds 3 }
    }
    $checks += [pscustomobject]@{ routePrefix = $entry.Key; expected = $expected; final = $final; passed = ($final.TrimEnd('/') -eq $expected.TrimEnd('/')) }
  }
  $failures = @($checks | Where-Object { !$_.passed })
  if ($failures.Count) { throw "Legacy redirect verification failed: $($failures.routePrefix -join ', ')." }

  [xml]$sitemap = (Invoke-WebRequest -Uri 'https://www.alignhcm.com/sitemap.xml' -UseBasicParsing -TimeoutSec 60).Content
  $legacyInSitemap = @($sitemap.SelectNodes("//*[local-name()='url']/*[local-name()='loc']") |
    ForEach-Object { $_.InnerText.Trim() } |
    Where-Object { $_ -match '/case-studies-old(?:/|$)|/success-stories/?$' })
  [pscustomobject]@{
    portalId = $ExpectedPortalId
    applied = $true
    backup = $BackupRoot
    redirectsVerified = $checks.Count
    legacyUrlsStillInSitemapCache = $legacyInSitemap.Count
    checks = $checks
  } | ConvertTo-Json -Depth 8
} finally {
  $token = $null
}
