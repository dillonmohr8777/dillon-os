"""Cast shadows for a directional light over a city height field.

A brute-force ray march is hopeless here: at the Phillyhenge sun elevation of
3.9 degrees a 300 m tower throws a 4.4 km shadow, so every face would need
thousands of samples.

Instead this does a single horizon sweep. Marching one cell away from the sun,
the top of any existing shadow drops by exactly cell_size * tan(elevation), so
the shadow ceiling at each cell is

    ceiling[n] = max(height[n], ceiling[n-1] - drop)

which is one running maximum across the grid. The sweep is vectorised along the
axis perpendicular to the sun and sheared row by row to follow the true solar
azimuth, so it costs one pass instead of thousands.
"""
from __future__ import annotations

import math

import numpy as np


def build_height_field(polys, heights, bounds, cell=4.0):
    """Rasterise building footprints into a height grid.

    polys: list of (xs, ys) arrays. heights: absolute roof height, metres.
    Drawn tallest last so overlaps keep the taller roof.
    """
    from PIL import Image, ImageDraw

    x0, y0, x1, y1 = bounds
    W = int(math.ceil((x1 - x0) / cell))
    H = int(math.ceil((y1 - y0) / cell))
    img = Image.new("F", (W, H), 0.0)
    d = ImageDraw.Draw(img)
    order = np.argsort(heights)
    for i in order:
        xs, ys = polys[i]
        px = (xs - x0) / cell
        py = (ys - y0) / cell
        d.polygon(list(zip(px.tolist(), py.tolist())), fill=float(heights[i]))
    return np.asarray(img, dtype=np.float32), (x0, y0, cell, W, H)


def shadow_ceiling(height, cell, sun_elev_deg, sun_az_deg):
    """Max shadow height at every cell, from one sweep away from the sun."""
    el = math.radians(sun_elev_deg)
    az = math.radians(sun_az_deg)
    # unit vector pointing AWAY from the sun in the XY plane, in grid axes
    # (+x east = column, +y north = row)
    sx, sy = -math.sin(az), -math.cos(az)

    if abs(sx) >= abs(sy):
        major, minor = 1, 0                 # sweep along columns
        step_c = 1 if sx > 0 else -1
        slope = sy / abs(sx)                # rows per column
        n = height.shape[1]
    else:
        major, minor = 0, 1                 # sweep along rows
        step_c = 1 if sy > 0 else -1
        slope = sx / abs(sy)
        n = height.shape[0]

    drop = cell * math.tan(el) / math.cos(math.atan(slope))
    work = height if major == 1 else height.T
    out = np.empty_like(work)

    idx = range(work.shape[1]) if step_c > 0 else range(work.shape[1] - 1, -1, -1)
    idx = list(idx)
    prev = work[:, idx[0]].copy()
    out[:, idx[0]] = prev
    for k in range(1, len(idx)):
        c = idx[k]
        shift = int(round(slope * k)) - int(round(slope * (k - 1)))
        if shift:
            prev = np.roll(prev, shift * step_c)
        prev = np.maximum(work[:, c], prev - drop)
        out[:, c] = prev
    return out if major == 1 else out.T


def sample(ceiling, grid_meta, x, y):
    x0, y0, cell, W, H = grid_meta
    cx = np.clip(((x - x0) / cell).astype(np.int32), 0, W - 1)
    cy = np.clip(((y - y0) / cell).astype(np.int32), 0, H - 1)
    return ceiling[cy, cx]
