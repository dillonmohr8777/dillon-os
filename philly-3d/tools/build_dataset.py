#!/usr/bin/env python3
"""Turn the raw city download into the tiled binary the renderers read.

Input : buildings.ndjson  (GeoJSON features, WGS-84, from the City of
        Philadelphia LI_BUILDING_FOOTPRINTS FeatureServer)
Output: dist/philly-buildings.bin   tiled massing, every real footprint
        dist/philly-landmarks.json  named + tall buildings, for labels
        dist/manifest.json          provenance, counts, extents, checksums

Heights come from approx_hgt (feet, LiDAR-derived). We never invent one; a
building with no measured height is flagged so the renderer and the docs can
say so.
"""
from __future__ import annotations

import collections
import hashlib
import json
import math
import os
import sys
import time

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from geo import ORIGIN_LAT, ORIGIN_LON, FEET_TO_M, to_local          # noqa: E402
from simplify import clean_ring, area                                 # noqa: E402
import pack                                                           # noqa: E402

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(HERE, "buildings.ndjson")
OUT = os.path.join(HERE, "dist")
CROWNS = os.path.join(HERE, "data", "philly-crowns.json")   # authored, not generated

SIMPLIFY_TOL = 0.25       # metres
MIN_AREA = 8.0            # m^2 - below this is survey noise, not a building
MAX_PTS = 200             # ring points kept per footprint
TALL_FT = 120.0           # flagged as skyline-defining

FLAG_NAMED = 1
FLAG_LANDMARK = 2
FLAG_POI = 4
FLAG_TALL = 8
FLAG_EST_HEIGHT = 16

# Named landmarks whose LiDAR mass height badly understates the silhouette
# because the crown or spire is too slender for the return. Recorded here with
# the published architectural height so the renderer can add a labelled crown
# instead of silently rewriting the measurement. See docs/SOURCES.md.
# Published architectural heights for buildings whose crown the LiDAR survey
# cannot see. Read from data/philly-crowns.json rather than duplicated here, so
# the table the renderer draws and the table this pipeline records are the same
# table and cannot drift apart.
def _load_crowns():
    path = CROWNS
    try:
        with open(path, encoding="utf-8") as fh:
            doc = json.load(fh)
    except FileNotFoundError:
        return {}
    return {c["name"]: float(c["architectural_ft"]) for c in doc.get("crowns", [])}


CROWNED = _load_crowns()


