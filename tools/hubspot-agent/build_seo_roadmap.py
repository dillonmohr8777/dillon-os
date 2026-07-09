#!/usr/bin/env python3
"""Brand-styled Align HCM SEO + AEO/GEO ranking roadmap PDF."""
import os
SCR = "/tmp/claude-0/-home-user/c58cd007-656f-5414-a35e-20c93b5c2b6f/scratchpad"
LOGO = open(os.path.join(SCR, "logo.datauri")).read().strip()
FONTCSS = open(os.path.join(SCR, "gf-embed.css")).read()

CSS = """
 :root{--orange:#F05A28;--hot:#FF6B35;--navy:#17324d;--ink:#111820;--warm:#f4efe7;}
 *{box-sizing:border-box;}
 body{margin:0;font-family:'DM Sans',-apple-system,'Segoe UI',Roboto,Arial,sans-serif;color:#1c2530;line-height:1.62;}
 h1,h2,h3,h4{font-family:'Plus Jakarta Sans','DM Sans',sans-serif;}
 .cover{height:1030px;background:linear-gradient(160deg,#0d2740 0%,#17324d 60%,#22384f 100%);color:#fff;padding:92px 70px;position:relative;overflow:hidden;}
 .cover::after{content:"";position:absolute;right:-160px;bottom:-140px;width:560px;height:560px;border-radius:50%;background:radial-gradient(circle,rgba(240,90,40,.55),transparent 70%);}
 .cover img{height:52px;margin-bottom:66px;}
 .cover .kicker{color:var(--hot);font-weight:700;letter-spacing:.16em;text-transform:uppercase;font-size:14px;}
 .cover h1{font-size:64px;line-height:1.04;font-weight:800;margin:18px 0 24px;max-width:840px;}
 .cover h1 span{color:var(--orange);}
 .cover p.sub{font-size:20px;max-width:660px;color:#c9d6e4;}
 .cover .foot{position:absolute;bottom:70px;left:70px;font-size:15px;color:#9fb2c6;}
 section{padding:56px 70px;page-break-before:always;}
 h2.sec{color:var(--navy);font-size:32px;margin:0 0 6px;}
 .sec-kick{color:var(--orange);font-weight:700;letter-spacing:.12em;text-transform:uppercase;font-size:13px;margin-bottom:16px;}
 p{font-size:15.5px;}
 .lead{font-size:17px;color:#42505f;margin-bottom:26px;}
 .stats{display:flex;gap:16px;flex-wrap:wrap;margin:8px 0 24px;}
 .stat{flex:1;min-width:150px;background:var(--warm);border-radius:14px;padding:20px 22px;border-left:4px solid var(--orange);}
 .stat .n{font-family:'Plus Jakarta Sans';font-weight:800;font-size:32px;color:var(--navy);line-height:1;}
 .stat .l{font-size:13px;color:#6b7684;margin-top:8px;}
 .card{background:#fff;border:1px solid #eee;border-radius:14px;padding:24px 26px;margin:0 0 18px;box-shadow:0 5px 20px rgba(13,39,64,.06);}
 .card h3{color:var(--navy);font-size:21px;margin:0 0 4px;}
 .card .tagline{color:var(--orange);font-weight:600;font-size:13.5px;margin-bottom:12px;}
 .card ul{margin:6px 0 0;padding-left:20px;}
 .card li{margin-bottom:7px;font-size:15px;}
 .badge{display:inline-block;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;padding:4px 10px;border-radius:999px;color:#fff;}
 .b-done{background:#2BB5A0;} .b-now{background:linear-gradient(135deg,var(--orange),var(--hot));} .b-next{background:#22384f;} .b-slow{background:#8894a2;}
 table{width:100%;border-collapse:collapse;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 5px 20px rgba(13,39,64,.06);margin-top:8px;}
 th{background:var(--navy);color:#fff;text-align:left;padding:13px 16px;font-family:'Plus Jakarta Sans';font-size:13.5px;}
 td{padding:12px 16px;border-top:1px solid #eee;font-size:14.5px;vertical-align:top;}
 td:first-child{font-weight:600;color:var(--navy);white-space:nowrap;}
 .two{display:flex;gap:20px;}
 .two>div{flex:1;}
 .callout{background:var(--warm);border-left:4px solid var(--orange);border-radius:0 10px 10px 0;padding:16px 20px;margin:18px 0;}
 .callout strong{color:var(--navy);}
 footer{padding:34px 70px 56px;color:#8894a2;font-size:13px;border-top:1px solid #eee;page-break-before:always;}
 footer strong{color:var(--navy);}
"""

