#!/usr/bin/env python3
"""Build the Momentum 360 Account Manager AI Workflow guide (4-page PDF).

Regenerate with:  python3 build.py [output.pdf]

Requires Montserrat + Lato installed to the font path (see README.md in this folder)
and a Chromium binary for the print-to-PDF step.
"""
import base64, json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ICONS = json.load(open(f"{HERE}/icons/paths.json"))
B64 = {k: base64.b64encode(open(f"{HERE}/assets/{f}", "rb").read()).decode()
       for k, f in (("logo", "m360-logo.png"), ("mark", "m360-mark-lg.png"),
                    ("wm", "m360-wm.png"))}

# ---- Momentum 360 brand tokens (sampled from the AI Search eBook) ----
NAVY      = "#062A4F"
NAVY_DEEP = "#04203E"
NAVY_MID  = "#0D3A6B"
BLUE      = "#0D69AE"
BLUE_LT   = "#2C82C9"
GOLD      = "#F0B018"
GOLD_DK   = "#C98D0A"
CREAM     = "#FEF4DB"
INK       = "#33465C"
MUTED     = "#6A788B"
LINE      = "#E3E9F0"


def icon(slug, size=20, color=None):
    i = ICONS[slug]
    fill = color or i["hex"]
    return (f'<svg class="ic" viewBox="0 0 24 24" width="{size}" height="{size}" '
            f'fill="{fill}"><path d="{i["d"]}"/></svg>')


def tile(slug, size=17, box=32, color=None, bg="#fff"):
    return (f'<span class="tile" style="width:{box}px;height:{box}px;background:{bg}">'
            f'{icon(slug, size, color)}</span>')


LOGO = f'<img class="logo" src="data:image/png;base64,{B64["logo"]}" alt="Momentum 360">'
MARK = f'data:image/png;base64,{B64["mark"]}'
WM = f'data:image/png;base64,{B64["wm"]}'

# neutral (non-brand) glyphs for the setup steps
GLYPHS = {
    "person": "M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.4 0-8 2.6-8 5.8V22h16v-2.2"
              "c0-3.2-3.6-5.8-8-5.8Z",
    "spark": "M12 1.6l2.1 5.6 5.6 2.1-5.6 2.1L12 17l-2.1-5.6L4.3 9.3l5.6-2.1L12 1.6Z"
             "M19.4 15.2l1 2.6 2.6 1-2.6 1-1 2.6-1-2.6-2.6-1 2.6-1 1-2.6Z",
}


def glyph(name, size=17, color=BLUE):
    return (f'<svg viewBox="0 0 24 24" width="{size}" height="{size}" fill="{color}">'
            f'<path d="{GLYPHS[name]}"/></svg>')


def gtile(name, size=17, box=30, color=BLUE):
    return (f'<span class="tile" style="width:{box}px;height:{box}px;background:#F4F7FB;'
            f'border:1px solid #E7EDF4;box-shadow:none">{glyph(name, size, color)}</span>')

