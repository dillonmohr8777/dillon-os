# Guide form fix — final verified state (2026-07-30)

## Done

Portal 242825734. Treatment guides fixed via **Head HTML only**.

| Guide | content id | Fix |
| --- | --- | --- |
| Workday | 277308102345 | Full `.abg-*` CSS restored in Head HTML from ADP donor + dual unhide |
| Dayforce | 277284677368 | Dual unhide Head HTML |
| ADP | 277255702263 | Dual unhide Head HTML |

Controls untouched: UKG, Paylocity, HiBob.

## Dual selector (required)

```css
.hs-content-id-<id> .contact-form-blog{display:block !important;}
.hs-content-id-<id> #hs_cos_wrapper_module_17649746174243{display:block !important;}
```

Unhiding only `.contact-form-blog` leaves the form invisible inside the hidden module wrapper.

## Method rule

Never use blog post body **Edit source code** for `<style>` — HubSpot strips it (caused the Workday CSS incident). Head HTML only.

## Still open

- Step C: Dillon reconnects Claude HubSpot connector OAuth (not a HubSpot button)
- Step D: Dillon creates Codex legacy private app + token
- Step E/F: run `handoffs/align-attribution-ef-finish-go-prompt-2026-07-30.md`
- Manual: CTA click on three treatment pages; optional controlled test subs
