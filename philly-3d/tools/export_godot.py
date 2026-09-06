#!/usr/bin/env python3
"""Export a real Philadelphia district for the Grand Theft Bureaucracy engine.

That engine already builds its world procedurally from centre, footprint and
height, and picks its world builder by path from the hub profile
(`hub_profile.get("builder", "res://scripts/world_builder.gd")`). So the
cheapest path to a real Philadelphia is not a mesh dump: it is a district
constants file and a footprint table in exactly the shape the existing builder
already consumes.

Coordinates. This project is Z-up, +X east, +Y north, metres from City Hall.
Godot is Y-up with -Z forward, so the mapping is

    godot.x =  east
    godot.y =  up
    godot.z = -north

which is applied once, here, so nothing downstream has to remember it.

Outputs, into dist/godot/:
  philadelphia_district.json   roads, blocks, landmarks, spawn
  philadelphia_buildings.json  every real footprint in the window
  philadelphia_district.gd     constants, mirroring scripts/district.gd
  README.md                    how to drop it into the game
"""
from __future__ import annotations

import json
import math
import os
import struct
import sys
import zlib

import numpy as np

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(HERE, "tools"))
import pack                                                        # noqa: E402
from geo import to_local, FEET_TO_M                                # noqa: E402

BIN = os.path.join(HERE, "data", "philly-buildings.bin")
CROWNS = os.path.join(HERE, "data", "philly-crowns.json")
TERRAIN = os.path.join(HERE, "data", "philly-terrain.bin")

# The engine draws its ground as one flat slab at y = 0. The survey puts every
# footprint on its own base elevation, which across this district runs 0.7 to
# 14.7 m with a median of 13.4, so exporting those absolutely left the whole
# district floating thirteen metres above the floor it stands on. The district
# is shifted onto y = 0 by its own ground datum instead, and the real relief is
# kept as a terrain grid the builder lays down under it.
GROUND_CELLS = 28              # over the 840 m district, so 30 m per cell
PROSPECTS = os.path.join(HERE, "data", "philly-prospects.json")
STREETS = os.environ.get("PHL_STREETS", "/home/user/work/phl-data/streets.ndjson")
OUT = os.path.join(HERE, "dist", "godot")

# The districts. Each is a window on the same survey, centred on a real cluster
# of the Philadelphia 25 so a mission has somewhere to be. Centres are in local
# ENU metres from the projection origin at Penn Square.
#
# The prospect coordinates these are built around are in data/philly-prospects.json.
DISTRICTS = {
    "philadelphia":     # Penn Square: City Hall, the Liberty towers, Broad Street
        {"centre": (-40.0, -20.0), "half": 420.0,
         "label": "Centre City", "spawn_enu": (900.0, -142.0)},
    "market_east":      # Reading Terminal, the Convention Center, Filbert Street
        {"centre": (640.0, -60.0), "half": 420.0,
         "label": "Market East", "spawn_enu": (529.0, 61.0)},
    # Sized to hold their prospect cluster and stay under MAX_BUILDINGS. South
    # Philadelphia is the densest fabric in the city: 3,524 footprints in an
    # 840 m square, against 461 in the same square of Centre City.
    "south_philly":     # the 9th Street corridor: Isgro, Fante's, Di Bruno, Geno's, Pat's
        {"centre": (545.0, -1740.0), "half": 420.0,
         "label": "South Philadelphia", "spawn_enu": (545.0, -1740.0)},
    "fishtown":         # Frankford Avenue: Johnny Brenda's, Suraya, Frankford Hall
        {"centre": (2400.0, 1950.0), "half": 540.0,
         "label": "Fishtown", "spawn_enu": (2400.0, 1950.0)},
}
DEFAULT_DISTRICT = "philadelphia"

CENTRE = DISTRICTS[DEFAULT_DISTRICT]["centre"]
HALF = DISTRICTS[DEFAULT_DISTRICT]["half"]
MAX_BUILDINGS = 4000

