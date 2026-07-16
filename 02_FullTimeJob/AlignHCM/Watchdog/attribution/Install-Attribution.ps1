[CmdletBinding()]
param(
  [switch]$Apply,
  [switch]$SkipIndexNow,
  [string]$TokenDpapiPath = $env:ALIGN_HUBSPOT_TOKEN_DPAPI_PATH
)

$ErrorActionPreference = 'Stop'
$ExpectedPortalId = '242825734'
$ApiRoot = 'https://api.hubapi.com'
$DefaultTokenPath = 'C:\Users\dillo\Documents\Codex\2026-07-12\hubspot-agent-set-jasonhubspottoken-ps1-hubspot\hubspot-agent\.secrets\align-hubspot-token.dpapi'
$CmsRoot = Join-Path $PSScriptRoot 'cms'
$BackupStamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$BackupRoot = Join-Path $env:LOCALAPPDATA "Codex\AlignHCMBackups\attribution-$BackupStamp"

$AttributionProperties = @(
  [pscustomobject]@{ name = 'align_first_landing_page'; label = 'Align first landing page'; description = 'First page seen on alignhcm.com, excluding query parameters.' },
  [pscustomobject]@{ name = 'align_first_referrer'; label = 'Align first referrer'; description = 'First referring page, excluding query parameters.' },
  [pscustomobject]@{ name = 'align_first_utm_source'; label = 'Align first UTM source'; description = 'First captured UTM source.' },
  [pscustomobject]@{ name = 'align_first_utm_medium'; label = 'Align first UTM medium'; description = 'First captured UTM medium.' },
  [pscustomobject]@{ name = 'align_first_utm_campaign'; label = 'Align first UTM campaign'; description = 'First captured UTM campaign.' },
  [pscustomobject]@{ name = 'align_first_utm_content'; label = 'Align first UTM content'; description = 'First captured UTM content.' },
  [pscustomobject]@{ name = 'align_first_utm_term'; label = 'Align first UTM term'; description = 'First captured UTM term.' },
  [pscustomobject]@{ name = 'align_first_gclid'; label = 'Align first Google click ID'; description = 'First captured Google Ads click ID.' },
  [pscustomobject]@{ name = 'align_first_fbclid'; label = 'Align first Meta click ID'; description = 'First captured Meta click ID.' },
  [pscustomobject]@{ name = 'align_first_msclkid'; label = 'Align first Microsoft click ID'; description = 'First captured Microsoft Ads click ID.' },
  [pscustomobject]@{ name = 'align_last_landing_page'; label = 'Align last landing page'; description = 'Most recent session landing page, excluding query parameters.' },
  [pscustomobject]@{ name = 'align_last_referrer'; label = 'Align last referrer'; description = 'Most recent session referrer, excluding query parameters.' },
  [pscustomobject]@{ name = 'align_last_utm_source'; label = 'Align last UTM source'; description = 'Most recent captured UTM source.' },
  [pscustomobject]@{ name = 'align_last_utm_medium'; label = 'Align last UTM medium'; description = 'Most recent captured UTM medium.' },
  [pscustomobject]@{ name = 'align_last_utm_campaign'; label = 'Align last UTM campaign'; description = 'Most recent captured UTM campaign.' },
  [pscustomobject]@{ name = 'align_last_utm_content'; label = 'Align last UTM content'; description = 'Most recent captured UTM content.' },
  [pscustomobject]@{ name = 'align_last_utm_term'; label = 'Align last UTM term'; description = 'Most recent captured UTM term.' },
  [pscustomobject]@{ name = 'align_last_gclid'; label = 'Align last Google click ID'; description = 'Most recent captured Google Ads click ID.' },
  [pscustomobject]@{ name = 'align_last_fbclid'; label = 'Align last Meta click ID'; description = 'Most recent captured Meta click ID.' },
  [pscustomobject]@{ name = 'align_last_msclkid'; label = 'Align last Microsoft click ID'; description = 'Most recent captured Microsoft Ads click ID.' },
  [pscustomobject]@{ name = 'align_content_slug'; label = 'Align conversion content slug'; description = 'Content path associated with the conversion.' },
  [pscustomobject]@{ name = 'align_content_topic'; label = 'Align conversion content topic'; description = 'Content title associated with the conversion.' },
  [pscustomobject]@{ name = 'align_offer_id'; label = 'Align conversion offer'; description = 'Offer associated with the conversion.' },
  [pscustomobject]@{ name = 'align_cta_placement'; label = 'Align CTA placement'; description = 'Placement of the CTA or form associated with the conversion.' },
  [pscustomobject]@{ name = 'align_conversion_page'; label = 'Align conversion page'; description = 'Page where the known conversion occurred, excluding query parameters.' },
  [pscustomobject]@{ name = 'align_conversion_type'; label = 'Align conversion type'; description = 'Known conversion type such as contact form or guide download.' },
  [pscustomobject]@{ name = 'align_requested_url'; label = 'Align requested URL'; description = 'Requested path when a conversion follows a 404 visit.' }
)

