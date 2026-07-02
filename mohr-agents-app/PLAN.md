# Mohr Agents — App Store Plan

Goal: ship Mohr Agents as a paid subscription app on the iOS App Store, using
the Netlify prototype (https://mohr-agents-prototype.netlify.app) as the design
spec and web sales page.

## Phase 0 — Prototype (done)

- [x] Interactive HTML prototype deployed to Netlify
- [x] Prototype checked into this repo (`prototype/index.html`) as the design spec

## Phase 1 — Scaffold (this branch)

- [x] SwiftUI app skeleton: home grid (3 sections, 11 agents), chat view,
      paywall, Sign in with Apple, brand theme from the prototype palette
- [x] StoreKit 2 manager + local `.storekit` config (monthly $29.99 /
      yearly $299.99, 1-week trials)
- [x] XcodeGen `project.yml` (no committed `.xcodeproj` churn)
- [x] Backend: Express/TS — Apple auth, session tokens, 11 agent configs
      (one JSON each), Anthropic chat proxy (`claude-fable-5` + Opus 4.8
      fallback), App Store Server Notifications receiver
- [x] App Store submission checklist (`docs/APP_STORE_CHECKLIST.md`)

## Phase 2 — Make it real (needs a Mac + accounts)

- [ ] Enroll in Apple Developer Program ($99/yr)
- [ ] `xcodegen generate`, build in Xcode, fix anything the compiler flags
- [ ] App icon + launch screen (swoosh mark from the prototype)
- [ ] Deploy backend (Fly.io/Railway/Render), point Release config at it
- [ ] Database for users + entitlements; verify App Store webhook signatures
- [ ] Set `appAccountToken` on purchases so webhooks map to users
- [ ] Streaming responses (SSE) so replies render token-by-token

## Phase 3 — Submit

- [ ] Create app record in App Store Connect (`com.mohrmedia.mohragents`)
- [ ] Recreate subscription products + group from `ios/MohrAgents.storekit`
- [ ] Screenshots, privacy nutrition labels, review notes with demo login
- [ ] TestFlight beta → fix → submit for review

## Phase 4 — Commercial loop

- [ ] Netlify page stays as the marketing site; add waitlist/App Store badge
- [ ] Track cost per user (Fable 5 tokens) vs $29.99/mo; tune per-agent effort
- [ ] Ship new agents (one config file each) based on usage

Working notes: iteration log kept in commit messages on
`claude/mohr-agents-app-store-hn0l6f`.
