#!/usr/bin/env python3
"""
Build the Prospect Radar project report as a branded PDF.

Brand tokens are the same measured values the dashboard uses (lib/brand.js):
blue #2A80C2 sampled from the NeedMomentum mark, gold #FFC63B derived from it.
The mark itself is the real asset banked in the repo, not a redraw.
"""
import json
import os

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (BaseDocTemplate, CondPageBreak, Frame, Image, KeepTogether,
                                NextPageTemplate, PageBreak, PageTemplate,
                                Paragraph, Spacer, Table, TableStyle)

REPO = "/home/user/dillon-os"
MARK = os.path.join(REPO, "_os/automation/assets/needmomentum-mark.png")
# Facts are read from a JSON projection of the live registry so the report can
# never drift from what the dashboard says. Regenerate it with:
#   node -e "..."  (see docs/RADAR-SETUP.md)
SCRATCH = os.environ.get("RADAR_FACTS_DIR", os.path.join(REPO, "12_Brain/private"))
# Output goes to the gitignored private layer, not Daily-Briefs. This document
# names real businesses alongside a judgement about their websites and carries an
# internal-only notice on its own cover; Daily-Briefs is tracked in a PUBLIC
# repository. Override with RADAR_REPORT_OUT if you need it elsewhere.
OUT = os.environ.get("RADAR_REPORT_OUT",
                     os.path.join(REPO, "12_Brain/private/Prospect-Radar-Report.pdf"))

FACTS = json.load(open(os.path.join(SCRATCH, "facts.json")))

# Names and addresses come from the environment, never from this file — it is
# tracked in a public repository.
OWNER = os.environ.get("RADAR_REPORT_OWNER", "NeedMomentum")
RECIPIENT = os.environ.get("RADAR_REPORT_FOR", "NeedMomentum / Momentum Digital")

# --- brand -----------------------------------------------------------------
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
COVER_W = PW - 1.95 * inch - RM  # the cover frame is inset by the brand band

ss = getSampleStyleSheet()


def st(name, **kw):
    base = dict(fontName="Helvetica", fontSize=9.6, leading=14.2, textColor=INK,
                alignment=TA_LEFT, spaceAfter=7)
    base.update(kw)
    return ParagraphStyle(name, **base)


H1 = st("H1", fontName="Helvetica-Bold", fontSize=25, leading=28, spaceAfter=4, textColor=INK)
SUB = st("SUB", fontSize=11.5, leading=16, textColor=MID, spaceAfter=16)
H2 = st("H2", fontName="Helvetica-Bold", fontSize=14.5, leading=18, spaceBefore=16,
        spaceAfter=6, textColor=INK)
H3 = st("H3", fontName="Helvetica-Bold", fontSize=10.6, leading=14, spaceBefore=11,
        spaceAfter=3, textColor=BLUE_INK)
BODY = st("BODY")
LEAD = st("LEAD", fontSize=10.6, leading=15.6, textColor=MID, spaceAfter=10)
EYE = st("EYE", fontName="Helvetica-Bold", fontSize=7.6, leading=10, textColor=BLUE,
         spaceAfter=3)
SMALL = st("SMALL", fontSize=8.4, leading=12, textColor=MID)
TINY = st("TINY", fontSize=7.6, leading=10.4, textColor=FAINT)
CELL = st("CELL", fontSize=8.4, leading=11.6, spaceAfter=0)
CELLB = st("CELLB", fontSize=8.4, leading=11.6, spaceAfter=0, fontName="Helvetica-Bold")
CELLH = st("CELLH", fontSize=7.4, leading=10, spaceAfter=0, fontName="Helvetica-Bold",
           textColor=colors.white)
QUOTE = st("QUOTE", fontSize=10, leading=15, textColor=INK, leftIndent=12,
           spaceBefore=6, spaceAfter=10, fontName="Helvetica-Oblique")
MONO = st("MONO", fontName="Courier", fontSize=8, leading=11.4, textColor=MID)


def bullets(items, style=BODY, gap=3):
    """Bulleted list where the marker is the brand blue."""
    rows = []
    for it in items:
        rows.append(Paragraph(
            f'<font color="#2A80C2">&bull;</font>&nbsp;&nbsp;{it}', style))
        rows.append(Spacer(1, gap))
    return rows


