---
tags: [inbox, strategy, automation, websites, design, outreach]
created: 2026-07-29
updated: 2026-07-29
source: Deep cross-reference of the vault + sibling agent PR #226 (site factory / outreach engine) + DESKTOP-4AHKEC4 12_Brain build report
status: wave-1-2-implemented
related:
  - "[[00_Inbox/Top 15 Opportunities 2026-07-02]]"
  - "[[12_Brain/README]]"
  - "[[12_Brain/DEPENDENCY_PR226]]"
  - "[[_os/automation/docs/OPERATOR]]"
  - "[[_os/automation/evidence/VERIFICATION]]"
---

# Automation Deep Analysis: Websites, Design, Outreach

**Working doc + implementation contract.** Wave 1–2 are implemented on this branch under `12_Brain/` + `_os/automation/` (see verification evidence). Ranked against the three written targets: **$40K Mohr Media in 5 months**, **ROAD TO 100 CLIENTS (12/100)**, and **2,000 book subscribers**.

## The one-paragraph verdict (updated)

PR #226 still owns the site factory and Mac’s campaign pack — this branch **depends on it, does not duplicate it**. This PR implements the missing connective tissue: canonical automation registry/queue/state, frontmatter validate+repair (37/37 client notes complete after safe repair), deterministic site-health sentinel (fixture dry-run), and one shared discover/qualify 0–100 scorer with a Maps intake path plus an Indeed hiring-signal **adapter** (import-only). Desktop `12_Brain` from DESKTOP-4AHKEC4 remains Sync-gated; the cloud scaffold here is the automation source of truth until Sync lands. Activate (deploy token, mail vendor, outreach send) stays gated.

---

## What just landed (do not rebuild)

### A. PR #226 — Dillon OS agentic build-out (`cursor/dillon-os-agentic-build-out-6254`)

Shipped today as draft PR. This is Mac's real acquisition engine, not a hypothetical:

| Piece | Path / skill | Status |
|---|---|---|
| Site factory | `_templates/site-factory/` (`harvest.js`, `build-site.js`, `build-batch.js`, `qa.js`, `base.css`) | **Automated** |
| Design system | `philly-sites/DESIGN-SYSTEM.md` (10 sections, 350–500 words, 12–13 images) | Codified |
| Design skills | `site-factory`, `site-batch`, `mirror-and-improve`, `ui-design`, `ux-audit`, `frontend-build`, `motion-design`, `slack-intake` | Live |
| Campaign pack | `02_Campaigns/AI Site Builder Outreach Engine/` (brief, Pipeline Spec, Batch Runbook, Market Roster, Slack Evidence Log) | Live |
| Agent shells | Master / Google Ads / SEO / Reporting / Web filled | Done (Opp #4 partial) |
| Verified | Live harvest on standardtap.com; clean 4/4 batch QA | Proven |

**Mac's chain, now mapped to status:**

> Bot scrape → database → AI site builder → Zapier → QR → Direct Mail → Gatekeep sales call

| Stage | Status |
|---|---|
| 1 Discover (Maps scrape → prospect rows) | Manual → partly automated. Shared Google Sheet still needed (Jesse + Dillon). |
| 2 Qualify (decay score 0–100) | Partly automated — `harvest.js` already emits decay signals; full scorer not built. |
| 3 Brief | **Automated** via harvest + `/mirror-and-improve` |
| 4 Build | **Automated** via `build-batch.js` |
| 5 Quality gate | **Automated** + required human taste pass |
| 6 Approval | **Manual by design** — Mac/Melissa, one hub URL + 5-min Loom |
| 7 Activate | Gap: Netlify deploy token missing from Cloud secrets; QR path ready (Zapier/QRTiger from `manifest.csv`); **mail vendor undecided** (PostGrid vs StackAdapt) |
| 8 Learn | Not built — batch results → scoring ledger |

### B. DESKTOP-4AHKEC4 — `12_Brain` layer (local, not in this checkout)

From the "Monitor Cursor and build vault" run (~24 min):

- Obsidian **1.12.7** present; local vault already existed (no download).
- Gmail account on **Standard Sync** subscription.
- Built full **`12_Brain`**: native Bases, projects, decisions, research, bi-temporal memory, templates, agent protocols, Cursor rules, Claude skills, health automation.
- Verification: **0 structural errors**, six warnings on historical broken links outside the new layer.
- Design: Obsidian native Bases + CLI + Web Clipper + encrypted Sync.
- **One human gate remains:** visible Obsidian sign-in → remote-vault selection → enable CLI.
- Bitwarden was locked — no credentials accessed.
- **Not present in this cloud workspace.** Until Sync bridges or the layer is committed/pushed, cloud agents (including this one) cannot see or operate on `12_Brain`.

### C. Earlier second-brain precedent (not the same build)

`claude/fable-obsidian-second-brain-tya2zz` already sketched `concepts/`, `entities/`, `raw/`, `Clients.base`, and `System/Second Brain Ops.md`. Treat `12_Brain` as the operational layer that should absorb or supersede that sketch once Sync lands — do not fork a third architecture.

---

## Lane 1: Website automations — remaining work only

### Already covered by PR #226 (former W1 / D5)
Website factory, shared CSS module, Philly-25 template extraction, batch review hub — **done. Merge #226 and run the Batch Runbook; do not rebuild.**

### W2. Deploy + post-deploy (still open)
- Put a **Netlify deploy token** in Cursor Cloud Agent secrets so stage 7 preview deploys stop being manual.
- Git-link `mohr-media-site` Vercel (still CLI-only, generators uncommitted).
- Chain immohrtal post-deploy (`gen-blog-pages` → IndexNow → optional `set-domain`) into one hook.

### W3. Site health sentinel (still open — book-form insurance)
Daily canary across book / mohr-media / immohrtal / managed client sites: form POST acceptance, GA4/Meta/GTM presence, SSL/domain, broken links. The two-month dead `/api/dossier-leads` is the proven failure mode. Should become a `12_Brain` health-automation row once Sync is live.

### W4. Landing page lane (still open)
Generalize Bar Crawl's WordPress publisher pattern for client LPs (NKCDC tax-prep unblock, Replenish, Omega, SmartCare). Distinct from the prospect Tier-A batch factory.

### W5. Report factory data pulls (still open)
`_os/reporting/build-report.js` + `/client-report` render HTML from JSON. Missing: per-client Google Ads / Meta / GA4 / GBP fetchers that emit that JSON. Biggest remaining *client-delivery* manual load (Align + ~8 M360 retainers).

---

## Lane 2: Design automations — remaining work only

### Already covered by PR #226
Design skill stack for prospect sites is live. Bok Law / Align Sunday routines already exist as scheduled patterns.

### D1. Multi-client asset studio (still open)
IMMOHRTAL `asset-studio` is still one-brand. Parameterize to `brand-tokens.json` per client (from each `brand-guidelines.md`) for GBP cards, LinkedIn statics, report headers. ~15 GBP posts/week + Align 5-profile cadence is the demand.

### D2. GBP content factory (still open)
Weekly draft queue on top of D1 for Shadow, Omega, Hardwood, Jeff — same approval shape as `bok-law-social-content`.

### D3. Social series engine (still open)
Parameterize Bok Law + Align LinkedIn routines into one `social-series` skill (pillars, cadence, voice rules like Align's "no em dashes").

### D4. Creative pre-flight guardrail (still open)
Banned-terms lint (Bar Crawl alcohol), brand/logo checks (Replenish), required CC lists (KJB). Wire into every D1–D3 and ads creative path. Agent shells are now filled — this is the enforcement layer on top of them.

---

## Lane 3: Outreach — Mac's engine first, Mohr Media second

### Correction to the earlier Indeed read

The vault still has **no personal job-search content**. Mac's documented ask (2026-07-09, evidence in the Slack Evidence Log) is the acquisition engine above:

> Bot scrape → database → AI site builder → Zapier → QR → Direct Mail → Gatekeep sales call

That is the **primary** client-acquisition automation for Momentum / ROAD TO 100 CLIENTS. Indeed is not the primary channel.

### O1–O4. Close Mac's activate + discover gaps (do these)

1. **Shared prospect Google Sheet** as single source of truth (Jesse + Dillon) — fields from Pipeline Spec stage 1; Zapier reads this for QR/mail.
2. **0–100 qualify scorer** — script over harvest decay signals + review volume + vertical fit + ad presence; suppress existing `01_Clients/` and prior-mail list.
3. **Mail vendor decision** — PostGrid vs StackAdapt; then Zapier path from sheet `ready` flag → mail merge. Known gap as of 2026-07-29.
4. **Call gatekeep** — QR lands on demo with book-a-call carrying `prospect_id` so scans attribute to calls; feed stage 8 learn ledger.

### I1–I4. Mohr Media hiring-signal lane (secondary, still valid)

Keep as a **second discover source**, not a replacement for Maps:

- Scrape Indeed / LinkedIn Jobs / Google Jobs for marketing-hire postings in Mohr Media verticals and metros.
- Enrich + score; A-tier prospects feed the **same site factory** (Tier A batch or Tier B bespoke).
- Draft-first sequencer uses the business-plan math pitch ("$65K hire vs $1.5–3K retainer") + demo link.
- Prospect notes get `status / last_touched / next_action` so `client-pulse` watches them.

This fills the Mohr Media plan's 20–30 cold emails + 10–15 LinkedIn DMs/week. Do not start until Mac's sheet + activate path are real — otherwise you build two orphan pipelines.

---

## Supporting layer — what `12_Brain` should own once Sync is live

| Need | Owner once Sync bridges |
|---|---|
| Frontmatter revival (`due` / `next_action` / `status` / `last_touched`) — Opp #11 | `12_Brain` Bases + projects |
| Bi-temporal memory / decisions / research | Already claimed built on desktop |
| Health automation (W3 sentinel, routine-health rows) | `12_Brain` health automation |
| Agent protocols + Cursor rules + Claude skills registry | Built on desktop; merge carefully with PR #226's `.cursor/rules` and `.claude/skills` so nothing double-defines |
| Revenue scorecard (Opp #9) | New Base or note fed by metrics-pull + I/O funnel counts |
| Port of the 28 Codex automations (Opp #12) | Scheduled jobs registered in `12_Brain`, draft-first boundaries intact |

**Human action required before any of that compounds:** on DESKTOP-4AHKEC4, complete the Obsidian sign-in → pick the remote vault → enable CLI. Until then, cloud analysis and desktop `12_Brain` are two brains that cannot see each other.

---

## Revised build order

**Wave 0 — human gates (still open):**
1. Desktop Obsidian Sync sign-in + remote vault + CLI (unlocks desktop `12_Brain`).
2. Merge/rebase with PR #226 when ready (no path collision with this PR’s new files; see `12_Brain/DEPENDENCY_PR226.md`).
3. Netlify deploy token into Cloud secrets; pick PostGrid or StackAdapt.

**Wave 1 — implemented on this branch:**
`12_Brain` registry/queue/state + frontmatter validate/repair + shared qualify scorer (Maps intake). Operator: `_os/automation/docs/OPERATOR.md`.

**Wave 2 — partially implemented (no-credential slice):**
W3 site-health sentinel (fixture dry-run + optional `--live` GET) **done**. Indeed adapter into the same scorer **done**. W5 report data pulls and D4 creative guardrails still open (need API access / richer agent rules).

**Wave 3 — Mohr Media + design scale:**
I1–I4 hiring-signal discover feeding the same factory → D1 multi-client asset studio → D2 GBP factory → D3 social-series.

**Wave 4 — compound:**
stage-8 learn ledger → revenue scorecard / HUD v2 → port remaining Codex routines into `12_Brain` schedules.

---

## Spec table (remaining only)

| # | Automation | Trigger | Output | Tier | Depends on |
|---|---|---|---|---|---|
| H0 | Obsidian Sync + CLI gate | Human on DESKTOP-4AHKEC4 | `12_Brain` visible to cloud | — | You |
| H1 | Merge PR #226 | Human | Factory on `main` | — | You |
| O1 | Prospect sheet + Maps discover | Weekly | Scored rows | 0 | Jesse sheet |
| O2 | Qualify scorer 0–100 | New rows | Ranked build queue | 0 | harvest.js |
| O3 | Netlify token + batch deploy | Approved batch | Private preview URLs | 1 | Cloud secrets |
| O4 | Mail vendor + Zapier | `ready` flag | Physical mail + QR | 2 | Vendor pick |
| O5 | Call gatekeep + learn ledger | QR scan / call | Attribution + score tuning | 0/1 | O3–O4 |
| W3 | Site sentinel | Daily | AM brief health lines | 0 | Property list |
| W5 | Report data pulls | Monthly / client | JSON → HTML share link | 0 build, 2 send | API access |
| D1–D3 | Asset studio → GBP → social | Weekly | Draft queues | 2 to post | brand-tokens |
| D4 | Creative guardrail | Every creative | Pass/fail | 0 | Filled 11_Agents |
| I1–I4 | Hiring-signal → Mohr Media drafts | Daily/3×wk | Draft sequences | 2 to send | Wave 1 live |

## What not to do

- Do not rebuild the site factory or Philly-25 template system — use `/site-batch`.
- Do not invent a third second-brain layout; wait for `12_Brain` Sync, then reconcile with the fable `concepts/entities/raw` sketch.
- Do not start Indeed outreach as a parallel orphan stack before Mac's sheet and activate path exist.
- Do not auto-send mail, Slack, or Gmail — Tier 2 stays gated.
