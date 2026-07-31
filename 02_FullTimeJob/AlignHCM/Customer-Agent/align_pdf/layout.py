"""Paragraph styles, custom flowables, and page furniture for Align HCM PDFs."""

from __future__ import annotations

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfgen import canvas as pdfcanvas
from reportlab.platypus import (
    BaseDocTemplate,
    Flowable,
    Frame,
    KeepTogether,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)

from . import brand as B

PAGE_W, PAGE_H = letter
MARGIN_X = 0.72 * inch
MARGIN_TOP = 0.92 * inch
MARGIN_BOTTOM = 0.78 * inch
CONTENT_W = PAGE_W - 2 * MARGIN_X


# ------------------------------------------------------------------ styles ---


def build_styles() -> dict[str, ParagraphStyle]:
    f = B.register_fonts()

    def ps(name, **kw):
        kw.setdefault("fontName", f["sans"])
        kw.setdefault("textColor", B.INK)
        return ParagraphStyle(name, **kw)

    return {
        "body": ps("Body", fontSize=9.1, leading=13.6, spaceAfter=7),
        "lede": ps(
            "Lede",
            fontSize=10.2,
            leading=15.6,
            textColor=B.INK_SOFT,
            spaceAfter=4,
        ),
        "h2": ps(
            "H2",
            fontName=f["sans_bold"],
            fontSize=15,
            leading=19,
            textColor=B.NAVY_DEEP,
        ),
        "h3": ps(
            "H3",
            fontName=f["sans_bold"],
            fontSize=10.6,
            leading=14,
            textColor=B.NAVY_DEEP,
            spaceBefore=13,
            spaceAfter=5,
            keepWithNext=1,
        ),
        "h4": ps(
            "H4",
            fontName=f["sans_semi"],
            fontSize=9.4,
            leading=13,
            textColor=B.ORANGE_HOT,
            spaceBefore=11,
            spaceAfter=4,
            keepWithNext=1,
        ),
        "bullet": ps(
            "Bullet",
            fontSize=9.1,
            leading=13.6,
            leftIndent=13,
            bulletIndent=2,
            spaceAfter=3.5,
            bulletFontName=f["sans_bold"],
            bulletFontSize=8,
            bulletColor=B.ORANGE,
        ),
        "bullet2": ps(
            "Bullet2",
            fontSize=8.8,
            leading=13,
            leftIndent=27,
            bulletIndent=16,
            spaceAfter=3,
            textColor=B.INK_SOFT,
            bulletFontName=f["sans"],
            bulletFontSize=8,
            bulletColor=B.INK_FAINT,
        ),
        "num": ps(
            "Num",
            fontSize=9.1,
            leading=13.6,
            leftIndent=16,
            bulletIndent=2,
            spaceAfter=3.5,
            bulletFontName=f["sans_bold"],
            bulletFontSize=8.6,
            bulletColor=B.ORANGE_HOT,
        ),
        "quote": ps(
            "Quote",
            fontSize=8.9,
            leading=13.4,
            textColor=B.INK_SOFT,
            spaceAfter=5,
        ),
        "quote_last": ps(
            "QuoteLast",
            fontSize=8.9,
            leading=13.4,
            textColor=B.INK_SOFT,
            spaceAfter=0,
        ),
        "caption": ps(
            "Caption",
            fontSize=7.8,
            leading=11,
            textColor=B.INK_FAINT,
            spaceAfter=7,
        ),
        "code": ps(
            "Code",
            fontName=f["mono"],
            fontSize=7.2,
            leading=10.2,
            textColor=B.NAVY,
            spaceAfter=0,
        ),
        "th": ps(
            "TH",
            fontName=f["sans_bold"],
            fontSize=7.4,
            leading=9.6,
            textColor=B.PAPER,
        ),
        "td": ps("TD", fontSize=7.9, leading=10.8),
        "td_soft": ps("TDSoft", fontSize=7.9, leading=10.8, textColor=B.INK_SOFT),
        "td_id": ps(
            "TDId",
            fontName=f["sans_bold"],
            fontSize=7.9,
            leading=10.8,
            textColor=B.NAVY_DEEP,
        ),
        "tile_label": ps(
            "TileLabel",
            fontName=f["sans_semi"],
            fontSize=6.4,
            leading=8.4,
            textColor=B.INK_FAINT,
        ),
        "tile_value": ps(
            "TileValue",
            fontName=f["sans_black"],
            fontSize=15,
            leading=17,
            textColor=B.NAVY_DEEP,
        ),
        "tile_note": ps(
            "TileNote", fontSize=6.6, leading=9, textColor=B.INK_SOFT
        ),
        "toc1": ps(
            "TOC1",
            fontName=f["sans_semi"],
            fontSize=9.4,
            leading=20,
            textColor=B.NAVY_DEEP,
        ),
        "toc2": ps(
            "TOC2",
            fontSize=8.4,
            leading=15,
            leftIndent=16,
            textColor=B.INK_SOFT,
        ),
    }


