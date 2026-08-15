# Haoqi craft demos

Two `noindex` prospect sites that apply the Haoqi.design language to rebuild rows from the 2026-08-15 Momentum prospect radar.

| Demo | Path | Their live site |
|---|---|---|
| Jarman Sales & Service | `jarman-sales/` | Harvested `https://jarmansalesandservice.com/` (radar host `jarmanairconditioning.com` was 404) |
| Andorra Family Dentistry | `andorra-family-dentistry/` | `https://www.andorradental.com/` |

## Run locally

```
python3 -m http.server 8080
```

Then open `http://localhost:8080/haoqi-radar-sites/` or the site folders directly.

## Rules

- Demos stay `noindex`.
- Deploy is Tier 2. Do not publish without Dillon.
- Andorra stills are generated atmosphere and labeled on the page.
- Vault write-up: `12_Brain/concepts/Haoqi Design Language.md` and `02_Campaigns/AI Site Builder Outreach Engine/Haoqi Craft Demos.md`.
