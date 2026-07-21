# HubSpot Agent — Align HCM

Source of truth for Lane G (Align / AEO-GEO / HubSpot).

## Verified account (2026-07-21, desktop Codex)

• Account: Align HCM  
• Portal ID: `242825734`  
• Region: `na2`  
• Account type: Standard  
• Check: real HubSpot account API call succeeded on local desktop. No CMS/CRM/edge publish.

## Auth topology

**Never commit. Never print. Never paste into chat.**

### Local Windows desktop (ready)

Aliases on the Windows user environment (inherited by new Cursor / Codex terminals):

• `HUBSPOT_PRIVATE_APP_TOKEN`  
• `HUBSPOT_ACCESS_TOKEN`  
• `HUBSPOT_SERVICE_KEY`

Also loaded into Hermes:

• `C:\Users\DillonMohr\AppData\Local\hermes\.env`

Encrypted DPAPI fallback (desktop Codex only):

• `Codex\tools\hubspot-agent\.secrets\align-hubspot-token.dpapi`

Desktop Codex `AGENTS.md` documents safe access: read-only / draft unless Dillon approves writes or publishing.

### Cursor Cloud agents (this environment)

Cloud does **not** inherit Windows user env. Until the same secret is added as a Cursor Cloud environment secret named `HUBSPOT_PRIVATE_APP_TOKEN`, cloud runs stay pack-only.

```bash
# Cloud / Linux check (prints PRESENT/MISSING only)
./tools/hubspot-agent/status.sh
```

## Scripts

• `status.sh` — token present? (no value printed)  
• Future: `cms-read.sh` — read-only CMS helpers once token is present on this runtime

## Publish policy

• Default: **read-only / draft**  
• Writes or publishing: Dillon Tier-2 approval only  
• Never push live HubSpot / edge changes in front of Dillon's current Edge or Agents window

## Related packs

• `02_FullTimeJob/AlignHCM/optimization-packs/` — dated paste-ready work  
• `GEO_OPERATING_SYSTEM.md` — AEO/GEO operating rules  
• `tools/hermes-bridge/` — Grok 4.5 + Composer 2.5 routing
