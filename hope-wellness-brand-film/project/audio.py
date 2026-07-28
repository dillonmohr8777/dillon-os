#!/usr/bin/env python3
"""
Hope Wellness Center brand film - score + sound design, synthesised from
scratch (no stock, no licensing ambiguity).

  80 BPM, A major / modal, airy piano + warm pads + gentle organic percussion.
  A slow emotional build that tracks the film's arc and resolves under the
  brand card. No lyrics, no trailer hits, no corporate ukulele.

Sound design is placed on the object-motivated transitions in manifest.py:
water ripple, breath ring, leaf pass, clay ring, rising light, band stroke,
motion trail, bow wave, tonal resolve.

Output: render/score.wav  (48 kHz, stereo, float -> 24-bit PCM)
"""
import os
import sys
import wave

import numpy as np
from scipy.signal import fftconvolve, butter, sosfilt

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import manifest as M

SR = 48000
BPM = 80.0
BEAT = 60.0 / BPM              # 0.75 s
BAR = 4 * BEAT                 # 3.0 s
DUR = M.TOTAL                  # 47.70 s
TAIL = 1.9                     # reverb tail rendered past the end, then faded
N = int(round((DUR + TAIL) * SR))
rng = np.random.default_rng(11)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'render')
os.makedirs(OUT, exist_ok=True)


# ----------------------------------------------------------------- helpers
def note(name):
    """Scientific pitch -> Hz (A4 = 440)."""
    step = {'C': -9, 'D': -7, 'E': -5, 'F': -4, 'G': -2, 'A': 0, 'B': 2}
    n = name[0].upper()
    i = 1
    acc = 0
    while i < len(name) and name[i] in '#b':
        acc += 1 if name[i] == '#' else -1
        i += 1
    octv = int(name[i:])
    semis = step[n] + acc + (octv - 4) * 12
    return 440.0 * 2 ** (semis / 12.0)


def env_ad(n, attack, decay, curve=2.2):
    a = max(1, int(attack * SR))
    e = np.empty(n, np.float32)
    a = min(a, n)
    e[:a] = np.linspace(0, 1, a, dtype=np.float32) ** 0.7
    if n > a:
        e[a:] = np.exp(-np.arange(n - a, dtype=np.float32) / (decay * SR)) ** curve
    return e


def env_asr(n, attack, release):
    e = np.ones(n, np.float32)
    a = min(max(1, int(attack * SR)), n)
    r = min(max(1, int(release * SR)), n)
    e[:a] = np.sin(np.linspace(0, np.pi / 2, a, dtype=np.float32)) ** 2
    e[n - r:] *= np.clip(np.cos(np.linspace(0, np.pi / 2, r,
                                         dtype=np.float32)), 0, 1) ** 2
    return e


def lp(x, fc, order=2):
    return sosfilt(butter(order, min(fc, SR * 0.49) / (SR / 2), 'low',
                          output='sos'), x).astype(np.float32)


def hp(x, fc, order=2):
    return sosfilt(butter(order, max(20.0, fc) / (SR / 2), 'high',
                          output='sos'), x).astype(np.float32)


def bp(x, f0, f1, order=2):
    lo = max(20.0, f0) / (SR / 2)
    hi = min(f1, SR * 0.49) / (SR / 2)
    return sosfilt(butter(order, [lo, hi], 'band', output='sos'),
                   x).astype(np.float32)


def lp2(x, fc, order=2):
    return sosfilt(butter(order, min(fc, SR * 0.49) / (SR / 2), 'low',
                          output='sos'), x, axis=0).astype(np.float32)


def hp2(x, fc, order=2):
    return sosfilt(butter(order, max(20.0, fc) / (SR / 2), 'high',
                          output='sos'), x, axis=0).astype(np.float32)


def add(buf, sig, t, pan=0.0, gain=1.0):
    """Mix a mono signal into the stereo bus at time t with equal-power pan."""
    i = int(round(t * SR))
    if i >= buf.shape[0]:
        return
    s = sig[:buf.shape[0] - i]
    l = np.cos((pan + 1) * np.pi / 4) * gain
    r = np.sin((pan + 1) * np.pi / 4) * gain
    buf[i:i + len(s), 0] += s * l
    buf[i:i + len(s), 1] += s * r


