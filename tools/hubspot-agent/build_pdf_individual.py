#!/usr/bin/env python3
"""Build one brand-styled PDF per optimized post (batch 2)."""
import os, re, html

HERE = os.path.dirname(__file__)
OPT = os.path.join(HERE, "content", "optimized")
SCR = "/tmp/claude-0/-home-user/c58cd007-656f-5414-a35e-20c93b5c2b6f/scratchpad"
LOGO = open(os.path.join(SCR, "logo.datauri")).read().strip()
FONTCSS = open(os.path.join(SCR, "gf-embed.css")).read()

POSTS = [
    ("277394134770", "UKG Ecosystem", "The UKG Ecosystem Advantage",
     "Why open APIs &amp; partner networks protect your platform&rsquo;s value", "2,101", 7, 1, "ukg-ecosystem"),
    ("277394135777", "Workday Reporting", "Why Your Workday Reporting Strategy Is Backwards",
     "Start from the decisions, not the reports", "1,327", 6, 2, "workday-reporting"),
    ("277394451165", "Paylocity Time &amp; Attendance", "The Hidden ROI in Paylocity&rsquo;s Time &amp; Attendance",
     "It&rsquo;s not just about tracking hours", "1,300", 8, 1, "paylocity-time-attendance"),
    ("277376447190", "Retention", "The Retention Equation",
     "Why retail turnover costs more than your P&amp;L reveals", "1,338", 7, 2, "retention-equation"),
]

def body_html(pid):
    raw = open(os.path.join(OPT, f"{pid}.html")).read()
    return re.sub(r"^<h1>.*?</h1>\s*", "", raw, flags=re.S)

def counts(pid):
    h = open(os.path.join(OPT, f"{pid}.html")).read()
    internal = len(re.findall(r'href="https://www\.alignhcm\.com/blog', h))
    external = len(re.findall(r'href="https?://(?!www\.alignhcm)', h))
    contact = "alignhcm.com/contact" in h
    return internal, external, contact

CSS = """
  :root{--orange:#F05A28;--hot:#FF6B35;--navy:#17324d;--ink:#111820;--warm:#f4efe7;}
  *{box-sizing:border-box;}
  body{margin:0;font-family:'DM Sans',-apple-system,'Segoe UI',Roboto,Arial,sans-serif;color:#1c2530;line-height:1.6;}
  h1,h2,h3{font-family:'Plus Jakarta Sans','DM Sans',sans-serif;}
  .cover{height:1030px;background:linear-gradient(160deg,#0d2740 0%,#17324d 60%,#22384f 100%);color:#fff;padding:90px 70px;position:relative;overflow:hidden;}
  .cover::after{content:"";position:absolute;right:-160px;bottom:-160px;width:560px;height:560px;border-radius:50%;background:radial-gradient(circle,rgba(240,90,40,.55),transparent 70%);}
  .cover .logobox{display:inline-block;background:#fff;border:3px solid var(--orange);border-radius:16px;padding:14px 22px;margin-bottom:56px;box-shadow:0 8px 30px rgba(0,0,0,.18);}
  .cover .logobox img{height:44px;display:block;}
  .cover .kicker{color:var(--hot);font-family:'Plus Jakarta Sans';font-weight:700;letter-spacing:.16em;text-transform:uppercase;font-size:13px;}
  .cover h1{font-size:56px;line-height:1.06;font-weight:800;margin:16px 0 20px;max-width:830px;}
  .cover h1 span{color:var(--orange);}
  .cover p.sub{font-size:21px;max-width:640px;color:#c9d6e4;font-style:italic;}
  .cover .chips{margin-top:44px;display:flex;gap:12px;flex-wrap:wrap;max-width:760px;}
  .cover .chip{background:rgba(255,255,255,.08);border:1px solid rgba(240,90,40,.5);color:#fff;padding:9px 16px;border-radius:999px;font-size:14px;font-weight:500;}
  .cover .foot{position:absolute;bottom:70px;left:70px;font-size:15px;color:#9fb2c6;}
  .post{padding:56px 70px 20px;}
  .post-head{border-bottom:3px solid var(--orange);padding-bottom:20px;margin-bottom:10px;}
  .tag{display:inline-block;background:linear-gradient(135deg,var(--orange),var(--hot));color:#fff;font-family:'Plus Jakarta Sans';font-weight:700;font-size:12px;letter-spacing:.08em;text-transform:uppercase;padding:6px 14px;border-radius:999px;}
  .post-head h2{color:var(--navy);font-size:30px;margin:14px 0 10px;line-height:1.15;}
  .meta{color:#6b7684;font-size:14px;font-weight:500;}
  .added-label{color:var(--orange);font-family:'Plus Jakarta Sans';font-weight:700;font-size:13px;letter-spacing:.1em;text-transform:uppercase;margin:26px 0 14px;}
  .post h2{color:var(--navy);font-size:23px;margin-top:34px;}
  .post h3{color:var(--navy);font-size:18px;}
  .post a{color:var(--orange);text-decoration:none;border-bottom:1px solid rgba(240,90,40,.35);}
  .post p{font-size:15.5px;}
  .post .abg-faq{background:#fbf9f6;border:1px solid #efe7db;border-radius:10px;padding:16px 20px;margin:0 0 16px !important;}
  .post ul{background:#fbf9f6;border-radius:10px;padding:16px 20px 16px 40px;}
  footer.pg{padding:36px 70px 60px;color:#8894a2;font-size:13px;border-top:1px solid #eee;}
  footer.pg strong{color:var(--navy);}
"""

