#!/usr/bin/env python3
"""Software renderer for the Philadelphia massing model.

Painter's algorithm over real extruded footprints: project, backface-cull,
depth-sort, flat-shade with the true solar vector, and fade to sky with
distance. It is not path tracing, but every polygon on screen is a real
building at its real footprint and its LiDAR-measured height, so it is an
honest look at the data before any of it reaches Blender.
"""
from __future__ import annotations

import math
import os
import struct
import sys
import zlib

import numpy as np
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(HERE, "tools"))
import pack                                                        # noqa: E402
from solar import sun_position                                     # noqa: E402
import shadow as shadowmod                                         # noqa: E402
import datetime as dt                                              # noqa: E402

BIN = os.path.join(HERE, "dist", "philly-buildings.bin")


# ----------------------------------------------------------------- data ----
def load(max_km=6.0, hmin_far=0.0):
    data = open(BIN, "rb").read()
    ntiles, _ = struct.unpack_from("<II", data, 40)
    idx = pack.HEADER_SIZE
    pay = idx + ntiles * pack.INDEX_ENTRY
    out = []
    for i in range(ntiles):
        tx, ty, cnt, off, ln = struct.unpack_from("<iiIII", data, idx + i * pack.INDEX_ENTRY)
        cxk = (tx + 0.5) * pack.TILE_SIZE / 1000.0
        cyk = (ty + 0.5) * pack.TILE_SIZE / 1000.0
        if math.hypot(cxk, cyk) - 0.73 > max_km:
            continue
        raw = zlib.decompress(data[pay + off:pay + off + ln])
        o = 0
        n = int(np.frombuffer(raw, "<u4", 1, o)[0]); o += 4 + 4 * n
        h = np.frombuffer(raw, "<u2", n, o).astype(np.float64) * 0.1; o += 2 * n
        b = np.frombuffer(raw, "<i2", n, o).astype(np.float64) * 0.1; o += 2 * n
        o += n
        npts = np.frombuffer(raw, "u1", n, o).astype(np.int64); o += n
        tot = int(npts.sum())
        xd = np.frombuffer(raw, "<i2", tot, o).astype(np.int64).copy(); o += 2 * tot
        yd = np.frombuffer(raw, "<i2", tot, o).astype(np.int64).copy(); o += 2 * tot
        starts = np.concatenate([[0], np.cumsum(npts)])[:-1]
        xd[starts] += 32768; yd[starts] += 32768
        cx = np.cumsum(xd); cy = np.cumsum(yd)
        px = np.where(starts > 0, cx[starts - 1], 0)
        py = np.where(starts > 0, cy[starts - 1], 0)
        X = (cx - np.repeat(px, npts)) * pack.QUANT + pack.COORD_OFFSET + tx * pack.TILE_SIZE
        Y = (cy - np.repeat(py, npts)) * pack.QUANT + pack.COORD_OFFSET + ty * pack.TILE_SIZE
        out.append((X, Y, h, b, npts, starts))
    return out


# ----------------------------------------------------------------- camera --
def view_matrix(eye, target, up=(0, 0, 1)):
    e = np.array(eye, dtype=np.float64)
    f = np.array(target, dtype=np.float64) - e
    f /= np.linalg.norm(f)
    u = np.array(up, dtype=np.float64)
    s = np.cross(f, u); s /= np.linalg.norm(s)
    u2 = np.cross(s, f)
    return np.stack([s, u2, -f]), e


