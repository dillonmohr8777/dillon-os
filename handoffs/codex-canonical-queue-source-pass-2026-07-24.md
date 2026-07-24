# Codex source pass — 2026-07-24

Authority: read-only intake for Codex. Not canonical Marketing Chief queue state. Do not merge, publish, deploy, mutate the queue, post in client channels, or start implementation from this file alone.

Prepared for: tonight’s canonical queue assist (Pritzker sponsor landing brief + VA Claims UI criteria capture).

---

## Access status

| Source | ID / URL | Result |
|---|---|---|
| `#pritzker-law-group` | `C0BB04ZFZ26` | **Blocked.** Cursor Slack Tools reports this as a private channel this bot cannot read. |
| `#va-claims` | `C0AU6GMGY73` | **Blocked.** Same private-channel restriction. |
| Slack MCP (`Slack` server) | n/a | **Needs auth** in this environment; unused. |
| Supplied Slack logo image | channel attachment | **Not available** to this run (channel unread). |
| Firm website | https://www.pritzkerlg.com/ | Read |
| Rachael bio | https://www.pritzkerlg.com/about/rachael-j-pritzker-esq-/ | Read |
| About page | https://www.pritzkerlg.com/about/ | Read |
| Instagram | https://www.instagram.com/pritzkerlawgroup/ | Handle confirmed via public references; profile wall is login-gated here |
| Marketing Chief seed mirror | `_os/marketing-chief-operator-studio/data/seed-snapshot.json` (PR #208 tree) | Read for VA historical DoD only |

**Unblock needed for full fidelity:** add the Cursor Slack bot to both channels, or paste the July 24 Obaid message + any channel-only Pritzker sponsor notes into the operator thread.

---

## Part 1 — Pritzker Law Group landing-page brief

**Page intent (task framing, not a public claim):** premium-sponsor landing page for Pritzker Law Group on “Love, Philadelphia — The Podcast.”

### Confirmed facts (public sources only)

Firm identity
- Legal name / brand: **Pritzker Law Group**
- Specialty: real estate, development, and government relations in Philadelphia, Pennsylvania, New Jersey, and surrounding counties
- Founders: twin attorneys **Adam Pritzker** and **Rachael Pritzker** (founded 2017 per LinkedIn company profile; twins-founded confirmed on About page)
- Positioning on site: full-service real estate law firm for investors, individuals, developers, and institutions
- Certified women-owned business / Certified Women’s Business Enterprise; recognized as Woman-Owned Small Business (WOSB) by the U.S. SBA (About page)
- Member: Building Industry Association of Philadelphia (BIA)

Contact / location
- Address: **1521 Locust Street, Suite 605, Philadelphia, PA 19102**
- Phone: **(215) 515-0882**
- Website: https://www.pritzkerlg.com/
- Instagram: **@pritzkerlawgroup** (https://www.instagram.com/pritzkerlawgroup/)
- Site CTA: free **15-minute** initial consultation

Practice areas named on homepage / services list
- Zoning & land use
- Contracts / negotiations
- Licenses & permit expediting
- Property due diligence / feasibility
- Private money lending transactions
- Property closing support
- Government relations
- Development and design
- Business / real estate / commercial / contract law (as listed)

Rachael J. Pritzker, Esq. (CEO & Founder) — bio page facts
- PA & NJ Bar member
- B.A., The Pennsylvania State University; J.D., Widener University School of Law (Delaware)
- CEO of Pritzker Law Group; practice focus: zoning, land use, public property acquisition, government relations in Philadelphia, New Jersey, and surrounding counties
- Served as Legislative Counsel to former Philadelphia City Councilman At-Large Allan Domb (site spelling: “Legislative Council” — preserve as site text if quoting; prefer “Counsel” only if Dillon confirms correction)
- Site states the firm is the City’s only Certified Women-Owned Real Estate law firm
- Site-listed recognitions / accomplishments (do not expand beyond these without new sources):
  - 2025 Philadelphia Business Journal 40 Under 40
  - Super Lawyers / Rising Star acknowledgements 2019–2025 (as stated on bio)
  - One of the first 27 women appointed to the Mayor’s Commission for Women — Entrepreneurship Working Group
  - Young female Board Member of BIA (site wording)
  - Site-stated variance / BRT approval rates and legislation drafting claims appear on the bio; **treat as firm-authored statements, not independently verified outcomes**

Partners / named clients on homepage (for optional logo-wall only if rights cleared)
- Shift Capital, TCS Management, ShopCore Properties, Mosaic Development Partners, E Built

### Logo assets (public site logos; Slack-supplied file missing)

Local vault copies (downloaded from public site, HTTP 200):
- `01_Clients/Pritzker Law Group/assets/logo-dark.png`
- `01_Clients/Pritzker Law Group/assets/logo-light.png`
- `01_Clients/Pritzker Law Group/assets/logo.png`

Canonical remote URLs:
- https://www.pritzkerlg.com/images/brand/logo-dark.2411201105035.png
- https://www.pritzkerlg.com/images/brand/logo-light.2411201105037.png
- https://www.pritzkerlg.com/images/logos/Logo.2411201105035.png

Prefer the Slack-supplied logo if Dillon provides it later; until then use `logo-dark.png` / `logo-light.png` from the firm site.

### Channel-blocked / not independently confirmed

Mark these as **task-asserted, channel-unverified** until `#pritzker-law-group` is readable or Dillon confirms:
1. Premium sponsorship of **“Love, Philadelphia — The Podcast.”**
2. Any sponsor deliverable scope, episode placement, read script, UTM, or CTA unique to the podcast.
3. Any channel-only brand preferences, disclaimers, or approved claims.

Public web search did **not** surface a podcast publicly titled “Love, Philadelphia — The Podcast,” and did **not** link Pritzker Law Group to Visit Philadelphia’s separate “Love + Grit” podcast. Do **not** conflate those shows.

### Inferred copy only (optional draft; not facts)

Use only if Codex needs starter copy. These lines are derived from confirmed site language; they are **not** firm-approved and must stay labeled inferred:

- **Hero eyebrow (inferred):** Premium sponsor · Love, Philadelphia — The Podcast *(sponsorship clause is task-asserted)*
- **Hero brand:** Pritzker Law Group
- **Hero line (inferred):** Philadelphia real estate counsel for zoning, land use, development, and government relations.
- **Support (inferred):** A certified women-owned firm founded by attorneys Adam and Rachael Pritzker — collaborative development counsel from first outreach through approvals.
- **Primary CTA (confirmed pattern):** Schedule a free 15-minute consultation → firm contact form / (215) 515-0882
- **Secondary CTA (inferred):** Visit pritzkerlg.com · Instagram @pritzkerlawgroup
- **About blurb (inferred condensation of About page):** Twin-founded, in-house real estate practice serving investors, individuals, developers, and institutions across Philadelphia and the surrounding counties.
- **Rachael callout (inferred condensation):** CEO & Founder Rachael J. Pritzker focuses on zoning, land use, public property acquisition, and government relations, with private-sector and Philadelphia local-government experience.

### Hard prohibitions for implementers

- Do not invent case wins, dollar savings, testimonials, or awards beyond the bio/about sources above.
- Do not present site-stated approval-rate or legislation claims as independently audited outcomes.
- Do not claim podcast sponsorship details beyond Dillon/channel confirmation.
- Do not post in `#pritzker-law-group`.

### Suggested page skeleton (structure only)

1. Full-bleed brand/hero with logo + one headline + one support line + CTA
2. Short “Who we are” (founders + women-owned certification)
3. Practice focus strip (zoning / land use / government relations / transactions)
4. Optional Rachael founder note (bio-sourced only)
5. Contact block (address, phone, consultation CTA, Instagram)

---

## Part 2 — VA Claims: Obaid July 24 David-feedback request

### Requested capture — UNAVAILABLE

| Field | Status |
|---|---|
| Obaid’s July 24 David-feedback request (exact) | **Unavailable** — `#va-claims` (`C0AU6GMGY73`) not readable |
| Three exact UI acceptance criteria | **Unavailable** — same blocker; **not invented** |

Codex must not invent substitute criteria. Wait for channel access or a pasted excerpt.

### Related historical context only (NOT the July 24 three criteria)

From Marketing Chief private seed mirror (`generatedAt` 2026-07-23; queue revision 157) — prior work item `wi-20260717-0011` “Implement Obaid's Phase 2 VA Claims UI handoff” listed **six** graph verification tasks. These are **older DoD checks**, not Obaid’s July 24 David-feedback trio:

1. A reusable token and component contract covers color, typography, spacing, states, responsiveness, and reduced motion.
2. The login page source preserves the existing authentication behavior through a documented adapter boundary.
3. The application shell includes an accessible responsive sidebar, topbar, and main content region.
4. The dashboard source includes summary cards, a client table, a pipeline view, and honest loading, empty, and error states.
5. A standalone visual preview and automated local verification pass without using real claimant data.
6. The handoff identifies exact target paths and the private-repository access dependency without taking an external action.

Also noted in vault handoff `handoffs/marketing-chief-intake-2026-07-22.md`: keep `wi-20260717-0011` as highest-priority unblock until authorized access to `vaclaims-dev/vace-platform` exists; local Phase 2 UI package previously reported ready for a review branch.

### Boundaries

- No secrets, phone numbers, claimant data, or raw private Slack/Gmail bodies.
- No queue mutation, deploy, merge, or duplicate UI implementation from this pass.

---

## Codex read path

Primary artifact (this file):
- `handoffs/codex-canonical-queue-source-pass-2026-07-24.md`

Supporting assets:
- `01_Clients/Pritzker Law Group/assets/logo-dark.png`
- `01_Clients/Pritzker Law Group/assets/logo-light.png`
- `01_Clients/Pritzker Law Group/assets/logo.png`
- `01_Clients/Pritzker Law Group/overview.md`

Related prior refs (do not treat as July 24 criteria):
- `handoffs/marketing-chief-intake-2026-07-22.md`
- PR #208 seed: `_os/marketing-chief-operator-studio/data/seed-snapshot.json`
