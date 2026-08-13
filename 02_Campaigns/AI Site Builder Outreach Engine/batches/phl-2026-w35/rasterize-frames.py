#!/usr/bin/env python3
"""Copy 6 collage stills per site, then write 13 unique webps.

Images 1-6 are the generated frames (light resize only).
Images 7-13 are unique crops of those frames. No muddy blends.
Prefers `{slug}-col*.png`, falls back to `{slug}-is*.png`.
"""
from __future__ import annotations

import hashlib
import json
import shutil
from pathlib import Path

from PIL import Image, ImageEnhance, ImageOps

ART = Path("/opt/cursor/artifacts/assets")
SRC = Path("/tmp/w35-is-frames")
DST_ROOT = Path("/workspace/02_Campaigns/AI Site Builder Outreach Engine/batches/phl-2026-w35/sites")
CHOSEN = json.loads(
    Path("/workspace/02_Campaigns/AI Site Builder Outreach Engine/batches/phl-2026-w35/chosen.json").read_text()
)


def sha(p: Path) -> str:
    return hashlib.sha1(p.read_bytes()).hexdigest()


def to_webp(im: Image.Image, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    im.convert("RGB").save(dest, "WEBP", quality=86, method=6)


def prep(im: Image.Image, seed: int, crop: bool) -> Image.Image:
    rgb = im.convert("RGB")
    rgb = rgb.resize((1600, 900), Image.Resampling.LANCZOS)
    if not crop:
        return rgb.resize((1280, 720), Image.Resampling.LANCZOS)
    crops = [
        (40, 20, 1480, 830),
        (160, 0, 1600, 810),
        (0, 80, 1440, 900),
        (80, 40, 1520, 860),
        (120, 60, 1560, 880),
        (20, 100, 1400, 880),
        (200, 30, 1600, 840),
    ]
    box = crops[seed % len(crops)]
    out = rgb.crop(box).resize((1280, 720), Image.Resampling.LANCZOS)
    if seed % 3 == 0:
        out = ImageOps.mirror(out)
    out = ImageEnhance.Color(out).enhance(1.02 + (seed % 4) * 0.02)
    out = ImageEnhance.Contrast(out).enhance(1.01 + (seed % 3) * 0.015)
    return out


def collect(slug: str) -> list[Path]:
    files = sorted(ART.glob(f"{slug}-col*.png")) or sorted(ART.glob(f"{slug}-is*.png"))
    if len(files) < 5:
        raise SystemExit(f"{slug}: only {len(files)} stills")
    dest = SRC / slug
    dest.mkdir(parents=True, exist_ok=True)
    out = []
    for i, src in enumerate(files[:7], start=1):
        p = dest / f"frame-{i:02d}.png"
        shutil.copy2(src, p)
        out.append(p)
    return out


def process(slug: str) -> None:
    pngs = collect(slug)
    frames = [Image.open(p) for p in pngs]
    dest_dir = DST_ROOT / slug / "assets"
    dest_dir.mkdir(parents=True, exist_ok=True)
    hashes = []
    for i in range(1, 14):
        if i <= len(frames):
            im = prep(frames[i - 1], i, crop=False)
        else:
            im = prep(frames[(i - 1) % len(frames)], i * 11 + len(slug), crop=True)
        out = dest_dir / f"image-{i}.webp"
        to_webp(im, out)
        hashes.append(sha(out))
    print(slug, "stills", len(frames), "unique", len(set(hashes)), "/", len(hashes))


def main() -> None:
    all_hashes = []
    for slug in CHOSEN:
        process(slug)
        dest = DST_ROOT / slug / "assets"
        all_hashes.extend(sha(p) for p in dest.glob("image-*.webp"))
    print("batch unique", len(set(all_hashes)), "/", len(all_hashes))


if __name__ == "__main__":
    main()
