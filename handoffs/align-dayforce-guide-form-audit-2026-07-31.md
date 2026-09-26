# Align HCM — Dayforce guide form / in-post CTA audit

Updated: 2026-07-31
Authority: HubSpot portal **242825734** only (Customer Agent and connector untouched). Step #1 of a multi-step claim check: move "Dayforce guide conversions" from page-level to record-level evidence.
Related: [[handoffs/align-reporting-stack-edge-audit-2026-07-30|reporting-stack Edge audit]] · [[01_Clients/Align HCM|Align HCM]]

## Step status

| Step | Scope | Status |
|------|--------|--------|
| #1 | Record-level pull on the two July Dayforce-guide submissions | **Done** (this file) |
| #2 | Live remeasure of `section#blog-conversion-form.contact-form-blog` inside `#hs_cos_wrapper_module_17649746174243` on Workday / Dayforce / ADP pages | **Next — proceed** |
| #4 | Re-derive session-supplied form submission counts properly (do not treat forms-index lifetime totals as confirmation) | Pending after #2 |

## #1 — What the two July submissions actually are

| Fact | Value |
|------|--------|
| Form surface | Non-HubSpot collected form **`#align-guide-form`** |
| Form guid | `99df538c-be01-4581-a151-6bdbb9d6bc3e` |
| Conversion page (both) | `https://www.alignhcm.com/blog/dayforce-guide-for-strategic-buyers` ("The Strategic Buyer's Guide to Dayforce \| Align HCM") |
| Submission timestamp (both) | **07/22/2026 2:45 AM EDT** — identical |
| Contact records | **One** contact: id **523416315599** |
| Submission rows | Two rows on that one record; differ only by email alias |
| Net | **2 submissions / 1 record / 1 form / 1 timestamp** — not two independent people |

## Record-level properties on 523416315599

**Align attribution group — all blank.** Including:

- `align_conversion_page`, `align_cta_placement`
- `align_conversion_content_slug`, `align_conversion_content_topic`, `align_conversion_offer`, `align_conversion_type`
- `align_first_touch_channel`, `align_requested_URL`
- every first/last landing-page and UTM field
- all **34** properties in the Align attribution group

**HubSpot-native — populated (this is where Dayforce credit lives):**

- First conversion / Recent conversion: `The Strategic Buyer's Guide to Dayforce | Align HCM: #align-guide-form`
- First / Recent conversion date: 07/22/2026 2:45 AM EDT
- Number of form submissions = 2
- Number of unique forms submitted = 1
- First page seen = the Dayforce guide URL

## Why align_* is null — schema gap, not data loss

`#align-guide-form` captures **Email only**. No hidden `align_*` inputs on that surface → nothing was ever written. Instrumentation gap on the guide-form surface, not lost values.

## Portal-wide bound on align_* fill

| Signal | Evidence |
|--------|----------|
| `align_conversion_page` known contacts | **12** portal-wide; **none** on a Dayforce page |
| Of those 12 with `align_cta_placement = blog_end_form` | Exactly **two**: `blog/hris-hcm-implementation-checklist` (created Jul 22, 2026 2:20 PM EDT) and `blog/the-strategic-buyers-guide-to-workday` (created Jul 30, 2026 4:17 PM EDT) |
| Other ten | `site_form` on `/contact` or `/services/*` |

Conclusion: `align_*` / `blog_end_form` instrumentation **does** fire on some blog_end_form surfaces — just never on the Dayforce guide.

## Claim check — page-level → record-level

| Claim angle | Verdict |
|-------------|---------|
| Corroborate/refute "in-post form was hidden" via `align_cta_placement` | **Cannot** — field null on the only record involved |
| What record-level evidence does say | Both subs came from **`#align-guide-form`**, a different surface from the in-post `#blog-conversion-form` module |
| Consistency with "in-post hidden" | Consistent, **not proof** — no submission was attributed to the in-post module on that page either way |
| Sample size | n=1 record at one timestamp → discrepancy unresolved at record level |

## Reconciliation note (for #4 — do not treat as confirmation yet)

Forms index lifetime totals observed:

- `#acta-form` = **24** lifetime submissions
- `#align-guide-form` = **2**

These look like two session-supplied numbers; re-derive properly in #4 rather than confirm from the index alone.

## #2 brief (authorized next)

Live remeasure on production (read-only DOM/CSS/visibility — no form submits, no CRM edits):

1. Open Workday, Dayforce, and ADP strategic-buyer / guide blog pages.
2. Locate `section#blog-conversion-form.contact-form-blog` inside `#hs_cos_wrapper_module_17649746174243`.
3. Record for each page: present/absent in DOM, computed visibility (`display` / `visibility` / `opacity` / dimensions / off-screen), whether `#align-guide-form` is also present, and any CSS/module flags that hide the in-post block.
4. Do not submit the forms. Do not edit HubSpot. Leave Customer Agent and the Claude connector untouched.
5. Paste findings back for vault write-up before #4.
