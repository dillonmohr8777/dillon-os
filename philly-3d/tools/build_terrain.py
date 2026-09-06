#!/usr/bin/env python3
"""Build a terrain height field for Philadelphia out of the survey itself.

The building layer carries `base_elevation` per footprint: the ground level the
building stands on, in feet, on the same vertical datum as the LiDAR. That is
543,470 measured ground samples spread across the county - a digital elevation
model we already own, with no second source to fetch and no second projection
to reconcile.

Why this matters. The viewer drew its ground as a plane at z = 0 while every
building started at its own base elevation. In Center City the median base is
12 m, so every building floated twelve metres above the ground, and a player
walking at eye height stood in a pit looking up at their undersides.

Output: dist/philly-terrain.bin

    magic     8   b"PHLTERR1"
    nx, ny    8   uint32 grid size
    x0, y0    8   float32 south-west corner, local ENU metres
    cell      4   float32 metres per cell
    z0, zs    8   float32 decode: height = z0 + value * zs
    payload       zlib(uint16 little-endian, row-major from the south-west)

Cells with no sample are filled by nearest neighbour, then smoothed once, so
the surface is continuous everywhere inside the city limits. A `filled` count
is printed so the share of interpolated ground is never hidden.
"""
from __future__ import annotations

import json
import math
import os
import re
import struct
import sys
import time
import zlib

import numpy as np

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(HERE, "tools"))
from geo import to_local, FEET_TO_M                                # noqa: E402

SRC = os.environ.get("PHL_BUILDINGS",
                     "/home/user/work/phl-data/buildings.ndjson")
OUT = os.path.join(HERE, "dist")

CELL = 50.0          # metres. Terrain is smooth; the samples are not dense.
PAD = 4              # cells of margin around the sampled extent

_re_base = re.compile(rb'"base_elevation":([-0-9.]+|null)')
_re_first = re.compile(rb'"coordinates":\[\[\[([-0-9.]+),([-0-9.]+)\]')


def read_samples(path):
    """One ground sample per footprint: its first ring vertex and its base.

    The first vertex rather than the centroid, deliberately. Parsing every ring
    of 546,459 features costs minutes; the first vertex is on the building's own
    outline and is therefore on its own ground, which is all a 50 m cell needs.
    """
    xs, ys, zs = [], [], []
    n = skipped = 0
    with open(path, "rb") as fh:
        for line in fh:
            n += 1
            mb = _re_base.search(line)
            mc = _re_first.search(line)
            if not mb or not mc or mb.group(1) == b"null":
                skipped += 1
                continue
            lon = float(mc.group(1))
            lat = float(mc.group(2))
            x, y = to_local(lon, lat)
            xs.append(x)
            ys.append(y)
            zs.append(float(mb.group(1)) * FEET_TO_M)
    return (np.array(xs, dtype=np.float64), np.array(ys, dtype=np.float64),
            np.array(zs, dtype=np.float32), n, skipped)


def nearest_fill(grid, have):
    """Grow the sampled cells outward until every cell has a value.

    A jump-flood style dilation: repeatedly copy from any of the four
    neighbours that already has a value. Cheap, deterministic, and it produces
    a nearest-neighbour surface rather than a ring of zeros around the city.
    """
    rounds = 0
    while not have.all():
        rounds += 1
        filled_any = False
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            src = np.roll(np.roll(have, dy, axis=0), dx, axis=1)
            srcv = np.roll(np.roll(grid, dy, axis=0), dx, axis=1)
            take = src & ~have
            if take.any():
                grid[take] = srcv[take]
                have |= take
                filled_any = True
        if not filled_any or rounds > 4000:
            grid[~have] = float(np.median(grid[have])) if have.any() else 0.0
            have[:] = True
            break
    return rounds


def smooth(grid, passes=2):
    """A 3x3 box blur. The samples are per building, so a cell that happens to
    hold one tall foundation should not become a spike in the street."""
    for _ in range(passes):
        acc = np.zeros_like(grid)
        for dy in (-1, 0, 1):
            for dx in (-1, 0, 1):
                acc += np.roll(np.roll(grid, dy, axis=0), dx, axis=1)
        grid = acc / 9.0
    return grid


def main():
    t0 = time.time()
    os.makedirs(OUT, exist_ok=True)
    print(f"reading {SRC}", flush=True)
    xs, ys, zs, n_read, skipped = read_samples(SRC)
    print(f"  {n_read} features, {len(zs)} usable samples, {skipped} without a base",
          flush=True)

    x0 = math.floor(xs.min() / CELL) * CELL - PAD * CELL
    y0 = math.floor(ys.min() / CELL) * CELL - PAD * CELL
    nx = int(math.ceil((xs.max() - x0) / CELL)) + PAD
    ny = int(math.ceil((ys.max() - y0) / CELL)) + PAD

    ix = np.clip(((xs - x0) / CELL).astype(np.int64), 0, nx - 1)
    iy = np.clip(((ys - y0) / CELL).astype(np.int64), 0, ny - 1)
    flat = iy * nx + ix

    # Mean of the samples in each cell. A sum-and-count beats a sort here and
    # keeps one outlier foundation from setting a whole cell's height.
    total = np.bincount(flat, weights=zs.astype(np.float64), minlength=nx * ny)
    count = np.bincount(flat, minlength=nx * ny)
    have = count > 0
    grid = np.zeros(nx * ny, dtype=np.float64)
    grid[have] = total[have] / count[have]

    sampled = int(have.sum())
    grid = grid.reshape(ny, nx)
    have = have.reshape(ny, nx)
    rounds = nearest_fill(grid, have.copy())
    grid = smooth(grid)

    zmin = float(grid.min())
    zmax = float(grid.max())
    span = max(zmax - zmin, 1e-6)
    scale = span / 65535.0
    quant = np.clip(np.round((grid - zmin) / scale), 0, 65535).astype("<u2")
    err = float(np.abs(grid - (zmin + quant.astype(np.float64) * scale)).max())

    payload = zlib.compress(quant.tobytes(), 9)
    path = os.path.join(OUT, "philly-terrain.bin")
    with open(path, "wb") as fh:
        fh.write(b"PHLTERR1")
        fh.write(struct.pack("<II", nx, ny))
        fh.write(struct.pack("<ff", x0, y0))
        fh.write(struct.pack("<f", CELL))
        fh.write(struct.pack("<ff", zmin, scale))
        fh.write(payload)

    print(f"grid {nx} x {ny} at {CELL:.0f} m  "
          f"({nx * CELL / 1000:.1f} x {ny * CELL / 1000:.1f} km)")
    print(f"sampled cells {sampled} of {nx * ny} "
          f"({100 * sampled / (nx * ny):.1f}%), filled by nearest neighbour in "
          f"{rounds} rounds")
    print(f"elevation {zmin:.2f} to {zmax:.2f} m, quantisation error <= {err * 100:.3f} cm")
    print(f"{os.path.getsize(path) / 1024:.0f} KB in {time.time() - t0:.0f}s -> {path}")


if __name__ == "__main__":
    main()
