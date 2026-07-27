# Momentum 360 landing page publish handoff

Updated: 2026-07-27
Target: Codex
Goal: find the Momentum 360 virtual tours landing page and publish it to a public URL

## Where the work is

| Item | Value |
|------|-------|
| Repository | `dillonmohr8777/dillon-os` |
| Branch | `claude/momentum-360-landing-page-coq96q` |
| Pull request | #213 (draft) — https://github.com/dillonmohr8777/dillon-os/pull/213 |
| Commit | `9b71966` Add Momentum 360 virtual tours landing page |
| Directory | `momentum-360-site/` |

```
momentum-360-site/
├── index.html                      # entire page, inline CSS + JS, no build step
├── README.md                       # design tokens, content provenance, swap points
└── assets/
    ├── momentum-logo-white.png     # real Momentum wordmark, white on transparent
    ├── fonts/inter-tight-latin.woff2
    └── img/                        # 19 vendored photos, ~2.8 MB
```

Find it from a clean machine:

```bash
git clone https://github.com/dillonmohr8777/dillon-os.git
cd dillon-os
git fetch origin claude/momentum-360-landing-page-coq96q
git checkout claude/momentum-360-landing-page-coq96q
ls momentum-360-site
```

Preview locally before publishing anything:

```bash
cd momentum-360-site && python3 -m http.server 8000
# open http://127.0.0.1:8000
```

Serve over HTTP, not `file://`. The webfont is fetched in CORS mode, so a bare
file open silently falls back to Helvetica/Arial. Nothing else is affected.

## Read this before publishing

`dillonmohr8777/dillon-os` is **already a public repository**. The landing page
has been publicly readable since the branch was pushed. So has the rest of the
vault, including `02_FullTimeJob/AlignHCM/`, `06_Personal/`, `01_Clients/`,
`07_DBA/`, `10_Sessions/`, and `System/m360-leadership-notes.md`.

Two consequences for this task:

1. "Publish" here means **get the page onto a public URL**, not change repo
   visibility. Nothing needs to be made public that isn't already.
2. **Do not enable GitHub Pages on `dillon-os`.** Pages serves from a branch
   root or `/docs`, neither of which is `momentum-360-site/`. Pointing Pages at
   this repo would publish the whole vault as a browsable website. Use a
   dedicated repository instead, per the steps below.

Separately worth raising with Dillon, outside the scope of this task: whether
the vault should be public at all. Do not change that setting unilaterally
either way.

## Publish steps

Create a dedicated public repo containing only the site, with the files at the
repo root so Pages can serve them directly.

1. Confirm you are on `claude/momentum-360-landing-page-coq96q` and that
   `momentum-360-site/index.html` exists.
2. Create a new public repository: `dillonmohr8777/momentum-360-virtual-tours`.
3. Copy the site contents to the new repo root — the site files only, no vault
   history:

   ```bash
   mkdir -p /tmp/m360 && cp -R momentum-360-site/. /tmp/m360/
   cd /tmp/m360
   git init -b main
   git add .
   git commit -m "Add Momentum 360 virtual tours landing page"
   git remote add origin https://github.com/dillonmohr8777/momentum-360-virtual-tours.git
   git push -u origin main
   ```

4. Verify the new repo contains `index.html`, `README.md`, and `assets/` at the
   root, and contains nothing from elsewhere in the vault.
5. Enable GitHub Pages on the new repo: Settings → Pages → Source: Deploy from
   a branch → Branch `main` → folder `/ (root)` → Save.
6. Wait for the first Pages build, then open
   `https://dillonmohr8777.github.io/momentum-360-virtual-tours/`.
7. Run the verification checklist below against that live URL.

Netlify, Vercel, or Cloudflare Pages are all equally fine alternatives — the
site is static with no build command and no environment variables. Publish
directory is the repo root. Use whichever Dillon already pays for.

## Approval-gated — do not do these without explicit approval from Dillon

- Pointing any custom domain or DNS record at the deployment, including any
  `momentumvirtualtours.com` subdomain.
- Replacing, redirecting, or modifying the live `momentumvirtualtours.com`
  WordPress site. This page is a standalone landing page, not a replacement,
  and the live site sits behind a Sucuri firewall.
- Changing the visibility of `dillon-os` or any other repository.
- Sending the URL to the client, or to anyone outside Dillon.
- Any spend, plan upgrade, or new paid hosting account.

## Known placeholders — flag these on the deployed URL

The page is structurally finished but two content areas are stand-ins. Do not
present the deployment as client-ready until they are replaced.

1. **Tour cards.** The six venues (Suraya, Sorella Boutique, Frankford Hall,
   Momentum Athletic Club, Main Line Dental, The Wharton Hotel) and their
   sq ft / pano / floor counts are illustrative, not real projects. Replace with
   real completed tours and link each card to its live Matterport or Street View
   URL.
2. **Photography.** All 19 images are Unsplash stand-ins. The Unsplash license
   permits commercial use, so this is not a legal blocker, but they are not
   Momentum's capture work and should be swapped before any client-facing use.

Everything else is real and sourced from Momentum's own site: the eight
services, the Google Street View Trusted Agency and Matterport Service Provider
positioning, the stats (500+ projects since 2017, 50 states, 1,200+ photographer
network, #1 in Philadelphia), the Market Street contact details, and all three
testimonials.

To swap content, edit the data arrays at the top of the `<script>` in
`index.html` — `TOURS`, `SERVICES`, `QUOTES` — not the markup. To swap a photo,
drop a replacement into `assets/img/` under the same filename and keep the
aspect ratio: hero/about/cta 16:9 at 1920w, tour cards 3:2 at 900w, service
images ~4:3 at 1100w.

## Verification checklist

Run against the deployed public URL, not localhost.

- Page loads over HTTPS with no console errors.
- All 21 images load. No broken image placeholders.
- Webfont loads — headings render in Inter Tight, not Helvetica or Arial.
- Momentum logo appears in both the nav and the footer.
- Nav starts transparent over the hero and goes solid dark on scroll.
- Services accordion opens, swaps the image to match the open item, and closes.
- Hero dot navigation switches the background image.
- At 390px wide: no horizontal scrolling, and the burger menu opens and closes
  on link tap.
- Anchor links land with the section heading clear of the fixed nav.
- The new public repo contains the site files only and nothing else from the
  vault.
