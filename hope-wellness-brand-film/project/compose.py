#!/usr/bin/env python3
"""
Hope Wellness Center brand film - 2.5D landscape compositor (1200x628).

Per output frame:
  1  source frame -> colour-matched grade (all five clips to one background)
  2  animated view window -> hero plate that always fills the 628 height, so
     nothing is ever cropped off a head, hand, foot or held prop
  3  the frame is completed SIDEWAYS: the plate's own outer-column row medians
     are extended outward and eased into the clip's background colour, so
     horizontal structure (water lines, floor, mat) continues seamlessly
  4  atmospheric field + drifting organic blobs in the artwork's shape language
  5  hero plate feathered into that field - no visible box
  6  foreground botanicals lifted from the artwork, blurred, faster parallax
  7  object-motivated transition matte between two live shots
  8  typography in the negative space beside the subject
  9  finish: bloom, vignette, fine grain

  python compose.py --preview        contact grid of key moments
  python compose.py --frames a,b,c   single frames as PNG
  python compose.py --render out.mp4 full silent render
"""
import argparse
import math
import os
import sys
from collections import OrderedDict

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import manifest as M

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'assets', 'source-videos')
TRANS = os.path.join(ROOT, 'assets', 'transitions')
TYPE = os.path.join(ROOT, 'assets', 'type')
BUILD = os.path.join(ROOT, 'build')
W, H, FPS = M.W, M.H, M.FPS
SW, SH = 1104, 816
rng = np.random.default_rng(20240728)


# ----------------------------------------------------------------- easing
def smooth(x):
    x = float(np.clip(x, 0.0, 1.0))
    return x * x * x * (x * (x * 6 - 15) + 10)


def eout(x):
    x = float(np.clip(x, 0.0, 1.0))
    return 1.0 - (1.0 - x) ** 3


def lerp(a, b, u):
    return a + (b - a) * u


# ------------------------------------------------------------ source access
class SeqReader:
    """Forward-biased frame reader with a window cache (access is monotonic)."""

    def __init__(self, path, cache=84):
        self.cap = cv2.VideoCapture(path)
        self.n = int(self.cap.get(cv2.CAP_PROP_FRAME_COUNT))
        self.next = 0
        self.buf = OrderedDict()
        self.cap_n = cache

    def get(self, idx):
        idx = int(max(0, min(idx, self.n - 1)))
        if idx in self.buf:
            return self.buf[idx]
        if idx < self.next:
            self.cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
            self.next = idx
        while self.next <= idx:
            ok, f = self.cap.read()
            if not ok:
                break
            self.buf[self.next] = f
            self.next += 1
            while len(self.buf) > self.cap_n:
                self.buf.popitem(last=False)
        return self.buf.get(idx, next(reversed(self.buf.values())))


READERS = {}


def reader(clip):
    if clip not in READERS:
        READERS[clip] = SeqReader(os.path.join(SRC, f'upload{clip}.mp4'))
    return READERS[clip]


# ------------------------------------------------------------------- grade
def _bg_median(clip):
    r = SeqReader(os.path.join(SRC, f'upload{clip}.mp4'), cache=4)
    sm = []
    for t in (0.5, 3.0, 6.0, 9.0):
        f = r.get(int(t * 24))
        hsv = cv2.cvtColor(f, cv2.COLOR_BGR2HSV)
        m = (hsv[..., 2] > 215) & (hsv[..., 1] < 70)
        if m.sum() > 500:
            sm.append(np.median(f[m], axis=0))
    return np.mean(sm, axis=0)


GAIN = {}
BGCOL = {}


def build_grades():
    tgt = np.array(M.GRADE_TARGET[::-1], np.float32)
    for c in range(1, 6):
        bg = _bg_median(c).astype(np.float32)
        g = np.clip(tgt / np.maximum(bg, 1e-3), 0.90, 1.12)
        GAIN[c] = g.reshape(1, 1, 3)
        BGCOL[c] = np.clip(bg * g.reshape(3), 0, 255)
        print(f'  clip{c} bg {bg.astype(int)} -> gain {g.round(4)}')


def grade(f32, clip):
    p = M.GRADE[clip]
    x = f32 * GAIN[clip]
    piv = 204.0
    x = (x - piv) * p['con'] + piv
    y = (x[..., 0] * .114 + x[..., 1] * .587 + x[..., 2] * .299)[..., None]
    x = y + (x - y) * p['sat']
    if p['warm']:
        w = p['warm'] * 255.0
        x = x + np.array([-w, 0.0, w], np.float32)
    return np.clip(x, 0, 255)


def src_frame(clip, t_src):
    """Nearest source frame with a light temporal blend; the synthetic camera
    move runs at 30 fps on top, so 24->30 judder never shows."""
    fi = t_src * 24.0
    i0 = int(math.floor(fi))
    fr = fi - i0
    rd = reader(clip)
    a = rd.get(i0).astype(np.float32)
    if fr < 0.04:
        out = a
    else:
        b = rd.get(i0 + 1).astype(np.float32)
        out = a * (1 - fr) + b * fr
    return grade(out, clip)


# --------------------------------------------------------------- sprite kit
def load_rgba(path):
    im = cv2.imread(path, cv2.IMREAD_UNCHANGED)
    return im[..., :3].astype(np.float32), im[..., 3].astype(np.float32) / 255.0


FRONDS = ['frond_c3_10', 'frond_c3_11', 'frond_c3_12',
          'frond_c4_15', 'frond_c4_18', 'frond_c5_13', 'frond_c5_14']
LEAFLETS = ['leaflet_c2_00', 'leaflet_c2_01', 'leaflet_c2_02', 'leaflet_c2_03',
            'leaflet_c2_04', 'leaflet_c2_05', 'leaflet_c2_07', 'leaflet_c2_08']
