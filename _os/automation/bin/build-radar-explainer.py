#!/usr/bin/env python3
"""
Build the NeedMomentum "exactly what it does" explainer for the Prospect Radar.

The build report (build-radar-report.py) is retrospective: process, calibration,
what broke. This document is the other one people actually ask for — Mac's
"where does it pull and grade from" — answered start to finish in present tense.

Brand tokens are the same measured values the dashboard uses (lib/brand.js).
Facts are computed live from the registry at build time, so the PDF can never
drift from what the dashboard says.
"""
import datetime
import json
import os

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (BaseDocTemplate, CondPageBreak, Frame, KeepTogether,
                                NextPageTemplate, PageBreak, PageTemplate,
                                Paragraph, Spacer, Table, TableStyle)

REPO = "/home/user/dillon-os"
MARK = os.path.join(REPO, "_os/automation/assets/needmomentum-mark.png")
REGISTRY = os.path.join(REPO, "12_Brain/state/radar/registry.json")
# The private layer, same reasoning as the build report: this document carries an
# internal-use notice and Daily-Briefs is tracked in a PUBLIC repository.
OUT = os.environ.get("RADAR_EXPLAINER_OUT",
                     os.path.join(REPO, "12_Brain/private/Prospect-Radar-How-It-Works.pdf"))
TODAY = datetime.date.today().isoformat()

# --- facts, computed live ----------------------------------------------------
rows = list(json.load(open(REGISTRY))["prospects"].values())
graded = [p for p in rows if p.get("current")]
total = len(rows)


def count(pred):
    return sum(1 for p in graded if pred(p))


V = {}
for p in graded:
    v = p["current"].get("verdict") or "?"
    V[v] = V.get(v, 0) + 1
# Mean over rows that actually have a score. Rows routed to `enrich` carry a
# verdict but a null sqs; averaging them in as zero would print a mean three
# points below the one the dashboard shows, and the two must never disagree.
scored = [p["current"]["sqs"] for p in graded
          if isinstance(p["current"].get("sqs"), (int, float))]
mean_q = round(sum(scored) / max(len(scored), 1))
tier1 = count(lambda p: (p["current"].get("tier") or 0) >= 1)
rebuild_rows = [p for p in graded if p["current"].get("verdict") == "rebuild"]
buildable = sum(1 for p in rebuild_rows
                if (p.get("imagery") or {}).get("checked") and p["imagery"].get("buildable"))
zero_photo = sum(1 for p in rebuild_rows
                 if (p.get("imagery") or {}).get("checked") and p["imagery"].get("usable") == 0)
contact_checked = sum(1 for p in rows if (p.get("contact") or {}).get("checked"))
contact_email = sum(1 for p in rows if (p.get("contact") or {}).get("has_email"))

# --- brand -------------------------------------------------------------------
BLUE = colors.HexColor("#2A80C2")
BLUE_INK = colors.HexColor("#1F5F90")
GOLD = colors.HexColor("#FFC63B")
INK = colors.HexColor("#111823")
MID = colors.HexColor("#4A5769")
FAINT = colors.HexColor("#7A8798")
RULE = colors.HexColor("#DDE5EE")
PANEL = colors.HexColor("#F4F7FA")
S_BROKEN = colors.HexColor("#A63D2F")
S_DECAYED = colors.HexColor("#B15B28")
S_DATED = colors.HexColor("#6E5A1C")
S_UNCONF = colors.HexColor("#6B6F8C")
S_STRONG = colors.HexColor("#1F7A5E")

PW, PH = LETTER
LM = RM = 0.85 * inch
TM = 0.95 * inch
BM = 0.85 * inch
CW = PW - LM - RM
COVER_W = PW - 1.95 * inch - RM


def st(name, **kw):
    base = dict(fontName="Helvetica", fontSize=9.6, leading=14.2, textColor=INK,
                alignment=TA_LEFT, spaceAfter=7)
    base.update(kw)
    return ParagraphStyle(name, **base)


H2 = st("H2", fontName="Helvetica-Bold", fontSize=14.5, leading=18, spaceBefore=16,
        spaceAfter=6, textColor=INK)
