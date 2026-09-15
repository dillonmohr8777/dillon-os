---
note_type: capture
status: compiled
created: 2026-09-03
updated: 2026-09-09
captured_at: "2026-09-03T00:00:00-04:00"
source_type: Claude local agent session output
source_url: "file:///c/Users/dillo/AppData/Roaming/Claude/local-agent-mode-sessions/b0f0f864-e564-4653-bfde-c2d7e9ebfcef/08988047-1bb6-44cd-91f8-e75a3a573577/local_c7258c58-06ad-4098-8688-76e9a901c928/outputs/slack-client-operating-picture-2026-09-03.md"
source_author: Claude local agent session
verification_status: verified
observed_at: 2026-09-09
tags: [capture, slack, clients, momentum-360, operating-truth]
source_refs:
  - "/c/Users/dillo/AppData/Roaming/Claude/local-agent-mode-sessions/b0f0f864-e564-4653-bfde-c2d7e9ebfcef/08988047-1bb6-44cd-91f8-e75a3a573577/local_c7258c58-06ad-4098-8688-76e9a901c928/outputs/slack-client-operating-picture-2026-09-03.md"
---

# Slack client operating picture

> Filed into the vault 2026-09-09 by the daily orchestrator. The original
> lived only under `AppData/Roaming/Claude/local-agent-mode-sessions/`, an
> application cache with no backup and no version control. Body below is
> verbatim.

---

# Slack Client Operating Picture — Momentum

**Prepared for:** Dillon Mohr
**Sweep date:** 2026-09-03
**Sources:** 34 Slack channels (read-only), `client-operations-canonical` vault (`CONTROL.md` rev 423, reconciled 09/01/2026; `registry/clients.json` generated 2026-08-07)
**Read-only confirmed:** no message posted, no reply, no reaction, no draft, no schedule.

**Evidence standard used throughout.** *Claimed in Slack* means someone wrote it; it is not proof the thing happened. *Verified* means I found the corroborating artifact or a second independent record. *Assumption* is labelled as such. Where a channel is ambiguous I say so rather than picking a status.

---

## 1. ON FIRE

### 1.1 The Bridge/Tori premise you gave me is wrong in three of four parts

You asked me to work against this: *five Bridge routes sent to Tori for sign-off on 17 August, reviews promised on the 18th, 23rd and 1 September, all missed, zero dated client acceptances.* I paged the entire `#bridge-software-development` history (2026-07-08 → 2026-09-03) plus all 11 thread replies. Here is what the channel actually says:

| Element of the claim | Verdict | Evidence |
|---|---|---|
| Five routes sent to Tori 17 Aug for sign-off | **Unconfirmed** | The only 17 Aug message is Melissa R: *"Sweet, I just saw this. I'm going to send it over this morning"* [2026-08-17 10:20:37]. Forward-looking intent. The send authorization is 16 Aug. No message anywhere confirms transmission, names a recipient, or records a reply. Sends went by email, outside Slack. |
| Review promised 18 Aug | **Refuted** | No such message. Channel is silent 18–19 Aug entirely. Likely confusion with a *developer* estimate: Miraj, *"By Monday or Tuesday, we should be able to wind up Milestone 2"* [2026-08-14 12:12:01]. |
| Review promised 23 Aug | **Refuted** | No such message. Channel silent 22–23 Aug. 23 Aug was a Sunday. |
| Review promised 1 Sept | **Half-true, and inverted** | Proposed by Miraj [2026-08-31 11:10:31], then **declined by the client**: Melissa R, *"Tori's not available tomorrow. Is there any chance we could do Thursday or Friday she asked"* [2026-08-31 13:11:56]. Not a Momentum miss. |
| "All were missed" | **Partly refuted** | The replacement meeting on **3 Sept happened**: *"We have a meeting with her this morning at 8:00 a.m. my time"* [2026-09-03 10:21:51], *"joining this call now"* [11:07:24], *"we're 20 mins in"* [11:21:27]. |
| Zero dated client acceptances recorded | **VERIFIED — and this is the real finding** | Tori Patterson never posts in the channel. No message on any date records her accepting, approving, or signing off on anything. |

**What is actually true and actually dangerous.** Bridge has three milestones paid — mac, *"She has already paid for first 3 milestones"* [2026-09-03 10:00:17] — against **zero written client acceptance of any deliverable**. Four days ago you wrote it yourself: *"Step 2 and Step 4 product approval is still with Melissa/Tori. That is separate from the technical pipeline and backend contract, so do not represent those screens as client approved yet"* [2026-08-31 11:18:38]. Then on 3 Sept you wrote *"Same here 3 milestones done! Nothing needing reviewed got it handled on my end!"* [2026-09-03 10:05:19]. Those two statements are in tension, in writing, in a channel the vendor reads. **Fix the record, not the memory.**

### 1.2 The pattern that will cost you a client: eight weeks of promising conversion match-back and never delivering

This is the same broken promise in four channels, restated to clients each cycle and closed in none. It is more damaging than any single missed date because it is the thing clients are actually paying to know.

**Omega Landscape — seven explicit written commitments between 2026-07-20 and 2026-08-31, zero closed:**
- 2026-07-20 15:29:01 *"reconcile the counted conversion against calls, forms, inbox, Zapier, and CRM records before scaling"*
- 2026-08-03 15:18:30 *"In August, we will match Google lead activity to calls, forms, inbox records, and qualified project opportunities."*
- 2026-08-03 17:56:16 (client-facing July report) *"In August, we will connect the July calls and forms to named inquiries and project status so budget choices reflect real opportunity quality."*
- 2026-08-10 17:24:41 *"The next step is to match the reported conversions to actual inquiries and project status"*
- 2026-08-17 14:57:54 *"We're holding budget steady until we can match this week's traffic to real inquiries"*
- 2026-08-24 19:45:34 *"The next step is connecting calls and forms to named project quality"*
- 2026-08-31 12:53:11 (client-facing August report) *"Next is matching calls and forms to qualified estimates"* — **identical item, pushed to September**

Two more if you count them: a looser *"tightening conversion attribution"* [2026-07-13 11:23:17], and one from your own Cursor reporting agent, *"I will match the event against calls, forms, inbox records, and CRM activity"* [2026-07-27 15:50:55], which you claimed as yours on 2026-07-27 16:01:06. **Nine forward-looking statements, zero deliveries.** Every reference in the channel points forward; not one delivers.

Omega has spent **$1,318.69 in August** and **$1,473.45 in July** with the qualification question open the whole time.

**Kimberly James Bridal — promised, missed, and then a budget change was made anyway.** Committed 2026-08-03 17:52:41: *"In August, we will connect July and early August inquiries to consultation status and use that feedback to guide campaign decisions."* Reaffirmed with an explicit guardrail 2026-08-24 19:45:40: *"Use verified appointment outcomes before making any budget changes."* The pause request surfaced via Melissa Silber on 2026-09-01 11:23:25 and you announced it 2026-09-02 10:46:37 — **without the match-back existing**. mac asked the right question: *"$505 a lot to spend with no conversions. Something might be off there"* [2026-09-02 09:30:01]. You answered informally — *"Google on the other hand i've only had one really great qualified appointment"* — and then asserted *"everything is properly set up and attributed I triple checked"*. To be precise: you did answer. You did not produce the structured match-back you had twice promised, and the assertion has no artifact behind it in the channel.

**Onsite Construction:** promised 2026-08-03 17:19:37 *"In August, we will match each form and call to a named prospect and estimate status"*; still open 2026-08-31 12:53:12 *"Next is validating connected calls and accepted forms."* Grace asked for lead tracking directly on 2026-08-27 10:59:10; your answer was *"I can't get her names because of that"* [11:06:14] and nothing was stood up.

**Fresh Blends:** the September client presentation and meeting are both gated on one number you owe Ruben — *"Let me know as soon as you plug in the August click-to-directions KPI from the site reporting layer. Once that is in, I'll finalize the presentation and get the meeting on the books!"* [2026-09-01 15:13:58]. No response from you in channel as of 2026-09-02. Meanwhile Sean: *"she wants to pause until october"* [2026-09-02 11:12:21].

### 1.3 Hope Wellness: a promise slipped four times, then landed into a virus report

Jenny McClain Miller's first therapist video, promised on four separate dates before it moved:
- 2026-08-19 10:39:45 *"I expect first video for review by EOW."* (missed)
- 2026-08-24 15:16:02 *"tomorrow or Wed should have first video to show Joseph"* (missed)
- 2026-08-26 12:50:38 *"I am hoping the first video will be completed by EOD... I am sending over an email for Joseph with updates by EOD"* (missed)
- 2026-09-01 10:52:40 *"he's getting two for review today"* — **this one appears to have landed**

