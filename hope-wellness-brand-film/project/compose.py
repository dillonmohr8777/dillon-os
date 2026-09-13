#!/usr/bin/env python3
"""
Hope Wellness Center brand film - 2.5D landscape compositor (1200x628).

Per output frame:
  1  source (clip frame or still) -> colour-matched grade, one palette for all
  2  animated view window -> hero plate that always fills the 628 height, so
     nothing is ever cropped off a head, hand, foot or held prop
  3  the frame is completed SIDEWAYS by mirroring the plate's edge region,
     stretching it across the gap and defocusing it outward - seam-exact
  4  atmospheric field + drifting organic blobs in the artwork's shape language
  5  foreground botanicals lifted from the artwork, blurred, faster parallax
  6  object-motivated transition matte between two live sections
  7  typography over a soft brand-green gradient, with 3D-pop and swipe reveals
  8  finish: bloom, vignette, fine grain

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
import particles as P

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'assets', 'source-videos')
STILLS = os.path.join(ROOT, 'assets', 'source-stills')
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


def eback(x):
    """Overshoot-free settle with a snappy front - good for pops and swipes."""
    x = float(np.clip(x, 0.0, 1.0))
    return 1.0 - (1.0 - x) ** 4


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
STILL_RAW = {}


def reader(clip):
    if clip not in READERS:
        READERS[clip] = SeqReader(os.path.join(SRC, f'upload{clip}.mp4'))
    return READERS[clip]


def still_raw(name):
    if name not in STILL_RAW:
        STILL_RAW[name] = cv2.imread(os.path.join(STILLS, name + '_norm.png'))
    return STILL_RAW[name]


# ------------------------------------------------------------------- grade
def _bg_median_img(img):
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    m = (hsv[..., 2] > 215) & (hsv[..., 1] < 70)
    if m.sum() < 500:
        m = hsv[..., 2] > np.percentile(hsv[..., 2], 80)
    return np.median(img[m], axis=0)


GAIN = {}
BGCOL = {}


def build_grades():
    tgt = np.array(M.GRADE_TARGET[::-1], np.float32)
    keys = list(range(1, 6)) + sorted({s['still'] for s in M.SHOTS if s['still']})
    for k in keys:
        if isinstance(k, int):
            r = SeqReader(os.path.join(SRC, f'upload{k}.mp4'), cache=4)
            sm = [_bg_median_img(r.get(int(t * 24))) for t in (0.5, 3.0, 6.0, 9.0)]
            bg = np.mean(sm, axis=0).astype(np.float32)
        else:
            bg = _bg_median_img(still_raw(k)).astype(np.float32)
        g = np.clip(tgt / np.maximum(bg, 1e-3), 0.90, 1.12)
        GAIN[k] = g.reshape(1, 1, 3)
        BGCOL[k] = np.clip(bg * g.reshape(3), 0, 255)
        print(f'  {str(k):16s} bg {bg.astype(int)} -> gain {g.round(4)}')


def grade(f32, key):
    p = M.GRADE[key]
    x = f32 * GAIN[key]
    piv = 204.0
    x = (x - piv) * p['con'] + piv
    y = (x[..., 0] * .114 + x[..., 1] * .587 + x[..., 2] * .299)[..., None]
    x = y + (x - y) * p['sat']
    if p['warm']:
        w = p['warm'] * 255.0
        x = x + np.array([-w, 0.0, w], np.float32)
    return np.clip(x, 0, 255)


STILL_GRADED = {}


def src_frame(shot, t_src):
    """Graded source frame for a shot - a clip frame, or a cached still."""
    if shot['still']:
        k = shot['still']
        if k not in STILL_GRADED:
            STILL_GRADED[k] = grade(still_raw(k).astype(np.float32), k)
        return STILL_GRADED[k]
    fi = t_src * 24.0
    i0 = int(math.floor(fi))
    fr = fi - i0
    rd = reader(shot['clip'])
    a = rd.get(i0).astype(np.float32)
    if fr < 0.04:
        out = a
    else:
        b = rd.get(i0 + 1).astype(np.float32)
        out = a * (1 - fr) + b * fr
    return grade(out, shot['clip'])


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
    it across the gap and defocusing it outward. The column touching the seam
    is the plate's own edge column, so continuity is exact and no tonal step
    can appear; the strip is capped narrow so a figure is never duplicated.
    """
    m = int(min(n, 104, plate.shape[1] - 1))
    src = np.ascontiguousarray((plate[:, :m] if from_left
                               else plate[:, -m:])[:, ::-1])
    ext = cv2.resize(src, (n, H), interpolation=cv2.INTER_LINEAR)
    # defocus floor proportional to the stretch: without it a strip containing
    # lettering (clip 3's rising 'hope') would read as legible reversed text
    pre = float(np.clip(5.0 + 7.0 * (n / max(1.0, m) - 1.0), 5.0, 24.0))
    ext_soft = cv2.resize(cv2.GaussianBlur(src, (0, 0), pre / max(1.0, n / m)),
                          (n, H), interpolation=cv2.INTER_LINEAR)
    ext_soft = cv2.GaussianBlur(ext_soft, (0, 0), pre)
    idx = np.arange(n, dtype=np.float32)
    d = ((n - idx) / n) if from_left else ((idx + 1) / n)
    wpre = np.clip(d * n / 36.0, 0, 1).reshape(1, -1, 1)
    base = ext * (1 - wpre) + ext_soft * wpre
    # the wider the gap, the harder it resolves to a clean field
    frac = n / float(W)
    soft = cv2.GaussianBlur(base, (0, 0), 34.0 + 80.0 * frac)
    w = (d ** 0.65).reshape(1, -1, 1)
    base = base * (1 - w) + soft * w
    w2max = float(np.clip(0.42 + 2.6 * (frac - 0.15), 0.42, 0.95))
    w2 = ((d ** 1.02) * w2max).reshape(1, -1, 1)
    gcol = np.array(M.GREEN[::-1], np.float32).reshape(1, 1, 3)
    tgt = flat * 0.94 + gcol * 0.06          # the field leans faintly green
    return base * (1 - w2) + tgt * w2


