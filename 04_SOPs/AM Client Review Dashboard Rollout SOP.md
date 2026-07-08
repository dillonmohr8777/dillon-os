---
tags: [sop, momentum360, reporting, dashboard, am-rollout]
category: Admin / Operations
last_updated: 2026-07-08
owner: Dillon
---

# AM Client Review Dashboard Rollout SOP

## Purpose
• Give every account manager a repeatable way to spin up a client-facing review dashboard, the same kind we ran as the KJB test with Melissa as the reviewer.
• The dashboard takes a monthly performance report, adds a review layer on top (doc link input, pending-review status, comments, Approve, Request Edits), and lets the client sign off without a call.
• This answers Melissa's ask in the va-claims thread: hand AMs one prompt their AI can build from, plus a short guide, so we're not rebuilding this by hand for each client.

## When to Use
• A client is ready to review monthly work inside a dashboard instead of over email or on a call.
• Leadership wants a new AM standing up their own dashboard with their own client login.
• We're rolling the KJB pattern out past the first test reviewer.

## What the client sees
• The monthly report we already produce, rendered from `_os/reporting/` (KPIs, charts, campaign table, wins, actions, summary).
• A **month selector** so the client can move between reporting periods.
• A **source-status** indicator per data block: `live` when the number is confirmed from the source, `pending` when the source (for example the calls feed) isn't wired up yet. A pending number never shows as if it's final.
• A **doc link input** so the client can drop the Google Doc or asset under review.
• A **review state** on each period: `pending review`, `approved`, or `edits requested`.
• **Comments** plus two actions: **Approve** and **Request Edits**. Both write back with a timestamp and the reviewer's name.

## Steps
1. **Build the report first.** Run `/client-report <Client> <period>` (or `node _os/reporting/build-report.js _os/reporting/data/<slug>-<period>.json`). The dashboard wraps this output, so the report has to be right before the review layer goes on. Keep `sampleData: true` until every figure is confirmed real, and leave anything you can't source as `pending`.
2. **Copy the build prompt.** Open `_os/reporting/am-dashboard-build-prompt.md` and paste the whole thing into the AM's AI build tool. Fill in the four blanks at the top: client name, brand colors, which data sources are live vs pending, and the reviewer's name and email.
3. **Stand up the backend.** The prompt provisions Supabase (auth, review state, comments) and deploys to Vercel, matching the KJB test stack. One project per client keeps logins and data isolated.
4. **Create the client login.** Add the client (or the internal test reviewer) as the only authorized email on that Supabase project. For a first run, use an internal reviewer as the test before the real client login, the way Melissa was the KJB test rather than creating a Dr. Kelly login on day one.
5. **Wire the data.** Point the dashboard at the report data file for each period. Mark any unconnected feed (calls, bridal appointments, or a sheet that only has test/routing rows) as `pending` so counts aren't overstated. Only flip a block to `live` once you've confirmed production rows exist.
6. **Verify before handing off.** Confirm the page is live, the deployed data matches the report, the month selector loads each period, and Approve / Request Edits both write back and show the timestamp and reviewer. Log in as the reviewer to check nobody else can see the project.
7. **Log it.** Append a `## Dashboard` line to the client's note under `01_Clients/`: date, client, dashboard URL, reviewer, and which sources are still pending. Update the client's `next_action` if any source is still open.

## Tools Required
• The vault report factory: `_os/reporting/build-report.js`, `report-template.html`, and the `/client-report` skill.
• The reusable build prompt: `_os/reporting/am-dashboard-build-prompt.md`.
• Supabase (auth plus review state plus comments) and Vercel (hosting), one project per client.
• An AI build tool the AM already uses. The prompt is written to be tool-agnostic.

## Notes / Edge Cases
• **Source pending is a feature, not a bug.** When a feed isn't connected, the dashboard shows `pending` rather than a fake number. That's what kept the KJB calls and bridal-appointment counts honest during the test.
• **Test rows don't count.** When a sheet only has test or routing submissions and no production rows, exclude them from the count and mark the block pending.
• **Reviewer first, client second.** Run the first dashboard with an internal reviewer, confirm the flow, then swap in the real client login. A client login shouldn't exist before the flow is proven.
• **Branding.** Momentum 360 clients render under Momentum 360. Align HCM is not a Momentum 360 client, so an Align HCM dashboard never carries Momentum 360 branding. Swap the `:root` brand tokens per client when they want their own colors.
• **CC discipline carries over.** Any email pointing a client at their dashboard follows that client's CC rules (for KJB: Mac, Sean, Melissa on every send).
• **One project per client.** Sharing a Supabase project across clients isn't allowed. Separate projects keep each login and each client's data isolated.
