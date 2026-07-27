#!/usr/bin/env python3
"""Assemble src/ into a single self contained index.html.

Everything is inlined so the page runs from file:// with no network: the two
Google Fonts as base64 woff2, the traced Align wordmark path, and the grain
tile. Run this after editing anything under src/.
"""
import pathlib, sys

ROOT = pathlib.Path(__file__).parent
SRC = ROOT / "src"
BUILD = ROOT / "build"

def read(p):
    if not p.exists():
        sys.exit(f"missing {p}. Run build/mk.py (fonts) and build/wm.py (wordmark) first.")
    return p.read_text()

fonts = read(BUILD / "fonts.css")
style = read(SRC / "style.css")
scenes = read(SRC / "scenes.js")
shell = read(SRC / "shell.html")
wordmark = read(BUILD / "wordmark.path").strip()
noise = read(BUILD / "noise.b64").strip()

style = style.replace("var(--grain)", f"url(data:image/png;base64,{noise})")
scenes = scenes.replace("__WORDMARK_PATH__", wordmark)

out = (shell
       .replace("/*__FONTS__*/", fonts)
       .replace("/*__STYLE__*/", style)
       .replace("/*__SCENES__*/", scenes))

(ROOT / "index.html").write_text(out)
print(f"index.html written, {len(out) // 1024} KB")
