# Google Access Expansion ledger, 2026-09-14 section

Run: 2026-09-14, local Claude session (empeon-audit lane). Extends the 2026-09-12 ledger,
which is still an untracked local file in the vault working tree; this section is the first
tracked copy of the measurement-API state. Read-only throughout. No account, billing, IAM,
scope, client, or ads state changed.

## Verified now

| Capability | State | Evidence |
|---|---|---|
| Search Console API, direct | LIVE VERIFIED | ADC read of `sites` returned HTTP 200, 11 sites; `https://www.alignhcm.com/` at siteOwner. Full analytics pull for that property succeeded (see capture below) |
| GA4 Admin + Data APIs, direct | LIVE VERIFIED | ADC `accountSummaries` returned 11 accounts, Align HCM `properties/320235048` included; `runReport` on that property returned 177 date×channel rows |
| Tag Manager API, direct, read-only | LIVE VERIFIED | ADC `accounts` returned 3 (Nexla 4701213587, BigOrange 6001019299, Puttery 6004183424) |
| ADC scope set | LIVE VERIFIED | tokeninfo on a refreshed ADC token: adwords, analytics.readonly, webmasters.readonly, tagmanager.readonly, cloud-platform, youtube.readonly, yt-analytics.readonly. Client under project 150963436905. File dated 2026-09-12 23:55 |
| Enabled services | LIVE VERIFIED | `gcloud services list --enabled --project momentum-360-489301` lists searchconsole, analyticsadmin, analyticsdata, tagmanager, googleads among 35 |
| gcloud CLI auth | LIVE VERIFIED | `gcloud auth list` active account dillonmohr8777@gmail.com; core project momentum-360-489301. Supersedes the 2026-09-12 closeout's "gcloud is unauthenticated" |
| Ads probe token (`google-ads.yaml`) | SCOPE-LIMITED | adwords only; Search Console, GA4 Admin, GA4 Data and GTM all 403 ACCESS_TOKEN_SCOPE_INSUFFICIENT. Correct for Ads, useless for measurement |
| Composio google_search_console / google_analytics / googleads | ACTIVE, LIVE READ OK | `MANAGE_CONNECTIONS list` all active; live GET_SITE on alignhcm.com via account `google_search_console_mooner-urban` returned siteOwner; GA4 summaries returned Align HCM. "Composio is dead" is an **Ads entitlement** fact only |

## Interpretation

- Composio is not required for Search Console or GA4 and should not be the default: the
  same reads work directly on Dillon's own Cloud project through the ADC, with no consent
  click outstanding. Keep the vault's Ads rule (do not revive Composio for Ads) unchanged.
- The Search Console site list on the ADC identity (11 sites, incl. alignhcm.com) is the
  same list Composio's `mooner-urban` account shows. Composio's default `kindle-spurt`
  account (170+ sites, no alignhcm.com) is a different Google identity.
- Dillon still holds siteOwner on alignhcm.com and edit rights on the Align GA4 property
  after leaving Align on 2026-09-02. That is an access-hygiene fact worth a decision, not
  something this desk changes.

## Probe folder changes (`%LOCALAPPDATA%/Dillon/GoogleAdsProbe/`)

- `authorize.py`: default scopes now read-only (adwords, webmasters.readonly,
  analytics.readonly, tagmanager.readonly); `--gtm-publish` adds the GTM write scopes for
  the separately gated Nexla publish. Default output `google-full.yaml`. Honors the
  2026-09-12 closeout's warning against bare GTM edit/publish defaults.
- `google_probe.py` (new): read-only check of scopes, Search Console sites and GA4
  accounts; `--adc` uses the gcloud ADC. Exit 0 today.
- `.gitignore`: `google-full*.yaml` added. `READ-ME-FIRST.txt`: new section.
- No new consent is required for reads; `authorize.py` is only needed to mint a yaml-style
  config for scripts that cannot read the ADC.

## Still on Dillon (unchanged from 2026-09-13)

1. OAuth brand verification: apply the Search Console TXT record at SiteGround, then
   publish branding, then reapply for Ads Basic.
2. GTM publish grant for Nexla (`GTM-K7B389B`), separately gated.
3. Decide whether the Align Search Console / GA4 appendix (addendum pages D–E) leaves the
   building with the Empeon sales addendum.

## Related

- `12_Brain/01_Captures/2026-09-14 - Align Search Console and GA4 direct snapshot, gap table, and the Google access answer.md`
- `_os/automation/google-ads-api/pull_align_snapshot.py`
- `System/daily-orchestrator.md` (tracked on `claude/cadence-and-sweep-20260914`): its
  "Composio is still dead (its own Cloud project)" bullet needs the Ads-only qualifier above.
