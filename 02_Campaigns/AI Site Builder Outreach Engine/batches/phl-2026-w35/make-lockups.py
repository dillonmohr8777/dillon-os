#!/usr/bin/env python3
"""Make cream lockup logos in each brand accent. Harvested real logos overwrite later."""
from __future__ import annotations

import json
import os
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

BATCH = Path("/workspace/02_Campaigns/AI Site Builder Outreach Engine/batches/phl-2026-w35")
BRIEFS = BATCH / "briefs"
SITES = BATCH / "sites"


def font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    for p in (
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf",
    ):
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def wrap(draw, text, fnt, max_w):
    words = text.split()
    lines, cur = [], ""
    for w in words:
        trial = (cur + " " + w).strip()
        if draw.textlength(trial, font=fnt) <= max_w:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines[:3]


def lockup(name: str, accent: str, paper: str, out: Path) -> None:
    W, H = 900, 360
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    fnt = font(54)
    lines = wrap(d, name.upper(), fnt, W - 80)
    while lines and d.textlength(max(lines, key=len), font=fnt) > W - 80:
        fnt = font(max(28, fnt.size - 4) if hasattr(fnt, "size") else 36)
        lines = wrap(d, name.upper(), fnt, W - 80)
    y = (H - len(lines) * (fnt.size + 8)) // 2
    for line in lines:
        w = d.textlength(line, font=fnt)
        d.text(((W - w) / 2, y), line, font=fnt, fill=accent)
        y += fnt.size + 10
    out.parent.mkdir(parents=True, exist_ok=True)
    img.save(out)


def main() -> None:
    n = 0
    for brief_path in sorted(BRIEFS.glob("*.json")):
        brief = json.loads(brief_path.read_text())
        tokens = brief["tokens"]
        dest = SITES / brief["slug"] / "assets" / "logo.png"
        lockup(brief["name"], tokens["accent"], tokens["paper"], dest)
        n += 1
        print("lockup", dest)
    print("wrote", n, "lockups")


if __name__ == "__main__":
    main()
