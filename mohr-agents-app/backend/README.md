# Mohr Agents — Backend

Small Express + TypeScript API that fronts the Anthropic API for the iOS app.
Prompts and the Anthropic key live here — never on the device.

## Endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `POST` | `/v1/auth/apple` | — | Exchange a Sign in with Apple identity token for a session token |
| `GET` | `/v1/agents` | — | Public agent catalog (id, name, tag, group) |
| `POST` | `/v1/agents/:id/messages` | Bearer + active subscription | Run one agent turn; returns `{ reply }` |
| `POST` | `/v1/agents/:id/messages/stream` | Bearer + active subscription | Same turn as SSE: `data: {"delta"}` chunks, then `{"done"}` |
| `POST` | `/v1/subscriptions/verify` | Bearer | Grant entitlement now from the app's signed StoreKit transaction (beats the webhook lag) |
| `POST` | `/v1/webhooks/appstore` | JWS-signed | App Store Server Notifications V2 receiver (signature-verified) |
| `GET` | `/healthz` | — | Liveness |

## Agents

One JSON file per agent in `src/agents/` — `id`, `name`, `tag`, `group`,
`effort`, and the `system` prompt. Drop in a new file and restart to ship a
new agent. `GET /v1/agents` never exposes system prompts.

## Model

`claude-fable-5` with a server-side fallback to `claude-opus-4-8`
(beta `server-side-fallback-2026-06-01`) so safety-classifier declines are
transparently re-served. The shared system prompt is cached with
`cache_control: ephemeral`. Per-agent `effort` tunes latency/cost.

## Run locally

```sh
cp .env.example .env   # fill in ANTHROPIC_API_KEY + SESSION_SECRET
npm install
npm run dev            # http://localhost:8787
```

Set `ALLOW_UNSUBSCRIBED=true` locally to chat without a StoreKit purchase.

## Before production

- Set `APPLE_ROOT_CA_FINGERPRINT` (see `.env.example`) — the webhook and
  `/v1/subscriptions/verify` fail closed without it in production.
- Swap the JSON-file entitlement store for a real database if you outgrow
  a single instance.

Already wired: `appAccountToken` end to end (deterministic per-user UUID from
`/v1/auth/apple` → StoreKit purchase → webhook), **JWS signature verification**
of App Store notifications and transactions (x5c chain pinned to the Apple root
fingerprint), an immediate `/v1/subscriptions/verify` sync path so new
subscribers aren't gated while Apple's webhook lags, durable entitlement
storage (`ENTITLEMENTS_FILE`), and per-user rate limiting on the chat endpoints
(`RATE_WINDOW_MS` / `RATE_MAX_PER_WINDOW`, returns 429 + `Retry-After`).
