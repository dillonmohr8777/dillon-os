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
| `POST` | `/v1/webhooks/appstore` | — | App Store Server Notifications V2 receiver |
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

- Verify App Store notification JWS signatures (see `src/entitlements.ts`).
- Persist entitlements + users in a real database (currently in-memory).
- Rate-limit `/v1/agents/:id/messages` per user.

`appAccountToken` is already wired end to end: `/v1/auth/apple` returns a
deterministic per-user UUID, the app attaches it to purchases, and the
webhook keys entitlements on it.
