---
tags: [campaign, spec, pipeline, automation]
campaign: "[[AI Site Builder Outreach Engine]]"
answers: "Mac's 2026-07-12 question: what steps can we use to automate everything"
---

# Pipeline Spec

Mac's pipeline, stage by stage, with the honest status of each: automated, partly automated, or manual. This note is the answer to "whats the steps taken we can use to automate everything."

Mac's original chain:

> Bot scrape > database > AI site builder > Zapier > QR Code > Direct Mail > Gate Keep for Sales Call

Mapped against the Orbit eight-stage model (discover, qualify, diagnose, build, quality gate, human approval, activate, learn).

```mermaid
flowchart TD
    Discover["1. Discover<br/>Maps scrape to prospect rows"]
    Qualify["2. Qualify<br/>score fit and site decay"]
    Brief["3. Brief<br/>research to brief.json"]
    Build["4. Build<br/>site factory generates site"]
    Gate["5. Quality gate<br/>automated QA plus human taste"]
    Approve["6. Approval<br/>Mac or Melissa sign off"]
    Activate["7. Activate<br/>deploy, QR, direct mail"]
    Learn["8. Learn<br/>scans, calls, closes to ledger"]

    Discover --> Qualify --> Brief --> Build --> Gate --> Approve --> Activate --> Learn
    Learn -.->|"tune scoring and offers"| Qualify
```

## Stage 1: Discover

**Goal:** a row per prospect with verified identity.

**Fields required:** business name, category/vertical, market, address, phone, website URL, Google Maps URL, review count, rating, place ID.

**Status: manual to partly automated.** Orbit can run Maps-first discovery and identity verification. Jesse owns prospect data in `#ghl-leads-apollo`, and Mac's stated column set there is Platform, Campaign, Ad Set, Name, Number, Email, Business, Website/other plus custom columns for notes and status.

**To automate:** one shared Google Sheet as the prospect database, populated by Maps scrape, with a stable `prospect_id`. That sheet is also the surface Zapier reads later, so it must be the single source of truth. **Owner: Jesse + Dillon.**

**Guardrails:** dedupe by place ID; suppress existing Momentum clients (cross-check `01_Clients/`), current pipeline deals, and anyone previously mailed.

## Stage 2: Qualify

**Goal:** rank who's worth building for.

