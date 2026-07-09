#!/usr/bin/env python3
"""Assemble a brand-styled PDF preview of the 5 optimized posts."""
import os, re, html

HERE = os.path.dirname(__file__)
OPT = os.path.join(HERE, "content", "optimized")
SCR = "/tmp/claude-0/-home-user/c58cd007-656f-5414-a35e-20c93b5c2b6f/scratchpad"
LOGO = open(os.path.join(SCR, "logo.datauri")).read().strip()

ORDER = [
    ("273813902025", "UKG Rapid Hire", "When Speed Meets Strategy: UKG Rapid Hire", "2,027", 6, 1),
    ("277255570131", "HCM Implementation", "5 Critical Mistakes to Avoid During HCM Implementation", "1,933", 7, 1),
    ("268085670586", "Manufacturing", "Beyond Timekeeping: Manufacturing Workforce Intelligence", "1,923", 6, 2),
    ("277414866667", "UKG AI", "UKG's Approach to AI: Human-Centered Automation", "1,791", 6, 1),
    ("268058974957", "Talent Mobility", "Beyond Hiring: The Case for Internal Talent Mobility", "1,782", 7, 1),
]

def body_html(pid):
    raw = open(os.path.join(OPT, f"{pid}.html")).read()
    # strip the leading <h1> we wrote (we render our own title)
    raw = re.sub(r"^<h1>.*?</h1>\s*", "", raw, flags=re.S)
    return raw

cards = []
for i, (pid, tag, title, wc, il, xl) in enumerate(ORDER, 1):
    body = body_html(pid)
    cards.append(f"""
    <section class="post">
      <div class="post-head">
        <span class="tag">{tag}</span>
        <h2>{i}. {html.escape(title)}</h2>
        <div class="meta">{wc} words &nbsp;·&nbsp; +{il} internal links &nbsp;·&nbsp; +{xl} external link(s) &nbsp;·&nbsp; +3 FAQ (question headings) &nbsp;·&nbsp; +BlogPosting &amp; FAQPage schema</div>
      </div>
      <div class="added-label">What was added &amp; embedded</div>
      {body}
    </section>
    """)

FONTCSS = open(os.path.join(SCR, "gf-embed.css")).read()

