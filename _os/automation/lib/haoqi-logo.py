#!/usr/bin/env python3
"""Cut a flat logo background to alpha. Edge flood-fill only, so enclosed
white in a badge stays. Favicons and leftover black fields are rejected.
White marks are inked so they read on the Haoqi paper.
"""
from __future__ import annotations

import sys
from collections import deque
from pathlib import Path

from PIL import Image


MIN_EDGE = 64
INK = (10, 10, 10, 255)


def _too_small(w, h):
    return max(w, h) < 48 or min(w, h) < 20


def _dist(a, b):
    return abs(a[0] - b[0]) + abs(a[1] - b[1]) + abs(a[2] - b[2])


def _near(px, bg, tol):
    if px[3] < 8:
        return True
    return _dist(px, bg) <= tol


def _luma(px):
    return 0.2126 * px[0] + 0.7152 * px[1] + 0.0722 * px[2]


def _already_cut(im):
    w, h = im.size
    pix = im.load()
    edge_clear = 0
    edge = 0
    for x in range(w):
        for y in (0, h - 1):
            edge += 1
            if pix[x, y][3] < 200:
                edge_clear += 1
    for y in range(h):
        for x in (0, w - 1):
            edge += 1
            if pix[x, y][3] < 200:
                edge_clear += 1
    return edge > 0 and edge_clear / edge >= 0.4