def add_ms(buf, mid, side, t, side_gain=0.5):
    """
    Mid/side placement. L = M + g.S, R = M - g.S, so a mono fold cancels S
    entirely and preserves M at full level - real stereo width with zero
    phase penalty on a phone speaker.
    """
    i = int(round(t * SR))
    if i >= buf.shape[0]:
        return
    m = mid[:buf.shape[0] - i]
    sd = side[:len(m)] * side_gain
    if len(sd) < len(m):
        sd = np.pad(sd, (0, len(m) - len(sd)))
    buf[i:i + len(m), 0] += m + sd
    buf[i:i + len(m), 1] += m - sd


def pink(n):
    w = rng.standard_normal(n).astype(np.float32)
    return lp(w, 2600, 1) * 1.4


# ------------------------------------------------------------- instruments
def piano(freq, dur, vel=1.0):
    """Struck-string model: inharmonic partials, faster decay up the series."""
    n = int(dur * SR)
    t = np.arange(n, dtype=np.float32) / SR
    out = np.zeros(n, np.float32)
    B = 0.00028                                   # inharmonicity
    for k in range(1, 11):
        fk = freq * k * (1 + B * k * k)
        if fk > SR * 0.45:
            break
        amp = (1.0 / k ** 1.42) * (1.0 + 0.10 * rng.standard_normal())
        dk = (1.55 / (1 + 0.55 * (k - 1))) * (1.0 - 0.22 * min(1.0, freq / 900))
        ph = rng.uniform(0, 2 * np.pi)
        out += amp * np.sin(2 * np.pi * fk * t + ph) * np.exp(-t / dk)
    # hammer transient
    m = min(n, int(0.010 * SR))
    out[:m] += bp(rng.standard_normal(m).astype(np.float32),
                  freq * 1.6, 5200) * 0.16
    out *= env_ad(n, 0.004, dur * 0.9, 1.0)
    return out * (0.30 * vel)


def pad(freqs, dur, vel=1.0, detune=0.006, bright=0.5):
    """Warm breathing pad: detuned stacks, slow attack, gentle filter motion."""
    n = int(dur * SR)
    t = np.arange(n, dtype=np.float32) / SR
    out = np.zeros(n, np.float32)
    for f in freqs:
        for d in (-detune, 0.0, detune):
            fk = f * (1 + d)
            lfo = 1 + 0.0016 * np.sin(2 * np.pi * 0.13 * t + rng.uniform(0, 6))
            s = np.sin(2 * np.pi * fk * t * lfo + rng.uniform(0, 6))
            s += 0.30 * np.sin(4 * np.pi * fk * t + rng.uniform(0, 6))
            s += 0.12 * np.sin(6 * np.pi * fk * t + rng.uniform(0, 6))
            out += s * (1.0 / (len(freqs) * 3))
    # slow opening filter = the "breathing" quality
    cut = 900 + 2600 * bright
    out = lp(out, cut, 2)
    out *= 1 + 0.06 * np.sin(2 * np.pi * 0.09 * t)
    out *= env_asr(n, min(1.5, dur * 0.42), min(1.6, dur * 0.45))
    return out * (0.15 * vel)


def sub(freq, dur, vel=1.0):
    n = int(dur * SR)
    t = np.arange(n, dtype=np.float32) / SR
    s = np.sin(2 * np.pi * freq * t) + 0.22 * np.sin(4 * np.pi * freq * t)
    return s * env_asr(n, dur * 0.35, dur * 0.45) * (0.16 * vel)


def pluck(freq, dur, vel=1.0):
    n = int(dur * SR)
    t = np.arange(n, dtype=np.float32) / SR
    s = (np.sin(2 * np.pi * freq * t) +
         0.34 * np.sin(4 * np.pi * freq * t) +
         0.10 * np.sin(6 * np.pi * freq * t))
    return s * env_ad(n, 0.005, 0.34, 1.5) * (0.11 * vel)


