# Align HubSpot CRM — what Claude on this computer should say / do

Updated: 2026-07-30 (rev 2 — content analytics correction)
Portal: **242825734** only (`dillon.mohr@alignhcm.com`)
Audience: Claude Desktop / Claude Code on the Align OneDrive machine with a live HubSpot Chrome session
Source: Codex attribution handoff (draft PR #11 on `align-hcm-august-2026-content`, branch `claude/site-health-dashboard-design-7x2z1z`)

This is **CRM / CMS / private-app** work inside HubSpot. Not Customer Agent.

Do **not** use portal `50612503` (Jason / Momentum).
Do **not** print, commit, Slack, or paste the private-app token into any chat.
Do **not** send mass email from this handoff.

---

## Corrected access picture (read this first)

HubSpot **content analytics already works**. Portal is Pro/Enterprise and `get_content_analytics_report` is granted. July 1–31 aggregate:

| Metric | Value |
| --- | --- |
| Page views | 2,031 |
| Submissions | 38 |
| Contacts | 24 |
| Bounce | 84.2% |
| Avg time on page | 106s |

What was missing earlier was **search data** (impressions, position, query terms). That is **Search Console**, not HubSpot. Narrower gap.

Content analytics already surfaces the week’s highest-value CRM/CMS fix:

| Page | Views | Submissions | Bounce |
| --- | ---: | ---: | ---: |
| Home | 583 | 1 | 79% |
| Careers | 225 | 0 | 91% |
| Buyer’s Guide to Workday | 103 | 0 | 100% |
| Buyer’s Guide to UKG | 53 | 0 | 94% |
| Buyer’s Guide to Paylocity | 32 | 0 | 100% |
| Buyer’s Guide to Dayforce | 17 | 2 | 44% |

Workday guide: ~336s engagement, zero conversions. Dayforce guide: ~1/6 the traffic, only guide that converts — it has `#align-guide-form`. Guides are being read; most lack a working conversion path. Fix that before new content.

Also: `/contact` converts 12 of 30 views. Rep meeting links account for 15 of 38 July submissions.

### Still missing inside HubSpot (reauth — one reconnect)

1. **LEAD object read** — `REQUIRES_REAUTHORIZATION`. Highest priority for a real leads report. Dashboard currently proxies via contact lifecycle stage.
2. **MARKETING_EMAIL read and write** — blocks email as a measurable channel.
3. **CAMPAIGN write** — read works.
4. **MARKETING_EVENT write** — read works.

Skip unless Align is a Solutions Partner managing client portals: **PARTNER_CLIENT read** (plan/account change).

### Not HubSpot

- Search Console — impressions, clicks, CTR, position, authenticated generative export for AI citation counts
- Bing Webmaster Tools — one July organic lead came from Bing

### Campaign attribution note

Five campaigns exist (Corporate LinkedIn, Open Enrollment, UKG Indy User Group, Aspire Cocktail, Q4 Public Sector Nurture). No spend/budget populated → no ROAS. HubSpot attribution reports score closed-won only; with one organic win ever, not worth chasing yet.

---

## Goal (ordered)

1. **This week (CMS):** put the working conversion path (`#align-guide-form` or equivalent) on Workday / UKG / Paylocity buyer’s guides — cheaper and higher leverage than new content or the latency test.
2. **Reauth:** reconnect HubSpot so LEAD + marketing-email (+ campaign/event write if needed) clear `REQUIRES_REAUTHORIZATION`.
3. **Codex connection:** give Codex its **own** HubSpot connection (cannot share Dillon’s). Prefer a private app token.
4. **CRM notes/tasks:** never-contacted organic/AI/social cohort — second priority after guide forms.

---

## 1) Codex private app (preferred over sharing MCP)

Codex needs its own connection. Options:

- Same MCP connector authorized as Dillon’s user — simplest, inherits permissions
- **Private app token — preferred for an automated agent** (explicit, revocable scopes)

Path: HubSpot → Settings → Integrations → Private Apps → Create a private app

### App name

```
Align Codex Attribution Reader
```

### Description (exact paste)

```
Read-only private app for Codex attribution and content-analytics analysis on Align HCM portal 242825734.

Purpose:
- CRM reads for contacts, deals, companies, owners, and (after reauth) Leads
- CMS blog / site / landing page reads
- Analytics / business-intelligence reads (content analytics report)
- Marketing-email reads once that scope is reauthorized

Rules:
- Prefer read-only. No email/SMS send from this token.
- Aggregate and PII-safe reporting by default.
- Token stays on the Align OneDrive Codex machine / secure secret store. Never commit or paste into Slack/chat.
```

### Capabilities to grant (pick exact scope strings from the private-app screen — do not invent names)

- Contacts, deals, companies, owners — read
- CMS blog / site / landing page — read
- Analytics / business intelligence — read (powers content analytics)
- Leads — read (after reauthorization clears)
- Marketing email — read (after reauthorization clears)

Campaign / marketing-event write only if Dillon explicitly asks. Default leave write off.

### After create

1. Confirm portal **242825734**.
2. Store as `ALIGN_HUBSPOT_PRIVATE_APP_TOKEN` (never Jason’s token).
3. Identity-check portal id before bulk pulls.
4. Report back without printing the token.

---

## 2) Reauthorization checklist (Dillon or Claude in HubSpot UI)

Reconnect / reauthorize the Align HubSpot connector or private app so these leave `REQUIRES_REAUTHORIZATION`:

1. LEAD object read (must-have for leads report)
2. MARKETING_EMAIL read (and write only if Dillon wants send measurement setup later — start with read)
3. CAMPAIGN write (optional)
4. MARKETING_EVENT write (optional)

Skip PARTNER_CLIENT unless Solutions Partner client-portal work is real.

---

## 3) This week CMS fix — guide conversion path

Priority above latency notes.

On each of these pages that lack `#align-guide-form` (or the live Dayforce-equivalent form block), add the same conversion block Dayforce uses:

- Buyer’s Guide to Workday (103 views, 0 submissions, 100% bounce, long dwell)
- Buyer’s Guide to UKG (53 / 0 / 94%)
- Buyer’s Guide to Paylocity (32 / 0 / 100%)

Leave Dayforce as the reference implementation (17 views, 2 submissions, 44% bounce).

### CRM / CMS note to leave on the page or related marketing task (exact paste)

```
Guide conversion gap — July content analytics

Workday / UKG / Paylocity buyer’s guides are getting reads without a working form path. Dayforce is the only guide converting and is the one with #align-guide-form.

Action: add the same #align-guide-form (or equivalent) block to Workday, UKG, and Paylocity guides this week. Do not prioritize new guide content until these three convert.

Evidence (Jul 1–31): Workday 103 views / 0 subs / ~336s engagement; Dayforce 17 views / 2 subs.
```

---

## 4) Saved view + never-contacted notes (second priority)

Saved view name:

```
July 2026 Organic AI Social Never Contacted
```

Filters: organic / AI / social channel; no email/call/meeting after create; July cohort dates. Oldest first.

### Contact note body

```
Internal CRM note only. Do not send as email.

Why this contact is flagged:
- July 2026 attribution review put organic / AI / social inbound in the latency test (second priority after guide-form conversion).
- 13 of 29 contacts in that channel group had no logged sales contact after create.
- The two closed deals in the review set closed in 28 and 47 days.

Suggested first touch (owner picks channel):
1. Same-day reply acknowledging the form/source page they used.
2. One clear next step (15-min fit call or reply with company size / payroll headcount).
3. If no reply in 2 business days, one short bump, then park.

Log the first touch on this timeline so we can measure create → first engagement hours against conversion.
Do not change lifecycle stage from this note alone.
```

### Task

```
First touch — July attribution latency test

Contact has no logged sales activity after create and sits in the organic/AI/social cohort. Make one real first touch today, log it on the timeline, and note hours since create.
```

Oldest 5 first. No mass email.

---

## 5) Report back

1. Private app / Codex connection: yes/no, portal verified.
2. Reauth status: LEAD / marketing-email / campaign write / marketing-event write.
3. Guide form work: which pages updated.
4. Never-contacted notes/tasks: count only.
5. Blockers (Search Console / Bing still out of HubSpot scope).

---

## Fold into attribution-handoff (approved)

Yes — fold content-analytics findings into the HTML report (aggregate, still positive) and into the handoff docs. Put the **guide-conversion gap above the latency question** in the ranked open-questions list.

Paste-ready fold-in lives in `handoffs/align-attribution-content-analytics-fold-in-2026-07-30.md` for the agent editing PR #11 / `attribution-handoff/`.
