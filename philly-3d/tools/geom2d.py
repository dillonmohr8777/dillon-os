"""Shared 2D geometry: window clipping and ear clipping.

Used by both the water and ground builders so there is one implementation of
each to be right about.
"""
from __future__ import annotations


def clip_rect(poly, half):
    """Sutherland-Hodgman against the square [-half, half]^2."""
    def lerp(a, b, t):
        return (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)

    def cut(pts, keep, inter):
        out = []
        n = len(pts)
        for i in range(n):
            a, b = pts[i], pts[(i + 1) % n]
            ain, bin_ = keep(a), keep(b)
            if ain:
                out.append(a)
            if ain != bin_:
                out.append(inter(a, b))
        return out

    p = poly
    for keep, inter in (
        (lambda q: q[0] >= -half, lambda a, b: lerp(a, b, (-half - a[0]) / (b[0] - a[0]))),
        (lambda q: q[0] <= half,  lambda a, b: lerp(a, b, (half - a[0]) / (b[0] - a[0]))),
        (lambda q: q[1] >= -half, lambda a, b: lerp(a, b, (-half - a[1]) / (b[1] - a[1]))),
        (lambda q: q[1] <= half,  lambda a, b: lerp(a, b, (half - a[1]) / (b[1] - a[1]))),
    ):
        if not p:
            return []
        p = cut(p, keep, inter)
    return p


def earclip(pts):
    """O(n^2) ear clipping. Input must be counter-clockwise."""
    n = len(pts)
    if n < 3:
        return []
    idx = list(range(n))
    tris = []

    def cross(a, b, c):
        return ((pts[b][0] - pts[a][0]) * (pts[c][1] - pts[a][1])
                - (pts[b][1] - pts[a][1]) * (pts[c][0] - pts[a][0]))

    def inside(a, b, c, p):
        return cross(a, b, p) >= 0 and cross(b, c, p) >= 0 and cross(c, a, p) >= 0

    guard = 0
    while len(idx) > 3 and guard < 4 * n:
        guard += 1
        for i in range(len(idx)):
            a, b, c = idx[i - 1], idx[i], idx[(i + 1) % len(idx)]
            if cross(a, b, c) <= 0:
                continue
            if any(inside(a, b, c, k) for k in idx if k not in (a, b, c)):
                continue
            tris.append((a, b, c))
            idx.pop(i)
            guard = 0
            break
        else:
            break
    if len(idx) == 3:
        tris.append(tuple(idx))
    return tris