def kick(vel=1.0):
    n = int(0.34 * SR)
    t = np.arange(n, dtype=np.float32) / SR
    f = 112 * np.exp(-t / 0.048) + 44
    s = np.sin(2 * np.pi * np.cumsum(f) / SR)
    s *= np.exp(-t / 0.115)
    s[:int(0.004 * SR)] += rng.standard_normal(int(0.004 * SR)) * 0.20
    return lp(s, 1500, 1) * (0.34 * vel)


def shaker(vel=1.0):
    n = int(0.085 * SR)
    s = bp(rng.standard_normal(n).astype(np.float32), 4200, 11000, 2)
    return s * env_ad(n, 0.002, 0.022, 1.2) * (0.135 * vel)


def tick(vel=1.0):
    n = int(0.05 * SR)
    s = bp(rng.standard_normal(n).astype(np.float32), 1500, 3600, 2)
    return s * env_ad(n, 0.001, 0.014, 1.2) * (0.07 * vel)


def bell(freq, dur=2.6, vel=1.0):
    n = int(dur * SR)
    t = np.arange(n, dtype=np.float32) / SR
    out = np.zeros(n, np.float32)
    for k, a in ((1, 1.0), (2.01, 0.42), (3.02, 0.18), (4.15, 0.08)):
        out += a * np.sin(2 * np.pi * freq * k * t) * np.exp(-t / (dur * 0.34 / k))
    return out * env_ad(n, 0.006, dur * 0.5, 1.0) * (0.23 * vel)


# ---------------------------------------------------------- sound design
def water_swell(dur=1.5, vel=1.0):
    n = int(dur * SR)
    t = np.arange(n, dtype=np.float32) / SR
    w = pink(n)
    c = 380 + 900 * np.sin(np.pi * t / dur) ** 1.4
    out = np.zeros(n, np.float32)
    seg = int(0.05 * SR)
    for i in range(0, n, seg):
        j = min(n, i + seg)
        out[i:j] = bp(w[i:j], float(c[i]) * 0.6, float(c[i]) * 2.6, 2)
    out *= env_asr(n, dur * 0.30, dur * 0.55)
    return out * (0.25 * vel)


def airy_sweep(dur=1.0, vel=1.0, up=True):
    n = int(dur * SR)
    t = np.arange(n, dtype=np.float32) / SR
    w = pink(n)
    k = (t / dur) if up else (1 - t / dur)
    out = np.zeros(n, np.float32)
    seg = int(0.04 * SR)
    for i in range(0, n, seg):
        j = min(n, i + seg)
        f0 = 380 + 5200 * float(k[i])
        out[i:j] = bp(w[i:j], f0, f0 * 2.4, 2)
    # riser envelope peaking at 78% of the sound, so when it is anchored the
    # crest lands exactly on the cut instead of half a second after it
    u = t / dur
    e = np.where(u < 0.78, np.clip(u / 0.78, 0, 1) ** 1.7,
                 np.exp(-(u - 0.78) / 0.085))
    out *= e
    return out * (0.28 * vel)


def leaf_rustle(dur=0.55, vel=1.0):
    n = int(dur * SR)
    out = np.zeros(n, np.float32)
    for _ in range(11):
        s = int(rng.uniform(0, dur * 0.7) * SR)
        m = int(rng.uniform(0.012, 0.045) * SR)
        if s + m >= n:
            continue
        b = bp(rng.standard_normal(m).astype(np.float32), 2400, 9500, 2)
        out[s:s + m] += b * env_ad(m, 0.001, 0.012, 1.1) * rng.uniform(0.4, 1.0)
    return out * (0.21 * vel)


def breath(dur=2.2, vel=1.0):
    n = int(dur * SR)
    t = np.arange(n, dtype=np.float32) / SR
    w = lp(pink(n), 1100, 2)
    w = w * (1 + 0.25 * np.sin(2 * np.pi * 0.5 * t))
    return w * np.sin(np.pi * t / dur) ** 2 * (0.13 * vel)


def band_tension(dur=0.7, vel=1.0):
    n = int(dur * SR)
    t = np.arange(n, dtype=np.float32) / SR
    w = bp(rng.standard_normal(n).astype(np.float32), 700, 2600, 2)
    w *= 1 + 0.6 * np.sin(2 * np.pi * 34 * t)
    return w * env_asr(n, dur * 0.5, dur * 0.45) * (0.14 * vel)