H3 = st("H3", fontName="Helvetica-Bold", fontSize=10.6, leading=14, spaceBefore=11,
        spaceAfter=3, textColor=BLUE_INK)
BODY = st("BODY")
LEAD = st("LEAD", fontSize=10.6, leading=15.6, textColor=MID, spaceAfter=10)
SUB = st("SUB", fontSize=11.5, leading=16, textColor=MID, spaceAfter=16)
EYE = st("EYE", fontName="Helvetica-Bold", fontSize=7.6, leading=10, textColor=BLUE,
         spaceAfter=3)
SMALL = st("SMALL", fontSize=8.4, leading=12, textColor=MID)
TINY = st("TINY", fontSize=7.6, leading=10.4, textColor=FAINT)
CELL = st("CELL", fontSize=8.4, leading=11.6, spaceAfter=0)
CELLB = st("CELLB", fontSize=8.4, leading=11.6, spaceAfter=0, fontName="Helvetica-Bold")
CELLH = st("CELLH", fontSize=7.4, leading=10, spaceAfter=0, fontName="Helvetica-Bold",
           textColor=colors.white)


def bullets(items, style=BODY, gap=3):
    out = []
    for it in items:
        out.append(Paragraph(f'<font color="#2A80C2">&bull;</font>&nbsp;&nbsp;{it}', style))
        out.append(Spacer(1, gap))
    return out


def kv_table(data_rows, widths=None, header=None, align_right_cols=()):
    data = []
    if header:
        data.append([Paragraph(h, CELLH) for h in header])
    for r in data_rows:
        data.append([Paragraph(str(c), CELLB if i == 0 and not header else CELL)
                     for i, c in enumerate(r)])
    widths = widths or [CW / len(data[0])] * len(data[0])
    t = Table(data, colWidths=widths, hAlign="LEFT")
    style = [
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("LINEBELOW", (0, 0), (-1, -2), 0.4, RULE),
    ]
    if header:
        style += [("BACKGROUND", (0, 0), (-1, 0), BLUE),
                  ("LINEBELOW", (0, 0), (-1, 0), 0, colors.white),
                  ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, PANEL])]
    for c in align_right_cols:
        style.append(("ALIGN", (c, 0), (c, -1), "RIGHT"))
    t.setStyle(TableStyle(style))
    return t


def bar_row(label, n, total_n, color, note=""):
    frac = (n / total_n) if total_n else 0
    bw = 2.5 * inch
    filled = (bw * frac) if n else 0
    bar = Table([[""]], colWidths=[max(filled, 0.01)], rowHeights=[7])
    bar.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1),
                              color if n else colors.HexColor("#EAF0F6")),
                             ("LEFTPADDING", (0, 0), (-1, -1), 0),
                             ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                             ("TOPPADDING", (0, 0), (-1, -1), 0),
                             ("BOTTOMPADDING", (0, 0), (-1, -1), 0)]))
    track = Table([[bar]], colWidths=[bw], rowHeights=[7], hAlign="LEFT")
    track.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#EAF0F6")),
                               ("LEFTPADDING", (0, 0), (-1, -1), 0),
                               ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                               ("TOPPADDING", (0, 0), (-1, -1), 0),
                               ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
                               ("VALIGN", (0, 0), (-1, -1), "MIDDLE")]))
    return [Paragraph(label, CELL), track,
            Paragraph(f"<b>{n}</b>{'  ' + note if note else ''}", CELL)]


def bar_chart(chart_rows, total_n):
    data = [bar_row(l, n, total_n, c, note) for (l, n, c, note) in chart_rows]
    t = Table(data, colWidths=[1.7 * inch, 2.6 * inch, 1.5 * inch], hAlign="LEFT")
    t.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 3.5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3.5),
        ("LEFTPADDING", (0, 0), (0, -1), 0),
    ]))
    return t


