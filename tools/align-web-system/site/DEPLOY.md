# Deploy — Public Sector / Manufacturing page

This folder is a self-contained static site: `index.html` + `assets/`
(real Align HCM logo and real client logos). No build step.

## Netlify (run from your local Claude session or terminal, where Netlify is authed)

Update the existing site in place:

```bash
cd tools/align-web-system/site
netlify deploy --prod --dir=. --site align-hcm-public-sector-manufacturing
```

First time on a machine: `netlify login` once, then the command above. To target
a different site, drop `--site ...` and Netlify will prompt, or use
`netlify link` first.

## Or drag-and-drop

Zip the contents of this `site/` folder (so `index.html` is at the zip root) and
drop it on https://app.netlify.com/drop.

## Why not from the cloud session

The Claude Code web session has no Netlify CLI and no `NETLIFY_AUTH_TOKEN`, so it
can't publish. Everything here is deploy-ready; the deploy runs where Netlify is
authenticated (your machine).
