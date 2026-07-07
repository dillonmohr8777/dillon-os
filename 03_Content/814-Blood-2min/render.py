#!/usr/bin/env python3
"""'No Way Out' — 2:00 paper-collage music video, 814 x 412 edition.

Evolution of the original No-Way-Out collage renderer: same torn-newsprint,
halftone, stop-motion paper world — upgraded with an electric-blue / golden-
yellow energy system (light leaks, streaks, sparks, colored torn rims, duotone
grades), beat-synced flash cuts, whip-pan transitions, a multi-panel chaos
storyboard, a two-city collide sequence, hero smoke shots, and a poster end
frame.

Pipeline: slice -> audio -> prep -> preview/render -> finalize (argv driven).
Every frame is a pure function of its index, so rendering is chunk-parallel.
"""
import json, math, os, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont

BASE = os.path.dirname(os.path.abspath(__file__))
UP = '/root/.claude/uploads/df63b23b-5860-5eb0-9e3d-887543eab16a/'
SHEET_A = UP + '54814b59-371D1967DFFF435C965580D4B9B8F3BB.png'   # 4x4 scene grid
SHEET_B = UP + '0dc25064-4118629CC91A4B1EB782E9DCFFA37993.png'   # 10-panel storyboard
PORTRAIT = UP + '29b19320-F9F9811FE2374E83BFBF9EAA189A0B4F.png'  # clean duo photo
LOGO = UP + '623899d0-IMG_2395.jpeg'                              # IMMOHRTAL mark
SONG = UP + '3958c4df-814_Blood_ft._king_Keev.mp3'

W, H, FPS = 1920, 1080, 24
DUR = 120.0
NFRAMES = int(DUR * FPS)                       # 2880
PLATE_W = 2500
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
PDIR = os.path.join(BASE, 'panels')
ADIR = os.path.join(BASE, 'assets')
FDIR = os.path.join(BASE, 'chunks')
for d in (PDIR, ADIR, FDIR):
    os.makedirs(d, exist_ok=True)

import imageio_ffmpeg
FF = imageio_ffmpeg.get_ffmpeg_exe()

BLUE = np.array([70, 160, 255], np.float32)
GOLD = np.array([255, 196, 60], np.float32)

# ---------------------------------------------------------------- utilities

def rng(*seed):
    return np.random.default_rng(abs(hash(seed)) % (2**32))

def smoothstep(x):
    x = np.clip(x, 0.0, 1.0)
    return x * x * (3 - 2 * x)

