#!/usr/bin/env python3
"""Generate the Align HCM watchdog PDF reports (daily + weekly) from first-party JSON.

Reads baseline.json and site-analytics-dashboard/data.json (no HubSpot calls, no network),
renders a branded print HTML, and prints it to PDF via headless Chromium.

Usage:
  python3 generate_report.py --kind daily  [--date 2026-07-23] [--png]
  python3 generate_report.py --kind weekly [--date 2026-07-23] [--png]

Output:
  reports/pdf/daily/YYYY-MM-DD.pdf
  reports/pdf/weekly/YYYY-Www.pdf
"""

import argparse
import datetime as dt
import glob
import json
import os
import re
import subprocess
import sys
from html import escape

import charts

HERE = os.path.dirname(os.path.abspath(__file__))
WATCHDOG = os.path.dirname(HERE)                      # .../AlignHCM/Watchdog
REPO = os.path.abspath(os.path.join(WATCHDOG, "..", "..", ".."))  # repo root
BASELINE = os.path.join(WATCHDOG, "baseline.json")
DATA = os.path.join(REPO, "site-analytics-dashboard", "data.json")
REPORTS = os.path.join(WATCHDOG, "reports")
PDF_DIR = os.path.join(REPORTS, "pdf")
SCRATCH = os.environ.get(
    "REPORT_SCRATCH",
    "/tmp/claude-0/-home-user/2cd3f93a-8c36-5abb-9d66-237133e941dd/scratchpad",
)


# ----------------------------------------------------------------------------- helpers
def load_json(path):
    with open(path, encoding="utf-8") as fh:
        return json.load(fh)


def _cnt(x):
    """Count from either a list or an already-computed integer count."""
    return len(x) if isinstance(x, (list, tuple)) else int(x or 0)


def money(v):
    try:
        return "$" + format(int(round(float(v))), ",")
    except Exception:
        return str(v)


def pct(v, digits=2):
    try:
        return f"{float(v) * 100:.{digits}f}%"
    except Exception:
        return str(v)


def find_chrome():
    for c in (
        "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
        "/opt/pw-browsers/chromium/chrome-linux/chrome",
    ):
        if os.path.exists(c):
            return c
    hits = sorted(glob.glob("/opt/pw-browsers/chromium-*/chrome-linux/chrome"))
    if hits:
        return hits[-1]
    raise SystemExit("Chromium not found under /opt/pw-browsers")


# --------------------------------------------------------------------------- md parsing
def read_md(date_str):
    path = os.path.join(REPORTS, f"{date_str}.md")
    if not os.path.exists(path):
        return None
    with open(path, encoding="utf-8") as fh:
        return fh.read()


def md_section(text, heading_regex, level="## "):
    """Return the body under the first heading matching heading_regex, up to the next
    same-or-higher-level heading."""
    if not text:
        return ""
    lines = text.splitlines()
    out, capturing = [], False
    hlead = level
    for ln in lines:
        if ln.startswith(hlead) and re.search(heading_regex, ln[len(hlead):], re.I):
            capturing = True
            continue
        if capturing and ln.startswith(hlead):
            break
        if capturing and level == "## " and ln.startswith("# ") and not ln.startswith("## "):
            break
        if capturing:
            out.append(ln)
    return "\n".join(out).strip()


def parse_pipe_table(block):
    rows = []
    for ln in block.splitlines():
        ln = ln.strip()
        if not ln.startswith("|"):
            continue
        cells = [c.strip() for c in ln.strip("|").split("|")]
        if all(set(c) <= set("-: ") for c in cells):  # separator row
            continue
        rows.append(cells)
    return rows


def first_paragraph(block):
    for para in re.split(r"\n\s*\n", block):
        p = para.strip()
        if p and not p.startswith(("|", "-", "#", "*")):
            return p
    return block.strip()


def md_inline(s):
    s = escape(s)
    s = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", s)
    s = re.sub(r"`(.+?)`", r"<code>\1</code>", s)
    return s


# ------------------------------------------------------------------------------ render
def kpi(label, val, sub="", accent=False):
    cls = "kpi accent" if accent else "kpi"
    sub_html = f'<div class="k-sub">{sub}</div>' if sub else ""
    return (f'<div class="{cls}"><div class="k-label">{escape(label)}</div>'
            f'<div class="k-val num">{val}</div>{sub_html}</div>')


def alert_row(sev, dot, text):
    return (f'<div class="alert {sev}"><span class="a-dot">{escape(dot)}</span>'
            f'<span class="a-text">{text}</span></div>')


