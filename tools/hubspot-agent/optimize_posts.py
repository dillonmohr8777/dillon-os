#!/usr/bin/env python3
"""
AEO/GEO optimization for Tier-1 Align HCM blog posts.

For each target post this injects (idempotent, marker-wrapped, reversible):
  1. A "Quick answer" direct-answer callout prepended to the body (AEO extractability).
  2. A "Frequently asked questions" section appended to the body — question H2/H3s
     with direct answers, each answer carrying contextual INTERNAL + EXTERNAL links.
  3. A "Related from Align HCM" internal-link cluster.
  4. BlogPosting + FAQPage JSON-LD schema in headHtml (built from the now-visible FAQ,
     so structured data matches on-page content per Google's rules).

Body additions never touch existing prose — they wrap around it in markers:
  <!-- align-aeo-intro:start --> ... <!-- align-aeo-intro:end -->   (prepended)
  <!-- align-aeo-faq:start -->   ... <!-- align-aeo-faq:end -->     (appended)
Schema uses the existing <!-- align-aeo-schema --> markers.

Dry-run by default. --confirm writes live. --only <id> limits to one post.
"""
import json, os, re, sys, html, urllib.request, urllib.error, urllib.parse

BASE = "https://api.hubapi.com"
TOKEN = os.environ.get("HUBSPOT_PRIVATE_APP_TOKEN")
LOGO = "https://www.alignhcm.com/hs-fs/hubfs/Align%20HCM%20logo.png"
ORG = {"@type": "Organization", "name": "Align HCM", "url": "https://www.alignhcm.com"}
S_SCHEMA, E_SCHEMA = "<!-- align-aeo-schema:start -->", "<!-- align-aeo-schema:end -->"
S_INTRO, E_INTRO = "<!-- align-aeo-intro:start -->", "<!-- align-aeo-intro:end -->"
S_FAQ, E_FAQ = "<!-- align-aeo-faq:start -->", "<!-- align-aeo-faq:end -->"

NAVY = "#13314e"
ORANGE = "#F05A28"
CREAM = "#f7f4ef"

if not TOKEN:
    sys.exit("Set HUBSPOT_PRIVATE_APP_TOKEN")


def api(method, path, body=None, params=None):
    url = BASE + path
    if params:
        url += "?" + urllib.parse.urlencode(params)
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("Authorization", "Bearer " + TOKEN)
    req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req) as r:
            raw = r.read().decode()
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as e:
        sys.exit(f"HTTP {e.code} {method} {path}\n{e.read().decode()[:600]}")


def clean(s):
    s = re.sub(r"<[^>]+>", "", s or "")
    return html.unescape(re.sub(r"\s+", " ", s)).strip()


# ---- internal + external link shorthands ----
B = "https://www.alignhcm.com/blog/"
def L(url, text):  # anchor
    return f'<a href="{url}">{text}</a>'
def IL(slug, text):
    return L(B + slug, text)
def XL(url, text):
    return L(url, text)


