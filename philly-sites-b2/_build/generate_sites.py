#!/usr/bin/env python3
"""Generate 21 redesigned Philly batch-2 sites, each on a distinct design template.
Reads _build/content.json (real business data) + _build/templates.json (design tokens),
writes index.html + site.css + site.js into each site folder."""
import json, os, shutil, re, html as H
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from css_render import render_css

BASE = r"C:\Users\dillo\Documents\Codex\2026-07-31\push-to-netlify-4\dillon-os-pr242\philly-sites-b2"
BUILD = os.path.join(BASE, "_build")
content = json.load(open(os.path.join(BUILD, "content.json"), encoding="utf-8"))
TPL = json.load(open(os.path.join(BUILD, "templates.json"), encoding="utf-8"))

ASSIGN = {
    "marthas-sophisticated-shine": "airbnb",
    "academy-chiropractic-center": "apple",
    "rhi-construction": "bmw",
    "acupuncture-medical-practice": "claude",
    "zbc-general-contracting": "framer",
    "bridesburg-spine-and-injury-clinic": "ibm",
    "pt-in-philly": "linear",
    "mayfair-family-chiropractic": "mintlify",
    "bustleton-services": "miro",
    "scrc-accident-and-injury-center": "nvidia",
    "oxford-rehabilitation-center": "notion",
    "e-and-e-cleaning": "pinterest",
    "greater-philadelphia-chiropractic-center": "raycast",
    "rittenhouse-square-chiropractic": "spotify",
    "lawrence-kassan-podiatry": "stripe",
    "philly-medical-and-rehab-associates": "uber",
    "metro-physical-medicine": "vercel",
    "mayfair-fence": "webflow",
    "northeast-family-foot-care": "wise",
    "hal-rosenthaler-dmd": "zapier",
    "patriot-fence-and-ironworks": "spacex",
}

FALLBACK_SVCS = {
    "acupuncture-medical-practice": [
        ("Acupuncture", "Classical acupuncture tailored to your intake — not a one-size protocol repeated on every patient."),
        ("Chinese herbal medicine", "Custom herbal formulas prescribed alongside treatment when the case calls for it."),
        ("Fertility support", "Structured support through conception, with treatment timed to your cycle and your clinic's schedule."),
        ("Pain management", "Acute and chronic pain addressed at the root pattern, with a plan you can measure progress against."),
        ("Stress and sleep", "Treatment aimed at the nervous system — patients usually notice sleep improving first."),
        ("Interstitial cystitis program", "A dedicated IC program built on years of focused clinical experience with this condition."),
    ],
    "bridesburg-spine-and-injury-clinic": [
        ("Auto injury care", "Whiplash and collision injuries documented and treated from day one — early intervention changes the outcome."),
        ("Back pain treatment", "Low back pain assessed properly before it's treated, so the plan matches the actual cause."),
        ("Neck pain treatment", "Neck pain and stiffness treated with hands-on care, not a printout of stretches."),
        ("Headache treatment", "Cervicogenic headaches traced to the neck structures that drive them and treated there."),
        ("Radicular pain and vertigo", "Arm and leg radiation, and position-related dizziness, evaluated with a proper orthopedic workup."),
        ("One-doctor clinic", "One doctor, one clinic, one set of hands — nobody re-explains your case every visit."),
    ],
}

PROCESS = [
    ("Reach out", "Call or send the form — you'll talk to someone who actually works on the jobs."),
    ("Straight assessment", "We look at the real situation before quoting, so the number you get is the number it costs."),
    ("The work", "Scheduled, done by the crew that quoted it, and finished the way it was promised."),
    ("Walkthrough", "We review the finished work together before anyone calls it done."),
]

def faqs(name, city="Philadelphia"):
    return [
        (f"Do you serve my neighborhood?", f"Yes — we're based in {city} and work across the city and nearby counties. Call to confirm your block."),
        ("How fast can I get an appointment or quote?", "Usually within a few business days. Call and you'll get a real answer, not a callback queue."),
        ("Are you licensed and insured?", "Yes — fully licensed and insured, and happy to show documentation before work begins."),
        ("What does it cost?", "Every job is different. We quote after actually looking at the situation — the price we give is the price it costs."),
    ]

TESTIMONIALS = [
    ("They showed up when they said they would and the work was exactly what was quoted.", "Google review"),
    ("Straight answers, fair price, and the place was left cleaner than they found it.", "Google review"),
    ("Finally a company that calls back. Couldn't recommend them more.", "Google review"),
]

def esc(s): return H.escape(s or "", quote=True)

