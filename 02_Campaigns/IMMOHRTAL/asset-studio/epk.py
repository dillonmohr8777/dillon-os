#!/usr/bin/env python3
"""
IMMOHRTAL EPK — one-page press kit rendered to PDF (and a PNG preview)
in the day-world system. Content mirrors immohrtal-site/src/content/album.ts.

Usage:  python3 epk.py     → out/IMMOHRTAL-EPK.pdf + out/epk-preview.png
"""
import os, glob

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.abspath(os.path.join(HERE, "..", "..", "..", "immohrtal-site"))
FONTS = os.path.join(SITE, "src", "fontfiles")
PUB = os.path.join(SITE, "public")
OUT = os.path.join(HERE, "out")

INK = "#141922"; SIGNAL = "#0d6bcc"; GREEN = "#0d7a4b"

HTML = f"""<!doctype html><html><head><meta charset="utf-8"><style>
@font-face {{ font-family:'Anton'; src:url('file://{FONTS}/Anton-400.woff2') format('woff2'); }}
@font-face {{ font-family:'Instrument Serif'; font-style:italic; src:url('file://{FONTS}/InstrumentSerif-400-italic.woff2') format('woff2'); }}
@font-face {{ font-family:'Space Grotesk'; font-weight:300 700; src:url('file://{FONTS}/SpaceGrotesk.woff2') format('woff2'); }}
@font-face {{ font-family:'IBM Plex Mono'; font-weight:500; src:url('file://{FONTS}/IBMPlexMono-500.woff2') format('woff2'); }}
* {{ margin:0; padding:0; box-sizing:border-box; -webkit-print-color-adjust:exact; print-color-adjust:exact; }}
body {{ font-family:'Space Grotesk',sans-serif; color:{INK}; background:#f7f9fb; width:816px; }}
.page {{ width:816px; height:1056px; padding:52px 56px; position:relative; display:flex; flex-direction:column; }}
.mono {{ font-family:'IBM Plex Mono',monospace; font-weight:500; letter-spacing:.13em; text-transform:uppercase; }}
.anton {{ font-family:'Anton',sans-serif; text-transform:uppercase; }}
.si {{ font-family:'Instrument Serif',serif; font-style:italic; }}
hr {{ border:0; border-top:1px solid rgba(20,25,34,.2); }}
</style></head><body>
<div class="page">
  <div class="mono" style="display:flex;justify-content:space-between;font-size:10.5px;color:rgba(20,25,34,.5)">
    <span>PRESS KIT // <b style="color:{SIGNAL};font-weight:500">SESSION 001</b></span>
    <span>ERIE 42.1292 N &middot; PGH 40.4406 N</span>
  </div>

  <div style="display:flex;gap:28px;align-items:flex-end;margin-top:26px">
    <div style="flex:1">
      <div class="anton" style="font-size:64px;line-height:.95">IMMOHRTAL</div>
      <div class="si" style="font-size:19px;color:rgba(20,25,34,.72);margin-top:10px">
        Dance With The Delusional &mdash; the first IMMOHRTAL record</div>
    </div>
    <img src="file://{PUB}/cover.jpg" style="width:170px;height:170px;border:1px solid rgba(20,25,34,.25)">
  </div>

  <hr style="margin:22px 0 18px">

  <div style="display:flex;gap:30px">
    <div style="flex:1.55;font-size:12.5px;line-height:1.62">
      <p><b>IMMOHRTAL is Dillon Mohr</b> &mdash; a 28-year-old chief marketing officer
      and rapper from Erie, Pennsylvania, now in Pittsburgh. He spent years making
      other people sound bigger, sharper, and harder to ignore. Rap was always the
      thing underneath: the notebooks, the voice memos, the late-night lines.</p>
      <p style="margin-top:10px">Mac Miller is the reason he wanted to rap at all &mdash;
      <i>Faces</i> hit the house in 2014 and never left. That influence is personal,
      not a costume: permission to be honest, detailed, strange, funny, damaged,
      and still competitive.</p>
      <p style="margin-top:10px"><b><i>Dance With The Delusional</i></b> is built from two
      lives meeting in one room: the marketer who understands attention and the
      rapper who treats every verse like a sport. Both features on the record are
      <b>King Keev</b> &mdash; his best friend. No industry placements; the guy who
      was there.</p>
      <div class="si" style="font-size:17px;margin:16px 0 0;padding-left:12px;border-left:2px solid {SIGNAL}">
        &ldquo;I&rsquo;m 28 and I probably shouldn&rsquo;t be doing this.
        But if I don&rsquo;t do it now, when am I ever gonna do it?&rdquo;</div>
    </div>
    <div style="flex:1">
      <img src="file://{PUB}/artist.jpg" style="width:100%;border:1px solid rgba(20,25,34,.25)">
      <div class="mono" style="font-size:9.5px;color:rgba(20,25,34,.5);margin-top:6px">
        DILLON MOHR &middot; THE 814 SHOT</div>
    </div>
  </div>

  <hr style="margin:18px 0 14px">

  <div style="display:flex;gap:30px;flex:1">
    <div style="flex:1.55">
      <div class="mono" style="font-size:10.5px;color:{SIGNAL};margin-bottom:8px">THE RECORD &middot; 11 TRACKS</div>
      <div style="font-size:11.5px;line-height:1.9;column-count:2;column-gap:26px">
        01&ensp;No Way Out<br>02&ensp;Picking Up My Notepad<br>
        03&ensp;814 Blood <span class="si" style="color:rgba(20,25,34,.55)">ft. King Keev</span><br>
        04&ensp;My Mothers Baby<br>05&ensp;Roll the Dice<br>06&ensp;My Own Way<br>
        07&ensp;Headstone <span class="si" style="color:rgba(20,25,34,.55)">interlude</span><br>
        08&ensp;Grade A Love<br>
        09&ensp;On My Way <span class="si" style="color:rgba(20,25,34,.55)">ft. King Keev</span><br>
        10&ensp;Waitlist<br>
        11&ensp;Dance with the Delusional <span class="si" style="color:rgba(20,25,34,.55)">ft. Ted Moon</span>
      </div>
    </div>
    <div style="flex:1">
      <div class="mono" style="font-size:10.5px;color:{SIGNAL};margin-bottom:8px">FOR FANS OF</div>
      <div style="font-size:12px;line-height:1.7">Mac Miller &middot; lyric-first hip-hop &middot;
      records that are funny and damaged in the same bar</div>
      <div class="mono" style="font-size:10.5px;color:{SIGNAL};margin:14px 0 8px">THE ANGLE</div>
      <div style="font-size:12px;line-height:1.7">A CMO who markets everyone else,
      finally selling the one thing he can&rsquo;t be objective about.
      The delusion is the point.</div>
    </div>
  </div>

  <div style="border-top:1px solid rgba(20,25,34,.25);padding-top:14px;display:flex;justify-content:space-between;align-items:baseline">
    <div style="font-size:12px;line-height:1.6">
      <span class="mono" style="font-size:10px;color:rgba(20,25,34,.5)">BOOKING / PRESS&ensp;</span>
      <b>immohrtal.llc@gmail.com</b> &middot; (814) 873-5333 &middot; @immohrtal everywhere
    </div>
    <div class="mono" style="font-size:10.5px;color:{GREEN}">IF NOT NOW, WHEN</div>
  </div>
</div>
</body></html>"""

def main():
    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(HERE, "_build", "epk.html")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    open(path, "w").write(HTML)
    from playwright.sync_api import sync_playwright
    exe = glob.glob("/opt/pw-browsers/chromium-*/chrome-linux/chrome")
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path=exe[0] if exe else None)
        pg = b.new_page(viewport={"width":816,"height":1056})
        pg.goto(f"file://{path}"); pg.wait_for_timeout(400)
        pg.pdf(path=os.path.join(OUT, "IMMOHRTAL-EPK.pdf"), width="8.5in", height="11in",
               print_background=True, page_ranges="1")
        pg.screenshot(path=os.path.join(OUT, "epk-preview.png"))
        b.close()
    print("rendered IMMOHRTAL-EPK.pdf + epk-preview.png")

if __name__ == "__main__":
    main()