# ---------------------------------------------------------------------------
# Per-post optimization content. Each entry:
#   answer  : one-sentence direct answer (the "Quick answer" callout)
#   faqs    : list of (question, answer_html) — answer_html may contain <a> links
#   related : list of (slug, label) internal cluster links
# ---------------------------------------------------------------------------
POSTS = {
  # UKG Rapid Hire
  "273813902025": {
    "answer": "UKG Rapid Hire is a high-volume recruiting capability that automates screening, scheduling, and offer steps so hourly and seasonal teams can move qualified candidates from application to hire in days instead of weeks — but the speed only holds up when the underlying UKG configuration and workflows are set up correctly.",
    "faqs": [
      ("What is UKG Rapid Hire and who is it for?",
       f"UKG Rapid Hire is built for organizations that hire at volume — retail, manufacturing, healthcare, hospitality, and the public sector — where a slow process means losing candidates to faster competitors. It compresses sourcing, screening, and scheduling into an automated flow inside the UKG suite. If you are evaluating whether UKG is the right platform for that scale, our {IL('the-strategic-buyers-guide-to-ukg','Strategic Buyer&rsquo;s Guide to UKG')} walks through the fit questions first."),
      ("How does high-volume hiring automation actually reduce time-to-hire?",
       f"It removes the manual handoffs that create delay: automated knockout questions filter unqualified applicants instantly, self-scheduling eliminates recruiter phone tag, and templated offers go out the moment a candidate clears screening. According to the {XL('https://www.bls.gov/jlt/','U.S. Bureau of Labor Statistics JOLTS data')}, hires and separations run in the millions each month in high-turnover sectors, so shaving days off each requisition compounds fast. The gains depend on connected data flowing across the {IL('the-ukg-ecosystem-advantage-why-open-apis-and-partner-networks-matter-for-long-term-success','UKG ecosystem of open APIs and partners')}."),
      ("What has to be configured correctly for Rapid Hire to deliver?",
       f"Screening logic, requisition templates, approval chains, and the integrations that push new hires into onboarding and payroll all have to be tuned to how you actually operate. Rushed or DIY setups are where the speed promise breaks — we cover why in {IL('the-hidden-price-tag-why-diy-hcm-implementation-costs-more-than-you-think','why DIY HCM implementation costs more than you think')}. Align HCM configures Rapid Hire around your real hiring volume and compliance needs."),
    ],
    "related": [
      ("the-strategic-buyers-guide-to-ukg", "The Strategic Buyer&rsquo;s Guide to UKG"),
      ("the-ukg-ecosystem-advantage-why-open-apis-and-partner-networks-matter-for-long-term-success", "The UKG Ecosystem Advantage"),
      ("ukgs-approach-to-ai-why-human-centered-automation-matters-more-than-you-think", "UKG&rsquo;s Approach to AI: Human-Centered Automation"),
    ],
  },
  # 5 Critical HCM Implementation Mistakes
  "277255570131": {
    "answer": "The five mistakes that most often derail an HCM implementation are underestimating data cleanup, skipping process alignment, under-resourcing internal project leadership, treating training as an afterthought, and rushing go-live before testing — every one of them is preventable with the right plan and partner.",
    "faqs": [
      ("What is the number one cause of failed HCM implementations?",
       f"Dirty data. Migrating years of inconsistent employee, payroll, and org records into a new system without cleaning them first guarantees errors on day one. Industry research on IT and ERP projects consistently ties a large share of failures to poor data and change management — see {XL('https://www.shrm.org','SHRM')} for HR-technology guidance. Our {IL('the-data-imperative-why-pre-conversion-data-cleaning-determines-hcm-success','Data Imperative')} article explains how pre-conversion cleaning determines success, and the {IL('data-conversion-checklist-what-to-prepare-before-migration','data conversion checklist')} shows what to prepare."),
      ("How can I avoid these HCM implementation mistakes?",
       f"Sequence the work: clean data before you map it, align processes before you configure, and staff a real internal project lead rather than assuming the vendor will run it. Many of the {IL('the-most-common-challenges-with-hcm-implementations','most common challenges with HCM implementations')} trace back to skipping those steps. A phased, tested rollout beats a big-bang go-live."),
      ("Is a faster implementation riskier?",
       f"Not inherently — a disciplined short implementation is often safer than a drawn-out one, because scope stays tight and momentum stays high. We break down {IL('why-fast-growing-companies-choose-6-week-implementations-over-18-month-enterprise-projects','why fast-growing companies choose 6-week implementations over 18-month projects')}. The risk is not speed; it is skipping the fundamentals to hit a date."),
    ],
    "related": [
      ("the-data-imperative-why-pre-conversion-data-cleaning-determines-hcm-success", "The Data Imperative"),
      ("the-hidden-price-tag-why-diy-hcm-implementation-costs-more-than-you-think", "Why DIY HCM Implementation Costs More"),
      ("the-most-common-challenges-with-hcm-implementations", "Common Challenges with HCM Implementations"),
    ],
  },
  # Manufacturing Timekeeping
  "268085670586": {
    "answer": "Modern manufacturing timekeeping is no longer just clocking hours — it spans three dimensions: accurate labor capture for compliance, real-time visibility into who is on the floor and where, and workforce intelligence that connects hours to productivity, safety, and cost.",
    "faqs": [
      ("Why is manufacturing timekeeping more than tracking hours?",
       f"On a plant floor, time data drives overtime compliance, shift coverage, and labor costing all at once. Getting it wrong creates {XL('https://www.dol.gov/agencies/whd/flsa','Fair Labor Standards Act')} exposure and blind spots in scheduling. The same visibility gap that hurts manufacturers shows up across frontline industries — we cover it in {IL('workforce-visibility-gap','The Workforce Visibility Gap')}."),
      ("How does workforce intelligence reduce manufacturing labor costs?",
       f"By turning raw punches into patterns: where overtime concentrates, which shifts are chronically short, and how absenteeism moves productivity. {XL('https://www.bls.gov/iag/tgs/iag31-33.htm','BLS manufacturing employment data')} shows how tight labor supply is, which makes every scheduled hour matter. Connecting that intelligence with a platform built for complex time rules — like UKG — is the key; see our {IL('the-strategic-buyers-guide-to-ukg','Strategic Buyer&rsquo;s Guide to UKG')}."),
      ("What about temporary and contingent manufacturing workers?",
       f"Seasonal and contingent labor is where timekeeping and cost visibility break down most often, because those workers frequently sit outside the core system. We address closing that gap in {IL('contingent-workforce-management-close-the-blind-spot','Contingent Workforce Management: Close the Blind Spot')}."),
    ],
    "related": [
      ("workforce-visibility-gap", "The Workforce Visibility Gap"),
      ("the-retention-equation-how-retail-turnover-costs-more-than-your-pl-reveals", "The Retention Equation"),
      ("contingent-workforce-management-close-the-blind-spot", "Contingent Workforce Management"),
    ],
  },
  # UKG Human-Centered AI
  "277414866667": {
    "answer": "UKG&rsquo;s &lsquo;human-centered automation&rsquo; means its AI is designed to support managers and employees rather than replace human judgment — automating the repetitive work of scheduling, timekeeping, and insights while keeping people in control of the decisions that affect people.",
    "faqs": [
      ("What does 'human-centered' AI mean in an HCM platform?",
       f"It means the AI surfaces recommendations, flags anomalies, and handles routine tasks, but a human still makes the call on hiring, pay, and scheduling exceptions. That framing matters because most AI in HR fails on adoption, not capability — we explain that in {IL('most-chros-are-buying-ai-tools-theyll-never-use','Why CHROs Buy AI Tools Their Teams Never Actually Use')}. Industry analysts such as {XL('https://www.gartner.com/en/human-resources','Gartner')} make the same point about responsible HR AI."),
      ("How is UKG's approach to AI different from other platforms?",
       f"UKG embeds AI into the flows managers already use rather than bolting on a separate tool, which lowers the adoption barrier. It is a different philosophy from platforms that were rebuilt around AI from the ground up — compare it with {IL('most-hcm-platforms-add-ai-features.-dayforce-built-its-platform-around-ai','how Dayforce built its platform around AI')}. Both approaches work; the right one depends on your team."),
      ("How do we actually get value from HCM AI features?",
       f"Value comes from integration and workflow fit, not features on a datasheet. AI that is not wired into clean, connected data just produces noise — we break this down in {IL('ai-integration-with-hcm-systems','AI Integration With HCM Systems')}. Align HCM configures UKG AI around your real processes so the recommendations are trustworthy."),
    ],
    "related": [
      ("the-strategic-buyers-guide-to-ukg", "The Strategic Buyer&rsquo;s Guide to UKG"),
      ("most-chros-are-buying-ai-tools-theyll-never-use", "Why CHROs Buy AI Tools They Never Use"),
      ("most-hcm-platforms-add-ai-features.-dayforce-built-its-platform-around-ai", "Dayforce Built Its Platform Around AI"),
    ],
  },
  # Internal Talent Mobility (Beyond Hiring)
  "268058974957": {
    "answer": "Internal talent mobility — moving existing employees into new roles, projects, and skills instead of always hiring externally — is one of the highest-return retention and growth strategies available, because it fills roles faster, cuts hiring cost, and keeps institutional knowledge in the building.",
    "faqs": [
      ("What is internal talent mobility and why does it matter?",
       f"It is the practice of deliberately promoting, transferring, and reskilling current employees to fill needs across the organization. It matters because external hiring is slow and expensive, and employees who see a path internally stay longer. The {XL('https://learning.linkedin.com/resources/workplace-learning-report','LinkedIn Workplace Learning Report')} consistently finds that opportunity to grow is a top driver of retention. It connects directly to how you plan for roles — see {IL('rethinking-strategic-workforce-planning','Strategic Workforce Planning')}."),
      ("How does internal mobility improve retention?",
       f"Turnover is expensive far beyond the recruiting fee — lost productivity, ramp time, and institutional knowledge all walk out the door. We quantify that dynamic in {IL('the-retention-equation-how-retail-turnover-costs-more-than-your-pl-reveals','The Retention Equation')}. Giving people a visible internal path is one of the cheapest ways to lower that cost, and it reinforces a {IL('high-performance-culture','high-performance culture')}."),
      ("What does HR need to make talent mobility work?",
       f"Clean skills and role data, leadership buy-in, and the ability to show the business case in dollars. When HR can connect people data to financial outcomes — as we describe in {IL('hr-as-a-financial-driver-turning-people-data-into-c-suite-business-intelligence','HR as a Financial Driver')} — mobility stops being a nice-to-have and becomes a budget line the CFO defends."),
    ],
    "related": [
      ("rethinking-strategic-workforce-planning", "Strategic Workforce Planning"),
      ("the-retention-equation-how-retail-turnover-costs-more-than-your-pl-reveals", "The Retention Equation"),
      ("high-performance-culture", "Building a High-Performance Culture"),
    ],
  },
  # UKG Ecosystem Advantage
  "277394134770": {
    "answer": "The UKG ecosystem advantage is that its open APIs and large partner network let UKG connect to the rest of your tech stack — payroll, ERP, benefits, scheduling, and analytics — instead of locking you into a closed system, which is what protects the platform&rsquo;s value over the long term.",
    "faqs": [
      ("Why do open APIs matter when choosing an HCM platform?",
       f"Open APIs mean your HCM can exchange data cleanly with the tools you already run, so you are not forced to rip and replace or live with manual exports. A closed platform quietly raises your switching costs every year. If you are weighing UKG on this dimension, start with our {IL('the-strategic-buyers-guide-to-ukg','Strategic Buyer&rsquo;s Guide to UKG')}, then see how integration choices play out in {IL('api-vs.-flat-file-integrations-choosing-your-hcm-ecosystem','API vs. flat-file integration')}."),
      ("What does the UKG partner network actually get me?",
       f"A mature partner and marketplace ecosystem means pre-built connectors, specialized add-ons, and certified implementation help — you are not the first company to solve your integration. {XL('https://www.ukg.com','UKG&rsquo;s own marketplace and partner program')} is a big part of why the platform scales across industries. Align HCM works inside that ecosystem to wire UKG into your stack."),
      ("How do I keep a UKG integration from breaking over time?",
       f"Durable integrations depend on governance: owned data mappings, monitored connections, and a plan for platform updates. This is exactly where cross-platform projects struggle — see {IL('integrating-workday-with-ukg-why-teams-struggle-and-how-align-hcm-helps','why Workday and UKG integrations become a trust problem')}. The AI and automation layer only pays off on top of clean, connected data, as we cover in {IL('ukgs-approach-to-ai-why-human-centered-automation-matters-more-than-you-think','UKG&rsquo;s human-centered AI')}."),
    ],
    "related": [
      ("the-strategic-buyers-guide-to-ukg", "The Strategic Buyer&rsquo;s Guide to UKG"),
      ("api-vs.-flat-file-integrations-choosing-your-hcm-ecosystem", "API vs. Flat-File Integration"),
      ("ukgs-approach-to-ai-why-human-centered-automation-matters-more-than-you-think", "UKG&rsquo;s Approach to AI"),
    ],
  },
  # Workday Reporting Strategy
  "277394135777": {
    "answer": "Most Workday reporting strategies are backwards because teams build hundreds of custom reports to answer questions after the fact, instead of designing a small set of governed, calculated fields and dashboards that answer the recurring questions leadership actually asks — the fix is to start from the decisions, not the reports.",
    "faqs": [
      ("Why is my Workday reporting so slow and cluttered?",
       f"Because report sprawl compounds: every one-off request becomes a permanent custom report nobody maintains, calculated fields multiply, and performance degrades. The root cause is designing reports reactively rather than around the decisions they support. Our {IL('the-strategic-buyers-guide-to-workday','Strategic Buyer&rsquo;s Guide to Workday')} covers how the platform is meant to be structured from the start."),
      ("How do I build a Workday reporting strategy that scales?",
       f"Start from the questions the C-suite asks every month, define the governed metrics that answer them, and build dashboards on top of clean data — then retire the redundant custom reports. When HR reporting connects to financial outcomes, it earns budget; we make that case in {IL('hr-as-a-financial-driver-turning-people-data-into-c-suite-business-intelligence','HR as a Financial Driver')}. Analysts like {XL('https://www.gartner.com/en/human-resources','Gartner')} consistently tie HR analytics maturity to decision quality, not report volume."),
      ("Are we missing value from Workday's AI and analytics features?",
       f"Almost certainly. Many organizations never turn on or trust the predictive features because the underlying reporting foundation is shaky. We break down {IL('the-workday-ai-gap-most-organizations-dont-know-they-have','the Workday AI gap most teams miss after go-live')}, and {XL('https://www.workday.com','Workday&rsquo;s own analytics capabilities')} assume a governed data model underneath. Align HCM rebuilds that foundation so the smart features actually work."),
    ],
    "related": [
      ("the-strategic-buyers-guide-to-workday", "The Strategic Buyer&rsquo;s Guide to Workday"),
      ("the-workday-ai-gap-most-organizations-dont-know-they-have", "The Workday AI Gap"),
      ("hr-as-a-financial-driver-turning-people-data-into-c-suite-business-intelligence", "HR as a Financial Driver"),
    ],
  },
  # Paylocity Time & Attendance ROI
  "277394451165": {
    "answer": "The hidden ROI in Paylocity&rsquo;s Time &amp; Attendance is not just tracking hours — it is the money recovered from reduced overtime leakage, fewer compliance penalties, and accurate labor costing, which together often dwarf the software cost when the module is configured to your real pay rules.",
    "faqs": [
      ("Where does Paylocity Time & Attendance actually save money?",
       f"Three places: catching unapproved and accidental overtime before it is paid, staying compliant with wage-and-hour rules under the {XL('https://www.dol.gov/agencies/whd/flsa','Fair Labor Standards Act')}, and giving managers accurate labor cost by department so scheduling decisions improve. Those recovered dollars are the ROI most buyers never quantify. See the full {IL('the-strategic-buyers-guide-to-paylocity','Strategic Buyer&rsquo;s Guide to Paylocity')} for platform fit."),
      ("Why isn't our time and attendance delivering that ROI?",
       f"Usually because pay rules, rounding, meal-break, and approval workflows were set to defaults instead of your actual policies — so the data is noisy and managers stop trusting it. The same visibility problem shows up across frontline operations; we cover it in {IL('workforce-visibility-gap','The Workforce Visibility Gap')} and, for plants, {IL('beyond-timekeeping-three-dimensions-of-manufacturing-workforce-intelligence','manufacturing workforce intelligence')}. Correct configuration is the difference."),
      ("How do we get more out of our Paylocity investment?",
       f"Tie time data to the decisions it should drive, train managers on the workflows they actually use, and revisit configuration as policies change. Our {IL('paylocity-training-implementation-methods','Paylocity training and implementation methods')} article covers the adoption side, and if you are still comparing options, {IL('paylocity-vs-paycheck-best-platform','Paylocity vs. Paychex')} helps frame the decision. Align HCM tunes the module to your pay rules so the ROI shows up."),
    ],
    "related": [
      ("the-strategic-buyers-guide-to-paylocity", "The Strategic Buyer&rsquo;s Guide to Paylocity"),
      ("paylocity-training-implementation-methods", "Paylocity Training &amp; Implementation"),
      ("workforce-visibility-gap", "The Workforce Visibility Gap"),
    ],
  },
  # Retention Equation (retail turnover)
  "277376447190": {
    "answer": "Retail turnover costs far more than your P&amp;L reveals because the visible cost — recruiting and onboarding — is only a fraction of the true bill; lost productivity, manager time, scheduling gaps, and eroded customer experience make each departure cost a large share of that role&rsquo;s annual pay, which is why retention is a bottom-line strategy, not an HR nicety.",
    "faqs": [
      ("How much does employee turnover really cost?",
       f"Far more than the recruiting fee. When you add lost productivity, ramp time, overtime to cover gaps, and institutional knowledge walking out, the fully-loaded cost of replacing an employee runs to a meaningful percentage of their annual salary. The {XL('https://www.bls.gov/jlt/','U.S. Bureau of Labor Statistics JOLTS data')} shows how high separation rates run in retail and other frontline sectors, which multiplies the total quickly."),
      ("Why doesn't turnover cost show up clearly on the P&L?",
       f"Because it is scattered across line items — overtime, temp labor, lower sales per shift, manager hours — instead of appearing as one number. That is why leadership underinvests in retention. Making the cost visible is the first step; connecting people data to financial reporting, as in {IL('hr-as-a-financial-driver-turning-people-data-into-c-suite-business-intelligence','HR as a Financial Driver')}, turns it into a number the CFO acts on. {XL('https://www.shrm.org','SHRM')} offers benchmarks for cost-per-hire and turnover."),
      ("What actually reduces retail and frontline turnover?",
       f"Visible career paths, better scheduling, and a culture people want to stay in. Giving employees room to move internally is one of the highest-return levers — see {IL('beyond-hiring-the-case-for-internal-talent-mobility-as-a-growth-strategy','the case for internal talent mobility')} — and it reinforces a {IL('high-performance-culture','high-performance culture')}. It all depends on the workforce visibility to spot flight risk early, which we cover in {IL('workforce-visibility-gap','The Workforce Visibility Gap')}."),
    ],
    "related": [
      ("beyond-hiring-the-case-for-internal-talent-mobility-as-a-growth-strategy", "The Case for Internal Talent Mobility"),
      ("high-performance-culture", "Building a High-Performance Culture"),
      ("workforce-visibility-gap", "The Workforce Visibility Gap"),
    ],
  },
}