# -------------------------------------------------------------- flowables ----


class SectionHeader(Flowable):
    """Numbered section rule: orange index chip, title, hairline underline."""

    def __init__(self, number: str, title: str, styles: dict, width: float = CONTENT_W):
        super().__init__()
        self.number = number
        self.title = title
        self.styles = styles
        self.width = width
        f = B.register_fonts()
        self.chip_h = 20.5
        self.chip_w = max(
            self.chip_h,
            pdfmetrics.stringWidth(number, f["sans_black"], 10) + 11,
        )
        self.height = 34
        self._toc_level = 1
        self._toc_text = f"{number} · {title}".strip(" ·") if number else title

    def wrap(self, aw, ah):
        self.width = aw
        return aw, self.height

    def draw(self):
        c = self.canv
        f = B.FONTS
        top = self.height - 4
        if self.number:
            c.setFillColor(B.ORANGE)
            c.rect(0, top - self.chip_h, self.chip_w, self.chip_h, stroke=0, fill=1)
            c.setFillColor(B.PAPER)
            c.setFont(f["sans_black"], 10)
            c.drawCentredString(
                self.chip_w / 2.0, top - self.chip_h + 6.4, self.number
            )
            tx = self.chip_w + 9
        else:
            tx = 0
        c.setFillColor(B.NAVY_DEEP)
        c.setFont(f["sans_bold"], 14.5)
        c.drawString(tx, top - self.chip_h + 6.0, self.title)
        c.setStrokeColor(B.RULE)
        c.setLineWidth(0.6)
        c.line(0, 3, self.width, 3)
        c.setStrokeColor(B.ORANGE)
        c.setLineWidth(1.6)
        c.line(0, 3.2, 46, 3.2)


class Rule(Flowable):
    """Hairline divider with optional accent lead-in."""

    def __init__(self, color=B.RULE_SOFT, thickness=0.6, space=8, accent=False):
        super().__init__()
        self.color = color
        self.thickness = thickness
        self.space = space
        self.accent = accent
        self.width = CONTENT_W
        self.height = space

    def wrap(self, aw, ah):
        self.width = aw
        return aw, self.height

    def draw(self):
        c = self.canv
        y = self.height / 2.0
        c.setStrokeColor(self.color)
        c.setLineWidth(self.thickness)
        c.line(0, y, self.width, y)
        if self.accent:
            c.setStrokeColor(B.ORANGE)
            c.setLineWidth(1.4)
            c.line(0, y, 38, y)


def callout(flowables: list, accent=B.ORANGE, fill=B.PANEL_WARM, width=CONTENT_W):
    """Shaded box with a thick accent bar on the left edge."""
    t = Table([[flowables]], colWidths=[width])
    t.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), fill),
                ("LINEBEFORE", (0, 0), (0, -1), 2.6, accent),
                ("LEFTPADDING", (0, 0), (-1, -1), 12),
                ("RIGHTPADDING", (0, 0), (-1, -1), 12),
                ("TOPPADDING", (0, 0), (-1, -1), 10),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ]
        )
    )
    return t


def stat_tiles(items: list[tuple[str, str, str]], styles: dict, width=CONTENT_W):
    """Row of KPI tiles: (label, value, note). Wraps at four per row."""
    per_row = 4 if len(items) % 4 == 0 or len(items) > 6 else min(len(items), 3)
    rows = [items[i : i + per_row] for i in range(0, len(items), per_row)]
    out = []
    for row in rows:
        cells = []
        for label, value, note in row:
            inner = [
                Paragraph(label.upper(), styles["tile_label"]),
                Spacer(1, 3),
                Paragraph(value, styles["tile_value"]),
            ]
            if note:
                inner += [Spacer(1, 2), Paragraph(note, styles["tile_note"])]
            cells.append(inner)
        while len(cells) < per_row:
            cells.append([])
        gap = 8
        col = (width - gap * (per_row - 1)) / per_row
        t = Table(
            [cells],
            colWidths=[col] * per_row,
            hAlign="LEFT",
        )
        style = [
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 10),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ("TOPPADDING", (0, 0), (-1, -1), 10),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 11),
        ]
        for i in range(per_row):
            if i < len(row):
                style += [
                    ("BACKGROUND", (i, 0), (i, 0), B.PANEL),
                    ("LINEABOVE", (i, 0), (i, 0), 2.2, B.ORANGE),
                ]
        t.setStyle(TableStyle(style))
        out.append(t)
        out.append(Spacer(1, gap))
    return out


