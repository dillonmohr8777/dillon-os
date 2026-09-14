# Daily orchestrator — start here every morning

Created 2026-09-09. This is the standing brief for the master orchestrator
session. It lives in the vault so it survives session death: any new session
pointed at this file becomes the orchestrator.

## What this seat is

One session that holds the map, so no other session has to rediscover the
machine. It reads, routes and reports. It does not do every job itself.

Start it each morning. Point new work at it before spawning anything new.

## First actions, every run

1. **Run the sweep, then read it.** `node _os/automation/bin/daily-sweep.js`,
   then `System/sweep-status.md`. It takes seconds, costs no model quota, and
   its first line tells you whether the evidence under it is today's. Exit 2 is
   a successful run reporting bad news — read the headline, do not retry it.
   If the sweep's date is not today, fix that before trusting anything else.
2. Read `INDEX.md`, `System/operating-status.md`, `System/approval-queue.md`.
3. Read `12_Brain/05_Projects/` for live threads.
4. Report: what is on fire, what is waiting on Dillon, what is waiting on a
   client, what shipped since the last run.

## Scheduling - wired 2026-09-14

Registered 2026-09-14: `Cadence-daily` 09:05, `Cadence-weekly` Mon 09:20,
`Cadence-monthly` 1st 09:35, and `Cadence-sweep-heartbeat` hourly. The heartbeat
is plain Node, no model quota, so the gap record is never more than an hour
stale even if the 09:05 model run dies.
`System/sweep-install.md` has the registration for both Windows and macOS.

The machine's power-supply fault means a scheduled run *will* miss days. That is
designed for: the sweep backfills a written `MISSED` row for every day it was
skipped, the next time it runs. A gap you can read is acceptable. A gap nobody
recorded is the actual failure — it is what happened to the daily brief on
September 7, 9, 10 and 11, and to three Gmail labels that sat at zero for weeks.

Lead with what needs him today. No padding.

## The estate it must know

| Root | What it is |
|---|---|
| `C:\Users\dillo\repos\dillon-os` | The vault. 32,912 files, 6.49 GB (measured 2026-09-14; the old "114k" was wrong). Client truth in `01_Clients/`, brain in `12_Brain/` |
| `C:\Users\dillo\Documents\Codex\projects\client-operations` | Canonical client queue |
| `C:\Users\dillo\Claude\worktrees\repo-analysis-1bien2\client-operations-canonical` | Canonical client repo |
| `C:\Users\dillo\Documents\Codex` | Dated session directories; a lot of finished work is filed nowhere else |
| `C:\Users\dillo\.codex` | Codex config and memory bank |

## Hard-won operating facts

**Directory locks, not permissions.** A Claude Code session takes an exclusive
lock on its working directory. A second session in the same folder is refused.
But the lock applies ONLY to the cwd — a Code session has full host filesystem
access regardless. So: give a session a scratch folder for its lock and point it
at the real path. This cost most of a day to learn.

**Close finished sessions.** Twenty-two accumulated in one day; idle ones hold
their folders and degrade the launcher.

**Launcher flakiness is real.** `start_code_task` times out intermittently.
Retry — it usually succeeds on a later attempt. If every launch fails, check
whether the machine is asleep; a disconnected device is the usual cause.

**Cloud sessions cannot see this machine.** They get the GitHub repos only. No
local files, no local MCPs, no compositing scripts. Route anything touching the
filesystem or credits to a local session.

## Standing rules

- Credentials never enter chat, a tracked file, a log, or a message. See
  `System/api-keys-setup.md`. Report locators, never values.
- External sending, publishing, deployment, spend and account changes stay
  approval-gated. Draft, append to `System/approval-queue.md`, stop.
- Label mock data as mock, on the page, per panel. Never fill a gap with a
  plausible number.
- Distinguish what a vendor or a person claimed from what was measured.
- Design work pulls tokens from the Momentum design system. Anti-slop list is
  binding: no AI purple, no neon glow, no glassmorphism, no floating gradient
  orbs, no three-equal-card feature row.

