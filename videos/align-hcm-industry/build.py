#!/usr/bin/env python3
"""Assemble src/ into one self contained page per film.

    python3 build.py                 # build every film
    python3 build.py manufacturing   # build one

Everything is inlined so a page runs from file:// with no network: the two
Google Fonts as base64 woff2, the traced Align wordmark, the grain tile, the
icon set, the SmartCare mark, the client logos, and the hero artwork.

Generated inputs under build/ (fonts.css, wordmark.path, noise.b64, icons.js)
are produced by the scripts in ../align-hcm-intro/build/ and ../align-hcm-intro/
and copied here so this project stands on its own. Hero and client artwork comes
from media.py in this directory.
"""
import base64
import io
import json
import pathlib
import sys

from PIL import Image

ROOT = pathlib.Path(__file__).parent
SRC = ROOT / 'src'
BUILD = ROOT / 'build'
ASSETS = ROOT / 'assets'

FILMS = {
    'industries': 'industries.js',
}

# Each hero fills a 960x1080 half frame. Stored at 1.15x for a little headroom
# on the slow push in, which is as much as the drift ever asks for.
HERO_W = 1100
HERO_Q = 84


def read(p):
    if not p.exists():
        sys.exit(f'missing {p}. See the header of this file for what generates it.')
    return p.read_text()


def jpeg_uri(path, width, quality):
    im = Image.open(path).convert('RGB')
    if im.width != width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, 'JPEG', quality=quality, optimize=True, progressive=True)
    return 'data:image/jpeg;base64,' + base64.b64encode(buf.getvalue()).decode()


def png_uri(path, max_width=None):
    im = Image.open(path).convert('RGBA')
    if max_width and im.width > max_width:
        im = im.resize((max_width, round(im.height * max_width / im.width)), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, 'PNG', optimize=True)
    return 'data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode()


def js_literal(name, obj):
    body = ',\n'.join(f'  {k}: {v}' for k, v in obj.items())
    return f'const {name} = {{\n{body}\n}};\n'


def assets_js():
    # media.py prepares all nine hub heroes; only inline the ones on screen, or
    # the page carries three megabytes of artwork it never draws.
    used = ('hub', 'healthcare', 'public', 'retail', 'services', 'manufacturing')
    heroes = {p.stem: f'"{jpeg_uri(p, HERO_W, HERO_Q)}"'
              for p in sorted((ASSETS / 'heroes').glob('*.jpg')) if p.stem in used}

    clients = []
    for p in sorted((ASSETS / 'clients').glob('*.png')):
        name = p.stem.replace('-', ' ').title()
        clients.append('{name: "%s", src: "%s"}' % (name, png_uri(p, 700)))

    # The SmartCare mark is the transparent PNG off alignhcm.com, inlined as it
    # ships. Nothing recolours or traces it; the white stage is what lets that
    # work.
    sc = png_uri(ASSETS / 'logos' / 'smartcare.png')
    return (js_literal('HEROES', heroes)
            + 'const CLIENTS = [\n' + ',\n'.join('  ' + c for c in clients) + '\n];\n'
            + 'const SMARTCARE = ' + json.dumps(sc) + ';\n')


def main():
    wanted = sys.argv[1:] or list(FILMS)
    fonts = read(BUILD / 'fonts.css')
    style = read(SRC / 'style.css').replace(
        'var(--grain)', f'url(data:image/png;base64,{read(BUILD / "noise.b64").strip()})')
    shell = read(SRC / 'shell.html')
    engine = read(SRC / 'engine.js').replace(
        '__WORDMARK_PATH__', read(BUILD / 'wordmark.path').strip())
    boot = read(SRC / 'boot.js')
    assets = read(BUILD / 'icons3d.js') + assets_js()

    for name in wanted:
        if name not in FILMS:
            sys.exit(f'unknown film {name!r}. Known: {", ".join(FILMS)}')
        scenes = read(SRC / FILMS[name])
        out = (shell
               .replace('/*__FONTS__*/', fonts)
               .replace('/*__STYLE__*/', style)
               .replace('/*__ASSETS__*/', assets)
               .replace('/*__ENGINE__*/', engine)
               .replace('/*__SCENES__*/', scenes)
               .replace('/*__BOOT__*/', boot))
        dest = ROOT / f'{name}.html'
        dest.write_text(out)
        print(f'{dest.name} written, {len(out) // 1024} KB')


if __name__ == '__main__':
    main()
