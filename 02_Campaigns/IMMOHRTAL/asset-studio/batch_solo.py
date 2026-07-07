#!/usr/bin/env python3
"""One-shot background batch for the five solo tracks:
1. Spotify Canvas loops (BPM-locked, unique particle seed per track)
2. Whisper transcription appended to data/transcripts.json
"""
import os, json
from motion import make_canvas, OUT

os.makedirs(OUT, exist_ok=True)
HERE = os.path.dirname(os.path.abspath(__file__))
U = "/root/.claude/uploads/01754d87-4cb3-5319-996a-9d455dd46108"

# (id, label, beats, beat_ms from data/analysis.json BPM, seed)
LOOPS = [
    ("canvas-notepad",  "TRK 02", 12, 580, 102),
    ("canvas-mothersbaby", "TRK 04", 10, 673, 104),
    ("canvas-rollthedice", "TRK 05", 20, 372, 105),
    ("canvas-myownway", "TRK 06", 20, 372, 106),
    ("canvas-gradealove", "TRK 08", 13, 557, 108),
]
for bid, label, beats, ms, seed in LOOPS:
    make_canvas(bid, label, beats, ms, seed)

FILES = {
    "Picking Up My Notepad": f"{U}/b07846c9-Picking_Up_My_Notepad.mp3",
    "My Mothers Baby": f"{U}/cd64d468-My_Mothers_Baby.wav",
    "Roll the Dice": f"{U}/79d1f138-Roll_the_Dice.mp3",
    "My Own Way": f"{U}/e7ac92cc-My_Own_Way.mp3",
    "Grade A Love": f"{U}/cc31a42f-Grade_A_Love.mp3",
}
from faster_whisper import WhisperModel
model = WhisperModel("small", device="cpu", compute_type="int8")
tpath = os.path.join(HERE, "data", "transcripts.json")
trans = json.load(open(tpath))
for name, path in FILES.items():
    segs, _ = model.transcribe(path, beam_size=5, language="en",
                               condition_on_previous_text=False)
    trans[name] = [{"t": f"{int(s.start//60)}:{int(s.start%60):02d}",
                    "text": s.text.strip()} for s in segs]
    json.dump(trans, open(tpath, "w"), indent=2)
    print(f"transcribed {name}: {len(trans[name])} segments")
print("batch done")
