# Daily AEO / GEO / SEO Config Improvement — Routine SPEC

**Status:** Design-only. Ready for The CEO (`fc5059d6-aad6-4af8-8c43-8831668decf5`) to install via `update_state` target `routine`.  
**Author lane:** SEO AEO GEO Strategist support (Grok Bot executor).  
**Date:** 2026-09-10 (ET)  
**Authority:** Codex / Marketing Chief remains final queue authority. This routine must **not** write `queue/work-items.json` or mutate CONTROL.  
**Hard floor:** Do **not** create the routine from this document automatically; do **not** mutate live sites; do **not** touch Bitwarden secrets; do **not** send client-facing messages; do **not** write the canonical registry.

---

## 1. Proposed routine name

**`Daily AEO GEO SEO config improve (dry-run)`**

Short id for logs: `aeo-geo-seo-daily-config`

---

## 2. Suggested cron schedule

| Field | Value |
|---|---|
| Cron | `0 8 * * 1-5` |
| Timezone | User local = **America/New_York** (no `CRON_TZ` prefix needed if the runtime already uses the user zone; if pinning is preferred: `CRON_TZ=America/New_York 0 8 * * 1-5`) |
| Meaning | Weekdays at **8:00 AM ET** |
| Why | Lands as a morning digest **before** Mohr Media standup (`0 9 * * 1-5`) and alongside Marketing Chief morning-loop reading hours. Weekday-only avoids weekend noise; overnight fires are out of scope. |
| Floor | Do not schedule below the account’s accepted routines interval floor. |

### Optional event hooks (group listener — install later if useful)

Prefer events over polling when the signal exists. Suggested **group** companions (same prompt, separate installs or one `group` trigger if Origin-compatible with cron):

1. **Webhook** `{ "type": "webhook" }` — fire when Access Broker / a local watcher POSTs “website CMS locator newly registered or re-verified for client X.”
2. **Slack** (ops only) — e.g. channel where Dillon / The CEO posts approvals:  
   `{ "type": "slack", "channel": "#360ops", "match": { "kind": "keyword", "keyword": "aeo-approve" } }`  
   (Exact channel must be one `@Cursor` is invited to; DM to Dillon is acceptable if preferred.)
3. **Do not** poll Bitwarden or unlock the vault on a timer.

Primary install should be **cron-only**. Add listeners only when Dillon explicitly wants event wakes; never combine cron + trigger in one routine object.

---

## 3. Preconditions checklist (before first fire / each fire)

The CEO / installer verifies once; the routine re-checks every run:

