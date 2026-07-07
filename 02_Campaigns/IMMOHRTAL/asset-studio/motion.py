#!/usr/bin/env python3
"""
IMMOHRTAL motion studio — Spotify Canvas loops + audio-reactive lyric
clips, rendered frame-by-frame through headless Chromium and encoded
with ffmpeg (H.264). Loops are phase-locked to each track's BPM so they
cut seamlessly.

Usage:  python3 motion.py [canvas-814 canvas-onmyway canvas-album lyric-814]
Output: out/motion/<id>.mp4
"""
import os, sys, glob, json, math, subprocess, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.abspath(os.path.join(HERE, "..", "..", "..", "immohrtal-site"))
FONTS = os.path.join(SITE, "src", "fontfiles")
OUT = os.path.join(HERE, "out", "motion")
FPS = 24

import imageio_ffmpeg
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()

FONT_CSS = f"""
@font-face {{ font-family:'Anton'; src:url('file://{FONTS}/Anton-400.woff2') format('woff2'); }}
@font-face {{ font-family:'Instrument Serif'; font-style:italic; src:url('file://{FONTS}/InstrumentSerif-400-italic.woff2') format('woff2'); }}
@font-face {{ font-family:'IBM Plex Mono'; font-weight:500; src:url('file://{FONTS}/IBMPlexMono-500.woff2') format('woff2'); }}
* {{ margin:0; padding:0; box-sizing:border-box; }}
body {{ overflow:hidden; background:#10151d; }}
.mono {{ font-family:'IBM Plex Mono',monospace; font-weight:500; letter-spacing:.14em; text-transform:uppercase; }}
"""