CSS = f"""
@page {{ size: letter; margin: 0; }}
* {{ margin:0; padding:0; box-sizing:border-box; }}
html {{ -webkit-print-color-adjust: exact; print-color-adjust: exact; }}
body {{ font-family:'Lato',sans-serif; color:{INK}; font-size:10.2pt; line-height:1.5; }}
.page {{ width:816px; height:1056px; position:relative; overflow:hidden;
         page-break-after:always; background:#fff; }}
.page:last-child {{ page-break-after:auto; }}
h1,h2,h3,h4,.mont {{ font-family:'Montserrat',sans-serif; }}

/* ---------- cover ---------- */
.cover {{ background:linear-gradient(158deg,{NAVY_MID} 0%,{NAVY} 42%,{NAVY_DEEP} 100%);
          color:#fff; padding:52px 62px 0; }}
.wm {{ position:absolute; right:-210px; top:-120px; width:800px; opacity:.05; }}
.cov-top {{ display:flex; justify-content:space-between; align-items:center;
            position:relative; z-index:2; }}
.logo {{ height:46px; }}
.badge {{ border:1.4px solid rgba(240,176,24,.62); border-radius:22px; padding:7px 17px;
          font-family:'Montserrat',sans-serif; font-size:7.6pt; font-weight:700;
          letter-spacing:.19em; color:{GOLD}; }}
.chips {{ display:flex; gap:9px; margin-top:40px; position:relative; z-index:2; }}
.chip {{ border:1.2px solid rgba(255,255,255,.26); background:rgba(255,255,255,.055);
         border-radius:20px; padding:9px 15px; font-family:'Montserrat',sans-serif;
         font-size:7.2pt; font-weight:700; letter-spacing:.15em; color:#DCE7F3; }}
.eyebrow-cov {{ display:flex; align-items:center; gap:14px; margin-top:19px;
                position:relative; z-index:2; }}
.eyebrow-cov span {{ font-family:'Montserrat',sans-serif; font-size:8pt; font-weight:800;
                     letter-spacing:.2em; color:{GOLD}; white-space:nowrap; }}
.eyebrow-cov i {{ flex:1; height:1px; background:rgba(240,176,24,.4); }}
h1 {{ font-size:53pt; font-weight:800; line-height:.99; letter-spacing:-.022em;
      margin-top:22px; position:relative; z-index:2; }}
.dot {{ color:{GOLD}; }}
.cov-sub {{ font-size:14.4pt; line-height:1.4; color:#E6EEF7; margin-top:24px;
            max-width:610px; position:relative; z-index:2; }}
.cov-sub b {{ color:#fff; font-weight:700; }}
.cov-desc {{ font-size:10pt; line-height:1.62; color:#A9C0D8; margin-top:17px;
             max-width:562px; position:relative; z-index:2; }}

.striprow {{ display:flex; align-items:center; gap:8px; margin-top:34px;
             position:relative; z-index:2; }}
.striplab {{ font-family:'Montserrat',sans-serif; font-size:7pt; font-weight:800;
             letter-spacing:.16em; color:#7E9BBA; margin-right:5px; }}
.tile {{ display:inline-flex; align-items:center; justify-content:center;
         border-radius:8px; box-shadow:0 1px 3px rgba(0,0,0,.14); }}

/* cover mini-contents */
.inside {{ position:relative; z-index:2; margin-top:30px;
           border-top:1px solid rgba(255,255,255,.13);
           border-bottom:1px solid rgba(255,255,255,.13); padding:15px 0 16px; }}
.inside .ih {{ font-family:'Montserrat',sans-serif; font-size:7pt; font-weight:800;
               letter-spacing:.19em; color:{GOLD}; margin-bottom:11px; }}
.inside ol {{ list-style:none; display:flex; gap:0; }}
.inside li {{ flex:1; display:flex; gap:10px; padding-right:16px; }}
.inside li + li {{ border-left:1px solid rgba(255,255,255,.13); padding-left:16px; }}
.inside .num {{ font-family:'Montserrat',sans-serif; font-size:8pt; font-weight:800;
                color:{GOLD}; padding-top:2px; }}
.inside b {{ font-family:'Montserrat',sans-serif; font-size:10pt; font-weight:700;
             color:#fff; display:block; letter-spacing:-.01em; }}
.inside p {{ font-size:8.2pt; line-height:1.4; color:#9DB6D0; margin-top:3px; }}

.stats {{ display:flex; gap:13px; position:absolute; left:62px; right:62px; bottom:112px;
          z-index:2; align-items:flex-end; }}
.stat {{ flex:1; background:rgba(255,255,255,.075); border:1px solid rgba(255,255,255,.15);
         border-bottom:2.6px solid {GOLD}; border-radius:11px; padding:15px 16px 14px; }}
.stat b {{ font-family:'Montserrat',sans-serif; font-size:23pt; font-weight:800;
           color:{GOLD}; display:block; line-height:1; letter-spacing:-.02em; }}
.stat b em {{ font-size:12pt; font-style:normal; }}
.stat p {{ font-size:8.4pt; line-height:1.36; color:#C6D6E6; margin-top:8px; }}
.cov-foot {{ position:absolute; left:62px; right:62px; bottom:46px; z-index:2;
             display:flex; justify-content:space-between; align-items:flex-end;
             border-top:1px solid rgba(255,255,255,.14); padding-top:15px; }}
.cov-foot .l b {{ font-family:'Montserrat',sans-serif; font-size:10pt; font-weight:700;
                  color:#fff; }}
.cov-foot .l p, .cov-foot .r {{ font-size:8pt; color:#93AECB; line-height:1.5; }}
.cov-foot .r {{ text-align:right; }}

/* ---------- interior ---------- */
.inner {{ padding:44px 62px 0; }}
.rhead {{ display:flex; justify-content:space-between;
          font-family:'Montserrat',sans-serif; font-size:7.2pt; font-weight:700;
          letter-spacing:.19em; color:#9DAABA; }}
.eyebrow {{ display:flex; align-items:center; gap:11px; margin-top:26px; }}
.eyebrow i {{ width:20px; height:3px; background:{GOLD}; border-radius:2px; }}
.eyebrow span {{ font-family:'Montserrat',sans-serif; font-size:8pt; font-weight:800;
                 letter-spacing:.19em; color:{BLUE}; }}
h2 {{ font-size:26.5pt; font-weight:800; color:{NAVY}; letter-spacing:-.019em;
      margin-top:7px; line-height:1.08; }}
.rule {{ width:56px; height:3.4px; background:{GOLD}; border-radius:2px; margin-top:12px; }}
.lede {{ font-size:10.6pt; line-height:1.6; color:{INK}; margin-top:13px; max-width:678px; }}
.lede b {{ color:{NAVY}; font-weight:700; }}
h3 {{ font-family:'Montserrat',sans-serif; font-size:8.2pt; font-weight:800;
      letter-spacing:.17em; color:{BLUE}; margin-top:22px; }}
h3 em {{ font-style:normal; color:{MUTED}; font-weight:700; letter-spacing:.08em; }}

/* five-step loop */
.loop {{ display:flex; gap:9px; margin-top:14px; }}
.step {{ flex:1; border:1px solid {LINE}; border-radius:11px; overflow:hidden;
         box-shadow:0 1px 2px rgba(6,42,79,.05); }}
.step .cap {{ background:linear-gradient(135deg,{BLUE} 0%,{NAVY} 100%); color:#fff;
              padding:9px 11px 10px; }}
.step .cap b {{ font-family:'Montserrat',sans-serif; font-size:7pt; font-weight:800;
                letter-spacing:.14em; color:{GOLD}; display:block; }}
.step .cap strong {{ font-family:'Montserrat',sans-serif; font-size:10.6pt; font-weight:700;
                     display:block; margin-top:2px; letter-spacing:-.01em; }}
.step p {{ padding:10px 11px 12px; font-size:8.5pt; line-height:1.42; color:{INK}; }}

/* stacked rows (eBook layer style) */
.rows {{ margin-top:14px; }}
.row {{ display:flex; align-items:stretch; border:1px solid {LINE}; border-radius:10px;
        overflow:hidden; margin-bottom:8px; box-shadow:0 1px 2px rgba(6,42,79,.05); }}
.row .lab {{ width:196px; flex:none; background:{NAVY}; color:#fff; padding:11px 14px;
             display:flex; flex-direction:column; justify-content:center; }}
.row .lab b {{ font-family:'Montserrat',sans-serif; font-size:6.9pt; font-weight:800;
               letter-spacing:.15em; color:{GOLD}; }}
.row .lab strong {{ font-family:'Montserrat',sans-serif; font-size:10.4pt; font-weight:700;
                    margin-top:2px; letter-spacing:-.01em; }}
.row .bd {{ padding:11px 15px; font-size:9.3pt; line-height:1.47; display:flex;
            align-items:center; gap:11px; }}
.row .bd b {{ color:{NAVY}; font-weight:700; }}

/* callout */
.callout {{ background:{CREAM}; border:1px solid #F3DFA6; border-radius:12px;
            padding:15px 19px 17px; margin-top:20px; }}
.callout .ch {{ display:flex; align-items:center; gap:9px; }}
.callout .ch img {{ width:17px; height:17px; }}
.callout .ch span {{ font-family:'Montserrat',sans-serif; font-size:8pt; font-weight:800;
                     letter-spacing:.18em; color:{GOLD_DK}; }}
.callout p {{ font-size:9.6pt; line-height:1.56; color:#5A4A22; margin-top:9px; }}
.callout p b {{ color:#3E3312; font-weight:700; }}

/* plugin grid */
.grid {{ display:grid; grid-template-columns:1fr 1fr 1fr; gap:9px; margin-top:14px; }}
.card {{ border:1px solid {LINE}; border-radius:11px; padding:12px 13px 13px;
         box-shadow:0 1px 2px rgba(6,42,79,.05); display:flex; flex-direction:column; }}
.card .ct {{ display:flex; align-items:center; gap:9px; }}
.card .ct .tile {{ background:#F4F7FB; border:1px solid #E7EDF4; box-shadow:none; }}
.card .ct b {{ font-family:'Montserrat',sans-serif; font-size:10.2pt; font-weight:700;
               color:{NAVY}; letter-spacing:-.01em; }}
.card p {{ font-size:8.5pt; line-height:1.44; margin-top:9px; color:{INK}; }}
.card .gate {{ display:block; margin-top:auto; padding-top:8px; border-top:1px dashed #DFE6EF;
               font-size:7.5pt; line-height:1.34; color:{MUTED}; }}
.card .gate b {{ font-family:'Montserrat',sans-serif; font-size:6.6pt; font-weight:800;
                 letter-spacing:.13em; color:{BLUE_LT}; }}

/* role bundles */
.bundles {{ display:grid; grid-template-columns:1fr 1fr 1fr; gap:9px; margin-top:13px; }}
.bundle {{ border:1px solid {LINE}; border-left:3px solid {GOLD}; border-radius:9px;
           padding:11px 12px 12px; }}
.bundle .bt {{ font-family:'Montserrat',sans-serif; font-size:9.2pt; font-weight:700;
               color:{NAVY}; }}
.bundle .icons {{ display:flex; gap:5px; margin-top:8px; }}
.bundle .icons .tile {{ background:#F4F7FB; border:1px solid #E7EDF4; box-shadow:none; }}
.bundle p {{ font-size:8pt; line-height:1.4; margin-top:8px; color:{INK}; }}

/* prompts */
.prompt {{ border:1px solid {LINE}; border-left:3.4px solid {BLUE}; border-radius:9px;
           padding:11px 15px 12px; margin-top:7px; background:#FAFCFE; }}
.prompt .pt {{ display:flex; align-items:center; justify-content:space-between; }}
.prompt .pt b {{ font-family:'Montserrat',sans-serif; font-size:8pt; font-weight:800;
                 letter-spacing:.15em; color:{BLUE}; }}
.prompt .pt em {{ font-family:'Montserrat',sans-serif; font-style:normal; font-size:7pt;
                  font-weight:700; letter-spacing:.11em; color:{MUTED}; }}
.prompt q {{ display:block; font-size:9.2pt; line-height:1.55; color:{NAVY};
             margin-top:8px; quotes:none; }}
.prompt q:before, .prompt q:after {{ content:''; }}

/* guardrails */
.guards {{ background:{NAVY}; border-radius:12px; padding:14px 20px 15px; margin-top:12px;
           color:#fff; }}
.guards .gh {{ display:flex; align-items:center; gap:10px; }}
.guards .gh span {{ font-family:'Montserrat',sans-serif; font-size:8.2pt; font-weight:800;
                    letter-spacing:.19em; color:{GOLD}; }}
.guards .gh i {{ flex:1; height:1px; background:rgba(255,255,255,.16); }}
.glist {{ display:grid; grid-template-columns:1fr 1fr; gap:11px 22px; margin-top:13px; }}
.g {{ display:flex; gap:10px; }}
.g .n {{ font-family:'Montserrat',sans-serif; font-size:12pt; font-weight:800; color:{GOLD};
         line-height:1; flex:none; width:19px; }}
.g b {{ font-family:'Montserrat',sans-serif; font-size:9.3pt; font-weight:700; color:#fff;
        display:block; letter-spacing:-.005em; }}
.g p {{ font-size:8.5pt; line-height:1.44; color:#AFC5DC; margin-top:3px; }}

.note {{ font-size:8.8pt; line-height:1.55; color:{MUTED}; margin-top:13px;
         padding-left:13px; border-left:2.5px solid {LINE}; }}
.note b {{ color:{NAVY}; font-weight:700; }}
.band {{ display:flex; align-items:center; gap:15px; background:linear-gradient(120deg,
         {BLUE} 0%,{NAVY} 62%,{NAVY_DEEP} 100%); border-radius:12px; padding:13px 21px;
         margin-top:9px; }}
.band img {{ width:38px; height:38px; flex:none; }}
.band b {{ font-family:'Montserrat',sans-serif; font-size:11.4pt; font-weight:700;
           color:#fff; display:block; letter-spacing:-.012em; }}
.band p {{ font-size:8.8pt; line-height:1.45; color:#AFC9E4; margin-top:4px; }}
.foot {{ position:absolute; left:62px; right:62px; bottom:34px; display:flex;
         justify-content:space-between; align-items:center;
         border-top:1px solid {LINE}; padding-top:11px; }}
.foot .fl {{ font-size:7.8pt; color:{MUTED}; }}
.foot .fr {{ font-family:'Montserrat',sans-serif; font-size:9pt; font-weight:800;
             color:{BLUE}; }}
"""

