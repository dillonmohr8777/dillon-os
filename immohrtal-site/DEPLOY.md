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

## Newsletter gate (Netlify Forms)

Track previews are email-gated: first play opens a signup modal that
POSTs to the hidden `immohrtal-list` form in `index.html`. Netlify
detects that form at deploy time — no config needed, but check:

1. Netlify dashboard → **Forms** → enable form detection (one-time).
2. Submissions appear under Forms → `immohrtal-list`, with the track
   that triggered the signup in the `source` field.
3. Add a notification (Forms → notifications) to get an email per
   signup, or wire a Zapier/Make hook to push into a real mailer
   (Mailchimp/ConvertKit) later.

Unlock state is per-device (`localStorage: immohrtal.list`). Free tier
covers 100 submissions/month — upgrade or move to a mailer API if the
list outgrows it.
