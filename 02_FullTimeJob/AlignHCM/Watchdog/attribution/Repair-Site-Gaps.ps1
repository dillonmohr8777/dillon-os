[CmdletBinding()]
param(
  [switch]$Apply,
  [string]$TokenDpapiPath = $env:ALIGN_HUBSPOT_TOKEN_DPAPI_PATH
)

$ErrorActionPreference = 'Stop'
$ExpectedPortalId = '242825734'
$ApiRoot = 'https://api.hubapi.com'
$DefaultTokenPath = 'C:\Users\dillo\Documents\Codex\2026-07-12\hubspot-agent-set-jasonhubspottoken-ps1-hubspot\hubspot-agent\.secrets\align-hubspot-token.dpapi'
$SmartCareTemplatePath = 'Align HCM/templates/SmartCare-live.html'
$BackupStamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$BackupRoot = Join-Path $env:LOCALAPPDATA "Codex\AlignHCMBackups\site-gaps-$BackupStamp"

function Get-AlignHubSpotToken {
  if ($env:HUBSPOT_SERVICE_KEY) { return $env:HUBSPOT_SERVICE_KEY }
  if ($env:HUBSPOT_ACCESS_TOKEN) { return $env:HUBSPOT_ACCESS_TOKEN }
  $path = if ($TokenDpapiPath) { $TokenDpapiPath } else { $DefaultTokenPath }
  if (!(Test-Path -LiteralPath $path)) { throw 'No Align HubSpot token environment variable or DPAPI token was found.' }
  $secure = ConvertTo-SecureString (Get-Content -Raw -LiteralPath $path)
  $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  try { [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr) }
  finally { if ($ptr -ne [IntPtr]::Zero) { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) } }
}

function Get-HttpStatusFromError {
  param($ErrorRecord)
  try { [int]$ErrorRecord.Exception.Response.StatusCode }
  catch { 0 }
}

function Invoke-HubSpotJson {
  param(
    [Parameter(Mandatory = $true)][ValidateSet('Get', 'Post', 'Put', 'Patch')][string]$Method,
    [Parameter(Mandatory = $true)][string]$Uri,
    [Parameter(Mandatory = $true)][hashtable]$Headers,
    [object]$Body
  )
  $params = @{ Method = $Method; Uri = $Uri; Headers = $Headers }
  if ($null -ne $Body) {
    $params.ContentType = 'application/json'
    $params.Body = $Body | ConvertTo-Json -Depth 50 -Compress
  }
  Invoke-RestMethod @params
}

function Get-SourceText {
  param([string]$CmsPath, [hashtable]$Headers)
  $encoded = [Uri]::EscapeDataString($CmsPath)
  $response = Invoke-WebRequest -Method Get -Headers $Headers -Uri "$ApiRoot/cms/v3/source-code/published/content/$encoded" -UseBasicParsing
  if ($response.Content -is [byte[]]) { return [Text.Encoding]::UTF8.GetString([byte[]]$response.Content) }
  [string]$response.Content
}

function Send-SourceContent {
  param(
    [string]$Token,
    [ValidateSet('draft', 'published')][string]$Environment,
    [ValidateSet('validate', 'content')][string]$Action,
    [ValidateSet('POST', 'PUT')][string]$Method,
    [string]$CmsPath,
    [string]$Content
  )
  Add-Type -AssemblyName System.Net.Http
  $client = [Net.Http.HttpClient]::new()
  $multipart = [Net.Http.MultipartFormDataContent]::new()
  $request = $null
  try {
    $client.DefaultRequestHeaders.Authorization = [Net.Http.Headers.AuthenticationHeaderValue]::new('Bearer', $Token)
    $bytes = [Text.UTF8Encoding]::new($false).GetBytes($Content)
    $file = [Net.Http.ByteArrayContent]::new($bytes)
    $file.Headers.ContentType = [Net.Http.Headers.MediaTypeHeaderValue]::new('application/octet-stream')
    $multipart.Add($file, 'file', [IO.Path]::GetFileName($CmsPath))
    $encoded = [Uri]::EscapeDataString($CmsPath)
    $request = [Net.Http.HttpRequestMessage]::new([Net.Http.HttpMethod]::new($Method), "$ApiRoot/cms/v3/source-code/$Environment/$Action/$encoded")
    $request.Content = $multipart
    $response = $client.SendAsync($request).GetAwaiter().GetResult()
    $payload = $response.Content.ReadAsStringAsync().GetAwaiter().GetResult()
    if (!$response.IsSuccessStatusCode) {
      throw "HubSpot source $Action failed for $CmsPath with HTTP $([int]$response.StatusCode): $payload"
    }
    [pscustomobject]@{ path = $CmsPath; action = $Action; environment = $Environment; status = [int]$response.StatusCode }
  } finally {
    if ($request) { $request.Dispose() }
    $multipart.Dispose()
    $client.Dispose()
  }
}

