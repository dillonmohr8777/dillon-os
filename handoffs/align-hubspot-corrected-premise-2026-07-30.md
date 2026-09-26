# Align HubSpot — corrected conversion premise (2026-07-30)

Supersedes any earlier instruction that Dayforce is the reference pattern or that `#align-guide-form` should be copied onto other guides.

## Verified

- Portal: **242825734** Align HCM / alignhcm.com
- Guides are blog posts
- Real module: `section#blog-conversion-form.contact-form-blog`
- No `#align-guide-form` on the site

## Live form visibility

| Guide | content id | Form visibility |
| --- | --- | --- |
| Dayforce | 277284677368 | hidden (`display: none`) |
| Workday | 277308102345 | hidden |
| ADP | custom layout | hidden |
| UKG | 277308100320 | visible |
| Paylocity | 277308100294 | visible |
| HiBob | — | visible |

## Root cause

Inline `<style>` in custom-layout post bodies hides `.contact-form-blog` (among other chrome). CTA `href="#blog-conversion-form"` scrolls to a hidden target on Workday / Dayforce / ADP.

## Approved fix

Remove `.contact-form-blog` from the inline hide list on Workday, Dayforce, ADP only. Leave UKG / Paylocity / HiBob alone. One post at a time; verify anchor + test submission each.

## Secondary issue (document only for now)

PDF "Download" on broken guides → ungated Netlify asset host → zero contacts.

## Open question #1 (corrected)

Does unhiding `#blog-conversion-form` on Workday / Dayforce / ADP recover conversions vs UKG/Paylocity controls? Workday is the primary success case.

## Reauth

Claude HubSpot connector app id **16228553** reauth is all-or-nothing (17 scopes). Approved to click; do not exercise CPQ/payments/conversations writes.

## Codex app

Dillon creates legacy private app. Exact read-oriented scopes from picker documented in the GO prompt. Do not reuse Claude Optimizer.
