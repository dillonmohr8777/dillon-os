---
tags: [inbox, action, ads-ops]
source: "[[entities/Ops Box (EliteDesk 800 G4)]]"
updated: 2026-07-04
---

# Ops Box day-one setup (July 8)

~45 minutes total, in order. The machine: [[entities/Ops Box (EliteDesk 800 G4)]].

## 1. Base (10 min)
- [ ] Windows updates, sign into OneDrive (Align account — unlocks old-machine history)
- [ ] Install: Chrome, Git, Node.js LTS, Claude Code (`npm install -g @anthropic-ai/claude-code` or the desktop installer), Bitwarden desktop + browser extension
- [ ] Power settings: never sleep (it's an always-on box)

## 2. Vault (5 min)
- [ ] `git clone` dillon-os to **C:\dillon-os** (NOT inside OneDrive — one sync system only)
- [ ] `cd C:\dillon-os && claude` once, verify it loads CLAUDE.md

## 3. Claude Ops Chrome profile (15 min) — per [[System/Chrome Session Runbook|runbook]]
- [ ] New Chrome profile "Claude Ops"; install Claude in Chrome extension
- [ ] Log in: Meta Business Suite, Google Ads, Zapier, Google Drive
- [ ] Bitwarden extension → only the `Claude Ops` collection
- [ ] Test: `claude --chrome` → "open Google Ads and list my accounts"

## 4. First apply session (15 min)
- [ ] Run the ads-ops apply session from the runbook — it will export account
      data (filling the specs' unknowns: Shadow's Meta account, Fagan intake,
      Omega's Ads ID) and execute the first Action Packet
- [ ] Fix Shadow's instant form + build its Zap while in there (specs:
      [[02_Campaigns/Ads Ops/Shadow HVAC Ads Spec|Shadow]],
      [[02_Campaigns/Ads Ops/Zapier Lead Routing|Zapier]])

## 5. Schedule it (5 min)
- [ ] Task Scheduler: every 2 days, `claude -p "Run the ads-ops apply session" --chrome` from C:\dillon-os (supervise the first few runs)
- [ ] Optional: nightly `claude -p "/vault-compile"` — the brain feeds itself

## 6. When there's time: the history heist
- [ ] Check OneDrive for the old machine's `.codex` session archive + old vault
      (paths in [[entities/Codex Workspace (Legacy)|Codex Workspace (Legacy)]])
      → copy into `raw/` staging → tell the agent to run the backfill compile
