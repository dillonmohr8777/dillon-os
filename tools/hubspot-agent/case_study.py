#!/usr/bin/env python3
"""
Align HCM - one-page, vendor-agnostic case study generator (template v3).

Premium single-page PDF driven by a JSON data file. Self-contained: brand assets
(Align logo + fonts) from the repo, client logo embedded from a local PNG, Chromium
renders the PDF.

Design system (v3):
  - Fixed vertical budget: HERO 288 / SIGNAL BAND 32 / BODY 672 / FOOTER 64 = 1056px.
    Every zone is fixed-height + flex-shrink:0 + overflow:hidden, so all case
    studies are pixel-identical regardless of content.
  - Big logos: both in 64px-tall white boxes with a solid orange outline.
  - "CASE STUDY" lives in the Signal Band between hero and body, never under a logo.
  - Lucide-style stroke icons in quiet tinted tiles. No glows, no HUD brackets.
  - Quote slot always renders at 80px: client quote, or the brand pull-line.
  - Rules: no vendor names, no employee counts, no em dashes (separators are middots).

    python3 case_study.py --data client.json --out /path/CaseStudy.pdf
"""
import argparse, base64, glob, html, json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
BRAND = os.path.join(HERE, "..", "align-web-system", "brand")
ALIGN_LOGO = open(os.path.join(BRAND, "logo.datauri")).read().strip()
FONTCSS = open(os.path.join(BRAND, "gf-embed.css")).read()

PULL_LINE = "We make the platform behind your people work."

# author-side character budgets (continuity guarantee)
BUDGETS = {"headline": 80, "subtitle": 170, "bullet": 42, "step": 95,
           "result": 90, "quote": 200, "blurb": 220}


def _flatten_png_bytes(b):
    """Composite any transparency onto white so the PDF embeds a plain opaque
    image (mobile viewers often mishandle PDF alpha masks)."""
    try:
        import io
        from PIL import Image
        im = Image.open(io.BytesIO(b)).convert("RGBA")
        bg = Image.new("RGB", im.size, (255, 255, 255))
        bg.paste(im, mask=im.split()[3])
        out = io.BytesIO()
        bg.save(out, "PNG")
        return out.getvalue()
    except Exception:
        return b


def datauri(path):
    b = _flatten_png_bytes(open(path, "rb").read())
    return "data:image/png;base64," + base64.b64encode(b).decode()


def _flatten_datauri(du):
    head, b64 = du.split(",", 1)
    b = _flatten_png_bytes(base64.b64decode(b64))
    return "data:image/png;base64," + base64.b64encode(b).decode()


ALIGN_LOGO = _flatten_datauri(ALIGN_LOGO)


