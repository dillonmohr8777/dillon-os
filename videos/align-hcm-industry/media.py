#!/usr/bin/env python3
"""Prepare the industry artwork for the split panel layout.

Pulls the hero illustrations and client logos off the industry hub and crops the
heroes to the panel the film actually shows. Client marks keep their own colours:
they ride white chips on a white stage, so nothing needs knocking out.

Heroes are portrait (mostly 1200x1500) and the panel is 8:9, so they are scaled
to fill and cropped from the top third rather than the centre: these are figure
illustrations and the faces sit high in frame.

    python3 media.py            # fetch if needed, then process
    python3 media.py --refetch  # ignore the cache
"""
import io
import pathlib
import sys
import urllib.request

import numpy as np
from PIL import Image

HERE = pathlib.Path(__file__).parent
CACHE = HERE / 'build' / 'media'
OUT = HERE / 'assets'
BASE = 'https://align-hcm-industry-manufacturing.netlify.app'
UA = ('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
      '(KHTML, like Gecko) Chrome/120.0 Safari/537.36')
REFETCH = '--refetch' in sys.argv

PANEL = (960, 1080)          # the half frame the video shows
CROP_ANCHOR = 0.34           # 0 is top, 1 is bottom; faces sit high in these

HEROES = {
    'hub': '/assets/heroes/industry-hub-v2.webp',
    'manufacturing': '/assets/heroes/manufacturing-v3.webp',
    'healthcare': '/assets/heroes/healthcare-v2.webp',
    'retail': '/assets/heroes/retail-hospitality-v4.webp',
    'services': '/assets/heroes/services-distribution-v5.webp',
}

# A readable cross section of the manufacturing roster on the industry page.
# Two of the biggest names per industry, kept in their own colours for the
# orbit. They ride white chips on a white stage, so no knockout is involved.
CLIENTS = [
    ('healthcare', 'bausch-health-dark-navy', 'Bausch Health'),
    ('healthcare', 'ohiohealth-corporation', 'OhioHealth'),
    ('manufacturing', 'kimberly-clark-corporation', 'Kimberly Clark'),
    ('manufacturing', 'stihl-usa', 'STIHL'),
    ('retail-hospitality', 'international-dairy-queen-inc', 'Dairy Queen'),
    ('retail-hospitality', 'san-antonio-spurs', 'San Antonio Spurs'),
    ('services-distribution', 'ibm-canada', 'IBM'),
    ('services-distribution', 'recreational-equipment-inc', 'REI'),
]


def get(url, name):
    dest = CACHE / name
    if dest.exists() and not REFETCH:
        return dest.read_bytes()
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    data = urllib.request.urlopen(req).read()
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(data)
    print(f'  fetched {name}, {len(data) // 1024} KB')
    return data


def fill_crop(im, size, anchor=0.5):
    """Scale to cover `size`, then crop, biased vertically by `anchor`."""
    tw, th = size
    scale = max(tw / im.width, th / im.height)
    im = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
    x = (im.width - tw) // 2
    y = round((im.height - th) * anchor)
    return im.crop((x, y, x + tw, y + th))


def trim(im):
    box = im.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox()
    return im.crop(box) if box else im


def main():
    (OUT / 'heroes').mkdir(parents=True, exist_ok=True)
    (OUT / 'clients').mkdir(parents=True, exist_ok=True)

    print('heroes')
    for name, path in HEROES.items():
        im = Image.open(io.BytesIO(get(BASE + path, path.rsplit('/', 1)[-1]))).convert('RGB')
        panel = fill_crop(im, PANEL, CROP_ANCHOR)
        panel.save(OUT / 'heroes' / f'{name}.jpg', quality=88, optimize=True, progressive=True)
        print(f'  {name:<14} {im.width}x{im.height} -> {PANEL[0]}x{PANEL[1]}')

    print('clients')
    for industry, slug, name in CLIENTS:
        data = get(f'{BASE}/assets/logos/ticker/{industry}/{slug}.png', f'client-{slug}.png')
        out = trim(Image.open(io.BytesIO(data)).convert('RGBA'))
        if out.width > 700:
            out = out.resize((700, round(out.height * 700 / out.width)), Image.LANCZOS)
        out.save(OUT / 'clients' / f'{slug}.png')
        print(f'  {name:<20} {out.width}x{out.height}')


if __name__ == '__main__':
    main()
