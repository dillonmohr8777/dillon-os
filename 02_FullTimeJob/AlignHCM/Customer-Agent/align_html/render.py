"""Markdown to HTML for the Align HCM Customer Agent document set.

Emits the component vocabulary in `style.css` (cover, phase banners, eyebrow
headings, callouts, card grids, field rows, verdict pills, hairline tables) so
the printed result matches the approved reference design.

Layout directives stay HTML comments so Obsidian renders the source cleanly:

    <!-- pdf:toc -->                  contents page
    <!-- pdf:pagebreak -->            hard page break
    <!-- pdf:tiles -->                next table becomes a card grid
    <!-- pdf:cards -->                next table becomes 2-up labelled cards
    <!-- pdf:fields -->               next table becomes label/value field rows
    <!-- pdf:callout tone=pass -->    tone for the next blockquote
"""

from __future__ import annotations

import html
import re
from pathlib import Path

BASE = Path(__file__).resolve().parent

# --------------------------------------------------------------- frontmatter --


def split_frontmatter(text: str) -> tuple[dict, str]:
    if not text.startswith("---\n"):
        return {}, text
    end = text.find("\n---", 4)
    if end == -1:
        return {}, text
    return _yaml_lite(text[4:end]), text[end + 4 :].lstrip("\n")


def _yaml_lite(raw: str) -> dict:
    root: dict = {}
    stack: list[tuple[int, dict]] = [(-1, root)]
    for line in raw.splitlines():
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        indent = len(line) - len(line.lstrip())
        s = line.strip()
        while stack and indent <= stack[-1][0]:
            stack.pop()
        parent = stack[-1][1] if stack else root
        if s.startswith("- "):
            parent.setdefault("__list__", []).append(_scalar(s[2:]))
            continue
        if ":" not in s:
            continue
        key, _, val = s.partition(":")
        key, val = key.strip(), val.strip()
        if val == "":
            child: dict = {}
            parent[key] = child
            stack.append((indent, child))
        else:
            parent[key] = _scalar(val)
    _collapse(root)
    return root


def _collapse(node: dict) -> None:
    for k, v in list(node.items()):
        if isinstance(v, dict):
            if set(v) == {"__list__"}:
                node[k] = v["__list__"]
            else:
                _collapse(v)


def _scalar(val: str):
    val = val.strip()
    if val[:1] in "\"'" and val[-1:] == val[:1] and len(val) > 1:
        return val[1:-1]
    return val


# -------------------------------------------------------------------- inline --

_CODE = re.compile(r"`([^`]+)`")
_BOLD = re.compile(r"\*\*(.+?)\*\*")
_ITALIC = re.compile(r"(?<!\*)\*([^*]+)\*(?!\*)")
_STRIKE = re.compile(r"~~(.+?)~~")
_LINK = re.compile(r"\[([^\]]+)\]\(([^)]+)\)")
_WIKI = re.compile(r"\[\[([^\]|]+)(?:\|([^\]]+))?\]\]")


def inline(text: str) -> str:
    spans: list[str] = []

    def stash(fragment: str) -> str:
        spans.append(fragment)
        return f"\x00{len(spans) - 1}\x00"

    text = _CODE.sub(lambda m: stash(f"<code>{html.escape(m.group(1))}</code>"), text)
    text = _WIKI.sub(
        lambda m: stash(f"<i>{html.escape(m.group(2) or m.group(1).split('/')[-1])}</i>"),
        text,
    )
    text = _LINK.sub(
        lambda m: stash(
            f'<a href="{html.escape(m.group(2), quote=True)}">{html.escape(m.group(1))}</a>'
        ),
        text,
    )
    text = html.escape(text)
    text = _BOLD.sub(r"<b>\1</b>", text)
    text = _ITALIC.sub(r"<i>\1</i>", text)
    text = _STRIKE.sub(r"<s>\1</s>", text)
    for i, frag in enumerate(spans):
        text = text.replace(f"\x00{i}\x00", frag)
    return text


def plain(text: str) -> str:
    text = _WIKI.sub(lambda m: m.group(2) or m.group(1).split("/")[-1], text)
    text = _LINK.sub(r"\1", text)
    text = _CODE.sub(r"\1", text)
    for mark in ("**", "~~", "*"):
        text = text.replace(mark, "")
    return text.strip()


# ------------------------------------------------------------------ verdicts --

