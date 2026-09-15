#!/usr/bin/env python3
"""Build the ground-detail mesh: parks and street centrelines.

Both are flat inlays a few centimetres above the ground plane. Streets become
ribbons whose width comes from the city's own road class, which is what makes
Broad Street read as Broad Street rather than as one more side street.

Output is a single binary with a class byte per triangle so the shader can
colour parks and roads differently without a second draw call.
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
from geom2d import clip_rect, earclip                              # noqa: E402

PARKS = os.environ.get("PHL_PARKS", "/home/user/work/phl-data/parks.ndjson")
STREETS = os.environ.get("PHL_STREETS", "/home/user/work/phl-data/streets.ndjson")
OUT = os.path.join(HERE, "data", "philly-ground.bin")

HALF = 13000.0
MIN_PARK_AREA = 6000.0
PARK_SIMPLIFY = 4.0

# Metres, from the city's street classification. Class 1 is the expressway
# network, class 5 a residential street.
WIDTH = {1: 26.0, 2: 17.0, 3: 12.5, 4: 9.5, 5: 7.0}
DEFAULT_WIDTH = 8.0
MIN_SEG = 6.0

CLASS_PARK = 0
CLASS_ROAD = 1


def main():
    verts = []      # (x, y)
    tris = []       # (a, b, c, class)

    n_park = 0
    for line in open(PARKS):
        f = json.loads(line)
        g = f.get("geometry")
        if not g:
            continue
        polys = [g["coordinates"]] if g["type"] == "Polygon" else g["coordinates"]
        for poly in polys:
            ring = [to_local(lon, lat) for lon, lat in poly[0]]
            xs = [p[0] for p in ring]
            ys = [p[1] for p in ring]
            if min(xs) > HALF or max(xs) < -HALF or min(ys) > HALF or max(ys) < -HALF:
                continue
            ring = clip_rect(ring, HALF)
            if len(ring) < 3:
                continue
            ring = clean_ring(ring, tol=PARK_SIMPLIFY, collinear_tol=0.6)
            if len(ring) < 3 or abs(area(ring)) < MIN_PARK_AREA:
                continue
            if area(ring) < 0:
                ring = ring[::-1]
            base = len(verts)
            verts.extend(ring)
            for a, b, c in earclip(ring):
                tris.append((base + a, base + b, base + c, CLASS_PARK))
            n_park += 1

    n_seg = 0
    for line in open(STREETS):
        f = json.loads(line)
        g = f.get("geometry")
        if not g or g["type"] != "LineString":
            continue
        cls = f["properties"].get("class")
        w = WIDTH.get(cls, DEFAULT_WIDTH) / 2.0
        pts = [to_local(lon, lat) for lon, lat in g["coordinates"]]
        for i in range(len(pts) - 1):
            (x0, y0), (x1, y1) = pts[i], pts[i + 1]
            if max(abs(x0), abs(x1)) > HALF or max(abs(y0), abs(y1)) > HALF:
                continue
            dx, dy = x1 - x0, y1 - y0
            L = math.hypot(dx, dy)
            if L < MIN_SEG:
                continue
            # extend each end by half a width so corners close without a join
            ex, ey = dx / L * w, dy / L * w
            x0 -= ex; y0 -= ey; x1 += ex; y1 += ey
            nx, ny = -dy / L * w, dx / L * w
            base = len(verts)
            verts.extend([(x0 + nx, y0 + ny), (x1 + nx, y1 + ny),
                          (x1 - nx, y1 - ny), (x0 - nx, y0 - ny)])
            tris.append((base, base + 1, base + 2, CLASS_ROAD))
            tris.append((base, base + 2, base + 3, CLASS_ROAD))
            n_seg += 1

    flat = []
    for a, b, c, k in tris:
        for i in (a, b, c):
            flat.append(verts[i][0])
            flat.append(verts[i][1])
            flat.append(float(k))

    payload = struct.pack("<I", len(tris)) + b"".join(struct.pack("<f", v) for v in flat)
    blob = zlib.compress(payload, 9)
    with open(OUT, "wb") as fh:
        fh.write(b"PHLGRND1")
        fh.write(struct.pack("<II", 1, len(tris)))
        fh.write(blob)

    print(f"parks: {n_park} polygons   street segments: {n_seg}")
    print(f"triangles: {len(tris)}   {OUT} = {os.path.getsize(OUT)/1024:.0f} KB")


if __name__ == "__main__":
    main()
