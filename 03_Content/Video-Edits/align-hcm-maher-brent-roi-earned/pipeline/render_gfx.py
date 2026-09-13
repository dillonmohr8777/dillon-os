import os, argparse
from playwright.sync_api import sync_playwright
BASE = os.path.dirname(os.path.abspath(__file__))
ap = argparse.ArgumentParser()
ap.add_argument("mode", choices=["anim","still"])
ap.add_argument("--scene", required=True)
ap.add_argument("--dur", type=float, default=4.8)
ap.add_argument("--fps", type=int, default=30)
ap.add_argument("--out", required=True)
ap.add_argument("--sec", default=""); ap.add_argument("--head", default="")
ap.add_argument("--sub", default=""); ap.add_argument("--who", default="")
ap.add_argument("--fill", default="20%")
ap.add_argument("--alpha", action="store_true")
a = ap.parse_args()
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/opt/pw-browsers/chromium",
        args=["--force-device-scale-factor=1","--hide-scrollbars","--font-render-hinting=none"])
    pg = b.new_page(viewport={"width":1920,"height":1080})
    pg.goto("file://" + os.path.join(BASE, "gfx.html"))
    pg.wait_for_timeout(700)
    pg.evaluate(f"setScene('{a.scene}')")
    if a.scene == "plate":
        pg.evaluate("([s,h,su,w,f]) => setPlateParams(s,h,su,w,f)", [a.sec,a.head,a.sub,a.who,a.fill])
    pg.wait_for_timeout(150)
    if a.mode == "still":
        pg.evaluate("seek(0.35,'plate')")
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