CORE_SIX = [
    ("gmail", "Gmail", "Full-thread context so drafts start from what was actually said — not a blank page.",
     "READ + DRAFT", "You review recipients and send."),
    ("slack", "Slack", "Internal decisions, blockers and commitments become today's priority list.",
     "READ + DRAFT", "You approve anything posted."),
    ("googlesheets", "Sheets &amp; Drive", "Briefs, trackers and report inputs pulled from the real source file.",
     "SCOPED", "Assigned client folders only."),
    ("googlecalendar", "Calendar", "Meeting prep and deadline awareness — agendas written before you sit down.",
     "READ FIRST", "No invite changes unconfirmed."),
    ("hubspot", "HubSpot", "Contact, deal and activity context for account summaries and follow-up queues.",
     "READ FIRST", "Review every record change."),
    ("googlechrome", "Chrome", "Browser and computer use for systems with no direct connector.",
     "SUPERVISED", "Stop before send or submit."),
]

BUNDLES = [
    ("Paid Media", ["googleads", "linkedin", "googleanalytics"],
     "Google Ads, Shopping and LinkedIn Ads for pacing, search terms and lead quality. "
     "Confirm the account, timezone and conversion definition <b>first</b>."),
    ("Analytics &amp; SEO", ["semrush", "googleanalytics", "googlesheets"],
     "Semrush and Keyword Planner for demand and competitor research. First-party platform "
     "data stays the source of truth."),
    ("Content &amp; Social", ["canva", "figma", "wordpress"],
     "Canva for repeatable social and presentation work. Figma when design collaboration or "
     "landing pages are in scope."),
    ("Web &amp; Technical", ["openai", "claude", "github"],
     "Codex for longer builds and web work. Claude is strong for video editing and web "
     "design. Briefs in, staging links out."),
    ("Files &amp; Projects", ["dropbox", "asana", "notion"],
     "Your AI can be a lightweight personal task list &mdash; but shared ownership, due "
     "dates and approvals stay in the real system."),
    ("Recording &amp; Training", ["loom", "googlegemini", "zapier"],
     "Record the walkthrough once, then have AI cut it, transcribe it and turn it into the "
     "SOP. This guide came from a 15:43 Loom."),
]

