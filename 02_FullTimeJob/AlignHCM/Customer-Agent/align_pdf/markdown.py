"""Markdown to ReportLab story converter for the Align HCM document set.

Handles the subset of Markdown these docs actually use, and renders it with the
brand design system instead of stock styles: numbered section headers, callout
boxes for blockquotes, KPI tiles, verdict chips inside tables, and column widths
measured from real content.

Layout directives are HTML comments so the Markdown still reads cleanly in
Obsidian:

    <!-- pdf:tiles -->      next table becomes a KPI tile row
    <!-- pdf:pagebreak -->  hard page break
    <!-- pdf:toc -->        table of contents
    <!-- pdf:callout tone=warn -->  next blockquote uses the warn palette
    <!-- pdf:keep -->       keep the next block with the one after it
"""

from __future__ import annotations

import re
from pathlib import Path

from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.platypus import (
    KeepTogether,
    PageBreak,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)
from reportlab.platypus.tableofcontents import TableOfContents

from . import brand as B
from .layout import CONTENT_W, Rule, SectionHeader, VerdictChip, callout, stat_tiles

# ------------------------------------------------------------- frontmatter ---


def split_frontmatter(text: str) -> tuple[dict, str]:
    if not text.startswith("---\n"):
        return {}, text
    end = text.find("\n---", 4)
    if end == -1:
        return {}, text
    raw = text[4:end]
    body = text[end + 4 :].lstrip("\n")
    return _parse_yaml_lite(raw), body


def _parse_yaml_lite(raw: str) -> dict:
    """Enough YAML for our frontmatter: scalars, one nesting level, and lists."""
    root: dict = {}
    stack: list[tuple[int, dict]] = [(-1, root)]
    for line in raw.splitlines():
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        indent = len(line) - len(line.lstrip())
        stripped = line.strip()
        while stack and indent <= stack[-1][0]:
            stack.pop()
        parent = stack[-1][1] if stack else root
        if stripped.startswith("- "):
            parent.setdefault("__list__", []).append(_scalar(stripped[2:]))
            continue
        if ":" not in stripped:
            continue
        key, _, val = stripped.partition(":")
        key, val = key.strip(), val.strip()
        if val == "":
            child: dict = {}
            parent[key] = child
            stack.append((indent, child))
        else:
            parent[key] = _scalar(val)
    _collapse_lists(root)
    return root


def _collapse_lists(node: dict) -> None:
    for key, val in list(node.items()):
        if isinstance(val, dict):
            if set(val) == {"__list__"}:
                node[key] = val["__list__"]
            else:
                _collapse_lists(val)


def _scalar(val: str):
    val = val.strip()
    if val[:1] in "\"'" and val[-1:] == val[:1] and len(val) > 1:
        return val[1:-1]
    if "|" in val and val.count("|") >= 1 and not val.startswith("http"):
        return [p.strip() for p in val.split("|")]
    return val


# ---------------------------------------------------------------- inline -----

_CODE = re.compile(r"`([^`]+)`")
_BOLD = re.compile(r"\*\*(.+?)\*\*")
_ITALIC = re.compile(r"(?<!\*)\*([^*]+)\*(?!\*)")
_STRIKE = re.compile(r"~~(.+?)~~")
_LINK = re.compile(r"\[([^\]]+)\]\(([^)]+)\)")
_WIKI = re.compile(r"\[\[([^\]|]+)(?:\|([^\]]+))?\]\]")
_BARE = re.compile(r"(?<![\w/@.-])((?:https?://)[\w./#?&=%+-]+)")


def inline(text: str, link_color=None) -> str:
    """Markdown inline syntax -> ReportLab mini-HTML."""
    text = B.glyph_safe(text)
    f = B.register_fonts()
    link_color = link_color or B.ORANGE_HOT.hexval()

    spans: list[str] = []

    def stash(html: str) -> str:
        spans.append(html)
        return f"\x00{len(spans) - 1}\x00"

    def code_sub(m):
        body = _esc(m.group(1))
        return stash(
            f'<font face="{f["mono"]}" size="7.4" '
            f'color="{B.NAVY.hexval()}">{body}</font>'
        )

    text = _CODE.sub(code_sub, text)

    def wiki_sub(m):
        label = m.group(2) or m.group(1).split("/")[-1]
        return stash(
            f'<font color="{B.NAVY.hexval()}"><i>{_esc(label)}</i></font>'
        )

    text = _WIKI.sub(wiki_sub, text)

    def link_sub(m):
        label, href = _esc(m.group(1)), m.group(2)
        return stash(
            f'<link href="{_esc(href)}" color="{link_color}">{label}</link>'
        )

    text = _LINK.sub(link_sub, text)
    text = _esc(text)

    def bare_sub(m):
        url = m.group(1)
        return f'<link href="{url}" color="{link_color}">{url}</link>'

    text = _BARE.sub(bare_sub, text)
    text = _BOLD.sub(r"<b>\1</b>", text)
    text = _ITALIC.sub(r"<i>\1</i>", text)
    text = _STRIKE.sub(r"<strike>\1</strike>", text)

    for i, html in enumerate(spans):
        text = text.replace(f"\x00{i}\x00", html)
    return text