def kv_table(rows, widths=None, header=None, align_right_cols=()):
    data = []
    if header:
        data.append([Paragraph(h, CELLH) for h in header])
    for r in rows:
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
                  ("LINEBELOW", (0, 0), (-1, 0), 0, colors.white)]
        style += [("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, PANEL])]
    for c in align_right_cols:
        style.append(("ALIGN", (c, 0), (c, -1), "RIGHT"))
    t.setStyle(TableStyle(style))
    return t


def bar_row(label, n, total, color, note=""):
    """A label, a proportional bar, and the count — drawn as a nested table."""
    frac = (n / total) if total else 0
    bw = 2.5 * inch
    # A zero renders as an empty track. A minimum-width sliver would read as
    # "a little", and the whole point of the funnel is that built is *nothing*.
    filled = (bw * frac) if n else 0
    bar = Table([[""]], colWidths=[max(filled, 0.01)], rowHeights=[7])
    bar.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), color if n else colors.HexColor("#EAF0F6")),
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


def bar_chart(rows, total):
    data = [bar_row(l, n, total, c, note) for (l, n, c, note) in rows]
    t = Table(data, colWidths=[1.7 * inch, 2.6 * inch, 1.5 * inch], hAlign="LEFT")
    t.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 3.5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3.5),
        ("LEFTPADDING", (0, 0), (0, -1), 0),
    ]))
    return t


def stat_cards(cards, width=None):
    """Four numbers across, each with a coloured top rule."""
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


# --- page furniture --------------------------------------------------------
def draw_lockup(c, x, y, size=17):
    """The real mark plus the two-weight wordmark."""
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
    # Brand field: a blue band down the left edge, gold hairline at its inner edge.
    c.setFillColor(colors.HexColor("#0E1826"))
    c.rect(0, 0, 1.55 * inch, PH, stroke=0, fill=1)
    c.setFillColor(BLUE)
    c.rect(1.55 * inch - 3, 0, 3, PH, stroke=0, fill=1)
    c.setFillColor(GOLD)
    c.rect(1.55 * inch - 3, 0, 3, PH * 0.34, stroke=0, fill=1)
    # Mark, large, on the dark band.
    c.drawImage(MARK, 0.42 * inch, PH - 1.5 * inch, width=0.72 * inch,
                height=0.72 * inch, mask="auto")
    c.setFillColor(colors.white)
    c.setFont("Helvetica", 8)
    c.saveState()
    c.translate(0.72 * inch, 1.0 * inch)
    c.rotate(90)
    c.setFillColor(colors.HexColor("#7A8798"))
    c.drawString(0, 0, "needmomentum.com  ·  internal")
    c.restoreState()
    c.restoreState()


def content_page(c, doc):
    c.saveState()
    draw_lockup(c, LM, PH - 0.52 * inch)
    c.setStrokeColor(RULE)
    c.setLineWidth(0.5)
    c.line(LM, PH - 0.72 * inch, PW - RM, PH - 0.72 * inch)
    # Blue-to-gold rule, the same device the dashboard uses on its workbench card.
    seg = (PW - LM - RM) * 0.34
    c.setStrokeColor(BLUE)
    c.setLineWidth(1.6)
    c.line(LM, PH - 0.72 * inch, LM + seg, PH - 0.72 * inch)
    c.setStrokeColor(GOLD)
    c.line(LM + seg, PH - 0.72 * inch, LM + seg * 1.7, PH - 0.72 * inch)

    c.setFont("Helvetica", 7.6)
    c.setFillColor(FAINT)
    c.drawRightString(PW - RM, PH - 0.5 * inch, "Prospect Radar · build report")
    # Set the colour *before* drawing: the header segment above leaves the
    # stroke gold, and the footer rule should be a hairline, not a brand bar.
    c.setStrokeColor(RULE)
    c.setLineWidth(0.5)
    c.line(LM, BM - 16, PW - RM, BM - 16)
    c.setFont("Helvetica", 7.6)
    c.setFillColor(FAINT)
    c.drawString(LM, BM - 28, "Generated 2026-08-07 · momentum-prospect-radar.netlify.app")
    c.drawRightString(PW - RM, BM - 28, f"{doc.page - 1}")
    c.restoreState()


doc = BaseDocTemplate(OUT, pagesize=LETTER, leftMargin=LM, rightMargin=RM,
                      topMargin=TM, bottomMargin=BM,
                      title="Prospect Radar — Build Report",
                      author="NeedMomentum", subject="Prospect website grader and radar")