PROMPTS = [
    ("PROMPT 01 · DAILY TRIAGE", "Run it first thing, every morning",
     "Act as my Account Manager assistant using the client systems connected here. "
     "Review only my assigned clients. Build today's priority queue with the client, the "
     "source, the request, the due date, the owner, how fresh the evidence is, the next "
     "action, and whether it needs approval. Then draft the top three items. Do not send "
     "anything."),
    ("PROMPT 02 · CLIENT UPDATE", "Personalize the voice, then read it before it goes",
     "Draft a client update for [client] using the last two weeks of email, Slack and CRM "
     "activity. Match my voice from my previous sent messages. Lead with what moved, then "
     "what needs their decision, then what's next. Flag anything you could not verify as "
     "pending rather than guessing."),
    ("PROMPT 03 · ROLE ONBOARDING", "Run this once, on day one",
     "My role is [role]. Here is what I do day to day: [responsibilities]. Here are my "
     "clients and the systems each one uses: [list]. Use Plan Mode to propose the smallest "
     "set of integrations I need, a repeatable daily workflow, and the review gates that "
     "should never be skipped. Keep it simple enough that I'll actually use it."),
]

GUARDS = [
    ("1", "Double-check every client-facing send.",
     "AI can draft the email and the update. It does not get to press send. Personalize "
     "the voice, verify the facts and attachments, then send it yourself."),
    ("2", "Never expose sensitive client information.",
     "If a screen, thread or file holds something a client wouldn't want shared, it does "
     "not go into a prompt. When in doubt, close the tab."),
    ("3", "You stay the person delegating.",
     "Browser and computer use are genuinely powerful. Keep the task bounded, keep the "
     "account visible, and stop the run before anything is sent, published or paid."),
    ("4", "Verify the account before you report.",
     "The most damaging mistake is correct-looking analysis from the wrong client, date "
     "range or conversion action. Confirm all three first."),
]


