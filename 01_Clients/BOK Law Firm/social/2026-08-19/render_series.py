#!/usr/bin/env python3
"""Render BOK Law weekly social graphics at 1080x1350."""

from __future__ import annotations

import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent
ASSETS = ROOT / "assets"

POSTS = [
    {
        "slug": "wednesday-wisdom",
        "series": "WEDNESDAY WISDOM",
        "hero": "wednesday-hero.jpg",
        "hero_pos": "center 40%",
        "headline": "A Parenting Plan Needs Real Times",
        "subhead": "Vague schedules create conflict. Specific times create predictability for children.",
        "columns": [
            {
                "icon": "clock",
                "label": "WEEKDAYS",
                "body": "Write school mornings, after-school care, and bedtime into the plan.",
            },
            {
                "icon": "calendar",
                "label": "WEEKENDS",
                "body": "Set pickup windows so Saturday does not become a negotiation.",
            },
            {
                "icon": "star",
                "label": "HOLIDAYS",
                "body": "Decide the calendar early so children are not left in the middle.",
            },
        ],
        "close": "Clear details today prevent confusion around tomorrow’s handoffs.",
    },
    {
        "slug": "family-fridays",
        "series": "FAMILY FRIDAYS",
        "hero": "family-hero.jpg",
        "hero_pos": "center 30%",
        "headline": "Children Should Not Carry Adult Messages",
        "subhead": "Kids stay steadier when parents talk to each other, not through the child.",
        "columns": [
            {
                "icon": "chat",
                "label": "TEXTS",
                "body": "Keep adult logistics on a parent-to-parent channel.",
            },
            {
                "icon": "car",
                "label": "PICKUPS",
                "body": "Handle schedule changes directly, before a child is left waiting.",
            },
            {
                "icon": "book",
                "label": "SCHOOL",
                "body": "Share notices with both homes so the child is not the messenger.",
            },
        ],
        "close": "Adult conversations belong with the adults.",
    },
    {
        "slug": "saturday-solutions",
        "series": "SATURDAY SOLUTIONS",
        "hero": "saturday-hero.jpg",
        "hero_pos": "center 45%",
        "headline": "Write Down the Weekend Exchange Plan",
        "subhead": "Saturday handoffs go smoother when time, place, and a backup are already agreed.",
        "columns": [
            {
                "icon": "clock",
                "label": "TIME",
                "body": "Confirm the exact window, not “sometime in the afternoon.”",
            },
            {
                "icon": "pin",
                "label": "PLACE",
                "body": "Choose one regular spot both homes can rely on.",
            },
            {
                "icon": "list",
                "label": "BACKUP",
                "body": "Name the rain plan so a delay does not turn into a dispute.",
            },
        ],
        "close": "A written exchange plan keeps the weekend about the child.",
    },
]

ICONS = {
    "clock": """<svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><circle cx="24" cy="24" r="16" stroke="currentColor" stroke-width="2.4"/><path d="M24 14v11l7 4" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>""",
    "calendar": """<svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><rect x="9" y="12" width="30" height="26" rx="3" stroke="currentColor" stroke-width="2.4"/><path d="M9 20h30M17 8v8M31 8v8" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M17 28h3M24 28h3M31 28h3M17 33h3M24 33h3" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>""",
    "star": """<svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M24 10l3.4 8.6L36 20l-6.5 5.6L31.5 35 24 30.2 16.5 35l2-9.4L12 20l8.6-1.4L24 10z" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/></svg>""",
    "chat": """<svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M12 14h24v16H20l-8 7V14z" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M18 21h12M18 26h8" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>""",
    "car": """<svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M12 30h24l2-8-6-7H16l-6 7 2 8z" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><circle cx="17" cy="32" r="3" stroke="currentColor" stroke-width="2.2"/><circle cx="31" cy="32" r="3" stroke="currentColor" stroke-width="2.2"/><path d="M10 30h28" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>""",
    "book": """<svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M12 12h11a5 5 0 0 1 5 5v19H17a5 5 0 0 0-5 5V12zM36 12H25a5 5 0 0 0-5 5v19h11a5 5 0 0 1 5 5V12z" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/></svg>""",
    "pin": """<svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M24 38s12-11.2 12-19a12 12 0 1 0-24 0c0 7.8 12 19 12 19z" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><circle cx="24" cy="19" r="4" stroke="currentColor" stroke-width="2.4"/></svg>""",
    "list": """<svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M18 16h18M18 24h18M18 32h14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><circle cx="12" cy="16" r="2.2" fill="currentColor"/><circle cx="12" cy="24" r="2.2" fill="currentColor"/><circle cx="12" cy="32" r="2.2" fill="currentColor"/></svg>""",
}

