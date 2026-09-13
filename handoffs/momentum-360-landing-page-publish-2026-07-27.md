# Momentum 360 landing page publish handoff

Updated: 2026-07-27
Target: Codex
Goal: find the Momentum 360 virtual tours landing page and publish it to a public URL

## Where the work is

| Item | Value |
|------|-------|
| Repository | `dillonmohr8777/dillon-os` |
| Branch | `claude/momentum-360-landing-page-coq96q` |
| Pull request | #213, draft, https://github.com/dillonmohr8777/dillon-os/pull/213 |
| Directory | `momentum-360-site/` |

```
momentum-360-site/
├── index.html                      # entire page, inline CSS + JS, no build step
├── README.md                       # design tokens, imagery provenance, swap points
└── assets/
    ├── momentum-360-logo.png       # circular 360 mark, favicon
    ├── momentum-logo-white.png     # MOMENTUM wordmark, white on transparent
    ├── fonts/inter-tight-latin.woff2
    └── img/                        # 11 images, 2.1 MB
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
file open silently falls back to Helvetica or Arial. Nothing else is affected.

## Read this before publishing

`dillonmohr8777/dillon-os` is **already a public repository**. The landing page
has been publicly readable since the branch was pushed. So has the rest of the
vault, including `02_FullTimeJob/AlignHCM/`, `06_Personal/`, `01_Clients/`,
`07_DBA/`, `10_Sessions/`, and `System/m360-leadership-notes.md`.

Two consequences for this task:

1. "Publish" here means getting the page onto a public URL, not changing repo
   visibility. Nothing needs to be made public that isn't already.
2. **Don't enable GitHub Pages on `dillon-os`.** Pages serves from a branch root
   or `/docs`, neither of which is `momentum-360-site/`. Pointing Pages at this
   repo would publish the whole vault as a browsable website. Use a dedicated
   repository instead, per the steps below.

Whether the vault should be public at all is worth raising with Dillon separately.
Don't change that setting unilaterally either way.

## Publish steps

Create a dedicated public repo holding only the site, with the files at the repo
root so Pages can serve them directly.

1. Confirm you're on `claude/momentum-360-landing-page-coq96q` and that
   `momentum-360-site/index.html` exists.
2. Create a new public repository: `dillonmohr8777/momentum-360-virtual-tours`.
3. Copy the site contents to the new repo root. Site files only, no vault history:

   ```bash
   mkdir -p /tmp/m360 && cp -R momentum-360-site/. /tmp/m360/
   cd /tmp/m360
   git init -b main
   git add .
   git commit -m "Add Momentum 360 virtual tours landing page"
   git remote add origin https://github.com/dillonmohr8777/momentum-360-virtual-tours.git
   git push -u origin main
   ```

4. Verify the new repo holds `index.html`, `README.md`, and `assets/` at the root,
   and nothing from elsewhere in the vault.
5. Enable GitHub Pages on the new repo. Settings, then Pages, then Source "Deploy
   from a branch", branch `main`, folder `/ (root)`, then Save.
6. Wait for the first Pages build, then open
   `https://dillonmohr8777.github.io/momentum-360-virtual-tours/`.
7. Run the verification checklist below against that live URL.

Netlify, Vercel, and Cloudflare Pages are all equally fine alternatives. The site
is static, with no build command and no environment variables, and the publish
directory is the repo root. Use whichever Dillon already pays for.

## Approval gated, don't do these without explicit approval from Dillon

* Pointing any custom domain or DNS record at the deployment, including any
  `momentumvirtualtours.com` subdomain.
* Replacing, redirecting, or modifying the live `momentumvirtualtours.com`
  WordPress site. This page is a standalone landing page, not a replacement, and
  the live site sits behind a Sucuri firewall.
* Changing the visibility of `dillon-os` or any other repository.
* Sending the URL to the client, or to anyone outside Dillon.
* Any spend, plan upgrade, or new paid hosting account.

## Confirm before calling it client ready

Photography is Momentum's own, pulled from the Netlify build at
`momentum360-3d-home.netlify.app`. Three images are genuine captures and carry a
"Captured work" chip on their cards. The rest were named `concept-` at the source
and are staged concept imagery. Two things still need Dillon's input:

1. **Tour card venue names and metrics.** Granite Park comes from the source
   filename. Chef's Table, Society Hill Townhome, Old City Loft, Rittenhouse
   Penthouse, and Main Line Modern are descriptive placeholders, and every square
   footage, panorama count, and floor count is illustrative. Real projects should
   replace them, each linked to its live Matterport or Street View URL.
2. **Founder titles.** Both source files were named `founder-bio`, so the page
   reads Sean Boyle as Founder of Momentum 360 and Mac Frederick as Founder of
   Momentum Digital. Confirm both.

Everything else is real and sourced from Momentum's own site: the eight services,
the Google Street View Trusted Agency and Matterport Service Provider positioning,
the stats, the Inc. 5000 and Philadelphia 100 badges, the Market Street contact
details, and all three testimonials.

To swap content, edit the data arrays at the top of the script in `index.html`.
`TOURS`, `SERVICES`, and `QUOTES`, not the markup. To swap a photo, drop a
replacement into `assets/img/` under the same filename and keep the aspect ratio.
See the README for the ratios.

## Writing rules

Copy follows `System/writing-rules.md`. No em dashes anywhere. Contractions
throughout. No sentences opening with And, But, Or, It is, Do not, That is, or
This is. Hold to those rules on any copy edit.

## Verification checklist

Run against the deployed public URL, not localhost.

* Page loads over HTTPS with no console errors.
* All 25 images load, with no broken image placeholders.
* Webfont loads, so headings render in Inter Tight rather than Helvetica or Arial.
* Momentum wordmark appears in both the nav and the footer, and the circular 360
  mark shows as the browser tab favicon.
* Nav starts transparent over the hero and goes solid dark on scroll.
* Hero cycles through three images, and the dots switch between them.
* Services accordion opens, swaps the image to match the open item, and closes.
* Inc. 5000 and Philadelphia 100 badges render on the dark stats band.
* Founders section shows both headshots.
* At 390px wide there's no horizontal scrolling, and the burger menu opens and
  closes on link tap.
* Anchor links land with the section heading clear of the fixed nav.
* The new public repo holds the site files only, and nothing else from the vault.
