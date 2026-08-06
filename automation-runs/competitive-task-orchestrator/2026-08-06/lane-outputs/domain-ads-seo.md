# Domain / Ads / SEO — 2026-08-06

## Site health summary

- Dry-run: 1 pass, 1 fail (fixture), 3 skipped (live sites not checked)
- **Book site risk:** fixture models missing `/api/dossier-leads` — matches Opportunity #1 (dead email capture since ~Jun 2)
- Live check not run — pass `--live` on operator machine for ironicineptocracy.com, themohrmedia.com, immohrtal

## Ads / campaign blockers

| Client | Blocker | Source |
|---|---|---|
| NKCDC | Launch blocked — no landing page | client overview |
| Shadow HVAC | LSA background check reset | overview, last_touched 2026-03-02 |
| Link Eze | Enhanced conversions diagnostics + MFA deadline passed | overview due 2026-04-06 |
| Jeff Hozias | Meta launch pending approved copy | overview |
| Bar Crawl USA | Historical disapproval patterns — guardrail agent still empty | Top 15 Opp #4 |

## SEO ship-ready

- `SEO/AlignHCM/Blogs/` — 10 drafted blogs need polish + publish (Align full-time lane)
- KJB wedding dress timeline page approved 2026-04-13 — publish + verify indexing

## Infrastructure gates (automations.json)

- `netlify_deploy_token`: pending-secret — blocks stage-7 site-factory activate
- `mail_vendor`: pending-decision — blocks outreach QR→mail path
- `landingfolio_token`: pending-secret — optional design reference
- `outreach_send`: hard-blocked

## Thursday note

Today is Thursday — Align HCM blog publish sweep is a competitive sub-task for the full-time lane, not M360 billing.
