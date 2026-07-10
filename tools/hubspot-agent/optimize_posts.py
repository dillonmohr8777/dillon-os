#!/usr/bin/env python3
"""
AEO/GEO optimization for Tier-1 Align HCM blog posts.

For each target post this injects (idempotent, marker-wrapped, reversible):
  1. A short "Quick answer" direct-answer callout prepended to the body.
  2. A "Frequently asked questions" section appended — keyword-forward question
     headings with tight, answer-first responses carrying INTERNAL + EXTERNAL links.
  3. A "Related from Align HCM" internal-link cluster.
  4. BlogPosting + FAQPage JSON-LD schema in headHtml (built from the visible FAQ).

Body additions never touch existing prose. Markers:
  <!-- align-aeo-intro:start --> ... <!-- align-aeo-intro:end -->   (prepended)
  <!-- align-aeo-faq:start -->   ... <!-- align-aeo-faq:end -->     (appended)
Schema uses <!-- align-aeo-schema --> markers.

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
def L(url, text):
    return f'<a href="{url}">{text}</a>'
def IL(slug, text):
    return L(B + slug, text)
def XL(url, text):
    return L(url, text)


# ---------------------------------------------------------------------------
# Per-post optimization content — TIGHTENED: answer-first, keyword-forward,
# ~half the previous length. Every answer leads with the direct answer and the
# target keyword, then one supporting sentence carrying links.
# ---------------------------------------------------------------------------
POSTS = {
  # UKG Rapid Hire
  "273813902025": {
    "answer": "UKG Rapid Hire automates screening, scheduling, and offers so high-volume teams hire in days instead of weeks &mdash; but the speed only holds up when the UKG configuration is set up correctly.",
    "faqs": [
      ("What is UKG Rapid Hire?",
       f"UKG Rapid Hire is UKG&rsquo;s high-volume hiring tool for sectors like retail, manufacturing, healthcare, and the public sector, where a slow process loses candidates to faster competitors. If you&rsquo;re weighing UKG for that scale, start with our {IL('the-strategic-buyers-guide-to-ukg','Strategic Buyer&rsquo;s Guide to UKG')}."),
      ("How does high-volume hiring automation cut time-to-hire?",
       f"It removes manual handoffs: knockout questions filter applicants instantly, self-scheduling ends recruiter phone tag, and offers fire the moment a candidate clears screening. With separations running in the millions monthly per {XL('https://www.bls.gov/jlt/','BLS JOLTS data')}, days saved per requisition add up fast across the {IL('the-ukg-ecosystem-advantage-why-open-apis-and-partner-networks-matter-for-long-term-success','UKG ecosystem')}."),
      ("What has to be configured for Rapid Hire to work?",
       f"Screening logic, requisition templates, approvals, and the integrations into onboarding and payroll &mdash; all tuned to your hiring volume. Rushed setups are where the speed breaks; see {IL('the-hidden-price-tag-why-diy-hcm-implementation-costs-more-than-you-think','why DIY HCM implementation costs more')}."),
    ],
    "related": [
      ("the-strategic-buyers-guide-to-ukg", "The Strategic Buyer&rsquo;s Guide to UKG"),
      ("the-ukg-ecosystem-advantage-why-open-apis-and-partner-networks-matter-for-long-term-success", "The UKG Ecosystem Advantage"),
      ("ukgs-approach-to-ai-why-human-centered-automation-matters-more-than-you-think", "UKG&rsquo;s Approach to AI: Human-Centered Automation"),
    ],
  },
  # 5 Critical HCM Implementation Mistakes
  "277255570131": {
    "answer": "The five mistakes that derail HCM implementations: dirty data, skipped process alignment, weak internal project leadership, afterthought training, and rushing go-live &mdash; all preventable.",
    "faqs": [
      ("Why do HCM implementations fail?",
       f"Most often because of dirty data &mdash; migrating inconsistent employee, payroll, and org records without cleaning them first. See our {IL('the-data-imperative-why-pre-conversion-data-cleaning-determines-hcm-success','Data Imperative')} and the {IL('data-conversion-checklist-what-to-prepare-before-migration','data conversion checklist')}; {XL('https://www.shrm.org','SHRM')} has broader HR-tech guidance."),
      ("How do I avoid these HCM implementation mistakes?",
       f"Sequence the work: clean data before mapping, align processes before configuring, and staff a real internal lead. Most {IL('the-most-common-challenges-with-hcm-implementations','common implementation challenges')} trace back to skipping those steps."),
      ("Is a faster implementation riskier?",
       f"No &mdash; a disciplined short project is often safer than a drawn-out one because scope stays tight. See {IL('why-fast-growing-companies-choose-6-week-implementations-over-18-month-enterprise-projects','why fast-growing companies choose 6-week implementations')}. The risk is skipping fundamentals to hit a date, not speed itself."),
    ],
    "related": [
      ("the-data-imperative-why-pre-conversion-data-cleaning-determines-hcm-success", "The Data Imperative"),
      ("the-hidden-price-tag-why-diy-hcm-implementation-costs-more-than-you-think", "Why DIY HCM Implementation Costs More"),
      ("the-most-common-challenges-with-hcm-implementations", "Common Challenges with HCM Implementations"),
    ],
  },
  # Manufacturing Timekeeping
  "268085670586": {
    "answer": "Manufacturing timekeeping now spans three things: accurate labor capture for compliance, real-time floor visibility, and workforce intelligence that ties hours to productivity and cost.",
    "faqs": [
      ("What is manufacturing workforce intelligence?",
       f"It&rsquo;s turning time-and-attendance data into decisions &mdash; overtime control, shift coverage, and labor costing &mdash; not just clocking hours. Getting it wrong creates {XL('https://www.dol.gov/agencies/whd/flsa','FLSA')} exposure; the same visibility gap hits all frontline teams (see {IL('workforce-visibility-gap','The Workforce Visibility Gap')})."),
      ("How does it reduce manufacturing labor costs?",
       f"By exposing where overtime concentrates, which shifts run short, and how absenteeism moves output. With labor tight per {XL('https://www.bls.gov/iag/tgs/iag31-33.htm','BLS manufacturing data')}, every scheduled hour counts &mdash; best paired with a platform built for complex time rules like UKG (our {IL('the-strategic-buyers-guide-to-ukg','UKG buyer&rsquo;s guide')})."),
      ("What about contingent and seasonal workers?",
       f"That&rsquo;s where timekeeping breaks down most, since those workers often sit outside the core system. We cover closing it in {IL('contingent-workforce-management-close-the-blind-spot','Contingent Workforce Management')}."),
    ],
    "related": [
      ("workforce-visibility-gap", "The Workforce Visibility Gap"),
      ("the-retention-equation-how-retail-turnover-costs-more-than-your-pl-reveals", "The Retention Equation"),
      ("contingent-workforce-management-close-the-blind-spot", "Contingent Workforce Management"),
    ],
  },
  # UKG Human-Centered AI
  "277414866667": {
    "answer": "UKG&rsquo;s &lsquo;human-centered automation&rsquo; means its AI supports managers rather than replacing judgment &mdash; automating scheduling, timekeeping, and insights while people keep the decisions.",
    "faqs": [
      ("What is human-centered AI in an HCM platform?",
       f"It&rsquo;s AI that surfaces recommendations and handles routine work while a human makes the call on hiring, pay, and exceptions. It matters because HR AI usually fails on adoption, not capability &mdash; see {IL('most-chros-are-buying-ai-tools-theyll-never-use','Why CHROs Buy AI Tools They Never Use')}; {XL('https://www.gartner.com/en/human-resources','Gartner')} makes the same point."),
      ("How is UKG&rsquo;s AI different from other platforms?",
       f"UKG embeds AI into the flows managers already use instead of bolting on a separate tool, which lowers the adoption barrier. Compare it with {IL('most-hcm-platforms-add-ai-features.-dayforce-built-its-platform-around-ai','how Dayforce built its platform around AI')}."),
      ("How do we get value from HCM AI features?",
       f"Through integration and clean data, not datasheet features &mdash; AI on disconnected data just makes noise. See {IL('ai-integration-with-hcm-systems','AI Integration With HCM Systems')}."),
    ],
    "related": [
      ("the-strategic-buyers-guide-to-ukg", "The Strategic Buyer&rsquo;s Guide to UKG"),
      ("most-chros-are-buying-ai-tools-theyll-never-use", "Why CHROs Buy AI Tools They Never Use"),
      ("most-hcm-platforms-add-ai-features.-dayforce-built-its-platform-around-ai", "Dayforce Built Its Platform Around AI"),
    ],
  },
  # Internal Talent Mobility (Beyond Hiring)
  "268058974957": {
    "answer": "Internal talent mobility &mdash; moving current employees into new roles and skills instead of always hiring outside &mdash; is one of the highest-return retention plays: faster fills, lower cost, and knowledge kept in-house.",
    "faqs": [
      ("What is internal talent mobility?",
       f"It&rsquo;s deliberately promoting, transferring, and reskilling current employees to fill needs. External hiring is slow and costly, and people who see an internal path stay longer &mdash; the {XL('https://learning.linkedin.com/resources/workplace-learning-report','LinkedIn Workplace Learning Report')} ranks growth opportunity a top retention driver. It ties straight to {IL('rethinking-strategic-workforce-planning','Strategic Workforce Planning')}."),
      ("How does internal mobility improve retention?",
       f"Turnover costs far more than the recruiting fee &mdash; lost productivity, ramp time, and knowledge. We quantify it in {IL('the-retention-equation-how-retail-turnover-costs-more-than-your-pl-reveals','The Retention Equation')}. A visible internal path is one of the cheapest fixes and reinforces a {IL('high-performance-culture','high-performance culture')}."),
      ("What does HR need to make it work?",
       f"Clean skills and role data, leadership buy-in, and the dollar case. When HR ties people data to financials &mdash; see {IL('hr-as-a-financial-driver-turning-people-data-into-c-suite-business-intelligence','HR as a Financial Driver')} &mdash; mobility becomes a budget line the CFO defends."),
    ],
    "related": [
      ("rethinking-strategic-workforce-planning", "Strategic Workforce Planning"),
      ("the-retention-equation-how-retail-turnover-costs-more-than-your-pl-reveals", "The Retention Equation"),
      ("high-performance-culture", "Building a High-Performance Culture"),
    ],
  },
  # UKG Ecosystem Advantage
  "277394134770": {
    "answer": "The UKG ecosystem advantage is that open APIs and a large partner network let UKG connect to your payroll, ERP, benefits, and analytics stack instead of locking you in &mdash; which protects the platform&rsquo;s value long term.",
    "faqs": [
      ("What is the UKG ecosystem advantage?",
       f"It&rsquo;s open APIs plus a mature partner marketplace, so UKG exchanges data cleanly with your other tools and offers pre-built connectors and certified help. See our {IL('the-strategic-buyers-guide-to-ukg','Strategic Buyer&rsquo;s Guide to UKG')}; {XL('https://www.ukg.com','UKG')} runs the marketplace and partner program."),
      ("Why do open APIs matter in an HCM platform?",
       f"They keep switching costs down &mdash; your HCM talks to the tools you already run instead of forcing rip-and-replace. See how integration choices play out in {IL('api-vs.-flat-file-integrations-choosing-your-hcm-ecosystem','API vs. flat-file integration')}."),
      ("How do I keep a UKG integration from breaking over time?",
       f"Governance: owned data mappings, monitored connections, and an update plan. This is where cross-platform projects struggle &mdash; see {IL('integrating-workday-with-ukg-why-teams-struggle-and-how-align-hcm-helps','why Workday and UKG integrations become a trust problem')}."),
    ],
    "related": [
      ("the-strategic-buyers-guide-to-ukg", "The Strategic Buyer&rsquo;s Guide to UKG"),
      ("api-vs.-flat-file-integrations-choosing-your-hcm-ecosystem", "API vs. Flat-File Integration"),
      ("ukgs-approach-to-ai-why-human-centered-automation-matters-more-than-you-think", "UKG&rsquo;s Approach to AI"),
    ],
  },
  # Workday Reporting Strategy
  "277394135777": {
    "answer": "Most Workday reporting strategies are backwards: teams build hundreds of custom reports to answer questions after the fact instead of designing a few governed metrics around the decisions leadership actually makes.",
    "faqs": [
      ("Why is my Workday reporting so slow and cluttered?",
       f"Report sprawl &mdash; every one-off request becomes a permanent report nobody maintains, and calculated fields pile up. The fix starts with how the platform is structured; see our {IL('the-strategic-buyers-guide-to-workday','Strategic Buyer&rsquo;s Guide to Workday')}."),
      ("How do I build a Workday reporting strategy that scales?",
       f"Start from the questions the C-suite asks monthly, define governed metrics, build dashboards on clean data, then retire redundant reports. When HR reporting maps to financial outcomes ({IL('hr-as-a-financial-driver-turning-people-data-into-c-suite-business-intelligence','HR as a Financial Driver')}) it earns budget; {XL('https://www.gartner.com/en/human-resources','Gartner')} ties analytics maturity to decisions, not report volume."),
      ("Are we missing value from Workday&rsquo;s AI features?",
       f"Likely &mdash; teams don&rsquo;t trust predictive features when the reporting foundation is shaky. See {IL('the-workday-ai-gap-most-organizations-dont-know-they-have','the Workday AI gap')}; {XL('https://www.workday.com','Workday')} analytics assume a governed data model underneath."),
    ],
    "related": [
      ("the-strategic-buyers-guide-to-workday", "The Strategic Buyer&rsquo;s Guide to Workday"),
      ("the-workday-ai-gap-most-organizations-dont-know-they-have", "The Workday AI Gap"),
      ("hr-as-a-financial-driver-turning-people-data-into-c-suite-business-intelligence", "HR as a Financial Driver"),
    ],
  },
  # Paylocity Time & Attendance ROI
  "277394451165": {
    "answer": "The hidden ROI in Paylocity&rsquo;s Time &amp; Attendance isn&rsquo;t tracking hours &mdash; it&rsquo;s the money recovered from less overtime leakage, fewer compliance penalties, and accurate labor costing, which often dwarfs the software cost.",
    "faqs": [
      ("What is the ROI of Paylocity Time &amp; Attendance?",
       f"It shows up in three places: catching unapproved overtime before it&rsquo;s paid, staying {XL('https://www.dol.gov/agencies/whd/flsa','FLSA')}-compliant, and costing labor accurately so scheduling improves. Most buyers never quantify those dollars. See the {IL('the-strategic-buyers-guide-to-paylocity','Strategic Buyer&rsquo;s Guide to Paylocity')}."),
      ("Why isn&rsquo;t our time and attendance delivering ROI?",
       f"Usually because pay rules, rounding, and approvals were left on defaults instead of your policies, so managers stop trusting the data. Same problem across frontline ops &mdash; see {IL('workforce-visibility-gap','The Workforce Visibility Gap')} and {IL('beyond-timekeeping-three-dimensions-of-manufacturing-workforce-intelligence','manufacturing workforce intelligence')}."),
      ("How do we get more from our Paylocity investment?",
       f"Tie time data to decisions, train managers on the workflows they use, and revisit config as policies change. Our {IL('paylocity-training-implementation-methods','Paylocity training methods')} covers adoption; {IL('paylocity-vs-paycheck-best-platform','Paylocity vs. Paychex')} helps if you&rsquo;re still comparing."),
    ],
    "related": [
      ("the-strategic-buyers-guide-to-paylocity", "The Strategic Buyer&rsquo;s Guide to Paylocity"),
      ("paylocity-training-implementation-methods", "Paylocity Training &amp; Implementation"),
      ("workforce-visibility-gap", "The Workforce Visibility Gap"),
    ],
  },
  # Retention Equation (retail turnover)
  "277376447190": {
    "answer": "Retail turnover costs more than your P&amp;L shows: recruiting is the visible part, but lost productivity, manager time, coverage gaps, and weaker customer experience make each exit cost a big share of that role&rsquo;s pay.",
    "faqs": [
      ("How much does employee turnover cost?",
       f"Far more than the recruiting fee &mdash; add lost productivity, ramp time, coverage overtime, and knowledge walking out, and it runs to a meaningful share of annual salary. {XL('https://www.bls.gov/jlt/','BLS JOLTS data')} shows how high separation rates run in retail."),
      ("Why doesn&rsquo;t turnover cost show up on the P&amp;L?",
       f"It&rsquo;s scattered across overtime, temp labor, lower sales per shift, and manager hours instead of one line &mdash; so leadership underinvests. Connecting people data to financials ({IL('hr-as-a-financial-driver-turning-people-data-into-c-suite-business-intelligence','HR as a Financial Driver')}) turns it into a number the CFO acts on; {XL('https://www.shrm.org','SHRM')} has cost-per-hire benchmarks."),
      ("What actually reduces retail turnover?",
       f"Visible career paths, better scheduling, and a culture people stay in. Internal movement is a top lever &mdash; see {IL('beyond-hiring-the-case-for-internal-talent-mobility-as-a-growth-strategy','the case for internal talent mobility')} &mdash; reinforced by a {IL('high-performance-culture','high-performance culture')} and the {IL('workforce-visibility-gap','visibility')} to spot flight risk early."),
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
        f'<div style="border-left:4px solid {ORANGE};background:{CREAM};padding:16px 20px;'
        f'margin:0 0 28px;border-radius:0 10px 10px 0;">'
        f'<p style="margin:0;font-size:1.05rem;line-height:1.6;color:{NAVY};">'
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
        body = strip_block(body, S_INTRO, E_INTRO)
        body = strip_block(body, S_FAQ, E_FAQ)
        new_body = intro_block(cfg["answer"]) + "\n" + body + "\n" + faq_block(cfg["faqs"], cfg["related"])
        graph = build_graph(p, cfg["faqs"])
        new_head = merge_head(p.get("headHtml"), wrap_schema(graph))
        block_txt = faq_block(cfg["faqs"], cfg["related"]) + intro_block(cfg["answer"])
        internal = len(re.findall(r'href="https://www\.alignhcm\.com', block_txt))
        ext = len(re.findall(r'href="https?://(?!www\.alignhcm)', faq_block(cfg["faqs"], cfg["related"])))
        words = len(re.sub(r'<[^>]+>', ' ', block_txt).split())
        print(f"\n=== {name[:60]}")
        print(f"    +intro, +{len(cfg['faqs'])} FAQ, +{len(cfg['related'])} related | "
              f"added words~{words} | internal~{internal}, external~{ext} | +schema")
        if confirm:
            api("PATCH", f"/cms/v3/blogs/posts/{pid}", body={"postBody": new_body, "headHtml": new_head})
            print("    ✓ postBody + headHtml updated LIVE")
        else:
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
