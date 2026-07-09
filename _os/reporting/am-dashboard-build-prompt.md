# AM Client Review Dashboard — Build Prompt

Paste everything below the line into your AI build tool. Fill in the four
blanks at the top first. This builds the same review dashboard we ran as the
KJB test: a monthly report with a review layer on top (doc link, pending
review, comments, Approve, Request Edits), month selector, source-status, and
a single client login.

See `04_SOPs/AM Client Review Dashboard Rollout SOP.md` for the full rollout steps.

---

Build a client-facing review dashboard as a deployable web app. Keep it simple,
aesthetic, and self-contained. Here are the inputs for this build:

- CLIENT NAME: __________
- BRAND COLORS (hex, or "use Momentum 360 defaults"): __________
- DATA SOURCES — mark each live or pending: __________
- REVIEWER (name + email, the only authorized login to start): __________

Requirements:

1. Report view. Render the client's monthly performance report: 3 to 4 headline
   KPIs with deltas, 1 or 2 weekly charts, a campaign table with status
   (live / watch / blocked / paused), a wins list, an actions list, and a short
   plain-language summary. Pull this from the report data file, one JSON per
   period, matching the shape used by our report factory (kpis, charts,
   campaigns, wins, actions, summary). Never invent numbers.

2. Month selector. Let the reviewer switch between reporting periods. Each
   period loads its own data file.

3. Source-status. Show a per-block status: "live" when the number is confirmed
   from its source, "pending" when the source isn't wired up yet. Render pending
   blocks visibly as pending. Never present a pending number as final. Exclude
   test or routing rows from any count and mark that block pending.

4. Review layer. For each period, show a review state: pending review, approved,
   or edits requested. Give the reviewer:
   • a doc link input to attach the Google Doc or asset under review,
   • a comments section,
   • an Approve button,
   • a Request Edits button.
   Approve and Request Edits both write the new state back with a timestamp and
   the reviewer's name, and update the period's review state.

5. Auth and data. Use Supabase for authentication, review state, and comments.
   Deploy the app to Vercel. Create exactly one authorized login for the
   reviewer above. This is one isolated project for this one client. No other
   email can see the data.

6. Branding. Use the brand colors above. Put all brand tokens in one place
   (a single :root block or theme config) so they're easy to swap. If the
   client is a Momentum 360 client, it renders under Momentum 360. If the client
   is Align HCM, it must never carry Momentum 360 branding.

7. Verification. Before you call it done: confirm the page is live on Vercel,
   the deployed data matches the report, the month selector loads each period,
   Approve and Request Edits both persist and show the timestamp and reviewer,
   and only the authorized reviewer can log in.

Deploy when done and return the live URL, the reviewer login, and a list of any
data sources still marked pending.