def build_background(key, plate, sx, f32, t):
    pw = plate.shape[1]
    flat = BGCOL[key].reshape(1, 1, 3)
    sxi = int(round(sx))
    r0 = sxi + pw
    bg = np.empty((H, W, 3), np.float32)
    bg[:] = flat
    if sxi > 0:
        bg[:, :sxi] = _mirror_ext(plate, sxi, flat, True)
    if r0 < W:
        bg[:, r0:] = _mirror_ext(plate, W - r0, flat, False)

    # atmosphere from BACKGROUND ONLY: a wide max filter removes the (darker)
    # figure, so this can never show a ghost double of the subject
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
    return bg * (1 - wf) + atmo * wf


def composite_plate(bg, plate, sx):
    """
    Hard composite - deliberately NO feather. The mirrored extension's column
    adjacent to the seam already IS the plate's own edge column, so an opaque
    join is pixel-continuous; feathering would cross-fade the plate into the
    fill underneath and produce the very step it was meant to hide.
    """
    pw = plate.shape[1]
    sxi = int(round(sx))
    dx0, dx1 = max(0, sxi), min(W, sxi + pw)
    if dx1 <= dx0:
        return bg
    bg[:, dx0:dx1] = plate[:, dx0 - sxi:dx1 - sxi]
    return bg


def foreground(canvas, u, t, seed):
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
    ts = 0.0 if s['still'] else s['src_in'] + (t - s['t_in']) * M.shot_speed(s)
    f32 = src_frame(s, ts)
    if u <= 1.0:
        cx, cy, vw, vh, sx = shot_view(s, u)
    else:
        a, b = s['view']
        k = (u - 1.0) * 0.5
        cx, cy, vw, vh, sx = [b[i] + (b[i] - a[i]) * k for i in range(5)]
    plate = hero_plate(f32, cx, cy, vw, vh)
    seed = abs(hash(s['id'])) % 9997
    key = M.grade_key(s)
    bg = build_background(key, plate, sx, f32, t)
    canvas = composite_plate(bg, plate, sx)
    foreground(canvas, min(u, 1.0), t, seed)
    # stills carry no internal animation, so they get a denser living layer
    dens = 11 if s['still'] else 5
    if s['id'] in ('s3_tree', 's12_read_hope'):
        dens = 8
    leaflets(canvas, t, seed + 41, n=dens, alpha=0.40 if s['still'] else 0.36)
    return canvas


# ------------------------------------------------------------- intro (ink)
INK = None
INTRO_BG = None


