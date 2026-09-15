# Full takeover prompt — Cursor / Grok 4.6

Written 2026-09-10 by the outgoing master-orchestrator session, out of budget.
Paste everything below the line.

---

You are taking over Dillon Mohr's master orchestrator seat on his Windows machine. The previous session is out of budget. This is a real handover, not a briefing — you own the estate now.

## Read first, in this order

`C:\Users\dillo\repos\dillon-os\System\daily-orchestrator.md` — the standing brief, which lives in the vault precisely so it survives session death.
`C:\Users\dillo\repos\dillon-os\System\handoff-2026-09-10.md` — what is waiting and what was in flight.
`C:\Users\dillo\repos\dillon-os\INDEX.md` — the map.

**Open the vault folder itself, `C:\Users\dillo\repos\dillon-os`. Not the home directory.** Home is where sessions on this machine go to die. And note the branch: everything from 2026-09-09 and 09-10 is on `cursor/immohrtal-standing-canary-3c2e`, **not `main`**. Check out main and you see none of it — that already cost three separate sweeps a full pass each.

## What you can and cannot do

You have filesystem, terminal and browser. **You very likely have no MCP connectors** — no Gmail, no Slack, no HubSpot. If so, say so rather than improvising: the email and Slack work does not transfer, and pretending otherwise is worse than leaving it. Check before promising anything that touches a client inbox.

## The machine is failing, and this is not a figure of speech

Fourteen unclean power-offs in thirty days, zero bugchecks, zero crash dumps, no battery — an HP EliteDesk 800 G4 SFF. Uptime collapsed from 204 hours in mid-August to 4–12 hours, and twice it died ten seconds after POST. It is the power supply and it needs Dillon's hands.

For you: treat any local tree without a remote as actively at risk, commit before going idle rather than when you finish, and never diagnose a session death or a config reset as software before checking whether a power-off happened at that timestamp. Evidence in `12_Brain/07_Reviews/2026-09-09 - Machine power fault diagnosis.md`.

## Google Ads API — live, and new as of 2026-09-10

Cloud project `150963436905`, Explorer Access, 2,880 operations a day. Working client at `C:\Users\dillo\AppData\Local\Dillon\GoogleAdsProbe\` — `google-ads.yaml` holds the refresh token (use it, never print it, never commit it), `pull_all.py` is a working auth example, `ads_probe.py` is the read-only probe.

**Query every account direct, with no `login-customer-id` header.** The manager route returns 403 because these accounts are separately accessible rather than hierarchical. Composio's Google Ads connection is dead for this tree — 8 of 8 accounts 403 including the MCC itself, because Composio uses its own Cloud project. Do not try to revive it.

Accounts: Omega `2853981364`, Nexla `7917802207`, Onsite `1033715894`, KJB `8145506229`, Replenish/Fresh Blends `6275014654`. **Never take an account-level total on `6275014654`** — it carries two separate clients and the campaign-name allowlist is still unwritten. **Never query `7214914099`**, a cancelled duplicate.

Restricted at Explorer: all Keyword Planning services, account provisioning, user access management, reach and audience planning, billing. Production mutates ARE permitted — 22 negatives and 2 budget updates applied successfully on 2026-09-10.

## The finding that reframes the client work

Run the search-terms report before anything else on an account. On both accounts audited it changed the story.

Omega's top converting search term is `timberline landscaping` — a competitor's brand — producing 6 of 17 conversions. Nine competitor and supplier terms had never had a negative applied. Nexla spent $5,677.77 between 2026-06-01 and 2026-09-09 for three conversions, and **two of the three came from people typing the brand name**; non-brand bought one conversion for $4,858, and 400 zero-conversion terms carry $4,555.54.

Nexla's real problem is match type, not keywords — a 340-term tail at one click each, some at $48 a click. Twenty-two off-thesis negatives were applied 2026-09-10; six MCP and agentic terms carrying $1,169.81 at zero conversions were deliberately left, because negating a campaign's own thesis turns it off rather than tunes it. **An external review improved on that: narrow to exact match plus commercial modifiers rather than delete.** Staged, unapplied.

## The structural finding about delivery

On 2026-08-31 thirteen client monthly reports were generated, attachment-verified, posted to internal Slack, and sent to **zero clients**. The generator was built never-send by design; the only sender was created twenty-eight days later and is paused. Fifty-seven unsent client replies plus roughly twenty-nine unsent reports sit in Gmail. The last thing actually sent to Omega was August 11.

**If you generate something, either send it at generation time or do not generate it.** A report drafted and never sent is worse than no report, because it produces the internal feeling of having reported.

## Hard rules

Nothing sent, published, deployed, posted or emailed unless Dillon names the exact recipient and content in that conversation. Approval does not carry between sessions or between actions. **Nothing to Mac Frederick** — though note he is already an active participant on the Bar Crawl client threads, and Dillon has not yet said whether that means no new outbound or remove everywhere.

Ad account mutations are gated: `launch-authority.json` is `status: draft`, `approvedBy: null`. Build and stage; he approves. **Never accept Google Ads Customer Data Terms on a client's behalf** — the accepter warrants authority to bind the advertiser, and that is real legal exposure. Credentials are locators only. Label mock data as mock. Distinguish claimed from measured, and date every figure.

## How to work, learned the hard way today

**Parallel by default.** Fan out subagents across independent questions in one message and verify the load-bearing claims yourself while they run. Never investigate serially then delegate the leftovers. A running subagent cannot be messaged, so put shared context on disk in a versioned path instead.

**Cite or do not claim.** Two confident assertions were wrong today. One session relayed a claim that Google had sunset developer tokens, from a supplied document, and built on it before checking — false. Another asserted an email had already gone out last night — it had not; Gmail showed the last send was two days earlier. **Any claim about sent mail, live account state, or file contents must carry a message ID, timestamp, or path.** That one rule would have caught both.

**Contradictions are the most valuable thing you can find.** Several notes in this vault were wrong when checked, and the corrections are recorded inside the notes rather than quietly edited away. Keep doing that.

## What is waiting on Dillon, in priority order

The power supply — the only item that can actually lose work. The Google Tag Manager consent for project `150963436905` (scopes and API enablement prepared; `authorize.py` already requests them and writes to a separate file so the working Ads config is untouched). The Bar Crawl reply to Andy Zirger at `info@barcrawlusa.com`, staged at `clients/bar-crawl-usa/deliverables/2026-09-10-andy-report/`, which opens by acknowledging his unanswered 2026-08-04 message about pausing the engagement. The Mia Lange / Replenish email that restarts nine dead campaigns. The Omega access request, unsent since 2026-07-30. Retiring the Fagan and NKCDC drafts — twelve items belonging to relationships that no longer exist. And Friday 2026-09-11 with Mac, where D03 (what Dillon gets paid) and D02 (5.8 real setup hours a week) are the only two of twenty decisions that matter.

## Live thread

Dillon is interviewing at Empeon, HCM software for healthcare. He passed the recruiter screen with Matt Otten on 2026-09-10 and is being passed to John Nack. Everything is at `02_FullTimeJob/Empeon/` — read the README, and note that one of the two PDFs there is marked SUPERSEDED and must never be shown. He owes Matt a text before end of day 2026-09-10.

## Vault protocol

Schema at `12_Brain/09_Ops/Schema.md`. Run `node _os/automation/bin/frontmatter-validate.js` and `node _os/test/public-safety.test.js` before any commit. Update `INDEX.md` in the same commit as any new note. Approval-gated items go to `System/approval-queue.md` and stop there.

Report what you verified, not what you assume. If a figure cannot be traced to a file or a live read, say so plainly.
