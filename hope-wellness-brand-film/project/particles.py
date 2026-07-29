#!/usr/bin/env python3
"""
Magic-ink particle system for the Hope Wellness Center brand film.

Two uses:
  ink_logo()      the intro. Ink particles swirl in out of nothing and coalesce
                  into the official logo, which then resolves to the EXACT
                  bitmap - the particles are samples OF the official artwork,
                  so nothing is ever redrawn or reshaped.
  ink_dissolve()  a transition. The outgoing frame breaks into ink motes that
                  drift off while the incoming frame bleeds through.

Everything is precomputed once and driven by a single 0..1 progress value, so
per-frame cost is a couple of vectorised array ops.
"""
import math
import os

import cv2
import numpy as np


# --------------------------------------------------------------------------
def _curl(px, py, seed=0.0):
    """A cheap divergence-free-ish flow field: gives ink its swirling feel."""
    a = np.sin(px * 2.7 + seed) * np.cos(py * 2.1 - seed * 0.7)
    b = np.cos(px * 1.9 - seed * 1.3) * np.sin(py * 3.1 + seed)
    return b, -a


class InkLogo:
    """
    Particles sampled from the official logo's own pixels, flown in from a
    swirling cloud and landing on their exact source position.
    """

    def __init__(self, logo_bgra, W, H, cx, cy, target_w, n=5200, seed=7):
        self.W, self.H = W, H
        sh, sw = logo_bgra.shape[:2]
        tw = int(round(target_w))
        th = int(round(target_w * sh / sw))          # exact original aspect
        small = cv2.resize(logo_bgra, (tw, th), interpolation=cv2.INTER_AREA)
        a = small[..., 3].astype(np.float32) / 255.0
        ys, xs = np.nonzero(a > 0.30)
        rng = np.random.default_rng(seed)
        if len(xs) > n:
            pick = rng.choice(len(xs), n, replace=False)
            ys, xs = ys[pick], xs[pick]
        self.n = len(xs)
        self.col = small[ys, xs, :3].astype(np.float32)
        self.alpha_t = a[ys, xs]

        # landing positions in frame space
        self.tx = xs.astype(np.float32) + (cx - tw / 2.0)
        self.ty = ys.astype(np.float32) + (cy - th / 2.0)

        # start positions: a loose cloud, biased outward from the lockup
        ang = rng.uniform(0, 2 * math.pi, self.n).astype(np.float32)
        rad = (rng.uniform(0.35, 1.5, self.n) ** 0.8).astype(np.float32)
        self.sx = (cx + np.cos(ang) * rad * W * 0.62).astype(np.float32)
        self.sy = (cy + np.sin(ang) * rad * H * 0.85).astype(np.float32)

        # per-particle timing: ink arrives in waves, left to right, with jitter
        lead = (self.tx - self.tx.min()) / max(1.0, np.ptp(self.tx))
        self.t0 = np.clip(lead * 0.30 + rng.uniform(0, 0.16, self.n), 0, 0.80
                          ).astype(np.float32)
        self.dur = rng.uniform(0.26, 0.46, self.n).astype(np.float32)
        self.swirl = rng.uniform(0.7, 2.2, self.n).astype(np.float32)
        self.size = rng.uniform(1.7, 4.4, self.n).astype(np.float32)
        self.seed = float(seed)

    def positions(self, prog):
        """Eased, swirling flight from the cloud to the exact landing point."""
        u = np.clip((prog - self.t0) / self.dur, 0.0, 1.0)
        e = u * u * (3.0 - 2.0 * u)
        # curl offset fades out as the particle lands, so landings are exact
        gx, gy = _curl(self.sx / self.W * 3.0, self.sy / self.H * 3.0, self.seed)
        wob = np.sin(u * math.pi) * self.swirl * 46.0
        x = self.sx + (self.tx - self.sx) * e + gx * wob
        y = self.sy + (self.ty - self.sy) * e + gy * wob
        return x, y, e

    def render(self, canvas, prog, glow=1.0):
        """Additive-ish ink deposition with a soft bleed halo."""
        x, y, e = self.positions(prog)
        vis = e > 0.001
        if not vis.any():
            return
        H, W = self.H, self.W
        xi = np.clip(x[vis], 0, W - 1).astype(np.int32)
        yi = np.clip(y[vis], 0, H - 1).astype(np.int32)
        col = self.col[vis]
        al = (self.alpha_t[vis] * np.clip(e[vis] * 1.35, 0, 1)).astype(np.float32)
        sz = self.size[vis] * (1.0 + (1.0 - e[vis]) * 1.6)

        # accumulate colour and coverage into buffers, then blend once
        acc = np.zeros((H, W, 3), np.float32)
        cov = np.zeros((H, W), np.float32)
        for dy in (-1, 0, 1):
            for dx in (-1, 0, 1):
                w = 1.0 if (dx == 0 and dy == 0) else 0.42
                yy = np.clip(yi + dy, 0, H - 1)
                xx = np.clip(xi + dx, 0, W - 1)
                ww = al * w * np.clip(sz / 2.0, 0.35, 1.0)
                np.add.at(cov, (yy, xx), ww)
                np.add.at(acc, (yy, xx), col * ww[:, None])
        m = cov > 1e-5
        acc[m] /= cov[m][:, None]
        cov = np.clip(cov, 0, 1)
        if glow > 0.02:
            halo = cv2.GaussianBlur(cov, (0, 0), 9.5) * (0.78 * glow)
            hcol = cv2.GaussianBlur(acc, (0, 0), 7.0)
            hm = halo > 1e-4
            a2 = np.clip(halo, 0, 0.62)[..., None]
            canvas[:] = canvas * (1 - a2) + hcol * a2
            _ = hm
        a1 = cov[..., None]
        canvas[:] = canvas * (1 - a1) + acc * a1