doc = f"""<!doctype html><html><head><meta charset="utf-8">
<style>{FONTCSS}</style>
<style>
  :root{{--orange:#F05A28;--hot:#FF6B35;--navy:#17324d;--ink:#111820;--warm:#f4efe7;}}
  *{{box-sizing:border-box;}}
  body{{margin:0;font-family:'DM Sans',-apple-system,'Segoe UI',Roboto,Arial,sans-serif;color:#1c2530;line-height:1.6;}}
  h1,h2,h3{{font-family:'Plus Jakarta Sans','DM Sans',sans-serif;}}
  .cover{{height:1030px;background:linear-gradient(160deg,#0d2740 0%,#17324d 60%,#22384f 100%);color:#fff;padding:90px 70px;position:relative;overflow:hidden;}}
  .cover::after{{content:"";position:absolute;right:-160px;bottom:-160px;width:560px;height:560px;border-radius:50%;background:radial-gradient(circle,rgba(240,90,40,.55),transparent 70%);}}
  .cover img{{height:52px;margin-bottom:70px;}}
  .cover .kicker{{color:var(--hot);font-family:'Plus Jakarta Sans';font-weight:700;letter-spacing:.16em;text-transform:uppercase;font-size:14px;}}
  .cover h1{{font-size:62px;line-height:1.05;font-weight:800;margin:18px 0 26px;max-width:820px;}}
  .cover h1 span{{color:var(--orange);}}
  .cover p.sub{{font-size:20px;max-width:640px;color:#c9d6e4;}}
  .cover .foot{{position:absolute;bottom:70px;left:70px;font-size:15px;color:#9fb2c6;}}
  .cover .chips{{margin-top:40px;display:flex;gap:12px;flex-wrap:wrap;max-width:760px;}}
  .cover .chip{{background:rgba(255,255,255,.08);border:1px solid rgba(240,90,40,.5);color:#fff;padding:9px 16px;border-radius:999px;font-size:14px;font-weight:500;}}
  .summary{{padding:60px 70px;background:var(--warm);}}
  .summary h2{{color:var(--navy);font-size:30px;margin:0 0 8px;}}
  .summary .lead{{color:#4a5766;margin:0 0 26px;font-size:17px;}}
  table.sum{{width:100%;border-collapse:collapse;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 6px 24px rgba(13,39,64,.08);}}
  table.sum th{{background:var(--navy);color:#fff;text-align:left;padding:14px 18px;font-family:'Plus Jakarta Sans';font-size:14px;}}
  table.sum td{{padding:13px 18px;border-top:1px solid #eee;font-size:15px;}}
  table.sum td:first-child{{font-weight:600;color:var(--navy);}}
  .post{{padding:56px 70px 20px;page-break-before:always;}}
  .post-head{{border-bottom:3px solid var(--orange);padding-bottom:20px;margin-bottom:10px;}}
  .tag{{display:inline-block;background:linear-gradient(135deg,var(--orange),var(--hot));color:#fff;font-family:'Plus Jakarta Sans';font-weight:700;font-size:12px;letter-spacing:.08em;text-transform:uppercase;padding:6px 14px;border-radius:999px;}}
  .post-head h2{{color:var(--navy);font-size:30px;margin:14px 0 10px;line-height:1.15;}}
  .meta{{color:#6b7684;font-size:14px;font-weight:500;}}
  .added-label{{color:var(--orange);font-family:'Plus Jakarta Sans';font-weight:700;font-size:13px;letter-spacing:.1em;text-transform:uppercase;margin:26px 0 14px;}}
  .post h2{{color:var(--navy);font-size:23px;margin-top:34px;}}
  .post h3{{color:var(--navy);font-size:18px;}}
  .post a{{color:var(--orange);text-decoration:none;border-bottom:1px solid rgba(240,90,40,.35);}}
  .post p{{font-size:15.5px;}}
  .post .abg-faq{{background:#fbf9f6;border:1px solid #efe7db;border-radius:10px;padding:16px 20px;margin:0 0 16px !important;}}
  .post ul{{background:#fbf9f6;border-radius:10px;padding:16px 20px 16px 40px;}}
  footer.pg{{padding:40px 70px 60px;color:#8894a2;font-size:13px;border-top:1px solid #eee;page-break-before:always;}}
  footer.pg strong{{color:var(--navy);}}
</style></head><body>
  <div class="cover">
    <img src="{LOGO}" alt="Align HCM">
    <div class="kicker">AEO / GEO Optimization · Blog Batch 1</div>
    <h1>Five posts, <span>optimized to rank</span> and get cited.</h1>
    <p class="sub">Direct answers, question-based FAQs, internal link clusters, authoritative external citations, and structured schema — embedded live in HubSpot.</p>
    <div class="chips">
      <span class="chip">+32 internal links</span>
      <span class="chip">+6 external citations</span>
      <span class="chip">15 new FAQ Q&amp;A</span>
      <span class="chip">10 schema blocks (Article + FAQPage)</span>
      <span class="chip">5 direct-answer openers</span>
    </div>
    <div class="foot">Align HCM · Prepared for Dillon Mohr · 2026-07-09</div>
  </div>

  <div class="summary">
    <h2>What changed on each post</h2>
    <p class="lead">Every post received the same optimization spine. Existing copy was untouched — these are additive, reversible blocks plus head schema.</p>
    <table class="sum">
      <tr><th>Post</th><th>Words</th><th>Internal</th><th>External</th><th>FAQ</th><th>Schema</th></tr>
      {''.join(f'<tr><td>{t}</td><td>{wc}</td><td>+{il}</td><td>+{xl}</td><td>+3</td><td>Article + FAQPage</td></tr>' for _,t,_,wc,il,xl in ORDER)}
    </table>
  </div>

  {''.join(cards)}

  <footer class="pg">
    <p><strong>How this helps you rank &amp; get cited.</strong> The direct-answer callout gives AI answer engines (ChatGPT, Perplexity, Google AI Overviews) a clean, extractable snippet. Question headings + FAQ match how people and LLMs phrase queries. Internal links build topical authority across the HCM cluster; external citations add credibility signals. FAQPage + BlogPosting schema tells search and AI systems exactly what each page answers.</p>
    <p><strong>Reversible.</strong> All body additions are wrapped in <code>align-aeo-intro</code> / <code>align-aeo-faq</code> markers and schema in <code>align-aeo-schema</code> markers — removable or re-runnable anytime via the token agent.</p>
    <p>Align HCM · alignhcm.com</p>
  </footer>
</body></html>"""

out = os.path.join(SCR, "blog-optimization-batch1.html")
open(out, "w").write(doc)
print("wrote", out)
