# Competitive Task — 2026-05-29

⚠ **Coverage gap:** Gmail and Slack MCP were unavailable this run. Vault data last synced **2026-04-15**. Treat P0 items below as **stale until you confirm in live inbox**. This run also **installed** the umbrella orchestrator (replaces 7 legacy crons).

## Coverage

• **Gmail:** STALE — vault fallback from `System/urgent-replies.md` and client Gmail intel sections
• **Slack:** STALE — no connector this run; check DMs manually
• **Vault pulse:** 138 client files, **0 modified in last 7 days** — vault is not the live source of truth right now
• **Codex / sessions:** `10_Sessions/` sparse; automation debug log empty; Facebook Ads build logs present but idle
• **Content routines:** BOK Law + Align LinkedIn calendars exist; Sunday generation branches not verified since April
• **Ads / SEO:** Last known P0s from memory sync (April)

---

## P0 — Do first (max 3)

1. **NKCDC — launch blocked** — Anthony has not responded to Dillon (2026-04-13) or Mac (2026-04-15). Free Tax Prep campaign cannot launch until NKCDC ships landing page. *Confirm in Gmail whether anything moved since April.*
2. **Hardwood Artisan — billing risk** — Sean's card-update request (2026-04-07) still outstanding. Dalton said "give me a few days" on 2026-04-01. Engagement may pause. *Verify billing status before any other client work.*
3. **Bar Crawl USA — ad disapprovals** — Andy forwarded 2 disapprovals (Halloween / Fall Cocktail Crawl). Dillon said he'd investigate 2026-04-15. Owe resolution. *Use pre-approved copy library only; zero alcohol language.*

---

## P1 — Today if P0 clears

• **Commercial Cleaners Alliance** — Creative delivery audit (committed 2026-04-08). Confirm Buzz Bull / CCA Teams meeting status with Mike Ross (projectcorporate.com).
• **Kimberly James Bridal** — Timeline page publish + GA4/GSC indexing check (Mac, 2026-04-13). CC leadership on any Kim email.
• **Fresh Blends / Replenish** — Confirm 2026-04-13 launch went live; send first-week snapshot to Mia.
• **LinkEZE** — Enhanced conversions diagnostics + MFA on 809-600-6448.
• **Jeff Hozias** — Launch approved seller Meta campaign (copy approved 2026-04-14).
• **Shadow HVAC** — LSA serving verification + catch-up report to Mike (quiet since 2026-03-02).
• **Omega Landscaping** — David drone footage + Thursday meeting with John Belaska (Dillon CC'd).

---

## P2 — This week

• **Onsite Concrete** — Weekly call cadence (Thursdays 1:00 PM ET with Sean).
• **BOK Law** — Weekly social cadence (Wed Wisdom, Turn the Page Thu, Family Fri).
• **Align HCM** — LinkedIn calendar (employer work, not M360): Mon thought leadership, Wed SmartCare, Fri personality posts.
• **Vault hygiene** — Add `last_touched`, `next_action`, `due` frontmatter to client notes so future runs can detect stalls automatically.

---

## Content cadences due

• **BOK Law** — Next Sunday 6:00 PM ET generation window (inside umbrella cron). Deliver drafts to Dorothy/Aleksandra/Rachael by Tuesday AM.
• **Align HCM LinkedIn** — Next Sunday 9:00 PM ET generation window. May calendar marked built; verify posts actually scheduled.
• **Align HCM SEO blogs** — `SEO/AlignHCM/Blogs/` has 9 drafts; Thursday deep-sweep branch should queue publish/review.

---

## Stale vault flags

• Entire `01_Clients/` tree: **no mtime updates in 7+ days** (as of 2026-05-29)
• `System/claude-memory-sync.md` — last_sync 2026-04-15
• `Daily-Briefs/pulse-today.md` — 2026-04-15
• `System/urgent-replies.md` — 2026-04-15

**Action:** Re-run orchestrator with Gmail + Slack MCP connected, or manually refresh vault from inbox before trusting priority order.

---

## Source sections

### Gmail (vault fallback)

• Bar Crawl USA — Andy disapprovals — P0 — Dillon owns resolution
• NKCDC — Anthony silence — P0 — Mac running point, Dillon blocked on launch
• Hardwood Artisan — Sean billing card — P0 — Sean owns send, Dillon monitors
• Commercial Cleaners Alliance — Mike Ross Teams invite — P1 — confirm attendance
• Omega Landscaping — John Belaska Thursday sync — P2 — Dillon CC monitor

### Slack

• **No data this run.** Check M360 internal + client DMs for duplicates of NKCDC, Bar Crawl, Hardwood threads.

### Vault pulse

• Active clients (24h touch): **none**
• All pending deliverables sourced from `System/claude-memory-sync.md` (April snapshot)
• Frontmatter gaps: most client notes lack live `last_touched` / `due` fields

### Codex / sessions

• `10_Sessions/Facebook Ads System Build Log.md` — active build context, no open automation errors logged
• `10_Sessions/Automation Debug Log.md` — empty (clean)
• This run: created umbrella orchestrator at `System/competitive-task-orchestrator-prompt.md` + `.cursor/agents/*`

### Content routines

• BOK Law Sunday branch: **due next Sunday**
• Align LinkedIn Sunday branch: **due next Sunday**
• Daily flag: content calendars exist but haven't been validated since April

### Ads / SEO / domain

• Bar Crawl USA — 2 disapprovals, Taco & Tequila waves 2026-04-25 and 2026-05-02 (dates may have passed — verify live account)
• Fresh Blends — launch verification pending
• LinkEZE — enhanced conversions diagnostic open
• Align HCM SEO — 9 blog drafts in queue for Thursday sweep

---

## One workflow, not seven

Legacy crons retired into this single 1:00 PM ET pass:

| Old cron | Now handled by |
|----------|----------------|
| nightly-client-pulse | vault-pulse |
| gmail-to-vault-digest | gmail-intel |
| vault-integrity-sync | memory-consolidator |
| chat-to-vault-sync | codex-session-sync + memory-consolidator |
| bok-law-social-content | content-routines (Sun branch) |
| linkedin-growth-engine | content-routines (Sun branch) |
| book-site-seo-sweep | domain-ads-seo (Thu branch) |

**Your daily read:** this file. **Orchestrator prompt:** `System/competitive-task-orchestrator-prompt.md`
