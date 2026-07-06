#!/usr/bin/env python3
"""'No Way Out' — paper-collage music video renderer.

Pipeline: slice -> audio -> prep -> preview/render -> concat+mux (driven by argv).
Every frame is a pure function of its index, so rendering is chunk-parallel.
"""
import json, math, os, subprocess, sys
import numpy as np
from PIL import Image, ImageFilter, ImageEnhance

BASE = os.path.dirname(os.path.abspath(__file__))
UP = '/root/.claude/uploads/caff1ba9-6c7d-5cf3-8726-be779bd2c2d2/'
SHEET1 = UP + '352e5524-99D6DA996D734C8FB659E02063601306.png'
SHEET2 = UP + '696bbbf1-CA607A9B94684629B5C80366E273DB4C.png'
LOGO = UP + '04fb0c28-IMG_2395.jpeg'
SONG = UP + '3428db96-No_Way_Out.mp3'

W, H, FPS = 1920, 1080, 24
DUR = 219.4791
NFRAMES = int(math.ceil(DUR * FPS))          # 5268
PLATE_W = 2680                                # prepped plate width (covers 1.35x zoom)
PDIR = os.path.join(BASE, 'panels')
ADIR = os.path.join(BASE, 'assets')
FDIR = os.path.join(BASE, 'chunks')
for d in (PDIR, ADIR, FDIR):
    os.makedirs(d, exist_ok=True)

import imageio_ffmpeg
FF = imageio_ffmpeg.get_ffmpeg_exe()

# ---------------------------------------------------------------- utilities

def rng(*seed):
    return np.random.default_rng(abs(hash(seed)) % (2**32))

def smoothstep(x):
    x = np.clip(x, 0.0, 1.0)
    return x * x * (3 - 2 * x)