def ink_field(W, H, prog, seed=3, n=260, tint=(65, 196, 78)):
    """
    Free-floating ink motes used behind the logo and during ink transitions.
    Returns an RGBA-ish (rgb, alpha) pair to blit.
    """
    rng = np.random.default_rng(seed)
    layer = np.zeros((H, W, 3), np.float32)
    cov = np.zeros((H, W), np.float32)
    ang = rng.uniform(0, 2 * math.pi, n)
    rad = rng.uniform(0.05, 1.0, n) ** 0.7
    life = rng.uniform(0.5, 1.0, n)
    sz = rng.uniform(2.0, 7.0, n)
    x = (0.5 + np.cos(ang) * rad * 0.62) * W
    y = (0.5 + np.sin(ang) * rad * 0.72) * H
    drift = prog * 90.0
    x = x + np.cos(ang * 3.1) * drift
    y = y - np.abs(np.sin(ang * 2.3)) * drift * 0.8
    a = np.clip(np.sin(np.clip(prog * life, 0, 1) * math.pi), 0, 1) * 0.55
    xi = np.clip(x, 0, W - 1).astype(np.int32)
    yi = np.clip(y, 0, H - 1).astype(np.int32)
    np.add.at(cov, (yi, xi), a * sz / 4.0)
    cov = cv2.GaussianBlur(cov, (0, 0), 3.2)
    layer[:] = np.array(tint, np.float32)
    return layer, np.clip(cov, 0, 0.8)


def ink_dissolve(a_img, b_img, prog, seed=11, cell=14):
    """
    Break the outgoing frame into ink motes that drift up and away while the
    incoming frame bleeds through underneath.
    """
    H, W = a_img.shape[:2]
    k = float(np.clip(prog, 0, 1))
    rng = np.random.default_rng(seed)
    gh, gw = H // cell, W // cell
    # per-cell survival: a noise field thresholded by progress -> organic bleed
    noise = rng.random((gh, gw)).astype(np.float32)
    noise = cv2.GaussianBlur(noise, (0, 0), 1.4)
    keep = np.clip((noise - (k * 1.25 - 0.12)) * 7.0, 0, 1)
    keep = cv2.resize(keep, (W, H), interpolation=cv2.INTER_LINEAR)
    # the surviving ink lifts and smears as it goes
    lift = int(round(k * 46))
    Mx = np.float32([[1, 0, k * 18], [0, 1, -lift]])
    aa = cv2.warpAffine(a_img, Mx, (W, H), flags=cv2.INTER_LINEAR,
                        borderMode=cv2.BORDER_REPLICATE)
    if k > 0.04:
        aa = cv2.GaussianBlur(aa, (0, 0), 0.6 + 5.0 * k)
    m = keep[..., None]
    out = b_img * (1 - m) + aa * m
    return out


LOGO_CACHE = {}


def load_logo(build_dir):
    if 'logo' not in LOGO_CACHE:
        p = os.path.join(build_dir, 'logo_master.png')
        LOGO_CACHE['logo'] = cv2.imread(p, cv2.IMREAD_UNCHANGED)
    return LOGO_CACHE['logo']
