#!/usr/bin/env python3
"""Assemble src/ into a single self contained index.html.

Everything is inlined so the page runs from file:// with no network: the two
Google Fonts as base64 woff2, the traced Align wordmark path, and the grain
tile. Run this after editing anything under src/.
"""
import base64, io, pathlib, sys

from PIL import Image

ROOT = pathlib.Path(__file__).parent
SRC = ROOT / "src"
BUILD = ROOT / "build"

def read(p):
    if not p.exists():
        sys.exit(f"missing {p}. Run build/fonts.py, build/wm.py, icons.py and logos.py first.")
    return p.read_text()


def data_uri(path, max_width):
    """base64 PNG, downsampled to what the stage actually displays."""
    im = Image.open(path).convert("RGBA")
    if im.width > max_width:
        im = im.resize((max_width, round(im.height * max_width / im.width)), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, "PNG", optimize=True)
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()

fonts = read(BUILD / "fonts.css")
style = read(SRC / "style.css")
scenes = read(SRC / "scenes.js")
shell = read(SRC / "shell.html")
wordmark = read(BUILD / "wordmark.path").strip()
noise = read(BUILD / "noise.b64").strip()
icons = read(BUILD / "icons.js")

# Logos are inlined at roughly twice their on screen size, which is plenty for
# a 1080p stage and keeps index.html from ballooning.
LOGOS = {
    "ukg": ("logos/ukg-white.png", 620),
    "dayforce": ("logos/dayforce-white.png", 700),
    "workday": ("logos/workday-white.png", 620),
    "adp": ("logos/adp-white.png", 560),
    "smartcare": ("logos/smartcare-reverse.png", 1100),
}
logo_js = "const LOGOS = {\n" + "".join(
    f'  {k}: "{data_uri(ROOT / "assets" / rel, w)}",\n' for k, (rel, w) in LOGOS.items()
) + "};\n"

style = style.replace("var(--grain)", f"url(data:image/png;base64,{noise})")
scenes = scenes.replace("__WORDMARK_PATH__", wordmark)
scenes = icons + logo_js + scenes

out = (shell
       .replace("/*__FONTS__*/", fonts)
       .replace("/*__STYLE__*/", style)
       .replace("/*__SCENES__*/", scenes))

(ROOT / "index.html").write_text(out)
print(f"index.html written, {len(out) // 1024} KB")
