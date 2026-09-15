"""Footprint cleanup: drop the closing duplicate, remove collinear points,
then Douglas-Peucker. All tolerances are in metres in the local ENU frame,
so 'tolerance' means what it says on the ground."""
from __future__ import annotations


def _perp2(ax, ay, bx, by, px, py):
    dx, dy = bx - ax, by - ay
    L2 = dx * dx + dy * dy
    if L2 == 0.0:
        return (px - ax) ** 2 + (py - ay) ** 2
    t = ((px - ax) * dx + (py - ay) * dy) / L2
    t = 0.0 if t < 0.0 else (1.0 if t > 1.0 else t)
    qx, qy = ax + t * dx, ay + t * dy
    return (px - qx) ** 2 + (py - qy) ** 2


def dp(pts, tol):
    if len(pts) < 3:
        return pts
    t2 = tol * tol
    keep = [False] * len(pts)
    keep[0] = keep[-1] = True
    stack = [(0, len(pts) - 1)]
    while stack:
        i, j = stack.pop()
        if j <= i + 1:
            continue
        best, bi = -1.0, -1
        ax, ay = pts[i]
        bx, by = pts[j]
        for k in range(i + 1, j):
            d = _perp2(ax, ay, bx, by, pts[k][0], pts[k][1])
            if d > best:
                best, bi = d, k
        if best > t2:
            keep[bi] = True
            stack.append((i, bi))
            stack.append((bi, j))
    return [p for p, k in zip(pts, keep) if k]


def clean_ring(ring, tol=0.25, collinear_tol=0.05):
    """ring: list of (x, y) metres, GeoJSON-closed. Returns an open ring."""
    pts = list(ring)
    if len(pts) > 1 and abs(pts[0][0] - pts[-1][0]) < 1e-9 and abs(pts[0][1] - pts[-1][1]) < 1e-9:
        pts = pts[:-1]
    if len(pts) < 3:
        return pts
    # collinear pass on the closed cycle
    out = []
    n = len(pts)
    ct2 = collinear_tol * collinear_tol
    for i in range(n):
        a, b, c = pts[(i - 1) % n], pts[i], pts[(i + 1) % n]
        if _perp2(a[0], a[1], c[0], c[1], b[0], b[1]) > ct2:
            out.append(b)
    if len(out) < 3:
        out = pts
    if tol > 0 and len(out) > 4:
        closed = out + [out[0]]
        s = dp(closed, tol)
        if len(s) > 1 and s[0] == s[-1]:
            s = s[:-1]
        if len(s) >= 3:
            out = s
    return out


def area(ring):
    a = 0.0
    n = len(ring)
    for i in range(n):
        x1, y1 = ring[i]
        x2, y2 = ring[(i + 1) % n]
        a += x1 * y2 - x2 * y1
    return a * 0.5
