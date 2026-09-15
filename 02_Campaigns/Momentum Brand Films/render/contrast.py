#!/usr/bin/env python3
"""Measure every text-on-background pair this slate uses.

The design system's rule is measure, do not assert. This writes
brand/contrast.json with a real ratio for every pair, and fails loudly if a
pair marked `text` does not clear 4.5:1 or a pair marked `graphic` misses 3.0:1.
"""
import json, pathlib, sys

T = {
    "paper": "#FBF8F4", "panel": "#F0ECE5", "ink": "#14181B", "muted": "#636465",
    "line": "#DCD6CC", "line-strong": "#8E8578",
    "deep": "#0E1417", "deep-raised": "#1A2226", "on-deep": "#F4F1EC", "on-deep-muted": "#8A9296",
    "brand": "#155E86", "brand-lift": "#3897CC", "on-brand": "#FFFFFF", "mark": "#2A80C2",
    "signal": "#E27113", "signal-ink": "#A35309", "on-signal": "#14181B", "white": "#FFFFFF",
    "warm-canvas": "#F6F5EF", "warm-surface": "#FFFEFA", "warm-panel": "#EBECE1",
    "warm-ink": "#173C2C", "warm-muted": "#647067", "warm-line": "#D4D9CD",
    "warm-signal": "#B45F2A",
}

def lum(h):
    n = int(h.lstrip("#"), 16)
    ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255]
    ch = [v / 255 for v in ch]
    ch = [v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4 for v in ch]
    return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2]

def ratio(a, b):
    la, lb = lum(T[a]), lum(T[b])
    return round((max(la, lb) + 0.05) / (min(la, lb) + 0.05), 2)

# (foreground, background, role, note).
# role: text (>=4.5) | large (>=3.0) | graphic (>=3.0) | decorative (no floor, by design) | banned
PAIRS = [
    ("ink", "paper", "text", "body and display on the paper surface"),
    ("ink", "panel", "text", "body and display on the panel surface"),
    ("muted", "paper", "text", "secondary text on paper"),
    ("muted", "panel", "text", "secondary text on panel"),
    ("brand", "paper", "text", "brand blue as text on light — legal"),
    ("brand", "panel", "text", "brand blue as text on panel"),
    ("signal-ink", "paper", "text", "the orange that speaks on light"),
    ("signal-ink", "panel", "text", "the orange that speaks on panel"),
    ("signal", "paper", "banned", "signal as TEXT on paper — illegal, fill only"),
    ("mark", "paper", "graphic", "the logo blue on paper — mark artwork, not text"),
    ("on-deep", "deep", "text", "body and display on the deep surface"),
    ("on-deep-muted", "deep", "text", "secondary text on deep"),
    ("brand-lift", "deep", "text", "the blue that speaks on dark"),
    ("signal", "deep", "text", "signal as text on dark — legal"),
    ("brand", "deep", "banned", "brand blue on deep — 2.63, fails even 3.0"),
    ("mark", "deep", "graphic", "the logo blue on deep — mark artwork only"),
    ("on-brand", "brand", "text", "white on the brand fill"),
    ("on-signal", "signal", "text", "ink on the signal fill"),
    ("white", "signal", "banned", "white on signal — never"),
    ("on-deep", "deep-raised", "text", "text on the raised dark surface"),
    ("line-strong", "paper", "graphic", "keylines and rules on paper"),
    ("warm-ink", "warm-canvas", "text", "editorial serif and body on the warm paper ground"),
    ("warm-ink", "warm-surface", "text", "text on a plate/card surface"),
    ("warm-ink", "warm-panel", "text", "text on the warm panel"),
    ("warm-muted", "warm-canvas", "text", "captions and figure labels on warm paper"),
    ("warm-signal", "warm-canvas", "graphic", "burnt orange is a FILL on warm paper — 4.17 as text, under 4.5; use signal-ink for orange text there"),
    ("warm-signal", "warm-surface", "graphic", "burnt orange fill on a plate surface"),
    ("brand", "warm-canvas", "text", "Momentum blue as text on the warm ground"),
    ("signal-ink", "warm-canvas", "text", "signal-ink on the warm ground"),
    ("ink", "warm-canvas", "text", "ink on the warm ground"),
    ("mark", "warm-canvas", "graphic", "the logo blue on the warm ground — mark artwork"),
    ("warm-line", "warm-canvas", "decorative", "warm keylines — decorative only, never text"),
    ("line", "paper", "decorative", "decorative hairlines only — the system marks this token not-AA; never carries text"),
]

MIN = {"text": 4.5, "large": 3.0, "graphic": 3.0, "decorative": 0.0}
rows, failures = [], []
for fg, bg, role, note in PAIRS:
    r = ratio(fg, bg)
    ok = True if role == "banned" else r >= MIN[role]
    if role == "banned":
        ok = r < 4.5  # a banned pair should in fact be failing; if it passes, the note is stale
        note += f" (measured {r})"
    rows.append({"fg": fg, "fg_hex": T[fg], "bg": bg, "bg_hex": T[bg],
                 "role": role, "ratio": r, "passes": ok, "note": note})
    if not ok:
        failures.append(f"{fg} on {bg}: {r} ({role})")

out = pathlib.Path(__file__).resolve().parent.parent / "brand" / "contrast.json"
out.write_text(json.dumps({"pairs": rows, "failures": failures}, indent=2) + "\n")
for r in rows:
    flag = "  " if r["passes"] else "!!"
    print(f'{flag} {r["ratio"]:>6}  {r["fg"]:<14} on {r["bg"]:<12} {r["role"]:<8} {r["note"]}')
print(f'\n{len(rows)} pairs measured -> {out}')
if failures:
    print("FAILURES:", *failures, sep="\n  "); sys.exit(1)
