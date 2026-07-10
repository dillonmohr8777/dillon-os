#!/usr/bin/env python3
"""
Align HCM - one-page, vendor-agnostic case study generator.

Premium single-page PDF driven by a JSON data file. Self-contained: brand assets
(Align logo + fonts) from the repo, client logo embedded from a local PNG, Chromium
renders the PDF.

Rules baked into usage: no vendor names, no employee counts, customer-story framing,
SmartCare/vendor-agnostic voice, no em dashes.

    python3 case_study.py --data client.json --out /path/CaseStudy.pdf
"""
import argparse, base64, glob, html, json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
BRAND = os.path.join(HERE, "..", "align-web-system", "brand")
ALIGN_LOGO = open(os.path.join(BRAND, "logo.datauri")).read().strip()
FONTCSS = open(os.path.join(BRAND, "gf-embed.css")).read()


def datauri(path):
    b = open(path, "rb").read()
    return "data:image/png;base64," + base64.b64encode(b).decode()


CSS = """
 @page { size: Letter; margin: 0; }
 :root{--orange:#F05A28;--hot:#FF6B35;--navy:#17324d;--deep:#0d2740;--ink:#111820;--warm:#f6f2ea;--line:#ecebe6;}
 *{box-sizing:border-box;}
 body{margin:0;font-family:'DM Sans',-apple-system,'Segoe UI',Roboto,Arial,sans-serif;color:#26313d;line-height:1.34;}
 h1,h2,h3,h4{font-family:'Plus Jakarta Sans','DM Sans',sans-serif;margin:0;}
 .page{width:8.5in;height:11in;display:flex;flex-direction:column;overflow:hidden;}
 /* hero */
 .hero{background:linear-gradient(135deg,#0d2740 0%,#17324d 68%,#22384f 100%);color:#fff;padding:15px 44px 22px;position:relative;overflow:hidden;}
 .hero::after{content:"";position:absolute;right:-120px;top:-120px;width:320px;height:320px;border-radius:50%;background:radial-gradient(circle,rgba(240,90,40,.45),transparent 70%);}
 .toprow{display:flex;justify-content:space-between;align-items:center;gap:16px;position:relative;z-index:1;}
 .logobox{background:#fff;border:2.5px solid var(--orange);border-radius:11px;padding:7px 12px;display:flex;align-items:center;}
 .logobox.align img{height:26px;display:block;}
 .logobox.client img{height:30px;max-width:210px;object-fit:contain;display:block;}
 .kicker{display:inline-block;background:linear-gradient(135deg,var(--orange),var(--hot));color:#fff;font-family:'Plus Jakarta Sans';font-weight:800;font-size:10px;letter-spacing:.14em;padding:4px 11px;border-radius:999px;margin:11px 0 8px;position:relative;z-index:1;}
 .hero h1{font-size:28px;line-height:1.06;font-weight:800;letter-spacing:-.01em;position:relative;z-index:1;}
 .hero h1 span{color:var(--orange);}
 .hero .sub{color:#c9d6e4;font-size:13px;max-width:640px;margin-top:8px;position:relative;z-index:1;}
 .tags{display:flex;gap:9px;flex-wrap:wrap;margin-top:11px;position:relative;z-index:1;}
 .tag{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.18);border-radius:7px;padding:5px 11px;font-size:11.5px;}
 .tag b{color:var(--hot);font-family:'Plus Jakarta Sans';font-weight:700;letter-spacing:.05em;font-size:9px;display:block;text-transform:uppercase;margin-bottom:1px;}
 .accent{height:5px;background:linear-gradient(90deg,var(--orange),var(--hot));}
 /* body */
 .body{padding:14px 44px 0;flex:1;}
 .seclabel{color:var(--orange);font-family:'Plus Jakarta Sans';font-weight:800;font-size:11px;letter-spacing:.14em;display:flex;align-items:center;gap:10px;margin-bottom:2px;}
 .seclabel::after{content:"";flex:1;height:1px;background:var(--line);}
 .sech{color:var(--navy);font-size:16px;font-weight:800;margin-bottom:8px;}
 .block{margin-bottom:9px;}
 .cols{display:flex;gap:12px;}
 .col{flex:1;background:#fbfaf7;border:1px solid var(--line);border-radius:10px;padding:10px 12px;}
 .col h4{color:var(--navy);font-size:11.5px;letter-spacing:.02em;text-transform:uppercase;margin-bottom:6px;}
 .col ul{margin:0;padding-left:14px;}
 .col li{font-size:11px;color:#4b5563;margin-bottom:2.5px;}
 /* steps */
 .steps{display:flex;align-items:stretch;gap:0;}
 .step{flex:1;text-align:center;background:#fff;border:1px solid var(--line);border-radius:10px;padding:10px 11px;}
 .step .num{width:27px;height:27px;border-radius:50%;background:linear-gradient(135deg,var(--orange),var(--hot));color:#fff;font-family:'Plus Jakarta Sans';font-weight:800;font-size:13px;line-height:27px;margin:0 auto 6px;}
 .step h4{color:var(--navy);font-size:13px;margin-bottom:3px;}
 .step p{font-size:11px;color:#5b6673;line-height:1.3;}
 .arrow{display:flex;align-items:center;color:var(--orange);font-size:18px;font-weight:800;padding:0 7px;}
 .cap{text-align:center;color:#8a94a0;font-size:11px;font-style:italic;margin-top:6px;}
 /* results */
 .results{display:flex;gap:12px;}
 .res{flex:1;background:linear-gradient(180deg,#fff,#fbfaf7);border:1px solid var(--line);border-left:4px solid var(--orange);border-radius:10px;padding:10px 12px;}
 .res .ic{width:27px;height:27px;border-radius:7px;background:linear-gradient(135deg,var(--orange),var(--hot));margin-bottom:7px;display:flex;align-items:center;justify-content:center;}
 .res .ic svg{width:16px;height:16px;fill:#fff;}
 .res h4{color:var(--navy);font-size:12.5px;margin-bottom:3px;}
 .res p{font-size:11px;color:#4b5563;line-height:1.3;}
 /* quote */
 .quote{background:var(--warm);border-left:4px solid var(--orange);border-radius:0 10px 10px 0;padding:10px 16px;margin-bottom:9px;}
 .quote p{font-size:13px;color:#2b3644;font-style:italic;font-family:'Plus Jakarta Sans';font-weight:500;line-height:1.4;}
 .quote .who{font-style:normal;font-size:11.5px;color:var(--orange);font-weight:700;margin-top:5px;}
 /* about */
  .about{display:flex;align-items:center;gap:14px;border:1px solid var(--line);border-radius:10px;padding:8px 14px;margin-bottom:8px;background:#fff;}
 .about .lb{background:#fff;border:1px solid var(--line);border-radius:7px;padding:5px 9px;display:flex;align-items:center;flex:0 0 auto;}
 .about .lb img{height:26px;max-width:140px;object-fit:contain;display:block;}
 .about p{font-size:11px;color:#5b6673;}
 /* footer */
 .foot{background:var(--deep);color:#cdd9e6;padding:13px 44px;display:flex;justify-content:space-between;align-items:center;gap:16px;margin-top:auto;}
 .foot .tl{font-family:'Plus Jakarta Sans';font-weight:700;color:#fff;font-size:13.5px;}
 .foot .tl span{color:var(--orange);}
 .foot .cta{background:linear-gradient(135deg,var(--orange),var(--hot));color:#fff;font-family:'Plus Jakarta Sans';font-weight:700;font-size:12.5px;padding:9px 16px;border-radius:999px;white-space:nowrap;}
 .foot .sm{font-size:10px;color:#8ea1b5;margin-top:3px;}
"""