def intro_block(answer):
    return (
        f'{S_INTRO}\n'
        f'<div style="border-left:4px solid {ORANGE};background:{CREAM};padding:18px 22px;'
        f'margin:0 0 30px;border-radius:0 10px 10px 0;">'
        f'<p style="margin:0;font-size:1.06rem;line-height:1.65;color:{NAVY};">'
        f'<strong style="color:{ORANGE};">Quick answer:</strong> {answer}</p>'
        f'</div>\n{E_INTRO}'
    )


def faq_block(faqs, related):
    parts = [S_FAQ]
    parts.append(f'<h2 style="color:{NAVY};margin-top:44px;">Frequently asked questions</h2>')
    for q, a in faqs:
        parts.append(
            f'<div class="abg-faq" style="margin:0 0 22px;">'
            f'<h3 style="color:{NAVY};margin-bottom:8px;">{q}</h3>'
            f'<p style="line-height:1.65;">{a}</p></div>'
        )
    parts.append(f'<h3 style="color:{NAVY};margin-top:36px;">Related from Align HCM</h3>')
    parts.append('<ul style="line-height:1.9;">')
    for slug, label in related:
        parts.append(f'<li>{IL(slug, label)}</li>')
    parts.append('</ul>')
    parts.append(E_FAQ)
    return "\n".join(parts)


