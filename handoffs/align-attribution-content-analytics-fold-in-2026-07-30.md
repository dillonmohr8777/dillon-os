# Fold-in: July content analytics → attribution-handoff (CORRECTED)

Approved: 2026-07-30
Supersedes the earlier fold-in that treated Dayforce / `#align-guide-form` as the reference pattern.
Target: `attribution-handoff/` on draft PR #11 (`align-hcm-august-2026-content`)

---

## Correction to access narrative

HubSpot content analytics is live (`get_content_analytics_report` granted; portal Pro/Enterprise). July 1–31:

- 2,031 page views
- 38 submissions
- 24 contacts
- 84.2% bounce
- 106s average time on page

Remaining search gap is Search Console, not HubSpot traffic.

---

## Findings snippet (for `01-findings.md`)

### Guide conversion is suppressed by post-body CSS, not missing modules

Guides are blog posts. The conversion module is `section#blog-conversion-form.contact-form-blog` (headline: "Turn this insight into an HCM action plan"), present in the DOM on every guide.

Live visibility:

| Guide | content id | `#blog-conversion-form` |
| --- | --- | --- |
| Dayforce | 277284677368 | hidden |
| Workday | 277308102345 | hidden |
| ADP | custom layout | hidden |
| UKG | 277308100320 | visible |
| Paylocity | 277308100294 | visible |
| HiBob | — | visible |

Custom-layout posts include an inline `<style>` that hides `.contact-form-blog`. Primary CTA "Talk to an HCM expert" uses `href="#blog-conversion-form"` and scrolls to a hidden target on Workday / Dayforce / ADP. That fits Workday's 103 views, ~336s dwell, 0 submissions better than "no form exists."

UKG and Paylocity are the working control group. Dayforce is not a valid reference pattern.

Secondary gap: PDF download CTAs on the broken guides point to ungated `align-hcm-dayforce-buyers-guide-assets.netlify.app`, so downloads create zero contacts.

Also: `/contact` converts 12 of 30 views; rep meeting links account for 15 of 38 July submissions.

---

## HTML report tone (aggregate, positive)

- July site engagement: 2,031 page views, 38 submissions, 24 contacts
- Buyer guides earn meaningful dwell; conversion path on custom-layout guides is being aligned to the working template pattern
- Contact and meeting paths continue to contribute a large share of submissions

Do not put CSS bug details, bounce tables, or "converts nobody" into the HTML report unless Dillon asks for a diagnostic version.

---

## Open question #1 (rank above latency)

**Q: Does unhiding `#blog-conversion-form` on Workday, Dayforce, and ADP recover conversions on guides that already hold attention, matching the UKG/Paylocity control pattern?**

Method:

1. Confirm UKG + Paylocity as working controls (form visible).
2. On Workday, Dayforce, ADP: remove `.contact-form-blog` from the inline hide CSS; republish; verify anchor scroll + one test submission each.
3. Measure 14 days post-fix vs July baseline.
4. Primary success case: Workday.

Definition of done:

- Three treatment posts show visible `#blog-conversion-form`
- Anchor CTA scrolls to the form
- Test submission verified per page
- 14-day metrics in `data/` or dated addendum JSON
- Decision recorded on default visibility for custom-layout guides (and optionally gated PDFs later)

Then keep response-latency vs conversion as open question #2.

---

## Access / methodology addendum

Reauth (Claude HubSpot connector app id 16228553) is all-or-nothing (~17 scopes). Needed: LEAD read, marketing-email view/edit (no send/schedule), campaign write, marketing-event write. Bundle also grants CPQ/payments/conversations/Partner Client — grant if reauthing, do not exercise those writes casually.

Outside HubSpot: Search Console, Bing Webmaster Tools.

Codex needs its own legacy private app (Settings > Integrations > Legacy Apps). Prefer: contacts/companies/deals/owners/leads read, `business-intelligence`, optional `marketing.campaigns.read` / `cms.performance.read`. Note `content` and `marketing-email` are legacy combined scopes with no read-only variant. Do not reuse Claude Optimizer.

Five campaigns exist without spend/budget; HubSpot attribution is closed-won-skewed — defer ROAS chasing.