SPR = OrderedDict()


def sprite(name, width, blur=0.0, rot=0.0):
    key = (name, int(width), round(blur, 1), round(rot, 1))
    if key in SPR:
        return SPR[key]
    rgb, a = load_rgba(os.path.join(TRANS, name + '.png'))
    h, w = a.shape
    sc = width / float(w)
    tw, th = max(2, int(w * sc)), max(2, int(h * sc))
    rgb = cv2.resize(rgb, (tw, th), interpolation=cv2.INTER_CUBIC)
    a = cv2.resize(a, (tw, th), interpolation=cv2.INTER_CUBIC)
    if rot:
        Mr = cv2.getRotationMatrix2D((tw / 2, th / 2), rot, 1.0)
        cos, sin = abs(Mr[0, 0]), abs(Mr[0, 1])
        nw, nh = int(th * sin + tw * cos), int(th * cos + tw * sin)
        Mr[0, 2] += nw / 2 - tw / 2
        Mr[1, 2] += nh / 2 - th / 2
        rgb = cv2.warpAffine(rgb, Mr, (nw, nh), flags=cv2.INTER_CUBIC)
        a = cv2.warpAffine(a, Mr, (nw, nh), flags=cv2.INTER_CUBIC)
    if blur > 0.2:
        rgb = cv2.GaussianBlur(rgb, (0, 0), blur)
        a = cv2.GaussianBlur(a, (0, 0), blur)
    SPR[key] = (rgb, np.clip(a, 0, 1))
    while len(SPR) > 260:
        SPR.popitem(last=False)
    return SPR[key]


def blit(dst, rgb, a, cx, cy, alpha=1.0):
    th, tw = a.shape[:2]
    x0, y0 = int(round(cx - tw / 2)), int(round(cy - th / 2))
    dx0, dy0 = max(0, x0), max(0, y0)
    dx1, dy1 = min(W, x0 + tw), min(H, y0 + th)
    if dx1 <= dx0 or dy1 <= dy0:
        return
    sx0, sy0 = dx0 - x0, dy0 - y0
    sa = a[sy0:sy0 + (dy1 - dy0), sx0:sx0 + (dx1 - dx0)][..., None] * alpha
    sr = rgb[sy0:sy0 + (dy1 - dy0), sx0:sx0 + (dx1 - dx0)]
    reg = dst[dy0:dy1, dx0:dx1]
    dst[dy0:dy1, dx0:dx1] = reg * (1 - sa) + sr * sa


_GLOW = {}


def glow_dot(size):
    if size not in _GLOW:
        yy, xx = np.mgrid[0:size, 0:size].astype(np.float32)
        c = (size - 1) / 2
        r = np.sqrt((xx - c) ** 2 + (yy - c) ** 2) / max(1e-6, c)
        _GLOW[size] = np.clip(1 - r, 0, 1) ** 2.2
        if len(_GLOW) > 24:
            _GLOW.pop(next(iter(_GLOW)))
    return _GLOW[size]


def blit_glow(dst, cx, cy, rad, color, alpha):
    s = max(4, int(rad * 2))
    g = glow_dot(s)
    rgb = np.empty((s, s, 3), np.float32)
    rgb[:] = np.array(color, np.float32)
    blit(dst, rgb, g, cx, cy, alpha)


# ------------------------------------------------ per-shot cached furniture
def shot_view(s, u):
    a, b = s['view']
    e = smooth(u)
    return tuple(lerp(a[i], b[i], e) for i in range(5))


BLOB = None


def blob_sprite():
    global BLOB
    if BLOB is None:
        BLOB = cv2.imread(os.path.join(ROOT, 'assets', 'masks',
                                       'organic_blob.png'),
                          cv2.IMREAD_GRAYSCALE).astype(np.float32) / 255.0
    return BLOB


def hero_plate(f32, cx, cy, vw, vh):
    """Scale the chosen source window so it fills the full 628 height."""
    sc = H / float(vh)
    cx = float(np.clip(cx, vw / 2, SW - vw / 2))
    cy = float(np.clip(cy, vh / 2, SH - vh / 2))
    x0, y0 = cx - vw / 2, cy - vh / 2
    pw = max(2, int(round(vw * sc)))
    Mx = np.array([[sc, 0, -sc * x0], [0, sc, -sc * y0]], np.float32)
    return cv2.warpAffine(f32, Mx, (pw, H), flags=cv2.INTER_CUBIC,
                          borderMode=cv2.BORDER_REPLICATE)


