# Align HCM attribution and conversion layer

This folder manages the production attribution fixes without using the HubSpot website.

## What it installs

- First-touch and last-touch UTM, referrer, click ID, content, offer, CTA placement, and conversion properties on HubSpot contacts.
- Hidden attribution fields on the Contact, Footer, Footer CTA, Blog Subscribe, and buyer guide forms.
- A dedicated email-only buyer guide form and soft gate for Align's buyer guide PDFs.
- Accurate success and error behavior for the custom global footer form.
- GA4 events for CTA clicks, guide access, downloads, form success, form failure, meeting booking starts, lead generation, and 404 paths.
- A visible summary and contextual conversion path on every current and future blog post.
- One H1 per affected buyer guide and a permanent redirect from the duplicate UKG guide.
- An IndexNow key and sitemap submission.

No email address or other submitted value is stored in browser attribution storage or sent as an analytics event.

## Commands

Dry run:

```powershell
.\Install-Attribution.ps1
```

Back up current live state and apply:

```powershell
.\Install-Attribution.ps1 -Apply
```

Verify the live deployment:

```powershell
.\Verify-Attribution.ps1
```

Every applied run writes a rollback snapshot outside the repository under `%LOCALAPPDATA%\Codex\AlignHCMBackups`. The installer is idempotent and validates every CMS source file before publishing it.

HubSpot custom event definitions require private app scopes that are not currently granted. Known conversions still populate HubSpot through forms and contact properties. Anonymous behavioral events go to the existing GA4 property.