- [ ] **Machine:** Prefer DESKTOP-4AHKEC4 (`feeac9f6-8347-4372-8943-e8ab69a3adf0`) for registry + Access Broker reads. Box-only runs may produce public-crawl findings but must not claim CMS write readiness.
- [ ] **Registry readable:** `C:\Users\dillo\Documents\Codex\projects\client-operations\registry\clients.json` (authority for “is this a client?”). Cross-check `clients\<id>\` folder exists.
- [ ] **CONTROL / queue:** Read-only. Marketing Chief owns writes. Routine never mutates `queue/work-items.json` or CONTROL.
- [ ] **Access map available without secrets:** Access Broker status + opaque locator presence (e.g. `bw://…` item refs) for systems typed `website` / `cms` / `wordpress` / `webflow` / `shopify` / `highlevel` (or equivalent). Raw passwords, TOTP, cookies, session tokens **never** enter state, reports, or prompts.
- [ ] **Pinned-client file or pin field:** A durable pin such as  
  `C:\Users\dillo\Documents\Codex\projects\client-operations\state\aeo-daily-pin.json`  
  (or vault equivalent under `dillon-os\System\`) with shape `{ "clientId": "…", "domain": "…", "pinnedBy": "dillon|ceo", "pinnedAt": "ISO-8601", "expiresAt": "ISO-8601|null" }`.  
  **No pin ⇒ audit-only / skip mutation forever.**
- [ ] **Approval envelope store:** Path for pending / granted envelopes (see §5), e.g.  
  `…\clients\<id>\work\aeo-approvals\` and a portfolio index under `…\state\aeo-approvals\`.
- [ ] **Audit log path exists (create on first run if missing):**  
  `C:\Users\dillo\Documents\Codex\projects\client-operations\clients\<id>\evidence\aeo-daily\`  
  plus portfolio rollup:  
  `C:\Users\dillo\Documents\Codex\projects\client-operations\state\aeo-daily-runs\YYYY-MM-DD.md`  
  Box mirror allowed: `/workspace/seo-aeo-geo/runs/YYYY-MM-DD.md` (non-canonical).
- [ ] **Bitwarden vault:** May remain **locked**. Routine never requests unlock, never dumps `.secrets`, never calls Access Broker for secret material—only **locator presence / route metadata**.
- [ ] **Public HTTP allowed** for read-only crawl of the client’s canonical domain(s).
- [ ] **Standing authority:** Client is Active (or explicitly allowed) in registry; not retired / paused / quarantine-only Slack lanes without a registry id.

**Example first pin candidate (illustrative only — not auto-pinned):**  
`kimberly-james-bridal` · `kimberlyjamesbridal.com`

---

## 4. Exact prompt text (write this into the routine)

> Intent-based. Do not freeze MCP tool names, schemas, or Bitwarden unlock steps into the prompt.

```text
You are running the Daily AEO/GEO/SEO config improvement loop for Dillon Mohr (Momentum / portfolio). Orchestrator authority: Codex/Marketing Chief owns the canonical queue. You are The CEO’s installable desktop automation. User timezone: America/New_York.

HARD RULES (never violate):
- Design and execute as dry-run by default. No live CMS/site mutation unless BOTH (1) a single pinned client is present and unexpired AND (2) an explicit approval envelope for THIS run’s change set is granted and unexpired.
- Never unlock Bitwarden, never read/write raw secrets, never paste passwords/tokens/cookies into state, reports, chat, or files. Access is locator-only (bw:// or Access Broker opaque refs).
- Never send client-facing email/Slack/SMS. Never publish, deploy, spend, or mutate ads. Never write queue/work-items.json or CONTROL.md.
- Anti-busywork: only propose or apply when a verified gap exists with a measurable acceptance check. If no delta, skip and say so in one line. Prioritize high-impact AEO/GEO citability over cosmetic SEO churn.
- Ambiguous client, missing access, MFA/CAPTCHA/passkey, or stale approval → stop that client, record failure mode, continue others in read-only if safe.

EACH RUN:
1) Discover eligible clients WITHOUT secrets:
   - Read client-operations registry\clients.json (and clients\<id>\ folders). Prefer Active clients with a known primary domain.
   - Detect website CMS/login access by LOCATOR PRESENCE only: Access Broker routes / access-registry entries / client access maps that show an exact opaque locator for systems like website|cms|wordpress|webflow|shopify|highlevel. Treat “hasExactLocator=true” as eligibility signal. Do not fetch credential payloads. Registry flags such as access.website.status=mapped are OK; inventing access is not.
   - Build set A = clients with domain + website locator present. Set B = pinned client (0 or 1). Set C = clients with a fresh approval envelope for today’s proposed change set.

2) For each client in set A (cap to a small daily budget, e.g. top 3 by revenue/urgency/pin, else rotate fairly):
   a) READ-ONLY public crawl/audit of the canonical site:
      - robots.txt (AI bot allow/deny clarity; no accidental blanket block of citation-useful bots unless intentional brand policy)
      - /llms.txt presence + usefulness
      - JSON-LD / schema types on key money pages
      - title/meta on homepage + top 3 commercial URLs
      - FAQ / answer-block extractability (visible text, not image-only)
      - sitemap.xml reachability + lastmod sanity
      - internal links among money pages / NAP consistency where local
      - content extractability (main content in HTML text, headings hierarchy)
   b) Compare to prior run snapshot under clients\<id>\evidence\aeo-daily\ if present.
   c) Emit ONLY concrete config deltas where gap is verified. Each delta must include: class, URL/path, current evidence (redacted), proposed change, acceptance check, rollback note, impact rank (AEO/GEO citability first).

3) Approval / mutation gate:
   - Default: write redacted findings + proposed change set to audit paths; notify The CEO / Marketing Chief internally only.
   - If pinned client matches exactly one id AND an approval envelope lists the exact change ids for this run and is unexpired: you MAY apply ONLY those listed changes via the already-authorized CMS session pattern (invite-based user preferred; never owner password). After apply, re-fetch public URLs and record pass/fail per acceptance check. If any fail, execute rollback notes or flag human rollback.
   - If pin missing, pin≠client, approval missing/stale/partial, MFA handoff needed, or locator missing: DO NOT mutate. Record failure mode.

4) Outputs (every run):
   - Portfolio rollup markdown (redacted) for The CEO / Marketing Chief.
   - Per-client proposed change set JSON/MD under evidence\aeo-daily\.
   - Append one audit line to the run log (timestamp ET, client ids touched, dry-run vs applied, skip reasons).
   - Never client-facing send.