## Skills to use rather than reinvent

`momentum-client-context`, `momentum-brand-system`, `momentum-client-intake`,
`momentum-client-report`, `momentum-spec-homepage`, plus the eight older ones tracked in the
vault at `dillon-os/.claude/skills/` (project-scoped, NOT `~/.claude/skills/`): `client-pulse`, `client-report`, `content-scan`,
`inbox-brief`, `metrics-pull`, `plan-today`, `vault-clean`, `week-review`.

Overlap resolved 2026-09-09: **`momentum-client-report` survives.** `client-report`
has one commit from July and would emit conversion counts with no names. Four
mechanics merge up from it — the `build-report.js` render path, `sampleData:
true`, the `writing-rules.md` pointer, and the Align HCM branding exception.
Neither deleted. See
[[12_Brain/04_Decisions/2026-09-09 - momentum-client-report supersedes client-report]].

## Open items carried forward

Revised 2026-09-09. Resolved items moved to the closed list below.

- **The machine is failing.** 14 unclean power-offs in 30 days, zero bugchecks,
  zero WHEA, no battery — an HP EliteDesk 800 G4 SFF. Uptime has collapsed from
  204 hours in August to 4-12 hours, with two deaths at **10 seconds** after
  POST. It is the power supply. Needs hands. This is the root cause behind
  session death, config "resets", and orphaned lock folders.
  [[12_Brain/07_Reviews/2026-09-09 - Machine power fault diagnosis]]