CSS = r"""
@font-face { font-family: 'Playfair Display'; font-weight: 600; src: url('assets/PlayfairDisplay-600.ttf') format('truetype'); }
@font-face { font-family: 'Playfair Display'; font-weight: 700; src: url('assets/PlayfairDisplay-700.ttf') format('truetype'); }
@font-face { font-family: 'Source Sans 3'; font-weight: 400; src: url('assets/SourceSans3-400.ttf') format('truetype'); }
@font-face { font-family: 'Source Sans 3'; font-weight: 600; src: url('assets/SourceSans3-600.ttf') format('truetype'); }
@font-face { font-family: 'Source Sans 3'; font-weight: 700; src: url('assets/SourceSans3-700.ttf') format('truetype'); }
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: 1080px; height: 1350px; overflow: hidden; background: #F4EEE4; }
.card {
  width: 1080px; height: 1350px;
  display: flex; flex-direction: column;
  background: #F7F3EB;
  color: #1A3F46;
}
.hero {
  height: 392px;
  flex: 0 0 392px;
  overflow: hidden;
}
.hero img {
  width: 100%; height: 100%;
  object-fit: cover;
  object-position: HERO_POS;
  display: block;
}
.banner {
  position: relative;
  height: 78px;
  background: #1B4A53;
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Source Sans 3', sans-serif;
  font-weight: 700;
  font-size: 28px;
  letter-spacing: 0.22em;
}
.banner::before {
  content: '';
  position: absolute;
  top: -12px; left: 50%;
  transform: translateX(-50%);
  width: 0; height: 0;
  border-left: 14px solid transparent;
  border-right: 14px solid transparent;
  border-bottom: 12px solid #1B4A53;
}
.body {
  flex: 1;
  padding: 42px 52px 18px;
  display: flex;
  flex-direction: column;
}
h1 {
  font-family: 'Playfair Display', serif;
  font-weight: 700;
  font-size: 46px;
  line-height: 1.16;
  color: #1B4A53;
  text-wrap: balance;
  letter-spacing: -0.01em;
}
.sub {
  margin-top: 16px;
  font-family: 'Source Sans 3', sans-serif;
  font-weight: 400;
  font-size: 23px;
  line-height: 1.35;
  color: #3A555A;
  max-width: 920px;
}
.cols {
  margin-top: 34px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 18px;
}
.col {
  background: #E8E4DB;
  border-radius: 10px;
  padding: 26px 20px 22px;
  text-align: center;
  min-height: 278px;
}
.icon {
  width: 52px; height: 52px;
  margin: 0 auto 14px;
  color: #4FA3B0;
}
.icon svg { width: 100%; height: 100%; }
.col h2 {
  font-family: 'Source Sans 3', sans-serif;
  font-weight: 700;
  font-size: 18px;
  letter-spacing: 0.16em;
  color: #1B4A53;
  margin-bottom: 12px;
}
.col p {
  font-family: 'Source Sans 3', sans-serif;
  font-weight: 400;
  font-size: 18px;
  line-height: 1.38;
  color: #33484C;
}
.close {
  margin-top: auto;
  padding: 28px 8px 8px;
  text-align: center;
  font-family: 'Playfair Display', serif;
  font-weight: 600;
  font-style: italic;
  font-size: 22px;
  color: #1B4A53;
  line-height: 1.35;
}
.footer {
  position: relative;
  height: 158px;
  background: #F3ECE1;
  display: flex;
  align-items: center;
  padding: 0 48px 10px;
  overflow: hidden;
}
.footer::after {
  content: '';
  position: absolute;
  left: -40px; right: -40px; bottom: -28px;
  height: 78px;
  background:
    radial-gradient(120px 40px at 18% 40%, rgba(79,163,176,.28), transparent 70%),
    radial-gradient(180px 50px at 58% 55%, rgba(79,163,176,.22), transparent 72%),
    radial-gradient(140px 38px at 88% 30%, rgba(27,74,83,.16), transparent 70%);
  pointer-events: none;
}
.logo-wrap {
  display: flex;
  align-items: center;
  z-index: 1;
}
.logo-wrap img {
  height: 128px;
  width: auto;
  display: block;
}
.rule {
  width: 1px;
  height: 72px;
  background: #C9C2B6;
  margin: 0 36px;
  z-index: 1;
}
.url {
  font-family: 'Source Sans 3', sans-serif;
  font-weight: 700;
  font-size: 28px;
  letter-spacing: 0.12em;
  color: #1B4A53;
  z-index: 1;
}
"""


