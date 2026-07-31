#!/usr/bin/env python3
"""Build the Align HCM Customer Agent PDF set from the Markdown sources.

    python3 generate-pdfs.py            # build all three documents
    python3 generate-pdfs.py registry   # build one by slug

Design system lives in `align_pdf/` (brand tokens, flowables, page furniture,
Markdown converter). Brand fonts are vendored in `fonts/`; without them the
build falls back to Helvetica and still succeeds.

Requires: reportlab (pip install reportlab)
"""

from __future__ import annotations

import sys
from functools import partial
from pathlib import Path

from reportlab.platypus import NextPageTemplate, PageBreak

from align_pdf import brand as B
from align_pdf.layout import (
    CONTENT_W,
    AlignDocTemplate,
    NumberedCanvas,
    build_styles,
)
from align_pdf.markdown import convert_file

BASE = Path(__file__).resolve().parent

DOCS = {
    "knowledge-core": "Align-HCM-Customer-Agent-Knowledge-Core",
    "readiness": "Align-HCM-Customer-Agent-Readiness-Report",
    "registry": "Align-HCM-Customer-Agent-Question-Registry",
}

FOOTER = (
    "Align HCM Customer Agent · HubSpot portal 242825734 · Internal · Updated 2026-07-31"
)


def cover_meta(front: dict, fallback_title: str) -> dict:
    pdf = front.get("pdf") if isinstance(front.get("pdf"), dict) else {}
    pdf = pdf or {}
    meta_rows = []
    for row in pdf.get("meta", []) or []:
        if isinstance(row, list) and len(row) >= 2:
            meta_rows.append((row[0], " ".join(row[1:])))
        elif isinstance(row, str) and ":" in row:
            key, _, val = row.partition(":")
            meta_rows.append((key.strip(), val.strip()))
    status = None
    if pdf.get("status_label"):
        status = {
            "label": pdf["status_label"],
            "tone": pdf.get("status_tone", "hold"),
            "note": pdf.get("status_note", ""),
        }
    return {
        "kicker": pdf.get("kicker", "Align HCM"),
        "title": pdf.get("title", fallback_title),
        "subtitle": pdf.get("subtitle", ""),
        "summary": pdf.get("summary", ""),
        "docid": pdf.get("docid", ""),
        "confidentiality": pdf.get("confidentiality", "Internal working document"),
        "running_head": pdf.get("running_head", pdf.get("title", fallback_title)),
        "meta": meta_rows,
        "status": status,
    }


def build(slug: str) -> Path:
    stem = DOCS[slug]
    md_path = BASE / f"{stem}.md"
    pdf_path = BASE / f"{stem}.pdf"
    if not md_path.exists():
        raise SystemExit(f"missing source: {md_path}")

    styles = build_styles()
    front, story = convert_file(md_path, styles, CONTENT_W)
    meta = cover_meta(front, stem.replace("-", " "))

    doc = AlignDocTemplate(str(pdf_path), meta)
    doc.multiBuild(
        [NextPageTemplate("body"), PageBreak(), *story],
        canvasmaker=partial(NumberedCanvas, footer_left=FOOTER),
    )
    return pdf_path


def main(argv: list[str]) -> int:
    B.register_fonts()
    if not B.BRAND_FONTS_LOADED:
        print("! brand fonts missing from fonts/ - falling back to Helvetica")
    slugs = argv[1:] or list(DOCS)
    unknown = [s for s in slugs if s not in DOCS]
    if unknown:
        print(f"unknown doc(s): {', '.join(unknown)}")
        print(f"available: {', '.join(DOCS)}")
        return 2
    for slug in slugs:
        path = build(slug)
        print(f"  wrote {path.name} ({path.stat().st_size / 1024:.0f} KB)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
