# API keys — one setup that works on every surface

Created 2026-09-05. Answers the recurring question: how do Gemini / Google AI
Studio (and other provider) keys get wired so an agent has them whether Dillon is
in a **local** session, a **remote/cloud** session, or a **general coding**
session (Cursor, "Claude Full Access").

## The rule

Keys are never pasted into chat, never written into a tracked file, and never
echoed back. This is the vault's existing rule, not a new one — see `CLAUDE.md`
lines 9–11: credentials live in `12_Brain/private/` (gitignored), and
`_os/test/public-safety.test.js` fails the build on any secret-shaped value.

Live reminder of why: a Tock credential sat exposed in plaintext email from
2026-08-31, and four sets of plaintext credentials were found sitting in Slack
channels, the oldest exposed 24 days.

## Why there is no single place

Each surface reads secrets from a different store. There is no one file that
covers all three, so set it once per surface. This is a five-minute job done
once, not an ongoing tax.

| Surface | Where the key goes | Reachable by |
|---|---|---|
| Local Claude Code / terminal | Windows user environment variable | anything running on this machine |
| Remote / cloud session | that environment's own secrets settings, in the app | cloud sessions only |
| Cursor / general coding | Cursor's own settings, or a gitignored `.env` in the repo | that editor |

## Local (Windows user environment variable)

Set once, persists across reboots and sessions. Run in PowerShell:

```powershell
[Environment]::SetEnvironmentVariable('GEMINI_API_KEY', '<paste-key-here>', 'User')
```

Then **restart the terminal or app** — processes only read env vars at start.

Verify without printing the value:

```powershell
if ($env:GEMINI_API_KEY) { "GEMINI_API_KEY is set ($($env:GEMINI_API_KEY.Length) chars)" } else { "not set" }
```

Google's SDKs also accept `GOOGLE_API_KEY`. Set whichever the library you are
using expects; setting both is harmless.

## Remote / cloud sessions

A cloud session cannot see this machine, so a local environment variable does
nothing for it. Add the key in that environment's secrets settings in the app —
the same place the environment's repo list is configured. Keys added there are
available to every session using that environment.

## Cursor / general coding

Either Cursor's own settings, or a `.env` at the repo root. If `.env`, confirm
it is gitignored **before** writing the key into it:

```powershell
Select-String -Path .gitignore -Pattern '^\.env$'
```

If that returns nothing, add `.env` to `.gitignore` first.

## For agents reading this file

Read keys from the environment. Never print one, never write one into a tracked
file, never include one in a commit, a log line, a report, or a message. If a key
is missing, say which variable is unset and stop — do not ask for it to be
pasted into the conversation.

## Model entitlement — verified 2026-09-07

Live-checked on Dillon's AI Studio key the day it was issued. The `/models` list
advertises more than the key can call; trust `generateContent`, not the list.

| Model | State |
|---|---|
| `gemini-2.5-flash`, `gemini-2.5-pro` | **404 "no longer available to new users."** Listed, not callable. |
| `gemini-3.5-flash` | Works. Video analysis confirmed on five files. |
| `gemini-2.5-flash-image` | Works. `generationConfig.imageConfig.aspectRatio` honoured. |
| `veo-3.1-lite/fast/generate-preview` | Reachable via `predictLongRunning`. Lite image-to-video confirmed. |

Key format: current AI Studio keys begin `AQ.` (53 chars), not `AIza`. Both are
real; do not treat the prefix as a validity test.

`~/.claude/skills/video-analyze/analyze.mjs` now defaults to `gemini-3.5-flash`
and prints the server's 404 body instead of a misleading "not available" line.

## Rotation

Rotate at Google AI Studio, then update each surface above. A key that has ever
been pasted into a chat, an email, or a Slack message is burned and should be
rotated rather than reused.

## OpenAI Agents API (added 2026-09-10)

Application API key for Agents API sessions. Grant scopes:

- `api.agents.read`
- `api.agents.write`
- `api.responses.write`

Set as Windows User environment variable (same pattern as Gemini):

```powershell
[Environment]::SetEnvironmentVariable('OPENAI_API_KEY', '<paste-key-here>', 'User')
```

Restart the terminal/app after setting. Verify without printing:

```powershell
if ($env:OPENAI_API_KEY) { "OPENAI_API_KEY is set ($($env:OPENAI_API_KEY.Length) chars)" } else { "not set" }
```

Dry-run wrapper (no spend):

```powershell
& .\System\scripts\Invoke-OpenAIAgentsSession.ps1 -DryRun
```

Live smoke requires an explicit CEO spend yes plus `-Live`. Keep the key outside any agent sandbox. Requests need header `OpenAI-Beta: agents=v1` (SDK adds it; cURL must include it).

## Vercel AI Gateway — TypeSafe AI Jev (added 2026-09-17)

Evaluation model `typesafe-ai/jev`. Not a chat model: it takes one shared state
plus typed questions and returns choices, scores and boolean probabilities. Used
here for claim verification — see `_os/automation/jev/`.

The Gateway needs **its own key**. A Vercel account token does not work, and
`VERCEL_OIDC_TOKEN` only exists on Vercel deployments, not on this machine.
Create the key at Vercel dashboard → AI Gateway → API Keys.

