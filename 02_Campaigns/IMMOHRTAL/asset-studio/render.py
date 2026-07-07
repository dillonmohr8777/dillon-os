#!/usr/bin/env python3
"""
IMMOHRTAL asset studio — renders finished brand PNGs from the site's
design tokens (immohrtal-site/src/index.css) via headless Chromium.

Usage:  python3 render.py [asset-id ...]     (no args = render everything)
Output: out/<id>.png
"""
import os, sys, glob, html as H

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.abspath(os.path.join(HERE, "..", "..", "..", "immohrtal-site"))
FONTS = os.path.join(SITE, "src", "fontfiles")
PUB = os.path.join(SITE, "public")
BUILD = os.path.join(HERE, "_build")
OUT = os.path.join(HERE, "out")

# ── design tokens (mirror of src/index.css) ─────────────────────────
PAPER = "#f7f9fb"; PAPER2 = "#eef2f6"; INK = "#141922"; NIGHT = "#10151d"
SIGNAL = "#1f9eff"; SIGNAL_TXT = "#0d6bcc"; SIGNAL_NIGHT = "#5cb8ff"
GREEN = "#17a86b"; GREEN_TXT = "#0d7a4b"; GREEN_NIGHT = "#3cc98d"
CHROME_LIGHT = ("linear-gradient(180deg,#f5f8fc 0%,#c3cfe0 28%,#77879f 46%,"
                "#e8f1fb 52%,#45536a 64%,#97a8c0 82%,#dbe4f0 100%)")

BASE_CSS = f"""
@font-face {{ font-family:'Anton'; src:url('file://{FONTS}/Anton-400.woff2') format('woff2'); }}
@font-face {{ font-family:'Instrument Serif'; font-style:italic; src:url('file://{FONTS}/InstrumentSerif-400-italic.woff2') format('woff2'); }}
@font-face {{ font-family:'Instrument Serif'; font-style:normal; src:url('file://{FONTS}/InstrumentSerif-400.woff2') format('woff2'); }}
@font-face {{ font-family:'Space Grotesk'; font-weight:300 700; src:url('file://{FONTS}/SpaceGrotesk.woff2') format('woff2'); }}
@font-face {{ font-family:'IBM Plex Mono'; font-weight:400; src:url('file://{FONTS}/IBMPlexMono-400.woff2') format('woff2'); }}
@font-face {{ font-family:'IBM Plex Mono'; font-weight:500; src:url('file://{FONTS}/IBMPlexMono-500.woff2') format('woff2'); }}
* {{ margin:0; padding:0; box-sizing:border-box; }}
html,body {{ width:100%; height:100%; overflow:hidden; }}
body {{ font-family:'Space Grotesk',sans-serif; -webkit-font-smoothing:antialiased; }}
.mono {{ font-family:'IBM Plex Mono',monospace; font-weight:500; letter-spacing:.14em; text-transform:uppercase; }}
.anton {{ font-family:'Anton',sans-serif; font-weight:400; text-transform:uppercase; letter-spacing:.01em; }}
.serif-i {{ font-family:'Instrument Serif',serif; font-style:italic; }}
.chrome {{ background:{CHROME_LIGHT}; -webkit-background-clip:text; background-clip:text; color:transparent; }}
.day {{ background:
  radial-gradient(120% 90% at 50% 0%, rgba(255,255,255,.9), rgba(255,255,255,0) 60%),
  linear-gradient(180deg,{PAPER} 0%,{PAPER2} 100%); color:{INK}; }}
.night {{ background:
  radial-gradient(130% 100% at 50% 8%, rgba(93,106,126,.16), rgba(0,0,0,0) 55%),
  radial-gradient(160% 130% at 50% 115%, rgba(0,0,0,.5), rgba(0,0,0,0) 55%),
  {NIGHT}; color:#e9eef6; }}
"""

def meter(heights, grad=f"linear-gradient(180deg,{SIGNAL},{GREEN})", gap=6, radius=0):
    bars = "".join(
        f"<i style='flex:1;height:{h}%;background:{grad};border-radius:{radius}px'></i>"
        for h in heights)
    return f"<div style='display:flex;align-items:flex-end;gap:{gap}px;height:100%'>{bars}</div>"

M814 = [30,55,80,45,95,60,35,75,50,88,40,65,92,58,34,72,48,84,38,62]
MOMW = [22,40,60,38,72,52,30,64,44,78,36,58,80,50,28,66,42,74,32,56]

import json as _json
_WAVES = _json.load(open(os.path.join(HERE, "data", "waveforms.json")))
def real_meter(track, n=20):
    """n-bar meter sampled from the track's real waveform peaks."""
    w = _WAVES[track]
    step = len(w) // n
    return [max(8, round(max(w[i*step:(i+1)*step]) * 100)) for i in range(n)]

