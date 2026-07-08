#!/usr/bin/env python3
"""
IMMOHRTAL story montage — real content from real photos.

Cuts through actual photos of Dillon (portrait, the 28th birthday, the
Erie/Pittsburgh collages, his daughter) with the "CMO who made a rap
album" story as kinetic type on the beat. Story plus his real face plus
his real life plus the music. Faceless to shoot, but it is content.

Usage:  python3 montage.py
Output: out/motion/montage-story.mp4  (1080x1920)
"""
import os, subprocess, tempfile, json
from motion import FFMPEG, launch, render_frames, OUT, UPLOADS, FPS

HERE = os.path.dirname(os.path.abspath(__file__))
PHOTOS = os.path.abspath(os.path.join(HERE, "..", "reference", "photos"))
SITE = os.path.abspath(os.path.join(HERE, "..", "..", "..", "immohrtal-site"))
FONTS = os.path.join(SITE, "src", "fontfiles")
W, H = 1080, 1920
DUR = 20.0
AUDIO = f"{UPLOADS}/c84a3b09-On_My_Way_ft._King_Keev.mp3"
AUDIO_START = 118.0

# (start, end, image, focus%, text)  crossfade handled in JS
SLIDES = [
    (0.0, 3.4, "portrait-bw.png", 40, "I run marketing for a living."),
    (3.4, 6.6, "holding-daughter-sign.jpeg", 32, "Built the whole respectable life."),
    (6.6, 9.8, "birthday-28-daughter.jpeg", 30, "Turned 28. Became a dad."),
    (9.8, 13.0, "lotus-erie-pittsburgh.png", 42, "Everybody said keep it safe."),
    (13.0, 16.2, "collage-814-lighthouse.jpeg", 38, "I made a rap album anyway."),
    (16.2, 20.0, "family-daughter.png", 44, "For her. If not now, when."),
]

def page():
    slides = "".join(
        f'<div class="slide" data-i="{i}" style="background-image:url(\'file://{PHOTOS}/{img}\');background-position:center {foc}%"></div>'
        for i, (s, e, img, foc, t) in enumerate(SLIDES))
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>
@font-face {{ font-family:'Anton'; src:url('file://{FONTS}/Anton-400.woff2') format('woff2'); }}
@font-face {{ font-family:'IBM Plex Mono'; font-weight:500; src:url('file://{FONTS}/IBMPlexMono-500.woff2') format('woff2'); }}
*{{margin:0;padding:0;box-sizing:border-box}} body{{overflow:hidden;background:#05070b;width:{W}px;height:{H}px;position:relative}}
.slide{{position:absolute;inset:0;background-size:cover;background-repeat:no-repeat;opacity:0;will-change:transform,opacity;filter:saturate(1.02) contrast(1.03)}}
#shade{{position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,7,11,.5) 0%,rgba(5,7,11,0) 24%,rgba(5,7,11,0) 46%,rgba(5,7,11,.74) 76%,rgba(5,7,11,.96) 100%)}}
.hud{{position:absolute;font-family:'IBM Plex Mono',monospace;font-weight:500;letter-spacing:.18em;text-transform:uppercase;font-size:22px;color:rgba(233,238,246,.72)}}
#stage{{position:absolute;left:64px;right:64px;bottom:250px}}
.line{{font-family:'Anton',sans-serif;text-transform:uppercase;letter-spacing:.01em;font-size:76px;line-height:.98;color:#f4f8fc;text-shadow:0 4px 34px rgba(0,0,0,.7)}}
.big{{font-family:'Anton',sans-serif;text-transform:uppercase;font-size:150px;line-height:.9;
  background:linear-gradient(180deg,#f5f8fc,#c3cfe0 26%,#8a9ab2 45%,#eef4fb 52%,#48566d 66%,#9db0c8 84%,#e2eaf4);
  -webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 8px 34px rgba(31,158,255,.3))}}
.grn{{font-family:'IBM Plex Mono',monospace;font-weight:500;letter-spacing:.2em;text-transform:uppercase;font-size:26px;color:#3cc98d}}
</style></head><body>
{slides}<div id="shade"></div>
<div class="hud" style="top:60px;left:64px">IMMOHRTAL</div>
<div class="hud" style="top:60px;right:64px">SESSION 001</div>
<div id="stage"></div>
<script>
const SLIDES={json.dumps(SLIDES)}, DUR={DUR};
const nodes=[...document.querySelectorAll('.slide')];
const stage=document.getElementById('stage');
const FADE=0.5;
window.renderFrame=(o)=>{{
  const t=o.t;
  let active=SLIDES.length-1;
  for(let i=0;i<SLIDES.length;i++){{ if(t>=SLIDES[i][0]&&t<SLIDES[i][1]){{active=i;break;}} }}
  nodes.forEach((n,i)=>{{
    const [s,e]=SLIDES[i];
    let op=0;
    if(t>=s-FADE && t<e){{ op = t<s ? (t-(s-FADE))/FADE : (e-t<FADE ? (e-t)/FADE : 1); }}
    op=Math.max(0,Math.min(1,op));
    n.style.opacity=op;
    const p=Math.max(0,Math.min(1,(t-s)/(e-s)));      // ken burns per slide
    n.style.transform=`scale(${{1.06+0.10*p}}) translateY(${{-p*22}}px)`;
    n.style.zIndex=i===active?2:1;
  }});
  // text: last two seconds show the finale card
  if(t>=18.2){{
    const op=Math.min(1,(t-18.2)/0.4);
    stage.innerHTML=`<div class="big" style="opacity:${{op}}">IMMOHRTAL</div><div class="grn" style="opacity:${{op}};margin-top:14px">DANCE WITH THE DELUSIONAL</div>`;
  }} else {{
    let cur=null; for(const s of SLIDES){{ if(t>=s[0]&&t<s[1]) cur=s; }}
    if(!cur){{ stage.innerHTML=''; }}
    else {{
      const age=t-cur[0]; let op=Math.min(1,age/0.3); if(cur[1]-t<0.35) op=Math.max(0,(cur[1]-t)/0.35);
      const up=(1-Math.min(1,age/0.3))*24;
      stage.innerHTML=`<div class="line" style="opacity:${{op}};transform:translateY(${{up}}px)">${{cur[4]}}</div>`;
    }}
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
        pg.goto(f"file://{path}"); pg.wait_for_timeout(500)
        render_frames(pg, n, lambda i: {"t": i / FPS}, fdir)
        cmd = [FFMPEG, "-y", "-framerate", str(FPS), "-i", os.path.join(fdir, "%05d.png"),
               "-ss", str(AUDIO_START), "-t", str(DUR), "-i", AUDIO,
               "-af", "afade=t=in:d=0.4,afade=t=out:st=18.5:d=1.5",
               "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-preset", "medium",
               "-c:a", "aac", "-b:a", "192k", "-shortest", os.path.join(OUT, "montage-story.mp4")]
        subprocess.run(cmd, check=True, capture_output=True)
    b.close(); pw.stop()
    print("rendered montage-story.mp4")

if __name__ == "__main__":
    main()
