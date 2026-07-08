#!/usr/bin/env python3
"""
IMMOHRTAL descent clips — beats-first motion that matches the site.

No lyrics. The visual is the site's world brought to life: the glowing
vertical spine you ride down, the blue to green particle descent, chrome
title, studio HUD. Everything reacts to the real audio (per-frame RMS):
the spine pulses, energy nodes fall on the beat, particles brighten and
speed up with the track.

Usage:  python3 descent.py <trackId>     (see JOBS)
Output: out/motion/descent-<id>.mp4
"""
import os, sys, glob, json, subprocess, tempfile
import imageio_ffmpeg
from motion import FFMPEG, launch, render_frames, OUT, UPLOADS, FPS

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.abspath(os.path.join(HERE, "..", "..", "..", "immohrtal-site"))
FONTS = os.path.join(SITE, "src", "fontfiles")
W, H = 1080, 1920

def page(title, trk):
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>
@font-face {{ font-family:'Anton'; src:url('file://{FONTS}/Anton-400.woff2') format('woff2'); }}
@font-face {{ font-family:'IBM Plex Mono'; font-weight:500; src:url('file://{FONTS}/IBMPlexMono-500.woff2') format('woff2'); }}
*{{margin:0;padding:0;box-sizing:border-box}} body{{overflow:hidden;background:#0b0f16}}
canvas{{position:absolute;inset:0}}
.hud{{position:absolute;font-family:'IBM Plex Mono',monospace;font-weight:500;letter-spacing:.16em;text-transform:uppercase;font-size:20px;color:rgba(233,238,246,.62)}}
#title{{position:absolute;left:60px;bottom:150px;font-family:'Anton',sans-serif;text-transform:uppercase;letter-spacing:.012em;font-size:96px;line-height:.9;max-width:9ch;
 background:linear-gradient(180deg,#f5f8fc 0%,#c3cfe0 26%,#8a9ab2 44%,#eef4fb 52%,#48566d 66%,#9db0c8 84%,#e2eaf4 100%);
 -webkit-background-clip:text;background-clip:text;color:transparent;
 filter:drop-shadow(0 6px 30px rgba(31,158,255,.25))}}
#tk{{position:absolute;left:60px;bottom:110px;font-family:'IBM Plex Mono',monospace;letter-spacing:.16em;text-transform:uppercase;font-size:22px;color:#5cb8ff}}
</style></head><body>
<canvas id="c" width="{W}" height="{H}"></canvas>
<div class="hud" style="top:56px;left:60px">IMMOHRTAL</div>
<div class="hud" style="top:56px;right:60px" id="lv">LEVELS 000%</div>
<div id="title">{title}</div>
<div id="tk">{trk} // SESSION 001</div>
<div class="hud" style="bottom:56px;right:60px;color:#3cc98d">IF NOT NOW, WHEN</div>
<script>
const W={W},H={H},cx=W/2;
const ctx=document.getElementById('c').getContext('2d');
function rng(a){{return function(){{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}}}
const rnd=rng(814);
// particle field, parallax by depth d (0 far .. 1 near)
const P=[];for(let i=0;i<150;i++){{const d=rnd();P.push({{x:rnd(),y:rnd(),d,r:0.6+d*3.2,sp:0.02+d*0.09,sw:0.004+rnd()*0.02,ph:rnd()*6.28,a:0.25+d*0.5}});}}
// energy nodes travelling down the spine, spawned on beats
const nodes=[];
let prevEnv=0;
function lerp(a,b,t){{return a+(b-a)*t}}
function mix(c1,c2,t){{return[Math.round(lerp(c1[0],c2[0],t)),Math.round(lerp(c1[1],c2[1],t)),Math.round(lerp(c1[2],c2[2],t))]}}
const BLUE=[31,158,255],GREEN=[23,168,107],WHITE=[224,238,255];
window.renderFrame=(o)=>{{
  const t=o.t, e=o.env, u=t*0.06;
  // background descent gradient (ink -> blue -> teal -> green), subtly breathing
  const g=ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,'#0a0e15');
  g.addColorStop(0.34,`rgb(${{12+e*10}},${{34+e*22}},${{58+e*30}})`);
  g.addColorStop(0.64,`rgb(${{12+e*8}},${{92+e*30}},${{110+e*30}})`);
  g.addColorStop(1,`rgb(${{12+e*6}},${{110+e*30}},${{74+e*20}})`);
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);

  // THE SPINE: a soft vertical light column with a reactive core
  const spineW=6+e*10;
  const sg=ctx.createLinearGradient(cx-60,0,cx+60,0);
  sg.addColorStop(0,'rgba(31,158,255,0)');
  sg.addColorStop(0.5,`rgba(150,200,255,${{0.10+e*0.28}})`);
  sg.addColorStop(1,'rgba(31,158,255,0)');
  ctx.fillStyle=sg;ctx.fillRect(cx-70,0,140,H);
  ctx.fillStyle=`rgba(224,238,255,${{0.35+e*0.5}})`;
  ctx.fillRect(cx-spineW/2,0,spineW,H);

  // spawn a node on an energy rise (beat), travelling downward
  if(e-prevEnv>0.12){{nodes.push({{y:-40,v:9+e*22,r:10+e*26}});}}
  prevEnv=e;
  for(let i=nodes.length-1;i>=0;i--){{const n=nodes[i];n.y+=n.v;
    const col=mix(WHITE,GREEN,Math.min(1,n.y/H));
    const gr=ctx.createRadialGradient(cx,n.y,0,cx,n.y,n.r*2.4);
    gr.addColorStop(0,`rgba(${{col[0]}},${{col[1]}},${{col[2]}},0.9)`);
    gr.addColorStop(1,'rgba(31,158,255,0)');
    ctx.fillStyle=gr;ctx.beginPath();ctx.arc(cx,n.y,n.r*2.4,0,6.2832);ctx.fill();
    if(n.y>H+60)nodes.splice(i,1);}}

  // particle descent, parallax, brighten + speed with energy
  for(const p of P){{
    const y=((p.y + (p.sp*(0.5+e))*u*10) % 1);
    const x=p.x + p.sw*Math.sin(u*2*p.d*6.28 + p.ph) + (p.x-0.5)*0.04;
    const depth=y;const col=mix(BLUE,GREEN,depth);
    const r=p.r*(1+0.25*e);
    ctx.beginPath();
    ctx.fillStyle=`rgba(${{col[0]}},${{col[1]}},${{col[2]}},${{p.a*(0.55+0.6*e)}})`;
    ctx.shadowColor='rgba(120,190,255,.9)';ctx.shadowBlur=(6+p.d*14)*(0.5+e);
    ctx.arc(x*W,y*H,r,0,6.2832);ctx.fill();ctx.shadowBlur=0;
  }}

  // central bloom pulse on the beat
  const bg=ctx.createRadialGradient(cx,H*0.5,0,cx,H*0.5,520);
  bg.addColorStop(0,`rgba(120,190,255,${{0.05+e*0.14}})`);
  bg.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);

  // cinematic vignette + fine grain
  const vg=ctx.createRadialGradient(cx,H*0.46,360,cx,H*0.5,H*0.72);
  vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,`rgba(0,0,0,${{0.5-e*0.06}})`);
  ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);

  document.getElementById('lv').textContent='LEVELS '+String(Math.round(e*100)).padStart(3,'0')+'%';
}};
</script></body></html>"""

def make(bid, audio, title, trk, start, dur):
    import librosa, numpy as np
    y, sr = librosa.load(audio, sr=22050, mono=True, offset=start, duration=dur)
    hop = sr // FPS
    n = int(dur * FPS)
    rms = librosa.feature.rms(y=y, frame_length=hop*2, hop_length=hop)[0][:n]
    env = (rms - rms.min()) / (rms.max() - rms.min() + 1e-9)
    env = np.clip(np.convolve(env, np.ones(2)/2, mode="same"), 0, 1)
    pw, b = launch()
    pg = b.new_page(viewport={"width": W, "height": H})
    with tempfile.TemporaryDirectory() as fdir:
        path = os.path.join(fdir, "p.html")
        open(path, "w").write(page(title, trk))
        pg.goto(f"file://{path}"); pg.wait_for_timeout(300)
        render_frames(pg, n, lambda i: {"t": i/FPS, "env": float(env[min(i, len(env)-1)])}, fdir)
        cmd = [FFMPEG, "-y", "-framerate", str(FPS), "-i", os.path.join(fdir, "%05d.png"),
               "-ss", str(start), "-t", str(dur), "-i", audio,
               "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-preset", "medium",
               "-c:a", "aac", "-b:a", "192k", "-shortest", os.path.join(OUT, f"descent-{bid}.mp4")]
        subprocess.run(cmd, check=True, capture_output=True)
    b.close(); pw.stop()
    print(f"rendered descent-{bid}.mp4 ({dur}s, beats-first, no lyrics)")

U = UPLOADS
JOBS = {
    "onmyway": lambda: make("onmyway", f"{U}/c84a3b09-On_My_Way_ft._King_Keev.mp3", "On My Way", "TRK 09", 118, 20),
    "814":     lambda: make("814", f"{U}/d23670e1-814_Blood_ft._king_Keev.mp3", "814 Blood", "TRK 03", 25, 20),
    "notepad": lambda: make("notepad", f"{U}/b07846c9-Picking_Up_My_Notepad.mp3", "Picking Up My Notepad", "TRK 02", 105, 20),
    "mothersbaby": lambda: make("mothersbaby", f"{U}/cd64d468-My_Mothers_Baby.wav", "My Mothers Baby", "TRK 04", 45, 20),
    "rollthedice": lambda: make("rollthedice", f"{U}/79d1f138-Roll_the_Dice.mp3", "Roll the Dice", "TRK 05", 50, 20),
    "myownway": lambda: make("myownway", f"{U}/e7ac92cc-My_Own_Way.mp3", "My Own Way", "TRK 06", 60, 20),
    "gradealove": lambda: make("gradealove", f"{U}/cc31a42f-Grade_A_Love.mp3", "Grade A Love", "TRK 08", 42, 20),
}

if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    for j in (sys.argv[1:] or ["onmyway"]):
        JOBS[j]()