$CoreFormIds = @(
  '2a7dbc2e-600a-4d2b-9222-bda4cfd8d5bb',
  '99353f9f-a047-4b21-b0ca-ee452f8cf6f6',
  'a2f5cad0-6a8b-485d-b57a-0c0b65e86936',
  'e733d928-0f1d-4b41-853b-df1e0096f330'
)

$CmsPaths = @(
  'Align HCM/js/align-attribution.js',
  'Align HCM/css/align-attribution.css',
  'Align HCM/modules/Blog Contact Form.module/module.html',
  'Align HCM/templates/blog-post.html',
  'Align HCM/templates/layouts/base.html'
)

$BlogPostIds = @(
  '277255702263',
  '277284677368',
  '277308102345',
  '277308100320',
  '365966893778'
)
$H1RepairPostIds = @(
  '277255702263',
  '277284677368',
  '277308102345',
  '365966893778'
)

function Get-AlignHubSpotToken {
  if ($env:HUBSPOT_SERVICE_KEY) { return $env:HUBSPOT_SERVICE_KEY }
  if ($env:HUBSPOT_ACCESS_TOKEN) { return $env:HUBSPOT_ACCESS_TOKEN }
  $path = if ($TokenDpapiPath) { $TokenDpapiPath } else { $DefaultTokenPath }
  if (!(Test-Path -LiteralPath $path)) { throw 'No Align HubSpot token environment variable or DPAPI token was found.' }
  $secure = ConvertTo-SecureString (Get-Content -Raw -LiteralPath $path)
  $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  try { return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr) }
  finally { if ($ptr -ne [IntPtr]::Zero) { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) } }
}

function Get-HttpStatusFromError {
  param($ErrorRecord)
  try { return [int]$ErrorRecord.Exception.Response.StatusCode }
  catch { return 0 }
}

