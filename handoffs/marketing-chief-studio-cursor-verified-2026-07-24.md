---
tags: [handoff, marketing-chief, verification]
created: 2026-07-24
updated: 2026-07-24
mode: verify-only — no deploy, merge, publish, send, spend, or canonical queue writes
source_pr: https://github.com/dillonmohr8777/dillon-os/pull/208
---

# Marketing Chief Operator Studio — Cursor verification (complete)

## Checkout

| Item | Result |
|---|---|
| PR | [#208](https://github.com/dillonmohr8777/dillon-os/pull/208) |
| Branch | `codex/marketing-chief-dashboard-access-2026-07-24` @ `bffbcb9` |
| Path | `_os/marketing-chief-operator-studio` |
| Contracts | `CURSOR_ACCESS.md` + `handoffs/marketing-chief-dashboard-cursor-access-2026-07-24.md` |
| Checkout | **Success** |

## Install / lint / test / build

Host: Node **v22.14.0** (engines require ≥22.13.0)

| Command | Result |
|---|---|
| `npm ci` | **Success** |
| `npm run lint` | **Success** |
| `npm test` (includes `vinext build` + rendered HTML tests) | **Success — 4/4 pass** |
| `npm audit` | **0 vulnerabilities** |

Routes built: `/`, `/api/machine`, `/api/studio`.

Not run (out of contract / would need live or local secrets): `npm run test:dillon`, `npm run test:readonly`. Those optionally read `OAI_SITES_BYPASS_TOKEN` / machine token from env — **not present, not requested**.

## Redacted snapshot inspectability — **YES**

Cursor can fully read the included redacted collaboration snapshot:

| Surface | Inspectable | Notes |
|---|---|---|
| Clients | **Yes — 21/21** | IDs present; fields include status, routing, evidence confidence, nextAction, portfolio rank; **0 email-like strings**; no NA phone numbers (date/id false positives only) |
| Work items | **Yes — 36** | Linked by `clientId`; statuses: done 29, deferred 3, needs_approval 3, blocked 1 |
| Queue | **Yes** | `revision` **157**, mode `manual-pilot`, WIP limits, statusCounts |
| Recommendations | **Yes** | ranked 4; `nextDecision`/`nextUnblock` true; `nextAutomatic` false |
| Portfolio / health / training / learning / aiStack / graphs | **Yes** | health `healthy-with-human-gates`; permissions `writeEnabled: false`, `queueMutation: canonical-windows-only`; source `private-hosted-mirror` + `redaction: allowlist` |
| Schema + migrations | **Yes** | `db/schema.ts` (studio_snapshots, hosted_choices, operator_requests, owner_intents, calibrations, evaluations, …); **6** drizzle SQL migrations |
| App logic / PRODUCT / DESIGN | **Yes** | Present and readable |

Secret scan on `data/seed-snapshot.json`: **0** secret-shaped hits (`sk-`, JWT-like, bypass tokens, etc.).

Provenance in contract: Sites v14, canonical commit `72df5db1fc71398bcfb983586564bbd856079371`.

## Blockers

1. **Live ChatGPT Site remains private** — Cursor still gets **401 Sign in required** on the deployed URL. **Not a snapshot blocker**; collaboration is via this repo path as designed.
2. **No Cursor Environment secrets** for optional live/local private-flow tests (`OAI_SITES_BYPASS_TOKEN`, production machine token). **Not required** for PR #208’s `npm ci` / lint / test contract; do not paste into Slack/repo.
3. **Canonical queue writes / deploy / merge / publish** — intentionally blocked by policy (`permissions.writeEnabled: false` in seed + `CURSOR_ACCESS.md`). Not a verification failure.

## Boundaries honored

No deploy, merge, publish, send, spend, credential rotation, or canonical queue writes. Live site left private.
---
