"""PHLCITY1 — a tiled, quantized binary format for city building massing.

Why a custom format: 546k real footprints is too much JSON for a browser and
too much churn for a git repo. Tiling gives frustum culling and streaming for
free; struct-of-arrays inside each tile makes zlib do real work; 16-bit
tile-local coordinates cost 4 bytes per point at 3 cm precision, which is well
under the 25 cm simplification tolerance the footprints already went through.

Layout (little-endian) is documented in docs/FORMAT.md and asserted by
test/format.test.js so the JS reader and this writer cannot drift apart.
"""
from __future__ import annotations

import struct
import zlib

import numpy as np

MAGIC = b"PHLCITY2"
VERSION = 2
TILE_SIZE = 1024.0        # metres
QUANT = 1.0 / 32.0        # metres per quantum -> 3.125 cm
COORD_OFFSET = -512.0     # tile-local coords span [-512, +1536] m
HEADER_SIZE = 64
INDEX_ENTRY = 20

FLAG_NAMED = 1
FLAG_LANDMARK = 2
FLAG_POI = 4
FLAG_TALL = 8


def quantize(v: np.ndarray) -> np.ndarray:
    """Tile-local metres -> uint16 quanta, clamped to the representable span."""
    q = np.rint((v - COORD_OFFSET) / QUANT)
    return np.clip(q, 0, 65535).astype(np.uint16)


def dequantize(q: np.ndarray) -> np.ndarray:
    return q.astype(np.float64) * QUANT + COORD_OFFSET


def delta_rings(coords, npts):
    """Per-ring delta code: first point absolute, the rest as int16 steps.

    Ring vertices are neighbours a few metres apart, so the deltas are tiny and
    highly repetitive (Philadelphia rowhouses are rectangles). Measured on real
    tiles this is ~18% smaller after zlib than storing absolute coordinates,
    and it costs the reader one running sum.
    """
    out = np.empty(len(coords), dtype="<i2")
    o = 0
    for n in npts:
        seg = coords[o:o + n].astype(np.int32)
        out[o] = seg[0] - 32768                 # absolute, biased into int16
        if n > 1:
            out[o + 1:o + n] = np.diff(seg)
        o += n
    return out


def undelta_rings(deltas, npts):
    """Inverse of delta_rings; the JS reader mirrors this exactly."""
    out = np.empty(len(deltas), dtype=np.int32)
    o = 0
    for n in npts:
        seg = deltas[o:o + n].astype(np.int32)
        seg[0] += 32768
        out[o:o + n] = np.cumsum(seg)
        o += n
    return out.astype(np.uint16)


def pack_tile(ids, height_dm, base_dm, flags, npts, xs, ys) -> bytes:
    order = np.argsort(np.asarray(ids, dtype=np.int64), kind="stable")
    ids = np.asarray(ids, dtype=np.int64)[order]
    npts_a = np.asarray(npts, dtype=np.int64)
    starts = np.concatenate([[0], np.cumsum(npts_a)])[:-1]
    pick = np.concatenate([np.arange(starts[i], starts[i] + npts_a[i]) for i in order]) \
        if len(order) else np.array([], dtype=np.int64)

    npts_s = npts_a[order]
    xs_s = np.asarray(xs, dtype=np.uint16)[pick]
    ys_s = np.asarray(ys, dtype=np.uint16)[pick]

    id_delta = np.empty(len(ids), dtype="<u4")
    if len(ids):
        id_delta[0] = ids[0]
        id_delta[1:] = np.diff(ids)

    body = b"".join([
        struct.pack("<I", len(ids)),
        id_delta.tobytes(),
        np.asarray(height_dm, dtype="<u2")[order].tobytes(),
        np.asarray(base_dm, dtype="<i2")[order].tobytes(),
        np.asarray(flags, dtype="u1")[order].tobytes(),
        npts_s.astype("u1").tobytes(),
        delta_rings(xs_s, npts_s).tobytes(),
        delta_rings(ys_s, npts_s).tobytes(),
    ])
    return zlib.compress(body, 9)


def write(path, origin_lat, origin_lon, tiles):
    """tiles: dict[(tx, ty)] -> packed bytes from pack_tile, plus counts."""
    keys = sorted(tiles.keys())
    txs = [k[0] for k in keys] or [0]
    tys = [k[1] for k in keys] or [0]
    total_b = sum(t["count"] for t in tiles.values())

    header = bytearray(HEADER_SIZE)
    header[0:8] = MAGIC
    struct.pack_into("<II", header, 8, VERSION, 0)
    struct.pack_into("<dd", header, 16, origin_lat, origin_lon)
    struct.pack_into("<ff", header, 32, TILE_SIZE, QUANT)
    struct.pack_into("<II", header, 40, len(keys), total_b)
    struct.pack_into("<iiii", header, 48, min(txs), min(tys), max(txs), max(tys))

    index = bytearray()
    payload = bytearray()
    for tx, ty in keys:
        t = tiles[(tx, ty)]
        blob = t["blob"]
        index += struct.pack("<iiIII", tx, ty, t["count"], len(payload), len(blob))
        payload += blob

    with open(path, "wb") as fh:
        fh.write(header)
        fh.write(index)
        fh.write(payload)
    return HEADER_SIZE + len(index) + len(payload)