_TOKENS = (
    "PASS", "FAIL", "PENDING", "NOT RUN", "NOT ACTIVATED", "ASKED", "OUTSTANDING",
    "EXEC", "SCENARIO", "N/A", "NO-GO", "HOLD", "KNOWLEDGE FAIL",
    "FALSE NEGATIVE", "EXEC PASS", "EXEC FAIL", "DEF",
)
_TONE = {
    "PASS": "pass", "EXEC PASS": "pass",
    "FAIL": "fail", "KNOWLEDGE FAIL": "fail", "FALSE NEGATIVE": "fail",
    "EXEC FAIL": "fail", "NO-GO": "fail",
    "PENDING": "hold", "HOLD": "hold", "OUTSTANDING": "hold",
    "ASKED": "info", "EXEC": "info",
    "NOT RUN": "mute", "NOT ACTIVATED": "mute", "DEF": "mute",
    "SCENARIO": "mute", "N/A": "mute",
}
_VERDICT_RE = re.compile(
    r"^(" + "|".join(sorted(_TOKENS, key=len, reverse=True)) + r")\b(.*)$", re.I
)

_RESULT_HEAD = re.compile(
    r"result|verdict|status|exec|outcome|p1|p2|pass|fail|gate|standing|run \d", re.I
)
_KEY_HEAD = re.compile(
    r"^(#|id|wb id|ref|test|label|pri|level|gate|track|code|metric|signal|"
    r"field|source|topic|version|guide|service|question|where|bucket)$",
    re.I,
)
_DIM_HEAD = re.compile(r"note|reason|detail|meaning|summary|observed|change|focus", re.I)


def verdict_pill(cell: str) -> str | None:
    text = plain(cell)
    if not text or len(text) > 64:
        return None
    m = _VERDICT_RE.match(text.upper())
    if not m:
        return None
    token = m.group(1)
    rest = text[len(token) :].strip().lstrip("-—· ").strip()
    tone = _TONE.get(token.upper(), "mute")
    note = f'<span class="pill__note">{inline(rest)}</span>' if rest else ""
    return f'<span class="pill pill--{tone}">{html.escape(token.upper())}</span>{note}'


# ------------------------------------------------------------------ converter --

_DIRECTIVE = re.compile(r"<!--\s*pdf:(\w+)(.*?)-->")
_SECTION = re.compile(
    r"^(?:(\d{1,2}|[IVX]{1,4}-[A-Z]|[A-Z]-\d{1,2})\s*[\.·:)-]?\s+|([A-Z])\s*[·.)]\s+)(.*)$"
)
_PART = re.compile(r"^PART\s+([IVX]+)\s*[·.:-]?\s*(.*)$", re.I)
_WORDS = {"I": "one", "II": "two", "III": "three", "IV": "four",
          "V": "five", "VI": "six", "VII": "seven", "VIII": "eight"}


