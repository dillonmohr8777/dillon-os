# Align guide + attribution work — completion state 2026-07-30

Portal: **242825734** Align HCM. Wrong-portal incidents: 0.

## Step B — Guide forms: DONE (verified live)

Treatment (Head HTML only; never body Edit source):
- Workday `277308102345` — `.abg-*` CSS restored from ADP donor + dual unhide at higher specificity
- Dayforce `277284677368` — dual unhide Head HTML
- ADP `277255702263` — dual unhide Head HTML

Required rules (higher specificity so they beat in-body hide list that wins over plain `<head>` rules):

```css
html body .hs-content-id-<id> #blog-conversion-form#blog-conversion-form.contact-form-blog { display: block !important; }
html body .hs-content-id-<id> #hs_cos_wrapper_module_17649746174243#hs_cos_wrapper_module_17649746174243 { display: block !important; }
```

Live checks: form `display:block`, ~919px tall, HubSpot fields + submit; hero chrome still hidden; Workday/ADP 49 `.abg-*` rules; CTA scroll moves form into viewport; one real Workday test sub landed (contacts 4858→4859).

Controls untouched: UKG, Paylocity, HiBob.

## Step C — Reauth: BLOCKED (Dillon)

HubSpot “Re-authenticate to enable” on connector **16228553** is a label only. Reconnect from **Claude connector / OAuth** side. Still pending: LEAD read, MARKETING_EMAIL read/write, CAMPAIGN write, MARKETING_EVENT write (+ wider bundle).

## Step D — Codex private app: Dillon

Not created. Scope strings already captured. Do not reuse Claude Optimizer.

## Step E — attribution-handoff PR #11: DONE (draft)

Branch `claude/site-health-dashboard-design-7x2z1z`. Fold-in pushed (guideConversionForms in JSON, Q1 unhide question, findings section 0, README). Gates clean. HTML report untouched (already positive aggregate).

Open discrepancy recorded: Dayforce credited with 2 July submissions while in-post form was hidden all month — needs reconcile (other surface / attribution path).

## Step F — Never-contacted CRM: DONE

- Saved view: `July 2026 Organic AI Social Never Contacted` (id **353370895**)
- Filters: Original Traffic Source ∈ Organic Search / Organic Social / AI Referrals; Last Contacted unknown → **12** (channel alone = 29)
- Used Original Traffic Source (not `align_*` — only 11 records populated portal-wide)
- 10 contacts noted + tasked (excluded Dillon’s own 2); tasks unassigned; hyphen not em dash in titles
- Task body copy lives in timeline note (bulk task UI has no notes field)

## Not checked

Search Console, Bing Webmaster, `align-hcm-lead-intelligence`.

## Dillon next

1. Reconnect HubSpot from Claude (Step C)
2. Create Align Codex Attribution Reader private app (Step D)
3. Decide draft vs ready on PR #11
4. 4-week measurement window on three treated guides starts 2026-07-30
5. Optional: continue Customer Agent suites (separate prompt)