def value_noise(w, h, cells, seed):
    """Smooth value noise in [0,1] via upsampled random grid."""
    g = np.random.default_rng(seed).random((cells + 1, int(cells * w / h) + 1)).astype(np.float32)
    im = Image.fromarray((g * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)
    return np.asarray(im, np.float32) / 255.0

def multi_noise(w, h, seed, octaves=((6, .5), (14, .3), (48, .2))):
    n = np.zeros((h, w), np.float32)
    for i, (c, a) in enumerate(octaves):
        n += a * value_noise(w, h, c, seed + i * 101)
    n -= n.min(); n /= max(np.ptp(n), 1e-6)
    return n

# ---------------------------------------------------------------- 1. slicing

def do_slice():
    specs = [(SHEET1, 's1', 2, 3, 9), (SHEET2, 's2', 4, 4, 7)]
    for path, tag, cols, rows, inset in specs:
        im = Image.open(path).convert('RGB')
        w, h = im.size
        cw, ch = w / cols, h / rows
        for r in range(rows):
            for c in range(cols):
                box = (int(c * cw) + inset, int(r * ch) + inset,
                       int((c + 1) * cw) - inset, int((r + 1) * ch) - inset)
                p = im.crop(box)
                p.save(os.path.join(PDIR, f'{tag}p{r * cols + c}.png'))
    # contact sheet for visual verification
    names = sorted(os.listdir(PDIR))
    cs = Image.new('RGB', (6 * 320, 4 * 200), (30, 30, 30))
    for i, n in enumerate(names):
        t = Image.open(os.path.join(PDIR, n)).resize((310, 190))
        cs.paste(t, ((i % 6) * 320 + 5, (i // 6) * 200 + 5))
    cs.save(os.path.join(BASE, 'contact.png'))
    print('sliced', len(names), 'panels')

# ---------------------------------------------------------------- 2. audio

def do_audio():
    raw = subprocess.run(
        [FF, '-i', SONG, '-f', 'f32le', '-ac', '1', '-ar', '22050', '-v', 'error', '-'],
        capture_output=True).stdout
    x = np.frombuffer(raw, np.float32)
    sr, nfft, hop = 22050, 1024, 512
    nfr = 1 + (len(x) - nfft) // hop
    idx = np.arange(nfft)[None, :] + hop * np.arange(nfr)[:, None]
    frames = x[idx] * np.hanning(nfft)
    mag = np.abs(np.fft.rfft(frames, axis=1)).astype(np.float32)
    flux = np.maximum(mag[1:] - mag[:-1], 0).sum(axis=1)
    flux = np.concatenate([[0], flux])
    # smooth
    k = np.hanning(5); flux = np.convolve(flux, k / k.sum(), 'same')
    tfr = hop / sr
    # adaptive peak pick
    onsets = []
    win = int(1.0 / tfr)
    last = -10
    for i in range(3, len(flux) - 3):
        if flux[i] != flux[i - 3:i + 4].max():
            continue
        lo, hi = max(0, i - win), min(len(flux), i + win)
        if flux[i] > flux[lo:hi].mean() + 0.7 * flux[lo:hi].std() and (i - last) * tfr > 0.15:
            onsets.append(i); last = i
    ot = [i * tfr for i in onsets]
    ostr = [float(flux[i]) for i in onsets]
    thr = np.percentile(ostr, 60)
    strong = [t for t, s in zip(ot, ostr) if s >= thr]
    # intensity curve (rms, 0.5 s smoothing) sampled per video frame
    rms = np.sqrt(np.convolve(x * x, np.ones(2048) / 2048, 'same'))
    rms_t = np.arange(len(x)) / sr
    ft = np.arange(NFRAMES) / FPS
    inten = np.interp(ft, rms_t[::512], rms[::512])
    k2 = np.hanning(int(FPS * 1.0)); inten = np.convolve(inten, k2 / k2.sum(), 'same')
    lo, hi = np.percentile(inten, 5), np.percentile(inten, 97)
    inten = np.clip((inten - lo) / max(hi - lo, 1e-6), 0, 1)
    json.dump({'onsets': ot, 'strong': strong, 'intensity': inten.tolist()},
              open(os.path.join(ADIR, 'audio.json'), 'w'))
    print(f'onsets={len(ot)} strong={len(strong)} dur={len(x)/sr:.2f}s')

# ---------------------------------------------------------------- 3. prep assets

FRAG_DEFS = [  # name, panel, rel cx, cy, rel w, h
    ('lighthouse', 's1p2', .20, .45, .30, .60),
    ('bridge',     's1p2', .76, .60, .42, .45),
    ('skyline',    's1p1', .86, .28, .26, .45),
    ('clouds',     's1p0', .74, .13, .38, .24),
    ('waves',      's2p3', .50, .72, .75, .45),
    ('factory',    's2p4', .35, .38, .55, .50),
    ('tunnel',     's2p7', .50, .45, .55, .65),
    ('night',      's2p10', .50, .50, .55, .55),
    ('brick',      's1p4', .80, .40, .34, .48),
    ('news1',      's1p0', .07, .55, .13, .42),
    ('news2',      's2p6', .12, .80, .25, .30),
    ('halft',      's2p14', .15, .15, .25, .25),
]

def torn_alpha(w, h, seed, rim=True):
    """Ragged paper blob alpha (float 0..1) + white rim mask."""
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    cx, cy = w / 2, h / 2
    d = np.maximum(np.abs(xx - cx) / (w * .5), np.abs(yy - cy) / (h * .5))
    n = multi_noise(w, h, seed)
    field = d + 0.55 * (n - 0.5)
    a = smoothstep((0.97 - field) / 0.03)
    rimm = smoothstep((0.97 - field) / 0.03) - smoothstep((0.88 - field) / 0.05)
    return a.astype(np.float32), np.clip(rimm, 0, 1).astype(np.float32)

def do_prep():
    # plates: upscale + mild grade, save as npy uint8
    for n in sorted(os.listdir(PDIR)):
        im = Image.open(os.path.join(PDIR, n)).convert('RGB')
        s = PLATE_W / im.width
        im = im.resize((PLATE_W, int(im.height * s)), Image.LANCZOS)
        im = ImageEnhance.Contrast(im).enhance(1.06)
        im = im.filter(ImageFilter.UnsharpMask(radius=3, percent=55, threshold=3))
        np.save(os.path.join(ADIR, n[:-4] + '.npy'), np.asarray(im, np.uint8))
    # fragment sprites with torn edges, 5 pre-rotations each
    frags = {}
    for name, panel, cx, cy, fw, fh in FRAG_DEFS:
        im = Image.open(os.path.join(PDIR, panel + '.png')).convert('RGB')
        w, h = im.size
        bw, bh = int(fw * w), int(fh * h)
        x0 = int(np.clip(cx * w - bw / 2, 0, w - bw)); y0 = int(np.clip(cy * h - bh / 2, 0, h - bh))
        crop = im.crop((x0, y0, x0 + bw, y0 + bh))
        tw = 520; th = max(60, int(tw * bh / bw))
        crop = crop.resize((tw, th), Image.LANCZOS)
        arr = np.asarray(crop, np.float32)
        a, rim = torn_alpha(tw, th, abs(hash(name)) % 99999)
        arr = arr * (1 - rim[..., None] * .5) + 232 * rim[..., None] * .5  # pale torn rim
        rgba = np.dstack([arr, a * 255]).astype(np.uint8)
        vars_ = []
        for ang in (-7, -3.5, 0, 3.5, 7):
            v = Image.fromarray(rgba, 'RGBA').rotate(ang, Image.BICUBIC, expand=True)
            vars_.append(np.asarray(v, np.uint8))
        frags[name] = vars_
    np.savez_compressed(os.path.join(ADIR, 'frags.npz'),
                        **{f'{k}_{i}': v for k, vv in frags.items() for i, v in enumerate(vv)})
    # global textures
    paper = multi_noise(W, H, 777, ((5, .45), (18, .3), (90, .25)))
    np.save(os.path.join(ADIR, 'paper.npy'), (paper * 255).astype(np.uint8))
    yy, xx = np.mgrid[0:H, 0:W]
    per = 5
    dots = (((xx % per) - per / 2 + .5) ** 2 + ((yy % per) - per / 2 + .5) ** 2 < 2.4).astype(np.float32)
    np.save(os.path.join(ADIR, 'halftone.npy'), (dots * 255).astype(np.uint8))
    r = np.sqrt(((xx - W / 2) / (W * .62)) ** 2 + ((yy - H / 2) / (H * .62)) ** 2)
    vig = np.clip(1 - 0.38 * smoothstep((r - 0.55) / 0.6), 0.5, 1).astype(np.float32)
    np.save(os.path.join(ADIR, 'vignette.npy'), (vig * 255).astype(np.uint8))
    # wipe field for torn transitions (several directions)
    for i, ang in enumerate((0, 45, 90, 180, 225, 270)):
        a = math.radians(ang)
        grad = ((xx * math.cos(a) + yy * math.sin(a)) - min(0, W * math.cos(a)) - min(0, H * math.sin(a)))
        grad = grad / grad.max()
        f = 0.72 * grad + 0.28 * multi_noise(W, H, 3000 + i)
        f -= f.min(); f /= np.ptp(f)
        np.save(os.path.join(ADIR, f'wipe{i}.npy'), (f * 255).astype(np.uint8))
    # dark fibrous paper background (intro/outro)
    bg = multi_noise(W, H, 4242, ((4, .5), (12, .3), (60, .2)))
    base = np.dstack([bg * 34 + 16, bg * 31 + 14, bg * 27 + 12]).astype(np.uint8)
    np.save(os.path.join(ADIR, 'darkpaper.npy'), base)
    # logo as ink-stamp alpha (dark pixels of logo -> ink)
    lg = Image.open(LOGO).convert('L').resize((760, 693), Image.LANCZOS)
    la = 1 - np.asarray(lg, np.float32) / 255
    la = np.clip((la - 0.25) / 0.5, 0, 1)
    np.save(os.path.join(ADIR, 'logo.npy'), (la * 255).astype(np.uint8))
    # ink blotch sprites
    bl = []
    for i in range(8):
        n = multi_noise(240, 240, 9000 + i, ((3, .6), (10, .4)))
        yy2, xx2 = np.mgrid[0:240, 0:240]
        d = np.sqrt((xx2 - 120) ** 2 + (yy2 - 120) ** 2) / 120
        m = np.clip((n - 0.45 - 0.5 * d) * 4, 0, 1)
        bl.append((m * 255).astype(np.uint8))
    np.save(os.path.join(ADIR, 'blotches.npy'), np.stack(bl))
    print('prep done')

# ---------------------------------------------------------------- 4. timeline

# scene fields: t0 set from CUTS; plate; zoom z0->z1; pan (x,y) -1..1 start/end;
# frags: list of (name, seed); wind: scraps blowing; mode
CUTS = [0, 7, 17, 26, 34, 42, 50, 58, 66, 74, 82, 92, 100, 108,
        116, 124, 132, 140, 150, 160, 172, 186, 200, 212]

SCENES = [
    dict(mode='intro', plate='s2p3'),
    dict(plate='s1p0', z=(1.02, 1.14), pan=((0, -.1), (0, .05)), frags=[('clouds', 1), ('news1', 2)], breathe=True),
    dict(plate='s2p0', z=(1.25, 1.06), pan=((-.2, 0), (.15, 0)), frags=[('waves', 3)], wind=True),
    dict(plate='s1p4', z=(1.04, 1.18), pan=((.1, -.05), (-.1, .05)), frags=[('news2', 4)], breathe=True),
    dict(plate='s2p4', z=(1.3, 1.08), pan=((.2, .1), (-.2, -.05)), frags=[('clouds', 5), ('news1', 6)], wind=True),
    dict(plate='s2p2', z=(1.05, 1.2), pan=((0, 0), (0, -.08)), frags=[('brick', 7)]),
    dict(plate='s2p1', z=(1.02, 1.16), pan=((0, .05), (0, -.05)), frags=[('lighthouse', 8)], breathe=True),
    dict(plate='s2p3', z=(1.28, 1.05), pan=((-.25, 0), (.25, 0)), frags=[('news2', 9)], wind=True),
    dict(plate='s1p2', z=(1.35, 1.12), pan=((-.55, 0), (.55, 0)), frags=[]),           # Erie->PGH tear pan
    dict(plate='s2p6', z=(1.06, 1.22), pan=((-.15, 0), (.2, 0)), frags=[('bridge', 10)], wind=True),
    dict(plate='s1p3', z=(1.0, 1.3), pan=((0, 0), (0, 0)), frags=[('news1', 11)], breathe=True),  # tunnel push
    dict(plate='s2p7', z=(1.25, 1.04), pan=((0, .1), (0, -.08)), frags=[('halft', 12)]),
    dict(plate='s1p1', z=(1.03, 1.17), pan=((-.1, 0), (.12, 0)), frags=[('skyline', 13)], breathe=True),
    dict(plate='s2p8', z=(1.22, 1.04), pan=((.2, 0), (-.2, 0)), frags=[('news2', 14)], wind=True),
    dict(plate='s2p10', z=(1.05, 1.2), pan=((0, 0), (-.12, -.05)), frags=[('bridge', 15)]),
    dict(plate='s2p11', z=(1.2, 1.05), pan=((-.18, 0), (.18, 0)), frags=[('halft', 16)], wind=True),
    dict(plate='s1p5', z=(1.02, 1.22), pan=((0, 0), (0, 0)), frags=[], breathe=True, pulse=1.6),
    dict(plate='s2p13', z=(1.16, 1.02), pan=((.1, .05), (-.08, -.05)), frags=[('news1', 17)]),
    dict(plate='s2p9', z=(1.02, 1.2), pan=((0, .04), (0, -.06)), frags=[], breathe=True),
    dict(mode='montage', plates=['s2p12', 's1p4', 's2p8', 's2p1', 's2p11', 's2p4', 's1p1', 's2p10']),
    dict(mode='closing', plate='s2p14'),
    dict(mode='closing2', plate='s1p5'),
    dict(plate='s2p15', z=(1.3, 1.02), pan=((0, -.05), (0, .05)), frags=[('clouds', 18)], wind=True),
    dict(mode='outro'),
]

def build_timeline(audio):
    cuts = []
    for c in CUTS:
        if c == 0:
            cuts.append(0.0); continue
        cand = [o for o in audio['onsets'] if abs(o - c) < 0.7]
        cuts.append(min(cand, key=lambda o: abs(o - c)) if cand else float(c))
    cuts.append(DUR)
    for i, s in enumerate(SCENES):
        s['t0'], s['t1'] = cuts[i], cuts[i + 1]
    return SCENES

# ---------------------------------------------------------------- 5. frame engine

class Engine:
    def __init__(self):
        self.audio = json.load(open(os.path.join(ADIR, 'audio.json')))
        self.scenes = build_timeline(self.audio)
        self.inten = np.asarray(self.audio['intensity'], np.float32)
        self.strong = np.asarray(self.audio['strong'], np.float32)
        self.plates = {}
        for n in os.listdir(ADIR):
            if n.startswith(('s1p', 's2p')) and n.endswith('.npy'):
                self.plates[n[:-4]] = np.load(os.path.join(ADIR, n))
        fz = np.load(os.path.join(ADIR, 'frags.npz'))
        self.frags = {}
        for k in fz.files:
            name, i = k.rsplit('_', 1)
            self.frags.setdefault(name, [None] * 5)[int(i)] = fz[k]
        self.paper = np.load(os.path.join(ADIR, 'paper.npy')).astype(np.float32) / 255
        self.half = np.load(os.path.join(ADIR, 'halftone.npy')).astype(np.float32) / 255
        self.vig = np.load(os.path.join(ADIR, 'vignette.npy')).astype(np.float32) / 255
        self.wipes = [np.load(os.path.join(ADIR, f'wipe{i}.npy')).astype(np.float32) / 255 for i in range(6)]
        self.dark = np.load(os.path.join(ADIR, 'darkpaper.npy')).astype(np.float32)
        self.logo = np.load(os.path.join(ADIR, 'logo.npy')).astype(np.float32) / 255
        self.blot = np.load(os.path.join(ADIR, 'blotches.npy')).astype(np.float32) / 255
        self.TRANS = 0.58  # torn-wipe overlap seconds

    # ---- helpers
    def pulse(self, t):
        d = t - self.strong[self.strong <= t]
        if len(d) == 0: return 0.0
        dt = d[-1]
        return math.exp(-dt * 8.0)

    def plate_view(self, plate, zoom, panx, pany, jx, jy):
        """Crop plate so canvas shows (1/zoom) of cover-fit, panned, -> HxW float."""
        ph, pw = plate.shape[:2]
        cover = max(W / pw, H / ph)
        s = cover * max(zoom, 1.006)   # never zoom out past the plate edge
        vw, vh = W / s, H / s
        maxx, maxy = max(pw - vw, 0.0), max(ph - vh, 0.0)
        x0 = (0.5 + 0.5 * panx) * maxx + jx / s
        y0 = (0.5 + 0.5 * pany) * maxy + jy / s
        x0 = float(np.clip(x0, 0, maxx)); y0 = float(np.clip(y0, 0, maxy))
        im = Image.fromarray(plate)
        im = im.resize((W, H), Image.BILINEAR, box=(x0, y0, x0 + vw, y0 + vh))
        return np.asarray(im, np.float32)

    def blit(self, canvas, sprite, x, y, opacity=1.0):
        sh, sw = sprite.shape[:2]
        x, y = int(x), int(y)
        x0, y0 = max(0, x), max(0, y)
        x1, y1 = min(W, x + sw), min(H, y + sh)
        if x1 <= x0 or y1 <= y0: return
        sp = sprite[y0 - y:y1 - y, x0 - x:x1 - x].astype(np.float32)
        a = sp[..., 3:4] / 255 * opacity
        canvas[y0:y1, x0:x1] = canvas[y0:y1, x0:x1] * (1 - a) + sp[..., :3] * a

    def frag_path(self, name, seed, t0, t1, t, wind):
        r = rng('frag', name, seed)
        u = (t - t0) / max(t1 - t0, 1e-6)
        if wind:
            x = -600 + (W + 1200) * (u if r.random() < .5 else 1 - u) + r.uniform(-80, 80)
            y = H * r.uniform(.1, .8) + 90 * math.sin(u * 6 + seed) - 140 * u
            op = float(np.clip(3.5 * u * (1 - u) * 2, 0, .95))
        else:
            # keep static scraps in the outer bands so they never cover the face
            bx = r.uniform(.0, .16) if r.random() < .5 else r.uniform(.72, .88)
            by = r.uniform(.02, .18) if r.random() < .5 else r.uniform(.6, .78)
            x = bx * W + 46 * math.sin(u * 2.4 + seed * 2) - 90 * u
            y = by * H + 30 * math.cos(u * 1.8 + seed) + 40 * u
            op = .9
        return x, y, op

    # ---- scene composers
    def compose(self, sc, t, f):
        t0, t1 = sc['t0'], sc['t1']
        u = np.clip((t - t0) / max(t1 - t0, 1e-6), 0, 1)
        jidx = f // 3
        jr = rng('jit', jidx)
        jx, jy = jr.uniform(-2.2, 2.2), jr.uniform(-1.6, 1.6)
        mode = sc.get('mode', 'normal')
        if mode == 'intro':
            return self.compose_intro(t, u, f, jx, jy)
        if mode == 'montage':
            return self.compose_montage(sc, t, f, jx, jy)
        if mode in ('closing', 'closing2'):
            return self.compose_closing(sc, t, u, f, jx, jy, second=(mode == 'closing2'))
        if mode == 'outro':
            return self.compose_outro(t, u, f)
        z0, z1 = sc['z']
        (px0, py0), (px1, py1) = sc['pan']
        eu = smoothstep(u)
        zoom = z0 + (z1 - z0) * eu
        if sc.get('breathe'):
            zoom *= 1 + 0.004 * math.sin(t * 0.7 * 2 * math.pi / 2)
        zoom *= 1 + 0.014 * sc.get('pulse', 1.0) * self.pulse(t)
        out = self.plate_view(self.plates[sc['plate']], zoom,
                              px0 + (px1 - px0) * eu, py0 + (py1 - py0) * eu, jx, jy)
        for name, seed in sc.get('frags', []):
            x, y, op = self.frag_path(name, seed, t0, t1, t, sc.get('wind', False))
            var = self.frags[name][(jidx + seed) % 5]
            self.blit(out, var, x, y, op * 0.92)
        return out

    def compose_intro(self, t, u, f, jx, jy):
        out = self.dark.copy()
        # torn window grows, revealing the lake plate
        grow = smoothstep(u * 1.15)
        wob = 1 + 0.01 * math.sin(t * 2.1)
        plate = self.plate_view(self.plates['s2p3'], 1.3 - 0.2 * grow, -0.1 + 0.2 * grow, 0, jx, jy)
        yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
        d = np.maximum(np.abs(xx - W * .5) / (W * .5), np.abs(yy - H * .52) / (H * .5))
        n = self.paper
        field = d * wob + 0.5 * (n - 0.5)
        thr = 0.12 + 1.15 * grow
        a = smoothstep((thr - field) / 0.05)[..., None]
        rim = (smoothstep((thr - field) / 0.05) - smoothstep((thr - 0.06 - field) / 0.05))[..., None]
        out = out * (1 - a) + plate * a
        out = out * (1 - rim * .6) + 226 * rim * .6
        return out

    def compose_montage(self, sc, t, f, jx, jy):
        t0, t1 = sc['t0'], sc['t1']
        ons = [o for o in self.audio['onsets'] if t0 <= o < t1]
        segs = [t0] + ons[::2] + [t1]
        i = 0
        while i + 1 < len(segs) - 1 and segs[i + 1] <= t: i += 1
        st0, st1 = segs[i], segs[i + 1]
        plate = sc['plates'][i % len(sc['plates'])]
        su = np.clip((t - st0) / max(st1 - st0, 1e-6), 0, 1)
        r = rng('mont', i)
        z0 = r.uniform(1.06, 1.22); z1 = z0 + r.uniform(-.08, .1)
        px = r.uniform(-.25, .25); py = r.uniform(-.15, .15)
        zoom = (z0 + (z1 - z0) * su) * (1 + 0.02 * self.pulse(t))
        return self.plate_view(self.plates[plate], zoom, px, py, jx, jy)

    def compose_closing(self, sc, t, u, f, jx, jy, second=False):
        zoom = (1.04 + 0.24 * smoothstep(u)) * (1 + 0.022 * self.pulse(t))
        out = self.plate_view(self.plates[sc['plate']], zoom, 0, 0, jx, jy)
        # torn scraps converge in a shrinking ring — the collage closes in
        base = 0.55 if not second else 0.30
        n = 10 if not second else 16
        prog = smoothstep(u) if not second else smoothstep(0.35 + 0.65 * u)
        names = list(self.frags)
        jidx = f // 3
        for k in range(n):
            r = rng('close', sc['plate'], k)
            ang = r.uniform(0, 2 * math.pi) + (0.25 if second else 0.12) * t
            rad = (base + 0.75 * (1 - prog) * r.uniform(.8, 1.3)) * H
            x = W / 2 + math.cos(ang) * rad * 1.5 - 260
            y = H / 2 + math.sin(ang) * rad - 160
            fr = self.frags[names[k % len(names)]][(jidx + k) % 5]
            sc_f = 0.7 + 0.5 * r.random()
            sp = fr[::2, ::2] if sc_f < 0.95 else fr
            self.blit(out, sp, x, y, 0.95)
        # darken toward the end
        out *= (1 - 0.18 * prog * (1.0 if second else 0.5))
        return out

    def compose_outro(self, t, u, f):
        out = self.dark.copy()
        jidx = f // 3
        jr = rng('ojit', jidx)
        # logo pressed into the paper like an ink stamp
        a = smoothstep((u - 0.12) / 0.3) * 0.62
        lh, lw = self.logo.shape
        s = 0.9
        lw2, lh2 = int(lw * s), int(lh * s)
        lg = np.asarray(Image.fromarray((self.logo * 255).astype(np.uint8)).resize((lw2, lh2)), np.float32) / 255
        x0 = int(W / 2 - lw2 / 2 + jr.uniform(-1.5, 1.5)); y0 = int(H / 2 - lh2 / 2 - 30 + jr.uniform(-1.5, 1.5))
        reg = out[y0:y0 + lh2, x0:x0 + lw2]
        ink = lg[..., None] * a
        reg[:] = reg * (1 - ink) + np.array([222, 218, 210], np.float32) * ink * 0.55 + reg * ink * 0.1
        fade = 1 - smoothstep((u - 0.72) / 0.28)
        return out * fade

    # ---- global treatments + transitions
    def frame(self, f):
        t = f / FPS
        si = 0
        for i, s in enumerate(self.scenes):
            if s['t0'] <= t: si = i
        sc = self.scenes[si]
        out = self.compose(sc, t, f)
        # torn wipe into next scene
        if si + 1 < len(self.scenes):
            nt = self.scenes[si + 1]['t0']
            if t > nt - self.TRANS and sc.get('mode') != 'outro':
                p = (t - (nt - self.TRANS)) / self.TRANS
                nxt = self.compose(self.scenes[si + 1], max(t, self.scenes[si + 1]['t0'] + 1e-3), f) \
                    if t >= self.scenes[si + 1]['t0'] else self.compose_at(self.scenes[si + 1], self.scenes[si + 1]['t0'], f)
                wf = self.wipes[si % len(self.wipes)]
                thr = p * 1.12 - 0.06
                a = smoothstep((thr - wf) / 0.035)[..., None]
                rim = (smoothstep((thr - wf) / 0.035) - smoothstep((thr - 0.028 - wf) / 0.035))[..., None]
                out = out * (1 - a) + nxt * a
                out = out * (1 - rim * .55) + 224 * rim * .55
        # treatments ------------------------------------------------------
        it = float(self.inten[min(f, NFRAMES - 1)])
        roll = (f // 3) % 7
        pp = np.roll(self.paper, roll * 13, axis=1)
        out *= (0.90 + 0.18 * pp[..., None])
        luma = out.mean(axis=2, keepdims=True) / 255
        out *= (1 - 0.085 * self.half[..., None] * (1 - luma))
        # ink blotch on strong beats
        d = t - self.strong[self.strong <= t]
        if len(d) and d[-1] < 0.4 and sc.get('mode') != 'outro':
            bi = int(self.strong[self.strong <= t][-1] * 10)
            br = rng('blot', bi)
            m = self.blot[bi % 8]
            bx, by = int(br.uniform(0, W - 240)), int(br.uniform(0, H - 240))
            op = 0.28 * (1 - d[-1] / 0.4) * (0.4 + 0.6 * it)
            out[by:by + 240, bx:bx + 240] *= (1 - m[..., None] * op)
        g = np.random.default_rng(f).normal(0, 5.5 + 3.5 * it, (H, W, 1)).astype(np.float32)
        out += g
        out *= self.vig[..., None]
        out *= (1 + 0.02 * (rng('flick', f // 3).random() - 0.5))
        # slight warm sepia unification + soft S-curve
        out *= 1.07
        out = out * 0.92 + out.mean(axis=2, keepdims=True) * 0.08
        out[..., 0] *= 1.03; out[..., 2] *= 0.97
        x = np.clip(out / 255, 0, 1)
        x = x * x * (3 - 2 * x) * 0.25 + x * 0.75
        out = x * 255
        if t < 0.8: out *= t / 0.8
        if t > DUR - 0.6: out *= max(0.0, (DUR - t) / 0.6)
        return np.clip(out, 0, 255).astype(np.uint8)

    def compose_at(self, sc, t, f):
        return self.compose(sc, t, f)

# ---------------------------------------------------------------- 6. rendering

def render_chunk(args):
    c0, c1, path = args
    eng = Engine()
    w = imageio_ffmpeg.write_frames(
        path, (W, H), fps=FPS, quality=None, codec='libx264',
        output_params=['-crf', '19', '-preset', 'fast', '-pix_fmt', 'yuv420p'],
        macro_block_size=8)
    w.send(None)
    for f in range(c0, c1):
        w.send(eng.frame(f).tobytes())
    w.close()
    return path

def do_render():
    from multiprocessing import Pool
    nch = 24
    bounds = np.linspace(0, NFRAMES, nch + 1).astype(int)
    jobs = [(int(bounds[i]), int(bounds[i + 1]), os.path.join(FDIR, f'c{i:03d}.mp4'))
            for i in range(nch)]
    jobs = [j for j in jobs if not os.path.exists(j[2] + '.done')]
    with Pool(4) as p:
        for i, path in enumerate(p.imap_unordered(render_chunk, jobs)):
            open(path + '.done', 'w').write('ok')
            print(f'chunk done {i + 1}/{len(jobs)}: {os.path.basename(path)}', flush=True)

def do_finalize():
    lst = os.path.join(FDIR, 'list.txt')
    with open(lst, 'w') as fh:
        for i in range(24):
            fh.write(f"file 'c{i:03d}.mp4'\n")
    # every chunk must exist and be complete
    missing = [i for i in range(24) if not os.path.exists(os.path.join(FDIR, f'c{i:03d}.mp4.done'))]
    if missing:
        raise SystemExit(f'chunks not rendered: {missing}')
    final = os.path.join(BASE, 'No_Way_Out_Music_Video.mp4')
    subprocess.run([FF, '-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', lst,
                    '-i', SONG, '-map', '0:v:0', '-map', '1:a:0',
                    '-c:v', 'libx264', '-crf', '23', '-preset', 'medium', '-pix_fmt', 'yuv420p',
                    '-c:a', 'aac', '-b:a', '256k', '-movflags', '+faststart', final],
                   check=True, cwd=FDIR)
    print('final:', final)

def do_preview():
    eng = Engine()
    ts = [3, 12, 30, 46, 62, 70, 86, 104, 120, 136, 155, 165, 178, 192, 205, 216]
    cs = Image.new('RGB', (4 * 484, 4 * 276), (20, 20, 20))
    for i, t in enumerate(ts):
        a = eng.frame(int(t * FPS))
        im = Image.fromarray(a).resize((480, 270))
        cs.paste(im, ((i % 4) * 484 + 2, (i // 4) * 276 + 2))
    cs.save(os.path.join(BASE, 'preview.png'))
    print('preview saved')

if __name__ == '__main__':
    {'slice': do_slice, 'audio': do_audio, 'prep': do_prep,
     'preview': do_preview, 'render': do_render, 'finalize': do_finalize}[sys.argv[1]]()
