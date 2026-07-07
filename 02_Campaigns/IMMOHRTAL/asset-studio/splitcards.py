#!/usr/bin/env python3
"""
IMMOHRTAL Split Series — one session-log card per track (1080×1350).
The card is literally split between the two brand worlds:
  DAY (paper)   — the ledger: title + the track's real data (BPM/key/run)
  THE THREAD    — signal-blue rule, the only color both worlds share
  NIGHT (ink)   — the track's ACTUAL waveform as artwork, with a giant
                  chrome track numeral behind it. Deeper track number =
                  deeper on the blue→green descent.

Usage:  python3 splitcards.py            # all tracks with waveform data
Output: out/split/split-<trk>.png
"""
import os, glob, json, html as H

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.abspath(os.path.join(HERE, "..", "..", "..", "immohrtal-site"))
FONTS = os.path.join(SITE, "src", "fontfiles")
OUT = os.path.join(HERE, "out", "split")
BUILD = os.path.join(HERE, "_build")

ANALYSIS = json.load(open(os.path.join(HERE, "data", "analysis.json")))
WAVES = json.load(open(os.path.join(HERE, "data", "waveforms.json")))

TRACKS = [
    # (waveform key, analysis key, trk, title, feature)
    ("Picking Up My Notepad", "Picking Up My Notepad", "02", "Picking Up My Notepad", None),
    ("My Mothers Baby", "My Mothers Baby", "04", "My Mothers Baby", None),
    ("Roll the Dice", "Roll the Dice", "05", "Roll the Dice", None),
    ("My Own Way", "My Own Way", "06", "My Own Way", None),
    ("Grade A Love", "Grade A Love", "08", "Grade A Love", None),
]

def lerp_hex(a, b, t):
    a = [int(a[i:i+2],16) for i in (1,3,5)]; b = [int(b[i:i+2],16) for i in (1,3,5)]
    return "#" + "".join(f"{round(a[i]+(b[i]-a[i])*t):02x}" for i in range(3))

