$ErrorActionPreference = 'Continue'
Set-Location 'C:\Users\dillo\repos\dillon-os'
$prompt = 'C:\Users\dillo\repos\dillon-os\System\machine-context\CODEX-LUNA-LOOP-03-PROMPT.md'
$log = 'C:\Users\dillo\repos\dillon-os\System\machine-context\CODEX-LUNA-LOOP-03-RUN.log'
$promptText = Get-Content -Raw $prompt
"LAUNCH $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') model=gpt-5.6-luna fallback=gpt-5.5 NEVER astra" | Tee-Object -FilePath $log
"PROMPT_BYTES $((Get-Item $prompt).Length)" | Tee-Object -FilePath $log -Append
& codex exec -m gpt-5.6-luna -C 'C:\Users\dillo\repos\dillon-os' --dangerously-bypass-approvals-and-sandbox -s danger-full-access $promptText 2>&1 | Tee-Object -FilePath $log -Append
$code = $LASTEXITCODE
if ($code -ne 0) {
  "FALLBACK_TO_GPT55 exit=$code $(Get-Date -Format 'HH:mm:ss')" | Tee-Object -FilePath $log -Append
  $raw = Get-Content $log -Raw -ErrorAction SilentlyContinue
  if ($raw -match '5h|rate.?limit|limit_reached|usage.?limit') {
    "WAIT_NOTE 5h/limit hit - stop new Codex launches until reset. Do NOT use astra." | Tee-Object -FilePath $log -Append
    exit 2
  }
  & codex exec -m gpt-5.5 -C 'C:\Users\dillo\repos\dillon-os' --dangerously-bypass-approvals-and-sandbox -s danger-full-access $promptText 2>&1 | Tee-Object -FilePath $log -Append
}
"DONE $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') exit=$LASTEXITCODE" | Tee-Object -FilePath $log -Append
