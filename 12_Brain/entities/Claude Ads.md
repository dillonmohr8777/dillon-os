---
tags: [entity, tool]
source: "[[12_Brain/raw/research/2026-08-15 - research - ads-optimization-skills]]"
updated: 2026-08-15
---

# Claude Ads

**Summary:** MIT paid-media skill pack Dillon already forked; reference only
until an operator chooses to install the plugin outside this vault.

## What it is

Upstream: [AgriciDaniel/claude-ads](https://github.com/AgriciDaniel/claude-ads).
Owned fork: [dillonmohr8777/claude-ads](https://github.com/dillonmohr8777/claude-ads)
(created 2026-05-22). Read-only by default. Live changes are capability-gated
and draft-first in the upstream contract.

The fork's `skills/` tree includes `ads-audit`, `ads-google`, `ads-meta`,
`ads-server-side-tracking`, `ads-attribution`, plus other platform
sub-skills. Those files write plugin-local reports, not
`Daily-Briefs/` or `01_Clients/<Client>/Optimization Ledger.md`.

## How Dillon OS uses it

Do **not** vendor the plugin into `.claude/skills/`. Distill patterns into
the vault-native skills listed on
[[12_Brain/concepts/Ads Optimization Skill Stack]]. Optional later install
is a Claude Code plugin on the operator machine, not a cloud-agent default.

Vendor speed/check-count claims stay labeled single-source.

## Links

- [[12_Brain/concepts/Ads Optimization Skill Stack]]
- [[11_Agents/Google Ads Agent]]
