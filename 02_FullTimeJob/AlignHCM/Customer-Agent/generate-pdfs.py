#!/usr/bin/env python3
"""Build the Align HCM Customer Agent PDF set.

    python3 generate-pdfs.py             # all three documents
    python3 generate-pdfs.py readiness   # one: knowledge-core | readiness | registry
    python3 generate-pdfs.py --html      # write the intermediate HTML and stop

Markdown sources are converted to HTML against the design system in
`align_html/` and printed by headless Chromium, the same engine that produced
the approved July 23 reference PDFs.

Each document is built in three moves:

1. The cover prints on its own pass at zero margin, so the navy panel bleeds to
   the sheet edge with no page furniture over it.
2. The body prints twice. The first pass reveals where each section landed; the
   second fills the contents column with real page numbers.
3. A post-pass merges the two, stamps the orange running section label into the
   top margin of each page, and writes the PDF outline.

Requires: playwright, pymupdf, and a Chromium build. Set CHROME_PATH to override
binary discovery.
"""

from __future__ import annotations

import base64
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from align_html.render import build_html  # noqa: E402

BASE = Path(__file__).resolve().parent
CSS = BASE / "align_html" / "style.css"
LOGO = BASE / "assets" / "align-hcm-logo.png"
FONTS = BASE / "fonts"

DOCS = {
    "knowledge-core": "Align-HCM-Customer-Agent-Knowledge-Core",
    "readiness": "Align-HCM-Customer-Agent-Readiness-Report",
    "registry": "Align-HCM-Customer-Agent-Question-Registry",
}

CHROME_CANDIDATES = [
    os.environ.get("CHROME_PATH", ""),
    "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/usr/bin/google-chrome",
]

FOOT_LEFT = "Align HCM · Customer Agent"
MARGIN = {"top": "0.86in", "bottom": "0.72in", "left": "0.66in", "right": "0.66in"}

ORANGE = (0xF0 / 255, 0x5A / 255, 0x28 / 255)
FAINT = (0x98 / 255, 0xA1 / 255, 0xAD / 255)
NAVY = (0x0A / 255, 0x25 / 255, 0x40 / 255)
CANVAS = (0xF9 / 255, 0xF9 / 255, 0xF7 / 255)


def data_uri(path: Path, mime: str) -> str:
    return f"data:{mime};base64," + base64.b64encode(path.read_bytes()).decode()


def css_with_assets() -> str:
    """Inline the fonts so rendering never depends on file access."""
    css = CSS.read_text(encoding="utf-8")
    for ttf in sorted(FONTS.glob("*.ttf")):
        css = css.replace(f"url({ttf.name})", f"url({data_uri(ttf, 'font/ttf')})")
    # the anchor markers must be present for text search but invisible in print
    # Taken out of flow so the measuring passes and the final marker-free pass
    # paginate identically.
    css += (
        "\n.mk { position: absolute; font-size: 1px; line-height: 0; "
        "color: #F9F9F7; letter-spacing: 0; }\n"
    )
    return css


def find_chrome() -> str | None:
    for candidate in CHROME_CANDIDATES:
        if candidate and Path(candidate).exists():
            return candidate
    return None


# Page furniture is stamped after printing rather than handed to Chrome, because
# Chrome's own header/footer cannot know the section a page belongs to and starts
# its page counter after the separately printed cover. Coordinates and sizes are
# the ones measured off the reference PDFs (points, origin top-left).
FURNITURE = {
    "left": 47.5,
    "right": 564.4,
    "header_baseline": 50.0,
    "footer_baseline": 763.5,
    "size": 7.9,
    "label_size": 8.2,
}


def render(page, doc_html: str, **pdf_kwargs) -> bytes:
    page.set_content(doc_html, wait_until="load")
    page.emulate_media(media="print")
    page.evaluate("document.fonts.ready")
    return page.pdf(print_background=True, format="Letter", **pdf_kwargs)


def marker_pages(pdf_bytes: bytes, anchors: list[str], offset: int) -> dict[str, int]:
    """Find the printed page of each invisible anchor marker."""
    import fitz

    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    found: dict[str, int] = {}
    for pno in range(doc.page_count):
        text = doc[pno].get_text()
        for anchor in anchors:
            if anchor in found:
                continue
            if f"zq{anchor}qz" in text:
                found[anchor] = pno + 1 + offset
    doc.close()
    return found


def tracked(page, text: str, x: float, y: float, size: float, colour, font, track: float):
    """Draw letter-spaced text, which insert_text cannot do on its own."""
    import fitz

    cursor = x
    for ch in text:
        page.insert_text(
            fitz.Point(cursor, y), ch, fontsize=size, color=colour,
            fontfile=font, fontname="pop",
        )
        cursor += fitz.get_text_length(ch, fontsize=size, fontname="helv") + track
    return cursor


def tracked_width(text: str, size: float, track: float) -> float:
    import fitz

    return sum(
        fitz.get_text_length(ch, fontsize=size, fontname="helv") + track for ch in text
    )