def clay_ring(dur=1.5, vel=1.0):
    """Soft ceramic tone: a low bell plus a whisper of surface friction."""
    n = int(dur * SR)
    out = bell(392.0, dur, 0.8)
    b2 = bell(588.0, dur * 0.7, 0.35)
    out[:len(b2)] += b2
    fr = bp(rng.standard_normal(n).astype(np.float32), 900, 4200, 2)
    out[:n] += fr * env_asr(n, 0.25, 0.9) * 0.045
    return out * (0.95 * vel)


def footsteps(dur=1.0, vel=1.0):
    n = int(dur * SR)
    out = np.zeros(n, np.float32)
    for k in (0.05, 0.42, 0.78):
        s = int(k * dur * SR)
        m = int(0.07 * SR)
        if s + m >= n:
            continue
        out[s:s + m] += lp(rng.standard_normal(m).astype(np.float32), 420, 2) \
            * env_ad(m, 0.002, 0.022, 1.1)
    return out * (0.21 * vel)


# ------------------------------------------------------------------ reverb
def make_ir(dur=2.4, pre=0.014, seed=5):
    r = np.random.default_rng(seed)
    n = int(dur * SR)
    t = np.arange(n, dtype=np.float32) / SR
    ir = r.standard_normal(n).astype(np.float32) * np.exp(-t / (dur * 0.30))
    ir = lp(ir, 7200, 2)
    ir = hp(ir, 130, 1)
    for d, g in ((0.017, 0.55), (0.029, -0.40), (0.047, 0.31), (0.071, -0.22),
                 (0.103, 0.16)):
        i = int(d * SR)
        if i < n:
            ir[i] += g
    p = int(pre * SR)
    ir[:p] = 0
    ir /= np.max(np.abs(ir)) * 5.0
    return ir


def convolve_stereo(x, ir, ir_side=None, side=0.28):
    """
    Convolve both channels with the SAME impulse response so the reverb
    inherits the dry signal's correlation (two independent IRs decorrelate the
    mix and cost ~3 dB on a mono fold). Width is added as a quiet mid/side
    layer from a second IR, which cancels rather than smears when folded.
    """
    wl = fftconvolve(x[:, 0], ir)[:x.shape[0]]
    wr = fftconvolve(x[:, 1], ir)[:x.shape[0]]
    out = np.stack([wl, wr], axis=1)
    if ir_side is not None:
        m = (x[:, 0] + x[:, 1]) * 0.5
        sd = fftconvolve(m, ir_side)[:x.shape[0]] * side
        out[:, 0] += sd
        out[:, 1] -= sd
    return out


# ------------------------------------------------------------- arrangement
CH = [  # (bar_start, bar_count, chord notes, sub root, brightness, vel)
    (0,  2, ['F#3', 'A3', 'C#4', 'E4'],        'F#1', 0.20, 0.55),
    (2,  2, ['D3', 'F#3', 'A3', 'C#4'],        'D1',  0.30, 0.70),
    (4,  2, ['A3', 'C#4', 'E4', 'A4'],         'A1',  0.40, 0.80),
    (6,  2, ['E3', 'G#3', 'B3', 'E4'],         'E1',  0.45, 0.80),
    (8,  2, ['D3', 'F#3', 'A3', 'C#4'],        'D1',  0.55, 0.90),
    (10, 1, ['B2', 'D3', 'F#3', 'A3'],         'B1',  0.58, 0.92),
    (11, 1, ['E3', 'A3', 'B3', 'E4'],          'E1',  0.62, 0.95),
    (12, 1, ['D3', 'F#3', 'A3', 'C#4'],        'D1',  0.78, 1.00),
    (13, 1, ['E3', 'G#3', 'B3', 'E4'],         'E1',  0.82, 1.00),
    (14, 2, ['A2', 'E3', 'A3', 'B3', 'C#4'],   'A1',  0.66, 0.86),
]

