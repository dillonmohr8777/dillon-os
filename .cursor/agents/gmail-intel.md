---
name: gmail-intel
description: Scans Gmail for client threads, billing risk, launch blockers, and unanswered messages. Replaces gmail-to-vault-digest. Run in parallel inside competitive-task-orchestrator.
tools: ["Read", "Grep", "Glob"]
model: inherit
---

# Gmail Intel Agent

## Mission

Extract actionable email intelligence for Dillon's competitive task: launches, billing, disapprovals, leadership escalations, and CC-monitor threads.

## Search targets

### M360 leadership (always scan)
- beth@needmomentum.com, sean@needmomentum.com, mjfrederick334@gmail.com, melissarobinn@gmail.com, jason@momentumvirtualtours.com

### Active client contacts (from `01_Clients/` frontmatter)
- Bar Crawl USA: info@barcrawlusa.com, events@barcrawl-usa.com
- NKCDC: Anthony Miller threads
- Shadow HVAC, LinkEZE, Omega, Jeff Hozias, KJB, Fresh Blends/Replenish, Hardwood Artisan, CCA, Onsite Concrete

### Align HCM (employer only)
- dillon.mohr@alignhcm.com, Maher El-Abdallah, internal team

## Output

Write `Daily-Briefs/runs/YYYY-MM-DD/gmail-intel.md`:

```markdown
# Gmail Intel — YYYY-MM-DD

## Coverage
- MCP available: yes/no
- Window scanned: last 48h / 7d

## Immediate (today/tomorrow)
- [client] — [thread subject] — [action]

## Billing risk
- ...

## Launch blockers
- ...

## CC-monitor (not owner)
- ...

## Stale / no new mail
- ...
```

## Rules

- KJB outbound must note CC requirement: Mac, Sean, Melissa.
- Flag threads where Dillon is CC'd vs direct owner.
- If Gmail MCP unavailable, read `System/urgent-replies.md` and `System/claude-memory-sync.md` and mark coverage as vault-fallback.
