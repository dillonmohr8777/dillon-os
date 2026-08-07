# Competitive task — 2026-08-07

> Run 2 · umbrella orchestrator · vault-fallback (Gmail + Slack MCP unavailable)
> Lane evidence: `automation-runs/competitive-task-orchestrator/2026-08-07/`

## Scoreboard

- **Clients:** 12 / 100 (ROAD TO 100 CLIENTS)
- **Mohr Media revenue:** fragmented — no live weekly scorecard; ~$2,750/mo named M360 retainers in vault
- **Book subs:** 0 baseline — capture form still broken (`/api/dossier-leads`, site-health FAIL)

---

## P0 — do first

1. **NKCDC launch** — ads built/approved; blocked on client's Free Tax Prep page; Anthony silent 114d+. Draft nudge to Anthony (+ Mac cc). *vault-pulse, gmail-intel*
2. **Replenish billing block** — Google Ads cannot serve until Mia completes payment screen (8d since vault note). Confirm correct account + campaigns delivering. *domain-ads-seo, gmail-intel, vault-pulse*
3. **Hardwood billing** — Sean's card-update push to Dalton outstanding 122d; `status: at_risk`. Confirm with Sean whether to chase again. *vault-pulse, gmail-intel*
4. **Jason/Sean bot + case-status alerts** — 8d unanswered; map bot owner, reproduce alert path, draft bounded ETA. *slack-intel*
5. **Link Eze diagnostics** — enhanced conversions warning + MFA overdue since 2026-04-06. Resolve diagnostics on customer ID …6448. *vault-pulse, domain-ads-seo*

---

## Boss / client asks (unanswered)

| Who | Ask | Age | Draft action |
|---|---|---|---|
| Jason + Sean | Bot stability + case reinstated alerts | 8d | Map runtime, reproduce missed alert, reply with ETA |
| Sean Boyle | CallRail activity check | 8d | Pull logs, draft what changed |
| Melissa Silber | Guidelines prompt + Loom + meeting | 8–10d | Verify artifact state, draft status + calendar options |
| Jenny Miller | NeedMomentum brand direction | 8d | Get Mac/Sean sign-off, then draft timeline |
| Andy Zirger (Bar Crawl) | 2 Halloween/Fall ad disapprovals | 114d | Fix copy per brand guidelines, confirm live status |
| Mia Lange (Replenish) | Billing screen confirmation | 8d | Confirm payment cleared + campaigns live |

---

## Client pulse

- **At risk:** NKCDC (launch blocked), Hardwood (billing), Shadow (LSA unverified since Mar), Replenish (billing block)
- **Stalled:** 12/14 overviews frozen Apr 2026 — treat vault ages as minimum until Gmail MCP back
- **Watch:** BigOrange pillar review due **2026-08-10** (72h); Bridge discovery TBD
- **Moving:** none — no real operator touches in vault within 48h

---

## Pipeline & book

- **Site factory:** QA proven; activate blocked on Netlify token + mail vendor decision
- **Book:** fix `/api/dossier-leads` before subscriber growth — Opportunity #1
- **Align (full-time):** missed Thu blog sweep — ship `adp-alternatives-blog.md` today; Friday LinkedIn slot open
- **Content ships today:** Jeff Hozias Meta launch + KJB Timeline publish (both client-approved, 115d overdue)

---

## Deliberately not today

- Mohr Media cold outreach batch — until Mac mail activate path is real
- 76 duplicate orchestrator PR triage — operator task, not daily execution
- Live site-health `--live` pass — operator machine with network approval
- IMMOHRTAL new posts — 4-week calendar exhausted; needs capture batch first

---

## MCP / data gaps

- **Gmail MCP:** unavailable — email intel from Apr 2026 overviews; ages are minimum
- **Slack MCP:** unavailable — mirrors through 2026-07-30 only (4 notes, all `status: new`)
- **Codex Slack connector:** `oauth_refresh_token_rejected` on operator machine
- **Action:** authenticate Gmail + Slack MCP in Cursor; re-run orchestrator for accurate 48h intel
- **Legacy crons:** disable 7 morning automations after this Run 2 verifies (2/2 complete)