doc.addPageTemplates([
    PageTemplate(id="cover", frames=[Frame(1.95 * inch, BM, PW - 1.95 * inch - RM,
                                           PH - TM - BM, id="cf")],
                 onPage=cover_page),
    PageTemplate(id="body", frames=[Frame(LM, BM, CW, PH - TM - BM, id="bf")],
                 onPage=content_page),
])

S = []
V = FACTS["byVerdict"]
B = FACTS["byBand"]
total = FACTS["total"]

# ============================== COVER =====================================
S += [Spacer(1, 1.5 * inch),
      Paragraph("PROSPECT RADAR", EYE),
      Paragraph("Which Philadelphia businesses "
                "deserve a build slot — and which ones to sell traffic to instead",
                st("CT", fontName="Helvetica-Bold", fontSize=23, leading=27,
                   spaceAfter=14, textColor=INK)),
      Paragraph("A site-quality grader and a persistent prospect registry, built so "
                "the website factory stops spending Tier-A builds on businesses whose "
                "sites are already good.", SUB),
      Spacer(1, 0.2 * inch),
      stat_cards([(total, "businesses tracked", BLUE),
                  (V.get("rebuild", 0), "rebuild targets", S_DECAYED),
                  (V.get("ads_seo", 0), "sites confirmed good", S_STRONG),
                  (FACTS["tiers"].get("tier1", 0), "rendered in-browser", BLUE)],
                 width=COVER_W),
      Spacer(1, 0.35 * inch),
      kv_table([
          ["Prepared for", RECIPIENT],
          ["Date", "7 August 2026"],
          ["Live dashboard", "momentum-prospect-radar.netlify.app"],
          ["Code", "dillon-os · branch claude/pa-business-website-grader-5vi5hx · PR #262"],
          ["Status", "Draft PR, 99 tests passing. Not yet merged."],
      ], widths=[1.3 * inch, COVER_W - 1.3 * inch]),
      Spacer(1, 0.3 * inch),
      Paragraph("Internal working document. It names real businesses alongside a "
                "judgement about their website, so it is not for distribution outside "
                "the team.", TINY),
      NextPageTemplate("body"), PageBreak()]

# ============================ 1. THE PROBLEM ==============================
S += [Paragraph("1 · The problem this solves", H2),
      Paragraph("The factory could already build 25 sites a week. What it could not do "
                "was decide <b>who deserves one</b>.", LEAD),
      Paragraph("The existing qualify scorer only detected decay. Nothing in it "
                "penalised a site for being <i>good</i>. A prospect with an excellent "
                "website still collected roughly 50 points from review count, vertical "
                "fit, ad presence and simply having a URL — then crossed the "
                "build threshold of 60 on any hiring signal. The factory would then "
                "spend a Tier-A slot pitching a redesign to a business whose site was "
                "already better than the replacement.", BODY),
      Paragraph("That is the objection Mac raised on the completed Philadelphia 100:", BODY),
      QUOTE and Paragraph("“Some of these already have really great websites.”", QUOTE),
      Paragraph("Two things had to become true. A build slot should only ever go to a "
                "business whose site is genuinely replaceable; and a business with a "
                "genuinely good site should not be dropped — it should get a "
                "different offer, because a company that already invested in its site "
                "has proven it invests in marketing.", BODY),
      Spacer(1, 4),
      callout("The result, in one line",
              f"Of {total} tracked businesses, {V.get('rebuild', 0)} qualify for a "
              f"rebuild and <b>{V.get('ads_seo', 0)} are confirmed as already having "
              f"good sites</b> — verified by rendering them, not inferred. Those "
              f"ten are now traffic prospects: Google Ads, local SEO, GBP content. "
              f"Under the old scorer several of them would have been mailed a redesign "
              f"pitch."),
      ]

