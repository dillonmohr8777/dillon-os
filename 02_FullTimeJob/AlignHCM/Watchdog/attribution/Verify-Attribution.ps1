[CmdletBinding()]
param(
  [string]$TokenDpapiPath = $env:ALIGN_HUBSPOT_TOKEN_DPAPI_PATH,
  [int]$Retries = 10,
  [int]$DelaySeconds = 3
)

$ErrorActionPreference = 'Stop'
$ExpectedPortalId = '242825734'
$ApiRoot = 'https://api.hubapi.com'
$DefaultTokenPath = 'C:\Users\dillo\Documents\Codex\2026-07-12\hubspot-agent-set-jasonhubspottoken-ps1-hubspot\hubspot-agent\.secrets\align-hubspot-token.dpapi'
$PropertyNames = @(
  'align_first_landing_page', 'align_first_referrer', 'align_first_utm_source', 'align_first_utm_medium',
  'align_first_utm_campaign', 'align_first_utm_content', 'align_first_utm_term', 'align_first_gclid',
  'align_first_fbclid', 'align_first_msclkid', 'align_last_landing_page', 'align_last_referrer',
  'align_first_li_fat_id', 'align_first_touch_channel', 'align_first_social_platform',
  'align_last_utm_source', 'align_last_utm_medium', 'align_last_utm_campaign', 'align_last_utm_content',
  'align_last_utm_term', 'align_last_gclid', 'align_last_fbclid', 'align_last_msclkid',
  'align_last_li_fat_id', 'align_last_touch_channel', 'align_last_social_platform', 'align_content_slug',
  'align_content_topic', 'align_offer_id', 'align_cta_placement', 'align_conversion_page',
  'align_conversion_type', 'align_requested_url'
)
$SelfReportedSourceName = 'align_self_reported_source'
$RequiredFormIds = @(
  '2a7dbc2e-600a-4d2b-9222-bda4cfd8d5bb',
  '99353f9f-a047-4b21-b0ca-ee452f8cf6f6',
  'a2f5cad0-6a8b-485d-b57a-0c0b65e86936',
  'e733d928-0f1d-4b41-853b-df1e0096f330'
)

function Get-Token {
  if ($env:HUBSPOT_SERVICE_KEY) { return $env:HUBSPOT_SERVICE_KEY }
  if ($env:HUBSPOT_ACCESS_TOKEN) { return $env:HUBSPOT_ACCESS_TOKEN }
  $path = if ($TokenDpapiPath) { $TokenDpapiPath } else { $DefaultTokenPath }
  if (!(Test-Path -LiteralPath $path)) { throw 'Align HubSpot token was not found.' }
  $secure = ConvertTo-SecureString (Get-Content -Raw -LiteralPath $path)
  $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  try { [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr) }
  finally { if ($ptr -ne [IntPtr]::Zero) { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) } }
}

function Get-AllForms {
  param([hashtable]$Headers)
  $results = @(); $after = $null
  do {
    $uri = "$ApiRoot/marketing/v3/forms?limit=100"
    if ($after) { $uri += '&after=' + [Uri]::EscapeDataString([string]$after) }
    $page = Invoke-RestMethod -Headers $Headers -Uri $uri
    $results += @($page.results); $after = $page.paging.next.after
  } while ($after)
  @($results)
}

function Get-SourceText {
  param([hashtable]$Headers, [string]$Path)
  $encoded = [Uri]::EscapeDataString($Path)
  $response = Invoke-WebRequest -Headers $Headers -Uri "$ApiRoot/cms/v3/source-code/published/content/$encoded" -UseBasicParsing
  if ($response.Content -is [byte[]]) { return [Text.Encoding]::UTF8.GetString([byte[]]$response.Content) }
  [string]$response.Content
}

function Get-PublicResponse {
  param([string]$Uri, [bool]$FollowRedirects = $true, [string]$UserAgent = 'Mozilla/5.0 AlignHCM-Site-Watchdog/1.0')
  Add-Type -AssemblyName System.Net.Http
  $handler = [Net.Http.HttpClientHandler]::new()
  $handler.AllowAutoRedirect = $FollowRedirects
  $handler.AutomaticDecompression = [Net.DecompressionMethods]::GZip -bor [Net.DecompressionMethods]::Deflate
  $client = [Net.Http.HttpClient]::new($handler)
  try {
    $client.DefaultRequestHeaders.UserAgent.ParseAdd($UserAgent)
    $response = $client.GetAsync($Uri).GetAwaiter().GetResult()
    [pscustomobject]@{
      status = [int]$response.StatusCode
      location = if ($response.Headers.Location) { [string]$response.Headers.Location } else { '' }
      contentType = if ($response.Content.Headers.ContentType) { [string]$response.Content.Headers.ContentType } else { '' }
      content = $response.Content.ReadAsStringAsync().GetAwaiter().GetResult()
    }
  } finally { $client.Dispose(); $handler.Dispose() }
}

