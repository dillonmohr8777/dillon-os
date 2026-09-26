# MASSIVE PROMPT — paste this entire block to Claude on the Align machine

Copy everything between `BEGIN_PROMPT` and `END_PROMPT` into Claude Desktop / Claude Code on the computer with HubSpot Chrome + GitHub + the Align OneDrive Codex workspace.

```
BEGIN_PROMPT
```

You are operating on Dillon Mohr’s Align HCM machine. Execute this end-to-end. Do not ask clarifying questions unless a hard blocker makes progress impossible. Prefer action + evidence over planning.

============================================================
0. IDENTITY, PORTALS, HARD BOUNDARIES
============================================================

Portal in scope:
- HubSpot portal **242825734** only (`dillon.mohr@alignhcm.com`) — Align HCM

Portal NEVER in scope for this job:
- HubSpot portal **50612503** (Jason Fallon / Momentum 360). If any connector or UI session resolves to that portal, STOP.

Hard no’s:
- Do NOT touch Customer Agent, website chat, chatflows, or Customer Agent knowledge.
- Do NOT send mass email, SMS, or sequences.
- Do NOT print, commit, Slack, screenshot-with-visible, or paste any HubSpot private-app token / OAuth secret into chat.
- Do NOT invent HubSpot scope string names. Read exact labels from the Private App UI.
- Do NOT invent contact PII. Counts and aggregates only in replies unless Dillon explicitly asks for a protected local artifact.
- Do NOT merge PRs without explicit approval. Draft/update PRs and commits on feature branches are OK.
- Do NOT claim Search Console or Bing data exists until authenticated access is proven.
- Prefer read-only HubSpot API usage. CMS page edits to add the existing guide form block are allowed for this job. CRM writes limited to: internal notes, tasks, saved views. No lifecycle-stage mass changes.

============================================================
1. MISSION (ORDERED — DO IN THIS ORDER)
============================================================

Priority 1 — Guide conversion gap (this week, highest leverage)
Priority 2 — Reauthorize missing HubSpot capabilities (LEAD especially)
Priority 3 — Give Codex its OWN HubSpot connection (private app preferred)
Priority 4 — Fold content-analytics findings into attribution-handoff docs/report
Priority 5 — CRM notes/tasks on never-contacted organic/AI/social cohort (second to forms)
Priority 6 — Report back with evidence checklist

Why this order:
HubSpot content analytics already works. July shows buyer’s guides are being READ but mostly not converting because only Dayforce has `#align-guide-form`. That fix beats new content and beats the latency experiment for immediate pipeline value.

============================================================
2. CANONICAL FACTS (TREAT AS VERIFIED INPUT)
============================================================

## 2.1 Content analytics — already working

Earlier claim “no traffic or click data” was WRONG.
- Permission `get_content_analytics_report` is granted
- Portal is Pro/Enterprise
- Page-level traffic + conversion data is available NOW

July 1–31 aggregate:
- 2,031 page views
- 38 submissions
- 24 contacts
- 84.2% bounce
- 106s average time on page

What was actually missing: **search** data (impressions, position, query terms) = Google Search Console, not HubSpot. Narrower gap.

Bing Webmaster Tools also useful — one July organic lead came from Bing.

## 2.2 July page table (critical)

| Page | Views | Submissions | Bounce | Notes |
| Home | 583 | 1 | 79% | |
| Careers | 225 | 0 | 91% | |
| Buyer’s Guide to Workday | 103 | 0 | 100% | ~336s engagement, converts nobody |
| Buyer’s Guide to UKG | 53 | 0 | 94% | |
| Buyer’s Guide to Paylocity | 32 | 0 | 100% | |
| Buyer’s Guide to Dayforce | 17 | 2 | 44% | ONLY converting guide; has `#align-guide-form` |

Also:
- `/contact` converts 12 of 30 views
- Rep meeting links = 15 of 38 July submissions

Implication: guides are read; most lack a working conversion path. Fixable this week. Worth more than new content.

## 2.3 Attribution handoff already pushed

- Repo (inferred): `dillonmohr8777/align-hcm-august-2026-content`
- Branch: `claude/site-health-dashboard-design-7x2z1z`
- Draft PR: #11
- Folder: `attribution-handoff/`
- Machine-readable source of truth: `attribution-handoff/data/july-2026-attribution.json`
- Numbered docs exist: data dictionary, findings, methodology, open questions, plus `04-codex-kickoff-prompt.md`
- HTML report stays positive/aggregate; `01-findings.md` holds unflattering analytical truth (22% inbound win rate, 44.8% never-contacted, data-quality faults) — keep that split unless Dillon says trim findings to match report tone
- Verified before push: JSON parses, PII sweep clean, no em dashes, build-script failure gates tested by injection
- Nothing outside `attribution-handoff/` was touched (daily refresh unaffected)