# ============================ 2. HOW IT WORKS =============================
S += [Paragraph("2 · How it works", H2),
      Paragraph("Two scores, deliberately not blended", H3),
      Paragraph("Collapsing these into one number is what caused the original problem. "
                "They answer different questions and are kept apart:", BODY),
      kv_table([
          ["Site Quality Score", "How good is their current site?", "High = leave it alone"],
          ["Opportunity Score", "Should we spend a build slot?", "High = build for them"],
      ], widths=[1.5 * inch, 2.9 * inch, CW - 4.4 * inch],
          header=["Number", "Question it answers", "High means"]),
      Spacer(1, 10),
      Paragraph("Six weighted dimensions", H3),
      Paragraph("Site quality is a weighted mean over six dimensions. Weights sum to "
                "100 but are renormalised over whichever dimensions actually have "
                "evidence, so a markup-only grade and a fully rendered one stay on the "
                "same 0–100 scale.", BODY),
      KeepTogether(bar_chart([
          ("Mobile", 22, BLUE, "viewport, overflow"),
          ("Foundation", 20, BLUE, "HTTPS, resolves, live"),
          ("Design craft", 18, BLUE, "layout, type, palette"),
          ("Performance", 16, BLUE, "speed, payload"),
          ("Content", 14, BLUE, "copy depth, CTA"),
          ("Discoverability", 10, BLUE, "title, schema, alt text")], 22)),
      Spacer(1, 12),
      Paragraph("Seven verdicts — only one consumes a build slot", H3),
      kv_table([
          ["rebuild", str(V.get("rebuild", 0)), "Site is genuinely replaceable. Consumes a build slot."],
          ["polish", str(V.get("polish", 0)), "Working site with fixable gaps. Retainer or paid tune-up."],
          ["nurture", str(V.get("nurture", 0)), "Not enough reason to act yet. Re-audit later."],
          ["enrich", str(V.get("enrich", 0)), "Too little signal to route. Needs another pass."],
          ["ads_seo", str(V.get("ads_seo", 0)), "Site is good. Sell traffic, never a redesign."],
          ["verify", str(V.get("verify", 0)), "Markup passed but nobody has seen the design."],
      ], widths=[0.95 * inch, 0.55 * inch, CW - 1.5 * inch],
          header=["Verdict", "Now", "What it means"]),
      ]

S += [Spacer(1, 6),
      Paragraph("The asymmetry at the core of the design", H3),
      Paragraph("This is the single most important idea in the grader, and it is why a "
                "<b>verify</b> verdict exists at all.", BODY),
      Paragraph("A cheap audit reads markup, never pixels. Markup <i>can</i> prove a "
                "site is bad — a missing viewport tag, a dead domain, a table "
                "layout and no HTTPS are all facts you can read in the source. But "
                "markup <b>cannot certify that a site is good</b>: a dated 2014 "
                "contractor template and a beautifully art-directed build look nearly "
                "identical in HTML.", BODY),
      Paragraph("So any unrendered grade that would read <i>strong</i> comes back as "
                "<b>unconfirmed</b> and routes to verify — never to a skip. "
                "Symmetrically, a rebuild verdict only reaches the build queue when the "
                "audit found a fault it can actually prove. A verdict assembled from "
                "soft score pressure alone waits for a render, because the whole point "
                "is to not pitch a redesign on a hunch.", BODY),
      Spacer(1, 4),
      callout("Absent is not zero",
              "A dimension with no evidence drops out of the weighted mean and lowers "
              "<i>confidence</i> — it is never scored as zero. The same rule "
              "applies to the opportunity model: a business with no review data has "
              "unknown ability to pay, not <i>no</i> ability to pay. Getting this "
              "wrong sent 121 decayed sites to nurture during calibration.", BLUE),
      Spacer(1, 8),
      Paragraph("Four tiers of evidence", H3),
      kv_table([
          ["Tier 0", "One fetch, no browser", "~30 signals from raw HTML. Disqualifies most of a list cheaply."],
          ["Tier 1", "Real Chromium render", "Computed palette and fonts, overflow at three viewports, tap targets, payload."],
          ["Tier 1b", "Reuse existing harvest", "Free Tier-1-grade evidence from a prior site-factory harvest."],
          ["Tier 2", "Human taste, 1–5", "The judgement no automation should fake."],
      ], widths=[0.75 * inch, 1.5 * inch, CW - 2.25 * inch],
          header=["Tier", "Method", "What it adds"]),
      Spacer(1, 10),
      Paragraph("The radar: why a graded CSV was not enough", H3),
      Paragraph("A one-shot list is stale the day after it is written. A decayed site "
                "gets redesigned; a good site rots; a domain lapses. The useful "
                "question is never “who is bad today” but “who is bad "
                "today that we have not already pitched, and who changed.”", BODY),
      Paragraph("So the registry keeps every business ever seen, with full grade "
                "history, a per-verdict recheck cadence, and lifecycle state so nothing "
                "is pitched twice. A daily sweep discovers new businesses, grades "
                "arrivals, re-audits what went stale, and rewrites the dashboard. "
                "Philadelphia and its collar counties take five of seven rotation slots "
                "and carry the highest geography weight in the ranking.", BODY),
      ]