# ── asset builders ───────────────────────────────────────────────────
def quote_day(bar, tag, footer_tag="IF NOT NOW, WHEN"):
    return f"""
<div class="day" style="width:100%;height:100%;padding:84px;display:flex;flex-direction:column">
  <div style="position:absolute;inset:44px;border:1px solid rgba(20,25,34,.18);pointer-events:none"></div>
  <div class="mono" style="display:flex;justify-content:space-between;font-size:19px;color:rgba(20,25,34,.5)">
    <span>{tag.replace('//','<b style="color:'+SIGNAL_TXT+';font-weight:500">//')+'</b>' if '//' in tag else tag}</span>
    <span>IMMOHRTAL</span>
  </div>
  <div style="flex:1;display:flex;align-items:center">
    <div class="serif-i" style="font-size:80px;line-height:1.22;max-width:15ch">&ldquo;{H.escape(bar)}&rdquo;</div>
  </div>
  <div style="display:flex;justify-content:space-between;align-items:baseline;border-top:1px solid rgba(20,25,34,.18);padding-top:26px">
    <span class="anton" style="font-size:34px">IMMOHRTAL</span>
    <span class="mono" style="font-size:17px;color:{GREEN_TXT}">{footer_tag}</span>
  </div>
</div>"""

def quote_night(bar, tag):
    return f"""
<div class="night" style="width:100%;height:100%;padding:84px;display:flex;flex-direction:column">
  <div style="position:absolute;inset:44px;border:1px solid rgba(233,238,246,.2);pointer-events:none"></div>
  <div class="mono" style="display:flex;justify-content:space-between;font-size:19px;color:rgba(233,238,246,.55)">
    <span>{tag}</span><span style="color:{SIGNAL_NIGHT}">IMMOHRTAL</span>
  </div>
  <div style="flex:1;display:flex;align-items:center">
    <div class="serif-i" style="font-size:72px;line-height:1.26;max-width:16ch;color:#eef3fa">&ldquo;{H.escape(bar)}&rdquo;</div>
  </div>
  <div style="display:flex;justify-content:space-between;align-items:baseline;border-top:1px solid rgba(233,238,246,.2);padding-top:26px">
    <span class="anton chrome" style="font-size:34px">IMMOHRTAL</span>
    <span class="mono" style="font-size:17px;color:{GREEN_NIGHT}">IF NOT NOW, WHEN</span>
  </div>
</div>"""

def story(title, trk, bar, heights):
    return f"""
<div class="night" style="width:100%;height:100%;padding:96px 84px;display:flex;flex-direction:column">
  <div class="mono" style="display:flex;justify-content:space-between;font-size:21px;color:rgba(233,238,246,.55)">
    <span>NOW PLAYING</span><span style="color:{SIGNAL_NIGHT}">{trk}</span>
  </div>
  <div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:72px">
    <div class="anton chrome" style="font-size:158px;line-height:.94;max-width:8ch">{H.escape(title)}</div>
    <div style="height:190px">{meter(heights)}</div>
    <div class="serif-i" style="font-size:50px;line-height:1.35;color:rgba(233,238,246,.85);max-width:18ch">&ldquo;{H.escape(bar)}&rdquo;</div>
  </div>
  <div class="mono" style="display:flex;justify-content:space-between;font-size:19px;color:rgba(233,238,246,.55)">
    <span>DANCE WITH THE DELUSIONAL</span><span style="color:{GREEN_NIGHT}">SESSION 001</span>
  </div>
</div>"""

def thumb(title, sub, trk):
    return f"""
<div class="night" style="width:100%;height:100%;padding:64px 76px;display:flex;flex-direction:column;justify-content:space-between">
  <div class="mono" style="display:flex;justify-content:space-between;font-size:20px;color:rgba(233,238,246,.55)">
    <span>IMMOHRTAL</span><span style="color:{SIGNAL_NIGHT}">{trk}</span>
  </div>
  <div class="anton chrome" style="font-size:132px;line-height:.94;max-width:10ch">{H.escape(title)}</div>
  <div class="mono" style="font-size:20px;color:{SIGNAL_NIGHT}">{sub}</div>
</div>"""

def endcard():
    return f"""
<div class="night" style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:52px">
  <div class="mono" style="font-size:22px;color:rgba(233,238,246,.55)">IMMOHRTAL &middot; SESSION 001</div>
  <div class="anton chrome" style="font-size:190px;line-height:.95;text-align:center">IF NOT NOW,<br>WHEN.</div>
  <div class="mono" style="font-size:22px;color:{GREEN_NIGHT}">DANCE WITH THE DELUSIONAL</div>
</div>"""