def intro_frame(t):
    """Magic-ink logo: particles sampled from the official artwork fly in and
    land, then the exact bitmap cross-resolves and holds."""
    global INK, INTRO_BG
    I = M.INTRO
    if INTRO_BG is None:
        # a light brand field: pale green through pale blue, plus soft blobs
        g1 = np.array([0xCF, 0xEB, 0xC6][::-1], np.float32)   # brand green tint
        g2 = np.array([0xC4, 0xD4, 0xF2][::-1], np.float32)   # brand blue tint
        yy = np.arange(H, dtype=np.float32)[:, None, None] / H
        xx = np.arange(W, dtype=np.float32)[None, :, None] / W
        k = np.clip(0.34 * (1 - xx) + 0.66 * (1 - yy), 0, 1) ** 0.88
        INTRO_BG = (g2 + (g1 - g2) * k).astype(np.float32)
        bl = blob_sprite()
        for (bw, ox, oy, al, col) in ((1320, 0.18, 0.24, 0.30, g1),
                                      (1080, 0.86, 0.80, 0.24, g2)):
            s2 = cv2.resize(bl, (bw, bw), interpolation=cv2.INTER_LINEAR)
            rgbb = np.empty((bw, bw, 3), np.float32)
            rgbb[:] = col * 0.955
            blit(INTRO_BG, rgbb, s2 * al, ox * W, oy * H, 1.0)
    if INK is None:
        INK = P.InkLogo(P.load_logo(BUILD), W, H, W / 2, I['cy'],
                        I['logo_w'], n=7400)

    canvas = INTRO_BG.copy()
    a0, a1 = I['swirl_in']
    prog = float(np.clip((t - a0) / (a1 - a0), 0.0, 1.0))

    # an opening ink bloom, so the very first frame already carries an event
    # two ink blooms, staggered, so the opening second is never empty while the
    # particle cloud builds
    r = radial((0.5, I['cy'] / H))
    gcol = np.array(M.GREEN[::-1], np.float32)
    for (t0b, db, amp) in ((0.00, 1.15, 0.62), (0.34, 1.05, 0.34)):
        bl = smooth(float(np.clip((t - t0b) / db, 0, 1)))
        if bl >= 0.999 or t < t0b:
            continue
        R = 30.0 + bl * 660.0
        ring = np.exp(-((r - R) / (52.0 + 110.0 * bl)) ** 2)
        aB = (ring * (1.0 - bl) * amp)[..., None]
        canvas = canvas * (1 - aB) + (gcol * 0.55 + 255.0 * 0.45) * aB

    # free ink motes drifting through the field
    lay, cov = P.ink_field(W, H, min(1.0, max(0.0, (t + 0.55) / 2.1)),
                           seed=5, n=520, tint=M.GREEN[::-1])
    canvas = canvas * (1 - cov[..., None] * 0.62) + lay * (cov[..., None] * 0.62)

    # drifting botanicals belong BEHIND the lockup - nothing may obstruct it
    leaflets(canvas, t, 313, n=6, alpha=0.24)

    # cross-resolve to the exact official bitmap so the settled logo is
    # pixel-identical to the downloaded asset
    h0, h1 = I['hold']
    res = float(np.clip((t - (a1 - 0.20)) / 0.42, 0.0, 1.0))

    # particles hand over completely: once the bitmap is up they are gone, so
    # nothing overlays or thickens the official strokes
    ink_a = 1.0 - smooth(res)
    if ink_a > 0.004:
        ink_layer = canvas.copy()
        INK.render(ink_layer, prog, glow=1.0 - 0.7 * prog)
        canvas = canvas * (1 - ink_a) + ink_layer * ink_a

    if res > 0.002:
        logo = P.load_logo(BUILD)
        sh, sw = logo.shape[:2]
        tw = int(round(I['logo_w']))
        th = int(round(I['logo_w'] * sh / sw))
        it = cv2.INTER_AREA if tw < sw else cv2.INTER_LANCZOS4
        lrgb = cv2.resize(logo[..., :3].astype(np.float32), (tw, th), interpolation=it)
        la = np.clip(cv2.resize(logo[..., 3].astype(np.float32) / 255.0,
                                (tw, th), interpolation=it), 0, 1)
        # held dead still at native scale: the intro lockup is the same
        # protected asset as the end card, drawn at 1:1
        blit(canvas, lrgb, la, W / 2, I['cy'], alpha=smooth(res))

    # a thin brand-green underline draws out beneath the lockup as it settles
    if t > h0 - 0.30:
        ul = smooth(float(np.clip((t - (h0 - 0.30)) / 0.55, 0, 1)))
        half = I['logo_w'] * 0.26 * ul
        y = int(I['cy'] + I['logo_w'] / 3.0921 / 2.0 + 30)
        if half > 2:
            x0, x1 = int(W / 2 - half), int(W / 2 + half)
            gcol = np.array(M.GREEN[::-1], np.float32)
            for row, wgt in ((y, 0.85), (y + 1, 0.85), (y + 2, 0.35)):
                bar = canvas[row:row + 1, x0:x1]
                canvas[row:row + 1, x0:x1] = bar * (1 - wgt) + gcol * wgt
    return canvas


# ------------------------------------------------------------- resolve card
RESOLVE_BG = None


