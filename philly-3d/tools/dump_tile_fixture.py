#!/usr/bin/env python3
"""Write a decode fixture so the JavaScript reader can be checked against the
Python packer rather than against its own assumptions.

Run after rebuilding the dataset:
    python3 tools/dump_tile_fixture.py
"""
from __future__ import annotations

import json
import os
import struct
import sys
import zlib

import numpy as np

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(HERE, "tools"))
import pack                                                        # noqa: E402

BIN = os.path.join(HERE, "data", "philly-buildings.bin")
OUT = os.path.join(HERE, "test", "fixtures", "tile-0-0.json")
TX, TY = 0, 0


def main():
    data = open(BIN, "rb").read()
    ntiles, _ = struct.unpack_from("<II", data, 40)
    idx = pack.HEADER_SIZE
    pay = idx + ntiles * pack.INDEX_ENTRY
    blob = None
    for i in range(ntiles):
        tx, ty, cnt, off, ln = struct.unpack_from("<iiIII", data, idx + i * pack.INDEX_ENTRY)
        if (tx, ty) == (TX, TY):
            blob = data[pay + off:pay + off + ln]
            break
    if blob is None:
        raise SystemExit(f"tile {TX},{TY} not in {BIN}")

    raw = zlib.decompress(blob)
    o = 0
    n = int(np.frombuffer(raw, "<u4", 1, o)[0]); o += 4 + 4 * n
    h = np.frombuffer(raw, "<u2", n, o).astype(np.float64) * 0.1; o += 2 * n
    b = np.frombuffer(raw, "<i2", n, o).astype(np.float64) * 0.1; o += 2 * n
    r = np.frombuffer(raw, "<u2", n, o).astype(np.float64) * 0.1; o += 2 * n
    o += n
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
    X = (cx - np.repeat(px, npts)) * pack.QUANT + pack.COORD_OFFSET + TX * pack.TILE_SIZE
    Y = (cy - np.repeat(py, npts)) * pack.QUANT + pack.COORD_OFFSET + TY * pack.TILE_SIZE

    step = max(1, n // 120)
    sample = [{"i": int(i), "x": round(float(X[starts[i]]), 4),
               "y": round(float(Y[starts[i]]), 4),
               "h": round(float(h[i]), 4), "b": round(float(b[i]), 4),
               "r": round(float(r[i]), 4),
               "npts": int(npts[i])}
              for i in range(0, n, step)]

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    json.dump({"tx": TX, "ty": TY, "n": int(n), "total_points": tot,
               "generated_by": "tools/dump_tile_fixture.py", "sample": sample},
              open(OUT, "w"), indent=1)
    print(f"wrote {OUT}: {n} buildings, {len(sample)} sampled")


if __name__ == "__main__":
    main()
