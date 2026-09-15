"""Original local sound design. No recordings, samples, voice, or external service."""
from pathlib import Path
import wave
import numpy as np

RATE = 48000
DURATION = 30
rng = np.random.default_rng(20260912)
audio = np.zeros((RATE * DURATION, 2), dtype=np.float64)

def place(sound, at, pan=0.0):
    start = round(at * RATE)
    n = min(len(sound), len(audio) - start)
    audio[start:start+n, 0] += sound[:n] * np.sqrt((1 - pan) / 2)
    audio[start:start+n, 1] += sound[:n] * np.sqrt((1 + pan) / 2)

def paper(at, duration=.22, level=.055, pan=0):
    t = np.arange(round(RATE * duration)) / RATE
    noise = rng.normal(0, 1, len(t))
    noise = np.convolve(noise, np.ones(10)/10, mode='same')
    envelope = np.sin(np.pi*t/duration)**1.6
    place(noise * envelope * level, at, pan)

# Quiet warm plucked pulse; gathers when the workflow connects, then resolves.
for j, at in enumerate(np.arange(.15, 27.6, .75)):
    t = np.arange(round(RATE * .9)) / RATE
    freq = [196, 246.9417, 293.6648, 369.9944][j % 4]
    envelope = (1 - np.exp(-t * 120)) * np.exp(-t * 6.5)
    tone = (np.sin(2*np.pi*freq*t) + .2*np.sin(2*np.pi*freq*2*t)) * envelope
    level = .025 if at < 14 else .04 if at < 24 else .026
    place(tone * level, at, -.25 if j % 2 else .25)
for at in [.4, 1.03, 1.66, 3.63, 5.5, 8.62, 13.65, 15.43, 16.83, 19.5, 24.62]:
    paper(at, .34 if at in [3.63, 24.62] else .19, .07, -.3 if at < 9 else .3)
# Three dry pencil strokes at human revision and check.
for at, duration in [(10.16, .45), (11.51, .13), (11.68, .22)]:
    paper(at, duration, .055, .25)
for freq in [196, 246.9417, 293.6648]:
    t = np.arange(RATE * 4) / RATE
    place(np.sin(2*np.pi*freq*t) * np.exp(-t*1.6) * (1-np.exp(-t*40)) * .015, 25.55)
audio *= np.minimum(1, np.arange(len(audio)) / (RATE * .05))[:, None]
audio *= np.minimum(1, (len(audio)-1-np.arange(len(audio))) / (RATE * .6))[:, None]
audio *= 6.0  # Quiet music bed, approximately -25.5 LUFS with headroom.
assert len(audio) == RATE * 30 and np.isfinite(audio).all()
assert np.max(np.abs(audio)) < .5
path = Path(__file__).parent / 'public/launch/paper-pulse.wav'
with wave.open(str(path), 'wb') as out:
    out.setnchannels(2)
    out.setsampwidth(2)
    out.setframerate(RATE)
    out.writeframes((audio * 32767).astype('<i2').tobytes())
print(f'{path}: {DURATION}s stereo, peak {20*np.log10(np.max(np.abs(audio))):.1f} dBFS')
