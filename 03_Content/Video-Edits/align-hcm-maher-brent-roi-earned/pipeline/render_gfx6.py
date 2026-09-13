import os, argparse
from playwright.sync_api import sync_playwright
BASE = os.path.dirname(os.path.abspath(__file__))
ap = argparse.ArgumentParser()
ap.add_argument("mode", choices=["intro","outro","pageflip","bgloop","chtitle","chchrome"])
ap.add_argument("--out", required=True)
ap.add_argument("--fps", type=int, default=30)
ap.add_argument("--eyebrow", default=""); ap.add_argument("--num", default="")
ap.add_argument("--title", default=""); ap.add_argument("--active", default="R")
a = ap.parse_args()
HIDE_BG = "['#bg','#footer','#topbar'].forEach(s=>{document.querySelector(s).style.display='none'}); document.body.style.background='transparent'; document.documentElement.style.background='transparent';"
HIDE_CHROME = "['.eyebrow','.cornerlogo','.vglow','.vshadow','.namebar'].forEach(s=>{document.querySelector('#ch '+s).style.display='none'});"
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/opt/pw-browsers/chromium",
        args=["--force-device-scale-factor=1","--hide-scrollbars","--font-render-hinting=none"])
    pg = b.new_page(viewport={"width":1920,"height":1080})
    pg.goto("file://" + os.path.join(BASE, "gfx6.html"))
    pg.wait_for_timeout(700)
    def frames(n, fn, alpha=False, t0=0.0):
        os.makedirs(a.out, exist_ok=True)
        for i in range(n):
            pg.evaluate(f"seek({t0 + i/a.fps}, '{fn}')")
            pg.screenshot(path=os.path.join(a.out, f"f_{i:04d}.png"), omit_background=alpha)
        print(f"{a.mode} -> {a.out} ({n})")
    if a.mode == "intro":
        pg.evaluate("setScene('intro')"); pg.wait_for_timeout(120); frames(150, "intro")
    elif a.mode == "outro":
        pg.evaluate("setScene('outro')"); pg.wait_for_timeout(120); frames(180, "outro")
    elif a.mode == "pageflip":
        pg.evaluate("setScene('pageflip')"); pg.wait_for_timeout(120); frames(26, "pageflip", alpha=True)
    elif a.mode == "bgloop":
        pg.evaluate("setScene('ch')"); pg.evaluate("document.querySelector('#ch').style.display='none'")
        pg.wait_for_timeout(120); frames(240, "x", t0=4.0)
    elif a.mode == "chtitle":
        pg.evaluate("setScene('ch')")
        pg.evaluate("([e,n,t,ac]) => setCh(e,n,t,ac)", [a.eyebrow, a.num, a.title, a.active])
        pg.evaluate(HIDE_BG); pg.evaluate(HIDE_CHROME); pg.wait_for_timeout(120)
        frames(120, "ch", alpha=True)
    elif a.mode == "chchrome":
        pg.evaluate("setScene('ch')")
        pg.evaluate("([e,n,t,ac]) => setCh(e,n,t,ac)", [a.eyebrow, a.num, a.title, a.active])
        pg.evaluate(HIDE_BG); pg.wait_for_timeout(120)
        pg.evaluate("seek(10, 'chloop')")
        pg.screenshot(path=a.out, omit_background=True)
        print("chrome ->", a.out)
    b.close()