def html_for(post: dict) -> str:
    cols = []
    for col in post["columns"]:
        cols.append(
            f"""<article class="col">
          <div class="icon">{ICONS[col['icon']]}</div>
          <h2>{col['label']}</h2>
          <p>{col['body']}</p>
        </article>"""
        )
    css = CSS.replace("HERO_POS", post["hero_pos"])
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>{post['series']} — BOK Law & Mediation Services</title>
<style>{css}</style>
</head>
<body>
  <article class="card">
    <div class="hero"><img src="assets/{post['hero']}" alt="" /></div>
    <div class="banner">{post['series']}</div>
    <div class="body">
      <h1>{post['headline']}</h1>
      <p class="sub">{post['subhead']}</p>
      <div class="cols">
        {''.join(cols)}
      </div>
      <p class="close">{post['close']}</p>
    </div>
    <footer class="footer">
      <div class="logo-wrap"><img src="assets/bok-logo-footer.png" alt="BOK Law & Mediation Services" /></div>
      <div class="rule"></div>
      <div class="url">BOKLAWFIRM.COM</div>
    </footer>
  </article>
</body>
</html>
"""


def screenshot(html_path: Path, png_path: Path) -> None:
    import os
    import signal
    import time

    if png_path.exists():
        png_path.unlink()
    profile = Path("/tmp/bok-chrome-profile") / png_path.stem
    profile.mkdir(parents=True, exist_ok=True)
    cmd = [
        "google-chrome",
        "--headless=new",
        "--no-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--hide-scrollbars",
        "--no-first-run",
        "--no-default-browser-check",
        "--disable-background-networking",
        "--disable-sync",
        "--disable-extensions",
        "--disable-component-update",
        "--disable-default-apps",
        "--metrics-recording-only",
        "--mute-audio",
        f"--user-data-dir={profile}",
        "--force-device-scale-factor=1",
        "--window-size=1080,1350",
        f"--screenshot={png_path}",
        "--virtual-time-budget=3000",
        html_path.as_uri(),
    ]
    proc = subprocess.Popen(
        cmd,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        start_new_session=True,
    )
    deadline = time.time() + 18
    wrote = False
    while time.time() < deadline:
        if png_path.exists() and png_path.stat().st_size > 20000:
            time.sleep(0.5)
            wrote = True
            break
        if proc.poll() is not None:
            break
        time.sleep(0.1)
    try:
        os.killpg(proc.pid, signal.SIGTERM)
    except ProcessLookupError:
        pass
    try:
        proc.wait(timeout=2)
    except subprocess.TimeoutExpired:
        try:
            os.killpg(proc.pid, signal.SIGKILL)
        except ProcessLookupError:
            pass
    if not wrote or not png_path.exists():
        raise RuntimeError(f"screenshot failed for {html_path.name}")


def main() -> None:
    forbidden = [
        "BOWE",
        "O'NEIL",
        "ONEIL",
        "KOCELKO",
        "ANDREA",
        "ASHLEY",
        "LAUREN",
        "PITTSBURGH",
    ]
    for post in POSTS:
        html_path = ROOT / f"{post['slug']}.html"
        png_path = ROOT / f"{post['slug']}.png"
        text = html_for(post)
        upper = text.upper()
        hits = [w for w in forbidden if w in upper]
        if hits:
            raise SystemExit(f"Forbidden terms in {post['slug']}: {hits}")
        html_path.write_text(text)
        screenshot(html_path, png_path)
        print(f"wrote {png_path.name} ({png_path.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
