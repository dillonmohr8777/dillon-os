#!/usr/bin/env python3
"""Trace the Align wordmark out of the supplied end card still into an SVG path.

The letterforms are a custom typeface, so rather than approximate them with a
webfont we key the white glyphs off the navy background, drop the white slash of
the logomark that intrudes at the top right, and vectorise what is left. Writes
wordmark.path (the d attribute), wordmark.vb (its viewBox) and a standalone
wordmark.svg for eyeballing.

    pip install pillow numpy potracer
    python3 wm.py            # run from the build/ directory

SOURCE points at the original still. Repoint it if the still ever moves; the
crop box below is measured against that exact 1320 x 734 frame.
"""
from PIL import Image, ImageDraw, ImageFilter
import numpy as np
import potrace

SOURCE = '/root/.claude/uploads/fa0acc13-5cc5-5ffb-9f9f-cde7d4aaae4e/728ac0fa-IMG_3933.jpeg'
CROP = (322, 178, 816, 368)   # just the word "Align", measured off the still
SS = 4                        # supersample before tracing, for smoother curves
WHITE = 115                   # min channel value that counts as a glyph pixel

img = Image.open(SOURCE).convert('RGB').crop(CROP)
img = img.resize((img.width * SS, img.height * SS), Image.LANCZOS)
img = img.filter(ImageFilter.GaussianBlur(2.6))   # smooths the jpeg edges
W, H = img.size

mask = np.asarray(img).astype(np.int16).min(axis=2) > WHITE

# the white bar of the logomark clips the top right corner of the crop
wedge = Image.new('1', (W, H), 1)
ImageDraw.Draw(wedge).polygon([(W - 320, 0), (W, 0), (W, 260)], fill=0)
mask = mask & np.asarray(wedge)

# potrace traces the zero regions, so hand it the inverse
curves = list(potrace.Bitmap(~mask).trace(turdsize=60, alphamax=1.0,
                                          opticurve=True, opttolerance=0.2))

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

path = ''.join(parts)
viewbox = f'0 0 {W / SS:.2f} {H / SS:.2f}'

open('wordmark.path', 'w').write(path)
open('wordmark.vb', 'w').write(viewbox)
open('wordmark.svg', 'w').write(
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{viewbox}">'
    f'<path fill="#fff" fill-rule="evenodd" d="{path}"/></svg>')

print(f'{len(curves)} curves, {len(path)} path bytes, viewBox {viewbox}')