5) Success for a quiet day: “No verified AEO/GEO config deltas for eligible clients” with locator coverage counts — that is success, not failure.

Example client shape: kimberly-james-bridal / kimberlyjamesbridal.com — use only if registry + locator + pin/approval allow; never assume write access.
```

---

## 5. Approval gate language

Use this exact envelope contract (file or structured message). **Draft ≠ approval.**

### Envelope fields

```json
{
  "envelopeId": "aeo-appr-YYYYMMDD-NNN",
  "clientId": "kimberly-james-bridal",
  "domain": "kimberlyjamesbridal.com",
  "runDate": "YYYY-MM-DD",
  "mode": "apply",
  "changeIds": ["chg-robots-ai-bots", "chg-llms-txt"],
  "approvedBy": "dillon",
  "approvedAt": "ISO-8601",
  "expiresAt": "ISO-8601",
  "scopeLimit": "Only the listed changeIds on the pinned client. No ads, no email, no deploy outside CMS config paths named in the change set.",
  "rollbackRequired": true
}
```

### Gate copy (surface to Dillon / The CEO when proposing)

> **Approval required before any live mutation.**  
> Client must be **pinned** (`aeo-daily-pin.json` exact `clientId`).  
> Reply with an approval envelope that lists **exact `changeIds`** from today’s proposed change set, an **`expiresAt` within 24 hours**, and `mode: apply`.  
> Anything else (emoji react alone, “lgtm”, approval for a different client, expired envelope, or pin mismatch) is **not** authorization. Dry-run continues.

### Pin language

> Pinning selects **at most one** client for mutation eligibility. Pin without a matching approval envelope still yields **proposals only**. Unpin or expire the pin to force portfolio-wide dry-run.

---

## 6. Discovery model (no secret exposure)

| Signal | How to read | Eligible? |
|---|---|---|
| `registry\clients.json` Active + primary domain | Roster truth | Required baseline |
| Access Broker / access-registry row for `website`/`cms`/… with **exact item locator** (`bw://…` or opaque id) | Boolean `hasExactLocator` + system type + lastVerifiedAt | Required for “has site access” |
| Client folder access map / `access.json` flag `website.locatorPresent=true` | Mirror of broker; still no secrets | Supporting |
| Vault locked / locator absent / ambiguous multi-match | Record `missing_access` or `ambiguous_client` | **Not** eligible for apply; public crawl may still run |
| Invite-based CMS user (`dillonmohr8777@gmail.com`) documented | Preferred session pattern when applying | Preferred over shared owner login |

**Never:** `bw get`, secret export, clipboard capture, cookie jar dump, or writing locator payloads that include passwords.

---

## 7. Safe daily loop (phases)

```
TRIGGER (cron 08:00 ET weekdays)
  → LOAD registry + locator presence map (no unlock)
  → SELECT candidates (eligible ∩ budget)
  → PUBLIC READ-ONLY AUDIT
  → DIFF vs yesterday snapshot
  → BUILD change set (only verified gaps + acceptance checks)
  → IF no deltas: SKIP + report quiet success
  → WRITE redacted report + proposals
  → IF pin ∧ fresh envelope ∧ changeIds exact:
        APPLY listed only → PUBLIC VERIFY → ROLLBACK notes on fail
     ELSE:
        STOP at proposal
  → APPEND audit log → INTERNAL notify CEO / Marketing Chief
```

**Dry-run default:** `mode=dry-run` implied whenever envelope absent.

---

## 8. Success criteria

A run is **successful** when all of the following hold:

1. Eligible clients were discovered via registry + locator **presence** only (no secrets in artifacts).
2. Every proposed delta cites **verified current evidence** (URL + observed fact) and an **acceptance check**.
3. No live mutation occurred unless pin + unexpired envelope matched **exact** `changeIds`.
4. Post-apply (if any): acceptance checks re-run on public URLs; failures logged with rollback status.
5. Outputs landed in the audit paths; internal report delivered to The CEO / Marketing Chief; **zero** client-facing sends.
6. Quiet portfolio (“no deltas”) is an explicit success outcome with coverage counts:
   - `eligibleWithLocator`
   - `audited`
   - `proposed`
   - `applied`
   - `skippedNoDelta`
   - `blocked*` failure-mode counts

---

## 9. First 5 example improvement classes (with acceptance checks)

Prioritize **AEO/GEO citability**. Example domain for illustration: `kimberlyjamesbridal.com` (client id `kimberly-james-bridal`).

### 1) AI-crawler clarity in `robots.txt`

