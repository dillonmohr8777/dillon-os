# Netlify Review Deployment

- Site: `with-not-for-ai-human-led-preview`
- Site ID: `7861d4b9-7ed9-436f-8c56-aaaa8738fc09`
- Production URL: `https://with-not-for-ai-human-led-preview.netlify.app/`
- Deploy ID: `6a8eea59757d6042d0b24ece`
- Publish directory: `site`
- Visibility: public URL, explicitly noindexed through HTML, `robots.txt`, and `X-Robots-Tag`
- Prospect outreach: unsent
- Live QA: PASS at 320, 390, 768, and 1440 pixels on 2026-08-26T13:31:13Z

Deploy with the explicit site ID so this review build cannot overwrite another Netlify project:

```powershell
netlify deploy --prod --dir site --site 7861d4b9-7ed9-436f-8c56-aaaa8738fc09 --no-build --json
```
