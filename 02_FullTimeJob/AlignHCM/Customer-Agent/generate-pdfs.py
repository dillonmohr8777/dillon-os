#!/usr/bin/env python3
"""Generate PDFs from Customer Agent markdown docs."""

from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    HRFlowable,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

BASE = Path(__file__).parent
DOCS = [
    ("Align-HCM-Customer-Agent-Knowledge-Core.md", "Align-HCM-Customer-Agent-Knowledge-Core.pdf"),
    ("Align-HCM-Customer-Agent-Readiness-Report.md", "Align-HCM-Customer-Agent-Readiness-Report.pdf"),
]


def styles():
    base = getSampleStyleSheet()
    return {
        "title": ParagraphStyle(
            "DocTitle",
            parent=base["Title"],
            fontSize=18,
            spaceAfter=12,
            textColor=colors.HexColor("#1a365d"),
        ),
        "h2": ParagraphStyle(
            "H2",
            parent=base["Heading2"],
            fontSize=13,
            spaceBefore=14,
            spaceAfter=6,
            textColor=colors.HexColor("#2c5282"),
        ),
        "h3": ParagraphStyle(
            "H3",
            parent=base["Heading3"],
            fontSize=11,
            spaceBefore=10,
            spaceAfter=4,
            textColor=colors.HexColor("#2d3748"),
        ),
        "body": ParagraphStyle(
            "Body",
            parent=base["BodyText"],
            fontSize=9,
            leading=12,
            spaceAfter=4,
        ),
        "quote": ParagraphStyle(
            "Quote",
            parent=base["BodyText"],
            fontSize=8.5,
            leading=11,
            leftIndent=18,
            textColor=colors.HexColor("#4a5568"),
            spaceAfter=6,
        ),
        "mono": ParagraphStyle(
            "Mono",
            parent=base["Code"],
            fontSize=8,
            leading=10,
            spaceAfter=4,
        ),
    }


def esc(text: str) -> str:
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )


def parse_table(lines: list[str]) -> Table | None:
    if len(lines) < 2 or "|" not in lines[0]:
        return None
    rows = []
    for line in lines:
        if not line.strip().startswith("|"):
            break
        cells = [esc(c.strip()) for c in line.strip().strip("|").split("|")]
        if all(set(c) <= {"-", " "} for c in cells):
            continue
        rows.append(cells)
    if not rows:
        return None
    col_count = max(len(r) for r in rows)
    for r in rows:
        while len(r) < col_count:
            r.append("")
    t = Table(rows, repeatRows=1)
    t.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#edf2f7")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#1a365d")),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 7),
                ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#cbd5e0")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f7fafc")]),
                ("LEFTPADDING", (0, 0), (-1, -1), 4),
                ("RIGHTPADDING", (0, 0), (-1, -1), 4),
                ("TOPPADDING", (0, 0), (-1, -1), 3),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ]
        )
    )
    return t


def md_to_story(md_path: Path, st: dict) -> list:
    story = []
    lines = md_path.read_text(encoding="utf-8").splitlines()
    i = 0
    in_code = False
    code_buf: list[str] = []
    table_buf: list[str] = []

    def flush_table():
        nonlocal table_buf
        if table_buf:
            tbl = parse_table(table_buf)
            if tbl:
                story.append(tbl)
                story.append(Spacer(1, 6))
            table_buf = []

    while i < len(lines):
        line = lines[i]
        raw = line.rstrip()

        if raw.startswith("```"):
            if in_code:
                story.append(Paragraph("<br/>".join(esc(x) for x in code_buf), st["mono"]))
                story.append(Spacer(1, 4))
                code_buf = []
                in_code = False
            else:
                flush_table()
                in_code = True
            i += 1
            continue

        if in_code:
            code_buf.append(raw)
            i += 1
            continue

        if raw.startswith("|"):
            table_buf.append(raw)
            i += 1
            continue
        flush_table()

        if not raw.strip():
            story.append(Spacer(1, 4))
            i += 1
            continue

        if raw.startswith("# "):
            story.append(Paragraph(esc(raw[2:]), st["title"]))
            story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#cbd5e0")))
            story.append(Spacer(1, 8))
        elif raw.startswith("## "):
            story.append(Paragraph(esc(raw[3:]), st["h2"]))
        elif raw.startswith("### "):
            story.append(Paragraph(esc(raw[4:]), st["h3"]))
        elif raw.startswith("> "):
            story.append(Paragraph(esc(raw[2:]), st["quote"]))
        elif raw.startswith("---"):
            story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#e2e8f0")))
            story.append(Spacer(1, 6))
        elif raw.startswith("- "):
            story.append(Paragraph("• " + esc(raw[2:]), st["body"]))
        else:
            text = esc(raw)
            text = text.replace("**", "")
            story.append(Paragraph(text, st["body"]))
        i += 1

    flush_table()
    return story


def build_pdf(md_name: str, pdf_name: str) -> None:
    md_path = BASE / md_name
    pdf_path = BASE / pdf_name
    st = styles()
    doc = SimpleDocTemplate(
        str(pdf_path),
        pagesize=letter,
        rightMargin=0.65 * inch,
        leftMargin=0.65 * inch,
        topMargin=0.65 * inch,
        bottomMargin=0.65 * inch,
        title=md_name.replace(".md", ""),
    )

    def footer(canvas, doc_):
        canvas.saveState()
        canvas.setFont("Helvetica", 7)
        canvas.setFillColor(colors.HexColor("#718096"))
        canvas.drawString(
            0.65 * inch,
            0.45 * inch,
            f"Align HCM Customer Agent · Portal 242825734 · Updated 2026-07-31 · Page {doc_.page}",
        )
        canvas.restoreState()

    story = md_to_story(md_path, st)
    doc.build(story, onFirstPage=footer, onLaterPages=footer)
    print(f"Wrote {pdf_path}")


if __name__ == "__main__":
    for md, pdf in DOCS:
        build_pdf(md, pdf)