function Invoke-HubSpotJson {
  param(
    [Parameter(Mandatory = $true)][ValidateSet('Get', 'Post', 'Patch', 'Delete')][string]$Method,
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

function Get-HubSpotJsonOrNull {
  param([string]$Uri, [hashtable]$Headers)
  try { Invoke-HubSpotJson -Method Get -Uri $Uri -Headers $Headers }
  catch {
    if ((Get-HttpStatusFromError $_) -eq 404) { return $null }
    throw
  }
}

function Write-JsonBackup {
  param([string]$Name, $Value)
  $path = Join-Path $BackupRoot $Name
  $parent = Split-Path -Parent $path
  if (!(Test-Path -LiteralPath $parent)) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }
  $json = ($Value | ConvertTo-Json -Depth 50) + "`n"
  [IO.File]::WriteAllText($path, $json, [Text.UTF8Encoding]::new($false))
}

function Get-AllForms {
  param([hashtable]$Headers)
  $results = @()
  $after = $null
  do {
    $uri = "$ApiRoot/marketing/v3/forms?limit=100"
    if ($after) { $uri += '&after=' + [Uri]::EscapeDataString([string]$after) }
    $page = Invoke-HubSpotJson -Method Get -Uri $uri -Headers $Headers
    $results += @($page.results)
    $after = $page.paging.next.after
  } while ($after)
  @($results)
}

function Get-AllRedirects {
  param([hashtable]$Headers)
  $results = @()
  $after = $null
  do {
    $uri = "$ApiRoot/cms/url-redirects/2026-03?limit=100"
    if ($after) { $uri += '&after=' + [Uri]::EscapeDataString([string]$after) }
    $page = Invoke-HubSpotJson -Method Get -Uri $uri -Headers $Headers
    $results += @($page.results)
    $after = $page.paging.next.after
  } while ($after)
  @($results)
}

function Get-SourceBytes {
  param([string]$CmsPath, [hashtable]$Headers)
  $encoded = [Uri]::EscapeDataString($CmsPath)
  $response = Invoke-WebRequest -Method Get -Headers $Headers -Uri "$ApiRoot/cms/v3/source-code/published/content/$encoded" -UseBasicParsing
  if ($response.Content -is [byte[]]) { return [byte[]]$response.Content }
  [Text.Encoding]::UTF8.GetBytes([string]$response.Content)
}

function Backup-LiveState {
  param([hashtable]$Headers, [object[]]$Forms, [object[]]$Redirects)
  New-Item -ItemType Directory -Path $BackupRoot -Force | Out-Null
  $manifest = [ordered]@{ createdAt = [DateTimeOffset]::Now.ToString('o'); portalId = $ExpectedPortalId; sourceFiles = @(); forms = @(); blogPosts = @() }
  foreach ($cmsPath in $CmsPaths) {
    try {
      [byte[]]$bytes = @(Get-SourceBytes -CmsPath $cmsPath -Headers $Headers)
      $safeName = ($cmsPath -replace '[\\/]', '__')
      [IO.File]::WriteAllBytes((Join-Path $BackupRoot "source__$safeName"), $bytes)
      $manifest.sourceFiles += [pscustomobject]@{ path = $cmsPath; existed = $true; sha256 = ([BitConverter]::ToString(([Security.Cryptography.SHA256]::Create()).ComputeHash($bytes))).Replace('-', '').ToLowerInvariant() }
    } catch {
      if ((Get-HttpStatusFromError $_) -eq 404) { $manifest.sourceFiles += [pscustomobject]@{ path = $cmsPath; existed = $false } }
      else { throw }
    }
  }
  foreach ($form in @($Forms | Where-Object { $_.id -in $CoreFormIds -or $_.name -eq 'Align Buyer Guide Download' })) {
    Write-JsonBackup -Name "forms\$($form.id).json" -Value $form
    $manifest.forms += [pscustomobject]@{ id = $form.id; name = $form.name }
  }
  $service = Invoke-HubSpotJson -Method Get -Uri "$ApiRoot/crm/v3/properties/contacts/service_interest" -Headers $Headers
  Write-JsonBackup -Name 'properties\service_interest.json' -Value $service
  Write-JsonBackup -Name 'redirects.json' -Value $Redirects
  foreach ($postId in $BlogPostIds) {
    $post = Invoke-HubSpotJson -Method Get -Uri "$ApiRoot/cms/v3/blogs/posts/$postId" -Headers $Headers
    Write-JsonBackup -Name "blog-posts\$postId.json" -Value $post
    $manifest.blogPosts += [pscustomobject]@{ id = $post.id; slug = $post.slug; state = $post.state }
  }
  Write-JsonBackup -Name 'manifest.json' -Value $manifest
  $service
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
    $fileContent = [Net.Http.ByteArrayContent]::new($bytes)
    $fileContent.Headers.ContentType = [Net.Http.Headers.MediaTypeHeaderValue]::new('application/octet-stream')
    $multipart.Add($fileContent, 'file', [IO.Path]::GetFileName($CmsPath))
    $encoded = [Uri]::EscapeDataString($CmsPath)
    $request = [Net.Http.HttpRequestMessage]::new([Net.Http.HttpMethod]::new($Method), "$ApiRoot/cms/v3/source-code/$Environment/$Action/$encoded")
    $request.Content = $multipart
    $response = $client.SendAsync($request).GetAwaiter().GetResult()
    $payload = $response.Content.ReadAsStringAsync().GetAwaiter().GetResult()
    if (!$response.IsSuccessStatusCode) {
      $acceptedBaselineWarnings = $false
      $warningCount = 0
      if ($Action -eq 'validate') {
        try {
          $validation = $payload | ConvertFrom-Json
          $messages = @($validation.errors | ForEach-Object { [string]$_.message })
          $unexpected = @($messages | Where-Object {
            $_ -notmatch 'site_settings\.logo_src has been deprecated' -and
            $_ -notmatch "No translations found at path 'Align HCM/templates/_locales'" -and
            $_ -notmatch 'Passed #null into convert_rgb' -and
            $_ -notmatch 'escape_url filter was invalid'
          })
          $acceptedBaselineWarnings = $messages.Count -gt 0 -and $unexpected.Count -eq 0
          $warningCount = $messages.Count
        } catch { $acceptedBaselineWarnings = $false }
      }
      if (!$acceptedBaselineWarnings) { throw "HubSpot source $Action failed for $CmsPath with HTTP $([int]$response.StatusCode): $payload" }
      return [pscustomobject]@{ path = $CmsPath; action = $Action; environment = $Environment; status = [int]$response.StatusCode; acceptedBaselineWarnings = $warningCount }
    }
    [pscustomobject]@{ path = $CmsPath; action = $Action; environment = $Environment; status = [int]$response.StatusCode; acceptedBaselineWarnings = 0 }
  } finally {
    if ($request) { $request.Dispose() }
    $multipart.Dispose()
    $client.Dispose()
  }
}

