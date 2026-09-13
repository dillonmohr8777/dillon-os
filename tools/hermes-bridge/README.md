# Hermes Bridge — Cursor Cloud x Local Operator

Hermes is the operator shell. This vault is the durable workspace. Cursor Cloud Agents run Align / vault lanes when Hermes is offline.

## Model access (requested 2026-07-21)

Hermes and Cursor workers are authorized to use:

| Role | Model slug | Use for |
|------|------------|---------|
| Fast research / visibility / blunt audits | `cursor-grok-4.5-high` / `cursor-grok-4.5-high-fast` | SERP/AEO checks, triage, critique |
| Paste-ready CMS / copy / code packs | `composer-2.5` / `composer-2.5-fast` | HubSpot edit packs, titles, CTAs, module JS fixes |
| Commander (this session) | Cursor Grok 4.5 (parent) | Orchestration, merge, vault writes |

Config for local Hermes: `~/.hermes/config.yaml` (see `tools/hermes-bridge/config.example.yaml`).

## Edge / publish rule

• Never publish HubSpot pages, deploy Netlify/Vercel edge, or push live site changes without Dillon's Tier-2 approval.
• Never put content in front of Dillon's current Edge / Agents Window live session.
• Default: write paste-ready packs under `02_FullTimeJob/AlignHCM/optimization-packs/`.

## HubSpot private app token

Expected env var (never commit the value):

```bash
export HUBSPOT_PRIVATE_APP_TOKEN='***'   # Align portal private app
# optional aliases the hubspot-agent will also accept:
export HUBSPOT_ACCESS_TOKEN="$HUBSPOT_PRIVATE_APP_TOKEN"
```

Status in this cloud run: **token not present in environment**. Inject via Cursor Cloud environment secrets, then re-run Lane G.