def resolve_card(t):
    global RESOLVE_BG
    r0 = M.RESOLVE['t_in']
    if RESOLVE_BG is None:
        base = np.array(M.GRADE_TARGET[::-1], np.float32)
        xx = np.arange(W, dtype=np.float32)[None, :, None] / W
        yy = np.arange(H, dtype=np.float32)[:, None, None] / H
        g = base * (1.014 - 0.026 * yy - 0.008 * xx)
        RESOLVE_BG = np.ascontiguousarray(np.broadcast_to(g, (H, W, 3))
                                          .astype(np.float32).copy())
        # a soft brand-green wash rising from the lower left ties the card to
        # the green gradient used behind the copy throughout
        gc = np.array(M.GREEN[::-1], np.float32)
        wash = (np.clip(1.0 - np.hypot((xx - 0.16) * 1.3, (yy - 0.92)), 0, 1) ** 2.1) * 0.16
        RESOLVE_BG = RESOLVE_BG * (1 - wash) + gc * wash
        bl = blob_sprite()
        for (bw, ox, oy, al) in ((1240, 0.20, 0.26, 0.24), (1040, 0.84, 0.80, 0.20)):
            s2 = cv2.resize(bl, (bw, bw), interpolation=cv2.INTER_LINEAR)
            rgbb = np.empty((bw, bw, 3), np.float32)
            rgbb[:] = base * 0.947
            blit(RESOLVE_BG, rgbb, s2 * al, ox * W, oy * H, 1.0)
    canvas = RESOLVE_BG.copy()
    u = t - r0
    rr = np.random.default_rng(913)
    for i in range(14):
        ang = rr.uniform(0, 6.283)
        rad0 = rr.uniform(0.30, 0.95)
        ph = rr.uniform(0, 6.283)
        k = smooth(np.clip(u / 1.20, 0, 1))
        rad = lerp(rad0, 0.05, k)
        cxp = 0.50 + math.cos(ang) * rad * 0.52 + math.sin(u * 0.4 + ph) * 0.006
        cyp = 0.40 + math.sin(ang) * rad * 0.46 + math.cos(u * 0.35 + ph) * 0.006
        al = (1 - k) * 0.55 + 0.10 * max(0.0, 1 - abs(u - 1.4) / 2.6)
        if al <= 0.012:
            continue
        rgbb, a = sprite(LEAFLETS[i % len(LEAFLETS)], int(rr.uniform(26, 62)),
                         blur=rr.uniform(0.5, 2.4), rot=float(rr.uniform(0, 360)))
        blit(canvas, rgbb, a, cxp * W, cyp * H, alpha=float(al))
    leaflets(canvas, t, 771, n=5, alpha=0.20)
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