def _esc(text: str) -> str:
    return (
        text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    )


def plain(text: str) -> str:
    """Strip markdown so widths can be measured on rendered text."""
    text = B.glyph_safe(text)
    text = _WIKI.sub(lambda m: m.group(2) or m.group(1).split("/")[-1], text)
    text = _LINK.sub(r"\1", text)
    text = _CODE.sub(r"\1", text)
    for mark in ("**", "~~", "*"):
        text = text.replace(mark, "")
    return text


# ---------------------------------------------------------------- verdicts ---

_VERDICT_RE = re.compile(
    r"^(PASS|FAIL|PENDING|NOT RUN|NOT ACTIVATED|DEF|EXEC|ASKED|OUTSTANDING|"
    r"SCENARIO|N/A|NO-GO|"
    r"HOLD|KNOWLEDGE FAIL|FALSE NEGATIVE|EXEC PASS|EXEC FAIL)\b(.*)$"
)

_VERDICT_ALIASES = {
    "NOT ACTIVATED": "NOT RUN",
    "KNOWLEDGE FAIL": "FAIL",
    "FALSE NEGATIVE": "FAIL",
    "EXEC PASS": "PASS",
    "EXEC FAIL": "FAIL",
}


def verdict_parts(cell: str) -> tuple[str, str] | None:
    """Split a result cell into (token, trailing detail), or None."""
    text = plain(cell).strip()
    if not text or len(text) > 60:
        return None
    m = _VERDICT_RE.match(text.upper())
    if not m:
        return None
    token, rest = m.group(1), m.group(2).strip()
    rest = text[len(token) :].strip().lstrip("-— ").strip()
    return token, rest


def _verdict_style(token: str):
    key = _VERDICT_ALIASES.get(token, token)
    return B.VERDICT_COLORS.get(key, (B.INK, B.PANEL))


_RESULT_HEADERS = re.compile(
    r"result|verdict|status|exec|outcome|p1|p2|pass|fail|gate|standing",
    re.I,
)

_ID_HEADERS = re.compile(
    r"^(#|id|wb id|ref|test|label|pri|level|gate|track|code|metric)$", re.I
)


# ------------------------------------------------------------------ tables ---


def build_table(rows: list[list[str]], styles: dict, width: float = CONTENT_W):
    if not rows:
        return None
    header, body = rows[0], rows[1:]
    ncols = len(header)

    id_cols = {i for i, h in enumerate(header) if _ID_HEADERS.match(plain(h).strip())}
    result_cols = {
        i for i, h in enumerate(header) if _RESULT_HEADERS.search(plain(h))
    }

    widths = _column_widths(header, body, width, ncols)

    data = []
    header_cells = [Paragraph(inline(h), styles["th"]) for h in header]
    data.append(header_cells)

    for row in body:
        out = []
        for c, cell in enumerate(row):
            vp = verdict_parts(cell) if c in result_cols else None
            if vp:
                token, rest = vp
                fg, bg = _verdict_style(token)
                chip = VerdictChip(token, fg, bg)
                chip.hAlign = "LEFT" if rest else "CENTER"
                if rest:
                    note = Paragraph(
                        inline(rest),
                        styles["td_soft"],
                    )
                    out.append([chip, Spacer(1, 2), note])
                else:
                    out.append(chip)
                continue
            style = styles["td_id"] if c in id_cols else styles["td"]
            out.append(Paragraph(inline(cell), style))
        data.append(out)

    table = Table(data, colWidths=widths, repeatRows=1, hAlign="LEFT")
    cmd = [
        ("BACKGROUND", (0, 0), (-1, 0), B.NAVY_DEEP),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, 0), 6),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 6),
        ("TOPPADDING", (0, 1), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 1), (-1, -1), 5),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [B.PAPER, B.PANEL]),
        ("LINEBELOW", (0, 1), (-1, -2), 0.4, B.RULE_SOFT),
        ("LINEBELOW", (0, -1), (-1, -1), 0.9, B.RULE),
        ("LINEABOVE", (0, 0), (-1, 0), 1.6, B.ORANGE),
    ]
    table.setStyle(TableStyle(cmd))
    return table


