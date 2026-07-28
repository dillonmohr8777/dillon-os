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

Delivery is 1200x628 landscape (1.911:1). The source clips are 1104x816
(1.353:1) - TALLER in proportion than the target - so every shot is scaled to
fill the full 628 height and the frame is completed sideways with a
reconstructed background. Nothing is ever cropped off a face, hand, limb or
held prop; the vertical view window per shot is set from the measured
character bounds.

Source-window rules encoded below
  clip 3  frames 0-48 near-frozen, word cloud garbles after ~6.2 s -> use 2.32-5.80
  clip 4  frames 223-240 frozen                                    -> stop by 8.40
  clip 2  camera settles after 6 s (stillest)                      -> the reflection beat
  each shot's outgoing transition tail is verified to stay in clean source
"""

FPS = 30
W, H = 1200, 628

# editorial margins. 1.911:1 is a web / OG / LinkedIn card shape with no
# platform chrome, so these are design margins rather than Reels/TikTok
# action-rail avoidance - generous enough to stay safe if it is ever reframed.
SAFE = (72, 46, 1128, 582)

BLUE = (0x10, 0x4C, 0x98)      # official brand blue
GREEN = (0x4E, 0xC4, 0x41)     # official brand green
INK = (0x14, 0x2A, 0x52)       # darkest navy already present in the artwork
GRADE_TARGET = (0xD8, 0xE1, 0xF7)   # common background all five clips grade to


def shot(**kw):
    return kw


# --------------------------------------------------------------------------
# framing: view = (cx, cy, vw, vh, sx) in SOURCE px, two keyframes per shot
#   cx, cy   centre of the source window
#   vw, vh   size of the source window; the plate always fills the 628 height
#            so scale s = 628/vh and on-screen plate width = vw * s
#   sx       on-screen x of the plate's left edge
# vh is chosen per shot from the measured character bounds, so heads, hands,
# feet and held props are never cut. The width left over becomes designed
# negative space that carries the typography.
# --------------------------------------------------------------------------
SHOTS = [
    shot(  # 1 - PRESSURE. strongest motion in the set opens the film
        id='s1_swim', clip=1, src_in=0.35, src_out=4.95,
        t_in=0.00, t_out=4.60,
        view=((552, 452, 1104, 700, 208), (552, 458, 1072, 680, 196)),
        text_side='left',
        note='swimmer moving through water - the weight being moved through',
    ),
    shot(  # 2 - PAUSE. calmest footage; breath ring and drifting leaves
        id='s2_tree', clip=2, src_in=0.25, src_out=5.85,
        t_in=4.60, t_out=10.20,
        view=((552, 424, 1100, 782, 308), (552, 438, 1064, 752, 300)),
        text_side='left',
        note='tree pose, breath ring, slow push',
    ),
    shot(  # 3 - REFLECTION. same setup after the camera settles = stillness
        id='s3_tree_close', clip=2, src_in=6.30, src_out=9.35,
        t_in=10.20, t_out=14.10,
        view=((504, 400, 1000, 760,   0), (500, 404,  972, 744,   0)),
        text_side='right',
        note='cut-in on the settled camera; she fills the height, type sits right',
    ),
    shot(  # 4 - SUPPORT. hands shaping clay: care applied to a whole person
        id='s4_wheel', clip=4, src_in=0.50, src_out=5.80,
        t_in=14.10, t_out=19.40,
        view=((552, 436, 1064, 656, 180), (552, 432, 1064, 644, 160)),
        text_side='left',
        note='pottery wheel, glow rings around the hands',
    ),
    shot(  # 5 - SUPPORT cont. same clip, continuing action = true match cut
        id='s5_wheel_close', clip=4, src_in=5.80, src_out=8.40,
        t_in=19.40, t_out=23.00,
        view=((552, 384,  952, 604, 206), (556, 380,  916, 584, 210)),
        text_side='left',
        note='closer on the wheel where the ring glow peaks',
    ),
    shot(  # 6 - SERVICES. band fully extended across the frame
        id='s6_band', clip=5, src_in=0.40, src_out=5.30,
        t_in=23.00, t_out=27.90,
        view=((552, 444, 1104, 706, 206), (552, 442, 1076, 700, 204)),
        text_side='left',
        note='band reads as a horizontal rule; nothing cropped, type space left',
    ),
    shot(  # 7 - ACCESS. arms draw in over the shot; clip's own push carries it
        id='s7_band_close', clip=5, src_in=5.30, src_out=9.00,
        t_in=27.90, t_out=32.20,
        view=((552, 444, 1088, 744, 262), (548, 444, 1052, 736, 252)),
        text_side='left',
        note='contiguous cut-in; telehealth + states land here',
    ),
    shot(  # 8 - FORWARD. back to water, now momentum rather than weight
        id='s8_swim_fwd', clip=1, src_in=5.90, src_out=9.30,
        t_in=32.20, t_out=37.10,
        view=((552, 456, 1080, 692, 218), (552, 462, 1040, 664, 210)),
        text_side='left',
        note='second, non-overlapping window of clip 1 - a bookend, not a repeat',
    ),
    shot(  # 9 - HOPE. only the clean window, before the word cloud garbles
        id='s9_read_hope', clip=3, src_in=2.32, src_out=5.80,
        t_in=37.10, t_out=42.10,
        view=((584, 398,  884, 762, 468), (588, 402,  856, 744, 456)),
        text_side='left',
        note="'hope' rises from the book in brand blue + green",
    ),
]

RESOLVE = dict(id='s10_resolve', t_in=42.10, t_out=47.70)
TOTAL = RESOLVE['t_out']

# --------------------------------------------------------------------------
# transitions. every one is motivated by an object physically in the shot.
# window = [at, at + dur]; the outgoing shot's extra source read is verified
# to stay inside each clip's clean region.
# --------------------------------------------------------------------------
TRANSITIONS = [
    dict(at=4.60,  dur=0.90, kind='ripple',   origin=(0.62, 0.56),
         note='water ripple off the swimmer becomes a circular mask'),
    dict(at=10.20, dur=0.80, kind='ring',     origin=(0.60, 0.46),
         note='breath ring expands past the frame edge and carries the reframe'),
    dict(at=14.10, dur=0.72, kind='leafwipe',
         note='a foreground leaf passes the lens; the cut hides behind it'),
    dict(at=19.40, dur=0.66, kind='ripple',   origin=(0.56, 0.62),
         note='the glowing wheel disc expands into a circular mask'),
    dict(at=23.00, dur=0.80, kind='horizon',
         note='the wheel disc flattens into a horizon line and rises'),
    dict(at=27.90, dur=0.72, kind='bandwipe',
         note='the resistance band becomes a travelling stroke'),
    dict(at=32.20, dur=0.80, kind='trailwipe',
         note='motion trail off the band release sweeps into water'),
    dict(at=37.10, dur=0.86, kind='ripple',   origin=(0.58, 0.52),
         note='bow-wave ripple reveals the chair - mirrors the opening'),
    dict(at=42.10, dur=1.00, kind='gather',
         note='hope-words and botanicals gather to centre, dissolving into the card'),
]


def T(**kw):
    kw.setdefault('color', BLUE)
    kw.setdefault('align', 'left')
    kw.setdefault('weight', 'Bold')
    kw.setdefault('lead', 1.14)
    return kw


# --------------------------------------------------------------------------
# typography. one phrase on screen at a time, broken into short editorial
# lines that sit in the negative space beside the subject. anim kinds:
#   ripplemask  revealed by the same expanding wavefront as the transition
#   ringmask    revealed by the breath ring sweeping through it
#   riselock    rises from below, blur resolves
#   wordblur    words resolve out of blur one by one, assembling the phrase
#   swap        replaces the previous line, lifting away as it leaves
#   linewipe    revealed by a stroke travelling along the resistance band
#   disperse    holds, then dissolves upward into translucent particles
#   logo_in     protected single-asset entrance, no internal animation
# --------------------------------------------------------------------------
COPY = [
    T(id='c1', t_in=0.62, t_out=4.36, anim='ripplemask',
      lines=['When life', 'feels heavy…'], size=68,
      x=76, y=300, maxw=430, origin=(0.62, 0.56), rip_t0=0.24, rip_dur=1.30),

    T(id='c2', t_in=5.40, t_out=9.90, anim='ringmask',
      lines=['Find space', 'to breathe.'], size=70,
      x=76, y=228, maxw=340, origin=(0.60, 0.48), rip_t0=0.26, rip_dur=1.35),

    T(id='c3', t_in=10.80, t_out=13.82, anim='riselock',
      lines=['A place', 'to feel', 'heard.'], size=72,
      x=812, y=170, maxw=316),

    T(id='c4', t_in=14.78, t_out=19.10, anim='wordblur',
      lines=['Care that makes', 'room for the', 'whole person.'], size=46,
      weight='SemiBold', x=76, y=232, maxw=390, lead=1.24),

    T(id='c5a', t_in=19.90, t_out=21.34, anim='swap',
      lines=['Personalized', 'support.'], size=56, x=76, y=232, maxw=390),
    T(id='c5b', t_in=21.42, t_out=22.84, anim='swap',
      lines=['Wherever', 'life happens.'], size=56, x=76, y=232, maxw=390),

    T(id='c6a', t_in=23.66, t_out=25.32, anim='linewipe',
      lines=['Therapy'], size=76, x=76, y=262, maxw=330),
    T(id='c6b', t_in=25.52, t_out=27.66, anim='linewipe',
      lines=['Medication', 'management'], size=54, x=76, y=234, maxw=300),

    T(id='c7a', t_in=28.42, t_out=30.14, anim='linewipe',
      lines=['Psychiatric', 'care'], size=54, x=76, y=222, maxw=300),
    T(id='c7b', t_in=30.42, t_out=32.06, anim='riselock',
      lines=['Secure telehealth', 'across'], size=36, weight='SemiBold',
      x=76, y=222, maxw=300, states=['MA', 'RI', 'NY', 'CO', 'AZ'],
      states_size=40, states_y=326),

    T(id='c8', t_in=32.86, t_out=36.74, anim='wordblur',
      lines=['One small step', 'can begin', 'a new direction.'], size=46,
      weight='SemiBold', x=76, y=224, maxw=390, lead=1.24),

    T(id='c9a', t_in=37.52, t_out=38.98, anim='disperse',
      lines=['Comfort.'], size=66, x=76, y=294, maxw=420),
    T(id='c9b', t_in=39.08, t_out=40.56, anim='disperse',
      lines=['Peace of', 'mind.'], size=66, x=76, y=252, maxw=420),
    T(id='c9c', t_in=40.66, t_out=42.06, anim='disperse',
      lines=['Hope.'], size=88, weight='ExtraBold', x=76, y=282, maxw=420),

    # ---- brand resolve. the logo enters as ONE protected asset at 42.95 and
    #      is unobstructed and fully readable 43.40 -> 47.70 = 4.30 s
    T(id='logo', t_in=42.95, t_out=47.70, anim='logo_in', logo_w=516, cy=242),
    T(id='cta', t_in=44.20, t_out=47.70, anim='riselock', align='center',
      lines=['Schedule Your Appointment'], size=38, weight='SemiBold',
      x=600, y=376, maxw=760),
    T(id='url', t_in=44.80, t_out=47.70, anim='riselock', align='center',
      lines=['thehopewellnesscenter.com'], size=31, weight='Medium',
      x=600, y=444, maxw=760),
]

# per-clip nudges applied on top of the automatic background match
GRADE = {
    1: dict(sat=1.03, con=1.03, warm=+0.004),
    2: dict(sat=1.00, con=1.02, warm=+0.002),
    3: dict(sat=0.93, con=1.05, warm=-0.007),   # pulls clip 3's sage cast in line
    4: dict(sat=1.01, con=1.03, warm=+0.000),
    5: dict(sat=1.02, con=1.03, warm=+0.002),
}


def shot_speed(s):
    return (s['src_out'] - s['src_in']) / (s['t_out'] - s['t_in'])


def validate():
    """Fail loudly if the timeline drifts out of spec."""
    CLEAN = {1: (0.00, 10.04), 2: (0.00, 10.04), 3: (2.00, 6.60),
             4: (0.00, 9.25), 5: (0.00, 10.04)}
    tr = {t['at']: t for t in TRANSITIONS}
    prev = 0.0
    for s in SHOTS:
        assert abs(s['t_in'] - prev) < 1e-6, f"gap before {s['id']}"
        prev = s['t_out']
        sp = shot_speed(s)
        assert 0.60 <= sp <= 1.05, f"{s['id']} speed {sp:.3f}"
        tail = tr[s['t_out']]['dur'] * sp if s['t_out'] in tr else 0.0
        lo, hi = CLEAN[s['clip']]
        assert s['src_in'] >= lo - 1e-6, f"{s['id']} starts in a weak region"
        assert s['src_out'] + tail <= hi + 1e-6, \
            f"{s['id']} tail reads {s['src_out']+tail:.2f}s > clean {hi}"
        for (cx, cy, vw, vh, sx) in s['view']:
            assert cx - vw / 2 >= -1 and cx + vw / 2 <= 1105, f"{s['id']} x window"
            assert cy - vh / 2 >= -1 and cy + vh / 2 <= 817, f"{s['id']} y window"
            pw = vw * (H / vh)
            assert sx >= -2 and sx + pw <= W + 2, \
                f"{s['id']} plate {pw:.0f}px at sx {sx} overflows"
    assert abs(RESOLVE['t_in'] - prev) < 1e-6
    assert 42.0 <= TOTAL <= 50.0, TOTAL
    logo = [c for c in COPY if c['id'] == 'logo'][0]
    assert TOTAL - (logo['t_in'] + 0.45) >= 4.0, 'logo hold under 4 s'
    for c in COPY:
        if 'y' in c:
            assert SAFE[1] <= c['y'] <= SAFE[3], f"{c['id']} outside safe band"
    return True


if __name__ == '__main__':
    validate()
    print(f'timeline OK  {W}x{H}  total={TOTAL:.2f}s  frames={int(round(TOTAL*FPS))}')
    for s in SHOTS:
        (cx, cy, vw, vh, sx) = s['view'][0]
        pw = vw * (H / vh)
        print(f"  {s['id']:16s} clip{s['clip']}  screen {s['t_in']:5.2f}-{s['t_out']:5.2f}"
              f"  src {s['src_in']:4.2f}-{s['src_out']:4.2f}  speed {shot_speed(s):.3f}"
              f"  plate {pw:4.0f}px @x{sx:4d}  ext {W-pw:4.0f}px  text {s['text_side']}")
    print(f"  {RESOLVE['id']:16s} card    screen {RESOLVE['t_in']:5.2f}-{RESOLVE['t_out']:5.2f}")
