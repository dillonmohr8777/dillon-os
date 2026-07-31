---
employer: Align HCM
project: Customer Agent
type: folder-index
updated: 2026-07-31
tags: [align-hcm, customer-agent, hubspot]
---

# Align HCM Customer Agent · document set

HubSpot portal **242825734** · agent **Align HCM Customer Agent** · prompt
**v2026-07-30.5** · **LAUNCH HOLD** (Preview only, no website channel).

The Markdown files are the source of truth. The PDFs are generated from them,
never edited by hand.

| File | What it is |
|------|------------|
| `Align-HCM-Customer-Agent-Knowledge-Core.md` | What the agent may say, what it must refuse, plus the full question inventory |
| `Align-HCM-Customer-Agent-Readiness-Report.md` | Evidence-based readiness review, launch gates, go/no-go, appendices A to E |
| `Align-HCM-Customer-Agent-Question-Registry.md` | Master registry of every Claude-in-Edge prompt, parts I to VII |
| `Align-HCM-Customer-Agent-Test-Results-2026-07-30.md` | Raw July 30 Preview session log |
| `generate-pdfs.py` | Build script for the three PDFs |
| `align_pdf/` | Design system: brand tokens, flowables, page furniture, Markdown converter |
| `fonts/` | Vendored Plus Jakarta Sans and JetBrains Mono |

## Rebuild the PDFs

```
pip install reportlab
cd 02_FullTimeJob/AlignHCM/Customer-Agent
python3 generate-pdfs.py                 # all three
python3 generate-pdfs.py readiness       # one: knowledge-core | readiness | registry
```

Every PDF gets a branded cover, a linked table of contents, a PDF outline,
running headers, and `page / total` footers.

## Authoring rules

Edit the Markdown, then rebuild. Both are committed together so the PDF in Git
always matches its source.

Cover metadata comes from the `pdf:` block in each file's frontmatter: `kicker`,
`title`, `subtitle`, `summary`, `docid`, `confidentiality`, `running_head`,
`status_label` / `status_tone` / `status_note`, and `meta` (up to six
`Label | Value` pairs).

Layout directives are HTML comments, so Obsidian still renders the file cleanly:

| Directive | Effect |
|-----------|--------|
| `<!-- pdf:toc -->` | Contents page with dot leaders and page numbers |
| `<!-- pdf:pagebreak -->` | Hard page break |
| `<!-- pdf:tiles -->` | Renders the next table as a KPI tile row (first column is the label, last is the value) |
| `<!-- pdf:callout tone=pass\|fail\|warn\|info -->` | Colours the next blockquote |
| `<!-- pdf:keep -->` | Keeps the next heading and table on one page |

Conventions the renderer relies on:

- `# PART n · Title` starts a new part on a fresh page and resets section numbering
- `## 04 Title`, `## II-B · Title`, or `## A · Title` produces a numbered section chip; an unlabelled `##` is auto-numbered
- A table column headed Status, Result, Verdict, P1, P2, Outcome, or Standing gets automatic verdict chips (PASS teal, FAIL red, PENDING amber, DEF grey)
- `---` immediately before a heading is dropped, since section headers carry their own rule

## Open items

- Two High guardrail fails open: case 49 (fabricated contact address), case 52 (identity bypass)
- Guardrail cases 1 to 45 unrun, workbooks rights-encrypted; need CSV exports
- Capability suite 0 of 59 scored, so the 90% dimension gate cannot be evaluated
