"""Per-clip ASS captions, inside the video box, orange active word, no hyphens."""
import json, re

CREAM  = "&H00EEF4F7"
ORANGE = "&H00257AF4"

CLIPS = {
    # name: (src_start, src_end, fontsize, MarginL, MarginR, MarginV, max_chars)
    "c1": (16.30, 29.55, 58, 340, 340, 300, 26),
    "c2": (79.56, 95.95, 54, 740, 100, 354, 24),
    "c3": (103.86, 127.90, 56, 380, 380, 330, 26),
}

def fmt(t):
    if t < 0: t = 0
    h = int(t//3600); m = int(t%3600//60); s = t%60
    return f"{h}:{m:02d}:{s:05.2f}"

words = json.load(open("master_words.json"))

for name, (a, b, size, ml, mr, mv, maxc) in CLIPS.items():
    seg_words = [dict(w, w=w["w"].lstrip("-")) for w in words if a <= w["t0"] < b and w["w"].lstrip("-")]
    delta = -a
    lines, buf = [], []
    for w in seg_words:
        buf.append(w)
        chars = sum(len(x["w"])+1 for x in buf)
        if (len(buf) >= 5 or chars > maxc or re.search(r"[.?!,]$", w["w"])) and len(buf) >= 2:
            lines.append(buf); buf = []
    if buf:
        if lines and len(buf) == 1: lines[-1].extend(buf)
        else: lines.append(buf)

    events, prev_t1 = [], 0.0
    end_f = b + delta
    for li, line in enumerate(lines):
        t0 = line[0]["t0"] + delta
        nxt = lines[li+1][0]["t0"] + delta if li+1 < len(lines) else end_f + 0.3
        t1 = min(line[-1]["t1"] + delta + 0.55, nxt - 0.12, end_f + 0.25)
        t0 = max(t0 - 0.10, 0.15, prev_t1 + 0.02)
        if t1 <= t0: continue
        prev_t1 = t1
        plain = " ".join(x["w"] for x in line)
        events.append((0, t0, t1, rf"{{\fad(90,70)}}{plain}"))
        for wi, w in enumerate(line):
            w0 = max(w["t0"] + delta, t0)
            w1 = line[wi+1]["t0"] + delta if wi+1 < len(line) else min(w["t1"] + delta + 0.35, t1)
            w1 = min(w1, t1)
            if w1 <= w0: continue
            parts = []
            for wj, x in enumerate(line):
                if wj == wi: parts.append(rf"{{\alpha&H00&\1c{ORANGE}}}{x['w']}")
                else:        parts.append(rf"{{\alpha&HFF&}}{x['w']}")
            events.append((1, w0, w1, " ".join(parts)))

    with open(f"captions_{name}.ass", "w") as f:
        f.write(f"""[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,Gelasio SemiBold,{size},{CREAM},{CREAM},&H00000000,&HA0000000,0,0,0,0,100,100,0,0,1,0,2.5,2,{ml},{mr},{mv},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
""")
        for layer, s, e, txt in events:
            f.write(f"Dialogue: {layer},{fmt(s)},{fmt(e)},Cap,,0,0,0,,{txt}\n")
    print(name, "events:", len(events))