def card(trk, title, feature, meta, wave):
    depth = (int(trk)-1)/10.0
    c_hi = lerp_hex("#1f9eff", "#17a86b", max(0.0, depth-0.18))
    c_lo = lerp_hex("#1f9eff", "#17a86b", min(1.0, depth+0.18))
    feat = f'<span style="color:#0d6bcc">&ensp;//&ensp;{feature}</span>' if feature else ""
    data = (f"BPM {round(meta['bpm']):03d} &nbsp;&middot;&nbsp; KEY {meta['tonal_center']}"
            f" &nbsp;&middot;&nbsp; RUN {meta['duration']} &nbsp;&middot;&nbsp; REC 814/412")
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>
@font-face {{ font-family:'Anton'; src:url('file://{FONTS}/Anton-400.woff2') format('woff2'); }}
@font-face {{ font-family:'Instrument Serif'; font-style:italic; src:url('file://{FONTS}/InstrumentSerif-400-italic.woff2') format('woff2'); }}
@font-face {{ font-family:'Space Grotesk'; font-weight:300 700; src:url('file://{FONTS}/SpaceGrotesk.woff2') format('woff2'); }}
@font-face {{ font-family:'IBM Plex Mono'; font-weight:500; src:url('file://{FONTS}/IBMPlexMono-500.woff2') format('woff2'); }}
* {{ margin:0; padding:0; box-sizing:border-box; }}
body {{ width:1080px; height:1350px; overflow:hidden; font-family:'Space Grotesk'; }}
.mono {{ font-family:'IBM Plex Mono',monospace; font-weight:500; letter-spacing:.14em; text-transform:uppercase; }}
.anton {{ font-family:'Anton',sans-serif; text-transform:uppercase; letter-spacing:.012em; }}
.day {{ height:470px; background:linear-gradient(180deg,#ffffff, #f0f4f8 90%, #e8edf3); color:#141922;
  padding:64px 72px 0; position:relative; }}
.thread {{ height:6px; background:linear-gradient(90deg,#1f9eff,{lerp_hex("#1f9eff","#17a86b",depth)}); }}
.night {{ height:874px; background:
  radial-gradient(140% 120% at 50% 118%, rgba(0,0,0,.55), rgba(0,0,0,0) 60%), #10151d;
  position:relative; color:#e9eef6; }}
</style></head><body>
<div class="day">
  <div class="mono" style="display:flex;justify-content:space-between;font-size:19px;color:rgba(20,25,34,.5)">
    <span>SESSION LOG // <b style="color:#0d6bcc;font-weight:500">TRK {trk}</b></span>
    <span>IMMOHRTAL</span>
  </div>
  <div class="anton" style="font-size:104px;line-height:.95;margin-top:44px;max-width:12ch">{H.escape(title)}</div>
  <div class="mono" style="position:absolute;left:72px;right:72px;bottom:40px;display:flex;justify-content:space-between;
    border-top:1px solid rgba(20,25,34,.2);padding-top:20px;font-size:17px;color:rgba(20,25,34,.62)">
    <span>{data}</span><span>{feat if feature else 'SOLO'}</span>
  </div>
</div>
<div class="thread"></div>
<div class="night">
  <div class="anton" style="position:absolute;right:24px;top:40px;font-size:560px;line-height:1;
    background:linear-gradient(180deg,#f5f8fc,#77879f 45%,#e8f1fb 52%,#45536a 70%,#97a8c0);
    -webkit-background-clip:text;background-clip:text;color:transparent;opacity:.13">{trk}</div>
  <canvas id="w" width="1080" height="874" style="position:absolute;inset:0"></canvas>
  <div class="mono" style="position:absolute;left:72px;top:56px;font-size:17px;color:rgba(233,238,246,.55)">
    WAVEFORM &middot; FULL RUN</div>
  <div class="mono" style="position:absolute;right:72px;top:56px;font-size:17px;color:{c_hi}">
    DEPTH {trk}/11</div>
  <div class="mono" style="position:absolute;left:72px;bottom:56px;font-size:17px;color:rgba(233,238,246,.55)">
    DANCE WITH THE DELUSIONAL</div>
  <div class="mono" style="position:absolute;right:72px;bottom:56px;font-size:17px;color:#3cc98d">
    IF NOT NOW, WHEN</div>
</div>
<script>
const W = {json.dumps(wave)};
const ctx = document.getElementById('w').getContext('2d');
const n = W.length, x0 = 72, x1 = 1008, cy = 437, maxh = 300;
const bw = (x1-x0)/n;
const g = ctx.createLinearGradient(0, cy-maxh, 0, cy+maxh);
g.addColorStop(0, '{c_hi}'); g.addColorStop(1, '{c_lo}');
ctx.fillStyle = g;
for (let i=0;i<n;i++) {{
  const h = Math.max(4, W[i]*maxh);
  ctx.globalAlpha = 0.55 + 0.45*W[i];
  ctx.fillRect(x0 + i*bw, cy - h, bw*0.62, h*2);
}}
ctx.globalAlpha = 0.35;
ctx.fillStyle = '#e9eef6';
ctx.fillRect(x0, cy-0.5, x1-x0, 1);
</script>
</body></html>"""

def main():
    os.makedirs(OUT, exist_ok=True); os.makedirs(BUILD, exist_ok=True)
    from playwright.sync_api import sync_playwright
    exe = glob.glob("/opt/pw-browsers/chromium-*/chrome-linux/chrome")
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path=exe[0] if exe else None)
        for wkey, akey, trk, title, feat in TRACKS:
            doc = card(trk, title, feat, ANALYSIS[akey], WAVES[wkey])
            path = os.path.join(BUILD, f"split-{trk}.html")
            open(path, "w").write(doc)
            pg = b.new_page(viewport={"width":1080,"height":1350})
            pg.goto(f"file://{path}"); pg.wait_for_timeout(300)
            pg.screenshot(path=os.path.join(OUT, f"split-{trk}.png"))
            pg.close()
            print(f"rendered split-{trk} ({title})")
        b.close()

if __name__ == "__main__":
    main()
