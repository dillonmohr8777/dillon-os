---
title: MomoBot evidence ledger
type: capture
tags: [ai-division, momobot, evidence]
source_refs:
  - "C:\\Users\\dillo\\Documents\\Qwen\\deer-flow (git log, gh pr)"
  - "C:\\Users\\dillo\\.claude\\plans\\snappy-munching-heron.md"
---

# MomoBot evidence ledger

Dated, source-linked facts. Verified 2026-09-25 by re-running the command
listed unless marked **reported, not re-verified**. Part of [[README|MomoBot]].

## Fork PRs #12–#16 (merged into `integrate/m1-20260922`)

Re-verified 2026-09-25 via `gh pr view <n> --repo dillonmohr8777/deer-flow`
and `git log` on `C:\Users\dillo\Documents\Qwen\deer-flow`.

| PR | Title | Merged (ET) | Merge commit |
|---|---|---|---|
| #12 | backend: scope personal access tokens to organization (M3 isolation gate) | 2026-09-24 13:10 | `5c006d7a0c69611e912ea335557ff9410f7ab174` |
| #13 | design(ux): signed-in polish pass with before/after harness | 2026-09-24 15:28 | `bed0d43f959922c566c820b7f8d702383daa1595` |
| #14 | Admit fleet/agents/scheduled-tasks routes to the PAT policy | 2026-09-24 16:53 | `19775dc90f2bc93c40856756b6382e150640148c` |
| #15 | feat(desk): owner-only Desk home behind private_workspace.enabled | 2026-09-24 16:53 | `73406d438cd0a64907fbd6a80395924cf3ab8955` |
| #16 | fix(auth): namespace session cookie per instance to stop cross-instance collision | 2026-09-24 18:07 | `20f33a846fb52009f30e9f617a9a9a8b07299e98` |

PR #14 was reviewed but landed unmerged first per the runbook's merge order
(Desk PR #15 first, since it defines `AppConfig.private_workspace` that #14's
route gate depends on); both are merged as of this ledger.

## m4 deploy, 2026-09-24

- **Backend suite 19040 passed / 0 failed; frontend rstest 2194.**
  **Reported, not re-verified** — no log file with these exact counts was
  found in the repo during this pass; the runbook (`snappy-munching-heron.md`
  step 1) specifies the gate as "full Linux suite green" plus
  `pnpm rstest run` green, consistent with these figures but the raw numbers
  weren't independently reproduced here.
- **Backup volume `deer-flow-backup-20260924-m4`** — confirmed live,
  `docker volume ls` on 2026-09-25 shows it present.