# piano phrases: (time in bars, note, duration s, velocity)
MEL = [
    (0.0, 'A4', 3.6, 0.50), (1.5, 'C#5', 3.0, 0.42),
    (2.0, 'F#4', 3.4, 0.52), (3.0, 'A4', 2.6, 0.46), (3.5, 'D5', 3.0, 0.44),
    (4.0, 'C#5', 3.2, 0.56), (5.0, 'E5', 2.6, 0.48), (5.5, 'A4', 2.4, 0.42),
    (6.0, 'B4', 3.0, 0.54), (7.0, 'G#4', 2.6, 0.46), (7.5, 'E5', 2.8, 0.44),
    (8.0, 'F#5', 3.2, 0.60), (9.0, 'D5', 2.6, 0.50), (9.5, 'A4', 2.6, 0.44),
    (10.0, 'F#5', 2.8, 0.58), (10.5, 'D5', 2.2, 0.46),
    (11.0, 'E5', 2.8, 0.60), (11.5, 'B4', 2.4, 0.48),
    (12.0, 'A5', 3.4, 0.72), (12.5, 'F#5', 2.8, 0.56), (13.0, 'E5', 3.0, 0.66),
    (13.5, 'C#5', 2.6, 0.52),
    (14.0, 'A4', 4.4, 0.62), (14.5, 'C#5', 4.0, 0.50),
    (15.0, 'E5', 4.6, 0.56), (15.6, 'A5', 4.2, 0.44),
]

SFX = [
    (0.00, 'water',   1.00), (0.60, 'foot',    0.35),
    (4.60, 'sweep',   1.25), (4.60, 'water',   0.95),
    (5.20, 'breath',  0.90), (8.40, 'leaf',    0.55),
    (10.20, 'sweep',  1.15), (10.20, 'bellhi', 0.60),
    (11.60, 'breath', 0.70),
    (14.10, 'leaf',   1.45), (14.10, 'sweep',  0.95),
    (16.20, 'clay',   0.55),
    (19.40, 'clay',   1.00), (19.40, 'sweep',  0.70),
    (23.00, 'sweep',  1.05), (23.00, 'bellhi', 0.62),
    (24.60, 'band',   0.60),
    (27.90, 'band',   0.95), (27.85, 'sweep',  0.65),
    (30.60, 'band',   0.50),
    (32.20, 'sweep',  0.95), (32.40, 'water',  0.85),
    (35.00, 'water',  0.50),
    (37.10, 'water',  1.15), (37.10, 'sweep',  0.95),
    (39.20, 'leaf',   0.50),
    (42.10, 'bellhi', 0.95), (42.05, 'sweep',  0.55), (42.10, 'breath', 0.55),
]