def _mirror_ext(plate, n, flat, from_left):
    """
    Extend the frame sideways by mirroring the plate's edge region, stretching
    it across the gap and defocusing it outward.

    Mirroring means the column touching the seam is the plate's own edge
    column, so continuity is exact and no tonal step can appear. Because the
    strip carries real 2-D content rather than one repeated column, background
    structure continues as soft out-of-focus depth instead of hard horizontal
    bars, and the strip is capped narrow so a figure can never be duplicated.
    """
    m = int(min(n, 104, plate.shape[1] - 1))
    # mirrored strip, ordered so the column adjacent to the seam is the
    # plate's own edge column in both directions
    src = np.ascontiguousarray((plate[:, :m] if from_left
                               else plate[:, -m:])[:, ::-1])
    ext = cv2.resize(src, (n, H), interpolation=cv2.INTER_LINEAR)
    # A defocus floor proportional to the horizontal stretch. Without it a
    # mirrored strip that happens to contain lettering (clip 3's rising
    # 'hope' words) would read as legible reversed text in the extension.
    pre = float(np.clip(5.0 + 7.0 * (n / max(1.0, m) - 1.0), 5.0, 24.0))
    ext_soft = cv2.resize(cv2.GaussianBlur(src, (0, 0), pre / max(1.0, n / m)),
                          (n, H), interpolation=cv2.INTER_LINEAR)
    ext_soft = cv2.GaussianBlur(ext_soft, (0, 0), pre)
    idx = np.arange(n, dtype=np.float32)
    d = ((n - idx) / n) if from_left else ((idx + 1) / n)   # 0 at seam, 1 out
    # hold true continuity for ~36 px, then commit to the defocused version
    wpre = np.clip(d * n / 36.0, 0, 1).reshape(1, -1, 1)
    base = ext * (1 - wpre) + ext_soft * wpre
    # The wider the gap, the harder it resolves to a clean field: a narrow gap
    # can carry recognisable background, but a gap that is 40% of the frame
    # must read as designed negative space, not as mirrored scenery.
    frac = n / float(W)
    soft = cv2.GaussianBlur(base, (0, 0), 34.0 + 80.0 * frac)
    w = (d ** 0.65).reshape(1, -1, 1)
    base = base * (1 - w) + soft * w
    w2max = float(np.clip(0.42 + 2.6 * (frac - 0.15), 0.42, 0.93))
    w2 = ((d ** 1.10) * w2max).reshape(1, -1, 1)
    return base * (1 - w2) + flat * w2


def build_background(clip, plate, sx, f32, t, seed):
    pw = plate.shape[1]
    flat = BGCOL[clip].reshape(1, 1, 3)
    sxi = int(round(sx))
    r0 = sxi + pw
    bg = np.empty((H, W, 3), np.float32)
    bg[:] = flat
    if sxi > 0:
        bg[:, :sxi] = _mirror_ext(plate, sxi, flat, True)
    if r0 < W:
        bg[:, r0:] = _mirror_ext(plate, W - r0, flat, False)

    # atmosphere, weighted to zero at each seam so it can never create a step.
    # Field comes from BACKGROUND ONLY: a wide max filter removes the (darker)
    # figure, so it can never show a ghost double of the subject.
    small = cv2.resize(f32, (150, 110), interpolation=cv2.INTER_AREA)
    only_bg = cv2.GaussianBlur(cv2.dilate(small, np.ones((25, 25), np.uint8)),
                               (0, 0), 10)
    atmo = cv2.resize(only_bg, (W, H), interpolation=cv2.INTER_CUBIC)
    bl = blob_sprite()
    for j, (bw, ox, oy, al) in enumerate(((1160, 0.14, 0.28, 0.30),
                                          (980, 0.92, 0.78, 0.26))):
        d = math.sin(t * 0.17 + j * 2.1) * 22
        s2 = cv2.resize(bl, (bw, bw), interpolation=cv2.INTER_LINEAR)
        rgb = np.empty((bw, bw, 3), np.float32)
        rgb[:] = flat.reshape(3) * 0.947
        blit(atmo, rgb, s2 * al, ox * W + d, oy * H - d * 0.5, 1.0)

    wf = np.zeros((1, W, 1), np.float32)
    if sxi > 0:
        idx = np.arange(sxi, dtype=np.float32)
        wf[0, :sxi, 0] = (((sxi - idx) / sxi) ** 1.35) * 0.22
    if r0 < W:
        n = W - r0
        wf[0, r0:, 0] = (((np.arange(n, dtype=np.float32) + 1) / n) ** 1.35) * 0.22
    _ = seed
    return bg * (1 - wf) + atmo * wf


def composite_plate(bg, plate, sx):
    """
    Hard composite - deliberately NO feather.

    The mirrored extension's column adjacent to the seam already IS the plate's
    own edge column, so an opaque join is pixel-continuous. Feathering here
    would instead cross-fade the plate into the flat fill underneath it and
    produce exactly the visible step it was meant to hide.
    """
    pw = plate.shape[1]
    sxi = int(round(sx))
    dx0, dx1 = max(0, sxi), min(W, sxi + pw)
    if dx1 <= dx0:
        return bg
    bg[:, dx0:dx1] = plate[:, dx0 - sxi:dx1 - sxi]
    return bg


def foreground(canvas, u, t, seed):
    """Blurred botanicals from the artwork on a faster parallax track."""
    r = np.random.default_rng(seed)
    for k in range(2):
        nm = FRONDS[(seed + k * 3) % len(FRONDS)]
        bw = int(r.uniform(430, 700))
        rot = float(r.uniform(-40, 40))
        base_x = (-0.09 if k == 0 else 1.09) * W
        base_y = (0.86 if k == 0 else 0.14) * H
        drift = math.sin(t * 0.21 + k * 1.7) * 26
        rgb, a = sprite(nm, bw, blur=r.uniform(20, 30), rot=rot)
        blit(canvas, rgb, a, base_x + drift + u * 26 * (1 if k else -1),
             base_y + drift * 0.5 - u * 16, alpha=float(r.uniform(0.09, 0.14)))


def leaflets(canvas, t, seed, n=6, alpha=0.40, scale=1.0):
    r = np.random.default_rng(seed)
    for i in range(n):
        nm = LEAFLETS[i % len(LEAFLETS)]
        px, py = r.uniform(0.02, 0.98), r.uniform(0.02, 0.98)
        sp = r.uniform(0.020, 0.055)
        ph = r.uniform(0, 6.3)
        y = (py - (t * sp) % 1.3) % 1.3
        x = px + math.sin(t * 0.5 + ph) * 0.030
        bw = int(r.uniform(26, 66) * scale)
        rgb, a = sprite(nm, bw, blur=r.uniform(0.5, 2.6),
                        rot=float(r.uniform(0, 360)))
        blit(canvas, rgb, a, x * W, y * H,
             alpha=alpha * float(r.uniform(0.55, 1.0)))