CSS = """
 @page { size: Letter; margin: 0; }
 :root{--orange:#F05A28;--hot:#FF6B35;--navy:#17324d;--deep:#0d2740;--cream:#f4efe7;--hair:#e9e2d6;}
 *{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
 html,body{margin:0;padding:0;}
 body{font-family:'DM Sans',-apple-system,'Segoe UI',Roboto,Arial,sans-serif;color:#26313d;}
 h1,h2,h3,h4{font-family:'Plus Jakarta Sans','DM Sans',sans-serif;margin:0;}
 .page{width:816px;height:1056px;display:flex;flex-direction:column;overflow:hidden;background:#fdfbf7;}

 /* ============ HERO (288) ============ */
 .hero{flex-shrink:0;height:288px;overflow:hidden;position:relative;
   background:linear-gradient(160deg,#081c30 0%,#0d2740 55%,#17324d 100%);
   color:#fff;padding:24px 56px 16px;}
 .hero::after{content:"";position:absolute;right:-110px;top:-110px;width:380px;height:380px;
   border-radius:50%;background:radial-gradient(circle,rgba(240,90,40,.30),transparent 65%);}
 .toprow{height:64px;display:flex;justify-content:space-between;align-items:center;gap:16px;position:relative;z-index:1;}
 .logobox{height:64px;background:#fff;border:1.5px solid var(--orange);border-radius:10px;
   padding:0 18px;display:flex;align-items:center;box-shadow:0 4px 14px rgba(0,0,0,.25);}
 .logobox.align img{height:44px;display:block;}
 .logobox.client img{max-width:300px;object-fit:contain;display:block;}
 .hslot{height:72px;margin-top:16px;display:flex;align-items:flex-end;position:relative;z-index:1;}
 .hero h1{font-size:27px;line-height:34px;font-weight:800;letter-spacing:-.01em;
   display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
 .hero h1 span{color:var(--hot);}
 .sslot{height:36px;margin-top:8px;position:relative;z-index:1;}
 .hero .sub{color:#c9d6e4;font-size:13px;line-height:18px;max-width:660px;
   display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
 .tags{height:40px;display:flex;gap:10px;align-items:center;margin-top:12px;position:relative;z-index:1;}
 .tag{border-radius:999px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.06);
   padding:5px 14px;}
 .tag b{color:var(--hot);font-family:'Plus Jakarta Sans';font-weight:700;letter-spacing:.14em;
   font-size:8.5px;display:block;text-transform:uppercase;margin-bottom:1px;}
 .tag i{font-style:normal;color:#e8eef5;font-size:11px;}

 /* ============ SIGNAL BAND (32) ============ */
 .band{flex-shrink:0;height:32px;overflow:hidden;background:var(--deep);
   display:flex;align-items:center;gap:10px;padding:0 56px;position:relative;}
 .band::before{content:"";position:absolute;top:0;left:0;right:0;height:3px;
   background:linear-gradient(90deg,var(--orange),var(--hot));}
 .band .tick{width:18px;height:2px;background:var(--hot);border-radius:1px;flex:0 0 auto;}
 .band .cs{color:var(--hot);font-family:'Plus Jakarta Sans';font-weight:800;font-size:10px;
   letter-spacing:.3em;text-transform:uppercase;white-space:nowrap;}
 .band .dot{color:rgba(255,255,255,.4);font-size:10px;}
 .band .cl{color:#e8eef5;font-family:'Plus Jakarta Sans';font-weight:700;font-size:10px;
   letter-spacing:.18em;text-transform:uppercase;white-space:nowrap;}
 .band .rule{flex:1;height:1px;background:rgba(255,255,255,.16);}

 /* ============ BODY (672) ============ */
 .body{flex-shrink:0;height:672px;overflow:hidden;padding:8px 56px;}
 .sec-ch{height:160px;overflow:hidden;}
 .sec-ap{height:168px;overflow:hidden;margin-top:16px;}
 .sec-rs{height:156px;margin-top:8px;margin-left:-56px;margin-right:-56px;padding:8px 56px;
   background:var(--cream);}
 .sec-qt{height:80px;overflow:hidden;margin-top:8px;}
 .sec-ab{height:44px;overflow:hidden;margin-top:16px;}
 .shead{height:52px;}
 .seclabel{display:flex;align-items:center;gap:10px;color:var(--orange);
   font-family:'Plus Jakarta Sans';font-weight:800;font-size:10px;line-height:14px;
   letter-spacing:.2em;text-transform:uppercase;}
 .seclabel::before{content:"";width:18px;height:2px;background:var(--orange);border-radius:1px;}
 .seclabel::after{content:"";flex:1;height:1px;background:var(--hair);}
 .sech{color:var(--navy);font-size:17px;line-height:26px;font-weight:800;margin-top:4px;}
 .row3{display:flex;gap:16px;}
 .row3>*{width:224px;flex:0 0 auto;}
 .card{background:#fff;border:1px solid var(--hair);border-radius:12px;
   box-shadow:0 2px 10px rgba(93,72,40,.08),0 1px 3px rgba(93,72,40,.05);}
 /* challenge */
 .col{height:100px;padding:10px 14px;position:relative;overflow:hidden;}
 .col::before{content:"";position:absolute;top:0;left:14px;right:14px;height:3px;
   border-radius:0 0 3px 3px;background:var(--orange);}
 .col h4{color:var(--navy);font-size:11px;line-height:14px;letter-spacing:.04em;
   text-transform:uppercase;margin:2px 0 6px;}
 .col ul{margin:0;padding-left:14px;}
 .col li{font-size:10.5px;line-height:15px;color:#4b5563;margin-bottom:2px;}
 /* approach timeline */
 .steps{position:relative;margin-top:4px;height:96px;}
 .steps::before{content:"";position:absolute;top:20px;left:129px;width:206px;height:2px;background:var(--hair);}
 .steps::after{content:"";position:absolute;top:20px;left:369px;width:206px;height:2px;background:var(--hair);}
 .steps .row3{margin-top:0;}
 .step{height:96px;text-align:center;padding:8px 12px;position:relative;overflow:hidden;}
 .steps .step{background:transparent;border-color:transparent;box-shadow:none;}
 .step .num{width:26px;height:26px;border-radius:50%;background:var(--orange);color:#fff;
   font-family:'Plus Jakarta Sans';font-weight:800;font-size:12px;line-height:26px;
   margin:0 auto 5px;position:relative;z-index:1;}
 .step h4{color:var(--navy);font-size:12.5px;line-height:15px;margin-bottom:2px;}
 .step p{font-size:10px;line-height:13px;color:#5b6673;margin:0;}
 .cap{height:16px;text-align:center;color:#8a94a0;font-size:10px;line-height:16px;
   font-style:italic;margin-top:0;}
 /* results */
 .res{height:88px;padding:10px 14px;overflow:hidden;}
 .res .head{display:flex;align-items:center;gap:9px;height:28px;}
 .res .ic{width:28px;height:28px;border-radius:8px;flex:0 0 auto;
   display:flex;align-items:center;justify-content:center;
   background:rgba(240,90,40,.08);border:1px solid rgba(240,90,40,.22);color:var(--orange);}
 .res .ic svg{width:16px;height:16px;}
 .res h4{color:var(--navy);font-size:12px;line-height:15px;}
 .res p{font-size:10.5px;line-height:14px;color:#4b5563;margin:6px 0 0;}
 /* quote slot */
 .quote{height:80px;overflow:hidden;background:var(--deep);
   border-radius:12px;border-left:4px solid var(--orange);padding:11px 20px 11px 24px;
   position:relative;box-shadow:0 4px 14px rgba(13,39,64,.18);}
 .quote::before{content:"\\201C";position:absolute;top:2px;left:9px;
   font-family:'Plus Jakarta Sans';font-size:38px;font-weight:800;
   color:rgba(255,107,53,.35);line-height:1;}
 .quote p{font-family:'Plus Jakarta Sans';font-weight:500;font-style:italic;
   font-size:12.5px;line-height:17px;color:#eef3f8;margin:0;padding-left:12px;
   display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
 .quote .who{padding-left:12px;margin-top:5px;font-size:11px;line-height:14px;font-style:normal;}
 .quote .who b{color:var(--hot);font-weight:700;}
 .quote .who span{color:#9fb2c5;}
 .pull{height:80px;overflow:hidden;background:var(--cream);border:1px solid var(--hair);
   border-left:3px solid var(--orange);border-radius:12px;padding:14px 22px;
   display:flex;flex-direction:column;justify-content:center;}
 .pull p{font-family:'Plus Jakarta Sans';font-weight:600;font-style:italic;font-size:15px;
   line-height:21px;color:var(--navy);margin:0;}
 .pull .k{font-family:'Plus Jakarta Sans';font-weight:800;font-size:8.5px;letter-spacing:.22em;
   color:var(--orange);text-transform:uppercase;margin-top:5px;}
 /* about strip */
 .about{height:44px;overflow:hidden;display:flex;align-items:center;gap:14px;
   background:var(--cream);border:1px solid var(--hair);border-radius:12px;padding:0 14px;}
 .about .lb{background:#fff;border:1px solid var(--hair);border-radius:9px;padding:4px 11px;
   display:flex;align-items:center;flex:0 0 auto;box-shadow:0 1px 4px rgba(13,39,64,.06);}
 .about .lb img{height:24px;max-width:130px;object-fit:contain;display:block;}
 .about .tx{min-width:0;}
 .about .k{font-family:'Plus Jakarta Sans';font-weight:800;font-size:8.5px;letter-spacing:.18em;
   color:var(--orange);text-transform:uppercase;line-height:10px;margin-bottom:2px;}
 .about p{font-size:10px;line-height:13px;color:#4b5563;margin:0;
   display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}

 /* ============ FOOTER (64) ============ */
 .foot{flex-shrink:0;height:64px;overflow:hidden;
   background:linear-gradient(160deg,#081c30 0%,#0d2740 55%,#17324d 100%);
   border-top:1px solid rgba(255,107,53,.35);color:#cdd9e6;
   padding:0 56px;display:flex;justify-content:space-between;align-items:center;gap:16px;}
 .foot .tl{font-family:'Plus Jakarta Sans';font-weight:700;color:#fff;font-size:13px;line-height:17px;}
 .foot .tl span{color:var(--hot);}
 .foot .sm{font-size:9.5px;line-height:13px;color:#8ea1b5;margin-top:2px;}
 .foot .cta{background:linear-gradient(135deg,var(--orange),var(--hot));color:#fff;
   font-family:'Plus Jakarta Sans';font-weight:700;font-size:12px;padding:9px 18px;
   border-radius:999px;white-space:nowrap;box-shadow:0 3px 10px rgba(240,90,40,.30);}
"""

