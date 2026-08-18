---
note_type: sop
status: active
created: 2026-08-17
updated: 2026-08-17
owner: Dillon Mohr
area: hubspot
source: "[[12_Brain/raw/2026-08-17 - jason-hubspot-attribution]]"
tags: [sop, hubspot, attribution]
---

# HubSpot Channel Attribution SOP

## Purpose

Split organic GMB landing-page leads from Google PMax leads in Momentum 360 HubSpot, and keep `#360leads` Source filled.

## Live portal checklist (Tier 2)

1. Confirm portal 50612503 in the URL.
2. CRM → Segments → Contacts. Record size and Used In for `GMB_LP_Organic` and `Google P-max Suspensions`.
3. Open each filter. If both match the same landing-page URL and neither excludes Paid Search, that is the overlap.
4. Edit `GMB_LP_Organic`:
   • Original Traffic Source is any of Organic search, Direct traffic, Referrals, Offline, Other campaigns
   • Original Traffic Source is not Paid search
   • `gclid` and `utm_medium` do not contain `cpc`
5. Edit `Google P-max Suspensions`:
   • Original Traffic Source is Paid search
   • Campaign or `utm_campaign` contains the live Alexandra PMax name (confirm in Google Ads, do not reuse a dead Christian list name alone)
6. Confirm the two sizes no longer match. Spot-check five contacts in each.
7. Workflow that posts `#360leads`: Zapier zap `332246329` still maps Source to CallRail `source`. HubSpot workflow `1868243574` copies `hs_analytics_source` into empty `source` five minutes after create. Remap the zap Slack line to Original Traffic Source (`hs_analytics_source`).
8. Duplicates: keep `369135469` (PMax GMB form) and `368432826` (Meta Reviews). Add a Filter on `332246329` so it does not also post those same form creates. Do not pause the campaign-specific zaps.
9. Hidden fields: portal 50612503 now has form-field properties `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term` (`gclid` already existed). Captured CF7 form `f602c45a-f423-4dbd-8578-da2dd61e68fa` is not writable via the private app. Inject URL-query values only (do not copy `_gcl_aw` cookies, or organic revisits stamp paid).

### Zapier (needs Momentum Zapier login)

1. Open https://zapier.com/webintent/edit-zap/332246329
2. Slack step: set `Source =` to HubSpot **Original Traffic Source** (`hs_analytics_source`), not CallRail `Source`.
3. Optional Filter before Slack: skip when the PMax GMB form zap or Meta Reviews zap already covers that create.
4. Leave https://zapier.com/webintent/edit-zap/369135469 and https://zapier.com/webintent/edit-zap/368432826 on. They are the campaign-named posts.

### WordPress CF7 form 804

Add hidden fields (names must match HubSpot internal names):

```
[hidden gclid]
[hidden utm_source]
[hidden utm_medium]
[hidden utm_campaign]
[hidden utm_content]
[hidden utm_term]
```

### GTM `GTM-WHKR99SC`

The live container is Conversion Linker + Google Ads phone/page conversions only. No Custom HTML. Add a Custom HTML tag on All Pages that reads **current URL params** (and sessionStorage), then injects hidden inputs into `form.wpcf7-form`. Do not read the gclid cookie.

```javascript
(function () {
  var keys = ['gclid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  var params = new URLSearchParams(window.location.search);
  keys.forEach(function (key) {
    var value = params.get(key);
    if (value) {
      try { sessionStorage.setItem('m360_' + key, value); } catch (e) {}
    } else {
      try { value = sessionStorage.getItem('m360_' + key); } catch (e) { value = null; }
    }
    if (!value) return;
    document.querySelectorAll('form.wpcf7-form').forEach(function (form) {
      var input = form.querySelector('input[name="' + key + '"]');
      if (!input) {
        input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        form.appendChild(input);
      }
      input.value = value;
    });
  });
})();
```

## CLI

```
node _os/automation/bin/hubspot-attribution-repair.js --dry-run
node _os/automation/bin/hubspot-attribution-repair.js --apply --confirm-apply
node _os/automation/bin/hubspot-attribution-repair.js --workflows --dry-run
node _os/automation/bin/hubspot-attribution-repair.js --workflows --apply --confirm-apply
node _os/automation/bin/hubspot-attribution-repair.js --remaining --dry-run
node _os/automation/bin/hubspot-attribution-repair.js --remaining --apply --confirm-apply
```

`--apply` requires `JASON_HUBSPOT_PRIVATE_APP_TOKEN` or `HUBSPOT_TOKEN`, verifies portal 50612503, and still refuses if the named segments are missing. Live apply 2026-08-17: organic 32→7, PMax 32→23, overlap 19→0. `--workflows --apply --confirm-apply` created Source-copy `1868243574` and organic-notify `1868243571`. `--remaining --apply --confirm-apply` created `utm_*` contact properties; captured CF7 writes stay blocked.