def avatar():
    return f"""
<div class="day" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center">
  <img src="file://{PUB}/logo-mark.png" style="width:66%;filter:drop-shadow(0 18px 40px rgba(20,25,34,.18))">
</div>"""

def banner_youtube():
    return f"""
<div class="night" style="width:100%;height:100%;position:relative">
  <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(31,158,255,0) 55%,rgba(31,158,255,.10) 78%,rgba(23,168,107,.16) 100%)"></div>
  <div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:1546px;height:423px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:26px">
    <div class="mono" style="font-size:20px;color:rgba(233,238,246,.6)">SESSION 001 &middot; ERIE 42.1292 N &middot; PGH 40.4406 N</div>
    <div class="anton chrome" style="font-size:150px;line-height:1">IMMOHRTAL</div>
    <div class="mono" style="font-size:21px;color:{SIGNAL_NIGHT}">DANCE WITH THE DELUSIONAL &middot; IF NOT NOW, WHEN</div>
  </div>
</div>"""

def banner_x():
    return f"""
<div class="day" style="width:100%;height:100%;padding:56px 72px;display:flex;align-items:center;justify-content:space-between">
  <div>
    <div class="anton" style="font-size:118px;line-height:1;color:{INK}">IMMOHRTAL</div>
    <div class="mono" style="font-size:17px;color:{GREEN_TXT};margin-top:14px">IF NOT NOW, WHEN</div>
  </div>
  <div class="mono" style="text-align:right;font-size:17px;line-height:2.1;color:rgba(20,25,34,.55)">
    SESSION 001<br>DANCE WITH THE DELUSIONAL<br><span style="color:{SIGNAL_TXT}">42.1292 N / 80.0851 W</span>
  </div>
</div>"""

def og_image():
    return f"""
<div class="day" style="width:100%;height:100%;display:flex">
  <div style="flex:1;padding:46px 48px;display:flex;flex-direction:column;justify-content:space-between">
    <div class="mono" style="font-size:14px;color:rgba(20,25,34,.5)">SESSION 001 // <b style="color:{SIGNAL_TXT};font-weight:500">THE FIRE IS BACK</b></div>
    <div>
      <div class="anton" style="font-size:64px;line-height:.96;color:{INK}">DANCE WITH THE DELUSIONAL</div>
      <div class="serif-i" style="font-size:24px;color:rgba(20,25,34,.72);margin-top:16px">the first IMMOHRTAL record</div>
    </div>
    <div class="mono" style="font-size:14px;color:{GREEN_TXT}">IF NOT NOW, WHEN &middot; IMMOHRTAL.COM</div>
  </div>
  <div style="width:630px;height:630px;flex:none;background:url('file://{PUB}/cover.jpg') center/cover;border-left:1px solid rgba(20,25,34,.2)"></div>
</div>"""

def tracklist():
    tracks = [
        ("01","No Way Out",None),("02","Picking Up My Notepad",None),
        ("03","814 Blood","ft. King Keev"),("04","My Mothers Baby",None),
        ("05","Roll the Dice",None),("06","My Own Way",None),
        ("07","Headstone","Interlude"),("08","Grade A Love",None),
        ("09","On My Way","ft. King Keev"),("10","Waitlist",None),
        ("11","Dance with the Delusional","ft. Ted Moon"),
    ]
    rows = "".join(f"""
    <div style="display:flex;align-items:baseline;gap:26px;padding:17px 0;border-bottom:1px solid rgba(20,25,34,.1)">
      <span class="mono" style="font-size:17px;color:{SIGNAL_TXT}">TRK {n}</span>
      <span style="font-size:29px;font-weight:500">{H.escape(t)}</span>
      {f'<span class="serif-i" style="font-size:24px;color:rgba(20,25,34,.55)">{f}</span>' if f else ''}
    </div>""" for n,t,f in tracks)
    return f"""
<div class="day" style="width:100%;height:100%;padding:84px;display:flex;flex-direction:column">
  <div class="mono" style="display:flex;justify-content:space-between;font-size:18px;color:rgba(20,25,34,.5)">
    <span>SESSION 001</span><span>IMMOHRTAL</span>
  </div>
  <div class="anton" style="font-size:86px;line-height:.96;color:{INK};margin:34px 0 30px">DANCE WITH THE DELUSIONAL</div>
  <div style="flex:1">{rows}</div>
  <div style="display:flex;justify-content:space-between;align-items:baseline;padding-top:26px">
    <span class="serif-i" style="font-size:26px;color:rgba(20,25,34,.7)">too far gone to come back normal</span>
    <span class="mono" style="font-size:16px;color:{GREEN_TXT}">IF NOT NOW, WHEN</span>
  </div>
</div>"""