# Penn's grid runs 9.21 degrees off cardinal, measured from the city's own
# street centrelines. The engine's kit.box takes no yaw and its road constants
# are axis-aligned, so the whole district is rotated by that bearing on the way
# out. Market and Chestnut then run along X, the numbered streets along Z, and
# every existing system - traffic lanes, pedestrian routes, minimap, window
# punching - keeps working untouched.
GRID_BEARING_DEG = 9.21
DATUM = 0.0
_ROT = math.radians(GRID_BEARING_DEG)
_COS, _SIN = math.cos(_ROT), math.sin(_ROT)


def align(x, y):
    """Rotate local ENU into the district's grid-aligned frame."""
    return (x * _COS - y * _SIN, x * _SIN + y * _COS)


def gd(x_east, y_north, z_up=0.0):
    """Grid-aligned local metres -> Godot Vector3 components."""
    ax, ay = align(x_east, y_north)
    return [round(ax, 2), round(z_up, 2), round(-ay, 2)]


def load_buildings(cx, cy, half):
    data = open(BIN, "rb").read()
    ntiles, _ = struct.unpack_from("<II", data, 40)
    idx = pack.HEADER_SIZE
    pay = idx + ntiles * pack.INDEX_ENTRY
    out = []
    for i in range(ntiles):
        tx, ty, cnt, off, ln = struct.unpack_from("<iiIII", data, idx + i * pack.INDEX_ENTRY)
        tx0, ty0 = tx * pack.TILE_SIZE, ty * pack.TILE_SIZE
        if (tx0 > cx + half + pack.TILE_SIZE or tx0 + pack.TILE_SIZE < cx - half
                or ty0 > cy + half + pack.TILE_SIZE or ty0 + pack.TILE_SIZE < cy - half):
            continue
        raw = zlib.decompress(data[pay + off:pay + off + ln])
        o = 0
        n = struct.unpack_from("<I", raw, o)[0]; o += 4
        ids = []
        acc = 0
        for k in range(n):
            acc += struct.unpack_from("<I", raw, o + k * 4)[0]
            ids.append(acc)
        o += 4 * n
        h = [struct.unpack_from("<H", raw, o + k * 2)[0] * 0.1 for k in range(n)]; o += 2 * n
        b = [struct.unpack_from("<h", raw, o + k * 2)[0] * 0.1 for k in range(n)]; o += 2 * n
        o += n                                                     # flags
        npts = list(raw[o:o + n]); o += n
        total = sum(npts)
        xs_raw = [struct.unpack_from("<h", raw, o + k * 2)[0] for k in range(total)]; o += 2 * total
        ys_raw = [struct.unpack_from("<h", raw, o + k * 2)[0] for k in range(total)]; o += 2 * total

        s = 0
        for k in range(n):
            c = npts[k]
            vx = xs_raw[s] + 32768
            vy = ys_raw[s] + 32768
            ring = []
            ax, ay = vx, vy
            ring.append((ax * pack.QUANT + pack.COORD_OFFSET + tx0,
                         ay * pack.QUANT + pack.COORD_OFFSET + ty0))
            for j in range(1, c):
                ax += xs_raw[s + j]
                ay += ys_raw[s + j]
                ring.append((ax * pack.QUANT + pack.COORD_OFFSET + tx0,
                             ay * pack.QUANT + pack.COORD_OFFSET + ty0))
            s += c
            mx = sum(p[0] for p in ring) / c
            my = sum(p[1] for p in ring) / c
            if abs(mx - cx) > half or abs(my - cy) > half:
                continue
            out.append({"id": ids[k], "ring": ring, "h": h[k], "base": b[k],
                        "cx": mx, "cy": my})
    out.sort(key=lambda d: -d["h"])
    return out[:MAX_BUILDINGS]


