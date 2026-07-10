#!/usr/bin/env python3
"""
Align HCM - weekly website report generator.

Renders a brand-styled, 2-page-max PDF recap from a JSON data file. Self-contained:
brand assets (logo + embedded fonts) live in the repo, Chromium renders the PDF.

Usage:
    python3 weekly_report.py --data week.json --out /path/Report.pdf

week.json shape:
{
  "title": "Weekly Website Report",
  "week": "July 6-10, 2026",
  "prepared_for": "Dillon Mohr",
  "intro": "one short measured paragraph",
  "sections": [ {"label": "01", "title": "...", "bullets": ["...", "..."]}, ... ],
  "note": "closing measured line"
}

Keep it to ~5 short sections so it stays within 2 pages. No em dashes.
"""
import argparse, glob, html, json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
BRAND = os.path.join(HERE, "..", "align-web-system", "brand")
LOGO = open(os.path.join(BRAND, "logo.datauri")).read().strip()
FONTCSS = open(os.path.join(BRAND, "gf-embed.css")).read()

CSS = """
 @page { size: Letter; margin: 0; }
 :root{--orange:#F05A28;--hot:#FF6B35;--navy:#17324d;--ink:#111820;--warm:#f6f2ea;}
 *{box-sizing:border-box;}
 body{margin:0;font-family:'DM Sans',-apple-system,'Segoe UI',Roboto,Arial,sans-serif;color:#1f2937;line-height:1.5;}
 h1,h2,h3{font-family:'Plus Jakarta Sans','DM Sans',sans-serif;margin:0;}
 .page{width:8.5in;min-height:11in;padding:0 0 0.5in;}
 .band{background:linear-gradient(135deg,#0d2740 0%,#17324d 70%,#22384f 100%);color:#fff;padding:34px 54px 30px;position:relative;overflow:hidden;}
 .band::after{content:"";position:absolute;right:-90px;top:-90px;width:280px;height:280px;border-radius:50%;background:radial-gradient(circle,rgba(240,90,40,.5),transparent 70%);}
 .logobox{display:inline-block;background:#fff;border:3px solid var(--orange);border-radius:14px;padding:11px 18px;}
 .logobox img{height:34px;display:block;}
 .band h1{font-size:30px;font-weight:800;margin-top:20px;letter-spacing:-.01em;}
 .band .meta{color:#c9d6e4;font-size:14px;margin-top:6px;}
 .band .meta b{color:var(--hot);font-weight:700;}
 .wrap{padding:26px 54px 0;}
 .intro{background:var(--warm);border-left:4px solid var(--orange);border-radius:0 10px 10px 0;padding:14px 18px;font-size:14.5px;color:#33404f;margin-bottom:22px;}
 .sec{margin:0 0 18px;page-break-inside:avoid;}
 .sec .lbl{display:inline-block;color:#fff;background:linear-gradient(135deg,var(--orange),var(--hot));font-family:'Plus Jakarta Sans';font-weight:700;font-size:12px;letter-spacing:.06em;border-radius:999px;padding:3px 11px;vertical-align:middle;}
 .sec h2{display:inline-block;color:var(--navy);font-size:18px;margin-left:10px;vertical-align:middle;}
 .sec ul{margin:10px 0 0;padding:0;list-style:none;}
 .sec li{position:relative;padding-left:20px;margin:0 0 7px;font-size:14px;color:#374151;}
 .sec li::before{content:"";position:absolute;left:2px;top:8px;width:7px;height:7px;border-radius:2px;background:var(--orange);transform:rotate(45deg);}
 .note{page-break-inside:avoid;margin:22px 54px 0;padding:14px 18px;background:#0d2740;color:#cdd9e6;border-radius:10px;font-size:13.5px;}
 .note b{color:#fff;}
 .foot{margin:16px 54px 0;color:#8894a2;font-size:12px;border-top:1px solid #e6e6e6;padding-top:12px;}
 .foot b{color:var(--navy);}
"""


def render_html(d):
    secs = "".join(
        f"""<div class="sec"><span class="lbl">{html.escape(s.get('label',''))}</span>"""
        f"""<h2>{html.escape(s['title'])}</h2><ul>"""
        + "".join(f"<li>{html.escape(b)}</li>" for b in s["bullets"])
        + "</ul></div>"
        for s in d["sections"]
    )
    return f"""<!doctype html><html><head><meta charset="utf-8">
<style>{FONTCSS}</style><style>{CSS}</style></head><body><div class="page">
  <div class="band">
    <div class="logobox"><img src="{LOGO}" alt="Align HCM"></div>
    <h1>{html.escape(d.get('title','Weekly Website Report'))}</h1>
    <div class="meta">Week of <b>{html.escape(d['week'])}</b> &nbsp;&middot;&nbsp; Prepared for {html.escape(d.get('prepared_for','Dillon Mohr'))}</div>
  </div>
  <div class="wrap"><div class="intro">{html.escape(d['intro'])}</div>{secs}</div>
  <div class="note"><b>In plain terms:</b> {html.escape(d['note'])}</div>
  <div class="foot"><b>Align HCM</b> &nbsp;&middot;&nbsp; alignhcm.com &nbsp;&middot;&nbsp; Weekly website report</div>
</div></body></html>"""


def find_chrome():
    for p in sorted(glob.glob("/opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell"), reverse=True):
        return p
    for p in ("/usr/bin/chromium", "/usr/bin/chromium-browser", "/usr/bin/google-chrome"):
        if os.path.exists(p):
            return p
    sys.exit("No Chromium found for PDF rendering.")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--data", required=True)
    ap.add_argument("--out", required=True)
    a = ap.parse_args()
    d = json.load(open(a.data))
    doc = render_html(d)
    html_path = a.out.rsplit(".", 1)[0] + ".html"
    open(html_path, "w").write(doc)
    chrome = find_chrome()
    subprocess.run([chrome, "--headless", "--no-sandbox", "--disable-gpu",
                    "--no-pdf-header-footer", f"--print-to-pdf={a.out}",
                    f"file://{html_path}"], check=True,
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print("wrote", a.out)


if __name__ == "__main__":
    main()
