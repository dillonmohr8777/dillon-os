#!/usr/bin/env python3
"""Distance-graded export for the Blender scene.

Every byte of Blender geometry has to travel inside a Python source string, so
we only send what actually forms the image:

    within 1.5 km of City Hall   every building, the dense foreground fabric
    1.5 - 3.0 km                 buildings 12 m and taller
    3.0 - 5.5 km                 buildings 25 m and taller, distant skyline

Anything dropped is a low building far enough away to be hidden behind the row
in front of it. The full 545k-building set still ships to the web viewer, which
reads the binary directly and has no transport limit.
"""
from __future__ import annotations

import base64
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

BIN = os.path.join(HERE, "dist", "philly-buildings.bin")
OUT = os.path.join(HERE, "dist", "lod")
MAX_PAYLOAD = 248_000

LOD = [(1.5, 0.0), (3.0, 12.0), (5.5, 25.0)]


def unpack_tile(raw):
    o = 0
    n = int(np.frombuffer(raw, "<u4", 1, o)[0]); o += 4
    ids = np.cumsum(np.frombuffer(raw, "<u4", n, o).astype(np.int64)); o += 4 * n
    h = np.frombuffer(raw, "<u2", n, o).copy(); o += 2 * n
    b = np.frombuffer(raw, "<i2", n, o).copy(); o += 2 * n
    fl = np.frombuffer(raw, "u1", n, o).copy(); o += n
    npts = np.frombuffer(raw, "u1", n, o).astype(np.int64); o += n
    tot = int(npts.sum())
    xd = np.frombuffer(raw, "<i2", tot, o).astype(np.int64).copy(); o += 2 * tot
    yd = np.frombuffer(raw, "<i2", tot, o).astype(np.int64).copy(); o += 2 * tot
    assert o == len(raw), "trailing bytes in tile"
    starts = np.concatenate([[0], np.cumsum(npts)])[:-1]
    xd[starts] += 32768
    yd[starts] += 32768
    cx = np.cumsum(xd); cy = np.cumsum(yd)
    px = np.where(starts > 0, cx[starts - 1], 0)
    py = np.where(starts > 0, cy[starts - 1], 0)
    qx = (cx - np.repeat(px, npts)).astype(np.uint16)
    qy = (cy - np.repeat(py, npts)).astype(np.uint16)
    return ids, h, b, fl, npts, starts, qx, qy


def main():
    data = open(BIN, "rb").read()
    ntiles, _ = struct.unpack_from("<II", data, 40)
    idx = pack.HEADER_SIZE
    pay = idx + ntiles * pack.INDEX_ENTRY

    os.makedirs(OUT, exist_ok=True)
    for f in os.listdir(OUT):
        os.remove(os.path.join(OUT, f))

    kept_tiles = []
    n_in = n_keep = 0
    for i in range(ntiles):
        tx, ty, cnt, off, ln = struct.unpack_from("<iiIII", data, idx + i * pack.INDEX_ENTRY)
        cxk = (tx + 0.5) * pack.TILE_SIZE / 1000.0
        cyk = (ty + 0.5) * pack.TILE_SIZE / 1000.0
        tile_r = math.hypot(cxk, cyk) - 0.73          # nearest corner, roughly
        if tile_r > LOD[-1][0]:
            continue
        ids, h, b, fl, npts, starts, qx, qy = unpack_tile(
            zlib.decompress(data[pay + off:pay + off + ln]))
        n_in += len(ids)

        bx = (np.add.reduceat(qx.astype(np.float64), starts) / npts) * pack.QUANT \
            + pack.COORD_OFFSET + tx * pack.TILE_SIZE
        by = (np.add.reduceat(qy.astype(np.float64), starts) / npts) * pack.QUANT \
            + pack.COORD_OFFSET + ty * pack.TILE_SIZE
        d_km = np.hypot(bx, by) / 1000.0
        h_m = h.astype(np.float64) / 10.0

        keep = np.zeros(len(ids), dtype=bool)
        for r, hmin in LOD:
            keep |= (d_km <= r) & (h_m >= hmin)
        if not keep.any():
            continue

        sel = np.flatnonzero(keep)
        take = np.concatenate([np.arange(starts[j], starts[j] + npts[j]) for j in sel])
        blob = pack.pack_tile(ids[sel], h[sel], b[sel], fl[sel], npts[sel],
                              qx[take], qy[take])
        kept_tiles.append({"tx": int(tx), "ty": int(ty), "n": int(len(sel)),
                           "r": float(max(abs(cxk), abs(cyk))),
                           "b85": base64.b85encode(blob).decode("ascii")})
        n_keep += len(sel)

    kept_tiles.sort(key=lambda t: t["r"])            # centre-out
    chunks, cur, cur_len = [], [], 0
    for t in kept_tiles:
        if cur and cur_len + len(t["b85"]) > MAX_PAYLOAD:
            chunks.append(cur); cur, cur_len = [], 0
        cur.append(t); cur_len += len(t["b85"])
    if cur:
        chunks.append(cur)

    meta = []
    for i, c in enumerate(chunks):
        json.dump(c, open(os.path.join(OUT, "chunk-%02d.json" % i), "w"),
                  separators=(",", ":"))
        meta.append({"index": i, "tiles": len(c),
                     "buildings": sum(t["n"] for t in c),
                     "b85_chars": sum(len(t["b85"]) for t in c)})
    json.dump({"lod": LOD, "chunks": meta, "buildings": n_keep,
               "considered": n_in}, open(os.path.join(OUT, "chunks.json"), "w"), indent=2)

    print("LOD rule: " + ", ".join("<=%.1fkm h>=%.0fm" % (r, h) for r, h in LOD))
    print("considered %d buildings -> kept %d (%.1f%%) in %d tiles"
          % (n_in, n_keep, 100 * n_keep / max(n_in, 1), len(kept_tiles)))
    print("%d chunks:" % len(chunks))
    for m in meta:
        print("  chunk %2d  tiles %3d  buildings %6d  chars %7d"
              % (m["index"], m["tiles"], m["buildings"], m["b85_chars"]))


if __name__ == "__main__":
    main()