# ── Canvas loop: seamless particle descent, pulse on the beat ────────
CANVAS_HTML = FONT_CSS_TOKEN = None
def canvas_page(trk_label, beats, beat_ms):
    T = beats * beat_ms / 1000.0
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>{FONT_CSS}
canvas {{ position:absolute; inset:0; }}
.hud {{ position:absolute; font-size:15px; color:rgba(238,246,255,.75); }}
</style></head><body>
<canvas id="c" width="720" height="1280"></canvas>
<div class="hud mono" style="top:36px;left:36px">IMMOHRTAL</div>
<div class="hud mono" style="bottom:36px;right:36px">{trk_label}</div>
<script>
const T = {T};            // loop period (s) = {beats} beats @ {beat_ms}ms
const ctx = document.getElementById('c').getContext('2d');
function mul32(a) {{ return function() {{ a|=0; a=a+0x6D2B79F5|0; var t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }} }}
const rnd = mul32(814); const P = [];
for (let i=0;i<110;i++) {{
  P.push({{ x:rnd(), y:rnd(), k:(rnd()<0.75?1:2), sway:0.008+rnd()*0.02,
           m:1+Math.floor(rnd()*3), ph:rnd()*Math.PI*2,
           r:1.2+rnd()*2.6, a:0.35+rnd()*0.5, c:rnd() }});
}}
function lerp(a,b,t) {{ return a+(b-a)*t; }}
window.renderFrame = (t) => {{
  const u = t/T;
  const g = ctx.createLinearGradient(0,0,0,1280);
  g.addColorStop(0,'#0b0f16'); g.addColorStop(0.38,'#0d2740');
  g.addColorStop(0.68,'#0e5570'); g.addColorStop(1,'#0d7a4b');
  ctx.fillStyle = g; ctx.fillRect(0,0,720,1280);
  const beat = (t*1000/{beat_ms}) % 1;
  const pulse = Math.exp(-4*beat);
  for (const p of P) {{
    const y = ((p.y + p.k*u) % 1);
    const x = p.x + p.sway*Math.sin(2*Math.PI*(p.m*u) + p.ph);
    const depth = y;
    const r = p.r*(1+0.18*pulse);
    const cr = lerp(160,60,p.c), cg = lerp(200,220,depth), cb = lerp(255,150,depth);
    ctx.beginPath();
    ctx.fillStyle = `rgba(${{cr|0}},${{cg|0}},${{cb|0}},${{p.a}})`;
    ctx.shadowColor = 'rgba(31,158,255,.8)'; ctx.shadowBlur = 12*p.a;
    ctx.arc(x*720, y*1280, r, 0, 6.2832); ctx.fill();
    ctx.shadowBlur = 0;
  }}
  const vg = ctx.createRadialGradient(360,640,320,360,640,900);
  vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(1,`rgba(0,0,0,${{0.42-0.06*pulse}})`);
  ctx.fillStyle = vg; ctx.fillRect(0,0,720,1280);
}};
</script></body></html>"""

# ── Lyric clip: night-world frame, meter driven by the real audio ────
def lyric_page(title, trk, captions_json):
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>{FONT_CSS}
body {{ width:1080px; height:1920px; position:relative;
  background: radial-gradient(130% 100% at 50% 8%, rgba(93,106,126,.16), rgba(0,0,0,0) 55%),
              radial-gradient(160% 130% at 50% 115%, rgba(0,0,0,.5), rgba(0,0,0,0) 55%), #10151d;
  color:#e9eef6; }}
.hud {{ position:absolute; font-size:21px; color:rgba(233,238,246,.55); }}
#cap {{ position:absolute; left:84px; right:84px; top:46%; transform:translateY(-50%);
  font-family:'Instrument Serif',serif; font-style:italic; font-size:76px;
  line-height:1.3; color:#eef3fa; transition:opacity .12s; }}
#title {{ position:absolute; left:84px; top:150px; font-family:'Anton',sans-serif;
  text-transform:uppercase; font-size:88px; line-height:.95;
  background:linear-gradient(180deg,#f5f8fc 0%,#c3cfe0 28%,#77879f 46%,#e8f1fb 52%,#45536a 64%,#97a8c0 82%,#dbe4f0 100%);
  -webkit-background-clip:text; background-clip:text; color:transparent; }}
#meter {{ position:absolute; left:84px; right:84px; bottom:330px; height:170px;
  display:flex; align-items:flex-end; gap:8px; }}
#meter i {{ flex:1; background:linear-gradient(180deg,#1f9eff,#17a86b); }}
#prog {{ position:absolute; left:84px; bottom:250px; height:3px; background:linear-gradient(90deg,#1f9eff,#17a86b); }}
</style></head><body>
<div class="hud mono" style="top:96px;left:84px">NOW PLAYING</div>
<div class="hud mono" style="top:96px;right:84px;color:#5cb8ff">{trk}</div>
<div id="title">{title}</div>
<div id="cap"></div>
<div id="meter"></div>
<div id="prog" style="width:0"></div>
<div class="hud mono" style="bottom:180px;left:84px">DANCE WITH THE DELUSIONAL</div>
<div class="hud mono" style="bottom:180px;right:84px;color:#3cc98d">SESSION 001</div>
<script>
const CAPS = {captions_json};
const meter = document.getElementById('meter');
const NB = 22; const bars = [];
for (let i=0;i<NB;i++) {{ const b=document.createElement('i'); meter.appendChild(b); bars.push(b); }}
window.renderFrame = (o) => {{
  const cap = CAPS.filter(c => o.t >= c.start).slice(-1)[0];
  document.getElementById('cap').textContent = cap ? '\\u201c'+cap.text+'\\u201d' : '';
  for (let i=0;i<NB;i++) {{
    const wob = 0.55 + 0.45*Math.sin(i*1.7 + o.t*5.1);
    bars[i].style.height = Math.max(4, 100*o.env*wob) + '%';
  }}
  document.getElementById('prog').style.width = (o.t/o.T*100*0.845) + '%';
}};
</script></body></html>"""

def launch():
    from playwright.sync_api import sync_playwright
    pw = sync_playwright().start()
    exe = glob.glob("/opt/pw-browsers/chromium-*/chrome-linux/chrome")
    return pw, pw.chromium.launch(executable_path=exe[0] if exe else None)

