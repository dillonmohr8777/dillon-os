# HubSpot Agent — Align HCM

Source of truth for Lane G (Align / AEO-GEO / HubSpot).

## Verified account (2026-07-21, desktop)

• Account: Align HCM  
• Portal ID: `242825734`  
• Region: `na2`  
• Account type: Standard  
• Live HubSpot account check: succeeded on desktop. No CMS/CRM/edge publish.

## Auth topology

**Never commit. Never print. Never ask Dillon to paste the key into chat.**

Supported env aliases (same underlying Align service key):

• `HUBSPOT_PRIVATE_APP_TOKEN`  
• `HUBSPOT_ACCESS_TOKEN`  
• `HUBSPOT_SERVICE_KEY`

### Desktop credential locations (ready)

1. Windows user environment — inherited by Cursor after a full Cursor restart  
2. Hermes: `C:\Users\DillonMohr\AppData\Local\hermes\.env`  
3. Legacy HubSpot agent: `C:\Users\DillonMohr\hubspot-agent\.env`  
4. Encrypted DPAPI fallback: `Codex\tools\hubspot-agent\.secrets\align-hubspot-token.dpapi` (under the Align OneDrive Desktop Codex tree)

Cursor rule (desktop Codex workspace):

• `.cursor/rules/hubspot-access.mdc` — always-on: which env to use, where to find it, verify safely, read-only/draft without approval

### Cursor Cloud agents

Cloud does **not** inherit Windows user env, Hermes `.env`, or DPAPI. Add a Cursor Cloud environment secret named `HUBSPOT_PRIVATE_APP_TOKEN` for API access from cloud runs.

```bash
./tools/hubspot-agent/status.sh   # PRESENT/MISSING only; never prints the value
```

## Publish policy

• Default: **read-only / draft**  
• Writes or publishing: Dillon Tier-2 approval only  
• Never push live HubSpot / edge changes in front of Dillon's current Edge or Agents window

## Related

• `GEO_OPERATING_SYSTEM.md`  
• `tools/hermes-bridge/` — Grok 4.5 + Composer 2.5  
• `02_FullTimeJob/AlignHCM/optimization-packs/`