SPECS = {
    "quote-day-hands":   (1080,1080, lambda: quote_day("I'mma hold your hands if they cold.", "SESSION 001 // BAR 02")),
    "quote-day-broke":   (1080,1080, lambda: quote_day("So you know I got no plans to be broke.", "SESSION 001 // BAR 04")),
    "quote-day-pasun":   (1080,1080, lambda: quote_day("Sittin' Pennsylvania sun with some California weed.", "TRK 09 // ON MY WAY")),
    "quote-night-tatted":(1080,1080, lambda: quote_night("Got it tatted on the stomach just in case you ain't know.", "TRK 03 // 814 BLOOD")),
    # solo tracks — bars auto-transcribed, correct in ../Tracks/ before posting
    "quote-day-rain":    (1080,1080, lambda: quote_day("Never run from the rain — you can learn from depression and a ton of the pain.", "TRK 02 // PICKING UP MY NOTEPAD")),
    "quote-night-shine": (1080,1080, lambda: quote_night("They was tryna guess who I was my whole life — I promise for now that I'm gon' shine.", "TRK 04 // MY MOTHERS BABY")),
    "quote-night-dice":  (1080,1080, lambda: quote_night("The feeling that I'm feeling didn't happen overnight.", "TRK 05 // ROLL THE DICE")),
    "quote-day-ownway":  (1080,1080, lambda: quote_day("I won't feel better till I do it my own way.", "TRK 06 // MY OWN WAY")),
    "quote-day-rainydays":(1080,1080, lambda: quote_day("You was there for me on my rainy days.", "TRK 08 // GRADE A LOVE")),
    "story-814":         (1080,1920, lambda: story("814 Blood", "TRK 03", "riding through my hometown", real_meter("814 Blood"))),
    "story-onmyway":     (1080,1920, lambda: story("On My Way", "TRK 09", "sun on my face", real_meter("On My Way"))),
    "story-notepad":     (1080,1920, lambda: story("Picking Up My Notepad", "TRK 02", "never run from the rain", real_meter("Picking Up My Notepad"))),
    "story-mothersbaby": (1080,1920, lambda: story("My Mothers Baby", "TRK 04", "I promise for now that I'm gon' shine", real_meter("My Mothers Baby"))),
    "story-rollthedice": (1080,1920, lambda: story("Roll the Dice", "TRK 05", "it didn't happen overnight", real_meter("Roll the Dice"))),
    "story-myownway":    (1080,1920, lambda: story("My Own Way", "TRK 06", "I won't feel better till I do it my own way", real_meter("My Own Way"))),
    "story-gradealove":  (1080,1920, lambda: story("Grade A Love", "TRK 08", "you was there for me on my rainy days", real_meter("Grade A Love"))),
    "thumb-814":         (1280,720,  lambda: thumb("814 Blood", "OFFICIAL VISUALIZER · FT. KING KEEV", "TRK 03")),
    "thumb-onmyway":     (1280,720,  lambda: thumb("On My Way", "OFFICIAL VISUALIZER · FT. KING KEEV", "TRK 09")),
    "thumb-album":       (1280,720,  lambda: thumb("Dance with the Delusional", "FULL ALBUM · SESSION 001", "11 TRKS")),
    "endcard":           (1920,1080, endcard),
    "avatar":            (1000,1000, avatar),
    "banner-youtube":    (2560,1440, banner_youtube),
    "banner-x":          (1500,500,  banner_x),
    "og-image":          (1200,630,  og_image),
    "tracklist":         (1080,1350, tracklist),
}

def main():
    ids = sys.argv[1:] or list(SPECS)
    os.makedirs(BUILD, exist_ok=True); os.makedirs(OUT, exist_ok=True)
    from playwright.sync_api import sync_playwright
    exe = glob.glob("/opt/pw-browsers/chromium-*/chrome-linux/chrome")
    kw = {"executable_path": exe[0]} if exe else {}
    with sync_playwright() as p:
        b = p.chromium.launch(**kw)
        for aid in ids:
            w, h, builder = SPECS[aid]
            doc = f"<!doctype html><html><head><meta charset='utf-8'><style>{BASE_CSS}</style></head><body style='position:relative'>{builder()}</body></html>"
            path = os.path.join(BUILD, f"{aid}.html")
            open(path, "w").write(doc)
            pg = b.new_page(viewport={"width": w, "height": h})
            pg.goto(f"file://{path}")
            pg.wait_for_timeout(250)
            pg.screenshot(path=os.path.join(OUT, f"{aid}.png"))
            pg.close()
            print(f"rendered {aid} ({w}x{h})")
        b.close()

if __name__ == "__main__":
    main()