function Ensure-AttributionProperties {
  param([hashtable]$Headers)
  $groups = Invoke-HubSpotJson -Method Get -Uri "$ApiRoot/crm/v3/properties/contacts/groups" -Headers $Headers
  if (!(@($groups.results | Where-Object { $_.name -eq 'align_attribution' }).Count)) {
    Invoke-HubSpotJson -Method Post -Uri "$ApiRoot/crm/v3/properties/contacts/groups" -Headers $Headers -Body @{
      name = 'align_attribution'; label = 'Align attribution'; displayOrder = -1
    } | Out-Null
  }
  $created = @()
  $existing = @()
  foreach ($property in $AttributionProperties) {
    $current = Get-HubSpotJsonOrNull -Uri "$ApiRoot/crm/v3/properties/contacts/$($property.name)" -Headers $Headers
    if ($current) { $existing += $property.name; continue }
    Invoke-HubSpotJson -Method Post -Uri "$ApiRoot/crm/v3/properties/contacts" -Headers $Headers -Body @{
      groupName = 'align_attribution'
      name = $property.name
      label = $property.label
      type = 'string'
      fieldType = 'text'
      description = $property.description
      formField = $true
      hidden = $false
    } | Out-Null
    $created += $property.name
  }
  [pscustomobject]@{ created = $created; existing = $existing }
}

function Ensure-ServiceInterestOption {
  param([hashtable]$Headers, $ServiceProperty)
  if (@($ServiceProperty.options | Where-Object { $_.value -eq 'HCM Implementation' }).Count) { return $false }
  $options = @($ServiceProperty.options) + [pscustomobject]@{
    hidden = $false; label = 'HCM Implementation'; value = 'HCM Implementation'; description = ''; displayOrder = -1
  }
  Invoke-HubSpotJson -Method Patch -Uri "$ApiRoot/crm/v3/properties/contacts/service_interest" -Headers $Headers -Body @{
    label = $ServiceProperty.label
    type = $ServiceProperty.type
    fieldType = $ServiceProperty.fieldType
    groupName = $ServiceProperty.groupName
    description = $ServiceProperty.description
    options = $options
    displayOrder = $ServiceProperty.displayOrder
    formField = $ServiceProperty.formField
    hidden = $ServiceProperty.hidden
  } | Out-Null
  $true
}

function New-HiddenFieldGroup {
  param($Property)
  [pscustomobject]@{
    fields = @([pscustomobject]@{
      objectTypeId = '0-1'
      name = $Property.name
      label = $Property.label
      required = $false
      hidden = $true
      fieldType = 'single_line_text'
    })
  }
}

function Copy-JsonObject {
  param($Value)
  if ($null -eq $Value) { return $null }
  $Value | ConvertTo-Json -Depth 50 | ConvertFrom-Json
}