def stat_cards(cards, width=None):
    W = width or CW
    cells = []
    for value, label, color in cards:
        inner = Table(
            [[""], [Paragraph(f'<font size="21" color="#{color.hexval()[2:]}">'
                              f'<b>{value}</b></font>', CELL)],
             [Paragraph(label, TINY)]],
            colWidths=[W / len(cards) - 8], rowHeights=[2.6, 26, 22])
        inner.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (0, 0), color),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ("TOPPADDING", (0, 1), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ]))
        cells.append(inner)
    t = Table([cells], colWidths=[W / len(cards)] * len(cards), hAlign="LEFT")
    t.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"),
                           ("LEFTPADDING", (0, 0), (-1, -1), 0),
                           ("RIGHTPADDING", (0, 0), (-1, -1), 8)]))
    return t


def callout(title, body, accent=GOLD):
    inner = Table([[Paragraph(f"<b>{title}</b>", CELLB)], [Paragraph(body, CELL)]],
                  colWidths=[CW - 22])
    inner.setStyle(TableStyle([
        ("LEFTPADDING", (0, 0), (-1, -1), 10), ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, 0), 9), ("BOTTOMPADDING", (0, -1), (-1, -1), 9),
        ("TOPPADDING", (0, 1), (-1, 1), 3),
    ]))
    outer = Table([[inner]], colWidths=[CW])
    outer.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), PANEL),
        ("LINEBEFORE", (0, 0), (0, -1), 2.6, accent),
        ("LEFTPADDING", (0, 0), (-1, -1), 0), ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0), ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
    return outer


def draw_lockup(c, x, y, size=17):
    c.drawImage(MARK, x, y - size * 0.78, width=size, height=size, mask="auto")
    tx = x + size + 6
    c.setFillColor(INK)
    c.setFont("Helvetica", 10.5)
    c.drawString(tx, y - size * 0.5 + 0.5, "Need")
    w = c.stringWidth("Need", "Helvetica", 10.5)
    c.setFont("Helvetica-Bold", 10.5)
    c.drawString(tx + w, y - size * 0.5 + 0.5, "Momentum")


def cover_page(c, doc):
    c.saveState()
    c.setFillColor(colors.HexColor("#0E1826"))
    c.rect(0, 0, 1.55 * inch, PH, stroke=0, fill=1)
    c.setFillColor(BLUE)
    c.rect(1.55 * inch - 3, 0, 3, PH, stroke=0, fill=1)
    c.setFillColor(GOLD)
    c.rect(1.55 * inch - 3, 0, 3, PH * 0.34, stroke=0, fill=1)
    c.drawImage(MARK, 0.42 * inch, PH - 1.5 * inch, width=0.72 * inch,
                height=0.72 * inch, mask="auto")
    c.saveState()
    c.translate(0.72 * inch, 1.0 * inch)
    c.rotate(90)
    c.setFillColor(colors.HexColor("#7A8798"))
    c.setFont("Helvetica", 8)
    c.drawString(0, 0, "needmomentum.com  ·  internal")
    c.restoreState()
    c.restoreState()


def content_page(c, doc):
    c.saveState()
    draw_lockup(c, LM, PH - 0.52 * inch)
    c.setStrokeColor(RULE)
    c.setLineWidth(0.5)
    c.line(LM, PH - 0.72 * inch, PW - RM, PH - 0.72 * inch)
    seg = (PW - LM - RM) * 0.34
    c.setStrokeColor(BLUE)
    c.setLineWidth(1.6)
    c.line(LM, PH - 0.72 * inch, LM + seg, PH - 0.72 * inch)
    c.setStrokeColor(GOLD)
    c.line(LM + seg, PH - 0.72 * inch, LM + seg * 1.7, PH - 0.72 * inch)
    c.setFont("Helvetica", 7.6)
    c.setFillColor(FAINT)
    c.drawRightString(PW - RM, PH - 0.5 * inch, "Prospect Radar · how it works")
    c.setStrokeColor(RULE)
    c.setLineWidth(0.5)
    c.line(LM, BM - 16, PW - RM, BM - 16)
    c.setFont("Helvetica", 7.6)
    c.setFillColor(FAINT)
    c.drawString(LM, BM - 28, f"Generated {TODAY} · momentum-prospect-radar.netlify.app")
    c.drawRightString(PW - RM, BM - 28, f"{doc.page - 1}")
    c.restoreState()


doc = BaseDocTemplate(OUT, pagesize=LETTER, leftMargin=LM, rightMargin=RM,
                      topMargin=TM, bottomMargin=BM,
                      title="Prospect Radar — How It Works",
                      author="NeedMomentum", subject="What the prospect radar does")