def build():
    core = "".join(
        f'<div class="card"><div class="ct">{tile(s, 18, 34)}<b>{n}</b></div>'
        f'<p>{p}</p><span class="gate"><b>{g}</b> &nbsp;{gd}</span></div>'
        for s, n, p, g, gd in CORE_SIX)

    bundles = "".join(
        f'<div class="bundle"><div class="bt">{t}</div>'
        f'<div class="icons">{"".join(tile(s, 15, 28) for s in ic)}</div>'
        f'<p>{p}</p></div>'
        for t, ic, p in BUNDLES)

    prompts = "".join(
        f'<div class="prompt"><div class="pt"><b>{lab}</b><em>{sub}</em></div>'
        f'<q>{body}</q></div>'
        for lab, sub, body in PROMPTS)

    guards = "".join(
        f'<div class="g"><div class="n">{n}</div><div><b>{t}</b><p>{p}</p></div></div>'
        for n, t, p in GUARDS)

    strip = "".join(tile(s, 16, 30) for s in
                    ["gmail", "slack", "googlesheets", "googlecalendar", "hubspot",
                     "googlechrome", "canva", "figma", "googleads", "semrush"])

    return f"""<!doctype html><html><head><meta charset="utf-8">
<title>Momentum 360 — The Account Manager AI Workflow</title>
<style>{CSS}</style></head><body>

<!-- ============ PAGE 1 · COVER ============ -->
<section class="page cover">
  <img class="wm" src="{WM}" alt="">
  <div class="cov-top">{LOGO}<div class="badge">INTERNAL · 2026</div></div>
  <div class="chips">
    <div class="chip">PLAN MODE</div><div class="chip">PLUGINS</div>
    <div class="chip">CONTEXT</div><div class="chip">REVIEW GATES</div>
  </div>
  <div class="eyebrow-cov"><span>FROM THE 15:43 WORKFLOW WALKTHROUGH</span><i></i></div>
  <h1>The Account<br>Manager AI<br>Workflow<span class="dot">.</span></h1>
  <p class="cov-sub">A repeatable daily process that gives you back
     <b>50&ndash;60% of the work you do now</b> &mdash; without letting anything
     unreviewed reach a client.</p>
  <p class="cov-desc">Every point from the walkthrough, condensed into one operating loop,
     one plugin stack and three prompts you can paste in today. You don't have to watch
     the video. You do have to connect the plugins.</p>
  <div class="striprow"><span class="striplab">YOUR STACK</span>{strip}</div>
  <div class="inside"><div class="ih">INSIDE THIS GUIDE</div><ol>
    <li><span class="num">01</span><div><b>One loop. Every account.</b>
      <p>The five stages every AM runs, plus the twenty-minute setup.</p></div></li>
    <li><span class="num">02</span><div><b>Connect these. In this order.</b>
      <p>The core six, then the module your role actually needs.</p></div></li>
    <li><span class="num">03</span><div><b>Three prompts. Paste and go.</b>
      <p>Copy-ready prompts and the four rules you never skip.</p></div></li>
  </ol></div>
  <div class="stats">
    <div class="stat"><b>50&ndash;60<em>%</em></b>
      <p>of a typical AM day this one prompt can expedite or automate</p></div>
    <div class="stat"><b>6</b>
      <p>core plugins everyone connects before adding anything role-specific</p></div>
    <div class="stat"><b>$20<em>/mo</em></b>
      <p>gets most of you roughly 80% of the top plan's capability</p></div>
    <div class="stat"><b>20<em>min</em></b>
      <p>to set up the workspace that then works for you every day</p></div>
  </div>
  <div class="cov-foot">
    <div class="l"><b>Momentum 360</b>
      <p>Photo, Video &amp; Digital Marketing Services &middot; Philadelphia &amp; nationwide</p></div>
    <div class="r">Account Manager enablement &middot; 2026<br>momentumvirtualtours.com</div>
  </div>
</section>

<!-- ============ PAGE 2 · THE LOOP ============ -->
<section class="page"><div class="inner">
  <div class="rhead"><span>MOMENTUM 360</span><span>THE ACCOUNT MANAGER AI WORKFLOW</span></div>
  <div class="eyebrow"><i></i><span>THE OPERATING MODEL &middot; 01</span></div>
  <h2>One loop. Every account.</h2><div class="rule"></div>
  <p class="lede">The point of this isn't novelty &mdash; it's that every Account Manager
     runs the <b>same five stages</b> in the same order. Only the connected accounts and
     the role modules change. Learn the loop once and it works on every client you own.</p>

  <div class="loop">
    <div class="step"><div class="cap"><b>STAGE 01</b><strong>Collect</strong></div>
      <p>Pull today's real context from email, Slack, CRM and the client's files.</p></div>
    <div class="step"><div class="cap"><b>STAGE 02</b><strong>Prioritize</strong></div>
      <p>Turn it into urgent actions, due dates, blockers and open client decisions.</p></div>
    <div class="step"><div class="cap"><b>STAGE 03</b><strong>Produce</strong></div>
      <p>Draft the update, report, brief or analysis. This is the part AI does fastest.</p></div>
    <div class="step"><div class="cap"><b>STAGE 04</b><strong>Review</strong></div>
      <p>Check the client, dates, metrics, tone and recipients. Every time.</p></div>
    <div class="step"><div class="cap"><b>STAGE 05</b><strong>Deliver</strong></div>
      <p>A human approves anything consequential &mdash; sending, publishing, spending.</p></div>
  </div>

  <h3>YOUR FIRST TWENTY MINUTES <em>&nbsp;&mdash;&nbsp; do these four things in order</em></h3>
  <div class="rows">
    <div class="row"><div class="lab"><b>STEP 01</b><strong>Get the desktop app</strong></div>
      <div class="bd">{tile('openai',16,30,'#0B8C6E','#F4F7FB')}
        <span>Download the ChatGPT desktop app rather than living in a browser tab. The
        desktop app is what makes the plugins, browser control and computer use usable.</span></div></div>
    <div class="row"><div class="lab"><b>STEP 02</b><strong>Tell it who you are</strong></div>
      <div class="bd">{gtile('person')}
        <span>Give it your role and what you actually do day to day. <b>Context is the
        multiplier.</b> A generic assistant is useful; one that knows your clients, your
        cadence and your voice is a different tool entirely.</span></div></div>
    <div class="row"><div class="lab"><b>STEP 03</b><strong>Ask what to connect</strong></div>
      <div class="bd">{tile('gmail',16,30,None,'#F4F7FB')}
        <span>Ask it directly: &ldquo;what should I integrate with for this role?&rdquo;
        Start with Gmail and Slack, then add only what your responsibilities require.</span></div></div>
    <div class="row"><div class="lab"><b>STEP 04</b><strong>Use Plan Mode</strong></div>
      <div class="bd">{gtile('spark',17,30,GOLD_DK)}
        <span>Plan Mode turns vague work into a reviewable plan before anything runs. You
        don't need to create a formal project for most tasks &mdash; just push it, and take
        the plan it recommends as your starting point.</span></div></div>
  </div>

  <div class="callout"><div class="ch"><img src="{MARK}" alt=""><span>THE MOMENTUM EDGE</span></div>
    <p>You do not need the $200 plan. <b>The $20 plan gets you roughly 80% of the
       capability</b> &mdash; run the mid-tier model on medium reasoning for daily work and
       step up to high only when a task genuinely needs the depth. Spend the difference on
       connecting your stack properly. And once Slack and Gmail have been connected for a
       week or two, open a new chat and you'll find <b>the recommendations are already
       waiting for you</b> &mdash; click one, hit enter, done.</p></div>

  <div class="foot"><span class="fl">momentumvirtualtours.com</span><span class="fr">02</span></div>
</div></section>

<!-- ============ PAGE 3 · THE STACK ============ -->
<section class="page"><div class="inner">
  <div class="rhead"><span>MOMENTUM 360</span><span>THE ACCOUNT MANAGER AI WORKFLOW</span></div>
  <div class="eyebrow"><i></i><span>YOUR PLUGIN STACK &middot; 02</span></div>
  <h2>Connect these. In this order.</h2><div class="rule"></div>
  <p class="lede">The goal is not to install everything. <b>Connect the core six first</b>,
     prove one low-risk client workflow, then add only the module your role calls for.</p>

  <h3>TIER 1 &middot; THE CORE SIX <em>&nbsp;&mdash;&nbsp; everyone connects these</em></h3>
  <div class="grid">{core}</div>

  <h3>TIER 2 &middot; ADD BY ROLE <em>&nbsp;&mdash;&nbsp; only what you're responsible for</em></h3>
  <div class="bundles">{bundles}</div>

  <p class="note">Hundreds of plugins exist and an <b>Ads Manager for ChatGPT</b> is emerging
     &mdash; confirm anything new is approved before you rely on it. Personal integrations are
     fine, but <b>keep them separate from client work and client data</b>.</p>

  <div class="foot"><span class="fl">momentumvirtualtours.com</span><span class="fr">03</span></div>
</div></section>

<!-- ============ PAGE 4 · PROMPTS + GUARDRAILS ============ -->
<section class="page"><div class="inner">
  <div class="rhead"><span>MOMENTUM 360</span><span>THE ACCOUNT MANAGER AI WORKFLOW</span></div>
  <div class="eyebrow"><i></i><span>REPEATABLE PROCESS &middot; 03</span></div>
  <h2>Three prompts. Paste and go.</h2><div class="rule"></div>
  <p class="lede">Copy these as written, swap the brackets for your clients, and save them.
     The first one does the heavy lifting &mdash; <b>it's the prompt behind the 50&ndash;60%</b>.</p>
  {prompts}

  <div class="guards"><div class="gh"><span>FOUR NON-NEGOTIABLES</span><i></i></div>
    <div class="glist">{guards}</div></div>

  <div class="callout" style="margin-top:9px">
    <div class="ch"><img src="{MARK}" alt=""><span>START SMALL, THEN COMPOUND</span></div>
    <p>Do those four things and the rest is upside. It gets more useful the more you use it
       &mdash; better client communication, more work done properly, and time handed back to
       you. Small wins count: ask it to build you a <b>personalized HTML email signature</b>
       and you'll see the point in about two minutes.</p></div>

  <div class="band">
    <img src="{MARK}" alt="">
    <div><b>You don't have to watch the video. You do have to connect the plugins.</b>
      <p>Start with page 02. Twenty minutes today, then it works for you every day after.</p></div>
  </div>

  <div class="foot"><span class="fl">Momentum 360 &middot; Account Manager enablement &middot; 2026</span><span class="fr">04</span></div>
</div></section>

</body></html>"""


if __name__ == "__main__":
    html = f"{HERE}/guide.html"
    pdf = sys.argv[1] if len(sys.argv) > 1 else f"{HERE}/M360_Account_Manager_AI_Workflow.pdf"
    open(html, "w").write(build())
    subprocess.run([
        "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", "--headless=new",
        "--no-sandbox", "--disable-gpu", "--no-pdf-header-footer",
        "--virtual-time-budget=6000", f"--print-to-pdf={pdf}", f"file://{html}",
    ], check=True, capture_output=True)
    print("wrote", pdf, os.path.getsize(pdf), "bytes")
