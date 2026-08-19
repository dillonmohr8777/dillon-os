#!/usr/bin/env python3
"""Compose five unique industry-intent collages from harvested photographs.

Never draws logos or typeset business names. Color-grades toward the sampled
brand palette, unique crop per slot, light halftone, film grain.
"""
from __future__ import annotations

import hashlib
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageOps, ImageStat

from treat import treat_array, tokens_from_colors

SLOT_CROPS = [
    (0.50, 0.38, 1.00),  # hero: face-weighted
    (0.62, 0.58, 0.88),  # process: hands / work
    (0.38, 0.42, 0.92),  # relationship
    (0.50, 0.55, 0.78),  # place
    (0.55, 0.70, 0.70),  # craft close
]
SIZE = (1200, 1500)


def hex_to_rgb(value: str) -> tuple[int, int, int]:
    h = value.strip().lstrip("#")
    if len(h) == 3:
        h = "".join(ch * 2 for ch in h)
    return tuple(int(h[i : i + 2], 16) for i in (0, 2, 4))  # type: ignore[return-value]


def seed_int(text: str) -> int:
    return int(hashlib.sha256(text.encode()).hexdigest()[:8], 16)


def load_rgb(path: Path) -> Image.Image:
    im = Image.open(path)
    if im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info):
        bg = Image.new("RGB", im.size, (24, 28, 32))
        im = im.convert("RGBA")
        bg.paste(im, mask=im.split()[-1])
        return bg
    return im.convert("RGB")


def cover_crop(im: Image.Image, size: tuple[int, int], cx: float, cy: float, zoom: float) -> Image.Image:
    tw, th = size
    zoom = max(0.62, min(zoom, 1.0))
    src_w, src_h = im.size
    # Crop a zoomed window then scale to cover.
    win_w = src_w * zoom
    win_h = src_h * zoom
    # Match target aspect
    target_aspect = tw / th
    src_aspect = win_w / win_h
    if src_aspect > target_aspect:
        win_w = win_h * target_aspect
    else:
        win_h = win_w / target_aspect
    cx_px = src_w * cx
    cy_px = src_h * cy
    left = max(0, min(src_w - win_w, cx_px - win_w / 2))
    top = max(0, min(src_h - win_h, cy_px - win_h / 2))
    crop = im.crop((int(left), int(top), int(left + win_w), int(top + win_h)))
    return crop.resize(size, Image.Resampling.LANCZOS)


def grade(im: Image.Image, accent: tuple[int, int, int], ink: tuple[int, int, int], mode: str) -> Image.Image:
    out = ImageEnhance.Contrast(im).enhance(1.08)
    out = ImageEnhance.Color(out).enhance(1.06 if mode == "food" else 0.98)
    overlay = Image.new("RGB", out.size, accent)
    mix = 0.14 if mode == "food" else 0.10
    out = Image.blend(out, overlay, mix)
    shadow = Image.new("RGB", out.size, ink)
    out = Image.blend(out, shadow, 0.08)
    # Subtle vignette
    vig = Image.new("L", out.size, 0)
    g = ImageDraw.Draw(vig)
    w, h = out.size
    g.ellipse((-int(w * 0.15), -int(h * 0.2), int(w * 1.15), int(h * 1.2)), fill=255)
    vig = vig.filter(ImageFilter.GaussianBlur(80))
    out = Image.composite(out, ImageEnhance.Brightness(out).enhance(0.72), vig)
    return out


def halftone(size: tuple[int, int], seed: int, color: tuple[int, int, int]) -> Image.Image:
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    step = 11
    rng = (seed % 7) + 3
    for y in range(0, size[1], step):
        for x in range(0, size[0], step):
            if ((x * 13 + y * 7 + seed) % 11) < rng:
                r = 1 + ((x + y + seed) % 2)
                d.ellipse((x, y, x + r, y + r), fill=(*color, 28))
    return layer


