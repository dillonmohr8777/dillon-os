#!/usr/bin/env python3
"""Build the platform cards in assets/ from clean transparent logo artwork.

The original four cards (UKG, Dayforce, Workday, ADP) were recovered frame by
frame from the reference recording and keyed to transparency, so each one is a
finished 396x214 card: the warm off white field, its vertical gradient, the
rounded corners and the logo, all baked into one bitmap. There was no way to
produce a fifth card that sat in the same row without it looking pasted on.

So the field is lifted off one of the recovered cards rather than redrawn. Every
row of a card is essentially one flat colour, and the margins either side of the
logo are untouched by it, so the median of those margins per row reconstructs the
field exactly, gradient and all. Alpha comes through untouched, which is what
keeps the corner radius identical to the cards beside it.

Logos come from the brand intro project, which already fetches them off
alignhcm.com and cuts their backgrounds properly. Nothing here re-keys artwork.

    python3 make-cards.py            # build hibob and paylocity
    python3 make-cards.py --all      # rebuild every card from source logos
"""
import pathlib
import sys

import numpy as np
from PIL import Image

HERE = pathlib.Path(__file__).parent
ASSETS = HERE / 'assets'
LOGOS = HERE.parent / 'align-hcm-intro' / 'assets' / 'logos'
FIELD_FROM = ASSETS / 'card-ukg.png'

# The logo sits in a box centred in the card. Measured off the four recovered
# cards, which centre on (198, 107) and cap the mark at about 100px tall.
BOX_W, BOX_H = 324, 100
CX, CY = 198, 107

# A per mark multiplier on that box. Equal height is the right default for the
# wide wordmarks, but Paylocity is a stacked lockup, an icon sitting over a small
# wordmark, so at the same height as UKG its type comes out half the size and the
# card reads empty. It gets a taller box; the card has the room.
FIT = {'paylocity': 1.3}

# Margins the logo never reaches on any of the recovered cards, used to read the
# field colour back out row by row.
MARGIN = (slice(8, 34), slice(362, 388))

WANTED = {
    'hibob': 'hibob.png',
    'paylocity': 'paylocity.png',
}
ALL = {**WANTED, 'ukg': 'ukg.png', 'dayforce': 'dayforce.png'}


def blank_field():
    """The card with its logo removed: per row median of the two margins."""
    a = np.asarray(Image.open(FIELD_FROM).convert('RGBA')).astype(np.float64)
    rgb, alpha = a[..., :3], a[..., 3]
    left, right = MARGIN
    sample = np.concatenate([rgb[:, left], rgb[:, right]], axis=1)
    row = np.median(sample, axis=1)                       # (h, 3)
    field = np.repeat(row[:, None, :], rgb.shape[1], axis=1)
    return field, alpha


def place(field, alpha, logo, fit=1.0):
    """Composite a transparent logo into the centre of the field."""
    scale = min(BOX_W * fit / logo.width, BOX_H * fit / logo.height)
    w, h = max(1, round(logo.width * scale)), max(1, round(logo.height * scale))
    logo = logo.resize((w, h), Image.LANCZOS)

    card = Image.fromarray(
        np.dstack([field, alpha]).astype(np.uint8), 'RGBA')
    card.alpha_composite(logo, (round(CX - w / 2), round(CY - h / 2)))
    return card, (w, h)


def main():
    if not FIELD_FROM.exists():
        sys.exit(f'missing {FIELD_FROM}, needed to lift the card field')
    field, alpha = blank_field()
    wanted = ALL if '--all' in sys.argv else WANTED

    for name, src in wanted.items():
        path = LOGOS / src
        if not path.exists():
            sys.exit(f'missing {path}. Run ../align-hcm-intro/logos.py first.')
        card, (w, h) = place(field, alpha, Image.open(path).convert('RGBA'),
                             FIT.get(name, 1.0))
        dest = ASSETS / f'card-{name}.png'
        card.save(dest)
        print(f'  {dest.name:<22} logo {w}x{h} centred on ({CX}, {CY})')


if __name__ == '__main__':
    main()
