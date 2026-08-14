---
tags: [raw, research, align-hcm, brand]
captured: 2026-08-10
expires: 2026-11-10
session: claude/branded-deliverable-template-888znb
---

# Raw receipt — Align HCM brand extraction + branded deliverable build

**Summary:** exact Align HCM brand tokens and the exact logo were extracted from
the three shipped Align editorial PDFs (Aug 2026 set) and cross-checked against
the alignhcm-brand skill and this vault's brand page; used to build the branded
Top 30 Story Shortlist deliverables (xlsx + HTML twin, stored in the private
client-ops repo).

## Sources read

- Shipped PDFs (Dillon upload, 2026-08-10): `Align_HCM_Search_Opportunity_Dossier.pdf`,
  `payrollconsultantvsfractionalsupportvsmanagedpayroll.pdf` (Draft 1 of 6),
  `ukgmanagedservicesaftergolive.pdf` (Draft 2 of 6). All marked
  "UNPUBLISHED · INTERNAL USE", prepared 9 Aug 2026, Semrush US database.
- `claude-skills-repo/skills/alignhcm-brand/SKILL.md` (token pointers; canonical
  brand.md lives on Dillon's Windows box and is unreachable remotely).
- `02_FullTimeJob/AlignHCM/brand-guidelines.md` (this vault, pre-update state).
- HubSpot portal 242825734 confirmed live via MCP (`get_organization_details`:
  accountId 242825734, US/Eastern, USD + CAD). Company domains/HQ/employee
  counts read for shortlist enrichment. Read-only.
- WebSearch (alignhcm.com surfaces): SmartCare positioning, UKG-exclusive firm,
  Raven top-partner recognition. Direct site fetch blocked by sandbox egress.

## Extraction method

pymupdf over the three PDFs: fill-color census of vector drawings, text-color
census of spans, plus the page-1 logo image (300x150 with soft-mask) recombined
with its alpha mask and trimmed to 268x108 transparent PNG. That PNG is the
exact production mark (white wordmark + orange X and dots), not a recreation.

## Token inventory (hex, by observed role)

- Navy ink / masthead `#0A1628`; slate body `#2D3748`, `#4A5568`; muted `#646E7C`
- Steel blue `#1B4F72` (+ tint `#EDF3F8`); muted blue text on navy `#B9C6D8`, `#9FB1C7`
- Orange primary `#F05A28`; bright `#FF6B2B`; rust kicker `#AD3D1B`; tint `#FDF1EA`; light `#FF9E6E`
- Teal chip `#136E61` (+ tint `#E9F7F4`); product teal `#2BB5A0` (vault page, carousel era)
- Paper `#FCFAF7`; panel `#F5F1EA`; hairline `#E9E4DC`; deep cream `#D8D2C7`; total-row cream `#F4EFE7`
- Workbook conventions: header navy `#0B1D2D` (near-brand navy), editable yellow `#FFF2CC`
- Signature effects (from alignhcm-brand skill, production files): CTA gradient
  `linear-gradient(135deg, #F05A28 0%, #FF6B35 100%)`, glass panels
  (backdrop-blur 20–24px), ambient glow blobs (~120px blur, corner, low opacity),
  accent underline animation (scaleX 0→1, 0.6s, origin left).
- Fonts: Inter + DM Sans + Syne (production web/motion); vault alt list
  Plus Jakarta Sans, DM Sans, Poppins, Barlow; Office docs use Arial.

## What was built with it

Branded Top 30 Story Shortlist, two files (xlsx + HTML twin), committed to the
**private** repo `client-operations-canonical` under
`clients/align-hcm/deliverables/2026-08-10-top30-story-shortlist-branded/`.
Client names, deal values, and CRM enrichment stay in that private repo; this
public vault holds only the brand system.

## Environment lessons (remote sandbox)

- Egress is package-registries-only: no site fetches, no logo CDN pulls. Client
  logos in HTML deliverables must load client-side (logo.clearbit.com with a
  monogram fallback); xlsx gets the Align logo only (bytes available locally).
- LibreOffice here is `libreoffice-core` without Calc: `recalc.py` can never
  work (macro run deadlocks on futex; `--convert-to` says "source file could
  not be loaded"). Fix used: compute deterministic formula values in Python,
  inject cached `<v>` values at the sheet-XML level, set `fullCalcOnLoad`, and
  verify by data_only readback.
