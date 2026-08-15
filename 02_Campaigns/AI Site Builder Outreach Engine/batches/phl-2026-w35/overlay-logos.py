#!/usr/bin/env python3
"""Overlay harvested real logos. Cream lockups stay when no real mark exists."""
from __future__ import annotations

from pathlib import Path

from PIL import Image

HARVEST = Path("/workspace/_templates/site-factory/harvest")
SITES = Path("/workspace/02_Campaigns/AI Site Builder Outreach Engine/batches/phl-2026-w35/sites")

# slug -> (relative harvest image, knockout: "black" | "white" | None)
LOGOS = {
    "captain-car-wash": ("images/source-03.png", "black"),
    "trend-auto-trader": ("images/source-01.png", None),
    "balance-studios": ("images/source-01.jpg", "white"),
    "red-hill-greenhouse": ("images/source-01.png", "black"),
    "union-jacks": ("images/source-01.jpg", None),
}


def knockout(im: Image.Image, mode: str | None) -> Image.Image:
    rgba = im.convert("RGBA")
    if not mode:
        return rgba
    px = rgba.load()
    w, h = rgba.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if mode == "black" and r < 28 and g < 28 and b < 28:
                px[x, y] = (r, g, b, 0)
            elif mode == "white" and r > 242 and g > 242 and b > 242:
                px[x, y] = (r, g, b, 0)
    return rgba


def main() -> None:
    n = 0
    for slug, (rel, mode) in LOGOS.items():
        src = HARVEST / slug / rel
        dest = SITES / slug / "assets" / "logo.png"
        dest.parent.mkdir(parents=True, exist_ok=True)
        im = knockout(Image.open(src), mode)
        im.save(dest)
        n += 1
        print("logo", slug, dest)
    print("overlaid", n, "harvested logos")


if __name__ == "__main__":
    main()