def _corner_bg(im):
    w, h = im.size
    pix = im.load()
    samples = [
        pix[0, 0],
        pix[w - 1, 0],
        pix[0, h - 1],
        pix[w - 1, h - 1],
        pix[w // 2, 0],
        pix[w // 2, h - 1],
        pix[0, h // 2],
        pix[w - 1, h // 2],
    ]
    opaque = [s for s in samples if s[3] >= 200]
    pool = opaque or samples
    best = pool[0]
    best_n = 0
    for s in pool:
        n = sum(1 for t in pool if _dist(s, t) <= 36)
        if n > best_n:
            best, best_n = s, n
    if not opaque:
        return None
    return best


def _saturated(px):
    return px[3] >= 200 and not (px[0] <= 28 and px[1] <= 28 and px[2] <= 28) and not (
        px[0] >= 230 and px[1] >= 230 and px[2] >= 230
    )


def _designed_field(im):
    """Full-bleed color badges (pink vet marks, etc.) are the logo. Keep them."""
    w, h = im.size
    pix = im.load()
    corners = [pix[0, 0], pix[w - 1, 0], pix[0, h - 1], pix[w - 1, h - 1]]
    if any(c[3] < 200 for c in corners):
        return False
    if all(_saturated(c) for c in corners):
        return True
    spread = max(_dist(a, b) for a in corners for b in corners)
    return spread >= 160


def _flood(im, bg, tol, walk_clear=False, black_only=False):
    w, h = im.size
    pix = im.load()
    seen = [[False] * w for _ in range(h)]
    q = deque()

    def match(px):
        if walk_clear and px[3] < 8:
            return True
        if black_only:
            return px[3] >= 8 and px[0] <= 28 and px[1] <= 28 and px[2] <= 28
        return _near(px, bg, tol)

    def push(x, y):
        if x < 0 or y < 0 or x >= w or y >= h or seen[y][x]:
            return
        if not match(pix[x, y]):
            return
        seen[y][x] = True
        q.append((x, y))

    for x in range(w):
        push(x, 0)
        push(x, h - 1)
    for y in range(h):
        push(0, y)
        push(w - 1, y)

    while q:
        x, y = q.popleft()
        r, g, b, a = pix[x, y]
        if a >= 8:
            pix[x, y] = (r, g, b, 0)
        push(x + 1, y)
        push(x - 1, y)
        push(x, y + 1)
        push(x, y - 1)


def _defringe(im, bg):
    w, h = im.size
    pix = im.load()
    for y in range(h):
        for x in range(w):
            r, g, b, a = pix[x, y]
            if a == 0:
                pix[x, y] = (0, 0, 0, 0)
                continue
            if a >= 250:
                continue
            t = a / 255.0
            if t <= 0:
                pix[x, y] = (0, 0, 0, 0)
                continue
            nr = min(255, max(0, int((r - bg[0] * (1 - t)) / t)))
            ng = min(255, max(0, int((g - bg[1] * (1 - t)) / t)))
            nb = min(255, max(0, int((b - bg[2] * (1 - t)) / t)))
            pix[x, y] = (nr, ng, nb, a)


def _ink_white_marks(im):
    w, h = im.size
    pix = im.load()
    opaque = []
    for y in range(h):
        for x in range(w):
            px = pix[x, y]
            if px[3] >= 200:
                opaque.append(px)
    if len(opaque) < 20:
        return False
    white = sum(1 for px in opaque if _luma(px) >= 220)
    if white / len(opaque) < 0.55:
        return False
    for y in range(h):
        for x in range(w):
            r, g, b, a = pix[x, y]
            if a < 16:
                continue
            if _luma((r, g, b, a)) >= 200:
                pix[x, y] = (INK[0], INK[1], INK[2], a)
    return True


def _crop_alpha(im):
    bbox = im.getbbox()
    if not bbox:
        return im
    pad = 4
    x0, y0, x1, y1 = bbox
    x0 = max(0, x0 - pad)
    y0 = max(0, y0 - pad)
    x1 = min(im.size[0], x1 + pad)
    y1 = min(im.size[1], y1 + pad)
    return im.crop((x0, y0, x1, y1))


def _opaque_ratio(im):
    w, h = im.size
    pix = im.load()
    opaque = 0
    for y in range(h):
        for x in range(w):
            if pix[x, y][3] >= 32:
                opaque += 1
    return opaque / (w * h)


def _black_frac(im):
    w, h = im.size
    pix = im.load()
    black = color = 0
    for y in range(h):
        for x in range(w):
            r, g, b, a = pix[x, y]
            if a < 32:
                continue
            if r <= 28 and g <= 28 and b <= 28:
                black += 1
            else:
                color += 1
    total = black + color
    if not total:
        return 0, 0
    return black / total, color / total


def knock_out(src: Path, dest: Path, tol: int = 48) -> dict:
    im = Image.open(src)
    if im.mode != "RGBA":
        im = im.convert("RGBA")
    w, h = im.size
    if _too_small(w, h):
        return {"ok": False, "reason": "favicon", "opaque": 0}

    if _designed_field(im):
        im.save(dest, "PNG")
        return {"ok": True, "reason": "designed-field-kept", "opaque": 1}

    work = im.copy()
    bg = _corner_bg(work)
    if bg is not None:
        _flood(work, bg, tol, walk_clear=True)
        alt = (0, 0, 0, 255) if _luma(bg) > 180 else (255, 255, 255, 255)
        if _dist(bg, alt) > 40:
            _flood(work, alt, 28, walk_clear=True)

    black_frac, color_frac = _black_frac(work)
    if black_frac > 0.25 and color_frac > 0.12:
        _flood(work, (0, 0, 0, 255), 28, walk_clear=True, black_only=True)

    ratio = _opaque_ratio(work)
    if ratio < 0.02 or ratio > 0.98:
        Image.open(src).convert("RGBA").save(dest, "PNG")
        return {"ok": False, "reason": "knockout-aborted", "opaque": ratio}

    if bg is not None:
        _defringe(work, bg)
    _ink_white_marks(work)
    cropped = _crop_alpha(work)
    if _too_small(*cropped.size):
        return {"ok": False, "reason": "too-small-after-crop", "opaque": ratio}
    cropped.save(dest, "PNG")
    return {"ok": True, "reason": "edge-flood", "opaque": round(ratio, 3)}


def main():
    if len(sys.argv) < 3:
        print("usage: haoqi-logo.py SRC DEST", file=sys.stderr)
        sys.exit(2)
    src, dest = Path(sys.argv[1]), Path(sys.argv[2])
    dest.parent.mkdir(parents=True, exist_ok=True)
    info = knock_out(src, dest)
    print(f"{info['reason']} opaque={info['opaque']}")
    if not info["ok"]:
        sys.exit(1)


if __name__ == "__main__":
    main()