def _column_widths(header, body, avail, ncols) -> list[float]:
    f = B.register_fonts()
    pad = 15.0
    natural, minimum = [], []
    for c in range(ncols):
        texts = [plain(header[c]) if c < len(header) else ""]
        texts += [plain(r[c]) for r in body if c < len(r)]
        nat = max(
            (pdfmetrics.stringWidth(t, f["sans"], 7.9) for t in texts), default=30
        )
        longest_word = max(
            (
                pdfmetrics.stringWidth(w, f["sans"], 7.9)
                for t in texts
                for w in t.split()
            ),
            default=24,
        )
        head_w = pdfmetrics.stringWidth(
            plain(header[c]) if c < len(header) else "", f["sans_bold"], 7.4
        )
        natural.append(min(nat, avail * 0.62) + pad)
        minimum.append(min(max(longest_word, head_w, 24) + pad, avail * 0.34))

    total = sum(natural)
    if total <= avail:
        extra = avail - total
        widest = sum(natural)
        return [w + extra * (w / widest) for w in natural]

    if sum(minimum) >= avail:
        scale = avail / sum(minimum)
        return [w * scale for w in minimum]

    excess = total - avail
    slack = [n - m for n, m in zip(natural, minimum)]
    slack_total = sum(slack) or 1.0
    return [
        n - excess * (s / slack_total) for n, s, in zip(natural, slack)
    ]


# --------------------------------------------------------------- converter ---

_DIRECTIVE = re.compile(r"<!--\s*pdf:(\w+)(.*?)-->")
# "01 Orientation", "II-B · Platform", "A · Capability suite", "D-3 · Gates".
# A bare letter needs an explicit separator so ordinary prose headings such as
# "A quick note" are not mistaken for a section label.
_SECTION_NUM = re.compile(
    r"^(?:(\d{1,2}|[IVX]{1,4}-[A-Z]|[A-Z]-\d{1,2})\s*[\.·:)-]?\s+|([A-Z])\s*[·.)]\s+)(.*)$"
)
_PART = re.compile(r"^PART\s+([IVX]+)\s*[·.:-]?\s*(.*)$", re.I)


