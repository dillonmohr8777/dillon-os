"""ASS captions for the Maher x Brent cut — Inter Tight, cream, orange active word.

Two layers per caption line:
  layer 0: whole line in cream (visible for the line's duration, gentle fade)
  layer 1: one event per word — same line text with only the active word in orange,
           all other words fully transparent, so the orange highlight tracks speech.
"""
import json, re

CREAM  = "&H00EEF4F7"   # #F7F4EE
ORANGE = "&H00257AF4"   # #F47A25
TRANSP = r"{\alpha&HFF&}"

# (label, src_start, src_end, final_start)
SEGS = [
    ("A1", 7.50, 14.92, 4.30),
    ("A2", 16.30, 29.55, 11.37),
    ("B",  68.10, 74.60, 24.12),
    ("C1", 79.45, 95.95, 30.12),
    ("C2", 116.30, 128.10, 46.60),
]
ACCENT_WORDS = set()  # active-word highlight carries the accent; no static accents

def fmt(t):
    if t < 0: t = 0
    h = int(t//3600); m = int(t%3600//60); s = t%60
    return f"{h}:{m:02d}:{s:05.2f}"

words = json.load(open("master_words.json"))

events = []
prev_t1 = 0.0
for label, a, b, fstart in SEGS:
    delta = fstart - a
    seg_words = [w for w in words if a <= w["t0"] < b]
    # group into lines
    lines, buf = [], []
    for w in seg_words:
        buf.append(w)
        chars = sum(len(x["w"])+1 for x in buf)
        if (len(buf) >= 5 or chars > 30 or re.search(r"[.?!,]$", w["w"])) and len(buf) >= 2:
            lines.append(buf); buf = []
    if buf:
        if lines and len(buf) == 1: lines[-1].extend(buf)
        else: lines.append(buf)

    seg_end_f = b + delta
    for li, line in enumerate(lines):
        t0 = line[0]["t0"] + delta
        nxt = lines[li+1][0]["t0"] + delta if li+1 < len(lines) else seg_end_f + 0.3
        t1 = min(line[-1]["t1"] + delta + 0.55, nxt - 0.12, seg_end_f + 0.3)
        t0 = max(t0 - 0.10, fstart + 0.22, prev_t1 + 0.02)
        if t1 <= t0: continue
        prev_t1 = t1
        plain = " ".join(x["w"] for x in line)
        events.append((0, t0, t1, rf"{{\fad(100,70)}}{plain}"))
        # word highlight events
        for wi, w in enumerate(line):
            w0 = max(w["t0"] + delta, t0)
            w1 = line[wi+1]["t0"] + delta if wi+1 < len(line) else min(w["t1"] + delta + 0.35, t1)
            w1 = min(w1, t1)
            if w1 <= w0: continue
            parts = []
            for wj, x in enumerate(line):
                if wj == wi:
                    parts.append(rf"{{\alpha&H00&\1c{ORANGE}}}{x['w']}")
                else:
                    parts.append(rf"{{\alpha&HFF&}}{x['w']}")
            events.append((1, w0, w1, " ".join(parts)))

with open("captions_master.ass", "w") as f:
    f.write(f"""[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,Inter Tight SemiBold,46,{CREAM},{CREAM},&H00000000,&H78000000,0,0,0,0,100,100,0,0,1,0,1.5,2,593,90,66,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
""")
    for layer, a, b, txt in events:
        f.write(f"Dialogue: {layer},{fmt(a)},{fmt(b)},Cap,,0,0,0,,{txt}\n")
print("events:", len(events))
