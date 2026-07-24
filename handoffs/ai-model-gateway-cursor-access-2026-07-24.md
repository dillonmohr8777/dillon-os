---
tags: [handoff, ai-gateway, cursor-codex]
created: 2026-07-24
mode: read-only review (no credential rotation, no spend, no merge, no protection weaken)
shared_surface: PR #205 + `_os/ai-model-gateway`
---

# Cursor access review — AI Model Gateway

## Confirmed: Cursor can inspect and work on the gateway code

- Checked out `agent/vercel-ai-gateway-model-access` (PR [#205](https://github.com/dillonmohr8777/dillon-os/pull/205)).
- Read `_os/ai-model-gateway/README.md` and implementation.
- Local validation on this host:
  - `npm test` — **25/25 passed**
  - `npm run typecheck` — **ok**
  - `npm run build` — **ok** (routes: `/api/health`, `/api/catalog`, `/api/gateway/[...path]`)

## Architecture (as implemented)

```text
Client (Bearer MODEL_GATEWAY_ACCESS_TOKEN)
  → Next.js façade `_os/ai-model-gateway`
      /api/health   (config probe; no client token required)
      /api/catalog  (requires client token; live fetch of Vercel models)
      /api/gateway/* (requires client token; path allowlist + GPT-5.6 policy)
  → replaces Authorization with VERCEL_OIDC_TOKEN or AI_GATEWAY_API_KEY
  → https://ai-gateway.vercel.sh/{v1|v4}/...
```

Key files:
- `_os/ai-model-gateway/lib/auth.ts` — fail-closed client bearer + upstream credential selection
- `_os/ai-model-gateway/lib/request-policy.ts` — path allowlist + GPT-5.6 Sol/Terra/Luna reasoning/pro validation
- `_os/ai-model-gateway/app/api/gateway/[...path]/route.ts` — proxy (maxDuration 300s)
- `_os/ai-model-gateway/.env.example` — documents env vars only (no secrets)

## Deployment state (observed)

| Item | State |
|---|---|
| PR #205 | Open draft, mergeable; Vercel status **SUCCESS** |
| Preview URL | `https://dillon-8qzqeeqq9-dillonmohr-2940s-projects.vercel.app` |
| Preview protection | **Vercel SSO** — unauthenticated `GET /api/health` returns **302** to `vercel.com/sso-api` |
| Vercel AI Gateway dashboard | https://vercel.com/dillonmohr-2940s-projects/dillon-os/ai-gateway |
| Project root dir (per README) | `_os/ai-model-gateway` |

Did **not** call any paid inference endpoints. Did **not** attempt to bypass SSO or read tokens.

## Access / configuration gaps for this Cursor cloud agent

1. **No cloud Environment attached** — `cursor-cloud/environment-info` returned `"environment": null`. No bundled secrets store for this run.
2. **No gateway secrets in process env** — `MODEL_GATEWAY_ACCESS_TOKEN`, `AI_GATEWAY_API_KEY`, and `VERCEL_OIDC_TOKEN` are **absent** here (checked name presence only; no values printed).
3. **No Vercel CLI / authorized Vercel integration** in this pod (`vercel: command not found`).
4. **SSO blocks even health/catalog probes** from this agent without a browser login or a non-SSO bypass Dillon has not authorized.
5. Therefore Cursor currently has **full code access** but **not live API/dashboard access**.

## Secure secret attachment steps (do NOT paste tokens into Slack)

Dillon (or Codex with dashboard access) should attach secrets via Cursor Cloud Environment UI — never chat:

1. Open Cursor Cloud Environments for this repo: typically **Cursor → Cloud Agents → Environments** (or the Environment dashboard URL from a prior cloud run), for repo `dillonmohr8777/dillon-os`.
2. Create or edit an Environment used by Slack/cloud agents.
3. Add **Secret** env vars (sensitive):
   - `MODEL_GATEWAY_ACCESS_TOKEN` = same value already set in Vercel for Preview/Production (do not invent a second token unless rotating with an explicit instruction).
   - Optional local-only fallback: `AI_GATEWAY_API_KEY` only if OIDC is unavailable off-Vercel; prefer not duplicating if SSO+OIDC path is enough.
4. Save the Environment and **re-launch / attach this agent run to that Environment** so `environment-info` is non-null.
5. Separately, for live preview calls from agents: either
   - keep SSO and have a human-authenticated path, **or**
   - add a documented machine-auth path (still requiring `MODEL_GATEWAY_ACCESS_TOKEN`) without weakening protection unless Dillon explicitly approves.

Until step 4 is done, Cursor can keep reviewing/editing gateway code and coordinating via this handoff + PR #205, but cannot prove live catalog/inference.

## Collaboration contract with Codex

| Surface | Owner now |
|---|---|
| PR #205 / branch `agent/vercel-ai-gateway-model-access` | Codex (canonical implementation) |
| This handoff | Cursor |
| Secret placement in Vercel + Cursor Environment | Dillon (or Codex UI with approval) |
| Live inference tests | Blocked for Cursor until Environment secrets + SSO strategy |

**Codex — please do not duplicate:** do not re-scaffold `_os/ai-model-gateway`. Safe complementary work:
- Confirm Vercel project env has `MODEL_GATEWAY_ACCESS_TOKEN` on Preview+Production (presence only).
- Confirm AI Gateway enabled so `VERCEL_OIDC_TOKEN` is injected.
- After Dillon attaches Cursor Environment secrets, ping this thread so Cursor can run a **non-spend** health/catalog check only.

## Boundaries honored

- No credential rotation
- No credit spend / model calls
- No PR merge
- No weakening of Vercel SSO / deployment protection
- No token printed or requested in Slack
