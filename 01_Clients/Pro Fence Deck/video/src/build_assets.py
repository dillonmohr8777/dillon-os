"""Curate + optimise the Pro Fence Deck photo set into two quality profiles."""
from PIL import Image
import os, sys, json

B = '/tmp/claude-0/-home-user/5229e18d-bbaf-5c73-8cd2-126b6ec9af59/scratchpad/'
good = [l for l in open(B + 'good.txt').read().split('\n') if l]

# index -> role, curated from the contact sheets.
# 'hero' = shown full-bleed, gets the larger render; everything else is a card.
SEL = {
    # ---- hero / statement frames -------------------------------------------
    1:   ('hero', 'deck',   'Custom deck with integrated stair lighting'),
    41:  ('hero', 'deck',   'Composite deck, white and black railing'),
    136: ('hero', 'deck',   'Waterfront deck with cable railing'),
    116: ('hero', 'deck',   'Covered porch and deck'),
    139: ('hero', 'life',   'Deck living at dusk'),
    28:  ('hero', 'gate',   'Ornamental driveway gate with stone piers'),
    115: ('hero', 'gate',   'Estate gate entry'),
    4:   ('hero', 'pool',   'Removable mesh pool safety fence'),
    5:   ('hero', 'pool',   'Mesh pool fence around a free-form pool'),
    16:  ('hero', 'rail',   'Railing sections fabricated in the shop'),
    118: ('hero', 'rail',   'Cable railing detail'),
    90:  ('hero', 'work',   'Fence panel going up at golden hour'),
    65:  ('hero', 'work',   'Cutting deck boards on site'),
    129: ('hero', 'work',   'Setting a fence panel'),
    146: ('hero', 'struct', 'Custom cabana'),

    # ---- decks --------------------------------------------------------------
    12:  ('card', 'deck', 'Composite deck with black aluminium railing'),
    20:  ('card', 'deck', 'Deck, stairs and railing'),
    24:  ('card', 'deck', 'Poolside deck with black railing'),
    27:  ('card', 'deck', 'Wide composite deck'),
    73:  ('card', 'deck', 'Composite deck surface'),
    86:  ('card', 'deck', 'PVC deck, Langhorne'),
    137: ('card', 'deck', 'Finished deck with seating'),

    # ---- lifestyle ----------------------------------------------------------
    60:  ('card', 'life', 'Custom PVC deck with built-in bench'),
    89:  ('card', 'life', 'Deck dining and lounge'),
    125: ('card', 'life', 'Low-profile deck with planters'),

    # ---- work / process -----------------------------------------------------
    70:  ('card', 'work', 'Deck framing in progress'),
    72:  ('card', 'work', 'Track-sawing a composite board'),
    82:  ('card', 'work', 'Setting a vinyl railing'),
    84:  ('card', 'work', 'Board layout'),
    123: ('card', 'work', 'Commercial aluminium fence crew'),
    124: ('card', 'work', 'Chain-link crew'),
    126: ('card', 'work', 'Deck framing'),
    128: ('card', 'work', 'Framing and post set'),
    132: ('card', 'work', 'Vinyl railing install'),
    134: ('card', 'work', 'Laying composite boards'),
    135: ('card', 'work', 'Railing install'),
    141: ('card', 'work', 'Gate operator install'),

    # ---- fences -------------------------------------------------------------
    34:  ('card', 'fence', 'Ornamental aluminium fence'),
    37:  ('card', 'fence', 'Aluminium fence on a stone retaining wall'),
    38:  ('card', 'fence', 'Tan vinyl privacy fence'),
    62:  ('card', 'fence', 'Board-on-board wood fence'),
    98:  ('card', 'fence', 'Vinyl fence line'),
    102: ('card', 'fence', 'Aluminium fence and gate'),
    103: ('card', 'fence', 'Curved white vinyl privacy fence'),
    119: ('card', 'fence', 'Vinyl privacy fence installation'),
    121: ('card', 'fence', 'White post-and-rail fence'),

    # ---- railings -----------------------------------------------------------
    18:  ('card', 'rail', 'Deck with white and black railing'),
    42:  ('card', 'rail', 'White stair railing'),
    63:  ('card', 'rail', 'Deck railing with gate'),
    75:  ('card', 'rail', 'Composite stairs with ornamental railing'),
    76:  ('card', 'rail', 'Deck and black aluminium railing'),
    78:  ('card', 'rail', 'Cable railing deck'),
    80:  ('card', 'rail', 'Balcony railings'),
    99:  ('card', 'rail', 'Stone piers and ornamental railing'),
    109: ('card', 'rail', 'Cable railing on composite deck'),

    # ---- gates --------------------------------------------------------------
    22:  ('card', 'gate', 'Arched aluminium driveway gate'),
    69:  ('card', 'gate', 'Sliding gate installation'),
    91:  ('card', 'gate', 'Solar-powered gate operator'),
    93:  ('card', 'gate', 'Aluminium fence and gate'),
    95:  ('card', 'gate', 'Automatic driveway gate'),
    96:  ('card', 'gate', 'Black driveway gate'),
    104: ('card', 'gate', 'Commercial gate operator'),

    # ---- pool safety --------------------------------------------------------
    6:   ('card', 'pool', 'Mesh fence around a spa'),
    7:   ('card', 'pool', 'Pool fence post detail'),
    32:  ('card', 'pool', 'Pool and handrail'),
    106: ('card', 'pool', 'Pool handrail and brick surround'),

    # ---- backyard structures ------------------------------------------------
    43:  ('card', 'struct', 'Double-wide garage'),
    45:  ('card', 'struct', 'Mini barn'),
    47:  ('card', 'struct', 'New England shed'),
    48:  ('card', 'struct', 'Victorian cottage shed'),
    51:  ('card', 'struct', 'Dutch barn'),
    53:  ('card', 'struct', 'Quaker shed'),
    55:  ('card', 'struct', 'Single garage'),
    120: ('card', 'struct', 'A-frame garage with upstairs'),
    148: ('card', 'struct', 'Chicken coop'),
    149: ('card', 'struct', 'Gazebos'),
    151: ('card', 'struct', 'Outdoor dog kennel'),
}

PROFILES = {
    # name       hero_w  hero_q  card_w  card_q
    'full':     (1920,   82,     1100,   80),
    'web':      (1120,   56,      520,   54),
}


def build(profile):
    hw, hq, cw, cq = PROFILES[profile]
    out = B + f'assets/{profile}/'
    os.makedirs(out, exist_ok=True)
    manifest = {}
    total = 0
    for idx, (kind, cat, caption) in sorted(SEL.items()):
        src = good[idx]
        im = Image.open(src).convert('RGB')
        w, q = (hw, hq) if kind == 'hero' else (cw, cq)
        if im.width > w:
            im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
        key = f'{cat}{idx}'
        path = out + key + '.jpg'
        im.save(path, 'JPEG', quality=q, optimize=True, progressive=True)
        total += os.path.getsize(path)
        manifest[key] = {'cat': cat, 'kind': kind, 'caption': caption,
                         'w': im.width, 'h': im.height, 'file': key + '.jpg'}
    json.dump(manifest, open(out + 'manifest.json', 'w'), indent=1)
    print(f'{profile}: {len(manifest)} images, {total/1e6:.2f} MB')
    return manifest


if __name__ == '__main__':
    for p in (sys.argv[1:] or PROFILES):
        build(p)