def zoom_blur(img, amount, cx=0.5, cy=0.5, steps=6):
    """Radial streak toward/away from a point, by stacking scaled copies."""
    out = img.copy()
    acc = np.zeros_like(img)
    tot = 0.0
    for i in range(steps):
        sc = 1.0 + amount * (i + 1) / steps
        Mz = cv2.getRotationMatrix2D((W * cx, H * cy), 0, sc)
        wgt = 1.0 / (i + 1)
        acc += cv2.warpAffine(img, Mz, (W, H), flags=cv2.INTER_LINEAR,
                              borderMode=cv2.BORDER_REPLICATE) * wgt
        tot += wgt
    return out * 0.25 + (acc / tot) * 0.75


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
        # the switch happens while the leaf ACTUALLY covers the frame
        m = linear_mask(np.clip((prog - 0.15) / 0.17, 0, 1), 'x', edge=340)[..., None]
        out = a * (1 - m) + b * m
        sweep = -0.32 + 1.70 * (0.28 * eout(prog) + 0.72 * prog)
        rgbb, al = sprite('frond_c3_12', 1120, blur=6, rot=-34 + 44 * prog)
        blit(out, rgbb, al, sweep * W, H * (0.62 - 0.26 * prog), alpha=0.97)
        rgb2, al2 = sprite('leaflet_c2_04', 700, blur=11, rot=22 - 40 * prog)
        blit(out, rgb2, al2, (sweep + 0.26) * W, H * (0.26 + 0.30 * prog),
             alpha=0.80)
        return out
    if kind == 'bandwipe':
        m = linear_mask(prog, 'x', edge=190)[..., None]
        out = a * (1 - m) + b * m
        xline = smooth(prog) * W
        xx = np.arange(W, dtype=np.float32)[None, :, None]
        env = np.exp(-((xx - xline) / 15.0) ** 2) * (1 - prog * 0.55)
        tint = np.array(M.GREEN[::-1], np.float32) - 150.0
        return out + env * 0.50 * (tint * 0.22 + 32.0)
    if kind == 'trailwipe':
        aa = directional_blur(a, 16.0, 2 + 104 * smooth(min(1.0, prog * 1.45)))
        m = linear_mask(prog, edge=104, angle=16.0)[..., None]
        out = aa * (1 - m) + b * m
        yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
        ang = math.radians(16.0)
        d = xx * math.cos(ang) + yy * math.sin(ang)
        d = (d - d.min()) / (d.max() - d.min())
        head = smooth(prog) * 1.22 - 0.11
        return out + np.exp(-((d - head) / 0.030) ** 2)[..., None] * (1 - prog) * 26.0
    if kind == 'swipebar':
        # a brand-green bar swipes across and drags the next shot in with it
        d = tr.get('d', 1)
        e = eback(prog)
        m = linear_mask(prog, 'x', invert=(d < 0), edge=26)[..., None]
        drag = (1.0 - e) * 150.0 * d
        Ma = np.float32([[1, 0, -drag * 0.55], [0, 1, 0]])
        Mb = np.float32([[1, 0, drag], [0, 1, 0]])
        aa = cv2.warpAffine(a, Ma, (W, H), flags=cv2.INTER_LINEAR,
                            borderMode=cv2.BORDER_REPLICATE)
        bb = cv2.warpAffine(b, Mb, (W, H), flags=cv2.INTER_LINEAR,
                            borderMode=cv2.BORDER_REPLICATE)
        out = aa * (1 - m) + bb * m
        xline = (e if d > 0 else 1 - e) * W
        xx = np.arange(W, dtype=np.float32)[None, :, None]
        core = np.exp(-((xx - xline) / 13.0) ** 2)
        halo = np.exp(-((xx - xline) / 58.0) ** 2)
        gcol = np.array(M.GREEN[::-1], np.float32)
        bar = core * 0.92 + halo * 0.22
        return out * (1 - bar) + (gcol * 0.72 + 255.0 * 0.28) * bar
    if kind == 'zoomblur':
        # the outgoing frame is driven to abstract streaks BEFORE the incoming
        # arrives, so the two never read as a double exposure
        ea = smooth(min(1.0, prog * 1.55))
        aa = zoom_blur(a, 0.62 * ea, 0.5, 0.46, steps=8)
        aa = cv2.GaussianBlur(aa, (0, 0), 1.0 + 16.0 * ea)
        eb = smooth(np.clip((prog - 0.40) / 0.60, 0, 1))
        Mz = cv2.getRotationMatrix2D((W / 2, H * 0.46), 0, lerp(1.13, 1.0, eb))
        bb = cv2.warpAffine(b, Mz, (W, H), flags=cv2.INTER_LINEAR,
                            borderMode=cv2.BORDER_REPLICATE)
        if eb < 0.92:
            bb = cv2.GaussianBlur(bb, (0, 0), 0.8 + 7.0 * (1 - eb))
        k = np.float32(eb)
        return aa * (1 - k) + bb * k
    if kind == 'push':
        d = tr.get('d', 1)
        e = eback(prog)
        off = e * W * d
        Ma = np.float32([[1, 0, off], [0, 1, 0]])
        Mb = np.float32([[1, 0, off - W * d], [0, 1, 0]])
        aa = cv2.warpAffine(a, Ma, (W, H), flags=cv2.INTER_LINEAR,
                            borderMode=cv2.BORDER_REPLICATE)
        bb = cv2.warpAffine(b, Mb, (W, H), flags=cv2.INTER_LINEAR,
                            borderMode=cv2.BORDER_REPLICATE)
        seam = np.clip((np.arange(W, dtype=np.float32)[None, :, None]
                        - (off - (0 if d > 0 else W))) / 2.0, 0, 1)
        _ = seam
        mask = np.zeros((1, W, 1), np.float32)
        cut = int(np.clip(off if d > 0 else W + off, 0, W))
        if d > 0:
            mask[0, :cut, 0] = 1.0
        else:
            mask[0, cut:, 0] = 1.0
        return bb * mask + aa * (1 - mask)
    if kind == 'inkdissolve':
        return P.ink_dissolve(a, b, prog, seed=17, cell=13)
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


def green_scrim(canvas, x0, y0, x1, y1, strength=1.0, side=1):
    """
    Soft brand-green gradient behind copy. Reads as a lit backing rather than a
    box: green is strongest low and toward the type's own edge, easing to
    nothing. Lifts contrast for the blue type instead of fighting it.
    """
    if strength <= 0.004:
        return
    px, py = 250, 156
    ax0, ay0 = max(0, int(x0 - px)), max(0, int(y0 - py))
    ax1, ay1 = min(W, int(x1 + px)), min(H, int(y1 + py))
    if ax1 <= ax0 or ay1 <= ay0:
        return
    h, w = ay1 - ay0, ax1 - ax0
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    fx = np.clip(np.minimum(xx, w - 1 - xx) / px, 0, 1)
    fy = np.clip(np.minimum(yy, h - 1 - yy) / py, 0, 1)
    base = (fx * fy) ** 0.72
    # a directional wash: green light arriving from low and from the type's
    # outer edge, easing to nothing - reads as lighting, not as a box
    grad = np.clip(0.26 + 0.74 * (yy / max(1.0, h - 1.0)) ** 0.85, 0, 1)
    ramp = (1 - xx / max(1.0, w - 1.0)) if side < 0 else (xx / max(1.0, w - 1.0))
    grad = grad * np.clip(0.34 + 0.66 * ramp, 0, 1)
    m = (base * grad)[..., None] * strength
    reg = canvas[ay0:ay1, ax0:ax1]
    gcol = np.array(M.GREEN[::-1], np.float32)
    # lift toward white first (protects contrast), then tint brand green
    lifted = reg + (255.0 - reg) * (m * 0.34)
    canvas[ay0:ay1, ax0:ax1] = lifted * (1 - m * 0.36) + gcol * (m * 0.36)


