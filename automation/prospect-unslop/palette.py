#!/usr/bin/env python3
"""Sample a brand palette from a first-party logo. Never invent the accent."""
from __future__ import annotations

import json
import sys
from collections import Counter
from pathlib import Path

from PIL import Image


def hexify(rgb):
    return "#{:02x}{:02x}{:02x}".format(*rgb)


def saturate(rgb):
    r, g, b = [x / 255 for x in rgb]
    mx, mn = max(r, g, b), min(r, g, b)
    return mx - mn


def luminance(rgb):
    r, g, b = rgb
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255


def main() -> int:
    path = Path(sys.argv[1])
    im = Image.open(path).convert("RGBA")
    im.thumbnail((160, 160))
    counts = Counter()
    for r, g, b, a in im.getdata():
        if a < 40:
            continue
        # skip near-white / near-black chrome
        mx, mn = max(r, g, b), min(r, g, b)
        if mx < 28 or mn > 236:
            continue
        if mx - mn < 18:
            continue
        qr = (r // 16) * 16
        qg = (g // 16) * 16
        qb = (b // 16) * 16
        counts[(qr, qg, qb)] += 1
    if not counts:
        print(json.dumps({"ok": False, "reason": "no chromatic pixels"}))
        return 1
    ranked = sorted(counts.items(), key=lambda kv: (saturate(kv[0]) * kv[1], kv[1]), reverse=True)
    accent = ranked[0][0]
    ink_candidates = [c for c, _ in ranked if luminance(c) < 0.35]
    paper_candidates = [c for c, _ in ranked if luminance(c) > 0.72]
    ink = ink_candidates[0] if ink_candidates else (17, 24, 32)
    paper = paper_candidates[0] if paper_candidates else (244, 239, 231)
    deep = tuple(max(0, min(255, int(x * 0.55))) for x in ink)
    panel = tuple(int(paper[i] * 0.86 + accent[i] * 0.14) for i in range(3))
    accent2 = ranked[1][0] if len(ranked) > 1 else tuple(min(255, x + 40) for x in accent)
    print(
        json.dumps(
            {
                "ok": True,
                "accent": hexify(accent),
                "accent2": hexify(accent2),
                "ink": hexify(ink),
                "paper": hexify(paper),
                "panel": hexify(panel),
                "deep": hexify(deep),
            }
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
