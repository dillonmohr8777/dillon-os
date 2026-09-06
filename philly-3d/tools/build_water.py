#!/usr/bin/env python3
"""Turn the city hydrography layer into a water mesh for the viewer.

The source covers the whole regional watershed - the Delaware River polygon
alone is 2,113 km2 and reaches 77 km past the county - so this clips to the
city window first, then triangulates. Water sits at a single tidal plane;
the Delaware and Schuylkill are tidal all the way through Philadelphia, so a
flat surface is the right model rather than a simplification.
"""
from __future__ import annotations

import json
import math
import os
import struct
import sys
import zlib

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(HERE, "tools"))
from geo import to_local                                           # noqa: E402
from simplify import area, clean_ring                              # noqa: E402

SRC = os.environ.get("PHL_WATER", "/home/user/work/phl-data/water.ndjson")
OUT = os.path.join(HERE, "data", "philly-water.bin")
HALF = 16000.0            # clip window, metres from City Hall
MIN_AREA = 4000.0         # drop ponds too small to read
SIMPLIFY = 3.0            # metres; rivers do not need centimetre edges
WATER_Z = 0.0             # mean tide


def clip(poly, half):
    """Sutherland-Hodgman against the square window."""
    def half_plane(pts, keep, inter):
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

    def lerp(a, b, t):
        return (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)

    p = poly
    for keep, inter in (
        (lambda q: q[0] >= -half, lambda a, b: lerp(a, b, (-half - a[0]) / (b[0] - a[0]))),
        (lambda q: q[0] <= half,  lambda a, b: lerp(a, b, (half - a[0]) / (b[0] - a[0]))),
        (lambda q: q[1] >= -half, lambda a, b: lerp(a, b, (-half - a[1]) / (b[1] - a[1]))),
        (lambda q: q[1] <= half,  lambda a, b: lerp(a, b, (half - a[1]) / (b[1] - a[1]))),
    ):
        if not p:
            return []
        p = half_plane(p, keep, inter)
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
        return (cross(a, b, p) >= 0 and cross(b, c, p) >= 0 and cross(c, a, p) >= 0)

    guard = 0
    while len(idx) > 3 and guard < 4 * n:
        guard += 1
        for i in range(len(idx)):
            a = idx[i - 1]
            b = idx[i]
            c = idx[(i + 1) % len(idx)]
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


def main():
    verts = []
    tris = []
    kept = collections = 0
    names = {}
    for line in open(SRC):
        f = json.loads(line)
        g = f.get("geometry")
        if not g:
            continue
        name = (f["properties"].get("creek_name")
                or f["properties"].get("gnis_name") or "").strip()
        polys = [g["coordinates"]] if g["type"] == "Polygon" else g["coordinates"]
        for poly in polys:
            ring = [to_local(lon, lat) for lon, lat in poly[0]]
            xs = [p[0] for p in ring]
            ys = [p[1] for p in ring]
            if min(xs) > HALF or max(xs) < -HALF or min(ys) > HALF or max(ys) < -HALF:
                continue
            ring = clip(ring, HALF)
            if len(ring) < 3:
                continue
            ring = clean_ring(ring, tol=SIMPLIFY, collinear_tol=0.5)
            if len(ring) < 3 or abs(area(ring)) < MIN_AREA:
                continue
            if area(ring) < 0:
                ring = ring[::-1]
            base = len(verts)
            verts.extend(ring)
            for a, b, c in earclip(ring):
                tris.append((base + a, base + b, base + c))
            kept += 1
            names[name] = names.get(name, 0) + 1

    # flatten to a triangle soup: simpler for the viewer than an index buffer,
    # and water is a small fraction of the scene either way
    flat = []
    for a, b, c in tris:
        for i in (a, b, c):
            flat.append(verts[i][0])
            flat.append(verts[i][1])

    payload = struct.pack("<I", len(tris)) + b"".join(
        struct.pack("<f", v) for v in flat)
    blob = zlib.compress(payload, 9)
    header = b"PHLWATR1" + struct.pack("<IIf", 1, len(tris), WATER_Z)
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "wb") as fh:
        fh.write(header)
        fh.write(blob)

    top = sorted(names.items(), key=lambda kv: -kv[1])[:8]
    print(f"clipped to +/-{HALF/1000:.0f} km: {kept} polygons, {len(tris)} triangles")
    print(f"wrote {OUT}: {os.path.getsize(OUT)/1024:.0f} KB")
    print("bodies: " + ", ".join(f"{k or '(unnamed)'} x{v}" for k, v in top))


if __name__ == "__main__":
    main()