def extrude(alpha, dx, dy, steps):
    """Stack offset copies of the glyph alpha to build a 3D edge."""
    out = np.zeros_like(alpha)
    for i in range(steps, 0, -1):
        Mt = np.float32([[1, 0, dx * i], [0, 1, dy * i]])
        out = np.maximum(out, cv2.warpAffine(alpha, Mt, (alpha.shape[1],
                                                         alpha.shape[0])))
    return out


def perspective_layer(rgb, a, u, tilt=1.0):
    """Warp a text layer from a tilted 3D attitude to flat as u -> 1."""
    h, w = a.shape[:2]
    k = (1.0 - u) * tilt
    if k < 0.004:
        return rgb, a
    sx = w * 0.16 * k          # left edge recedes
    sy = h * 0.16 * k
    src = np.float32([[0, 0], [w, 0], [w, h], [0, h]])
    dst = np.float32([[sx, sy * 0.55], [w, -sy * 0.30],
                      [w, h + sy * 0.30], [sx, h - sy * 0.55]])
    Mp = cv2.getPerspectiveTransform(src, dst)
    fl = cv2.INTER_LINEAR
    return (cv2.warpPerspective(rgb, Mp, (w, h), flags=fl),
            cv2.warpPerspective(a, Mp, (w, h), flags=fl))


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
    alpha, dx, dy, blur, mask = 1.0, 0.0, 0.0, 0.0, None
    fade_out = 1.0 - smooth(np.clip((lt - (dur - 0.36)) / 0.36, 0, 1))
    scrim = 1.0 if ev.get('scrim', 'green') == 'green' else 0.0
    side = -1 if ev['align'] != 'center' and ev['x'] > W * 0.5 else 1

    if kind == 'wordblur':
        return draw_wordblur(canvas, ev, t, size, scrim, side)

    if kind == 'ripplemask':
        p = np.clip((lt - ev['rip_t0']) / ev['rip_dur'], 0, 1)
        mask = ripple_mask(ev['origin'], float(p), True, edge=130, amp=17)
        alpha = fade_out
        blur = (1 - smooth(np.clip(lt / 0.7, 0, 1))) * 4.0
    elif kind == 'riselock':
        e = smooth(np.clip(lt / 0.70, 0, 1))
        alpha, dy, blur = e * fade_out, (1 - e) * 30, (1 - e) * 5.0
    elif kind == 'swap':
        e = smooth(np.clip(lt / 0.44, 0, 1))
        o = smooth(np.clip((lt - (dur - 0.34)) / 0.34, 0, 1))
        alpha, dy = e * (1 - o), (1 - e) * 26 - o * 30
        blur = (1 - e) * 4.5 + o * 4.0
    elif kind == 'linewipe':
        p = float(np.clip(lt / 0.54, 0, 1))
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
    elif kind == 'swipe':
        return draw_swipe(canvas, ev, t, size, rgb, a, wmax, hh, pad, bx, by,
                          scrim, side)
    elif kind == 'pop3d':
        return draw_pop3d(canvas, ev, t, size, rgb, a, wmax, hh, pad, bx, by,
                          scrim, side)
    elif kind == 'disperse':
        e = smooth(np.clip(lt / 0.46, 0, 1))
        alpha, dy, blur = e, (1 - e) * 22, (1 - e) * 4.5
        if lt > dur - 0.44:
            green_scrim(canvas, bx, by, bx + wmax, by + hh,
                        scrim * 0.9, side)
            return draw_disperse(canvas, ev, t, rgb, a, wmax, hh, pad, bx, by)
    else:
        alpha = smooth(np.clip(lt / 0.5, 0, 1)) * fade_out

    if alpha <= 0.004:
        return
    green_scrim(canvas, bx, by, bx + wmax, by + hh, scrim * alpha, side)
    aa = a if blur <= 0.25 else cv2.GaussianBlur(a, (0, 0), blur)
    if mask is not None:
        if isinstance(mask, tuple):
            aa = aa * mask[1][:, :aa.shape[1]]
        else:
            oy, ox = int(by - pad + dy), int(bx - pad)
            sub = np.zeros_like(aa)
            gy0, gx0 = max(0, oy), max(0, ox)
            gy1 = min(H, oy + aa.shape[0])
            gx1 = min(W, ox + aa.shape[1])
            if gy1 > gy0 and gx1 > gx0:
                sub[gy0 - oy:gy1 - oy, gx0 - ox:gx1 - ox] = mask[gy0:gy1, gx0:gx1]
            aa = aa * sub
    blit(canvas, rgb, aa, bx - pad + aa.shape[1] / 2 + dx,
         by - pad + dy + aa.shape[0] / 2, alpha=alpha)
    if 'states' in ev:
        draw_states(canvas, ev, t, alpha)


