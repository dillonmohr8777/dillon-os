# Prospect Radar Three.js Scroll Lab

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Delegated by Dillon on August 9, 2026: Vite, vanilla JavaScript, and Three.js. This keeps the four-page experience dependency-light, produces static Netlify-ready output, and supports shared production-grade 3D without introducing an application backend.

## Users

- Primary: a prospective customer evaluating one of the three businesses and trying to understand the next useful conversation.
- Review: Dillon and Momentum 360 collaborators comparing prospect concepts before any outreach or factual publication.

## Product Purpose

Turn three existing Prospect Radar entries into unusually memorable, fully responsive website concepts. Each page uses a persistent scroll-driven 3D demonstration to make an otherwise abstract decision sequence tangible while keeping unverified business facts visibly provisional.

Success means all three concepts feel materially different, remain legible without WebGL or motion, preserve their live `/sites/<slug>/` routes, and deploy together to the verified existing Prospect Radar Netlify site as builds 166–168.

## Positioning

The Scroll Lab treats 3D as the page's explanation system rather than a decorative hero: a room assembles as renovation decisions become concrete, a raw stone becomes a finished jewel as questions become clearer, and a pool system opens into a readable service cutaway.

## Operating Context

- The host is the existing 30-prospect Momentum 360 Radar review site.
- These are public-by-URL, noindex concept previews. They are not approved business websites or outreach-ready claims.
- The existing source-backed addresses and any explicitly sourced MacLaren process language may be retained.
- The existing live routes are `maclaren-kitchen-bath`, `golden-eagle-jewelry`, and `morton-electric-pool-spa`.
- The branch is `feature/prospect-3d-scroll-trio`; `main` remains untouched.

## Capabilities and Constraints

- Four responsive pages: one lab index and three prospect concepts.
- One persistent Three.js canvas per prospect page with damped scroll, authored camera and target curves, shot-specific FOV, opening dolly, pointer parallax, and adaptive rendering.
- Distinct wood, stone, gold, water, copper, lighting, and steam material treatments.
- Intentional reduced-motion final states, WebGL-unavailable fallbacks, keyboard-visible navigation, and no horizontal overflow.
- Three locally generated cinematic WebP scene plates plus a deterministic seven-asset WebP material set; generated scenes remain clearly identified as synthetic.
- The official MacLaren logo and Golden Eagle's current business-controlled profile artwork are used as supplied. No Morton logo is fabricated because no authentic current artwork was verified.
- No forms, analytics, pricing, testimonials, performance claims, or invented services.
- Current services, hours, availability, contact details, and ownership require verification on the official business source before outreach or reuse.

## Brand Commitments

- Momentum 360 Prospect Radar review framing stays explicit and visually subordinate to each concept.
- MacLaren: official identity, blue-hour architecture, black walnut, stone, warm practical light, and room assembly.
- Golden Eagle: current yellow-and-black profile identity, midnight workshop, raw-to-finished sapphire transformation, velvet, and controlled gold light.
- Morton: neutral verified-name treatment, blue-hour pool-system cutaway, copper service paths, water behavior, and steam.
- Each visual world uses a three-plane cinematic composition: generated background plate, live WebGL atmosphere/geometry, editorial HTML, and an independently moving near plane.

## Evidence on Hand

- Existing 30-route release handoff: `C:/Users/dillo/Documents/Codex/2026-08-09/please-push-it-at-netlify/release-handoff/momentum-prospect-radar-next10-2026-08-08.netlify.app/`.
- Source-backed concept copy and addresses in the three existing route files under that handoff.
- Current verified Netlify site: `momentum-prospect-radar-next10-2026-08-08`, site ID `4c6ea488-5a2f-4bc7-ba54-7d3456784487`.
- MacLaren's official PNG logo and Golden Eagle's current business-controlled Facebook profile artwork are locally archived with source, dimensions, hashes, and rights caveats in `BRAND-ASSET-NOTES.md`.
- No authentic Morton logo, approved proprietary photography, testimonials, project results, pricing, or service inventory are available; the build must not invent them.

## Product Principles

1. Demonstrate the narrative instead of repeating a marketing claim.
2. Keep uncertainty visible and useful.
3. Make each business concept materially and compositionally distinct.
4. Preserve the complete story when motion or WebGL is unavailable.
5. Add to the live radar without deleting or renumbering existing prospects.

## Accessibility & Inclusion

Target WCAG 2.2 AA fundamentals. All content and actions remain available by keyboard and without the canvas. Reduced-motion users receive a composed final scene with no scroll-coupled motion. Mobile layouts preserve readable type, 44-pixel touch targets, and safe-area spacing.