ICONS = {
  "check": '<svg viewBox="0 0 24 24"><path d="M9 16.2l-3.5-3.5L4 14.2 9 19l11-11-1.4-1.4z"/></svg>',
  "gear": '<svg viewBox="0 0 24 24"><path d="M19.4 13a7.8 7.8 0 000-2l2-1.6-2-3.4-2.4 1a7.6 7.6 0 00-1.7-1l-.4-2.5H10l-.4 2.5a7.6 7.6 0 00-1.7 1l-2.4-1-2 3.4L3.6 11a7.8 7.8 0 000 2l-2 1.6 2 3.4 2.4-1c.5.4 1.1.7 1.7 1l.4 2.5h4l.4-2.5c.6-.3 1.2-.6 1.7-1l2.4 1 2-3.4zM12 15.5A3.5 3.5 0 1112 8.5a3.5 3.5 0 010 7z"/></svg>',
  "chart": '<svg viewBox="0 0 24 24"><path d="M4 20V10h4v10zm6 0V4h4v16zm6 0v-7h4v7z"/></svg>',
  "shield": '<svg viewBox="0 0 24 24"><path d="M12 2l8 3v6c0 5-3.4 9.4-8 11-4.6-1.6-8-6-8-11V5z"/></svg>',
  "bolt": '<svg viewBox="0 0 24 24"><path d="M13 2L4 14h6l-1 8 9-12h-6z"/></svg>',
  "link": '<svg viewBox="0 0 24 24"><path d="M10.6 13.4a1 1 0 001.4 0l4-4a3 3 0 10-4.2-4.2l-1 1 1.4 1.4 1-1a1 1 0 011.4 1.4l-4 4a1 1 0 000 1.4zM13.4 10.6a1 1 0 00-1.4 0l-4 4a3 3 0 104.2 4.2l1-1-1.4-1.4-1 1a1 1 0 01-1.4-1.4l4-4a1 1 0 000-1.4z"/></svg>',
}