def value_noise(w, h, cells, seed):
    g = np.random.default_rng(seed).random((cells + 1, int(cells * w / h) + 1)).astype(np.float32)
    im = Image.fromarray((g * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)
    return np.asarray(im, np.float32) / 255.0

def multi_noise(w, h, seed, octaves=((6, .5), (14, .3), (48, .2))):
    n = np.zeros((h, w), np.float32)
    for i, (c, a) in enumerate(octaves):
        n += a * value_noise(w, h, c, seed + i * 101)
    n -= n.min(); n /= max(np.ptp(n), 1e-6)
    return n

def torn_alpha(w, h, seed):
    """Ragged paper blob alpha (0..1) + torn rim mask."""
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    d = np.maximum(np.abs(xx - w / 2) / (w * .5), np.abs(yy - h / 2) / (h * .5))
    n = multi_noise(w, h, seed)
    field = d + 0.5 * (n - 0.5)
    a = smoothstep((0.95 - field) / 0.04)
    rim = a - smoothstep((0.87 - field) / 0.05)
    return a.astype(np.float32), np.clip(rim, 0, 1).astype(np.float32)

# ---------------------------------------------------------------- 1. slicing

# sheet B panel boxes as fractions (x0, y0, x1, y1)
B_BOXES = {
    'b1':  (.000, .000, .315, .318), 'b2':  (.315, .000, .660, .318),
    'b3':  (.660, .000, 1.00, .318), 'b4':  (.000, .318, .297, .636),
    'b5':  (.297, .318, .617, .636), 'b6':  (.617, .318, 1.00, .636),
    'b7':  (.000, .636, .297, 1.00), 'b8':  (.297, .636, .547, 1.00),
    'b9':  (.547, .636, .722, 1.00), 'b10': (.722, .636, 1.00, 1.00),
}
# portrait photo crops (fractions of the studio duo shot)
P_BOXES = {
    'duo':     (.00, .01, 1.0, .99),
    'duo_mid': (.00, .04, 1.0, .78),
    'face814': (.12, .05, .56, .40),
    'face412': (.48, .07, .92, .42),
    'hood814': (.06, .32, .55, .74),
    'hood412': (.48, .32, .97, .74),
}

def do_slice():
    im = Image.open(SHEET_A).convert('RGB')
    w, h = im.size
    for r in range(4):
        for c in range(4):
            box = (int(c * w / 4) + 7, int(r * h / 4) + 7,
                   int((c + 1) * w / 4) - 7, int((r + 1) * h / 4) - 7)
            im.crop(box).save(os.path.join(PDIR, f'a{r * 4 + c}.png'))
    im = Image.open(SHEET_B).convert('RGB')
    w, h = im.size
    for k, (x0, y0, x1, y1) in B_BOXES.items():
        im.crop((int(x0 * w) + 5, int(y0 * h) + 5, int(x1 * w) - 5, int(y1 * h) - 5)) \
          .save(os.path.join(PDIR, k + '.png'))
    # face-free city side-plates for the collide sequence
    im = Image.open(SHEET_A).convert('RGB')
    w, h = im.size
    im.crop((int(.57 * w / 4), 7, int(w / 4) - 7, int(h / 4) - 7)) \
      .save(os.path.join(PDIR, 'erie_side.png'))       # a0 right: lighthouse + waves
    im.crop((int((2 + .58) * w / 4), 7, int(3 * w / 4) - 7, int(h / 4) - 7)) \
      .save(os.path.join(PDIR, 'pgh_side.png'))        # a2 right: PGH sign + bridge
    im = Image.open(PORTRAIT).convert('RGB')
    w, h = im.size
    for k, (x0, y0, x1, y1) in P_BOXES.items():
        im.crop((int(x0 * w), int(y0 * h), int(x1 * w), int(y1 * h))) \
          .save(os.path.join(PDIR, k + '.png'))
    names = sorted(os.listdir(PDIR))
    cols = 6
    rows = math.ceil(len(names) / cols)
    cs = Image.new('RGB', (cols * 324, rows * 210), (26, 26, 26))
    dr = ImageDraw.Draw(cs)
    for i, n in enumerate(names):
        t = Image.open(os.path.join(PDIR, n)).resize((310, 180))
        cs.paste(t, ((i % cols) * 324 + 7, (i // cols) * 210 + 7))
        dr.text(((i % cols) * 324 + 10, (i // cols) * 210 + 188), n, fill=(255, 220, 80))
    cs.save(os.path.join(BASE, 'contact.png'))
    print('sliced', len(names), 'panels')

# ---------------------------------------------------------------- 2. audio

def do_audio():
    raw = subprocess.run(
        [FF, '-i', SONG, '-t', str(DUR), '-f', 'f32le', '-ac', '1', '-ar', '22050',
         '-v', 'error', '-'], capture_output=True).stdout
    x = np.frombuffer(raw, np.float32)
    sr, nfft, hop = 22050, 1024, 512
    nfr = 1 + (len(x) - nfft) // hop
    idx = np.arange(nfft)[None, :] + hop * np.arange(nfr)[:, None]
    frames = x[idx] * np.hanning(nfft)
    mag = np.abs(np.fft.rfft(frames, axis=1)).astype(np.float32)
    flux = np.maximum(mag[1:] - mag[:-1], 0).sum(axis=1)
    flux = np.concatenate([[0], flux])
    k = np.hanning(5); flux = np.convolve(flux, k / k.sum(), 'same')
    tfr = hop / sr
    onsets, last, win = [], -10, int(1.0 / tfr)
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
    rms = np.sqrt(np.convolve(x * x, np.ones(2048) / 2048, 'same'))
    ft = np.arange(NFRAMES) / FPS
    inten = np.interp(ft, np.arange(len(x))[::512] / sr, rms[::512])
    k2 = np.hanning(FPS); inten = np.convolve(inten, k2 / k2.sum(), 'same')
    lo, hi = np.percentile(inten, 5), np.percentile(inten, 97)
    inten = np.clip((inten - lo) / max(hi - lo, 1e-6), 0, 1)
    json.dump({'onsets': ot, 'strong': strong, 'intensity': inten.tolist()},
              open(os.path.join(ADIR, 'audio.json'), 'w'))
    print(f'onsets={len(ot)} strong={len(strong)} analysed={len(x)/sr:.1f}s')

# ---------------------------------------------------------------- 3. prep

FRAG_DEFS = [  # name, panel, rel cx, cy, rel w, h — scenery only, never faces
    ('lighthouse', 'a0',  .84, .40, .26, .52),
    ('waves',      'a0',  .80, .83, .38, .30),
    ('bridge',     'a10', .32, .56, .40, .28),
    ('skyline',    'a3',  .82, .28, .32, .46),
    ('news1',      'a10', .18, .74, .34, .44),
    ('news2',      'a4',  .84, .80, .28, .34),
    ('clock',      'a14', .87, .20, .22, .38),
    ('citylights', 'b9',  .50, .30, .70, .45),
]
WORDS = [('814 BLOOD', 'white'), ('ERIE', 'blue'), ('PITTSBURGH', 'gold'),
         ('814 X 412', 'white'), ('NO HANDOUTS', 'blue'), ('BUILT NOT GIVEN', 'gold')]

def make_word(text, tint, px=120, seed=1):
    font = ImageFont.truetype(FONT, px)
    d = ImageDraw.Draw(Image.new('L', (8, 8)))
    x0, y0, x1, y1 = d.textbbox((0, 0), text, font=font)
    tw, th = x1 - x0, y1 - y0
    pw, ph = tw + int(px * 1.1), th + int(px * .9)
    col = {'white': (238, 234, 224), 'blue': tuple(int(v) for v in BLUE),
           'gold': tuple(int(v) for v in GOLD)}[tint]
    # dark torn paper backing
    a, rim = torn_alpha(pw, ph, seed * 77 + len(text))
    pn = multi_noise(pw, ph, seed * 31)
    back = np.dstack([pn * 20 + 16, pn * 19 + 15, pn * 18 + 14])
    back = back * (1 - rim[..., None] * .55) + 215 * rim[..., None] * .55
    # distressed stencil text
    tim = Image.new('L', (pw, ph), 0)
    ImageDraw.Draw(tim).text(((pw - tw) / 2 - x0, (ph - th) / 2 - y0), text,
                             font=font, fill=255)
    tim = tim.rotate(rng('wrot', text, seed).uniform(-2.5, 2.5), Image.BICUBIC)
    tm = np.asarray(tim, np.float32) / 255
    grunge = multi_noise(pw, ph, seed * 913, ((10, .4), (40, .35), (120, .25)))
    tm *= np.clip((grunge - 0.18) / 0.30, 0.15, 1)
    rgb = back * (1 - tm[..., None]) + np.array(col, np.float32) * tm[..., None]
    return np.dstack([rgb, a * 255]).astype(np.uint8)

def do_prep():
    # plates: upscale + grade -> npy
    for n in sorted(os.listdir(PDIR)):
        im = Image.open(os.path.join(PDIR, n)).convert('RGB')
        s = PLATE_W / im.width
        im = im.resize((PLATE_W, int(im.height * s)), Image.LANCZOS)
        if n.startswith('hood'):
            im = ImageEnhance.Brightness(im).enhance(1.22)
        im = ImageEnhance.Contrast(im).enhance(1.07)
        im = ImageEnhance.Color(im).enhance(1.12)
        im = im.filter(ImageFilter.UnsharpMask(radius=3, percent=60, threshold=3))
        np.save(os.path.join(ADIR, n[:-4] + '.npy'), np.asarray(im, np.uint8))
    # torn fragment sprites, 5 pre-rotations
    frags = {}
    for name, panel, cx, cy, fw, fh in FRAG_DEFS:
        im = Image.open(os.path.join(PDIR, panel + '.png')).convert('RGB')
        w, h = im.size
        bw, bh = int(fw * w), int(fh * h)
        x0 = int(np.clip(cx * w - bw / 2, 0, w - bw)); y0 = int(np.clip(cy * h - bh / 2, 0, h - bh))
        crop = im.crop((x0, y0, x0 + bw, y0 + bh))
        tw = 480; th = max(60, int(tw * bh / bw))
        arr = np.asarray(crop.resize((tw, th), Image.LANCZOS), np.float32)
        a, rim = torn_alpha(tw, th, abs(hash(name)) % 99999)
        arr = arr * (1 - rim[..., None] * .5) + 228 * rim[..., None] * .5
        rgba = np.dstack([arr, a * 255]).astype(np.uint8)
        vars_ = [np.asarray(Image.fromarray(rgba, 'RGBA').rotate(g, Image.BICUBIC, expand=True), np.uint8)
                 for g in (-7, -3.5, 0, 3.5, 7)]
        frags[name] = vars_
    np.savez_compressed(os.path.join(ADIR, 'frags.npz'),
                        **{f'{k}_{i}': v for k, vv in frags.items() for i, v in enumerate(vv)})
    # word sprites (2 rotations each) + big title
    words = {}
    for i, (txt, tint) in enumerate(WORDS):
        px = 150 if txt == 'NO WAY OUT' else 108
        for v in range(2):
            words[f'w{i}_{v}'] = make_word(txt, tint, px, seed=i * 10 + v)
    words['title_0'] = make_word('814 BLOOD', 'white', 150, seed=99)
    words['title_1'] = make_word('FT. KING KEEV', 'gold', 84, seed=98)
    np.savez_compressed(os.path.join(ADIR, 'words.npz'), **words)
    # global textures
    paper = multi_noise(W, H, 777, ((5, .45), (18, .3), (90, .25)))
    np.save(os.path.join(ADIR, 'paper.npy'), (paper * 255).astype(np.uint8))
    yy, xx = np.mgrid[0:H, 0:W]
    per = 5
    dots = (((xx % per) - per / 2 + .5) ** 2 + ((yy % per) - per / 2 + .5) ** 2 < 2.4).astype(np.float32)
    np.save(os.path.join(ADIR, 'halftone.npy'), (dots * 255).astype(np.uint8))
    r = np.sqrt(((xx - W / 2) / (W * .62)) ** 2 + ((yy - H / 2) / (H * .62)) ** 2)
    vig = np.clip(1 - 0.36 * smoothstep((r - 0.55) / 0.6), 0.52, 1).astype(np.float32)
    np.save(os.path.join(ADIR, 'vignette.npy'), (vig * 255).astype(np.uint8))
    for i, ang in enumerate((0, 45, 90, 180, 225, 270)):
        a = math.radians(ang)
        grad = ((xx * math.cos(a) + yy * math.sin(a)) - min(0, W * math.cos(a)) - min(0, H * math.sin(a)))
        grad = grad / grad.max()
        f = 0.72 * grad + 0.28 * multi_noise(W, H, 3000 + i)
        f -= f.min(); f /= np.ptp(f)
        np.save(os.path.join(ADIR, f'wipe{i}.npy'), (f * 255).astype(np.uint8))
    bg = multi_noise(W, H, 4242, ((4, .5), (12, .3), (60, .2)))
    np.save(os.path.join(ADIR, 'darkpaper.npy'),
            np.dstack([bg * 30 + 14, bg * 29 + 13, bg * 28 + 13]).astype(np.uint8))
    # corner light-leak masks (0..1)
    leaks = []
    for i, (cx, cy) in enumerate(((0, 0), (W, 0), (0, H), (W, H))):
        d = np.sqrt((xx - cx) ** 2.0 + (yy - cy) ** 2.0) / (W * 0.9)
        m = np.clip(1 - d, 0, 1) ** 2.2 * (0.6 + 0.4 * multi_noise(W, H, 5100 + i, ((4, .6), (12, .4))))
        leaks.append((m * 255).astype(np.uint8))
    np.save(os.path.join(ADIR, 'leaks.npy'), np.stack(leaks))
    # diagonal streak masks: bright slashes with directional blur
    streaks = []
    for i in range(3):
        im = Image.new('L', (W, H), 0)
        dr = ImageDraw.Draw(im)
        r = np.random.default_rng(600 + i)
        for _ in range(9):
            x = r.uniform(-W * .3, W * 1.1); y = r.uniform(-100, H)
            ln = r.uniform(300, 1400); wd = int(r.uniform(2, 7))
            dr.line([(x, y), (x + ln * .87, y + ln * .5)], fill=int(r.uniform(120, 255)), width=wd)
        im = im.resize((W // 14, H)).resize((W, H), Image.BILINEAR)  # directional smear
        streaks.append(np.asarray(im, np.uint8))
    np.save(os.path.join(ADIR, 'streaks.npy'), np.stack(streaks))
    # smoke noise fields
    np.save(os.path.join(ADIR, 'smoke.npy'), np.stack([
        (multi_noise(W, H, 7100 + i, ((3, .5), (8, .3), (24, .2))) * 255).astype(np.uint8)
        for i in range(2)]))
    # logo -> ink stamp alpha
    lg = Image.open(LOGO).convert('L')
    lg = lg.resize((520, int(520 * lg.height / lg.width)), Image.LANCZOS)
    la = 1 - np.asarray(lg, np.float32) / 255
    la = np.clip((la - 0.25) / 0.5, 0, 1)
    np.save(os.path.join(ADIR, 'logo.npy'), (la * 255).astype(np.uint8))
    # ink blotches
    bl = []
    for i in range(8):
        n = multi_noise(240, 240, 9000 + i, ((3, .6), (10, .4)))
        yy2, xx2 = np.mgrid[0:240, 0:240]
        d = np.sqrt((xx2 - 120) ** 2 + (yy2 - 120) ** 2) / 120
        bl.append((np.clip((n - 0.45 - 0.5 * d) * 4, 0, 1) * 255).astype(np.uint8))
    np.save(os.path.join(ADIR, 'blotches.npy'), np.stack(bl))
    print('prep done')

# ---------------------------------------------------------------- 4. timeline
# target cut times (snapped to onsets); scenes carry energy color + fx flags

SCENES = [
    # -- INTRO 0:00-0:15 ------------------------------------------------
    dict(t=0.0,  mode='reveal', plate='a9', energy='blue'),
    dict(t=4.2,  plate='b4', z=(1.05, 1.22), pan=((-.1, 0), (.1, 0)), energy='both',
         frags=[('news1', 2)], headline=True),
    dict(t=8.2,  plate='face814', z=(1.02, 1.2), pan=((0, -.05), (0, .05)), energy='blue',
         breathe=True),
    dict(t=11.6, plate='face412', z=(1.02, 1.2), pan=((0, .05), (0, -.05)), energy='gold',
         breathe=True, flash=True),
    # -- BUILD 1 0:15-0:35 ----------------------------------------------
    dict(t=15.0, plate='a4', z=(1.24, 1.05), pan=((-.2, 0), (.2, 0)), energy='blue',
         frags=[('waves', 3)], wind=True, flash=True),
    dict(t=17.5, plate='a8', z=(1.04, 1.2), pan=((.1, 0), (-.1, 0)), energy='blue',
         frags=[('lighthouse', 4)], flash=True),
    dict(t=20.0, plate='hood814', z=(1.05, 1.18), pan=((0, 0), (0, .06)), energy='blue',
         breathe=True, flash=True),
    dict(t=22.5, plate='a1', z=(1.25, 1.06), pan=((.15, 0), (-.15, 0)), energy='blue',
         frags=[('news1', 5)], wind=True, flash=True),
    dict(t=25.0, plate='a3', z=(1.05, 1.22), pan=((-.1, 0), (.15, 0)), energy='gold',
         frags=[('bridge', 6)], flash=True),
    dict(t=27.5, plate='a10', z=(1.22, 1.04), pan=((.2, 0), (-.2, 0)), energy='gold',
         frags=[('skyline', 7)], wind=True, flash=True),
    dict(t=30.0, plate='hood412', z=(1.05, 1.18), pan=((0, .04), (0, -.04)), energy='gold',
         breathe=True, flash=True),
    dict(t=32.5, plate='a13', z=(1.2, 1.05), pan=((-.15, 0), (.1, 0)), energy='gold',
         frags=[('news2', 8)], wind=True, flash=True),
    # -- PERFORMANCE 0:35-0:55 -------------------------------------------
    dict(t=35.0, plate='a5', z=(1.03, 1.24), pan=((0, 0), (0, -.04)), energy='both',
         breathe=True, pulse=1.5, whip=True),
    dict(t=38.0, plate='a12', z=(1.24, 1.04), pan=((-.18, 0), (.18, 0)), energy='both',
         frags=[('news1', 9)], whip=True),
    dict(t=41.0, plate='b3', z=(1.05, 1.22), pan=((-.12, 0), (.12, 0)), energy='gold',
         breathe=True, pulse=1.5, whip=True),
    dict(t=44.0, plate='a6', z=(1.02, 1.26), pan=((0, 0), (0, 0)), energy='gold',
         pulse=1.6, whip=True),
    dict(t=46.6, plate='b1', z=(1.2, 1.04), pan=((.15, 0), (-.15, 0)), energy='blue',
         frags=[('news2', 10)], whip=True),
    dict(t=49.2, plate='a14', z=(1.04, 1.2), pan=((0, .05), (0, -.05)), energy='both',
         frags=[('clock', 11)], breathe=True, whip=True),
    dict(t=51.8, plate='b5', z=(1.05, 1.26), pan=((0, 0), (0, -.05)), energy='both',
         pulse=1.6, whip=True),
    # -- CHAOS COLLAGE 0:55-1:15 ------------------------------------------
    dict(t=55.0, mode='chaos'),
    # -- BUILD 2 / BIGGER WORLD 1:15-1:40 ---------------------------------
    dict(t=75.0, plate='a0', z=(1.06, 1.28), pan=((-.15, .05), (.15, -.05)), energy='blue',
         frags=[('waves', 12)], wind=True, flash=True),
    dict(t=78.5, plate='b6', z=(1.22, 1.04), pan=((-.2, 0), (.2, 0)), energy='both',
         wind=True, frags=[('news1', 13)], flash=True),
    dict(t=82.0, plate='a2', z=(1.05, 1.26), pan=((.1, 0), (-.12, 0)), energy='gold',
         frags=[('bridge', 14)], flash=True),
    dict(t=85.5, mode='collide'),
    dict(t=93.0, plate='b2', z=(1.02, 1.3), pan=((0, 0), (0, -.05)), energy='both',
         pulse=1.7, flash=True),
    dict(t=96.4, plate='a15', z=(1.18, 1.03), pan=((-.12, 0), (.12, 0)), energy='both',
         frags=[('citylights', 15)], wind=True),
    # -- HERO 1:40-1:55 ----------------------------------------------------
    dict(t=100.0, mode='smoke', plate='duo_mid', push=(1.00, 1.14)),
    dict(t=104.0, mode='split', left='face814', right='face412'),
    dict(t=107.6, mode='split', left='hood814', right='hood412'),
    dict(t=110.6, mode='smoke', plate='duo', push=(1.06, 1.22)),
    # -- END FRAME 1:55-2:00 ------------------------------------------------
    dict(t=115.0, mode='poster'),
]
CHAOS_POOL = ['a4', 'a6', 'a9', 'a10', 'a11', 'a13', 'face814', 'face412',
              'hood814', 'hood412', 'b7', 'a12', 'b4', 'b8', 'b9', 'b10', 'a15']
FLASH_POOL = ['hood814', 'hood412', 'face814', 'face412', 'a9', 'a10']
LAYOUTS = [
    [(0, 0, 1 / 3, 1), (1 / 3, 0, 2 / 3, 1), (2 / 3, 0, 1, 1)],
    [(0, 0, .5, .5), (.5, 0, 1, .5), (0, .5, .5, 1), (.5, .5, 1, 1)],
    [(0, 0, .62, 1), (.62, 0, 1, .5), (.62, .5, 1, 1)],
]

def build_timeline(audio):
    scenes = [dict(s) for s in SCENES]
    for s in scenes:
        c = s['t']
        if c == 0.0:
            s['t0'] = 0.0; continue
        cand = [o for o in audio['onsets'] if abs(o - c) < 0.6]
        s['t0'] = min(cand, key=lambda o: abs(o - c)) if cand else float(c)
    for i, s in enumerate(scenes):
        s['t1'] = scenes[i + 1]['t0'] if i + 1 < len(scenes) else DUR
    return scenes

# ---------------------------------------------------------------- 5. engine

class Engine:
    def __init__(self):
        self.audio = json.load(open(os.path.join(ADIR, 'audio.json')))
        self.scenes = build_timeline(self.audio)
        self.inten = np.asarray(self.audio['intensity'], np.float32)
        self.strong = np.asarray(self.audio['strong'], np.float32)
        self.plates = {n[:-4]: np.load(os.path.join(ADIR, n))
                       for n in os.listdir(ADIR)
                       if n.endswith('.npy') and (n[0] in 'ab' and n[1].isdigit()
                                                  or n.startswith(('face', 'hood', 'duo',
                                                                   'erie_', 'pgh_')))}
        fz = np.load(os.path.join(ADIR, 'frags.npz'))
        self.frags = {}
        for k in fz.files:
            name, i = k.rsplit('_', 1)
            self.frags.setdefault(name, [None] * 5)[int(i)] = fz[k]
        wz = np.load(os.path.join(ADIR, 'words.npz'))
        self.words = {k: wz[k] for k in wz.files}
        self.paper = np.load(os.path.join(ADIR, 'paper.npy')).astype(np.float32) / 255
        self.half = np.load(os.path.join(ADIR, 'halftone.npy')).astype(np.float32) / 255
        self.vig = np.load(os.path.join(ADIR, 'vignette.npy')).astype(np.float32) / 255
        self.wipes = [np.load(os.path.join(ADIR, f'wipe{i}.npy')).astype(np.float32) / 255 for i in range(6)]
        self.dark = np.load(os.path.join(ADIR, 'darkpaper.npy')).astype(np.float32)
        self.leaks = np.load(os.path.join(ADIR, 'leaks.npy')).astype(np.float32) / 255
        self.streaks = np.load(os.path.join(ADIR, 'streaks.npy')).astype(np.float32) / 255
        self.smoke = np.load(os.path.join(ADIR, 'smoke.npy')).astype(np.float32) / 255
        self.logo = np.load(os.path.join(ADIR, 'logo.npy')).astype(np.float32) / 255
        self.blot = np.load(os.path.join(ADIR, 'blotches.npy')).astype(np.float32) / 255
        self.TRANS = 0.45
        self._cellcache = {}
        self._poster = None

    # ---- helpers ------------------------------------------------------
    def pulse(self, t):
        d = t - self.strong[self.strong <= t]
        return math.exp(-float(d[-1]) * 8.0) if len(d) else 0.0

    def ecol(self, sc, t=0.0):
        e = sc.get('energy')
        if e == 'blue': return BLUE
        if e == 'gold': return GOLD
        if e == 'both': return BLUE if int(t * 2) % 2 else GOLD
        return None

    def plate_view(self, plate, zoom, panx, pany, jx, jy, ow=W, oh=H):
        ph, pw = plate.shape[:2]
        cover = max(ow / pw, oh / ph)
        s = cover * max(zoom, 1.006)
        vw, vh = ow / s, oh / s
        maxx, maxy = max(pw - vw, 0.0), max(ph - vh, 0.0)
        x0 = float(np.clip((0.5 + 0.5 * panx) * maxx + jx / s, 0, maxx))
        y0 = float(np.clip((0.5 + 0.5 * pany) * maxy + jy / s, 0, maxy))
        im = Image.fromarray(plate)
        im = im.resize((ow, oh), Image.BILINEAR, box=(x0, y0, x0 + vw, y0 + vh))
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
            bx = r.uniform(.0, .15) if r.random() < .5 else r.uniform(.72, .87)
            by = r.uniform(.02, .16) if r.random() < .5 else r.uniform(.62, .78)
            x = bx * W + 46 * math.sin(u * 2.4 + seed * 2) - 90 * u
            y = by * H + 30 * math.cos(u * 1.8 + seed) + 40 * u
            op = .9
        return x, y, op

    def sparks(self, out, t, f, col, n=26, amt=1.0):
        r = rng('spk', f // 2)
        base = rng('spkb', int(t))
        for k in range(n):
            rr = rng('spark', k, int(t * 0.5))
            x = int((rr.random() + 0.05 * t * (0.5 + rr.random())) % 1.0 * W)
            y = int((rr.random() - 0.12 * (t % 8) * rr.random()) % 1.0 * H)
            v = amt * (0.35 + 0.65 * r.random())
            s = 2 if rr.random() < .7 else 3
            out[y:y + s, x:x + s] = np.minimum(255, out[y:y + s, x:x + s] + col * v)

    def energy_fx(self, out, sc, t, f, it):
        col = self.ecol(sc, t)
        if col is None:
            return
        p = self.pulse(t)
        cn = col / 255
        # duotone-ish grade: push highlights toward energy color
        luma = out.mean(axis=2, keepdims=True) / 255
        out += cn * (luma ** 1.7) * (26 + 34 * it)
        # corner light leak, breathing with beat
        li = (f // 40) % 4
        amt = 0.14 + 0.10 * it + 0.22 * p
        leak = self.leaks[li][..., None] * amt
        out[:] = 255 - (255 - out) * (1 - leak * cn[None, None, :])
        # streak slashes on beats
        if p > 0.25:
            st = self.streaks[f % 3]
            st = np.roll(st, (f * 37) % W, axis=1)
            out += st[..., None] * col * (0.55 * p)
        self.sparks(out, t, f, col, n=int(10 + 26 * it), amt=0.5 + 0.5 * p)

    # ---- scene composers ------------------------------------------------
    def compose(self, sc, t, f):
        t0, t1 = sc['t0'], sc['t1']
        u = float(np.clip((t - t0) / max(t1 - t0, 1e-6), 0, 1))
        jidx = f // 3
        jr = rng('jit', jidx)
        jx, jy = jr.uniform(-2.2, 2.2), jr.uniform(-1.6, 1.6)
        mode = sc.get('mode', 'normal')
        if mode == 'reveal':  return self.compose_reveal(sc, t, u, f, jx, jy)
        if mode == 'chaos':   return self.compose_chaos(sc, t, f, jx, jy)
        if mode == 'collide': return self.compose_collide(sc, t, u, f, jx, jy)
        if mode == 'smoke':   return self.compose_smoke(sc, t, u, f, jx, jy)
        if mode == 'split':   return self.compose_split(sc, t, u, f, jx, jy)
        if mode == 'poster':  return self.compose_poster(t, u, f, jx, jy)
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
            self.blit(out, self.frags[name][(jidx + seed) % 5], x, y, op * 0.92)
        if sc.get('headline'):
            # flickering headline scraps pinned to the frame corners (never on faces)
            for k in range(3):
                hr = rng('head', k)
                fl = 0.55 + 0.45 * (rng('headf', f // 2, k).random())
                nm = ('news1', 'news2', 'clock')[k]
                spr = self.frags[nm][(jidx + k) % 5][::2, ::2]
                x = hr.uniform(.01, .10) * W if hr.random() < .5 else hr.uniform(.78, .88) * W
                y = hr.uniform(.0, .05) * H if hr.random() < .5 else hr.uniform(.70, .80) * H
                self.blit(out, spr, x, y, 0.7 * fl)
        return out

    def compose_reveal(self, sc, t, u, f, jx, jy):
        out = self.dark.copy()
        grow = smoothstep(u * 1.1)
        wob = 1 + 0.01 * math.sin(t * 2.1)
        plate = self.plate_view(self.plates[sc['plate']], 1.3 - 0.2 * grow,
                                -0.1 + 0.2 * grow, 0, jx, jy)
        luma = plate.mean(axis=2, keepdims=True) / 255
        plate += (BLUE / 255) * (luma ** 1.7) * 30
        yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
        d = np.maximum(np.abs(xx - W * .5) / (W * .5), np.abs(yy - H * .52) / (H * .5))
        field = d * wob + 0.5 * (self.paper - 0.5)
        thr = 0.10 + 1.2 * grow
        a = smoothstep((thr - field) / 0.05)[..., None]
        rim = (smoothstep((thr - field) / 0.05) - smoothstep((thr - 0.06 - field) / 0.05))[..., None]
        out = out * (1 - a) + plate * a
        out = out * (1 - rim * .6) + rim * .6 * (0.5 * np.array([226, 228, 232]) + 0.5 * BLUE)
        return out

    def cell_alpha(self, cw, ch, seed):
        key = (cw, ch, seed % 4)
        if key not in self._cellcache:
            self._cellcache[key] = torn_alpha(cw, ch, 4400 + seed % 4)
        return self._cellcache[key]

    def compose_chaos(self, sc, t, f, jx, jy):
        t0, t1 = sc['t0'], sc['t1']
        ons = [o for o in self.audio['onsets'] if t0 <= o < t1]
        segs = [t0] + ons[::2] + [t1]
        i = 0
        while i + 1 < len(segs) - 1 and segs[i + 1] <= t: i += 1
        st0, st1 = segs[i], segs[i + 1]
        su = float(np.clip((t - st0) / max(st1 - st0, 1e-6), 0, 1))
        out = self.dark.copy()
        lay = LAYOUTS[(i // 2) % len(LAYOUTS)]
        gap = 12
        for ci, (x0, y0, x1, y1) in enumerate(lay):
            cx0, cy0 = int(x0 * W) + gap, int(y0 * H) + gap
            cx1, cy1 = int(x1 * W) - gap, int(y1 * H) - gap
            cw, ch = cx1 - cx0, cy1 - cy0
            r = rng('cell', i, ci)
            plate = self.plates[CHAOS_POOL[int(r.integers(len(CHAOS_POOL)))]]
            z0 = r.uniform(1.08, 1.3)
            zoom = z0 + r.uniform(-.1, .12) * su
            view = self.plate_view(plate, max(zoom, 1.02), r.uniform(-.3, .3),
                                   r.uniform(-.2, .2), jx, jy, cw, ch)
            col = BLUE if (i + ci) % 2 else GOLD
            luma = view.mean(axis=2, keepdims=True) / 255
            view += (col / 255) * (luma ** 1.7) * 34
            a, rim = self.cell_alpha(cw, ch, ci + i)
            a = a[..., None]; rim = rim[..., None]
            view = view * (1 - rim * .55) + rim * .55 * (0.6 * 225 + 0.4 * col)
            reg = out[cy0:cy1, cx0:cx1]
            reg[:] = reg * (1 - a) + view * a
        # word overlays keyed to strong beats
        ws = [o for o in self.strong if t0 <= o <= t]
        if ws:
            wi = (len(ws) - 1) % len(WORDS)
            dt = t - ws[-1]
            if dt < 1.35:
                spr = self.words[f'w{wi}_{(len(ws) - 1) // len(WORDS) % 2}']
                pop = 1.0 + 0.14 * math.exp(-dt * 9)
                sh, sw = spr.shape[:2]
                nw, nh = int(sw * pop), int(sh * pop)
                spr2 = np.asarray(Image.fromarray(spr, 'RGBA').resize((nw, nh)), np.uint8)
                op = min(1, dt / 0.06) * (1 - smoothstep((dt - 1.0) / 0.35))
                wr = rng('wpos', len(ws))
                x = W * wr.uniform(.18, .55) - nw / 2 + W * .25
                y = H * wr.uniform(.25, .7) - nh / 2
                self.blit(out, spr2, x - W * .25 + W * .25, y, op)
        return out

    def compose_collide(self, sc, t, u, f, jx, jy):
        # face-free full-res panels: 814 blue brick vs 412 gold sign colliding
        left = self.plate_view(self.plates['a9'], 1.12 + 0.1 * u, -0.2 + 0.3 * u, 0, jx, jy)
        right = self.plate_view(self.plates['a10'], 1.22 - 0.1 * u, 0.2 - 0.3 * u, 0, jx, jy)
        for pl, col in ((left, BLUE), (right, GOLD)):
            luma = pl.mean(axis=2, keepdims=True) / 255
            pl += (col / 255) * (luma ** 1.6) * 44
        xxn = np.linspace(0, 1, W, dtype=np.float32)[None, :].repeat(H, 0)
        wob = 0.06 * (self.paper - 0.5) + 0.03 * math.sin(t * 1.7)
        seam = 0.5 + 0.10 * math.sin(t * 0.9) * (1 - u * 0.5)
        field = xxn + wob
        a = smoothstep((field - seam) / 0.02)[..., None]
        out = left * (1 - a) + right * a
        rim = (smoothstep((field - seam + 0.012) / 0.012) -
               smoothstep((field - seam - 0.012) / 0.012))
        p = self.pulse(t)
        rimc = (np.array([235, 238, 242]) * (0.6 + 0.4 * p))
        out = out * (1 - rim[..., None] * (0.5 + 0.5 * p)) + rimc * rim[..., None] * (0.5 + 0.5 * p)
        # lightning flash along the seam on strong beats
        if p > 0.3:
            st = np.roll(self.streaks[f % 3], (f * 53) % W, axis=1)
            out += st[..., None] * (BLUE * 0.5 + GOLD * 0.5) * (0.8 * p)
        jidx = f // 3
        for k, (nm, sd) in enumerate((('waves', 21), ('bridge', 22), ('news1', 23), ('news2', 24))):
            x, y, op = self.frag_path(nm, sd, sc['t0'], sc['t1'], t, True)
            self.blit(out, self.frags[nm][(jidx + k) % 5], x, y, op)
        self.sparks(out, t, f, BLUE, 16, 0.8)
        self.sparks(out, t, f + 7, GOLD, 16, 0.8)
        return out

    def compose_smoke(self, sc, t, u, f, jx, jy):
        out = self.dark.copy() * 1.15
        # smoke breathes by crossfading two fields (no scroll -> no wrap seams)
        w1 = 0.5 + 0.45 * math.sin(t * 0.55)
        w2 = 0.5 + 0.45 * math.sin(t * 0.71 + 2.1)
        s1 = self.smoke[0] * w1 + self.smoke[1] * (1 - w1)
        s2 = self.smoke[1] * w2 + self.smoke[0] * (1 - w2)
        xxn = np.linspace(0, 1, W, dtype=np.float32)[None, :]
        p = self.pulse(t)
        amt = 0.95 + 0.4 * p
        out += (s1 ** 1.5)[..., None] * BLUE * amt * (1 - xxn)[..., None]
        out += (s2 ** 1.5)[..., None] * GOLD * amt * xxn[..., None]
        # portrait pasted as giant torn photo, slow push-in
        p0, p1 = sc['push']
        ph = int(H * (p0 + (p1 - p0) * smoothstep(u)))
        plate = self.plates[sc['plate']]
        pw = int(ph * plate.shape[1] / plate.shape[0])
        im = np.asarray(Image.fromarray(plate).resize((pw, ph), Image.BILINEAR), np.float32)
        a, rim = self.cell_alpha(pw, ph, 3)
        im = im * (1 - rim[..., None] * .5) + 226 * rim[..., None] * .5
        spr = np.dstack([im, a * 255]).astype(np.uint8)
        # drop shadow; keep heads in frame when pushed past full height
        x = W / 2 - pw / 2 + jx
        y = -(ph - H) * 0.22 + jy if ph > H else H / 2 - ph / 2 + jy
        sh = np.zeros((ph, pw, 4), np.uint8); sh[..., 3] = (a * 160).astype(np.uint8)
        self.blit(out, sh, x + 16, y + 18, 0.8)
        self.blit(out, spr, x, y, 1.0)
        out *= 1 + 0.05 * p
        self.sparks(out, t, f, BLUE, 14, 0.9)
        self.sparks(out, t, f + 3, GOLD, 14, 0.9)
        return out

    def compose_split(self, sc, t, u, f, jx, jy):
        eu = smoothstep(u)
        zl = 1.06 + 0.16 * eu + 0.02 * self.pulse(t)
        zr = 1.22 - 0.14 * eu + 0.02 * self.pulse(t)
        left = self.plate_view(self.plates[sc['left']], zl, 0, -0.05 + 0.1 * eu, jx, jy, W // 2, H)
        right = self.plate_view(self.plates[sc['right']], zr, 0, 0.05 - 0.1 * eu, jx, jy, W - W // 2, H)
        for pl, col in ((left, BLUE), (right, GOLD)):
            luma = pl.mean(axis=2, keepdims=True) / 255
            pl += (col / 255) * (luma ** 1.7) * 38
        out = np.concatenate([left, right], axis=1)
        # torn center seam
        xxn = np.linspace(0, 1, W, dtype=np.float32)[None, :].repeat(H, 0)
        field = xxn + 0.04 * (self.paper - 0.5)
        rim = (smoothstep((field - 0.5 + 0.010) / 0.010) -
               smoothstep((field - 0.5 - 0.010) / 0.010))
        out = out * (1 - rim[..., None] * .6) + 230 * rim[..., None] * .6
        self.sparks(out, t, f, BLUE, 10, 0.8)
        self.sparks(out, t, f + 5, GOLD, 10, 0.8)
        return out

    def build_poster(self):
        pw, ph = int(W * 1.12), int(H * 1.12)
        out = np.asarray(Image.fromarray(self.dark.astype(np.uint8)).resize((pw, ph)),
                         np.float32) * 1.15

        def blit_big(spr, bx, by, op=1.0):
            shh, sww = spr.shape[:2]
            x0, y0 = max(0, int(bx)), max(0, int(by))
            x1, y1 = min(pw, int(bx) + sww), min(ph, int(by) + shh)
            if x1 <= x0 or y1 <= y0: return
            sp = spr[y0 - int(by):y1 - int(by), x0 - int(bx):x1 - int(bx)].astype(np.float32)
            al = sp[..., 3:4] / 255 * op
            out[y0:y1, x0:x1] = out[y0:y1, x0:x1] * (1 - al) + sp[..., :3] * al

        # side city plates (no faces): Erie 814 brick left, Pittsburgh 412 right
        sw = int(pw * 0.34); sh2 = int(ph * 0.78); sy = int(ph * 0.14)
        for px, plate, col, pan in ((int(pw * 0.01), 'a9', BLUE, -0.2),
                                    (pw - sw - int(pw * 0.01), 'a10', GOLD, 0.2)):
            view = self.plate_view(self.plates[plate], 1.02, pan, 0, 0, 0, sw, sh2)
            luma = view.mean(axis=2, keepdims=True) / 255
            view += (col / 255) * (luma ** 1.6) * 46
            a, rim = torn_alpha(sw, sh2, 8800 + px)
            view = view * (1 - rim[..., None] * .5) + rim[..., None] * .5 * (0.5 * 228 + 0.5 * col)
            spr = np.dstack([np.clip(view, 0, 255), a * 255 * .96]).astype(np.uint8)
            blit_big(spr, px, sy)
        # centre duo portrait, torn photo with drop shadow
        plate = self.plates['duo']
        dh = int(ph * 0.74); dw = int(dh * plate.shape[1] / plate.shape[0])
        im = np.asarray(Image.fromarray(plate).resize((dw, dh), Image.BILINEAR), np.float32)
        a, rim = torn_alpha(dw, dh, 9911)
        im = im * (1 - rim[..., None] * .5) + 230 * rim[..., None] * .5
        x = pw // 2 - dw // 2; y = ph - dh - int(ph * 0.03)
        shadow = np.zeros((dh, dw, 4), np.uint8); shadow[..., 3] = (a * 170).astype(np.uint8)
        blit_big(shadow, x + 20, y + 22, 0.85)
        blit_big(np.dstack([im, a * 255]).astype(np.uint8), x, y)
        # title stack top centre
        tt = self.words['title_0']
        blit_big(tt, pw / 2 - tt.shape[1] / 2, ph * 0.02)
        tg = self.words['title_1']
        blit_big(tg, pw / 2 - tg.shape[1] / 2, ph * 0.02 + tt.shape[0] * 0.82)
        # logo ink stamp, lower-left corner
        lh, lw = self.logo.shape
        s = 0.34
        lg = np.asarray(Image.fromarray((self.logo * 255).astype(np.uint8))
                        .resize((int(lw * s), int(lh * s))), np.float32) / 255
        lx = int(pw * 0.045); ly = int(ph * 0.78)
        reg = out[ly:ly + lg.shape[0], lx:lx + lg.shape[1]]
        ink = lg[..., None] * 0.5
        reg[:] = reg * (1 - ink) + np.array([228, 226, 220], np.float32) * ink
        return np.clip(out, 0, 255).astype(np.uint8)

    def compose_poster(self, t, u, f, jx, jy):
        if self._poster is None:
            self._poster = self.build_poster()
        zoom = 1.0 + 0.05 * smoothstep(u)
        out = self.plate_view(self._poster, zoom, 0, 0, jx * .5, jy * .5)
        p = self.pulse(t)
        out *= 1 + 0.04 * p
        self.sparks(out, t, f, BLUE, 12, 0.8)
        self.sparks(out, t, f + 9, GOLD, 12, 0.8)
        return out

    # ---- top level -------------------------------------------------------
    def scene_at(self, t):
        si = 0
        for i, s in enumerate(self.scenes):
            if s['t0'] <= t: si = i
        return si

    def frame(self, f):
        t = f / FPS
        si = self.scene_at(t)
        sc = self.scenes[si]
        out = self.compose(sc, t, f)
        it = float(self.inten[min(f, NFRAMES - 1)])
        # 3-frame flash inserts on strong beats (build sections)
        if sc.get('flash'):
            d = t - self.strong[self.strong <= t]
            if len(d) and d[-1] < 3 / FPS:
                bi = int(self.strong[self.strong <= t][-1] * 7)
                br = rng('flash', bi)
                if br.random() < 0.5:
                    plate = self.plates[FLASH_POOL[int(br.integers(len(FLASH_POOL)))]]
                    out = self.plate_view(plate, 1.4, br.uniform(-.3, .3), br.uniform(-.3, .3),
                                          0, 0)
                    col = BLUE if br.random() < .5 else GOLD
                    luma = out.mean(axis=2, keepdims=True) / 255
                    out += (col / 255) * (luma ** 1.4) * 70
                    out *= 1.12
        # transitions into next scene
        if si + 1 < len(self.scenes):
            nsc = self.scenes[si + 1]
            nt = nsc['t0']
            if nsc.get('whip') and t > nt - 0.18:
                p = (t - (nt - 0.18)) / 0.18
                nxt = self.compose(nsc, max(t, nt + 1e-3), f)
                mix = out * (1 - p) + nxt * p
                im = Image.fromarray(np.clip(mix, 0, 255).astype(np.uint8))
                blur = 1 - abs(2 * p - 1)
                wsmall = max(24, int(W * (1 - 0.9 * blur) / 8))
                im = im.resize((wsmall, H // 4)).resize((W, H), Image.BILINEAR)
                sh = int(60 * blur)
                out = np.roll(np.asarray(im, np.float32), sh, axis=1)
            elif t > nt - self.TRANS and sc.get('mode') != 'poster':
                p = (t - (nt - self.TRANS)) / self.TRANS
                nxt = self.compose(nsc, max(t, nt + 1e-3), f)
                wf = self.wipes[si % len(self.wipes)]
                thr = p * 1.12 - 0.06
                a = smoothstep((thr - wf) / 0.035)[..., None]
                rim = (smoothstep((thr - wf) / 0.035) - smoothstep((thr - 0.028 - wf) / 0.035))[..., None]
                ncol = self.ecol(nsc, t)
                rc = 224 if ncol is None else (0.55 * 224 + 0.45 * ncol)
                out = out * (1 - a) + nxt * a
                out = out * (1 - rim * .55) + rc * rim * .55
        # global paper treatments
        roll = (f // 3) % 7
        pp = np.roll(self.paper, roll * 13, axis=1)
        out *= (0.90 + 0.18 * pp[..., None])
        luma = out.mean(axis=2, keepdims=True) / 255
        out *= (1 - 0.08 * self.half[..., None] * (1 - luma))
        self.energy_fx(out, sc, t, f, it)
        # ink blotch hits
        d = t - self.strong[self.strong <= t]
        if len(d) and d[-1] < 0.4 and sc.get('mode') != 'poster':
            bi = int(self.strong[self.strong <= t][-1] * 10)
            br = rng('blot', bi)
            m = self.blot[bi % 8]
            bx, by = int(br.uniform(0, W - 240)), int(br.uniform(0, H - 240))
            op = 0.26 * (1 - d[-1] / 0.4) * (0.4 + 0.6 * it)
            out[by:by + 240, bx:bx + 240] *= (1 - m[..., None] * op)
        g = np.random.default_rng(f).normal(0, 5.0 + 3.5 * it, (H, W, 1)).astype(np.float32)
        out += g
        out *= self.vig[..., None]
        out *= (1 + 0.02 * (rng('flick', f // 3).random() - 0.5))
        # neutral-cool newsprint base + soft S-curve
        out *= 1.06
        out = out * 0.93 + out.mean(axis=2, keepdims=True) * 0.07
        out[..., 0] *= 0.995; out[..., 2] *= 1.015
        x = np.clip(out / 255, 0, 1)
        x = x * x * (3 - 2 * x) * 0.25 + x * 0.75
        out = x * 255
        if t < 0.8: out *= t / 0.8
        if t > DUR - 1.0: out *= max(0.0, (DUR - t) / 1.0)
        return np.clip(out, 0, 255).astype(np.uint8)

# ---------------------------------------------------------------- 6. render

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

NCHUNK = 16

def do_render():
    from multiprocessing import Pool
    bounds = np.linspace(0, NFRAMES, NCHUNK + 1).astype(int)
    jobs = [(int(bounds[i]), int(bounds[i + 1]), os.path.join(FDIR, f'c{i:03d}.mp4'))
            for i in range(NCHUNK)]
    jobs = [j for j in jobs if not os.path.exists(j[2] + '.done')]
    with Pool(4) as p:
        for i, path in enumerate(p.imap_unordered(render_chunk, jobs)):
            open(path + '.done', 'w').write('ok')
            print(f'chunk done {i + 1}/{len(jobs)}: {os.path.basename(path)}', flush=True)

def do_finalize():
    missing = [i for i in range(NCHUNK) if not os.path.exists(os.path.join(FDIR, f'c{i:03d}.mp4.done'))]
    if missing:
        raise SystemExit(f'chunks not rendered: {missing}')
    lst = os.path.join(FDIR, 'list.txt')
    with open(lst, 'w') as fh:
        for i in range(NCHUNK):
            fh.write(f"file 'c{i:03d}.mp4'\n")
    final = os.path.join(BASE, '814_Blood_ft_King_Keev_2min.mp4')
    subprocess.run([FF, '-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', lst,
                    '-i', SONG, '-map', '0:v:0', '-map', '1:a:0', '-t', str(DUR),
                    '-af', f'afade=t=out:st={DUR - 3}:d=3',
                    '-c:v', 'libx264', '-crf', '22', '-preset', 'medium', '-pix_fmt', 'yuv420p',
                    '-c:a', 'aac', '-b:a', '256k', '-movflags', '+faststart', final],
                   check=True, cwd=FDIR)
    print('final:', final)

def do_preview():
    eng = Engine()
    ts = [1.5, 6, 10, 13, 16, 21, 26, 31, 36, 42, 47, 52, 57, 62, 68, 72,
          76, 80, 88, 94, 98, 102, 106, 109, 112, 116, 118, 119]
    cols = 4
    rows = math.ceil(len(ts) / cols)
    cs = Image.new('RGB', (cols * 484, rows * 276), (18, 18, 18))
    for i, t in enumerate(ts):
        a = eng.frame(int(t * FPS))
        im = Image.fromarray(a).resize((480, 270))
        cs.paste(im, ((i % cols) * 484 + 2, (i // cols) * 276 + 2))
    cs.save(os.path.join(BASE, 'preview.png'))
    print('preview saved')

if __name__ == '__main__':
    {'slice': do_slice, 'audio': do_audio, 'prep': do_prep,
     'preview': do_preview, 'render': do_render, 'finalize': do_finalize}[sys.argv[1]]()
