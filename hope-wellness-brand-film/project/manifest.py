#!/usr/bin/env python3
"""
Hope Wellness Center - landscape brand film. Single source of truth timeline.

Verified brand facts (thehopewellnesscenter.com, fetched 2026-07-28):
  name        The Hope Wellness Center
  tagline     "Helping you find comfort, peace of mind, and hope!"
  positioning "Personalized Mental Health Care Rooted in Compassion,
               Trust, and Expertise"
  model       telehealth-only ("We do not offer in-person sessions.")
  states      Massachusetts, Rhode Island, New York, Colorado, Arizona
  CTA         "Book an Appointment"
  colours     #104C98 brand blue / #4EC441 brand green, sampled from the
              official logo PNG rather than guessed
  logo        /wp-content/uploads/2024/12/Hope-Wellness-Center-Mental-Health.png

Only service names that appear on the site are used. No outcome, insurance,
availability, credential or in-person claim is made anywhere in the film.

Delivery is 1200x628 landscape (1.911:1). Sources are 1104x816 (1.353:1) -
proportionally TALLER than the target - so every shot fills the full 628 height
and the frame is completed sideways with a reconstructed background. Nothing is
cropped off a face, hand, limb or held prop; view windows come from measured
character bounds.

Fourteen sections: a particle-ink logo intro, five animated clips, five stills,
and a brand resolve. Thirteen transitions, no plain crossfades.

Source-window rules encoded below
  clip 3  frames 0-48 near-frozen, word cloud garbles after ~6.2 s -> use 2.32-5.80
  clip 4  frames 223-240 frozen                                    -> stop by 8.40
  each shot's outgoing transition tail is verified to stay in clean source
"""

FPS = 30
W, H = 1200, 628

SAFE = (72, 46, 1128, 582)

BLUE = (0x10, 0x4C, 0x98)      # official brand blue
GREEN = (0x4E, 0xC4, 0x41)     # official brand green
INK = (0x14, 0x2A, 0x52)       # darkest navy already present in the artwork
GRADE_TARGET = (0xD8, 0xE1, 0xF7)


def shot(**kw):
    kw.setdefault('still', None)
    return kw


# --------------------------------------------------------------------------
# INTRO - magic-ink particle logo
# --------------------------------------------------------------------------
INTRO = dict(
    id='s0_ink_logo', t_in=0.00, t_out=4.20,
    logo_w=560, cy=300,
    swirl_in=(0.00, 2.06),     # ink flies in and lands
    hold=(2.06, 3.60),         # exact bitmap resolved and crisp
    note='ink particles sampled from the official logo coalesce into it, then '
         'the exact bitmap cross-resolves; nothing is redrawn',
)

