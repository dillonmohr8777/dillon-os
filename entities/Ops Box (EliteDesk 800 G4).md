---
tags: [entity, hardware, ads-ops]
source: "[[raw/2026-07-04 - full-autonomy-directive]]"
updated: 2026-07-04
---

# Ops Box (HP EliteDesk 800 G4)

The always-on machine that runs the **local half of Ads Ops** — successor to
the retired Intel Core 7. Ordered 2026-07-03 (Walmart, $529.95, refurb
"Like New"), **arriving 2026-07-08**.

Specs: i7-8700 (6c/12t, 3.2GHz), **64GB DDR4**, 1TB NVMe, Wi-Fi, Windows 11
Pro, SFF. More than enough for its job: Claude Code sessions, the Claude Ops
Chrome profile, git, scheduled apply sessions.

Jobs it owns once set up:
1. Every-2-days **apply session** ([[System/Chrome Session Runbook|runbook]]).
2. The Claude Ops Chrome profile (Meta, Google Ads, Zapier, Drive, Bitwarden).
3. Old-machine history recovery: sign into the same OneDrive account and the
   Intel Core 7's session archive becomes reachable
   ([[entities/Codex Workspace (Legacy)|paths here]]) — the 448-session
   backfill payload.
4. Vault clone (git is the sync layer — do NOT let OneDrive sync the vault
   folder itself; clone to `C:\dillon-os`, outside OneDrive).

Setup checklist: [[00_Inbox/Ops Box Day-One Setup|Day-One Setup]].