function New-GuideForm {
  param([hashtable]$Headers, $ContactForm, $ConsentTemplate)
  $groups = @([pscustomobject]@{
    fields = @([pscustomobject]@{
      objectTypeId = '0-1'; name = 'email'; label = 'Email address'; required = $true; hidden = $false
      validation = [pscustomobject]@{ blockedEmailDomains = @(); useDefaultBlockList = $false }
      fieldType = 'email'
    })
  })
  foreach ($property in $AttributionProperties) { $groups += New-HiddenFieldGroup -Property $property }
  $display = [ordered]@{
    renderRawHtml = [bool]$ContactForm.displayOptions.renderRawHtml
    style = [ordered]@{
      fontFamily = $ContactForm.displayOptions.style.fontFamily
      backgroundWidth = $ContactForm.displayOptions.style.backgroundWidth
      labelTextColor = $ContactForm.displayOptions.style.labelTextColor
      labelTextSize = $ContactForm.displayOptions.style.labelTextSize
      helpTextColor = $ContactForm.displayOptions.style.helpTextColor
      helpTextSize = $ContactForm.displayOptions.style.helpTextSize
      legalConsentTextColor = $ContactForm.displayOptions.style.legalConsentTextColor
      legalConsentTextSize = $ContactForm.displayOptions.style.legalConsentTextSize
      submitColor = $ContactForm.displayOptions.style.submitColor
      submitFontColor = $ContactForm.displayOptions.style.submitFontColor
      submitSize = $ContactForm.displayOptions.style.submitSize
    }
    submitButtonText = 'Email me the guide'
    cssClass = $ContactForm.displayOptions.cssClass
  }
  $now = [DateTimeOffset]::UtcNow.ToString('o')
  Invoke-HubSpotJson -Method Post -Uri "$ApiRoot/marketing/v3/forms" -Headers $Headers -Body @{
    archived = $false
    formType = 'hubspot'
    createdAt = $now
    updatedAt = $now
    name = 'Align Buyer Guide Download'
    fieldGroups = $groups
    configuration = @{
      cloneable = $true; editable = $true; archivable = $true; recaptchaEnabled = $false
      notifyContactOwner = $false; notifyRecipients = @($ContactForm.configuration.notifyRecipients)
      createNewContactForNewEmail = $false; prePopulateKnownValues = $true; allowLinkToResetKnownValues = $false
      postSubmitAction = @{ type = 'thank_you'; value = 'Your guide is ready.' }
    }
    displayOptions = $display
    legalConsentOptions = (Copy-JsonObject $ConsentTemplate)
  }
}

function Add-AttributionFieldsToForm {
  param([hashtable]$Headers, $Form, $ServiceProperty)
  $groups = @($Form.fieldGroups | ForEach-Object { [pscustomobject]@{ fields = @($_.fields) } })
  $existingNames = @{}
  foreach ($group in $groups) {
    foreach ($field in @($group.fields)) {
      $existingNames[[string]$field.name] = $true
      if ($Form.id -eq 'e733d928-0f1d-4b41-853b-df1e0096f330' -and $field.name -eq 'service_interest') {
        $field.options = @($ServiceProperty.options | Where-Object { !$_.hidden } | ForEach-Object {
          [pscustomobject]@{ label = $_.label; value = $_.value; description = $_.description; displayOrder = $_.displayOrder }
        })
      }
    }
  }
  foreach ($property in $AttributionProperties) {
    if (!$existingNames.ContainsKey($property.name)) { $groups += New-HiddenFieldGroup -Property $property }
  }
  Invoke-HubSpotJson -Method Patch -Uri "$ApiRoot/marketing/v3/forms/$($Form.id)" -Headers $Headers -Body @{
    archived = $false
    name = $Form.name
    fieldGroups = $groups
    legalConsentOptions = $Form.legalConsentOptions
  }
}

function Repair-BlogH1s {
  param([hashtable]$Headers)
  $all = @()
  foreach ($postId in $H1RepairPostIds) {
    $post = Invoke-HubSpotJson -Method Get -Uri "$ApiRoot/cms/v3/blogs/posts/$postId" -Headers $Headers
    $before = [regex]::Matches([string]$post.postBody, '(?i)<h1(?:\s|>)').Count
    $newBody = [regex]::Replace([string]$post.postBody, '(?i)<h1(?=\s|>)', '<h2')
    $newBody = [regex]::Replace($newBody, '(?i)</h1\s*>', '</h2>')
    if ($newBody -ne $post.postBody) {
      Invoke-HubSpotJson -Method Patch -Uri "$ApiRoot/cms/v3/blogs/posts/$postId" -Headers $Headers -Body @{ postBody = $newBody } | Out-Null
    }
    $all += [pscustomobject]@{ id = $post.id; slug = $post.slug; bodyH1Before = $before; changed = ($newBody -ne $post.postBody) }
  }
  $all
}

