---
tags: [sop, momentum360, reporting, dashboard, am-rollout]
category: Admin / Operations
last_updated: 2026-07-09
owner: Dillon
---

# M360 Reporting Dashboard SOP

## Purpose
• Give every account manager one repeatable way to run the Momentum 360 client reporting dashboard, the one with the client review workflow (Approve, Request Edits, comments, reviewer invite).
• This is the answer to Melissa's ask: a repeatable guide so AMs can spin these up and roll them out to clients with a reviewer login.

## Where it lives
• The editable, self-contained rebuild is in `_os/reporting/dashboard/`. Full instructions are in that folder's `README.md`.
• The live version is a Netlify site. The dashboard builds to one self-contained file (`dist/index.html`) that deploys to Netlify as-is.

## When to Use
• A client is ready to review monthly work inside the dashboard instead of over email or on a call.
• A new AM is standing up reporting for their clients.
• You need to update the numbers, add a client, or invite a reviewer.

## Steps
1. **Edit the data.** Open `_os/reporting/dashboard/clients.json`. Change the numbers, wins, next moves, and the review fields for the client. Set `reviewContactEmail` to invite the reviewer (for example Dr. Kelly).
2. **Add a client if needed.** Copy an existing client record, give it a new slug, drop the logo in `assets/`, and point `logoFile` at it.
3. **Build.** Run `node _os/reporting/dashboard/build.js`. That writes `dist/index.html`.
4. **Preview.** Open `dist/index.html` in a browser. Check the client switcher, KPIs, chart, and the review panel.
5. **Deploy.** Push `dist/index.html` to Netlify (drag-and-drop the `dist` folder, or `netlify deploy --prod --dir=dist`).
6. **Log it.** Append a `## Dashboard` line to the client's note under `01_Clients/`: date, dashboard URL, reviewer, and which sources are still pending.

## The review workflow
• Reviewer name and email invite the reviewer.
• Each review document takes a pasted Google Doc or asset link.
• Approve / Request Edits set the status. The sidebar dot reflects it (amber ready, green approved, rose edits requested).
• Send review to team opens a prefilled email so the decision and comments reach the team.

## Tools Required
• The dashboard project: `_os/reporting/dashboard/` (clients.json, build.js, assets, dist).
• Node to run the build. A browser to preview. Netlify to host.

## Notes / Edge Cases
• **No backend in this version.** Review actions save in the reviewer's browser and reach the team through the Send-review email, not automatic sync. True cross-device logins need a backend (for example Supabase). The code is structured so that's a later swap, not a rebuild. See the folder README.
• **Source pending is honest.** Feeds that aren't connected (calls on most clients) show "source pending" rather than a fake number. Don't flip a block to live until production data exists.
• **Never invent metrics.** Numbers come from the verified pull.
• **Branding.** Momentum 360 clients render under Momentum 360. Align HCM is not a Momentum 360 client and never carries Momentum 360 branding.
• **CC discipline carries over.** Any email pointing a client at their dashboard follows that client's CC rules (for KJB: Mac, Sean, Melissa on every send).
