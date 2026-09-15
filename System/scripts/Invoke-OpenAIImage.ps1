param(
    [ValidateSet('flare','sunburst')][string]$Model = 'flare',
    [Parameter(Mandatory)][string]$PromptFile,
    [Parameter(Mandatory)][string]$Out,
    [string[]]$Image = @(),
    [ValidateSet('low','medium','high')][string]$Quality = 'medium',
    [ValidateSet('1024x1024','1536x1024','1024x1536')][string]$Size = '1024x1024',
    [switch]$DryRun
)
$ErrorActionPreference = 'Stop'
$python = Join-Path $env:USERPROFILE '.codex/tools/image-api-venv/Scripts/python.exe'
$cli = Join-Path $env:USERPROFILE '.codex/skills/.system/imagegen/scripts/image_gen.py'
foreach ($required in @($python, $cli, $PromptFile) + $Image) {
    if (-not (Test-Path -LiteralPath $required -PathType Leaf)) { throw "Missing input/runtime: $required" }
}
if (Test-Path -LiteralPath $Out) { throw 'Output already exists. Choose a versioned filename.' }
if (Test-Path -LiteralPath ($Out + '.receipt.json')) { throw 'Receipt already exists. Choose a versioned filename.' }
if (-not $DryRun -and -not $env:OPENAI_API_KEY) { throw 'OPENAI_API_KEY is not available in this process.' }
$mode = if ($Image.Count) { 'edit' } else { 'generate' }
$params = @($cli, $mode, '--model', "gpt-image-2.5-$Model", '--prompt-file', $PromptFile,
    '--out', $Out, '--quality', $Quality, '--size', $Size, '--output-format', 'png', '--n', '1', '--no-augment')
foreach ($inputImage in $Image) { $params += @('--image', $inputImage) }
if ($DryRun) { $params += '--dry-run' }
# ponytail: reuse bundled CLI; quality above high and custom sizes await its upstream support.
$priorBase = $env:OPENAI_BASE_URL
try {
    $env:OPENAI_BASE_URL = 'https://api.openai.com/v1'
    & $python @params
    if ($LASTEXITCODE -ne 0) { throw "Image command failed (exit $LASTEXITCODE)." }
} finally { $env:OPENAI_BASE_URL = $priorBase }
if (-not $DryRun) {
    if (-not (Test-Path -LiteralPath $Out -PathType Leaf)) { throw 'API command returned without an output file.' }
    [ordered]@{ generated_at = (Get-Date).ToUniversalTime().ToString('o'); model_requested = "gpt-image-2.5-$Model";
        endpoint = "images/$mode"; quality = $Quality; size = $Size; output = [IO.Path]::GetFullPath($Out);
        sha256 = (Get-FileHash -LiteralPath $Out -Algorithm SHA256).Hash;
        reference_count = $Image.Count; status = 'generated_pending_visual_review' } |
        ConvertTo-Json | Set-Content -LiteralPath ($Out + '.receipt.json') -Encoding utf8
}