function Remove-ManagedBlock {
  param([string]$Text, [string]$StartMarker, [string]$EndMarker)
  $pattern = '(?s)\s*' + [regex]::Escape($StartMarker) + '.*?' + [regex]::Escape($EndMarker) + '\s*'
  [regex]::Replace($Text, $pattern, "`r`n")
}

function Add-ManagedBlockAtEnd {
  param([string]$Text, [string]$StartMarker, [string]$EndMarker, [string]$Block)
  $clean = Remove-ManagedBlock -Text $Text -StartMarker $StartMarker -EndMarker $EndMarker
  $clean.TrimEnd() + "`r`n" + $Block.Trim() + "`r`n"
}

function Add-ManagedBlockBeforeTag {
  param([string]$Text, [string]$StartMarker, [string]$EndMarker, [string]$Block, [string]$ClosingTag)
  $clean = Remove-ManagedBlock -Text $Text -StartMarker $StartMarker -EndMarker $EndMarker
  $index = $clean.LastIndexOf($ClosingTag, [StringComparison]::OrdinalIgnoreCase)
  if ($index -lt 0) { throw "Could not find $ClosingTag while patching the SmartCare template." }
  $clean.Insert($index, $Block.Trim() + "`r`n")
}

function Replace-LiteralOnce {
  param([string]$Text, [string]$OldValue, [string]$NewValue)
  if ($Text.Contains($NewValue)) { return $Text }
  $first = $Text.IndexOf($OldValue, [StringComparison]::Ordinal)
  if ($first -lt 0) { throw "Expected SmartCare markup was not found: $OldValue" }
  if ($Text.IndexOf($OldValue, $first + $OldValue.Length, [StringComparison]::Ordinal) -ge 0) {
    throw "Expected SmartCare markup was not unique: $OldValue"
  }
  $Text.Replace($OldValue, $NewValue)
}

function Update-SiteSettings {
  param([hashtable]$Headers, $Settings, [string]$HeadHtml, [string]$FooterHtml)
  $body = @{ head_html = $HeadHtml; footer_html = $FooterHtml }
  try {
    Invoke-HubSpotJson -Method Put -Uri "$ApiRoot/content/api/v2/site-settings/$($Settings.id)" -Headers $Headers -Body $body
  } catch {
    if ((Get-HttpStatusFromError $_) -notin @(404, 405)) { throw }
    $body.id = $Settings.id
    Invoke-HubSpotJson -Method Put -Uri "$ApiRoot/content/api/v2/site-settings" -Headers $Headers -Body $body
  }
}

function Get-WebText {
  param([string]$Uri)
  $response = Invoke-WebRequest -UseBasicParsing -Uri $Uri -MaximumRedirection 5 -TimeoutSec 30
  if ($response.Content -is [byte[]]) { return [Text.Encoding]::UTF8.GetString([byte[]]$response.Content) }
  [string]$response.Content
}

$globalHeadStart = '<!-- align-attribution-global-head:start -->'
$globalHeadEnd = '<!-- align-attribution-global-head:end -->'
$globalFooterStart = '<!-- align-attribution-global-footer:start -->'
$globalFooterEnd = '<!-- align-attribution-global-footer:end -->'
$smartHeadStart = '<!-- align-smartcare-tracking-head:start -->'
$smartHeadEnd = '<!-- align-smartcare-tracking-head:end -->'
$smartFooterStart = '<!-- align-smartcare-tracking-footer:start -->'
$smartFooterEnd = '<!-- align-smartcare-tracking-footer:end -->'

$globalHeadBlock = @'
<!-- align-attribution-global-head:start -->
<link rel="stylesheet" href="{{ get_asset_url('Align HCM/css/align-attribution.css') }}">
<!-- align-attribution-global-head:end -->
'@
$globalFooterBlock = @'
<!-- align-attribution-global-footer:start -->
<script defer src="{{ get_asset_url('Align HCM/js/align-attribution.js') }}"></script>
<!-- align-attribution-global-footer:end -->
'@
$smartHeadBlock = @'
<!-- align-smartcare-tracking-head:start -->
<link rel="stylesheet" href="{{ get_asset_url('../css/align-attribution.css') }}">
<script async src="https://www.googletagmanager.com/gtag/js?id=G-320235048"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-320235048');
</script>
<!-- align-smartcare-tracking-head:end -->
'@
$smartFooterBlock = @'
<!-- align-smartcare-tracking-footer:start -->
<script type="text/javascript" id="hs-script-loader" async defer src="/hs/scriptloader/242825734.js"></script>
<script defer src="{{ get_asset_url('../js/align-attribution.js') }}"></script>
<!-- align-smartcare-tracking-footer:end -->
'@

