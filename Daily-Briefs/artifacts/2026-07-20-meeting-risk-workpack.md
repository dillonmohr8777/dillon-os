---
date: 2026-07-20
status: internal-prep
external_actions: approval-required
---

# July 20 Meeting and Risk Workpack

## Calendar collision requiring decision
Two meetings occupy the same hour, **11:00 AM–12:00 PM EDT**:
- [Bridge — Call with Tori](https://www.google.com/calendar/event?eid=NmZnYzVqNzlxZzR0dGZvOXRlcGRoM2QxbmsgZGlsbG9ubW9ocjg3NzdAbQ)
- [Fresh Blends/AI Automations Sync & Codex Build-Out](https://www.google.com/calendar/event?eid=N2dvbjgxbTlya2g2bjVnbmNlbDc4YWoxZjEgZGlsbG9ubW9ocjg3NzdAbQ)

Later commitments:
- 12:30–1:00 PM — Weekly KPI Sync — Fresh Blends / Replenish
- 1:00–1:45 PM — ALL HANDS Momentum Meeting
- 3:00–3:30 PM — AI Review

### Recommended resolution (approval required)
Keep the Bridge/Tori client call at 11:00 AM because it has a prepared decision agenda and NDA-bound product discovery. Ask Ruben to move the Fresh Blends automation sync to **2:00–3:00 PM EDT**, leaving the 12:30 KPI sync intact.

Exact message draft — do not send:
> Hey Ruben — I’m double-booked at 11:00 tomorrow with a client product-discovery call. Can we move the Fresh Blends/AI Automations Sync & Codex Build-Out to 2:00–3:00 PM EDT? I can still keep the 12:30 Fresh Blends/Replenish KPI sync. I’ll come prepared to validate the Ruben-OS setup and separate the 17-store transition work from Replenish reporting.

## Bridge/Tori call — 11:00 AM

### Outcome
Convert the verified discovery prototype into implementation-ready decisions without presenting provisional branding as approved.

### Five-minute narrative
1. The problem: fragmented, low-trust cannabis B2B discovery.
2. The users: brands, dispensaries/retailers, sales reps, and admins.
3. The loop: discover → verify → request contact → accept/decline → manage relationship.
4. The trust layer: role-appropriate evidence, review ownership, expiry, and disputes.
5. The decision needed: roles, fields, filters, MVP boundary, brand direction, and owners.

### Demo sequence
`/directions` → `/` → `/directory` → `/profile/cascade-canna` → `/dashboard` → `/admin/verification`.

### Must-leave-with decisions
- Preferred visual attributes/direction and whether private assets replace the provisional kit
- First priority user and first successful connection scenario
- Final role model, including retailer vs dispensary
- Verification meaning, evidence, reviewer, expiry, and dispute handling
- Public/member/private fields and top five directory filters
- Phase 1 in/out boundary, change-request owner, assets, and next review date

### Guardrails
- Prototype data are fictional; there is no production backend, auth, persistence, outbound email, or real license verification.
- Do not promise automated legal/license verification.
- Record every decision as approved, preferred pending revision, rejected, or open.

## Fresh Blends / Replenish KPI — 12:30 PM

### Separation rule
Fresh Blends remains paused/excluded in the canonical client roster. Replenish is the active 7-Eleven PMax/reporting lane. A calendar invitation does not merge the clients or reactivate Fresh Blends.

### Verified Replenish live signals
- GA4 `getreplenish.com`:
  - Jul 18: 265 sessions, 244 active users, 1,252 events, 0 reported conversions
  - Jul 19 through ~3:20 PM EDT: 115 sessions, 107 active users, 544 events, 0 reported conversions
- Gmail received a Jul 19 Netlify direction-action record for **7-Eleven Miami 56** (`hero_get_directions_click`, 10721 SW 56th St, Miami).

### Questions for the KPI sync
1. Is `hero_get_directions_click` intentionally excluded from GA4 conversions, or is conversion configuration incomplete?
2. Does the Netlify direction record reconcile to the Miami 56 store dashboard and correct UTM/location slug?
3. Which 7-Eleven stores are live, paused, or awaiting launch?
4. Is Replenish locked as the recurring fifth blue-dashboard account?
5. Are any Fresh Blends metrics entering Replenish reports? If yes, separate them before delivery.
6. Who owns weekly store-level lead/direction validation?

No budget, campaign, conversion, location, or account change is authorized.

## Cross-account risks

### Align HCM repository contamination
Live GitHub evidence shows draft PR [#8](https://github.com/dillonmohr8777/align-hcm-august-2026-content/pull/8), **Build Coinbase derivatives paper platform**, is open in `align-hcm-august-2026-content`. It contains 1,268 additions across paper-trading, Coinbase, whale-radar, CI, and Netlify dashboard files. This is unrelated to Align HCM and must not be merged into the client/employment content repository.

Recommended gated action:
1. Create a dedicated private repository for the Coinbase paper platform.
2. Preserve the branch/commit history there.
3. Verify tests and Netlify binding from the dedicated repository.
4. Close PR #8 only after migration read-back.

### Netlify capacity
Unread Gmail reports **83% of the 3,000-credit allowance** used for the Jul 7–Aug 6 cycle. The recent Coinbase dashboard deployment adds a live function and 60-second browser refresh. Do not purchase credits, upgrade a plan, disable a production site, or alter a paid account without approval.

Recommended gated action:
- Audit build minutes/function usage/site ownership; pause or reduce only non-client, non-production workloads after Dillon chooses the scope.

### Security notifications
- OpenAI reported a new ChatGPT Web sign-in at 3:06 PM EDT from approximately Washington, US.
- PayPal reported the current Chrome device can stay logged in as trusted.

No account/session change was made. Dillon should confirm whether both were expected.