# --------------------------------------------------------------------------
# framing: view = (cx, cy, vw, vh, sx) in SOURCE px, two keyframes per shot
#   vh sets the scale (s = 628/vh) and the plate always fills the frame height
#   sx is the on-screen x of the plate's left edge
# --------------------------------------------------------------------------
SHOTS = [
    shot(  # 1 - PRESSURE
        id='s1_swim', clip=1, src_in=0.35, src_out=4.55,
        t_in=4.20, t_out=8.40,
        view=((552, 452, 1104, 700, 208), (552, 458, 1072, 680, 196)),
        text_side='left',
        note='swimmer moving through water - the weight being moved through',
    ),
    shot(  # 2 - PAUSE (still: bench, headphones, eyes closed)
        id='s2_bench', still='still1_bench', src_in=0, src_out=0,
        t_in=8.40, t_out=11.20,
        view=((548, 430, 780, 700, 500), (544, 424, 720, 664, 476)),
        text_side='left',
        note='stillness given real motion by a slow push and drifting leaves',
    ),
    shot(  # 3 - REFLECTION (video: tree pose)
        id='s3_tree', clip=2, src_in=0.25, src_out=4.05,
        t_in=11.20, t_out=15.00,
        view=((470, 424,  900, 782,   0), (466, 434,  872, 756,   0)),
        text_side='right',
        note='tree pose, breath ring, slow push',
    ),
    shot(  # 4 - EXPRESSION (still: painting)
        id='s4_paint', still='still4_paint', src_in=0, src_out=0,
        t_in=15.00, t_out=17.80,
        view=((540, 426, 880, 744, 0), (546, 430, 836, 716, 0)),
        text_side='right',
        note='creative expression; camera drifts across the canvas',
    ),
    shot(  # 5 - SUPPORT (video: pottery)
        id='s5_wheel', clip=4, src_in=0.50, src_out=4.30,
        t_in=17.80, t_out=21.60,
        view=((552, 436, 1064, 656, 180), (552, 432, 1064, 644, 160)),
        text_side='left',
        note='pottery wheel, glow rings around the hands',
    ),
    shot(  # 6 - EVERYDAY (still: tree pose)
        id='s6_tree_still', still='still5_tree', src_in=0, src_out=0,
        t_in=21.60, t_out=23.80,
        view=((560, 420, 880, 736, 0), (556, 424, 844, 712, 0)),
        text_side='right',
        note='held beat between the two service blocks',
    ),
    shot(  # 7 - SERVICES (video: band)
        id='s7_band', clip=5, src_in=0.40, src_out=4.20,
        t_in=23.80, t_out=27.60,
        view=((552, 444, 1104, 706, 206), (552, 442, 1076, 700, 200)),
        text_side='left',
        note='band reads as a horizontal rule; type space left',
    ),
    shot(  # 8 - ACCESS (video: band, cut in)
        id='s8_band_close', clip=5, src_in=4.60, src_out=7.60,
        t_in=27.60, t_out=31.00,
        view=((552, 444, 1088, 744, 262), (548, 444, 1052, 736, 252)),
        text_side='left',
        note='contiguous cut-in on continuing action',
    ),
    shot(  # 9 - TELEHEALTH (still: pottery)
        id='s9_pottery_still', still='still2_pottery', src_in=0, src_out=0,
        t_in=31.00, t_out=33.40,
        view=((560, 410, 820, 700, 464), (556, 414, 788, 676, 468)),
        text_side='left',
        note='calm still under the telehealth + states line',
    ),
    shot(  # 10 - CONFIDENCE (still: dancing, arms open)
        id='s10_dance', still='still3_dance', src_in=0, src_out=0,
        t_in=33.40, t_out=36.40,
        view=((552, 440, 1000, 700, 303), (552, 446, 960, 676, 288)),
        text_side='left',
        note='the most uplifting image in the set carries the turn',
    ),
    shot(  # 11 - FORWARD (video: swim, no copy - a breath)
        id='s11_swim_fwd', clip=1, src_in=5.60, src_out=8.20,
        t_in=36.40, t_out=39.60,
        view=((552, 456, 1080, 692, 218), (552, 462, 1040, 664, 210)),
        text_side='left',
        note='pure motion beat, deliberately free of typography',
    ),
    shot(  # 12 - HOPE (video: reading, clean window only)
        id='s12_read_hope', clip=3, src_in=2.32, src_out=5.80,
        t_in=39.60, t_out=44.40,
        view=((584, 398, 884, 762, 468), (588, 402, 856, 744, 456)),
        text_side='left',
        note="'hope' rises from the book in brand blue + green",
    ),
]

RESOLVE = dict(id='s13_resolve', t_in=44.40, t_out=49.80)
TOTAL = RESOLVE['t_out']

# --------------------------------------------------------------------------
# transitions - every one motivated by an object or by the ink motif
# --------------------------------------------------------------------------
TRANSITIONS = [
    dict(at=4.20,  dur=0.72, kind='inkdissolve',
         note='the logo breaks back into ink motes and reveals the water'),
    dict(at=8.40,  dur=0.80, kind='ripple',   origin=(0.62, 0.56),
         note='water ripple off the swimmer becomes a circular mask'),
    dict(at=11.20, dur=0.58, kind='swipebar', d=1,
         note='a brand-green bar swipes across and drags the next shot in'),
    dict(at=15.00, dur=0.72, kind='ring',     origin=(0.58, 0.46),
         note='breath ring expands past the frame edge'),
    dict(at=17.80, dur=0.62, kind='zoomblur',
         note='punch in through the canvas into the wheel'),
    dict(at=21.60, dur=0.62, kind='ripple',   origin=(0.56, 0.62),
         note='the glowing wheel disc expands into a circular mask'),
    dict(at=23.80, dur=0.68, kind='leafwipe',
         note='a defocused leaf crosses the lens; the cut hides behind it'),
    dict(at=27.60, dur=0.62, kind='bandwipe',
         note='the resistance band becomes a travelling stroke'),
    dict(at=31.00, dur=0.60, kind='push',     d=-1,
         note='the frame pushes sideways, carrying the reframe'),
    dict(at=33.40, dur=0.58, kind='swipebar', d=-1,
         note='a green bar swipes back the other way into the turn'),
    dict(at=36.40, dur=0.72, kind='trailwipe',
         note='motion trail sweeps into water'),
    dict(at=39.60, dur=0.80, kind='ripple',   origin=(0.58, 0.52),
         note='bow-wave ripple reveals the chair - mirrors the opening'),
    dict(at=44.40, dur=0.92, kind='gather',
         note='hope-words and botanicals gather to centre, into the card'),
]


