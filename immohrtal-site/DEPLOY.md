# Go live — 2 minutes on Vercel

The site is fully built and host-portable (works at a domain root or
any subpath). Same setup as themohrmedia.com, which already deploys
from this repo.

## Steps (one time)

1. Merge PR #147 into `main` (Vercel deploys from main by default).
2. Go to vercel.com → **Add New… → Project** → Import `dillonmohr8777/dillon-os`.
3. Set **Root Directory** to `immohrtal-site`.
4. Framework preset: **Vite** (build `npm run build`, output `dist` — auto-detected).
5. Click **Deploy**. You get a live URL like `immohrtal-site.vercel.app` immediately.

## Custom domain (whenever you buy one)

Project → Settings → Domains → add `immohrtal.com` (or whatever you
pick) and follow the DNS instructions. Then update the `og:image` and
JSON-LD `image` in `index.html` to the absolute URL
(`https://yourdomain.com/og.png`) so link previews are bulletproof.

## Alternative host

The `dist/` folder after `npm run build` is fully static. Drag-and-drop
it into Netlify Drop, Cloudflare Pages, or any static host and it just
works.
