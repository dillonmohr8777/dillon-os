# Align HCM Customer Agent — v2 Change Log

**Date:** July 24, 2026
**Authoritative source:** `2026-07-23-hubspot-customer-agent-configuration.md`
(SHA‑256 `8BF4F3DDEE28C0D9D4293FA5836EDF6A2A611713006427433F9E3D5B8D47AD53`, verified against the value recorded inside the supplied configuration PDF).

These are **content corrections only.** Typography (Poppins display + Mulish body), the navy/orange/cream palette, card and callout styling, spacing, hierarchy, headers, footers, and page numbering are preserved from the original PDFs. New files were created; the originals were not overwritten. **The live HubSpot Customer Agent was not modified or activated, and no new live test results were created.**

New files:
- `Align-HCM-Customer-Agent-Knowledge-Core-v2-2026-07-24.pdf`
- `Align-HCM-Customer-Agent-Readiness-Report-v2-2026-07-24.pdf`
- `source/` — editable HTML + fonts + logo + `build.sh` (regenerates both PDFs)

---

## Knowledge Core  —  9 pages → 10 pages

Section **05 (Common questions)** now spans two pages so the added grounded answers fit; Boundaries and Handoff/Sources shift accordingly, and footer page numbers were renumbered.

| Page | Change |
|---|---|
| **1 · Cover** | Document date **Jul 23 → Jul 24, 2026**. Subtitle "supported platforms" → **"service‑specific platform coverage."** Middle stat **"6 Core HCM platforms" → "2 Excluded from SmartCare (Workday and ADP)"** (removes the implication of six universally supported platforms). Grounded‑answers stat recalculated **8 → 11**. |
| **2 · Orientation** | No content change (re‑typeset only). |
| **3 · Service capabilities** | No content change. |
| **4 · Capabilities (continued)** | No content change. |
| **5 · SmartCare** | Four service‑level descriptions rewritten to the authoritative configuration (**Stabilize, Essentials, Accelerate, Transform**). Vendor‑agnostic card: **removed "Workday, ADP"** from the supported list, retitled **"Not universal,"** and added the explicit statement that **"Vendor‑agnostic does not mean every platform is covered."** |
| **6 · Platform coverage** | Replaced the six "REFERENCED" platform chips (which listed Workday and ADP) and the line **"Other HCM environments are supported beyond those listed"** with a **service‑specific coverage model**: (1) SmartCare is **not offered for Workday or ADP**; (2) **website presence is not proof** of SmartCare support; (3) any other platform/module/workstream requires **current explicit evidence or human verification.** Discovery questions re‑led with business requirements; added the SmartCare‑request note not to repeat the platform name. Heading changed from "Environments Align works across" to "Platform coverage is service‑specific." |
| **7 · Common questions** | **Replaced** "Does Align support Workday?" and its answer with a corrected SmartCare‑boundary Q&A. The answer states **"SmartCare is not currently offered for that environment,"** does **not** repeat the platform name, and does **not** imply that discovery can make SmartCare available. |
| **8 · Common questions (continued — NEW)** | Added grounded Q&As: **Leadership** (Maher El‑Abdallah, Mike Emsley, Ben Harrison, Barbara Tonelli — from `/about`); **Locations** (St. Petersburg, FL and Toronto, ON — from `/contact`); **one exact published case study** (Greater Toronto Airports Authority — SmartCare Stabilize, "resolved 12 high‑priority needs within six months," stated as source‑specific and **not a guarantee**; cited to `/case-studies`). |
| **9 · Boundaries** | Strengthened the vendor rule to the authoritative wording: never **name, compare, rank, recommend, criticize, endorse, or repeat** any outside provider, competitor, partner, software vendor, **or HCM platform** in a public answer; redirect to neutral criteria; omit provider names even when an approved source contains them. |
| **10 · Handoff + Sources** | Handoff summary bullet **"HCM platform" → "Relevant business requirements and implementation environment."** Added **`/about` (Leadership)** and **`/contact` (Contact & locations)** to the authoritative source list. Added a **case‑study child‑page control** note (facts tied to the exact published story; never generalized into a guarantee) and the **pending‑article note** ("A Kill Switch Is Not a Workforce" — not approved until its exact URL is verified; do not summarize or cite). |

