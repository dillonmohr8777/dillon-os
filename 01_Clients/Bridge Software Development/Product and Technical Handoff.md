---
project: Bridge Software Development
type: product-technical-handoff
status: discovery
updated: 2026-07-11
tags: [product, technical, nextjs, supabase, handoff]
---

# Product and Technical Handoff

## Application map

```text
Public
├─ Landing / value proposition
├─ Directory
│  ├─ Search and filters
│  └─ Member profile
├─ Join / sign in
└─ Role-based onboarding

Member workspace
├─ Dashboard
├─ Profile editor
├─ Saved profiles
├─ Contact requests
├─ Announcements
└─ Notifications

Administration
├─ Verification queue
├─ Member management
├─ Reported profiles
├─ Content moderation
└─ Audit trail
```

## Role matrix

| Capability | Brand | Dispensary/Retailer | Sales rep | Admin |
|---|---:|---:|---:|---:|
| Create/edit own profile | Yes | Yes | Yes | Support/override |
| Browse/filter directory | Yes | Yes | Yes | Yes |
| Save profiles | Yes | Yes | Yes | Optional |
| Send/receive contact request | Yes | Yes | Yes | Moderate |
| Publish basic announcement | Yes | Yes | Yes | Moderate |
| Submit identity/license evidence | Yes | Yes | As required | Review |
| Approve/reject verification | No | No | No | Yes |
| Report or moderate | Report | Report | Report | Yes |

Open: retailer and dispensary may be separate account types or one organization type with subcategories.

## Core screen intent

1. **Landing:** Visitor understands who Bridge is for and can enter directory or onboarding.
2. **Directory:** User searches/filters by role, market, specialty, and verification status with zero-results guidance.
3. **Member profile:** User sees identity, role, location, specialties, verification, partnership intent, and announcements.
4. **Contact request:** Member selects a reason and sends a concise introduction without exposing private contact details before acceptance.
5. **Role onboarding:** Member selects role and receives role-specific fields and evidence requirements.
6. **Member dashboard:** Member sees profile health, discovery activity, contact requests, saved activity, and next actions.
7. **Admin verification:** Reviewer sees evidence, status, age, decision actions, reasons, and audit history.
8. **Saved profiles:** Member adds/removes profiles and returns later.
9. **Notifications:** Member receives understandable verification and contact-request changes.
10. **Announcements:** Approved roles publish/manage basic updates within MVP limits.

## Front-end architecture already present

- Next.js 16.2.10 App Router
- React 19.2
- TypeScript strict mode
- Plain CSS design-token system
- Theme switcher with `current`, `network`, and `botanical`
- Reusable components: brand mark, site header, profile card, status chip, theme switcher
- Fictional mock profiles in `lib/data.ts`
- Static routes and no server-side data integration yet

## Backend boundary for Miraj

Before front-end integration, agree on:

- Entities and relationships
- Role claims and authorization rules
- Supabase schema and migrations
- RLS intent and test cases
- Auth provider and onboarding states
- Query/API shapes and generated TypeScript types
- File-upload constraints, MIME types, maximum sizes, and storage paths
- Validation errors and user-visible error codes
- Verification evidence lifecycle
- Audit-log requirements
- Seed/test data
- Environment and secret ownership
- Deployment and rollback responsibilities

Do not add production Supabase code until those contracts are reviewed.

## Candidate entities

These are discussion candidates, not approved schema:

- `users`
- `organizations`
- `organization_members`
- `profiles`
- `roles`
- `markets`
- `specialties`
- `licenses`
- `verification_submissions`
- `verification_reviews`
- `contact_requests`
- `saved_profiles`
- `announcements`
- `notifications`
- `reports`
- `moderation_actions`
- `audit_events`

## State models to define

### Verification

`draft → submitted → in_review → approved | changes_requested | rejected → expired/reverification`

### Contact request

`draft → sent → accepted | declined | withdrawn | expired`

### Profile visibility

`draft → pending_verification → published | hidden | suspended`

## Data/compliance questions

- Which roles require EIN, license, government ID, or authorization evidence?
- Which sources are authoritative by state?
- What exactly does “Verified” promise?
- When does verification expire?
- Which fields are public, member-only, private, or admin-only?
- How long are documents retained?
- Who can access rejected evidence?
- Is there an appeals/re-review flow?
- What age/jurisdiction language applies?
- Which admin decisions require audit logs?

## Nonfunctional requirements

- Responsive browser support
- Keyboard-accessible interaction
- WCAG-conscious color contrast and semantics
- No page-level horizontal overflow
- Explicit loading, empty, error, permission, rejection, and success states
- Reasonable performance budgets
- Secure auth/session handling
- Least-privilege data access
- No real personal/regulated data in fixtures
- Observable failures and reversible releases

## Definition of ready for a build slice

- User and goal identified
- Approved reference or flow
- In/out behavior listed
- Data/API contract agreed
- Loading/empty/error/permission states defined
- Acceptance criteria written
- Files/services allowed to change listed
- Tests identified
- Human reviewer named

## Definition of done

- Acceptance criteria pass
- Typecheck, lint, build, and relevant tests pass
- Desktop/mobile behavior verified
- Accessibility and permission behavior reviewed
- No secrets or sensitive fixtures added
- Documentation/decision log updated
- Dillon and Miraj review the relevant front-end/backend boundary