def strip_block(body, start, end):
    return re.sub(re.escape(start) + r".*?" + re.escape(end), "", body or "", flags=re.S).strip()


def build_graph(post, faqs):
    url = post.get("url") or (B + (post.get("slug") or ""))
    pub = post.get("publishDate") or post.get("created")
    mod = post.get("updated") or pub
    article = {
        "@type": "BlogPosting", "@id": url + "#article",
        "mainEntityOfPage": {"@type": "WebPage", "@id": url},
        "headline": clean(post.get("name")),
        "description": clean(post.get("metaDescription")),
        "datePublished": pub, "dateModified": mod, "author": ORG,
        "publisher": {"@type": "Organization", "name": "Align HCM",
                      "logo": {"@type": "ImageObject", "url": LOGO}},
        "url": url,
    }
    if post.get("featuredImage"):
        article["image"] = post["featuredImage"]
    graph = [article, {
        "@type": "FAQPage", "@id": url + "#faq",
        "mainEntity": [{"@type": "Question", "name": clean(q),
                        "acceptedAnswer": {"@type": "Answer", "text": clean(a)}}
                       for q, a in faqs],
    }]
    return {"@context": "https://schema.org", "@graph": graph}


def wrap_schema(graph):
    js = json.dumps(graph, indent=2, ensure_ascii=False)
    return f'{S_SCHEMA}\n<script type="application/ld+json">\n{js}\n</script>\n{E_SCHEMA}'


