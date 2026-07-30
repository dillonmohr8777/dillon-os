#!/usr/bin/env python3
"""Fetch the supported platform logos and the SmartCare mark, cut their
backgrounds, and emit clean variants for use on the dark Align stage.

Sources are the real assets on alignhcm.com, not lookalikes:

    /hubfs/Logos/{UKG-logo.jpg, dayforce.png, workday.png, ADP.png}
    the inline base64 hero image on /align-hcm-smartcare
    /hubfs/Site Images/Align Favicon.svg   (the official Align mark)

Background removal is a border flood fill over near white pixels, never a
global threshold. That matters: HiBob's "Hi" is white ink sitting inside a red
speech bubble, and a global key would punch it straight out. Edge pixels are
un-matted from white so nothing keeps a pale fringe on navy.

For each logo three files land in assets/logos/:

    <name>.png          full colour, transparent, trimmed
    <name>-white.png    flat white knockout, for dark backgrounds
    <name>-reverse.png  neutrals lifted to white, brand chroma kept

    python3 logos.py            # fetch if needed, then process
    python3 logos.py --refetch  # force re-download
"""
import base64
import io
import os
import pathlib
import re
import sys
import urllib.request

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage

HERE = pathlib.Path(__file__).parent
CACHE = HERE / 'build' / 'logos'
OUT = HERE / 'assets' / 'logos'
UA = ('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
      '(KHTML, like Gecko) Chrome/120.0 Safari/537.36')
BASE = 'https://www.alignhcm.com'

PLATFORMS = {
    'ukg':       '/hubfs/Logos/UKG-logo.jpg',
    'dayforce':  '/hubfs/Logos/dayforce.png',
    'hibob':     '/hubfs/Logos/hibob.jpg',
    'paylocity': '/hubfs/Logos/Paylocity.jpg',
}
# Workday and ADP are still fetched so the artwork stays on hand, but they are
# no longer the four marks the film shows. The strip is the platforms Align
# actually partners on, not a list of everything in the market.
ALSO = {
    'workday':  '/hubfs/Logos/workday.png',
    'adp':      '/hubfs/Logos/ADP.png',
}
SMARTCARE_PAGE = '/align-hcm-smartcare'
REFETCH = '--refetch' in sys.argv


def get(url, dest, binary=True):
    dest = CACHE / dest
    if dest.exists() and not REFETCH:
        return dest.read_bytes() if binary else dest.read_text(errors='replace')
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    data = urllib.request.urlopen(req).read()
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(data)
    print(f'  fetched {url.rsplit("/", 1)[-1]}, {len(data) // 1024} KB')
    return data if binary else data.decode(errors='replace')


# --------------------------------------------------------------- bg removal

def border_bg_mask(rgb, white=228, chroma=26):
    """True where a near white pixel is background rather than ink.

    Two passes. First a four connected flood fill from the border, which is the
    only safe way to clear a flat backdrop without keying out white ink.

    That alone is not enough. It keeps every enclosed white region, and those
    come in two kinds that have to be told apart: white ink sitting inside a
    brand shape, like HiBob's "Hi" in its pink bubble, and the counters of a
    letter, like the holes in the B, o and b of "Bob". The first must survive
    because it is the artwork; the second must go, or on a dark stage each
    counter fills in as a solid white blob.

    What separates them is what they touch. A counter is ringed by the neutral
    ink of its own glyph, a knockout is ringed by saturated brand colour, so
    each enclosed region is measured against the pixels around it and cut only
    when that ring is neutral.
    """
    mn, mx = rgb.min(axis=2), rgb.max(axis=2)
    near = ((mn > white) & ((mx - mn) < chroma)).astype(np.uint8) * 255
    img = Image.fromarray(near, 'L').copy()   # fromarray is read only in Pillow 12
    h, w = near.shape
    seeds = ([(x, 0) for x in range(w)] + [(x, h - 1) for x in range(w)]
             + [(0, y) for y in range(h)] + [(w - 1, y) for y in range(h)])
    for s in seeds:
        if img.getpixel(s) == 255:
            ImageDraw.floodfill(img, s, 128)
    flooded = np.asarray(img)
    bg = flooded == 128

    enclosed = flooded == 255          # near white the border could not reach
    if not enclosed.any():
        return bg

    sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1), 0)
    labels, n = ndimage.label(enclosed)
    for i in range(1, n + 1):
        region = labels == i
        ring = ndimage.binary_dilation(region, iterations=2) & ~region
        if ring.any() and sat[ring].mean() < 0.22:
            bg |= region
    return bg


def cut_background(im):
    """RGBA with the flat backdrop removed and edge pixels un-matted."""
    im = im.convert('RGBA')
    a = np.asarray(im).astype(np.float64)
    rgb, alpha = a[..., :3], a[..., 3]

    if (alpha < 250).mean() > 0.05:      # already has a real alpha channel
        return im

    bg = border_bg_mask(rgb.astype(int))
    hard = Image.fromarray(((~bg) * 255).astype(np.uint8), 'L')
    inner = np.asarray(hard.filter(ImageFilter.MinFilter(3))) > 127   # certain ink
    outer = np.asarray(hard.filter(ImageFilter.MaxFilter(3))) > 127   # ink + 1px halo
    band = outer & ~inner

    # in the transition band, read coverage off how far the pixel is from white
    mn = rgb.min(axis=2)
    cov = np.clip((252.0 - mn) / 52.0, 0, 1)
    out_a = np.where(inner, 1.0, np.where(band, cov, 0.0))

    # un-matte: the pixel is ink composited over white, so recover the ink
    safe = np.maximum(out_a, 1e-3)[..., None]
    ink = np.clip((rgb - (1 - safe) * 255.0) / safe, 0, 255)
    rgb = np.where(out_a[..., None] > 0.995, rgb, ink)

    return Image.fromarray(
        np.dstack([rgb, out_a * 255]).astype(np.uint8), 'RGBA')