- **Gap:** Missing, contradictory, or accidental blanket `Disallow: /` that blocks citation-useful fetchers without a documented brand policy; or no explicit stance where policy is to allow.
- **Proposed delta:** Publish an explicit robots policy distinguishing general SEO bots vs AI training/citation bots per client policy (never invent a “block all AI” policy without owner intent).
- **Acceptance check:** `GET /robots.txt` returns 200; contains named user-agent blocks that match the approved policy doc; money URLs are not disallowed for Googlebot unless intentional; snapshot hash recorded.
- **Rollback:** Restore previous robots.txt body from evidence snapshot.

### 2) Publish / refresh `/llms.txt`

- **Gap:** `/llms.txt` 404 or empty/unhelpful for answer engines.
- **Proposed delta:** Add plain-language llms.txt: who the business is, primary services/geo, canonical money URLs, contact, what not to invent.
- **Acceptance check:** `GET /llms.txt` 200, `text/plain` (or HTML only if host forces—prefer plain), includes business name + ≥3 canonical URLs that 200; content is factual vs registry/site.
- **Rollback:** Delete file or restore prior version.

### 3) Schema.org JSON-LD on money pages

- **Gap:** Homepage/service/contact pages lack appropriate types (e.g. `LocalBusiness` / `BridalShop` / `FAQPage` / `Organization`) or NAP disagrees with footer.
- **Proposed delta:** Inject validated JSON-LD matching visible NAP and page purpose; no fake reviews/ratings.
- **Acceptance check:** View-source or public HTML contains parseable JSON-LD; required `@type` present; telephone/address/name match visible footer; Rich Results / local schema validator reports zero critical errors on sampled URLs.
- **Rollback:** Remove added script blocks / restore prior template partial.

### 4) Title / meta + visible FAQ answer blocks

- **Gap:** Title/meta missing intent (service + geo) on commercial URLs; FAQs only in images/PDFs; no extractable Q→A text for AEO.
- **Proposed delta:** Tighten title/meta to verified offerings; add HTML FAQ section with clear questions/answers on one priority page (e.g. appointments / collections policy)—config/content block, not a blog program.
- **Acceptance check:** Sample URL shows unique title ≤~60 chars with primary intent; meta description present; ≥3 FAQ pairs as real text nodes; optional `FAQPage` schema matches visible Q&A exactly.
- **Rollback:** Revert title/meta/FAQ block to snapshot.

### 5) Sitemap + internal links + extractability

- **Gap:** `sitemap.xml` missing/stale; orphan money pages; main copy trapped in canvases/images; heading soup.
- **Proposed delta:** Regenerate/submit-ready sitemap listing canonical money URLs; add 2–4 contextual internal links among those URLs; ensure H1/H2 text is in HTML.
- **Acceptance check:** `GET /sitemap.xml` 200; lists the target money URLs; each URL 200; from homepage, ≤2 clicks to each money URL via HTML `<a href>`; primary H1 visible as text (not only background image alt emptiness).
- **Rollback:** Restore prior sitemap and navigation partials.

---

## 10. Failure modes (required handling)

| Mode | Detect | Behavior |
|---|---|---|
| **missing_access** | No exact website/CMS locator for client | Public audit OK; propose only if useful; never apply; ask human to map locator via Access Broker (no secret paste) |
| **mfa_handoff** | Login/session hits MFA, CAPTCHA, passkey, password challenge | Stop apply immediately; do not brute force; record handoff need; keep proposals |
| **ambiguous_client** | Pin id not in registry, domain collision, or multiple CMS locators without exact system match | Quarantine; no apply; escalate in internal report |
| **stale_approval** | Envelope expired, wrong `runDate`, `changeIds` not subset of today’s proposals, or pin mismatch | Treat as dry-run; do not partially apply |
| **registry_drift** | Folder without registry id / Slack-only quarantine lane | Skip mutation; optional public audit labeled non-canonical |
| **vault_locked** | Broker reports locked | Expected; locator presence checks only; never request unlock from this routine |
| **verify_fail_after_apply** | Acceptance check fails post-write | Execute rollback notes; flag human if rollback incomplete; no further changes that run |

---

## 11. Outputs each run