def finish(cover: bytes, body: bytes, runs: list[tuple[str, str]], toc: list,
           pages: dict[str, int], head: str, foot: str, out_path: Path) -> None:
    """Merge cover + body, stamp the page furniture, write the outline."""
    import fitz

    doc = fitz.open(stream=cover, filetype="pdf")
    body_doc = fitz.open(stream=body, filetype="pdf")
    doc.insert_pdf(body_doc)
    body_doc.close()

    # page -> section label, carried forward until the next section starts
    label_at = {pages[a]: lbl for a, lbl in runs if a in pages}
    regular = str(FONTS / "Poppins-Regular.ttf")
    semibold = str(FONTS / "Poppins-SemiBold.ttf")
    bold = str(FONTS / "Poppins-Bold.ttf")
    f = FURNITURE
    current = ""

    for pno in range(1, doc.page_count):
        page = doc[pno]
        number = pno + 1  # the cover is page 1
        current = label_at.get(number, current)

        # Chrome paints the root background inside the content box only, so the
        # warm canvas is laid in underneath the printed content.
        page.draw_rect(page.rect, color=None, fill=CANVAS, overlay=False)

        # header: document name left, running section label right
        page.insert_text(
            fitz.Point(f["left"], f["header_baseline"]), head,
            fontsize=f["size"], color=FAINT, fontfile=regular, fontname="popr",
        )
        if current:
            track = 1.5
            width = tracked_width(current, f["label_size"], track)
            tracked(page, current, f["right"] - width, f["header_baseline"],
                    f["label_size"], ORANGE, semibold, track)

        # footer: owner left, document line centred, page number right
        page.insert_text(
            fitz.Point(f["left"], f["footer_baseline"]), FOOT_LEFT,
            fontsize=f["size"], color=NAVY, fontfile=semibold, fontname="pops",
        )
        track = 0.55
        width = tracked_width(foot, f["size"], track)
        tracked(page, foot, (f["left"] + f["right"] - width) / 2,
                f["footer_baseline"], f["size"], FAINT, regular, track)
        label = str(number)
        page.insert_text(
            fitz.Point(
                f["right"] - fitz.get_text_length(label, fontsize=f["size"], fontname="helv"),
                f["footer_baseline"],
            ),
            label, fontsize=f["size"], color=ORANGE, fontfile=bold, fontname="popb",
        )

    outline = []
    depth = 0
    for level, num, text, anchor in toc:
        pno = pages.get(anchor)
        if not pno or level == 2:
            continue
        # a PDF outline may only descend one level at a time
        want = min(level + 1, depth + 1) or 1
        depth = want
        title = f"{num} · {text}".strip(" ·") if num else text
        outline.append([want, title, pno])
    if outline:
        doc.set_toc(outline)

    doc.set_metadata({"title": out_path.stem.replace("-", " "), "author": "Align HCM"})
    doc.save(str(out_path), deflate=True, garbage=3)
    doc.close()


def build(slug: str, html_only: bool = False) -> Path:
    stem = DOCS[slug]
    md_path = BASE / f"{stem}.md"
    if not md_path.exists():
        raise SystemExit(f"missing source: {md_path}")

    css = css_with_assets()
    logo = data_uri(LOGO, "image/png")
    front, cover_doc, body_doc, toc, runs = build_html(md_path, logo, css)
    meta = front.get("pdf") if isinstance(front.get("pdf"), dict) else {}
    meta = meta or {}

    if html_only:
        path = BASE / f".build-{stem}.html"
        path.write_text(cover_doc + "\n<!-- body -->\n" + body_doc, encoding="utf-8")
        return path

    chrome = find_chrome()
    if not chrome:
        raise SystemExit(
            "no Chromium binary found. Set CHROME_PATH to a Chrome/Chromium executable."
        )

    from playwright.sync_api import sync_playwright

    running = meta.get("running_head", stem)
    centre = meta.get("running_foot", "Internal")
    anchors = [a for _, _, _, a in toc if a]

    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=chrome, args=["--no-sandbox"])
        page = browser.new_page()

        cover_pdf = render(
            page, cover_doc,
            margin={"top": "0", "bottom": "0", "left": "0", "right": "0"},
        )
        body_kwargs = dict(margin=MARGIN)
        # pass 1: learn where each section landed
        first = render(page, body_doc, **body_kwargs)
        pages = marker_pages(first, anchors, offset=1)

        # pass 2: same layout with the contents column filled in
        _, _, measured, toc2, runs2 = build_html(md_path, logo, css, pages)
        second = render(page, measured, **body_kwargs)
        pages = marker_pages(second, anchors, offset=1) or pages

        # pass 3: identical input minus the locators, so they never reach the
        # shipped text layer. The locators are 1px zero-leading spans, so this
        # must not repaginate; if it somehow does, keep the measured render.
        _, _, final_doc, _, _ = build_html(md_path, logo, css, pages, markers=False)
        final = render(page, final_doc, **body_kwargs)
        import fitz as _fitz

        with _fitz.open(stream=second, filetype="pdf") as a, \
             _fitz.open(stream=final, filetype="pdf") as b:
            stable = a.page_count == b.page_count
        if not stable:
            print("  ! locator removal shifted pagination; keeping measured render")
            final = second
        browser.close()

    out = BASE / f"{stem}.pdf"
    finish(cover_pdf, final, runs2, toc2, pages, running, centre, out)
    return out


def main(argv: list[str]) -> int:
    args = [a for a in argv[1:] if not a.startswith("--")]
    html_only = "--html" in argv
    slugs = args or list(DOCS)
    unknown = [s for s in slugs if s not in DOCS]
    if unknown:
        print(f"unknown doc(s): {', '.join(unknown)}")
        print(f"available: {', '.join(DOCS)}")
        return 2
    for slug in slugs:
        path = build(slug, html_only)
        print(f"  wrote {path.name} ({path.stat().st_size / 1024:.0f} KB)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