Set as Windows User environment variable (same pattern as Gemini and OpenAI):

```powershell
[Environment]::SetEnvironmentVariable('AI_GATEWAY_API_KEY', '<paste-key-here>', 'User')
```

Restart the terminal/app after setting. Verify without printing:

```powershell
if ($env:AI_GATEWAY_API_KEY) { "AI_GATEWAY_API_KEY is set ($($env:AI_GATEWAY_API_KEY.Length) chars)" } else { "not set" }
```

AI SDK 7 reads `AI_GATEWAY_API_KEY` automatically whenever a model is given as a
plain string. No provider import is needed for Gateway calls.

Dry-run (no spend, no key required):

```powershell
node _os\automation\jev\verify-claims.mjs --input <records.json>
```

Live run requires an explicit spend yes plus `--live`. With the key unset,
`--live` names the variable and exits 2 before any network call.

### Verified 2026-09-17

Read from the **unauthenticated** Gateway registry `GET
https://ai-gateway.vercel.sh/v1/models`, not from the marketing page:

| Field | Value |
|---|---|
| `id` | `typesafe-ai/jev` |
| `type` | `evaluation` |
| pricing input | `0.000000042`/token = **$0.042 per 1M** |
| pricing output | `0` — **output tokens are not billed** |
| `context_window` / `max_tokens` | `0` / `0` (not applicable to this modality) |
| `zdr` / `no_training` | `all` / `all` |
| `supported_specifications` | `v4` |

The "$0.04 per 1M" figure in circulation is the rounded input price. Output is
free, so total cost equals input tokens alone.

**Still experimental.** Exported as `experimental_evaluate`; the provider spec
comment reads "May change in patch releases." Requires AI SDK 7 or later
(verified against `ai@7.0.105`). Evaluation is **AI SDK only** — it is not
available through the OpenAI-, Anthropic- or Cohere-compatible endpoints.

The signature is a **single options object**, not positional:

```js
import { experimental_evaluate as evaluate } from 'ai';
const r = await evaluate({ model: 'typesafe-ai/jev', state, questions });
```

The AI SDK reference page renders a positional signature
`evaluate(model, state, questions, options?)`. That is wrong. The installed
typings at `node_modules/ai/dist/index.d.ts:7644` destructure one object, and
every runnable example on both vercel.com and ai-sdk.dev uses the object form.

Question types are `choice` (criteria = map of option name to description),
`score` (criteria = ordered array, at least two levels) and `boolean` (criteria
optional, `{true, false}`). Answers come back keyed by the original question
IDs; there is no partial success. Several questions run in parallel in one
request against the same state.

### Measured live, 2026-09-17

First live run. Smoke: 282 input / 21 output tokens, **$0.000012**, SMOKE PASS.
Full run, 9 claims x 6 questions = 54 questions in 9 requests: **13,194 input
tokens, 1,098 output, $0.000554, 2,168 ms wall** for all nine.

Two things worth carrying forward:

- The char/4 dry-run heuristic estimated 8,853 input tokens. Actual was 13,194,
  **49% higher**. Treat the dry-run figure as a floor, not a forecast. The
  structured question objects tokenize heavier than raw character count implies.
- `result.response.modelId` came back as `typesafe-ai/jev`, **not** the
  versioned `jev-1.13.0`. The Gateway does not pass TypeSafe's version through,
  so the version-pinning advice below cannot be satisfied via the Gateway route.
  If you need a pinned version, that is an argument for the direct
  `api.typesafe.ai` route with `TYPESAFE_API_KEY`.

**Rate limits, from TypeSafe's own model page:** Jev 1.13 is 250,000 tokens per
second and 1,200 requests per minute. Over either limit returns `429`. TypeSafe
warns these "are adjusting dynamically… can change without notice". The AI SDK
retries with backoff by default (`maxRetries`, default 2). Also cap the key at
Vercel → AI Gateway → Budgets.

**Naming.** TypeSafe's native API calls the boolean type `noul` and returns
`{type:"noul", noul:0.92}`. The AI SDK normalises this to `type:'boolean'` with
a `probability` field. Same thing; the raw wire format uses the other name.

**Confidence.** Choice and Score answers carry a calibrated `confidence` derived
from the probability distribution, surfaced at
`result.providerMetadata.typesafe.confidence`. Boolean/noul answers do not — the
probability *is* the answer, not a confidence in it.

**Pin the version if you tune thresholds.** `jev-latest` is an alias, today
resolving to `jev-1.13.0`. It moves on release and answers can shift with it.
`result.response.modelId` reports which version actually answered; log it.

**Design rule from TypeSafe's build guide:** ask many narrow atomic questions in
one request rather than one broad question, and compose the answers in code.
Questions run in parallel against the same state, so decomposition costs no
extra round trip. Route on confidence: escalate uncertain cases rather than
guessing.

Alternative direct-provider route, **not** used here: `@ai-sdk/typesafe-ai`
with `TYPESAFE_AI_API_KEY` and model id `jev-latest`. That bypasses the Gateway,
its budgets and its observability. Gateway route is the one wired.