class VerdictChip(Flowable):
    """Small filled pill used for PASS / FAIL / PENDING cells."""

    def __init__(self, text: str, fg, bg, font_size=6.9):
        super().__init__()
        self.text = text
        self.fg = fg
        self.bg = bg
        self.font_size = font_size
        f = B.register_fonts()
        self.font = f["sans_bold"]
        self.width = pdfmetrics.stringWidth(text, self.font, font_size) + 11
        self.height = font_size + 6.4

    def wrap(self, aw, ah):
        return min(self.width, aw), self.height

    def draw(self):
        c = self.canv
        c.setFillColor(self.bg)
        c.roundRect(0, 0, self.width, self.height, 2.6, stroke=0, fill=1)
        c.setFillColor(self.fg)
        c.setFont(self.font, self.font_size)
        c.drawCentredString(self.width / 2.0, 4.4, self.text)


# ------------------------------------------------------------ page furniture -


def draw_cover(canvas, doc):
    meta = doc.cover
    f = B.FONTS
    canvas.saveState()

    panel_h = PAGE_H * 0.52
    canvas.setFillColor(B.NAVY_DEEP)
    canvas.rect(0, PAGE_H - panel_h, PAGE_W, panel_h, stroke=0, fill=1)

    # Diagonal accent wedge in the panel's lower right.
    canvas.setFillColor(colors.HexColor("#132339"))
    p = canvas.beginPath()
    p.moveTo(PAGE_W, PAGE_H - panel_h)
    p.lineTo(PAGE_W, PAGE_H - panel_h + 190)
    p.lineTo(PAGE_W - 250, PAGE_H - panel_h)
    p.close()
    canvas.drawPath(p, stroke=0, fill=1)

    canvas.setFillColor(B.ORANGE)
    canvas.rect(0, PAGE_H - panel_h - 5, PAGE_W, 5, stroke=0, fill=1)

    x = MARGIN_X
    y = PAGE_H - 1.15 * inch

    # Wordmark
    canvas.setFillColor(B.PAPER)
    canvas.setFont(f["sans_black"], 17)
    canvas.drawString(x, y, "ALIGN")
    w = pdfmetrics.stringWidth("ALIGN", f["sans_black"], 17)
    canvas.setFillColor(B.ORANGE)
    canvas.drawString(x + w + 5, y, "HCM")
    canvas.setStrokeColor(colors.HexColor("#2A3C55"))
    canvas.setLineWidth(0.7)
    canvas.line(x, y - 12, x + 92, y - 12)

    canvas.setFillColor(B.TEAL)
    canvas.setFont(f["sans_bold"], 7.6)
    canvas.drawString(x, y - 26, meta.get("kicker", "").upper())

    # Title and subtitle sit on the panel floor and grow upward, so a long
    # title never collides with the wordmark or the status badge.
    title = meta.get("title", "")
    size = 31
    lines = _wrap(title, f["sans_black"], size, CONTENT_W - 40)
    while len(lines) > 3 and size > 21:
        size -= 2
        lines = _wrap(title, f["sans_black"], size, CONTENT_W - 40)

    sub_lines = (
        _wrap(meta.get("subtitle", ""), f["sans"], 10.4, CONTENT_W - 90)
        if meta.get("subtitle")
        else []
    )
    floor = PAGE_H - panel_h + (78 if meta.get("status") else 44)
    block_h = len(lines) * size * 1.16 + (len(sub_lines) * 15 + 12 if sub_lines else 0)
    ty = floor + block_h - size * 0.2

    canvas.setFillColor(B.PAPER)
    canvas.setFont(f["sans_black"], size)
    for line in lines:
        canvas.drawString(x, ty, line)
        ty -= size * 1.16

    if sub_lines:
        canvas.setFillColor(colors.HexColor("#AEBCCE"))
        canvas.setFont(f["sans"], 10.4)
        ty -= 6
        for line in sub_lines:
            canvas.drawString(x, ty, line)
            ty -= 15

    # Status badge
    status = meta.get("status")
    if status:
        label = status.get("label", "")
        tone = status.get("tone", "hold")
        fill = {
            "hold": B.ORANGE_HOT,
            "pass": B.TEAL,
            "fail": B.RED,
            "info": B.ORANGE,
        }.get(tone, B.ORANGE_HOT)
        canvas.setFont(f["sans_black"], 8.6)
        bw = pdfmetrics.stringWidth(label, f["sans_black"], 8.6) + 26
        by = PAGE_H - panel_h + 34
        canvas.setFillColor(fill)
        canvas.roundRect(x, by, bw, 21, 3, stroke=0, fill=1)
        canvas.setFillColor(B.PAPER if tone != "info" else B.NAVY_DEEP)
        canvas.drawCentredString(x + bw / 2.0, by + 6.6, label)
        note = status.get("note")
        if note:
            canvas.setFillColor(colors.HexColor("#8FA0B6"))
            canvas.setFont(f["sans"], 8)
            canvas.drawString(x + bw + 11, by + 6.6, note)

    # Metadata grid below the panel
    meta_rows = meta.get("meta", [])
    grid_top = PAGE_H - panel_h - 56
    col_w = CONTENT_W / 3.0
    row_h = 48
    for i, (k, v) in enumerate(meta_rows):
        cx = x + (i % 3) * col_w
        cy = grid_top - (i // 3) * row_h
        canvas.setStrokeColor(B.RULE)
        canvas.setLineWidth(0.6)
        canvas.line(cx, cy + 11, cx + col_w - 18, cy + 11)
        canvas.setFillColor(B.ORANGE)
        canvas.setLineWidth(1.4)
        canvas.setStrokeColor(B.ORANGE)
        canvas.line(cx, cy + 11, cx + 15, cy + 11)
        canvas.setFillColor(B.INK_FAINT)
        canvas.setFont(f["sans_semi"], 6.6)
        canvas.drawString(cx, cy, k.upper())
        canvas.setFillColor(B.NAVY_DEEP)
        canvas.setFont(f["sans_bold"], 9.6)
        for j, line in enumerate(_wrap(v, f["sans_bold"], 9.6, col_w - 18)[:2]):
            canvas.drawString(cx, cy - 14 - j * 12, line)

    # Summary strip
    summary = meta.get("summary")
    if summary:
        grid_rows = -(-len(meta_rows) // 3)
        sy = grid_top - grid_rows * row_h - 6
        lines = _wrap(summary, f["sans"], 8.9, CONTENT_W - 24)[:5]
        box_h = len(lines) * 13.6 + 22
        canvas.setFillColor(B.PANEL)
        canvas.rect(x, sy - box_h, CONTENT_W, box_h, stroke=0, fill=1)
        canvas.setFillColor(B.ORANGE)
        canvas.rect(x, sy - box_h, 2.6, box_h, stroke=0, fill=1)
        canvas.setFillColor(B.INK_SOFT)
        canvas.setFont(f["sans"], 8.9)
        ly = sy - 22
        for line in lines:
            canvas.drawString(x + 14, ly, line)
            ly -= 13.6

    # Footer strip
    canvas.setFillColor(B.INK_FAINT)
    canvas.setFont(f["sans"], 7.4)
    canvas.drawString(x, 0.62 * inch, meta.get("confidentiality", ""))
    canvas.setFont(f["sans_semi"], 7.4)
    canvas.drawRightString(PAGE_W - MARGIN_X, 0.62 * inch, meta.get("docid", ""))
    canvas.setStrokeColor(B.RULE)
    canvas.setLineWidth(0.6)
    canvas.line(x, 0.78 * inch, PAGE_W - MARGIN_X, 0.78 * inch)

    canvas.restoreState()


def _wrap(text: str, font: str, size: float, max_w: float) -> list[str]:
    words = text.split()
    lines, cur = [], ""
    for word in words:
        trial = f"{cur} {word}".strip()
        if pdfmetrics.stringWidth(trial, font, size) <= max_w or not cur:
            cur = trial
        else:
            lines.append(cur)
            cur = word
    if cur:
        lines.append(cur)
    return lines


def draw_body(canvas, doc):
    f = B.FONTS
    canvas.saveState()
    y = PAGE_H - 0.56 * inch
    canvas.setFillColor(B.NAVY_DEEP)
    canvas.setFont(f["sans_black"], 8)
    canvas.drawString(MARGIN_X, y, "ALIGN")
    w = pdfmetrics.stringWidth("ALIGN", f["sans_black"], 8)
    canvas.setFillColor(B.ORANGE)
    canvas.drawString(MARGIN_X + w + 3, y, "HCM")
    canvas.setFillColor(B.INK_FAINT)
    canvas.setFont(f["sans"], 7.4)
    canvas.drawRightString(PAGE_W - MARGIN_X, y, doc.cover.get("running_head", ""))
    canvas.setStrokeColor(B.RULE)
    canvas.setLineWidth(0.6)
    canvas.line(MARGIN_X, y - 7, PAGE_W - MARGIN_X, y - 7)
    canvas.setStrokeColor(B.ORANGE)
    canvas.setLineWidth(1.4)
    canvas.line(MARGIN_X, y - 7, MARGIN_X + 34, y - 7)
    canvas.restoreState()


class NumberedCanvas(pdfcanvas.Canvas):
    """Defers footers until the total page count is known."""

    def __init__(self, *args, footer_left="", **kwargs):
        super().__init__(*args, **kwargs)
        self._saved = []
        self.footer_left = footer_left

    def showPage(self):
        self._saved.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        total = len(self._saved)
        for i, state in enumerate(self._saved):
            self.__dict__.update(state)
            if i:  # cover page carries its own footer
                self._footer(i + 1, total)
            super().showPage()
        super().save()

    def _footer(self, page: int, total: int):
        f = B.FONTS
        self.saveState()
        self.setStrokeColor(B.RULE)
        self.setLineWidth(0.6)
        self.line(MARGIN_X, 0.62 * inch, PAGE_W - MARGIN_X, 0.62 * inch)
        self.setFillColor(B.INK_FAINT)
        self.setFont(f["sans"], 7)
        self.drawString(MARGIN_X, 0.45 * inch, self.footer_left)
        self.setFont(f["sans_semi"], 7)
        self.drawRightString(
            PAGE_W - MARGIN_X, 0.45 * inch, f"{page} / {total}"
        )
        self.restoreState()


class AlignDocTemplate(BaseDocTemplate):
    """Cover template + body template, TOC notifications, PDF outline."""

    def __init__(self, path: str, cover: dict, **kw):
        self.cover = cover
        super().__init__(
            path,
            pagesize=letter,
            leftMargin=MARGIN_X,
            rightMargin=MARGIN_X,
            topMargin=MARGIN_TOP,
            bottomMargin=MARGIN_BOTTOM,
            title=cover.get("title", ""),
            author="Align HCM",
            subject=cover.get("subtitle", ""),
            **kw,
        )
        cover_frame = Frame(
            MARGIN_X, MARGIN_BOTTOM, CONTENT_W, 12, id="cover", showBoundary=0
        )
        body_frame = Frame(
            MARGIN_X,
            MARGIN_BOTTOM,
            CONTENT_W,
            PAGE_H - MARGIN_TOP - MARGIN_BOTTOM,
            id="body",
            showBoundary=0,
        )
        self.addPageTemplates(
            [
                PageTemplate(id="cover", frames=[cover_frame], onPage=draw_cover),
                PageTemplate(id="body", frames=[body_frame], onPage=draw_body),
            ]
        )
        self._toc_seq = 0
        self._outline_level = -1

    def beforeDocument(self):
        # multiBuild runs the story more than once; keys must be identical on
        # every pass or the table of contents links point at dead destinations.
        self._toc_seq = 0
        self._outline_level = -1

    def afterFlowable(self, flowable):
        level = getattr(flowable, "_toc_level", None)
        if level is None:
            return
        text = getattr(flowable, "_toc_text", "")
        if not text:
            return
        self._toc_seq += 1
        key = f"sec{self._toc_seq:03d}"
        self.canv.bookmarkPage(key)
        # A PDF outline may only descend one level at a time; a document that
        # opens on a section rather than a part would otherwise be rejected.
        outline_level = min(level, self._outline_level + 1)
        self._outline_level = outline_level
        self.canv.addOutlineEntry(text, key, level=outline_level, closed=False)
        if level <= 1:
            self.notify("TOCEntry", (level, text, self.page, key))


__all__ = [
    "AlignDocTemplate",
    "CONTENT_W",
    "KeepTogether",
    "NumberedCanvas",
    "Rule",
    "SectionHeader",
    "VerdictChip",
    "build_styles",
    "callout",
    "stat_tiles",
]
