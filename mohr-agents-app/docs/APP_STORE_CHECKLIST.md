# App Store Submission Checklist — Mohr Agents

The smallest real path from this repo to a live subscription app. References:
- Minimum functionality rule: https://developer.apple.com/app-store/review/guidelines/ (§4.2)
- Program: https://developer.apple.com/programs/whats-included/
- IAP setup: https://developer.apple.com/help/app-store-connect/configure-in-app-purchase-settings/overview-for-configuring-in-app-purchases/
- App record: https://developer.apple.com/help/app-store-connect/create-an-app-record/add-a-new-app/
- Uploads: https://developer.apple.com/help/app-store-connect/manage-builds/upload-builds/
- Submission: https://developer.apple.com/help/app-store-connect/manage-submissions-to-app-review/submit-an-app/

## 1. Accounts & identifiers

- [ ] Enroll in the Apple Developer Program ($99/yr) — use the business entity
      (D-U-N-S required for an org account; individual works to start)
- [ ] Register app ID `com.mohrmedia.mohragents` with capabilities:
      Sign in with Apple, In-App Purchase
- [ ] Create a Sign in with Apple key if the backend later needs token revocation

## 2. Build

- [ ] `cd ios && xcodegen generate && open MohrAgents.xcodeproj`
- [ ] App icon (1024pt master) — swoosh mark on the warm ground color
- [ ] Point Release `MOHR_API_BASE_URL` at the deployed backend (HTTPS — ATS)
- [ ] Test subscriptions with the local `.storekit` config, then sandbox

## 3. Backend production readiness

- [ ] Deploy `backend/` behind HTTPS; set `ANTHROPIC_API_KEY`, `SESSION_SECRET`
- [ ] Database for entitlements; verify App Store notification signatures
- [ ] Configure the server notification URL in App Store Connect →
      App → App Information → App Store Server Notifications (V2)

## 4. App Store Connect

- [ ] Create the app record (bundle ID above)
- [ ] Subscriptions → group "Mohr Agents Pro" → products
      `…pro.monthly` $29.99 and `…pro.yearly` $299.99, 1-week intro trials
      (must match `ios/MohrAgents.storekit` exactly)
- [ ] Paid Applications agreement + banking/tax forms (blocks IAP review)
- [ ] Privacy nutrition labels: account info (email via Apple), user content
      (chat messages sent to backend/Anthropic); no tracking
- [ ] Privacy policy URL + terms (required for auto-renewable subscriptions)

## 5. Review-proofing (the §4.2 / §2.1 traps)

- [ ] Native functionality beyond a website: ✅ native UI, login, StoreKit,
      live agent flows — do NOT ship a webview of the Netlify page
- [ ] Demo account in review notes (backend flag to grant a reviewer
      entitlement, or a promo path) — reviewers must reach the paid content
- [ ] Subscription screen shows price, period, and links to privacy + terms
      (§3.1.2 requires this on the paywall itself)
- [ ] Restore-purchases button visible (already in `PaywallView`)
- [ ] AI-generated content: include a way to flag/report bad output (Apple
      increasingly expects this for AI apps) — even a mailto link satisfies it

## 6. Ship

- [ ] Archive in Xcode → upload to App Store Connect
- [ ] TestFlight internal → external beta
- [ ] Screenshots (6.9" and 6.5" iPhone), promo text, keywords
- [ ] Submit for review; respond fast to rejections (most are metadata fixes)

## Commercial notes

- Netlify prototype stays live as the sales/demo page; add an App Store badge
  and/or waitlist capture once the app is approved.
- Apple's cut: 30% year one, 15% after a subscriber's first year (or 15% from
  day one if enrolled in the Small Business Program — enroll, it's free).
- Watch unit economics: Fable 5 is $10/$50 per MTok. At ~2K tokens per answer,
  $29.99/mo supports roughly 250–400 answers/user/month at healthy margin —
  add per-user rate limits before launch.
