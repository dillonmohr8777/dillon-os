#!/usr/bin/env python3
"""Build the NeedMomentum AI Division leave-behind HTML pack."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent
MARK = Path("/workspace/_os/automation/assets/needmomentum-mark.png")
OUT = ROOT / "Need-Momentum-AI-Division.html"

mark_uri = ""
if MARK.exists():
    import base64
    mark_uri = "data:image/png;base64," + base64.b64encode(MARK.read_bytes()).decode("ascii")

mark_html = (
    f'<img class="mark" src="{mark_uri}" alt="NeedMomentum" width="56" height="56" />'
    if mark_uri
    else '<div class="mark-fallback">M</div>'
)

html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>NeedMomentum AI Division — internal pack</title>
  <style>
    :root {{
      --blue: #2A80C2;
      --navy: #1a365d;
      --gold: #FFC63B;
      --ink: #111823;
      --mid: #4A5769;
      --paper: #F4F7FA;
      --panel: #ffffff;
      --rule: #DDE5EE;
      --brand-ink: #2673AF;
    }}
    * {{ box-sizing: border-box; }}
    html {{ scroll-behavior: smooth; }}
    body {{
      margin: 0;
      background: var(--paper);
      color: var(--ink);
      font-family: Georgia, "Times New Roman", serif;
      line-height: 1.55;
    }}
    .wrap {{ max-width: 760px; margin: 0 auto; padding: 0 1.25rem 4rem; }}
    .banner {{
      background: var(--gold);
      color: var(--ink);
      font-family: Arial, Helvetica, sans-serif;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      text-align: center;
      padding: 0.7rem 1rem;
    }}
    header.hero {{
      background: var(--navy);
      color: #fff;
      padding: 2.75rem 0 2.4rem;
    }}
    header.hero .wrap {{ display: flex; gap: 1.1rem; align-items: center; }}
    .mark, .mark-fallback {{
      width: 56px; height: 56px; border-radius: 12px; flex: none;
      background: #fff;
    }}
    .mark-fallback {{
      display: grid; place-items: center;
      color: var(--blue); font-weight: 800; font-family: Arial, sans-serif;
    }}
    header.hero h1 {{
      margin: 0;
      font-size: clamp(1.7rem, 4vw, 2.35rem);
      letter-spacing: -0.03em;
      line-height: 1.15;
    }}
    header.hero p {{
      margin: 0.45rem 0 0;
      color: #d5e4f2;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 0.95rem;
    }}
    nav.toc {{
      background: #fff;
      border: 1px solid var(--rule);
      border-radius: 12px;
      padding: 1rem 1.15rem;
      margin: -1.4rem auto 2rem;
      max-width: 760px;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 0.88rem;
      box-shadow: 0 10px 30px rgba(26,54,93,0.08);
    }}
    nav.toc a {{ color: var(--brand-ink); text-decoration: none; margin-right: 0.85rem; }}
    nav.toc a:hover {{ text-decoration: underline; }}
    h2 {{
      font-size: 1.35rem;
      color: var(--navy);
      margin: 2.4rem 0 0.7rem;
      letter-spacing: -0.02em;
    }}
    h3 {{ font-size: 1.05rem; margin: 1.2rem 0 0.4rem; color: var(--navy); }}
    p, li {{ color: var(--ink); }}
    .mid {{ color: var(--mid); font-family: Arial, Helvetica, sans-serif; font-size: 0.92rem; }}
    .grid {{
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.8rem;
    }}
    @media (max-width: 640px) {{ .grid {{ grid-template-columns: 1fr; }} }}
    .card {{
      background: var(--panel);
      border: 1px solid var(--rule);
      border-radius: 12px;
      padding: 1rem 1.05rem;
    }}
    .card h3 {{ margin-top: 0; }}
    .card p, .card li {{ font-family: Arial, Helvetica, sans-serif; font-size: 0.9rem; color: var(--mid); }}
    .card .tag {{
      display: inline-block;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      background: rgba(42,128,194,0.1);
      color: var(--brand-ink);
      padding: 0.15rem 0.45rem;
      border-radius: 999px;
      margin-bottom: 0.45rem;
    }}
    table {{
      width: 100%;
      border-collapse: collapse;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 0.86rem;
      background: #fff;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid var(--rule);
    }}
    th {{
      text-align: left;
      background: var(--navy);
      color: #fff;
      padding: 0.65rem 0.7rem;
      font-weight: 700;
    }}
    td {{
      padding: 0.6rem 0.7rem;
      border-top: 1px solid var(--rule);
      vertical-align: top;
      color: var(--mid);
    }}
    .ask {{
      background: #fff;
      border: 1px solid var(--rule);
      border-left: 6px solid var(--gold);
      border-radius: 12px;
      padding: 1.1rem 1.2rem 0.4rem;
    }}
    .ask ol {{ font-family: Arial, Helvetica, sans-serif; color: var(--ink); }}
    .gate {{
      display: flex; flex-wrap: wrap; gap: 0.45rem; margin: 0.8rem 0 1.2rem;
      font-family: Arial, Helvetica, sans-serif;
    }}
    .gate span {{
      background: #fff;
      border: 1px solid var(--rule);
      border-radius: 999px;
      padding: 0.35rem 0.7rem;
      font-size: 0.78rem;
      color: var(--navy);
      font-weight: 700;
    }}
    .no {{
      background: #fff5f3;
      border-color: #f0d2cc;
    }}
    footer.pack {{
      margin-top: 3rem;
      padding-top: 1.2rem;
      border-top: 1px solid var(--rule);
      font-family: Arial, Helvetica, sans-serif;
      font-size: 0.8rem;
      color: var(--mid);
    }}
    ul {{ padding-left: 1.15rem; }}
    li {{ margin: 0.28rem 0; }}
    a {{ color: var(--brand-ink); }}
    @media print {{
      .banner {{ -webkit-print-color-adjust: exact; print-color-adjust: exact; }}
      header.hero {{ -webkit-print-color-adjust: exact; print-color-adjust: exact; }}
      nav.toc {{ display: none; }}
      .card, table, .ask {{ break-inside: avoid; }}
    }}
  </style>
</head>
<body>
  <div class="banner">Internal · drafts until Mac / counsel / Beth · not a public page</div>
  <header class="hero">
    <div class="wrap">
      {mark_html}
      <div>
        <h1>NeedMomentum AI Division</h1>
        <p>Operating plan, four offers, legal drafts, 90-day pilots. One pack for Dillon. Record the Loom against the hub. Nothing live until Mac answers.</p>
      </div>
    </div>
  </header>
  <div class="wrap">
    <nav class="toc">
      <a href="#plan">Plan</a>
      <a href="#skus">Four SKUs</a>
      <a href="#proof">Proof</a>
      <a href="#pilots">Pilots</a>
      <a href="#legal">Legal</a>
      <a href="#mac">Mac's five</a>
      <a href="#wont">Won't do</a>
    </nav>

    <h2 id="plan">The plan</h2>
    <p>NeedMomentum sells proof: a demo site, a Radar PDF, a Kind Insurance ops number. Homepage stays human. AI lives in the nav and on four service pages. Four invoices for four acronyms is the wrong product.</p>
    <div class="gate">
      <span>A Confirm</span>
      <span>B Publish</span>
      <span>C Loom</span>
      <span>D Counsel</span>
      <span>E Pilots</span>
      <span>F Outbound</span>
    </div>
    <table>
      <tr><th>Gate</th><th>What happens</th><th>Owner</th></tr>
      <tr><td>A Confirm</td><td>Mac answers SKUs, automation prices, AEO dollars, pilots, counsel.</td><td>Mac</td></tr>
      <tr><td>B Publish</td><td>Beth pastes four WordPress pages. Homepage unchanged.</td><td>Beth after Mac</td></tr>
      <tr><td>C Loom</td><td>Five minutes against the hub. Kind Insurance, Radar fixture, Philly factory.</td><td>Dillon</td></tr>
      <tr><td>D Counsel</td><td>Addendum + claims markup. Don't paste the draft into a live SOW.</td><td>Counsel Mac names</td></tr>
      <tr><td>E Pilots</td><td>90 days, paid, one number. Shadow, Onsite, Omega proposed.</td><td>Dillon after Mac yes</td></tr>
      <tr><td>F Outbound</td><td>Harvest phl-2026-w33 (8 staged). mail_ready stays hold.</td><td>Dillon after E</td></tr>
    </table>
    <p class="mid">Entry motion for every SKU: paid diagnostic → 90-day pilot → retainer. Dillon does not invent a public price.</p>

    <h2 id="skus">Four SKUs, one system</h2>
    <div class="grid">
      <article class="card">
        <div class="tag">Visibility</div>
        <h3>AEO / GEO</h3>
        <p>Paid Radar, then 90 days of people-first pages, GBP, and citation measurement. Google still sits underneath. Ignore llms.txt, chunking, fake mentions.</p>
        <p><strong>Good:</strong> named prompts + Search Console generative AI / AI referrals.</p>
        <p><strong>Stack:</strong> Radar, GSC, GA4, GBP, Claude drafts. AM publishes.</p>
      </article>
      <article class="card">
        <div class="tag">Design</div>
        <h3>AI Design</h3>
        <p>Factory harvests their photos, words, and colors. Volume rebuild or bespoke after they engage. The live homepage never says "AI-designed."</p>
        <p><strong>Good:</strong> Site Quality Score up + one conversion path above the fold.</p>
        <p><strong>Stack:</strong> factory, harvest, locked tokens, human QA. noindex until they own it.</p>
      </article>
      <article class="card">
        <div class="tag">Marketing</div>
        <h3>AI Marketing</h3>
        <p>More tests, same brand. AI drafts. The AM still ships the ad and owns spend. Ads don't lead with the word AI.</p>
        <p><strong>Good:</strong> tests shipped with tracking that fires.</p>
        <p><strong>Stack:</strong> Google Ads, Meta, Claude drafts. ads-audit skill: no spend.</p>
      </article>
      <article class="card">
        <div class="tag">Ops</div>
        <h3>AI Automation</h3>
        <p>Missed follow-up becomes a booked conversation in <em>their</em> CRM. Live packages $1,500–$3,000 + setup until Mac confirms sold vs brochure. Growth currently sits under Starter. That table stays off the rewrite.</p>
        <p><strong>Good:</strong> time-to-first-response. Form-to-CRM with zero manual entry.</p>
        <p><strong>Stack:</strong> client CRM, chat/SMS/email, UTMs. First message discloses software.</p>
      </article>
    </div>

    <h2 id="proof">Proof we lead with</h2>
    <div class="grid">
      <article class="card">
        <h3>Kind Insurance PA</h3>
        <p>Live case. Chatbot + CRM. 5 qualified conversations, 1 policy, ~30 days. Agency-reported. Hero for automation. Not Dillon's AM book.</p>
      </article>
      <article class="card">
        <h3>Prospect Radar</h3>
        <p>PDF a human QAs before mail. Cedar Ridge in the hub is a <strong>fixture</strong> (cedarridgehvac.example). Use it in the Loom. Never present it as a client.</p>
      </article>
      <article class="card">
        <h3>Philly factory</h3>
        <p>25-site week gallery. Harvested palettes. Proof we already ship sites, not a $497 public product.</p>
      </article>
      <article class="card">
        <h3>Live automation page</h3>
        <p>needmomentum.com/ai-powered-marketing-automation/. Keep the $1,500–$3,000 band. Drop the inverted Starter/Growth table until Mac says the dollars sold.</p>
      </article>
    </div>

    <h2 id="pilots">90-day pilots (proposed)</h2>
    <p>Paid. No 12-month lock. One operational number. Mac picks yes / swap / wait before anyone emails the owner.</p>
    <table>
      <tr><th>Pilot</th><th>Client</th><th>Day-1 number</th></tr>
      <tr><td>Automation</td><td>Shadow HVAC</td><td>Time-to-first-response on inbound form/call</td></tr>
      <tr><td>Design</td><td>Onsite Concrete</td><td>Site Quality Score + conversion path above the fold</td></tr>
      <tr><td>Visibility</td><td>Omega Landscaping</td><td>Named prompt list + AI referrals. Confirm the public domain first.</td></tr>
    </table>
    <p class="mid">Days 1–14 diagnostic. 15–45 build. 46–75 live. 76–90 keep, expand, or stop. Client keeps the accounts either way.</p>

    <h2 id="legal">Legal (counsel, not clients)</h2>
    <div class="grid">
      <article class="card"><h3>Claims sheet</h3><p>Allowed: "AI-assisted production with human review." Kind Insurance numbers exactly as published. Forbidden: citation guarantees, invented metrics, Cedar Ridge as a real client.</p></article>
      <article class="card"><h3>AI addendum</h3><p>Draft only. IP, no public-model training on confidentials, human review, chatbot disclosure, client-owned accounts. Counsel rewrites.</p></article>
      <article class="card"><h3>Creative disclosure</h3><p>NY synthetic-performer rule (2026-06-09) and platform labels when ads use generated people. Operator checklist, not a footer stamp.</p></article>
      <article class="card"><h3>Ownership FAQ</h3><p>Client owns ads, GSC, GA4, CRM, domain. Offboarding returns access. No personal ChatGPT for confidentials.</p></article>
    </div>

    <h2 id="mac">Mac, five questions</h2>
    <div class="ask">
      <ol>
        <li>Confirm nav names as SKUs: AEO/GEO, AI Design, AI Marketing, AI Automation?</li>
        <li>Automation $1,500–$3,000: sold, or brochure? Drop the inverted Growth/Starter table?</li>
        <li>AEO/GEO: dollar band from you, or diagnostic-first until a client bites?</li>
        <li>Pilots: Shadow HVAC, Onsite Concrete, Omega Landscaping. Yes / swap / wait?</li>
        <li>Who is counsel for the addendum?</li>
      </ol>
    </div>

    <h2 id="wont">What we will not do</h2>
    <ul>
      <li>Launch an AI startup, waitlist, or Product Hunt page.</li>
      <li>Guarantee ChatGPT or Overview citations.</li>
      <li>Publish a public exact rate card for unproven SKUs.</li>
      <li>Index a demo of a business we don't work for.</li>
      <li>Auto-send mail, Slack, or CRM writes.</li>
      <li>Sell a 300-skill dump, or put "AI-designed" on a client's homepage.</li>
    </ul>

    <h2>Where the files live</h2>
    <p class="mid">Vault: <code>02_Campaigns/Need Momentum AI Division/</code>. Hub: <code>hub/index.html</code>. Pages for Beth: <code>pages/</code>. Offers: <code>05_Offers/</code>. Batch scaffold: <code>phl-2026-w33</code> (mail_ready hold). Print this file to PDF from the browser if you want a leave-behind.</p>

    <footer class="pack">NeedMomentum / Momentum 360 · internal pack · 2026-08-14 · Dillon Mohr · drafts until Mac / counsel / Beth</footer>
  </div>
</body>
</html>
"""

OUT.write_text(html, encoding="utf-8")
print(f"wrote {OUT} ({OUT.stat().st_size} bytes)")
