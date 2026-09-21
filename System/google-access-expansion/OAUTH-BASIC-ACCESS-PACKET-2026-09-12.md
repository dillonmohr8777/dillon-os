# Google OAuth and Ads Basic access packet

Status: EXECUTED PARTIAL on 2026-09-13; OAuth In production, Ads Basic denied for incomplete brand verification

## Verified Cloud state

- Project: `momentum-360-489301` (`Momentum 360`)
- Signed-in project identity: `dillonmohr8777@gmail.com`
- OAuth audience: External
- Publishing status: In production
- Test users: 1 of 100
- OAuth clients: Ads desktop probe plus an older Business Profile web client marked unused
- Service accounts: none
- Current Ads access: Explorer, direct production reads work; Basic application denied until brand verification succeeds

## Branding values ready to enter

| Field | Value |
|---|---|
| App name | Momentum 360 |
| User support email | `dillonmohr8777@gmail.com` |
| Application home page | `https://www.momentumvirtualtours.com/` |
| Privacy policy | `https://www.momentumvirtualtours.com/privacy-policy/` |
| Terms of service | `https://www.momentumvirtualtours.com/terms-and-conditions/` |
| Authorized domain | `momentumvirtualtours.com` |
| Developer contact | `dillonmohr8777@gmail.com` |
| Logo | Resolve and inspect an approved square Momentum 360 logo before upload |

The URLs were saved in Cloud on September 12 and the OAuth app was published on September 13. URL existence alone does not establish verification readiness. The privacy page was reread September 12: it describes website forms, usage data, general service-provider sharing and deletion requests, but does not describe this application's Google account data access, retention, deletion workflow, or AI processing.

## Remaining factual decisions before submission

- Confirm Momentum 360 is the correct publisher for this tool and that its authorized operator may submit these representations. Do not use Momentum branding for Dillon's independent business access expansion without resolving that separation.
- Record which Google data is stored, where, for how long, which processors receive it, and how revocation/deletion works. Verify these against the actual local collector and hosted connectors before writing policy promises.
- Have the authorized website owner approve any required app-specific disclosure and publication. The general website policy is not yet validated for this application.
- Treat OAuth Production, brand verification, scope verification, and Ads Basic approval as separate states. Production does not guarantee verification or cure every existing token; verify the grant after transition and reauthorize only if necessary.
- Testing token expiry is a risk derived from Google's policy. The exact current grant expiry was not measured; September 17 is not a verified token-expiration timestamp.

## Coordinated upgrade sequence

1. DONE: saved the completed branding fields.
2. DONE: switched the External OAuth app from Testing to In production.
3. ATTEMPTED 2026-09-13: Branding > Information and summary > Verify branding successfully started verification without a logo. Google returned one issue: the home-page website is not registered to this Google account. The logo upload is not the verification blocker.
4. DONE: submitted Google Ads Basic from the project API overview.
5. DENIED: Google emailed that Basic requires a successfully verified OAuth brand profile. Explorer remains the current level. Reapply only after branding is verified and published.

## Why this is the breakthrough

- Google's OAuth documentation says External apps in Testing receive refresh tokens that expire in seven days unless they request only basic identity scopes. The Ads probe requests a non-identity scope, so its durable automation path is at risk while the app stays in Testing.
- Google requires External plus In production and completed brand verification before an Ads Basic application.
- Basic increases production operations from 2,880 to 15,000 per rolling day and removes Explorer restrictions on planning and certain account-management services.
- Higher Ads access will not repair Omega's manager topology. Direct access should remain the proven route until an actual manager link exists.

## Scope separation

- Keep the working Ads OAuth client limited to the Ads scope.
- Do not run bare `authorize.py`: its current defaults include GTM write/publish scopes and reference a missing configuration file.
- Prepare a separate read-only OAuth client/config for `analytics.readonly`, `webmasters.readonly`, and `tagmanager.readonly` only after exact properties and containers are resolved.
- Add write or publish scopes only for a named task and separate approval.

## Approval gate

Saving Cloud branding, publishing the OAuth app, starting verification, and submitting Ads Basic are external account changes. Execute only after Dillon approves this exact packet. Do not accept customer-data terms, change IAM, enable billing, or request client permissions as part of this packet.

## Domain ownership repair, 2026-09-13

- Google issue: the website of home page https://www.momentumvirtualtours.com/ is not registered to this account; verify ownership.
- Search Console for dillonmohr8777@gmail.com did not list momentumvirtualtours.com. A Domain-property verification request now provides the record below.
- Public authoritative nameservers: ns1.siteground.net and ns2.siteground.net. SiteGround browser session is at login; no authenticated DNS administration session was available.
- 2026-09-13 login attempt: selected Dillon's Google account for SiteGround. The popup stalled; the same sign-in flow worked in a normal Chrome tab and reached SiteGround's Robot Challenge Screen ("Checking the site connection security" with a cookie-setting notice). Hosting login remains unverified; user handoff is required at the security screen. No DNS record was added, and no verification retry or Basic resubmission occurred.
- Add a TXT record at the domain root (@) of momentumvirtualtours.com, preserving existing records:
  `google-site-verification=LGL4NoCeVseDHJlcAtXC_Q10AWe0VVS6f8G6Wl9-jHs`
- Then click Verify in Search Console, re-run branding verification, publish verified branding, and reapply for Ads Basic. Do not assert the issue is fixed until ownership verifies.
- Browser security policy rejected navigation to chrome://extensions; no setting workaround was attempted. That setting is unnecessary for the current DNS ownership repair.

## Official sources (links)

## Latest repair attempt, 2026-09-13

- Live Cloud branding issue still says the home-page domain is not registered to this account.
- Public DNS queried through 1.1.1.1 still lacks the prepared ownership TXT record. An existing, different Google verification record is present and must be preserved.
- Retried SiteGround Continue with Google using dillonmohr8777@gmail.com. The popup closed and the hosting login page returned "Login attempt failed. Please try again."
- Hosting access remains blocked. No DNS changes, branding retry, or Ads Basic resubmission occurred in this attempt. User must complete SiteGround sign-in to the hosting account with DNS access before the prepared sequence can continue.

### Source links

- `https://developers.google.com/identity/protocols/oauth2`
- `https://developers.google.com/google-ads/api/docs/api-policy/brand-verification`
- `https://developers.google.com/google-ads/api/docs/api-policy/access-levels`
