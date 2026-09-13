# CORRECTED GO PROMPT — paste to Align-machine Claude

Reply to the agent that stopped after the Step B diagnosis. Paste everything between BEGIN_GO and END_GO.

```
BEGIN_GO
```

Approved. Your Step B diagnosis is correct and supersedes the earlier brief. Proceed.

============================================================
CORRECTED FACTS (SOURCE OF TRUTH FROM NOW ON)
============================================================

Guides are **blog posts**, not standalone website pages.

There is **no** `#align-guide-form` element on the site.

Real conversion module (template-level HubSpot form):
- DOM: `section#blog-conversion-form.contact-form-blog`
- Headline: "Turn this insight into an HCM action plan"
- Present in the DOM on every guide

Live measured state (do not invert this again):

| Guide | content id | `#blog-conversion-form` | Visible form |
|---|---|---|---|
| Dayforce | 277284677368 | display: none | none in body |
| Workday | 277308102345 | display: none | none in body |
| ADP | (custom layout) | display: none | none in body |
| UKG | 277308100320 | display: block | present |
| Paylocity | 277308100294 | display: block | present |
| HiBob | — | display: block | present |

UKG and Paylocity already work. Dayforce is NOT a valid reference — its form is suppressed. Copying Dayforce to others would have destroyed working forms. Good stop.

Root cause: custom-layout guide posts contain an inline `<style>` inside the post body (`hs_cos_wrapper`) that hides hero, post meta, timestamp, and the conversion section. On Workday the hide list includes `.contact-form-blog` (and related selectors). Primary CTA "Talk to an HCM expert" uses `href="#blog-conversion-form"` and scrolls to a hidden target.

Second gap (document, do not fix unless I say so later): "Download the PDF" on the three broken guides points to ungated `align-hcm-dayforce-buyers-guide-assets.netlify.app` — zero contacts from downloads.

============================================================
STEP B — APPROVED FIX (DO THIS)
============================================================

YES. On **Workday, Dayforce, and ADP only**:

1. Edit the blog post body.
2. Find the inline `<style>` hide block.
3. Remove **only** the `.contact-form-blog` selector from that hide list (and any equivalent selector that targets `#blog-conversion-form` / `.contact-form-blog` if duplicated).
4. Leave UKG, Paylocity, and HiBob untouched.
5. Do **one post at a time** in this order: Workday → Dayforce → ADP.
6. After each publish:
   - Confirm `#blog-conversion-form` is `display: block` (or otherwise visible)
   - Confirm "Talk to an HCM expert" (or equivalent) anchor scrolls to the form
   - Submit one real test submission and confirm it lands in HubSpot (note contact/submission id aggregate only — no PII in chat)
7. Do not rewrite guide copy. Do not add new modules. Do not change UKG/Paylocity.
8. Do not touch the ungated Netlify PDF links in this pass unless I explicitly expand scope.

If removing only `.contact-form-blog` still leaves the form hidden because another rule in the same block targets the same section by a different selector, remove the minimum additional selectors needed to unhide the conversion section only — still do not unhide hero/meta/timestamp unless required for the form to render correctly. Prefer minimal change. Report exact before/after CSS.

============================================================
STEP C — REAUTH (APPROVED WITH EYES OPEN)
============================================================

YES — click the single "Re-authenticate to enable" on the Align HubSpot connector for Claude.

I accept this is all-or-nothing and will grant the 17 including leads read, marketing-email view/edit (no send/schedule), campaign write, marketing events write, **and** the wider bundle (CPQ quotes/templates, conversations inbox, commerce payments/links, price books, contracts, Partner Client).

After click:
1. Confirm LEAD read, MARKETING_EMAIL read, CAMPAIGN write, MARKETING_EVENT write are no longer `REQUIRES_REAUTHORIZATION`.
2. List the full granted set in the completion report (names only).
3. Do not use the extra write capabilities (CPQ, payments, conversations writes, Partner Client) in this job. Read/probe only unless a later prompt expands scope.

If the reauth UI asks you to confirm scopes, proceed. If it tries to change portals, STOP.

============================================================
STEP D — CODEX PRIVATE APP (STILL MINE / DILLON)
============================================================

Do not create or handle a HubSpot API token. Leave Step D to me.

You already captured the right picker strings — keep those in the report:
- Preferred read set: `crm.objects.contacts.read`, `crm.objects.companies.read`, `crm.objects.deals.read`, `crm.objects.owners.read`, `crm.objects.leads.read`, `business-intelligence`, optionally `marketing.campaigns.read`, `cms.performance.read`
- Caveat stands: `content` and `marketing-email` are legacy combined scopes with no read-only variant — document that; I will decide whether to include them when I create the app
- Do not reuse Claude Optimizer (too many writes; missing leads/owners/BI/marketing-email)

