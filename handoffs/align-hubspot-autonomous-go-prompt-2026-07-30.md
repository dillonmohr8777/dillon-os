# AUTONOMOUS GO — paste entire block to Align-machine Claude

No more approval gates. Execute B → C → E → F in one continuous pass. Do not stop to ask Dillon unless a hard safety boundary below is hit.

Copy everything between BEGIN_AUTONOMOUS and END_AUTONOMOUS.

```
BEGIN_AUTONOMOUS
```

You already diagnosed Step B correctly and stopped for approval. **Approval is granted for the full remaining job.** Run continuously. Do not pause for confirmations, “say go,” or mid-flight questions. Prefer action + evidence. Only STOP if one of the hard boundaries fires.

============================================================
HARD BOUNDARIES (ONLY reasons to stop)
============================================================

STOP only if:
1. HubSpot session is not portal **242825734** (Align HCM / alignhcm.com), or portal **50612503** appears.
2. A publish/edit UI demands credentials, 2FA Dillon must enter, or payment.
3. The CMS editor refuses to save/publish after one retry, or a change would require editing the global blog template (not the three post-body style blocks).
4. Reauth redirects to the wrong HubSpot account/portal.
5. Any step would require creating, displaying, copying, or storing a HubSpot private-app / API token in chat. (Step D stays Dillon’s — skip it and continue.)

Otherwise: keep going through B, C, E, F, then return the completion report.