# ========================= 3. WHAT THE DATA SAYS ==========================
S += [CondPageBreak(3.4 * inch),
      Paragraph("3 · What the data says", H2),
      Paragraph(f"{total} businesses tracked, {FACTS['graded']} audited "
                f"({round(FACTS['graded'] / total * 100)}%), mean site quality "
                f"{FACTS['mean']}/100.", LEAD),
      Paragraph("Grade distribution", H3),
      bar_chart([("broken", B.get("broken", 0), S_BROKEN, "dead, no HTTPS, server error"),
                 ("decayed", B.get("decayed", 0), S_DECAYED, "clearly failing"),
                 ("dated", B.get("dated", 0), S_DATED, "works, looks old"),
                 ("unconfirmed", B.get("unconfirmed", 0), S_UNCONF, "awaiting a render"),
                 ("strong", B.get("strong", 0), S_STRONG, "genuinely good"),
                 ("ungraded", B.get("ungraded", 0), FAINT, "never audited")],
                max(B.values())),
      Spacer(1, 12),
      Paragraph("The ten sites confirmed good — do not pitch a rebuild", H3),
      Paragraph("Every one of these was rendered in a real browser before the verdict "
                "was allowed to change. Their offer is traffic: Google Ads, local SEO, "
                "GBP content.", BODY),
      kv_table([[a["n"], str(a["q"]), a["c"] or "—", a["v"]] for a in FACTS["ads"]],
               widths=[2.5 * inch, 0.6 * inch, 1.5 * inch, CW - 4.6 * inch],
               header=["Business", "Score", "City", "Vertical"], align_right_cols=(1,)),
      ]

S += [CondPageBreak(3.4 * inch),
      Paragraph("Coverage by county — and the problem it exposes", H3),
      bar_chart([(k, v["total"], BLUE, f"{v['rebuild']} rebuild")
                 for k, v in sorted(FACTS["byArea"].items(),
                                     key=lambda x: -x[1]["total"])],
                max(v["total"] for v in FACTS["byArea"].values())),
      Spacer(1, 8),
      callout("Coverage is skewed away from the priority market",
              f"Montgomery County holds "
              f"{FACTS['byArea'].get('Montgomery County', {}).get('total', 0)} rows "
              f"against Philadelphia's "
              f"{FACTS['byArea'].get('Philadelphia', {}).get('total', 0)} — "
              f"running about 2.2:1 <i>away</i> from the market that is supposed to be "
              f"the priority, because the discovery rotation kept landing on "
              f"Montgomery. The next sweeps should be pointed at Philadelphia. The "
              f"dashboard now states this on the page rather than leaving it to be "
              f"spotted in a bar chart.", S_DECAYED),
      Spacer(1, 10),
      Paragraph("Coverage by vertical", H3),
      bar_chart([(k.replace("-", " "), v["total"], BLUE, f"{v['rebuild']} rebuild")
                 for k, v in sorted(FACTS["byGroup"].items(),
                                     key=lambda x: -x[1]["total"])],
                max(v["total"] for v in FACTS["byGroup"].values())),
      Spacer(1, 8),
      Paragraph("Home services is the best-converting vertical and OpenStreetMap "
                "under-maps it relative to medical, which is a discovery-source "
                "limitation rather than a real market shape. A second source would fix "
                "the ratio.", SMALL),
      Spacer(1, 12),
      Paragraph("Where the pipeline stops", H3),
      bar_chart([("tracked", total, BLUE, ""),
                 ("graded", FACTS["lifecycle"].get("graded", 0), BLUE, ""),
                 ("queued for build", FACTS["lifecycle"].get("queued_build", 0), BLUE, ""),
                 ("built", FACTS["lifecycle"].get("built", 0), S_BROKEN, "<-- the constraint"),
                 ("mailed", FACTS["lifecycle"].get("mailed", 0), S_BROKEN, ""),
                 ("client", FACTS["lifecycle"].get("client", 0), S_BROKEN, "")], total),
      Spacer(1, 6),
      Paragraph("Everything upstream works. The constraint is entirely at the build "
                "step, and the reason is stated plainly in section 5.", BODY),
      ]

