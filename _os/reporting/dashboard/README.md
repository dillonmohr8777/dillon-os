# Momentum 360 Client Reporting Dashboard

A self-contained dashboard that shows every M360 client's monthly report plus a
client review workflow (Approve / Request Edits / comments / reviewer invite).
Rebuilt from the live Netlify version so it's editable and repeatable.

## What's in here

• `clients.json` — the data for all clients. This is the one file you edit to change numbers, add a client, set the reviewer email, or list review documents.
• `assets/` — client logos (PNG). Drop a new logo here and point a client's `logoFile` at it.
• `app.template.html` — the dashboard UI. You rarely touch this.
• `build.js` — inlines the data and logos into one deployable file.
• `dist/index.html` — the built dashboard. This is what you deploy. It's fully self-contained (data and logos embedded), so it runs from a single file with no server.

## Build

```
node _os/reporting/dashboard/build.js
```

That writes `dist/index.html`. Open it in a browser to preview.

## Deploy to Netlify

The live report is a Netlify site. To update it, deploy the rebuilt `dist/index.html`:

• Drag-and-drop: open your Netlify site, go to Deploys, and drag the `dist` folder onto the deploy area.
• Or Netlify CLI from the `dashboard` folder: `netlify deploy --prod --dir=dist`.

Each client already has its own record in the data, so one build serves all of them through the client switcher in the sidebar. You can still deploy a per-client link if you want by keeping separate Netlify sites.

## What each client record holds

Open `clients.json`. Every client (keyed by slug) has: `clientName`, `reportMonth`, `status`, `executiveSummary`, `primaryGoal`, `kpis`, `channels`, `chartData`, `wins`, `watchouts`, `changesMade`, `nextMoves`, `leadBreakdown` (forms / calls / other), and the review fields below.

## The review workflow (what Melissa asked for)

Each client has a **Client Review** panel at the bottom of its report:

• **Reviewer + reviewer email** — set `reviewContactName` and `reviewContactEmail` in the data, or type them right in the panel. This is how you invite Dr. Kelly (or any reviewer): put her email in.
• **Documents under review** — listed from `reviewDocuments`. The reviewer pastes a Google Doc or asset link next to each one.
• **Comments** — a free-text box for notes and requested edits.
• **Approve / Request Edits** — sets the review status. The colored dot next to each client in the sidebar reflects it (amber = ready, green = approved, rose = edits requested).
• **Send review to team** — opens an email with the decision, comments, and document links prefilled, addressed to the reviewer email. This is how the decision reaches the team.

### One honest limitation

This version has **no backend**, so review actions (decision, comments, doc links) save in the reviewer's own browser and are shared with the team through the **Send review to team** email, not synced automatically. That's the right v1 for a static Netlify file.

If you want true logins where Dr. Kelly signs in from her own device and everyone sees the same live status, that needs a backend (for example Supabase) and a small amount of deploy setup. The code is structured so the browser-storage layer can be swapped for a backend later without rebuilding the UI.

## Adding a new period (month selector)

The period dropdown is in place. Today each client carries one period. To add more, extend that client's record into a per-period shape and list the periods. Ping the note in `renderReport()` (the `periods` array) for where the app reads them.

## Where the numbers come from

Numbers were extracted verbatim from the live Netlify build. Never invent metrics. Anything not wired to a live source is shown as "source pending" (for example calls on most clients) so counts aren't overstated.
