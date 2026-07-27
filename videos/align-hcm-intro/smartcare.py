#!/usr/bin/env python3
"""Vectorise the SmartCare mark so it renders sharp at any size.

The only SmartCare artwork that exists on alignhcm.com is a 715x445 raster,
inlined as base64 in the hero of /align-hcm-smartcare. Shown at 700px or more in
a 1080p frame that is essentially 1:1, and it looks it: soft heart arcs and mushy
letter edges. There is no vector to fetch, so this traces one.

The mark separates cleanly into three layers, which is what makes the trace
faithful rather than flat:

    neutral   the left heart arc, the SmartCare wordmark, the TM
    heart     the right heart arc and the lower swoosh, one solid orange
    tagline   Stabilize · Optimize · Thrive, a yellow to orange gradient

Neutral versus chromatic is a saturation test. Splitting the two orange layers
is a horizontal band test: the tagline sits at y 270 to 352 and nothing else
chromatic does. Tracing both as one layer would either flatten the tagline
gradient or wash out the solid arc.

Output is assets/logos/smartcare.svg. The neutral layer carries a class and a
fill attribute rather than an embedded <style> block, so a dark stage can repaint
it white from its own CSS and two inlined copies never fight each other.

    pip install pillow numpy potracer
    python3 smartcare.py
"""
import pathlib

import numpy as np
import potrace
from PIL import Image, ImageFilter

HERE = pathlib.Path(__file__).parent
SRC = HERE / 'assets' / 'logos' / 'smartcare.png'
OUT = HERE / 'assets' / 'logos' / 'smartcare.svg'

SS = 5                 # supersample before tracing
SAT_NEUTRAL = 0.18     # below this a pixel is grey, not brand colour
TAGLINE_BAND = (268, 354)   # the only chromatic content in this y range
ALPHA = 60             # keep the anti-aliased rim; erosion shows as chewed arcs
TURD = SS * SS * 12    # despeckle: under about 12 source pixels is boundary crumb

NEUTRAL_FILL = '#3f3f3f'   # the wordmark grey, sampled from the artwork
HEART_FILL = '#f07818'


def layers(im):
    """neutral, heart, tagline boolean masks at source resolution"""
    a = np.asarray(im.convert('RGBA')).astype(int)
    rgb, alpha = a[..., :3], a[..., 3]
    opaque = alpha > ALPHA
    mx, mn = rgb.max(axis=2), rgb.min(axis=2)
    sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1), 0)

    rows = np.arange(a.shape[0])[:, None] * np.ones((1, a.shape[1]))
    band = (rows >= TAGLINE_BAND[0]) & (rows <= TAGLINE_BAND[1])

    neutral = opaque & (sat < SAT_NEUTRAL)
    chroma = opaque & (sat >= SAT_NEUTRAL)
    tagline = chroma & band

    # The tagline is set with a thin dark outline. It is neutral by the
    # saturation test, so it lands in the neutral layer and traces as grey
    # crumbs sitting on top of the orange letters. Drop any neutral pixel in the
    # band that touches the tagline: the two separator dots are isolated from the
    # letterforms and survive, and the heart swoosh runs well clear to the left.
    def as_img(m):
        return Image.fromarray((m * 255).astype(np.uint8), 'L')

    near_tag = np.asarray(as_img(tagline).filter(ImageFilter.MaxFilter(7))) > 127
    # The heart swoosh also crosses the band and passes behind the letters, so
    # protect anything thick: erode hard enough that only the swoosh core
    # survives, then dilate it back to full width.
    thick = as_img(np.asarray(as_img(neutral).filter(ImageFilter.MinFilter(9))) > 127)
    swoosh = np.asarray(thick.filter(ImageFilter.MaxFilter(15))) > 127
    neutral = neutral & ~(band & near_tag & ~swoosh)

    return neutral, chroma & ~band, tagline


