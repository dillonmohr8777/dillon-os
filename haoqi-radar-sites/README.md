# Haoqi craft demos

52 `noindex` prospect sites that apply the Haoqi.design language to rebuild rows from the 2026-08-15 Momentum prospect radar.

Jarman and Andorra were the first two. Two unused 25-packs follow the same template. Exact logos sit in the mark when the homepage had one. Empty photo slots get generated atmosphere, labeled as generated.

## Run locally

```
python3 -m http.server 8080
```

Then open `http://localhost:8080/haoqi-radar-sites/`.

## Publish

Pinned Netlify site: `haoqi-radar-craft` only.

```
NETLIFY_AUTH_TOKEN=… node _os/automation/bin/haoqi-craft-deploy.js
```

Live hub: https://haoqi-radar-craft.netlify.app/

## Rules

- Demos stay `noindex`.
- Their logo only. Background cut to alpha. No invented marks.
- Photographs are theirs when harvest found them. Empty slots get generated atmosphere, labeled as generated.
- Vault write-up: `02_Campaigns/AI Site Builder Outreach Engine/Haoqi Craft Demos.md`.
