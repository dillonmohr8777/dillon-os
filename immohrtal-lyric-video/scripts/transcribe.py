"""Transcribe a track with word-level timestamps.

Usage: python3 transcribe.py [model] [audio.mp3] [out.json]
Defaults: medium public/track.mp3 src/lyrics.json
"""
import json
import os
import sys

from faster_whisper import WhisperModel

HERE = os.path.dirname(os.path.abspath(__file__))
MODEL_SIZE = sys.argv[1] if len(sys.argv) > 1 else "medium"
AUDIO = sys.argv[2] if len(sys.argv) > 2 else os.path.join(HERE, "..", "public", "track.mp3")
OUT = sys.argv[3] if len(sys.argv) > 3 else os.path.join(HERE, "..", "src", "lyrics.json")

model = WhisperModel(MODEL_SIZE, device="cpu", compute_type="int8", cpu_threads=4)

# NOTE: vad_filter must stay off — Silero VAD classifies these mixed
# vocals as music and drops every segment.
segments, info = model.transcribe(
    AUDIO,
    word_timestamps=True,
    vad_filter=False,
    beam_size=5,
    language="en",
    condition_on_previous_text=False,
)

words = []
for seg in segments:
    for w in seg.words or []:
        words.append({
            "word": w.word.strip(),
            "start": round(w.start, 3),
            "end": round(w.end, 3),
            "prob": round(w.probability, 3),
        })
    print(f"[{seg.start:7.2f} - {seg.end:7.2f}] {seg.text}", flush=True)

# Group words into display lines: break on gaps > 0.9s or when a line
# reaches 6 words, so lines stay readable on screen.
lines = []
current = []
for w in words:
    if current:
        gap = w["start"] - current[-1]["end"]
        if gap > 0.9 or len(current) >= 6:
            lines.append(current)
            current = []
    current.append(w)
if current:
    lines.append(current)

data = {
    "duration": round(info.duration, 3),
    "language": info.language,
    "model": MODEL_SIZE,
    "lines": [
        {
            "start": ln[0]["start"],
            "end": ln[-1]["end"],
            "words": ln,
        }
        for ln in lines
    ],
}

os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, "w") as f:
    json.dump(data, f, indent=1)

print(f"\nWrote {len(words)} words in {len(lines)} lines -> {OUT}")
