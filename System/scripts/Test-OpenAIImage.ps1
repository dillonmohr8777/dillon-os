$ErrorActionPreference = 'Stop'
$route = Join-Path $PSScriptRoot 'Invoke-OpenAIImage.ps1'
$prompt = [IO.Path]::GetTempFileName()
$output = $prompt + '.png'
try {
    'A paper dove' | Set-Content -LiteralPath $prompt
    foreach ($model in 'flare','sunburst') {
        $request = (& $route -PromptFile $prompt -Out $output -Model $model -DryRun) -join "`n"
        if ($request -notmatch "gpt-image-2.5-$model") { throw 'Wrong model routing' }
        if (Test-Path -LiteralPath $output) { throw 'Dry run generated a file' }
    }
    $denied = $false
    try { & $route -PromptFile $prompt -Out $prompt -DryRun } catch { $denied = $true }
    if (-not $denied) { throw 'Overwrite protection failed' }
    'PASS: both model routes, dry-run isolation, overwrite protection'
} finally { Remove-Item -LiteralPath $prompt }