def render(path, eye, target, fov_deg=48, W=1600, H=900, max_km=6.0,
           sun_elev=3.921, sun_az=279.195, title=None, hmin=0.0):
    R, e = view_matrix(eye, target)
    fl = (H / 2) / math.tan(math.radians(fov_deg) / 2)

    az, el = math.radians(sun_az), math.radians(sun_elev)
    sun = np.array([math.cos(el) * math.sin(az), math.cos(el) * math.cos(az), math.sin(el)])

    # sky gradient, warm near the horizon at low sun
    img = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(img)
    warm = max(0.0, 1.0 - sun_elev / 22.0)
    horizon_warm = (np.array([252, 176, 106], dtype=np.float64) * warm
                    + np.array([196, 214, 234], dtype=np.float64) * (1 - warm))
    zenith = np.array([28, 52, 104], dtype=np.float64) * (0.55 + 0.45 * warm) \
        + np.array([64, 108, 176], dtype=np.float64) * (1 - warm) * 0.45
    for y in range(H):
        t = y / (H - 1)
        k = t ** 0.62
        c = zenith * (1 - k) + horizon_warm * k
        d.line([(0, y), (W, y)], fill=tuple(int(v) for v in c))

    # Ground is drawn before every building rather than sorted with them.
    # A large ground quad's centroid can be nearer than a building standing in
    # front of it, so a single depth sort puts slabs of pavement over the city.
    # Resolution is adaptive: fine near the camera so a 4 km shadow reads as a
    # shadow rather than a checkerboard, coarse in the far field where it costs
    # nothing to be wrong.
    ground_faces = []
    ex, ey = e[0], e[1]
    for half, step in ((2200.0, 14.0), (9000.0, 220.0)):
        gx = np.arange(-half, half, step)
        for x0 in gx:
            for y0 in gx:
                if half > 3000 and abs(x0) < 2200 and abs(y0) < 2200:
                    continue                      # already covered by the fine grid
                px, py = x0 + ex, y0 + ey
                ground_faces.append((np.array([[px, py, 0], [px + step, py, 0],
                                               [px + step, py + step, 0],
                                               [px, py + step, 0]]),
                                     np.array([0.0, 0.0, 1.0]), -1.0))
    faces = []
    hf_polys, hf_heights = [], []
    for X, Y, hh, bb, npts, starts in load(max_km):
        keep = hh >= hmin
        for i in np.flatnonzero(keep):
            s, c = int(starts[i]), int(npts[i])
            xs, ys = X[s:s + c], Y[s:s + c]
            z0, z1 = bb[i], bb[i] + hh[i]
            hf_polys.append((xs.copy(), ys.copy()))
            hf_heights.append(float(z1))
            ring = np.stack([xs, ys], axis=1)
            # normalise to CCW
            sh = np.sum(xs * np.roll(ys, -1) - np.roll(xs, -1) * ys)
            if sh < 0:
                ring = ring[::-1]
                xs, ys = ring[:, 0], ring[:, 1]
            # roof
            faces.append((np.column_stack([xs, ys, np.full(c, z1)]),
                          np.array([0.0, 0.0, 1.0]), hh[i]))
            # walls
            nx = np.roll(xs, -1); ny = np.roll(ys, -1)
            dx, dy = nx - xs, ny - ys
            L = np.hypot(dx, dy); L[L == 0] = 1
            for j in range(c):
                quad = np.array([[xs[j], ys[j], z0], [nx[j], ny[j], z0],
                                 [nx[j], ny[j], z1], [xs[j], ys[j], z1]])
                faces.append((quad, np.array([dy[j] / L[j], -dx[j] / L[j], 0.0]), hh[i]))

    # ---- cast shadows -----------------------------------------------------
    hf_heights = np.array(hf_heights, dtype=np.float32)
    pad = 600.0
    allx = np.concatenate([p[0] for p in hf_polys]) if hf_polys else np.array([0.0])
    ally = np.concatenate([p[1] for p in hf_polys]) if hf_polys else np.array([0.0])
    bounds = (float(allx.min()) - pad, float(ally.min()) - pad,
              float(allx.max()) + pad, float(ally.max()) + pad)
    hfield, gmeta = shadowmod.build_height_field(hf_polys, hf_heights, bounds, cell=4.0)
    ceiling = shadowmod.shadow_ceiling(hfield, 4.0, sun_elev, sun_az)

    # transform, clip against the near plane, cull, sort
    NEAR = 1.5

    def clip_near(cam):
        """Sutherland-Hodgman against z_cam <= -NEAR.

        Without this, a polygon with one vertex behind the eye divides by a
        near-zero depth and smears across the whole frame - which is exactly
        what the first attempt did.
        """
        out = []
        n = len(cam)
        for i in range(n):
            a = cam[i]
            b = cam[(i + 1) % n]
            ain = a[2] <= -NEAR
            bin_ = b[2] <= -NEAR
            if ain:
                out.append(a)
            if ain != bin_:
                t = (-NEAR - a[2]) / (b[2] - a[2])
                out.append(a + t * (b - a))
        return np.array(out) if len(out) >= 3 else None

    def project(face_list):
        acc = []
        for verts, nrm, bh in face_list:
            rel = verts - e
            if np.dot(rel[0], nrm) > 0:          # backface
                continue
            cam = rel @ R.T
            if np.all(cam[:, 2] > -NEAR):        # entirely behind the near plane
                continue
            if np.any(cam[:, 2] > -NEAR):
                cam = clip_near(cam)
                if cam is None:
                    continue
            depth = float(-cam[:, 2].mean())
            inv = -1.0 / cam[:, 2]
            sx = W / 2 + fl * cam[:, 0] * inv
            sy = H / 2 - fl * cam[:, 1] * inv
            if sx.max() < 0 or sx.min() > W or sy.max() < 0 or sy.min() > H:
                continue
            c3 = verts.mean(axis=0)
            acc.append((depth, sx, sy, nrm, bh, float(c3[0]), float(c3[1]), float(c3[2])))
        acc.sort(key=lambda t: -t[0])
        return acc

    ground_drawable = project(ground_faces)
    drawable = project(faces)

    amb_sky = np.array([0.20, 0.26, 0.40])      # sky fill only, shadows must read
    sunc = np.array([1.35, 1.14, 0.90])        # direct sun, warm
    skyc = np.array([0.72, 0.70, 0.70])
    allf = ground_drawable + drawable
    if allf:
        fx = np.array([f[5] for f in allf]); fy = np.array([f[6] for f in allf])
        fz = np.array([f[7] for f in allf])
        ceil_at = shadowmod.sample(ceiling, gmeta, fx, fy)
        # soft edge over 1.5 m so shadow boundaries are not stair-stepped
        shade = np.clip((fz - (ceil_at - 1.5)) / 1.5, 0.0, 1.0)
    else:
        shade = np.zeros(0)

    for k, (depth, sx, sy, nrm, bh, cxw, cyw, czw) in enumerate(allf):
        lam = max(0.0, float(np.dot(nrm, sun))) * float(shade[k])
        up = max(0.0, float(nrm[2]))
        if bh < 0:                                   # ground
            base = np.array([0.085, 0.088, 0.086])
        elif bh >= 45:
            base = np.array([0.185, 0.235, 0.290])   # curtain wall
        elif bh >= 18:
            base = np.array([0.520, 0.455, 0.375])   # stone / stucco
        else:
            base = np.array([0.430, 0.235, 0.170])   # Philadelphia brick
        if bh > 0 and up > 0.5:
            base = base * 0.42 + np.array([0.055, 0.055, 0.060])   # tar roof
        col = base * (amb_sky * (0.26 + 0.50 * up) + sunc * lam)
        # Beer-Lambert extinction rather than a power curve, so near buildings
        # stay saturated and only the far skyline goes milky.
        haze = 1.0 - math.exp(-depth / 15000.0)
        col = col * (1 - haze) + skyc * haze
        col = np.clip(col, 0, 1) ** (1 / 2.2)
        d.polygon(list(zip(sx.tolist(), sy.tolist())),
                  fill=tuple(int(v * 255) for v in col))

    img.save(path, quality=94)
    return len(drawable)


if __name__ == "__main__":
    t = dt.datetime(2026, 8, 28, 23, 14)
    el, az = sun_position(t)
    print(f"sun elev {el:.3f} az {az:.3f}")
    jobs = [
        ("phl-skyline-sw.jpg", (-3400, -3600, 420), (0, 100, 130), 44, 6.5, 0.0),
        ("phl-market-henge.jpg", (2100, -334, 34), (-2500, 404, 120), 40, 6.5, 0.0),
        ("phl-aerial.jpg", (-1900, -2300, 1150), (100, 150, 60), 52, 5.0, 0.0),
    ]
    for name, eye, tgt, fov, mk, hm in jobs:
        p = os.path.join(HERE, "dist", name)
        import time
        t0 = time.time()
        n = render(p, eye, tgt, fov_deg=fov, max_km=mk, sun_elev=el, sun_az=az, hmin=hm)
        print(f"{name}: {n} faces drawn in {time.time()-t0:.0f}s -> {p}")