$token = Get-AlignHubSpotToken
$headers = @{ Authorization = "Bearer $token" }
try {
  $identity = Invoke-HubSpotJson -Method Get -Uri "$ApiRoot/integrations/v1/me" -Headers $headers
  if ("$($identity.portalId)" -ne $ExpectedPortalId) { throw "HubSpot portal mismatch. Expected $ExpectedPortalId, got $($identity.portalId)." }

  $settingsResponse = Invoke-HubSpotJson -Method Get -Uri "$ApiRoot/content/api/v2/site-settings" -Headers $headers
  $settings = @($settingsResponse.objects | Where-Object { "$($_.portal_id)" -eq $ExpectedPortalId }) | Select-Object -First 1
  if (!$settings) { throw 'The Align HubSpot site settings record was not returned.' }
  $smartCareOriginal = Get-SourceText -CmsPath $SmartCareTemplatePath -Headers $headers

  $newHead = Add-ManagedBlockAtEnd -Text ([string]$settings.head_html) -StartMarker $globalHeadStart -EndMarker $globalHeadEnd -Block $globalHeadBlock
  $newFooter = Add-ManagedBlockAtEnd -Text ([string]$settings.footer_html) -StartMarker $globalFooterStart -EndMarker $globalFooterEnd -Block $globalFooterBlock

  $smartCare = Add-ManagedBlockBeforeTag -Text $smartCareOriginal -StartMarker $smartHeadStart -EndMarker $smartHeadEnd -Block $smartHeadBlock -ClosingTag '</head>'
  $smartCare = Add-ManagedBlockBeforeTag -Text $smartCare -StartMarker $smartFooterStart -EndMarker $smartFooterEnd -Block $smartFooterBlock -ClosingTag '</body>'
  if ($smartCare -notmatch 'data-align-managed-form="true"') {
    $pattern = '(?is)<form\s+onsubmit="[^"]*">'
    $matches = [regex]::Matches($smartCare, $pattern)
    if ($matches.Count -ne 1) { throw "Expected one fake SmartCare form handler, found $($matches.Count)." }
    $smartCare = [regex]::Replace($smartCare, $pattern, '<form id="smartcare-contact-form" data-align-managed-form="true" data-align-offer-id="smartcare_support" data-align-cta-placement="smartcare_page_form" novalidate>', [Text.RegularExpressions.RegexOptions]::IgnoreCase)
  }
  $smartCare = Replace-LiteralOnce $smartCare '<input type="text" placeholder="Your full name" required>' '<input type="text" name="name" placeholder="Your full name" required>'
  $smartCare = Replace-LiteralOnce $smartCare '<input type="email" placeholder="you@company.com" required>' '<input type="email" name="email" placeholder="you@company.com" required>'
  $smartCare = Replace-LiteralOnce $smartCare '<input type="tel" placeholder="(555) 123-4567" required>' '<input type="tel" name="phone" placeholder="(555) 123-4567" required>'
  $smartCare = Replace-LiteralOnce $smartCare '<input type="text" placeholder="Your company name" required>' '<input type="text" name="company" placeholder="Your company name" required>'
  $smartCare = Replace-LiteralOnce $smartCare '<select required><option value="">' '<select name="service_interest" required><option value="">'
  $smartCare = Replace-LiteralOnce $smartCare '<option>Free Month 1 Discovery</option>' '<option value="Smartcare Support">Free Month 1 Discovery</option>'
  $smartCare = Replace-LiteralOnce $smartCare '<option>SmartCare Maintenance</option>' '<option value="Smartcare Support">SmartCare Maintenance</option>'
  $smartCare = Replace-LiteralOnce $smartCare '<option>Managed Payroll / HRIS / WFM</option>' '<option value="HCM Implementation">Managed Payroll / HRIS / WFM</option>'
  $smartCare = Replace-LiteralOnce $smartCare '<option>Strategic Advisory</option>' '<option value="Other">Strategic Advisory</option>'
  $smartCare = Replace-LiteralOnce $smartCare '<option>Something else</option>' '<option value="Other">Something else</option>'
  $smartCare = Replace-LiteralOnce $smartCare '<textarea rows="3" placeholder="Tell us what you need help with...">' '<textarea name="message" rows="3" placeholder="Tell us what you need help with...">'
  $smartCare = Replace-LiteralOnce $smartCare '<button type="submit" class="btn btn-primary">' '<button type="submit" class="btn btn-primary asbtn">'

  $validation = Send-SourceContent -Token $token -Environment published -Action validate -Method POST -CmsPath $SmartCareTemplatePath -Content $smartCare
  $planned = [pscustomobject]@{
    portalId = $ExpectedPortalId
    apply = [bool]$Apply
    globalHeadChanged = ($newHead -ne [string]$settings.head_html)
    globalFooterChanged = ($newFooter -ne [string]$settings.footer_html)
    smartCareChanged = ($smartCare -ne $smartCareOriginal)
    smartCareValidation = $validation
  }
  if (!$Apply) { $planned | ConvertTo-Json -Depth 6; return }

  New-Item -ItemType Directory -Path $BackupRoot -Force | Out-Null
  [IO.File]::WriteAllText((Join-Path $BackupRoot 'site-settings.json'), (($settings | ConvertTo-Json -Depth 50) + "`n"), [Text.UTF8Encoding]::new($false))
  [IO.File]::WriteAllText((Join-Path $BackupRoot 'SmartCare-live.html'), $smartCareOriginal, [Text.UTF8Encoding]::new($false))

  Update-SiteSettings -Headers $headers -Settings $settings -HeadHtml $newHead -FooterHtml $newFooter | Out-Null
  Send-SourceContent -Token $token -Environment draft -Action content -Method PUT -CmsPath $SmartCareTemplatePath -Content $smartCare | Out-Null
  $published = Send-SourceContent -Token $token -Environment published -Action content -Method PUT -CmsPath $SmartCareTemplatePath -Content $smartCare

  $checks = @()
  foreach ($url in @(
    'https://www.alignhcm.com/case-studies',
    'https://www.alignhcm.com/partners/brokers',
    'https://www.alignhcm.com/align-hcm-smartcare'
  )) {
    $html = ''
    for ($attempt = 1; $attempt -le 6; $attempt++) {
      $html = Get-WebText -Uri $url
      $hasCustomAttribution = $html -match 'align-attribution(?:\.min)?\.js'
      $hasNativeCaseStudyCoverage = $url -match '/case-studies/?$' -and
        $html -match 'scp_content_type:\s*["'']case-study["'']' -and
        $html -match 'G-320235048' -and
        $html -match 'hs/scriptloader/242825734\.js'
      if ($hasCustomAttribution -or $hasNativeCaseStudyCoverage) { break }
      if ($attempt -lt 6) { Start-Sleep -Seconds 3 }
    }
    $hasCustomAttribution = $html -match 'align-attribution(?:\.min)?\.js'
    $hasNativeCaseStudyCoverage = $url -match '/case-studies/?$' -and
      $html -match 'scp_content_type:\s*["'']case-study["'']' -and
      $html -match 'G-320235048' -and
      $html -match 'hs/scriptloader/242825734\.js'
    $checks += [pscustomobject]@{
      url = $url
      attributionAsset = $hasCustomAttribution
      nativeCaseStudyCoverage = $hasNativeCaseStudyCoverage
      conversionCoverage = ($hasCustomAttribution -or $hasNativeCaseStudyCoverage)
      coverageMode = if ($hasCustomAttribution) { 'custom-attribution' } elseif ($hasNativeCaseStudyCoverage) { 'hubspot-native-case-study' } else { 'missing' }
      ga4 = ($html -match 'G-320235048')
      hubspot = ($html -match 'hs/scriptloader/242825734\.js')
      managedForm = if ($url -match 'align-hcm-smartcare') { ($html -match 'data-align-managed-form="true"') } else { $null }
      fakeSuccessRemoved = if ($url -match 'align-hcm-smartcare') { ($html -notmatch 'Thanks\. We will call you within the hour') } else { $null }
    }
  }
  $failures = @($checks | Where-Object { !$_.conversionCoverage -or !$_.ga4 -or !$_.hubspot -or ($_.url -match 'align-hcm-smartcare' -and (!$_.managedForm -or !$_.fakeSuccessRemoved)) })
  if ($failures.Count) { throw "One or more live remediation checks failed: $($failures.url -join ', ')" }

  [pscustomobject]@{
    portalId = $ExpectedPortalId
    applied = $true
    backup = $BackupRoot
    publishedSource = $published
    checks = $checks
    sandboxPolicyLinkRepair = 'Runtime rewrite deployed through the global attribution asset.'
  } | ConvertTo-Json -Depth 7
} finally {
  $token = $null
}
