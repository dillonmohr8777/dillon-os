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

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(HERE, "tools"))
import pack                                                        # noqa: E402
from geo import to_local, FEET_TO_M                                # noqa: E402

BIN = os.path.join(HERE, "data", "philly-buildings.bin")
CROWNS = os.path.join(HERE, "data", "philly-crowns.json")
PROSPECTS = os.path.join(HERE, "data", "philly-prospects.json")
STREETS = os.environ.get("PHL_STREETS", "/home/user/work/phl-data/streets.ndjson")
OUT = os.path.join(HERE, "dist", "godot")

# Centre City around Market and 12th, which puts Reading Terminal, City Hall
# and the Market Street corridor inside one district.
CENTRE = (-40.0, -20.0)
HALF = 420.0                    # metres; the shipped GTB district is 124
MAX_BUILDINGS = 4000

# Penn's grid runs 9.21 degrees off cardinal, measured from the city's own
# street centrelines. The engine's kit.box takes no yaw and its road constants
# are axis-aligned, so the whole district is rotated by that bearing on the way
# out. Market and Chestnut then run along X, the numbered streets along Z, and
# every existing system - traffic lanes, pedestrian routes, minimap, window
# punching - keeps working untouched.
GRID_BEARING_DEG = 9.21
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
            "centre": gd(ox - base_cx, oy - base_cy, z),
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


def main():
    cx, cy = CENTRE
    os.makedirs(OUT, exist_ok=True)

    buildings = load_buildings(cx, cy, HALF)
    roads = load_roads(cx, cy, HALF)

    rows = []
    for b in buildings:
        bx, by, w, d, ang = obb(b["ring"])
        rows.append({
            "id": b["id"],
            "centre": gd(bx - cx, by - cy, b["base"]),
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
    landmarks["city_hall"] = {"position": gd(-cx, -cy), "label": "City Hall",
                              "address": "1400 John F Kennedy Blvd",
                              "vertical": "Civic", "site": None}

    district = {
        "generated_by": "philly-3d/tools/export_godot.py",
        "source": "City of Philadelphia LI_BUILDING_FOOTPRINTS and Street_Centerline",
        "frame": {"up": "+Y", "east": "+X", "north": "-Z", "units": "metres",
                  "origin_note": "district centre; City Hall is at "
                                 + str(gd(-cx, -cy))},
        "world_half": HALF,
        "centre_enu": [cx, cy],
        "grid_bearing_deg": GRID_BEARING_DEG,
        "frame_note": "district rotated by grid_bearing_deg so Penn's streets "
                      "align to the Godot axes",
        "spawn": gd(900 - cx, -142 - cy, 0) if abs(900 - cx) <= HALF else gd(0, 0, 0),
        "roads": roads,
        "landmarks": landmarks,
        "building_count": len(rows),
        "crown_count": crown_count,
        "crown_note": "rows flagged crown:true are published architectural height "
                      "stacked above the LiDAR-measured roof mass, from "
                      "data/philly-crowns.json; the measured mass is unchanged",
    }

    json.dump(district, open(os.path.join(OUT, "philadelphia_district.json"), "w"), indent=1)
    json.dump({"buildings": rows}, open(os.path.join(OUT, "philadelphia_buildings.json"), "w"),
              separators=(",", ":"))

    # how well did the rotation align things? a rowhouse city should snap hard
    off = []
    for r in rows:
        a = abs(math.degrees(r["rot_y"])) % 90.0
        off.append(min(a, 90.0 - a))
    off.sort()
    aligned = sum(1 for a in off if a < 5.0)
    print(f"grid alignment: {aligned}/{len(off)} footprints within 5 deg of an axis "
          f"({100*aligned/max(len(off),1):.0f}%), median offset {off[len(off)//2]:.2f} deg")

    tallest = sorted(rows, key=lambda r: -r["height"])[:6]
    print(f"district: {HALF*2:.0f} m square centred on ENU {CENTRE}")
    print(f"buildings: {len(rows)}   roads: {len(roads)}   landmarks: {len(landmarks)}")
    print(f"crown tiers: {crown_count} on {len(set(r['id'] for r in rows if r.get('crown')))} buildings")
    print("tallest in frame:")
    for t in tallest:
        print(f"   {t['height']:6.1f} m  {t['size'][0]:5.1f} x {t['size'][1]:5.1f} m  id {t['id']}")
    for f in ("philadelphia_district.json", "philadelphia_buildings.json"):
        print(f"   {f}: {os.path.getsize(os.path.join(OUT, f))/1024:.0f} KB")


if __name__ == "__main__":
    main()
