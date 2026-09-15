---
name: franchise-list
description: Pull every location of a named franchise brand in a state, grade each location's site with the radar grader, and package it into a CSV plus a 10-line brief for the approval queue. Use when a boss or client asks for a franchise location list (e.g. "get me a Snap Fitness list for PA").
---

# Franchise List

Turns a one-line ask ("get me every Snap Fitness in Pennsylvania with owner/manager
contact") into an approval-ready CSV and brief, using [[12_Brain/02_Entities/Vibe Prospecting|Vibe Prospecting]]
for the data and the radar grader from `automation/prospect-radar-next20/` for site
quality.

Origin: Jason Fallon (Momentum 360) asked for a Snap Fitness PA list in Slack on
2026-09-01; Dillon delivered a CSV same day. This skill makes that repeatable.

## Input

- Brand name (e.g. `Snap Fitness`)
- State(s) (e.g. `PA`, or `PA,NJ`)
- Optional: contact type needed (default: owner/manager, email or phone)

## Spend gate — read this first

**Default cap: 200 credits or $20, whichever is lower.** Never fetch, enrich, or
export past this without Dillon's explicit go-ahead.

1. Call `show-pricing-plans` once per session if the credit balance isn't known.
2. Call `fetch-entities` (`entity_type: businesses`, brand + state filters) with
   `estimate_cost: true` — this returns the ~10-row sample and the cost estimate
   without spending.
3. **Stop and post to `System/approval-queue.md` if the estimate exceeds the cap.**
   Do not call `export-to-csv` or any enrichment past this point without
   sign-off.
4. If under the cap, proceed.

## Steps

1. **Estimate.** `estimate-cost` on the fetch table. Record cost, credits balance
   before/after, and cost per 100 rows.
2. **Fetch.** `fetch-entities` for the brand's locations in the named state(s),
   `entity_type: businesses`. Add a prospects fetch (owner/manager job titles,
   `has_contact_details: email_or_phone`) if contact is required, referencing the
   businesses table via `businesses_reference_table`.
3. **Match.** `match-business` each location against its Google Business Profile
   to confirm the live listing and correct address/phone.
4. **Grade.** Run the radar grader on each matched location's site URL:
   ```bash
   node automation/prospect-radar-next20/select-ready.js --urls <matched-urls.json>
   ```
   (Swap in whichever entrypoint in `automation/prospect-radar-next20/` takes a
   URL list — see `AUTOMATION.md` in that folder.) This scores site quality the
   same way [[.claude/skills/site-grade|site-grade]] does, so a franchise list
   never gets pitched a rebuild it doesn't need.
5. **Export.** `export-to-csv` to
   `Daily-Briefs/franchise/<brand>-<state>-<date>.csv`. Columns: location name,
   address, phone, owner/manager name + contact, matched GBP link, site URL, site
   grade verdict.
6. **Brief.** Write a 10-line brief at
   `Daily-Briefs/franchise/<brand>-<state>-<date>-brief.md`: what was pulled, row
   count, credits spent, grade distribution (rebuild/polish/ads_seo/nurture),
   top 3 by opportunity score, and the CSV path.
7. **Queue, don't send.** Append the brief + CSV path to
   `System/approval-queue.md`. Nothing goes to Jason, or any requester, until
   Dillon approves it there — this includes Slack replies.

## Rules that matter

- Query by brand + state only. Never put a client's name or the requester's name
  into a Vibe Prospecting query.
- Read-only through step 2's estimate. No `export-to-csv` before the cap check.
- One brand/state pull per run. Multiple states = multiple runs, each estimated
  separately (do not batch estimates to dodge the cap).
- If `match-business` can't confirm a location, keep the row but flag it
  `unmatched` — never invent a GBP link or grade.

## Cost

| Layer | Who runs it | Why |
|---|---|---|
| End-to-end pull, match, grade, export, brief | Sonnet | Needs judgment: cap decisions, match confirmation, brief writing |
| Radar grading only (re-run on existing URLs) | Haiku | Mechanical scoring against a fixed rubric |
| — | Fable | Never touches this skill — spend-gated data pulls stay off the flagship-inference tier |

## Links

- [[12_Brain/02_Entities/Vibe Prospecting|Vibe Prospecting]] — the MCP this skill spends against
- `.claude/skills/site-grade` — the grading rubric this skill reuses
- `automation/prospect-radar-next20/` — the grader implementation
- `System/approval-queue.md` — where every output lands before it reaches a requester