doc.addPageTemplates([
    PageTemplate(id="cover", frames=[Frame(1.95 * inch, BM, PW - 1.95 * inch - RM,
                                           PH - TM - BM, id="cf")],
                 onPage=cover_page),
    PageTemplate(id="body", frames=[Frame(LM, BM, CW, PH - TM - BM, id="bf")],
                 onPage=content_page),
])

S = []

# ================================ COVER =====================================
S += [Spacer(1, 1.5 * inch),
      Paragraph("PROSPECT RADAR", EYE),
      Paragraph("Exactly what it does",
                st("CT", fontName="Helvetica-Bold", fontSize=25, leading=29,
                   spaceAfter=14, textColor=INK)),
      Paragraph("It finds every local business in the Philadelphia metro, grades their "
                "website the way a visitor experiences it, and routes each one to the "
                "offer it deserves — so a build slot only ever goes to a site that is "
                "provably worth replacing.", SUB),
      Spacer(1, 0.2 * inch),
      stat_cards([(total, "businesses tracked", BLUE),
                  (V.get("rebuild", 0), "rebuild targets", S_DECAYED),
                  (V.get("ads_seo", 0), "sites confirmed good", S_STRONG),
                  (tier1, "rendered in-browser", BLUE)],
                 width=COVER_W),
      Spacer(1, 0.35 * inch),
      kv_table([
          ["For", "NeedMomentum / Momentum Digital team"],
          ["Date", TODAY],
          ["Live dashboard", "momentum-prospect-radar.netlify.app"],
          ["Cadence", "Full sweep every morning: discover, re-grade, re-publish"],
      ], widths=[1.3 * inch, COVER_W - 1.3 * inch]),
      Spacer(1, 0.3 * inch),
      Paragraph("Internal working document. The dashboard it describes names real "
                "businesses alongside a judgement about their websites, so neither is "
                "for distribution outside the team.", TINY),
      NextPageTemplate("body"), PageBreak()]

# ============================ 1. WHAT IT IS =================================
S += [Paragraph("1 · What it is", H2),
      Paragraph("A radar, not a list. It watches the local-business web in our market "
                "the way a dispatcher watches traffic: everything on one screen, "
                "graded, ranked, and re-checked on a schedule.", LEAD),
      Paragraph("One sweep at a time, it answers four questions about every business "
                "it knows: does this business exist and have a website, how good is "
                "that website really, what should we sell them because of it, and has "
                "any of that changed since we last looked.", BODY),
      Paragraph("Two scores, deliberately kept apart", H3),
      Paragraph("Blending these into one number is how agencies end up pitching a "
                "redesign to someone whose site is already excellent:", BODY),
      kv_table([
          ["Site Quality Score", "How good is their current site?", "High = leave it alone"],
          ["Opportunity Score", "Should we spend a build slot?", "High = build for them"],
      ], widths=[1.5 * inch, 2.9 * inch, CW - 4.4 * inch],
          header=["Number", "Question it answers", "High means"]),
      Spacer(1, 6),
      callout("The rule everything else serves",
              "A build slot only goes to a business whose site has a fault we can "
              "prove. A business with a genuinely good site is never pitched a "
              "redesign — it gets a traffic offer instead (Google Ads, local SEO, "
              "GBP content), because a company that already invested in its site has "
              "proven it spends on marketing."),
      ]

# ============================== 2. FIND =====================================
S += [CondPageBreak(3.2 * inch),
      Paragraph("2 · Step one: it finds them", H2),
      Paragraph("Source", H3),
      Paragraph("Discovery pulls from OpenStreetMap's business database across "
                "Philadelphia and the four collar counties — Bucks, Chester, Delaware "
                "and Montgomery. Chains and franchises are filtered out (a single pull "
                "discards over 1,600 chain locations), duplicates are collapsed by "
                "website domain, and the businesses we already built for are excluded "
                "so nobody is pitched twice.", BODY),
      Paragraph("Aimed, not random", H3),
      Paragraph("Every market cell — county crossed with vertical — has a target share, "
                "and each morning's discovery budget is aimed at the cells furthest "
                "below target. Philadelphia carries the largest share by design. The "
                "verticals are the ones we sell to: home services (HVAC, plumbing, "
                "electrical, roofing), dental and medical, restaurants, fitness, auto, "
                "veterinary, legal and the rest of local retail.", BODY),
      Paragraph("It looks for about 60 new businesses a day — enough to keep the queue "
                "growing, small enough that every arrival still gets graded the same "
                "morning it is found.", BODY),
      ]

