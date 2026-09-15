$ErrorActionPreference = 'Continue'
Set-Location 'C:\Users\dillo\repos\dillon-os'
$prompt = 'C:\Users\dillo\repos\dillon-os\System\machine-context\CODEX-LUNA-LOOP-02-PROMPT.md'
$log = 'C:\Users\dillo\repos\dillon-os\System\machine-context\CODEX-LUNA-LOOP-02-RUN.log'
$promptText = Get-Content -Raw $prompt
Write-Output ("LAUNCH " + (Get-Date -Format 'yyyy-MM-dd HH:mm:ss') + " model=gpt-5.6-luna fallback=gpt-5.5 NEVER astra") | Tee-Object -FilePath $log
Write-Output ("PROMPT_BYTES " + (Get-Item $prompt).Length) | Tee-Object -FilePath $log -Append
# Primary: Luna
$args = @(
  'exec',
  '-m', 'gpt-5.6-luna',
  '-C', 'C:\Users\dillo\repos\dillon-os',
  '--dangerously-bypass-approvals-and-sandbox',
  '-s', 'danger-full-access',
  $promptText
)
try {
  & codex @args 2>&1 | Tee-Object -FilePath $log -Append
  $code = $LASTEXITCODE
} catch {
  $code = 1
  $_ | Tee-Object -FilePath $log -Append
}
if ($code -ne 0) {
  "FALLBACK_TO_GPT55 exit=$code $(Get-Date -Format 'HH:mm:ss')" | Tee-Object -FilePath $log -Append
  $args55 = @(
    'exec',
    '-m', 'gpt-5.5',
    '-C', 'C:\Users\dillo\repos\dillon-os',
    '--dangerously-bypass-approvals-and-sandbox',
    '-s', 'danger-full-access',
    $promptText
  )
  & codex @args55 2>&1 | Tee-Object -FilePath $log -Append
}
"DONE $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') exit=$LASTEXITCODE" | Tee-Object -FilePath $log -Append