class Converter:
    def __init__(self, markers: bool = True) -> None:
        self.markers = markers
        self.out: list[str] = []
        self.toc: list[tuple[int, str, str, str]] = []  # level, number, text, anchor
        self.runs: list[tuple[str, str]] = []  # anchor -> running section label
        self.pending: dict[str, str] = {}
        self.auto = 0
        self.anchor = 0
        self.section_label = ""
        self.first_quote = True

    # -- helpers
    def emit(self, chunk: str) -> None:
        self.out.append(chunk)

    def next_anchor(self) -> str:
        self.anchor += 1
        return f"s{self.anchor}"

    def marker(self, anchor: str) -> str:
        """Locator the measuring passes search for; omitted from the final print."""
        return f'<span class="mk">zq{anchor}qz</span>' if self.markers else ""

    def convert(self, body: str) -> str:
        lines = body.splitlines()
        i = 0
        while i < len(lines):
            raw = lines[i].rstrip()
            s = raw.strip()

            m = _DIRECTIVE.match(s)
            if m:
                i = self._directive(m, i)
                continue
            if not s:
                i += 1
                continue
            if s.startswith("```"):
                i = self._code(lines, i)
                continue
            if s.startswith("|"):
                i = self._table(lines, i)
                continue
            if s.startswith(">"):
                i = self._quote(lines, i)
                continue
            if re.match(r"^(-{3,}|\*{3,}|_{3,})$", s):
                i += 1
                continue
            if s.startswith("#"):
                i = self._heading(lines, i)
                continue
            if re.match(r"^([-*+]|\d+\.)\s", s):
                i = self._list(lines, i)
                continue
            i = self._para(lines, i)
        return "".join(self.out)

    # -- blocks
    def _directive(self, m, i):
        name = m.group(1).lower()
        args = dict(re.findall(r"(\w+)=([^\s]+)", m.group(2) or ""))
        if name == "pagebreak":
            self.emit('<div class="page-break"></div>')
        elif name == "toc":
            self.emit("\x01TOC\x01")
        elif name in {"tiles", "cards", "fields", "callout"}:
            self.pending[name] = args.get("tone", "1")
        return i + 1

    def _heading(self, lines, i):
        raw = lines[i].strip()
        level = len(raw) - len(raw.lstrip("#"))
        text = raw[level:].strip()
        clean = plain(text)

        if level == 1:
            part = _PART.match(clean)
            if part and self.out:
                self._phase(part.group(1), part.group(2))
            return i + 1

        if level == 2:
            part = _PART.match(clean)
            if part:
                self._phase(part.group(1), part.group(2))
                return i + 1
            num, title = "", clean
            m = _SECTION.match(clean)
            if m:
                num, title = m.group(1) or m.group(2), m.group(3)
            else:
                self.auto += 1
                num = f"{self.auto:02d}"
            anchor = self.next_anchor()
            self.section_label = title
            self.toc.append((1, num, title, anchor))
            label = re.sub(r"\s*[·(].*$", "", title).strip() or title
            self.runs.append((anchor, label.upper()))
            self.emit(
                f'<div class="section" id="{anchor}">{self.marker(anchor)}'
                f'<div class="eyebrow"><span class="eyebrow__num">{html.escape(num)}</span>'
                f'<span class="eyebrow__text">{html.escape(label)}</span></div>'
                f"<h2>{inline(title)}</h2></div>"
            )
            return i + 1

        if level == 3:
            anchor = self.next_anchor()
            self.toc.append((2, "", clean, anchor))
            self.emit(f'<h3 id="{anchor}">{inline(text)}</h3>')
            return i + 1

        self.emit(f"<h4>{inline(text)}</h4>")
        return i + 1

    def _phase(self, numeral: str, title: str) -> None:
        self.auto = 0
        word = _WORDS.get(numeral.upper(), numeral).upper()
        anchor = self.next_anchor()
        self.toc.append((0, f"PART {numeral}", title, anchor))
        self.runs.append((anchor, f"PART {numeral}"))
        self.emit(
            f'<div class="page-break"></div>'
            f'<div class="phase" id="{anchor}">{self.marker(anchor)}'
            f'<div class="phase__num">{html.escape(numeral)}</div><div>'
            f'<div class="phase__kicker">Part {html.escape(word.title())} · {html.escape(title)}</div>'
            f'<div class="phase__title">{inline(title)}</div></div></div>'
        )

    def _code(self, lines, i):
        i += 1
        buf = []
        while i < len(lines) and not lines[i].strip().startswith("```"):
            buf.append(lines[i])
            i += 1
        while buf and not buf[0].strip():
            buf.pop(0)
        while buf and not buf[-1].strip():
            buf.pop()
        self.emit(f"<pre><code>{html.escape(chr(10).join(buf))}</code></pre>")
        return i + 1

    def _quote(self, lines, i):
        buf = []
        while i < len(lines) and lines[i].strip().startswith(">"):
            buf.append(lines[i].strip().lstrip(">").strip())
            i += 1
        paras, block = [], []
        for line in buf + [""]:
            if line:
                block.append(line)
            elif block:
                paras.append(" ".join(block))
                block = []

        tone = self.pending.pop("callout", None)
        lede = self.first_quote
        self.first_quote = False
        klass = "callout"
        label = ""
        if lede:
            klass += " callout--dark"
            label = '<div class="callout__label">In one line</div>'
        elif tone and tone != "1":
            klass += f" callout--{tone}"

        body = "".join(f"<p>{inline(p)}</p>" for p in paras)
        self.emit(f'<div class="{klass}">{label}{body}</div>')
        return i

    def _table(self, lines, i):
        buf = []
        while i < len(lines) and lines[i].strip().startswith("|"):
            buf.append(lines[i].strip())
            i += 1
        rows = []
        for line in buf:
            cells = [c.strip() for c in line.strip().strip("|").split("|")]
            if all(c and set(c) <= {"-", ":", " "} for c in cells):
                continue
            rows.append(cells)
        if not rows:
            return i
        ncols = max(len(r) for r in rows)
        for r in rows:
            r += [""] * (ncols - len(r))
        header, body = rows[0], rows[1:]

        if self.pending.pop("tiles", None):
            self._tiles(body)
            return i
        if self.pending.pop("fields", None):
            self._fields(body)
            return i
        if self.pending.pop("cards", None):
            self._cards(body)
            return i

        result_cols = {c for c, h in enumerate(header) if _RESULT_HEAD.search(plain(h))}
        key_cols = {c for c, h in enumerate(header) if _KEY_HEAD.match(plain(h))}
        dim_cols = {c for c, h in enumerate(header) if _DIM_HEAD.search(plain(h))}

        head = "".join(f"<th>{inline(h)}</th>" for h in header)
        out = [f"<table><thead><tr>{head}</tr></thead><tbody>"]
        for row in body:
            tds = []
            for c, cell in enumerate(row):
                pill = verdict_pill(cell) if c in result_cols else None
                if pill:
                    tds.append(f'<td class="verdict">{pill}</td>')
                elif c in key_cols and c == 0:
                    tds.append(f'<td class="key">{inline(cell)}</td>')
                elif c in dim_cols:
                    tds.append(f'<td class="dim">{inline(cell)}</td>')
                else:
                    tds.append(f"<td>{inline(cell)}</td>")
            out.append(f"<tr>{''.join(tds)}</tr>")
        out.append("</tbody></table>")
        self.emit("".join(out))
        return i

    def _tiles(self, rows):
        n = len(rows)
        grid = "cards--4" if n % 4 == 0 or n > 6 else ("cards--3" if n == 3 else "")
        cells = []
        for r in rows:
            label, value = plain(r[0]), plain(r[-1])
            note = " · ".join(plain(x) for x in r[1:-1] if plain(x))
            tone = ""
            up = value.upper()
            if up.startswith("PASS"):
                tone = " card--pass"
            elif up.startswith(("FAIL", "NO-GO")):
                tone = " card--fail"
            cells.append(
                f'<div class="card card--capped{tone}">'
                f'<div class="card__label">{html.escape(label)}</div>'
                f'<div class="card__value">{html.escape(value)}</div>'
                + (f'<div class="card__note">{html.escape(note)}</div>' if note else "")
                + "</div>"
            )
        self.emit(f'<div class="cards {grid}">{"".join(cells)}</div>')

    def _cards(self, rows):
        cells = []
        for r in rows:
            title, body = plain(r[0]), inline(r[1] if len(r) > 1 else "")
            extra = "".join(
                f'<div class="card__note">{inline(x)}</div>' for x in r[2:] if plain(x)
            )
            cells.append(
                f'<div class="card"><div class="card__label">&nbsp;</div>'
                f'<div class="card__value" style="font-size:16px">{html.escape(title)}</div>'
                f'<div class="card__note">{body}</div>{extra}</div>'
            )
        self.emit(f'<div class="cards">{"".join(cells)}</div>')

    def _fields(self, rows):
        for r in rows:
            self.emit(
                f'<div class="field"><div class="field__label">{html.escape(plain(r[0]))}</div>'
                f'<div class="field__value">{inline(r[1] if len(r) > 1 else "")}</div></div>'
            )

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
                    items[-1] = (items[-1][0], items[-1][1] + " " + raw.strip(), items[-1][2])
                    i += 1
                    continue
                break
            items.append((len(m.group(1)), m.group(4), m.group(3) is not None))
            i += 1

        tag = "ol" if items and items[0][2] else "ul"
        out, depth = [f"<{tag}>"], 0
        for indent, text, _ in items:
            want = 1 if indent >= 2 else 0
            while depth < want:
                out.append("<ul>")
                depth += 1
            while depth > want:
                out.append("</ul>")
                depth -= 1
            out.append(f"<li>{inline(text)}</li>")
        out += ["</ul>"] * depth + [f"</{tag}>"]
        self.emit("".join(out))
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
        klass = ""
        if re.match(r"^\*[^*].*\*$", text) and "**" not in text:
            klass = ' class="caption"'
        self.emit(f"<p{klass}>{inline(text)}</p>")
        return i