class Converter:
    def __init__(self, styles: dict, width: float = CONTENT_W):
        self.st = styles
        self.width = width
        self.story: list = []
        self.pending: dict[str, str] = {}
        self.first_quote_done = False
        self.auto_section = 0
        self.keep_buffer: list = []

    # -- helpers
    def add(self, flow):
        """Append, honouring a pending `pdf:keep` pairing."""
        if self.keep_buffer and isinstance(flow, (Table, KeepTogether)):
            group = self.keep_buffer + [flow]
            self.keep_buffer = []
            self.story.append(KeepTogether(group))
            return
        self.story.append(flow)

    def space(self, h):
        if self.keep_buffer:
            self.keep_buffer.append(Spacer(1, h))
            return
        self.story.append(Spacer(1, h))

    def _drop_trailing_rule(self):
        """A `---` immediately before a part break would print a stray line."""
        while self.story and isinstance(self.story[-1], (Rule, Spacer)):
            self.story.pop()

    def convert(self, body: str) -> list:
        lines = body.splitlines()
        i = 0
        while i < len(lines):
            raw = lines[i].rstrip()
            stripped = raw.strip()

            m = _DIRECTIVE.match(stripped)
            if m:
                i = self._directive(m, lines, i)
                continue

            if not stripped:
                i += 1
                continue

            if stripped.startswith("```"):
                i = self._code(lines, i)
                continue

            if stripped.startswith("|"):
                i = self._table(lines, i)
                continue

            if stripped.startswith(">"):
                i = self._quote(lines, i)
                continue

            if re.match(r"^(-{3,}|\*{3,}|_{3,})$", stripped):
                if not _heading_follows(lines, i + 1):
                    self.add(Rule(accent=False, space=14))
                i += 1
                continue

            if stripped.startswith("#"):
                i = self._heading(lines, i)
                continue

            if re.match(r"^([-*+]|\d+\.)\s", stripped):
                i = self._list(lines, i)
                continue

            i = self._para(lines, i)
        return self.story

    # -- blocks
    def _directive(self, m, lines, i):
        name = m.group(1).lower()
        args = dict(
            re.findall(r"(\w+)=([^\s]+)", m.group(2) or "")
        )
        if name == "pagebreak":
            self.add(PageBreak())
        elif name == "toc":
            self._toc(args.get("title", "Contents").replace("_", " "))
        elif name in {"tiles", "callout", "keep", "quote"}:
            self.pending[name] = args.get("tone", "") or "1"
            if name == "callout":
                self.pending["tone"] = args.get("tone", "warn")
        return i + 1

    def _toc(self, title: str = "Contents"):
        head = SectionHeader("", title, self.st, self.width)
        head._toc_level = None  # the contents page is not itself an entry
        head._toc_text = ""
        self.story.append(head)
        self.space(10)
        toc = TableOfContents()
        toc.levelStyles = [self.st["toc1"], self.st["toc2"]]
        toc.dotsMinLevel = 0
        self.story.append(toc)

    def _heading(self, lines, i):
        raw = lines[i].strip()
        level = len(raw) - len(raw.lstrip("#"))
        text = raw[level:].strip()

        if level == 1:
            # Document H1 lives on the cover; render as a part divider only if
            # it appears mid-document.
            if self.story:
                self._drop_trailing_rule()
                self.story.append(PageBreak())
                self._part_header(text)
            return i + 1

        if level == 2:
            part = _PART.match(plain(text))
            if part:
                self._drop_trailing_rule()
                self.story.append(PageBreak())
                self._part_header(text)
                return i + 1
            if self.story:
                self.space(16)
            num, title = "", plain(text)
            m = _SECTION_NUM.match(title)
            if m:
                num, title = m.group(1) or m.group(2), m.group(3)
            else:
                self.auto_section += 1
                num = f"{self.auto_section:02d}"
            head = SectionHeader(num, B.glyph_safe(title), self.st, self.width)
            self.add(head)
            self.space(9)
            return i + 1

        style = self.st["h3"] if level == 3 else self.st["h4"]
        para = Paragraph(inline(text), style)
        if level == 3:
            para._toc_level = 2
            para._toc_text = plain(text)
        if self.pending.pop("keep", None):
            self.keep_buffer = [para]
            return i + 1
        self.add(para)
        return i + 1

    def _part_header(self, text: str):
        self.auto_section = 0
        clean = plain(text)
        m = _PART.match(clean)
        label, title = ("PART " + m.group(1), m.group(2)) if m else ("", clean)
        block = [
            Paragraph(
                f'<font color="{B.ORANGE.hexval()}">{_esc(label.upper())}</font>',
                self.st["h4"],
            ),
            Paragraph(_esc(title), self.st["h2"]),
        ]
        box = callout(block, accent=B.NAVY_DEEP, fill=B.PANEL, width=self.width)
        box._toc_level = 0
        box._toc_text = f"{label} · {title}" if label else title
        self.add(box)
        self.space(14)

    def _code(self, lines, i):
        i += 1
        buf = []
        while i < len(lines) and not lines[i].strip().startswith("```"):
            buf.append(lines[i])
            i += 1
        i += 1
        while buf and not buf[0].strip():
            buf.pop(0)
        while buf and not buf[-1].strip():
            buf.pop()
        chunks = _chunk(buf, 46)
        for n, chunk in enumerate(chunks):
            body = "<br/>".join(
                _esc(B.glyph_safe(x)).replace(" ", "&nbsp;") or "&nbsp;"
                for x in chunk
            )
            panel = Table(
                [[Paragraph(body, self.st["code"])]], colWidths=[self.width]
            )
            panel.setStyle(
                TableStyle(
                    [
                        ("BACKGROUND", (0, 0), (-1, -1), B.PANEL),
                        ("LINEBEFORE", (0, 0), (0, -1), 2.2, B.TEAL),
                        ("LEFTPADDING", (0, 0), (-1, -1), 11),
                        ("RIGHTPADDING", (0, 0), (-1, -1), 9),
                        ("TOPPADDING", (0, 0), (-1, -1), 9),
                        ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
                    ]
                )
            )
            self.add(panel)
            self.space(5 if n < len(chunks) - 1 else 10)
        return i

    def _quote(self, lines, i):
        buf = []
        while i < len(lines) and lines[i].strip().startswith(">"):
            buf.append(lines[i].strip().lstrip(">").strip())
            i += 1
        paras = []
        block: list[str] = []
        for line in buf + [""]:
            if line:
                block.append(line)
            elif block:
                paras.append(" ".join(block))
                block = []

        tone = self.pending.pop("callout", None)
        tone = self.pending.pop("tone", tone if isinstance(tone, str) else "warn")
        is_lede = not self.first_quote_done and not self.pending.get("plain")
        self.first_quote_done = True

        flows = []
        for n, text in enumerate(paras):
            style = self.st["lede"] if is_lede else self.st["quote"]
            if n == len(paras) - 1 and not is_lede:
                style = self.st["quote_last"]
            flows.append(Paragraph(inline(text), style))
            if n < len(paras) - 1:
                flows.append(Spacer(1, 5))

        accent, fill = B.ORANGE, B.PANEL_WARM
        if tone == "pass":
            accent, fill = B.TEAL, B.PANEL_COOL
        elif tone == "info":
            accent, fill = B.NAVY_DEEP, B.PANEL
        elif tone == "fail":
            accent, fill = B.RED, colors.HexColor("#FDECEA")
        if is_lede:
            accent, fill = B.ORANGE, B.PANEL_WARM

        self.add(callout(flows, accent=accent, fill=fill, width=self.width))
        self.space(13)
        return i

    def _table(self, lines, i):
        buf = []
        while i < len(lines) and lines[i].strip().startswith("|"):
            buf.append(lines[i].strip())
            i += 1
        rows = []
        for line in buf:
            cells = [c.strip() for c in line.strip().strip("|").split("|")]
            if all(set(c) <= {"-", ":", " "} and c for c in cells):
                continue
            rows.append(cells)
        if not rows:
            return i
        ncols = max(len(r) for r in rows)
        for r in rows:
            r += [""] * (ncols - len(r))

        if self.pending.pop("tiles", None):
            items = [
                (r[0], plain(r[-1]), " · ".join(plain(x) for x in r[1:-1]))
                for r in rows[1:]
            ]
            for flow in stat_tiles(items, self.st, self.width):
                self.add(flow)
            self.space(6)
            return i

        table = build_table(rows, self.st, self.width)
        if table is not None:
            self.add(table)
            self.space(13)
        return i

    def _list(self, lines, i):
        items = []
        while i < len(lines):
            raw = lines[i].rstrip()
            if not raw.strip():
                nxt = lines[i + 1].rstrip() if i + 1 < len(lines) else ""
                if re.match(r"^\s*([-*+]|\d+\.)\s", nxt):
                    i += 1
                    continue
                break
            m = re.match(r"^(\s*)([-*+]|(\d+)\.)\s+(.*)$", raw)
            if not m:
                if items:
                    items[-1] = (items[0][0], items[-1][1] + " " + raw.strip(), items[-1][2])
                    i += 1
                    continue
                break
            indent = len(m.group(1))
            ordered = m.group(3) is not None
            items.append((indent, m.group(4), ordered))
            i += 1

        for n, (indent, text, ordered) in enumerate(items):
            nested = indent >= 2
            # bulletText is literal, never mini-HTML: colour and face come
            # from the paragraph style instead.
            if ordered:
                style, bullet = self.st["num"], f"{n + 1}."
            elif nested:
                style, bullet = self.st["bullet2"], "-"
            else:
                style, bullet = self.st["bullet"], "\u2022"
            self.add(Paragraph(inline(text), style, bulletText=bullet))
        self.space(7)
        return i

    def _para(self, lines, i):
        buf = []
        while i < len(lines):
            raw = lines[i].rstrip()
            if (
                not raw.strip()
                or raw.strip().startswith(("|", ">", "#", "```", "<!--"))
                or re.match(r"^\s*([-*+]|\d+\.)\s", raw)
                or re.match(r"^(-{3,}|\*{3,}|_{3,})$", raw.strip())
            ):
                break
            buf.append(raw.strip())
            i += 1
        text = " ".join(buf)
        if not text:
            return i + 1
        if re.match(r"^\*[^*].*\*$", text) and "**" not in text:
            self.add(Paragraph(inline(text), self.st["caption"]))
        else:
            self.add(Paragraph(inline(text), self.st["body"]))
        return i


def _heading_follows(lines: list[str], start: int) -> bool:
    """True when the next non-blank line opens a heading."""
    for line in lines[start:]:
        if not line.strip():
            continue
        return line.lstrip().startswith("#")
    return True  # trailing rule at end of document


def _chunk(lines: list[str], size: int) -> list[list[str]]:
    """Split long code blocks so a single flowable never exceeds a page."""
    if len(lines) <= size:
        return [lines]
    out = []
    for i in range(0, len(lines), size):
        out.append(lines[i : i + size])
    return out


def convert_file(path: Path, styles: dict, width: float = CONTENT_W):
    text = path.read_text(encoding="utf-8")
    front, body = split_frontmatter(text)
    story = Converter(styles, width).convert(body)
    return front, story