def T(**kw):
    kw.setdefault('color', BLUE)
    kw.setdefault('align', 'left')
    kw.setdefault('weight', 'Bold')
    kw.setdefault('lead', 1.14)
    kw.setdefault('scrim', 'green')      # soft brand-green gradient behind copy
    return kw


# --------------------------------------------------------------------------
# typography. anim kinds implemented in compose.py:
#   ripplemask  revealed by the same expanding wavefront as the transition
#   swipe       hard-edged bar swipes across, dragging the letters in
#   pop3d       perspective tilt resolves flat with an extruded edge - 3D pop
#   riselock    rises from below, blur resolves
#   wordblur    words resolve out of blur one by one
#   swap        replaces the previous line, lifting away
#   linewipe    revealed by a stroke travelling along the band
#   disperse    holds, then dissolves upward into translucent particles
#   logo_in     protected single-asset entrance, no internal animation
# --------------------------------------------------------------------------
COPY = [
    T(id='c1', t_in=4.86, t_out=8.16, anim='ripplemask',
      lines=['When life', 'feels heavy…'], size=68,
      x=76, y=300, maxw=430, origin=(0.62, 0.56), rip_t0=0.22, rip_dur=1.15),

    T(id='c2', t_in=8.94, t_out=11.00, anim='pop3d',
      lines=['Find space', 'to breathe.'], size=72,
      x=76, y=222, maxw=396),

    T(id='c3', t_in=11.86, t_out=14.80, anim='swipe', swipe_d=1,
      lines=['A place', 'to feel', 'heard.'], size=72,
      x=790, y=170, maxw=330),

    T(id='c4', t_in=15.62, t_out=17.62, anim='wordblur',
      lines=['Care that makes', 'room for the', 'whole person.'], size=46,
      weight='SemiBold', x=764, y=224, maxw=364, lead=1.24),

    T(id='c5a', t_in=18.32, t_out=19.86, anim='pop3d',
      lines=['Personalized', 'support.'], size=58, x=76, y=228, maxw=392),
    T(id='c5b', t_in=19.96, t_out=21.42, anim='swap',
      lines=['Care built', 'around you.'], size=58, x=76, y=228, maxw=392),

    T(id='c6', t_in=21.98, t_out=23.62, anim='swipe', swipe_d=-1,
      lines=['Wherever', 'life happens.'], size=58, x=772, y=232, maxw=356),

    T(id='c7a', t_in=24.36, t_out=25.86, anim='linewipe',
      lines=['Therapy'], size=76, x=76, y=262, maxw=330),
    T(id='c7b', t_in=26.02, t_out=27.44, anim='linewipe',
      lines=['Medication', 'management'], size=54, x=76, y=234, maxw=300),

    T(id='c8', t_in=28.10, t_out=30.84, anim='swipe', swipe_d=1,
      lines=['Psychiatric', 'care'], size=56, x=76, y=222, maxw=300),

    T(id='c9', t_in=31.46, t_out=33.26, anim='riselock',
      lines=['Secure telehealth', 'across'], size=38, weight='SemiBold',
      x=76, y=214, maxw=360, states=['MA', 'RI', 'NY', 'CO', 'AZ'],
      states_size=42, states_y=322),

    T(id='c10', t_in=33.98, t_out=36.24, anim='pop3d',
      lines=['One small step', 'can begin', 'a new direction.'], size=48,
      weight='SemiBold', x=76, y=214, maxw=400, lead=1.24),

    T(id='c12a', t_in=40.02, t_out=41.42, anim='disperse',
      lines=['Comfort.'], size=66, x=76, y=294, maxw=430),
    T(id='c12b', t_in=41.52, t_out=42.94, anim='disperse',
      lines=['Peace of', 'mind.'], size=66, x=76, y=252, maxw=430),
    T(id='c12c', t_in=43.04, t_out=44.36, anim='disperse',
      lines=['Hope.'], size=88, weight='ExtraBold', x=76, y=282, maxw=430),

    # ---- brand resolve. logo enters 45.20 as ONE protected asset and is
    #      unobstructed and fully readable 45.66 -> 49.80 = 4.14 s
    T(id='logo', t_in=45.20, t_out=49.80, anim='logo_in', logo_w=516, cy=242),
    T(id='cta', t_in=46.40, t_out=49.80, anim='riselock', align='center',
      lines=['Schedule Your Appointment'], size=38, weight='SemiBold',
      x=600, y=376, maxw=760, scrim='none'),
    T(id='url', t_in=46.96, t_out=49.80, anim='riselock', align='center',
      lines=['thehopewellnesscenter.com'], size=31, weight='Medium',
      x=600, y=444, maxw=760, scrim='none'),
]