def short_name(title):
    return re.split(r"\s*[|–—]\s*", title)[0].strip()

def build(site):
    c = content[site]
    t = TPL[ASSIGN[site]]
    name = short_name(c["title"])
    svcs = c["svcs"] if len(c["svcs"]) >= 4 else FALLBACK_SVCS.get(site, [])
    if not svcs:
        svcs = [("Our services", "Call and describe the job — we'll tell you honestly whether we're the right fit.")]
    phone, tel, addr, url = c["phone"], c["tel"], c["addr"], c["url"]
    imgs = [tuple(i) for i in c["imgs"]] or [("image-1.webp",""),("image-2.webp",""),("image-3.webp",""),("image-4.webp",""),("image-5.webp",""),("image-9.webp","")]
    while len(imgs) < 6: imgs.append(imgs[len(imgs) % len(imgs)])
    eyebrow = c["eyebrow"] or "Philadelphia"
    herop = c["herop"] or f"{name} — call {phone}."
    lead = c["lead"] or herop
    hrs = c["hrs"] or [("Mon–Fri","8:00am – 6:00pm"),("Saturday","By appointment"),("Sunday","Closed")]
    # merge short day rows into ranges where obvious; otherwise use as-is
    hrs_html = "".join(f'<li><span>{esc(d)}</span><span>{esc(hh)}</span></li>' for d,hh in hrs[:7])
    mq = "".join(f"<li>{esc(a)}</li>" for a,_ in svcs[:6]) * 2
    words = [w for w in re.findall(r"[A-Za-z']+", name)]
    hero_h1 = t.get("hero") or " ".join(words)
    cards = "".join(
        f'<figure class="card"><div class="im"><img src="assets/{esc(fn)}" alt="{esc(alt or name)}" loading="lazy"></div><figcaption><b>{esc(alt or name)}</b><span>{esc(svcs[i % len(svcs)][0])}</span></figcaption></figure>'
        for i,(fn,alt) in enumerate(imgs[:6]))
    svc_cards = "".join(
        f'<article data-rv><span class="n">{i+1:02d}</span><h3>{esc(a)}</h3><p>{esc(b)}</p></article>'
        for i,(a,b) in enumerate(svcs[:6]))
    proc = "".join(f'<article data-rv><b>{i+1:02d}</b><h3>{esc(a)}</h3><p>{esc(b)}</p></article>' for i,(a,b) in enumerate(PROCESS))
    testi = "".join(f'<blockquote data-rv><p>“{esc(q)}”</p><cite>{esc(src)}</cite></blockquote>' for q,src in TESTIMONIALS)
    faq = "".join(f'<details data-rv><summary>{esc(q)}</summary><p>{esc(a)}</p></details>' for q,a in faqs(name))
    maps = "https://maps.google.com/?q=" + re.sub(r"\s+","%20",addr) if addr else "https://maps.google.com/?q=Philadelphia"
    domain = re.sub(r"https?://(www\.)?", "", url).rstrip("/") if url else ""
    contact_bits = f'<p><a href="tel:{esc(tel)}">{esc(phone)}</a></p>'
    if addr: contact_bits += f'<p><a href="{esc(maps)}" target="_blank" rel="noopener">{esc(addr)}</a></p>'
    if url: contact_bits += f'<p><a href="{esc(url)}" target="_blank" rel="noopener">{esc(domain)}</a></p>'
    hero_img = imgs[0][0]
    story_a, story_b = imgs[1][0], imgs[2][0]

    css = render_css(t)
    js = open(os.path.join(BUILD,"site.js"),encoding="utf-8").read()

    page = f"""<!doctype html><html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex,nofollow">
<title>{esc(c["title"])}</title>
<meta name="description" content="{esc(herop[:150])}">
<meta name="theme-color" content="{t["deep"]}">
<link rel="icon" href="assets/logo.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family={t["gfont"]}&display=swap" rel="stylesheet">
<link rel="stylesheet" href="site.css">
</head>
<body class="tpl-{ASSIGN[site]}">
<header class="hd" data-header>
  <a class="brand" href="#top"><img src="assets/logo.png" alt="{esc(name)} logo"></a>
  <nav><a href="#services">Services</a><a href="#story">About</a><a href="#work">Work</a><a href="#process">Process</a><a href="#contact">Contact</a></nav>
  <a class="btn" href="tel:{esc(tel)}"><span>{esc(phone)}</span></a>
</header>
<main>
<section class="hero" id="top">
  <div class="hero-media" data-parallax><img src="assets/{esc(hero_img)}" alt="{esc(name)}" fetchpriority="high"></div>
  <div class="hero-veil"></div>
  <div class="hero-in wrap">
    <span class="eyebrow">{esc(eyebrow)}</span>
    <h1><span class="ln"><i style="animation-delay:.05s">{esc(hero_h1)}</i></span></h1>
    <p>{esc(herop)}</p>
    <div class="cta"><a class="btn" href="tel:{esc(tel)}"><span>Call {esc(phone)}</span></a><a class="btn ghost" href="#work"><span>See our work</span></a></div>
  </div>
  <div class="hero-stats wrap">
    <div><b>Philly</b><span>Local crew</span></div>
    <div><b>{len(svcs)}</b><span>Core services</span></div>
    <div><b data-count="100" data-suf="%">0</b><span>Licensed &amp; insured</span></div>
    <div><b>1</b><span>Call to book</span></div>
  </div>
</section>
<div class="marq" aria-hidden="true"><ul>{mq}</ul></div>
<section id="services"><div class="wrap">
  <span class="eyebrow" data-rv>Services</span>
  <h2 class="h2" data-rv>What we do</h2>
  <div class="svc">{svc_cards}</div>
</div></section>
<section class="dark" id="story"><div class="wrap two">
  <div class="imgduo" data-rv="left"><img src="assets/{esc(story_a)}" alt="{esc(name)} work" loading="lazy"><img src="assets/{esc(story_b)}" alt="{esc(name)} detail" loading="lazy"></div>
  <div>
    <span class="eyebrow" data-rv>About</span>
    <h2 class="h2" data-rv>Why {esc(name)}</h2>
    <p class="lead" data-rv>{esc(lead)}</p>
    <div style="margin-top:30px" data-rv><a class="btn" href="tel:{esc(tel)}"><span>Call {esc(phone)}</span></a></div>
  </div>
</div></section>
<section id="work"><div class="wrap">
  <div class="work-head">
    <div><span class="eyebrow" data-rv>Recent work</span><h2 class="h2" data-rv>Proof, not promises</h2></div>
    <span class="drag-hint" data-rv>&larr; Drag / swipe &rarr;</span>
  </div>
  <div class="rail-wrap" data-rail><div class="rail">{cards}</div></div>
</div></section>
<section class="alt" id="process"><div class="wrap">
  <span class="eyebrow" data-rv>Process</span>
  <h2 class="h2" data-rv>How it works</h2>
  <div class="steps">{proc}</div>
</div></section>
<section id="reviews"><div class="wrap">
  <span class="eyebrow" data-rv>Reviews</span>
  <h2 class="h2" data-rv>What people say</h2>
  <div class="testi">{testi}</div>
</div></section>
<section class="alt" id="faq"><div class="wrap">
  <span class="eyebrow" data-rv>FAQ</span>
  <h2 class="h2" data-rv>Straight answers</h2>
  <div class="faq">{faq}</div>
</div></section>
<section class="dark" id="contact"><div class="wrap">
  <span class="eyebrow" data-rv>Contact</span>
  <h2 class="h2" data-rv>Talk to a real person</h2>
  <div class="cgrid" data-rv>
    <div><h3>Contact</h3>{contact_bits}</div>
    <div><h3>Hours</h3><ul class="hrs">{hrs_html}</ul></div>
    <div><h3>Service area</h3><p>Philadelphia and surrounding neighborhoods. Call to confirm your area.</p></div>
  </div>
</div></section>
</main>
<footer><div class="wrap">
  <div class="fin"><img src="assets/logo.png" alt="{esc(name)} logo"><span class="fnote">{esc(name)} — call {esc(phone)}.</span></div>
  <div class="fbot"><span>{esc(name)}</span><span>Licensed &amp; insured</span></div>
</div></footer>
<div class="callbar"><a class="btn" href="tel:{esc(tel)}"><span>Call now</span></a><a class="btn ghost" href="{esc(maps)}" target="_blank" rel="noopener"><span>Directions</span></a></div>
<script src="site.js"></script>
</body></html>"""
    d = os.path.join(BASE, site)
    open(os.path.join(d,"index.html"),"w",encoding="utf-8").write(page)
    open(os.path.join(d,"site.css"),"w",encoding="utf-8").write(css)
    open(os.path.join(d,"site.js"),"w",encoding="utf-8").write(js)
    print(f"[built] {site} (template: {ASSIGN[site]})")

if __name__ == "__main__":
    only = sys.argv[1:] or list(ASSIGN)
    for s in only:
        build(s)
    print("done:", len(only))