def obb(ring):
    """Oriented box for a footprint: the engine's _build_building takes a
    centre, a footprint size and a height, so give it the best rectangle.
    Longest edge sets the angle, which is right for a rowhouse and close
    enough for everything else."""
    best_len, ang = -1.0, 0.0
    n = len(ring)
    for i in range(n):
        x0, y0 = ring[i]
        x1, y1 = ring[(i + 1) % n]
        L = math.hypot(x1 - x0, y1 - y0)
        if L > best_len:
            best_len, ang = L, math.atan2(y1 - y0, x1 - x0)
    ca, sa = math.cos(-ang), math.sin(-ang)
    xs = [p[0] * ca - p[1] * sa for p in ring]
    ys = [p[0] * sa + p[1] * ca for p in ring]
    w = max(xs) - min(xs)
    d = max(ys) - min(ys)
    mx = (max(xs) + min(xs)) / 2
    my = (max(ys) + min(ys)) / 2
    cx = mx * math.cos(ang) - my * math.sin(ang)
    cy = mx * math.sin(ang) + my * math.cos(ang)
    return cx, cy, w, d, ang


def read_terrain():
    """The 50 m height field from build_terrain.py, as a sampler in local ENU."""
    if not os.path.exists(TERRAIN):
        return None
    raw = open(TERRAIN, "rb").read()
    if raw[:8] != b"PHLTERR1":
        return None
    nx, ny = struct.unpack_from("<II", raw, 8)
    x0, y0 = struct.unpack_from("<ff", raw, 16)
    cell = struct.unpack_from("<f", raw, 24)[0]
    zmin, zscale = struct.unpack_from("<ff", raw, 28)
    q = struct.unpack(f"<{nx * ny}H", zlib.decompress(raw[36:]))

    def at(x, y):
        tx = (x - x0) / cell - 0.5
        ty = (y - y0) / cell - 0.5
        bx, by = int(math.floor(tx)), int(math.floor(ty))
        rx, ry = tx - bx, ty - by
        fx = rx * rx * (3 - 2 * rx)        # the same fade the viewer uses
        fy = ry * ry * (3 - 2 * ry)
        def g(i, j):
            i = min(max(i, 0), nx - 1)
            j = min(max(j, 0), ny - 1)
            return zmin + q[j * nx + i] * zscale
        return ((g(bx, by) + (g(bx + 1, by) - g(bx, by)) * fx) * (1 - fy)
                + (g(bx, by + 1) + (g(bx + 1, by + 1) - g(bx, by + 1)) * fx) * fy)
    return at


def crown_rows(b, crown, base_cx, base_cy):
    """Tier boxes for one crowned building, in the same row shape the engine's
    _build_building already consumes.

    The survey measures the dominant roof mass, so City Hall arrives as its
    170 ft cornice. The crown table carries the published architectural height
    and how it steps up to it; each tier becomes one more box. to_ft is measured
    from the building's own grade, the same datum as approx_hgt, so the
    footprint's base elevation is added back."""
    ox, oy, w, d, ang = obb(b["ring"])
    grade = b["base"]
    z = grade + b["h"]
    rows = []
    for t in crown["tiers"]:
        top = grade + float(t["to_ft"]) * FEET_TO_M
        if top <= z + 0.05:
            continue
        frac = float(t["frac"])
        if t.get("shape") == "square":
            side = frac * min(w, d)
            size = [side, side]
        else:
            size = [w * frac, d * frac]
        solid = t.get("solid")
        if solid is None:
            solid = t.get("kind") in SOLID_KINDS
        rows.append({
            "id": b["id"],
            "centre": gd(ox - base_cx, oy - base_cy, z - DATUM),
            "size": [round(size[0], 2), round(size[1], 2)],
            "height": round(top - z, 2),
            "rot_y": round(-(ang + _ROT), 4),
            "crown": True,
            "kind": t.get("kind", "crown"),
            "solid": bool(solid),
            "of": crown["name"],
        })
        z = top
    return rows


SOLID_KINDS = {"spire", "mast", "statue", "finial", "belfry"}


def load_crowns():
    try:
        with open(CROWNS, encoding="utf-8") as fh:
            doc = json.load(fh)
    except FileNotFoundError:
        return {}
    return {int(c["objectid"]): c for c in doc.get("crowns", [])}


