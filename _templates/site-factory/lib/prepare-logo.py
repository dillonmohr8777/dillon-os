#!/usr/bin/env python3
"""Knock out solid backgrounds, invert white ink, trim padding.

Logos harvested as black or white rectangles vanish in the dock and
cannot soak into paper the way the IMMOHRTAL mark does. This pass
makes the mark itself the only opaque pixels.
"""
from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
from PIL import Image


def _fade_key(dist: np.ndarray, thresh: float, softness: float) -> np.ndarray:
    return np.clip((dist - thresh) / max(softness, 1.0), 0.0, 1.0)


def prepare_logo(path: Path) -> bool:
    im = Image.open(path).convert("RGBA")
    arr = np.array(im)
    h, w = arr.shape[:2]
    rgb = arr[:, :, :3].astype(np.float32)
    alpha = arr[:, :, 3].astype(np.float32)
    lum = rgb.mean(axis=2)
    sat = rgb.max(axis=2) - rgb.min(axis=2)

    trans_ratio = (arr[:, :, 3] < 16).mean()
    corners = np.array(
        [arr[2, 2], arr[2, w - 3], arr[h - 3, 2], arr[h - 3, w - 3]],
        dtype=np.float32,
    )
    corner_lum = corners[:, :3].mean()
    corner_a = corners[:, 3].mean()

    if trans_ratio < 0.12 and corner_a > 180:
        if corner_lum < 40:
            fade = _fade_key(lum, 28, 16)
            alpha *= fade
        elif corner_lum > 220:
            fade = _fade_key(255 - lum, 28, 16)
            fade = np.where(sat > 32, 1.0, fade)
            alpha *= fade

    # White marks on paper disappear. Turn achromatic highlights into ink.
    light = (alpha > 24) & (lum > 200) & (sat < 28)
    if light.any() and light.sum() > 0.35 * max((alpha > 24).sum(), 1):
        rgb[light] = 255.0 - rgb[light]

    arr[:, :, :3] = np.clip(rgb, 0, 255).astype(np.uint8)
    arr[:, :, 3] = np.clip(alpha, 0, 255).astype(np.uint8)

    opaque = arr[:, :, 3] > 24
    if opaque.sum() < 40:
        return False

    ys, xs = np.where(opaque)
    pad = 10
    x0, y0, x1, y1 = xs.min(), ys.min(), xs.max() + 1, ys.max() + 1
    x0, y0 = max(0, x0 - pad), max(0, y0 - pad)
    x1, y1 = min(w, x1 + pad), min(h, y1 + pad)
    cropped = arr[y0:y1, x0:x1]

    out = Image.fromarray(cropped, "RGBA")
    longest = max(out.size)
    if longest > 1400:
        scale = 1400 / longest
        out = out.resize((max(1, int(out.size[0] * scale)), max(1, int(out.size[1] * scale))), Image.Resampling.LANCZOS)
    out.save(path, "PNG", optimize=True)
    return True


def main(argv: list[str]) -> int:
    paths = [Path(a) for a in argv[1:]]
    if not paths:
        print("Usage: prepare-logo.py <logo.png> [...]", file=sys.stderr)
        return 2
    failed = 0
    for p in paths:
        ok = prepare_logo(p)
        print(f"{'ok' if ok else 'FAIL'} {p}")
        if not ok:
            failed += 1
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
