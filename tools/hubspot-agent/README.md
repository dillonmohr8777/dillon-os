# HubSpot Agent — Align HCM

Source of truth for Lane G (Align / AEO-GEO / HubSpot).

## Auth

```bash
# Required. Private app token for the Align HubSpot portal.
# Never commit. Never print. Load from Cursor Cloud secrets or local env.
export HUBSPOT_PRIVATE_APP_TOKEN='***'
```

Portal ID observed on live site scripts: `242825734` (na2).

## Scripts

• `status.sh` — checks whether the token is loaded (no value printed)
• `cms-read.sh` — read-only CMS helpers once token is present

## Publish policy

All writes are **draft / paste-ready** until Dillon approves. Do not publish pages or push to CDN edge while Dillon's live Edge / Agents session is the source of truth for the site.

## Related packs

• `02_FullTimeJob/AlignHCM/optimization-packs/` — dated work products
• `GEO_OPERATING_SYSTEM.md` — AEO/GEO operating rules
