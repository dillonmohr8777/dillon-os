# FINISH E+F GO — attribution fold-in + never-contacted CRM

Paste between BEGIN_EF and END_EF. Step B is done. Step C is Dillon’s (Claude OAuth reconnect). Do not redo guide CSS. Run E then F continuously.

```
BEGIN_EF
```

Step B is complete and verified. Do not reopen any guide post body source. Do not touch Workday/Dayforce/ADP Head HTML unless a live regression appears.

Your only job now: **Step E then Step F**, continuous, one completion report at the end.

============================================================
HARD BOUNDARIES
============================================================

STOP only if: wrong portal (not 242825734); MFA/payment needed; git push to PR #11 fails after one retry with a real auth/permission error.

Forbidden:
- Edit source code on any blog post body
- Enable website chat / Customer Agent public launch
- Create/handle HubSpot private-app tokens
- Attempt Step C reauth from HubSpot UI (impossible — Dillon reconnects from Claude connector)
- Mass email / SMS
- Fake test form submissions into the July cohort
- Merge PRs (push to draft PR #11 branch is OK)

============================================================
CANONICAL PREMISE (USE THIS IN THE FOLD-IN)
============================================================

Guides are blog posts. Conversion module:

`section#blog-conversion-form.contact-form-blog`

The form also sits inside `#hs_cos_wrapper_module_17649746174243`. Both were hidden on custom-layout posts. **Unhiding only `.contact-form-blog` is insufficient.**

Live fix applied (Head HTML only, never body source — HubSpot strips `<style>` from body Edit source):

```css
.hs-content-id-<id> .contact-form-blog{display:block !important;}
.hs-content-id-<id> #hs_cos_wrapper_module_17649746174243{display:block !important;}
```

Treatment (fixed):
- Workday `277308102345` — full `.abg-*` CSS restored into Head HTML from ADP donor (byte-identical structure; 6,575-char block; content-id swapped; form + wrapper forced visible). Layout verified live.
- Dayforce `277284677368` — Head HTML dual unhide only
- ADP `277255702263` — Head HTML dual unhide only

Controls (untouched):
- UKG, Paylocity, HiBob — forms already visible

Do not invent `#align-guide-form`. Do not describe Dayforce as the reference pattern.

Test submissions: not required from you. Note in fold-in that human/rep should click “Talk to an HCM expert” once on each treatment page and submit one controlled test each if Dillon wants conversion proof in CRM (custom scroll container may hide `window.scrollY`).

============================================================
STEP E — FOLD INTO attribution-handoff PR #11
============================================================

Repo: `dillonmohr8777/align-hcm-august-2026-content`  
Branch: `claude/site-health-dashboard-design-7x2z1z`  
Draft PR: #11  

Stay inside `attribution-handoff/` (+ report file if already there). Full rewrite of false premises — do not leave half-updated docs.

Must include:

1. **Access correction** — HubSpot content analytics already works (July: 2,031 views · 38 submissions · 24 contacts · 84.2% bounce · 106s avg). Search gap = Search Console, not HubSpot traffic.

2. **Findings** — guide conversion suppressed by post-body CSS hide list; Head HTML dual unhide is the fix; Workday CSS incident + ADP-donor Head HTML restore; Workday 103 views / ~336s / 0 subs as primary success case; `/contact` 12/30; meeting links 15/38.

3. **Open question #1** (above latency):

**Q: Does Head HTML unhiding of `.contact-form-blog` and `#hs_cos_wrapper_module_17649746174243` on Workday, Dayforce, and ADP recover conversions vs UKG/Paylocity/HiBob controls?**

Method / definition of done: 14-day post-fix metrics vs July baseline; Workday primary; human CTA click + optional controlled test sub; decision on default Head HTML pattern for custom-layout guides.

Latency = open question #2.

4. **Methodology / access**
   - Body Edit source strips `<style>` — never use it for guide CSS
   - Head HTML is the safe path
   - Dual selector requirement documented
   - Claude connector 16228553 reauth is OAuth from the AI tool side (“Reconnect the app from the AI tool…”) — not a HubSpot button
   - Codex needs its own legacy private app; scope strings: `crm.objects.contacts.read`, `crm.objects.companies.read`, `crm.objects.deals.read`, `crm.objects.owners.read`, `crm.objects.leads.read`, `business-intelligence`, optionally `marketing.campaigns.read`, `cms.performance.read`; `content` / `marketing-email` are combined legacy scopes; do not reuse Claude Optimizer
   - Campaigns without spend → defer ROAS / closed-won-only attribution chasing

5. **HTML report** — positive aggregate only (2,031 / 38 / 24; guides earning dwell; conversion path standardized). No CSS autopsy in client HTML.

6. **Update `04-codex-kickoff-prompt.md`** to this premise.

7. **Optional PII-safe JSON** addendum for July content analytics + per-guide visibility/fix state.

8. **Gates** — JSON parses; PII sweep clean; no em dashes; build failure gates pass.

Commit message:
```
Correct guide conversion premise in attribution handoff

Head HTML dual unhide of form + module wrapper is the fix;
document Workday CSS restore and rank that above latency.
```

Push and update PR #11 body. Then immediately run Step F.

============================================================
STEP F — NEVER-CONTACTED CRM
============================================================

1. Saved view name: `July 2026 Organic AI Social Never Contacted`
   - Channel: organic / AI / social (prefer `align_*` if present)
   - No email/call/meeting after create
   - July / capture-from-Jul-17 cohort
   - Sort oldest first
   - Finish the filter set before saving — no half-filtered views left behind

2. Oldest **5** contacts only:
   - Internal CRM **note** (not email)
   - Owner **task**, due today or next business morning
   - **No assignee override** — leave HubSpot default contact owner
   - Counts only in chat (no PII)

Note body:
```
Internal CRM note only. Do not send as email.

Why this contact is flagged:
- July 2026 attribution review put organic / AI / social inbound in the latency test (second priority after guide-form Head HTML unhide).
- 13 of 29 contacts in that channel group had no logged sales contact after create.
- The two closed deals in the review set closed in 28 and 47 days.

Suggested first touch (owner picks channel):
1. Same-day reply acknowledging the form/source page they used.
2. One clear next step (15-min fit call or reply with company size / payroll headcount).
3. If no reply in 2 business days, one short bump, then park.

Log the first touch on this timeline so we can measure create → first engagement hours against conversion.
Do not change lifecycle stage from this note alone.
```

Task:
```
First touch — July attribution latency test

Contact has no logged sales activity after create and sits in the organic/AI/social cohort. Make one real first touch today, log it on the timeline, and note hours since create.
```

No mass email.

============================================================
COMPLETION REPORT
============================================================

## Portal
- Verified:

## Step E
- Files changed:
- Dual-selector + Head HTML method documented (yes/no):
- Open question #1 corrected (yes/no):
- HTML report positive aggregate (yes/no):
- Gates:
- PR #11 updated/pushed:

## Step F
- Saved view + count:
- Notes (count):
- Tasks (count):
- Assignees left default (yes/no):

## Still Dillon
- Step C Claude OAuth reconnect:
- Step D private app token:
- Manual CTA click + optional test subs on 3 guides:

## Hard stops
- None or exact:

Start with Step E now. Do not ask. Do not redo Step B. Do not attempt Step C from HubSpot.

```
END_EF
```

---

## Operator notes (Dillon — not for Claude)

### Step C — you must do this
HubSpot label on connector **16228553** is not clickable. Reconnect from **Claude → connector / HubSpot settings** (OAuth grant). That unlocks leads read, marketing-email, campaign write, marketing events, etc. (all-or-nothing ~17 scopes).

### Manual QA (2 minutes)
On Workday, Dayforce, ADP: click “Talk to an HCM expert” once each. Optional: one controlled test submission per page if you want CRM proof (Claude correctly avoided polluting the July cohort).

### Step D — still yours
Legacy private app with the scope list above; DPAPI/`ALIGN_HUBSPOT_PRIVATE_APP_TOKEN`; do not reuse Claude Optimizer.