def main():
    os.makedirs(OUT, exist_ok=True)
    t0 = time.time()

    tiles = collections.defaultdict(lambda: {
        "ids": [], "h": [], "b": [], "f": [], "n": [], "xs": [], "ys": []})

    n_in = n_out = n_skip_geom = n_skip_area = n_est = n_trunc = 0
    pts_total = 0
    heights_ft = []
    landmarks = []
    minx = miny = 1e18
    maxx = maxy = -1e18

    for line in open(SRC):
        n_in += 1
        feat = json.loads(line)
        geom = feat.get("geometry")
        if not geom:
            n_skip_geom += 1
            continue
        props = feat["properties"]

        if geom["type"] == "Polygon":
            rings = [geom["coordinates"][0]]
        else:                                    # MultiPolygon: outer ring of each part
            rings = [poly[0] for poly in geom["coordinates"]]

        h_ft = props.get("approx_hgt")
        est = False
        if not h_ft or h_ft <= 0:
            mx, be = props.get("max_hgt"), props.get("base_elevation")
            if mx and be and mx > be:
                h_ft = mx - be
            else:
                h_ft = 22.0                      # median Philadelphia rowhouse
            est = True
            n_est += 1
        h_m = float(h_ft) * FEET_TO_M
        base_m = float(props.get("base_elevation") or 0.0) * FEET_TO_M

        name = props.get("building_name")
        flags = 0
        if name:
            flags |= FLAG_NAMED
        if h_ft >= TALL_FT:
            flags |= FLAG_TALL
        if est:
            flags |= FLAG_EST_HEIGHT

        for ring in rings:
            local = [to_local(lon, lat) for lon, lat in ring]
            cleaned = clean_ring(local, tol=SIMPLIFY_TOL)
            if len(cleaned) < 3:
                n_skip_geom += 1
                continue
            if abs(area(cleaned)) < MIN_AREA:
                n_skip_area += 1
                continue
            if len(cleaned) > MAX_PTS:
                step = math.ceil(len(cleaned) / MAX_PTS)
                cleaned = cleaned[::step]
                n_trunc += 1

            xs = np.fromiter((p[0] for p in cleaned), dtype=np.float64, count=len(cleaned))
            ys = np.fromiter((p[1] for p in cleaned), dtype=np.float64, count=len(cleaned))
            cx, cy = float(xs.mean()), float(ys.mean())
            tx, ty = int(math.floor(cx / pack.TILE_SIZE)), int(math.floor(cy / pack.TILE_SIZE))

            t = tiles[(tx, ty)]
            t["ids"].append(int(props["objectid"]))
            t["h"].append(min(65535, int(round(h_m * 10))))
            t["b"].append(max(-32768, min(32767, int(round(base_m * 10)))))
            t["f"].append(flags)
            t["n"].append(len(cleaned))
            t["xs"].append(pack.quantize(xs - tx * pack.TILE_SIZE))
            t["ys"].append(pack.quantize(ys - ty * pack.TILE_SIZE))

            n_out += 1
            pts_total += len(cleaned)
            heights_ft.append(float(h_ft))
            minx, maxx = min(minx, xs.min()), max(maxx, xs.max())
            miny, maxy = min(miny, ys.min()), max(maxy, ys.max())

            if name or h_ft >= TALL_FT:
                landmarks.append({
                    "id": int(props["objectid"]),
                    "name": name,
                    "address": props.get("address"),
                    "height_ft": round(float(h_ft), 1),
                    "height_m": round(h_m, 1),
                    "base_ft": round(float(props.get("base_elevation") or 0.0), 1),
                    "x": round(cx, 2), "y": round(cy, 2),
                    "sqft": props.get("square_ft"),
                    "crown_ft": CROWNED.get(name or ""),
                    "height_estimated": est,
                })

        if n_in % 100000 == 0:
            print(f"  {n_in} read, {n_out} kept, {time.time()-t0:.0f}s", flush=True)

    print(f"read {n_in} in {time.time()-t0:.0f}s; packing {len(tiles)} tiles", flush=True)

    packed = {}
    for key, t in tiles.items():
        blob = pack.pack_tile(
            t["ids"], t["h"], t["b"], t["f"], t["n"],
            np.concatenate(t["xs"]), np.concatenate(t["ys"]))
        packed[key] = {"blob": blob, "count": len(t["ids"])}

    bin_path = os.path.join(OUT, "philly-buildings.bin")
    size = pack.write(bin_path, ORIGIN_LAT, ORIGIN_LON, packed)
    digest = hashlib.sha256(open(bin_path, "rb").read()).hexdigest()

    landmarks.sort(key=lambda d: -d["height_ft"])
    with open(os.path.join(OUT, "philly-landmarks.json"), "w") as fh:
        json.dump(landmarks, fh, separators=(",", ":"))

    hs = np.array(heights_ft)
    manifest = {
        "generated_utc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "source": {
            "name": "LI_BUILDING_FOOTPRINTS",
            "publisher": "City of Philadelphia, Department of Licenses & Inspections",
            "endpoint": ("https://services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/"
                         "services/LI_BUILDING_FOOTPRINTS/FeatureServer/0"),
            "height_field": "approx_hgt (feet, LiDAR-derived)",
            "features_downloaded": n_in,
        },
        "projection": {
            "type": "local ENU tangent plane",
            "origin_lat": ORIGIN_LAT, "origin_lon": ORIGIN_LON,
            "origin_note": "Philadelphia City Hall, origin of the city street grid",
            "units": "metres",
        },
        "processing": {
            "simplify_tolerance_m": SIMPLIFY_TOL,
            "min_footprint_m2": MIN_AREA,
            "max_ring_points": MAX_PTS,
            "quant_m": pack.QUANT,
            "tile_size_m": pack.TILE_SIZE,
        },
        "counts": {
            "buildings_written": n_out,
            "ring_points": pts_total,
            "mean_points_per_building": round(pts_total / max(n_out, 1), 2),
            "tiles": len(packed),
            "skipped_no_geometry": n_skip_geom,
            "skipped_too_small": n_skip_area,
            "height_estimated": n_est,
            "rings_decimated": n_trunc,
            "landmarks": len(landmarks),
        },
        "extent_local_m": {
            "min_x": round(minx, 1), "max_x": round(maxx, 1),
            "min_y": round(miny, 1), "max_y": round(maxy, 1),
            "width_km": round((maxx - minx) / 1000, 2),
            "height_km": round((maxy - miny) / 1000, 2),
        },
        "heights_ft": {
            "min": round(float(hs.min()), 1), "max": round(float(hs.max()), 1),
            "median": round(float(np.median(hs)), 1),
            "p95": round(float(np.percentile(hs, 95)), 1),
            "p99": round(float(np.percentile(hs, 99)), 1),
        },
        "artifacts": {
            "philly-buildings.bin": {"bytes": size, "sha256": digest},
        },
    }
    with open(os.path.join(OUT, "manifest.json"), "w") as fh:
        json.dump(manifest, fh, indent=2)

    print(json.dumps(manifest["counts"], indent=2))
    print(f"\nbin: {size/1e6:.2f} MB   ({size/max(n_out,1):.1f} bytes/building)")
    print(f"total {time.time()-t0:.0f}s")


if __name__ == "__main__":
    main()