If Codex’s real repo is different from `align-hcm-august-2026-content`, STOP and say so — then move the package rather than duplicating.

Also relevant (if accessible): `align-hcm-lead-intelligence` — marketing attribution work; last push ~Jul 17 (same day capture went live). Use if GitHub scope includes it.

## 2.4 CRM latency facts (still true, but SECOND priority)

- 13 of 29 organic/AI/social contacts never contacted
- Two deals that closed did so in 28 and 47 days
- Latency → conversion is still the cheapest CRM test after guide forms

## 2.5 HubSpot access — what is actually missing

Needs reauthorization (one reconnect can grant all four):
1. **LEAD object read** — currently `REQUIRES_REAUTHORIZATION`. MOST IMPORTANT for a real leads report. Dashboard currently proxies leads through contact lifecycle stage instead of the real Leads object + qualification stages.
2. **MARKETING_EMAIL read and write** — blocks email as a measurable channel (no sends/opens/clicks). Prefer enabling **read** now; write only if Dillon explicitly wants it for this session.
3. **CAMPAIGN write** — read works, write doesn’t.
4. **MARKETING_EVENT write** — read works.

Needs account/plan change (probably skip):
- PARTNER_CLIENT read — only if Align manages client portals as HubSpot Solutions Partner.

Not HubSpot:
- Search Console
- Bing Webmaster Tools

Campaign attribution aside:
- Five campaigns exist: Corporate LinkedIn, Open Enrollment, UKG Indy User Group, Aspire Cocktail, Q4 Public Sector Nurture
- No spend/budget populated → ROAS impossible
- HubSpot attribution reports score closed-won only; with one organic win ever, that tool returns almost nothing — do NOT chase ROAS dashboards yet

## 2.6 Codex connection rule

Codex needs its **own** HubSpot connection. It cannot use Dillon’s interactive session as if it were shared forever.

Options:
A. Same MCP connector, authorized as Dillon’s user — simplest, inherits permissions
B. **Private app token — PREFERRED** for an automated agent (explicit, revocable scopes)

Grant capabilities (exact scope strings from Private App UI, do not guess):
- contacts, deals, companies, owners — read
- CMS blog / site / landing page — read
- analytics / business-intelligence — read (powers content analytics report)
- leads — read (after reauth)
- marketing-email — read (after reauth)

Default: no write scopes except if Dillon later asks for campaign/event write. No send scopes.

Store token as `ALIGN_HUBSPOT_PRIVATE_APP_TOKEN` via local secure store / DPAPI. Never reuse Jason token / `JASON_HUBSPOT_PRIVATE_APP_TOKEN`.

============================================================
3. LOCAL VAULT / HANDOFF FILES (IF DILLON-OS IS AVAILABLE)
============================================================

If this machine has `dillon-os` / Dillon OS vault, also read:
- `handoffs/align-hubspot-codex-what-to-say-2026-07-30.md`
- `handoffs/align-attribution-content-analytics-fold-in-2026-07-30.md`
- PR: https://github.com/dillonmohr8777/dillon-os/pull/236

Those files are the short form of this prompt. This prompt is authoritative if they disagree.

============================================================
4. EXECUTION PLAN
============================================================

### STEP A — Prove HubSpot identity

1. Open HubSpot in Chrome already logged in as Align.
2. Confirm portal id **242825734** in settings / URL / account menu.
3. If not 242825734, STOP.

Evidence to capture: portal id screenshot path or settings text (no secrets).

### STEP B — Priority 1: Guide form conversion fix

1. Open Dayforce Buyer’s Guide page in HubSpot CMS. Confirm `#align-guide-form` (or equivalent live form module) exists and is the converting pattern.
2. Open Workday, UKG, Paylocity Buyer’s Guide pages.
3. Add the **same** form block / module / CTA pattern Dayforce uses. Do not rewrite guide body content beyond what’s needed to place the form + CTA.
4. Publish (or leave in draft ONLY if publish requires extra approval Dillon didn’t give — default is publish if you normally can edit Align CMS).
5. Smoke-test each page: form renders, submit creates/updates a contact or submission, thank-you/behavior matches Dayforce.
6. Leave an internal HubSpot marketing task or note:

```
Guide conversion gap — July content analytics

Workday / UKG / Paylocity buyer’s guides are getting reads without a working form path. Dayforce is the only guide converting and is the one with #align-guide-form.

Action: add the same #align-guide-form (or equivalent) block to Workday, UKG, and Paylocity guides this week. Do not prioritize new guide content until these three convert.

Evidence (Jul 1–31): Workday 103 views / 0 subs / ~336s engagement; Dayforce 17 views / 2 subs.
```