# --------------------------------------------------------------- shot frame
def render_shot(s, t):
    span = s['t_out'] - s['t_in']
    u = float(np.clip((t - s['t_in']) / span, 0.0, 1.6))
    ts = s['src_in'] + (t - s['t_in']) * M.shot_speed(s)
    f32 = src_frame(s['clip'], ts)
    if u <= 1.0:
        cx, cy, vw, vh, sx = shot_view(s, u)
    else:                                       # transition tail keeps moving
        a, b = s['view']
        k = (u - 1.0) * 0.5
        cx, cy, vw, vh, sx = [b[i] + (b[i] - a[i]) * k for i in range(5)]
    plate = hero_plate(f32, cx, cy, vw, vh)
    seed = abs(hash(s['id'])) % 9997
    bg = build_background(s['clip'], plate, sx, f32, t, seed)
    canvas = composite_plate(bg, plate, sx)
    foreground(canvas, min(u, 1.0), t, seed)
    dens = {'s2_tree': 8, 's3_tree_close': 7, 's9_read_hope': 6}.get(s['id'], 4)
    leaflets(canvas, t, seed + 41, n=dens, alpha=0.36)
    return canvas


# ------------------------------------------------------------- resolve card
RESOLVE_BG = None


def resolve_card(t):
    """Brand card: pale illustrated space, botanicals settling, then the logo."""
    global RESOLVE_BG
    r0 = M.RESOLVE['t_in']
    if RESOLVE_BG is None:
        base = np.array(M.GRADE_TARGET[::-1], np.float32)
        xx = np.arange(W, dtype=np.float32)[None, :, None] / W
        yy = np.arange(H, dtype=np.float32)[:, None, None] / H
        g = base * (1.014 - 0.026 * yy - 0.008 * xx)
        RESOLVE_BG = np.ascontiguousarray(np.broadcast_to(g, (H, W, 3))
                                          .astype(np.float32).copy())
        bl = blob_sprite()
        for (bw, ox, oy, al) in ((1240, 0.20, 0.26, 0.24), (1040, 0.84, 0.80, 0.20)):
            s2 = cv2.resize(bl, (bw, bw), interpolation=cv2.INTER_LINEAR)
            rgb = np.empty((bw, bw, 3), np.float32)
            rgb[:] = base * 0.947
            blit(RESOLVE_BG, rgb, s2 * al, ox * W, oy * H, 1.0)
    canvas = RESOLVE_BG.copy()
    u = t - r0
    rr = np.random.default_rng(913)
    for i in range(14):
        ang = rr.uniform(0, 6.283)
        rad0 = rr.uniform(0.30, 0.95)
        ph = rr.uniform(0, 6.283)
        k = smooth(np.clip(u / 1.30, 0, 1))
        rad = lerp(rad0, 0.05, k)
        cxp = 0.50 + math.cos(ang) * rad * 0.52 + math.sin(u * 0.4 + ph) * 0.006
        cyp = 0.44 + math.sin(ang) * rad * 0.46 + math.cos(u * 0.35 + ph) * 0.006
        al = (1 - k) * 0.55 + 0.10 * max(0.0, 1 - abs(u - 1.4) / 2.6)
        if al <= 0.012:
            continue
        rgb, a = sprite(LEAFLETS[i % len(LEAFLETS)], int(rr.uniform(26, 62)),
                        blur=rr.uniform(0.5, 2.4), rot=float(rr.uniform(0, 360)))
        blit(canvas, rgb, a, cxp * W, cyp * H, alpha=float(al))
    leaflets(canvas, t, 771, n=4, alpha=0.18)
    return canvas


# ---------------------------------------------------------------- mattes
_RFIELD = OrderedDict()


def radial(origin):
    key = (round(origin[0], 3), round(origin[1], 3))
    if key not in _RFIELD:
        yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
        _RFIELD[key] = np.sqrt((xx - origin[0] * W) ** 2 +
                               (yy - origin[1] * H) ** 2)
        while len(_RFIELD) > 8:
            _RFIELD.popitem(last=False)
    return _RFIELD[key]


def ripple_mask(origin, prog, ripple=True, edge=88.0, amp=20.0):
    r = radial(origin)
    R = smooth(prog) * float(np.max(r)) * 1.04
    if ripple:
        R = R + amp * (1 - prog) * np.sin(r / 38.0 - prog * 11.0)
    m = np.clip((R - r) / edge + 0.5, 0, 1)
    return m * m * (3 - 2 * m)


def linear_mask(prog, axis='x', invert=False, edge=150.0, angle=0.0):
    if angle:
        yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
        a = math.radians(angle)
        d = xx * math.cos(a) + yy * math.sin(a)
        d = (d - d.min()) / (d.max() - d.min())
        span = float(W)
    else:
        if axis == 'x':
            d = np.tile(np.linspace(0, 1, W, dtype=np.float32), (H, 1))
            span = float(W)
        else:
            d = np.tile(np.linspace(0, 1, H, dtype=np.float32)[:, None], (1, W))
            span = float(H)
    if invert:
        d = 1.0 - d
    p = smooth(prog) * (1 + edge / span * 2) - edge / span
    m = np.clip((p - d) * (span / edge) + 0.5, 0, 1)
    return m * m * (3 - 2 * m)