# ============================== 3. GRADE ====================================
S += [CondPageBreak(3.2 * inch),
      Paragraph("3 · Step two: it grades the website", H2),
      Paragraph("It does not read a directory listing or a score somebody else "
                "computed. It visits each business's actual live site and measures "
                "it.", LEAD),
      Paragraph("Two passes, increasing depth", H3),
      kv_table([
          ["Fast pass", "Reads the site's code",
           "About 30 signals from one fetch: HTTPS, mobile setup, page weight, copy "
           "depth, contact routes, structured data, server health. Cheap enough to "
           "run on everything, every time."],
          ["Render pass", "Loads it in a real browser",
           "A real Chromium renders the page and measures what a visitor sees: the "
           "computed palette and fonts, layout overflow at phone, tablet and desktop "
           "widths, tap-target sizes, what actually loaded. This is where design "
           "stops being a guess."],
      ], widths=[0.95 * inch, 1.55 * inch, CW - 2.5 * inch],
          header=["Pass", "What it is", "What it measures"]),
      Spacer(1, 10),
      Paragraph("Six dimensions, weighted", H3),
      Paragraph("Site quality is a weighted mean over six dimensions, 0 to 100. "
                "Weights renormalise over whichever dimensions actually have evidence, "
                "so a code-only grade and a fully rendered one sit on the same "
                "scale.", BODY),
      KeepTogether(bar_chart([
          ("Mobile", 22, BLUE, "viewport, overflow"),
          ("Foundation", 20, BLUE, "HTTPS, resolves, live"),
          ("Design craft", 18, BLUE, "layout, type, palette"),
          ("Performance", 16, BLUE, "speed, payload"),
          ("Content", 14, BLUE, "copy depth, CTA"),
          ("Discoverability", 10, BLUE, "title, schema, alt text")], 22)),
      Spacer(1, 10),
      Paragraph("Hard faults", H3),
      Paragraph("Some things are not a matter of degree. A dead domain, no HTTPS, a "
                "missing mobile viewport, a table-based or frameset layout, server "
                "errors, template placeholder copy — each is recorded as a named "
                "fault, and <b>only a rebuild verdict backed by a provable fault can "
                "reach the build queue</b>. Click any row on the dashboard and the "
                "faults are listed in plain language.", BODY),
      Spacer(1, 4),
      callout("Why some verdicts wait for a render",
              "Reading code can prove a site is <i>bad</i> — a missing viewport is a "
              "fact. It cannot prove a site is <i>good</i>: a dated 2014 template and "
              "a beautiful modern build look nearly identical in source. So an "
              "unrendered grade that looks strong is held as <b>unconfirmed</b> and "
              "queued for a render instead of being trusted. Every dimension score is "
              "also labelled <i>measured</i>, <i>partial</i> or <i>not measured</i> — "
              "the dashboard never presents an estimate as a measurement.", BLUE),
      Spacer(1, 8),
      KeepTogether([
          Paragraph("What the bands mean", H3),
          kv_table([
              ["broken", "Dead domain, server errors, no HTTPS. The strongest pitch."],
              ["decayed", "Loads, but failing in provable ways. Core rebuild territory."],
              ["dated", "Works, looks old. Rebuild or polish depending on the faults."],
              ["unconfirmed", "Code looks fine; nobody has seen the design yet. Awaiting a render."],
              ["strong", "Verified good in a real browser. Never pitch a redesign."],
          ], widths=[1.05 * inch, CW - 1.05 * inch], header=["Band", "Meaning"]),
      ]),
      ]

