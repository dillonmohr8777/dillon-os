# Marketing Chief Operator Studio

Private, mobile-responsive operator console for Dillon's canonical Marketing Chief system.

The hosted app mirrors an allowlisted snapshot of the Windows source of truth, persists deliberate owner choices and operator requests in Cloudflare D1, and performs an idempotent daily calibration and evaluation on first owner access. It never stores raw Gmail or Slack content, secrets, direct contacts, or access locators. The Windows Marketing Chief remains the sole canonical queue writer.

The current private seed contains all 21 canonical client records, queue revision 153, 36 work items, GitHub/client-operations lineage, Gmail evidence coverage, Slack evidence coverage, health state, execution graphs, and training outcomes. New snapshots only replace D1 state when their canonical queue revision is newer.

## Operating boundary

- ChatGPT authentication and `MC_OWNER_EMAILS` enforce owner-only access on the page and every API mutation.
- `accept`, `modify`, `defer`, and `reject` choices are bound to the exact work-item version, recommendation lane, predicted action, and queue revision.
- Hosted operator requests are idempotent handoffs. Only reversible, non-external automatic actions qualify for local execution requests; approvals remain explicit.
- The Windows operator consumes those requests through canonical scripts. The hosted app cannot write the queue, send messages, publish, spend, or bypass a human gate.
- `/api/machine` is a separate bearer-authenticated handoff plane. It accepts only an allowlisted, redacted schema-v2 snapshot and exact operator resolutions; stale snapshots and secret-shaped payloads fail closed.
- The production machine and Sites-dispatch credentials are stored only in their respective hosted secret store and Windows Credential Manager. They are not stored in Git, browser storage, D1, the non-secret bridge config, or task arguments.

## Windows bridge

The canonical client-operations project owns the Windows side:

```powershell
.\scripts\Install-MarketingChiefSitesBridge.ps1
.\scripts\Sync-MarketingChiefSitesBridge.ps1 -EnableCanonicalWrites
```

The hidden `MarketingChief-SitesBridge` scheduled task runs every 15 minutes. It imports exact owner choices through `Record-MarketingDecision.ps1`, creates only version-bound reversible execution graphs, and routes approvals or deferrals through `Update-MarketingQueue.ps1`. Canonical mutations additionally require a clean relevant Git state and an exact fast-forward relationship with `origin/main`. If those invariants are not true, the request stays queued for a safe retry.

After each run, the bridge refreshes the hosted mirror from the loopback Studio API. Only aggregate Gmail and Slack coverage, safe locators, client dossiers, queue state, training outcomes, and health metadata are eligible; raw communications, direct identifiers, credentials, and access tokens are rejected.

## Local development

```bash
npm install
npm run db:generate
npm run db:migrate:local
npm run dev
```

The `DB` D1 binding is declared in `.openai/hosting.json`. Build and verification:

```bash
npm run lint
npm test
npm run test:dillon
```

`test:dillon` runs the private owner workflow against `http://localhost:3010` by default. It covers all six desktop views, the four mobile workflows, the real client registry, version-bound preference learning, idempotent Windows handoffs, automatic-action guardrails, stale-label rejection, verified resolution, evaluation idempotency, accessibility, console/network health, and responsive overflow. Set `DILLON_PRIVATE_URL` to target another authorized local environment.

Refresh the hosted seed from the verified local Studio by running `node scripts/export-sites-snapshot.mjs` from the parent workspace, then deploy a new private Sites version.
