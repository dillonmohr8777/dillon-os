# RECOVERY + FINISH GO — Workday CSS restore then continuous finish

Paste everything between BEGIN_RECOVERY and END_RECOVERY to Align-machine Claude.

```
BEGIN_RECOVERY
```

Acknowledged. You flagged a live-site break correctly. Do not bury it. Execute this recovery, then finish the rest in one continuous pass. Do not stop for more approvals unless a hard boundary fires.

============================================================
HARD BOUNDARIES
============================================================

STOP only if: wrong portal (not 242825734); MFA/payment needed; Head HTML paste fails after one retry; you are about to open **Edit source code** on any guide post body again.

Forbidden forever for this job:
- Opening post body **Edit source code** / rich-text source modal on Workday, Dayforce, ADP, UKG, Paylocity, HiBob
- Editing UKG / Paylocity / HiBob
- Enabling website chat / Customer Agent public launch
- Creating HubSpot private-app tokens (still Dillon)
- Mass email / SMS

============================================================
WHAT HAPPENED (CONFIRMED)
============================================================

Workday post body source modal stripped the ~6,575-char `<style>` block (hide rules + all `.abg-*` layout CSS). Cancel did not undo the dirty rich-text state; Update published it.

Live today:
- Form visible via your Head HTML override (keep that intent)
- `.abg-*` markup still in the body HTML (good — structure intact)
- `.abg-*` CSS missing → unstyled layout + visible hero/meta/timestamp

Dayforce + ADP untouched (still hidden forms). Good stop.

============================================================
CSS RECOVERY SOURCE (YOU DO NOT NEED REVISION HISTORY)
============================================================

HubSpot blog revision UI is often hard to find / inconsistently exposed. You do **not** need it for Workday.

Donor found live: **ADP guide** still has the full `.abg-*` style block at **exactly 6,575 characters** — same size you lost. Same class system (`abg-*`), content-id scoped.

- ADP content id: **277255702263**
- Workday content id: **277308102345**
- Dayforce content id: **277284677368**

Canonical restore snippet is on dillon-os PR #236:
`handoffs/align-workday-guide-head-html-restore-2026-07-30.html`

It is the ADP CSS with content-id swapped to Workday, `.contact-form-blog` removed from the hide list, plus:
`.hs-content-id-277308102345 .contact-form-blog{display:block !important;}`

If that file is not on the machine, rebuild it yourself:
1. Open live ADP guide HTML
2. Copy the post-body `<style>` that contains `.abg-` rules
3. Replace every `277255702263` with `277308102345`
4. Remove `.contact-form-blog` from the `display:none` selector list (keep #blog-hero, .blog-post__meta, .blog-post__timestamp, .time-right, #hs_cos_wrapper_module_17649746174243, .cta-bg-image hidden)
5. Append the display:block !important rule for `.contact-form-blog`
6. Paste into Workday **Settings / Head HTML** only — replace your current short override with this full block

Optional revision-history hunt (do not block on this): in the blog editor look for a clock / Versions control, or post **View details** / Actions for version history. If you find a pre-break version, capture it as backup evidence only — still prefer Head HTML restore so body source is never opened again.

============================================================
STEP 0 — RESTORE WORKDAY (DO FIRST)
============================================================

1. Open Workday post **277308102345** settings → **Head HTML** (not body source).
2. Replace the current short override with the full restore snippet from `align-workday-guide-head-html-restore-2026-07-30.html`.
3. Update/publish.
4. Hard-refresh live URL `www.alignhcm.com/blog/the-strategic-buyers-guide-to-workday` and verify:
   - Custom `.abg-*` layout styled again
   - Default blog hero / post meta / timestamp hidden again
   - `#blog-conversion-form` visible
   - “Talk to an HCM expert” (or primary CTA) scrolls to the form
   - One real test submission lands in HubSpot (aggregate id only)
5. Confirm Head HTML still contains marker comment `align-guide-form-fix`.

If anything still looks ADP-wrong (unlikely — shared abg template), report the visual delta but do not open body source.

============================================================
STEP B2 — DAYFORCE + ADP VIA HEAD HTML ONLY (APPROVED METHOD CHANGE)
============================================================

Confirmed: **Head HTML only** for Dayforce and ADP. Never open their body source modal.

Dayforce (277284677368) — paste into Head HTML:
```html
<!-- align-guide-form-fix 2026-07-30: Dayforce — Head HTML only. Do not open Edit source code on post body. -->
<style>
.hs-content-id-277284677368 .contact-form-blog{display:block !important;}
</style>
```

ADP (277255702263) — paste into Head HTML:
```html
<!-- align-guide-form-fix 2026-07-30: ADP — Head HTML only. Do not open Edit source code on post body. -->
<style>
.hs-content-id-277255702263 .contact-form-blog{display:block !important;}
</style>
```

(Also on PR #236 as `align-dayforce-guide-head-html-unhide-2026-07-30.html` and `align-adp-guide-head-html-unhide-2026-07-30.html`.)

For each: publish → verify form visible → anchor scroll → one test submission → next. Leave UKG/Paylocity/HiBob alone.

============================================================
THEN CONTINUE WITHOUT STOPPING
============================================================

After Workday restore + Dayforce + ADP Head HTML unhides are verified:

### Step C — Reauth
Click all-or-nothing reauth on Align HubSpot connector for Claude app id **16228553**. Eyes open on the 17-scope bundle. Do not exercise CPQ/payments/conversations/Partner Client writes.

### Step D — SKIP
No private-app token creation. Leave for Dillon. Reiterate scope strings in the report.

### Step E — Fold into attribution-handoff PR #11
Corrected premise only:
- Module is `#blog-conversion-form` / `.contact-form-blog`
- Fix method is **Head HTML display:block override** (body source edits are unsafe — HubSpot strips `<style>`)
- Workday required CSS restore from ADP donor into Head HTML after accidental strip
- UKG/Paylocity/HiBob = controls
- Open question #1 = does Head HTML unhide recover conversions on Workday/Dayforce/ADP?
- Content analytics already works; Search Console is the search gap
- HTML report stays positive aggregate
- No em dashes; JSON/PII/build gates

### Step F — Never-contacted CRM
Saved view + oldest 5 internal notes/tasks. No assignee override fights — leave owner as HubSpot default owner on the contact. No mass email.

============================================================
COMPLETION REPORT (ONCE AT END)
============================================================

## Incident
- Workday CSS strip acknowledged:
- Restore method used (Head HTML from ADP donor):
- Live visual verify (layout / chrome hidden / form / anchor / test sub):

## Step B2
- Dayforce Head HTML unhide + verify:
- ADP Head HTML unhide + verify:
- Body source modal opened on any guide? (must be no):

## Step C / D / E / F
- Same fields as prior autonomous report format

## Hard stops
- None or exact boundary:

Start with Workday Head HTML restore now. Do not reply with a plan. Execute through the completion report.

```
END_RECOVERY
```