# ======================= 4. THE PROCESS / WHAT BROKE ======================
S += [CondPageBreak(3.4 * inch),
      Paragraph("4 · The process, and what it caught", H2),
      Paragraph("A grader that is confidently wrong is worse than no grader — it "
                "mails redesign pitches to businesses with working websites. So the "
                "build was calibration-driven: run the thing against 500 real "
                "Philadelphia sites, look at what it claimed, and fix what it got "
                "wrong. Every item below was found that way, not by reasoning about it "
                "in advance.", LEAD),
      Paragraph("Calibration set", H3),
      Paragraph("500 freshly discovered Philadelphia-metro prospects (none previously "
                "built for, 1,669 chain locations filtered out) plus the 69 "
                "completed-100 businesses whose own site could be identified.", BODY),
      kv_table([
          ["Mean site quality", "58", "64"],
          ["Would qualify for a rebuild", "~18%", "9%"],
      ], widths=[2.5 * inch, 1.4 * inch, CW - 3.9 * inch],
          header=["", "Fresh 500", "Completed 100"]),
      Spacer(1, 6),
      Paragraph("The businesses already built for had <b>better</b> sites than a fresh "
                "priority-weighted pull. Mac's objection, quantified.", BODY),
      Spacer(1, 10),
      Paragraph("Scoring bugs the calibration run exposed", H3),
      kv_table([
          ["craft scored a confident 78 on every markup-only grade",
           "Design is not readable from HTML. Made craft signals half-weight until rendered; confidence dropped to an honest 91%."],
          ["Client-rendered sites were penalised for “thin copy”",
           "This punished exactly the newest sites. Added render-pending detection: positives kept, absence penalties suppressed."],
          ["schema.org URLs were flagged as mixed content",
           "Fired on nearly every site with structured data. Restricted the check to real subresource loads."],
          ["A 60-point dimension baseline made “no evidence” a pass",
           "Median landed at 76 and <i>nothing</i> qualified for a rebuild. Baseline dropped to 50."],
          ["Missing ability-to-pay was scored as inability to pay",
           "Sent 121 decayed sites to nurture. Now scored as a percentage of available points."],
          ["52 of 500 sites were called dead domains; only 18 were",
           "The rest were local proxy 502s and timeouts — our failures, not theirs. Added error classification plus a retry."],
          ["A failed render overwrote a good markup grade with “unreachable”",
           "Cratered the score of live sites. A render failure now returns a non-destructive marker."],
      ], widths=[2.6 * inch, CW - 2.6 * inch], header=["What it did", "Why it mattered, and the fix"]),
      ]

S += [CondPageBreak(3.4 * inch),
      Paragraph("Correctness bugs found in shipped output", H3),
      Paragraph("These are the ones that had already reached something real.", BODY),
      kv_table([
          ["Another business's phone number on three live demo pages",
           "The most serious. Phone was stripped from tracked files for the public repo, which left it empty, which made a guard skip an entire block — so the <i>reference</i> business's number survived into deployed HTML. The block now always runs, a stray phone link is a hard blocker, and the pages were redeployed and re-verified."],
          ["Binary downloads were being corrupted",
           "The fetch client forced UTF-8, which silently mangles every byte above 0x7F. Every logo and photograph would have downloaded “fine” and been broken."],
          ["Live sites recorded as unreachable",
           "Sites answering <font face=\"Courier\">302  to  /</font> with a cookie were an infinite self-redirect without a cookie jar. One real example went from “would not serve markup” to a 497KB success once cookies were kept."],
          ["Three tests only failed on Windows",
           "A path-traversal guard was never actually exercised on Linux, so the guard was untested where it ran."],
          ["483 addresses, 486 phone numbers and 500 coordinate pairs in a public repo",
           "Caught in review. Stripped on every write path, keeping a has-phone boolean so scoring is unaffected. Contact detail lives in the private layer."],
          ["The dashboard had no noindex and named 700 real businesses",
           "The deploy tool refused to publish it. Correct refusal — fixed at the renderer, not by loosening the check."],
      ], widths=[2.6 * inch, CW - 2.6 * inch], header=["What was wrong", "Detail"]),
      Spacer(1, 10),
      Paragraph("Getting a browser to render prospect sites", H3),
      Paragraph("Tier 1 is what separates a guess from a measurement, and it was "
                "blocked. Chromium could not use the environment's network proxy — "
                "the proxy never even logged the connection attempt — so every "
                "navigation failed and, left unhandled, a healthy business would score "
                "as a dead domain.", BODY),
      Paragraph("The fix was to notice that the <i>other</i> HTTP client already "
                "worked, since it is what every cheap audit uses. So the render now "
                "relays: the fetching side pulls each subresource, and Chromium is "
                "handed the bytes through request interception. Chromium does layout "
                "and never opens a socket. Certificate verification still happens, on "
                "the fetching side, against the same trust store — nothing was "
                "bypassed or disabled.", BODY),
      Spacer(1, 4),
      callout("What that unlocked",
              f"144 prospects had been stuck awaiting a render. After the first real "
              f"Tier 1 pass: <b>verify 144 down to {V.get('verify', 0)}</b>, "
              f"<b>ads_seo 0 up to {V.get('ads_seo', 0)}</b>, polish 333 up to "
              f"{V.get('polish', 0)}. {FACTS['tiers'].get('tier1', 0)} rows now carry "
              f"all six dimensions as real measurements, and mean quality across that "
              f"subset is {FACTS['t1mean']} — higher than the markup-only estimate "
              f"for the same rows, which is the expected direction, because markup "
              f"cannot see the things that make a site good.", S_STRONG),
      ]

