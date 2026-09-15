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
from geom2d import clip_rect, earclip                              # noqa: E402

SRC = os.environ.get("PHL_WATER", "/home/user/work/phl-data/water.ndjson")
OUT = os.path.join(HERE, "data", "philly-water.bin")
HALF = 16000.0            # clip window, metres from City Hall
MIN_AREA = 4000.0         # drop ponds too small to read
SIMPLIFY = 3.0            # metres; rivers do not need centimetre edges
WATER_Z = 0.0             # mean tide



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
            ring = clip_rect(ring, HALF)
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
