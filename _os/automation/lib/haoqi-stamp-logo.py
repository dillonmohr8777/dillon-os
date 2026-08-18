#!/usr/bin/env python3
"""Stamp an exact business logo onto a generated atmosphere still."""
from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


def _fit_scene(im: Image.Image, box=(1400, 1050)) -> Image.Image:
    im = im.convert("RGBA")
    tw, th = box
    scale = max(tw / im.width, th / im.height)
    nw, nh = max(1, int(im.width * scale)), max(1, int(im.height * scale))
    im = im.resize((nw, nh), Image.Resampling.LANCZOS)
    left = (nw - tw) // 2
    top = (nh - th) // 2
    return im.crop((left, top, left + tw, top + th))


def _scale_logo(logo: Image.Image, scene_w: int) -> Image.Image:
    logo = logo.convert("RGBA")
    aspect = logo.width / max(logo.height, 1)
    frac = 0.36 if aspect >= 2.3 else 0.26 if aspect >= 1.4 else 0.22
    tw = max(160, min(int(scene_w * frac), 520))
    th = max(1, int(logo.height * (tw / logo.width)))
    if th > 220:
        th = 220
        tw = max(1, int(logo.width * (th / logo.height)))
    return logo.resize((tw, th), Image.Resampling.LANCZOS)


def stamp(scene: Image.Image, logo: Image.Image) -> Image.Image:
    scene = _fit_scene(scene)
    logo = _scale_logo(logo, scene.width)
    pad_x, pad_y = 22, 16
    plate_w = logo.width + pad_x * 2
    plate_h = logo.height + pad_y * 2
    plate = Image.new("RGBA", (plate_w, plate_h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(plate)
    draw.rounded_rectangle((0, 0, plate_w - 1, plate_h - 1), radius=10, fill=(255, 255, 255, 224))
    plate.paste(logo, (pad_x, pad_y), logo)

    shadow = Image.new("RGBA", (plate_w + 16, plate_h + 16), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.rounded_rectangle((6, 8, plate_w + 6, plate_h + 8), radius=12, fill=(16, 32, 51, 70))
    shadow = shadow.filter(ImageFilter.GaussianBlur(6))

    x, y = 40, 40
    scene.alpha_composite(shadow, (x - 6, y - 4))
    scene.alpha_composite(plate, (x, y))
    return scene.convert("RGB")


def main() -> None:
    if len(sys.argv) < 4:
        print("usage: haoqi-stamp-logo.py SCENE LOGO DEST.webp", file=sys.stderr)
        sys.exit(2)
    scene = Image.open(sys.argv[1])
    logo = Image.open(sys.argv[2])
    dest = Path(sys.argv[3])
    dest.parent.mkdir(parents=True, exist_ok=True)
    out = stamp(scene, logo)
    out.save(dest, "WEBP", quality=82)
    print(f"{dest.name} {out.size[0]}x{out.size[1]}")


if __name__ == "__main__":
    main()
