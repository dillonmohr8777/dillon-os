# Align HCM attribution and conversion layer

This folder manages the production attribution fixes without using the HubSpot website.

## What it installs

- First-touch and last-touch UTM, referrer, click ID, content, offer, CTA placement, and conversion properties on HubSpot contacts.
- Deterministic first/last channel and social-platform fields, including LinkedIn `li_fat_id` capture.
- An optional buyer-reported discovery source on high-intent forms so dark social is not forced into Direct.
- Hidden attribution fields on the Contact, Footer, Footer CTA, Blog Subscribe, and buyer guide forms.
- A dedicated email-only buyer guide form and soft gate for Align's buyer guide PDFs.
- Accurate success and error behavior for the custom global footer form.
- GA4 events for CTA clicks, guide access, downloads, form success, form failure, meeting booking starts, lead generation, and 404 paths.
- Non-PII 15-second and 50%/90% scroll engagement signals, plus contextual second-step links on high-exit page types.
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

## LinkedIn organic publishing rule

Every Align HCM URL placed in an organic LinkedIn post must use `utm_source=linkedin`, `utm_medium=organic_social`, a stable initiative name in `utm_campaign`, and a unique post or asset ID in `utm_content`. The URL generator prefixes `utm_content` with `align_page_` or `maher_profile_` so Page-generated leads and Maher-generated leads remain separate all the way through HubSpot.

Generate the URL instead of typing it by hand:

```powershell
.\New-LinkedInOrganicUrl.ps1 -Destination 'https://www.alignhcm.com/blog/example' -Campaign '2026 HCM Buyers Guides' -Publisher AlignPage -Content 'post-2026-07-17-carousel-01'

.\New-LinkedInOrganicUrl.ps1 -Destination 'https://www.alignhcm.com/blog/example' -Campaign '2026 HCM Buyers Guides' -Publisher MaherProfile -Content 'post-2026-07-17-video-01'
```

Never relabel LinkedIn as Direct, Organic Search, or Referral. The CRM preserves observed first touch, observed last touch, and buyer-reported source as separate evidence. Meeting links inherit the active LinkedIn touch and encode the unique post ID into HubSpot's native meeting campaign field so a confirmed booking can still be assigned to the originating Align Page or Maher post. The dashboard groups potential leads, contact forms, buyer-guide downloads, meeting starts, and confirmed meetings by the unique `utm_content`; no personal contact data is published.
