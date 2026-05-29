# Google Ads + Meta API Connection Setup

Purpose: connect Google Ads and Meta (Facebook) Marketing APIs in **read-only** mode so future automated runs pull real metrics and auto-populate each client's `Reporting Log.md` and the monthly `Reports/` rollup instead of leaving blank placeholders.

Scope: reporting only. No campaign creation, no edits, no spend changes. Use reporting queries / Insights reads exclusively.

> If a menu/button name below doesn't match exactly what you see, the platforms move things around constantly. Trust the described *location* over the exact label.

---

## Part 1 - Google Ads API

### 1.1 What to gather (you need all six)

| Item | What it is | Where |
|------|-----------|-------|
| Manager (MCC) account ID | The top-level account that links all client accounts (10-digit, e.g. `123-456-7890`) | Google Ads, top-right account selector |
| Developer token | Per-MCC token authorizing API access | API Center inside the **MCC** |
| OAuth2 client ID | Identifies your app to Google | Google Cloud Console > Credentials |
| OAuth2 client secret | Paired secret for the client ID | Same place as client ID |
| Refresh token | Long-lived token that mints access tokens for your user | Generated once via an OAuth flow |
| `login-customer-id` | The MCC ID (digits only, no dashes) used as the auth header | = your MCC ID |

Your client accounts likely already sit under one MCC. Known account IDs to confirm are linked:

- Bar Crawl USA - 435-710-2897
- Shadow HVAC - 314-136-4176
- Link Eze - 809-600-6448
- KJB (Kimberly James Bridal) - 721-491-4099
- Fresh Blends - 627-501-4654
- NKCDC - 100-209-6937
- Jeff Hozias - 495-602-9145

### 1.2 Steps in order

1. **Create / identify the MCC.** Sign in to Google Ads. If the account switcher shows a manager account that contains the client accounts above, that's your MCC - note its 10-digit ID. If not, create a manager account at ads.google.com/home/tools/manager-accounts, then link each client account (invite from MCC > client accepts).

2. **Apply for a developer token.** In the **MCC** (not a client account): Tools (wrench icon) > Setup/Admin section > **API Center**. Accept terms, request a token.
   - You start with **Test access** (only works against test accounts) or **Basic access**. **Basic access** is enough for read-only reporting across your real production accounts at normal volumes.
   - **Standard access** raises rate limits; you don't need it for this use case.
   - **Approval can take several days.** Apply early. The application asks how you'll use the API - answer honestly: internal reporting/analytics for managed client accounts, read-only.

3. **Create a Google Cloud project + OAuth.**
   - console.cloud.google.com > create a project (e.g. `dillon-ads-reporting`).
   - APIs & Services > Library > enable **Google Ads API**.
   - APIs & Services > **OAuth consent screen** > User type **External** (or Internal if you have Workspace). App name, your support email. Add scope `https://www.googleapis.com/auth/adwords`. Add your own Google account as a **Test user** (lets you use it without app verification while in "Testing" publishing status).
   - APIs & Services > **Credentials** > Create credentials > **OAuth client ID** > application type **Desktop app**. Download the client ID + secret.

4. **Generate a refresh token.** Easiest path is the official Python library's bundled helper:
   ```bash
   pip install google-ads
   # from the google-ads repo examples/authentication:
   python generate_user_credentials.py \
     --client_id=YOUR_CLIENT_ID --client_secret=YOUR_CLIENT_SECRET
   ```
   It opens a browser, you consent as the Google user that has access to the MCC, and it prints a **refresh token**. Save it. (Any standard OAuth2 desktop/installed-app flow against scope `adwords` works the same way.)

5. **Set `login-customer-id`.** This is your MCC ID with dashes removed. It goes in the client config (header `login-customer-id`) so queries against child accounts authorize through the manager.

