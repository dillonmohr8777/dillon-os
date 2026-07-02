# Shipping Mohr Agents to the App Store without a Mac

You do not need to own a Mac. The only unavoidable cost is the **$99/yr Apple
Developer Program**. Everything else runs on a hosted macOS CI runner and in
your web browser. This repo already contains the pipeline (`fastlane` +
`.github/workflows/mohr-agents-ios-release.yml`); this is the operator runbook.

> Reality check: there is **no** legitimate way onto the public App Store
> without an Apple Developer account. Sideloading (AltStore), 7-day free
> provisioning, and EU alternative marketplaces are not the App Store. Budget
> the $99.

## One-time setup (all in a browser)

1. **Enroll** in the Apple Developer Program — https://developer.apple.com/programs/
   ($99/yr; individual is fine to start).
2. **Register the App ID** `com.mohrmedia.mohragents` with the **Sign in with
   Apple** and **In-App Purchase** capabilities
   (developer.apple.com → Certificates, IDs & Profiles → Identifiers).
3. **Create the app record** in App Store Connect (My Apps → +), bundle ID above.
4. **Create the subscriptions** (App Store Connect → your app → Subscriptions):
   group "Mohr Agents Pro", products `com.mohrmedia.mohragents.pro.monthly`
   ($29.99) and `…pro.yearly` ($299.99), 1-week intro trials — matching
   `ios/MohrAgents.storekit`.
5. **Sign the Paid Applications agreement** and fill in banking + tax
   (App Store Connect → Business). Without this, IAP can't be reviewed.
6. **Create an App Store Connect API key** (Users and Access → Integrations →
   App Store Connect API) with the **App Manager** role. Download the `.p8`
   once. Note the **Key ID** and **Issuer ID**.

## Wire the CI secrets (GitHub → Settings → Secrets and variables → Actions)

| Secret | Value |
|---|---|
| `ASC_KEY_ID` | the API Key ID |
| `ASC_ISSUER_ID` | the Issuer ID |
| `ASC_KEY_CONTENT` | the `.p8` file base64-encoded: `base64 -i AuthKey_XXXX.p8 \| pbcopy` (any OS with `base64`) |
| `DEVELOPMENT_TEAM` | your Team ID (App Store Connect → Membership) |

## Ship a build

- **TestFlight beta:** push a tag — `git tag mohr-ios-v0.1.0 && git push origin mohr-ios-v0.1.0` — or run the *Mohr Agents iOS release* workflow from the Actions tab with lane `beta`. The hosted Mac builds, auto-signs via the API key, and uploads to TestFlight.
- **App Store submission:** run the workflow with lane `release`. It uploads the binary; then in App Store Connect add screenshots (6.9" + 6.5"), description, keywords, privacy labels, the privacy-policy and terms URLs (drafts in `docs/PRIVACY.md` / `docs/TERMS.md`), a reviewer demo note, and hit **Submit**. Flip `submit_for_review: true` in `ios/fastlane/Fastfile` once you want CI to submit automatically.

## No Mac at all, ever?

- **GitHub Actions `macos-14` runner** (what this repo uses) — free minutes cover occasional releases; macOS minutes bill at 10× on private repos, so keep releases deliberate.
- **Codemagic** — 500 free Mac build-minutes/month, mobile-focused UI; point it at this repo and the same `ios/fastlane` lanes work.
- **MacinCloud / MacStadium** — rent a cloud Mac by the hour if you ever want Xcode directly (e.g. to tweak signing interactively).

## Honest caveats

- The fastlane + workflow config here is written to the conventional
  API-key + automatic-signing pattern but **has not been run on a Mac from
  this environment** (no Swift toolchain here). Expect the first CI run to need
  a small tweak — most often the Xcode version in the workflow
  (`Xcode_16.app`) or a signing-capability toggle. The logs artifact on
  failure will point at it.
- Screenshots and the app icon still need to be produced (any image tool; no
  Mac required) before review will pass.
