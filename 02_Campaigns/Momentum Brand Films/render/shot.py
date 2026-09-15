#!/usr/bin/env python3
"""Screenshot any local HTML file. Used for design sheets and stills.

    python3 render/shot.py page.html out.png 1600 900 [--scale 2] [--wait 600]
"""
import argparse, pathlib
from playwright.sync_api import sync_playwright
CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"
ap = argparse.ArgumentParser()
ap.add_argument("html"); ap.add_argument("out")
ap.add_argument("width", type=int); ap.add_argument("height", type=int)
ap.add_argument("--scale", type=int, default=1)
ap.add_argument("--wait", type=int, default=600)
ap.add_argument("--full", action="store_true")
a = ap.parse_args()
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=CHROME, args=[
        "--no-sandbox", "--allow-file-access-from-files", "--force-color-profile=srgb",
        "--font-render-hinting=none", "--disable-lcd-text", "--hide-scrollbars", "--disable-gpu"])
    pg = b.new_page(viewport={"width": a.width, "height": a.height}, device_scale_factor=a.scale)
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto("file://" + str(pathlib.Path(a.html).resolve()))
    pg.wait_for_timeout(a.wait)
    pg.screenshot(path=a.out, full_page=a.full)
    b.close()
for e in errs:
    print("PAGE ERROR:", e)
print(a.out)