def trace(mask):
    """mask -> svg path data.

    Order matters. Cleaning the mask at source resolution destroys thin features:
    a median pass eats the tapering tip of the heart swoosh and leaves a fat
    angular wedge beside the word Stabilize. So upscale first with NEAREST, which
    preserves the geometry exactly as blocks, then blur and re-threshold at the
    supersampled scale. That rounds the staircase without touching anything
    narrower than the blur radius, and turdsize alone handles the anti-aliasing
    crumbs along the layer boundaries.
    """
    img = Image.fromarray((mask * 255).astype(np.uint8), 'L')
    img = img.resize((img.width * SS, img.height * SS), Image.NEAREST)
    img = img.filter(ImageFilter.GaussianBlur(SS * 0.75))
    big = np.asarray(img) > 128

    # potrace traces the zero regions, so hand it the inverse
    curves = list(potrace.Bitmap(~big).trace(turdsize=TURD, alphamax=1.0,
                                            opticurve=True, opttolerance=0.28))
    parts = []
    for curve in curves:
        p0 = curve.start_point
        d = [f'M{p0.x / SS:.2f} {p0.y / SS:.2f}']
        for s in list(curve):
            if s.is_corner:
                d.append(f'L{s.c.x / SS:.2f} {s.c.y / SS:.2f}'
                         f'L{s.end_point.x / SS:.2f} {s.end_point.y / SS:.2f}')
            else:
                d.append(f'C{s.c1.x / SS:.2f} {s.c1.y / SS:.2f} '
                         f'{s.c2.x / SS:.2f} {s.c2.y / SS:.2f} '
                         f'{s.end_point.x / SS:.2f} {s.end_point.y / SS:.2f}')
        d.append('Z')
        parts.append(''.join(d))
    return ''.join(parts), len(curves)


def gradient_stops(im, mask):
    """Sample the tagline's own left and right colour.

    Median over fully opaque pixels only, at the 6th and 94th percentile of x. A
    mean over the whole span pulls in semi transparent edge pixels blended
    toward the background and comes back muddy brown.
    """
    a = np.asarray(im.convert('RGBA')).astype(int)
    solid = mask & (a[..., 3] > 230)
    xs = np.where(solid)[1]
    x0, x1 = int(np.percentile(xs, 2)), int(np.percentile(xs, 98))
    cols = np.arange(a.shape[1])[None, :]
    def med(lo, hi):
        px = a[..., :3][solid & (cols >= lo) & (cols <= hi)]
        return '#%02x%02x%02x' % tuple(np.median(px, axis=0).round().astype(int))
    span = x1 - x0
    return x0, x1, med(x0, x0 + span * 0.12), med(x1 - span * 0.12, x1)


def main():
    im = Image.open(SRC)
    W, H = im.size
    neutral, heart, tagline = layers(im)
    print(f'source {W}x{H}: neutral {neutral.sum()}, heart {heart.sum()}, tagline {tagline.sum()}')

    d_neutral, n1 = trace(neutral)
    d_heart, n2 = trace(heart)
    d_tag, n3 = trace(tagline)
    gx0, gx1, c_left, c_right = gradient_stops(im, tagline)
    print(f'curves: neutral {n1}, heart {n2}, tagline {n3}')
    print(f'tagline gradient {c_left} -> {c_right} across x {gx0}..{gx1}')

    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}">
<defs>
<linearGradient id="sc-tag" gradientUnits="userSpaceOnUse" x1="{gx0}" y1="0" x2="{gx1}" y2="0">
<stop offset="0" stop-color="{c_left}"/><stop offset="1" stop-color="{c_right}"/>
</linearGradient>
</defs>
<path class="sc-neutral" fill="{NEUTRAL_FILL}" fill-rule="evenodd" d="{d_neutral}"/>
<path fill="{HEART_FILL}" fill-rule="evenodd" d="{d_heart}"/>
<path fill="url(#sc-tag)" fill-rule="evenodd" d="{d_tag}"/>
</svg>
'''
    OUT.write_text(svg)
    print(f'{OUT.relative_to(HERE)} written, {len(svg) // 1024} KB')


if __name__ == '__main__':
    main()