# ============================== 4. ROUTE ====================================
S += [CondPageBreak(3.2 * inch),
      Paragraph("4 · Step three: it routes each business to an offer", H2),
      Paragraph("The grade is not the output. The output is a verdict — what we "
                "should do about this business, today.", LEAD),
      kv_table([
          ["rebuild", str(V.get("rebuild", 0)),
           "Site is provably replaceable. The pitch: a rebuilt homepage concept — "
           "the first move of a redesign, not a finished site.", "45 days"],
          ["polish", str(V.get("polish", 0)),
           "Working site with fixable gaps. Tune-up or retainer offer.", "90 days"],
          ["ads_seo", str(V.get("ads_seo", 0)),
           "Site confirmed good in a browser. Sell traffic: Ads, local SEO, GBP.",
           "120 days"],
          ["verify", str(V.get("verify", 0)),
           "Code passed; design unseen. Waits for a render before anything is "
           "pitched.", "7 days"],
          ["enrich", str(V.get("enrich", 0)),
           "Too little signal to route yet. Needs another data pass.", "14 days"],
          ["nurture", str(V.get("nurture", 0)),
           "No reason to act right now. Kept on the radar.", "150 days"],
      ], widths=[0.8 * inch, 0.5 * inch, CW - 2.4 * inch, 1.1 * inch],
          header=["Verdict", "Now", "What it means and what we sell", "Re-checked every"]),
      Spacer(1, 8),
      Paragraph(f"Only <b>rebuild</b> consumes a build slot. Of the {total} businesses "
                f"tracked today, {V.get('rebuild', 0)} qualify — and "
                f"{V.get('ads_seo', 0)} are confirmed as already having good sites, "
                f"which under a naive scorer would have been mailed a redesign pitch. "
                f"Mean site quality across the graded registry is {mean_q}/100.", BODY),
      Paragraph("Can we actually build it? That is measured too", H3),
      Paragraph(f"A homepage concept needs six content photographs plus a logo, and we "
                f"never reuse another business's imagery. So the radar checks each "
                f"rebuild target's own site for usable photos and stores the answer as "
                f"a filter: <b>{buildable} of the {V.get('rebuild', 0)} current rebuild "
                f"targets are buildable from their own imagery today</b>. The "
                f"{zero_photo} targets with no usable photos get a generation brief "
                f"instead — AI-generated concept imagery, always labelled as "
                f"illustrative on the page, never passed off as their premises.", BODY),
      ]

# ============================ 5. STAYS TRUE =================================
S += [CondPageBreak(3.2 * inch),
      Paragraph("5 · Step four: it keeps itself true", H2),
      Paragraph("A graded spreadsheet is stale the day after it is written. A decayed "
                "site gets redesigned; a good site rots; a domain lapses. The radar's "
                "job is not knowing who was bad once — it is knowing who is bad now, "
                "that we have not already pitched.", LEAD),
      Paragraph("The morning sweep", H3),
      kv_table([
          ["1", "Discover", "About 60 new businesses, aimed at the thinnest market cells."],
          ["2", "Grade arrivals", "Every new find is graded the same morning."],
          ["3", "Re-audit stale rows", "Whatever passed its re-check date, on the cadence above."],
          ["4", "Render", "Up to 80 in-browser renders spent where a verdict is still a guess."],
          ["5", "Check imagery and contacts", "Buildability and published contact routes, refreshed."],
          ["6", "Publish", "Dashboard, ranked build queue and a dated digest, rewritten and deployed."],
      ], widths=[0.35 * inch, 1.55 * inch, CW - 1.9 * inch]),
      Spacer(1, 8),
      Paragraph("Every business keeps its full grade history, so the dashboard's feed "
                "shows movement — who was found, whose verdict flipped, who decayed — "
                "not just today's totals. Lifecycle state (graded, queued, built, "
                "mailed, client) travels with each row so nothing is pitched twice. "
                "And a run-health strip turns red when any part of a sweep fails, "
                "because a silent failure would otherwise look exactly like a quiet "
                "day.", BODY),
      ]

