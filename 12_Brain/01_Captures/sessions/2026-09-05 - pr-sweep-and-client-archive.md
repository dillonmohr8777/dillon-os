---
note_type: capture
status: compiled
created: 2026-09-05
updated: 2026-09-05
observed_at: "2026-09-05T22:00:00.000Z"
source_type: session
verification_status: verified
source_refs:
  - "https://claude.ai/code/session_01UBuynVuUrhJmfCMcP4Tq4G"
  - "[[System/client-roster-reconciliation-2026-09-05]]"
  - "[[12_Brain/09_Ops/Repository Access Map]]"
  - "[[11_Agents/Cloud Routine Prompts 2026-09-05]]"
tags:
  - brain
  - capture
  - session
  - github
  - pull-requests
  - clients
  - archive
---

# Session: 2026-09-05 PR sweep and retired-client archive

Owner asked for a cleanup that leaves current daily work alone, with one hard rule:
nothing that feeds wrong information into the vault. Three clients retired (Fagan
Painting, Shadow Heating & Cooling, Jeff Hozias); all Align HCM brand systems and
collateral protected. Plan approved in plan mode; this is the receipt.

## Facts learned

- Before the sweep, the ten readable repositories held 475 pull requests all-time,
  68 merged, 215 open, 192 closed unmerged. dillon-os: 365 / 41 / 135 / 189; oldest
  PR is #1 from 2026-04-20; nothing open predated #174 (July 13), so a bulk close
  had already happened once.
- Three automations open a PR a day and nothing closed them: the Cursor
  "competitive task consolidation" umbrella (15 drafts since Aug 21), the daily
  learning loop (`0 4 * * *`), and the nightly hygiene pass (`0 6 * * *`). The
  hygiene refill had a root cause: seven empty scratch files at the vault root
  (`2026-06-04.md`, `Untitled 1.base`, `Untitled 2-6.canvas`); #366 and #369 both
  moved the same one to different places.
- GitHub refuses to merge a draft (405) and refuses `expectedHeadSha` that does not
  match (409); flip `draft: false` first and pass the SHA from a fresh read.
- An agent session cannot edit a Routine created through the HTTP API
  (`update_trigger`: "Agents can only update routines they created"). Prompt fixes
  for Dillon's Routines are therefore hand-offs.
- No MCP path exists to archive or delete a repository, change its visibility, or
  delete a Netlify site (the Netlify updater offers rename, forms, env vars,
  access controls, create). Those are owner clicks.
- shadow-heating.com is served from the owner's Netlify team by site
  `shadow-hvac-website` (forms enabled, deploy ready) with ten more
  `shadow-hvac-*` report and concept sites beside it. Owner decision: keep the
  live site up until the client moves hosting.
- "Jeff Hose" is Jeff Hozias (Howard Hanna Rand Realty, $200/mo Momentum 360,
  single note, never in the canonical registry). Owner confirmed.
- `mohr-vault` is public and contains an older copy of the client vault:
  `vault/01_Clients/*/Agent Memory.md` for Bar Crawl USA, Fresh Blends Replenish,
  Hardwood Artisan, and Jeff Hozias, plus `.mcp.json` and `mcp-config.json`; last
  commit 2026-09-01. #348's commit notes say its memory file carries a personal
  phone number; this session did not reproduce that with a phone regex but the
  client memory files alone are the exposure.
- Five of six forks carry zero commits by the owner (open-generative-ai,
  agentic-inbox, hyperframes, open-llm-vtuber, camofox-browser); `claude-ads` has
  one own commit at its tip (2026-07-12).
- `dillon-operations` is an 8-file Codex routing control center (HubSpot portals),
  untouched since 2026-07-15, not a duplicate of client-operations.
  `tell-kimi-to-find-those-25` (66 files) and
  `make-kimmy-build-25-more-philadelphia` (1,136 files) are Kimi batch workspaces
  last pushed as "Backup snapshot 2026-09-01".
- The `brain-hud` test suite is red on `main` before this session: it expects
  `12_Brain/03_Concepts/Second Brain Architecture.md`, deleted by `62d05c5`;
  dillon-os #365 restores it. CI on `main` runs only the public-safety suite.

## Patterns confirmed

- Closing a PR deletes nothing; every close in this sweep kept its branch and
  carries a one-line comment with the reason, so any of them reopens in a click.