def render_frames(page, n, frame_arg, fdir):
    for i in range(n):
        page.evaluate("(a) => renderFrame(a)", frame_arg(i))
        page.screenshot(path=os.path.join(fdir, f"{i:05d}.png"))

def encode(fdir, out, audio=None, offset=None, dur=None):
    cmd = [FFMPEG, "-y", "-framerate", str(FPS), "-i", os.path.join(fdir, "%05d.png")]
    if audio: cmd += ["-ss", str(offset), "-t", str(dur), "-i", audio]
    cmd += ["-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-preset", "medium"]
    if audio: cmd += ["-c:a", "aac", "-b:a", "192k", "-shortest"]
    cmd += [out]
    subprocess.run(cmd, check=True, capture_output=True)

def make_canvas(bid, label, beats, beat_ms):
    T = beats*beat_ms/1000.0; n = round(T*FPS)
    pw, b = launch()
    pg = b.new_page(viewport={"width":720,"height":1280})
    with tempfile.TemporaryDirectory() as fdir:
        path = os.path.join(fdir, "page.html")
        open(path,"w").write(canvas_page(label, beats, beat_ms))
        pg.goto(f"file://{path}"); pg.wait_for_timeout(300)
        render_frames(pg, n, lambda i: i/FPS, fdir)
        encode(fdir, os.path.join(OUT, f"{bid}.mp4"))
    b.close(); pw.stop()
    print(f"rendered {bid}.mp4  ({T:.2f}s, {n} frames, seamless @ {beats} beats)")

def make_lyric(bid, audio, title, trk, start, dur, captions):
    import librosa, numpy as np
    y, sr = librosa.load(audio, sr=22050, mono=True, offset=start, duration=dur)
    hop = sr // FPS
    n = int(dur*FPS)
    rms = librosa.feature.rms(y=y, frame_length=hop*2, hop_length=hop)[0][:n]
    env = (rms - rms.min()) / (rms.max() - rms.min() + 1e-9)
    env = np.convolve(env, np.ones(3)/3, mode="same")  # light smoothing
    caps = [{"start": c[0]-start, "text": c[1]} for c in captions]
    pw, b = launch()
    pg = b.new_page(viewport={"width":1080,"height":1920})
    with tempfile.TemporaryDirectory() as fdir:
        path = os.path.join(fdir, "page.html")
        open(path,"w").write(lyric_page(title, trk, json.dumps(caps)))
        pg.goto(f"file://{path}"); pg.wait_for_timeout(300)
        render_frames(pg, n, lambda i: {"t": i/FPS, "T": dur, "env": float(env[min(i,len(env)-1)])}, fdir)
        encode(fdir, os.path.join(OUT, f"{bid}.mp4"), audio=audio, offset=start, dur=dur)
    b.close(); pw.stop()
    print(f"rendered {bid}.mp4  ({dur}s lyric clip w/ audio)")

UPLOADS = "/root/.claude/uploads/01754d87-4cb3-5319-996a-9d455dd46108"
A814 = f"{UPLOADS}/d23670e1-814_Blood_ft._king_Keev.mp3"

# ⚠ auto-transcribed — replace with corrected lyrics from ../Tracks/
CAPS_814 = [
    (17.0, "Got it tatted on the stomach just in case you ain't know"),
    (19.5, "crash whips, got booked for city flamethrows"),
    (21.5, "sip drank till it fell on my face"),
    (23.5, "I like to think I changed my lane"),
    (25.5, "did that shit blacked out, was the same"),
    (27.0, "face all banged up"),
]

JOBS = {
    "canvas-814":     lambda: make_canvas("canvas-814", "TRK 03", 16, 488),
    "canvas-onmyway": lambda: make_canvas("canvas-onmyway", "TRK 09", 12, 627),
    "canvas-album":   lambda: make_canvas("canvas-album", "SESSION 001", 14, 500),
    "lyric-814":      lambda: make_lyric("lyric-814", A814, "814 Blood", "TRK 03 // FT. KING KEEV",
                                         17.0, 12.0, CAPS_814),
}

if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    for jid in (sys.argv[1:] or list(JOBS)):
        JOBS[jid]()