# ============================ 6. DELIVERABLES ===============================
S += [CondPageBreak(3.2 * inch),
      Paragraph("6 · What it hands you", H2),
      kv_table([
          ["The dashboard",
           "One self-contained page over the whole registry: search, filters, sortable "
           "queues (Rebuild, Buildable now, Needs render, Polish, Traffic, Re-audit), "
           "a per-business drawer showing the six dimension bars with their evidence "
           "labels and every named fault, a county-by-vertical coverage map, today's "
           "movement feed, and CSV export of any filtered view. Works offline; makes "
           "zero external requests."],
          ["The build queue",
           "A ranked CSV of rebuild targets — priority, score, band, faults, "
           "buildability — ready to pick the week's 25 from."],
          ["Image briefs",
           f"For the {zero_photo} zero-photo rebuild targets: per-business generation "
           f"briefs (scene directions by vertical, sizes per slot, logo instruction) "
           f"queued for image generation."],
          ["Contact routes",
           f"Published contact paths from each business's own site — {contact_email} "
           f"of the {contact_checked} checked so far publish a real email address. "
           f"Names and addresses stay in a private, non-published layer; the "
           f"dashboard shows only flags."],
          ["The daily digest",
           "A dated morning summary of what changed: found, flipped, decayed, "
           "rendered."],
      ], widths=[1.35 * inch, CW - 1.35 * inch]),
      ]

# ============================= 7. GUARDRAILS ================================
S += [CondPageBreak(3.2 * inch),
      Paragraph("7 · The guardrails it enforces on itself", H2),
      Paragraph("Pointing automated judgement at hundreds of real businesses is only "
                "safe if the system polices its own output. These rules are code, not "
                "policy — the pipeline refuses to proceed when one is violated.", LEAD),
      *bullets([
          "<b>No contact details in anything published.</b> Phone numbers, street "
          "addresses, coordinates and email addresses are stripped from every public "
          "artifact; commits and deploys are scanned and refused if one slips through. "
          "Contact detail lives in a private layer only.",
          "<b>Every demo page is invisible to search engines.</b> The deploy tool "
          "refuses to publish any page without a noindex tag, so no prospect ever "
          "finds a concept page by googling themselves.",
          "<b>Nothing goes out by itself.</b> The radar prepares queues; a human "
          "approves every send. Nothing is mailed automatically.",
          "<b>Never another business's photographs or phone number.</b> A build "
          "either uses the prospect's own imagery or clearly labelled generated "
          "concept imagery — and a generated-imagery page must carry its disclosure "
          "line or the builder blocks it.",
          "<b>No guessed email addresses.</b> Contact routes come only from what the "
          "business itself published. An address on a marketing agency's domain is "
          "treated as a signal they already have an agency — never as a contact.",
      ]),
      ]

# ============================ 8. READ + NEXT ================================
S += [CondPageBreak(3.2 * inch),
      Paragraph("8 · How to read it in thirty seconds", H2),
      *bullets([
          "<b>Picking the week's builds?</b> Open the <b>Buildable now</b> queue — "
          "rebuild verdicts with enough of their own imagery, already ranked, "
          "Philadelphia weighted highest.",
          "<b>About to send outreach?</b> Search the business. If it shows "
          "<b>strong</b> or sits in Traffic, the offer is ads and SEO — never a "
          "redesign pitch.",
          "<b>Doubting a number?</b> Click the row. Six bars, each labelled measured "
          "or estimated, plus every fault in plain language. The grade shows its "
          "work.",
      ]),
      Spacer(1, 8),
      Paragraph("What lands next", H3),
      *bullets([
          "<b>Ability-to-pay data.</b> Google ratings, review counts and "
          "open/closed status wire into the ranking as soon as the Places API key is "
          "live — the strongest signal of who can actually buy.",
          "<b>Outcome feedback.</b> Once the first batch mails, reply and win rates "
          "feed back by vertical and county, so the ranking learns from what closes "
          "rather than only from site quality.",
      ]),
      Spacer(1, 10),
      callout("The one-line version",
              f"{total} businesses watched, {V.get('rebuild', 0)} provably worth "
              f"rebuilding, {buildable} buildable this week from their own imagery, "
              f"{V.get('ads_seo', 0)} confirmed too good to pitch — refreshed every "
              f"morning without anyone lifting a finger.", GOLD),
      ]

doc.build(S)
print("wrote", OUT, os.path.getsize(OUT), "bytes")
