# Align HCM Growth Report

Interactive marketing performance report for Align HCM (SEO + LinkedIn metrics).

## Stack

Next.js 15 · React 19 · Framer Motion · Tailwind CSS · static export to `out/`

## Develop

```bash
npm install
npm run dev
```

## Deploy (Netlify)

`netlify.toml` is preconfigured. Base directory: `02_FullTimeJob/AlignHCM/growth-report`

```bash
npm run build
npx netlify deploy --prod --dir=out --site=<SITE_ID>
```

## Notes

- Sample metrics in `lib/report-data.ts` — replace with live GA4/GSC/LinkedIn pulls before client delivery.
- `robots: noindex` — internal report, not for public SEO.