def measure_bearing(rings):
    """The grid bearing of ONE district, measured from its own FOOTPRINTS.

    Penn's 9.21 degrees is Centre City's grid and it does not hold across the
    county. But measuring it from streets fails in exactly the districts where
    it matters: South Philadelphia has Passyunk Avenue and Fishtown has
    Frankford Avenue, long diagonals cutting the grid, and a length-weighted
    mean over street segments amplifies precisely the streets that break it.
    Measured that way South Philadelphia came out at 12.52 degrees and aligned
    68% of its footprints, against 77% for Centre City's 9.21.

    So this optimises the thing actually wanted. The reason to rotate at all is
    that the engine's box builder, window punching, traffic lanes and minimap
    are all axis aligned, so the measure that matters is how many FOOTPRINTS
    end up square to an axis. Sweep the candidate bearings and take the best.

    Returns the bearing and the share of footprints it aligns to within
    5 degrees, which is a far more useful number than a mean vector length: it
    is the fraction of the district the axis-aligned systems will fit.
    """
    angs = []
    lens = []
    for ring in rings:
        best, ang = -1.0, 0.0
        n = len(ring)
        for i in range(n):
            x0, y0 = ring[i]
            x1, y1 = ring[(i + 1) % n]
            L = math.hypot(x1 - x0, y1 - y0)
            if L > best:
                best, ang = L, math.atan2(y1 - y0, x1 - x0)
        if best > 1.5:
            angs.append(ang)
            lens.append(best)
    if not angs:
        return GRID_BEARING_DEG, 0.0
    a = np.degrees(np.array(angs)) % 90.0
    w = np.array(lens)

    # 0.05 degree sweep over the quarter turn. Scored with a soft kernel rather
    # than a hard "within 5 degrees" count: a hard threshold makes a plateau
    # wherever the grid is strong, and argmax then picks an arbitrary bearing
    # inside it. Centre City came out at 10.30 degrees that way, a degree off
    # its own measured 9.21, with the median footprint offset almost tripled.
    #
    # The kernel is a von Mises in the quadrupled angle, concentration 8, which
    # is about plus or minus 10 degrees of real bearing. It finds the dominant
    # mode, so a diagonal avenue cannot drag it the way a plain mean can, and it
    # has a sharp optimum, so a strong grid is located precisely.
    cand = np.arange(0.0, 90.0, 0.05)
    d4 = np.radians((a[None, :] - cand[:, None]) * 4.0)
    score = (np.exp(8.0 * (np.cos(d4) - 1.0)) * w[None, :]).sum(axis=1)
    k = int(np.argmax(score))
    bearing = ((cand[k] + 45.0) % 90.0) - 45.0
    aligned = float((np.abs(((a - cand[k] + 45.0) % 90.0) - 45.0) < 5.0).mean())
    return -bearing, aligned


def load_roads(cx, cy, half):
    roads = []
    if not os.path.exists(STREETS):
        return roads
    WIDTH = {1: 26.0, 2: 17.0, 3: 12.5, 4: 9.5, 5: 7.0}
    for line in open(STREETS):
        f = json.loads(line)
        g = f.get("geometry")
        if not g or g["type"] != "LineString":
            continue
        p = f["properties"]
        pts = [to_local(lon, lat) for lon, lat in g["coordinates"]]
        keep = [q for q in pts if abs(q[0] - cx) <= half + 40 and abs(q[1] - cy) <= half + 40]
        if len(keep) < 2:
            continue
        name = " ".join(x for x in [p.get("pre_dir"), p.get("st_name"), p.get("st_type")] if x)
        roads.append({
            "name": name.strip(),
            "width": WIDTH.get(p.get("class"), 8.0),
            "points": [gd(q[0], q[1]) for q in keep],
        })
    return roads