def build():
    music = np.zeros((N, 2), np.float32)
    perc = np.zeros((N, 2), np.float32)
    fx = np.zeros((N, 2), np.float32)
    amb = np.zeros((N, 2), np.float32)

    # ---- harmony
    for (b0, nb, notes, root, bright, vel) in CH:
        t0 = b0 * BAR
        d = nb * BAR + 1.1
        mid = pad([note(x) for x in notes], d, vel, 0.006, bright)
        side = pad([note(x) * 1.0012 for x in notes], d, vel * 0.85, 0.010,
                   bright * 0.92)
        add_ms(music, mid, side, t0, 0.62)
        add(music, sub(note(root), d * 0.9, vel), t0, 0.0, 1.0)

    # ---- piano
    for (bt, nm, d, v) in MEL:
        t0 = bt * BAR
        add(music, piano(note(nm), d, v), t0,
            -0.16 + 0.32 * ((bt * 2) % 2), 1.0)

    # ---- gentle arpeggio from bar 5, panned alternately
    for (b0, nb, notes, root, bright, vel) in CH:
        if b0 < 5:
            continue
        fr = [note(x) for x in notes]
        steps = int(nb * 8)
        for i in range(steps):
            t0 = b0 * BAR + i * (BEAT / 2)
            if t0 > DUR - 0.3:
                break
            if i % 4 == 3:
                continue
            f = fr[(i * 3) % len(fr)] * (2.0 if i % 8 in (2, 6) else 1.0)
            v = 0.5 * vel * (0.72 if i % 2 else 1.0)
            if b0 >= 14:
                v *= 0.5
            add(music, pluck(f, 0.5, v), t0, -0.4 + 0.8 * (i % 2), 1.0)

    # ---- percussion: enters bar 5, drops out for the brand card
    for bar in range(5, 15):
        base = bar * BAR
        ramp = min(1.0, 0.45 + 0.09 * (bar - 5))
        if bar >= 14:
            break
        for beat in range(4):
            t0 = base + beat * BEAT
            if t0 >= DUR:
                break
            if beat in (0, 2):
                add(perc, kick(0.72 * ramp), t0, 0.0, 1.0)
            for sub8 in (0.0, 0.5):
                ts = t0 + sub8 * BEAT
                v = (0.95 if sub8 == 0 else 0.55) * ramp
                add(perc, shaker(v), ts, 0.14 * (1 if beat % 2 else -1), 1.0)
            if beat == 3:
                add(perc, tick(0.7 * ramp), t0 + BEAT * 0.5, -0.3, 1.0)
    # one soft resolve tick under the logo
    add(perc, tick(0.45), 14 * BAR, 0.0, 1.0)

    # ---- sound design. LEAD[kind] is where that sound's crest sits inside
    #      itself, so the table's times are when it is HEARD, not when it starts.
    LEAD = {'water': 0.45, 'sweep': 0.78, 'leaf': 0.30, 'breath': 0.50,
            'clay': 0.04, 'band': 0.50, 'bellhi': 0.02, 'foot': 0.10}
    DURS = {'water': 1.7, 'sweep': 1.05, 'leaf': 0.6, 'breath': 2.3,
            'clay': 1.6, 'band': 0.75, 'bellhi': 3.0, 'foot': 1.1}
    for (t0, kind, v) in SFX:
        t0 = max(0.0, t0 - LEAD[kind] * DURS[kind])
        if kind == 'water':
            add(fx, water_swell(1.7, v), t0, -0.15, 1.0)
        elif kind == 'sweep':
            add(fx, airy_sweep(1.05, v), t0, 0.0, 1.0)
        elif kind == 'leaf':
            add(fx, leaf_rustle(0.6, v), t0, 0.35, 1.0)
        elif kind == 'breath':
            add(fx, breath(2.3, v), t0, 0.0, 1.0)
        elif kind == 'clay':
            add(fx, clay_ring(1.6, v), t0, -0.10, 1.0)
        elif kind == 'band':
            add(fx, band_tension(0.75, v), t0, 0.25, 1.0)
        elif kind == 'bellhi':
            add(fx, bell(note('A5'), 3.0, v), t0, 0.12, 1.0)
        elif kind == 'foot':
            add(fx, footsteps(1.1, v), t0, -0.3, 1.0)
    # the band wipe physically travels left to right: pan the stroke with it
    sw = airy_sweep(0.8, 0.6)
    i0 = int(max(0.0, 27.9 - 0.78 * 0.8) * SR)
    n = min(len(sw), N - i0)
    p = np.linspace(-0.85, 0.85, n, dtype=np.float32)
    fx[i0:i0 + n, 0] += sw[:n] * np.cos((p + 1) * np.pi / 4)
    fx[i0:i0 + n, 1] += sw[:n] * np.sin((p + 1) * np.pi / 4)

    # ---- ambience bed: quiet outdoor air, a touch more open over the water
    t = np.arange(N, dtype=np.float32) / SR
    bedm = lp(pink(N), 900, 2)
    water_zones = ((0.0, 5.4), (32.0, 37.9))
    wz = np.zeros(N, np.float32)
    for (a, b) in water_zones:
        i, j = int(a * SR), min(N, int(b * SR))
        wz[i:j] = 1.0
    wz = lp(wz, 3.0, 1)
    lvl = 0.030 + 0.030 * wz
    lvl = lvl * (1 + 0.18 * np.sin(2 * np.pi * 0.05 * t))
    bedside = lp(pink(N), 900, 2)
    amb[:, 0] += bedm * lvl + bedside * lvl * 0.55
    amb[:, 1] += bedm * lvl - bedside * lvl * 0.55

    # ---- reverb buses
    ir_a = make_ir(2.5, 0.014, 5)
    ir_b = make_ir(2.5, 0.019, 9)
    wet_music = convolve_stereo(music, ir_a, ir_b, 0.30)
    wet_fx = convolve_stereo(fx, ir_a, ir_b, 0.24)
    wet_perc = convolve_stereo(perc, ir_a)

    duck = np.ones(N, np.float32)
    tt = np.arange(N, dtype=np.float32) / SR
    for tr in M.TRANSITIONS:
        a0 = tr['at']
        pre = np.clip((tt - (a0 - 0.14)) / 0.14, 0, 1)
        rel = 1.0 - np.clip((tt - a0) / 0.55, 0, 1)
        duck -= 0.30 * np.minimum(pre, rel) ** 0.8
    duck = np.clip(duck, 0.55, 1.0)[:, None]
    music = music * duck
    wet_music = wet_music * duck
    perc = perc * (0.55 + 0.45 * duck)

    mix = (music * 0.82 + wet_music * 0.62 +
           perc * 0.90 + wet_perc * 0.20 +
           fx * 1.35 + wet_fx * 0.70 +
           amb * 1.0)

    # ---- master tone: drop inaudible rumble, tame the low shelf, add air.
    #      The pads and pink-noise beds are inherently dark; this restores the
    #      "airy" top the brief asks for without making anything harsh.
    mix = hp2(mix, 30, 2)
    mix = mix - lp2(mix, 115, 2) * 0.22
    mix = mix + hp2(mix, 4200, 2) * 0.62
    mix = mix + hp2(mix, 9000, 1) * 0.30

    # ---- bass mono: sum everything below 160 Hz so the low end cannot
    #      cancel when a phone or a social feed folds the mix to mono
    low = lp2(mix, 160, 2)
    mix = (mix - low) + low.mean(axis=1, keepdims=True)

    # ---- gentle bus glue, then a soft limiter. Nothing should ever clip.
    env = np.maximum.reduce([np.abs(mix[:, 0]), np.abs(mix[:, 1])])
    env = lp(env, 8.0, 1)
    thr = 0.50
    gr = np.ones(N, np.float32)
    over = env > thr
    gr[over] = (thr + (env[over] - thr) * 0.55) / env[over]
    mix *= gr[:, None]

    # program fades: a soft open (no click) and a resolved close (no hard cut)
    fi = int(0.30 * SR)
    mix[:fi] *= np.linspace(0, 1, fi, dtype=np.float32)[:, None] ** 1.5
    end = int(DUR * SR)
    fo0 = int((DUR - 1.55) * SR)
    ramp = np.clip(np.cos(np.linspace(0, np.pi / 2, end - fo0,
                                      dtype=np.float32)), 0, 1) ** 1.6
    mix[fo0:end] *= ramp[:, None]
    mix = mix[:end]

    peak = float(np.max(np.abs(mix)))
    mix = np.tanh(mix / max(peak, 1e-6) * 0.94) * 0.95
    mix = mix / max(float(np.max(np.abs(mix))), 1e-6) * 0.891   # -1.0 dBFS
    return mix


def write_wav(path, x):
    d = (np.clip(x, -1, 1) * (2 ** 31 - 1)).astype('<i4')
    b = d.tobytes()
    raw = bytearray()
    for i in range(0, len(b), 4):
        raw += b[i + 1:i + 4]                      # 32-bit -> 24-bit LE
    with wave.open(path, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(3)
        w.setframerate(SR)
        w.writeframes(bytes(raw))


if __name__ == '__main__':
    print(f'synthesising score: {BPM:.0f} BPM, {DUR:.2f}s, {SR} Hz stereo')
    mix = build()
    p = os.path.join(OUT, 'score.wav')
    write_wav(p, mix)
    pk = 20 * np.log10(max(1e-9, float(np.max(np.abs(mix)))))
    rms = 20 * np.log10(max(1e-9, float(np.sqrt(np.mean(mix ** 2)))))
    print(f'  -> {p}')
    print(f'  peak {pk:+.2f} dBFS   rms {rms:+.2f} dBFS   '
          f'{mix.shape[0]/SR:.3f}s   clipped samples: '
          f'{int(np.sum(np.abs(mix) >= 0.9999))}')
