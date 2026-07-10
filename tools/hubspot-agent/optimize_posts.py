#!/usr/bin/env python3
"""
AEO/GEO optimization for Tier-1 Align HCM blog posts.

For each target post this injects (idempotent, marker-wrapped, reversible):
  1. A short "Quick answer" direct-answer callout prepended to the body.
  2. A "Frequently asked questions" section appended, keyword-forward question
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
S_CTA, E_CTA = "<!-- align-aeo-cta:start -->", "<!-- align-aeo-cta:end -->"

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


def strip_internal(s):
    """Unwrap internal (alignhcm.com) links to plain text, keep external links."""
    return re.sub(r'<a href="https://www\.alignhcm\.com[^"]*">(.*?)</a>', r'\1', s)


# ---- internal + external link shorthands ----
B = "https://www.alignhcm.com/blog/"
def L(url, text):
    return f'<a href="{url}">{text}</a>'
def IL(slug, text):
    return L(B + slug, text)
def XL(url, text):
    return L(url, text)


# ---------------------------------------------------------------------------
# Per-post optimization content, TIGHTENED: answer-first, keyword-forward,
# ~half the previous length. Every answer leads with the direct answer and the
# target keyword, then one supporting sentence carrying links.
# ---------------------------------------------------------------------------
POSTS = {
  # UKG Rapid Hire
  "273813902025": {
    "answer": "UKG Rapid Hire automates screening, scheduling, and offers so high-volume teams hire in days instead of weeks, but the speed only holds up when the UKG configuration is set up correctly.",
    "faqs": [
      ("What is UKG Rapid Hire?",
       f"UKG Rapid Hire is UKG&rsquo;s high-volume hiring tool for sectors like retail, manufacturing, healthcare, and the public sector, where a slow process loses candidates to faster competitors. If you&rsquo;re weighing UKG for that scale, start with our {IL('the-strategic-buyers-guide-to-ukg','Strategic Buyer&rsquo;s Guide to UKG')}."),
      ("How does high-volume hiring automation cut time-to-hire?",
       f"It removes manual handoffs: knockout questions filter applicants instantly, self-scheduling ends recruiter phone tag, and offers fire the moment a candidate clears screening. With separations running in the millions monthly per {XL('https://www.bls.gov/jlt/','BLS JOLTS data')}, days saved per requisition add up fast across the {IL('the-ukg-ecosystem-advantage-why-open-apis-and-partner-networks-matter-for-long-term-success','UKG ecosystem')}."),
      ("What has to be configured for Rapid Hire to work?",
       f"Screening logic, requisition templates, approvals, and the integrations into onboarding and payroll, all tuned to your hiring volume. Rushed setups are where the speed breaks; see {IL('the-hidden-price-tag-why-diy-hcm-implementation-costs-more-than-you-think','why DIY HCM implementation costs more')}."),
    ],
    "related": [
      ("the-strategic-buyers-guide-to-ukg", "The Strategic Buyer&rsquo;s Guide to UKG"),
      ("the-ukg-ecosystem-advantage-why-open-apis-and-partner-networks-matter-for-long-term-success", "The UKG Ecosystem Advantage"),
      ("ukgs-approach-to-ai-why-human-centered-automation-matters-more-than-you-think", "UKG&rsquo;s Approach to AI: Human-Centered Automation"),
    ],
  },
  # 5 Critical HCM Implementation Mistakes
  "277255570131": {
    "answer": "The five mistakes that derail HCM implementations: dirty data, skipped process alignment, weak internal project leadership, afterthought training, and rushing go-live, all preventable.",
    "faqs": [
      ("Why do HCM implementations fail?",
       f"Most often because of dirty data, migrating inconsistent employee, payroll, and org records without cleaning them first. See our {IL('the-data-imperative-why-pre-conversion-data-cleaning-determines-hcm-success','Data Imperative')} and the {IL('data-conversion-checklist-what-to-prepare-before-migration','data conversion checklist')}; {XL('https://www.shrm.org','SHRM')} has broader HR-tech guidance."),
      ("How do I avoid these HCM implementation mistakes?",
       f"Sequence the work: clean data before mapping, align processes before configuring, and staff a real internal lead. Most {IL('the-most-common-challenges-with-hcm-implementations','common implementation challenges')} trace back to skipping those steps."),
      ("Is a faster implementation riskier?",
       f"No, a disciplined short project is often safer than a drawn-out one because scope stays tight. See {IL('why-fast-growing-companies-choose-6-week-implementations-over-18-month-enterprise-projects','why fast-growing companies choose 6-week implementations')}. The risk is skipping fundamentals to hit a date, not speed itself."),
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
       f"It&rsquo;s turning time-and-attendance data into decisions, overtime control, shift coverage, and labor costing, not just clocking hours. Getting it wrong creates {XL('https://www.dol.gov/agencies/whd/flsa','FLSA')} exposure; the same visibility gap hits all frontline teams (see {IL('workforce-visibility-gap','The Workforce Visibility Gap')})."),
      ("How does it reduce manufacturing labor costs?",
       f"By exposing where overtime concentrates, which shifts run short, and how absenteeism moves output. With labor tight per {XL('https://www.bls.gov/iag/tgs/iag31-33.htm','BLS manufacturing data')}, every scheduled hour counts, best paired with a platform built for complex time rules like UKG (our {IL('the-strategic-buyers-guide-to-ukg','UKG buyer&rsquo;s guide')})."),
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
    "answer": "UKG&rsquo;s &lsquo;human-centered automation&rsquo; means its AI supports managers rather than replacing judgment, automating scheduling, timekeeping, and insights while people keep the decisions.",
    "faqs": [
      ("What is human-centered AI in an HCM platform?",
       f"It&rsquo;s AI that surfaces recommendations and handles routine work while a human makes the call on hiring, pay, and exceptions. It matters because HR AI usually fails on adoption, not capability, see {IL('most-chros-are-buying-ai-tools-theyll-never-use','Why CHROs Buy AI Tools They Never Use')}; {XL('https://www.gartner.com/en/human-resources','Gartner')} makes the same point."),
      ("How is UKG&rsquo;s AI different from other platforms?",
       f"UKG embeds AI into the flows managers already use instead of bolting on a separate tool, which lowers the adoption barrier. Compare it with {IL('most-hcm-platforms-add-ai-features.-dayforce-built-its-platform-around-ai','how Dayforce built its platform around AI')}."),
      ("How do we get value from HCM AI features?",
       f"Through integration and clean data, not datasheet features, AI on disconnected data just makes noise. See {IL('ai-integration-with-hcm-systems','AI Integration With HCM Systems')}."),
    ],
    "related": [
      ("the-strategic-buyers-guide-to-ukg", "The Strategic Buyer&rsquo;s Guide to UKG"),
      ("most-chros-are-buying-ai-tools-theyll-never-use", "Why CHROs Buy AI Tools They Never Use"),
      ("most-hcm-platforms-add-ai-features.-dayforce-built-its-platform-around-ai", "Dayforce Built Its Platform Around AI"),
    ],
  },
  # Internal Talent Mobility (Beyond Hiring)
  "268058974957": {
    "answer": "Internal talent mobility, moving current employees into new roles and skills instead of always hiring outside, is one of the highest-return retention plays: faster fills, lower cost, and knowledge kept in-house.",
    "faqs": [
      ("What is internal talent mobility?",
       f"It&rsquo;s deliberately promoting, transferring, and reskilling current employees to fill needs. External hiring is slow and costly, and people who see an internal path stay longer, the {XL('https://learning.linkedin.com/resources/workplace-learning-report','LinkedIn Workplace Learning Report')} ranks growth opportunity a top retention driver. It ties straight to {IL('rethinking-strategic-workforce-planning','Strategic Workforce Planning')}."),
      ("How does internal mobility improve retention?",
       f"Turnover costs far more than the recruiting fee, lost productivity, ramp time, and knowledge. We quantify it in {IL('the-retention-equation-how-retail-turnover-costs-more-than-your-pl-reveals','The Retention Equation')}. A visible internal path is one of the cheapest fixes and reinforces a {IL('high-performance-culture','high-performance culture')}."),
      ("What does HR need to make it work?",
       f"Clean skills and role data, leadership buy-in, and the dollar case. When HR ties people data to financials, see {IL('hr-as-a-financial-driver-turning-people-data-into-c-suite-business-intelligence','HR as a Financial Driver')}, mobility becomes a budget line the CFO defends."),
    ],
    "related": [
      ("rethinking-strategic-workforce-planning", "Strategic Workforce Planning"),
      ("the-retention-equation-how-retail-turnover-costs-more-than-your-pl-reveals", "The Retention Equation"),
      ("high-performance-culture", "Building a High-Performance Culture"),
    ],
  },
  # UKG Ecosystem Advantage
  "277394134770": {
    "answer": "The UKG ecosystem advantage is that open APIs and a large partner network let UKG connect to your payroll, ERP, benefits, and analytics stack instead of locking you in, which protects the platform&rsquo;s value long term.",
    "faqs": [
      ("What is the UKG ecosystem advantage?",
       f"It&rsquo;s open APIs plus a mature partner marketplace, so UKG exchanges data cleanly with your other tools and offers pre-built connectors and certified help. See our {IL('the-strategic-buyers-guide-to-ukg','Strategic Buyer&rsquo;s Guide to UKG')}; {XL('https://www.ukg.com','UKG')} runs the marketplace and partner program."),
      ("Why do open APIs matter in an HCM platform?",
       f"They keep switching costs down, your HCM talks to the tools you already run instead of forcing rip-and-replace. See how integration choices play out in {IL('api-vs.-flat-file-integrations-choosing-your-hcm-ecosystem','API vs. flat-file integration')}."),
      ("How do I keep a UKG integration from breaking over time?",
       f"Governance: owned data mappings, monitored connections, and an update plan. This is where cross-platform projects struggle, see {IL('integrating-workday-with-ukg-why-teams-struggle-and-how-align-hcm-helps','why Workday and UKG integrations become a trust problem')}."),
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
       f"Report sprawl, every one-off request becomes a permanent report nobody maintains, and calculated fields pile up. The fix starts with how the platform is structured; see our {IL('the-strategic-buyers-guide-to-workday','Strategic Buyer&rsquo;s Guide to Workday')}."),
      ("How do I build a Workday reporting strategy that scales?",
       f"Start from the questions the C-suite asks monthly, define governed metrics, build dashboards on clean data, then retire redundant reports. When HR reporting maps to financial outcomes ({IL('hr-as-a-financial-driver-turning-people-data-into-c-suite-business-intelligence','HR as a Financial Driver')}) it earns budget; {XL('https://www.gartner.com/en/human-resources','Gartner')} ties analytics maturity to decisions, not report volume."),
      ("Are we missing value from Workday&rsquo;s AI features?",
       f"Likely, teams don&rsquo;t trust predictive features when the reporting foundation is shaky. See {IL('the-workday-ai-gap-most-organizations-dont-know-they-have','the Workday AI gap')}; {XL('https://www.workday.com','Workday')} analytics assume a governed data model underneath."),
    ],
    "related": [
      ("the-strategic-buyers-guide-to-workday", "The Strategic Buyer&rsquo;s Guide to Workday"),
      ("the-workday-ai-gap-most-organizations-dont-know-they-have", "The Workday AI Gap"),
      ("hr-as-a-financial-driver-turning-people-data-into-c-suite-business-intelligence", "HR as a Financial Driver"),
    ],
  },
  # Paylocity Time & Attendance ROI
  "277394451165": {
    "answer": "The hidden ROI in Paylocity&rsquo;s Time &amp; Attendance isn&rsquo;t tracking hours, it&rsquo;s the money recovered from less overtime leakage, fewer compliance penalties, and accurate labor costing, which often dwarfs the software cost.",
    "faqs": [
      ("What is the ROI of Paylocity Time &amp; Attendance?",
       f"It shows up in three places: catching unapproved overtime before it&rsquo;s paid, staying {XL('https://www.dol.gov/agencies/whd/flsa','FLSA')}-compliant, and costing labor accurately so scheduling improves. Most buyers never quantify those dollars. See the {IL('the-strategic-buyers-guide-to-paylocity','Strategic Buyer&rsquo;s Guide to Paylocity')}."),
      ("Why isn&rsquo;t our time and attendance delivering ROI?",
       f"Usually because pay rules, rounding, and approvals were left on defaults instead of your policies, so managers stop trusting the data. Same problem across frontline ops, see {IL('workforce-visibility-gap','The Workforce Visibility Gap')} and {IL('beyond-timekeeping-three-dimensions-of-manufacturing-workforce-intelligence','manufacturing workforce intelligence')}."),
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
       f"Far more than the recruiting fee, add lost productivity, ramp time, coverage overtime, and knowledge walking out, and it runs to a meaningful share of annual salary. {XL('https://www.bls.gov/jlt/','BLS JOLTS data')} shows how high separation rates run in retail."),
      ("Why doesn&rsquo;t turnover cost show up on the P&amp;L?",
       f"It&rsquo;s scattered across overtime, temp labor, lower sales per shift, and manager hours instead of one line, so leadership underinvests. Connecting people data to financials ({IL('hr-as-a-financial-driver-turning-people-data-into-c-suite-business-intelligence','HR as a Financial Driver')}) turns it into a number the CFO acts on; {XL('https://www.shrm.org','SHRM')} has cost-per-hire benchmarks."),
      ("What actually reduces retail turnover?",
       f"Visible career paths, better scheduling, and a culture people stay in. Internal movement is a top lever, see {IL('beyond-hiring-the-case-for-internal-talent-mobility-as-a-growth-strategy','the case for internal talent mobility')}, reinforced by a {IL('high-performance-culture','high-performance culture')} and the {IL('workforce-visibility-gap','visibility')} to spot flight risk early."),
    ],
    "related": [
      ("beyond-hiring-the-case-for-internal-talent-mobility-as-a-growth-strategy", "The Case for Internal Talent Mobility"),
      ("high-performance-culture", "Building a High-Performance Culture"),
      ("workforce-visibility-gap", "The Workforce Visibility Gap"),
    ],
  },
}


CONTACT = "https://www.alignhcm.com/contact"

# Contextual links woven into the EXISTING body prose (first sensible phrase,
# distributed top-to-bottom, one per paragraph). Mix of internal + external.
# Trimmed to ~3 internal + 1 external woven per post (Google-friendly, concentrates
# link equity). Internal targets first so they distribute through the body.
WEAVE = {
  "273813902025": [
    (B + "the-strategic-buyers-guide-to-ukg", ["Rapid Hire", "UKG Pro", "UKG"]),
    (B + "the-ukg-ecosystem-advantage-why-open-apis-and-partner-networks-matter-for-long-term-success", ["onboarding", "integration", "integrations", "payroll"]),
    (B + "ukgs-approach-to-ai-why-human-centered-automation-matters-more-than-you-think", ["automation", "artificial intelligence"]),
    ("https://www.bls.gov/jlt/", ["time-to-hire", "time to hire", "high-volume", "high volume"]),
  ],
  "277255570131": [
    (B + "the-data-imperative-why-pre-conversion-data-cleaning-determines-hcm-success", ["data migration", "data cleanup", "data quality", "data conversion"]),
    (B + "the-most-common-challenges-with-hcm-implementations", ["go-live", "go live", "implementation"]),
    (B + "the-hidden-price-tag-why-diy-hcm-implementation-costs-more-than-you-think", ["internal team", "project lead", "resources", "DIY"]),
    ("https://www.shrm.org", ["change management", "best practices", "project management"]),
  ],
  "268085670586": [
    (B + "workforce-visibility-gap", ["real-time", "visibility", "shop floor", "the floor"]),
    (B + "the-strategic-buyers-guide-to-ukg", ["scheduling", "timekeeping", "time and attendance"]),
    (B + "contingent-workforce-management-close-the-blind-spot", ["seasonal", "temporary", "contingent"]),
    ("https://www.dol.gov/agencies/whd/flsa", ["overtime", "compliance", "wage", "labor law"]),
  ],
  "277414866667": [
    (B + "the-strategic-buyers-guide-to-ukg", ["UKG"]),
    (B + "most-chros-are-buying-ai-tools-theyll-never-use", ["AI tools", "AI features", "artificial intelligence"]),
    (B + "ai-integration-with-hcm-systems", ["integration", "workflows", "clean data"]),
    ("https://www.gartner.com/en/human-resources", ["adoption", "managers", "recommendations"]),
  ],
  "268058974957": [
    (B + "the-retention-equation-how-retail-turnover-costs-more-than-your-pl-reveals", ["turnover", "retention", "retain"]),
    (B + "rethinking-strategic-workforce-planning", ["workforce planning", "skills", "roles"]),
    (B + "high-performance-culture", ["culture", "engagement"]),
    ("https://learning.linkedin.com/resources/workplace-learning-report", ["reskilling", "upskilling", "learning and development", "development"]),
  ],
  "277394134770": [
    (B + "the-strategic-buyers-guide-to-ukg", ["UKG"]),
    (B + "api-vs.-flat-file-integrations-choosing-your-hcm-ecosystem", ["open APIs", "APIs", "API", "integration"]),
    (B + "integrating-workday-with-ukg-why-teams-struggle-and-how-align-hcm-helps", ["data mapping", "connections", "integrations"]),
    ("https://www.ukg.com", ["marketplace", "partner network", "partners"]),
  ],
  "277394135777": [
    (B + "the-strategic-buyers-guide-to-workday", ["Workday"]),
    (B + "the-workday-ai-gap-most-organizations-dont-know-they-have", ["predictive", "machine learning", "artificial intelligence"]),
    (B + "hr-as-a-financial-driver-turning-people-data-into-c-suite-business-intelligence", ["C-suite", "CFO", "leadership", "financial"]),
    ("https://www.gartner.com/en/human-resources", ["analytics", "dashboards", "metrics"]),
  ],
  "277394451165": [
    (B + "the-strategic-buyers-guide-to-paylocity", ["Paylocity"]),
    (B + "workforce-visibility-gap", ["labor cost", "labor costing", "visibility", "scheduling"]),
    (B + "paylocity-training-implementation-methods", ["adoption", "training", "managers"]),
    ("https://www.dol.gov/agencies/whd/flsa", ["overtime", "compliance", "wage", "FLSA"]),
  ],
  "277376447190": [
    (B + "beyond-hiring-the-case-for-internal-talent-mobility-as-a-growth-strategy", ["internal mobility", "career path", "career", "promotion", "promote", "advancement"]),
    (B + "high-performance-culture", ["culture", "engaged", "engagement", "employees stay", "retain"]),
    (B + "hr-as-a-financial-driver-turning-people-data-into-c-suite-business-intelligence", ["P&L", "CFO", "bottom line", "finance", "financial"]),
    ("https://www.bls.gov/jlt/", ["separation", "turnover rate", "quit", "replace"]),
  ],
}

CTA = {
  "273813902025": ' <strong>Ready to hire faster?</strong> <a href="' + CONTACT + '">Talk to an Align HCM expert</a> about configuring UKG Rapid Hire around your real hiring volume.',
  "277255570131": ' <strong>Planning an HCM implementation?</strong> <a href="' + CONTACT + '">Talk to an Align HCM expert</a> to avoid these mistakes before they cost you.',
  "268085670586": ' <strong>Want your timekeeping to do more?</strong> <a href="' + CONTACT + '">Talk to an Align HCM expert</a> about turning floor data into workforce intelligence.',
  "277414866667": ' <strong>Getting real value from HCM AI?</strong> <a href="' + CONTACT + '">Talk to an Align HCM expert</a> about configuring UKG&rsquo;s AI around your workflows.',
  "268058974957": ' <strong>Losing good people?</strong> <a href="' + CONTACT + '">Talk to an Align HCM expert</a> about building an internal mobility program that keeps them.',
  "277394134770": ' <strong>Need UKG connected to your stack?</strong> <a href="' + CONTACT + '">Talk to an Align HCM expert</a> about your integrations and ecosystem.',
  "277394135777": ' <strong>Reporting a mess?</strong> <a href="' + CONTACT + '">Talk to an Align HCM expert</a> about rebuilding your Workday reporting foundation.',
  "277394451165": ' <strong>Leaving money on the table?</strong> <a href="' + CONTACT + '">Talk to an Align HCM expert</a> about tuning Paylocity Time &amp; Attendance to your pay rules.',
  "277376447190": ' <strong>Turnover hurting your P&amp;L?</strong> <a href="' + CONTACT + '">Talk to an Align HCM expert</a> about a retention strategy that pays for itself.',
}


def weave_links(body, targets, contact_url, cta_html):
    """Weave contextual links into existing prose (one per text segment, top-to-bottom)
    and append a Contact CTA to the last paragraph. Idempotent: skips a target whose
    URL is already linked, and skips the CTA if the contact URL is already present."""
    toks = re.split(r'(<[^>]+>)', body)
    def is_text(i):
        return i % 2 == 0
    inside = [False] * len(toks)
    depth = 0
    for i, t in enumerate(toks):
        if is_text(i):
            inside[i] = depth > 0
        elif re.match(r'<a\b', t, re.I):
            inside[i] = depth > 0
            depth += 1
        elif re.match(r'</a\s*>', t, re.I):
            depth = max(0, depth - 1)
            inside[i] = depth > 0
        else:
            inside[i] = depth > 0
    # eligible (visible, not-already-linked) text segments
    elig = [i for i in range(len(toks)) if is_text(i) and not inside[i] and toks[i].strip()]
    n = max(1, len(targets))
    for ti, (url, phrases) in enumerate(targets):
        if f'href="{url}"' in "".join(toks):
            continue
        # start each target in a different region so links spread THROUGHOUT the body
        start = int(ti * len(elig) / n) if elig else 0
        seq = elig[start:] + elig[:start]
        placed = False
        for i in seq:
            if inside[i] or not toks[i].strip():
                continue
            for ph in phrases:
                m = re.search(r'(?<![\w-])' + re.escape(ph) + r'(?![\w-])', toks[i], re.I)
                if m:
                    s, e = m.span()
                    toks[i] = toks[i][:s] + f'<a href="{url}">' + toks[i][s:e] + '</a>' + toks[i][e:]
                    inside[i] = True  # one woven link per segment -> natural spread
                    placed = True
                    break
            if placed:
                break
    body = "".join(toks)
    if cta_html and contact_url not in body:
        cta = f"{S_CTA}{cta_html}{E_CTA}"
        idx = body.rfind("</p>")
        if idx != -1:
            body = body[:idx] + cta + body[idx:]
        else:
            body = body + f"<p>{cta}</p>"
    return body


def reset_body(body):
    """Return clean original prose: strip injected blocks, remove any prior Contact
    CTA (marked or legacy), and unwrap all previously-woven anchors. Safe because the
    source posts had zero links, so every anchor present was inserted by this tool."""
    body = strip_block(body, S_INTRO, E_INTRO)
    body = strip_block(body, S_FAQ, E_FAQ)
    body = strip_block(body, S_CTA, E_CTA)
    # legacy (unmarked) Contact CTA sentence
    body = re.sub(r'\s*(<strong>[^<]*</strong>\s*)?<a href="[^"]*/contact[^"]*"[^>]*>[^<]*</a>[^<]*?\.', '', body)
    # unwrap remaining woven anchors (internal + external)
    body = re.sub(r'<a\b[^>]*>(.*?)</a>', r'\1', body, flags=re.S | re.I)
    return body.strip()


def intro_block(answer):
    return (
        f'{S_INTRO}\n'
        f'<div style="border-left:4px solid {ORANGE};background:{CREAM};padding:16px 20px;'
        f'margin:0 0 28px;border-radius:0 10px 10px 0;">'
        f'<p style="margin:0;font-size:1.05rem;line-height:1.6;color:{NAVY};">'
        f'<strong style="color:{ORANGE};">Quick answer:</strong> {answer}</p>'
        f'</div>\n{E_INTRO}'
    )


def faq_block(faqs, related=None):
    # Internal links removed from FAQ answers (external citations kept); the "Related"
    # list is dropped, internal linking now lives in the woven body (2-3 per post).
    parts = [S_FAQ]
    parts.append(f'<h2 style="color:{NAVY};margin-top:44px;">Frequently asked questions</h2>')
    for q, a in faqs:
        parts.append(
            f'<div class="abg-faq" style="margin:0 0 22px;">'
            f'<h3 style="color:{NAVY};margin-bottom:8px;">{q}</h3>'
            f'<p style="line-height:1.65;">{strip_internal(a)}</p></div>'
        )
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
        body = reset_body(body)
        woven = weave_links(body, WEAVE.get(pid, []), CONTACT, CTA.get(pid))
        body_links = len(re.findall(r'<a href="', woven)) - len(re.findall(r'<a href="', body))
        new_body = intro_block(cfg["answer"]) + "\n" + woven + "\n" + faq_block(cfg["faqs"], cfg["related"])
        graph = build_graph(p, cfg["faqs"])
        new_head = merge_head(p.get("headHtml"), wrap_schema(graph))
        internal = len(re.findall(r'href="https://www\.alignhcm\.com', new_body))
        ext = len(re.findall(r'href="https?://(?!www\.alignhcm)', new_body))
        contact_ok = CONTACT in new_body
        print(f"\n=== {name[:60]}")
        blog_internal = len(re.findall(r'href="https://www\.alignhcm\.com/blog', new_body))
        print(f"    +intro, +{len(cfg['faqs'])} FAQ, +{body_links} woven in-body | "
              f"content internal~{blog_internal} (+contact CTA: {'yes' if contact_ok else 'NO'}), "
              f"external~{ext} | +schema")
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
    print(f"\n{'APPLIED LIVE' if confirm else 'DRY RUN'}, {len(ids)} post(s).")
    if not confirm:
        print("Local renders written to content/optimized/. Re-run with --confirm to write live.")


if __name__ == "__main__":
    main()