def grain(size: tuple[int, int], seed: int) -> Image.Image:
    n = Image.new("L", (size[0] // 2, size[1] // 2))
    px = n.load()
    h = seed
    for y in range(n.size[1]):
        for x in range(n.size[0]):
            h = (h * 1664525 + 1013904223) & 0xFFFFFFFF
            px[x, y] = 90 + (h % 70)
    n = n.resize(size, Image.Resampling.BILINEAR)
    return Image.merge("RGBA", (n, n, n, Image.eval(n, lambda v: 18)))


def waves(size: tuple[int, int], color: tuple[int, int, int], seed: int) -> Image.Image:
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    w, h = size
    for i in range(6):
        y0 = int(h * (0.12 + 0.14 * i)) + (seed % 40)
        pts = []
        for x in range(0, w, 24):
            yy = y0 + int(18 * ((x + seed + i * 40) % 97) / 97 * (1 if i % 2 == 0 else -1))
            pts.append((x, yy))
        if len(pts) > 1:
            d.line(pts, fill=(*color, 36), width=2)
    return layer


def pick_sources(paths: list[Path], count: int, slug: str) -> list[Path]:
    if not paths:
        return []
    ranked = sorted(paths, key=lambda p: (p.stat().st_size, p.name), reverse=True)
    out = []
    i = 0
    while len(out) < count:
        out.append(ranked[i % len(ranked)])
        i += 1
        if i > count * 3:
            break
    # Prefer unique files first
    unique = []
    seen = set()
    for p in ranked:
        if p.resolve() not in seen:
            unique.append(p)
            seen.add(p.resolve())
        if len(unique) == count:
            return unique
    while len(unique) < count:
        unique.append(ranked[len(unique) % len(ranked)])
    return unique[:count]


def compose_slot(src: Image.Image, slot: int, accent, ink, mode: str, slug: str, tokens: dict | None = None) -> Image.Image:
    cx, cy, zoom = SLOT_CROPS[slot]
    jitter = (seed_int(f"{slug}-{slot}") % 17) / 200
    cx = min(0.78, max(0.22, cx + (jitter if slot % 2 else -jitter)))
    framed = cover_crop(src, SIZE, cx, cy, zoom)
    framed = grade(framed, accent, ink, mode)
    # Align-style rounded card is applied in CSS; keep full-bleed photo here.
    ht = halftone(SIZE, seed_int(slug) + slot, accent)
    wv = waves(SIZE, accent, seed_int(slug) + slot * 9)
    gn = grain(SIZE, seed_int(slug) + slot * 3)
    framed = framed.convert("RGBA")
    framed = Image.alpha_composite(framed, ht)
    framed = Image.alpha_composite(framed, wv)
    framed = Image.alpha_composite(framed, gn)
    rgb = framed.convert("RGB")
    if tokens:
        arr = treat_array(np.array(rgb, dtype=np.float32), tokens, f"{slug}-{slot + 1}")
        rgb = Image.fromarray(arr, "RGB")
    return rgb


def main() -> int:
    spec = json.loads(sys.stdin.read())
    out_dir = Path(spec["outDir"])
    out_dir.mkdir(parents=True, exist_ok=True)
    sources = [Path(p) for p in spec.get("sources", []) if Path(p).exists()]
    if not sources:
        print(json.dumps({"ok": False, "reason": "no source photographs"}))
        return 2
    accent = hex_to_rgb(spec.get("accent", "#F05A28"))
    ink = hex_to_rgb(spec.get("ink", "#111820"))
    mode = spec.get("mode", "people")
    slug = spec.get("slug", "site")
    tokens = tokens_from_colors(
        spec.get("accent", "#F05A28"),
        spec.get("ink", "#111820"),
        spec.get("deep", "#0B1D2D"),
        spec.get("paper", "#F4EFE7"),
        spec.get("accent2", spec.get("accent", "#F05A28")),
    )
    picked = pick_sources(sources, 5, slug)
    written = []
    hashes = []
    for i in range(5):
        src = load_rgb(picked[i])
        frame = compose_slot(src, i, accent, ink, mode, slug, tokens)
        dest = out_dir / f"collage-{i + 1}.webp"
        frame.save(dest, "WEBP", quality=82, method=6)
        digest = hashlib.sha256(dest.read_bytes()).hexdigest()
        written.append(str(dest))
        hashes.append(digest)
    if len(set(hashes)) < 5:
        print(json.dumps({"ok": False, "reason": "duplicate collage hashes", "hashes": hashes}))
        return 3
    print(json.dumps({"ok": True, "files": written, "hashes": hashes}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