def daily_alert_rows(md):
    body = md_section(md, r"Alerts fired")
    if not body or body.lower().startswith("none"):
        return alert_row("good", "Clear", "No alerts fired. All thresholds within range.")
    rows = []
    items = re.split(r"\n(?=\d+\.\s)", body)
    for it in items:
        it = it.strip()
        if not it or it.startswith(("No site-health", "None")):
            continue
        txt = re.sub(r"^\d+\.\s*", "", it).replace("\n", " ")
        sev = "crit" if re.search(r"drop|lost|prematur|critical|breach|down\b|89%", txt, re.I) else "warn"
        rows.append(alert_row(sev, "Alert", md_inline(txt)))
    return "".join(rows) if rows else alert_row("good", "Clear", "No alerts fired.")


def foot(date_str, page_label):
    return (f'<div class="foot"><span>Align HCM site-health watchdog &middot; '
            f'first-party HubSpot data, no Google dependency</span>'
            f'<span>{escape(page_label)} &middot; generated {escape(date_str)}</span></div>')


def status_from_alerts(md):
    body = md_section(md, r"Alerts fired")
    if not body or body.lower().startswith("none"):
        return ("good", "Steady")
    if re.search(r"drop|lost|prematur|critical|89%", body, re.I):
        return ("crit", "Alert")
    return ("warn", "Watch")