- **Google Ads API is live as of 2026-09-10.** Local client under
  `%LOCALAPPDATA%\Dillon\GoogleAdsProbe\`. Query every account DIRECT. The
  manager route 403s because the MCC and the children are separately
  accessible, not hierarchical. Composio is dead **for Ads** (its own Cloud
  project) — do not revive it for Ads. Corrected 2026-09-14: its Search Console,
  GA4 and Ads connections all report active and a live Search Console read of
  alignhcm.com succeeded, so "dead" is an Ads-entitlement fact, not a connector
  fact. It is also unnecessary: the gcloud ADC on this machine (2026-09-12, same
  project) already carries read scopes for Search Console, GA4 and GTM. See
  `System/google-access-expansion/ACCESS-LEDGER-2026-09-14.md`. Never query 7214914099. Never take an account-level
  total on 6275014654. Cloud project 150963436905, Explorer Access.
  The 2026-09-09 "no API path" bullet is superseded.
  [[12_Brain/07_Reviews/2026-09-10 - Orchestrator pickup]]
- **Antigravity extra Google access is Gemini 3.8 Flash plan quota, not Ads.**
  Antigravity 2.12.2 is the desktop Gemini 3.8 Flash (High) seat. Cursor
  monitors that session with Grok 4.6 and does not spawn Gemini 3.8 here.
  Desktop quota spent 2026-09-10 10:20 ET until 2026-09-17 09:55 ET. That
  session account-totaled shared CID 6275014654; the local probe now refuses
  that total and splits Replenish vs Fresh Blends by campaign name.
  Empty Antigravity `mcp_config.json` is correct. Do not treat
  `GEMINI_API_KEY` or `gemini:antigravity` as the 3.8 path. Dillon named
  Search Console and GA4 on 2026-09-14; both read directly via the gcloud ADC
  (see the Ads bullet above). GTM write and Workspace MCP stay off until named.
  [[System/antigravity-desktop-seat]]
  [[12_Brain/07_Reviews/2026-09-10 - Antigravity desktop Gemini monitor]]
  [[12_Brain/06_Research/2026-09-10 - Antigravity extra Google access]]
- **Omega's ads were buying competitors' brand names.** First search-terms audit
  ever run, 2026-09-09: `timberline landscaping` is the top term by clicks and
  produced 6 of 17 conversions. Three concrete terms burned $1,113 at $39-54 a
  click for zero. This is the lead-quality complaint's actual cause. Negatives
  are queued and gated. 21 of 22 pages still unread.
  [[12_Brain/07_Reviews/2026-09-09 - Omega search terms, first audit]]
- **Match-back now closes on ZERO accounts.** Fagan Painting was the one where
  it worked and it is no longer an active client (Dillon, 2026-09-09). The Zap
  fix also only recovers **form** leads — Omega has no call tracking at all, and
  `phone call lead` is primary on 9 of 9 campaigns.
- Tock credential exposed in plaintext email since 2026-08-31; revocation
  drafted 2026-09-02, never sent. Four more credential sets sat in Slack.
- **Omega's access request has been written and unsent since 2026-07-30** — 41
  days. Six of the nine match-back promises were made after it was drafted.
- Onsite Concrete: the Netlify landing page has no GTM or gtag, so Search form
  submissions never reach Google Ads. Lifetime 3 submissions, 0 since Aug 2.
- Puttery: zero of seven access gates cleared. Vendor eligibility confirmed
  (Business Group 28086, Business 37824). Laura at Resy holds four open items.
- Two prospect sites shipped with an unmodified demo palette and passed QA.
- 57 unsent client replies in Gmail drafts, plus ~29 unsent reports. Five weekly
  batches generated and none sent. The last thing actually sent to Omega was
  **August 11**.
- The Momentum design system IS a git repository (baseline `75b386a`, clean on
  `main`) and IS pushed to `dillonmohr8777/momentum-design-system` as of
  2026-09-14. The earlier "not a git repository" line was false. The
  "vendored copy has drifted" claim is also withdrawn: the `client-operations`
  file is a derived output artifact with its own schema (173 canonical keys vs
  100, exactly one shared value conflict, `version`), not a vendored copy.
- **20 open decisions, and the gate event never happened.** Dillon confirmed
  2026-09-14 that the Friday 2026-09-11 meeting with Mac was not held -- it was
  his birthday. There is no readout to recover. D01 still blocks any
  client-facing offer sheet and all outbound, D10 blocks outbound, D18 blocks
  client-facing paid generation. The open item is a new date, not a debrief.
  [[12_Brain/04_Decisions/2026-09-14 - The Mac meeting did not happen]]

## Closed 2026-09-09

- **GTB characters in Agency Wars: decided, no.** Book cast stays with the book.
- **Version control on the game trees: done.** All three under git; the two
  Philadelphia trees now have private remotes, as does the twice-gitignored
  Fable avatar-life evidence.
- **Bridge PR opened** — `dillonmohr8777/bridge-software-frontend` #17, 39
  commits against `development`. Tori's two decisions still gate it.
- **Nexla registered.** It had live spend and no registry record at all, which
  is why the control system could not see it. Omega given its Slack channel.
- **Six orphaned session outputs filed into the vault**, three of which existed
  only in an AppData cache.
- **The Google Ads daily runbook and renderer rescued** into
  `_os/automation/google-ads-daily/`. Rendering works; collection does not
  exist, and cannot until the API path above is solved.

## Parallel by default — Dillon, 2026-09-09

**"Parallel work is probably gonna be the bible for literally every single
session we run — in master orchestrator for sure."**

Standing rule for this seat. Fan out first, then think. Concretely:

- **Dispatch before you dig.** When a question spans more than one tree, repo or
  account, send subagents at all of it in one message and do your own verifying
  while they run. Do not investigate serially and then delegate the leftovers.
- **Multiple tool calls per message** whenever the calls are independent.
- **The orchestrator verifies, the agents gather.** This seat's own hands are
  for the one or two things that must not be taken on trust. Everything else is
  someone else's turn.
- **Never idle waiting for an agent.** There is always a local file to check, a
  note to file, a commit to make.

The counter-rule, learned the same day: a subagent cannot be messaged mid-flight
in this session. So **put shared context on disk in a versioned path**, not in a
message. Files reach a running agent; messages do not, and files survive the
session besides.
