#!/usr/bin/env python3
"""
Hope Wellness Center brand film - asset extraction.

Derives every generated art element from the five supplied clips + the official
logo, so nothing in the film is invented outside the approved artwork.

Outputs
  assets/transitions/leaf_XX.png    RGBA botanical cutouts lifted from clip 2/3/5
  assets/masks/*.png                soft transition mattes (ripple, ring, wipe)
  build/logo_master.png             official logo, upscaled once, losslessly cached
"""
import os, json
import numpy as np
import cv2

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'assets', 'source-videos')
TR = os.path.join(ROOT, 'assets', 'transitions')
MK = os.path.join(ROOT, 'assets', 'masks')
BUILD = os.path.join(ROOT, 'build')
for d in (TR, MK, BUILD):
    os.makedirs(d, exist_ok=True)


def read_frame(clip, t):
    cap = cv2.VideoCapture(os.path.join(SRC, f'upload{clip}.mp4'))
    cap.set(cv2.CAP_PROP_POS_FRAMES, int(round(t * 24)))
    ok, f = cap.read()
    cap.release()
    if not ok:
        raise RuntimeError(f'clip {clip} t={t}')
    return f


# ---------------------------------------------------------------- botanicals
def extract_botanicals():
    """Key the illustration's own foliage colours and save clean RGBA cutouts."""
    saved = []
    # (clip, t, hsv lo, hsv hi, min area, max area, label)
    recipes = [
        # small drifting leaves that clip 2 already animates through frame
        (2, 3.0, (32, 42, 120), (95, 200, 235), 90, 3000, 'leaflet'),
        (2, 5.0, (32, 42, 120), (95, 200, 235), 90, 3000, 'leaflet'),
        (2, 7.0, (32, 42, 120), (95, 200, 235), 90, 3000, 'leaflet'),
        # larger fronds for foreground depth layers
        (3, 1.0, (30, 35, 110), (90, 200, 245), 900, 90000, 'frond'),
        (5, 2.0, (35, 40, 110), (95, 200, 250), 900, 90000, 'frond'),
        (4, 1.0, (35, 30, 110), (95, 190, 250), 900, 90000, 'frond'),
    ]
    def is_botanical(w, h, a):
        """Leaves are elongated and only loosely fill their box; the vase,
        bowl, mug and resistance band the keyer also catches are not."""
        fill = a / float(w * h)
        elong = max(w, h) / float(min(w, h))
        return fill < 0.62 and elong < 4.2
    for clip, t, lo, hi, amin, amax, label in recipes:
        f = read_frame(clip, t)
        hsv = cv2.cvtColor(f, cv2.COLOR_BGR2HSV)
        m = cv2.inRange(hsv, np.array(lo, np.uint8), np.array(hi, np.uint8))
        m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
        m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
        n, lab, stats, _ = cv2.connectedComponentsWithStats(m, 8)
        order = sorted(range(1, n), key=lambda k: -stats[k, 4])
        for k in order[:14]:
            x, y, w, h, a = stats[k]
            if not (amin <= a <= amax) or w < 10 or h < 10:
                continue
            if not is_botanical(w, h, a):
                continue
            sub = (lab[y:y + h, x:x + w] == k).astype(np.uint8) * 255
            # feather the alpha so the cutout never shows a hard vector edge
            pad = 6
            sub = cv2.copyMakeBorder(sub, pad, pad, pad, pad, cv2.BORDER_CONSTANT, value=0)
            alpha = cv2.GaussianBlur(sub, (0, 0), 1.4)
            rgb = f[max(0, y - pad):y + h + pad, max(0, x - pad):x + w + pad]
            rgb = cv2.resize(rgb, (alpha.shape[1], alpha.shape[0]))
            out = np.dstack([rgb, alpha])
            name = f'{label}_c{clip}_{len(saved):02d}.png'
            cv2.imwrite(os.path.join(TR, name), out)
            saved.append(name)
    print(f'  botanicals: {len(saved)} cutouts -> assets/transitions/')
    return saved


# ------------------------------------------------------------------- mattes
def radial_matte(size=1024):
    """Normalised radius field; shots build ripple / ring wipes from this."""
    yy, xx = np.mgrid[0:size, 0:size].astype(np.float32)
    c = (size - 1) / 2.0
    r = np.sqrt((xx - c) ** 2 + (yy - c) ** 2) / c
    cv2.imwrite(os.path.join(MK, 'radial_field.png'),
                np.clip(r * 127.5, 0, 255).astype(np.uint8))
    return r


def leaf_matte():
    """A soft organic blob matte used for botanical typography reveals."""
    S = 1024
    img = np.zeros((S, S), np.float32)
    rng = np.random.default_rng(7)
    for _ in range(9):
        cx, cy = rng.uniform(0.25, 0.75, 2) * S
        ax, ay = rng.uniform(0.18, 0.42) * S, rng.uniform(0.10, 0.30) * S
        ang = rng.uniform(0, 180)
        cv2.ellipse(img, (int(cx), int(cy)), (int(ax), int(ay)),
                    ang, 0, 360, 1.0, -1)
    img = cv2.GaussianBlur(img, (0, 0), 46)
    img = (img - img.min()) / max(1e-6, img.max() - img.min())
    cv2.imwrite(os.path.join(MK, 'organic_blob.png'), (img * 255).astype(np.uint8))
    return img


# --------------------------------------------------------------------- logo
def prepare_logo():
    """
    Load the OFFICIAL logo exactly as downloaded and cache one high-quality
    Lanczos enlargement. No recolour, no redraw, no aspect change.
    """
    src = os.path.join(ROOT, 'assets', 'logo',
                       'Hope-Wellness-Center-Mental-Health.png')
    raw = cv2.imread(src, cv2.IMREAD_UNCHANGED)
    assert raw is not None and raw.shape[2] == 4, 'logo must be RGBA'
    h, w = raw.shape[:2]
    # premultiply before resampling so feathered edges never pick up fringe
    bgr = raw[..., :3].astype(np.float32)
    a = raw[..., 3:4].astype(np.float32) / 255.0
    pm = bgr * a
    F = 3.0                                     # single clean 3x enlargement
    tw, th = int(round(w * F)), int(round(h * F))
    pm_u = cv2.resize(pm, (tw, th), interpolation=cv2.INTER_LANCZOS4)
    a_u = cv2.resize(a, (tw, th), interpolation=cv2.INTER_LANCZOS4)
    a_u = np.clip(a_u, 0, 1).reshape(th, tw, 1)
    bgr_u = np.where(a_u > 1e-4, pm_u / np.maximum(a_u, 1e-4), 0)
    # gentle unsharp on the colour only, restores the vector crispness the
    # bitmap original loses under enlargement (does not change hue or shape)
    blur = cv2.GaussianBlur(bgr_u, (0, 0), 1.1)
    bgr_u = np.clip(bgr_u * 1.35 - blur * 0.35, 0, 255)
    out = np.dstack([bgr_u, np.clip(a_u * 255, 0, 255)]).astype(np.uint8)
    cv2.imwrite(os.path.join(BUILD, 'logo_master.png'), out)
    print(f'  logo: {w}x{h} original -> {tw}x{th} master '
          f'(aspect {w/h:.4f} -> {tw/th:.4f}, transparency preserved)')
    return out


if __name__ == '__main__':
    print('extracting assets...')
    b = extract_botanicals()
    radial_matte()
    leaf_matte()
    prepare_logo()
    json.dump({'botanicals': b}, open(os.path.join(BUILD, 'asset_index.json'), 'w'), indent=1)
    print('done.')
