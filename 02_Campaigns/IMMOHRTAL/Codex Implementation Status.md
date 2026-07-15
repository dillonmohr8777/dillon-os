# IMMOHRTAL Implementation Status

**Implemented:** 2026-07-15  
**Source:** verified `dillon-os` remote `main` export  
**Production publication:** not performed

## Complete

- Full social conversion hub at `immohrtal-site/start.html`.
- Typed audience-building, pre-save, and released states.
- Three approved 30-second preview players.
- Consent-gated GA4, Meta Pixel, and Plausible loading.
- Session UTM capture attached to measurement and signup requests.
- Brevo double-opt-in Netlify Function with a Netlify Forms backup.
- Privacy page and security headers.
- Updated navigation, footer, sitemap generation, and deployment documentation.
- Thirty-day calendar, weekly scorecard, tracked profile URLs, and weekly capture handoff.
- Six subscription API tests and a successful production build.
- Responsive verification at 390 px and desktop widths.

## Required before a production deployment

1. Create or confirm the Brevo early-listener list and double-opt-in template.
2. Add the server-only Netlify values from `immohrtal-site/.env.example`.
3. Add only the analytics IDs Dillon wants active.
4. Deploy a private Netlify preview and complete one real double-opt-in test.
5. Verify the actual `@immohrtal` profile URLs before adding them to `album.ts`.
6. Obtain Dillon's approval for the production deployment.

## Required before release mode

- Lead single
- Distributor
- Release date
- Pre-save URL
- Spotify and Apple artist URLs
- Approved public lyrics

Until those facts are real, the site correctly remains in `audience-building` mode.