HTML = f"""<!doctype html><html><head><meta charset="utf-8"><style>{FONTCSS}</style><style>{CSS}</style></head><body>

<div class="cover">
  <img src="{LOGO}" alt="Align HCM">
  <div class="kicker">Search &amp; AI Visibility Strategy</div>
  <h1>The Align HCM <span>ranking roadmap</span>.</h1>
  <p class="sub">Everything we can do to rank higher and get cited by AI answer engines — what&rsquo;s done, what&rsquo;s next, and what to expect. Grounded in your live HubSpot data.</p>
  <div class="foot">Align HCM · Prepared for Dillon Mohr · 2026-07-09</div>
</div>

<section>
  <div class="sec-kick">1 · Where you stand today</div>
  <h2 class="sec">The honest snapshot</h2>
  <p class="lead">Real numbers from your HubSpot analytics (trailing 30 days). This is the baseline we measure everything against.</p>
  <div class="stats">
    <div class="stat"><div class="n">1,928</div><div class="l">page views / 30 days</div></div>
    <div class="stat"><div class="n">42</div><div class="l">form submissions</div></div>
    <div class="stat"><div class="n">21</div><div class="l">leads captured</div></div>
    <div class="stat"><div class="n">~85%</div><div class="l">aggregate bounce rate</div></div>
    <div class="stat"><div class="n">9 / 63</div><div class="l">blog posts fully optimized</div></div>
  </div>
  <p><strong>What the data says.</strong> Your money pages already work — the Home page pulls the most traffic and the Contact page converts hard (15 of 42 submissions came from one page). The two highest-traffic blog posts are the UKG and Workday buyer&rsquo;s guides, which tells us buyer-intent content is what earns visits. The gaps: a high bounce rate signals visitors aren&rsquo;t being routed deeper into the site, and 54 of 63 blog posts still lack the structure search engines and AI need to surface them.</p>
  <div class="callout"><strong>The core problem isn&rsquo;t content quality — it&rsquo;s legibility and depth.</strong> You have strong content that machines can&rsquo;t fully read and visitors can&rsquo;t easily navigate. Both are fixable, and we&rsquo;ve started.</div>
</section>

<section>
  <div class="sec-kick">2 · The four levers</div>
  <h2 class="sec">What actually moves rankings</h2>
  <p class="lead">Ranking and AI-citation come down to four levers. We control the first two outright; the third compounds over time; the fourth is the emerging channel where we can win fastest.</p>

  <div class="card">
    <h3>① On-page &amp; content <span class="badge b-now">In progress</span></h3>
    <div class="tagline">Highest leverage · we control it fully</div>
    <ul>
      <li><strong>Finish the cluster.</strong> Optimize the remaining Tier-1 &amp; Tier-2 posts the way we did the first 9 — direct answers, question headings, FAQ, internal links, schema.</li>
      <li><strong>Title tags &amp; meta descriptions.</strong> Rewrite every blog title/meta around the exact phrase buyers search (e.g. &ldquo;UKG implementation partner,&rdquo; &ldquo;Workday reporting best practices&rdquo;).</li>
      <li><strong>Internal-link architecture.</strong> Every post links to its platform guide, the pillar page, and 1–2 siblings — this is topical authority, and it lifts the whole site, not one page.</li>
      <li><strong>Bottom-funnel pages.</strong> Comparison and &ldquo;vs&rdquo; content (Paylocity vs Paychex, UKG vs Workday) plus buyer&rsquo;s guides capture high-intent searches close to a purchase decision.</li>
      <li><strong>Content depth &amp; freshness.</strong> Expand thin posts past 900 words; refresh the top guides quarterly so they stay current.</li>
    </ul>
  </div>

  <div class="card">
    <h3>② Technical SEO <span class="badge b-next">Next</span></h3>
    <div class="tagline">Removes the reasons Google won&rsquo;t rank you · we control it</div>
    <ul>
      <li><strong>Site &amp; entity schema.</strong> Add Organization + WebSite + LocalBusiness schema sitewide with <code>sameAs</code> links (LinkedIn, socials) so Google understands the Align HCM brand entity. (Post-level BlogPosting/FAQPage schema is already going on.)</li>
      <li><strong>llms.txt + robots.txt.</strong> Publish an <code>llms.txt</code> that tells AI crawlers what to read, and confirm robots.txt allows the AI bots (GPTBot, PerplexityBot, ClaudeBot, Google-Extended).</li>
      <li><strong>Core Web Vitals.</strong> Audit load speed, mobile layout, and image sizes — HubSpot themes often ship heavy. Speed is a ranking factor and a bounce-rate lever.</li>
      <li><strong>Crawl hygiene.</strong> Clean XML sitemap, fix duplicate/near-duplicate posts (there are a few duplicate titles in the blog), canonical tags, and internal 404s.</li>
      <li><strong>Mobile.</strong> Ship the mobile menu system sitewide (already built) — mobile UX feeds both rankings and conversion.</li>
    </ul>
  </div>

  <div class="card">
    <h3>③ Off-page &amp; authority <span class="badge b-slow">Slower burn</span></h3>
    <div class="tagline">The half schema can&rsquo;t replace · compounds over months</div>
    <ul>
      <li><strong>Backlinks.</strong> Earn links from HR/payroll publications, partner sites (UKG/Workday/Dayforce partner directories), and industry roundups. Domain authority is why competitors outrank equal content.</li>
      <li><strong>Digital PR &amp; guest posts.</strong> Byline articles and expert quotes (HARO-style) on HR-tech sites build both links and brand searches.</li>
      <li><strong>Partner co-marketing.</strong> Get listed and linked in the official implementation-partner directories for each platform you serve.</li>
      <li><strong>Google Business Profile &amp; citations.</strong> Consistent NAP (name/address/phone) across directories strengthens the brand entity and local intent.</li>
    </ul>
  </div>

  <div class="card">
    <h3>④ AEO / GEO — getting cited by AI <span class="badge b-now">Winning fastest</span></h3>
    <div class="tagline">The emerging channel · fastest realistic wins</div>
    <ul>
      <li><strong>Extractable answers.</strong> The direct-answer callouts + FAQ we&rsquo;re adding are exactly what ChatGPT, Perplexity, and Google AI Overviews quote. AI engines re-crawl constantly and don&rsquo;t need domain authority the way blue-link ranking does.</li>
      <li><strong>Structured data.</strong> FAQPage + BlogPosting schema tells AI systems precisely what each page answers.</li>
      <li><strong>Question-shaped content.</strong> Headings phrased the way people actually ask (&ldquo;What is UKG Rapid Hire?&rdquo;) match LLM query patterns.</li>
      <li><strong>Be the cited source.</strong> Original data, checklists, and definitive guides get referenced more than generic advice — lean into Align&rsquo;s implementation expertise.</li>
      <li><strong>Track citations.</strong> The daily tracker probes target queries and watches for AI-referral traffic so we know it&rsquo;s working.</li>
    </ul>
  </div>
</section>

<section>
  <div class="sec-kick">3 · The plan</div>
  <h2 class="sec">Prioritized 90-day roadmap</h2>
  <p class="lead">Sequenced by leverage-per-effort. Cheapest, highest-impact work first.</p>
  <table>
    <tr><th>Phase</th><th>Work</th><th>Why it&rsquo;s ordered here</th></tr>
    <tr><td>Done</td><td>9 posts fully optimized (schema, FAQ, links, direct answers)</td><td>Proves the system and starts the compounding.</td></tr>
    <tr><td>Now<br>(wk 1–2)</td><td>Internal-link sweep across the 17 orphan posts · finish Tier-1 optimization · rewrite titles/meta on top 20 posts</td><td>Pure on-page, fully in our control, lifts the whole cluster.</td></tr>
    <tr><td>30 days</td><td>Sitewide entity schema + llms.txt + robots.txt for AI crawlers · Core Web Vitals audit · fix duplicate posts &amp; sitemap</td><td>Removes technical blockers so the on-page work can rank.</td></tr>
    <tr><td>60 days</td><td>Buyer&rsquo;s guides + comparison/&ldquo;vs&rdquo; pages for bottom-funnel keywords · expand thin posts</td><td>Captures high-intent, close-to-purchase searches.</td></tr>
    <tr><td>90 days</td><td>Backlink &amp; partner-directory push · digital PR · GBP + citations</td><td>Authority takes longest to build — start it early, expect payoff later.</td></tr>
    <tr><td>Ongoing</td><td>Daily tracker (leads + traffic + AI/search visibility) · quarterly content refresh</td><td>Measure, don&rsquo;t guess; keep the top pages current.</td></tr>
  </table>
</section>

<section>
  <div class="sec-kick">4 · Expectations &amp; measurement</div>
  <h2 class="sec">What to expect, and how we&rsquo;ll know</h2>
  <div class="two">
    <div>
      <h3 style="color:var(--navy);">Realistic timeline</h3>
      <ul>
        <li><strong>Weeks:</strong> AI-citation lift (ChatGPT/Perplexity/AI Overviews) and rich-result eligibility. This is the fastest channel.</li>
        <li><strong>1–2 months:</strong> Movement on long-tail and question keywords as Google re-crawls the optimized posts.</li>
        <li><strong>3–6 months:</strong> Competitive head-term rankings, once cluster depth + authority accumulate.</li>
      </ul>
      <div class="callout"><strong>The honest truth:</strong> on-page work removes the reasons you&rsquo;re not ranking; authority and time do the rest. Five posts won&rsquo;t move the domain — the whole program will.</div>
    </div>
    <div>
      <h3 style="color:var(--navy);">KPIs we&rsquo;ll track daily</h3>
      <ul>
        <li>Leads &amp; form submissions (the number that pays the bills)</li>
        <li>Organic page views &amp; trend vs prior period</li>
        <li>AI-visibility score — how many target queries we appear for</li>
        <li>Near-miss keywords (page 2 → page 1 opportunities)</li>
        <li>AI-referral traffic (ChatGPT / Perplexity / Gemini sources)</li>
        <li>Optimization coverage (posts with schema/FAQ/links)</li>
      </ul>
      <p style="font-size:14px;color:#6b7684;">Delivered every morning at 10 AM ET via the automated tracker, with a report committed to the vault.</p>
    </div>
  </div>
</section>

<footer>
  <p><strong>Bottom line.</strong> We control on-page and technical SEO outright and have already started — that&rsquo;s the highest-leverage, fastest-compounding work. AEO/GEO is the channel where a focused consultancy like Align can out-punch bigger competitors quickly, because AI engines reward clear, structured, expert answers over raw domain size. Authority (backlinks) is the long game we start now and harvest later. Ranking is a program, not a switch — but every piece here is a lever we can actually pull.</p>
  <p>Align HCM · alignhcm.com · Ranking Roadmap 2026-07-09</p>
</footer>

</body></html>"""

out = os.path.join(SCR, "seo-roadmap.html")
open(out, "w").write(HTML)
print("wrote", out)