Definition of done for Step B:
- Three pages have live tested form path equivalent to Dayforce
- Dayforce unchanged as reference
- Short evidence note with URLs + before/after form presence

### STEP C — Priority 2: Reauthorization

In HubSpot integrations / connected apps / private apps / MCP connector UI (wherever the Align connector shows `REQUIRES_REAUTHORIZATION`):

Reconnect once and ensure these clear:
1. LEAD object read — must
2. MARKETING_EMAIL read — must (write optional; ask before enabling write if UI forces a choice and write implies send)
3. CAMPAIGN write — optional
4. MARKETING_EVENT write — optional

Skip PARTNER_CLIENT unless clearly needed.

Definition of done:
- LEAD read no longer `REQUIRES_REAUTHORIZATION`
- Marketing email read available
- Note exactly what still fails

### STEP D — Priority 3: Codex private app

Path: Settings → Integrations → Private Apps → Create private app

App name:
```
Align Codex Attribution Reader
```

Description paste:
```
Read-only private app for Codex attribution and content-analytics analysis on Align HCM portal 242825734.

Purpose:
- CRM reads for contacts, deals, companies, owners, and (after reauth) Leads
- CMS blog / site / landing page reads
- Analytics / business-intelligence reads (content analytics report)
- Marketing-email reads once that scope is reauthorized

Rules:
- Prefer read-only. No email/SMS send from this token.
- Aggregate and PII-safe reporting by default.
- Token stays on the Align OneDrive Codex machine / secure secret store. Never commit or paste into Slack/chat.
```

Scopes:
- Select the UI checkboxes that match the capability list in §2.6
- Copy the exact scope strings from the screen into your completion report
- Leave send/write unchecked unless Dillon explicitly expands scope mid-run

After create:
1. Verify portal 242825734
2. Store token securely as `ALIGN_HUBSPOT_PRIVATE_APP_TOKEN`
3. Run a minimal identity/read probe (contacts limit 1 + content analytics if available) proving portal + analytics read
4. Never echo the token

If private app creation is blocked, fall back to MCP connector authorized as Dillon’s user for Codex, and document that fallback.

### STEP E — Priority 4: Fold into attribution-handoff (PR #11)

Work on branch `claude/site-health-dashboard-design-7x2z1z` in `align-hcm-august-2026-content` (or the confirmed correct repo). Stay inside `attribution-handoff/` unless a tiny index link is required.

Do ALL of the following:

E1. Access correction
- Find and replace any “no traffic / no click data / HubSpot analytics missing” language
- State clearly: content analytics works; Search Console is the remaining search gap

E2. `01-findings.md`
- Add a section on guide conversion unevenness with the July page table
- Include Workday 336s / 0 convert vs Dayforce form presence
- Include `/contact` 12/30 and meeting-link 15/38 facts
- Keep analytical / unflattering tone appropriate to findings

E3. Open questions doc
- Insert as **#1** (above latency):

**Q: Does adding `#align-guide-form` (or Dayforce-equivalent) to Workday, UKG, and Paylocity buyer’s guides recover conversions on pages that already hold attention?**

Method:
1. Confirm Dayforce as reference (form present; 2 subs / 17 views in July)
2. Add same block to Workday, UKG, Paylocity without rewriting guide bodies beyond form/CTA placement
3. Measure 14 days post-publish: views, submissions, submission rate, bounce, avg time vs July baseline
4. Treat Workday as primary success case (high dwell, zero submits)

Definition of done:
- All three pages live with tested form path
- 14-day metrics written into `data/` or a dated analytics addendum JSON
- Decision recorded: standardize guide form template for future guides, or iterate CTA/placement

- Keep response-latency vs conversion as **#2**
- Renumber subsequent questions

E4. Methodology / access section
- Add reauth list (LEAD, marketing-email, campaign write, marketing-event write)
- Add non-HubSpot gaps: Search Console, Bing Webmaster
- Add Codex-own-connection requirement + private app preference
- Note campaigns exist without spend; defer ROAS / closed-won-only attribution chasing

E5. Optional: extend `data/` 
- If clean and PII-safe, add a small JSON addendum for July content analytics aggregates + per-guide rows (no personal data)
- Keep every prose figure traceable to JSON

E6. HTML report (positive aggregate only)
Suggested framing to add:
- July site engagement: 2,031 page views, 38 submissions, 24 contacts
- Buyer’s guides earn meaningful dwell; next iteration standardizes the proven guide form path
- Contact and meeting paths contribute a large share of submissions