def draw_pop3d(canvas, ev, t, size, rgb, a, wmax, hh, pad, bx, by, scrim, side):
    """Perspective tilt resolves flat over an extruded edge - a real 3D pop."""
    lt = t - ev['t_in']
    dur = ev['t_out'] - ev['t_in']
    e = eback(np.clip(lt / 0.62, 0, 1))
    fo = 1.0 - smooth(np.clip((lt - (dur - 0.34)) / 0.34, 0, 1))
    alpha = np.clip(lt / 0.24, 0, 1) * fo
    if alpha <= 0.004:
        return
    green_scrim(canvas, bx, by, bx + wmax, by + hh, scrim * alpha, side)
    sc = lerp(1.10, 1.0, e)
    prgb, pa = perspective_layer(rgb, a, e, 1.0)
    h, w = pa.shape[:2]
    if abs(sc - 1.0) > 0.002:
        nw, nh = max(2, int(w * sc)), max(2, int(h * sc))
        prgb = cv2.resize(prgb, (nw, nh), interpolation=cv2.INTER_LINEAR)
        pa = cv2.resize(pa, (nw, nh), interpolation=cv2.INTER_LINEAR)
    # extrusion depth collapses as it settles
    depth = int(round(lerp(9, 4, e)))
    ext = extrude(pa, 0.82, 1.15, depth)
    ecol = np.empty(pa.shape + (3,), np.float32)
    ecol[:] = np.array(M.INK[::-1], np.float32) * 0.72 + 40.0
    cx = bx - pad + pa.shape[1] / 2
    cy = by - pad + pa.shape[0] / 2 + (1 - e) * 16
    blit(canvas, ecol, np.clip(ext - pa, 0, 1) * 0.55, cx + 1, cy + 1, alpha)
    if e < 0.98:
        pa2 = cv2.GaussianBlur(pa, (0, 0), (1 - e) * 3.4 + 0.01)
    else:
        pa2 = pa
    blit(canvas, prgb, pa2, cx, cy, alpha)


def draw_swipe(canvas, ev, t, size, rgb, a, wmax, hh, pad, bx, by, scrim, side):
    """A hard bar swipes across and drags the letters in behind it."""
    lt = t - ev['t_in']
    dur = ev['t_out'] - ev['t_in']
    d = ev.get('swipe_d', 1)
    p = float(np.clip(lt / 0.50, 0, 1))
    e = eback(p)
    fo = 1.0 - smooth(np.clip((lt - (dur - 0.34)) / 0.34, 0, 1))
    if fo <= 0.004:
        return
    green_scrim(canvas, bx, by, bx + wmax, by + hh, scrim * fo, side)
    span = wmax + pad * 2
    xx = np.arange(span, dtype=np.float32)[None, :]
    edge = 34.0
    head = e * (span + edge * 2) - edge
    if d > 0:
        mm = np.clip((head - xx) / edge + 0.5, 0, 1)
    else:
        mm = np.clip((xx - (span - head)) / edge + 0.5, 0, 1)
    mm = (mm * mm * (3 - 2 * mm)).astype(np.float32)
    drag = (1.0 - e) * 54.0 * d
    aa = a * mm
    blit(canvas, rgb, aa, bx - pad + a.shape[1] / 2 - drag,
         by - pad + a.shape[0] / 2, alpha=fo)
    if p < 1.0:
        gx = bx - pad + (head if d > 0 else span - head)
        bar_h = int(hh * 1.02)
        bw = 7
        bar = np.empty((bar_h, bw, 3), np.float32)
        bar[:] = np.array(M.GREEN[::-1], np.float32)
        am = np.ones((bar_h, bw), np.float32) * (0.92 * (1 - p * 0.35))
        blit(canvas, bar, am, gx, by + hh * 0.48, 1.0)
        blit_glow(canvas, gx, by + hh * 0.48, 90, M.GREEN[::-1],
                  0.20 * (1 - p))


def draw_states(canvas, ev, t, alpha):
    lt = t - ev['t_in']
    sz = autofit([' '.join(ev['states'])], 'Bold', ev['states_size'],
                 ev.get('maxw', 400))
    f = font('Bold', sz)
    widths = [_PROBE.textlength(s, font=f) for s in ev['states']]
    gap = sz * 0.60
    x = float(ev['x'])
    for i, (s, w) in enumerate(zip(ev['states'], widths)):
        e = smooth(np.clip((lt - 0.26 - i * 0.085) / 0.40, 0, 1))
        if e > 0.004:
            rgb, a, wm, hh, pad = text_layer([s], 'Bold', sz, 1.1, ev['color'])
            blit(canvas, rgb, a, x - pad + a.shape[1] / 2,
                 ev['states_y'] - pad + (1 - e) * 16 + a.shape[0] / 2,
                 alpha=e * alpha)
            if i < len(widths) - 1:
                blit_glow(canvas, x + w + gap / 2, ev['states_y'] + sz * 0.62,
                          9, M.GREEN[::-1], 0.90 * e * alpha)
        x += w + gap