function Ensure-UkgRedirect {
  param([hashtable]$Headers, [object[]]$Redirects)
  $route = '/blog/ukg-buyers-guide'
  $body = @{
    routePrefix = $route
    destination = '/blog/the-strategic-buyers-guide-to-ukg'
    redirectStyle = 301
    isOnlyAfterNotFound = $false
    isMatchFullUrl = $false
    isMatchQueryString = $false
    isPattern = $false
    isTrailingSlashOptional = $true
    isProtocolAgnostic = $true
  }
  $existing = @($Redirects | Where-Object { $_.routePrefix -eq $route }) | Select-Object -First 1
  if ($existing) { return Invoke-HubSpotJson -Method Patch -Uri "$ApiRoot/cms/url-redirects/2026-03/$($existing.id)" -Headers $Headers -Body $body }
  Invoke-HubSpotJson -Method Post -Uri "$ApiRoot/cms/url-redirects/2026-03" -Headers $Headers -Body $body
}

function Get-IndexNowKey {
  $bytes = [Text.Encoding]::UTF8.GetBytes('www.alignhcm.com|site-health-watchdog|indexnow|2026')
  $hash = ([BitConverter]::ToString(([Security.Cryptography.SHA256]::Create()).ComputeHash($bytes))).Replace('-', '').ToLowerInvariant()
  $hash.Substring(0, 32)
}

function Upload-PublicTextFile {
  param([string]$Token, [string]$Name, [string]$Content, [string]$FolderPath)
  Add-Type -AssemblyName System.Net.Http
  $client = [Net.Http.HttpClient]::new()
  $multipart = [Net.Http.MultipartFormDataContent]::new()
  try {
    $client.DefaultRequestHeaders.Authorization = [Net.Http.Headers.AuthenticationHeaderValue]::new('Bearer', $Token)
    $fileContent = [Net.Http.ByteArrayContent]::new([Text.UTF8Encoding]::new($false).GetBytes($Content))
    $fileContent.Headers.ContentType = [Net.Http.Headers.MediaTypeHeaderValue]::new('text/plain')
    $multipart.Add($fileContent, 'file', $Name)
    $multipart.Add([Net.Http.StringContent]::new($FolderPath), 'folderPath')
    $multipart.Add([Net.Http.StringContent]::new('{"access":"PUBLIC_INDEXABLE","duplicateValidationScope":"EXACT_FOLDER","duplicateValidationStrategy":"RETURN_EXISTING"}'), 'options')
    $response = $client.PostAsync("$ApiRoot/files/v3/files", $multipart).GetAwaiter().GetResult()
    $payload = $response.Content.ReadAsStringAsync().GetAwaiter().GetResult()
    if (!$response.IsSuccessStatusCode) { throw "HubSpot IndexNow key upload failed with HTTP $([int]$response.StatusCode): $payload" }
    $payload | ConvertFrom-Json
  } finally {
    $multipart.Dispose()
    $client.Dispose()
  }
}