Private Apps path note for the handoff docs: Settings > Integrations > Legacy Apps > Create legacy app.

============================================================
STEP E — FOLD-IN (NOW UNBLOCKED — USE CORRECTED PREMISE)
============================================================

Proceed on `dillonmohr8777/align-hcm-august-2026-content`, branch `claude/site-health-dashboard-design-7x2z1z`, draft PR #11. Stay inside `attribution-handoff/` (+ report file if it already lives there).

Rewrite the earlier false premise everywhere:

WRONG (delete/replace):
- "Dayforce is the only converting guide because it has `#align-guide-form`"
- "Add `#align-guide-form` to Workday / UKG / Paylocity"
- Any instruction to copy Dayforce as the reference pattern

RIGHT (write this):
- Conversion module is `section#blog-conversion-form.contact-form-blog`
- UKG / Paylocity / HiBob already show it (`display: block`) — control group
- Workday / Dayforce / ADP hide it via inline post-body CSS — treatment group
- Primary CTA anchors to `#blog-conversion-form` while the section is hidden
- Fix = remove `.contact-form-blog` from the inline hide list on the three broken posts
- Secondary issue: ungated Netlify PDF downloads create zero contacts

Open question #1 (rank above latency):

**Q: Does unhiding `#blog-conversion-form` on Workday, Dayforce, and ADP recover conversions on guides that already hold attention, matching the UKG/Paylocity control pattern?**

Method:
1. Confirm UKG + Paylocity as working controls (form visible)
2. On Workday, Dayforce, ADP: remove `.contact-form-blog` from the inline hide CSS; republish; verify anchor scroll + one test submission each
3. Measure 14 days post-fix vs July baseline (views, submissions, submission rate, bounce, avg time)
4. Primary success case: Workday (103 views, ~336s dwell, 0 submissions in July)

Definition of done:
- Three treatment posts show visible `#blog-conversion-form`
- Anchor CTA scrolls to the form
- Test submission verified per page
- 14-day metrics written to `data/` or dated analytics addendum JSON
- Decision recorded: keep template form visible by default on custom-layout guides; optionally gate PDF downloads later

Keep response-latency vs conversion as open question #2.

Also fold in:
- Access correction: HubSpot content analytics already works; Search Console is the search gap
- Reauth list + note that Claude connector reauth is all-or-nothing (17 scopes)
- Codex needs its own private/legacy app; exact scope strings from picker; `content` / `marketing-email` not strictly read-only
- Campaigns exist without spend; defer ROAS / closed-won-only attribution chasing
- HTML report stays positive aggregate (2,031 views / 38 submissions / 24 contacts; guides earning dwell; conversion path being standardized). Do not put the CSS bug autopsy into the HTML report.

Quality gates before push: JSON parses, PII sweep clean, no em dashes, build failure gates pass, only `attribution-handoff/` touched.

Commit message suggestion:
```
Correct guide conversion premise in attribution handoff

Unhide #blog-conversion-form on custom-layout guides is the
fix; Dayforce was not a valid reference. Rank that above latency.
```

============================================================
STEP F — NEVER-CONTACTED CRM (AFTER B, OR IN PARALLEL IF B DONE)
============================================================

Once Workday at minimum is fixed and verified (prefer all three treatment posts), run Step F as originally specified:
- Saved view `July 2026 Organic AI Social Never Contacted`
- Oldest 5: internal CRM notes + owner tasks
- No mass email
- Counts only in chat

============================================================
ORDER FOR THIS PASS
============================================================

1. Step B — Workday, then Dayforce, then ADP (verify each)
2. Step C — click the 17-permission reauth bundle
3. Step E — corrected fold-in to PR #11
4. Step F — never-contacted notes/tasks
5. Completion report in the same format as last time
6. Still skip Step D (token) and do not invent Search Console/Bing numbers

Start with Workday CSS edit now.

```
END_GO
```

---

## Operator notes (not for Claude)

- Corrected Step B is approved: unhide `.contact-form-blog` on Workday / Dayforce / ADP only.
- Reauth bundle approved with eyes open (includes unwanted writes; do not use them).
- Step D (private app token / DPAPI) remains Dillon.
- Updated short docs: see sibling handoff files on PR https://github.com/dillonmohr8777/dillon-os/pull/236