# ------------------------------------------------------------------------------- daily
def build_daily(date_str, base, data):
    md = read_md(date_str) or ""
    d = dt.date.fromisoformat(date_str)
    yday = (d - dt.timedelta(days=1)).isoformat()

    days = base.get("daily_series", {}).get("days", [])
    by_date = {x["date"]: x for x in days}
    yrow = by_date.get(yday, {})
    # 7-day avg ending yesterday
    window = [by_date[k] for k in
              [(d - dt.timedelta(days=i)).isoformat() for i in range(1, 8)] if k in by_date]
    avg_views = round(sum(x["views"] for x in window) / len(window)) if window else 0
    avg_subs = round(sum(x["submissions"] for x in window) / len(window), 1) if window else 0

    mrow = base["monthly_series"][-1]
    li = base["leading_indicators"]
    conv_july = li["conversion_rate"]["monthly"].get(mrow["month"], 0)
    rec = base["closed_won_reconciliation"]
    mh = rec["marketing_headline"]
    ip = li["influenced_open_pipeline"]
    fg = li["lead_follow_up_gap"]
    dg = base["data_integrity"]["closed_lost_without_reason"]
    aeo = base.get("aeo_referrals_window", {})
    srcs = base.get("contact_sources_window", {})

    sev, status = status_from_alerts(md)
    verdict = first_paragraph(md_section(md, r"Verdict")) or "No verdict recorded."
    suggestion = first_paragraph(md_section(md, r"One suggestion")) or ""
    seo = md_section(md, r"SEO sweep")

    # itemized submissions (only when the day's report has an "### Every submission" table)
    sub_rows = parse_pipe_table(md_section(md, r"Every submission", level="### "))
    body = []
    for cells in (sub_rows[1:] if len(sub_rows) > 1 else []):
        if len(cells) < 4:
            continue
        verdict_cell = cells[3]
        tag = "yes" if verdict_cell.lower().startswith("yes") else \
              "no" if verdict_cell.lower().startswith("no") else "low"
        body.append(
            f"<tr><td>{md_inline(cells[0])}</td><td>{md_inline(cells[1])}</td>"
            f"<td>{md_inline(cells[2])}</td>"
            f'<td><span class="tag {tag}">{escape(verdict_cell.split(",")[0])}</span></td></tr>')
    if body:
        sub_html = (
            '<section class="card"><div class="eyebrow">Every submission, itemized</div>'
            '<table><tr><th>Page / meeting</th><th>Who</th><th>Source</th><th>Genuine?</th></tr>'
            + "".join(body) + "</table></section>")
    else:
        yviews = yrow.get("views", "-")
        sub_html = (
            '<section class="card"><div class="eyebrow">Submissions</div>'
            f'<p class="muted small">No form submissions yesterday ({yviews} views). '
            'Weekend and low-traffic days commonly convert nobody; not an alert on its own.</p></section>')

    seo_html = ""
    if seo:
        items = [md_inline(re.sub(r"^[-*]\s*", "", l.strip()))
                 for l in seo.splitlines() if l.strip().startswith(("-", "*"))]
        if items:
            seo_html = ('<section class="card"><div class="eyebrow">SEO sweep (daily)</div><ul class="tight">'
                        + "".join(f"<li>{it}</li>" for it in items) + "</ul></section>")

    kpis_year = "".join([
        kpi("July views", f'{mrow["views"]:,}', f'{mrow["submissions"]} submissions'),
        kpi("Conversion", pct(conv_july), "vs 1.20% floor"),
        kpi("New-business won", money(mh["new_business_won"]), f'{rec["by_deal_type"]["new_business"]["deals"]} deals', accent=True),
        kpi("Verified web origin", money(mh["verified_originated"]), "Organic Search"),
    ])
    kpis_day = "".join([
        kpi("Views (Jul " + yday[-2:] + ")", str(yrow.get("views", "-")), f"7-day avg {avg_views}"),
        kpi("Submissions", str(yrow.get("submissions", "-")),
            f'clean {yrow.get("submissionsClean", "-")} &middot; avg {avg_subs}'),
        kpi("New contacts", str(yrow.get("contacts", "-")), ""),
        kpi("AEO referrals", str(sum(aeo.values()) if aeo else 0), "ChatGPT " + str(aeo.get("ChatGPT", 0))),
    ])

    li_html = (
        '<section class="card"><div class="eyebrow">Leading indicators &amp; data integrity</div>'
        '<table>'
        f'<tr><td>Visit-to-lead conversion (July)</td><td class="r num">{pct(conv_july)}</td>'
        f'<td><span class="tag {"yes" if conv_july>=0.012 else "no"}">'
        f'{"above floor" if conv_july>=0.012 else "below floor"}</span></td></tr>'
        f'<tr><td>Marketing-influenced open pipeline</td><td class="r num">{money(ip["total"])}</td>'
        f'<td><span class="tag {"no" if ip.get("prior",0)>ip["total"] else "yes"}">'
        f'{"down from "+money(ip["prior"]) if ip.get("prior") else "steady"}</span></td></tr>'
        f'<tr><td>Lead follow-up gap (no outreach)</td>'
        f'<td class="r num">{fg["noOutreach"]}/{fg["convertedContacts"]} = {pct(fg["noOutreachPct"],0)}</td>'
        f'<td><span class="tag {"no" if fg["noOutreachPct"]>0.35 else "yes"}">'
        f'{"above 35% threshold" if fg["noOutreachPct"]>0.35 else "ok"}</span></td></tr>'
        f'<tr><td>Closed-lost without a reason</td><td class="r num">{dg["deals"]} deals &middot; {money(dg["value"])}</td>'
        f'<td><span class="tag no">{pct(dg["pctOfLost"],0)} of lost</span></td></tr>'
        '</table></section>')

    issues = base.get("known_issues_open", [])
    issues_html = ('<section class="card"><div class="eyebrow">Open issues</div><ul class="tight">'
                   + "".join(f"<li>{md_inline(i)}</li>" for i in issues) + "</ul></section>")

    body = f"""
<div class="page">
  <div class="band">
    <span class="pill {sev}">{status}</span>
    <div class="wordmark">ALIGN <b>HCM</b> &middot; SITE-HEALTH WATCHDOG</div>
    <h1>Daily Report</h1>
    <div class="sub">alignhcm.com &middot; {escape(date_str)}</div>
    <div class="meta">First-party HubSpot content analytics &amp; CRM &middot; reporting window 2026-01-01 to {escape(date_str)}</div>
  </div>

  <section><div class="eyebrow">Verdict</div><p class="lead">{md_inline(verdict)}</p></section>

  <section><div class="eyebrow">Alerts fired</div>{daily_alert_rows(md)}</section>

  <div class="eyebrow">Yesterday (Jul {escape(yday[-2:])})</div>
  <div class="kpis">{kpis_day}</div>

  {sub_html}

  <div class="eyebrow">All-year KPIs (since 2026-01-01)</div>
  <div class="kpis">{kpis_year}</div>

  {li_html}

  <div class="cols">{seo_html}{issues_html}</div>

  <section class="card" style="border-left:4px solid var(--accent)">
    <div class="eyebrow">One highest-leverage action today</div><p>{md_inline(suggestion)}</p></section>

  {foot(date_str, "Daily")}
</div>
"""
    return body, sev, status


