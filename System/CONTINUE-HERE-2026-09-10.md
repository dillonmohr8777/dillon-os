# Continue here — written 2026-09-10, out of budget

The Claude weekly limit was hit at 2026-09-10. **Resets Sep 14, 2am ET.** Four
research agents died mid-flight on HTTP 429; six finished and their output is
on disk. This file is the handover.

**Everything from 09-09 and 09-10 is on branch
`cursor/immohrtal-standing-canary-3c2e`, not `main`.** Check out main and you
see none of it. That has already cost three sweeps a full pass each.

---

## 1. What to do about the budget

**Cheap agents are the answer, and they are already available.**

- **Claude Sonnet** — `/model sonnet` in any Claude Code session. Roughly 1/5
  the cost of Opus and entirely adequate for every task in §3 below. Most of
  what is left is mechanical: apply a staged change, run a script, file a note.
  Nothing left needs Opus.
- **Cursor with Grok 4.6** — full takeover prompt already written at
  `System/TAKEOVER-cursor-grok.md`. Paste everything below the line in that
  file. It is current except that it predates this document; read both.
- **Gemini** — `GEMINI_API_KEY` is in the Windows user environment. Model
  `3.5-flash` works; 2.5-flash and 2.5-pro 404. Verified 2026-09-07.
- **Antigravity is dead.** Do not spend more time on it.

**The rule that matters more than the model choice:** these tasks are staged
and specified. Point a cheap agent at a named file and a named outcome, not at
"figure out what to do next."

---

## 2. Priorities, in order

**P0 — The power supply.** HP EliteDesk 800 G4 SFF. 14 unclean power-offs in
30 days, zero bugchecks, zero crash dumps, no battery. Uptime collapsed from
204 hours in August to 4–12 hours, twice dying **10 seconds** after POST. It is
the PSU. **Yes, you have to buy one — ~$50–80** for a compatible SFF unit; it
is the only item on this list that can actually lose work, and no session can
fix it. Evidence:
`12_Brain/07_Reviews/2026-09-09 - Machine power fault diagnosis.md`.

**P1 — Empeon, before you speak to Nack.** Two research notes landed today and
they contain corrections to your own files. Read them:
- `02_FullTimeJob/Empeon/2026-09-10 - Nack briefing and the expansion problem.md`
- `02_FullTimeJob/Empeon/2026-09-10 - CDPAP, the SEO gap, and market structure.md`

Three things must not reach the room uncorrected: the August audit cites the
**3.48 HPRD staffing mandate as current** (repealed 2025-12-03); the **98.5%
retention figure is not found anywhere public** (their site says 97.5% and
"<1% churn"); and the **9,000+ organizations figure is Apploi's, not
Empeon's.**

**P2 — Bar Crawl.** Report and email staged at
`clients/bar-crawl-usa/deliverables/2026-09-10-andy-report/`. **Not deployed,
not sent.** It opens by acknowledging Andy Zirger's unanswered 2026-08-04
message about pausing the engagement. Needs a Netlify deploy and then your
explicit go on the send to `info@barcrawlusa.com`.

**P3 — Nexla.** Match-type narrowing staged and unapplied — narrow to exact
match plus commercial modifiers rather than deleting the six MCP/agentic terms
carrying $1,169.81 at zero conversions. Also add
Microsoft-Certified-Professional negatives (`sql`, `windows server`,
`certification`, `exam`, `mcse`) — the account is buying a different MCP.
Conversion goals still need `SUBMIT_LEAD_FORM/WEBSITE` made biddable, and a
**new** conversion action created — do not reuse the dead label
`lf1HCMiSo_4ZEKXNrbko`.

**P4 — GTM workspace 73.** Consent click still pending, and **the staged work
is itself defective** — two known defects must be fixed before any publish.
Nothing publishes without your per-action approval.

**P5 — Text Matt Otten.** Draft at
`02_FullTimeJob/Empeon/2026-09-10 - Matt EOD text draft.md`. Was due end of day
2026-09-10.

---

