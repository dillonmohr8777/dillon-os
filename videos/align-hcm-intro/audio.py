#!/usr/bin/env python3
"""Synthesise the 45 second underscore for the Align HCM brand intro.

Deliberately restrained: a low D minor pad, a slow heartbeat pulse, noise
risers landing on the two hero moments (the logo burst at 10.0s and the end
card at 40.2s), a tighter pulse under the service ticker, and a lift into a
suspended resolve for the tagline. Writes build/underscore.wav.

    pip install numpy && python3 audio.py
"""
import math
import pathlib
import wave

import numpy as np

SR = 48000
DUR = 45.0
N = int(SR * DUR)
T = np.arange(N) / SR

BURST = 10.0     # logo assembles
TICKER = 19.6    # service ticker starts
ENDCARD = 40.2   # end card

rng = np.random.default_rng(11)


def env(attack, hold, release, at, length):
    """one-shot envelope starting at `at` seconds"""
    e = np.zeros(N)
    i0 = int(at * SR)
    n = int(length * SR)
    if i0 >= N:
        return e
    n = min(n, N - i0)
    seg = np.zeros(n)
    a, h = int(attack * SR), int(hold * SR)
    r = max(1, n - a - h)
    if a:
        seg[:a] = np.linspace(0, 1, a)
    seg[a:a + h] = 1.0
    tail = np.linspace(1, 0, r) ** 2.2
    seg[a + h:a + h + len(tail)] = tail[: n - a - h]
    e[i0:i0 + n] = seg
    return e


def ramp(a, b):
    """0 to 1 across [a,b] seconds, held at 1 after"""
    return np.clip((T - a) / (b - a), 0, 1)


def tone(freq, amp, detune=0.0, phase=0.0):
    f = freq * (1 + detune)
    return amp * np.sin(2 * math.pi * f * T + phase)


def onepole_lp(x, cutoff):
    """cheap single pole low pass, cutoff in Hz"""
    a = math.exp(-2 * math.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc = a * acc + (1 - a) * x[i]
        y[i] = acc
    return y


# ---------------------------------------------------------------- pad
# D minor. Root D2, with the fifth and the minor third above it. The third
# swaps for a major third under the end card so the tagline lands warm.
D2, A2, F3, D3, A3, FS3 = 73.42, 110.00, 174.61, 146.83, 220.00, 185.00

breathe = 0.5 + 0.5 * np.sin(2 * math.pi * 0.055 * T)
pad = (
    tone(D2, 0.50) + tone(D2, 0.30, detune=0.0015, phase=1.1)
    + tone(A2, 0.24) + tone(A2, 0.14, detune=-0.0012, phase=2.3)
    + tone(D3, 0.13) * (0.6 + 0.4 * breathe)
)
minor = tone(F3, 0.11) * (1 - ramp(ENDCARD - 0.4, ENDCARD + 0.6))
major = tone(FS3, 0.11) * ramp(ENDCARD - 0.2, ENDCARD + 0.9)
air = tone(A3, 0.045) * ramp(2.0, 6.0)
pad = (pad + minor + major + air) * (0.55 + 0.45 * breathe)
pad *= ramp(0.0, 2.2)

# ---------------------------------------------------------------- heartbeat
# one soft thump per second, tightening to two per second under the ticker
beat = np.zeros(N)
t = 0.6
while t < DUR - 0.6:
    step = 0.5 if TICKER <= t < TICKER + 4.0 else 1.0
    gain = 1.0 if t < ENDCARD else 0.45
    if t < 3.0:
        gain *= 0.4
    e = env(0.002, 0.01, 0.30, t, 0.34)
    ph = 2 * math.pi * 55 * T
    beat += 0.55 * gain * e * np.sin(ph) + 0.22 * gain * e * np.sin(ph * 2)
    t += step

# ---------------------------------------------------------------- risers
noise = rng.standard_normal(N) * 0.6
noise = onepole_lp(noise, 2600)
riser = np.zeros(N)
for at, length, amp in ((BURST - 1.6, 1.6, 0.30), (ENDCARD - 1.5, 1.5, 0.24)):
    i0, n = int(at * SR), int(length * SR)
    shape = np.zeros(N)
    shape[i0:i0 + n] = np.linspace(0, 1, n) ** 2.4
    sweep = 0.4 + 0.6 * shape
    riser += amp * noise * shape * sweep

# ---------------------------------------------------------------- impacts
impact = np.zeros(N)
for at, amp in ((BURST, 1.0), (ENDCARD, 0.7)):
    e = env(0.001, 0.02, 1.5, at, 1.6)
    sweep = np.clip((T - at) / 1.2, 0, 1)
    f = 90 - 48 * sweep
    impact += amp * 0.9 * e * np.sin(2 * math.pi * np.cumsum(f) / SR)
    impact += amp * 0.30 * env(0.001, 0.005, 0.5, at, 0.55) * onepole_lp(rng.standard_normal(N), 900)

# ---------------------------------------------------------------- mix
mix = 0.34 * pad + 0.30 * beat + riser + 0.34 * impact

# duck the pad a touch on each impact so the hit reads
for at in (BURST, ENDCARD):
    mix *= 1 - 0.30 * env(0.004, 0.03, 0.55, at, 0.62)

mix *= 1 - np.clip((T - (DUR - 1.4)) / 1.4, 0, 1) ** 1.6   # tail out
mix *= np.clip(T / 0.35, 0, 1)                                   # no click at 0

peak = np.max(np.abs(mix))
mix = mix / peak * 0.72
rms = float(np.sqrt(np.mean(mix ** 2)))

# gentle stereo: a few ms of offset on the pad only
delay = int(0.009 * SR)
left = mix.copy()
right = np.concatenate([mix[:delay] * 0, mix[:-delay]]) * 0.45 + mix * 0.55
stereo = np.stack([left, right], axis=1)
stereo = np.clip(stereo, -1, 1)

out = pathlib.Path(__file__).parent / 'build' / 'underscore.wav'
out.parent.mkdir(exist_ok=True)
with wave.open(str(out), 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((stereo * 32767).astype('<i2').tobytes())

print(f'{out} written, {DUR:.1f}s, peak {20 * math.log10(0.72):.1f} dBFS, rms {20 * math.log10(rms):.1f} dBFS')