# ------------------------------------------------------------------------------ weekly
def build_weekly(date_str, base, data):
    d = dt.date.fromisoformat(date_str)
    end = d - dt.timedelta(days=1)                 # yesterday
    start = end - dt.timedelta(days=6)             # 7-day window
    days = base.get("daily_series", {}).get("days", [])
    by_date = {x["date"]: x for x in days}
    wk = [by_date[k] for k in
          [(start + dt.timedelta(days=i)).isoformat() for i in range(7)] if k in by_date]
    prev = [by_date[k] for k in
            [(start - dt.timedelta(days=7 - i)).isoformat() for i in range(7)] if k in by_date]

    wk_views = sum(x["views"] for x in wk)
    wk_subs = sum(x["submissions"] for x in wk)
    wk_subs_clean = sum(x.get("submissionsClean", x["submissions"]) for x in wk)
    wk_contacts = sum(x["contacts"] for x in wk)
    prev_views = sum(x["views"] for x in prev)
    wow = ((wk_views - prev_views) / prev_views * 100) if prev_views else None
    iso_year, iso_week, _ = end.isocalendar()

    chart = charts.day_bar_chart(wk, "views", overlay_key="submissionsClean")

    # collect alerts + submissions across the week from each day's md
    week_alerts, week_subs = [], []
    for i in range(7):
        ds = (start + dt.timedelta(days=i)).isoformat()
        md = read_md(ds)
        if not md:
            continue
        ab = md_section(md, r"Alerts fired")
        if ab and not ab.lower().startswith("none"):
            for it in re.split(r"\n(?=\d+\.\s)", ab):
                t = re.sub(r"^\d+\.\s*", "", it.strip()).replace("\n", " ")
                if t and not t.startswith(("No site-health", "None")):
                    week_alerts.append((ds, t))
        st = parse_pipe_table(md_section(md, r"Every submission", level="### "))
        for cells in st[1:] if len(st) > 1 else []:
            if len(cells) >= 4:
                week_subs.append((ds, cells))

    li = base["leading_indicators"]
    rec = base["closed_won_reconciliation"]
    mh = rec["marketing_headline"]
    ip = li["influenced_open_pipeline"]
    fg = li["lead_follow_up_gap"]
    dg = base["data_integrity"]
    attr = base.get("attribution_snapshot", {})
    aeo = base.get("aeo_referrals_window", {})
    cov = base.get("site_coverage_live", {})
    waf = next((x for x in base.get("known_issues_resolved", [])
                if x.get("id") == "waf-blocks-ai-crawlers"), {})

    # page 1: overview + views
    wow_txt = (f'{"+" if (wow or 0)>=0 else ""}{wow:.0f}% WoW' if wow is not None
               else "prior week partial")
    kpis_wk = "".join([
        kpi("Views this week", f"{wk_views:,}", wow_txt),
        kpi("Submissions", f"{wk_subs}", f"{wk_subs_clean} clean after pollution", accent=True),
        kpi("New contacts", f"{wk_contacts}", ""),
        kpi("Alerts fired", f"{len(week_alerts)}", "see CRM hygiene page"),
    ])

    alerts_banner = ""
    if week_alerts:
        rows = []
        for ds, t in week_alerts[:5]:
            sev = "crit" if re.search(r"drop|lost|prematur|critical|89%|down", t, re.I) else "warn"
            rows.append(alert_row(sev, ds[-5:], md_inline(t)))
        alerts_banner = ('<section><div class="eyebrow">Alerts fired this week</div>'
                         + "".join(rows) + "</section>")
    else:
        alerts_banner = ('<section><div class="eyebrow">Alerts fired this week</div>'
                         + alert_row("good", "Clear", "No alerts fired this week.") + "</section>")

    page1 = f"""
<div class="page">
  <div class="band">
    <span class="pill {"crit" if week_alerts else "good"}">{"Alert" if week_alerts else "Steady"}</span>
    <div class="wordmark">ALIGN <b>HCM</b> &middot; SITE-HEALTH WATCHDOG</div>
    <h1>Weekly Report</h1>
    <div class="sub">alignhcm.com &middot; {start.isoformat()} to {end.isoformat()} &middot; {iso_year}-W{iso_week:02d}</div>
    <div class="meta">First-party HubSpot content analytics &amp; CRM &middot; no Google Analytics or Search Console</div>
  </div>

  <div class="kpis">{kpis_wk}</div>

  <section class="card">
    <div class="eyebrow">Views for the week</div>
    {chart}
    <div class="chart-cap">Bars are daily views; the slim orange marker is clean conversions (test/spam removed).
    Week total {wk_views:,} views ({wow_txt}); {wk_subs_clean} clean conversions.</div>
  </section>

  {alerts_banner}
  {foot(date_str, "Weekly · page 1 of 3")}
</div>
"""

    # page 2: conversions & leads + revenue & pipeline
    conv_rows = []
    for ds, cells in week_subs:
        vc = cells[3]
        tag = "yes" if vc.lower().startswith("yes") else "no" if vc.lower().startswith("no") else "low"
        conv_rows.append(
            f"<tr><td>{escape(ds[-5:])}</td><td>{md_inline(cells[0])}</td><td>{md_inline(cells[1])}</td>"
            f'<td>{md_inline(cells[2])}</td><td><span class="tag {tag}">{escape(vc.split(",")[0])}</span></td></tr>')
    conv_table = ('<table><tr><th>Day</th><th>Page / meeting</th><th>Who</th><th>Source</th><th>Genuine?</th></tr>'
                  + "".join(conv_rows) + "</table>") if conv_rows else \
                 '<p class="muted small">No itemized submissions captured in daily reports this week.</p>'

    touch = attr.get("byChannel", [])
    touch_rows = charts.bar_rows(
        [(t["channel"], t.get("revenue", 0), money(t.get("revenue", 0))) for t in touch],
        "fill-navy") if touch else ""

    page2 = f"""
<div class="page">
  <div class="eyebrow">Conversions &amp; leads this week</div>
  <section class="card">
    <p class="small muted">Raw submissions {wk_subs}, clean {wk_subs_clean} after removing QA-test and spam-bot fills.
    {wk_contacts} new contacts created.</p>
    {conv_table}
  </section>

  <div class="eyebrow">Revenue &amp; pipeline (live-reconciled)</div>
  <div class="kpis">
    {kpi("New-business won YTD", money(mh["new_business_won"]), f'{rec["by_deal_type"]["new_business"]["deals"]} deals', accent=True)}
    {kpi("Web-sourced", money(mh["web_sourced_won"]), "Direct + Organic")}
    {kpi("Verified origin", money(mh["verified_originated"]), "Organic Search only")}
    {kpi("Total closed-won", money(rec["total_closed_won"]["amount"]), f'{rec["total_closed_won"]["deals"]} deals')}
  </div>
  <section class="card">
    <table>
      <tr><th>Attribution layer</th><th class="r">Amount</th><th>What it means</th></tr>
      <tr><td>Verified owned-channel origin</td><td class="r num">{money(mh["verified_originated"])}</td>
        <td>Cohort + conflict-checked. The honest floor.</td></tr>
      <tr><td>Web-sourced (broad)</td><td class="r num">{money(mh["web_sourced_won"])}</td>
        <td>Direct + Organic new business; some origin disputed.</td></tr>
      <tr><td>LINEAR touch influence</td><td class="r num">{money(attr.get("totalAttributedRevenue",0))}</td>
        <td>Influence across touchpoints, not origination.</td></tr>
    </table>
  </section>
  <section class="card" style="border-left:4px solid var(--crit)">
    <div class="eyebrow">Pipeline movement</div>
    <p>Marketing-influenced open pipeline is now <b>{money(ip["total"])}</b> ({ip["deals"]} deal),
    down from {money(ip.get("prior",0))}. {md_inline(ip.get("alert",""))}</p>
  </section>
  {foot(date_str, "Weekly · page 2 of 3")}
</div>
"""

    # page 3: SEO + site health, CRM hygiene, AEO
    issues_open = base.get("known_issues_open", [])
    crawler_ok = bool(waf)
    aeo_rows = "".join(
        f'<tr><td>{escape(k)}</td><td class="r num">{v}</td></tr>' for k, v in aeo.items())
    src_items = [(k.replace("_", " ").title(), v, str(v))
                 for k, v in sorted(base.get("contact_sources_window", {}).items(),
                                    key=lambda kv: -kv[1])]
    page3 = f"""
<div class="page">
  <div class="eyebrow">SEO &amp; site health</div>
  <section class="card">
    <table>
      <tr><th>Check</th><th class="r">Result</th><th>Status</th></tr>
      <tr><td>Sitemap URLs healthy</td><td class="r num">{cov.get("finalOk","-")}/{cov.get("sitemapUrls","-")}</td>
        <td><span class="tag yes">ok</span></td></tr>
      <tr><td>Broken internal targets</td><td class="r num">{_cnt(cov.get("brokenInternalTargets",0))}</td>
        <td><span class="tag {"yes" if _cnt(cov.get("brokenInternalTargets",0))==0 else "no"}">{"none" if _cnt(cov.get("brokenInternalTargets",0))==0 else "broken"}</span></td></tr>
      <tr><td>AI crawler access (GPTBot, ClaudeBot, etc.)</td><td class="r">200</td>
        <td><span class="tag {"yes" if crawler_ok else "no"}">{"allowed" if crawler_ok else "BLOCKED"}</span></td></tr>
      <tr><td>llms.txt</td><td class="r">text/plain</td>
        <td><span class="tag {"yes" if crawler_ok else "low"}">{"live" if crawler_ok else "check"}</span></td></tr>
    </table>
    <div class="eyebrow" style="margin-top:9px">Open SEO issues</div>
    <ul class="tight">{"".join(f"<li>{md_inline(i)}</li>" for i in issues_open)}</ul>
  </section>

  <div class="cols">
    <section class="card">
      <div class="eyebrow">CRM hygiene &amp; leading indicators</div>
      <table>
        <tr><td>Follow-up gap</td><td class="r num">{pct(fg["noOutreachPct"],0)}</td></tr>
        <tr><td>Closed-lost w/o reason</td><td class="r num">{dg["closed_lost_without_reason"]["deals"]} ({pct(dg["closed_lost_without_reason"]["pctOfLost"],0)})</td></tr>
        <tr><td>Premature closes flagged</td><td class="r num">{len(dg.get("premature_closes",[]))}</td></tr>
      </table>
    </section>
    <section class="card">
      <div class="eyebrow">AEO referrals (AI answer engines)</div>
      <table>{aeo_rows}</table>
    </section>
  </div>

  <section class="card">
    <div class="eyebrow">Contact source mix (YTD)</div>
    {charts.bar_rows(src_items, "fill-navy")}
  </section>
  {foot(date_str, "Weekly · page 3 of 3")}
</div>
"""
    return page1 + page2 + page3, ("crit" if week_alerts else "good"), (iso_year, iso_week)