def render(d):
    client_logo = datauri(d["client_logo"])
    tags = "".join(f'<div class="tag"><b>{html.escape(t["k"])}</b>{html.escape(t["v"])}</div>' for t in d["tags"])
    cols = "".join(
        f'<div class="col"><h4>{html.escape(c["title"])}</h4><ul>'
        + "".join(f"<li>{html.escape(b)}</li>" for b in c["bullets"]) + "</ul></div>"
        for c in d["challenge_cols"])
    steps_html = []
    for i, s in enumerate(d["steps"]):
        if i:
            steps_html.append('<div class="arrow">&rsaquo;</div>')
        steps_html.append(f'<div class="step"><div class="num">{i+1}</div><h4>{html.escape(s["name"])}</h4><p>{html.escape(s["desc"])}</p></div>')
    results = "".join(
        f'<div class="res"><div class="ic">{ICONS.get(r.get("icon","check"),ICONS["check"])}</div>'
        f'<h4>{html.escape(r["title"])}</h4><p>{html.escape(r["desc"])}</p></div>'
        for r in d["results"])
    quote = ""
    if d.get("quote"):
        quote = f'<div class="quote"><p>&ldquo;{html.escape(d["quote"]["text"])}&rdquo;</p><div class="who">{html.escape(d["quote"]["who"])}</div></div>'
    return f"""<!doctype html><html><head><meta charset="utf-8">
<style>{FONTCSS}</style><style>{CSS}</style></head><body><div class="page">
  <div class="hero">
    <div class="toprow">
      <div class="logobox align"><img src="{ALIGN_LOGO}" alt="Align HCM"></div>
      <div class="logobox client"><img src="{client_logo}" alt="{html.escape(d['client'])}"></div>
    </div>
    <span class="kicker">CASE STUDY</span>
    <h1>{d['headline']}</h1>
    <div class="sub">{html.escape(d['subtitle'])}</div>
    <div class="tags">{tags}</div>
  </div>
  <div class="accent"></div>
  <div class="body">
    <div class="block"><div class="seclabel">THE CHALLENGE</div><div class="sech">{html.escape(d['challenge_title'])}</div><div class="cols">{cols}</div></div>
    <div class="block"><div class="seclabel">HOW ALIGN HCM HELPED</div><div class="sech">{html.escape(d['solution_title'])}</div><div class="steps">{''.join(steps_html)}</div><div class="cap">{html.escape(d['solution_caption'])}</div></div>
    <div class="block"><div class="seclabel">THE RESULTS</div><div class="sech">{html.escape(d['results_title'])}</div><div class="results">{results}</div></div>
    {quote}
    <div class="about"><div class="lb"><img src="{client_logo}" alt="{html.escape(d['client'])}"></div><p>{html.escape(d['blurb'])}</p></div>
  </div>
  <div class="foot">
    <div><div class="tl">Your HCM platform should work for you. <span>Not the other way around.</span></div><div class="sm">Free, no-obligation assessment &nbsp;&middot;&nbsp; alignhcm.com &nbsp;&middot;&nbsp; salesteam@alignhcm.com</div></div>
    <div class="cta">Talk to Align HCM &rsaquo;</div>
  </div>
</div></body></html>"""


def find_chrome():
    for p in sorted(glob.glob("/opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell"), reverse=True):
        return p
    for p in ("/usr/bin/chromium", "/usr/bin/chromium-browser"):
        if os.path.exists(p):
            return p
    sys.exit("No Chromium found.")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--data", required=True)
    ap.add_argument("--out", required=True)
    a = ap.parse_args()
    d = json.load(open(a.data))
    doc = render(d)
    hp = a.out.rsplit(".", 1)[0] + ".html"
    open(hp, "w").write(doc)
    subprocess.run([find_chrome(), "--headless", "--no-sandbox", "--disable-gpu",
                    "--no-pdf-header-footer", f"--print-to-pdf={a.out}", f"file://{hp}"],
                   check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print("wrote", a.out)


if __name__ == "__main__":
    main()
