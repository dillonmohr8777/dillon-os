#!/usr/bin/env python3
"""
IMMOHRTAL story trailer — real content, no shooting.

Uses the album cover (Dillon's face, the duality shot) as a cinematic
Ken Burns background, tells the "CMO who made a rap album" hook as
kinetic type timed to the beat, and plays a real track hook under it.
Faceless to shoot, but it is story plus his face plus the music, which
is actual content, not a waveform.

Usage:  python3 trailer.py
Output: out/motion/trailer-cmo.mp4  (1080x1920)
"""
import os, glob, subprocess, tempfile, json
from motion import FFMPEG, launch, render_frames, OUT, UPLOADS, FPS

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.abspath(os.path.join(HERE, "..", "..", "..", "immohrtal-site"))
FONTS = os.path.join(SITE, "src", "fontfiles")
COVER = os.path.join(SITE, "public", "cover.jpg")
W, H = 1080, 1920
DUR = 20.0
AUDIO = f"{UPLOADS}/c84a3b09-On_My_Way_ft._King_Keev.mp3"
AUDIO_START = 118.0

# (start, end, style, text)  style: label | line | big
BEATS = [
    (0.4, 20.0, "hud", "SESSION 001"),
    (1.1, 3.3, "line", "I run marketing for a living."),
    (3.4, 5.9, "line", "I make other people impossible to ignore."),
    (6.0, 8.5, "line", "Nobody knew I made a rap album."),
    (8.6, 10.3, "line", "I am almost 29."),
    (10.4, 12.3, "line", "Probably too late to start rapping."),
    (12.4, 14.4, "line", "Doing it anyway."),
    (14.6, 17.2, "big", "IMMOHRTAL"),
    (17.3, 19.2, "line", "Dance With The Delusional"),
    (18.6, 20.0, "green", "if not now, when"),
]

def page():
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>
@font-face {{ font-family:'Anton'; src:url('file://{FONTS}/Anton-400.woff2') format('woff2'); }}
@font-face {{ font-family:'IBM Plex Mono'; font-weight:500; src:url('file://{FONTS}/IBMPlexMono-500.woff2') format('woff2'); }}
*{{margin:0;padding:0;box-sizing:border-box}} body{{overflow:hidden;background:#000;width:{W}px;height:{H}px;position:relative}}
#cover{{position:absolute;inset:0;background:url('file://{COVER}') center 42% / cover no-repeat;will-change:transform}}
#shade{{position:absolute;inset:0;background:
  linear-gradient(180deg, rgba(8,11,17,.42) 0%, rgba(8,11,17,0) 26%, rgba(8,11,17,0) 44%, rgba(8,11,17,.72) 74%, rgba(8,11,17,.94) 100%)}}
.hud{{position:absolute;font-family:'IBM Plex Mono',monospace;font-weight:500;letter-spacing:.18em;text-transform:uppercase;font-size:22px;color:rgba(233,238,246,.7)}}
#stage{{position:absolute;left:64px;right:64px;bottom:230px}}
.line{{font-family:'Anton',sans-serif;text-transform:uppercase;letter-spacing:.01em;font-size:74px;line-height:.98;color:#f4f8fc;text-shadow:0 4px 34px rgba(0,0,0,.6)}}
.big{{font-family:'Anton',sans-serif;text-transform:uppercase;font-size:150px;line-height:.9;
  background:linear-gradient(180deg,#f5f8fc,#c3cfe0 26%,#8a9ab2 45%,#eef4fb 52%,#48566d 66%,#9db0c8 84%,#e2eaf4);
  -webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 8px 34px rgba(31,158,255,.3))}}
.green{{font-family:'IBM Plex Mono',monospace;font-weight:500;letter-spacing:.2em;text-transform:uppercase;font-size:26px;color:#3cc98d}}
</style></head><body>
<div id="cover"></div><div id="shade"></div>
<div class="hud" id="hudL" style="top:60px;left:64px">IMMOHRTAL</div>
<div class="hud" id="hudR" style="top:60px;right:64px">814 / 412</div>
<div id="stage"></div>
<script>
const BEATS={json.dumps(BEATS)};
const stage=document.getElementById('stage');
const cover=document.getElementById('cover');
window.renderFrame=(o)=>{{
  const t=o.t, p=t/{DUR};
  // Ken Burns: slow push in + drift up
  const s=1.42+0.16*p, ty=-p*44;
  cover.style.transform=`scale(${{s}}) translateY(${{ty}}px)`;
  // active text beat (last one whose window contains t)
  let cur=null;
  for(const b of BEATS){{ if(t>=b[0] && t<b[1] && b[2]!=='hud') cur=b; }}
  if(!cur){{ stage.innerHTML=''; }}
  else {{
    const [st,en,style,txt]=cur;
    const age=t-st, life=en-st;
    // fade in fast, hold, fade out near end
    let op=Math.min(1, age/0.32);
    if(en-t<0.35) op=Math.max(0,(en-t)/0.35);
    const up=(1-Math.min(1,age/0.32))*26;
    stage.innerHTML=`<div class="${{style}}" style="opacity:${{op}};transform:translateY(${{up}}px)">${{txt}}</div>`;
  }}
}};
</script></body></html>"""

def main():
    os.makedirs(OUT, exist_ok=True)
    n = int(DUR * FPS)
    pw, b = launch()
    pg = b.new_page(viewport={"width": W, "height": H})
    with tempfile.TemporaryDirectory() as fdir:
        path = os.path.join(fdir, "p.html")
        open(path, "w").write(page())
        pg.goto(f"file://{path}"); pg.wait_for_timeout(400)
        render_frames(pg, n, lambda i: {"t": i / FPS}, fdir)
        cmd = [FFMPEG, "-y", "-framerate", str(FPS), "-i", os.path.join(fdir, "%05d.png"),
               "-ss", str(AUDIO_START), "-t", str(DUR), "-i", AUDIO,
               "-af", "afade=t=in:d=0.4,afade=t=out:st=18.5:d=1.5",
               "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "17", "-preset", "medium",
               "-c:a", "aac", "-b:a", "192k", "-shortest", os.path.join(OUT, "trailer-cmo.mp4")]
        subprocess.run(cmd, check=True, capture_output=True)
    b.close(); pw.stop()
    print("rendered trailer-cmo.mp4")

if __name__ == "__main__":
    main()