- **OneDrive offsite backup receipt `gateway-data-20260924-162727`** —
  confirmed. `gateway-data-20260924-162727.receipt.json` at
  `C:\Users\dillo\OneDrive\MomoBot-Backups\` reads `"state": "PASS"`,
  308 files verified, 3,916,243 bytes verified, alongside the encrypted
  archive `gateway-data-20260924-162727.tgz.enc` (13,241,633 bytes).
- **`health.ps1` ok** — confirmed live by re-running
  `deploy/momentum/health.ps1` on 2026-09-25 16:00 ET:
  `{"main": 200, "ready": 200, "rehearsal": 200, "ok": true, "backupAgeHours": 12.8}`.
- **Scheduled task "MomoBot health"** — confirmed present and `Ready` via
  `Get-ScheduledTask -TaskName 'MomoBot health'` on 2026-09-25. Per the
  runbook it triggers daily 09:00 ET and at logon +3 min, running
  `deploy\momentum\health.ps1`.

## Cookie collision fix

Confirmed. Commit `c8dac6ad` ("fix(auth): namespace session cookie per
instance to stop cross-instance collision", 2026-09-24 17:47 ET, merged via
PR #16): `dillon-workspace` (`:2028`) and live MomoBot (`:2026`) share a
tailnet hostname over plain HTTP, so cookies (host-scoped, not port-scoped)
collided — whichever instance's cookie won the race, the other rejected it
and bounced back to login. Fix adds `DEER_FLOW_AUTH_COOKIE_PREFIX` (empty by
default) and namespaces the access-token and session cookies per instance on
every backend read/write site plus the frontend SSR auth check.

## Workspace bring-up (2026-09-24)

See [[WORKSPACE]] for the full summary. Headline facts, confirmed against
`GOAL.md` and `NEEDS-DILLON.md`:

- Separate compose project `dillon-workspace`, `127.0.0.1:2028` + tailnet,
  own volume/secrets, built from the same image line as MomoBot.
- 21 fleet-template agents seeded 2026-09-24 ~19:25 ET (21 agents, 21
  schedules — 7 enabled, 14 paused) via `seed-agents.ps1`, using a
  short-lived owner session cookie because a PAT cannot call
  `POST /api/agents` / `POST /api/scheduled-tasks` (`_PAT_ROUTE_RULES`
  admits only thread/run/project routes).
- Read-only mounts of `client-operations` and the `dillon-os` vault into
  every agent sandbox, `outputs/` read-write — verified in the source doc by
  a `docker run --rm` read-succeeds / write-fails test on both mounts.

## Momo v2

**Reported, not re-verified as a named milestone.** No file or commit titled
"Momo v2" was found in `C:\Users\dillo\Documents\Qwen\deer-flow` or this
vault during this pass. The closest confirmed evidence is a pair of merged
design PRs that redrew the mascot: `4/design(momo): redraw the crew avatars
as the canon Momo` and `5/design(momo): canon client success, revenue and
growth Momos` (both merged 2026-09-23, per `gh pr list`). If "Momo v2" refers
to something else, it needs a source before this ledger can confirm it.

## Deploy m5: 2026-09-26 (MomoBot live :2026 and owner workspace :2028)

Approved by Dillon on 2026-09-26 ("Make all merged work live"). Run by Claude on DESKTOP-4AHKEC4. The public VPS was not touched.

- **Source:** `dillonmohr8777/deer-flow` `lane/momo-week` at `628ea631`. The only change after `0841fcec` is `docs/momo-week/*`. Built from a clean detached worktree.
- **What ships:**
  - #44 (MFA bypass and `next=` open redirect)
  - #46 (Agents page crash)
  - #38 (Team channels and AI Academy)
  - #42 (invites)
  - #43 (VPS kit, files only)
  - lane work since the m4 images
- **Images:** `deer-flow-gateway:momentum-m5-20260926` and `deer-flow-frontend:momentum-m5-20260926`, on both instances.
  - :2026 before: `momentum-m4-20260924` (source `fbbf1a8c`).
  - :2028 before: `dillon-workspace-20260925-momoweek`.
- **Migrations applied:**
  - :2026: `0037_pat_organization` to `0038_board_threads` and `0039_team_board_academy`.
  - :2028: `0038_board_threads` to `0039_team_board_academy`.
- **Backups:** `backup_volume.py` state PASS, SQLite `integrity_check` ok, both taken before any change.

  | Backup volume | Files | DB | Volume | Head |
  |---|---|---|---|---|
  | `deer-flow-backup-20260926-m5pre` | 308 | 37.9 MB | 71.3 MB | 0037 |
  | `dillon-workspace-backup-20260926-m5pre` | 504 | 535.9 MB | 541.3 MB | 0038 |

- **Rehearsal (:2027, a copy of live :2026):**
  - The copy could not act: 0 channel connections, no pending runs or batches, scheduler off.
  - Migrations reached 0039 with no error; `/health/ready` and `/login` returned 200.
  - Table row counts were identical before and after, including users 9, organizations 9, threads_meta 14 and project_documents 94.
  - 5 new tables, all empty.
  - Torn down afterwards.
- **Config for :2026:** `momentum_internal.enabled: true`, `organization_slugs: [personal-b2588bdfd41836363db2]`. That is the only workspace named Momentum: owner plus admin, and 0 client rows.
  - No other change. Google/OIDC is left unconfigured.
- **Config for :2028:** `momentum_internal` stays off. The workspace `make_config.py` now strips the block it would otherwise copy from the Momentum config, and asserts it is off.
- **Health receipts:**
  - :2026: `health.ps1` reported `ok: true` (main 200, ready 200) at 2026-09-26T03:08 EDT.
  - Inside the gateway, `jwt.py` contains `ACCESS_TOKEN_TYPE`, and alembic is at 0039.
  - :2028: `/health/ready` returned 200, both locally and at tailnet `:8444`. Row counts match its backup.
  - Tailscale serve is unchanged: 8443 to :2026, 8444 to :2028.
- **Gate check, signed out:**
  - `/workspace/team` and `/workspace/academy` answer 307 to `/login`, the same as `/workspace/agents`.
  - `/api/v1/team/channels` answers 401, the same as any API route.
  - The 404 answer only applies to a signed-in non-staff user, which was not tested because agents do not sign in.
- **Mobile QA (390 px, Playwright, over the tailnet):** the :2026 login, agents and team pages, and the :2028 login and agents pages, render styled with no horizontal scroll. Signed-out, all of them show the login page.
- **Rollback:** point `MOMENTUM_*_IMAGE` back to the previous tags, then restore the backup volumes above. The old images can't read head 0039.
