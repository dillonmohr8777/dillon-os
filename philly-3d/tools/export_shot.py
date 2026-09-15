#!/usr/bin/env python3
"""Export just the buildings a given camera can see, for one Blender shot.

Sending the whole city to Blender is wasteful: geometry has to travel inside a
Python source string, and a 40-degree lens looking down Market Street sees a
wedge, not a disc. This culls to the view frustum and grades detail by
distance, which turns a 13-call transfer into one or two.
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
MAX_PAYLOAD = 26_000        # tool output truncates somewhere above 29 KB


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
    starts = np.concatenate([[0], np.cumsum(npts)])[:-1]
    xd[starts] += 32768
    yd[starts] += 32768
    cx = np.cumsum(xd); cy = np.cumsum(yd)
    px = np.where(starts > 0, cx[starts - 1], 0)
    py = np.where(starts > 0, cy[starts - 1], 0)
    return (ids, h, b, fl, npts, starts,
            (cx - np.repeat(px, npts)).astype(np.uint16),
            (cy - np.repeat(py, npts)).astype(np.uint16))


def export(name, eye, target, fov_deg=40.0, aspect=16 / 9, far=6000.0,
           near_all=900.0, mid=(2500.0, 12.0), far_lod=(6000.0, 28.0),
           side_margin_deg=7.0):
    data = open(BIN, "rb").read()
    ntiles, _ = struct.unpack_from("<II", data, 40)
    idx = pack.HEADER_SIZE
    pay = idx + ntiles * pack.INDEX_ENTRY

    ex, ey = eye[0], eye[1]
    fx, fy = target[0] - ex, target[1] - ey
    fl = math.hypot(fx, fy)
    fx, fy = fx / fl, fy / fl
    half_v = math.radians(fov_deg) / 2
    half_h = math.atan(math.tan(half_v) * aspect)
    cos_limit_base = half_h + math.radians(side_margin_deg)

    kept = []
    n_seen = n_keep = 0
    for i in range(ntiles):
        tx, ty, cnt, off, ln = struct.unpack_from("<iiIII", data, idx + i * pack.INDEX_ENTRY)
        # cheap tile reject: nearest point of the tile square to the eye
        tx0, ty0 = tx * pack.TILE_SIZE, ty * pack.TILE_SIZE
        nx = min(max(ex, tx0), tx0 + pack.TILE_SIZE)
        ny = min(max(ey, ty0), ty0 + pack.TILE_SIZE)
        if math.hypot(nx - ex, ny - ey) > far + 800:
            continue
        ids, h, b, flg, npts, starts, qx, qy = unpack_tile(
            zlib.decompress(data[pay + off:pay + off + ln]))
        n_seen += len(ids)

        bx = (np.add.reduceat(qx.astype(np.float64), starts) / npts) * pack.QUANT \
            + pack.COORD_OFFSET + tx0
        by = (np.add.reduceat(qy.astype(np.float64), starts) / npts) * pack.QUANT \
            + pack.COORD_OFFSET + ty0
        vx, vy = bx - ex, by - ey
        d = np.hypot(vx, vy)
        d[d == 0] = 1e-6
        ang = np.arccos(np.clip((vx * fx + vy * fy) / d, -1, 1))
        # a building has width, so allow more angular slack when it is close
        slack = np.arctan(40.0 / np.maximum(d, 40.0))
        in_wedge = ang <= (cos_limit_base + slack)

        h_m = h.astype(np.float64) / 10.0
        lod = ((d <= near_all)
               | ((d <= mid[0]) & (h_m >= mid[1]))
               | ((d <= far_lod[0]) & (h_m >= far_lod[1])))
        keep = in_wedge & lod & (d <= far)
        if not keep.any():
            continue
        sel_all = np.flatnonzero(keep)
        # A single dense tile can exceed the payload budget on its own, so split
        # it into as many parts as needed. Parts keep the same tile index; the
        # reader treats every entry independently.
        parts = 1
        while True:
            groups = np.array_split(sel_all, parts)
            blobs = []
            for g in groups:
                if not len(g):
                    continue
                take = np.concatenate([np.arange(starts[j], starts[j] + npts[j]) for j in g])
                blobs.append((g, pack.pack_tile(ids[g], h[g], b[g], flg[g], npts[g],
                                                qx[take], qy[take])))
            if all(len(base64.b85encode(bl)) <= MAX_PAYLOAD for _, bl in blobs) or parts > 24:
                break
            parts += 1
        for g, bl in blobs:
            kept.append({"tx": int(tx), "ty": int(ty), "n": int(len(g)),
                         "d": float(np.median(d[g])),
                         "b85": base64.b85encode(bl).decode("ascii")})
        n_keep += len(sel_all)

    kept.sort(key=lambda t: t["d"])
    out = os.path.join(HERE, "dist", "shots", name)
    os.makedirs(out, exist_ok=True)
    for f in os.listdir(out):
        os.remove(os.path.join(out, f))

    chunks, cur, cur_len = [], [], 0
    for t in kept:
        if cur and cur_len + len(t["b85"]) > MAX_PAYLOAD:
            chunks.append(cur); cur, cur_len = [], 0
        cur.append(t); cur_len += len(t["b85"])
    if cur:
        chunks.append(cur)
    for i, c in enumerate(chunks):
        json.dump(c, open(os.path.join(out, "c%02d.json" % i), "w"),
                  separators=(",", ":"))

    meta = {"name": name, "eye": list(eye), "target": list(target),
            "fov_deg": fov_deg, "far": far,
            "considered": n_seen, "kept": n_keep, "tiles": len(kept),
            "chunks": [{"i": i, "tiles": len(c), "n": sum(t["n"] for t in c),
                        "chars": sum(len(t["b85"]) for t in c)}
                       for i, c in enumerate(chunks)]}
    json.dump(meta, open(os.path.join(out, "meta.json"), "w"), indent=2)
    print(f"{name}: considered {n_seen}, kept {n_keep} in {len(kept)} tiles, "
          f"{len(chunks)} chunks")
    for c in meta["chunks"]:
        print(f"   chunk {c['i']}: {c['n']:>6} buildings, {c['chars']:>6} chars")
    return meta


if __name__ == "__main__":
    export("henge", (2050, -330, 26), (-2600, 420, 150), fov_deg=38, far=5200)
