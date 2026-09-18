# Dillon OS AI Model Gateway

A private, OpenAI-compatible façade for Vercel AI Gateway. It discovers the
live Vercel model catalog instead of committing a stale allowlist, uses Vercel
OIDC for upstream authentication, and requires a separate bearer token from
every client.

## What this provides

- Live access to the Vercel AI Gateway model catalog.
- OpenAI-compatible Responses, Chat Completions, embeddings, image generation,
  moderation, model, and response-state endpoints.
- Vercel v4 speech and transcription endpoints.
- GPT-5.6 Sol, Terra, and Luna with the supported standard reasoning efforts:
  `none`, `low`, `medium`, `high`, `xhigh`, and `max`.
- GPT-5.6 Pro mode through `reasoning.mode: "pro"` on the Responses API.
- A fail-closed client bearer token so a deployment cannot become an anonymous
  paid inference proxy.

Catalog presence means Vercel supports a model. A successful generation still
depends on the Vercel project having credits and any provider-specific
eligibility.

## Vercel project

Import `dillonmohr8777/dillon-os` and set the project Root Directory to:

```text
_os/ai-model-gateway
```

Set `MODEL_GATEWAY_ACCESS_TOKEN` as a sensitive environment variable in
Production, Preview, and Development. Do not commit its value.

Vercel deployments receive `VERCEL_OIDC_TOKEN` automatically after AI Gateway
is enabled. `AI_GATEWAY_API_KEY` is an optional local-development fallback and
must also remain outside Git.

## Client base URLs

Use these deployment-relative paths:

```text
OpenAI-compatible base: https://<deployment>/api/gateway/v1
Vercel v4 base:         https://<deployment>/api/gateway/v4
Catalog summary:        https://<deployment>/api/catalog
Health check:           https://<deployment>/api/health
```

Clients authenticate to this service with:

```http
Authorization: Bearer <MODEL_GATEWAY_ACCESS_TOKEN>
```

The service replaces that header with the private Vercel OIDC or AI Gateway
credential before forwarding upstream.

## GPT-5.6 Sol examples

Responses API with maximum standard reasoning:

```bash
curl https://<deployment>/api/gateway/v1/responses \
  -H "Authorization: Bearer $MODEL_GATEWAY_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openai/gpt-5.6-sol",
    "reasoning": { "effort": "max" },
    "input": "Solve this carefully."
  }'
```

Pro mode is a mode on Sol, not a separate model slug:

```json
{
  "model": "openai/gpt-5.6-sol",
  "reasoning": {
    "mode": "pro",
    "effort": "medium"
  },
  "input": "Analyze the tradeoffs."
}
```

For GPT-5.6 Chat Completions with function tools, this gateway requires
`reasoning_effort: "none"`. Use the Responses endpoint when tools and reasoning
are both required.

## Local validation

```bash
npm install
npm test
npm run typecheck
npm run build
```

No live model call is made by the test suite.