# ======================== 5. HONEST LIMITATIONS ==========================
S += [CondPageBreak(3.4 * inch),
      Paragraph("5 · What is not done", H2),
      Paragraph("Stated plainly, because a report that only lists wins is not useful "
                "for deciding what to do next.", LEAD),
      kv_table([
          ["Builds are blocked, and this is the bottleneck",
           "Blocking",
           "Rebuild demos need the prospect's own photographs, and many rebuild targets have no usable imagery — which is part of why their sites are poor. One target yielded 2 usable images from 28 candidates; another yielded none. Reusing another business's photos is never acceptable, so the builder refuses to ship. This needs a generation step with images clearly labelled as illustrative."],
          ["Places enrichment is silently doing nothing",
           "Blocking",
           "The API key returns HTTP 400 — invalid. Review counts, ratings and ad presence are the strongest ability-to-pay signals and none of them are arriving. This is the single highest-value fix and it is a credentials task, not an engineering one. It is now visible on the dashboard's run-health strip."],
          ["557 of 700 rows are still markup-only",
           "Known",
           "The render pass covered the 144 that were blocked on it. A full pass is roughly a 30-minute run. Until then craft is half-weight on those rows and their strong grades stay unconfirmed by design."],
          ["Five of nine generated page sections still carry reference copy",
           "Known",
           "The service-guide section is dense with painting-specific advice that is wrong on a dentist. The shippable gate correctly blocks every build because of it."],
          ["No outcome feedback",
           "Known",
           "Thresholds are calibrated against site quality, not against what actually closed. Once builds start mailing, that loop can be closed and the ranking will improve on its own."],
          ["Discovery under-maps suburban trades",
           "Known",
           "OpenStreetMap holds far more medical than home-services businesses in this metro, and home services converts best. A second discovery source would fix the ratio."],
      ], widths=[2.15 * inch, 0.72 * inch, CW - 2.87 * inch],
          header=["Item", "Severity", "Detail"]),
      Spacer(1, 12),
      Paragraph("Recommended order of work", H3),
      *bullets([
          "<b>Get a working Places API key.</b> Cheapest action, largest effect on ranking quality.",
          "<b>Point the next discovery sweeps at Philadelphia</b> until coverage is no longer 2.2:1 against the priority market.",
          "<b>Decide the imagery policy for rebuild demos.</b> Nothing ships until this is settled; it is a judgement call, not a technical one.",
          "<b>Run a full Tier 1 pass</b> so every row is a measurement and the thresholds can be re-calibrated against rendered data.",
          "<b>Then</b> switch on the daily build automation — not before, because a scheduled job that produces blocked builds every morning is just noise.",
      ]),
      ]