Then today: John Belaska, *"Joseph says he got a virus on his computer today. He says the only thing he has opened/downloaded today is one of the therapist videos. Have you had any issues recently and are you able to check to make sure the files arent corrupt?"* [2026-09-03 17:37:27]. That message is itself the evidence the video reached him — he opened one.

**Treat this as a live client-trust incident, not a support ticket.** The sequence a client experiences is: three missed dates, then a file, then a virus. Whether or not the file is the cause, he has connected the two, and the 13-day slip history is the context he is reading it against.

**Your own overdue item in the same account.** DM to John Belaska, 2026-08-21 11:01:10: *"I didn't get to make that an animated video but I will this weekend and maybe I can get it to him by tomorrow but I definitely probably can by Monday."* Monday was 2026-08-24. On 2026-08-31 15:17:38 you were still saying *"Will get that out this week."* First requested 2026-08-11. **23 days late.**

### 1.4 Plaintext credentials sitting in Slack

Four separate instances found across the sweep. I did not reproduce any values.

| Channel | Date posted | What |
|---|---|---|
| #hope-wellness-center | 2026-08-10 18:23:29 | Live WP Engine login for the client site — **24 days exposed** |
| #deborah-mara | 2026-07-30 10:43:38 | Client GoDaddy username and password |
| #capsule-and-tonic | 2026-05-05 12:27:28 | Shared Google/Squarespace account password |
| #capsule-and-tonic | 2026-06-02 15:29:12 | GoDaddy account credentials |