def merge_head(existing, block):
    existing = existing or ""
    if S_SCHEMA in existing and E_SCHEMA in existing:
        return re.sub(re.escape(S_SCHEMA) + r".*?" + re.escape(E_SCHEMA), block, existing, flags=re.S)
    return (existing + "\n" + block).strip()


def main():
    confirm = "--confirm" in sys.argv
    only = None
    if "--only" in sys.argv:
        only = sys.argv[sys.argv.index("--only") + 1]
    ids = [only] if only else list(POSTS.keys())
    for pid in ids:
        cfg = POSTS[pid]
        p = api("GET", f"/cms/v3/blogs/posts/{pid}", params={
            "property": "id,name,slug,url,metaDescription,publishDate,updated,featuredImage,postBody,headHtml"})
        name = p.get("name", "")
        body = p.get("postBody", "") or ""
        # remove any prior injected blocks so re-runs are clean/idempotent
        body = strip_block(body, S_INTRO, E_INTRO)
        body = strip_block(body, S_FAQ, E_FAQ)
        new_body = intro_block(cfg["answer"]) + "\n" + body + "\n" + faq_block(cfg["faqs"], cfg["related"])
        graph = build_graph(p, cfg["faqs"])
        new_head = merge_head(p.get("headHtml"), wrap_schema(graph))
        # counts
        internal = len(re.findall(r'href="https://www\.alignhcm\.com', faq_block(cfg["faqs"], cfg["related"]) + intro_block(cfg["answer"])))
        ext = len(re.findall(r'href="https?://(?!www\.alignhcm)', faq_block(cfg["faqs"], cfg["related"])))
        print(f"\n=== {name[:60]}")
        print(f"    +intro callout, +{len(cfg['faqs'])} FAQ, +{len(cfg['related'])} related, "
              f"internal≈{internal}, external≈{ext}, +FAQ/Article schema")
        if confirm:
            api("PATCH", f"/cms/v3/blogs/posts/{pid}", body={"postBody": new_body, "headHtml": new_head})
            print("    ✓ postBody + headHtml updated LIVE")
        else:
            # save a local render for the PDF/preview
            outdir = os.path.join(os.path.dirname(__file__), "content", "optimized")
            os.makedirs(outdir, exist_ok=True)
            with open(os.path.join(outdir, f"{pid}.html"), "w") as f:
                f.write(f"<h1>{name}</h1>\n" + new_body)
            with open(os.path.join(outdir, f"{pid}.head.html"), "w") as f:
                f.write(new_head)
    print(f"\n{'APPLIED LIVE' if confirm else 'DRY RUN'} — {len(ids)} post(s).")
    if not confirm:
        print("Local renders written to content/optimized/. Re-run with --confirm to write live.")


if __name__ == "__main__":
    main()