# --------------------------------------------------------------------- cover --


def _parts(value, limit: int) -> list[str]:
    """Split a frontmatter row on middots, keeping later middots in the tail."""
    if isinstance(value, list):
        return [str(v).strip() for v in value]
    return [p.strip() for p in str(value).split("\u00b7", limit - 1)]


def cover_html(front: dict, logo_uri: str) -> str:
    pdf = front.get("pdf") if isinstance(front.get("pdf"), dict) else {}
    pdf = pdf or {}

    title = pdf.get("title", "")
    alt = pdf.get("title_alt", "")
    tag = pdf.get("tag", "")
    hero = pdf.get("hero") or []
    stats = pdf.get("stats") or []
    meta = pdf.get("meta") or []

    parts = ['<div class="cover">', '<div class="cover__disc"></div>']
    if tag:
        parts.append(f'<div class="cover__tag">{html.escape(tag)}</div>')
    parts.append(
        f'<div class="cover__logo"><img src="{logo_uri}" alt="Align HCM"></div>'
    )
    parts.append(f'<div class="cover__kicker">{html.escape(pdf.get("kicker", ""))}</div>')
    parts.append(
        f'<div class="cover__title">{html.escape(title)}'
        + (f'<span class="alt">{html.escape(alt)}</span>' if alt else "")
        + "</div>"
    )
    parts.append('<div class="cover__rule"></div>')
    if pdf.get("subtitle"):
        parts.append(f'<div class="cover__lede">{html.escape(pdf["subtitle"])}</div>')

    hero = _parts(hero, 3) if hero else []
    if len(hero) >= 2:
        parts.append(
            '<div class="cover__hero">'
            f'<div class="cover__hero-num">{html.escape(hero[0])}</div><div>'
            f'<div class="cover__hero-label">{html.escape(hero[1])}</div>'
            + (f'<div class="cover__hero-sub">{html.escape(hero[2])}</div>' if len(hero) > 2 else "")
            + "</div></div>"
        )

    if stats:
        cells = []
        for raw in stats:
            row = _parts(raw, 3)
            if len(row) < 2:
                continue
            tone = row[2] if len(row) > 2 else ""
            cells.append(
                f'<div><div class="cover__stat-num {html.escape(tone)}">{html.escape(row[0])}</div>'
                f'<div class="cover__stat-label">{html.escape(row[1])}</div></div>'
            )
        parts.append(f'<div class="cover__stats">{"".join(cells)}</div>')

    if meta:
        cells = []
        for raw in meta[:3]:
            row = _parts(raw, 2)
            if len(row) >= 2:
                cells.append(
                    f'<div><div class="cover__meta-label">{html.escape(row[0])}</div>'
                    f'<div class="cover__meta-value">{html.escape(row[1])}</div></div>'
                )
        parts.append(f'<div class="cover__meta">{"".join(cells)}</div>')

    if pdf.get("status_label"):
        note = pdf.get("status_note", "")
        parts.append(
            '<div class="cover__decision">'
            '<div class="cover__decision-label">Decision</div>'
            f'<div class="cover__badge">{html.escape(pdf["status_label"])}</div>'
            + (f"<p>{inline(note)}</p>" if note else "")
            + "</div>"
        )

    parts.append(
        '<div class="cover__foot">'
        f'<div><b>Align</b>HCM · Customer Agent</div>'
        f'<div>{html.escape(pdf.get("docid", ""))}</div></div>'
    )
    parts.append("</div>")
    return "".join(parts)