## 3. What did not finish

| Item | State | What it needs |
|---|---|---|
| Bar Crawl deploy + send | staged | Netlify deploy, then explicit send approval |
| Nexla match-type narrowing | staged | apply via `GoogleAdsProbe` client |
| Nexla conversion goals | diagnosed | make SUBMIT_LEAD_FORM biddable, create new action |
| MCP negatives | specified | 5 terms listed above |
| GTM workspace 73 | blocked | consent, then fix 2 defects, then approval |
| End-to-end conversion proof | blocked | needs a business-domain test mailbox; the form rejects gmail.com |
| Google Ads Basic Access | blocked | needs Search Console domain verification, and it moves the OAuth app out of Testing, which affects the working Ads probe |
| HubSpot portal 3222786 | never granted | browser identity was Momentum's own portal 50612503 = **Jason Fallon**. Your suspicion was right. |
| Empeon: are the ebooks gated? | unresolved | no crawler reaches the form. Ask Nack. |
| Empeon AI Overview presence | not measured | needs a working browser or a SERP API with an `ai_overview` field |
| 4 research agents | killed by 429 | shift-swap competitors, HubSpot verify, GTM strategy, precedents — the last two returned partial results that ARE captured in the notes |

---

## 4. Google Ads — the working setup

Client at `C:\Users\dillo\AppData\Local\Dillon\GoogleAdsProbe\`. Cloud project
`150963436905`, Explorer Access, 2,880 ops/day. `google-ads.yaml` holds the
refresh token — use it, never print it, never commit it. `pull_all.py` is a
working auth example.

**Query every account direct, with no `login-customer-id` header.** The manager
route 403s because these accounts are separately accessible, not hierarchical.
Composio is dead for this tree and cannot be revived — it uses its own Cloud
project.

Accounts: Omega `2853981364`, Nexla `7917802207`, Onsite `1033715894`, KJB
`8145506229`, Replenish/Fresh Blends `6275014654`. **Never take an
account-level total on `6275014654`** — two clients share it and the
campaign-name allowlist is unwritten. **Never query `7214914099`**, a cancelled
duplicate.

Restricted at Explorer: all Keyword Planning (confirmed today —
`DEVELOPER_TOKEN_NOT_APPROVED`), account provisioning, user access, reach and
audience planning, billing. **Production mutates ARE permitted** — 22 negatives
and 2 budget updates applied successfully 2026-09-10.

---

## 5. Standing rules that do not lapse with the session

- **Nothing sent, published, deployed, posted or emailed** unless you name the
  exact recipient and content in that conversation. Approval does not carry
  between sessions or between actions.
- **Nothing to Mac Frederick.** Standing 2026-09-10. Note he is already an
  active participant on the Bar Crawl threads, and you have not said whether
  that means no new outbound or remove everywhere.
- **Never accept Google Ads Customer Data Terms on a client's behalf.** The
  accepter warrants authority to bind the advertiser. Real legal exposure.
- **Credentials are locators, never values.**
- **Run the search-terms report before anything else on an ad account.** On
  both accounts audited it changed the story.
- **If you generate something, either send it at generation time or do not
  generate it.** On 2026-08-31 thirteen client reports were generated,
  attachment-verified, posted to internal Slack, and sent to **zero clients**.
- **Cite or do not claim.** Any statement about sent mail, live account state
  or file contents carries a message ID, timestamp or path. Two confident
  assertions were wrong today and that one rule would have caught both.
- **Parallel by default**, and put shared context on disk in a versioned path —
  a running subagent cannot be messaged, but it can read a file.

---

## 6. Vault protocol

Schema at `12_Brain/09_Ops/Schema.md`. Run
`node _os/automation/bin/frontmatter-validate.js` and
`node _os/test/public-safety.test.js` before any commit. Update `INDEX.md` in
the same commit as any new note. Approval-gated items go to
`System/approval-queue.md` and stop there.

Report what you verified, not what you assume. If a figure cannot be traced to
a file or a live read, say so plainly.