def draw_wordblur(canvas, ev, t, size, scrim, side):
    lt = t - ev['t_in']
    dur = ev['t_out'] - ev['t_in']
    fade_out = 1.0 - smooth(np.clip((lt - (dur - 0.38)) / 0.38, 0, 1))
    f = font(ev['weight'], size)
    lh = size * ev['lead']
    words = [ln.split(' ') for ln in ev['lines']]
    ntot = sum(len(w) for w in words)
    wmax = max(_PROBE.textlength(ln, font=f) for ln in ev['lines'])
    green_scrim(canvas, ev['x'], ev['y'], ev['x'] + wmax,
                ev['y'] + lh * len(ev['lines']), scrim * fade_out, side)
    idx = 0
    for li, ws in enumerate(words):
        x = float(ev['x'])
        for w in ws:
            e = smooth(np.clip((lt - 0.06 - idx * (0.58 / max(1, ntot))) / 0.50,
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
    lt = t - ev['t_in']
    dur = ev['t_out'] - ev['t_in']
    p = smooth(np.clip((lt - (dur - 0.44)) / 0.44, 0, 1))
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


def draw_logo(canvas, ev, t):
    """The official logo enters as ONE protected asset: scale + fade only."""
    logo = P.load_logo(BUILD)
    e = smooth(np.clip((t - ev['t_in']) / 0.46, 0, 1))
    lw = ev['logo_w'] * lerp(0.972, 1.0, e)
    sh, sw = logo.shape[:2]
    tw = int(round(lw))
    th = int(round(lw * sh / sw))                 # exact original aspect
    it = cv2.INTER_AREA if tw < sw else cv2.INTER_LANCZOS4
    blit(canvas, cv2.resize(logo[..., :3].astype(np.float32), (tw, th),
                            interpolation=it),
         np.clip(cv2.resize(logo[..., 3].astype(np.float32) / 255.0, (tw, th),
                            interpolation=it), 0, 1),
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
def section_at(t):
    if t < M.INTRO['t_out'] - 1e-6:
        return 'intro'
    for s in M.SHOTS:
        if s['t_in'] - 1e-6 <= t < s['t_out'] - 1e-6:
            return s
    return 'resolve'


def render_section(sec, t):
    if sec == 'intro':
        return intro_frame(t)
    if sec == 'resolve':
        return resolve_card(t)
    return render_shot(sec, t)


def outgoing_for(at):
    if abs(M.INTRO['t_out'] - at) < 1e-6:
        return 'intro'
    for s in M.SHOTS:
        if abs(s['t_out'] - at) < 1e-6:
            return s
    return None


def incoming_for(at):
    for s in M.SHOTS:
        if abs(s['t_in'] - at) < 1e-6:
            return s
    return 'resolve'


def render_frame(t):
    tr = None
    for x in M.TRANSITIONS:
        if x['at'] <= t < x['at'] + x['dur']:
            tr = x
    if tr is None:
        canvas = render_section(section_at(t), t)
    else:
        a = render_section(outgoing_for(tr['at']), t)
        b = render_section(incoming_for(tr['at']), t)
        canvas = apply_transition(a, b, tr, float((t - tr['at']) / tr['dur']), t)
    for ev in M.COPY:
        draw_text(canvas, ev, t)
    return finish(canvas, t).astype(np.uint8)


PREVIEW_TS = [0.30, 1.10, 1.90, 2.80, 3.60, 4.45,
              5.60, 7.40, 8.70, 10.20, 11.45, 13.20, 15.25, 16.90,
              18.10, 20.20, 21.90, 23.10, 24.60, 26.60, 28.40, 30.20,
              31.60, 32.90, 34.10, 35.60, 37.20, 38.90,
              40.40, 42.20, 43.60, 44.80, 46.60, 48.60]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--preview', action='store_true')
    ap.add_argument('--frames')
    ap.add_argument('--render')
    ap.add_argument('--start', type=float, default=0.0)
    ap.add_argument('--end', type=float, default=None)
    ap.add_argument('--cols', type=int, default=5)
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
            f = cv2.resize(render_frame(tv), (420, 220))
            cv2.putText(f, f'{tv:.2f}', (6, 18), cv2.FONT_HERSHEY_SIMPLEX,
                        0.45, (0, 0, 200), 1, cv2.LINE_AA)
            cv2.rectangle(f, (0, 0), (419, 219), (110, 110, 110), 1)
            tiles.append(f)
        while len(tiles) % cols:
            tiles.append(np.full((220, 420, 3), 255, np.uint8))
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