def build(pid, tag, title, sub, wc, il, xl, slug):
    body = body_html(pid)
    il, xl, cc = counts(pid)
    cta_chip = '<span class="chip">Contact CTA in closing</span>' if cc else ''
    cta_meta = ' + Contact CTA' if cc else ''
    doc = f"""<!doctype html><html><head><meta charset="utf-8">
<style>{FONTCSS}</style><style>{CSS}</style></head><body>
  <div class="cover">
    <div class="logobox"><img src="{LOGO}" alt="Align HCM"></div>
    <div class="kicker">AEO / GEO Optimization · Blog</div>
    <h1>{title}</h1>
    <p class="sub">{sub}</p>
    <div class="chips">
      <span class="chip">{wc} words</span>
      <span class="chip">{il} internal links</span>
      {cta_chip}
      <span class="chip">{xl} external citation(s)</span>
      <span class="chip">3 FAQ Q&amp;A</span>
      <span class="chip">Article + FAQPage schema</span>
      <span class="chip">Direct-answer opener</span>
    </div>
    <div class="foot">Align HCM · Prepared for Dillon Mohr · 2026-07-09 · Embedded live in HubSpot</div>
  </div>
  <section class="post">
    <div class="post-head">
      <span class="tag">{tag}</span>
      <h2>{title}</h2>
      <div class="meta">{wc} words &nbsp;·&nbsp; {il} internal{cta_meta} &nbsp;·&nbsp; {xl} external &nbsp;·&nbsp; 3 FAQ &nbsp;·&nbsp; BlogPosting + FAQPage schema</div>
    </div>
    <div class="added-label">What was added &amp; embedded</div>
    {body}
  </section>
  <footer class="pg">
    <p><strong>How this helps you rank &amp; get cited.</strong> The direct-answer callout gives AI answer engines (ChatGPT, Perplexity, Google AI Overviews) a clean, extractable snippet. Question headings + FAQ match how people and LLMs phrase queries. Internal links build topical authority across the HCM cluster; external citations add credibility. FAQPage + BlogPosting schema tells search and AI systems exactly what the page answers. All additions are marker-wrapped and reversible.</p>
    <p>Align HCM · alignhcm.com</p>
  </footer>
</body></html>"""
    out_html = os.path.join(SCR, f"opt-{slug}.html")
    open(out_html, "w").write(doc)
    return out_html

for p in POSTS:
    print(build(*p))