def export_one(slug, spec):
    """Write one district. Every window reads the same survey; only the centre,
    the size, the spawn and the street bearing differ."""
    global HALF, DATUM, GRID_BEARING_DEG, _ROT, _COS, _SIN
    cx, cy = spec["centre"]
    HALF = spec["half"]
    os.makedirs(OUT, exist_ok=True)

    # Measure this district's own grid before rotating anything by it.
    _ROT, _COS, _SIN = 0.0, 1.0, 0.0
    raw = load_buildings(cx, cy, HALF)
    bearing, strength = measure_bearing([b["ring"] for b in raw])
    GRID_BEARING_DEG = bearing
    _ROT = math.radians(bearing)
    _COS, _SIN = math.cos(_ROT), math.sin(_ROT)

    buildings = load_buildings(cx, cy, HALF)
    roads = load_roads(cx, cy, HALF)

    # The datum that puts this district on the engine's floor: the median base
    # of the real footprints in it. Recorded in the district file, never silent.
    global DATUM
    bases = sorted(b["base"] for b in buildings)
    DATUM = bases[len(bases) // 2] if bases else 0.0

    terrain = read_terrain()
    ground = []
    if terrain is not None:
        step = (HALF * 2.0) / GROUND_CELLS
        for j in range(GROUND_CELLS):
            row = []
            for i in range(GROUND_CELLS):
                px = cx - HALF + (i + 0.5) * step
                py = cy - HALF + (j + 0.5) * step
                row.append(round(terrain(px, py) - DATUM, 2))
            ground.append(row)

    rows = []
    for b in buildings:
        bx, by, w, d, ang = obb(b["ring"])
        rows.append({
            "id": b["id"],
            "centre": gd(bx - cx, by - cy, b["base"] - DATUM),
            "size": [round(w, 2), round(d, 2)],
            "height": round(b["h"], 2),
            # Godot rotates about Y; a bearing measured counter-clockwise from
            # east in a Z-up frame becomes a clockwise Y rotation there.
            # after the grid rotation almost every footprint is axis aligned,
            # which is what lets the engine use its untilted box builder
            "rot_y": round(-(ang + _ROT), 4),
            "ring": [gd(px - cx, py - cy) for px, py in b["ring"]],
        })

    crowns = load_crowns()
    crown_count = 0
    for b in buildings:
        c = crowns.get(b["id"])
        if not c:
            continue
        for row in crown_rows(b, c, cx, cy):
            rows.append(row)
            crown_count += 1

    landmarks = {}
    if os.path.exists(PROSPECTS):
        doc = json.load(open(PROSPECTS))
        for p in doc.get("prospects", []):
            if p.get("x") is None:
                continue
            if abs(p["x"] - cx) > HALF or abs(p["y"] - cy) > HALF:
                continue
            key = p["slug"].replace("-", "_")
            landmarks[key] = {
                "position": gd(p["x"] - cx, p["y"] - cy),
                "label": p["name"],
                "address": p["address"],
                "vertical": p["vertical"],
                "site": f"philly-sites/{p['slug']}/index.html",
            }
    # The surveyed footprint, NOT the projection origin. The two are 145 m
    # apart: the origin sits at 39.952583, -75.165222 while the survey puts
    # City Hall's own footprint centre at 39.952425, -75.163533, which is what
    # published coordinates for the building agree with. Pointing this landmark
    # at the origin sent anything that navigated to "city_hall" to the middle of
    # the road a block west of it.
    ch = next((b for b in buildings if b["id"] == 489794), None)
    ch_x, ch_y = (ch["cx"], ch["cy"]) if ch else (0.0, 0.0)
    landmarks["city_hall"] = {"position": gd(ch_x - cx, ch_y - cy),
                              "label": "City Hall",
                              "address": "1400 John F Kennedy Blvd",
                              "vertical": "Civic", "site": None,
                              "note": "surveyed footprint centre; the projection "
                                      "origin is 145 m west of it"}

    district = {
        "generated_by": "philly-3d/tools/export_godot.py",
        "source": "City of Philadelphia LI_BUILDING_FOOTPRINTS and Street_Centerline",
        "frame": {"up": "+Y", "east": "+X", "north": "-Z", "units": "metres",
                  "origin_note": "district centre; City Hall is at "
                                 + str(gd(-cx, -cy))},
        "world_half": HALF,
        "centre_enu": [cx, cy],
        "grid_bearing_deg": round(GRID_BEARING_DEG, 3),
        "grid_strength": round(strength, 3),
        "frame_note": "district rotated by grid_bearing_deg, measured from this "
                      "district's OWN street centrelines, so its streets align "
                      "to the Godot axes",
        "grid_strength_note": "share of footprint edge length this bearing brings "
                              "within 5 degrees of an axis. 1.0 would be a "
                              "perfect grid. A low value is a district that has "
                              "no single grid, so the engine's axis-aligned "
                              "systems will fit it loosely",
        "name": slug,
        "label": spec["label"],
        "spawn": (gd(spec["spawn_enu"][0] - cx, spec["spawn_enu"][1] - cy, 0)
                  if abs(spec["spawn_enu"][0] - cx) <= HALF
                  and abs(spec["spawn_enu"][1] - cy) <= HALF else gd(0, 0, 0)),
        "ground_datum_m": round(DATUM, 2),
        "ground_datum_note": "median base_elevation of the footprints in this "
                             "window, subtracted from every y so the district "
                             "sits on the engine's floor instead of thirteen "
                             "metres above it",
        "ground_grid": {
            "cells": GROUND_CELLS,
            "step_m": round((HALF * 2.0) / GROUND_CELLS, 2),
            "note": "terrain height per cell relative to ground_datum_m, "
                    "row-major from the south-west corner of the district, "
                    "in the district's pre-rotation frame",
            "z": ground,
        },
        "roads": roads,
        "landmarks": landmarks,
        "building_count": len(rows),
        "crown_count": crown_count,
        "crown_note": "rows flagged crown:true are published architectural height "
                      "stacked above the LiDAR-measured roof mass, from "
                      "data/philly-crowns.json; the measured mass is unchanged",
    }

    json.dump(district, open(os.path.join(OUT, f"{slug}_district.json"), "w"), indent=1)
    json.dump({"buildings": rows}, open(os.path.join(OUT, f"{slug}_buildings.json"), "w"),
              separators=(",", ":"))

    # how well did the rotation align things? a rowhouse city should snap hard
    off = []
    for r in rows:
        a = abs(math.degrees(r["rot_y"])) % 90.0
        off.append(min(a, 90.0 - a))
    off.sort()
    aligned = sum(1 for a in off if a < 5.0)
    print(f"grid: bearing {GRID_BEARING_DEG:+.2f} deg, strength {strength:.3f}; "
          f"{aligned}/{len(off)} footprints within 5 deg of an axis "
          f"({100*aligned/max(len(off),1):.0f}%), median offset {off[len(off)//2]:.2f} deg")
    if len(rows) >= MAX_BUILDINGS:
        print(f"   WARNING: hit the {MAX_BUILDINGS} building cap; this window is "
              f"truncated to the tallest, which deletes rowhouses")

    tallest = sorted(rows, key=lambda r: -r["height"])[:6]
    print(f"\n{spec['label']} ({slug}): {HALF*2:.0f} m square centred on ENU {(cx, cy)}")
    print(f"buildings: {len(rows)}   roads: {len(roads)}   landmarks: {len(landmarks)}")
    print(f"crown tiers: {crown_count} on {len(set(r['id'] for r in rows if r.get('crown')))} buildings")
    print("tallest in frame:")
    for t in tallest:
        print(f"   {t['height']:6.1f} m  {t['size'][0]:5.1f} x {t['size'][1]:5.1f} m  id {t['id']}")
    for f in (f"{slug}_district.json", f"{slug}_buildings.json"):
        print(f"   {f}: {os.path.getsize(os.path.join(OUT, f))/1024:.0f} KB")
    return len(rows), len(landmarks)


def main():
    total = 0
    for slug, spec in DISTRICTS.items():
        n, _ = export_one(slug, spec)
        total += n
    print(f"\n{len(DISTRICTS)} districts, {total} rows in total")


if __name__ == "__main__":
    main()