**Score inputs:**
- **Site decay** (Dillon's insight, 2026-07-12: businesses whose sites "look really old and outdated" are the best targets). Signals: no mobile viewport, table layouts, dated fonts/stock imagery, no HTTPS, slow load, copyright year 3+ years stale, no schema.
- **Local visibility gap:** ranks poorly relative to review count, unclaimed or unoptimized GBP
- **Ability to pay:** review volume and price point as proxies for revenue
- **Vertical fit:** does Momentum have an industry page and case studies here (see [[Market Roster]])
- **Ad presence:** already spending means already sold on marketing

**Status: not automated.** This is the highest-leverage thing to build next, because it decides where every downstream dollar goes.

**To automate:** a scoring script that takes prospect rows, fetches each site, and emits a 0-100 score with reasons. Headless Chromium is already available in this environment via Playwright, which the factory QA already uses.

## Stage 3: Brief

**Goal:** a complete `brief.json` per prospect.

**Status: automated (agent-driven), documented.** The `/site-factory` skill covers research, brand derivation, and brief authoring. Contract and field reference: `_templates/site-factory/README.md`. Design rules: `philly-sites/DESIGN-SYSTEM.md`.

Brand derivation rules that keep 25 sites from looking like 25 clones: palette from the business's real signage/product/interior photos, `--border` and `--radius` chosen to match their attitude (1px and rounded for upscale, thick and square for loud), one display font plus one quiet text font.

**Guardrail:** every factual field needs a source. Unverifiable fields stay empty rather than invented.

## Stage 4: Build

**Goal:** finished sites on disk.

**Status: automated.**

- Single site: `node _templates/site-factory/build-site.js <brief.json> <out-dir>`
- Whole batch: `node _templates/site-factory/build-batch.js <batch-dir>`

The batch runner builds every brief in a batch directory, then emits the review hub, the sheet-ready CSVs, and a batch report. Zero npm dependencies for the build itself.

**Tier A vs Tier B** (established by the 2026-07-17 pilots): Tier A is this shared-architecture batch, used for volume outreach. Tier B is a bespoke build with its own architecture and motion language, reserved for prospects who engage. Don't spend Tier B effort on cold volume.

## Stage 5: Quality gate

**Goal:** nothing embarrassing reaches a prospect.

**Status: automated, with a required human taste pass.**

`node _templates/site-factory/qa.js <site-dir>` enforces the ship checklist: JSON-LD parses, viewport and meta description present, every image has alt text and exists on disk, no empty CTA hrefs, required sections present, surface rhythm, and with Playwright, screenshots plus horizontal-overflow checks at 390/850/1440px. The batch runner runs this across every site and fails the batch on any FAIL.

Batch-level gates the runner also handles: duplicate-image detection across the batch (the "keep every photo unique" rule from the 2026-07-12 delivery) and a `noindex` audit.

**Human pass that can't be automated:** does this look expensive, does it look like the business, is the palette dull. Review the batch hub, not individual files.

## Stage 6: Human approval

**Goal:** Mac or Melissa signs off on the exact list and the exact mail piece.

**Status: manual by design. This is a hard gate, not a bottleneck to remove.**

Approval package per batch: one hub URL, a five-minute Loom, the prospect CSV, and the mail piece proof. Mac's stated preference is one link plus a short Loom.

Per the tier rules in `AGENTS.md` and the orchestrator spec, everything up to here is autonomous. Everything after is Tier 2.

## Stage 7: Activate

**Goal:** live URLs, QR codes, mail in hand.

**Sub-steps and status:**

| Step | Status | Notes |
|---|---|---|
| Deploy previews | Manual, scripted | Netlify per-batch, private noindex drafts. Needs a deploy token in Cursor Cloud Agent secrets to automate. |
| Tracked URL per prospect | **Automated** | Batch runner emits `qr_target_url` with UTM parameters per prospect. |
| QR code generation | Partly automated | Zapier + QRTiger from the sheet, per Mac's 2026-07-22 links. Our CSV is the input; we deliberately use his chosen tooling rather than a parallel QR system. |
| Mail merge | Not automated | PostGrid or StackAdapt via Zapier from the sheet's address column with a `ready` flag. Vendor not yet chosen. **This is the known gap.** |
| Gatekeep the call | Not built | QR should land on the site with a clear "this was built for you, book a call" path, and the booking link should carry the prospect ID so scans attribute to calls. |

**To automate next, in order:** Netlify deploy token, then the mail vendor decision, then the QR-to-booking attribution.

## Stage 8: Learn

**Goal:** the engine gets smarter every week.

**Status: not built.**

Per-batch ledger: `02_Campaigns/AI Site Builder Outreach Engine/batches/<batch-id>/results.md` recording pieces mailed, scans, calls booked, closes, and revenue, sliced by market, vertical, and design direction. Feeds Stage 2 scoring and the offer.

This mirrors the Optimization Ledger hypothesis pattern from the orchestrator spec: every batch is a hypothesis with an expected outcome and a review date; wins become patterns, losses become documented mistakes.

## Automation scorecard

| Stage | Automated | Owner | Next action |
|---|---|---|---|
| 1 Discover | Partly | Jesse + Dillon | Stand up the shared prospect sheet with stable IDs |
| 2 Qualify | No | Dillon | Build the site-decay scoring script |
| 3 Brief | Yes (agent) | Dillon | None; runbook exists |
| 4 Build | Yes | Dillon | None; batch runner shipped |
| 5 Quality gate | Yes + human | Dillon | None; enforced per batch |
| 6 Approval | Manual by design | Mac / Melissa | Keep the one-link plus Loom format |
| 7 Activate | Partly | Dillon + Mac | Deploy token, then pick the mail vendor |
| 8 Learn | No | Dillon | Create the results ledger on batch 1 |

**Short answer for Mac:** stages 3 through 5 are fully automated now, one command builds and QAs a whole batch. Stage 1 needs the shared sheet, stage 2 needs the scoring script, and stage 7 is blocked on a mail vendor decision plus a deploy token. Approval stays human on purpose.