---

## Readiness Report  —  10 pages → 11 pages

July 23 testing is treated as **historical evidence**; nothing claims the corrected configuration has already been tested. A new **Acceptance coverage** page was inserted (p8); Handoff, Gates, and Path‑to‑ready shift to p9–p11.

| Page | Change |
|---|---|
| **1 · Cover** | Report date → **JULY 24, 2026**. Subtitle adds **"Tester findings are July 23 historical test evidence."** Stats relabeled: **TESTER EVIDENCE "Jul 23, 2026 · historical"**, **SESSION "Edge · historical only"** (Edge preserved as a historical fact only). Decision → **"DO NOT ACTIVATE — SAFE BY DESIGN, NOT READY FOR A LIVE CHANNEL"**; body adds that the corrected SmartCare platform boundary has not been retested. |
| **2 · Snapshot** | "**71** sources / **24** website + **47** blog" and "**0/5** public‑answer tests" labeled **"last observed Jul 23."** "What blocks launch": **removed Workday** from the not‑retrieved list (Workday retrieval is no longer an expected result). "Built … **15‑test suite" → "26‑case suite."** Scope note adds "All findings on this page are July 23 historical test evidence." |
| **3 · Identity** | Avatar card "Live‑verified in Microsoft Edge" → **"Verified July 23 in Microsoft Edge (historical)."** Opening‑seen field labeled "(Jul 23)." Preserves "This report does not alter the live agent." |
| **4 · Capabilities** | Preserved; the discovery‑questions row re‑led with "business requirements." |
| **5 · Stress‑Test Results** | Intro: probes "observed … **on July 23**." Coverage note **"all 15 acceptance cases" → "all 26 acceptance cases."** |
| **6 · Eight observed probes** | All eight historical probes kept. The **Workday** row verdict reclassified from "FALSE NEGATIVE" to **"SUPERSEDED EXPECTATION — POLICY UPDATED — RETEST REQUIRED"** and annotated that the expectation is superseded by the SmartCare exclusion policy — **not** marked passed. Table labeled "July 23 historical test evidence." |
| **7 · Knowledge‑source health** | "71 / 24 / 47" labeled "last observed Jul 23"; table header "last verified Jul 23." **Removed Workday as an expected retrieval result** — the "Workday · current Workday partner language" row is replaced with **"SmartCare platform boundary · Stakeholder policy: SmartCare is not offered for Workday or ADP; website presence is not proof · Retest required."** |
| **8 · Acceptance coverage (NEW)** | Presents the **26‑case acceptance suite.** Left: the eight July 23 historical results (4 pass, 3 knowledge‑fail, 1 superseded/retest). Right: **new pending coverage** — SmartCare positioning, universal coverage, Workday SmartCare exclusion, ADP SmartCare exclusion, contradictory website wording, leadership, locations, customer case studies, unverified leadership article. Callout: no case counts as passed until re‑run, and the corrected SmartCare platform boundary must pass before activation. |
| **9 · Human‑handoff** | Preserved. |
| **10 · Launch‑Readiness Gates** | Removed Workday from the "Direct source links" gate description. **Added a new launch gate — "SmartCare platform boundary" (RETEST)** — requiring the corrected exclusion of Workday and ADP to pass before activation. |
| **11 · Path to ready** | Step 2 now also retests the corrected SmartCare platform‑boundary cases (excludes Workday and ADP). Step 5 **"Run all 15 acceptance cases" → "Run all 26 acceptance cases"** (enumerating the new boundary/knowledge cases). **Final decision remains DO NOT ACTIVATE**, gated on retrieval, citations, greeting, avatar, the corrected platform‑boundary tests, handoff testing, and channel approval. |

---

## Verification (render‑to‑PNG inspection of every final page)

- No clipped or overlapping text; no broken tables; no malformed glyphs (0 replacement characters).
- Headers, footers, and page numbers consistent and sequential.
- Links are clickable and human‑readable (16 unique Align URLs in the Knowledge Core; 4 in the Readiness Report).
- No unsupported claims and no fabricated live testing — all tester evidence is labeled July 23 historical; new cases are marked pending/retest.
- No remaining statement that SmartCare supports Workday or ADP — both platforms appear only as **exclusions** or as **historical** evidence.
