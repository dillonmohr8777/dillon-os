# Dependency: PR #226 (do not duplicate)

**Branch:** `cursor/dillon-os-agentic-build-out-6254`
**PR:** https://github.com/dillonmohr8777/dillon-os/pull/226

**Merge-base with this branch:** shared ancestor on `main` (no path collision with this PR's new files as of 2026-07-29).

## What #226 owns (consume, do not copy)

| Path | Role for this PR |
|---|---|
| `_templates/site-factory/harvest.js` | Produces `decaySignals` + brand/copy used by `_os/automation` qualify scorer |
| `_templates/site-factory/build-site.js` / `build-batch.js` / `qa.js` / `base.css` | Downstream of qualify — build queue feeds these |
| `philly-sites/DESIGN-SYSTEM.md` | Canonical site spec |
| `02_Campaigns/AI Site Builder Outreach Engine/*` | Mac's Maps → QR → mail pipeline contract |
| `.claude/skills/site-factory`, `site-batch`, `mirror-and-improve`, `ui-design`, `ux-audit`, `frontend-build`, `motion-design`, `slack-intake` | Design/build skills |
| `AGENTS.md`, `.cursor/rules/*` | Agent operating rules |

## What this PR (#228) owns

| Path | Role |
|---|---|
| `12_Brain/**` | Registry, queue, state, schemas, Base stubs, Sync reconciliation |
| `_os/automation/**` | Frontmatter validate/repair, site-health sentinel, shared discover/qualify + Indeed adapter |
| `08_Prospects/**` | Prospect notes emitted by qualify (draft-only) |
| `00_Inbox/Automation Deep Analysis 2026-07-29.md` | Implementation contract |

## Collision policy

If #226 is merged first: rebase this branch; expected conflicts are limited to `AGENTS.md` / skill index docs if both edit them. Preserve both:

- Keep #226's site-factory and campaign pack verbatim.
- Keep this PR's `12_Brain` + `_os/automation` verbatim.
- Update `AGENTS.md` vault map to list both `_templates/site-factory/` and `12_Brain/` + `_os/automation/`.

If this PR merges first: #226 should add the same vault-map lines when it lands.

## Harvest shape this scorer expects

From `harvest.js` output `harvest/<slug>/harvest.json`:

```json
{
  "slug": "example",
  "siteUrl": "https://example.com",
  "decaySignals": {
    "missingViewport": true,
    "staleCopyrightYear": "2019"
  },
  "facts": { "phone": "", "hours": "" },
  "voice": { "paragraphs": [], "headings": [] }
}
```

The qualify scorer also accepts richer optional decay fields (`noHttps`, `noSchema`, `thinCopy`, `tableLayout`, `slowLoadMs`) so future harvest upgrades flow through without a rewrite.