function Publish-IndexNow {
  param([string]$Token, [hashtable]$Headers)
  $key = Get-IndexNowKey
  $folder = '/alignhcm/indexnow'
  $fileName = "$key.txt"
  $filePath = "$folder/$fileName"
  $search = Invoke-HubSpotJson -Method Get -Uri "$ApiRoot/files/v3/files/search?path=$([Uri]::EscapeDataString($filePath))&limit=100" -Headers $Headers
  $file = @($search.results | Where-Object { $_.path -eq "$folder/$fileName" }) | Select-Object -First 1
  if (!$file) { $file = Upload-PublicTextFile -Token $Token -Name $fileName -Content $key -FolderPath $folder }
  $backingFileLocation = "https://www.alignhcm.com/hubfs/alignhcm/indexnow/$fileName"
  $keyRoute = "/$fileName"
  $redirects = Get-AllRedirects -Headers $Headers
  $keyRedirect = @($redirects | Where-Object { $_.routePrefix -eq $keyRoute }) | Select-Object -First 1
  $redirectBody = @{
    routePrefix = $keyRoute; destination = $backingFileLocation; redirectStyle = 301; isOnlyAfterNotFound = $true
    isMatchFullUrl = $false; isMatchQueryString = $false; isPattern = $false; isTrailingSlashOptional = $true; isProtocolAgnostic = $true
  }
  if ($keyRedirect) {
    $keyRedirect = Invoke-HubSpotJson -Method Patch -Uri "$ApiRoot/cms/url-redirects/2026-03/$($keyRedirect.id)" -Headers $Headers -Body $redirectBody
  } else {
    $keyRedirect = Invoke-HubSpotJson -Method Post -Uri "$ApiRoot/cms/url-redirects/2026-03" -Headers $Headers -Body $redirectBody
  }
  $keyLocation = "https://www.alignhcm.com/$fileName"
  $verified = $false
  for ($attempt = 1; $attempt -le 5; $attempt++) {
    try {
      $keyResponse = Invoke-WebRequest -Uri $keyLocation -UseBasicParsing
      if ([int]$keyResponse.StatusCode -eq 200 -and $keyResponse.Content.Trim() -eq $key) { $verified = $true; break }
    } catch { }
    Start-Sleep -Seconds 2
  }
  if (!$verified) { throw "IndexNow key did not verify at $keyLocation" }
  [xml]$sitemap = (Invoke-WebRequest -Uri 'https://www.alignhcm.com/sitemap.xml' -UseBasicParsing).Content
  $urls = @($sitemap.SelectNodes("//*[local-name()='url']/*[local-name()='loc']") | ForEach-Object { $_.InnerText.Trim() } | Where-Object { $_ -and $_ -notmatch '/blog/ukg-buyers-guide/?$' } | Select-Object -Unique)
  $canonicalUkg = 'https://www.alignhcm.com/blog/the-strategic-buyers-guide-to-ukg'
  if ($canonicalUkg -notin $urls) { $urls += $canonicalUkg }
  $body = @{ host = 'www.alignhcm.com'; key = $key; keyLocation = $keyLocation; urlList = $urls } | ConvertTo-Json -Depth 5 -Compress
  Add-Type -AssemblyName System.Net.Http
  $client = [Net.Http.HttpClient]::new()
  try {
    $content = [Net.Http.StringContent]::new($body, [Text.Encoding]::UTF8, 'application/json')
    $response = $client.PostAsync('https://api.indexnow.org/indexnow', $content).GetAwaiter().GetResult()
    $payload = $response.Content.ReadAsStringAsync().GetAwaiter().GetResult()
    if ([int]$response.StatusCode -notin @(200, 202)) { throw "IndexNow submission failed with HTTP $([int]$response.StatusCode): $payload" }
    [pscustomobject]@{ keyLocation = $keyLocation; backingFileLocation = $backingFileLocation; urlCount = $urls.Count; status = [int]$response.StatusCode; fileId = $file.id; redirectId = $keyRedirect.id }
  } finally { $client.Dispose() }
}

if (!(Test-Path -LiteralPath $CmsRoot)) { throw "CMS source folder not found: $CmsRoot" }

