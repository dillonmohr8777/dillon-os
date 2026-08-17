---
employer: Align HCM
project: Customer Agent
type: folder-index
updated: 2026-08-17
tags: [align-hcm, customer-agent, hubspot]
---

# Align HCM Customer Agent · document set

HubSpot portal **242825734** · agent **Align HCM Customer Agent** · last
verified prompt **v2026-07-30.5** · **LAUNCH HOLD** (Preview only, no website
channel as of 2026-08-17). Live deploy is a Claude in Chrome run. See `DEPLOY.md`.

The Markdown files are the source of truth. The PDFs are generated from them,
never edited by hand.

| File | What it is |
|------|------------|
| `Align-HCM-Customer-Agent-Knowledge-Core.md` | What the agent may say, what it must refuse, plus the full question inventory |
| `Align-HCM-Customer-Agent-Readiness-Report.md` | Evidence-based readiness review, launch gates, go/no-go, appendices A to G |
| `Align-HCM-Customer-Agent-Question-Registry.md` | Master registry of every Claude-in-Edge prompt, parts I to VII |
| `Align-HCM-Customer-Agent-Test-Results-2026-07-30.md` | Raw July 30 Preview session log |
| `DEPLOY.md` | Why the cloud agent cannot click Deploy, and the gated local path |
| `generate-pdfs.py` | Build script for the three PDFs |
| `align_html/style.css` | The design system: palette, type scale, and every component |
| `align_html/render.py` | Markdown to HTML converter targeting those components |
| `fonts/` | Vendored Poppins, inlined into the HTML at build time |
| `assets/align-hcm-logo.png` | Logo used on the cover |

## Rebuild the PDFs

```
pip install playwright pymupdf
cd 02_FullTimeJob/AlignHCM/Customer-Agent
python3 generate-pdfs.py                 # all three
python3 generate-pdfs.py readiness       # one: knowledge-core | readiness | registry
python3 generate-pdfs.py --html          # write the intermediate HTML and stop
```

The Markdown is converted to HTML and printed by headless Chromium, the same
engine that produced the approved July 23 reference PDFs. Set `CHROME_PATH` if
the binary is not found automatically.

Each document is built in four moves:

1. The cover prints on its own pass at zero page margin, so the navy panel
   bleeds to the sheet edge with no page furniture over it.
2. The body prints once to learn which page each section landed on.
3. It prints again with the contents column filled in, then a third time with
   the invisible locators removed so they never reach the shipped text layer.
4. A post-pass merges cover and body, lays in the warm canvas, stamps the
   header, running section label, footer and page number in Poppins at the
   reference metrics, and writes the PDF outline.

## Authoring rules

Edit the Markdown, then rebuild. Both are committed together so the PDF in Git
always matches its source.

Cover metadata comes from the `pdf:` block in each file's frontmatter:

| Key | Effect |
|-----|--------|
| `kicker` | Tracked amber line above the title |
| `title`, `title_alt` | Title lines; `title_alt` prints in coral |
| `tag` | Mint pill inside the orange disc |
| `subtitle` | Cover lede |
| `hero` | Three lines: oversized figure, label, sub-label |
| `stats` | Up to four `Value · Label · tone` rows (`teal`, `orange`) |
| `meta` | Three `Label · Value` columns |
| `status_label`, `status_note` | Decision panel badge and copy |
| `running_head`, `running_foot`, `docid` | Page furniture and cover footer |

Layout directives are HTML comments, so Obsidian still renders the file cleanly:

| Directive | Effect |
|-----------|--------|
| `<!-- pdf:toc -->` | Contents page with resolved page numbers |
| `<!-- pdf:pagebreak -->` | Hard page break |
| `<!-- pdf:tiles -->` | Renders the next table as a stat card row (first column is the label, last is the value) |
| `<!-- pdf:cards -->` | Renders the next table as 2-up titled cards |
| `<!-- pdf:fields -->` | Renders the next table as label-over-value field rows |
| `<!-- pdf:callout tone=pass\|fail\|hold\|info -->` | Colours the next blockquote |

Conventions the renderer relies on:

- `# PART n · Title` starts a new part on a fresh page and resets section numbering
- `## 04 Title`, `## II-B · Title`, or `## A · Title` produces a numbered section eyebrow; an unlabelled `##` is auto-numbered
- A table column headed Status, Result, Verdict, P1, P2, Outcome, or Standing gets automatic verdict pills (PASS mint, FAIL red, PENDING/OUTSTANDING amber, ASKED blue, NOT RUN grey)
- Each `##` section opens on a fresh page, as in the reference
- `---` rules are dropped; the design separates with whitespace and section marks
- The first blockquote in a document becomes the dark "in one line" panel

## Open items

August 10 portal audit still governs channel state. August 17 live-site checks
updated SmartCare copy and the case-study list. PDFs were not rebuilt for the
SmartCare correction; Markdown is current.

- **BL-10:** `IDENTITY (HARD)` truncated in the portal on Aug 10. Fix prompt:
  `handoffs/align-customer-agent-truncation-fix-2026-08-10.md`
- **BL-11:** most individual case studies were unconnected on Aug 10. Live site
  has **11** individual studies plus the index (Alsco is on page 2). Connect
  them during the deploy prompt, do not invent extras
- **BL-13, settled against the live page:** SmartCare is Stabilize, Optimize,
  Optimize Plus, plus Managed Payroll / HRIS / WFM. The workbook spec and the
  old four-name ladder are both wrong
- **BL-2:** case 52 identity bypass still fails. This is the live-channel gate
- alignhcm.com has **no chat widget** yet. Deploy must create or assign a live
  chat channel, then click Deploy, only after G0 / 49 / 52 pass
- Guardrail cases 1 to 45 unrun; capability scores outstanding
- Paste `handoffs/align-customer-agent-deploy-prompt-2026-08-17.md` on the Align
  machine to execute the gated deploy
