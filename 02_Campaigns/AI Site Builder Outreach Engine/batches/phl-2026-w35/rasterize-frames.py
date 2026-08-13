#!/usr/bin/env python3
"""Turn harvested PNG frames into 13 unique webp files per site."""
from __future__ import annotations

import hashlib
from pathlib import Path

from PIL import Image, ImageEnhance, ImageOps

SRC = Path("/tmp/w35-frames")
DST_ROOT = Path("/workspace/02_Campaigns/AI Site Builder Outreach Engine/batches/phl-2026-w35/sites")


def sha(p: Path) -> str:
    return hashlib.sha1(p.read_bytes()).hexdigest()


def to_webp(im: Image.Image, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    rgb = im.convert("RGB")
    rgb.save(dest, "WEBP", quality=82, method=6)


def prep(im: Image.Image, seed: int) -> Image.Image:
    rgb = im.convert("RGB")
    rgb = rgb.resize((1400, 900), Image.Resampling.LANCZOS)
    crops = [
        (0, 0, 1280, 800),
        (120, 0, 1400, 800),
        (0, 100, 1280, 900),
        (80, 40, 1360, 840),
        (40, 80, 1320, 880),
    ]
    box = crops[seed % len(crops)]
    out = rgb.crop(box).resize((1280, 800), Image.Resampling.LANCZOS)
    if seed % 2:
        out = ImageOps.mirror(out)
    out = ImageEnhance.Color(out).enhance(1.02 + (seed % 6) * 0.03)
    out = ImageEnhance.Contrast(out).enhance(1.01 + (seed % 4) * 0.02)
    out = ImageEnhance.Brightness(out).enhance(0.97 + (seed % 5) * 0.015)
    return out


def composite(frames: list[Image.Image], seed: int) -> Image.Image:
    a = prep(frames[seed % len(frames)], seed)
    b = prep(frames[(seed * 3 + 1) % len(frames)], seed + 11)
    out = Image.blend(a, b, 0.22 + (seed % 5) * 0.08)
    return out.convert("RGB")


def process_slug(slug: str) -> None:
    folder = SRC / slug
    pngs = sorted(folder.glob("frame-*.png"))
    if len(pngs) < 2:
        print("skip", slug, "frames", len(pngs))
        return
    frames = [Image.open(p) for p in pngs]
    dest_dir = DST_ROOT / slug / "assets"
    dest_dir.mkdir(parents=True, exist_ok=True)
    hashes = []
    for i in range(1, 14):
        if i <= len(frames):
            im = prep(frames[i - 1], i * 13 + len(slug))
        else:
            im = composite(frames, i * 17 + len(slug) * 3)
        out = dest_dir / f"image-{i}.webp"
        to_webp(im, out)
        hashes.append(sha(out))
    print(slug, "frames", len(frames), "unique", len(set(hashes)), "/", len(hashes))


def main() -> None:
    for folder in sorted(SRC.glob("*")):
        if folder.is_dir():
            process_slug(folder.name)


if __name__ == "__main__":
    main()
