---
status: installed
created: 2026-09-12
source_refs:
  - https://developers.openai.com/api/docs/guides/image-generation
  - System/scripts/Invoke-OpenAIImage.ps1
---
# GPT Image 2.5 integration

Explicit direct OpenAI API route, reusing the bundled imagegen CLI unchanged. No GrokBot or Higgsfield intermediary. This does not select or certify the backend of Codex's built-in image tool.

Use Flare for routine artwork and iteration; choose Sunburst for precision edits and premium client artwork. Astra directs creative work and handles video composition separately. Keep authentic logos and final typography as compositing layers. Normal built-in generation remains available without an API key.

## Run

From PowerShell with the existing OPENAI_API_KEY in the process:

```powershell
& C:/Users/dillo/repos/dillon-os/System/scripts/Invoke-OpenAIImage.ps1 -Model flare -PromptFile brief.txt -Out artwork-v1.png
& C:/Users/dillo/repos/dillon-os/System/scripts/Invoke-OpenAIImage.ps1 -Model sunburst -PromptFile edit-brief.txt -Image artwork-v1.png -Out artwork-v2.png -Quality high
```

Use absolute paths from other workspaces. Add `-DryRun` for request inspection without generation. One image per invocation. PNG outputs receive a model-request/quality/hash receipt. Existing outputs are never overwritten. Secrets are neither printed nor written. Endpoint pinned to api.openai.com; previous process endpoint restored afterward.

Runtime: C:/Users/dillo/.codex/tools/image-api-venv/Scripts/python.exe with openai SDK. Shared executor: C:/Users/dillo/.codex/skills/.system/imagegen/scripts/image_gen.py. No bundled skill code was modified.

## Verified scope and limits

Account model discovery returned both exact model IDs. Live Flare generation and Sunburst edit evidence is under C:/Users/dillo/Documents/Codex/2026-09-12/create-an-image-of-2/outputs/image-api-*. Tests use 1024 square, low quality to conserve API cost. Final visual review recorded in session handoff.

Run `System/scripts/Test-OpenAIImage.ps1` for non-billing route and output-safety checks. API generation is separately billed from Codex subscription usage. No subscription purchase, automatic job, or recurring spending was configured. Exact billing cost is not exposed by the reused CLI; do not invent a per-image receipt total.

Deliberate current ceiling: low/medium/high quality and three standard sizes. Official 2.5 supports additional quality/size choices, but the bundled CLI validator does not. Do not pretend xhigh/max or custom 4K are wired. Upgrade the supported executor when those are actually required. Transparent-alpha quality has not been tested here.