- Merge narrowly, close freely: the only merges were this session's own verified
  doc PRs (#358, dillon-claude-config #1 and #2).
- Retire a client the vault's way: dated reconciliation note in `System/`
  (precedent 2026-07-12), `git mv` to root `_archive/` (the only path
  `Test-SecondBrain.ps1` exempts and outside every `01_Clients` enumerator),
  `status: former` (the `Clients.base` value), then hunt the hardcoded lists:
  `_os/reporting/client-registry.json`, `_os/creative-factory/client-tokens.json`,
  `System/OS Config.md` `goal_current`, `System/operating-status.md`, the
  generated maps, the agent definitions and their generator.
- Two GitHub MCP servers, one scope: only the lowercase `mcp__github__*` server
  reads the private repositories.

## Mistakes and blocks

- The supersession check (every touched path looked up on `origin/main` after
  deepening main by 400 commits) returned "unique" for all 51 candidates: none of
  the July PRs' files exist on main at any path. The check is path-based, so work
  redone under a different path or in another repository is invisible to it. No PR
  was closed on its result; the 51 stay open for the owner.
- `merge_pull_request` with an `expectedHeadSha` copied from an earlier read
  returned 409 on dillon-claude-config #2; the retry without the SHA merged cleanly.
- Routine prompt edits were refused (see facts); the three replacement prompts are
  in [[11_Agents/Cloud Routine Prompts 2026-09-05]] to paste by hand.
- The 10 stale `shadow-hvac-*` Netlify sites could not be deleted from here.

## Outputs

### Merged (3)

| Repo | PR | Merge commit |
|---|---|---|
| dillon-os | #358 Add Repository Access Map for remote sessions | `1a97d64` |
| dillon-claude-config | #1 Document the seven installed Claude agents | `82feb9e` |
| dillon-claude-config | #2 Map Windows authorities to remote-session clones | `c4816ae` |

### Closed (46), branches kept

| Repo | PRs | Reason |
|---|---|---|
| dillon-os | #333 #334 #335 #337 #338 #340 #341 #342 #343 #344 #345 #355 #360 #367 #370 | cursor[bot] daily umbrella drafts, never merged |
| dillon-os | #366 #369 | hygiene twins moving the same empty root file; root cause removed in this commit |
| dillon-os | #364 | superseded by #368; its unique proposal ("stop re-running work items blocked purely on human authentication gates") is carried here |
| dillon-os | #219 | PAPERBOUND game in the marketing vault |
| dillon-os | #217 | Fagan Painting contact fix, retired client |
| dillon-os | #186 #206 #207 #209 #240 #245 #247 #250 #251 #252 | stale July infra and plans (portfolio audit with stale data, weekend plan, Cursor access reviews stacked on #205/#208, vault lint, Composio bridge, Semrush MCP, webhook gateway, Grok pipeline, week-ops board) |
| client-operations-canonical | #5 #6 #7 #8 #10 | connectivity tests, a Jul 27 intake review, Cursor dev-env setup, Composio declaration |
| client-operations-canonical | #36 | Fagan September AEO packet, retired client |
| claude-skills-repo | #1 #5 #6 #7 #9 #10 #15 #16 #18 #20 | sessions filed in the wrong repo (site rebuild, reference note, spa promo, four videos, iOS prototype, a dillon-os CLAUDE.md edit) and a July research brief |

### Open after the sweep

| Repository | Before | After |
|---|---|---|
| dillon-os | 135 | 104 |
| client-operations-canonical | 50 | 44 |
| claude-skills-repo | 19 | 9 |
| dillon-claude-config | 2 | 0 |
| bridge-software-frontend | 4 | 4 |
| bridge-discovery-prototype | 2 | 2 |
| align-hcm-public-content / align-hcm-lead-intelligence / jason-fallon-hubspot-agent | 1 each | 1 each |
| total | 215 | 166 |

### Kept open with unique content (51), owner's merge-or-discard call

dillon-os: #174 (Align Dayforce hero assets), #176 (BOK Law assets, 29 files),
#177 (Align payroll blog), #178 (Align Maher x Brent video edit, 47 files),
#181 (Align site watchdog playbook, 55 files), #182 (site-watchdog skill),
#190 (Align optimization packs), #192 (Align vendor-intent blog PDFs, 22 files),
#195 (Account Manager AI Workflow Playbook .docx), #197 #203 #221 #248 #249
(Align Customer Agent knowledge core and readiness report generations),
#198 (Align customer-agent handoff), #199 #200 (SmartCare video), #202 #216 (WCK
win story), #204 #224 #225 #238 (Align in Motion films; #238 is 149 files),
#213 (Momentum 360 landing page), #214 (Align industry video, 97 files),
#218 (Pro Fence Deck brief and video, 119 files), #222 (Hope Wellness brand film,
77 files), #231 (Account Manager AI Workflow guide), #236 #239 #243 (Align
reporting handoffs), #237 #257 (Ironic Ineptocracy, targeting the retired
`05_Book` section), #246 (Align growth report), #256 (Need Momentum signal-field
v2), #258 (BOK Law social PDF).