def strip_white_glow(im, white=224, chroma=20):
    """Drop the white outer glow baked into the SmartCare artwork.

    Keyed on neutrality, so the pale yellow at the head of the tagline gradient
    survives while the colourless halo does not.
    """
    a = np.asarray(im.convert('RGBA')).astype(np.float64)
    rgb, alpha = a[..., :3], a[..., 3]
    mn, mx = rgb.min(axis=2), rgb.max(axis=2)
    whiteness = np.clip((mn - white) / (255.0 - white), 0, 1)
    neutral = (mx - mn) < chroma
    alpha = np.where(neutral, alpha * (1 - whiteness), alpha)
    return Image.fromarray(np.dstack([rgb, alpha]).astype(np.uint8), 'RGBA')


def trim(im, pad=0):
    box = im.convert('RGBA').getchannel('A').point(lambda v: 255 if v > 6 else 0).getbbox()
    im = im.crop(box)
    if pad:
        big = Image.new('RGBA', (im.width + pad * 2, im.height + pad * 2), (0, 0, 0, 0))
        big.alpha_composite(im, (pad, pad))
        im = big
    return im


# ----------------------------------------------------------------- variants

def knockout(im):
    """Flat white silhouette, keeping the original alpha."""
    a = np.asarray(im.convert('RGBA'))
    flat = np.dstack([np.full(a.shape[:2] + (3,), 255, np.uint8), a[..., 3]])
    return Image.fromarray(flat, 'RGBA')


def reverse(im, floor=0.82):
    """Lift neutral ink to white, leave saturated brand colour alone.

    A dark neutral wordmark vanishes on navy; a brand red or blue does not.
    Chromatic pixels only get a floor on their lightness so nothing muddies.
    """
    a = np.asarray(im.convert('RGBA')).astype(np.float64)
    rgb, alpha = a[..., :3] / 255.0, a[..., 3]
    mx, mn = rgb.max(axis=2), rgb.min(axis=2)
    sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
    lum = rgb @ (0.2126, 0.7152, 0.0722)

    neutrality = np.clip((0.28 - sat) / 0.28, 0, 1)          # 1 = fully grey
    inverted = np.clip(1.0 - lum * 0.55, floor, 1.0)[..., None] * np.ones(3)

    # chromatic pixels: only lift the very dark ones toward their own hue
    lift = np.clip(0.42 / np.maximum(lum, 1e-3), 1.0, 2.6)[..., None]
    brightened = np.clip(rgb * lift, 0, 1)

    mixed = neutrality[..., None] * inverted + (1 - neutrality[..., None]) * brightened
    return Image.fromarray(
        np.dstack([np.clip(mixed * 255, 0, 255), alpha]).astype(np.uint8), 'RGBA')


# --------------------------------------------------------------------- main

def emit(name, im, scale_to=None, reverse_floor=0.82):
    im = trim(im)
    clear = (np.asarray(im.convert('RGBA'))[..., 3] < 10).mean()
    if clear < 0.05:
        sys.exit(f'{name}: only {clear * 100:.1f}% of the frame is transparent, '
                 f'the background was not cut')
    if scale_to and im.width > scale_to:
        h = round(im.height * scale_to / im.width)
        im = im.resize((scale_to, h), Image.LANCZOS)
    OUT.mkdir(parents=True, exist_ok=True)
    im.save(OUT / f'{name}.png')
    print(f'  {name:<10} {im.width}x{im.height}  {clear * 100:.0f}% clear')
    knockout(im).save(OUT / f'{name}-white.png')
    reverse(im, reverse_floor).save(OUT / f'{name}-reverse.png')


def main():
    CACHE.mkdir(parents=True, exist_ok=True)
    print('platform logos')
    for name, path in {**PLATFORMS, **ALSO}.items():
        raw = get(BASE + path, 'raw_' + path.rsplit('/', 1)[-1])
        emit(name, cut_background(Image.open(io.BytesIO(raw))), scale_to=1200)

    print('smartcare')
    page = get(BASE + SMARTCARE_PAGE, 'page_smartcare.html', binary=False)
    m = re.search(r'<img[^>]*src="data:image/png;base64,([A-Za-z0-9+/=]+)"[^>]*'
                  r'alt="SmartCare[^"]*"', page)
    if not m:
        sys.exit('could not find the inline SmartCare logo on the page')
    sc = Image.open(io.BytesIO(base64.b64decode(m.group(1))))
    # SmartCare keeps its two tone heart on navy: the grey half and the
    # wordmark go white, the orange half stays orange.
    emit('smartcare', strip_white_glow(sc), scale_to=1200, reverse_floor=0.97)

    print('align mark')
    svg = get(BASE + '/hubfs/Site%20Images/Align%20Favicon.svg', 'align-favicon.svg', binary=False)
    (OUT / 'align-mark.svg').write_text(svg)
    print('  align-mark.svg (official geometry, orange #fc9121)')


if __name__ == '__main__':
    main()
