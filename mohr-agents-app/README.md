# Mohr Agents — iOS App

The Mohr Media agency playbooks (Google Ads audits, SEO gap analysis, review
replies, plain-English reports…) packaged as a native iOS app for local
business owners. 11 agents, subscription-gated, built on Fable 5.

**Design spec:** the interactive prototype in [`prototype/index.html`](prototype/index.html),
live at https://mohr-agents-prototype.netlify.app. The prototype is the sales/
demo page; this repo is the real product. Per Apple's minimum-functionality
rule, the shipped app is native SwiftUI with live agent flows, login, a
backend API, and StoreKit subscriptions — not a webview wrapper.

## Layout

```
prototype/   Recovered Netlify prototype — design spec + brand palette
ios/         SwiftUI app (XcodeGen project.yml + sources + .storekit config)
backend/     Express/TS API — auth, agent chat (Anthropic), App Store webhooks
docs/        App Store submission checklist
PLAN.md      Roadmap and current status
```

## iOS quick start (requires a Mac)

```sh
cd ios
brew install xcodegen
xcodegen generate            # produces MohrAgents.xcodeproj
open MohrAgents.xcodeproj
```

- Debug builds point at `http://localhost:8787` (see `project.yml`); run the
  backend locally with `ALLOW_UNSUBSCRIBED=true`.
- Select `MohrAgents.storekit` as the StoreKit configuration in the scheme to
  test subscriptions without App Store Connect.
- Signing needs an Apple Developer Program membership ($99/yr) and the
  Sign in with Apple capability on the `com.mohrmedia.mohragents` app ID.

## Backend quick start

See [`backend/README.md`](backend/README.md).

## Monetization

Auto-renewable subscriptions (Mohr Agents Pro): $29.99/mo or $299.99/yr, both
with a 1-week free trial. Subscriptions fit ongoing model costs better than a
paid download. Product IDs are defined in `ios/MohrAgents.storekit` and must be
recreated identically in App Store Connect.
