---
tags: [system, runbook, ads-ops]
source: "[[raw/2026-07-04 - full-autonomy-directive]]"
updated: 2026-07-04
---

# Chrome Session Runbook — the local half of Ads Ops

The remote loop analyzes and writes Action Packets; **this session is the
hands**. Runs on Dillon's machine, ~10–15 min per cycle.

## One-time setup (~20 min)

1. **Chrome profile "Claude Ops"** — create a separate Chrome profile (not
   your daily one, keeps it private). Log it into: Meta Business Suite / Ads
   Manager, Google Ads MCC, Zapier, Google Drive, and Bitwarden **browser
   extension**.
2. **Bitwarden scoping — two-account org pattern (adopted 2026-07-04):**
   - Dillon creates a Bitwarden **organization** with collection
     `Claude Client Access`, sharing only client/ads/delivery logins into it.
   - Second member account "Claude" invited via **dillonmohr8777+claude@gmail.com**
     (plus-alias — invite lands in Dillon's inbox; he accepts and sets a fresh
     generated master password).
   - Claude member gets **read-only** ("can view") access to the collection.
   - That account stays logged into the Bitwarden **extension in the Claude
     Ops profile** (PIN unlock). The agent uses autofill; it never sees,
     types, stores, or exports the master password or any credential.
   - Revocation = remove the member from the org. Event log audits every access.
3. **Claude in Chrome extension** installed in that profile (Chrome Web Store).
4. **Vault local** — `git clone` (or pull) `dillon-os` to the machine.

## Every-2-days apply session

```
cd ~/dillon-os && git pull && claude --chrome
```

Then say: **"Run the ads-ops apply session."** The agent will:

1. Open the latest `Daily-Briefs/ads-ops/` Action Packet.
2. **Export first**: pull campaign / search-terms / geo / change-history
   reports for every account in `02_Campaigns/Ads Ops/` → save to
   `raw/ads-exports/YYYY-MM-DD/` → commit.
3. **Apply the packet** item by item in Meta/Google/Zapier — you watch; it
   pauses at logins/CAPTCHAs. New campaigns created paused; budget jumps >20%
   skipped and flagged.
4. **Verify each change separately** (saved ≠ visible; Tag Assistant for tag
   work; Zapier test lead for routing changes).
5. Log applied/skipped into the packet, commit, push. Remote loop picks it up
   next cycle.

## Standing jobs the session also owns
- [[02_Campaigns/Ads Ops/Zapier Lead Routing|Zapier lead routing]] health: Zap
  history green for every client.
- Fill spec unknowns as they're discovered (Shadow's Meta account, Fagan
  intake, Omega's Ads account ID) — update the spec pages, that's the compile.

## Scheduling the local half (optional, true hands-off)
Windows Task Scheduler / cron every 2 days:
`claude -p "Run the ads-ops apply session" --chrome` from the vault directory.
Start supervised for the first few cycles before letting it run unattended.