def toc_html(entries: list[tuple[int, str, str, str]], pages: dict) -> str:
    rows = ['<div class="section section--open"><div class="eyebrow">'
            '<span class="eyebrow__num">·</span>'
            '<span class="eyebrow__text">Contents</span></div>'
            "<h2>What is in this document</h2></div>",
            '<div class="toc">']
    for level, num, text, anchor in entries:
        if level == 2:
            continue
        klass = "toc__row toc__row--part" if level == 0 else "toc__row"
        page = pages.get(anchor, "")
        rows.append(
            f'<div class="{klass}"><span class="toc__num">{html.escape(num)}</span>'
            f'<span class="toc__text">{html.escape(text)}</span>'
            f'<span class="toc__page">{html.escape(str(page))}</span></div>'
        )
    rows.append("</div>")
    return "".join(rows)


def build_html(md_path: Path, logo_uri: str, css: str,
               pages: dict | None = None, markers: bool = True):
    """Return (frontmatter, cover_doc, body_doc, toc_entries, running_labels).

    The cover prints on its own pass at zero margin so it bleeds to the sheet
    edge; the body prints with margins and page furniture. `pages` maps an
    anchor to its printed page number, so a second call can fill the contents
    column once the first render has revealed the pagination.
    """
    front, body = split_frontmatter(md_path.read_text(encoding="utf-8"))
    conv = Converter(markers=markers)
    content = conv.convert(body)
    content = content.replace("\x01TOC\x01", toc_html(conv.toc, pages or {}))
    pdf = front.get("pdf") if isinstance(front.get("pdf"), dict) else {}
    title = html.escape((pdf or {}).get("title", md_path.stem))

    def document(inner: str) -> str:
        return (
            '<!doctype html><html lang="en"><head><meta charset="utf-8">'
            f"<title>{title}</title><style>{css}</style></head>"
            f"<body>{inner}</body></html>"
        )

    return (
        front,
        document(cover_html(front, logo_uri)),
        document(f"<main>{content}</main>"),
        conv.toc,
        conv.runs,
    )