Do NOT put into HTML report unless Dillon asks for diagnostic version:
- bounce % table
- “converts nobody”
- Dayforce-only form gap called out as a failure

E7. Update `04-codex-kickoff-prompt.md`
- Point Codex at content analytics capability
- Point at guide-conversion open question #1
- Point at private app / own connection
- Point at LEAD reauth dependency for true leads object reporting
- Keep kickoff paste-ready

E8. Quality gates before push
- JSON parses
- PII sweep clean across touched files
- No em dashes
- Build script / failure gates still pass
- Touch only `attribution-handoff/` (plus report file if it already lives there)

Commit message suggestion:
```
Fold July content analytics into attribution handoff

Correct HubSpot traffic access narrative, rank guide-form
conversion above latency, and document reauth + Codex auth.
```

Push the existing PR #11 branch and update the PR body noting the fold-in.

### STEP F — Priority 5: Never-contacted CRM cohort (after forms)

Only after Step B is done or explicitly blocked.

1. Create saved view:
```
July 2026 Organic AI Social Never Contacted
```
Filters: organic / AI referral / social (prefer `align_*` corrected channel fields if present); no email/call/meeting after create; July cohort / capture-from-Jul-17 window. Sort oldest first.

2. For oldest 5 contacts, leave CRM **note** (not email):

```
Internal CRM note only. Do not send as email.

Why this contact is flagged:
- July 2026 attribution review put organic / AI / social inbound in the latency test (second priority after guide-form conversion).
- 13 of 29 contacts in that channel group had no logged sales contact after create.
- The two closed deals in the review set closed in 28 and 47 days.

Suggested first touch (owner picks channel):
1. Same-day reply acknowledging the form/source page they used.
2. One clear next step (15-min fit call or reply with company size / payroll headcount).
3. If no reply in 2 business days, one short bump, then park.

Log the first touch on this timeline so we can measure create → first engagement hours against conversion.
Do not change lifecycle stage from this note alone.
```

3. Create task assigned to contact owner, due today or next business morning:

```
First touch — July attribution latency test

Contact has no logged sales activity after create and sits in the organic/AI/social cohort. Make one real first touch today, log it on the timeline, and note hours since create.
```

4. Do not mass-email the cohort.

### STEP G — Optional if time: Search Console / Bing access notes

Do not fake data. If you can open Search Console / Bing Webmaster for alignhcm.com properties, record property URLs and whether generative/AI export is available. Otherwise list exact click-path Dillon must complete. No passwords in chat.

============================================================
5. COMPLETION REPORT FORMAT (MANDATORY)
============================================================

Return exactly this structure:

## Portal
- Verified portal id:
- Wrong-portal incidents:

## Step B — Guide forms
- Dayforce reference confirmed (yes/no + how):
- Workday form added + tested:
- UKG form added + tested:
- Paylocity form added + tested:
- Published or draft:
- Blockers:

## Step C — Reauth
- LEAD read:
- MARKETING_EMAIL read:
- MARKETING_EMAIL write:
- CAMPAIGN write:
- MARKETING_EVENT write:
- Still failing:

## Step D — Codex connection
- Method (private app / MCP fallback):
- Portal verified:
- Exact scope strings selected:
- Token stored locally (yes/no, never print):
- Probe result (aggregate only):

## Step E — attribution-handoff fold-in
- Repo/branch/PR:
- Files changed:
- Open question #1 now guide-conversion? (yes/no)
- HTML report kept positive aggregate? (yes/no)
- JSON/PII/em-dash/build gates:

## Step F — Never-contacted CRM
- Saved view created + count:
- Notes written (count only):
- Tasks written (count only):
- Skipped because forms not done? 

## Still outside HubSpot
- Search Console status:
- Bing Webmaster status:
- align-hcm-lead-intelligence access:

## Ask Dillon only if blocked
- Single most important blocker:

============================================================
6. STYLE / SAFETY
============================================================

- Be direct. No fluff.
- No em dashes in committed handoff docs.
- Counts are whole integers.
- Aggregate + PII-safe in all chat output.
- If a step is blocked, continue to the next unblocked highest priority.
- Prefer fixing the three guide forms over writing more strategy.

Start now with Step A (portal verify), then Step B.

```
END_PROMPT
```

---

## Operator note (not part of the Claude paste)

Save/send this file to the Align machine Claude session. Full pack also lives beside:
- `handoffs/align-hubspot-codex-what-to-say-2026-07-30.md`
- `handoffs/align-attribution-content-analytics-fold-in-2026-07-30.md`
- dillon-os PR https://github.com/dillonmohr8777/dillon-os/pull/236
