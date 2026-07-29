---
client: Tori
project: Bridge Software Development
status: active-discovery
confidentiality: private-nda
github: https://github.com/dillonmohr8777/bridge-discovery-prototype
tags: [client, bridge-software, product, ux, frontend, nextjs, cannabis]
updated: 2026-07-27
---

# Bridge Software Development

> [!danger] Project identity
> This is Tori's **Bridge software-development project**: a cannabis-industry directory and professional-network web application. It is not [[Bridge of Hope OTC]], not an SEO audit, and not a generic client meeting-prep project.

## Source of truth

- Private GitHub: [dillonmohr8777/bridge-discovery-prototype](https://github.com/dillonmohr8777/bridge-discovery-prototype)
- Default branch: `main`
- Current handoff commit as of 2026-07-11: `d1e554c`
- Claude entrypoint: `CLAUDE.md`
- Claude reset prompt: `CLAUDE_SESSION_PROMPT.md`
- Local checkout: `C:\Users\dillo\Documents\Codex\2026-07-10\find-what-we-need-to-do\bridge-discovery-prototype`

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
- [[../../10_Sessions/Bridge Software Development - 2026-07-11|2026-07-11 build session]]

## Session sync

_Updated by codex-session-sync, Run 34 — 2026-07-27._

- **Post-Tori meeting capture missing (~14d overdue):** No vault session documents meeting outcomes, decision register updates, or revised MVP boundary after the Tori discovery meeting. Create `10_Sessions/Bridge Software Development — YYYY-MM-DD.md` or update [[../../10_Sessions/Bridge Software Development - 2026-07-11|2026-07-11 session]] with decisions.
- **Tori prototype walkthrough still pending** — original Claude mockups not delivered in accessible Gmail/Drive/Slack; NDA-safe live walkthrough required.
- **Brand assets unapproved** — no official logo, palette, or fonts; provisional **Trusted Current** direction awaits Tori sign-off.
- **Open product decisions:** exact role model (retailer vs dispensary), verification evidence/legal meaning, profile/contact visibility rules, priority directory filters, first launch audience/market, final MVP boundary.
- **Backend handoff pending** — API/RLS contracts and review cadence with Miraj not yet captured post-meeting.
- **Next technical session:** new Claude session with `dillonmohr8777/bridge-discovery-prototype` attached; paste `CLAUDE_SESSION_PROMPT.md`; prove repo access before planning.

## Immediate next action

Capture Tori meeting outcomes in a dated session note, then start a new Claude session with the GitHub repository explicitly attached. Paste `CLAUDE_SESSION_PROMPT.md`. Claude must prove it can read the repository before planning or editing.