| Artifact | Path (canonical on desktop) | Audience |
|---|---|---|
| Portfolio redacted findings | `client-operations\state\aeo-daily-runs\YYYY-MM-DD.md` | The CEO, Marketing Chief |
| Per-client change set | `clients\<id>\evidence\aeo-daily\YYYY-MM-DD-changes.md` (+ `.json` optional) | Internal only |
| Snapshots (robots, llms, schema excerpts) | `clients\<id>\evidence\aeo-daily\snapshots\` | Internal; redacted |
| Audit log append | `state\aeo-daily-runs\audit.jsonl` | Internal |
| Box mirror (optional) | `/workspace/seo-aeo-geo/runs/YYYY-MM-DD.md` | Non-canonical scratch |

**Never:** client Slack/email send, public Notion post, or “status update” to the client from this routine.

---

## 12. What NOT to automate

- Blog / social content calendars or bulk article generation  
- Paid media create/edit/pause/budget (separate ads authority)  
- Client messaging, lead replies, review responses  
- Bitwarden unlock, secret rotation, shared-owner password use  
- Canonical queue / CONTROL writes  
- Domain DNS, registrar, or hosting account ownership changes  
- Bulk theme redesigns, checkout/payment changes, PII exports  
- Inventing NAP, awards, ratings, or “11.6M views”-class unverified claims  
- Applying changes across **multiple** clients in one approval  
- Training-data opt-out / legal policy flips without explicit owner policy doc  
- Anything requiring payment, new OAuth app consent, or production deploy pipelines outside the CMS fields named in an approved change

---

## 13. Install recipe for The CEO (later — not executed by this SPEC author)

When Dillon asks to install:

1. Confirm preconditions checklist (§3).
2. Create empty `state\aeo-daily-pin.json` (`clientId: null`) and `state\aeo-daily-runs\`.
3. `update_state` target `routine` with:
   - **name:** `Daily AEO GEO SEO config improve (dry-run)`
   - **schedule:** `0 8 * * 1-5`
   - **prompt:** exact text in §4
4. Leave **disabled** or dry-run-only until first pin + sample approval envelope is rehearsed on one client (recommended rehearsal: `kimberly-james-bridal` public audit only).
5. Do **not** add Slack/webhook listeners until cron digest is trusted for ≥3 quiet weekday runs.
6. Report install confirmation to Dillon; Marketing Chief remains queue authority.

### Suggested `update_state` shape (reference only)

```json
{
  "target": "routine",
  "action": "create",
  "name": "Daily AEO GEO SEO config improve (dry-run)",
  "schedule": "0 8 * * 1-5",
  "prompt": "<paste §4 prompt verbatim>"
}
```

(Use the live routines skill field names at install time; do not freeze alternate schemas here.)

---

## 14. Anti-busywork scoring (use when ranking deltas)

Score each candidate delta 0–5 on:

1. **Citability impact** (answer engines / AI overviews / local pack clarity)  
2. **Evidence strength** (directly observed gap)  
3. **Reversibility**  
4. **Scope smallness** (config vs redesign)  
5. **Acceptance-check clarity**

Skip if total &lt; 12 or if the only “improvement” is synonym rewriting, keyword stuffing, or regenerating identical sitemap bytes.

---

## 15. Rollback note template (attach to every apply-eligible change)

```text
Rollback for <changeId>:
- Pre-image path: clients/<id>/evidence/aeo-daily/snapshots/<file>
- CMS location: <plugin/theme/file/UI path>
- Steps: restore pre-image OR delete added resource
- Verify: re-run acceptance check; expect prior behavior
- Human escalate if: CMS revision history missing or cache not purged after 15m
```

---

## 16. Worked example (dry-run narrative — KJB)

**Client:** `kimberly-james-bridal` · **Domain:** `kimberlyjamesbridal.com`  
**Assume:** Active in registry; website locator present; **pin absent** → proposals only.

1. Public GET: `/`, `/robots.txt`, `/llms.txt`, `/sitemap.xml`, top commercial URLs.  
2. Findings (illustrative classes only): missing llms.txt; thin FAQ extractability; schema type incomplete on contact.  
3. Emit `chg-llms-txt`, `chg-faq-appointments`, `chg-schema-localbusiness` with acceptance checks.  
4. Write evidence under `clients\kimberly-james-bridal\evidence\aeo-daily\`.  
5. Internal digest to The CEO / Marketing Chief.  
6. **No CMS login, no Bitwarden unlock, no apply.**

When Dillon pins KJB and returns an envelope listing exact `changeIds`, a later run may apply only those ids and verify publicly.

---

## 17. Document control

| Item | Value |
|---|---|
| Path (box) | `/workspace/seo-aeo-geo/daily-automation-spec.md` |
| Installer | The CEO |
| Queue writer | Marketing Chief / Codex only |
| Spec type | Routine design — **not** an installed routine |
| Secrets | None contained; locators by reference only |

---

*End of SPEC.*