# =============================== 6. BRAND ================================
S += [CondPageBreak(3.4 * inch),
      Paragraph("6 · The brand system", H2),
      Paragraph("One module now holds the tokens for every generated surface, so the "
                "radar and client reporting cannot drift apart.", LEAD),
      Paragraph("The blue is measured, not chosen", H3),
      Paragraph("needmomentum.com sits behind a bot challenge, so the site could not be "
                "read directly. The logo mark was pulled and sampled pixel by pixel: "
                "<b>#2A80C2 is 99.4% of the opaque pixels</b> — hsl(206°, "
                "64%, 46%). The gold is derived as its complement and tuned until "
                "ink-on-gold cleared accessibility contrast.", BODY),
      Spacer(1, 6),
      kv_table([
          ["#2A80C2", "Brand blue", "Measured from the mark. Fills and chrome; never small text."],
          ["#FFC63B", "Brand gold", "Derived complement. A fill with dark text on it, at 11.4:1."],
          ["#2673AF", "Blue for text", "The pure blue fails contrast as body text at 3.93:1. This passes at 4.70:1."],
      ], widths=[0.9 * inch, 1.2 * inch, CW - 2.1 * inch],
          header=["Hex", "Token", "Where it is allowed"]),
      Spacer(1, 7),
      Paragraph("Two rules that shaped everything else", H3),
      *bullets([
          "<b>Neither brand colour can be body text on a light surface.</b> Blue is 3.93:1 and gold is 1.46:1 — both fail. So text uses darkened or lifted variants and the pure brand colours are reserved for fills, where they are a background rather than something you read.",
          "<b>The score scale stays out of the brand's hues.</b> A row's colour <i>is</i> its grade — that is information, not decoration. When gold was added, the scale's ochre sat 1.27:1 from it and would have read as brand chrome across the largest band in the registry, so it was pushed into olive.",
      ]),
      Spacer(1, 4),
      Paragraph("Every colour pair a human reads is contrast-checked, with the ratio "
                "recorded beside the token so a later edit cannot quietly break it.", BODY),
      Spacer(1, 7),
      Paragraph("The dashboard", H3),
      Paragraph("A single self-contained HTML file: no external stylesheet, no webfont, "
                "no image host, no analytics. It works from a local file, from the "
                "hosted URL, and with the network unplugged. All 700 rows are embedded "
                "and searchable; any row opens to show the six dimension scores, each "
                "labelled with whether it was actually measured, so a half-weighted "
                "estimate is never presented as a measurement.", BODY),
      Spacer(1, 6),
      kv_table([
          ["Live URL", "momentum-prospect-radar.netlify.app"],
          ["Page weight", "593 KB, zero external requests"],
          ["Indexing", "noindex, enforced by the deploy tool — it refuses to publish without it"],
          ["Themes", "Pinned to the blue theme so it looks identical for every viewer"],
          ["Tests", "99 passing, including no-external-reference and escaping checks"],
      ], widths=[1.25 * inch, CW - 1.85 * inch]),
      Spacer(1, 9),
      ]

# ============================== 7. CLOSING ================================
S += [CondPageBreak(3.4 * inch),
      Paragraph("7 · How to use this", H2),
      Paragraph("The grader's value is not that it finds bad websites — that is "
                "easy. It is that it refuses to guess. When it cannot see enough to "
                "judge, it says so and asks for a render rather than producing a "
                "confident number. That is what makes it safe to point at "
                f"{total} real businesses and act on the answer.", LEAD),
      Paragraph("Three ways to read the dashboard", H3),
      *bullets([
          "<b>Deciding this week's 25.</b> Open the Rebuild queue, which is already "
          "ranked by opportunity with Philadelphia weighted highest. Work down it. "
          "Every row in it has a fault the audit could actually prove, not a hunch.",
          "<b>Before any outreach goes out.</b> Search the business by name. If it "
          f"lands in Traffic or shows a <i>strong</i> band, do not send a redesign "
          "pitch — the offer is ads, local SEO and GBP content. Those are the "
          f"{V.get('ads_seo', 0)} Mac was right about.",
          "<b>Sanity-checking a number.</b> Click any row. The six dimension bars each "
          "say whether that score was measured or estimated, so you can see exactly "
          "how much of a grade is evidence and how much is still an open question.",
      ]),
      Spacer(1, 6),
      callout("What would make the next version materially better",
              "A working Places API key, in one line. Review counts, ratings and ad "
              "presence are the strongest signals of whether a business can actually "
              "pay, and right now none of them are arriving. Everything else on the "
              "open-items list is engineering work that can be scheduled; this one is "
              "a credential and it gates the quality of every ranking on the page.",
              GOLD),
      Spacer(1, 12),
      kv_table([
          ["Next review", "After the first full render pass and a working Places key"],
          ["Owner", OWNER],
          ["Where it lives", "dillon-os / _os/automation · PR #262, draft"],
          ["Runs", "Daily sweep; dashboard rewritten every run"],
      ], widths=[1.25 * inch, CW - 1.85 * inch]),
      ]

doc.build(S)
print("wrote", OUT, os.path.getsize(OUT), "bytes")