client-operations-canonical: #9 #11 #12 #13 #15 #16 #20 (Align deliverables under
`clients/align-hcm/`), #14 #17 #18 #19 (Momentum 360 deliverables).

claude-skills-repo: #2 (course-agent-system, 100 files), #3 (codex skill), #4
(marketing-skills-store), #14 (cannabis-compliance and three other skills).

### Left open on purpose, flagged

- dillon-os #356 #352 #348 (ready, no human review, large automation changes);
  #361 (the Pritzker anti-AI directive capture exists only on that branch);
  #362 #357 #365 #363 #368 (this week's drafts; #365 collides with #348 on the
  root scratch files and INDEX.md); #205 #208 (ready but 43 days stale).
- claude-skills-repo #23 (needs the owner's verdict that `#E8832A` is banned;
  main still says "needs an explicit owner verdict"), #24 (dirty, 153 files,
  `__pycache__/*.pyc` committed), #21 (dirty), #17 #19 (Align customer-agent skill).
- bridge-software-frontend #13 #15 #16 (external dev `clickthedemo` active),
  bridge-discovery-prototype #6 #7, align-hcm-public-content #1,
  align-hcm-lead-intelligence #1, jason-fallon-hubspot-agent #1,
  client-operations-canonical #4 and the #27 to #58 chains.

### Vault changes in this commit

See [[System/client-roster-reconciliation-2026-09-05]] for the file list. Plus:
root scratch files removed; `INDEX.md`, `session-log.md`, and
[[12_Brain/09_Ops/Repository Access Map]] updated;
[[11_Agents/Cloud Routine Prompts 2026-09-05]] added.

### Verification

- `node --test _os/test/*.test.js`: 33 pass, 1 fail (`brain-hud` "has the required
  12_Brain paths", red on `main` before this session, see facts).
- `node _os/automation/bin/frontmatter-validate.js`: 37 complete, 0 incomplete.
- Wikilink resolver over the 30 touched non-capture notes: 0 unresolved.
- `_os/automation/lib/clients.js` enumerates 37 client notes; none of the three
  retired names appear.
- Live-reference grep for the three old `01_Clients/` paths outside captures,
  archive, state, incoming payloads, and dated briefs: only the intended
  `_archive/` references remain.
- Open-PR counts after the sweep re-read from GitHub: 104 / 44 / 9 / 0.

### Hand-offs (owner clicks; no remote path from a session)

1. Flip `mohr-vault` to private, or delete it (older public copy of the client
   vault with client memory files).
2. Paste the three Routine prompts from
   [[11_Agents/Cloud Routine Prompts 2026-09-05]]; switch off the Cursor
   "competitive task consolidation" automation.
3. Netlify: delete the ten stale `shadow-hvac-*` sites listed in the
   reconciliation note; keep `shadow-hvac-website`.
4. Canonical registry patch and Fagan access revocation, queued in
   `System/approval-queue.md`.
5. `momentum-client-context` plugin: remove Fagan Painting from the roster in the
   description and body.
6. Repositories: delete the five unmodified forks (open-generative-ai,
   agentic-inbox, hyperframes, open-llm-vtuber, camofox-browser); decide on
   `claude-ads` (one own commit); archive the finished deliverable repos listed in
   the Repository Access Map section 3 and the two Kimi batch workspaces once
   batch 2 is done; `dillon-operations` if the Codex control center has moved on;
   `shadow-heating-website` once hosting moves.
7. Search Console: remove the `shadow-heating` property if the client is gone.