# Lucide/Feather-style stroke icons (ISC/MIT). 24-grid, stroke 2, round caps.
_SVG = ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" '
        'stroke-linecap="round" stroke-linejoin="round">{}</svg>')
ICONS = {
  "calendar-check": _SVG.format('<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="m9 16 2 2 4-4"/>'),
  "shield-check": _SVG.format('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>'),
  "users": _SVG.format('<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'),
  "trending-up": _SVG.format('<path d="M16 7h6v6"/><path d="m22 7-8.5 8.5-5-5L2 17"/>'),
  "chart-bar": _SVG.format('<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>'),
  "workflow": _SVG.format('<rect width="8" height="8" x="3" y="3" rx="2"/><path d="M7 11v4a2 2 0 0 0 2 2h4"/><rect width="8" height="8" x="13" y="13" rx="2"/>'),
  "graduation-cap": _SVG.format('<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>'),
  "target": _SVG.format('<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>'),
  "zap": _SVG.format('<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>'),
  "link": _SVG.format('<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>'),
  "settings": _SVG.format('<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>'),
  "clipboard-check": _SVG.format('<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>'),
  "rocket": _SVG.format('<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>'),
  "circle-check": _SVG.format('<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>'),
}
ALIASES = {"check": "circle-check", "gear": "settings", "chart": "chart-bar",
           "shield": "shield-check", "bolt": "zap"}


