---
client: Bridge Software
client_id: bridge-software
project: Bridge Software Development
status: active-build
confidentiality: private-nda
github: "https://github.com/dillonmohr8777/bridge-discovery-prototype"
tags: [client, bridge-software, product, ux, frontend, nextjs, cannabis]
updated: 2026-08-19
last_touched: 2026-08-19
next_action: Review draft PR #6 internally. Do not Slack, email the client, or update Netlify.
due: 2026-08-22
---


# Bridge Software Development

> [!danger] Project identity
> This is Tori's **Bridge software-development project**: a cannabis-industry directory and professional-network web application. It is not an SEO audit or a generic client meeting-prep project.

## Source of truth

- GitHub: [dillonmohr8777/bridge-discovery-prototype](https://github.com/dillonmohr8777/bridge-discovery-prototype)
- Default branch: `main`
- Phase 2 unified review URL: https://bridge-connected-signal.netlify.app
- Phase 3 branch: `cursor/phase-three-vertical-slice-acda`
- Phase 3 draft PR: https://github.com/dillonmohr8777/bridge-discovery-prototype/pull/6
- Claude entrypoint: `CLAUDE.md`
- Local checkout: `C:\Users\dillo\Documents\Codex\2026-07-10\find-what-we-need-to-do\bridge-discovery-prototype`

## Current phase

**Phase 3 is open.** Phase 2's five-route Trusted Current frontend is technically complete. The current slice is targeted Promotion create plus protected profile projection.

| Layer | Status |
|---|---|
| Phase 2 five-route frontend | Live at the unified noindex URL |
| Phase 3 adapter + Create / My Profile journeys | Draft PR #6 |
| Tori route-by-route written boxes | Still pending; does not stall this slice |
| Miraj Milestone 2 | Self-reported done, tests remaining as of 2026-08-17 |
| Live `/api/v1` bind | Blocked on inspectable staging origin |
| Unified Netlify update | Held. Dillon said no Slack and no client send. |
| Slack / client comms | Held until Dillon asks |

Out of slice without a written change order: expanded ecosystem directory, algorithmic ranking, subscriptions/payments, in-platform ordering.

## Product

Bridge is a browser-based cannabis-industry directory and professional network. Phase 1 connects brands, dispensaries, retailers, sales representatives, and platform administrators through searchable profiles, business/license verification, saved profiles, basic announcements, notifications, and structured contact requests.

## Working positioning hypothesis

For cannabis professionals who need credible B2B relationships, Bridge is a verified industry network that turns fragmented discovery into clear, intentional introductions. Unlike broad social networks or unverified directories, Bridge is structured around business roles, markets, verification, and permission-based contact.

This is a hypothesis for Tori to approve, not final public copy.

## Team ownership

| Person | Working responsibility |
|---|---|
| Tori | Product vision, client approval, original Claude prototype, brand and workflow decisions |
| Dillon | Product structure, UX/UI, AI-assisted development, React/Next.js front end, acceptance review, launch readiness |
| Miraj | Backend architecture, Supabase/PostgreSQL, auth, storage, security, integration, migrations |
| Melissa | Account management, communications, content, future SEO/marketing/promotion |
| Mac | Oversight, contract, commercial scope, escalation and final business coordination |

## Technology direction

- Browser-based web application
- Next.js + React + TypeScript front end
- Supabase/PostgreSQL backend direction
- Supabase Auth or approved equivalent
- Supabase Storage or compatible storage
- AWS was named in the proposal; final hosting responsibility and architecture remain open
- Claude, Codex, and Cursor for assisted research, specifications, code, tests, and review

## Prototype already built

The discovery prototype is implemented and verified. Routes:

- `/` — landing/value proposition
- `/directory` — working search, role, and verification filters
- `/join` — role-selection onboarding direction
- `/profile/cascade-canna` — member profile and permission-based contact request
- `/dashboard` — member dashboard
- `/admin/verification` — admin verification queue with responsive mobile cards
- `/directions` — three switchable visual directions
- `/design-system` — provisional design tokens, typography, controls, states, and voice principles

The prototype uses fictional profiles and metrics. It has no production backend, authentication, persistence, outbound email, or real license verification.

## Brand status

No approved Bridge logo, color palette, font system, or downloadable Tori prototype was found in accessible Gmail, Drive, or Slack history as of 2026-07-11. Tori said the name changed from The Ecosystem to Bridge and referenced a Claude prototype, but the prototype was held for an NDA-safe live walkthrough.

The green/gold proposal styling is Momentum presentation branding, not Bridge branding.

Default provisional direction: **Trusted Current**

- Navy `#12324A`
- Teal `#0A766E`
- Amber `#D9820F`
- Canvas `#F5F8F7`
- Primary text `#14232E`

Alternates: Modern Network and Botanical Ledger. All require Tori's approval.

## Monday/Tori meeting objective

Leave with decisions on:

1. Brand attributes and preferred visual direction
2. Whether Tori has private logo/brand assets that replace the provisional kit
3. First priority user and first successful connection scenario
4. Final role model, including whether retailer and dispensary are distinct
5. Meaning, evidence, expiration, and legal language behind verification
6. Public, member-only, and private profile/contact fields
7. Highest-priority directory filters
8. Phase 1 boundaries and any formal change requests
9. Asset/content owners and due dates
10. Next review and approval method

## Linked notes

- [[Agent Memory]]
- [[Product and Technical Handoff]]
- [[Meeting Prep - Tori]]
- [[Brand Guidelines - Provisional]]
- [[Source Audit]]
- [[Client Intelligence Overlay]]
- [[../../10_Sessions/Bridge Software Development - 2026-07-11|2026-07-11 build session]]
- [[../../10_Sessions/Bridge Software Development - 2026-08-19|2026-08-19 Phase 3 session]]
- [[../../12_Brain/05_Projects/2026-08-19 - Bridge Phase 3 promotion and protected profile|Phase 3 project]]
- [[../../12_Brain/04_Decisions/2026-08-19 - Bridge Phase 3 slice is open|Phase 3 slice decision]]
- [[../../12_Brain/01_Captures/2026-08-19 - Bridge Phase 3 hold on Slack and client send|Comms hold]]

## Immediate next action

Review draft PR https://github.com/dillonmohr8777/bridge-discovery-prototype/pull/6 internally. Do not post to Slack, email Tori or Melissa, or update the unified Netlify URL. Do not bind `NEXT_PUBLIC_BRIDGE_API_BASE` until Miraj publishes an inspectable staging origin.

## Communication intelligence - 2026-08-01

- Tori said the first prototype exceeded expectations and granted access to the review transcript; the feedback still needs full compilation.
- Phase 1 was defined as a $5,000 milestone with Dillon's 20 percent share recorded as $1,000 for July. Later phases remain milestone-based over the stated 10-to-14-week timeline.
- The project channel reported Phase 1 payment complete, but the receipt and commission ledger still require authorized financial reconciliation.
- Sources: [Gmail thread](gmail://thread/19f8101afe21e7e8), [milestone terms](https://momentum3d.slack.com/archives/C0B1Y5XDQMA/p1785513601951799), [payment report](https://momentum3d.slack.com/archives/C0BGWRK03B2/p1785602474763089)