6. **Test with a simple GAQL read.** Create `google-ads.yaml`:
   ```yaml
   developer_token: YOUR_DEV_TOKEN
   client_id: YOUR_CLIENT_ID
   client_secret: YOUR_CLIENT_SECRET
   refresh_token: YOUR_REFRESH_TOKEN
   login_customer_id: "1234567890"   # MCC, digits only
   use_proto_plus: True
   ```
   Then run a campaign-metrics query for the last 30 days against one client account (`customer_id` = that account's ID, digits only):
   ```python
   from google.ads.googleads.client import GoogleAdsClient
   client = GoogleAdsClient.load_from_storage("google-ads.yaml")
   ga = client.get_service("GoogleAdsService")
   query = """
     SELECT campaign.name,
            metrics.impressions, metrics.clicks,
            metrics.cost_micros, metrics.conversions
     FROM campaign
     WHERE segments.date DURING LAST_30_DAYS
   """
   for row in ga.search(customer_id="4357102897", query=query):
       print(row.campaign.name, row.metrics.clicks,
             row.metrics.cost_micros / 1_000_000, row.metrics.conversions)
   ```
   Note: cost is returned in **micros** (divide by 1,000,000 for currency).

### 1.3 Read-only posture
There is no read-only OAuth scope for Google Ads (the `adwords` scope grants read+write). Enforce read-only by **convention**: only ever call `GoogleAdsService.search` / `searchStream` (GAQL SELECTs). Never call mutate operations. Keep the helper scripts free of any `*_operation` / `mutate_*` code.

---

## Part 2 - Meta (Facebook) Marketing API

### 2.1 What to gather

| Item | What it is |
|------|-----------|
| Meta Business app | An app of type "Business" registered at developers.facebook.com |
| App ID + App Secret | Credentials for that app |
| System User | A non-human Business Manager user that owns the token (survives password changes) |
| System User access token | Long-lived token with `ads_read` |
| `ads_read` permission | The read-only Marketing API permission |
| App assigned to each ad account | The app must be added to every client ad account |
| `act_<AD_ACCOUNT_ID>` | The ad account ID with the `act_` prefix, used in API paths |

Meta ad accounts to wire up (confirm exact IDs in Business Settings > Accounts > Ad Accounts):
Florecita, Buzz Bull, Jeff Hozias, NKCDC, Vanessa.

### 2.2 Steps in order

1. **Create the app.** developers.facebook.com > My Apps > Create App > type **Business**. Note the App ID and App Secret (Settings > Basic).

2. **Create a System User.** business.facebook.com > **Business Settings** > Users > **System Users** > Add. Use an "Employee" (not Admin) system user for least privilege.

3. **Assign ad accounts to the System User.** Still in Business Settings: System User > **Assign Assets** > Ad Accounts > select each client account > grant **View performance / read** access (not Manage). Repeat for Florecita, Buzz Bull, Jeff Hozias, NKCDC, Vanessa.
   - Also add your app to each ad account: Business Settings > Accounts > Ad Accounts > select account > **Connected assets / Apps** > add your app.

4. **Generate a long-lived System User token.** On the System User row > **Generate New Token** > pick your app > select scope **`ads_read`** only. System User tokens are long-lived (effectively non-expiring unless revoked or secret rotated). Copy it immediately - it's shown once.

5. **Test with an Insights read.** Replace `<ACT_ID>` and `<TOKEN>`:
   ```bash
   curl -G "https://graph.facebook.com/v21.0/act_<ACT_ID>/insights" \
     --data-urlencode "fields=campaign_name,impressions,clicks,spend,actions" \
     --data-urlencode "date_preset=last_30d" \
     --data-urlencode "level=campaign" \
     --data-urlencode "access_token=<TOKEN>"
   ```
   Or with the official SDK:
   ```bash
   pip install facebook-business
   ```
   ```python
   from facebook_business.api import FacebookAdsApi
   from facebook_business.adobjects.adaccount import AdAccount
   FacebookAdsApi.init(access_token="<TOKEN>")
   acct = AdAccount("act_<ACT_ID>")
   for row in acct.get_insights(
       params={"date_preset": "last_30d", "level": "campaign"},
       fields=["campaign_name","impressions","clicks","spend","actions"]):
       print(dict(row))
   ```
   `ads_read` is sufficient for all Insights reporting. Use the current Graph API version (check developers.facebook.com for the latest; bump the `vXX.0` in URLs as versions age out).

---

## Part 3 - Wiring into Claude Code

Pick **one** approach. Option B is recommended for this vault because the agents read the vault from JSON files and you keep full control over what runs.

### Option A - MCP server
Add a community Google Ads / Meta Ads MCP server to the Claude Code session config (`.mcp.json` at the vault root, or `.claude/settings.local.json`). MCP servers receive credentials via their `env` block.

```jsonc
// .mcp.json  (vault root)
{
  "mcpServers": {
    "google-ads": {
      "command": "npx",
      "args": ["-y", "<google-ads-mcp-package>"],
      "env": {
        "GOOGLE_ADS_DEVELOPER_TOKEN": "${GOOGLE_ADS_DEVELOPER_TOKEN}",
        "GOOGLE_ADS_CLIENT_ID": "${GOOGLE_ADS_CLIENT_ID}",
        "GOOGLE_ADS_CLIENT_SECRET": "${GOOGLE_ADS_CLIENT_SECRET}",
        "GOOGLE_ADS_REFRESH_TOKEN": "${GOOGLE_ADS_REFRESH_TOKEN}",
        "GOOGLE_ADS_LOGIN_CUSTOMER_ID": "${GOOGLE_ADS_LOGIN_CUSTOMER_ID}"
      }
    },
    "meta-ads": {
      "command": "npx",
      "args": ["-y", "<meta-ads-mcp-package>"],
      "env": { "META_ACCESS_TOKEN": "${META_ACCESS_TOKEN}" }
    }
  }
}
```
Verify the package name and its exact env-var names before trusting it (these vary by project). Prefer MCP servers that only expose read/reporting tools. **Vet third-party MCP servers** - they receive live credentials.

### Option B - Read-only scripts (recommended)
Small scripts using the official SDKs (`google-ads`, `facebook-business`) that dump metrics to JSON, which the vault agents then read and write into the logs. Suggested layout:

```
System/
  reporting/
    pull_google_ads.py     # GAQL SELECTs only -> JSON
    pull_meta_ads.py       # Insights reads only -> JSON
    accounts.json          # name -> {google_customer_id, meta_act_id, vault_path}
    out/                   # generated metric JSON (gitignored)
```
`accounts.json` maps each client to its Google customer ID, Meta `act_` ID, and vault folder. Scripts write `out/<client>.json`; an agent reads those and fills the markdown.

### Mapping - what gets auto-populated

| Source | Vault target | Section filled |
|--------|-------------|----------------|
| Google Ads + Meta per client | `01_Clients/<Client>/Reporting Log.md` | **Latest Snapshot** (spend, impressions, clicks, conversions, CPL/CPC), **Ad Performance Notes** |
| Both, all clients aggregated | `Reports/<YYYY-MM> Rollup.md` (new monthly file) | cross-client monthly totals + per-client lines |

Per-client `Reporting Log.md` files that exist today (all have empty `## Latest Snapshot` / `## Ad Performance Notes` placeholders to fill):

- Google Ads: Bar Crawl USA, Shadow HVAC, Link Eze, Kimberly James Bridal, Fresh Blends Replenish, NKCDC, Jeff Hozias
- Meta: Florecita, Buzz Bull, Jeff Hozias, NKCDC (+ Vanessa once a client folder exists)
- Also present with logs: Hardwood Artisan, Omega Landscaping, Onsite Concrete

Jeff Hozias and NKCDC appear on **both** platforms - merge both sources into their single `Reporting Log.md`.

The `Reports/` folder is currently empty; the rollup is a new file per month, e.g. `Reports/2026-05 Rollup.md`.

---

## Part 4 - Security

- **Never commit tokens.** Store them in environment variables or a secrets manager - not in any tracked file. The example `google-ads.yaml` and `accounts.json` should reference env vars or live outside the repo.
- **Update `.gitignore`** (current file ignores `.obsidian/workspace*`, `08_Assets/`, `09_Transcripts/`). Add:
  ```gitignore
  # API credentials & secrets - never commit
  google-ads.yaml
  .env
  *.env
  **/secrets*
  System/reporting/out/
  *credentials*.json
  ```
  Use a `.env` file (gitignored) and load it; keep `.env.example` with blank values committed for reference.
- **Least privilege:** Google Ads - read via `search`/`searchStream` only. Meta - `ads_read` scope only, "View performance" asset access, Employee-level system user.
- **Rotation:** if a token leaks - Google: regenerate/rotate the developer token in API Center and/or revoke the OAuth client and mint a new refresh token; Meta: revoke the system user token (regenerate, or rotate the App Secret which invalidates derived tokens). Rotate immediately on any suspected exposure.
- **Don't paste tokens into chat or logs.** Scripts should read from env and never print full tokens.

---

## Part 5 - Do-this-in-order checklist

**Google Ads**
- [ ] Confirm/identify the MCC and that all 7 client accounts are linked under it
- [ ] Apply for developer token in MCC > API Center (**start now - approval can take several days**)
- [ ] Create Google Cloud project, enable Google Ads API
- [ ] Configure OAuth consent screen (scope `adwords`, add self as test user)
- [ ] Create OAuth Desktop client ID + secret
- [ ] Generate refresh token via OAuth flow
- [ ] Set `login-customer-id` = MCC (digits only) in `google-ads.yaml`
- [ ] Run the 30-day campaign GAQL test against one client account
- [ ] Confirm token reached **Basic access** (test access won't hit real accounts)

**Meta**
- [ ] Create Business-type app; note App ID + Secret
- [ ] Create an Employee-level System User in Business Settings
- [ ] Assign all client ad accounts to the system user (View performance)
- [ ] Add the app to each ad account
- [ ] Generate long-lived system user token with `ads_read` only
- [ ] Record each `act_<AD_ACCOUNT_ID>`
- [ ] Run the `last_30d` Insights test against one ad account

**Wiring + security**
- [ ] Choose Option A (MCP) or B (scripts)
- [ ] Build `accounts.json` mapping client -> Google ID / Meta act_ / vault path
- [ ] Add secret patterns to `.gitignore`; move all tokens into env / `.env`
- [ ] Confirm no token is committed (`git grep` for token prefixes)
- [ ] First run: populate one client's `Reporting Log.md` end-to-end as a test
- [ ] Schedule monthly run -> fill all logs + generate `Reports/<YYYY-MM> Rollup.md`

**Wait-time note:** the Google developer-token approval is the long pole and can take several days; everything else can be done same-day. Apply for the token first, build the rest in parallel.