def directional_blur(img, angle, amount):
    if amount < 1:
        return img
    k = int(amount) | 1
    ker = np.zeros((k, k), np.float32)
    cv2.line(ker, (0, k // 2), (k - 1, k // 2), 1.0, 1)
    Mr = cv2.getRotationMatrix2D((k / 2, k / 2), angle, 1.0)
    ker = cv2.warpAffine(ker, Mr, (k, k))
    ssum = ker.sum()
    return img if ssum <= 0 else cv2.filter2D(img, -1, ker / ssum)


def apply_transition(a, b, tr, prog, t):
    kind = tr['kind']
    if kind == 'ripple':
        m = ripple_mask(tr['origin'], prog, True, edge=94, amp=24)[..., None]
        out = a * (1 - m) + b * m
        r = radial(tr['origin'])
        R = smooth(prog) * float(np.max(r)) * 1.04
        crest = np.exp(-((r - R) / 52.0) ** 2)[..., None] * (1 - prog) * 20.0
        return out + crest
    if kind == 'ring':
        m = ripple_mask(tr['origin'], prog, True, edge=118, amp=11)[..., None]
        out = a * (1 - m) + b * m
        r = radial(tr['origin'])
        R = smooth(prog) * float(np.max(r)) * 1.04
        ring = np.exp(-((r - R) / 21.0) ** 2)[..., None] * (1 - prog * 0.7) * 38.0
        halo = np.exp(-((r - R) / 96.0) ** 2)[..., None] * (1 - prog) * 11.0
        return out + ring + halo
    if kind == 'leafwipe':
        # the leaf crosses fast and the cut happens entirely behind it
        # The switch must happen while the leaf ACTUALLY covers the frame -
        # measured at prog 0.16-0.32, not at its centre-crossing.
        m = linear_mask(np.clip((prog - 0.15) / 0.17, 0, 1), 'x', edge=340)[..., None]
        out = a * (1 - m) + b * m
        sweep = -0.32 + 1.70 * (0.28 * eout(prog) + 0.72 * prog)
        rgb, al = sprite('frond_c3_12', 1120, blur=6, rot=-34 + 44 * prog)
        blit(out, rgb, al, sweep * W, H * (0.62 - 0.26 * prog), alpha=0.97)
        rgb2, al2 = sprite('leaflet_c2_04', 700, blur=11, rot=22 - 40 * prog)
        blit(out, rgb2, al2, (sweep + 0.26) * W, H * (0.26 + 0.30 * prog),
             alpha=0.80)
        return out
    if kind == 'horizon':
        # decisive edge: a soft wipe here would blend two different faces
        m = linear_mask(prog, 'y', invert=True, edge=58)[..., None]
        out = a * (1 - m) + b * m
        yline = (1 - smooth(prog)) * H
        yy = np.arange(H, dtype=np.float32)[:, None, None]
        core = np.exp(-((yy - yline) / 13.0) ** 2) * 46.0
        halo = np.exp(-((yy - yline) / 62.0) ** 2) * 15.0
        return out + (core + halo) * (1.0 - 0.45 * prog)
    if kind == 'bandwipe':
        m = linear_mask(prog, 'x', edge=190)[..., None]
        out = a * (1 - m) + b * m
        xline = smooth(prog) * W
        xx = np.arange(W, dtype=np.float32)[None, :, None]
        env = np.exp(-((xx - xline) / 15.0) ** 2) * (1 - prog * 0.55)
        tint = np.array(M.GREEN[::-1], np.float32) - 150.0
        return out + env * 0.50 * (tint * 0.22 + 32.0)
    if kind == 'trailwipe':
        # the outgoing frame smears along the band's release direction and is
        # swept off by a decisive edge, so the two shots never co-read
        aa = directional_blur(a, 16.0, 2 + 104 * smooth(min(1.0, prog * 1.45)))
        m = linear_mask(prog, edge=104, angle=16.0)[..., None]
        out = aa * (1 - m) + b * m
        yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
        ang = math.radians(16.0)
        d = xx * math.cos(ang) + yy * math.sin(ang)
        d = (d - d.min()) / (d.max() - d.min())
        head = smooth(prog) * (1 + 0.22) - 0.11
        return out + np.exp(-((d - head) / 0.030) ** 2)[..., None] * (1 - prog) * 26.0
    if kind == 'gather':
        k = smooth(np.clip(prog * 1.34, 0, 1))
        Mz = cv2.getRotationMatrix2D((W * 0.56, H * 0.44), 0, 1.0 + 0.16 * k)
        aa = cv2.warpAffine(a, Mz, (W, H), flags=cv2.INTER_LINEAR,
                            borderMode=cv2.BORDER_REPLICATE)
        if prog > 0.05:
            aa = cv2.GaussianBlur(aa, (0, 0), 1 + 8 * k)
        out = aa * (1 - k) + b * k
        rr = np.random.default_rng(4402)
        for i in range(20):
            ang = rr.uniform(0, 6.283)
            rad = lerp(rr.uniform(0.35, 1.0), 0.04, k)
            cxp = 0.50 + math.cos(ang) * rad * 0.52
            cyp = 0.44 + math.sin(ang) * rad * 0.46
            col = M.GREEN[::-1] if i % 2 else M.BLUE[::-1]
            blit_glow(out, cxp * W, cyp * H, lerp(22, 6, k), col, (1 - k) * 0.30)
        return out
    m = np.float32(smooth(prog))
    return a * (1 - m) + b * m


# ------------------------------------------------------------- typography
FONTS = {}


def font(weight, size):
    k = (weight, int(size))
    if k not in FONTS:
        FONTS[k] = ImageFont.truetype(
            os.path.join(TYPE, f'Poppins-{weight}.ttf'), int(size))
    return FONTS[k]


_PROBE = ImageDraw.Draw(Image.new('L', (8, 8)))
TXT_CACHE = OrderedDict()


def measure(lines, weight, size):
    f = font(weight, size)
    return max(_PROBE.textlength(ln, font=f) for ln in lines)


def autofit(lines, weight, size, avail):
    while size > 20 and measure(lines, weight, size) > avail:
        size -= 1
    return size


def text_layer(lines, weight, size, lead, color, pad=44):
    key = ('|'.join(lines), weight, int(size), round(lead, 3), tuple(color))
    if key in TXT_CACHE:
        return TXT_CACHE[key]
    f = font(weight, size)
    wmax = int(max(_PROBE.textlength(ln, font=f) for ln in lines))
    lh = size * lead
    hh = int(lh * (len(lines) - 1) + size * 1.34)
    im = Image.new('L', (wmax + pad * 2, hh + pad * 2), 0)
    d = ImageDraw.Draw(im)
    for i, ln in enumerate(lines):
        d.text((pad, pad + i * lh), ln, font=f, fill=255)
    a = np.asarray(im).astype(np.float32) / 255.0
    rgb = np.empty(a.shape + (3,), np.float32)
    rgb[:] = np.array(color[::-1], np.float32)
    res = (rgb, a, wmax, hh, pad)
    TXT_CACHE[key] = res
    while len(TXT_CACHE) > 70:
        TXT_CACHE.popitem(last=False)
    return res


def soft_scrim(canvas, x0, y0, x1, y1, strength=0.12):
    px, py = 96, 70
    ax0, ay0 = max(0, int(x0 - px)), max(0, int(y0 - py))
    ax1, ay1 = min(W, int(x1 + px)), min(H, int(y1 + py))
    if ax1 <= ax0 or ay1 <= ay0 or strength <= 0.002:
        return
    h, w = ay1 - ay0, ax1 - ax0
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    fx = np.clip(np.minimum(xx, w - 1 - xx) / px, 0, 1)
    fy = np.clip(np.minimum(yy, h - 1 - yy) / py, 0, 1)
    m = (fx * fy)[..., None] * strength
    reg = canvas[ay0:ay1, ax0:ax1]
    canvas[ay0:ay1, ax0:ax1] = reg + (255.0 - reg) * m


def draw_text(canvas, ev, t):
    t0, t1 = ev['t_in'], ev['t_out']
    if not (t0 - 0.02 <= t <= t1 + 0.02):
        return
    if ev['anim'] == 'logo_in':
        return draw_logo(canvas, ev, t)

    size = autofit(ev['lines'], ev['weight'], ev['size'], ev.get('maxw', 420))
    rgb, a, wmax, hh, pad = text_layer(ev['lines'], ev['weight'], size,
                                       ev['lead'], ev['color'])
    bx = ev['x'] - wmax / 2.0 if ev['align'] == 'center' else float(ev['x'])
    by = float(ev['y'])
    lt, dur = t - t0, t1 - t0
    kind = ev['anim']
    alpha, dy, blur, mask = 1.0, 0.0, 0.0, None
    fade_out = 1.0 - smooth(np.clip((lt - (dur - 0.40)) / 0.40, 0, 1))

    if kind == 'wordblur':
        return draw_wordblur(canvas, ev, t, size)

    if kind in ('ripplemask', 'ringmask'):
        p = np.clip((lt - ev['rip_t0']) / ev['rip_dur'], 0, 1)
        mask = ripple_mask(ev['origin'], float(p), True,
                           edge=130 if kind == 'ripplemask' else 165,
                           amp=17 if kind == 'ripplemask' else 8)
        alpha = fade_out
        blur = (1 - smooth(np.clip(lt / 0.7, 0, 1))) * 4.0
    elif kind == 'riselock':
        e = smooth(np.clip(lt / 0.74, 0, 1))
        alpha, dy, blur = e * fade_out, (1 - e) * 30, (1 - e) * 5.0
    elif kind == 'swap':
        e = smooth(np.clip(lt / 0.48, 0, 1))
        o = smooth(np.clip((lt - (dur - 0.38)) / 0.38, 0, 1))
        alpha, dy = e * (1 - o), (1 - e) * 26 - o * 30
        blur = (1 - e) * 4.5 + o * 4.0
    elif kind == 'linewipe':
        p = float(np.clip(lt / 0.60, 0, 1))
        span = wmax + pad * 2
        xx = np.arange(span, dtype=np.float32)[None, :]
        edge = 150.0
        head = smooth(p) * (span + edge * 2) - edge
        mm = np.clip((head - xx) / edge + 0.5, 0, 1)
        mask = ('local', (mm * mm * (3 - 2 * mm)).astype(np.float32))
        alpha = fade_out
        if p < 1.0:
            blit_glow(canvas, bx - pad + head, by + hh * 0.5, 78,
                      M.GREEN[::-1], 0.15 * (1 - p))
    elif kind == 'disperse':
        e = smooth(np.clip(lt / 0.50, 0, 1))
        alpha, dy, blur = e, (1 - e) * 22, (1 - e) * 4.5
        if lt > dur - 0.48:
            return draw_disperse(canvas, ev, t, rgb, a, wmax, hh, pad, bx, by)
    else:
        alpha = smooth(np.clip(lt / 0.5, 0, 1)) * fade_out

    if alpha <= 0.004:
        return
    soft_scrim(canvas, bx, by, bx + wmax, by + hh, 0.11 * alpha)
    aa = a if blur <= 0.25 else cv2.GaussianBlur(a, (0, 0), blur)
    if mask is not None:
        if isinstance(mask, tuple):
            lm = mask[1]
            aa = aa * lm[:, :aa.shape[1]]
        else:
            oy, ox = int(by - pad + dy), int(bx - pad)
            sub = np.zeros_like(aa)
            gy0, gx0 = max(0, oy), max(0, ox)
            gy1 = min(H, oy + aa.shape[0])
            gx1 = min(W, ox + aa.shape[1])
            if gy1 > gy0 and gx1 > gx0:
                sub[gy0 - oy:gy1 - oy, gx0 - ox:gx1 - ox] = mask[gy0:gy1, gx0:gx1]
            aa = aa * sub
    blit(canvas, rgb, aa, bx - pad + aa.shape[1] / 2,
         by - pad + dy + aa.shape[0] / 2, alpha=alpha)
    if 'states' in ev:
        draw_states(canvas, ev, t, alpha)


def draw_states(canvas, ev, t, alpha):
    lt = t - ev['t_in']
    sz = autofit([' '.join(ev['states'])], 'Bold', ev['states_size'],
                 ev.get('maxw', 400))
    f = font('Bold', sz)
    widths = [_PROBE.textlength(s, font=f) for s in ev['states']]
    gap = sz * 0.60
    x = float(ev['x'])
    for i, (s, w) in enumerate(zip(ev['states'], widths)):
        e = smooth(np.clip((lt - 0.28 - i * 0.09) / 0.42, 0, 1))
        if e > 0.004:
            rgb, a, wm, hh, pad = text_layer([s], 'Bold', sz, 1.1, ev['color'])
            blit(canvas, rgb, a, x - pad + a.shape[1] / 2,
                 ev['states_y'] - pad + (1 - e) * 16 + a.shape[0] / 2,
                 alpha=e * alpha)
            if i < len(widths) - 1:
                blit_glow(canvas, x + w + gap / 2, ev['states_y'] + sz * 0.62,
                          9, M.GREEN[::-1], 0.90 * e * alpha)
        x += w + gap


def draw_wordblur(canvas, ev, t, size):
    """Words resolve out of blur one after another, assembling the phrase."""
    lt = t - ev['t_in']
    dur = ev['t_out'] - ev['t_in']
    fade_out = 1.0 - smooth(np.clip((lt - (dur - 0.44)) / 0.44, 0, 1))
    f = font(ev['weight'], size)
    lh = size * ev['lead']
    words = [ln.split(' ') for ln in ev['lines']]
    ntot = sum(len(w) for w in words)
    soft_scrim(canvas, ev['x'], ev['y'],
               ev['x'] + max(_PROBE.textlength(ln, font=f) for ln in ev['lines']),
               ev['y'] + lh * len(ev['lines']), 0.11 * fade_out)
    idx = 0
    for li, ws in enumerate(words):
        x = float(ev['x'])
        for w in ws:
            e = smooth(np.clip((lt - 0.08 - idx * (0.68 / max(1, ntot))) / 0.58,
                               0, 1))
            if e > 0.004:
                rgb, a, wm, hh, pad = text_layer([w], ev['weight'], size, 1.1,
                                                 ev['color'])
                aa = a if e > 0.985 else cv2.GaussianBlur(a, (0, 0),
                                                          (1 - e) * 6.0 + 0.01)
                blit(canvas, rgb, aa, x - pad + aa.shape[1] / 2,
                     ev['y'] + li * lh - pad + (1 - e) * 18 + aa.shape[0] / 2,
                     alpha=e * fade_out)
            x += _PROBE.textlength(w + ' ', font=f)
            idx += 1


def draw_disperse(canvas, ev, t, rgb, a, wmax, hh, pad, bx, by):
    """The phrase breaks into translucent particles and lifts away."""
    lt = t - ev['t_in']
    dur = ev['t_out'] - ev['t_in']
    p = smooth(np.clip((lt - (dur - 0.48)) / 0.48, 0, 1))
    cell = 22
    hgt, wid = a.shape
    r = np.random.default_rng(abs(hash(ev['id'])) % 8191)
    for gy in range(0, hgt, cell):
        for gx in range(0, wid, cell):
            sub = a[gy:gy + cell, gx:gx + cell]
            if sub.max() < 0.03:
                continue
            ox, oy = r.uniform(-18, 18) * p, -r.uniform(12, 62) * p
            al = (1 - p) ** 1.5
            if al <= 0.01:
                continue
            ss = sub if p < 0.05 else cv2.GaussianBlur(sub, (0, 0), 0.4 + 4 * p)
            blit(canvas, rgb[gy:gy + cell, gx:gx + cell], ss,
                 bx - pad + gx + sub.shape[1] / 2 + ox,
                 by - pad + gy + sub.shape[0] / 2 + oy, alpha=float(al))
    if p > 0.04:
        rr = np.random.default_rng(abs(hash(ev['id'])) % 991)
        for i in range(14):
            px = bx + rr.uniform(0, wmax)
            py = by + rr.uniform(0, hh) - p * rr.uniform(26, 100)
            col = M.GREEN[::-1] if i % 3 == 0 else M.BLUE[::-1]
            blit_glow(canvas, px, py, 7 + 9 * p, col,
                      float(np.clip(0.30 * (1 - p) * p * 4, 0, 0.4)))


LOGO = None


def draw_logo(canvas, ev, t):
    """The official logo enters as ONE protected asset: scale + fade only."""
    global LOGO
    if LOGO is None:
        im = cv2.imread(os.path.join(BUILD, 'logo_master.png'),
                        cv2.IMREAD_UNCHANGED)
        LOGO = (im[..., :3].astype(np.float32),
                im[..., 3].astype(np.float32) / 255.0)
    e = smooth(np.clip((t - ev['t_in']) / 0.46, 0, 1))
    lw = ev['logo_w'] * lerp(0.972, 1.0, e)
    src_rgb, src_a = LOGO
    sh, sw = src_a.shape
    tw = int(round(lw))
    th = int(round(lw * sh / sw))                 # exact original aspect
    it = cv2.INTER_AREA if tw < sw else cv2.INTER_LANCZOS4
    blit(canvas, cv2.resize(src_rgb, (tw, th), interpolation=it),
         np.clip(cv2.resize(src_a, (tw, th), interpolation=it), 0, 1),
         W / 2, ev['cy'], alpha=e)


# ------------------------------------------------------------------ finish
GRAIN = None
VIGN = None


def finish(x, t):
    global GRAIN, VIGN
    if VIGN is None:
        yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
        r = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2)
        VIGN = (1.0 - 0.050 * np.clip(r - 0.44, 0, 2) ** 1.7)[..., None]
    if GRAIN is None:
        GRAIN = [(rng.standard_normal((H, W)).astype(np.float32) * 1.75)
                 for _ in range(10)]
    hi = np.clip(x - 226.0, 0, None)
    if hi.max() > 1:
        x = x + cv2.GaussianBlur(hi, (0, 0), 20) * 0.55
    x = x * VIGN
    g = GRAIN[int(t * FPS) % len(GRAIN)]
    lw = 1.0 - np.clip(x.mean(axis=2) / 255.0, 0, 1) * 0.45
    return np.clip(x + (g * lw)[..., None], 0, 255)


# ------------------------------------------------------------------ driver
def active(t):
    cur = None
    for s in M.SHOTS:
        if s['t_in'] - 1e-6 <= t < s['t_out'] - 1e-6:
            cur = s
    if cur is None:
        cur = 'resolve' if t >= M.SHOTS[-1]['t_out'] else M.SHOTS[0]
    tr = None
    for x in M.TRANSITIONS:
        if x['at'] <= t < x['at'] + x['dur']:
            tr = x
    return cur, tr


def render_frame(t):
    cur, tr = active(t)
    if tr is None:
        canvas = resolve_card(t) if cur == 'resolve' else render_shot(cur, t)
    else:
        outs = [s for s in M.SHOTS if abs(s['t_out'] - tr['at']) < 1e-6][0]
        inc = [s for s in M.SHOTS if abs(s['t_in'] - tr['at']) < 1e-6]
        a = render_shot(outs, t)
        b = render_shot(inc[0], t) if inc else resolve_card(t)
        canvas = apply_transition(a, b, tr, float((t - tr['at']) / tr['dur']), t)
    for ev in M.COPY:
        draw_text(canvas, ev, t)
    return finish(canvas, t).astype(np.uint8)


PREVIEW_TS = [0.10, 1.60, 3.20, 4.95, 6.60, 8.60, 10.55, 12.30, 14.45,
              16.40, 18.60, 20.30, 22.00, 23.45, 25.00, 26.60, 28.60,
              30.90, 32.60, 34.60, 36.40, 38.10, 40.00, 41.60, 42.60,
              43.60, 45.20, 47.40]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--preview', action='store_true')
    ap.add_argument('--frames')
    ap.add_argument('--render')
    ap.add_argument('--start', type=float, default=0.0)
    ap.add_argument('--end', type=float, default=None)
    ap.add_argument('--cols', type=int, default=4)
    args = ap.parse_args()

    M.validate()
    print('building grades...')
    build_grades()

    if args.frames:
        os.makedirs(os.path.join(BUILD, 'frames'), exist_ok=True)
        for tv in [float(x) for x in args.frames.split(',')]:
            p = os.path.join(BUILD, 'frames', f'f_{tv:06.2f}.png')
            cv2.imwrite(p, render_frame(tv))
            print(' ', p)
        return

    if args.preview:
        cols = args.cols
        tiles = []
        for tv in PREVIEW_TS:
            f = cv2.resize(render_frame(tv), (480, 251))
            cv2.putText(f, f'{tv:.2f}', (6, 20), cv2.FONT_HERSHEY_SIMPLEX,
                        0.5, (0, 0, 200), 1, cv2.LINE_AA)
            cv2.rectangle(f, (0, 0), (479, 250), (110, 110, 110), 1)
            tiles.append(f)
        while len(tiles) % cols:
            tiles.append(np.full((251, 480, 3), 255, np.uint8))
        rows = [np.hstack(tiles[i * cols:(i + 1) * cols])
                for i in range(len(tiles) // cols)]
        os.makedirs(os.path.join(BUILD, 'inspect'), exist_ok=True)
        out = os.path.join(BUILD, 'inspect', 'preview_grid.png')
        cv2.imwrite(out, np.vstack(rows))
        print('->', out)
        return

    if args.render:
        import subprocess
        import time
        t_end = args.end if args.end is not None else M.TOTAL
        n0, n1 = int(round(args.start * FPS)), int(round(t_end * FPS))
        pr = subprocess.Popen(
            ['ffmpeg', '-y', '-hide_banner', '-loglevel', 'error',
             '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{W}x{H}',
             '-r', str(FPS), '-i', 'pipe:0', '-an', '-c:v', 'libx264',
             '-preset', 'slow', '-crf', '15', '-pix_fmt', 'yuv420p',
             args.render], stdin=subprocess.PIPE)
        t0 = time.time()
        for k in range(n0, n1):
            pr.stdin.write(render_frame(k / FPS).tobytes())
            if k % 90 == 0:
                el = time.time() - t0
                done = max(1, k - n0 + 1)
                print(f'  {k:4d}/{n1}  {k/FPS:6.2f}s  {el:6.1f}s  '
                      f'eta {el/done*(n1-n0-done):6.1f}s', flush=True)
        pr.stdin.close()
        pr.wait()
        print('rendered ->', args.render)


if __name__ == '__main__':
    main()