def icon(key):
    key = ALIASES.get(key, key)
    return ICONS.get(key, ICONS["circle-check"])


def warn_budget(name, text, limit, client):
    t = re.sub(r"<[^>]+>", "", text or "")
    if len(t) > limit:
        print(f"  WARN [{client}] {name} over budget: {len(t)}/{limit}: {t[:50]}...")


def render(d):
    client = d["client"]
    client_logo = datauri(d["client_logo"])
    lh = int(d.get("logo_h", 44))
    lh = max(36, min(56, lh))

    # budget checks
    warn_budget("headline", d["headline"], BUDGETS["headline"], client)
    warn_budget("subtitle", d["subtitle"], BUDGETS["subtitle"], client)
    for c in d["challenge_cols"]:
        for b in c["bullets"]:
            warn_budget("bullet", b, BUDGETS["bullet"], client)
    for s in d["steps"]:
        warn_budget("step", s["desc"], BUDGETS["step"], client)
    for r in d["results"]:
        warn_budget("result", r["desc"], BUDGETS["result"], client)
    if d.get("quote"):
        warn_budget("quote", d["quote"]["text"], BUDGETS["quote"], client)
    warn_budget("blurb", d["blurb"], BUDGETS["blurb"], client)

    tags = "".join(
        f'<div class="tag"><b>{html.escape(t["k"])}</b><i>{html.escape(t["v"])}</i></div>'
        for t in d["tags"][:3])

    cols = "".join(
        f'<div class="col card"><h4>{html.escape(c["title"])}</h4><ul>'
        + "".join(f"<li>{html.escape(b)}</li>" for b in c["bullets"][:3]) + "</ul></div>"
        for c in d["challenge_cols"][:3])

    steps = "".join(
        f'<div class="step card"><div class="num">{i+1}</div>'
        f'<h4>{html.escape(s["name"])}</h4><p>{html.escape(s["desc"])}</p></div>'
        for i, s in enumerate(d["steps"][:3]))

    results = "".join(
        f'<div class="res card"><div class="head"><div class="ic">{icon(r.get("icon","check"))}</div>'
        f'<h4>{html.escape(r["title"])}</h4></div><p>{html.escape(r["desc"])}</p></div>'
        for r in d["results"][:3])

    cap = html.escape(d.get("solution_caption", "")).replace(" . ", " &middot; ")

    if d.get("quote"):
        who = d["quote"]["who"]
        if "," in who:
            name, rest = who.split(",", 1)
            who_html = f'<b>{html.escape(name.strip())}</b><span> &middot; {html.escape(rest.strip())}</span>'
        else:
            who_html = f"<b>{html.escape(who)}</b>"
        qslot = (f'<div class="quote"><p>&ldquo;{html.escape(d["quote"]["text"])}&rdquo;</p>'
                 f'<div class="who">{who_html}</div></div>')
    else:
        qslot = (f'<div class="pull"><p>&ldquo;{PULL_LINE}&rdquo;</p>'
                 f'<div class="k">The Align HCM promise</div></div>')

    return f"""<!doctype html><html><head><meta charset="utf-8">
<style>{FONTCSS}</style><style>{CSS}</style></head><body><div class="page">

  <div class="hero">
    <div class="toprow">
      <div class="logobox align"><img src="{ALIGN_LOGO}" alt="Align HCM"></div>
      <div class="logobox client"><img style="height:{lh}px" src="{client_logo}" alt="{html.escape(client)}"></div>
    </div>
    <div class="hslot"><h1>{d['headline']}</h1></div>
    <div class="sslot"><div class="sub">{html.escape(d['subtitle'])}</div></div>
    <div class="tags">{tags}</div>
  </div>

  <div class="band">
    <div class="tick"></div><div class="cs">Case Study</div>
    <div class="dot">&middot;</div><div class="cl">{html.escape(client)}</div>
    <div class="rule"></div>
  </div>

  <div class="body">
    <div class="sec-ch"><div class="shead"><div class="seclabel">The Challenge</div>
      <div class="sech">{html.escape(d['challenge_title'])}</div></div>
      <div class="row3">{cols}</div></div>

    <div class="sec-ap"><div class="shead"><div class="seclabel">How Align HCM Helped</div>
      <div class="sech">{html.escape(d['solution_title'])}</div></div>
      <div class="steps"><div class="row3">{steps}</div></div>
      <div class="cap">{cap}</div></div>

    <div class="sec-rs"><div class="shead"><div class="seclabel">The Results</div>
      <div class="sech">{html.escape(d['results_title'])}</div></div>
      <div class="row3">{results}</div></div>

    <div class="sec-qt">{qslot}</div>

    <div class="sec-ab"><div class="about">
      <div class="lb"><img src="{client_logo}" alt="{html.escape(client)}"></div>
      <div class="tx"><div class="k">About the client</div><p>{html.escape(d['blurb'])}</p></div>
    </div></div>
  </div>

  <div class="foot">
    <div><div class="tl">Your HCM platform should work for you. <span>Not the other way around.</span></div>
    <div class="sm">Free, no-obligation assessment &nbsp;&middot;&nbsp; alignhcm.com &nbsp;&middot;&nbsp; salesteam@alignhcm.com</div></div>
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
    ap.add_argument("--html-only", action="store_true")
    a = ap.parse_args()
    d = json.load(open(a.data))
    doc = render(d)
    hp = a.out.rsplit(".", 1)[0] + ".html"
    open(hp, "w").write(doc)
    if a.html_only:
        print("wrote", hp)
        return
    subprocess.run([find_chrome(), "--headless", "--no-sandbox", "--disable-gpu",
                    "--no-pdf-header-footer", f"--print-to-pdf={a.out}", f"file://{hp}"],
                   check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print("wrote", a.out)


if __name__ == "__main__":
    main()
