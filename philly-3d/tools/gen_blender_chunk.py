#!/usr/bin/env python3
"""Emit the run_python source that loads one chunk of buildings into Blender.

The payload is the same zlib tile blob that lives in philly-buildings.bin,
base85-encoded. The reader below mirrors pack.py exactly, so the file format
and the wire format cannot drift.

Geometry per building: a bottom ring, a top ring, one quad per wall edge, and
a single n-gon roof. Blender triangulates n-gons itself, which keeps L-shaped
roofs correct without shipping an ear-clipper.
"""
from __future__ import annotations

import json
import os
import sys

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHUNKS = os.path.join(HERE, "dist", "lod")

READER = '''"""Philadelphia LiDAR City - building chunk {idx} of {total}.

{nb} real building footprints from the City of Philadelphia
LI_BUILDING_FOOTPRINTS layer, extruded to their LiDAR-measured heights.
"""
import bpy, base64, zlib, numpy as np

QUANT = {quant!r}
COORD_OFFSET = {coff!r}
TILE_SIZE = {tsize!r}
GLASS_MIN_M = 45.0          # above this a building is treated as curtain wall

TILES = {tiles}

LINK = bpy.context.scene.collection.objects.link

# Slot order is fixed so every chunk mesh indexes materials identically:
# 0-7 masonry, 8-10 curtain wall, 11-12 roof.
SLOTS = ["phl_brick_deep", "phl_brick_red", "phl_brick_mid", "phl_brick_warm",
         "phl_brown_stone", "phl_stone_buff", "phl_stone_pale", "phl_stucco_grey",
         "phl_glass_blue", "phl_glass_green", "phl_glass_bronze",
         "phl_roof_tar", "phl_roof_gravel"]
MATS = [bpy.data.materials[s] for s in SLOTS]
N_MASONRY, N_GLASS = 8, 3

report = {{"tiles": [], "buildings": 0, "verts": 0, "faces": 0}}

for tile in TILES:
    raw = zlib.decompress(base64.b85decode(tile["b85"]))
    o = 0
    n = int(np.frombuffer(raw, "<u4", 1, o)[0]); o += 4
    o += 4 * n                                        # ids, not needed for geometry
    h_dm = np.frombuffer(raw, "<u2", n, o).astype(np.float64); o += 2 * n
    b_dm = np.frombuffer(raw, "<i2", n, o).astype(np.float64); o += 2 * n
    o += n                                            # flags
    npts = np.frombuffer(raw, "u1", n, o).astype(np.int64); o += n
    tot = int(npts.sum())
    xd = np.frombuffer(raw, "<i2", tot, o).astype(np.int64).copy(); o += 2 * tot
    yd = np.frombuffer(raw, "<i2", tot, o).astype(np.int64).copy(); o += 2 * tot

    starts = np.concatenate([[0], np.cumsum(npts)])[:-1]
    xd[starts] += 32768
    yd[starts] += 32768
    cx = np.cumsum(xd); cy = np.cumsum(yd)
    prev_x = np.where(starts > 0, cx[starts - 1], 0)
    prev_y = np.where(starts > 0, cy[starts - 1], 0)
    qx = cx - np.repeat(prev_x, npts)
    qy = cy - np.repeat(prev_y, npts)

    X = qx * QUANT + COORD_OFFSET + tile["tx"] * TILE_SIZE
    Y = qy * QUANT + COORD_OFFSET + tile["ty"] * TILE_SIZE
    Zb = np.repeat(b_dm * 0.1, npts)
    Zt = np.repeat((b_dm + h_dm) * 0.1, npts)

    rep_starts = np.repeat(starts, npts)
    rep_npts = np.repeat(npts, npts)
    local = np.arange(tot) - rep_starts

    # Normalise winding to counter-clockwise so wall quads face outward and
    # roof n-gons face +Z. Shoelace per ring, vectorised.
    nxt = rep_starts + (local + 1) % rep_npts
    cross = X * Y[nxt] - X[nxt] * Y
    twice_area = np.add.reduceat(cross, starts)
    flip = np.repeat(twice_area < 0, npts)
    if flip.any():
        idx = np.arange(tot)
        rev = rep_starts + rep_npts - 1 - local
        take = np.where(flip, rev, idx)
        X, Y = X[take], Y[take]

    vbase = np.concatenate([[0], np.cumsum(2 * npts)])[:-1]
    rep_vbase = np.repeat(vbase, npts)
    nv = 2 * tot
    co = np.empty((nv, 3), dtype=np.float32)
    bot = rep_vbase + local
    top = bot + rep_npts
    co[bot, 0] = X; co[bot, 1] = Y; co[bot, 2] = Zb
    co[top, 0] = X; co[top, 1] = Y; co[top, 2] = Zt

    nb_next = rep_vbase + (local + 1) % rep_npts
    nt_next = nb_next + rep_npts

    walls = np.empty((tot, 4), dtype=np.int32)
    walls[:, 0] = bot; walls[:, 1] = nb_next; walls[:, 2] = nt_next; walls[:, 3] = top

    nfaces = tot + n
    loop_total = np.empty(nfaces, dtype=np.int32)
    loop_total[:tot] = 4
    loop_total[tot:] = npts
    loop_start = np.concatenate([[0], np.cumsum(loop_total)])[:-1].astype(np.int32)
    loops = np.concatenate([walls.ravel(), top]).astype(np.int32)

    me = bpy.data.meshes.new("phl_c{idx}_%d_%d" % (tile["tx"], tile["ty"]))
    me.vertices.add(nv); me.vertices.foreach_set("co", co.ravel())
    me.loops.add(len(loops)); me.loops.foreach_set("vertex_index", loops)
    me.polygons.add(nfaces)
    me.polygons.foreach_set("loop_start", loop_start)
    me.polygons.foreach_set("loop_total", loop_total)
    me.update(calc_edges=True)

    for m in MATS:
        me.materials.append(m)

    # Deterministic hash per building: the fabric varies, renders reproduce.
    seed = (np.arange(n, dtype=np.int64) * 2654435761
            + tile["tx"] * 40503 + tile["ty"] * 12289) & 0x7FFFFFFF
    h_m = h_dm * 0.1
    is_glass = h_m >= GLASS_MIN_M
    # Taller masonry skews to stone, low rowhouses to brick: index the palette
    # by height as well as hash so the city reads the way it actually looks.
    lean = np.clip((h_m - 6.0) / 26.0, 0.0, 1.0) * 3.0
    wall = np.where(
        is_glass,
        N_MASONRY + (seed % N_GLASS),
        np.clip(((seed >> 7) % N_MASONRY + lean.astype(np.int64)), 0, N_MASONRY - 1))
    roof_slot = 11 + ((seed >> 13) & 1)

    midx = np.empty(nfaces, dtype=np.int32)
    midx[:tot] = np.repeat(wall, npts)
    midx[tot:] = roof_slot
    me.polygons.foreach_set("material_index", midx)

    me.validate()
    LINK(bpy.data.objects.new(me.name, me))
    report["tiles"].append({{"tx": tile["tx"], "ty": tile["ty"], "n": int(n),
                            "verts": int(nv), "faces": int(nfaces)}})
    report["buildings"] += int(n)
    report["verts"] += int(nv)
    report["faces"] += int(nfaces)

result = report
'''


def build(idx):
    meta = json.load(open(os.path.join(CHUNKS, "chunks.json")))
    tiles = json.load(open(os.path.join(CHUNKS, "chunk-%02d.json" % idx)))
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    import pack
    code = READER.format(
        idx=idx, total=len(meta["chunks"]),
        nb=sum(t["n"] for t in tiles),
        quant=pack.QUANT, coff=pack.COORD_OFFSET, tsize=pack.TILE_SIZE,
        tiles=json.dumps(tiles, separators=(",", ":")),
    )
    out = os.path.join(CHUNKS, "code-%02d.py" % idx)
    open(out, "w").write(code)
    return out, len(code)


if __name__ == "__main__":
    meta = json.load(open(os.path.join(CHUNKS, "chunks.json")))
    biggest = 0
    for i in range(len(meta["chunks"])):
        p, ln = build(i)
        biggest = max(biggest, ln)
        print("chunk %2d -> %s  %7d chars" % (i, os.path.basename(p), ln))
    print("\nlargest generated call: %d chars (cap 262144, headroom %d)"
          % (biggest, 262144 - biggest))