# per-clip nudges on top of the automatic background match.
# stills share their own key so they grade into the same palette.
GRADE = {
    1: dict(sat=1.03, con=1.03, warm=+0.004),
    2: dict(sat=1.00, con=1.02, warm=+0.002),
    3: dict(sat=0.93, con=1.05, warm=-0.007),
    4: dict(sat=1.01, con=1.03, warm=+0.000),
    5: dict(sat=1.02, con=1.03, warm=+0.002),
    'still1_bench': dict(sat=1.00, con=1.03, warm=+0.001),
    'still2_pottery': dict(sat=1.00, con=1.03, warm=+0.000),
    'still3_dance': dict(sat=1.01, con=1.04, warm=+0.001),
    'still4_paint': dict(sat=0.97, con=1.04, warm=-0.003),
    'still5_tree': dict(sat=1.02, con=1.03, warm=+0.002),
}


def shot_speed(s):
    if s['still']:
        return 0.0
    return (s['src_out'] - s['src_in']) / (s['t_out'] - s['t_in'])


def grade_key(s):
    return s['still'] if s['still'] else s['clip']


def validate():
    CLEAN = {1: (0.00, 10.04), 2: (0.00, 10.04), 3: (2.00, 6.60),
             4: (0.00, 9.25), 5: (0.00, 10.04)}
    tr = {t['at']: t for t in TRANSITIONS}
    assert abs(INTRO['t_out'] - SHOTS[0]['t_in']) < 1e-6, 'intro/shot1 gap'
    prev = SHOTS[0]['t_in']
    for s in SHOTS:
        assert abs(s['t_in'] - prev) < 1e-6, f"gap before {s['id']}"
        prev = s['t_out']
        if not s['still']:
            sp = shot_speed(s)
            assert 0.60 <= sp <= 1.05, f"{s['id']} speed {sp:.3f}"
            tail = tr[s['t_out']]['dur'] * sp if s['t_out'] in tr else 0.0
            lo, hi = CLEAN[s['clip']]
            assert s['src_in'] >= lo - 1e-6, f"{s['id']} starts weak"
            assert s['src_out'] + tail <= hi + 1e-6, \
                f"{s['id']} tail reads {s['src_out']+tail:.2f}s > clean {hi}"
        for (cx, cy, vw, vh, sx) in s['view']:
            assert cx - vw / 2 >= -1 and cx + vw / 2 <= 1105, f"{s['id']} x window"
            assert cy - vh / 2 >= -1 and cy + vh / 2 <= 817, f"{s['id']} y window"
            pw = vw * (H / vh)
            assert sx >= -2 and sx + pw <= W + 2, \
                f"{s['id']} plate {pw:.0f}px at sx {sx} overflows"
    assert abs(RESOLVE['t_in'] - prev) < 1e-6
    assert 42.0 <= TOTAL <= 55.0, TOTAL
    logo = [c for c in COPY if c['id'] == 'logo'][0]
    assert TOTAL - (logo['t_in'] + 0.46) >= 4.0, 'logo hold under 4 s'
    for c in COPY:
        if 'y' in c:
            assert SAFE[1] <= c['y'] <= SAFE[3], f"{c['id']} outside safe band"
    # every copy event must sit inside a shot, never straddle a cut
    bounds = [(s['t_in'], s['t_out']) for s in SHOTS] + \
             [(RESOLVE['t_in'], RESOLVE['t_out'])]
    for c in COPY:
        assert any(a - 1e-6 <= c['t_in'] and c['t_out'] <= b + 1e-6
                   for a, b in bounds), f"{c['id']} straddles a cut"
    return True


if __name__ == '__main__':
    validate()
    print(f'timeline OK  {W}x{H}  total={TOTAL:.2f}s  '
          f'frames={int(round(TOTAL*FPS))}  sections={len(SHOTS)+2}')
    print(f"  {INTRO['id']:18s} INTRO   screen  0.00-{INTRO['t_out']:5.2f}"
          f"   particle-ink logo")
    for s in SHOTS:
        (cx, cy, vw, vh, sx) = s['view'][0]
        pw = vw * (H / vh)
        src = 'STILL' if s['still'] else f"src {s['src_in']:4.2f}-{s['src_out']:4.2f}"
        who = s['still'] if s['still'] else f"clip{s['clip']}"
        print(f"  {s['id']:18s} {who:14s} {s['t_in']:5.2f}-{s['t_out']:5.2f}"
              f"  {src:16s} plate {pw:4.0f}px @x{sx:4d}  text {s['text_side']:5s}")
    print(f"  {RESOLVE['id']:18s} card         {RESOLVE['t_in']:5.2f}-{RESOLVE['t_out']:5.2f}")