Plus a standing practice of relaying MFA codes through channels (#design-social-email 2026-09-01 15:50–16:00; #outbound 2026-09-03 16:44:05) and a one-time HubSpot code posted with `@here` in #general [2026-08-31 09:10:04]. The vault already flags this class of problem — `tags-2-go` carries `accessMappingReason: "Google Ads credentials were shared in Slack."` **Rotate the four above this week.**

---

## 2. ROSTER — 19 client channels, one screen

| # | Channel | Status | Last substantive msg | Money signal | The one thing |
|---|---|---|---|---|---|
| 1 | **#nexla** | ACTIVE | 09-03 — campaigns live at $65.75/day | ~$2,000/mo budget | Newest ads client, 10 days in, healthy |
| 2 | **#puttery** | ACTIVE | 09-03 — contract resent, still unsigned | Unsigned, unpaid | **Building against no contract and no payment** |
| 3 | **#bridge-software-development** | ACTIVE | 09-03 — M3 backend verified | 3 milestones paid; you at 20% | **Zero dated client acceptances** |
| 4 | **#va-claims** | ACTIVE | 09-03 — PR 6 merged | Not stated in channel | Blocked on David for Resend domain |
| 5 | **#capsule-and-tonic** | ACTIVE | 08-31 — Aug perf update | Aug ads $460 | Facebook page promised 08-04, silently dropped |
| 6 | **#everyday-life-insurance** | ACTIVE | 09-03 — timeout errors still unfixed | Backlinks ≤$1,000/mo | 3-month-old technical defect, client chasing |
| 7 | **#kimberly-james-bridal** | ACTIVE | 09-02 — Google paused at client request | Aug Google $504.49; Meta $500/mo | Match-back never done; paused anyway |
| 8 | **#deborah-mara** | ACTIVE | 09-02 — next steps posted | 6-mo agreement signed 08-18 | **Website missed its 09-01 go-live** |
| 9 | **#onsite-construction** | ACTIVE | 09-01 — Aug monthly report | Aug spend $88.07; budget $4.39/day | Client call on 08-31 never happened |
| 10 | **#green-slate-masonry** | **DORMANT** | 06-15 — restart conversation | Was $450/mo; proposed <$700/mo | Cancelled 01-21; unsigned since 03-12 |
| 11 | **#hope-wellness-center** | ACTIVE | 09-03 — virus report | $450 review removal | **Video slipped 4×; virus claim today** |
| 12 | **#pro-fence-deck** | ACTIVE | 08-31 — citations/FAQ update | **No figures anywhere in channel** | Yelp status regressed; Apple Maps window expired |
| 13 | **#omega-landscape** | ACTIVE | 08-31 — Aug report | Aug spend $1,318.69 | **7 unclosed match-back promises** |
| 14 | **#fresh-blends** | ACTIVE | 09-02 — client wants to pause | Client owes Google ~$2k | Sept deck blocked on one KPI you owe |
| 15 | **#bar-crawl-usa** | ACTIVE | 09-01 — $750 charged | $450/mo + $75/page; Aug billed $750 | Aug SEO retainer not performed |
| 16 | **#fagan-painting** | ACTIVE | 09-02 — backlinks with client | AEO/GEO upsell $500-600/mo pending | **Sept AEO start committed, no evidence started** |
| 17 | **#nkcdc** | **AMBIGUOUS** | 09-03 — "yea its on pause" | $1,750/mo proposal unsigned 44 days | Screenshare committed 07-20, never scheduled |
| 18 | **#pritzker-law-group** | ACTIVE | 09-03 — posting slipped again | **$1,200/mo** | **~$3,600 billed, zero posts published** |
| 19 | **#revive-systems** | ACTIVE | 09-03 — LSA still pending | **Pro bono** | 5 articles finished, unpublished 31 days |

**Counts:** 17 ACTIVE, 1 DORMANT, 1 AMBIGUOUS (message-active but engagement paused), 0 DEAD.
**Also present, archived:** #shadow-hvac, #jeff-hozias, #esquivel-bail-bonds, #hardwood-artisan-llc, #neat-tidy, #blissful-zen-spa, #tags-2-go.

---

## 3. VAULT RECONCILIATION

Vault has **25 client folders**, registry has **24 records** (generated 2026-08-07). Slack has 19 client channels. They do not line up.

### 3.1 Slack channel, no vault record — 5 clients invisible to your OS

| Client | Slack since | Why it matters |
|---|---|---|
| **Nexla** | 2026-08-18 | Live spend, ~$2,000/mo. Sean is Ops Manager, you are AM. Not in the registry, not in the paid-media roster, not in the queue. **The only client with live budget that your control system cannot see.** |
| **Capsule & Tonic** | pre-April 2026 | $460/mo ad spend, monthly reporting, ~5hrs/mo. Beth Kann leads. |
| **Everyday Life Insurance** | 2026-05 or earlier | Full SEO retainer, up to $1,000/mo backlinks. Bella + Tiffany K. |
| **Deborah Mara** | 2026-07 or earlier | Signed 6-month agreement 2026-08-18. Beth Kann + you on paid media. |
| **Green Slate Masonry** | 2025 | Dormant/cancelled — arguably correct to omit, but there is no record of that decision. |

### 3.2 Vault record, no Slack channel — 9 clients you cannot see in Slack

`align-hcm`, `ami-cleaning`, `bercos-popcorn`, `bigorange-marketing`, `bok-law-firm`, `cindy-may-christmas`, `momentum-360`, `replenish-7-eleven`, `shadow-heating-cooling`.

Three carry an explicit `not-client-of: momentum-360` constraint (`bok-law-firm`, `ami-cleaning`, `cindy-may-christmas`) — separate book of business, so no channel is expected. **`replenish-7-eleven` is the live risk**: it is an active registry client with Google Ads access mapped, and it is run entirely inside `#fresh-blends`. The vault itself flags this exact hazard — quarantine item `q-20260715-0001`: *"A prior run combined Fresh Blends and Replenish despite the canonical separation rule."* The channel does maintain the split in reporting (2026-07-27 15:51:10: *"the brands, campaign groups, spend, and outcomes should never be blended"*), but the container does not.

### 3.3 Vault folder, no registry record — 1

**`clients/puttery-nyc/`** exists with a CLIENT.md naming the exact Slack route and both client emails, but Puttery appears in **neither `registry/clients.json` nor `CONTROL.md`**. Folder created after the 2026-08-07 registry generation.

### 3.4 Structural gaps in the vault itself

- **`slackChannels` is empty for 19 of 24 registry records.** Only `nkcdc`, `bridge-software`, `revive-systems`, `pritzker-law-group`, `tags-2-go` have a channel mapped. Slack is where the work actually happens; the registry mostly cannot route to it.
- **`README.md` says "the current registry contains 20 records."** It contains 24. Stale by at least four.
- **Seven active-channel clients have zero work items in `CONTROL.md`:** Nexla, Puttery, Capsule & Tonic, Everyday Life Insurance, Deborah Mara, Green Slate Masonry, Pro Fence & Deck.
- **Health probe self-reports `degraded`** as of 8/16, with access coverage `8/21` clients registered and `2/65` systems verified. That is the honest number: your OS has verified access to ~3% of the systems it is meant to operate.
- **20 duplicate "Cursor integration" work items** clog the queue (`wi-20260724-0002` through `-0020`), 19 cancelled, all with identical text. They make "Waiting on Dillon" unreadable.

### 3.5 Consistent — 13

`bar-crawl-usa`, `bridge-software`, `fagan-painting`, `fresh-blends-kwik-trip`, `hope-wellness-center`, `kimberly-james-bridal`, `nkcdc`, `omega-landscaping`, `onsite-concrete-landscape`, `pritzker-law-group`, `pro-fence-deck`, `revive-systems`, `va-claims-edge`.

---

## 4. PER-CLIENT

Ordered by risk × money. Each section: scope, status, owed, waiting, money, contacts, automation, highest-leverage next deliverable.

---

### 4.1 Bridge Software — ACTIVE — highest exposure

**Scope.** Cannabis-industry social/commerce MVP. Contracted **6 milestones** (Miraj/Greencubes), mapped against your parallel 5-phase product plan — reconciled in a thread reply, *"I'm treating the five phase plan as the product and UX execution layer mapped into the contracted six milestones"* [2026-08-05 10:21:21]. Five primary routes: Home, Community News, Create, My Profile, Explore [2026-08-24 11:06:26].

**Status.** M1 and M2 delivered. M3 backend declared complete and verified today: *"the Milestone 3 authentication work is complete and verified"* [2026-09-03 08:26:26]. Client meeting held today.

**Owed / overdue.**
- **Zero dated client acceptances across the entire channel** — the material finding. Formal acceptance flagged pending on 2026-08-16, still open 2026-09-03.
- **PR #16 preview deploy — owed by you, today.** Front-end dev: *"Could you please deploy the latest PR commit to bridge-connected-signal-dev.netlify.app... We will wait for preview testing and approval before merging"* [2026-09-03 08:26:56]. You answered *"Yes I can!!"* [08:39:26]. **No confirmation of deployment in channel.** The vendor's merge is blocked on you right now.
- Integration contract package you requested on 2026-08-31 (backend repo/branch/commit, staging origin, /health, /version, route table, auth and cookie policy, CORS, evidence upload design) — only the backend URL arrived [2026-09-02 09:36:46].

**Waiting on client.** Tori's route-by-route acceptance and default-feed choice; **Step 2 and Step 4 screen approval**, which is blocking integration — Miraj asked directly *"Step 2 and 4 are not yet approved by Tori?"* [2026-08-31 10:48:24] and it was still the open item today [2026-09-03 09:08:42].

**Money.** Commission split set at open: *"Dillon Mohr = 20% • Melissa R = 15% • Miraj Mor team = 40%"* [2026-07-08 16:15:39]. Three milestones paid. Payment has been a recurring friction: *"I dont think she paid for phase 2 yet so lets not send this stuff quite yet"* [2026-08-07 14:28:25]; *"I dont want her paying all the until were further ahead"* [2026-08-11 14:50:34]. Contract value never stated in channel — 17hats link only. **Assumption, not verified:** milestone pricing is unknown to me.

**Contacts.** Tori Patterson (client, never posts in Slack) · Melissa Rigby (AM, primary client comms) · mac (oversight) · Miraj Mor / Greencubes (dev vendor, external) · you (AI + front end).

**Automatable.** Milestone acceptance capture — a single dated, client-signed acceptance record per milestone, produced from the report you already write. Preview-deploy → QA → merge is a fixed loop that currently waits on you manually.

**Highest-leverage deliverable now:** a **one-page dated milestone acceptance sheet** covering M1–M3 and the five routes, sent to Tori through Melissa with a request for a dated reply. Three milestones are paid against nothing signed. This is a receivables and scope-creep exposure, and it takes an hour.

---

### 4.2 Puttery NYC — ACTIVE — building without a contract

**Scope.** Reservation attribution and measurement for Puttery NYC: Tock/Resy reservation webhook ingestion, GA4/GTM/Google Ads/Meta tracking deployment, a branded dashboard, and consented booking data into their existing email/CRM. Channel opened 2026-08-27 — **7 days old**.

**Status.** Substantial build already done ahead of signature. Your readiness post [2026-09-01 14:49:13] lists complete: branded dashboard and implementation spec, NYC-only receiver with duplicate suppression and refund support, 13 tests passed 0 failed, full accessibility/mobile QA, vendor eligibility confirmed (Business Group 28086, Business 37824), kickoff analysis, access packet, execution plan, August report.

**Owed / overdue.** Nothing overdue *to* the client — the engagement is too young. The exposure runs the other way.

**Waiting on client — 7 open gates, all still open:**
1. Signed agreement and verified first payment
2. Secure rotation of the API credential that was sent through ordinary email
3. Reservation webhook registration + one controlled NYC payload
4. GA4, GTM, Google Ads, Meta, website/CMS access
5. Two known NYC venue days + one controlled paid booking
6. Approved conversion event, booking value, refund and checkout rules
7. Privacy/consent owner, approved fields, opt-out rules, retention policy, email/CRM destination

**Money.** **Unsigned and unpaid as of today.** mac, 2026-09-01 14:58:39: *"Looks like we still need contract and card or payment... this will be a September commission since no payment or contract yet."* Melissa Silber, *"It's half now and half when done"* [2026-09-01 15:44:41]. Today: *"resent contract + CC Form + New Onboarding form"* [2026-09-03 11:50:28] and *"Joe/Thomas approved contract"* [13:11:07] — approval is not signature. Jesse: *"Tom was supposed to sign Tuesday"* [2026-09-03 11:59:19].

**Contacts.** Joe Pedevillano (joe@highlinecomedy.com) · Tom / T. Luciano (tluciano@driveshack.com) · internal: Melissa Silber (onboarding/access), Jesse DiLaura (sales), mac (billing), you (build).

**Security note.** A Resy API credential was issued and travelled through ordinary email. You correctly refused to use it — *"Do not resend that credential in Slack or ordinary email. We still need it in a vault route before I use it"* [2026-08-31 17:37:48]. **That credential is still unrotated as far as the channel shows.** Keep it on the gate list.

**Scope-risk on record.** Melissa Silber pushed back hard on 2026-08-31 18:38:01: *"Please be sure you know and understand what's on contract here so you're fulfilling what's been proposed and told them is possible."* You had described email/CRM sync as *"optional"* [17:37:48] when the contract line reads *"Customer/booking data captured for ongoing email marketing campaigns"* [18:31:25]. You corrected yourself the same evening. Worth not repeating — Mac's framing was *"this could be a great client leading to many opportunities, so we cant screw it up"* [2026-08-27 18:49:50].

**Highest-leverage deliverable now:** a **one-page gate sheet with named owners and dates** for the 7 blockers, sent to Melissa to drive with Joe/Tom. You said it yourself — *"the 2.5 week clock starts from usable access."* Until it does, every hour you build is unbilled and unprotected.

---

### 4.3 Omega Landscape — ACTIVE — worst promise-to-delivery ratio

**Scope.** Google Ads (PMax + high-intent Search, Colorado Springs), GBP posts, estimate landing page, Netlify dashboard. Meta handled by John Belaska; Ranked SEO by Beth Kann. You are POC since 2026-07-30.

**Status.** Reporting machinery is excellent and running. The analytical question underneath it has been open eight weeks.

**Owed / overdue.**
- **Seven written match-back promises, none closed** (full list in §1.2).
- **Google Ads access for Christian Tippens — yours to grant, 6+ weeks open.** You said *"I can share access"* [2026-06-22 11:14:32]; Christian was still asking on 2026-08-04 15:10:12: *"I still need access to both the main Meta account and the Google Ads account."* Sean asked *"did we get this figured out"* [2026-08-06 16:45:45] — no reply in channel.
- Monday Update prompt of 2026-08-31 unanswered.

**Waiting on client.** David is chronically unresponsive — *"He hasn't answered my last two emails"* [2026-06-15 22:25:20]; *"He gets a ton of calls but he hasn't answered me on if the leads were converting or not"* [2026-07-30 13:25:08]. Also open: GHL onboarding, website credentials, a past-due Facebook ad account balance [2026-06-11 10:05:59].

**Money.** Aug $1,318.69 · Jul $1,473.45 · Jun $1,551.10, $119.32 blended CPA. Deal size: *"Product value is over 50k"* [2026-06-12 13:57:35]. No retainer figure in channel.

**Highest-leverage deliverable now:** **stop promising the match-back and instead ship the honest version.** One page: here are the N conversion events, here is what we can and cannot resolve to a named person, here is exactly what David must provide to close the gap, here is the decision we will make once he does. Seven soft promises have cost more credibility than one hard "we can't do this without you" would have.

---

### 4.4 Hope Wellness Center — ACTIVE — live trust incident

**Scope.** WP Engine website management, GBP management, negative review removal, therapist video production, email templates, brand illustrations/animations, monthly + weekly reporting, LSA being unwound, an open SEO proposal.

**Owed / overdue.**
- **Therapist video: 4 slipped promises, 30 days** (§1.3). Now entangled with a virus claim [2026-09-03 17:37:27].
- **Your animated video: 23 days late** (DM 2026-08-21, due 2026-08-24; still "this week" on 2026-08-31).
- **Review removal: 2 of 3 still live, 30 days on.** Engaged 2026-08-04 12:44:22 at $450. John flagged the gap 2026-08-17 10:58:47. Latest vendor status is non-committal: *"Reviews were old so these took time to get down. Hard working continue"* [2026-09-01 12:32:43]. Chased five separate times with no date ever given.
- **August's committed release slipped a full month.** July report to client: *"In August, we will close the seven leadership choices... we will release the five highest priority items"* [2026-08-03 18:01:50]. August report: *"September focuses on approving the first video and releasing the first five priorities"* [2026-08-31 14:56:35].
- **Two separate review-removal vendors** are in the channel doing the same job (joined 2026-08-04 and 2026-08-19), both being chased independently. Unmanaged duplication.

**Needs verification before you rely on it.** John asked *"Can we confirm with him that he is ok with using that LSA money to do this before we move forward?"* [2026-08-04 12:49:39]. **No confirmation from Joseph appears anywhere in the channel.** The $450 may have been committed against unconfirmed client funds. I could not verify either way from Slack — check the mailbox.

**Money.** $450 review removal (2 × $150 aged + 1 × $100 recent). LSA refund-or-reallocate decision open. No retainer figure in channel.

**Contacts.** Joseph (owner, all approvals) · therapists Zoe, Katelyn · internal: John Belaska (AM, sole POC), Jenny McClain Miller (video), Muhammad U (web), Sean, you (reporting/creative).

**Highest-leverage deliverable now:** **triage the virus claim today**, in writing, with a checksum/scan result on the delivered files. Then one dated commitment on the first video and hold it. This account has more slipped promises per week than any other in the portfolio and the client has started attributing problems to your deliverables.

---

### 4.5 Kimberly James Bridal — ACTIVE — paused, and the reason is undocumented

**Scope.** Google + Meta ads, landing page and FAQ builds, conversion tracking, weekly + monthly reporting with a Netlify dashboard. GBP + on-page SEO assigned but not evidenced.

**Status.** **Google Ads paused at client request 2026-09-02.** Meta is performing: *"Meta has made a killing she has been in contact with a ton of brides for future apts"* [2026-09-02 10:46:37]. September pivots to GBP + light SEO, agreed today.

**Owed / overdue.**
- Match-back promised for August, never delivered; budget changed anyway (§1.2).
- **Weekly GBP + on-page SEO instructed 2026-06-04 09:19:34 — no evidence of delivery in three months.** mac re-asked today: *"Are you managing/updating her GBP as well?"* [2026-09-03 11:58:31]. This is a quiet scope leak; if it is billable, it has been unbilled or undelivered for a quarter.
- Attribution-ID mismatch flagged 2026-07-21 14:17:49, never resolved in channel.
- **$505 August spend with no conversions is unexplained twice.** Same question was raised on 2026-07-22 10:12:28: *"$605 spent but 0 calls 0 conversions with 1362 clicks that cant be right."* Two months, same question, no artifact.

**Money.** Aug Google $504.49 · Jul Google $570.89 · Meta $500/mo budget · billing split *"our card for G Ads her card for Meta"* [2026-07-21 14:49:55].

**Highest-leverage deliverable now:** a **paused-account retention brief** — what Meta produced, what Google did not, what the September GBP/SEO work will be, and the one measurement change that makes a Google restart worth it. A client who pauses one channel while praising another is a client deciding whether to keep you. Answer mac's $505 question with a screenshot, not an assertion.

---

### 4.6 Fresh Blends / Replenish — ACTIVE — client wants to pause

**Scope.** Google Ads PMax across two deliberately separated brands in one shared account: Replenish/7-Eleven (San Diego, then South Florida) and Fresh Blends/Kwik Trip "Ice Box". Weekly + monthly decks per brand, two Netlify dashboards.

**Status.** **Mia wants to pause until October** [2026-09-02 11:12:21]. Sean wants to save it. Your instinct — *"Maybe let's upsell service outside of ads? AEO + GEO"* [11:17:50] — is reasonable but unbuilt.

**Owed / overdue.**
- **The August click-to-directions KPI you owe Ruben** — the September deck and client meeting are both blocked on it [2026-09-01 15:13:58]. **Highest-urgency single item in this account.**
- Meeting email Sean asked for [2026-09-02 11:18:13] — no confirmation it went out.
- **17 launches promised by mid-August, 9 delivered.** *"17 more to launch by mid August I believe was what she said"* [2026-07-18 12:03:41] vs *"Nine South Florida and San Diego store campaigns went live Aug 16"* [2026-08-17 14:33:43]. Eight unaccounted for in channel.
- **A dated forecast made to the client and not met:** *"I expect next week's report to show substantial improvement, with several of the elevated costs potentially cut roughly in half"* [2026-08-24 18:37:52]. The 2026-08-31 report does not report per-location cost-per-clicked-direction at all.
- Mid-month sync Ruben proposed [2026-08-07 23:38:17] never scheduled.

**Waiting on client.** Mia owes Google ~$2k in chargebacks — *"she owes 2 grand to Google :joy: charge backs apparently"* [2026-08-07 23:49:57]; payments profile still in process on 2026-08-17. Location and budget approval for the next batch. Five of her landing pages say "coming soon" and she wants traffic driven to them [2026-09-02 11:16:46].

**Money.** Aug $684.74, $0.97 CPC (53% below benchmark) · Jul Replenish $1,966.90 across 8 campaigns, Fresh Blends $156.43 across 4 · combined July account $2,123.34 · ~$200/store at launch.

**Structural flag.** Replenish is a separate registry client with its own Google Ads access mapping and its own vault folder, run entirely inside `#fresh-blends`. The vault's own quarantine `q-20260715-0001` exists because these two got conflated once already.

**Highest-leverage deliverable now:** **plug in the August click-to-directions KPI today.** It unblocks Ruben, the deck, and the meeting — and the meeting is the only thing standing between you and a pause. Everything else in this account is downstream of that one number.

---

### 4.7 VA Claims Edge — ACTIVE — healthy, one external blocker

**Scope.** Multi-phase claimant portal: Next.js frontend (you), backend/API/Supabase (Obaid), plus website work (James Frederick). Seven-stage claimant journey, Nexus Letter page, notes, lifecycle, advisors, AI assistant, payment watch, storage, notifications.

**Status.** **Phase 3 complete from development side, verified on production** [2026-09-02 19:10:25]. PR #6 merged and verified today; PR #5 held deliberately until Phase 3 is formally signed off — *"Holding PR 5 until Phase 3 is formally closed by the team"* [2026-09-03 17:38:10]. This is the best-run engagement in the portfolio: dated, verified, with explicit gates.

**Your security review was the highest-value contribution of the week.** You found three real defects — a signed-URL route with no ownership check, a digest dedupe that never matched, and a missing cron — and then found a fourth on review: *"The digest email interpolates client names, stage names and advisor names straight into HTML... anything a staff member types into a client record ends up rendered in an inbox. Not urgent while the data is internal, worth closing before real claimant records land"* [2026-09-03 14:58:56]. All fixed.

**Owed / overdue.** Nothing overdue *to* the client. Two open items need David:
1. **Resend sender domain** — blocking all real notifications. Obaid: *"Once he confirms, the setup on our end takes about 10 minutes"* [2026-09-03 10:57:53]. James committed to reaching out [2026-09-03 10:59:20]. **Verified independently:** public DNS for vaclaimsedge.com shows Google MX only, no Resend/DKIM/DMARC records — so this is genuinely not done, not just unrecorded.
2. Website self-registration — scoped to a later phase, needs a decision.

**Vault says two things are stuck that Slack does not mention.** `wi-20260725-0007` "Correct VA Claims booking and lead routing rules" is **P0 and blocked**, waiting on a Bitwarden vault unlock for the WordPress/Amelia admin route. It is also the vault's nominated "next unblock." Nobody has mentioned it in Slack. Worth surfacing.

**Contacts.** David Fisher (client) · Obaid (backend) · James Frederick (website/client liaison) · you (frontend/security).

**Highest-leverage deliverable now:** **close the Resend domain today.** It is a 10-minute setup behind a one-word client confirmation, and the entire notification engine — already built and paid for in effort — is dead until it lands.

---

### 4.8 Everyday Life Insurance — ACTIVE — a defect the client keeps re-reporting

**Scope.** Full SEO retainer: on-page, off-page (earned + paid links), technical, local, content, homepage redesign, plugin updates, review responses, press/backlink outreach.

**Owed / overdue.**
- **Site timeout errors, open since June, client chasing today.** Tiffany, 2026-07-10 13:30:25: *"Just following up on last month message about the time outs."* Obaid disabled caching [2026-07-10 18:42:45]. Still broken: *"There are many errors that are causing loading problems & affecting the sitemap etc. I sent you a report of the exact URLs a few weeks ago. I don't see any changes that it was fixed"* [2026-09-03 14:21:12]. **Three months, a named list of URLs, no fix.**
- **DR/CF/TF comparison owed to Jake since 2026-08-12.** Asked 08-12 13:30:45, *"Working on it"* 18:09:10, still outstanding 08-25 10:12:40, promised via Shikha 08-26 09:41:14. No delivery confirmation through 09-03.
- Monthly report committed for 2026-09-01 morning [2026-08-31 09:37:08] — no confirmation it went.
- **Paid-link program stalled and blocking billable work.** *"I won't be looking for more paid links this month until we have last month sorted out"* [2026-08-25 09:38:44], because *"I sent Jake about 6 or 7 paid links... I followed up with him on this twice now but have not heard back"* [2026-08-06 12:24:53].

**Money.** Jake's ceiling *"roughly $1,000 per month maximum for backlinks"* [2026-08-10 16:41:30]. Podcast program repriced from $200–300 to *"$500 a month paid in 3mo blocks"* [2026-08-04 09:27:24], unresolved. Retainer figure not in channel.

**Highest-leverage deliverable now:** **fix the timeouts.** A client who has reported the same defect three times in three months with a URL list attached is documenting a case for leaving. Everything else in this account is discretionary; this is not.

---

### 4.9 Pritzker Law Group — ACTIVE — 24 days, nothing posted

**Scope.** Social media management for a law firm: content calendar, photo/video production, editing, brand guidelines, Metricool scheduling across four platforms, plus a separate podcast workstream.

**Status.** Real work delivered — 31-day content calendar and shot list emailed 2026-08-10 16:26:30, shoot completed week of 8/25, revised brand guide 08-31, three example posts + feed preview 09-01, RAW files to client 09-03. **Nothing has been posted to any channel.**

**Owed / overdue.**
- **Posting.** Calendar delivered 08-10 with intent *"to begin posting with the updated color palette and direction."* Sean asked *"did we start posting?"* [2026-09-02 12:11:52] and again *"when can we get posts up"* [relayed 2026-09-03 17:06:15]. Current target slipped within the same day, from Madison's *"first thing next week"* [15:28:24] to Jenny's *"likely next week to post"* [17:21:09].
- Media kit and podcast updates promised before Jenny's OOO [2026-08-07 12:05:15] — never appear.
- YouTube admin access requested 08-31 18:49:22, still incomplete 09-03.

**Waiting on client.** Rachael's hard approval on captions and content — *"Rachael is going to need to give hard approval on captions and content before anything is posted 100%"* [2026-09-02 12:45:10]. Green-highlighted topic additions still open. Kat granting Facebook and YouTube admin.

**Relationship risk, stated in channel.** 2026-09-03 10:52:37: *"She forgets things she approved, talks disrespectfully, reads into and over-analyzes simple messages relayed."* Your stabilization plan the same day [13:20:46] is the right instinct: an Approval Tracker with 19 deliverables, asset links, owners and approval flags, plus *"Batch feedback into one revision round instead of reacting message by message."*

**Money — and this changes the severity.** **This is a $1,200/month account.** Sean, 2026-06-16 13:04:45: *"signing rachael to $1200/mo social media package"*, and 13:14:57: *"@Jenny McClain Miller giving you $600 for AM + socials."* Those are the only two dollar figures in the entire channel — there is no client-facing spend, performance, or invoice figure anywhere in it.

So: **~$3,600 billed across June, July and August against zero published posts.** That reframes the "difficult client" characterization on 2026-09-03 10:52:37. Rachael may well be difficult; she is also paying $1,200/month for a social presence that has not received a single post.

**Highest-leverage deliverable now:** **get one post live this week.** Three months of billing with zero published output is how a social retainer dies — and how a chargeback conversation starts. Push the smallest approvable unit through Rachael and publish it.

---

### 4.10 Deborah Mara — ACTIVE — missed go-live

**Scope.** Organic social + local (GBP, FB, IG, LinkedIn) plus a new WordPress site; expanded 2026-08-18 to Meta lead ads, Google Search, ChatGPT ads testing, and ongoing site maintenance. Chris Mara microsite + GBP as an add-on. Nick Mara explicitly out of scope.

**Owed / overdue.**
- **Website missed its stated 2026-09-01 go-live.** Committed 2026-08-24 10:54:09: *"Finish refining Deb's new site to take live September 1."* Now *"get it live in the next week or two"* [2026-09-02 15:13:45].
- September social/GBP calendar not confirmed; last confirmed scheduling is *"Posts scheduled through Friday Aug. 21"* [2026-08-11 13:54:37].
- August monthly report not posted (July's was, 2026-08-04 13:35:35) and not on the current next-steps list.
- **Signed contract withheld from the delivery team for 15 days.** Sean announced signing 08-18 17:17:21; Beth asked for it 08-25 12:17:32; you asked again 08-28 15:48:51 (*"the executed document itself is not present yet"*); posted 09-02 15:00:28. That is a scope-safety gap — Beth and Muhammad built for two weeks against an unseen contract.

**Waiting on client.** MLS confirmation blocking IDX plugin pricing (asked 08-18, escalated 08-24, unanswered). Meta and Google Ads access for you. Chris Mara GBP access. CRM and lead attribution confirmation. HD images.

**Money.** Signed 6-month agreement. Active payments listed 2026-08-18 16:18:43: *"$375, $45, new listings ads $235... + Momentum360 payments"*, with *"$175 and $343 terminations of monthly obligations."* Hosting $10.99/mo ($131.88/yr). Client-facing promise on 2026-07-15 14:29:41: *"all website development and content development is included in your services at no extra cost"* — worth holding in mind before any change-order conversation.

**Highest-leverage deliverable now:** **ship the site.** It has a public missed date attached to it and a new 6-month contract behind it. Nothing else in this account matters until the site is live.

---

### 4.11 Bar Crawl USA — ACTIVE — retainer deliverable not performed

**Scope.** $450/mo on-page SEO retainer on existing pages + per-page landing page builds. Google Ads at $0.00 since July.

**Owed / overdue.**
- **August's promised page set was substituted without reconciliation.** Committed 2026-08-03 17:59:12 (10 named evergreen pages: *"What Is a Bar Crawl, Macon Bar Crawls, Atlanta..."*). Delivered instead: 10 Halloween pages [2026-08-24 15:40:26]. No message reconciles the swap.
- **The $450 retainer work was not performed in August.** mac, 2026-08-31 10:50:43: *"unless you can bang out 10 pages of valid On Page SEO today for older pages lol / but that might be too late."* Client was billed $750 for pages only. Honest handling — but it means a monthly retainer deliverable was silently skipped.
- "First August cleanup" items (Portland, Birmingham/Atlanta schema) committed 08-03, still open 08-17, no completion message through 09-01.
- Video scope meeting with Andy committed *"this week"* [2026-08-17 14:39:57] — no follow-up.

**Money.** Aug charged $750 (10 pages @ $75). Retainer $450/mo. **Pricing discrepancy on record:** you said *"It's $100 to create the new landing pages"* [2026-07-29 10:39:06]; mac bills $75. Client ceiling flagged: *"means he either doesnt have the money (only $450/mo) or doesnt see the value/results from SEO"* [2026-08-04 17:47:51].

**Highest-leverage deliverable now:** **resolve the $75 vs $100 page price with mac in writing**, then commit September's retainer scope explicitly so it does not get skipped a second month. Two months of "pages instead of retainer" turns a $1,200 client into a $750 client.

---

### 4.12 Onsite Construction — ACTIVE

**Scope.** Google Ads, Fairfield/Vacaville location page buildout, schema, internal linking, blogs, GBP scheduling, weekly + monthly reporting.

**Owed / overdue.** Named-contact conversion validation promised for August, carried into September (§1.2). Lead tracking requested by Grace 2026-08-27, never stood up. **Client call scheduled Monday 2026-08-31 12:00–12:30 did not happen and is still being rescheduled** [2026-09-03 12:07:20]. Minor reporting inconsistency: Shehzad reported two Fairfield pages "Live" on 08-03 that you described as *"ready to publish"* on 08-17.

**Money.** Aug $88.07, $0.16 CPC · Jul $247.07 · Jun $218.68, $6.43 cost/conversion. Budget is the constraint: *"her ad budget is hurting though definitely $4.39 a day to $7 isn't much"* [2026-08-27 11:06:40].

**Highest-leverage deliverable now:** get the client call on the calendar with a two-page agenda — the honest lead-quality picture and a budget recommendation. At $4.39/day there is no optimization left; the conversation is the deliverable.

---

### 4.13 Fagan Painting — ACTIVE

**Scope.** Organic SEO (Phil), blog content (Melissa R), backlinks via DWS/Austin. Meta ads closed July 2026 — parent company Legacy Paint Holdings took over.

**Owed / overdue.**
- **AEO/GEO committed to start "in sep", no evidence it started.** *"No weekly report - AEO + GEO efforts to start in sep!"* [2026-08-24 19:47:11]; *"Extra AEO and GEO package is ready, parked until early September"* [2026-08-17 14:56:33]; client-side timing confirmed *"He said revisit the additional AI stuff in early september"* [2026-08-11 14:40:44]. It is 3 September.
- **You also agreed to start earlier than that and didn't.** Melissa Silber, 2026-08-25 10:06:05: *"are you able to get started on the AEO/optimizations he mentioned in the meantime so we can get some wins here"* — you replied in thread *"Yes!"* [2026-08-25 10:22:06]. Nine days, nothing in channel. Your own 08-31 August report frames September as *"publishing the prepared site fixes and tying inquiries back to the pages producing them"* — AEO/GEO is not mentioned at all.
- Contract addendum you requested 2026-08-05 11:02:15 never produced; mac's alternative *"We will have to present a different replacement idea"* [14:14:24] also never produced.
- A client billing escalation was routed to mac 2026-08-25 10:01:35 and never closed out in channel.

**Money.** **$500–600/mo of live upsell revenue sitting unclaimed**: *"he does want the added AEO services he's fine with 500-600 added but he's waiting to get more money from jobs"* [2026-08-12 14:25:14]. Backlinks ~$300/mo. July Meta $1,320.11 across the account. Client results are strong: *"He had booked over $20,000 worth of estimates!"* [2026-08-04 11:01:31].

**Highest-leverage deliverable now:** **send the AEO/GEO proposal this week.** A client who has said yes to $500–600/mo, twice, in writing, and is waiting on you is the cheapest revenue in the portfolio. It is now past the date you set.

---

### 4.14 Capsule & Tonic — ACTIVE

**Scope.** Google Ads, GBP content (3×/week + monthly calendar), website blogs/SEO, ad landing page, monthly reporting. Beth Kann leads; ~5 hours/month.

**Owed / overdue.**
- **Facebook Business Page promised to the client in writing, then silently dropped.** Internal 2026-07-26 20:20:26: *"Set up Facebook Business profile for Capsule & Tonic - courtesy of Momentum."* **Repeated to the client in the July report** 2026-08-04 17:57:46: *"Momentum to create a Facebook Business Profile and publish content similar to Google Business Profile updates."* Absent from the 08-24 and 08-31 priority lists. Blocked on Jeff's personal FB login [2026-08-17 11:57:04] — but the client was never told that.
- **Blogs at 2/month, committed to the client 2026-08-04.** Last published blogs were the 5 on 2026-06-04. Still an unstarted priority on 08-31.
- Client review call promised EOW 7/31, re-listed twice, never confirmed.
- **Lead-tracking discrepancy raised to taj twice with no reply in channel** — *"the leads sheet... is only showing 1 form fill for June on 6/15 but the Looker Studio report is saying there were 13"* [2026-06-30 11:39:18], prior instance 2026-05-13 11:03:52.

**Money.** Aug ads $460 · Jul $455, $15.18 cost/conversion · Jun $447 · budget-constrained at *"$15 per day - Google recommends $48 per day"* [2026-06-16 13:51:40].

**Highest-leverage deliverable now:** **close the Facebook page loop with Jeff** — either get his login and build it, or tell him plainly it needs his login. A courtesy deliverable promised in a client report and then dropped without a word is worse than never offering it.

---

### 4.15 Pro Fence & Deck — ACTIVE — status regression

**Scope.** Local SEO only: citations, FAQ/schema on service pages, Yelp claim, Apple Maps listing, NAP consistency. GBP management explicitly **not** contracted — Sean declined the upsell [2026-08-05 18:41:43].

**Owed / overdue.**
- **Yelp status regressed across three weeks:** *"created and Approved & Live now"* [2026-08-10 09:42:34] → *"live but not appear on Search Results Yet"* [2026-08-16 14:48:08] → *"in process due to old accounts matching and no login credentials"* [2026-08-31 12:18:41]. A deliverable reported as done and then un-done.
- **Apple Maps window expired.** *"Apple maps account business listing takes up to 1 to 7 business days to live"* [2026-08-25 14:33:51]. Seven business days lands on today. Still "in review" as of 08-31, four weeks after creation.
- Citations promised before Monday 08-03 [2026-07-29 11:19:03] — first delivery 08-16, ~2 weeks late.
- Address/NAP fix promised for 07-30 [2026-07-29 11:21:42] — still open on 08-31.
- **Weekly client email claim is unverified.** Shehzad: *"I have already shared it with client on every Monday and cc=Sean"* [2026-09-01 11:45:29] — but Beth had to prompt on 08-25 and again on 09-01. The claim and the prompting are inconsistent, and there is no cc trail visible inside Slack.

**Root cause worth fixing.** The listing failures are geographic, not skill: *"Is there somebody who can create those accounts with all of details for USA region, it will most good if account has created from Pennsylvania?"* [2026-08-03 18:11:33] and *"I had a paid VPN and Proxy but same issue"* [18:12:51]. A US-based account-creation step removes a recurring multi-week block. Internally you are also blocked on David Molod for Apple Maps [2026-08-16 12:23:18].

**Money.** **No dollar figures anywhere in this channel.** No retainer, invoice, budget or spend is stated.

**Highest-leverage deliverable now:** **assign a US-based person to create the Yelp and Apple listings**, and verify the weekly client email actually went out. One geographic fix closes two four-week-old items.

---

### 4.16 Nexla — ACTIVE — newest, healthiest, invisible to your OS

**Scope.** Google Ads management. Goal: *"generate more qualified leads and drive additional conversions through Nexla's primary landing page"* [2026-08-20 13:33:23]. Sean = Operations Manager, you = Account Manager.

**Status.** Campaigns went live today. *"I kept Brand Exact active at $25.00 per day and launched the focused MCP Search campaign at $40.75 per day. Every other campaign is paused, so the account total is $65.75 per day, aligned with the approved approximately $2,000 monthly budget"* [2026-09-03 20:54:05]. Settings verified: Search-only, US targeting, weekday 7am–7pm Central.

**Owed / overdue.** Nothing overdue — 16 days old. One open commitment to yourself, made today: a **Monday-cadence designed PDF report** with Nexla's exact logo. **That is a new standing weekly obligation. Treat it as one.**

**Open question.** Sean asked *"any upsell here?"* [2026-09-01 12:46:20]; you answered *"Not yet still waiting to hear back from them"* [13:05:25]. Sean's read: *"we can BLOW this up if we deliver"* [2026-08-31 12:54:34].

**Money.** ~$2,000/mo approved budget. August: $742.72 spend, 210 clicks, $3.54 CPC, Brand Exact at 21.06% CTR.

**Next deliverable.** Confirm the primary conversion and valid-lead criteria before the first Monday report — you already named this as the next step. Do it before the report, not after, or the first report will have the same match-back hole as Omega's.

---

### 4.17 Revive Systems — ACTIVE — pro bono, work finished and unshipped

**Scope.** Pro bono. *"reminder this is a pro bono client so just do what we can when we can"* [2026-06-11 12:37:19]. Basic on-page SEO, a Google Ads landing page, minimal-budget ads, GBP local SEO, GHL funnel cleanup, Local Services Ads, Meta remarketing.

**Owed / overdue.**
- **Five finished articles unpublished for 31 days.** Complete and *"ready for an organized review and publication sequence"* [2026-08-03 18:01:00]. mac directed twice — *"I'd say post them or have him review then post"* [2026-08-17 16:28:25]. Status unchanged: *"Still waiting on approval!"* [2026-08-24 19:46:18].
- **Beth Kann's 15-day-overdue commitment:** *"I'll finish up my review tomorrow and ping you guys then"* [2026-08-18 16:29:38]. Due 08-19. Nothing since 08-20.
- Live HighLevel cleanup pass, flagged as the biggest open item 2026-06-29, never confirmed done.
- LSA verification pending since late July with no root cause; today's guess is *"maybe thats holding up his bg check approval"* [2026-09-03 10:13:29].

**Money.** None. No invoices, no retainer, no ad spend ever reported. Client is spend-averse for personal reasons [2026-06-18 12:48:46].

**Vault cross-reference.** Registry has `revive-systems` as `active` but the README notes it is *"quarantined as needs-confirmation"*, and `wi-20260717-0002` is **blocked on a Google OAuth gate that got stuck loading**. So the publishing blocker is partly technical, not purely client-side.

**Highest-leverage deliverable now:** **publish the articles or formally park the account.** Pro bono work that sits finished and unpublished for a month costs you the goodwill you were buying. Either get Mike's yes in one message, or write the account down.

---

### 4.18 NKCDC — AMBIGUOUS

**Status ruling.** Messages today, but **no production work since 2026-07-08**. mac: *"yea its on pause -- ill follow up calling next week / he said wasnt top priority but hes interested"* [2026-09-03 21:29:54]. Contract expired: *"June was our 3rd and final month... Technically the contract is over"* [2026-07-08 11:00:36]. Ads all paused 2026-07-08.

**Overdue.** One item, and it is yours: *"Schedule the follow-up screenshare with Anthony"* [2026-07-20 13:02:33], restated as the recommendation 2026-07-27 15:51:10. **45 days, never scheduled.** Otherwise the block is genuinely on their side — the 12-page Phase Two proposal was sent 2026-07-21 15:04:36 and has gone unanswered for **44 days**.

**Money.** $1,750/mo proposed (vs $2,050 à la carte). *"no work on commission this month until new contract is signed"* [2026-07-08 15:00:29].

**Highest-leverage deliverable now:** decide. Either run the screenshare you promised 45 days ago, or move NKCDC to a documented dormant state so it stops consuming weekly report cycles — you are still generating weekly reports for an account with nothing to report [2026-08-17 14:33:49].

---

### 4.19 Green Slate Masonry — DORMANT

Cancelled 2026-01-21 (*"tracey says she needs to cancel for now"*). Replacement SMM contract sent 2026-03-12, never confirmed signed. Six documented non-responses (03-19, 04-01, 04-08, 04-30, 08-07). Last real update 2026-06-15 13:09:12: *"Talked to Tracey she probably wants to restart in July... Prob small retainer though less than $700/mo."* Last message 2026-08-17 16:45:51.

Two stale commitments remain on the record: Cameron's *"the plan is to have them all done by the spring"* [2026-01-13 12:08:44] and mac's 10-day website/GBP task [2026-01-21 14:34:40]. Both long past.

**Call it.** Either close it formally or set a single dated decision point. It has generated zero revenue in 8 months and no vault record exists.

---

## 5. CONSOLIDATED OVERDUE REGISTER

Ranked by damage. **Bold = a promise made in writing to a client and missed.**

*Counting rule: "Days late" measures from the deadline the promise itself set, not from when it was made. Where a promise said "in August," the deadline is 2026-08-31. Where no deadline was stated, I give elapsed days since the commitment and mark it `elapsed`. Chained promises show the deadline miss plus, in parentheses, how long the promise has been repeating.*

| # | Item | Client | Deadline | Days late | Owner |
|---|---|---|---|---|---|
| 1 | **Therapist video — 3 slipped dates, delivered 09-01, now entangled with a virus claim** | Hope Wellness | EOW 08-21 | delivered **13 late** | Jenny |
| 2 | **Conversion → named-lead match-back (7 written promises)** | Omega | 08-31 ("In August") | **3** (52-day chain) | You |
| 3 | **Site timeout errors, client re-reported today with URL list** | Everyday Life | 07-10 follow-up | **55** (first raised June) | Obaid/Tiffany |
| 4 | Zero dated client acceptances against 3 paid milestones | Bridge | none set | ongoing | You/Melissa R |
| 5 | **Website go-live** | Deborah Mara | 09-01 | **2** | Beth/Muhammad |
| 6 | **Match-back promised, then budget changed anyway** | KJB | 08-31 ("In August") | **3** (promised 08-03, 08-24) | You |
| 7 | Aug click-to-directions KPI — blocks Sept deck + meeting | Fresh Blends | 09-01 | **2** | **You** |
| 8 | **Nothing posted since calendar delivered — on a $1,200/mo retainer** | Pritzker | none set | 24 `elapsed` | Jenny/Madison |
| 9 | PR #16 preview deploy — vendor's merge blocked on you | Bridge | 09-03 | **today** | **You** |
| 10 | **AEO/GEO start committed for "early September"** | Fagan | ~09-01 | **2** | **You** ($500–600/mo) |
| 11 | Animated video (your own DM commitment) | Hope Wellness | 08-24 | **10** | **You** |
| 12 | **Facebook Business Page promised in a client report, dropped** | Capsule & Tonic | none set | 30 `elapsed` | Beth |
| 13 | Five articles finished and unpublished | Revive | none set | 31 `elapsed` | You/Beth |
| 14 | **Named-contact conversion validation** | Onsite | 08-31 ("In August") | **3** (32-day chain) | You |
| 15 | Weekly GBP + on-page SEO, no evidence in 3 months | KJB | weekly since 06-04 | 91 `elapsed` | You |
| 16 | DR/CF/TF comparison owed to Jake | Everyday Life | 08-12 ask | **22** | Tiffany/Shikha |
| 17 | Yelp listing — reported live, then not live | Pro Fence | 08-10 claim | 24 `elapsed` | Shehzad |
| 18 | Apple Maps 7-business-day window | Pro Fence | 09-03 | **expiring today** | Shehzad/David M |
| 19 | Follow-up screenshare with Anthony | NKCDC | none set, 07-20 | 45 `elapsed` | You/mac |
| 20 | **August evergreen pages substituted without reconciliation** | Bar Crawl | 08-31 | **3** | You |
| 21 | August $450 retainer deliverable not performed | Bar Crawl | 08-31 | **3** | You/mac |
| 22 | Google Ads access for Christian | Omega | none set, 06-22 | 73 `elapsed` | **You** |
| 23 | Beth's Revive review — "tomorrow" | Revive | 08-19 | **15** | Beth |
| 24 | Client call (12:00 Mon 08-31) never happened | Onsite | 08-31 | **3** | Grace |
| 25 | Blogs 2/month, committed to client | Capsule & Tonic | 08-31 | **3** (none since 06-04) | Beth |
| 26 | 17 launches promised by mid-Aug, 9 delivered | Fresh Blends | ~08-15 | **19** | You |
| 27 | Media kit + podcast updates | Pritzker | pre-OOO ~08-11 | **23** | Jenny |
| 28 | Lead-tracking discrepancy (2 unanswered asks) | Capsule & Tonic | none set, 06-30 | 65 `elapsed` | taj |

**Fifteen of these 28 name you as owner or co-owner.** Items 7, 9, 10, 11 and 22 are each under an hour of work and each unblocks someone else.

**Note on the "3 days late" cluster.** Items 2, 6, 14, 20, 21, 24 and 25 all came due when August closed. Individually small; collectively they say the same thing — a month's worth of client-facing commitments landed on 31 August and none of them cleared. That is a month-end process gap, not seven separate lapses.

### Security queue (separate, do this week)
1. Rotate WP Engine credentials for thehopewellnesscenter.com (exposed 24 days)
2. Rotate the Deborah Mara GoDaddy credentials
3. Rotate the two Capsule & Tonic credentials
4. Confirm the Puttery Resy API credential is rotated before use
5. Stop relaying MFA codes through channels — move to delegated access

---

## 6. AUTOMATION OPPORTUNITIES, RANKED BY LEVERAGE

### 1. Conversion → named-lead reconciliation *(closes 4 clients' worth of broken promises)*
The single highest-value build. Four active clients — Omega, KJB, Onsite, Fresh Blends — are all stuck on the same question, all have written promises outstanding, and all have budget decisions frozen behind it. Combined monthly spend across them exceeds $2,500.

**What repeats:** pull platform conversions → pull call records → pull form submissions → match to a named person → get outcome from client → produce a per-lead table. Today this is done by hand, badly, or not at all, and the honest blocker is usually the last step (clients don't reply).

**Build:** one reconciliation template per client that ingests platform + CallRail/WhatConverts + form data, produces a per-lead table with a **blank outcome column**, and ships it to the client *as the ask*. Stop promising the answer; ship the 80% and make the missing 20% visibly theirs. Melissa Silber already proposed the Zapier half of this on 2026-06-10 10:12:49 for KJB and it was never built.

### 2. Written-commitment register *(prevents this entire report from being needed again)*
28 overdue items existed and nothing in your stack tracked a single one. `CONTROL.md` tracks work items; it does not track "I'll have it by Friday" typed into a channel.

**Build:** a weekly job that scans your client channels for dated commitment language (*"by Friday", "next week", "EOD", "in August", "I'll send"*), extracts speaker + date + promise + channel, and writes to a dated register with an age column. Anything past due surfaces in your Monday view. This is directly implementable with the Slack read tools you already have connected, and it is the cheapest insurance in the list.

### 3. Weekly and monthly client reporting *(highest volume, lowest variance)*
Appears in **13 of 19** client channels in near-identical format. Four went out within 23 minutes of each other on 2026-08-17 — including for NKCDC, which had no work to report. You already run parts through Cursor/Claude. You asked for exactly this in #nexla today.

**Build:** one report generator, per-client config (logo, brand colors, data sources, dashboard URL), producing the PDF + the Netlify dashboard refresh + the Slack post. **Add a hard rule: a report for a paused account gets a one-line "no activity" note, not a full packet.**

### 4. Access and credential provisioning *(recurring multi-week blocker + live security risk)*
Access requests are the #1 cause of multi-week stalls: Omega 73 days, Puttery 7 open gates, Deborah Mara, Pritzker, Bridge, Pro Fence. And credentials are moving in plaintext through channels.

**Build:** a per-client access matrix (system → owner → route → verified date → vault locator) with a standard request email. The vault already has the schema for this — `accessRefs` and Access Broker — but coverage is `2/65 systems verified`. Fill it. This kills a recurring blocker *and* the plaintext-credential habit in one move.

### 5. Lead intake and triage *(high volume, state lives nowhere)*
`#gmbs-reinstatement` and `#ghl-leads-apollo` take a Zapier card per submission; a human reads it, judges spam, claims it verbally (*"Calling"*, *"Contacted"*, *"u can take this"*), works it, and separately types it into HubSpot. Jason confirmed today that HubSpot tracking still isn't wired: *"we just got marketing hub, we'll be able to track everything to a 't' soon, still sorting the integration partner"* [2026-09-03 13:47:12].

**Build:** Slack card → HubSpot record on creation, with claim/status as a reaction or button that writes back. mac's 2026-09-01 request — all leads into one sheet, one tab — is the manual version of the same need.

### 6. GBP content calendar and scheduling *(already proven delegable)*
3×/week posting plus monthly calendar drafting recurs across Capsule & Tonic, Deborah Mara, Onsite, KJB, Hope Wellness. A Loom SOP exists (2026-08-25 15:59:13) and Allison Walden was successfully trained on it. **This one is solved — just apply it to the other four accounts.**

### 7. Outbound prospect site builds *(you already batch it)*
Your 25-at-a-time build → source/phone verify → desktop/mobile/preview/prod QA → Maps embed → sheet row [2026-08-31 16:10:29] is the most mature repeatable process in the workspace. Worth extracting into a documented pipeline others can run.

### 8. Cross-posting and outreach logging *(low value, high annoyance)*
Manual download-and-reupload between two Buffer accounts; manual copy-paste of IG/LinkedIn/Apollo replies into a spreadsheet. Real toil, but small money. Do it after 1–5.

### 9. The monthly "360 Referral Program Reminder" *(a bot posts it; nobody tracks it)*
Three mandated actions per retainer client per month — free value-add, referral mention, CSAT survey. **I found no completion tracking in any channel.** Either instrument it or stop posting it.

---

## 7. WHAT I COULD NOT VERIFY

Stated plainly, because you asked me to distinguish claim from fact.

1. **Whether anything was actually sent to Tori on 17 August.** Only an intent statement exists. Sends went by email.
2. **Whether Tori attended the 3 September call.** A call ran; no message names her as present.
3. **Bridge contract value and milestone pricing.** 17hats link only, never a figure.
4. **Whether Joseph approved reallocating LSA money** to the $450 review removal in Hope Wellness. No confirmation in the channel. Check the mailbox before treating that spend as authorized.
5. **Whether Pro Fence's weekly client emails are actually going out.** Shehzad claims yes; Beth prompted twice. No cc trail visible inside Slack.
6. **Whether Bella's ELI monthly report went out on 09-01.** Committed, never confirmed.
7. **Retainer amounts for Capsule & Tonic, Everyday Life, Hope Wellness, Omega, Onsite, Pro Fence.** Not stated in their channels. **#pro-fence-deck contains no dollar figure of any kind** — no retainer, invoice, budget or spend. (Pritzker's $1,200/mo was found on re-check; my first pass missed it because the figure sits in the channel's opening messages from 2026-06-16, not in recent traffic. Worth noting as a lesson: recent-history sampling misses commercial terms, which are almost always set at channel creation.)
8. **Attachment contents.** PDFs, PPTs, screenshots, the Excel citation sheet, and the Bridge Phase 1 Task Tracker canvas were not opened. Several key claims live inside those files.
9. **DM traffic beyond targeted searches.** Two overdue items surfaced from DMs incidentally; a full DM sweep would likely find more.
10. **Vault freshness.** `CONTROL.md` was reconciled 09/01/2026 but its embedded health probe is dated 8/16 and self-reports `degraded`. Registry generated 2026-08-07. Treat vault "current evidence" older than 14 days as stale — the vault's own ranking logic already does.

---

## 8. IF YOU DO SIX THINGS THIS WEEK

1. **Hope Wellness virus claim** — respond today with a scan result on the delivered files. This is trust, not support.
2. **Fresh Blends click-to-directions KPI** — one number. Unblocks Ruben, the deck, the meeting, and possibly the pause.
3. **Pritzker: get one post live** — ~$3,600 billed across three months against zero published posts. Of everything here, this is the item most likely to become a refund conversation.
4. **Bridge milestone acceptance sheet** — three paid milestones, zero signatures, and a contradiction in the record you should correct yourself before someone else finds it.
5. **Fagan AEO/GEO** — $500–600/mo, client said yes, you said "Yes!" on 25 August and again committed to September. Two deadlines of your own making, both passed.
6. **Rotate the four exposed credentials.**

Then build the commitment register (§6.2). It is the only item on this list that stops the list from regenerating.

---

## Appendix: how this report was checked

Every channel was read directly, not sampled from search. `#bridge-software-development` was paged to channel creation and re-read in detailed mode to surface thread replies, which do not appear in channel history and which changed two conclusions.

A second pass independently re-verified seven load-bearing claims against source. **Four were wrong and are corrected above:**

| Original claim | Correction |
|---|---|
| Dillon never replied to Melissa Silber's 25 Aug AEO request | He replied *"Yes!"* in thread at 10:22:06 — which makes the commitment earlier and the miss worse |
| Omega: seven promises from 07-13 | Seven explicit ones from **07-20**; nine if you count the loose 07-13 line and the Cursor-agent post |
| Hope Wellness: first video never delivered | It was sent for review 2026-09-01, 13 days late — the virus message proves receipt |
| Pritzker: no dollar figure in the channel | **$1,200/mo**, set 2026-06-16. Missed on first pass because commercial terms sit at channel creation, not in recent traffic |

Three claims verified clean: Bar Crawl billing, Revive's unpublished articles, KJB's pause and spend (with one nuance added).

**The lesson worth keeping:** sampling recent history finds what is on fire but misses what things cost. Commercial terms are set when a channel opens and almost never restated.