function Get-IndexNowKey {
  $bytes = [Text.Encoding]::UTF8.GetBytes('www.alignhcm.com|site-health-watchdog|indexnow|2026')
  $hash = ([BitConverter]::ToString(([Security.Cryptography.SHA256]::Create()).ComputeHash($bytes))).Replace('-', '').ToLowerInvariant()
  $hash.Substring(0, 32)
}

function Add-Check {
  param([System.Collections.ArrayList]$List, [string]$Name, [bool]$Passed, [string]$Detail, [bool]$Required = $true)
  [void]$List.Add([pscustomobject]@{ name = $Name; passed = $Passed; required = $Required; detail = $Detail })
}

$token = Get-Token
try {
  $headers = @{ Authorization = "Bearer $token" }
  $checks = [Collections.ArrayList]::new()
  $identity = Invoke-RestMethod -Headers $headers -Uri "$ApiRoot/integrations/v1/me"
  Add-Check -List $checks -Name 'Portal guard' -Passed ([string]$identity.portalId -eq $ExpectedPortalId) -Detail "Portal $($identity.portalId)"

  $allProperties = Invoke-RestMethod -Headers $headers -Uri "$ApiRoot/crm/v3/properties/contacts?archived=false"
  $livePropertyNames = @($allProperties.results.name)
  $allRequiredProperties = @($PropertyNames) + $SelfReportedSourceName
  $missingProperties = @($allRequiredProperties | Where-Object { $_ -notin $livePropertyNames })
  Add-Check -List $checks -Name 'Attribution contact properties' -Passed ($missingProperties.Count -eq 0) -Detail $(if ($missingProperties.Count) { 'Missing: ' + ($missingProperties -join ', ') } else { "$($allRequiredProperties.Count) present" })

  $forms = Get-AllForms -Headers $headers
  $guideForm = @($forms | Where-Object { $_.name -eq 'Align Buyer Guide Download' }) | Select-Object -First 1
  Add-Check -List $checks -Name 'Buyer guide form' -Passed ([bool]$guideForm) -Detail $(if ($guideForm) { "Form $($guideForm.id)" } else { 'Form not found' })
  $formsToCheck = @($forms | Where-Object { $_.id -in $RequiredFormIds -or $_.id -eq $guideForm.id })
  foreach ($form in $formsToCheck) {
    $fieldNames = @($form.fieldGroups.fields.name)
    $missing = @($PropertyNames | Where-Object { $_ -notin $fieldNames })
    Add-Check -List $checks -Name "Hidden attribution fields: $($form.name)" -Passed ($missing.Count -eq 0) -Detail $(if ($missing.Count) { "$($missing.Count) missing" } else { "$($PropertyNames.Count) present" })
  }
  $highIntentIds = @('99353f9f-a047-4b21-b0ca-ee452f8cf6f6', 'a2f5cad0-6a8b-485d-b57a-0c0b65e86936', 'e733d928-0f1d-4b41-853b-df1e0096f330')
  foreach ($form in @($formsToCheck | Where-Object { $_.id -in $highIntentIds })) {
    $sourceField = @($form.fieldGroups.fields | Where-Object { $_.name -eq $SelfReportedSourceName }) | Select-Object -First 1
    Add-Check -List $checks -Name "Self-reported source: $($form.name)" -Passed ([bool]$sourceField -and !$sourceField.hidden -and !$sourceField.required) -Detail 'Visible and optional on high-intent form'
  }

  $service = Invoke-RestMethod -Headers $headers -Uri "$ApiRoot/crm/v3/properties/contacts/service_interest"
  Add-Check -List $checks -Name 'HCM Implementation form value' -Passed ([bool]@($service.options | Where-Object { $_.value -eq 'HCM Implementation' }).Count) -Detail 'service_interest accepts the displayed footer value'

  $sourceJs = Get-SourceText -Headers $headers -Path 'Align HCM/js/align-attribution.js'
  Add-Check -List $checks -Name 'Footer form reliability code' -Passed ($sourceJs -match 'stopImmediatePropagation' -and $sourceJs -match 'response\.ok' -and $sourceJs -notmatch '__ALIGN_GUIDE_FORM_ID__') -Detail 'Capture handler requires a successful HTTP response'
  Add-Check -List $checks -Name 'GA4 event instrumentation' -Passed ($sourceJs -match "page_not_found" -and $sourceJs -match "resource_downloaded" -and $sourceJs -match "generate_lead" -and $sourceJs -match "content_engaged" -and $sourceJs -match "scroll_depth_90") -Detail '404, guide, CTA, form, meeting intent, reading-time, and scroll-depth events are installed'
  Add-Check -List $checks -Name 'Second-step engagement paths' -Passed ($sourceJs -match 'align-next-step-path' -and $sourceJs -match 'Keep exploring') -Detail 'Contextual internal next steps are installed on high-exit page types'

  $homeResponse = $null; $blogResponse = $null; $representativeResponse = $null
  for ($attempt = 1; $attempt -le $Retries; $attempt++) {
    $homeResponse = Get-PublicResponse -Uri 'https://www.alignhcm.com/'
    $blogResponse = Get-PublicResponse -Uri 'https://www.alignhcm.com/blog'
    $representativeResponse = Get-PublicResponse -Uri 'https://www.alignhcm.com/blog/the-strategic-buyers-guide-to-workday'
    if ($homeResponse.content -match 'align-attribution' -and $representativeResponse.content -match 'align-blog-cta--inline') { break }
    if ($attempt -lt $Retries) { Start-Sleep -Seconds $DelaySeconds }
  }
  Add-Check -List $checks -Name 'Attribution asset live' -Passed ($homeResponse.status -eq 200 -and $homeResponse.content -match 'align-attribution') -Detail "Home HTTP $($homeResponse.status)"
  $canonicalMatches = [regex]::Matches($blogResponse.content, '(?is)<link[^>]+rel=["'']canonical["''][^>]*>')
  $expectedCanonical = @($canonicalMatches | Where-Object { $_.Value -match 'https://www\.alignhcm\.com/blog["'']' })
  Add-Check -List $checks -Name 'Blog canonical' -Passed ($blogResponse.status -eq 200 -and $canonicalMatches.Count -eq 1 -and $expectedCanonical.Count -eq 1) -Detail "$($canonicalMatches.Count) canonical tag(s)"
  Add-Check -List $checks -Name 'Blog conversion path' -Passed ($representativeResponse.status -eq 200 -and $representativeResponse.content -match 'align-at-a-glance' -and $representativeResponse.content -match 'align-blog-cta--inline' -and $representativeResponse.content -match 'blog-conversion-form') -Detail 'Summary, inline CTA, and end form are rendered'

  foreach ($slug in @('adp-implementation-specialists', 'dayforce-guide-for-strategic-buyers', 'the-strategic-buyers-guide-to-workday')) {
    $page = Get-PublicResponse -Uri "https://www.alignhcm.com/blog/$slug"
    $h1Count = [regex]::Matches($page.content, '(?i)<h1(?:\s|>)').Count
    Add-Check -List $checks -Name "Single H1: $slug" -Passed ($page.status -eq 200 -and $h1Count -eq 1) -Detail "HTTP $($page.status), H1 count $h1Count"
  }

  $ukg = Get-PublicResponse -Uri 'https://www.alignhcm.com/blog/ukg-buyers-guide' -FollowRedirects $false
  Add-Check -List $checks -Name 'Duplicate UKG guide redirect' -Passed ($ukg.status -eq 301 -and $ukg.location -match 'the-strategic-buyers-guide-to-ukg') -Detail "HTTP $($ukg.status) to $($ukg.location)"

  $notFound = Get-PublicResponse -Uri "https://www.alignhcm.com/codex-404-verification-$([DateTimeOffset]::UtcNow.ToUnixTimeSeconds())"
  Add-Check -List $checks -Name '404 tracking asset' -Passed ($notFound.status -eq 404 -and $notFound.content -match 'align-attribution') -Detail "HTTP $($notFound.status), tracking asset present"

  foreach ($agent in @('GPTBot', 'ClaudeBot', 'PerplexityBot')) {
    $robots = Get-PublicResponse -Uri 'https://www.alignhcm.com/robots.txt' -UserAgent $agent
    Add-Check -List $checks -Name "Crawler access: $agent" -Passed ($robots.status -eq 200) -Detail "robots.txt HTTP $($robots.status)"
  }
  $llms = Get-PublicResponse -Uri 'https://www.alignhcm.com/llms.txt' -UserAgent 'OAI-SearchBot'
  Add-Check -List $checks -Name 'llms.txt access' -Passed ($llms.status -eq 200 -and $llms.contentType -match '^text/plain') -Detail "HTTP $($llms.status), $($llms.contentType)"

  $key = Get-IndexNowKey
  $keyResponse = Get-PublicResponse -Uri "https://www.alignhcm.com/hubfs/alignhcm/indexnow/$key.txt"
  Add-Check -List $checks -Name 'IndexNow key' -Passed ($keyResponse.status -eq 200 -and $keyResponse.content.Trim() -eq $key) -Detail "HTTP $($keyResponse.status)"

  $customEventStatus = 0
  try { Invoke-RestMethod -Headers $headers -Uri "$ApiRoot/events/2026-03/event-definitions?limit=1" | Out-Null; $customEventStatus = 200 }
  catch { try { $customEventStatus = [int]$_.Exception.Response.StatusCode } catch { $customEventStatus = 0 } }
  Add-Check -List $checks -Name 'HubSpot custom event definitions scope' -Passed ($customEventStatus -eq 200) -Required $false -Detail $(if ($customEventStatus -eq 403) { 'Private app scope is not granted; GA4 events and HubSpot form conversions remain active' } else { "HTTP $customEventStatus" })

  $requiredFailures = @($checks | Where-Object { $_.required -and !$_.passed })
  [pscustomobject]@{
    portalId = $ExpectedPortalId
    checkedAt = [DateTimeOffset]::Now.ToString('o')
    passed = ($requiredFailures.Count -eq 0)
    requiredFailures = $requiredFailures.Count
    checks = $checks
  } | ConvertTo-Json -Depth 8
  if ($requiredFailures.Count) { exit 1 }
} finally {
  $headers = $null
  $token = $null
}