$token = Get-AlignHubSpotToken
try {
  $headers = @{ Authorization = "Bearer $token" }
  $identity = Invoke-HubSpotJson -Method Get -Uri "$ApiRoot/integrations/v1/me" -Headers $headers
  if ([string]$identity.portalId -ne $ExpectedPortalId) { throw "HubSpot portal mismatch. Expected $ExpectedPortalId, got $($identity.portalId)." }
  $forms = Get-AllForms -Headers $headers
  $redirects = Get-AllRedirects -Headers $headers

  if (!$Apply) {
    [pscustomobject]@{
      mode = 'dry-run'
      portalId = $ExpectedPortalId
      propertiesPlanned = $AttributionProperties.Count
      formsPlanned = $CoreFormIds.Count + 1
      sourceFilesPlanned = $CmsPaths.Count
      blogH1RepairsPlanned = $H1RepairPostIds.Count
      ukgRedirectPlanned = $true
      indexNowPlanned = !$SkipIndexNow
    } | ConvertTo-Json -Depth 5
    return
  }

  $serviceBefore = Backup-LiveState -Headers $headers -Forms $forms -Redirects $redirects
  $propertyResult = Ensure-AttributionProperties -Headers $headers
  $serviceOptionAdded = Ensure-ServiceInterestOption -Headers $headers -ServiceProperty $serviceBefore
  $serviceCurrent = Invoke-HubSpotJson -Method Get -Uri "$ApiRoot/crm/v3/properties/contacts/service_interest" -Headers $headers

  $contactForm = @($forms | Where-Object { $_.id -eq '99353f9f-a047-4b21-b0ca-ee452f8cf6f6' }) | Select-Object -First 1
  $footerCta = @($forms | Where-Object { $_.id -eq 'e733d928-0f1d-4b41-853b-df1e0096f330' }) | Select-Object -First 1
  if (!$contactForm -or !$footerCta) { throw 'Required Contact or Footer CTA form was not found.' }
  $guideForm = @($forms | Where-Object { $_.name -eq 'Align Buyer Guide Download' }) | Select-Object -First 1
  if (!$guideForm) { $guideForm = New-GuideForm -Headers $headers -ContactForm $contactForm -ConsentTemplate $footerCta.legalConsentOptions }

  $forms = Get-AllForms -Headers $headers
  $formIdsToPatch = @($CoreFormIds) + @([string]$guideForm.id)
  $patchedForms = @()
  foreach ($formId in $formIdsToPatch) {
    $form = @($forms | Where-Object { $_.id -eq $formId }) | Select-Object -First 1
    if (!$form) { $form = Get-HubSpotJsonOrNull -Uri "$ApiRoot/marketing/v3/forms/$formId" -Headers $headers }
    if (!$form) { throw "Required form not found: $formId" }
    $updated = Add-AttributionFieldsToForm -Headers $headers -Form $form -ServiceProperty $serviceCurrent
    $patchedForms += [pscustomobject]@{ id = $updated.id; name = $updated.name; fieldCount = @($updated.fieldGroups.fields).Count }
  }

  $sourceContents = [ordered]@{}
  foreach ($cmsPath in $CmsPaths) {
    $localPath = Join-Path $CmsRoot ($cmsPath.Replace('/', '\'))
    if (!(Test-Path -LiteralPath $localPath)) { throw "Missing local CMS source file: $localPath" }
    $content = Get-Content -Raw -LiteralPath $localPath -Encoding UTF8
    if ($cmsPath -eq 'Align HCM/js/align-attribution.js') { $content = $content.Replace('__ALIGN_GUIDE_FORM_ID__', [string]$guideForm.id) }
    $sourceContents[$cmsPath] = $content
  }
  $validations = @()
  $dependencyPaths = @('Align HCM/js/align-attribution.js', 'Align HCM/css/align-attribution.css')
  $basePath = 'Align HCM/templates/layouts/base.html'
  foreach ($entry in $sourceContents.GetEnumerator() | Where-Object { $_.Key -ne $basePath }) {
    $validations += Send-SourceContent -Token $token -Environment published -Action validate -Method POST -CmsPath $entry.Key -Content $entry.Value
  }
  $publishedSources = @()
  foreach ($entry in $sourceContents.GetEnumerator() | Where-Object { $_.Key -in $dependencyPaths }) {
    Send-SourceContent -Token $token -Environment draft -Action content -Method PUT -CmsPath $entry.Key -Content $entry.Value | Out-Null
    $publishedSources += Send-SourceContent -Token $token -Environment published -Action content -Method PUT -CmsPath $entry.Key -Content $entry.Value
  }
  $validations += Send-SourceContent -Token $token -Environment published -Action validate -Method POST -CmsPath $basePath -Content $sourceContents[$basePath]
  foreach ($entry in $sourceContents.GetEnumerator() | Where-Object { $_.Key -notin $dependencyPaths }) {
    Send-SourceContent -Token $token -Environment draft -Action content -Method PUT -CmsPath $entry.Key -Content $entry.Value | Out-Null
    $publishedSources += Send-SourceContent -Token $token -Environment published -Action content -Method PUT -CmsPath $entry.Key -Content $entry.Value
  }

  $blogRepairs = Repair-BlogH1s -Headers $headers
  $redirect = Ensure-UkgRedirect -Headers $headers -Redirects $redirects
  $indexNow = if ($SkipIndexNow) { $null } else { Publish-IndexNow -Token $token -Headers $headers }

  [pscustomobject]@{
    mode = 'applied'
    portalId = $ExpectedPortalId
    backupRoot = $BackupRoot
    propertiesCreated = @($propertyResult.created).Count
    propertiesExisting = @($propertyResult.existing).Count
    serviceInterestOptionAdded = $serviceOptionAdded
    guideFormId = [string]$guideForm.id
    patchedForms = $patchedForms
    sourceValidations = $validations
    publishedSources = $publishedSources
    blogRepairs = $blogRepairs
    redirect = [pscustomobject]@{ id = $redirect.id; routePrefix = $redirect.routePrefix; destination = $redirect.destination; redirectStyle = $redirect.redirectStyle; overridesLivePage = !$redirect.isOnlyAfterNotFound }
    indexNow = $indexNow
  } | ConvertTo-Json -Depth 12
} finally {
  $headers = $null
  $token = $null
}