Still forbidden throughout:
- Customer Agent / website chat / chatflows
- Mass email, SMS, sequences
- Printing tokens/secrets
- Merging PRs (pushing the existing draft PR #11 branch is OK)
- Using CPQ, payments, conversations writes, Partner Client after reauth
- Inventing Search Console / Bing numbers
- Editing UKG, Paylocity, or HiBob guide posts
- Touching ungated Netlify PDF links in this pass

============================================================
CORRECTED SOURCE OF TRUTH
============================================================

Guides are blog posts. Real conversion module:

`section#blog-conversion-form.contact-form-blog`
Headline: "Turn this insight into an HCM action plan"

No `#align-guide-form` exists. Do not invent one.

Live state you already measured:

| Guide | content id | Form |
|---|---|---|
| Dayforce | 277284677368 | hidden |
| Workday | 277308102345 | hidden |
| ADP | custom layout | hidden |
| UKG | 277308100320 | visible (CONTROL — do not edit) |
| Paylocity | 277308100294 | visible (CONTROL — do not edit) |
| HiBob | — | visible (CONTROL — do not edit) |

Root cause: inline `<style>` in custom-layout post bodies hides `.contact-form-blog`. CTA `href="#blog-conversion-form"` scrolls to a hidden target on Workday / Dayforce / ADP.

Approved fix: remove `.contact-form-blog` (and only the minimum extra selectors if another rule still hides `#blog-conversion-form`) from those three posts’ inline hide lists. Do not copy Dayforce as a pattern. Do not add modules.

============================================================
RUN ORDER — CONTINUOUS
============================================================

### 1) STEP B — Unhide forms (do now, all three)

Order: **Workday → Dayforce → ADP**. One at a time. After each:

1. Edit post body inline `<style>`.
2. Remove `.contact-form-blog` from the hide list (minimal additional selectors only if still hidden).
3. Publish.
4. Verify `#blog-conversion-form` visible.
5. Verify “Talk to an HCM expert” (or equivalent) scrolls to the form.
6. Submit one real test lead; confirm it lands in HubSpot (report aggregate ids only, no PII).
7. Immediately proceed to the next post. Do not ask.

Leave UKG / Paylocity / HiBob untouched. Do not rewrite guide copy. Do not change PDF links this pass.

If one post fails verification, record the blocker, continue to the next treatment post, then continue to Step C anyway.

### 2) STEP C — Reauth (no further ask)

Click the single **Re-authenticate to enable** on Align “HubSpot connector for Claude” (app id **16228553**).

This is all-or-nothing (~17 scopes). Already approved with eyes open, including leads read, marketing-email view/edit (no send/schedule), campaign write, marketing-event write, and the wider bundle (CPQ, conversations, payments, Partner Client, etc.).

After click:
- Confirm LEAD / MARKETING_EMAIL / CAMPAIGN write / MARKETING_EVENT write are no longer `REQUIRES_REAUTHORIZATION`.
- List granted permission names in the final report.
- Do **not** exercise CPQ, payments, conversations writes, or Partner Client.
- Immediately continue to Step E. Do not ask.

### 3) STEP D — SKIP

Do not create a private/legacy app. Do not generate or handle tokens. Note in the report: “Step D left for Dillon; scope strings already captured.” Continue.

Documented scope strings for Dillon (include in report, do not create the app):
`crm.objects.contacts.read`, `crm.objects.companies.read`, `crm.objects.deals.read`, `crm.objects.owners.read`, `crm.objects.leads.read`, `business-intelligence`, optionally `marketing.campaigns.read`, `cms.performance.read`. Caveat: `content` and `marketing-email` are legacy combined scopes with no read-only variant. Do not reuse Claude Optimizer.

### 4) STEP E — Fold into attribution-handoff PR #11 (corrected premise)

Repo confirmed: `dillonmohr8777/align-hcm-august-2026-content`
Branch: `claude/site-health-dashboard-design-7x2z1z`
Draft PR: #11

Stay inside `attribution-handoff/` (and the report file if it already lives there). Push to the existing PR branch. Do not merge.

Must rewrite / replace any false premise:
- DELETE “Dayforce is the reference” / “add `#align-guide-form`”
- WRITE: unhide `#blog-conversion-form` / `.contact-form-blog` on Workday, Dayforce, ADP; UKG/Paylocity/HiBob are controls

Also fold:
- Content analytics already works (July: 2,031 views · 38 submissions · 24 contacts · 84.2% bounce · 106s avg). Search Console is the search gap.
- Open question **#1** (above latency): Does unhiding `#blog-conversion-form` on Workday/Dayforce/ADP recover conversions vs UKG/Paylocity controls? Workday primary success case. Method + definition of done matching the corrected diagnosis (14-day post-fix metrics into `data/` or dated JSON addendum).
- Latency remains open question **#2**.
- Methodology: reauth all-or-nothing note for connector 16228553; Codex needs own legacy app; campaigns without spend → defer ROAS.
- HTML report: positive aggregate only. No CSS autopsy / “converts nobody” in the client HTML.
- Update `04-codex-kickoff-prompt.md` to the corrected premise.
- Optional PII-safe JSON addendum for July content analytics + per-guide visibility state.
- Gates: JSON parses, PII sweep clean, no em dashes, build failure gates pass.

Commit message:
```
Correct guide conversion premise in attribution handoff

Unhide #blog-conversion-form on custom-layout guides is the
fix; Dayforce was not a valid reference. Rank that above latency.
```

Push and update PR #11 body noting the correction. Then immediately continue to Step F. Do not ask.

### 5) STEP F — Never-contacted CRM (do not wait for another go)

Even if one guide post had a verification issue, proceed if at least one treatment post is fixed OR if Step B was fully blocked only by a hard boundary — in the normal case, run F after B.

1. Create saved view: `July 2026 Organic AI Social Never Contacted`
   - organic / AI / social (prefer `align_*` fields if present)
   - no email/call/meeting after create
   - July / capture-from-Jul-17 cohort
   - sort oldest first
2. Oldest **5** contacts: internal CRM **note** (not email) + owner **task** due today/next business morning.
3. Note body:

```
Internal CRM note only. Do not send as email.

Why this contact is flagged:
- July 2026 attribution review put organic / AI / social inbound in the latency test (second priority after guide-form unhide).
- 13 of 29 contacts in that channel group had no logged sales contact after create.
- The two closed deals in the review set closed in 28 and 47 days.

Suggested first touch (owner picks channel):
1. Same-day reply acknowledging the form/source page they used.
2. One clear next step (15-min fit call or reply with company size / payroll headcount).
3. If no reply in 2 business days, one short bump, then park.

Log the first touch on this timeline so we can measure create → first engagement hours against conversion.
Do not change lifecycle stage from this note alone.
```

4. Task:

```
First touch — July attribution latency test

Contact has no logged sales activity after create and sits in the organic/AI/social cohort. Make one real first touch today, log it on the timeline, and note hours since create.
```

5. No mass email. Counts only in chat.

### 6) OPTIONAL IF TIME (do not block the report)

Search Console / Bing / `align-hcm-lead-intelligence`: check only after B/C/E/F. If not done, say “not checked” — do not stall.

============================================================
COMPLETION REPORT (return once at the end)
============================================================

## Portal
- Verified portal id:
- Wrong-portal incidents:

## Step B — Guide forms
- Workday CSS edit + publish + visible + anchor + test submission:
- Dayforce CSS edit + publish + visible + anchor + test submission:
- ADP CSS edit + publish + visible + anchor + test submission:
- Exact selectors removed (per post):
- UKG/Paylocity/HiBob untouched confirm:
- Blockers (if any; work continued anyway):

## Step C — Reauth
- Clicked all-or-nothing reauth (yes/no):
- LEAD read:
- MARKETING_EMAIL read/write:
- CAMPAIGN write:
- MARKETING_EVENT write:
- Full granted permission name list:
- Extra writes not exercised confirm:

## Step D — Codex connection
- Skipped for Dillon (yes):
- Scope strings reiterated:

## Step E — attribution-handoff fold-in
- Repo/branch/PR:
- Files changed:
- False `#align-guide-form` / Dayforce-reference language removed (yes/no):
- Open question #1 is unhide `#blog-conversion-form` (yes/no):
- HTML report kept positive aggregate (yes/no):
- JSON/PII/em-dash/build gates:

## Step F — Never-contacted CRM
- Saved view + count:
- Notes written (count):
- Tasks written (count):

## Still outside HubSpot
- Search Console / Bing / lead-intelligence:

## Hard stops hit
- None, or exact boundary:

Start immediately with Workday. Do not reply with a plan. Do not ask for another go. Execute through the completion report.

```
END_AUTONOMOUS
```