# --------------------------------------------------------------------------------- main
def wrap_html(body):
    with open(os.path.join(HERE, "brand.css"), encoding="utf-8") as fh:
        css = fh.read()
    return (f"<!doctype html><html><head><meta charset='utf-8'>"
            f"<title>Align HCM watchdog</title><style>{css}\ncode{{font-family:inherit;"
            f"background:#eef2f7;padding:0 3px;border-radius:3px;font-size:9px}}</style>"
            f"</head><body>{body}</body></html>")


def render_pdf(html, out_pdf, png=False):
    os.makedirs(os.path.dirname(out_pdf), exist_ok=True)
    os.makedirs(SCRATCH, exist_ok=True)
    html_path = os.path.join(SCRATCH, os.path.basename(out_pdf).replace(".pdf", ".html"))
    with open(html_path, "w", encoding="utf-8") as fh:
        fh.write(html)
    chrome = find_chrome()
    profile = os.path.join(SCRATCH, ".chrome-profile")
    common = [chrome, "--headless", "--no-sandbox", "--disable-gpu",
              "--disable-dev-shm-usage", f"--user-data-dir={profile}"]
    subprocess.run(common + ["--no-pdf-header-footer", f"--print-to-pdf={out_pdf}",
                             f"file://{html_path}"], check=True,
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=120)
    if png:
        out_png = out_pdf.replace(".pdf", ".png")
        subprocess.run(common + ["--screenshot=" + out_png, "--window-size=1100,1400",
                                 "--hide-scrollbars", f"file://{html_path}"], check=True,
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=120)
    return out_pdf


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--kind", choices=["daily", "weekly"], required=True)
    ap.add_argument("--date", default=dt.date.today().isoformat())
    ap.add_argument("--png", action="store_true", help="also render a PNG preview of page 1")
    args = ap.parse_args()

    base = load_json(BASELINE)
    data = load_json(DATA)

    if args.kind == "daily":
        body, sev, status = build_daily(args.date, base, data)
        out = os.path.join(PDF_DIR, "daily", f"{args.date}.pdf")
        render_pdf(wrap_html(body), out, png=args.png)
        print(f"daily PDF -> {out} (status: {status})")
    else:
        body, sev, (iy, iw) = build_weekly(args.date, base, data)
        out = os.path.join(PDF_DIR, "weekly", f"{iy}-W{iw:02d}.pdf")
        render_pdf(wrap_html(body), out, png=args.png)
        print(f"weekly PDF -> {out}")


if __name__ == "__main__":
    main()
