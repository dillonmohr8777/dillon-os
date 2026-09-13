import os, argparse
from playwright.sync_api import sync_playwright
BASE = os.path.dirname(os.path.abspath(__file__))
ap = argparse.ArgumentParser()
ap.add_argument("mode", choices=["anim","still"])
ap.add_argument("--scene", required=True)          # c1|c2|c3|endcard|chrome
ap.add_argument("--dur", type=float, default=4.0)
ap.add_argument("--fps", type=int, default=30)
ap.add_argument("--out", required=True)
ap.add_argument("--kicker", default="")
ap.add_argument("--ring", default="")              # "x,y,w,h"
ap.add_argument("--t", type=float, default=0.5)
ap.add_argument("--alpha", action="store_true")
a = ap.parse_args()
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/opt/pw-browsers/chromium",
        args=["--force-device-scale-factor=1","--hide-scrollbars","--font-render-hinting=none"])
    pg = b.new_page(viewport={"width":1920,"height":1080})
    pg.goto("file://" + os.path.join(BASE, "gfx3.html"))
    pg.wait_for_timeout(700)
    pg.evaluate(f"setScene('{a.scene}')")
    if a.scene == "endcard" and a.kicker:
        pg.evaluate("k => setEndcard(k)", a.kicker)
    if a.scene == "chrome" and a.ring:
        x,y,w,h = [int(v) for v in a.ring.split(",")]
        pg.evaluate(f"setRing({x},{y},{w},{h})")
    pg.wait_for_timeout(150)
    if a.mode == "still":
        pg.evaluate(f"seek({a.t}, '{a.scene}')")
        pg.screenshot(path=a.out, omit_background=a.alpha)
        print("still ->", a.out)
    else:
        os.makedirs(a.out, exist_ok=True)
        n = int(round(a.dur * a.fps))
        for i in range(n):
            pg.evaluate(f"seek({i/a.fps}, '{a.scene}')")
            pg.screenshot(path=os.path.join(a.out, f"f_{i:04d}.png"))
        print(f"anim -> {a.out} ({n} frames)")
    b.close()
