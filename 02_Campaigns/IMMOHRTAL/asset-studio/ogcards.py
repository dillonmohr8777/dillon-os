#!/usr/bin/env python3
"""
Per-post OG share cards (1200x630) — every blog link shared anywhere
gets a branded card: post title in Anton, tag HUD, Dillon's portrait.
Rendered straight into the site at public/og/<slug>.png.

Usage:  python3 ogcards.py
"""
import os, glob, html as H

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.abspath(os.path.join(HERE, "..", "..", "..", "immohrtal-site"))
FONTS = os.path.join(SITE, "src", "fontfiles")
PHOTOS = os.path.abspath(os.path.join(HERE, "..", "reference", "photos"))
OUT = os.path.join(SITE, "public", "og")

INK = "#141922"; SIGNAL = "#0d6bcc"; GREEN = "#0d7a4b"

# (slug, title, tag, photo)
CARDS = [
    ("who-is-immohrtal", "Who Is IMMOHRTAL", "ABOUT", "portrait-bw.png"),
    ("rappers-like-mac-miller", "Rappers Like Mac Miller and Where I Actually Fit", "INFLUENCES", "portrait-bw.png"),
    ("rappers-from-erie-pa", "Rappers From Erie PA and Why I Claim The 814", "THE 814", "collage-814-lighthouse.jpeg"),
    ("the-come-up", "The Come Up: Why This Music Waited", "THE COME UP", "family-daughter.png"),
]

def card(title, tag, photo):
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>
@font-face {{ font-family:'Anton'; src:url('file://{FONTS}/Anton-400.woff2') format('woff2'); }}
@font-face {{ font-family:'Instrument Serif'; font-style:italic; src:url('file://{FONTS}/InstrumentSerif-400-italic.woff2') format('woff2'); }}
@font-face {{ font-family:'IBM Plex Mono'; font-weight:500; src:url('file://{FONTS}/IBMPlexMono-500.woff2') format('woff2'); }}
*{{margin:0;padding:0;box-sizing:border-box}}
body{{width:1200px;height:630px;display:flex;font-family:sans-serif;overflow:hidden;
  background:radial-gradient(120% 90% at 50% 0%, #ffffff, #eef2f6 70%, #e8edf3);color:{INK}}}
.mono{{font-family:'IBM Plex Mono',monospace;font-weight:500;letter-spacing:.14em;text-transform:uppercase}}
.left{{flex:1;padding:52px 56px;display:flex;flex-direction:column;justify-content:space-between}}
.right{{width:480px;flex:none;background:url('file://{PHOTOS}/{photo}') center 22%/cover;border-left:1px solid rgba(20,25,34,.22);
  filter:grayscale(0.15)}}
</style></head><body>
<div class="left">
  <div class="mono" style="font-size:15px;color:rgba(20,25,34,.5)">BLOG // <b style="color:{SIGNAL};font-weight:500">{tag}</b></div>
  <div>
    <div style="font-family:'Anton';text-transform:uppercase;font-size:64px;line-height:.98;max-width:11ch">{H.escape(title)}</div>
    <div style="font-family:'Instrument Serif';font-style:italic;font-size:24px;color:rgba(20,25,34,.7);margin-top:18px">IMMOHRTAL &middot; Dance With The Delusional</div>
  </div>
  <div class="mono" style="font-size:15px;color:{GREEN}">IF NOT NOW, WHEN &middot; IMMOHRTAL</div>
</div>
<div class="right"></div>
</body></html>"""

def main():
    os.makedirs(OUT, exist_ok=True)
    from playwright.sync_api import sync_playwright
    exe = glob.glob("/opt/pw-browsers/chromium-*/chrome-linux/chrome")
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path=exe[0] if exe else None)
        pg = b.new_page(viewport={"width": 1200, "height": 630})
        import tempfile
        for slug, title, tag, photo in CARDS:
            with tempfile.NamedTemporaryFile('w', suffix='.html', delete=False) as f:
                f.write(card(title, tag, photo)); path = f.name
            pg.goto(f"file://{path}", wait_until="networkidle")
            pg.wait_for_timeout(350)
            png = os.path.join(OUT, f"{slug}.png"); pg.screenshot(path=png)
            from PIL import Image; Image.open(png).convert("RGB").save(png[:-4]+".jpg", quality=85, optimize=True); os.remove(png)
            print("rendered og/" + slug + ".png")
        b.close()

if __name__ == "__main__":
    main()
